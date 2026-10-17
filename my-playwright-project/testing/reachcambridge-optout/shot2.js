// Reach Cambridge — Convert opt-out full-page desktop Chrome capture with real interaction (lazyJs needs mouse/scroll)
const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = path.join(__dirname, 'screenshots');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const blocked = [];
  await ctx.route(/convertexperiments\.com|convert\.com/i, r => { blocked.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  await page.goto('https://www.reachcambridge.com/?_conv_optout=1', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.mouse.move(400, 400); await page.mouse.move(700, 500);
  await page.waitForTimeout(4000);
  await page.locator('.cky-btn-reject').first().click({ timeout: 5000 }).catch(() => console.log('no cookie banner'));
  // remove any conv cookies, reload, interact again
  const keep = (await ctx.cookies()).filter(c => !/conv/i.test(c.name));
  await ctx.clearCookies(); await ctx.addCookies(keep);
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.mouse.move(400, 400); await page.mouse.move(700, 500);
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h + 900; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(250); }
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
  await page.locator('.cky-btn-reject, .cky-btn-customize ~ .cky-btn-reject').first().click({ timeout: 5000 }).catch(() => {});
  await page.evaluate(() => document.querySelectorAll('.cky-consent-container, .cky-overlay').forEach(e => e.remove()));
  await page.waitForTimeout(1000);
  console.log('blocked convert reqs:', blocked);
  console.log('state:', await page.evaluate(() => ({ convert: typeof window.convert, h: document.body.scrollHeight, cookieBanner: !!document.querySelector('.cky-consent-container:not(.cky-hide)') })));
  console.log('conv cookies:', (await ctx.cookies()).filter(c => /conv/i.test(c.name)).map(c => c.name));
  await page.screenshot({ path: path.join(OUT, 'reachcambridge-home-convert-optout-desktop-chrome-fullpage.png'), fullPage: true });
  await page.screenshot({ path: path.join(OUT, 'reachcambridge-home-convert-optout-desktop-chrome-abovefold.png') });
  await browser.close();
})();
