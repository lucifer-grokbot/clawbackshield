import type { Metadata } from "next";
import Link from "next/link";
import SeoPage from "@/components/SeoPage";
const path = "/stop-overpayment-withholding";
export const metadata: Metadata = { title: "How to Stop Social Security Overpayment Withholding (50% Rule)", description: "SSA can withhold 50% of Social Security checks for new overpayments. How to pause or lower withholding: waiver or appeal within 30 days, SSA-634, and refunds.", alternates: { canonical: path }, openGraph: { title: "Stop SSA overpayment withholding", url: path } };
export default function Page() {
  return <SeoPage path={path} eyebrow="Stop withholding" title="How to stop SSA from withholding the check"
    lead="For Social Security overpayment notices sent since April 25, 2025, SSA's default is to withhold 50% of the monthly check (SSI stays at 10%). You have real ways to pause or shrink that."
    secs={[
      { h: "The current rules", body: <ul><li><b>Social Security (retirement, survivors, SSDI):</b> default withholding is 50% of the monthly benefit for notices sent on or after April 25, 2025 (SSA EM-25029).</li><li><b>SSI:</b> default is 10% of monthly income.</li><li>Withholding usually starts after your appeal window, so you have time if you act fast.</li></ul> },
      { h: "1. Ask for a waiver or appeal within 30 days", body: <p>If you file a waiver (<Link href="/ssa-632-guide">SSA-632-BK</Link>) or an appeal (SSA-561) within 30 days of getting the notice, SSA generally won&apos;t start withholding until it decides. SSI notices may say 10 days. Check yours. Asking later still counts. Just ask SSA to stop recovery while it reviews.</p> },
      { h: "2. Send a pause request in writing", body: <p>Put it in writing: &quot;A waiver request was filed on [date]. Please stop recovery until it is decided and refund anything withheld since.&quot; Keep proof you sent it. ClawbackShield generates this letter from your case details.</p> },
      { h: "3. Ask for a lower monthly amount (SSA-634)", body: <p>If you&apos;ll repay some or all of it, use Form SSA-634 (Request for Change in Overpayment Recovery Rate) to ask for a smaller withholding based on your income and expenses. You can also ask by phone at 1-800-772-1213.</p> },
      { h: "4. Small overpayment? Ask for a phone waiver", body: <p>If the original overpayment is $2,000 or less and you weren&apos;t at fault, SSA can often waive it over the phone. See <Link href="/waiver-by-phone">waiver by phone</Link>.</p> },
      { h: "If money was already taken", body: <p>If SSA approves your waiver, ask it to refund what was withheld after you asked. Keep the decision letter and your records of what was taken.</p> },
      { h: "Get organized fast", body: <p><Link href="/analyze">Read your notice free</Link> to see your exact deadlines, then <Link href="/social-security-overpayment-waiver">learn how waivers work</Link>.</p> },
    ]} />;
}
