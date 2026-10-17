const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const reqs = [];
  page.on('request', r => { const u = r.url(); if (!/reachcambridge\.com\/wp-|\.(png|jpe?g|webp|svg|woff2?|gif)(\?|$)/.test(u)) reqs.push(u.slice(0, 140)); });
  await page.goto('https://www.reachcambridge.com/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  const before = reqs.length;
  await page.mouse.move(300, 300); await page.mouse.move(600, 400); await page.mouse.wheel(0, 600); await page.keyboard.press('Tab');
  await page.waitForTimeout(8000);
  console.log('AFTER INTERACTION:', reqs.slice(before).filter(u => !/reachcambridge/.test(u)));
  console.log('GLOBALS:', await page.evaluate(() => ({ convert: typeof window.convert, convData: window.convert && window.convert.currentData ? Object.keys(window.convert.currentData.experiences || {}) : null, gtm: !!window.google_tag_manager })));
  console.log('COOKIES:', (await ctx.cookies()).map(c => c.name));
  console.log('BODY:', await page.evaluate(() => document.body.className.match(/cre-[\w-]+/g)));
  await browser.close();
})();
