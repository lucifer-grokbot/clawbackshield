// Transactional email via Resend. Without RESEND_API_KEY, emails are logged to the server console (dev fallback).
export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; mocked?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`\n[email:mock] to=${to} subject=${subject}\n${html.replace(/<[^>]+>/g, " ")}\n`); return { ok: true, mocked: true }; }
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "ClawbackShield <onboarding@resend.dev>", to, subject, html }) });
  if (!r.ok) console.error("[email] resend failed", r.status, await r.text());
  return { ok: r.ok };
}
export const wrap = (body: string) => `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#13213C;font-size:17px;line-height:1.6"><h2 style="color:#A6461F">ClawbackShield</h2>${body}<hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/><p style="font-size:13px;color:#555">Not legal advice. Not affiliated with the Social Security Administration.</p></div>`;
