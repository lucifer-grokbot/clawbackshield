export default function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <article className="mx-auto max-w-3xl px-5 py-12 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_p]:mt-3 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-6">
    <p className="eyebrow">Legal</p><h1 className="mt-2 font-serif text-4xl font-medium">{title}</h1><p className="text-navy/70">Last updated {updated}. Template text: have it reviewed by a lawyer before launch.</p>
    <div className="mt-6 rounded-lg border-2 border-rust bg-rust-100 p-5 font-semibold">ClawbackShield is not a law firm and does not give legal advice. We are not affiliated with the Social Security Administration. Using this site does not create an attorney-client relationship.</div>
    {children}</article>;
}
