import { NextResponse } from "next/server";
import { verifyToken, signToken, COOKIE, siteUrl } from "@/lib/auth";
import { ensureUser } from "@/lib/users";
import { sendEmail, wrap } from "@/lib/email";
export async function GET(req: Request) {
  const u = new URL(req.url); const p = await verifyToken<{ email: string; typ: string }>(u.searchParams.get("token") || "");
  if (!p || p.typ !== "magic") return NextResponse.redirect(`${siteUrl()}/login?error=expired`);
  const { created } = await ensureUser(p.email);
  if (created) await sendEmail(p.email, "Welcome to ClawbackShield", wrap(`<p>Your account is ready. Your free plan includes 1 notice analysis per month, and your results are saved in <a href="${siteUrl()}/account">your account</a>.</p><p>Start with our <a href="${siteUrl()}/checklist">free checklist</a>.</p>`));
  const next = u.searchParams.get("next") || "/account";
  const res = NextResponse.redirect(`${siteUrl()}${next.startsWith("/") ? next : "/account"}`);
  res.cookies.set(COOKIE, await signToken({ email: p.email, typ: "session" }, "30d"), { httpOnly: true, sameSite: "lax", secure: siteUrl().startsWith("https"), path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
