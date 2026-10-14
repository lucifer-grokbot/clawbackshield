import Link from "next/link";
export type Sec = { h: string; body: React.ReactNode };
const ALL = [
  ["/social-security-overpayment-waiver", "Social Security overpayment waiver"],
  ["/ssa-632-guide", "SSA-632 / SSA-632-BK guide"],
  ["/stop-overpayment-withholding", "Stop overpayment withholding"],
  ["/waiver-by-phone", "Waiver by phone (≤ $2,000)"],
];
export default function SeoPage({ path, eyebrow, title, lead, secs, updated = "October 2026" }: { path: string; eyebrow: string; title: string; lead: string; secs: Sec[]; updated?: string }) {
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: title, description: lead, dateModified: "2026-10-14", publisher: { "@type": "Organization", name: "ClawbackShield" }, mainEntityOfPage: path };
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-navy/60"><Link href="/" className="underline">Home</Link> / <span>{eyebrow}</span></nav>
      <p className="eyebrow mt-4">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-4 text-xl leading-relaxed text-navy/80">{lead}</p>
      <p className="mt-2 text-sm text-navy/60">Updated {updated} · Not legal advice · Not affiliated with SSA</p>
      <div className="mt-6 rounded-xl border-2 border-amber bg-amber-100 p-4 text-base"><b>Got a notice right now?</b> <Link href="/analyze" className="underline">Paste it in free</Link> and we&apos;ll show the amount, the deadlines and your options in plain English.</div>
      <div className="seo-body mt-8 space-y-8">{secs.map((s) => <section key={s.h}><h2 className="font-serif text-2xl font-medium">{s.h}</h2><div className="mt-2 space-y-3 text-lg leading-relaxed text-navy/90 [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc">{s.body}</div></section>)}</div>
      <div className="mt-10 rounded-2xl bg-navy p-6 text-cream"><h2 className="font-serif text-2xl">Want it done right, step by step?</h2><p className="mt-1 text-cream/80">Build the waiver, get a pause-withholding letter, and track it until SSA decides. $299 per case. Notice explanation is free.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link href="/cases/new" className="btn-primary">Start a case</Link><Link href="/pricing" className="rounded-full border border-cream/40 px-5 py-2.5">See pricing</Link></div></div>
      <aside className="mt-10"><h2 className="font-semibold">Related guides</h2><ul className="mt-2 space-y-1">{ALL.filter(([p]) => p !== path).map(([p, t]) => <li key={p}><Link className="underline" href={p}>{t}</Link></li>)}<li><Link className="underline" href="/guide">Free PDF waiver guide</Link></li></ul></aside>
      <p className="mt-8 text-sm text-navy/60">Sources: SSA form SSA-632-BK; SSA POMS GN 02250.350 and GN 02250.002; SSA EM-25029; 20 CFR 404.506 and 416.550. Rules change. Confirm on your notice and at <a className="underline" href="https://www.ssa.gov/manage-benefits/overpayments" target="_blank" rel="noreferrer">ssa.gov</a>.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </article>
  );
}
