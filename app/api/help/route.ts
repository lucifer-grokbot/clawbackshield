import { NextResponse } from "next/server";
import crypto from "crypto";
import { kvGet, kvSet } from "@/lib/store";
import { sendEmail, wrap } from "@/lib/email";
import { currentEmail } from "@/lib/auth";
import { HELP_SPOTS } from "@/lib/plans";
type Req = { id: string; at: string; name: string; email: string; phone: string; forWho: string; amount: string; noticeDate: string; withholding: string; details: string; account?: string | null; status: "new" };
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
export async function GET() { const n = ((await kvGet<string[]>("help-index")) || []).length; return NextResponse.json({ spotsLeft: Math.max(0, HELP_SPOTS - n) }); }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const s = (v: unknown, n = 200) => String(v ?? "").trim().slice(0, n);
  const r: Req = { id: crypto.randomUUID(), at: new Date().toISOString(), name: s(b.name, 100), email: s(b.email, 200), phone: s(b.phone, 40), forWho: s(b.forWho, 40), amount: s(b.amount, 40), noticeDate: s(b.noticeDate, 20), withholding: s(b.withholding, 40), details: s(b.details, 3000), account: await currentEmail(), status: "new" };
  if (!r.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return NextResponse.json({ error: "Please add your name and a valid email so we can reach you." }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: "Please tick the box to confirm you understand we're not a law firm." }, { status: 400 });
  const idx = (await kvGet<string[]>("help-index")) || [];
  if (idx.length >= 200) return NextResponse.json({ error: "We're not taking new requests right now. Please try again soon." }, { status: 503 });
  await kvSet(`help:${r.id}`, r); idx.push(r.id); await kvSet("help-index", idx);
  const owner = process.env.OWNER_EMAIL;
  if (owner) await sendEmail(owner, `New 'Help with your case' request: ${r.name}`, wrap(`<p><b>${esc(r.name)}</b> (${esc(r.email)}, ${esc(r.phone) || "no phone"}) for ${esc(r.forWho)}</p><p>Amount ${esc(r.amount)} · notice ${esc(r.noticeDate)} · withholding ${esc(r.withholding)}</p><p>${esc(r.details)}</p>`)).catch(() => null);
  await sendEmail(r.email, "We got your request for help", wrap(`<p>Hi ${esc(r.name)}, thanks for reaching out. A real person will review your case and reply within 2 business days with next steps and a quote (from $599). If a deadline is within a few days, file your request with SSA first. Your rights don't depend on us.</p>`)).catch(() => null);
  return NextResponse.json({ ok: true, position: idx.length, spotsLeft: Math.max(0, HELP_SPOTS - idx.length) });
}
