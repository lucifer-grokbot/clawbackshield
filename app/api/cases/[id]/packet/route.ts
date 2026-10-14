import { NextResponse } from "next/server";
import { requireUser, notFound } from "@/lib/session";
import { getCase, hardship, deadlines, STATUS_LABEL } from "@/lib/cases";
import { ssa632Answers, filingInstructions, EVIDENCE, DISCLAIMER } from "@/lib/answers";
import { buildPdf, Block } from "@/lib/pdf";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const u = await requireUser(); if (u instanceof NextResponse) return u;
  const c = await getCase(u.email, params.id); if (!c) return notFound();
  if (!c.unlocked) return NextResponse.json({ error: "Unlock this case to download the packet.", purchase: true }, { status: 402 });
  const h = hardship(c); const d = deadlines(c); const $ = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const blocks: Block[] = [
    { h1: `Waiver case packet: ${c.beneficiary || "[Beneficiary]"}` },
    { box: DISCLAIMER },
    { p: `Overpayment: ${$(c.amount)}   Notice date: ${c.noticeDate}   Request: ${c.pathway === "both" ? "Waiver (SSA-632) and reconsideration (SSA-561)" : c.pathway === "waiver" ? "Waiver (SSA-632)" : "Reconsideration (SSA-561)"}   Status: ${STATUS_LABEL[c.status]}` },
    ...(d ? [{ h2: "Deadlines (verify on your notice)" }, ...d.items.map((i) => ({ p: `${i.label}: ${i.date} (${i.daysLeft >= 0 ? `${i.daysLeft} days left` : `${-i.daysLeft} days ago`}). ${i.note}` }))] : []),
    { h2: "What's inside" }, { p: "1. Cover letter   2. Why I was not at fault   3. Hardship statement   4. SSA-632 answer sheet   5. Hardship numbers   6. Evidence checklist   7. How to file" },
    { h1: "1. Cover letter" }, { p: c.drafts?.coverLetter || "[Generate drafts in your case to fill this section.]" },
    { h1: "2. Why I was not at fault" }, { p: c.drafts?.faultArgument || "[Generate drafts in your case to fill this section.]" },
    { h1: "3. Hardship statement" }, { p: c.drafts?.hardshipStatement || "[Generate drafts in your case to fill this section.]" },
    { h1: "4. SSA-632 answer sheet" }, { small: "Copy each answer onto the matching section of the current Form SSA-632 (download it from ssa.gov/forms/ssa-632.html). Section numbers can change, so match by topic." },
    ...ssa632Answers(c).flatMap((a) => [{ h2: `${a.topic}  (${a.where})` }, { p: a.answer }]),
    { h1: "5. Hardship numbers" },
    { p: `Monthly income: ${$(h.income)}\nMonthly necessary expenses: ${$(h.expenses)}\nIncome minus expenses: ${$(h.net)}${c.withholding ? `\nAfter SSA's withholding (${$(c.withholding)}): ${$(h.afterWithholding)}` : ""}\nAssets: ${$(h.assets)}\nHousehold size: ${c.finances.household}` },
    { p: h.text },
    { h1: "6. Evidence checklist" }, { check: EVIDENCE.map(([k, l]) => (c.evidence[k] ? "(gathered) " : "") + l) },
    { h1: "7. How to file" }, { check: filingInstructions(c) },
    { box: "Free help: your local legal aid office (lawhelp.org) or a Protection & Advocacy organization may help at no cost. You can also ask SSA for a personal conference before a waiver is denied." },
  ];
  try {
    const pdf = await buildPdf(`Waiver packet - ${c.beneficiary || "case"}`, blocks, "ClawbackShield DRAFT - not legal advice - not affiliated with SSA.");
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="waiver-packet-DRAFT-${c.id.slice(0, 8)}.pdf"`, "Cache-Control": "no-store" } });
  } catch (e) { console.error("[packet]", (e as Error).message); return NextResponse.json({ error: "We couldn't build the PDF. Please try again." }, { status: 500 }); }
}
