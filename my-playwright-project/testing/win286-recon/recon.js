// WIN286 live recon: seed Cohort 1, open Variation, dismiss, measure the badge, list fixed elements on the shop page.
// Usage: node testing/win286-recon/recon.js [chromium|webkit] [desktop|mobile]
const { chromium, webkit, devices } = require('playwright');
const path = require('path');

const [engine = 'chromium', form = 'desktop'] = process.argv.slice(2);
const OUT = path.join(__dirname, 'out');
const BASE = 'https://www.winkbeds.com';
const force = (p, v = '1003184956') => `${BASE}${p}?utm_campaign=Cro286mode&_conv_eforce=100350738.${v}`;
const PLAIN_TWIN = 33210297426;

(async () => {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch();
  const dev = form === 'mobile' ? devices[engine === 'webkit' ? 'iPhone 12' : 'Pixel 5'] : { viewport: { width: 1440, height: 900 } };
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  page.on('console', (m) => { const t = m.text(); if (/286|Activated/i.test(t)) console.log('  [console]', t.slice(0, 160)); });
  const tag = `${engine}-${form}`;

  await page.goto(`${BASE}/pages/sleep-calculator?utm_campaign=Cro286mode`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.evaluate(async (id) => {
    await fetch('/cart/clear.js', { method: 'POST' });
    await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: { [id]: 1 } }) });
  }, PLAIN_TWIN);
  await ctx.addCookies([{ name: 'cre_286_checkout_visited', value: 'true', domain: 'www.winkbeds.com', path: '/' }]);

  const t0 = Date.now();
  await page.goto(force('/'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => document.body.classList.contains('cre-t-286-modal-open'), null, { timeout: 40000 }).catch(() => console.log('NO MODAL'));
  console.log('modal after', (Date.now() - t0) / 1000, 's; body classes:', await page.evaluate(() => [...document.body.classList].filter((c) => /286/.test(c))));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${tag}-modal.png` });
  console.log('disclaimer:', await page.locator('.cre-t-286-cta__disclaimer').innerText().catch(() => null));

  await page.evaluate(() => document.querySelector('.cre-t-286-modal-close').click());
  await page.waitForTimeout(1500);
  const badge = await page.evaluate(() => {
    const c = document.querySelector('.cre-t-286-side-button-container');
    if (!c) return null;
    const r = c.getBoundingClientRect(), b = c.querySelector('.cre-t-286-side-button').getBoundingClientRect();
    const x = c.querySelector('.cre-t-286-side-button-close'), xr = x && x.getBoundingClientRect();
    return { vw: innerWidth, vh: innerHeight, container: [r.left, r.top, r.width, r.height], button: [b.left, b.top, b.width, b.height],
      bottomGapPct: +(((innerHeight - r.bottom) / innerHeight) * 100).toFixed(1), close: xr && [xr.left, xr.top, xr.width, xr.height],
      closeVisible: !!x && getComputedStyle(x).display !== 'none' && xr.width > 0, cookies: document.cookie.split('; ').filter((k) => /286/.test(k)) };
  });
  console.log('badge:', JSON.stringify(badge));
  await page.screenshot({ path: `${OUT}/${tag}-badge.png` });

  // Shop page: badge timing + fixed/sticky elements in view
  const t1 = Date.now();
  await page.goto(force('/pages/shop-winkbed'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  const nav = Date.now();
  await page.waitForSelector('.cre-t-286-side-button-container', { state: 'attached', timeout: 30000 }).catch(() => console.log('NO BADGE on shop'));
  console.log('shop: badge attached', (Date.now() - t1) / 1000, 's after goto start (DCL at', (nav - t1) / 1000, 's)');
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(2500);
  const fixed = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => {
    const s = getComputedStyle(e); if (!/fixed|sticky/.test(s.position) || s.display === 'none' || s.visibility === 'hidden') return false;
    const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
  }).map((e) => ({ sel: e.tagName + (e.id ? '#' + e.id : '') + '.' + [...e.classList].slice(0, 3).join('.'), z: getComputedStyle(e).zIndex, r: (({ left, top, width, height }) => [left, top, width, height].map(Math.round))(e.getBoundingClientRect()) })));
  console.log('fixed elements:', JSON.stringify(fixed));
  await page.screenshot({ path: `${OUT}/${tag}-shop.png` });
  await browser.close();
})();
