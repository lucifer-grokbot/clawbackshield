import { redirect } from "next/navigation";
import { currentEmail } from "@/lib/auth";
import CaseIntake from "@/components/CaseIntake";
export const dynamic = "force-dynamic";
export const metadata = { title: "Start a waiver or appeal case | ClawbackShield" };
export default async function NewCase({ searchParams }: { searchParams: { from?: string; path?: string; for?: string } }) {
  if (!(await currentEmail())) redirect(`/login?next=${encodeURIComponent("/cases/new" + (() => { const q = new URLSearchParams(); for (const k of ["from", "path", "for"] as const) { const v = searchParams[k]; if (v) q.set(k, v); } const s = q.toString(); return s ? "?" + s : ""; })())}`);
  return <CaseIntake fromId={searchParams.from} />;
}
