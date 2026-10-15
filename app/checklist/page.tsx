export const metadata = { title: "Checklist: what to do when you get an SSA overpayment notice" };
const items: [string, string][] = [
  ["Don't ignore it, and note the date you received it.", "Many time limits run from when you receive the notice. SSA generally assumes you got it 5 days after the date printed on it unless you show otherwise. Write the date on the envelope and keep it."],
  ["Read what SSA says happened.", "Find the amount, the period it covers, and the reason (for example: earnings, a change in living arrangements, or resources over a limit). Check each fact against your own records."],
  ["Decide: is the overpayment wrong, or right but unfair to repay?", "If you think SSA got the facts or the amount wrong, the usual route is a request for reconsideration (form SSA-561). If you agree it happened but it wasn't your fault and repaying would be a hardship or unfair, the usual route is a waiver request (form SSA-632). You can sometimes do both."],
  ["Watch the two windows.", "An appeal (reconsideration) generally must be requested within 60 days of receiving the notice. Acting quickly, often within about 30 days (10 days for some SSI notices), may keep SSA from reducing or stopping payments while it reviews. A waiver can generally be requested at any time, but asking early may pause collection. Your notice states the exact dates. Verify them on the notice and at ssa.gov."],
  ["If you owe it, ask about repayment terms.", "You can ask SSA for a payment plan or a smaller monthly withholding if the default amount would cause hardship. SSA may ask for income and expense details (for example form SSA-634)."],
  ["Gather proof.", "Pay stubs, bank statements, letters you sent SSA, and notes of phone calls (date, time, name of the person you spoke with). Proof that you reported changes matters for a waiver."],
  ["Submit in a way you can prove.", "File online where available, at a local office (ask for a receipt), or by mail with tracking. Keep copies of everything you send."],
  ["Get free help if you need it.", "Legal aid offices and protection & advocacy organizations often help with SSA overpayments at no cost. Your notice also lists SSA's phone number."],
];
export default function Checklist({ searchParams }: { searchParams: { welcome?: string } }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      {searchParams.welcome && <p className="mb-6 rounded-xl bg-amber-100 p-4 text-sm">Thanks! Here's your checklist. Bookmark this page or print it.</p>}
      <p className="text-xs font-semibold uppercase tracking-wider text-rust">Free checklist</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight">What to do when you get an SSA overpayment notice</h1>
      <p className="mt-3 text-navy/70">General information only, not legal advice. Rules change and every case differs. <b>Verify on ssa.gov</b> and on your notice.</p>
      <ol className="mt-8 space-y-4">
        {items.map(([t, d], i) => (
          <li key={i} className="card flex gap-4 p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-amber">{i + 1}</span>
            <div><h2 className="font-semibold">{t}</h2><p className="mt-1 text-sm text-navy/75">{d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-5 text-sm">
        <p className="font-semibold">Official sources</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><a className="underline" href="https://www.ssa.gov/manage-benefits/resolve-overpayment" target="_blank" rel="noreferrer">SSA: Overpayments</a></li>
          <li><a className="underline" href="https://www.ssa.gov/forms/ssa-561.html" target="_blank" rel="noreferrer">Form SSA-561: Request for Reconsideration</a></li>
          <li><a className="underline" href="https://www.ssa.gov/forms/ssa-632.html" target="_blank" rel="noreferrer">Form SSA-632: Request for Waiver of Overpayment Recovery</a></li>
          <li><a className="underline" href="https://www.ssa.gov/forms/ssa-634.html" target="_blank" rel="noreferrer">Form SSA-634: Request for Change in Overpayment Recovery Rate</a></li>
        </ul>
      </div>
      <a href="/analyze" className="mt-8 inline-block rounded-full bg-navy px-6 py-3 font-semibold text-cream">Read my notice →</a>
    </article>
  );
}
