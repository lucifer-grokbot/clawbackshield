import type { MetadataRoute } from "next";
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];
export default function robots(): MetadataRoute.Robots {
  const u = process.env.URL || "http://localhost:3000";
  const disallow = ["/api/", "/account", "/cases"];
  return { rules: [{ userAgent: AI_BOTS, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow }, { userAgent: "*", allow: "/", disallow }], sitemap: `${u}/sitemap.xml` };
}
