import { NextResponse } from "next/server";
import { requireUser, notFound } from "@/lib/session";
import { getCase, saveCase, deleteCase, sanitize, STATUSES, Status, EVIDENCE } from "@/lib/cases";
export const dynamic = "force-dynamic";
type P = { params: { id: string } };
export async function GET(_: Request, { params }: P) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const c = await getCase(u.email, params.id); return c ? NextResponse.json({ case: c, credits: u.caseCredits || 0, pro: u.plan === "caregiver" }) : notFound();
}
export async function PATCH(req: Request, { params }: P) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const c = await getCase(u.email, params.id); if (!c) return notFound();
  const b = await req.json().catch(() => ({}));
  if (b.details) Object.assign(c, sanitize(b.details, c));
  if (b.status && STATUSES.includes(b.status)) { c.status = b.status as Status; c.log.unshift({ at: new Date().toISOString(), status: c.status, note: String(b.note || "").slice(0, 300) || undefined }); c.log = c.log.slice(0, 100); }
  if (b.evidence && typeof b.evidence === "object") for (const [k] of EVIDENCE) if (k in b.evidence) c.evidence[k] = !!b.evidence[k];
  if (typeof b.reminders === "boolean") c.reminders = b.reminders;
  await saveCase(c); return NextResponse.json({ case: c });
}
export async function DELETE(_: Request, { params }: P) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  await deleteCase(u.email, params.id); return NextResponse.json({ ok: true });
}
