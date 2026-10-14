export type PlanId = "free" | "pack" | "caregiver";
// NOTE: internal id "caregiver" is kept for existing accounts/webhooks; it is now the $19/mo "Notice Watch" plan.
export const PLANS: Record<PlanId, { name: string; price: string; limit: number; period: "month" | "lifetime"; priceEnv?: string; mode?: "payment" | "subscription" }> = {
  free: { name: "Free", price: "$0", limit: 1, period: "month" },
  pack: { name: "Letter pack", price: "$19 one-time", limit: 5, period: "lifetime", priceEnv: "STRIPE_PRICE_PACK", mode: "payment" }, // legacy, not sold
  caregiver: { name: "Notice Watch", price: "$19/mo", limit: 50, period: "month", priceEnv: "STRIPE_PRICE_WATCH", mode: "subscription" },
};
export const ANON_LIMIT = Number(process.env.GUEST_DAILY_LIMIT) || 1; // per IP per day for signed-out visitors

// One-time product: one complete waiver case (packet, AI drafts, SSA-632 answers, post-filing tracking).
export const LITE = { name: "Waiver Case", price: "$299 one-time", amount: "$299", priceEnv: "STRIPE_PRICE_LITE" };
export const HELP_PRICE = "from $599";
export const HELP_SPOTS = 10;
// Stripe price placeholders (set in Netlify env when payments go live):
//   STRIPE_PRICE_LITE  -> one-time $299 price ("Waiver Case")
//   STRIPE_PRICE_WATCH -> recurring $19/month price ("Notice Watch")
