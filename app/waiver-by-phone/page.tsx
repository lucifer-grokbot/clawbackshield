import type { Metadata } from "next";
import Link from "next/link";
import SeoPage from "@/components/SeoPage";
import { SRC } from "@/lib/sources";
const path = "/waiver-by-phone";
export const metadata: Metadata = { title: "Social Security Overpayment Waiver by Phone ($2,000 or Less)", description: "If your Social Security or SSI overpayment is $2,000 or less and wasn't your fault, SSA can often waive it by phone with no form. Here's how to ask.", alternates: { canonical: path }, openGraph: { title: "Overpayment waiver by phone", url: path } };
export default function Page() {
  return <SeoPage path={path} qa={[
  { q: "Can SSA waive an overpayment by phone?", a: "Often, yes. If the original overpayment is $2,000 or less and SSA can presume you were not at fault, SSA can usually take the waiver request by phone with no SSA-632 form. The limit has changed over time, so ask.", src: [SRC.poms350] },
  { q: "What number do I call?", a: "Call SSA at 1-800-772-1213 (TTY 1-800-325-0778), or call or visit your local Social Security office.", src: [SRC.overpayments] },
  { q: "What if the amount is over $2,000?", a: "Use Form SSA-632-BK, the Request for Waiver of Overpayment Recovery. SSA can help you complete it.", src: [SRC.form632, SRC.poms350] },
]} howto={{ name: "Ask SSA for an overpayment waiver by phone", steps: ["Check that the original overpayment is $2,000 or less.", "Call SSA at 1-800-772-1213 (TTY 1-800-325-0778) or your local office.", "Say you want to request a waiver because the overpayment was not your fault.", "Write down the date, time, the name of the person you spoke to and what they said.", "Ask SSA to confirm the waiver in writing and to stop any withholding."] }} eyebrow="Waiver by phone" title="Overpayment of $2,000 or less? Try a free phone call first."
    lead="SSA can often waive small overpayments over the phone, with no SSA-632 form, if it can presume you weren't at fault. It's free. You may not need us or anyone else."
    secs={[
      { h: "Who this works for", body: <><ul><li>The <b>original</b> overpayment amount (not what's left) is <b>$2,000 or less</b>.</li><li>SSA can presume you weren&apos;t at fault (for example, you didn&apos;t hide anything and SSA didn&apos;t find fraud).</li><li>Works for both Social Security and SSI (SSA POMS GN 02250.350).</li></ul><p>The limit used to be $1,000 and has changed over time, so always ask.</p></> },
      { h: "How to ask", body: <ol><li>Call SSA at <b>1-800-772-1213</b> (TTY 1-800-325-0778), or call or visit your local office.</li><li>Say: &quot;I&apos;d like to request a waiver of my overpayment. The original amount is under $2,000 and it wasn&apos;t my fault.&quot;</li><li>Have the notice ready, and ideally the beneficiary on the line (or your representative payee / power of attorney details).</li><li>Write down the date, time, the person&apos;s name, and what they said.</li><li>Ask them to confirm the waiver in writing and to stop any withholding.</li></ol> },
      { h: "If they say you need the form", body: <p>If SSA can&apos;t presume you weren&apos;t at fault, or the amount is over $2,000, you&apos;ll need the full waiver: <Link href="/ssa-632-guide">Form SSA-632-BK</Link>. SSA can also help you complete it over the phone. If you think the amount itself is wrong, that&apos;s an <Link href="/ssa-561-reconsideration">SSA-561 appeal</Link>.</p> },
      { h: "Honest note from us", body: <p>For small, clear-cut cases, the phone call is usually the fastest and cheapest path. It&apos;s free. ClawbackShield is most useful for larger amounts, messy fault questions, or when you&apos;re handling it for a parent and need everything organized. Reading your notice with us is <Link href="/analyze">always free</Link>.</p> },
    ]} />;
}
