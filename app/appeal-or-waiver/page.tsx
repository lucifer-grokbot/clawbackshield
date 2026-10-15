import type { Metadata } from "next";
import SeoPage from "@/components/SeoPage";
import Chooser from "@/components/Chooser";
import { SRC } from "@/lib/sources";
const path = "/appeal-or-waiver";
export const metadata: Metadata = { title: "SSA Overpayment: Appeal or Waiver? Free 1-Minute Chooser", description: "Should you appeal an SSA overpayment (SSA-561) or ask for a waiver (SSA-632)? Answer 5 quick questions and see which fits, with SSA sources.", alternates: { canonical: path }, openGraph: { title: "Appeal or waiver? 1-minute chooser", url: path } };
export default function Page() {
  return <SeoPage path={path} qa={[
  { q: "How do I appeal an SSA overpayment?", a: "File Form SSA-561, Request for Reconsideration, or a non-medical appeal online. SSA must get it in writing within 60 days after you receive the notice, which SSA assumes is 5 days after its date.", src: [SRC.form561, SRC.cfr404909, SRC.cfr404901] },
  { q: "When should I appeal instead of asking for a waiver?", a: "Appeal if you think you weren't overpaid or the amount is wrong. Ask for a waiver if the amount is right but it wasn't your fault and you can't afford to repay or repaying is unfair.", src: [SRC.overpayments] },
  { q: "Can I appeal and ask for a waiver at the same time?", a: "Yes. SSA's procedures cover a signed SSA-632-BK sent with a reconsideration request.", src: [SRC.poms025] },
  { q: "Is there a faster option for small overpayments?", a: "If the original overpayment is $2,000 or less and SSA can presume you weren't at fault, it can often take the waiver by phone.", src: [SRC.poms350] },
]} top={<Chooser />} eyebrow="Appeal or waiver?" title="Appeal or waiver? Find your path in one minute."
    lead="Five quick questions. We'll point you to the right SSA form, the deadline that matters, and the guide to follow. Free, no sign-up, nothing saved."
    secs={[
      { h: "The short version", body: <ul><li><b>Appeal (SSA-561):</b> &quot;You got it wrong.&quot; 60-day deadline (20 CFR 404.909, 416.1409).</li><li><b>Waiver (SSA-632-BK):</b> &quot;Right amount, but not my fault and I can&apos;t pay.&quot; No deadline (20 CFR 404.506, 416.550).</li><li><b>Either one within 30 days:</b> SSA says it won&apos;t collect until it decides.</li></ul> },
      { h: "Not legal advice", body: <p>This tool gives general information based on SSA&apos;s published rules. It isn&apos;t legal advice and doesn&apos;t decide your case. Your notice&apos;s dates control. When in doubt, call SSA at 1-800-772-1213 or free legal aid at <a href="https://www.lawhelp.org" target="_blank" rel="noreferrer">lawhelp.org</a>.</p> },
    ]} />;
}
