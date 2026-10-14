import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listCases, newCase, saveCase } from "@/lib/cases";
export const dynamic = "force-dynamic";
export async function GET() {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  return NextResponse.json({ cases: await listCases(u.email) });
}
export async function POST(req: Request) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const b = await req.json().catch(() => null); if (!b || typeof b !== "object") return NextResponse.json({ error: "We couldn't read that form. Please try again." }, { status: 400 });
  if ((await listCases(u.email)).length >= 50) return NextResponse.json({ error: "You've reached 50 cases. Delete an old one to start another." }, { status: 400 });
  const c = newCase(u.email, b);
  if (!c.noticeDate) return NextResponse.json({ error: "Please enter the date printed on the notice." }, { status: 400 });
  await saveCase(c); return NextResponse.json({ case: c });
}
