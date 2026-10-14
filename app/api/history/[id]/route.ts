import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getHistory } from "@/lib/users";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const h = (await getHistory(u.email)).find((x) => x.id === params.id);
  return h ? NextResponse.json({ result: h.result }) : NextResponse.json({ error: "Saved analysis not found." }, { status: 404 });
}
