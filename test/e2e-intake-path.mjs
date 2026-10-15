import { chromium } from "playwright-core"; import fs from "fs";
const BASE=process.env.BASE; const code=fs.readFileSync(".demo_code","utf8").trim();
const b=await chromium.launch({executablePath:"/usr/bin/google-chrome",args:["--no-sandbox"]}); const p=await (await b.newContext()).newPage();
await p.goto(BASE+"/cases/new?path=reconsideration"); await p.click("text=Have a test code?"); await p.fill("#tc",code); await p.click("text=Sign in with test code"); await p.waitForTimeout(6000); console.log("url", p.url(), (await p.textContent("main")).slice(0,300)); await p.waitForTimeout(1500);
console.log("checked:", await p.$eval("input[name=pw]:checked", e=>e.value), "chooserLink:", (await p.$$("a[href='/appeal-or-waiver']")).length>0); await b.close();
