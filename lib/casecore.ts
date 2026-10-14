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
  tracking?: Tracking;
};
export const OUTCOMES = ["approved", "partial", "denied", "more-info", "conference"] as const;
export type Outcome = (typeof OUTCOMES)[number];
export const OUTCOME_LABEL: Record<Outcome, string> = { approved: "Waiver approved", partial: "Partly approved", denied: "Waiver denied", "more-info": "SSA asked for more information", conference: "Personal conference scheduled" };
export type Tracking = { filedAt?: string; filedHow?: string; calls: { at: string; note: string }[]; decisions: { at: string; date: string; outcome: Outcome; note?: string }[] };
export const emptyTracking = (): Tracking => ({ calls: [], decisions: [] });

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


/** Post-filing timeline: Filed -> Waiting -> Call SSA -> Decision, plus follow-up dates. */
export function tracking(c: Pick<Case, "tracking">, now = new Date()) {
  const t = c.tracking || emptyTracking(); const filed = t.filedAt && /^\d{4}-\d{2}-\d{2}$/.test(t.filedAt) ? t.filedAt : "";
  const final = t.decisions.find((d) => ["approved", "partial", "denied"].includes(d.outcome));
  const lastDec = t.decisions[0];
  const mk = (label: string, date: Date, note: string) => ({ label, date: date.toISOString().slice(0, 10), daysLeft: Math.ceil((date.getTime() - now.getTime()) / DAY), note });
  const items: ReturnType<typeof mk>[] = [];
  if (filed && !final) {
    items.push(mk("Call SSA to confirm they received it", addDays(filed, 14), "Call 1-800-772-1213 (or your local office). Ask them to confirm the waiver is on file and that withholding is paused. Write down the date and the name of the person."));
    items.push(mk("Follow up if there's no decision", addDays(filed, 45), "Call again and ask for the status. If withholding restarted, ask why and send the pause request letter again."));
    items.push(mk("Escalate if still waiting", addDays(filed, 90), "Ask for a supervisor, visit your local office, or ask your U.S. Representative's or Senator's office for casework help (it's free)."));
  }
  if (final && (final.outcome === "denied" || final.outcome === "partial")) items.push(mk("Appeal the denial (60 days)", addDays(final.date, 65), "You can ask for reconsideration (Form SSA-561) within 60 days of receiving the decision. If you never had a personal conference, ask for one."));
  const stage = final ? 3 : !filed ? -1 : t.calls.length || (items[0] && items[0].daysLeft <= 0) ? 2 : 1;
  const steps = [
    { key: "filed", label: "Filed", detail: filed ? `Sent ${filed}${t.filedHow ? ` by ${t.filedHow}` : ""}` : "Not sent yet" },
    { key: "waiting", label: "Waiting", detail: final ? "Done" : filed ? "SSA is reviewing. Withholding should be paused." : "Starts once you send it" },
    { key: "call", label: "Call SSA", detail: t.calls.length ? `${t.calls.length} call${t.calls.length > 1 ? "s" : ""} logged` : filed && items[0] ? `Due ${items[0].date}` : "About 2 weeks after filing" },
    { key: "decision", label: "Decision", detail: final ? OUTCOME_LABEL[final.outcome] : lastDec ? OUTCOME_LABEL[lastDec.outcome] : "Waiting" },
  ];
  return { filed, stage, steps, items, final: final || null };
}

/** Letter asking SSA to pause recovery while a waiver is pending. Deterministic template, no AI. */
export function pauseLetter(c: Pick<Case, "beneficiary" | "noticeDate" | "amount" | "withholding" | "benefitType" | "managingFor" | "tracking">, today = new Date()) {
  const t = c.tracking || emptyTracking(); const name = c.beneficiary || "[BENEFICIARY FULL NAME]";
  const ssi = /ssi|supplemental/i.test(c.benefitType || ""); const helper = c.managingFor !== "self";
  const amt = c.amount ? `$${Number(c.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "[AMOUNT]";
  const rel = c.managingFor === "parent" ? ", my parent" : c.managingFor === "spouse" ? ", my spouse" : "";
  return `${today.toISOString().slice(0, 10)}

Social Security Administration
[YOUR LOCAL SSA OFFICE ADDRESS - see the notice or ssa.gov/locator]

Re: Request to stop overpayment recovery while the waiver request is pending
Beneficiary: ${name}
Social Security number: [WRITE SSN ON THE PRINTED COPY ONLY]
Notice dated: ${c.noticeDate || "[NOTICE DATE]"}    Overpayment amount: ${amt}

To whom it may concern:

${helper ? `I am writing on behalf of ${name}${rel}. [STATE YOUR AUTHORITY: representative payee, power of attorney, or appointed representative (SSA-1696), if any.] ` : ""}A Request for Waiver of Overpayment Recovery (Form SSA-632) was ${t.filedAt ? `submitted on ${t.filedAt}${t.filedHow ? ` by ${t.filedHow}` : ""}` : "submitted on [DATE SENT]"}. A copy is enclosed.

I ask that SSA stop recovering this overpayment${c.withholding ? `, including the $${Number(c.withholding).toLocaleString("en-US")} withheld each month,` : ""} until a decision is made on the waiver request (waiver rules: ${ssi ? "20 CFR 416.550" : "20 CFR 404.506"}). If any amount has been withheld since the request was made, please refund it.

If SSA is considering denying the waiver, I ask for a personal conference before a decision is made.

Please confirm in writing that recovery has been suspended. I can be reached at [PHONE] or [EMAIL].

Sincerely,

[SIGNATURE]
${helper ? `[YOUR NAME], on behalf of ${name}` : name}

Enclosures: copy of the overpayment notice; copy of Form SSA-632 as submitted

---
DRAFT - not legal advice. Fill in every [PLACEHOLDER]. Keep a copy and proof of mailing or a fax receipt.`;
}
