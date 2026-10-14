import { NextResponse } from "next/server";
import { currentEmail } from "./auth";
import { ensureUser, User } from "./users";
export async function requireUser(): Promise<User | NextResponse> {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ error: "Please sign in to use your case builder.", login: true }, { status: 401 });
  return (await ensureUser(email)).user;
}
export const notFound = () => NextResponse.json({ error: "We couldn't find that case. It may have been deleted." }, { status: 404 });
