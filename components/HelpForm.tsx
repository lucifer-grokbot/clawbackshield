"use client";
import { useEffect, useState } from "react";
import { Field, inputCls, Notice } from "./ui";
export default function HelpForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", forWho: "parent", amount: "", noticeDate: "", withholding: "", details: "", consent: false });
  const [st, setSt] = useState<"idle" | "busy" | "done">("idle"); const [err, setErr] = useState(""); const [spots, setSpots] = useState<number | null>(null);
  useEffect(() => { fetch("/api/help").then((r) => r.json()).then((d) => setSpots(d.spotsLeft)).catch(() => {}); }, []);
  const s = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setSt("busy");
    const r = await fetch("/api/help", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.ok) setSt("done"); else { setErr(d?.error || "We couldn't send your request. Please try again."); setSt("idle"); }
  }
  if (st === "done") return <Notice kind="ok"><p className="font-semibold">Request received. Thank you.</p><p className="mt-1">A real person will review it and reply to {f.email} within 2 business days with next steps and a quote. If a deadline is only days away, file your waiver or appeal with SSA first. Your rights don&apos;t depend on us.</p></Notice>;
  return (
    <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
      {spots !== null && <p className="font-semibold text-rust">{spots > 0 ? `${spots} of 10 founding-family spots left` : "Founding spots are full. We'll add you to the waitlist."}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="hn" label="Your name *"><input id="hn" required value={f.name} onChange={(e) => s("name", e.target.value)} className={inputCls} /></Field>
        <Field id="he" label="Email *"><input id="he" required type="email" value={f.email} onChange={(e) => s("email", e.target.value)} className={inputCls} /></Field>
        <Field id="hp" label="Phone (optional)"><input id="hp" type="tel" value={f.phone} onChange={(e) => s("phone", e.target.value)} className={inputCls} /></Field>
        <Field id="hf" label="Who is the case for?"><select id="hf" value={f.forWho} onChange={(e) => s("forWho", e.target.value)} className={inputCls}><option value="self">Me</option><option value="parent">My parent</option><option value="spouse">My spouse</option><option value="other">Someone else</option></select></Field>
        <Field id="ha" label="Overpayment amount"><input id="ha" value={f.amount} onChange={(e) => s("amount", e.target.value)} placeholder="$" className={inputCls} /></Field>
        <Field id="hd" label="Date on the notice"><input id="hd" type="date" value={f.noticeDate} onChange={(e) => s("noticeDate", e.target.value)} className={inputCls} /></Field>
      </div>
      <Field id="hw" label="Is SSA already withholding money? How much?"><input id="hw" value={f.withholding} onChange={(e) => s("withholding", e.target.value)} className={inputCls} /></Field>
      <Field id="ht" label="What's going on?" hint="A few sentences is plenty. Please don't include a Social Security number."><textarea id="ht" rows={5} value={f.details} onChange={(e) => s("details", e.target.value)} className={inputCls} /></Field>
      <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5" checked={f.consent} onChange={(e) => s("consent", e.target.checked)} /><span>I understand ClawbackShield is <b>not a law firm</b> and doesn&apos;t give legal advice. Help means preparing and organising my waiver paperwork with me; I review and sign everything myself.</span></label>
      {err && <Notice kind="warn">{err}</Notice>}
      <button disabled={st === "busy"} className="btn-primary">{st === "busy" ? "Sending…" : "Request help with my case"}</button>
      <p className="text-sm text-navy/70">No payment now. We&apos;ll reply with a quote first.</p>
    </form>
  );
}
