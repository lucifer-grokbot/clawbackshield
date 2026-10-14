// Pure case logic shared by server and browser (no Node imports).
export const STATUSES = ["intake", "drafting", "ready", "sent", "waiting", "decided"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  intake: "Getting details", drafting: "Drafting", ready: "Ready to send", sent: "Sent to SSA", waiting: "Waiting on SSA", decided: "Decision received",
};
export type Money = Record<string, number>;
export type Finances = { household: number; income: Money; expenses: Money; assets: Money };
export type Fault = { whatHappened: string; reportedChanges: "yes" | "no" | "unsure"; reportedHow: string; ssaError: string; understoodRules: "yes" | "no" | "unsure"; otherCircumstances: string };
export type Drafts = { faultArgument: string; hardshipStatement: string; coverLetter: string; generatedAt: string };
export type Case = {
  id: string; owner: string; createdAt: string; updatedAt: string;
  managingFor: "self" | "parent" | "spouse" | "other"; beneficiary: string; benefitType: string;
  noticeDate: string; amount: number; monthlyBenefit: number; withholding: number; reason: string;
  pathway: "waiver" | "reconsideration" | "both";
  fault: Fault; finances: Finances;
  status: Status; log: { at: string; status: Status; note?: string }[];
  evidence: Record<string, boolean>;
  drafts?: Drafts; unlocked: boolean; reminders: boolean; remindersSent: string[];
};

export const INCOME_FIELDS: [string, string][] = [["benefit", "Social Security / SSI (after withholding)"], ["wages", "Wages or self-employment"], ["pension", "Pension or retirement"], ["spouse", "Spouse / household member income"], ["other", "Other income (help from family, rent, etc.)"]];
export const EXPENSE_FIELDS: [string, string][] = [["housing", "Rent or mortgage (incl. property tax)"], ["utilities", "Utilities and phone"], ["food", "Food and household supplies"], ["medical", "Medical, dental, prescriptions"], ["insurance", "Insurance (health, car, home)"], ["transport", "Transportation / car payment"], ["debt", "Credit card and loan payments"], ["care", "Care, childcare or support paid"], ["other", "Other necessary expenses"]];
export const ASSET_FIELDS: [string, string][] = [["cash", "Cash on hand"], ["checking", "Checking accounts"], ["savings", "Savings, CDs, money market"], ["investments", "Stocks, bonds, retirement you can withdraw"], ["vehicles", "Value of extra vehicles (beyond one)"], ["property", "Property other than your home"]];
export const EVIDENCE: [string, string][] = [
  ["notice", "Copy of the overpayment notice (all pages)"],
  ["ssa632", "Completed Form SSA-632 (waiver) — signed and dated"],
  ["ssa561", "Form SSA-561 (reconsideration), if you are also appealing"],
  ["income", "Proof of income: benefit letters, pay stubs, pension statements"],
  ["bank", "Bank statements for the last 3 months"],
  ["bills", "Proof of expenses: rent/mortgage, utilities, medical bills, insurance"],
  ["reports", "Proof you reported changes to SSA (letters, receipts, call notes with date/name)"],
  ["medical", "Medical or other records that explain your situation (if relevant)"],
  ["poa", "Representative payee / power of attorney papers, if you sign for someone else"],
];

const sum = (m: Money) => Object.values(m || {}).reduce((a, b) => a + (Number(b) || 0), 0);
export function hardship(c: Pick<Case, "finances" | "withholding" | "monthlyBenefit">) {
  const income = sum(c.finances.income), expenses = sum(c.finances.expenses), assets = sum(c.finances.assets);
  const net = income - expenses; const afterWithholding = net - (c.withholding || 0);
  const level = net <= 0 ? "strong" : afterWithholding < 0 ? "likely" : net < 200 ? "possible" : "weak";
  const text = {
    strong: "Your necessary expenses meet or exceed your income. Repaying would likely leave you unable to meet basic needs. This supports a hardship request.",
    likely: "You have a little left each month, but the withholding SSA described would push you below your basic expenses. This supports a hardship request.",
    possible: "You have a small cushion each month. A hardship request may still succeed, especially with proof of expenses. A lower monthly withholding is another option.",
    weak: "Your income covers expenses with money left over. SSA may say repayment is affordable, so a fault argument or a smaller payment plan may matter more.",
  }[level];
  return { income, expenses, assets, net, afterWithholding, level, text };
}

const DAY = 864e5;
const addDays = (iso: string, n: number) => new Date(new Date(iso + "T12:00:00Z").getTime() + n * DAY);
export function deadlines(c: Pick<Case, "noticeDate">, now = new Date()) {
  if (!c.noticeDate || isNaN(new Date(c.noticeDate).getTime())) return null;
  const received = addDays(c.noticeDate, 5);
  const mk = (label: string, date: Date, note: string) => ({ label, date: date.toISOString().slice(0, 10), daysLeft: Math.ceil((date.getTime() - now.getTime()) / DAY), note });
  return {
    received: received.toISOString().slice(0, 10),
    items: [
      mk("Ask within 30 days to stop withholding", addDays(c.noticeDate, 35), "SSA assumes you got the notice 5 days after its date. Asking (waiver or appeal) within 30 days of receiving it usually keeps benefits from being cut while SSA decides. SSI notices often say 10 days — check yours."),
      mk("60-day appeal (reconsideration) deadline", addDays(c.noticeDate, 65), "Form SSA-561 must generally reach SSA within 60 days of receiving the notice. A waiver (SSA-632) can be asked for at any time."),
    ],
  };
}

