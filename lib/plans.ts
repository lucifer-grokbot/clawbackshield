export type PlanId = "free" | "pack" | "caregiver";
export const PLANS: Record<PlanId, { name: string; price: string; limit: number; period: "month" | "lifetime"; priceEnv?: string; mode?: "payment" | "subscription" }> = {
  free: { name: "Free", price: "$0", limit: 1, period: "month" },
  pack: { name: "Letter pack", price: "$19 one-time", limit: 5, period: "lifetime", priceEnv: "STRIPE_PRICE_PACK", mode: "payment" },
  caregiver: { name: "Waiver Assistant Pro", price: "$49/mo", limit: 50, period: "month", priceEnv: "STRIPE_PRICE_CAREGIVER", mode: "subscription" },
};
export const ANON_LIMIT = Number(process.env.GUEST_DAILY_LIMIT) || 1; // per IP per day for signed-out visitors

// One-time product: unlocks one waiver case packet (AI drafts, SSA-632 answer sheet, PDF packet).
export const LITE = { name: "Waiver Assistant Lite", price: "$99 one-time", priceEnv: "STRIPE_PRICE_LITE" };
export const HELP_PRICE = "from $299";
export const HELP_SPOTS = 10;
