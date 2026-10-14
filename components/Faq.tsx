import Link from "next/link";
export const FAQS: { q: string; a: React.ReactNode; t: string }[] = [
  { q: "Is my overpayment small enough to fix with a phone call?", t: "Often, yes. SSA can usually take a waiver request by phone for smaller overpayments (currently around $2,000 or less; the limit has changed over time). Call 1-800-772-1213 and ask. It's free, and you may not need us at all.",
    a: <>Often, yes. SSA can usually take a waiver request by phone for smaller overpayments (currently around $2,000 or less; the limit has changed over time). Call 1-800-772-1213 and ask. It&apos;s free, and you may not need us at all. <Link className="underline" href="/waiver-by-phone">How phone waivers work</Link>.</> },
  { q: "Can I stop SSA from taking money out of the check?", t: "Usually. If you ask for a waiver or appeal within 30 days of getting the notice, SSA generally holds off on withholding until it decides. You can also ask for a lower monthly amount.",
    a: <>Usually. If you ask for a waiver or appeal within 30 days of getting the notice, SSA generally holds off on withholding until it decides. You can also ask for a lower monthly amount. <Link className="underline" href="/stop-overpayment-withholding">How to stop withholding</Link>.</> },
  { q: "I'm handling this for my mom or dad. Can I do it for them?", t: "Yes. Most families do. SSA may need your parent's signature on the form, or proof you're the representative payee or have power of attorney.",
    a: <>Yes. Most families do. SSA may need your parent&apos;s signature on the form, or proof you&apos;re the representative payee or have power of attorney. Turn on &quot;I&apos;m helping a parent&quot; when you <Link className="underline" href="/cases/new">start a case</Link>.</> },
  { q: "What's the difference between a waiver and an appeal?", t: "A waiver (Form SSA-632) says: even if the amount is right, it wasn't our fault and repaying would be a hardship or unfair. An appeal (reconsideration, Form SSA-561) says: the amount or facts are wrong. You can do both.",
    a: <>A waiver (<Link className="underline" href="/ssa-632-guide">Form SSA-632</Link>) says: even if the amount is right, it wasn&apos;t our fault and repaying would be a hardship or unfair. An appeal (reconsideration, Form SSA-561) says: the amount or facts are wrong. You can do both.</> },
  { q: "Are you lawyers? Do you file for me?", t: "No. ClawbackShield is not a law firm and isn't affiliated with SSA. We help you prepare and track your own request. You sign and send it. Free legal aid is at lawhelp.org.",
    a: <>No. ClawbackShield is not a law firm and isn&apos;t affiliated with SSA. We help you prepare and track your own request. You sign and send it. Free legal aid is at <a className="underline" href="https://www.lawhelp.org" target="_blank" rel="noreferrer">lawhelp.org</a>.</> },
  { q: "Why pay per case instead of monthly?", t: "Most families fight one notice. $299 covers that case from packet to decision. Notice Watch ($19/mo) is optional, for people who want ongoing reminders and explanations.",
    a: <>Most families fight one notice. $299 covers that case from packet to decision. Notice Watch ($19/mo) is optional, for people who want ongoing reminders and explanations.</> },
];
export default function Faq() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.t } })) };
  return (
    <section className="mx-auto max-w-3xl px-5 py-14" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h" className="font-serif text-4xl font-medium tracking-tight">Questions families ask</h2>
      <div className="mt-6 space-y-3">{FAQS.map((f) => <details key={f.q} className="card p-5"><summary className="cursor-pointer text-lg font-semibold">{f.q}</summary><p className="mt-2 text-base text-navy/85">{f.a}</p></details>)}</div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </section>
  );
}
