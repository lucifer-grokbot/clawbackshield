import Link from "next/link";
import Logo from "./Logo";
export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-navy/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" aria-label="ClawbackShield home"><Logo /></Link>
        <nav className="flex items-center gap-5">
          <Link href="/pricing" className="hidden font-medium text-navy/80 underline-offset-4 hover:underline md:inline">Pricing</Link>
          <Link href="/guide" className="hidden font-medium text-navy/80 underline-offset-4 hover:underline md:inline">Free guide</Link>
          <Link href="/cases" className="hidden font-medium text-navy/80 underline-offset-4 hover:underline sm:inline">My cases</Link>
          <Link href="/account" className="font-medium text-navy/80 underline-offset-4 hover:underline">Account</Link>
          <Link href="/analyze" className="btn-primary !px-5 !py-2.5">Read my notice</Link>
        </nav>
      </div>
    </header>
  );
}
export function Disclaimer() {
  return (
    <footer className="bg-navy text-cream/85">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-[auto_1fr]">
        <Logo light />
        <div className="text-base">
          <p className="font-semibold text-amber">Not legal advice. Not affiliated with the Social Security Administration (SSA).</p>
          <p className="mt-1">ClawbackShield is an independent information tool. Always confirm deadlines and forms on <a className="underline" href="https://www.ssa.gov" target="_blank" rel="noreferrer">ssa.gov</a>, or talk to a qualified attorney or legal aid office.</p>
          <p className="mt-2"><a className="underline" href="/terms">Terms of service</a> · <a className="underline" href="/privacy">Privacy policy</a></p>
          <p className="mt-2 text-cream/70">Privacy: notices you submit are sent to OpenRouter and processed by Google Gemini to produce your result. We don't save the notice itself. Waiver cases you create (your answers, numbers and drafts) are saved to your account until you delete them.</p>
          <p className="mt-2"><a className="underline" href="/guide">Free PDF guide</a> · <a className="underline" href="/help">Help with your case</a> · <a className="underline" href="/cases">My cases</a> · <a className="underline" href="/pricing">Pricing</a></p>
          <p className="mt-2"><a className="underline" href="/social-security-overpayment-waiver">Overpayment waiver</a> · <a className="underline" href="/ssa-632-guide">SSA-632 guide</a> · <a className="underline" href="/stop-overpayment-withholding">Stop withholding</a> · <a className="underline" href="/waiver-by-phone">Waiver by phone</a></p>
        </div>
      </div>
    </footer>
  );
}
