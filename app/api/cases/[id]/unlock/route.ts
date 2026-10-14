import { NextResponse } from "next/server";
import { requireUser, notFound } from "@/lib/session";
import { getCase, saveCase, canUnlockFree } from "@/lib/cases";
import { saveUser } from "@/lib/users";
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const c = await getCase(u.email, params.id); if (!c) return notFound();
  if (c.unlocked) return NextResponse.json({ case: c });
  if (!canUnlockFree(u)) {
    if ((u.caseCredits || 0) < 1) return NextResponse.json({ error: "Unlock this case for $299 (one-time).", purchase: true }, { status: 402 });
    u.caseCredits = (u.caseCredits || 0) - 1; await saveUser(u);
  }
  c.unlocked = true; c.log.unshift({ at: new Date().toISOString(), status: c.status, note: "Case packet unlocked" }); await saveCase(c);
  return NextResponse.json({ case: c });
}
