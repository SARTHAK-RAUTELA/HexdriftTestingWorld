// Dump Convert POST payloads on a variation load with a saved Firmer cookie (no interaction) to see the goal format.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'cre-t-270-firmness', value: 'Firmer', domain: 'www.winkbeds.com', path: '/' }]);
  const p = await ctx.newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  p.on('request', (r) => { if (r.method() === 'POST' && /convertexperiments/.test(r.url())) console.log('POST', r.url(), '\n  ', (r.postData() || '').slice(0, 1500)); });
  await p.goto('https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.1003185233', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(15000);
  await b.close();
})();
