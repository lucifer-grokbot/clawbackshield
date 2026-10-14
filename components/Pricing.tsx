import Link from "next/link";
export const TIERS = [
  { n: "Free", p: "$0", d: "Understand the notice today.", f: ["Plain-English explanation", "Deadline tracker + hardship calculator", "Free PDF waiver guide"], href: "/analyze", cta: "Read my notice" },
  { n: "Waiver Case", p: "$299", s: "one-time, per case", d: "Everything to fight one clawback yourself.", f: ["SSA-632 answers to copy onto the form", "AI fault argument + hardship statement", "Cover letter + printable PDF packet", "After-filing tracker: call dates, decision log", "Letter asking SSA to pause withholding"], hi: true, href: "/cases/new", cta: "Start a case" },
  { n: "Notice Watch", p: "$19", s: "/mo", d: "Stay ahead of the next letter.", f: ["50 notice explanations a month", "Deadline + follow-up reminders on every case", "Cancel anytime"], href: "/account", cta: "Start Notice Watch" },
  { n: "Help with your case", p: "$599+", s: "per case", d: "Done with you, by a real person.", f: ["We prepare the paperwork with you", "Follow-up until SSA decides", "Quoted after a free review"], href: "/help", cta: "Request help" },
];
export default function Pricing({ heading = true }: { heading?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14" id="pricing">
      {heading && <><div className="flex items-baseline gap-3"><h2 className="font-serif text-4xl font-medium tracking-tight">Pricing</h2><span className="rounded bg-amber-100 px-2 py-0.5 text-sm font-semibold text-rust">Payments opening soon</span></div>
        <p className="mt-2 text-navy/80">Pay per case, not per month. A lawyer often costs $200–$400 an hour, if one will take it at all. <Link className="underline" href="/guide">Get the free PDF guide</Link>.</p></>}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <div key={t.n} className={`card flex flex-col p-6 ${t.hi ? "ring-2 ring-amber" : ""}`} data-testid="tier">
            {t.hi && <span className="mb-2 w-fit rounded-full bg-navy px-3 py-0.5 text-xs font-semibold text-amber">Most families</span>}
            <h3 className="font-semibold">{t.n}</h3>
            <p className="mt-2 font-serif text-4xl">{t.p}<span className="font-sans text-base text-navy/75">{t.s ? ` ${t.s}` : ""}</span></p>
            <p className="mt-2 text-base text-navy/80">{t.d}</p>
            <ul className="mt-4 flex-1 space-y-1 text-base">{t.f.map((x) => <li key={x}>✓ {x}</li>)}</ul>
            <Link href={t.href} className={`${t.hi ? "btn-primary" : "btn-ghost"} mt-5 justify-center !py-2.5`}>{t.cta}</Link>
          </div>
        ))}
      </div>
      <p className="mt-4 text-base text-navy/75">Small overpayment? Under about $2,000, SSA can often take a waiver request by phone, free. <Link className="underline" href="/waiver-by-phone">See if yours qualifies</Link> before you pay anyone.</p>
    </section>
  );
}
