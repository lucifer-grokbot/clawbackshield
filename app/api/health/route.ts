import { NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET() {
  const t0 = Date.now(); let storage = "ok";
  try { await Promise.race([(async () => { await kvSet("health", Date.now()); await kvGet("health"); })(), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 8000))]); }
  catch (e) { storage = "error: " + String((e as Error).message).slice(0, 200); }
  return NextResponse.json({ storage, ms: Date.now() - t0, ai: !!process.env.OPENROUTER_API_KEY, email: !!process.env.RESEND_API_KEY, payments: !!process.env.STRIPE_SECRET_KEY });
}
