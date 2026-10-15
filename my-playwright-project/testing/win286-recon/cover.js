// WIN286: is the badge actually on top on the shop page? Samples elementFromPoint at badge centre / close icon
// across scroll positions, and lists fixed bars near the bottom (sticky ATC). Same seeding as recon.js.
// Usage: node testing/win286-recon/cover.js [chromium|webkit] [desktop|mobile] [path]
const { chromium, webkit, devices } = require('playwright');
const path = require('path');

const [engine = 'chromium', form = 'mobile', p = '/pages/shop-winkbed'] = process.argv.slice(2);
const OUT = path.join(__dirname, 'out');
const BASE = 'https://www.winkbeds.com';
const force = (u) => `${BASE}${u}${u.includes('?') ? '&' : '?'}utm_campaign=Cro286mode&_conv_eforce=100350738.1003184956`;

(async () => {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch();
  const dev = form === 'mobile' ? devices[engine === 'webkit' ? 'iPhone 12' : 'Pixel 5'] : { viewport: { width: 1440, height: 900 } };
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await page.goto(`${BASE}/pages/sleep-calculator?utm_campaign=Cro286mode`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await fetch('/cart/clear.js', { method: 'POST' });
    await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: { 33210297426: 1 } }) });
  });
  // Already-dismissed returning user: badge cohort only.
  await ctx.addCookies(['cre286_modal_dismissed', 'cre286_badge_seen'].map((name) => ({ name, value: 'true', domain: 'www.winkbeds.com', path: '/', expires: Math.floor(Date.now() / 1000) + 86400 })));
  await page.goto(force(p), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.cre-t-286-side-button-container', { state: 'attached', timeout: 40000 });
  await page.waitForTimeout(2000);

  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const tag = `${engine}-${form}-${p.replace(/[^a-z0-9]+/gi, '_')}`;
  for (const y of [0, 600, 1200, 1800, 2600, 3600, 5000, 8000, H]) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const desc = (e) => e ? (e.tagName + (e.id ? '#' + e.id : '') + '.' + [...e.classList].slice(0, 2).join('.')) : null;
      const c = document.querySelector('.cre-t-286-side-button-container');
      if (!c) return { badge: 'GONE' };
      const b = c.querySelector('.cre-t-286-side-button').getBoundingClientRect();
      const x = c.querySelector('.cre-t-286-side-button-close').getBoundingClientRect();
      const top = (px, py) => { const e = document.elementFromPoint(px, py); return e && e.closest('.cre-t-286-side-button-container') ? 'BADGE:' + e.className : desc(e); };
      const bars = [...document.querySelectorAll('body *')].filter((e) => {
        const s = getComputedStyle(e); if (!/fixed|sticky/.test(s.position) || s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
        const q = e.getBoundingClientRect(); return q.width > 150 && q.height > 20 && q.bottom > innerHeight * 0.55 && q.top < innerHeight;
      }).map((e) => desc(e) + ' z' + getComputedStyle(e).zIndex + ' ' + [e.getBoundingClientRect().top, e.getBoundingClientRect().bottom].map(Math.round));
      return { y: scrollY, badgeCentre: top(b.left + b.width / 2, b.top + b.height / 2), badgeUpper: top(b.left + b.width / 2, b.top + 20),
        close: x.width ? top(x.left + x.width / 2, x.top + x.height / 2) : 'n/a', bars };
    });
    console.log(JSON.stringify(r));
    if ([1200, 3600].includes(y)) await page.screenshot({ path: `${OUT}/${tag}-y${y}.png` });
  }
  await browser.close();
})();
