import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import { Reveal, Float, Underline } from "@/components/Motion";
const steps = [
  { n: "1", t: "Paste or upload", d: "Drop in the notice as text, a PDF, or a phone photo." },
  { n: "2", t: "See it plainly", d: "Amount, reason, and the dates that matter, in plain English." },
  { n: "3", t: "File and follow through", d: "Waiver packet, a pause-withholding letter, and reminders until SSA decides." },
];
export default function Home() {
  return (
    <>
      <section className="hero-mesh border-b border-navy/10">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <Reveal>
          <p className="eyebrow">For adult children handling a parent&apos;s benefits</p>
          <h1 className="mt-4 font-serif text-[2.6rem] font-medium leading-[1.05] tracking-[-0.02em] md:text-[3.6rem]">SSA is clawing back Mom&apos;s check? <span className="relative inline-block italic text-rust">Fight back.<Underline /></span></h1>
          <p className="mt-6 max-w-lg text-xl leading-relaxed text-navy/80">Many clawbacks start with SSA&apos;s own mistakes. We read the letter, build the waiver, and track it until SSA decides. You stay in control.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyze" className="btn-primary text-lg">Read the notice free →</Link>
            <Link href="/cases/new?for=parent" className="btn-ghost text-lg">I&apos;m helping a parent</Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-base text-navy/75"><li>✓ Not legal advice</li><li>✓ Not affiliated with SSA</li><li>✓ Notices aren&apos;t stored</li></ul>
        </Reveal>
        <Float><SamplePreview /></Float>
      </div>
    </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal><p className="eyebrow">Three calm steps</p><h2 className="mt-2 font-serif text-4xl font-medium tracking-tight">How it works</h2></Reveal>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.n} className="relative rounded-xl border border-navy/10 bg-cream p-7"><Reveal delay={i * 0.12}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-serif text-lg text-amber">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-navy/80">{s.d}</p>
                <StepArt i={i} />
              </Reveal></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-serif text-4xl font-medium tracking-tight">Built for the family member who opens the mail</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[["Adult children", "Mom's check just got cut in half. You're the one making the calls."], ["Spouses", "Juggling the household budget and SSA's letters."], ["Rep payees", "Managing benefits for someone else."], ["Beneficiaries", "Doing it yourself? It works for you too."]].map(([t, d]) => (
            <div key={t} className="card p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-base text-navy/80">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="checklist" className="bg-navy py-14 text-cream">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-serif text-4xl font-medium tracking-tight">Free: what to do when the notice arrives</h2>
          <p className="mx-auto mt-2 max-w-xl text-cream/75">A one-page checklist: first steps, the forms involved, and the windows to watch.</p>
          <div className="mx-auto mt-6 max-w-2xl"><SignupForm dark /></div>
          <p className="mt-3 text-sm text-cream/60">We only use your email to send the checklist and product updates. Unsubscribe anytime.</p>
        </div>
      </section>

      <Pricing />
      <Faq />

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-amber bg-amber-100 p-6">
            <h3 className="font-serif text-xl font-semibold">Important</h3>
            <p className="mt-2 text-base">This is <b>not legal advice</b>, and we are <b>not affiliated with the Social Security Administration</b>. Deadlines and rules vary by case: always verify on your notice and at <a className="underline" href="https://www.ssa.gov/manage-benefits/resolve-overpayment" target="_blank" rel="noreferrer">ssa.gov</a>.</p>
          </div>
          <div className="card p-6">
            <h3 className="font-serif text-xl font-semibold">Your privacy</h3>
            <p className="mt-2 text-base text-navy/75">Notices are sent to OpenRouter and processed by Google Gemini to produce your result; we don&apos;t save the notice text on our server. Waiver cases you create are saved to your account. See our <a className="underline" href="/privacy">privacy policy</a>. Tip: you can black out your Social Security number before uploading.</p>
          </div>
        </div>
      </section>
    </>
  );
}
function SamplePreview() {
  return (
    <div className="card relative p-6">
      <span className="absolute -top-3 right-5 rounded-full bg-navy px-3 py-1 text-sm font-semibold text-amber">Sample result</span>
      <p className="text-sm uppercase tracking-wider text-navy/70">Overpayment notice · SSDI</p>
      <p className="mt-1 font-serif text-3xl">$4,812.00</p>
      <p className="mt-2 text-base text-navy/75">SSA says work earnings in 2025 were reported late, so some monthly payments were too high.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-base">
        <div className="rounded-lg bg-amber-100 p-3"><p className="text-sm text-rust">Keep benefits unchanged</p><p className="font-semibold">Ask within ~30 days</p></div>
        <div className="rounded-lg bg-navy-50 p-3"><p className="text-sm text-navy/75">Appeal window</p><p className="font-semibold">Generally 60 days</p></div>
      </div>
      <div className="mt-4 space-y-2 text-base">
        <div className="flex justify-between rounded-lg border border-navy/10 px-3 py-2"><span>Waiver · SSA-632</span><span className="font-semibold text-rust">Suggested</span></div>
        <div className="flex justify-between rounded-lg border border-navy/10 px-3 py-2"><span>Reconsideration · SSA-561</span><span className="text-navy/70">Option</span></div>
      </div>
      <p className="mt-3 text-sm text-navy/70">Illustrative example, not a real case.</p>
    </div>
  );
}
function StepArt({ i }: { i: number }) {
  const common = "mt-5 h-16 w-full";
  if (i === 0) return (<svg className={common} viewBox="0 0 200 64"><rect x="60" y="4" width="56" height="56" rx="6" fill="#fff" stroke="#1B2A4A" strokeOpacity=".2"/><path d="M70 18h36M70 28h36M70 38h24" stroke="#1B2A4A" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round"/><circle cx="128" cy="44" r="12" fill="#E3A33B"/><path d="M128 50V38m-5 5 5-5 5 5" stroke="#1B2A4A" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>);
  if (i === 1) return (<svg className={common} viewBox="0 0 200 64"><rect x="40" y="6" width="120" height="52" rx="8" fill="#fff" stroke="#1B2A4A" strokeOpacity=".2"/><text x="52" y="30" fontFamily="Georgia" fontSize="16" fill="#1B2A4A">$4,812</text><rect x="52" y="38" width="44" height="10" rx="5" fill="#FBEFD9"/><rect x="102" y="38" width="44" height="10" rx="5" fill="#EEF1F7"/></svg>);
  return (<svg className={common} viewBox="0 0 200 64"><path d="M100 8v16M100 24 60 50M100 24v26M100 24l40 26" stroke="#1B2A4A" strokeOpacity=".35" strokeWidth="2.5" fill="none"/><circle cx="60" cy="52" r="8" fill="#EEF1F7"/><circle cx="100" cy="52" r="8" fill="#E3A33B"/><circle cx="140" cy="52" r="8" fill="#EEF1F7"/><circle cx="100" cy="8" r="6" fill="#1B2A4A"/></svg>);
}
