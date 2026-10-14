// Daily deadline reminders. Called by the Netlify scheduled function (netlify/functions/case-reminders.mts) with CRON_SECRET.
// Inactive until RESEND_API_KEY is set (no email provider = nothing sent, nothing marked).
import { NextResponse } from "next/server";
import crypto from "crypto";
import { kvGet } from "@/lib/store";
import { listCases, saveCase, deadlines, tracking } from "@/lib/cases";
import { sendEmail, wrap } from "@/lib/email";
import { siteUrl } from "@/lib/auth";
export const dynamic = "force-dynamic";
const MARKS = [14, 7, 3, 1, 0];
export async function GET(req: Request) {
  const sec = process.env.CRON_SECRET || ""; const got = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (sec.length < 24 || got.length !== sec.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(sec))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: "email not configured" });
  let sent = 0;
  for (const owner of (await kvGet<string[]>("case-owners")) || []) for (const c of await listCases(owner)) {
    if (!c.reminders) continue;
    // Before filing: notice deadlines. After filing: post-filing follow-ups (call SSA, follow up, escalate, appeal a denial).
    const post = ["sent", "waiting", "decided"].includes(c.status) || !!c.tracking?.filedAt;
    const items = post ? tracking(c).items : deadlines(c)?.items; if (!items?.length) continue;
    const marks = post ? [3, 0] : MARKS;
    for (let i = 0; i < items.length; i++) { const it = items[i];
      const mark = marks.find((m) => it.daysLeft === m); if (mark === undefined) continue;
      const key = `${post ? "t" + it.label.slice(0, 12) : i}:${mark}`; if (c.remindersSent.includes(key)) continue;
      const r = await sendEmail(owner, `${mark === 0 ? "Today" : `${mark} day${mark > 1 ? "s" : ""} left`}: ${it.label}`, wrap(`<p>Case: <b>${(c.beneficiary || "your case").replace(/[<>&]/g, "")}</b></p><p><b>${it.label}</b> is ${it.date}${mark ? ` (${mark} days)` : " (today)"}.</p><p>${it.note}</p><p><a href="${siteUrl()}/cases/${c.id}">Open your case</a>. ${post ? "Log the call or SSA's decision in your case to keep the timeline current." : "Already sent it? Mark it as filed in your case to switch to follow-up reminders."}</p>`));
      if (r.ok) { c.remindersSent.push(key); await saveCase(c); sent++; }
    }
  }
  return NextResponse.json({ ok: true, sent });
}
