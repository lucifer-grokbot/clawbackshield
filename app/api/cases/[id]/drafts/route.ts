import { NextResponse } from "next/server";
import { requireUser, notFound } from "@/lib/session";
import { getCase, saveCase, hardship } from "@/lib/cases";
import { chat, LlmError } from "@/lib/llm";
export const runtime = "nodejs";
export const maxDuration = 26; // stay under Netlify's sync function limit
const HEAD = "DRAFT - NOT LEGAL ADVICE - REVIEW BEFORE SENDING";
const SYS = `You help families prepare a request to the U.S. Social Security Administration (SSA) to waive collection of an overpayment (Form SSA-632) and, if chosen, to reconsider it (SSA-561). You are not a lawyer. Write in plain, calm, first-person language for the beneficiary (or "on behalf of" if a family member is helping). Use ONLY facts given; put anything unknown in [BRACKETED PLACEHOLDERS]. Never invent dates, names, conversations or documents. Return JSON:
{"faultArgument": string (150-300 words: why the beneficiary was not at fault - reporting done, reliance on SSA, SSA's own error or delay, limited understanding; cite facts given),
 "hardshipStatement": string (120-250 words: why repayment would deprive them of income needed for ordinary and necessary living expenses or would be unfair, using the monthly numbers given),
 "coverLetter": string (a short letter to SSA enclosing the form(s): claim number placeholder, overpayment amount, request to waive (and/or reconsider), request to stop or reduce withholding while it is reviewed, list of enclosures, signature placeholder)}`;
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const c = await getCase(u.email, params.id); if (!c) return notFound();
  if (!c.unlocked) return NextResponse.json({ error: "Unlock this case to generate the drafts.", purchase: true }, { status: 402 });
  const h = hardship(c);
  const facts = { managingFor: c.managingFor, beneficiary: c.beneficiary || null, benefitType: c.benefitType, noticeDate: c.noticeDate, overpayment: c.amount, monthlyBenefit: c.monthlyBenefit, monthlyWithholding: c.withholding, reasonSSAGave: c.reason, requestType: c.pathway, fault: c.fault, household: c.finances.household,
    monthlyIncome: h.income, monthlyExpenses: h.expenses, expenseBreakdown: c.finances.expenses, incomeBreakdown: c.finances.income, assetsTotal: h.assets, incomeMinusExpenses: h.net, afterWithholding: h.afterWithholding };
  try {
    const raw = await chat([{ role: "system", content: SYS }, { role: "user", content: "FACTS:\n" + JSON.stringify(facts) }], true);
    const m = raw.match(/\{[\s\S]*\}/); const d = JSON.parse(m ? m[0] : raw);
    const fix = (s: unknown) => { const t = String(s || "").trim(); return t.startsWith("DRAFT") ? t : `${HEAD}\n\n${t}`; };
    if (!d.faultArgument || !d.hardshipStatement || !d.coverLetter) throw new SyntaxError("incomplete");
    c.drafts = { faultArgument: fix(d.faultArgument), hardshipStatement: fix(d.hardshipStatement), coverLetter: fix(d.coverLetter), generatedAt: new Date().toISOString() };
    if (c.status === "intake") { c.status = "drafting"; c.log.unshift({ at: c.drafts.generatedAt, status: "drafting", note: "Drafts generated" }); }
    await saveCase(c); return NextResponse.json({ case: c });
  } catch (e) {
    if (e instanceof LlmError) return NextResponse.json({ error: e.message, retry: true }, { status: e.status === 429 ? 429 : 503 });
    return NextResponse.json({ error: "The AI draft came back incomplete. Please try again.", retry: true }, { status: 502 });
  }
}
