import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const u = process.env.URL || "http://localhost:3000"; return ["", "/analyze", "/checklist", "/terms", "/privacy", "/login"].map((p) => ({ url: u + p })); }
