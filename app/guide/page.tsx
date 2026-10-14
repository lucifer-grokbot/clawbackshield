import GuideForm from "@/components/GuideForm";
export const metadata = { title: "Free guide: SSA overpayment waivers | ClawbackShield", description: "A free plain-English PDF guide to fighting a Social Security overpayment: waiver (SSA-632), appeal (SSA-561), deadlines, evidence and filing." };
export default function Guide() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="eyebrow">Free PDF guide</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">The Family Guide to SSA Overpayment Waivers</h1>
      <p className="mt-3 text-lg text-navy/85">Eight short sections for the person who just opened the letter: the 30-day clock, waiver vs. appeal, how to show it wasn&apos;t your fault, how SSA judges hardship, what evidence to gather, and how to file so nothing gets lost.</p>
      <ul className="mt-5 grid gap-2 text-base sm:grid-cols-2">{["Find the 3 numbers that matter on the notice", "Waiver (SSA-632) vs. appeal (SSA-561)", "Stop withholding with the 30-day rule", "Build the 'not at fault' argument", "Show hardship with your monthly numbers", "Evidence checklist + how to file"].map((x) => <li key={x}>✓ {x}</li>)}</ul>
      <div className="card mt-8 p-6"><GuideForm /><p className="mt-3 text-sm text-navy/70">We&apos;ll also email occasional updates. Unsubscribe anytime. Not legal advice.</p></div>
    </div>
  );
}
