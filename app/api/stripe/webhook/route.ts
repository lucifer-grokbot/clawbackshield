import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/stripe";
import { ensureUser, saveUser } from "@/lib/users";
import { kvGet, kvSet } from "@/lib/store";
import { PlanId } from "@/lib/plans";
import { getCase, saveCase } from "@/lib/cases";
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("stripe-signature"))) return NextResponse.json({ error: "bad signature" }, { status: 400 });
  const ev = JSON.parse(raw); const o = ev.data?.object || {};
  if (ev.type === "checkout.session.completed") {
    const email = o.metadata?.email || o.customer_email; const plan = o.metadata?.plan as PlanId;
    if (email && o.metadata?.product === "lite") {
      const done = await kvGet<boolean>(`stripe-session:${o.id}`); // idempotent: Stripe can retry
      if (!done) { const { user } = await ensureUser(email); user.caseCredits = (user.caseCredits || 0) + 1; await saveUser(user); await kvSet(`stripe-session:${o.id}`, true);
        const cid = o.metadata?.caseId; if (cid) { const c = await getCase(email, cid); if (c && !c.unlocked) { c.unlocked = true; user.caseCredits -= 1; await saveUser(user); c.log.unshift({ at: new Date().toISOString(), status: c.status, note: "Lite purchased: case unlocked" }); await saveCase(c); } } }
    } else if (email && plan) { const { user } = await ensureUser(email); user.plan = plan; user.usage.lifetime = 0; user.stripeCustomer = o.customer || undefined; await saveUser(user); if (o.customer) await kvSet(`cust:${o.customer}`, email); }
  }
  if (ev.type === "customer.subscription.deleted" && o.customer) {
    const email = await kvGet<string>(`cust:${o.customer}`); if (email) { const { user } = await ensureUser(email); user.plan = "free"; await saveUser(user); }
  }
  return NextResponse.json({ received: true });
}
