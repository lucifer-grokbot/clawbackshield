import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
export const metadata: Metadata = { title: "Pricing: $299 per case | ClawbackShield", description: "Fight a Social Security overpayment for $299 per case. Free notice explanation, optional $19/mo Notice Watch, or done-with-you help.", alternates: { canonical: "/pricing" } };
export default function Page() {
  return (<>
    <div className="mx-auto max-w-6xl px-5 pt-12"><p className="eyebrow">Pricing</p><h1 className="mt-2 font-serif text-5xl font-medium tracking-tight">One clawback. One price.</h1><p className="mt-3 max-w-2xl text-xl text-navy/80">Start free. Pay $299 when you want the full case, from packet to SSA&apos;s decision.</p></div>
    <Pricing heading={false} /><Faq />
  </>);
}
