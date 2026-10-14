// Probe a page that came back empty in recon: status, title, size, and section after a longer wait.
const { chromium } = require('@playwright/test');
const url = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const page = await ctx.newPage();
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (const t of [3000, 6000, 10000]) {
    await page.waitForTimeout(t === 3000 ? 3000 : 3000);
    const r = await page.evaluate(() => ({ title: document.title.slice(0, 60), len: document.documentElement.outerHTML.length,
      cr: !!document.querySelector('#case-results'), sec: document.querySelectorAll('.buckfire-12-client-stories').length,
      body: document.body.className.slice(0, 120), conv: typeof window.convert,
      exps: (() => { try { return Object.entries(window.convert.currentData.experiences).map(([k, v]) => k + ':' + (v.variation && v.variation.id)); } catch (e) { return null; } })() }));
    console.log(resp.status(), t, JSON.stringify(r));
  }
  await b.close();
})();
