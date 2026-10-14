// Regenerate public/llms-full.txt from a running server: node scripts/llms-full.mjs [base]
import { writeFileSync } from "node:fs";
const base = process.argv[2] || "http://localhost:3000", SITE = "https://clawbackshield.netlify.app";
const pages = ["/", "/pricing", "/social-security-overpayment-waiver", "/ssa-632-guide", "/stop-overpayment-withholding", "/waiver-by-phone", "/guide", "/help"];
const text = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/g, "").replace(/<(h[1-3])[^>]*>/g, "\n\n## ").replace(/<(li|dt)[^>]*>/g, "\n- ").replace(/<(p|dd|div|section)[^>]*>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
let out = "# ClawbackShield: full text\n\n> Plain-English help for Social Security and SSI overpayment notices. Not a law firm, not legal advice, not affiliated with SSA. Official source: https://www.ssa.gov/manage-benefits/overpayments\n";
for (const p of pages) { const h = await (await fetch(base + p)).text(); const m = h.match(/<main[^>]*>([\s\S]*)<\/main>/); out += `\n\n---\n\n# ${SITE}${p}\n\n` + text(m ? m[1] : h); }
writeFileSync("public/llms-full.txt", out + "\n"); console.log(out.length);
