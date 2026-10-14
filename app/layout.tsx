import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import Nav, { Disclaimer } from "@/components/Nav";
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", axes: ["opsz", "SOFT"] });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });
const desc = "Plain-English help for Social Security overpayment notices: summary, deadlines, and a draft waiver or appeal letter. Not legal advice; not affiliated with SSA.";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "ClawbackShield: understand your SSA overpayment notice", template: "%s" }, description: desc,
  keywords: ["SSA overpayment", "Social Security clawback", "SSA-632 waiver", "SSA-561 reconsideration", "overpayment notice help"],
  openGraph: { title: "ClawbackShield", description: desc, type: "website", siteName: "ClawbackShield" }, twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-cream font-sans text-navy antialiased">
        <Nav />
        <main>{children}</main>
        <Disclaimer />
      </body>
    </html>
  );
}
