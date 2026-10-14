"use client";
import { useEffect, useMemo, useState } from "react";
import type { Case, Status } from "@/lib/casecore";
import { STATUSES, STATUS_LABEL, OUTCOMES, OUTCOME_LABEL, tracking, pauseLetter, deadlines, hardship, INCOME_FIELDS, EXPENSE_FIELDS, ASSET_FIELDS, EVIDENCE } from "@/lib/casecore";
import { ssa632Answers, filingInstructions, DISCLAIMER } from "@/lib/answers";
import { HardshipBox } from "./CaseIntake";
import { Notice, DraftBadge, MoneyGrid, money, Field, inputCls } from "./ui";
type Err = { msg: string; retry?: () => void; purchase?: boolean } | null;
export default function CaseView({ id, flags }: { id: string; flags: { new?: boolean; purchased?: boolean; mock?: boolean; payError?: boolean } }) {
  const [c, setC] = useState<Case | null>(null); const [meta, setMeta] = useState({ credits: 0, pro: false }); const [err, setErr] = useState<Err>(null);
  const [busy, setBusy] = useState<string | null>(null); const [fin, setFin] = useState<Case["finances"] | null>(null); const [copied, setCopied] = useState<string | null>(null);
  const [note, setNote] = useState(""); const [loadErr, setLoadErr] = useState("");
  async function load() {
    const r = await fetch(`/api/cases/${id}`, { cache: "no-store" }).catch(() => null);
    if (!r) return setLoadErr("Network problem. Check your connection and refresh.");
    if (r.status === 401) { window.location.href = `/login?next=/cases/${id}`; return; }
    const d = await r.json().catch(() => ({})); if (!r.ok) return setLoadErr(d.error || "We couldn't load this case.");
    setC(d.case); setFin(d.case.finances); setMeta({ credits: d.credits, pro: d.pro });
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line
  async function call(label: string, url: string, init?: RequestInit) {
    setBusy(label); setErr(null);
    try {
      const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } }); const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr({ msg: d.error || (r.status === 504 ? "That took too long. Please try again." : "Something went wrong. Please try again."), retry: d.retry ? () => call(label, url, init) : undefined, purchase: d.purchase }); return null; }
      if (d.case) setC(d.case); return d;
    } catch { setErr({ msg: "Network problem. Check your connection and try again.", retry: () => call(label, url, init) }); return null; } finally { setBusy(null); }
  }
  const optimistic = (fn: (x: Case) => Case) => setC((x) => (x ? fn(x) : x));
  const patch = (body: object, label = "save") => call(label, `/api/cases/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  const h = useMemo(() => (c && fin ? hardship({ finances: fin, withholding: c.withholding, monthlyBenefit: c.monthlyBenefit }) : null), [c, fin]);
  const d = c ? deadlines(c) : null; const answers = c ? ssa632Answers(c) : [];
  const copy = (k: string, t: string) => { navigator.clipboard.writeText(t).then(() => { setCopied(k); setTimeout(() => setCopied(null), 1500); }); };
  if (loadErr) return <div className="mx-auto max-w-3xl px-5 py-16"><Notice kind="warn">{loadErr} <a href="/cases" className="underline">Back to my cases</a></Notice></div>;
  if (!c || !h) return <div className="mx-auto max-w-3xl px-5 py-16" role="status">Loading your case…</div>;
  const dirty = JSON.stringify(fin) !== JSON.stringify(c.finances);
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <a href="/cases" className="text-navy/70 underline">← My cases</a>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Waiver case</p><h1 className="mt-1 font-serif text-4xl font-medium">{c.beneficiary || "Untitled case"}</h1>
          <p className="mt-1 text-navy/80">{money(c.amount)} overpayment · notice dated {c.noticeDate} · {c.pathway === "both" ? "waiver + appeal" : c.pathway}</p></div>
        <div className="flex items-center gap-2"><label htmlFor="st" className="font-medium">Status</label>
          <select id="st" value={c.status} onChange={(e) => { const v = e.target.value as Status; optimistic((x) => ({ ...x, status: v })); patch({ status: v }, "status"); }} className="rounded-md border-2 border-navy/20 bg-white px-3 py-2">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
      </div>
      <div className="mt-4 space-y-3">
        {flags.new && <Notice kind="ok">Your case is saved. Next: check the deadlines, then unlock the packet when you&apos;re ready.</Notice>}
        {flags.purchased && <Notice kind="ok">Thanks! Your case purchase went through{flags.mock ? " (test mode, no charge)" : ""}. Click &quot;Unlock this case&quot; below if it isn&apos;t unlocked yet.</Notice>}
        {flags.payError && <Notice kind="warn">Payments aren&apos;t switched on yet, so a case can&apos;t be bought online today. <a className="underline" href="/help">Ask us for help with your case</a> instead.</Notice>}
        {err && <Notice kind="warn"><span>{err.msg}</span>{err.retry && <button onClick={err.retry} className="btn-primary ml-3 !py-1.5">Try again</button>}</Notice>}
      </div>

      <section aria-labelledby="dl" className="mt-8"><h2 id="dl" className="font-serif text-2xl">Deadlines</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">{d?.items.map((it) => {
          const urgent = it.daysLeft <= 7; const past = it.daysLeft < 0;
          return <div key={it.label} className={`card p-5 ${urgent && !past ? "ring-2 ring-rust" : ""}`} data-testid="deadline">
            <p className="font-semibold">{it.label}</p>
            <p className={`mt-1 font-serif text-4xl ${urgent ? "text-rust" : "text-navy"}`}>{past ? "Passed" : it.daysLeft === 0 ? "Today" : `${it.daysLeft} days`}</p>
            <p className="text-navy/80">{past ? `was ${it.date}` : `left · by ${it.date}`}</p><p className="mt-2 text-sm text-navy/70">{it.note}</p></div>; })}</div>
        <p className="mt-2 text-sm text-navy/70">Based on the notice date plus 5 days for mail. Always check the dates on your notice.{d?.items.some((i) => i.daysLeft < 0) && " A waiver can still be requested after these dates."}</p>
        <label className="mt-3 flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={c.reminders} onChange={(e) => { const v = e.target.checked; optimistic((x) => ({ ...x, reminders: v })); patch({ reminders: v }, "rem"); }} /> Email me deadline reminders (14, 7, 3 and 1 days before)</label>
        <p className="text-sm text-navy/60">Reminders start once email delivery is switched on.</p>
      </section>

      <section aria-labelledby="hc" className="mt-10"><h2 id="hc" className="font-serif text-2xl">Hardship calculator</h2>
        <div className="card mt-3 space-y-4 p-5">
          <Field id="hh" label="People in the household"><input id="hh" type="number" min={1} value={fin!.household} onChange={(e) => setFin({ ...fin!, household: Number(e.target.value) || 1 })} className={inputCls + " max-w-[8rem]"} /></Field>
          <details open={!c.finances || Object.keys(c.finances.income || {}).length === 0}><summary className="cursor-pointer font-semibold">Edit income, expenses and assets</summary>
            <div className="mt-4 space-y-4"><h3 className="font-semibold">Monthly income</h3><MoneyGrid prefix="inc" fields={INCOME_FIELDS} value={fin!.income} onChange={(v) => setFin({ ...fin!, income: v })} />
              <h3 className="font-semibold">Monthly necessary expenses</h3><MoneyGrid prefix="exp" fields={EXPENSE_FIELDS} value={fin!.expenses} onChange={(v) => setFin({ ...fin!, expenses: v })} />
              <h3 className="font-semibold">Assets</h3><MoneyGrid prefix="ast" fields={ASSET_FIELDS} value={fin!.assets} onChange={(v) => setFin({ ...fin!, assets: v })} /></div></details>
          <HardshipBox h={h} withholding={c.withholding} />
          {dirty && <button onClick={() => patch({ details: { finances: fin } }, "fin")} disabled={busy === "fin"} className="btn-primary">{busy === "fin" ? "Saving…" : "Save numbers"}</button>}
        </div>
      </section>

      <section aria-labelledby="pk" className="mt-10"><h2 id="pk" className="font-serif text-2xl">Your case packet</h2>
        {!c.unlocked ? (
          <div className="card mt-3 p-6" data-testid="locked">
            <p className="text-lg">Unlock the <b>SSA-632 answer sheet</b>, AI-drafted <b>fault argument</b> and <b>hardship statement</b>, a <b>cover letter</b>, and a <b>printable PDF packet</b> with evidence checklist and filing steps.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {meta.credits > 0
                ? <button onClick={() => call("unlock", `/api/cases/${id}/unlock`, { method: "POST" })} disabled={busy === "unlock"} className="btn-primary">{busy === "unlock" ? "Unlocking…" : `Unlock this case (uses 1 of ${meta.credits} case credit${meta.credits > 1 ? "s" : ""})`}</button>
                : <form action="/api/checkout" method="post"><input type="hidden" name="plan" value="lite" /><input type="hidden" name="caseId" value={c.id} /><button className="btn-primary">Unlock this case: $299 one-time</button></form>}
              <a href="/help" className="btn-ghost">Or have us help (from $599)</a>
            </div>
          </div>
        ) : (<div className="mt-3 space-y-5">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="font-semibold">AI drafts<DraftBadge /></h3><p className="text-sm text-navy/70">{c.drafts ? `Generated ${new Date(c.drafts.generatedAt).toLocaleString()}. Regenerate after changing your answers.` : "Written from your answers. Takes about 15 seconds."}</p></div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => call("drafts", `/api/cases/${id}/drafts`, { method: "POST" })} disabled={busy === "drafts"} className="btn-primary !py-2">{busy === "drafts" ? "Writing drafts…" : c.drafts ? "Regenerate drafts" : "Write my drafts"}</button>
                <a href={`/api/cases/${id}/packet`} className="btn-ghost !py-2" download>Download PDF packet</a>
              </div>
            </div>
            {c.drafts && <div className="mt-4 grid gap-4">{([["coverLetter", "Cover letter"], ["faultArgument", "Why I was not at fault"], ["hardshipStatement", "Hardship statement"]] as const).map(([k, l]) => (
              <details key={k} className="rounded-lg border border-navy/10 p-4" open={k === "faultArgument"}><summary className="cursor-pointer font-semibold">{l}</summary>
                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border-l-4 border-amber bg-cream p-4 font-sans text-base">{c.drafts![k]}</pre>
                <button onClick={() => copy(k, c.drafts![k])} className="mt-2 rounded-full border border-navy/20 px-4 py-1.5">{copied === k ? "Copied" : "Copy"}</button></details>))}</div>}
          </div>
          <div className="card p-5"><h3 className="font-semibold">SSA-632 answer sheet<DraftBadge /></h3>
            <p className="text-sm text-navy/70">Copy each answer onto the matching section of the official <a className="underline" href="https://www.ssa.gov/forms/ssa-632.html" target="_blank" rel="noreferrer">Form SSA-632</a>. Section numbers can change, so match by topic.</p>
            <ol className="mt-3 space-y-3">{answers.map((a, i) => (
              <li key={a.topic} className="rounded-lg bg-cream p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{i + 1}. {a.topic}</p><p className="text-sm text-navy/60">{a.where}</p></div>
                <button onClick={() => copy("a" + i, a.answer)} className="rounded-full border border-navy/20 bg-white px-3 py-1 text-sm">{copied === "a" + i ? "Copied" : "Copy"}</button></div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-base">{a.answer}</pre></li>))}</ol>
            <p className="mt-3 text-xs text-navy/60">{DISCLAIMER}</p>
          </div>
        </div>)}
      </section>

      <section aria-labelledby="ev" className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-5"><h2 id="ev" className="font-serif text-2xl">Evidence checklist</h2>
          <ul className="mt-3 space-y-2">{EVIDENCE.map(([k, l]) => <li key={k}><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5" checked={!!c.evidence[k]} onChange={(e) => { const v = e.target.checked; optimistic((x) => ({ ...x, evidence: { ...x.evidence, [k]: v } })); patch({ evidence: { [k]: v } }, "ev"); }} />{l}</label></li>)}</ul>
          <p className="mt-2 text-sm text-navy/70">{EVIDENCE.filter(([k]) => c.evidence[k]).length} of {EVIDENCE.length} gathered</p></div>
        <div className="card p-5"><h2 className="font-serif text-2xl">How to file</h2><ol className="mt-3 list-decimal space-y-2 pl-5">{filingInstructions(c).map((t) => <li key={t}>{t}</li>)}</ol></div>
      </section>

      <TrackSection c={c} busy={busy} patch={patch} copy={copy} copied={copied} />

      <section aria-labelledby="tl" className="mt-10"><h2 id="tl" className="font-serif text-2xl">Case history</h2>
        <div className="card mt-3 p-5">
          <div className="flex flex-col gap-2 sm:flex-row"><label htmlFor="nt" className="sr-only">Add a note</label><input id="nt" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (e.g. 'Called SSA, spoke to Ms. Lee')" className={inputCls} />
            <button onClick={async () => { if (await patch({ status: c.status, note }, "note")) setNote(""); }} disabled={!note.trim() || busy === "note"} className="btn-primary !py-2">Add note</button></div>
          <ol className="mt-4 space-y-2">{c.log.map((l, i) => <li key={i} className="flex gap-3 text-base"><span className="w-44 shrink-0 text-navy/60">{new Date(l.at).toLocaleString()}</span><span><b>{STATUS_LABEL[l.status]}</b>{l.note ? ` — ${l.note}` : ""}</span></li>)}</ol>
        </div>
        <button onClick={async () => { if (confirm("Delete this case? This can't be undone.")) { const r = await fetch(`/api/cases/${id}`, { method: "DELETE" }); if (r.ok) window.location.href = "/cases"; else setErr({ msg: "We couldn't delete the case. Please try again." }); } }} className="mt-4 text-rust underline">Delete this case</button>
      </section>
      <p className="mt-10 rounded-lg border-2 border-rust bg-rust-100 p-4 text-base">Everything here is a <b>draft for you to review</b>, not legal advice. ClawbackShield is not a law firm and is not affiliated with SSA. For free legal help, try <a className="underline" href="https://www.lawhelp.org" target="_blank" rel="noreferrer">lawhelp.org</a>.</p>
    </div>
  );
}

function TrackSection({ c, busy, patch, copy, copied }: { c: Case; busy: string | null; patch: (b: object, l?: string) => Promise<any>; copy: (k: string, t: string) => void; copied: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const [fd, setFd] = useState(today); const [how, setHow] = useState("mail"); const [call, setCall] = useState("");
  const [dec, setDec] = useState<{ outcome: string; date: string; note: string }>({ outcome: "approved", date: today, note: "" });
  const tr = tracking(c); const letter = pauseLetter(c); const t = c.tracking;
  const dl = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([letter], { type: "text/plain" })); a.download = "pause-withholding-request.txt"; a.click(); };
  return (
    <section aria-labelledby="af" className="mt-10" data-testid="tracking"><h2 id="af" className="font-serif text-2xl">After you file</h2>
      <p className="mt-1 text-navy/80">Track the waiver until SSA decides. We&apos;ll remind you when to call and when to follow up.</p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-4" aria-label="Case timeline" data-testid="timeline">{tr.steps.map((s, i) => {
        const done = i < tr.stage || (i === 3 && tr.stage === 3); const cur = i === tr.stage && tr.stage < 3;
        return <li key={s.key} aria-current={cur ? "step" : undefined} className={`rounded-xl border-2 p-4 ${done ? "border-sage bg-sage-100" : cur ? "border-amber bg-amber-100" : "border-navy/10 bg-white"}`}>
          <div className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${done ? "bg-sage text-white" : cur ? "bg-navy text-amber" : "bg-navy/10 text-navy/60"}`}>{done ? "✓" : i + 1}</span><span className="font-semibold">{s.label}</span></div>
          <p className="mt-2 text-sm text-navy/80">{s.detail}</p></li>; })}</ol>

      {!tr.filed ? (
        <div className="card mt-4 p-5"><h3 className="font-semibold">Sent your waiver to SSA? Mark it filed.</h3>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field id="fdt" label="Date sent"><input id="fdt" type="date" max={today} value={fd} onChange={(e) => setFd(e.target.value)} className={inputCls} /></Field>
            <Field id="fhow" label="How"><select id="fhow" value={how} onChange={(e) => setHow(e.target.value)} className={inputCls}><option value="mail">Mail</option><option value="fax">Fax</option><option value="in person">In person</option><option value="phone">Phone</option><option value="online upload">Online upload</option></select></Field>
            <button onClick={() => patch({ filed: { date: fd, how } }, "file")} disabled={busy === "file" || !fd} className="btn-primary !py-3">{busy === "file" ? "Saving…" : "Mark as filed"}</button>
          </div></div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {tr.items.map((it) => { const past = it.daysLeft < 0; const soon = it.daysLeft <= 3;
            return <div key={it.label} className={`card p-5 ${soon && !past ? "ring-2 ring-rust" : ""}`} data-testid="followup"><p className="font-semibold">{it.label}</p>
              <p className={`mt-1 font-serif text-3xl ${soon ? "text-rust" : ""}`}>{past ? "Due now" : it.daysLeft === 0 ? "Today" : `${it.daysLeft} days`}</p><p className="text-navy/80">{past ? `was due ${it.date}` : `by ${it.date}`}</p><p className="mt-2 text-sm text-navy/70">{it.note}</p></div>; })}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card p-5"><h3 className="font-semibold">Log a call with SSA</h3>
          <label htmlFor="cl" className="sr-only">Call note</label><textarea id="cl" rows={2} value={call} onChange={(e) => setCall(e.target.value)} placeholder="e.g. Spoke to Mr. Diaz. Waiver received 10/20, withholding paused." className={inputCls + " mt-2"} />
          <button onClick={async () => { if (await patch({ call: { note: call } }, "call")) setCall(""); }} disabled={!call.trim() || busy === "call"} className="btn-ghost mt-2 !py-2">{busy === "call" ? "Saving…" : "Save call"}</button>
          {!!t?.calls.length && <ul className="mt-3 space-y-1 text-sm">{t.calls.slice(0, 5).map((x, i) => <li key={i}><span className="text-navy/60">{new Date(x.at).toLocaleDateString()}</span> · {x.note}</li>)}</ul>}
        </div>
        <div className="card p-5" data-testid="decision-log"><h3 className="font-semibold">Decision log</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Field id="dout" label="What SSA said"><select id="dout" value={dec.outcome} onChange={(e) => setDec({ ...dec, outcome: e.target.value })} className={inputCls}>{OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABEL[o]}</option>)}</select></Field>
            <Field id="ddt" label="Date on the letter"><input id="ddt" type="date" max={today} value={dec.date} onChange={(e) => setDec({ ...dec, date: e.target.value })} className={inputCls} /></Field>
          </div>
          <label htmlFor="dnote" className="sr-only">Decision note</label><input id="dnote" value={dec.note} onChange={(e) => setDec({ ...dec, note: e.target.value })} placeholder="Optional note (e.g. waived $3,000 of $4,812)" className={inputCls + " mt-2"} />
          <button onClick={async () => { if (await patch({ decision: dec }, "dec")) setDec({ ...dec, note: "" }); }} disabled={busy === "dec"} className="btn-ghost mt-2 !py-2">{busy === "dec" ? "Saving…" : "Add to decision log"}</button>
          {!!t?.decisions.length && <ul className="mt-3 space-y-1 text-sm">{t.decisions.map((x, i) => <li key={i}><b>{OUTCOME_LABEL[x.outcome]}</b> · letter {x.date}{x.note ? ` · ${x.note}` : ""}</li>)}</ul>}
          {tr.final?.outcome === "approved" && <p className="mt-3 rounded-md bg-sage-100 p-3 text-sm">Approved. Ask SSA to refund anything withheld after you asked for the waiver, and keep the letter safe.</p>}
        </div>
      </div>

      <details className="card mt-4 p-5" data-testid="pause-letter"><summary className="cursor-pointer font-semibold">Letter: ask SSA to pause withholding while the waiver is pending <DraftBadge /></summary>
        <p className="mt-2 text-sm text-navy/70">Send this with (or right after) your SSA-632 if money is still being taken. Filled in from your case. You add your signature and the SSN on paper.</p>
        <div className="mt-3 flex gap-2"><button onClick={() => copy("pause", letter)} className="rounded-full border border-navy/20 bg-white px-4 py-2">{copied === "pause" ? "Copied" : "Copy"}</button><button onClick={dl} className="rounded-full bg-navy px-4 py-2 text-cream">Download .txt</button></div>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border-l-4 border-amber bg-cream p-4 font-sans text-base">{letter}</pre>
      </details>
    </section>
  );
}
