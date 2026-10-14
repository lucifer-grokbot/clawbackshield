import { NextResponse } from "next/server";
import { signToken, siteUrl, isLocal } from "@/lib/auth";
import { sendEmail, wrap } from "@/lib/email";
export async function POST(req: Request) {
  const { email, next } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  const t = await signToken({ email: email.trim().toLowerCase(), typ: "magic" }, "20m");
  const link = `${siteUrl()}/api/auth/verify?token=${t}&next=${encodeURIComponent(typeof next === "string" && next.startsWith("/") ? next : "/account")}`;
  const r = await sendEmail(email, "Your ClawbackShield sign-in link", wrap(`<p>Click to sign in (valid for 20 minutes):</p><p><a href="${link}" style="background:#13213C;color:#FAF6EE;padding:12px 20px;border-radius:6px;text-decoration:none">Sign in to ClawbackShield</a></p><p>If you didn't ask for this, ignore this email.</p>`));
  // Dev fallback: no email provider configured and not production -> return link so it can be clicked.
  return NextResponse.json({ ok: r.ok, emailOff: !!r.mocked && !isLocal(), devLink: r.mocked && isLocal() ? link : undefined });
}
