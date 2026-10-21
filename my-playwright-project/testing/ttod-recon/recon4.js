const { chromium, webkit, devices } = require('playwright');
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736';
(async () => {
  const which = process.argv[2] || 'chromium';
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  const ctx = await b.newContext(devices['iPhone 12']); const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.bm-two-ways', { timeout: 40000 }); await p.waitForTimeout(4000);
  console.log('inputs in hero', await p.evaluate(() => [...document.querySelector('[class*="pro-signup-hero_heroSection"]').querySelectorAll('input')].map(i => ({ ph: i.placeholder, type: i.type, vis: !!(i.offsetWidth || i.offsetHeight), w: i.offsetWidth, disp: getComputedStyle(i).display, parentHidden: !i.closest('[class]').offsetParent }))));
  console.log('pre', await p.evaluate(() => { const s = document.querySelector('.bm-two-ways'); return { expected: Math.round(s.getBoundingClientRect().top + pageYOffset), docH: document.documentElement.scrollHeight, sb: getComputedStyle(document.documentElement).scrollBehavior, scrollPad: getComputedStyle(document.documentElement).scrollPaddingTop }; }));
  await p.evaluate(() => { window.__log = []; let t0 = performance.now(); const s = document.querySelector('.bm-two-ways'); const iv = setInterval(() => { window.__log.push([Math.round(performance.now() - t0), Math.round(scrollY), Math.round(s.getBoundingClientRect().top + scrollY), document.documentElement.scrollHeight]); }, 150); setTimeout(() => clearInterval(iv), 3000); });
  await p.tap('.bm-hiw-bar__btn'); await p.waitForTimeout(3200);
  console.log('log [ms, scrollY, sectionAbsTop, docH]', JSON.stringify(await p.evaluate(() => window.__log)));
  // focus experiment
  await p.evaluate(() => { const h = document.querySelector('[class*="pro-signup-hero_heroSection"]'); const i = h.querySelector('input'); i.focus({ preventScroll: true }); window.__f = document.activeElement === i; });
  console.log('direct focus works?', await p.evaluate(() => window.__f));
  await b.close();
})();
