// E2E for the Waiver Case Builder. BASE=http://localhost:3000 node test/e2e-cases.mjs   (live: BASE=https://clawbackshield.netlify.app LIVE=1)
import { chromium } from "playwright-core"; import fs from "fs"; import { execSync } from "child_process";
const BASE = process.env.BASE || "http://localhost:3000"; const LIVE = !!process.env.LIVE; const code = fs.readFileSync(".demo_code", "utf8").trim();
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] }); const R = {}; const shot = (p, n) => p.screenshot({ path: `shots/cases-${LIVE ? "live-" : ""}${n}.png`, fullPage: true });
async function step(name, fn) { const t = Date.now(); try { R[name] = { ok: true, ...(await fn()) , s: Math.round((Date.now() - t) / 1000) }; } catch (e) { R[name] = { ok: false, error: String(e.message).split("\n")[0].slice(0, 250) }; } }
const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
await step("demo-login", async () => { await p.goto(BASE + "/login?next=/analyze"); await p.click("text=Have a test code?"); await p.fill("#tc", code); await p.click("text=Sign in with test code"); await p.waitForURL("**/analyze"); await p.waitForLoadState("networkidle"); });
await step("analyze-to-case", async () => {
  await p.click("text=Try a sample notice"); await p.waitForFunction(() => document.querySelector("textarea").value.includes("SAMPLE"));
  await p.getByRole("button", { name: "Explain it" }).click(); await p.waitForSelector("[data-testid=next-steps]", { timeout: 90000 });
  await p.click("text=Start my waiver case"); await p.waitForURL("**/cases/new"); await p.waitForFunction(() => document.querySelector("#amt")?.value);
  return { prefill: { amount: await p.inputValue("#amt"), date: await p.inputValue("#nd"), name: await p.inputValue("#ben") } };
});
await step("intake", async () => {
  await shot(p, "intake-1"); await p.fill("#mb", "1412"); await p.fill("#wh", "706"); await p.click("text=Continue");
  await p.fill("#wh2", "My mother started a part-time job in March 2025 and told SSA by phone that month. SSA kept paying full benefits."); await p.click("label:has-text('Yes') >> nth=0");
  await p.fill("#rh", "Called 1-800-772-1213 on March 10, 2025; also mailed pay stubs in April 2025."); await p.fill("#se", "SSA did not adjust her benefits for 8 months after she reported the work.");
  await p.click("text=Continue");
  await p.fill("#inc-benefit", "1412"); await p.fill("#inc-wages", "400"); await p.fill("#exp-housing", "950"); await p.fill("#exp-utilities", "180"); await p.fill("#exp-food", "350"); await p.fill("#exp-medical", "220"); await p.fill("#exp-transport", "90"); await p.fill("#ast-checking", "600");
  const hb = await p.locator("[data-testid=hardship]").innerText(); await shot(p, "intake-3-calculator");
  await p.click("text=Continue"); await shot(p, "intake-4-review"); await p.click("text=Create my case"); await p.waitForURL(/\/cases\/[0-9a-f-]{36}/);
  return { calc: hb.replace(/\s+/g, " ").slice(0, 160) };
});
await step("tracker", async () => { await p.waitForSelector("[data-testid=deadline]"); const t = await p.locator("[data-testid=deadline]").allInnerTexts(); await shot(p, "case-locked-or-new"); return { deadlines: t.map((x) => x.replace(/\s+/g, " ").slice(0, 90)) }; });
await step("unlock-pro", async () => { await p.click("text=Unlock this case"); await p.waitForSelector("text=SSA-632 answer sheet"); });
await step("drafts", async () => { await p.click("text=Write my drafts"); await p.waitForSelector("text=Regenerate drafts", { timeout: 60000 }); const t = await p.locator("details[open] pre").first().innerText(); await shot(p, "case-unlocked"); return { draftStart: t.slice(0, 60) }; });
await step("post-filing", async () => {
  await p.locator("[data-testid=tracking]").scrollIntoViewIfNeeded(); await p.click("text=Mark as filed"); await p.waitForSelector("[data-testid=followup]");
  await p.fill("#cl", "Spoke to Ms. Lee. Waiver received, withholding paused."); await p.click("text=Save call"); await p.waitForSelector("text=Called SSA: Spoke to Ms. Lee");
  await p.click("[data-testid=pause-letter] summary"); const letter = await p.locator("[data-testid=pause-letter] pre").innerText();
  const tl = await p.locator("[data-testid=timeline]").innerText(); await p.locator("[data-testid=tracking]").screenshot({ path: `shots/${LIVE ? "live-" : ""}case-timeline.png` });
  await p.selectOption("#dout", "conference"); await p.click("text=Add to decision log"); await p.waitForSelector("text=Personal conference scheduled");
  return { timeline: tl.replace(/\s+/g, " ").slice(0, 160), letterHasRequest: letter.includes("stop recovering this overpayment"), followups: await p.locator("[data-testid=followup]").count() };
});
await step("pdf", async () => {
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("text=Download PDF packet")]); const f = `/tmp/packet${LIVE ? "-live" : ""}.pdf`; await dl.saveAs(f);
  const txt = execSync(`pdftotext ${f} -`).toString(); const pages = execSync(`pdfinfo ${f} | grep Pages`).toString().trim();
  execSync(`pdftoppm -png -r 50 -f 1 -l 1 ${f} shots/cases-${LIVE ? "live-" : ""}packet-p1`);
  return { pages, hasDisclaimer: (txt.match(/not legal advice/gi) || []).length, sections: ["Cover letter", "not at fault", "Hardship statement", "SSA-632 answer sheet", "Evidence checklist", "How to file"].filter((s) => txt.includes(s)).length + "/6" };
});
await step("tracking", async () => {
  await p.selectOption("#st", "sent"); await p.waitForSelector("text=Sent to SSA —, text=Sent to SSA", { timeout: 10000 }).catch(() => {});
  await p.check("text=Copy of the overpayment notice"); await p.fill("#nt", "Hand-delivered at local office, got receipt"); await p.click("text=Add note"); await p.waitForSelector("text=Hand-delivered at local office");
  await p.reload(); await p.waitForSelector("text=Hand-delivered at local office"); return { status: await p.inputValue("#st"), evidence: await p.isChecked("text=Copy of the overpayment notice") };
});
await step("cases-list", async () => { await p.goto(BASE + "/cases"); const t = await p.locator("body").innerText(); await shot(p, "list"); return { listed: t.includes("Sent to SSA") }; });
await step("help-form", async () => {
  if (LIVE) return { skipped: "live: avoid fake requests" };
  await p.goto(BASE + "/help"); await p.fill("#hn", "E2E Test"); await p.fill("#he", "e2e@example.com"); await p.click("text=Request help with my case"); const noConsent = await p.locator("text=not a law firm").count() && await p.locator("text=Please tick the box").innerText();
  await p.check("input[type=checkbox]"); await p.click("text=Request help with my case"); await p.waitForSelector("text=Request received"); await shot(p, "help"); return { noConsent };
});
await step("guide", async () => {
  await p.goto(BASE + "/guide"); await p.fill("#ge", LIVE ? "demo@clawbackshield.test" : "e2e-guide@example.com"); await p.click("text=Get the free PDF guide");
  await p.waitForSelector("text=Download the PDF guide"); const r = await p.request.get(BASE + "/waiver-guide.pdf"); const buf = await r.body(); fs.writeFileSync("/tmp/guide.pdf", buf);
  return { status: r.status(), type: r.headers()["content-type"], pages: execSync("pdfinfo /tmp/guide.pdf | grep Pages").toString().trim() };
});
if (!LIVE) {
  const c2 = await b.newContext(); const q = await c2.newPage();
  await step("free-user-locked+lite", async () => {
    const r = await q.request.post(BASE + "/api/auth/request", { data: { email: `free-${Date.now()}@example.com`, next: "/cases/new" } }); await q.goto((await r.json()).devLink);
    await q.fill("#nd", "2026-10-01"); await q.fill("#amt", "3000"); for (let i = 0; i < 3; i++) await q.click("text=Continue"); await q.click("text=Create my case"); await q.waitForSelector("[data-testid=locked]");
    const draft = await q.request.post(q.url().split("?")[0].replace("/cases/", "/api/cases/") + "/drafts"); const pdf = await q.request.get(q.url().split("?")[0].replace("/cases/", "/api/cases/") + "/packet");
    await shot(q, "free-locked"); await q.click("text=Unlock this case: $299"); await q.waitForSelector("text=case purchase went through"); await q.click("text=Unlock this case"); await q.waitForSelector("text=SSA-632 answer sheet");
    return { draftBeforeUnlock: draft.status(), pdfBeforeUnlock: pdf.status() };
  });
  await step("other-user-cannot-read", async () => { const id = new URL(p.url().includes("/cases/") ? p.url() : BASE).pathname; const list = await p.request.get(BASE + "/api/cases"); const mine = (await list.json()).cases[0].id; const r = await q.request.get(BASE + "/api/cases/" + mine); return { status: r.status() }; });
  await step("anon-api", async () => { const r = await (await b.newContext()).request.get(BASE + "/api/cases"); return { status: r.status() }; });
  const m = await b.newPage({ viewport: { width: 390, height: 844 } }); await step("mobile", async () => { await m.goto(BASE + "/help"); await shot(m, "mobile-help"); await m.goto(BASE + "/"); await m.locator("text=Waiver Case").first().scrollIntoViewIfNeeded(); await m.screenshot({ path: "shots/cases-mobile-pricing.png" }); });
}
console.log(JSON.stringify(R, null, 1)); await b.close();
