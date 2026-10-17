const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const reqs = [];
  page.on('request', r => { const u = r.url(); if (!/reachcambridge|cookieyes|\.(png|jpe?g|webp|svg|woff2?|gif)(\?|$)/.test(u)) reqs.push(u.slice(0, 140)); });
  await page.goto('https://www.reachcambridge.com/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.mouse.move(300, 300); await page.mouse.wheel(0, 300);
  await page.waitForTimeout(4000);
  const btn = page.locator('.cky-btn-accept').first();
  console.log('accept visible:', await btn.isVisible().catch(() => false));
  await btn.click({ timeout: 5000 }).catch(e => console.log('no click', e.message));
  await page.waitForTimeout(8000);
  console.log('REQS:', [...new Set(reqs)]);
  console.log('GLOBALS:', await page.evaluate(() => ({ convert: typeof window.convert, exps: window.convert && window.convert.currentData ? JSON.stringify(window.convert.currentData.experiences) : null })));
  console.log('COOKIES:', (await ctx.cookies()).map(c => c.name));
  await browser.close();
})();
