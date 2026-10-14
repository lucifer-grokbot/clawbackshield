import { NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/store";
import { sendEmail, wrap } from "@/lib/email";
import { siteUrl } from "@/lib/auth";
// Checklist signups. Dev: data/kv/signups.json (and legacy data/signups.json). Netlify: Netlify Blobs.
export async function POST(req: Request) {
  const { email, role } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  const list = (await kvGet<{ email: string; role?: string; at: string }[]>("signups")) || [];
  const isNew = !list.some((s) => s.email.toLowerCase() === email.toLowerCase());
  if (isNew) { list.push({ email: email.trim(), role: typeof role === "string" ? role.slice(0, 40) : undefined, at: new Date().toISOString() }); await kvSet("signups", list); }
  if (!(process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https") && !process.env.SITE_ID) { try { const fs = await import("fs/promises"); await fs.mkdir("data", { recursive: true }); await fs.writeFile("data/signups.json", JSON.stringify(list, null, 2)); } catch {} }
  if (isNew) await sendEmail(email, "Your free SSA overpayment checklist", wrap(`<p>Here's your checklist: <a href="${siteUrl()}/checklist">${siteUrl()}/checklist</a></p><p>Bookmark it or print it.</p>`));
  return NextResponse.json({ ok: true });
}
