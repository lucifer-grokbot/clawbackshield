// Daily deadline reminders. Called by the Netlify scheduled function (netlify/functions/case-reminders.mts) with CRON_SECRET.
// Inactive until RESEND_API_KEY is set (no email provider = nothing sent, nothing marked).
import { NextResponse } from "next/server";
import crypto from "crypto";
import { kvGet } from "@/lib/store";
import { listCases, saveCase, deadlines } from "@/lib/cases";
import { sendEmail, wrap } from "@/lib/email";
import { siteUrl } from "@/lib/auth";
export const dynamic = "force-dynamic";
const MARKS = [14, 7, 3, 1, 0];
export async function GET(req: Request) {
  const sec = process.env.CRON_SECRET || ""; const got = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (sec.length < 24 || got.length !== sec.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(sec))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: "email not configured" });
  let sent = 0;
  for (const owner of (await kvGet<string[]>("case-owners")) || []) for (const c of await listCases(owner)) {
    if (!c.reminders || ["sent", "waiting", "decided"].includes(c.status)) continue;
    const d = deadlines(c); if (!d) continue;
    for (let i = 0; i < d.items.length; i++) { const it = d.items[i];
      const mark = MARKS.find((m) => it.daysLeft === m); if (mark === undefined) continue;
      const key = `${i}:${mark}`; if (c.remindersSent.includes(key)) continue;
      const r = await sendEmail(owner, `${mark === 0 ? "Today" : `${mark} day${mark > 1 ? "s" : ""} left`}: ${it.label}`, wrap(`<p>Case: <b>${(c.beneficiary || "your case").replace(/[<>&]/g, "")}</b></p><p><b>${it.label}</b> is ${it.date}${mark ? ` (${mark} days)` : " (today)"}.</p><p>${it.note}</p><p><a href="${siteUrl()}/cases/${c.id}">Open your case</a>. Already sent it? Mark it "Sent to SSA" to stop reminders.</p>`));
      if (r.ok) { c.remindersSent.push(key); await saveCase(c); sent++; }
    }
  }
  return NextResponse.json({ ok: true, sent });
}
