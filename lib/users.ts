import { kvGet, kvSet } from "./store";
import { PLANS, PlanId } from "./plans";
export type User = { email: string; plan: PlanId; createdAt: string; stripeCustomer?: string; caseCredits?: number; usage: { month: string; count: number; lifetime: number } };
export type HistoryItem = { id: string; at: string; amount?: string | null; reason?: string; recommendedOption?: string; result: unknown };
const month = () => new Date().toISOString().slice(0, 7);
const ukey = (e: string) => `user:${e.toLowerCase()}`;
export async function getUser(email: string) { return kvGet<User>(ukey(email)); }
export async function saveUser(u: User) { await kvSet(ukey(u.email), u); }
export async function ensureUser(email: string): Promise<{ user: User; created: boolean }> {
  const u = await getUser(email); if (u) return { user: u, created: false };
  const n: User = { email: email.toLowerCase(), plan: "free", createdAt: new Date().toISOString(), usage: { month: month(), count: 0, lifetime: 0 } };
  await saveUser(n); return { user: n, created: true };
}
export function remaining(u: User) {
  const p = PLANS[u.plan]; const used = p.period === "lifetime" ? u.usage.lifetime : (u.usage.month === month() ? u.usage.count : 0);
  return Math.max(0, p.limit - used);
}
export async function recordUse(u: User) {
  if (u.usage.month !== month()) u.usage = { ...u.usage, month: month(), count: 0 };
  u.usage.count++; u.usage.lifetime++; await saveUser(u);
}
export async function addHistory(email: string, item: HistoryItem) {
  const k = `history:${email.toLowerCase()}`; const list = (await kvGet<HistoryItem[]>(k)) || [];
  list.unshift(item); await kvSet(k, list.slice(0, 100));
}
export async function getHistory(email: string) { return (await kvGet<HistoryItem[]>(`history:${email.toLowerCase()}`)) || []; }
