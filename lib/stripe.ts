// Minimal Stripe REST client (no SDK). Works in test mode with sk_test_ keys.
import crypto from "crypto";
export const stripeOn = () => !!process.env.STRIPE_SECRET_KEY;
export async function stripe(path: string, params: Record<string, string>) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { method: "POST", headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || "Stripe error"); return d;
}
export function verifyWebhook(raw: string, header: string | null): boolean {
  const sec = process.env.STRIPE_WEBHOOK_SECRET; if (!sec || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const sig = crypto.createHmac("sha256", sec).update(`${parts.t}.${raw}`).digest("hex");
  const v1 = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  return v1.some((s) => s.length === sig.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(sig))) && Math.abs(Date.now() / 1000 - Number(parts.t)) < 600;
}
