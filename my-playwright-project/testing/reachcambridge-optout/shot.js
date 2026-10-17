// Reach Cambridge — full-page desktop Chrome screenshots with Convert opted out / blocked.
const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = path.join(__dirname, 'screenshots');
require('fs').mkdirSync(OUT, { recursive: true });
const URL = 'https://www.reachcambridge.com/';

async function scrollAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });

  // 1) Recon: normal load — what Convert does
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let page = await ctx.newPage();
  const convReqs = [];
  page.on('request', r => { if (/convert/i.test(r.url())) convReqs.push(r.url()); });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => ({
    convertLoaded: typeof window.convert !== 'undefined',
    experiences: window.convert && window.convert.currentData ? JSON.stringify(window.convert.currentData.experiences || {}) : null,
    bodyClass: document.body.className,
    creClasses: [...document.querySelectorAll('[class*="cre-"]')].length,
  }));
  const cookies = (await ctx.cookies()).filter(c => /conv/i.test(c.name)).map(c => c.name + '=' + c.value);
  console.log('CONVERT REQUESTS:', convReqs);
  console.log('INFO:', info);
  console.log('CONVERT COOKIES (normal load):', cookies);
  await scrollAll(page);
  await page.screenshot({ path: path.join(OUT, '00-with-convert-desktop-fullpage.png'), fullPage: true });
  await ctx.close();

  // 2) Opt-out: fresh context (no cookies), _conv_optout param, Convert script blocked, conv cookies cleared
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route(/convertexperiments\.com|convert\.com/i, r => r.abort());
  page = await ctx.newPage();
  await page.goto(URL + '?_conv_optout=1', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  const keep = (await ctx.cookies()).filter(c => !/conv/i.test(c.name));
  await ctx.clearCookies(); await ctx.addCookies(keep);
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const info2 = await page.evaluate(() => ({
    convertLoaded: typeof window.convert !== 'undefined',
    bodyClass: document.body.className,
    creClasses: [...document.querySelectorAll('[class*="cre-"]')].length,
    height: document.body.scrollHeight,
  }));
  console.log('OPTOUT INFO:', info2);
  console.log('CONVERT COOKIES (opt-out):', (await ctx.cookies()).filter(c => /conv/i.test(c.name)).map(c => c.name));
  await scrollAll(page);
  await page.screenshot({ path: path.join(OUT, '01-convert-optout-desktop-fullpage.png'), fullPage: true });
  await page.screenshot({ path: path.join(OUT, '02-convert-optout-desktop-abovefold.png') });
  await browser.close();
})();
