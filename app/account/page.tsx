import { isLocal } from "@/lib/auth";
import { redirect } from "next/navigation";
import { currentEmail } from "@/lib/auth";
import { ensureUser, remaining, getHistory } from "@/lib/users";
import { PLANS, PlanId, LITE } from "@/lib/plans";
import { stripeOn } from "@/lib/stripe";
import { listCases } from "@/lib/cases";
import HistoryList from "@/components/HistoryList";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your account | ClawbackShield" };
export default async function Account({ searchParams }: { searchParams: { upgraded?: string; mock?: string; error?: string; purchased?: string } }) {
  const email = await currentEmail(); if (!email) redirect("/login?next=/account");
  const { user } = await ensureUser(email); const hist = await getHistory(email); const cases = await listCases(email); const p = PLANS[user.plan];
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Your account</p><h1 className="mt-2 font-serif text-4xl font-medium">{email}</h1></div>
        <form action="/api/auth/logout" method="post"><button className="btn-ghost !py-2">Sign out</button></form>
      </div>
      {searchParams.purchased === "lite" && <p className="mt-6 rounded-lg bg-sage-100 p-4">Thanks! You have a Lite credit to unlock a case.{searchParams.mock && " (Test purchase: payments not configured.)"}</p>}
      {searchParams.upgraded && <p className="mt-6 rounded-lg bg-sage-100 p-4">Thanks! You&apos;re on the {PLANS[searchParams.upgraded as PlanId]?.name} plan.{searchParams.mock && " (Test upgrade: payments not configured.)"}</p>}
      {searchParams.error && <p className="mt-6 rounded-lg bg-rust-100 p-4">Payments aren&apos;t available right now. Please try again later.</p>}
      <section className="card mt-8 p-6">
        <h2 className="font-serif text-2xl">Plan: {p.name}</h2>
        <p className="mt-1 text-navy/80">{remaining(user)} of {p.limit} analyses left {p.period === "month" ? "this month" : "in your pack"}.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <form action="/api/checkout" method="post" className="rounded-lg border border-navy/15 p-4">
            <input type="hidden" name="plan" value="lite" />
            <p className="font-semibold">{LITE.name} · {LITE.price}</p><p className="text-navy/80">Unlocks the full packet and tracker for one case. You have {user.caseCredits || 0} unused.</p>
            <button className="btn-primary mt-3 !py-2">Buy a case</button>
          </form>
          <form action="/api/checkout" method="post" className="rounded-lg border border-navy/15 p-4">
            <input type="hidden" name="plan" value="caregiver" />
            <p className="font-semibold">{PLANS.caregiver.name} · {PLANS.caregiver.price}</p><p className="text-navy/80">{PLANS.caregiver.limit} notice explanations a month, deadline and follow-up reminders on every case.</p>
            <button className="btn-primary mt-3 !py-2" disabled={user.plan === "caregiver"}>{user.plan === "caregiver" ? "Your plan" : "Start Notice Watch"}</button>
          </form>
        </div>
        {!stripeOn() && <p className="mt-3 text-sm text-navy/70">{isLocal() ? <>Test mode: Stripe isn&apos;t configured, so &quot;Choose&quot; upgrades instantly without payment (dev only).</> : <>Paid plans open soon. Payments aren&apos;t switched on yet.</>}</p>}
      </section>
      <section className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="font-serif text-2xl">Waiver cases</h2><p className="text-navy/80">{cases.length ? `${cases.length} case${cases.length > 1 ? "s" : ""}` : "Track deadlines, work out hardship and build your packet."}</p></div>
        <div className="flex gap-3"><a href="/cases" className="btn-ghost !py-2">My cases</a><a href="/cases/new" className="btn-primary !py-2">Start a case</a></div></section>
      <section className="mt-10"><h2 className="font-serif text-2xl">Your saved analyses</h2>
        {hist.length ? <HistoryList items={hist} /> : <p className="mt-3 text-navy/80">Nothing yet. <a className="underline" href="/analyze">Read your first notice</a>.</p>}
      </section>
    </div>
  );
}
