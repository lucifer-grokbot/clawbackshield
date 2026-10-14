import { redirect } from "next/navigation";
import { currentEmail } from "@/lib/auth";
import CaseView from "@/components/CaseView";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your waiver case | ClawbackShield" };
export default async function Page({ params, searchParams }: { params: { id: string }; searchParams: Record<string, string | undefined> }) {
  if (!(await currentEmail())) redirect(`/login?next=/cases/${encodeURIComponent(params.id)}`);
  return <CaseView id={params.id} flags={{ new: !!searchParams.new, purchased: searchParams.purchased === "lite", mock: !!searchParams.mock, payError: searchParams.error === "payments" }} />;
}
