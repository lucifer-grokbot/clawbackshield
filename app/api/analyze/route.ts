import { NextResponse } from "next/server";
import { chat, LlmError, SCHEMA } from "@/lib/llm";
import { currentEmail, siteUrl } from "@/lib/auth";
import { ensureUser, remaining, recordUse, addHistory } from "@/lib/users";
import { kvGet, kvSet } from "@/lib/store";
import { ANON_LIMIT, PLANS } from "@/lib/plans";
import { sendEmail, wrap } from "@/lib/email";
import crypto from "crypto";
export const runtime = "nodejs";
export const maxDuration = 60;
const SYSTEM = `You help families and caregivers understand U.S. Social Security overpayment ("clawback") notices. You are not a lawyer and must not give legal advice. Read the notice text and return ONLY a JSON object with this shape:
{"summary": string (plain English, 3-5 sentences, 8th-grade reading level),
 "beneficiary": string|null, "benefitType": string|null,
 "amount": string|null (overpayment amount as written), "reason": string (why SSA says it was overpaid),
 "noticeDate": string|null,
 "keyDates": [{"label": string, "date": string|null, "note": string}],
 "options": [{"name": "Request reconsideration (appeal)"|"Request a waiver"|"Ask for a payment plan / lower withholding", "form": string, "whenItFits": string, "deadlineNote": string}],
 "recommendedOption": string, "recommendedReason": string,
 "letterType": "waiver"|"reconsideration",
 "letter": string (a draft cover letter to SSA; first line must be "DRAFT - REVIEW BEFORE SENDING"; use [BRACKETED PLACEHOLDERS] for anything not in the notice; reference the correct form SSA-632 for waiver or SSA-561 for reconsideration; do not invent facts),
 "questionsToAsk": [string], "missingInfo": [string]}
General facts you may use: reconsideration uses form SSA-561 and generally must be requested within 60 days of receiving the notice; asking within about 30 days (often 10 days for SSI) can keep benefits from being reduced while SSA decides; a waiver uses form SSA-632, can be requested at any time, and depends on the person not being at fault and repayment being unaffordable or unfair; payment plans or lower withholding can be requested (form SSA-634 for some cases). Always say deadlines must be verified on the notice and at ssa.gov. Use dates printed in the notice when available.`;
export async function POST(req: Request) {
  try {
    const email = await currentEmail();
    const user = email ? (await ensureUser(email)).user : null;
    const ip = (req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
    const anonKey = `anon:${new Date().toISOString().slice(0, 10)}:${crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16)}`;
    if (user && remaining(user) <= 0) return NextResponse.json({ error: `You've used all analyses on the ${PLANS[user.plan].name} plan. Upgrade in your account to continue.`, limit: true }, { status: 402 });
    if (!user && ((await kvGet<number>(anonKey)) || 0) >= ANON_LIMIT) return NextResponse.json({ error: "You've used today's free guest analysis. Sign in free to get your monthly analysis and save your results.", limit: true, login: true }, { status: 402 });
    const form = await req.formData();
    let text = String(form.get("text") || "").trim();
    const file = form.get("file");
    if (file && typeof file !== "string" && file.size > 0) {
      if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "That file is too large (4 MB max). Try a smaller photo or paste the text." }, { status: 413 });
      const buf = Buffer.from(await file.arrayBuffer());
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        let pt = "";
        try { const { extractText, getDocumentProxy } = await import("unpdf"); pt = String((await extractText(await getDocumentProxy(new Uint8Array(buf)), { mergePages: true })).text || "").trim(); } catch (e) { console.error("[pdf] extract failed", (e as Error).message); }
        if (pt.length < 40) { // scanned/unusual PDF: let the model read it directly
          const t = await chat([{ role: "user", content: [{ type: "text", text: "Transcribe all text in this letter exactly. Output only the text." }, { type: "file", file: { filename: "notice.pdf", file_data: `data:application/pdf;base64,${buf.toString("base64")}` } }] }]);
          pt = t.trim();
        }
        text = pt + "\n" + text;
      } else if (file.type.startsWith("text/") || /\.(txt|text)$/i.test(file.name)) {
        text = buf.toString("utf8").trim() + "\n" + text;
      } else if (file.type.startsWith("image/")) {
        const url = `data:${file.type};base64,${buf.toString("base64")}`;
        const t = await chat([{ role: "user", content: [{ type: "text", text: "Transcribe all text in this letter exactly. Output only the text." }, { type: "image_url", image_url: { url } }] }]);
        text = t.trim() + "\n" + text;
      } else return NextResponse.json({ error: "Please upload a PDF, a text file, or a photo (JPG/PNG)." }, { status: 400 });
    }
    text = text.trim();
    if (text.length < 40) return NextResponse.json({ error: "We couldn't find enough text. Paste the notice or upload a clearer file." }, { status: 400 });
    const raw = await chat([{ role: "system", content: SYSTEM }, { role: "user", content: `NOTICE TEXT:\n"""\n${text.slice(0, 30000)}\n"""` }], SCHEMA);
    const m = raw.match(/\{[\s\S]*\}/);
    const result = JSON.parse(m ? m[0] : raw);
    if (typeof result.letter === "string" && !result.letter.startsWith("DRAFT")) result.letter = "DRAFT - REVIEW BEFORE SENDING\n\n" + result.letter;
    let emailed: "sent" | "mocked" | "failed" | "signin" | null = null;
    if (user) {
      await recordUse(user);
      await addHistory(user.email, { id: crypto.randomUUID(), at: new Date().toISOString(), amount: result.amount, reason: result.reason, recommendedOption: result.recommendedOption, result });
      if (form.get("emailMe") === "1") { const r = await sendEmail(user.email, "Your notice summary", wrap(`<p><b>Amount:</b> ${esc(result.amount || "not stated")}</p><p>${esc(result.summary)}</p><p><b>Suggested path:</b> ${esc(result.recommendedOption)}</p><p>See the full result and draft letter in <a href="${siteUrl()}/account">your account</a>.</p>`)).catch(() => ({ ok: false, mocked: false })); emailed = r.mocked ? "mocked" : r.ok ? "sent" : "failed"; }
    } else { await kvSet(anonKey, ((await kvGet<number>(anonKey)) || 0) + 1); if (form.get("emailMe") === "1") emailed = "signin"; }
    return NextResponse.json({ result, chars: text.length, remaining: user ? remaining(user) : 0, signedIn: !!user, emailed });
  } catch (e) {
    if (e instanceof LlmError) return NextResponse.json({ error: e.message, retry: e.status === 429 || e.status === 503 }, { status: e.status });
    if (e instanceof SyntaxError) return NextResponse.json({ error: "The AI reply was garbled. Please try again.", retry: true }, { status: 502 });
    return NextResponse.json({ error: "Something went wrong reading that notice." }, { status: 500 });
  }
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
