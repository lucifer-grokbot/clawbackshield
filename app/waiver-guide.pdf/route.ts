import { buildPdf } from "@/lib/pdf";
import { DISCLAIMER } from "@/lib/answers";
export const dynamic = "force-static";
export async function GET() {
  const pdf = await buildPdf("The Family Guide to SSA Overpayment Waivers", [
    { h1: "The Family Guide to SSA Overpayment Waivers" },
    { p: "A plain-English guide for families and caregivers who just opened a Social Security overpayment (\"clawback\") notice. Free from ClawbackShield." },
    { box: DISCLAIMER.replace("Review every answer", "Rules change: check everything") },
    { h2: "1. Don't panic. Find three things on the notice" },
    { check: ["The date printed on the notice (deadlines count from about 5 days after it).", "The overpayment amount and the months it covers.", "What SSA plans to withhold each month, and when it starts."] },
    { h2: "2. Know your two main tools" },
    { p: "WAIVER (Form SSA-632): ask SSA to forgive the debt. You must show (a) you were not at fault, AND (b) repaying would leave you unable to pay ordinary living expenses, or would be unfair. You can ask for a waiver at any time.\n\nRECONSIDERATION / APPEAL (Form SSA-561): say SSA got the facts or the amount wrong. Generally due within 60 days of receiving the notice.\n\nYou can do both. You can also ask for lower monthly withholding (Form SSA-634 in some cases) or a payment plan." },
    { h2: "3. Beat the 30-day clock" },
    { p: "If you ask for a waiver or an appeal within 30 days of receiving the notice, SSA usually won't start withholding until it decides. SSI notices may give only 10 days. If withholding already started, ask anyway and request that it stop or be reduced." },
    { h2: "4. Building the 'not at fault' argument" },
    { check: ["Did you report the change (work, income, living situation) to SSA? When, how, and to whom?", "Did SSA keep paying after you reported it? That is SSA's error.", "Did you rely on what an SSA employee told you?", "Did age, illness, disability, language or caregiving make the rules hard to understand?", "Did you get confusing or conflicting notices?"] },
    { h2: "5. Building the hardship case" },
    { p: "SSA compares your household's monthly income to your ordinary and necessary expenses: housing, utilities, food, medical, insurance, transportation, debts, care. If expenses use up most or all of your income, repayment likely causes hardship. List every expense, and back them with bills and bank statements." },
    { h2: "6. Evidence to gather" },
    { check: ["The full notice", "Proof of income (benefit letters, pay stubs, pension)", "3 months of bank statements", "Bills: rent/mortgage, utilities, medical, insurance", "Proof you reported changes (letters, receipts, call notes)", "Representative payee / power of attorney papers if you sign for someone"] },
    { h2: "7. How to file" },
    { check: ["Best: hand it in at your local SSA office and get a dated receipt (ssa.gov/locator).", "Or mail it certified with return receipt to the address on the notice.", "Fax only to a number your local office gives you; keep the confirmation.", "Keep copies of everything. Call 1-800-772-1213 after 2-3 weeks to confirm it's on file."] },
    { h2: "8. Where to get help" },
    { p: "Legal aid (lawhelp.org) and Protection & Advocacy organizations may help for free. ClawbackShield can build your case packet (SSA-632 answers, fault argument, hardship statement, cover letter and filing checklist): clawbackshield.netlify.app/analyze" },
  ], "ClawbackShield - free guide - not legal advice - not affiliated with SSA.");
  return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="ssa-overpayment-waiver-guide.pdf"' } });
}
