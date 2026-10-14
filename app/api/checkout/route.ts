import { NextResponse } from "next/server";
import { currentEmail, siteUrl, isLocal } from "@/lib/auth";
import { PLANS, PlanId, LITE } from "@/lib/plans";
import { stripe, stripeOn } from "@/lib/stripe";
import { ensureUser, saveUser } from "@/lib/users";
export async function POST(req: Request) {
  const email = await currentEmail(); if (!email) return NextResponse.redirect(`${siteUrl()}/login?next=/account`, 303);
  const fd = await req.formData(); const plan = String(fd.get("plan")) as PlanId | "lite"; const caseId = String(fd.get("caseId") || "").slice(0, 64);
  if (plan === "lite") {
    const back = caseId ? `/cases/${encodeURIComponent(caseId)}` : "/cases";
    if (!stripeOn()) {
      if (!isLocal()) return NextResponse.redirect(`${siteUrl()}${back}?error=payments`, 303);
      const { user } = await ensureUser(email); user.caseCredits = (user.caseCredits || 0) + 1; await saveUser(user); // dev mock purchase
      return NextResponse.redirect(`${siteUrl()}${back}?purchased=lite&mock=1`, 303);
    }
    const price = process.env[LITE.priceEnv]; if (!price) return NextResponse.redirect(`${siteUrl()}${back}?error=payments`, 303);
    const s = await stripe("checkout/sessions", { mode: "payment", "line_items[0][price]": price, "line_items[0][quantity]": "1", customer_email: email, client_reference_id: email,
      "metadata[product]": "lite", "metadata[email]": email, "metadata[caseId]": caseId, success_url: `${siteUrl()}${back}?purchased=lite`, cancel_url: `${siteUrl()}${back}` });
    return NextResponse.redirect(s.url, 303);
  }
  const p = PLANS[plan];
  if (!p || !p.priceEnv) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  if (!stripeOn()) {
    if (!isLocal()) return NextResponse.redirect(`${siteUrl()}/account?error=payments`, 303);
    const { user } = await ensureUser(email); user.plan = plan; user.usage.lifetime = 0; await saveUser(user); // dev mock upgrade
    return NextResponse.redirect(`${siteUrl()}/account?upgraded=${plan}&mock=1`, 303);
  }
  const price = process.env[p.priceEnv]; if (!price) return NextResponse.redirect(`${siteUrl()}/account?error=payments`, 303);
  const s = await stripe("checkout/sessions", { mode: p.mode!, "line_items[0][price]": price, "line_items[0][quantity]": "1", customer_email: email,
    client_reference_id: email, "metadata[plan]": plan, "metadata[email]": email, success_url: `${siteUrl()}/account?upgraded=${plan}`, cancel_url: `${siteUrl()}/account` });
  return NextResponse.redirect(s.url, 303);
}
