import { NextResponse } from "next/server";
import { requireUser, notFound } from "@/lib/session";
import { getCase, saveCase, deleteCase, sanitize, STATUSES, Status, EVIDENCE, OUTCOMES, OUTCOME_LABEL, Outcome, emptyTracking } from "@/lib/cases";
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
  const now = new Date().toISOString(); const isDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());
  const logIt = (status: Status, note: string) => { c.log.unshift({ at: now, status, note: note.slice(0, 300) }); c.log = c.log.slice(0, 100); };
  if (b.filed && typeof b.filed === "object") {
    if (!isDate(b.filed.date)) return NextResponse.json({ error: "Please enter the date you sent it to SSA." }, { status: 400 });
    c.tracking = c.tracking || emptyTracking(); c.tracking.filedAt = b.filed.date; c.tracking.filedHow = String(b.filed.how || "").slice(0, 40);
    c.status = "waiting"; c.remindersSent = c.remindersSent.filter((k) => !k.startsWith("t")); logIt("waiting", `Filed with SSA on ${b.filed.date}${c.tracking.filedHow ? ` by ${c.tracking.filedHow}` : ""}`);
  }
  if (b.call && typeof b.call === "object") {
    const note = String(b.call.note || "").trim().slice(0, 300); if (!note) return NextResponse.json({ error: "Add a short note about the call." }, { status: 400 });
    c.tracking = c.tracking || emptyTracking(); c.tracking.calls.unshift({ at: now, note }); c.tracking.calls = c.tracking.calls.slice(0, 50); logIt(c.status, `Called SSA: ${note}`);
  }
  if (b.decision && typeof b.decision === "object") {
    const o = b.decision.outcome as Outcome; if (!OUTCOMES.includes(o)) return NextResponse.json({ error: "Pick what SSA decided." }, { status: 400 });
    if (!isDate(b.decision.date)) return NextResponse.json({ error: "Please enter the date on SSA's letter." }, { status: 400 });
    c.tracking = c.tracking || emptyTracking(); const note = String(b.decision.note || "").slice(0, 500) || undefined;
    c.tracking.decisions.unshift({ at: now, date: b.decision.date, outcome: o, note }); c.tracking.decisions = c.tracking.decisions.slice(0, 20);
    if (["approved", "partial", "denied"].includes(o)) c.status = "decided";
    logIt(c.status, `${OUTCOME_LABEL[o]} (letter dated ${b.decision.date})${note ? `: ${note}` : ""}`);
  }

  await saveCase(c); return NextResponse.json({ case: c });
}
export async function DELETE(_: Request, { params }: P) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  await deleteCase(u.email, params.id); return NextResponse.json({ ok: true });
}
