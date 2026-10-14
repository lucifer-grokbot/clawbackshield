// E2E notice-input tests. Usage: BASE=http://localhost:3000 node test/e2e-notice.mjs [upload-txt upload-pdf upload-png paste email-guest email-signedin sample-link]
import { chromium } from "playwright-core";
import fs from "fs";
const BASE = process.env.BASE || "http://localhost:3000";
const resetLocal = () => { if (BASE.includes("localhost")) for (const f of fs.existsSync("data/kv") ? fs.readdirSync("data/kv") : []) if (f.startsWith("anon")) fs.unlinkSync("data/kv/" + f); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const results = {};
async function flow(name, fn, ctxOpts) {
  resetLocal(); const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage(); const t0 = Date.now();
  try {
    await p.goto(BASE + "/analyze"); await fn(p, ctx);
    const btn = p.getByRole("button", { name: "Explain it" });
    if (!(await btn.isEnabled())) throw new Error("Explain it still disabled");
    await btn.click();
    await Promise.race([p.waitForSelector("#result", { timeout: 90000 }), p.waitForSelector(".bg-amber-100", { timeout: 90000 }).then(async (e) => { throw new Error("UI error: " + (await e.innerText())); })]);
    const summary = (await p.locator("#result p.leading-relaxed").innerText()).slice(0, 140);
    const amount = await p.locator("#result .text-4xl").innerText();
    const status = await p.locator("[role=status]").innerText().catch(() => null);
    results[name] = { ok: true, secs: Math.round((Date.now() - t0) / 1000), amount, status, summary };
    await p.screenshot({ path: `shots/e2e-${name}.png`, fullPage: true });
  } catch (e) { results[name] = { ok: false, error: String(e.message).slice(0, 300) }; await p.screenshot({ path: `shots/e2e-${name}-fail.png`, fullPage: true }); }
  await ctx.close();
}
const want = process.argv.slice(2);
const T = {
  "upload-txt": (p) => p.setInputFiles("input[type=file]", "test/fixtures/sample-notice.txt"),
  "upload-pdf": (p) => p.setInputFiles("input[type=file]", "test/fixtures/sample-notice.pdf"),
  "upload-png": (p) => p.setInputFiles("input[type=file]", "test/fixtures/sample-notice.png"),
  "sample-link": async (p) => { await p.click("text=Try a sample notice"); await p.waitForFunction(() => document.querySelector("textarea").value.includes("SAMPLE")); },
  "paste": async (p) => { await p.uncheck("input[type=checkbox]"); await p.fill("textarea", fs.readFileSync("test/fixtures/sample-notice.txt", "utf8")); },
  "email-guest": async (p) => { await p.check("input[type=checkbox]"); await p.fill("textarea", fs.readFileSync("test/fixtures/sample-notice.txt", "utf8")); },
  "email-signedin": async (p) => {
    const r = await p.request.post(BASE + "/api/auth/request", { data: { email: `e2e-${Date.now()}@example.com`, next: "/analyze" } }); const d = await r.json();
    if (!d.devLink) throw new Error("no dev sign-in link (only available locally)");
    await p.goto(d.devLink); await p.goto(BASE + "/analyze"); await p.check("input[type=checkbox]"); await p.fill("textarea", fs.readFileSync("test/fixtures/sample-notice.txt", "utf8"));
  },
};
for (const k of want.length ? want : Object.keys(T)) await flow(k, T[k]);
console.log(JSON.stringify(results, null, 1)); await b.close();
