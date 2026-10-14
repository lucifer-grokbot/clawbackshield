import type { MetadataRoute } from "next";
const PAGES = ["", "/analyze", "/pricing", "/guide", "/help", "/checklist", "/social-security-overpayment-waiver", "/ssa-632-guide", "/stop-overpayment-withholding", "/waiver-by-phone", "/terms", "/privacy", "/login"];
export default function sitemap(): MetadataRoute.Sitemap {
  const u = process.env.URL || "http://localhost:3000";
  return PAGES.map((p) => ({ url: u + p, lastModified: new Date("2026-10-14"), changeFrequency: "monthly", priority: p === "" ? 1 : p.startsWith("/s") || p === "/waiver-by-phone" || p === "/pricing" ? 0.8 : 0.5 }));
}
