import { redirect } from "next/navigation";
import { currentEmail } from "@/lib/auth";
import CaseIntake from "@/components/CaseIntake";
export const dynamic = "force-dynamic";
export const metadata = { title: "Start a waiver case | ClawbackShield" };
export default async function NewCase({ searchParams }: { searchParams: { from?: string } }) {
  if (!(await currentEmail())) redirect(`/login?next=${encodeURIComponent("/cases/new" + (searchParams.from ? `?from=${searchParams.from}` : ""))}`);
  return <CaseIntake fromId={searchParams.from} />;
}
