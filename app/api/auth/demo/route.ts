// Owner test login: a secret DEMO_LOGIN_CODE signs in to ONE fixed demo account only (Caregiver plan). Pro + Lite credits. Rate-limited, constant-time compare.
import { NextResponse } from "next/server";
import crypto from "crypto";
import { signToken, COOKIE, siteUrl } from "@/lib/auth";
import { ensureUser, saveUser } from "@/lib/users";
import { kvGet, kvSet } from "@/lib/store";
export const runtime = "nodejs";
const DEMO_EMAIL = "demo@clawbackshield.test";
const PER_IP = 5, GLOBAL = 30; // failed attempts per hour
const h = (s: string) => crypto.createHash("sha256").update(s).digest();
export async function POST(req: Request) {
  const expected = process.env.DEMO_LOGIN_CODE || "";
  if (expected.length < 24) return NextResponse.json({ error: "Test login isn't enabled." }, { status: 404 });
  const ip = (req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const hour = new Date().toISOString().slice(0, 13);
  const ipKey = `demofail:${hour}:${h(ip).toString("hex").slice(0, 16)}`, gKey = `demofail:${hour}:all`;
  const [ipN, gN] = [(await kvGet<number>(ipKey)) || 0, (await kvGet<number>(gKey)) || 0];
  if (ipN >= PER_IP || gN >= GLOBAL) return NextResponse.json({ error: "Too many attempts. Try again in an hour." }, { status: 429 });
  const { code, next } = await req.json().catch(() => ({}));
  const ok = typeof code === "string" && crypto.timingSafeEqual(h(code.trim()), h(expected));
  if (!ok) { await kvSet(ipKey, ipN + 1); await kvSet(gKey, gN + 1); return NextResponse.json({ error: "That test code isn't valid." }, { status: 401 }); }
  const { user } = await ensureUser(DEMO_EMAIL);
  if (user.plan !== "caregiver" || (user.caseCredits || 0) < 3) { user.plan = "caregiver"; user.caseCredits = Math.max(3, user.caseCredits || 0); await saveUser(user); } // demo: Pro + 3 Lite credits
  const res = NextResponse.json({ ok: true, next: typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account" });
  res.cookies.set(COOKIE, await signToken({ email: DEMO_EMAIL, typ: "session" }, "7d"), { httpOnly: true, sameSite: "lax", secure: siteUrl().startsWith("https"), path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
