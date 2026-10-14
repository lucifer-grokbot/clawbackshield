// Waiver cases: stored per user in KV (`cases:<email>`), plus an owner index for reminder jobs.
import crypto from "crypto";
import { kvGet, kvSet } from "./store";
import type { User } from "./users";
import { Case, Status, Money, INCOME_FIELDS, EXPENSE_FIELDS, ASSET_FIELDS } from "./casecore";
export * from "./casecore";

const k = (email: string) => `cases:${email.toLowerCase()}`;
export async function listCases(email: string) { return (await kvGet<Case[]>(k(email))) || []; }
export async function getCase(email: string, id: string) { return (await listCases(email)).find((c) => c.id === id) || null; }
export async function saveCase(c: Case) {
  const list = await listCases(c.owner); const i = list.findIndex((x) => x.id === c.id); c.updatedAt = new Date().toISOString();
  if (i >= 0) list[i] = c; else list.unshift(c);
  await kvSet(k(c.owner), list.slice(0, 50));
  const owners = (await kvGet<string[]>("case-owners")) || []; if (!owners.includes(c.owner)) { owners.push(c.owner); await kvSet("case-owners", owners); }
}
export async function deleteCase(email: string, id: string) { await kvSet(k(email), (await listCases(email)).filter((c) => c.id !== id)); }

const clip = (v: unknown, n = 4000) => String(v ?? "").slice(0, n);
const num = (v: unknown) => { const x = Number(String(v ?? "").replace(/[$,\s]/g, "")); return isFinite(x) && x >= 0 ? Math.round(x * 100) / 100 : 0; };
const pick = <T extends string>(v: unknown, opts: readonly T[], d: T) => (opts.includes(v as T) ? (v as T) : d);
const money = (m: unknown, fields: [string, string][]) => Object.fromEntries(fields.map(([f]) => [f, num((m as Money)?.[f])]));
/** Validate and normalise user input into case fields (never trusts client ids/owner/unlock). */
export function sanitize(b: Record<string, any>, base?: Case) {
  const f = b.fault || {}; const fin = b.finances || {};
  return {
    managingFor: pick(b.managingFor, ["self", "parent", "spouse", "other"] as const, base?.managingFor || "self"),
    beneficiary: clip(b.beneficiary ?? base?.beneficiary, 120), benefitType: clip(b.benefitType ?? base?.benefitType, 80),
    noticeDate: /^\d{4}-\d{2}-\d{2}$/.test(b.noticeDate) ? b.noticeDate : base?.noticeDate || "",
    amount: num(b.amount ?? base?.amount), monthlyBenefit: num(b.monthlyBenefit ?? base?.monthlyBenefit), withholding: num(b.withholding ?? base?.withholding),
    reason: clip(b.reason ?? base?.reason, 1500),
    pathway: pick(b.pathway, ["waiver", "reconsideration", "both"] as const, base?.pathway || "waiver"),
    fault: b.fault ? { whatHappened: clip(f.whatHappened), reportedChanges: pick(f.reportedChanges, ["yes", "no", "unsure"] as const, "unsure"), reportedHow: clip(f.reportedHow, 2000), ssaError: clip(f.ssaError), understoodRules: pick(f.understoodRules, ["yes", "no", "unsure"] as const, "unsure"), otherCircumstances: clip(f.otherCircumstances, 2000) } : base?.fault || { whatHappened: "", reportedChanges: "unsure" as const, reportedHow: "", ssaError: "", understoodRules: "unsure" as const, otherCircumstances: "" },
    finances: b.finances ? { household: Math.min(20, Math.max(1, Math.round(num(fin.household) || 1))), income: money(fin.income, INCOME_FIELDS), expenses: money(fin.expenses, EXPENSE_FIELDS), assets: money(fin.assets, ASSET_FIELDS) } : base?.finances || { household: 1, income: {}, expenses: {}, assets: {} },
  };
}
export function newCase(owner: string, b: Record<string, any>): Case {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), owner: owner.toLowerCase(), createdAt: now, updatedAt: now, ...sanitize(b), status: "intake", log: [{ at: now, status: "intake", note: "Case created" }], evidence: {}, unlocked: false, reminders: true, remindersSent: [] };
}
// Packets are per case now; Notice Watch does not include free unlocks.
export const canUnlockFree = (_u: User) => false;
