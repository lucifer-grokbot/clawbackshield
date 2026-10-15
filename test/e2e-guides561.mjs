// E2E for /ssa-561-reconsideration and /appeal-or-waiver. BASE=http://localhost:3000 node test/e2e-guides561.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:3000"; const LIVE = !!process.env.LIVE;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] }); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const R = []; const ok = (n, c, d = "") => R.push({ n, ok: !!c, d });
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(BASE + "/ssa-561-reconsideration"); ok("561 h1", (await p.textContent("h1")).includes("SSA-561"));
const ld = await p.$$eval("script[type='application/ld+json']", (s) => s.map((x) => JSON.parse(x.textContent)["@type"])); ok("561 jsonld FAQ+HowTo", ld.includes("FAQPage") && ld.includes("HowTo"), ld.join(","));
ok("561 quick answers", await p.isVisible("#quick-answers")); ok("561 not legal advice", (await p.content()).includes("Not legal advice"));
ok("561 cites CFR", (await p.$$("a[href*='404-0909']")).length > 0); ok("561 app CTA", (await p.$$("a[href='/cases/new?path=reconsideration']")).length > 0);
await p.screenshot({ path: `shots/${LIVE ? "live-" : ""}seo-ssa-561.png`, fullPage: true });
await p.goto(BASE + "/appeal-or-waiver"); ld.length = 0;
const ld2 = await p.$$eval("script[type='application/ld+json']", (s) => s.map((x) => JSON.parse(x.textContent)["@type"])); ok("chooser jsonld FAQ", ld2.includes("FAQPage"));
await p.click("text=See my path"); ok("friendly error", (await p.textContent("[role=alert]")).includes("Almost there"));
const pick = async (ans) => { await p.click("text=See my path").catch(()=>{}); const sb = p.locator("text=Start over"); if (await sb.count()) await sb.click(); for (const [q, v] of ans) await p.click(`label:has(input[name=${q}][value=${v}])`); await p.click("text=See my path"); return p.getAttribute("[data-testid=chooser-result]", "data-path"); };
ok("disagree+hardship → both", (await pick([["agree","no"],["fault","no"],["afford","no"],["small","no"],["time","yes"]])) === "both");
ok("disagree+at fault → recon", (await pick([["agree","no"],["fault","yes"],["afford","yes"],["small","no"],["time","yes"]])) === "reconsideration");
ok("agree small no fault → phone", (await pick([["agree","yes"],["fault","no"],["afford","no"],["small","yes"],["time","yes"]])) === "phone");
ok("agree big no fault → waiver", (await pick([["agree","yes"],["fault","no"],["afford","no"],["small","no"],["time","no"]])) === "waiver");
await pick([["agree","no"],["fault","no"],["afford","no"],["small","yes"],["time","no"]]); ok("late note shown", (await p.textContent("[data-testid=chooser-result]")).includes("good cause"));
await p.screenshot({ path: `shots/${LIVE ? "live-" : ""}seo-appeal-or-waiver.png`, fullPage: true });
await p.setViewportSize({ width: 390, height: 844 }); await p.screenshot({ path: `shots/${LIVE ? "live-" : ""}seo-appeal-or-waiver-mobile.png`, fullPage: true });
for (const [u, h] of [["/pricing", "/appeal-or-waiver"], ["/social-security-overpayment-waiver", "/ssa-561-reconsideration"], ["/ssa-632-guide", "/ssa-561-reconsideration"], ["/stop-overpayment-withholding", "/ssa-561-reconsideration"], ["/waiver-by-phone", "/ssa-561-reconsideration"]]) { await p.goto(BASE + u); ok(`link ${u}→${h}`, (await p.$$(`main a[href='${h}'], article a[href='${h}'], a[href='${h}']`)).length > 0); }
for (const f of ["/sitemap.xml", "/llms.txt", "/llms-full.txt"]) { const t = await (await p.request.get(BASE + f)).text(); ok(`${f} has both`, t.includes("ssa-561-reconsideration") && t.includes("appeal-or-waiver")); }
ok("no page errors", errs.length === 0, errs.join("|"));
await b.close(); const pass = R.filter((r) => r.ok).length; for (const r of R) console.log(r.ok ? "PASS" : "FAIL", r.n, r.d); console.log(`${pass}/${R.length}`);
