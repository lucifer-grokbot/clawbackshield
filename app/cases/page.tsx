import { redirect } from "next/navigation";
import Link from "next/link";
import { currentEmail } from "@/lib/auth";
import { listCases, deadlines, STATUS_LABEL } from "@/lib/cases";
export const dynamic = "force-dynamic";
export const metadata = { title: "My cases | ClawbackShield" };
export default async function Cases() {
  const email = await currentEmail(); if (!email) redirect("/login?next=/cases");
  const cases = await listCases(email);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Waiver case builder</p><h1 className="mt-2 font-serif text-4xl font-medium">My cases</h1></div>
        <Link href="/cases/new" className="btn-primary">Start a new case</Link></div>
      {cases.length === 0 ? (
        <div className="card mt-8 p-6"><p className="text-lg">No cases yet.</p><p className="mt-1 text-navy/80">Start from a notice you&apos;ve had explained (we fill in the details), or enter it yourself.</p>
          <div className="mt-4 flex flex-wrap gap-3"><Link href="/analyze" className="btn-ghost">Read my notice first</Link><Link href="/cases/new" className="btn-primary">Start a case</Link></div></div>
      ) : (
        <ul className="mt-8 space-y-4">{cases.map((c) => { const next = deadlines(c)?.items.find((i) => i.daysLeft >= 0);
          return <li key={c.id}><Link href={`/cases/${c.id}`} className="card block p-5 hover:ring-2 hover:ring-amber">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-serif text-2xl">{c.beneficiary || "Untitled case"}</p><span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-semibold">{STATUS_LABEL[c.status]}</span></div>
            <p className="mt-1 text-navy/80">${c.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} · notice {c.noticeDate} · {c.unlocked ? "Packet unlocked" : "Free tracker"}</p>
            {next && <p className={`mt-2 font-semibold ${next.daysLeft <= 7 ? "text-rust" : ""}`}>{next.daysLeft} days left: {next.label}</p>}
          </Link></li>; })}</ul>)}
    </div>
  );
}
