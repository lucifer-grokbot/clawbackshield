"use client";
import { useEffect, useMemo, useState } from "react";
import { Field, inputCls, Notice, MoneyGrid, money } from "./ui";
import { INCOME_FIELDS, EXPENSE_FIELDS, ASSET_FIELDS, hardship } from "@/lib/casecore";
type Form = { managingFor: string; beneficiary: string; benefitType: string; noticeDate: string; amount: string; monthlyBenefit: string; withholding: string; reason: string; pathway: string;
  fault: { whatHappened: string; reportedChanges: string; reportedHow: string; ssaError: string; understoodRules: string; otherCircumstances: string };
  finances: { household: number; income: Record<string, number>; expenses: Record<string, number>; assets: Record<string, number> } };
const empty: Form = { managingFor: "parent", beneficiary: "", benefitType: "", noticeDate: "", amount: "", monthlyBenefit: "", withholding: "", reason: "", pathway: "waiver",
  fault: { whatHappened: "", reportedChanges: "unsure", reportedHow: "", ssaError: "", understoodRules: "unsure", otherCircumstances: "" }, finances: { household: 1, income: {}, expenses: {}, assets: {} } };
const toIso = (s?: string | null) => { if (!s) return ""; if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const d = new Date(s); if (isNaN(d.getTime())) return ""; const z = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }; // local parts: avoid UTC off-by-one
const toNum = (s?: string | null) => { const m = String(s || "").replace(/,/g, "").match(/\d+(\.\d+)?/); return m ? m[0] : ""; };
export function fromAnalysis(r: any): Partial<Form> {
  return { beneficiary: r?.beneficiary || "", benefitType: r?.benefitType || "", noticeDate: toIso(r?.noticeDate), amount: toNum(r?.amount), reason: r?.reason || "", pathway: r?.letterType === "reconsideration" ? "reconsideration" : "waiver" };
}
const Their = (x: string) => x[0].toUpperCase() + x.slice(1);
const STEPS = ["The notice", "Whose fault", "Money each month", "Review"];
export default function CaseIntake({ fromId }: { fromId?: string }) {
  const [f, setF] = useState<Form>(empty); const [step, setStep] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [prefilled, setPrefilled] = useState(false);
  useEffect(() => { try { if (new URLSearchParams(window.location.search).get("for") === "parent") setF((p) => ({ ...p, managingFor: "parent" })); } catch {} }, []);
  useEffect(() => {
    (async () => {
      let r: any = null;
      if (fromId) { const x = await fetch(`/api/history/${encodeURIComponent(fromId)}`).catch(() => null); if (x?.ok) r = (await x.json()).result; }
      if (!r) { try { r = JSON.parse(sessionStorage.getItem("cs_prefill") || "null"); } catch {} }
      if (r) { setF((p) => ({ ...p, ...fromAnalysis(r) })); setPrefilled(true); sessionStorage.removeItem("cs_prefill"); }
    })();
  }, [fromId]);
  const set = (k: keyof Form, v: any) => setF((p) => ({ ...p, [k]: v }));
  const setFault = (k: keyof Form["fault"], v: string) => setF((p) => ({ ...p, fault: { ...p.fault, [k]: v } }));
  const setFin = (k: keyof Form["finances"], v: any) => setF((p) => ({ ...p, finances: { ...p.finances, [k]: v } }));
  const h = useMemo(() => hardship({ finances: f.finances as any, withholding: Number(f.withholding) || 0, monthlyBenefit: Number(f.monthlyBenefit) || 0 }), [f]);
  function next() {
    setErr("");
    if (step === 0 && !f.noticeDate) return setErr("Please enter the date printed on the notice. We use it to work out your deadlines.");
    if (step === 0 && !(Number(f.amount) > 0)) return setErr("Please enter the overpayment amount from the notice.");
    setStep((s) => Math.min(3, s + 1)); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function create() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { window.location.href = "/login?next=/cases/new"; return; }
      if (!r.ok) throw new Error(d.error || "We couldn't save your case. Please try again.");
      window.location.href = `/cases/${d.case.id}?new=1`;
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }
  const helping = f.managingFor !== "self"; const them = f.managingFor === "parent" ? "your parent" : f.managingFor === "spouse" ? "your spouse" : helping ? "they" : "you";
  const their = f.managingFor === "parent" ? "your parent's" : f.managingFor === "spouse" ? "your spouse's" : helping ? "their" : "your";
  const radio = (name: string, val: string, cur: string, onC: (v: string) => void, label: string) => (
    <label className="flex items-center gap-2 rounded-md border-2 border-navy/15 bg-white px-3 py-2"><input type="radio" name={name} value={val} checked={cur === val} onChange={() => onC(val)} className="h-5 w-5" />{label}</label>);
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="eyebrow">Waiver case builder</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">{f.managingFor === "parent" ? "Fight Mom or Dad’s clawback" : "Start a waiver case"}</h1>
      <p className="mt-2 text-navy/80">About 10 minutes. You can change anything later. Your answers are saved to your account so you can come back.</p>
      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Steps">{STEPS.map((s, i) => (
        <li key={s} aria-current={i === step ? "step" : undefined} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${i === step ? "bg-navy text-cream" : i < step ? "bg-sage-100 text-sage" : "bg-white text-navy/60"}`}>{i + 1}. {s}</li>))}</ol>
      {prefilled && step === 0 && <div className="mt-4"><Notice kind="ok">We filled in what we found on your notice. Please check each answer.</Notice></div>}
      <div className="card mt-6 space-y-5 p-6">
        {step === 0 && <>
          <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 ${f.managingFor === "parent" ? "border-sage bg-sage-100" : "border-navy/15 bg-cream"}`} data-testid="helping-parent">
            <span><span className="block font-semibold">I&apos;m helping a parent</span><span className="text-sm text-navy/70">We&apos;ll word everything for you as the family helper.</span></span>
            <input type="checkbox" role="switch" aria-checked={f.managingFor === "parent"} checked={f.managingFor === "parent"} onChange={(e) => set("managingFor", e.target.checked ? "parent" : "self")} className="h-6 w-6 accent-[#2F5E4B]" /></label>
          {helping && <Notice kind="info">You can do most of this for {them}. SSA may need {them} to sign the form, or proof you&apos;re the representative payee or have power of attorney. We&apos;ll add that to the checklist.</Notice>}
          <fieldset><legend className="font-medium">Who is this case for?</legend><div className="mt-2 grid gap-2 sm:grid-cols-4">
            {radio("mf", "self", f.managingFor, (v) => set("managingFor", v), "Me")}{radio("mf", "parent", f.managingFor, (v) => set("managingFor", v), "My parent")}{radio("mf", "spouse", f.managingFor, (v) => set("managingFor", v), "My spouse")}{radio("mf", "other", f.managingFor, (v) => set("managingFor", v), "Someone else")}</div></fieldset>
          <Field id="ben" label={helping ? `${Their(their)} name` : "Beneficiary's name"} hint={helping ? `As printed on ${their} notice.` : "The person the notice is addressed to."}><input id="ben" value={f.beneficiary} onChange={(e) => set("beneficiary", e.target.value)} className={inputCls} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="nd" label="Date printed on the notice *"><input id="nd" type="date" required value={f.noticeDate} onChange={(e) => set("noticeDate", e.target.value)} className={inputCls} /></Field>
            <Field id="amt" label="Overpayment amount *"><input id="amt" inputMode="decimal" type="number" min={0} step="0.01" value={f.amount} onChange={(e) => set("amount", e.target.value)} className={inputCls} /></Field>
            <Field id="mb" label="Monthly benefit (before any cut)"><input id="mb" type="number" min={0} step="0.01" value={f.monthlyBenefit} onChange={(e) => set("monthlyBenefit", e.target.value)} className={inputCls} /></Field>
            <Field id="wh" label={`Amount SSA will withhold from ${their} check each month`} hint="Leave blank if the notice doesn't say."><input id="wh" type="number" min={0} step="0.01" value={f.withholding} onChange={(e) => set("withholding", e.target.value)} className={inputCls} /></Field>
          </div>
          <Field id="bt" label="Type of benefit" hint="For example: Social Security disability (SSDI), retirement, SSI."><input id="bt" value={f.benefitType} onChange={(e) => set("benefitType", e.target.value)} className={inputCls} /></Field>
          <Field id="rs" label="Why SSA says you were overpaid"><textarea id="rs" rows={3} value={f.reason} onChange={(e) => set("reason", e.target.value)} className={inputCls} /></Field>
          <fieldset><legend className="font-medium">What do you want to ask for?</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">
            {radio("pw", "waiver", f.pathway, (v) => set("pathway", v), "Waiver (SSA-632)")}{radio("pw", "reconsideration", f.pathway, (v) => set("pathway", v), "Appeal (SSA-561)")}{radio("pw", "both", f.pathway, (v) => set("pathway", v), "Both")}</div>
            <p className="mt-1 text-sm text-navy/70">Waiver: "don't make us pay it back". Appeal: "your numbers or facts are wrong". Not sure? Choose waiver. You can change it later.</p></fieldset>
        </>}
        {step === 1 && <>
          <Field id="wh2" label="In your own words, what happened?" hint={`When did things change for ${them} (work, income, living situation), and what did SSA do?`}><textarea id="wh2" rows={4} value={f.fault.whatHappened} onChange={(e) => setFault("whatHappened", e.target.value)} className={inputCls} /></Field>
          <fieldset><legend className="font-medium">{helping ? `Did ${them} (or you) tell SSA about the change?` : "Did you tell SSA about the change?"}</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">
            {radio("rc", "yes", f.fault.reportedChanges, (v) => setFault("reportedChanges", v), "Yes")}{radio("rc", "no", f.fault.reportedChanges, (v) => setFault("reportedChanges", v), "No")}{radio("rc", "unsure", f.fault.reportedChanges, (v) => setFault("reportedChanges", v), "Not sure")}</div></fieldset>
          {f.fault.reportedChanges === "yes" && <Field id="rh" label="How and when did you report it?" hint="Date, phone or office visit, name of the person, any receipt."><textarea id="rh" rows={2} value={f.fault.reportedHow} onChange={(e) => setFault("reportedHow", e.target.value)} className={inputCls} /></Field>}
          <Field id="se" label="What did SSA get wrong or do late?" hint="For example: kept paying after you reported work; took years to notice."><textarea id="se" rows={3} value={f.fault.ssaError} onChange={(e) => setFault("ssaError", e.target.value)} className={inputCls} /></Field>
          <fieldset><legend className="font-medium">{`Did ${them} understand the reporting rules at the time?`}</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">
            {radio("ur", "yes", f.fault.understoodRules, (v) => setFault("understoodRules", v), "Yes")}{radio("ur", "no", f.fault.understoodRules, (v) => setFault("understoodRules", v), "No")}{radio("ur", "unsure", f.fault.understoodRules, (v) => setFault("understoodRules", v), "Not sure")}</div></fieldset>
          <Field id="oc" label="Anything else SSA should know?" hint="Illness, memory problems, language, caregiving, confusing letters."><textarea id="oc" rows={3} value={f.fault.otherCircumstances} onChange={(e) => setFault("otherCircumstances", e.target.value)} className={inputCls} /></Field>
        </>}
        {step === 2 && <>
          <Field id="hh" label="People in the household"><input id="hh" type="number" min={1} max={20} value={f.finances.household} onChange={(e) => setFin("household", Number(e.target.value) || 1)} className={inputCls + " max-w-[8rem]"} /></Field>
          <h2 className="font-serif text-xl">{helping ? `${Their(their)} monthly income` : "Monthly income"}</h2><MoneyGrid prefix="inc" fields={INCOME_FIELDS} value={f.finances.income} onChange={(v) => setFin("income", v)} />
          <h2 className="font-serif text-xl">Monthly necessary expenses</h2><MoneyGrid prefix="exp" fields={EXPENSE_FIELDS} value={f.finances.expenses} onChange={(v) => setFin("expenses", v)} />
          <h2 className="font-serif text-xl">{helping ? `What ${them} own${f.managingFor === "other" ? "" : "s"} (assets)` : "What you own (assets)"}</h2><p className="text-sm text-navy/70">{helping ? `Count ${their} money only, not yours. Don't count ${their} home or one car.` : "Don't count your home or one car."}</p><MoneyGrid prefix="ast" fields={ASSET_FIELDS} value={f.finances.assets} onChange={(v) => setFin("assets", v)} />
          <HardshipBox h={h} withholding={Number(f.withholding) || 0} />
        </>}
        {step === 3 && <>
          <h2 className="font-serif text-2xl">Check your answers</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            {[["For", f.managingFor], ["Beneficiary", f.beneficiary || "—"], ["Notice date", f.noticeDate], ["Overpayment", money(Number(f.amount))], ["Monthly benefit", f.monthlyBenefit ? money(Number(f.monthlyBenefit)) : "—"], ["Withholding", f.withholding ? money(Number(f.withholding)) : "—"], ["Asking for", f.pathway], ["Reported changes", f.fault.reportedChanges]].map(([k, v]) => <div key={k} className="rounded-md bg-cream p-3"><dt className="text-sm text-navy/70">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
          </dl>
          <HardshipBox h={h} withholding={Number(f.withholding) || 0} />
          <p className="text-sm text-navy/70">Creating a case is free: you get the deadline tracker and hardship calculator. The SSA-632 answer sheet, AI drafts, PDF packet and post-filing tracker are $299 per case, one-time.</p>
        </>}
        {err && <Notice kind="warn">{err}</Notice>}
        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <button type="button" onClick={() => { setErr(""); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0} className="btn-ghost disabled:opacity-40">Back</button>
          {step < 3 ? <button type="button" onClick={next} className="btn-primary">Continue</button> : <button type="button" onClick={create} disabled={busy} className="btn-primary">{busy ? "Saving…" : "Create my case"}</button>}
        </div>
      </div>
      <p className="mt-4 text-sm text-navy/70">Not legal advice. Don&apos;t enter a Social Security number — you&apos;ll write it on the official form yourself.</p>
    </div>
  );
}
export function HardshipBox({ h, withholding }: { h: ReturnType<typeof hardship>; withholding: number }) {
  const tone = h.level === "strong" || h.level === "likely" ? "border-sage bg-sage-100" : h.level === "possible" ? "border-amber bg-amber-100" : "border-navy/20 bg-white";
  return <div className={`rounded-xl border-2 p-5 ${tone}`} aria-live="polite" data-testid="hardship">
    <p className="eyebrow !text-navy">Hardship calculator</p>
    <div className="mt-2 grid gap-3 sm:grid-cols-3">
      <div><p className="text-sm text-navy/70">Monthly income</p><p className="font-serif text-2xl">{money(h.income)}</p></div>
      <div><p className="text-sm text-navy/70">Necessary expenses</p><p className="font-serif text-2xl">{money(h.expenses)}</p></div>
      <div><p className="text-sm text-navy/70">Left over{withholding ? " after withholding" : ""}</p><p className={`font-serif text-2xl ${(withholding ? h.afterWithholding : h.net) < 0 ? "text-rust" : ""}`}>{money(withholding ? h.afterWithholding : h.net)}</p></div>
    </div>
    <p className="mt-3">{h.text}</p>
  </div>;
}
