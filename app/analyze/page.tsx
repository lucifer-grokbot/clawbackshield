"use client";
import { useState } from "react";
type Opt = { name: string; form: string; whenItFits: string; deadlineNote: string };
type Res = { summary: string; beneficiary?: string | null; benefitType?: string | null; amount?: string | null; reason: string; noticeDate?: string | null;
  keyDates: { label: string; date: string | null; note: string }[]; options: Opt[]; recommendedOption: string; recommendedReason: string;
  letterType: string; letter: string; questionsToAsk?: string[]; missingInfo?: string[] };
export default function Analyze() {
  const [text, setText] = useState(""); const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<{ msg: string; retry?: boolean; limit?: boolean; login?: boolean } | null>(null);
  const [emailMe, setEmailMe] = useState(true); const [res, setRes] = useState<Res | null>(null); const [copied, setCopied] = useState(false);
  const [emailed, setEmailed] = useState<string | null>(null); const [fileKey, setFileKey] = useState(0);
  async function loadSample() { try { const r = await fetch("/samples/sample-notice.txt"); setText(await r.text()); setFile(null); setFileKey((k) => k + 1); setErr(null); } catch { setErr({ msg: "Couldn't load the sample. Please try again.", retry: false }); } }
  function pickFile(f: File | null) { setErr(null); if (f && f.size > 4 * 1024 * 1024) { setErr({ msg: "That file is too large (4 MB max). Try a smaller photo or paste the text." }); setFile(null); setFileKey((k) => k + 1); return; } setFile(f); }
  async function run() {
    setBusy(true); setErr(null); setRes(null); setEmailed(null);
    const fd = new FormData(); fd.append("text", text); if (emailMe) fd.append("emailMe", "1"); if (file) fd.append("file", file);
    try {
      const r = await fetch("/api/analyze", { method: "POST", body: fd }); const d = await r.json().catch(() => ({ error: r.status === 413 ? "That file is too large. Try a smaller file or paste the text." : "The server took too long. Please try again.", retry: r.status !== 413 }));
      if (!r.ok) setErr({ msg: d.error || "Something went wrong.", retry: d.retry, limit: d.limit, login: d.login }); else { setRes(d.result); setEmailed(d.emailed || null); }
    } catch { setErr({ msg: "Network problem. Check your connection and try again.", retry: true }); }
    setBusy(false);
  }
  function download() {
    const b = new Blob([res!.letter], { type: "text/plain" }); const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = `DRAFT-${res!.letterType}-letter.txt`; a.click();
  }
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-serif text-3xl font-semibold md:text-4xl">Read my notice</h1>
      <p className="mt-3 rounded-lg border-l-4 border-sage bg-sage-100 p-4 text-base"><b>Privacy:</b> your notice is sent to OpenRouter and processed by Google Gemini to create your summary. We don't save the notice itself; if you start a case, the details you enter are saved to your account. You can black out your Social Security number first.</p>
      <p className="mt-2 text-navy/70">Paste the letter text or upload a PDF or photo. Tip: black out the SSN first.</p>
      <p className="mt-1 text-base">Just looking? <button type="button" onClick={loadSample} className="font-semibold text-rust underline">Try a sample notice</button> <span className="text-navy/60">(fictional)</span> · or download it as <a href="/samples/sample-notice.pdf" download className="underline">PDF</a> / <a href="/samples/sample-notice.txt" download className="underline">text</a>.</p>
      <div className="card mt-6 p-5">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} placeholder="Paste the full text of the SSA notice here…" className="w-full rounded-xl border border-navy/15 bg-cream/50 p-4 text-base outline-none focus:border-amber" />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-base">or upload: <input key={fileKey} type="file" aria-label="Upload notice file" accept="application/pdf,.pdf,image/*,text/plain,.txt" onChange={(e) => pickFile(e.target.files?.[0] || null)} className="ml-2 text-base" /></label>
          <button onClick={run} disabled={busy || (!text.trim() && !file)} className="rounded-full bg-navy px-6 py-3 font-semibold text-cream disabled:opacity-40">{busy ? "Reading your notice…" : "Explain it"}</button>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-base"><input type="checkbox" checked={emailMe} onChange={(e) => setEmailMe(e.target.checked)} className="h-5 w-5" /> Email me the summary (signed-in users)</label>
      {res && emailed && <p className="mt-3 rounded-lg bg-sage-100 p-3 text-base" role="status">{emailed === "sent" ? "We emailed you this summary." : emailed === "signin" ? <>Want this by email? <a href="/login?next=/analyze" className="underline">Sign in free</a> and we'll email your summaries.</> : emailed === "mocked" ? "Email delivery isn't switched on yet, so your summary is shown here and saved in your account." : "We couldn't send the email, but your summary is below and saved in your account."}</p>}
      {err && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber bg-amber-100 p-4 text-base">
          <span>{err.msg}</span>{err.retry && <button onClick={run} className="btn-primary !py-2">Try again</button>}{err.limit && <a href={err.login ? "/login?next=/analyze" : "/account"} className="btn-primary !py-2">{err.login ? "Sign in free" : "See plans"}</a>}
        </div>
      )}
      {res && (
        <section id="result" className="mt-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5 md:col-span-2">
              <p className="text-xs uppercase tracking-wider text-navy/50">In plain English {res.benefitType ? `· ${res.benefitType}` : ""}</p>
              <p className="mt-2 leading-relaxed">{res.summary}</p>
              <p className="mt-3 text-base"><b>Reason given:</b> {res.reason}</p>
            </div>
            <div className="card bg-navy p-5 text-cream">
              <p className="text-xs uppercase tracking-wider text-cream/60">Amount SSA says is owed</p>
              <p className="mt-1 font-serif text-4xl text-amber">{res.amount || "Not found"}</p>
              {res.noticeDate && <p className="mt-2 text-base text-cream/70">Notice dated {res.noticeDate}</p>}
            </div>
          </div>
          {(() => { const n = Number(String(res.amount || "").replace(/[^0-9.]/g, "")); const small = n > 0 && n <= 2000;
            return <div className={`rounded-xl border-2 p-4 text-base ${small ? "border-sage bg-sage-100" : "border-navy/15 bg-white"}`} data-testid="phone-waiver">
              <b>{small ? "Good news: this may be fixable with a free phone call." : "Honest tip:"}</b> {small ? "For smaller overpayments (currently around $2,000 or less), SSA can often take a waiver request by phone, no form needed." : "Smaller overpayments (currently around $2,000 or less) can often be waived by phone for free."} Call SSA at 1-800-772-1213 and ask. You may not need to pay anyone. <a className="underline" href="/waiver-by-phone">How phone waivers work</a>.</div>; })()}
          <div className="card p-5">
            <h2 className="font-serif text-xl font-semibold">Key dates</h2>
            <ul className="mt-3 divide-y divide-navy/10">{res.keyDates?.map((k, i) => (
              <li key={i} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4"><span className="w-40 shrink-0 font-semibold text-rust">{k.date || "Check notice"}</span><span><b>{k.label}.</b> {k.note}</span></li>))}</ul>
            <p className="mt-2 text-xs text-navy/60">Verify every deadline on your notice and at ssa.gov.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">{res.options?.map((o) => {
            const rec = res.recommendedOption && o.name.toLowerCase().includes(res.recommendedOption.toLowerCase().split(" ")[1] || "~");
            return (<div key={o.name} className={`card p-5 ${rec ? "ring-2 ring-amber" : ""}`}>
              {rec && <span className="text-xs font-semibold uppercase text-rust">Likely fit</span>}
              <h3 className="font-semibold">{o.name}</h3><p className="text-xs text-navy/60">{o.form}</p>
              <p className="mt-2 text-base">{o.whenItFits}</p><p className="mt-2 text-xs text-navy/70">⏱ {o.deadlineNote}</p></div>);
          })}</div>
          <p className="text-base"><b>Why we suggest {res.recommendedOption}:</b> {res.recommendedReason}</p>
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold">Draft {res.letterType} letter <span className="ml-2 rounded bg-rust px-2 py-0.5 align-middle font-sans text-xs text-white">DRAFT</span></h2>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(res.letter); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="rounded-full border border-navy/20 px-4 py-2 text-base">{copied ? "Copied" : "Copy"}</button>
                <button onClick={download} className="rounded-full bg-navy px-4 py-2 text-base text-cream">Download .txt</button>
              </div>
            </div>
            <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border-l-4 border-amber bg-cream p-4 font-sans text-base">{res.letter}</pre>
            <p className="mt-2 text-xs text-navy/60">Review and fill every [PLACEHOLDER]. Send it with the official form, not instead of it. Not legal advice.</p>
          </div>
          <div className="rounded-2xl border-2 border-amber bg-amber-100 p-6" data-testid="next-steps">
            <h2 className="font-serif text-2xl">Ready to fight it?</h2>
            <p className="mt-1 text-base">Turn this into a waiver case: deadline countdowns, a hardship calculator, SSA-632 answers you can copy onto the form, and a printable packet.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => { try { sessionStorage.setItem("cs_prefill", JSON.stringify(res)); } catch {} window.location.href = "/cases/new"; }} className="btn-primary">Start my waiver case</button>
              <a href="/help" className="btn-ghost">Get help with my case (from $599)</a>
            </div>
          </div>
          {!!res.questionsToAsk?.length && <div className="card p-5"><h2 className="font-semibold">Questions to ask SSA</h2><ul className="mt-2 list-disc pl-5 text-base">{res.questionsToAsk.map((q) => <li key={q}>{q}</li>)}</ul></div>}
        </section>
      )}
    </div>
  );
}
