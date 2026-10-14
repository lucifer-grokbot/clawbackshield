// Passwordless email magic-link auth with signed JWT cookies (jose). No external auth service needed.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-insecure-secret-change-me-dev-insecure");
export const COOKIE = "cs_session";
export async function signToken(payload: Record<string, unknown>, exp: string) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(exp).sign(secret());
}
export async function verifyToken<T>(t: string): Promise<T | null> { try { return (await jwtVerify(t, secret())).payload as T; } catch { return null; } }
export async function currentEmail(): Promise<string | null> {
  const t = cookies().get(COOKIE)?.value; if (!t) return null;
  const p = await verifyToken<{ email: string; typ: string }>(t); return p?.typ === "session" ? p.email : null;
}
export function siteUrl() { return (process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""); }
// True only when running on the developer's machine (never on Netlify, where NEXT_PUBLIC_SITE_URL is https).
export function isLocal() { return !process.env.NETLIFY && !process.env.SITE_ID && siteUrl().startsWith("http://localhost"); }
