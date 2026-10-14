import HelpForm from "@/components/HelpForm";
export const metadata = { title: "Help with your case | ClawbackShield", description: "Done-with-you help preparing your SSA overpayment waiver. From $599." };
export default function Help() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="eyebrow">Help with your case</p>
        <h1 className="mt-2 font-serif text-4xl font-medium">We&apos;ll build the waiver with you</h1>
        <p className="mt-3 text-lg text-navy/85">For families who don&apos;t want to do it alone. A real person works through your case with you: we gather the facts and numbers, write the fault argument and hardship statement, prepare your SSA-632 answers and cover letter, and give you a step-by-step filing plan, then we follow up with you until SSA decides.</p>
        <p className="mt-4 font-serif text-3xl">From $599 <span className="font-sans text-base text-navy/70">per case, quoted after a free review</span></p>
        <ul className="mt-4 space-y-2 text-base"><li>✓ First 10 families handled personally by the founder</li><li>✓ Reply within 2 business days</li><li>✓ You stay in control: you review and sign everything</li><li>✓ No payment until you accept the quote</li></ul>
        <p className="mt-6 rounded-lg border-2 border-rust bg-rust-100 p-4 text-base">Not a law firm. Not legal advice. Not affiliated with SSA. For free legal help, contact your local legal aid office (<a className="underline" href="https://www.lawhelp.org" target="_blank" rel="noreferrer">lawhelp.org</a>).</p>
        <p className="mt-4 text-navy/80">Prefer to do it yourself? <a className="underline" href="/cases/new">Start a case</a>: the tracker and calculator are free, and the full case is $299.</p>
      </div>
      <HelpForm />
    </div>
  );
}
