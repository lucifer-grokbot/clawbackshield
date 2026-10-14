// Copy-onto-form answers for SSA-632 (we never fill SSA's PDF). Topics match the form's sections; numbering can change, so users match by topic.
import { Case, hardship, INCOME_FIELDS, EXPENSE_FIELDS, ASSET_FIELDS, deadlines, EVIDENCE } from "./casecore";
export const DISCLAIMER = "DRAFT - NOT LEGAL ADVICE. ClawbackShield is not a law firm and is not affiliated with SSA. Review every answer, check it against the current form at ssa.gov, and fill in every [PLACEHOLDER].";
const $ = (n: number) => { const v = Number(n) || 0; return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const yn = (v: string) => (v === "yes" ? "Yes" : v === "no" ? "No" : "[CHECK: Yes or No]");
export type Answer = { topic: string; where: string; answer: string };
export function ssa632Answers(c: Case): Answer[] {
  const h = hardship(c); const who = c.beneficiary || "[BENEFICIARY NAME]";
  const lines = (fields: [string, string][], m: Record<string, number>) => fields.filter(([k]) => m?.[k]).map(([k, l]) => `${l}: ${$(m[k])}`).join("\n") || "[NONE / ENTER AMOUNTS]";
  return [
    { topic: "Identifying information", where: "Top of the form", answer: `Name: ${who}\nSocial Security number: [ENTER SSN - do not share it with us]\nAmount of overpayment: ${$(c.amount)}\nType of benefit: ${c.benefitType || "[e.g. Social Security disability / retirement / SSI]"}` },
    { topic: "Why you think you were not at fault", where: "Fault section (why you believe you are not at fault)", answer: c.drafts?.faultArgument ? c.drafts.faultArgument.replace(/^DRAFT[^\n]*\n+/, "") : `[Generate the fault argument, or write in your own words.]\nWhat happened: ${c.fault.whatHappened || "[DESCRIBE]"}\nSSA's mistake: ${c.fault.ssaError || "[DESCRIBE]"}` },
    { topic: "Did you report the change to SSA?", where: "Fault section (reporting / changes)", answer: `${yn(c.fault.reportedChanges)}${c.fault.reportedHow ? `\nHow and when: ${c.fault.reportedHow}` : "\nHow and when: [DATE, office or phone, name of person you spoke to]"}` },
    { topic: "Did you understand the reporting rules?", where: "Fault section (understanding of rules)", answer: `${yn(c.fault.understoodRules)}${c.fault.otherCircumstances ? `\nExplanation: ${c.fault.otherCircumstances}` : ""}` },
    { topic: "Do you need your income for living expenses?", where: "Need for monthly income / hardship section", answer: `${h.net <= 0 || h.afterWithholding < 0 ? "Yes" : "[CHECK]"}. ${c.drafts?.hardshipStatement ? c.drafts.hardshipStatement.replace(/^DRAFT[^\n]*\n+/, "") : h.text}` },
    { topic: "Household members", where: "Household section", answer: `Number of people in household: ${c.finances.household}\n[LIST each person, relationship, and whether they have income]` },
    { topic: "Assets", where: "Assets section", answer: `${lines(ASSET_FIELDS, c.finances.assets)}\nTotal: ${$(h.assets)}` },
    { topic: "Monthly household income", where: "Income section", answer: `${lines(INCOME_FIELDS, c.finances.income)}\nTotal monthly income: ${$(h.income)}` },
    { topic: "Monthly household expenses", where: "Expenses section", answer: `${lines(EXPENSE_FIELDS, c.finances.expenses)}\nTotal monthly expenses: ${$(h.expenses)}\nIncome minus expenses: ${$(h.net)}${c.withholding ? `\nAfter SSA's withholding of ${$(c.withholding)}/month: ${$(h.afterWithholding)}` : ""}` },
    { topic: "Other circumstances", where: "Other information / remarks", answer: c.fault.otherCircumstances || "[Anything else SSA should know: illness, caregiving, SSA errors, prior notices]" },
  ];
}
export function filingInstructions(c: Case) {
  const d = deadlines(c);
  return [
    `Deadlines: ${d ? d.items.map((i) => `${i.label}: ${i.date}`).join("; ") : "[enter your notice date to calculate]"}. Verify on your notice.`,
    "Make copies of everything you send and keep them with this packet.",
    "IN PERSON (recommended): take the signed forms and copies of evidence to your local Social Security office (find it at ssa.gov/locator). Ask for a dated receipt showing what you handed in.",
    "BY MAIL: send to the address on your notice. Use certified mail with return receipt, and write the claim number on every page.",
    "BY FAX: only if your local office gives you a fax number. Keep the fax confirmation page. Call afterwards to confirm it was received.",
    "ONLINE: some requests can be started in my Social Security (ssa.gov/myaccount); keep a screenshot of the confirmation.",
    "If benefits are being withheld, ask SSA in writing to stop withholding while your waiver/appeal is reviewed, and to lower the monthly amount if it causes hardship (Form SSA-634 can apply).",
    "Call SSA at 1-800-772-1213 after 2-3 weeks to confirm your request is on file. Write down the date and the name of the person you spoke to.",
  ];
}
export { EVIDENCE };
