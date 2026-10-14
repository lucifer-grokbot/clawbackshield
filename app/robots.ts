import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const u = process.env.URL || "http://localhost:3000"; return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account"] }, sitemap: `${u}/sitemap.xml` }; }
