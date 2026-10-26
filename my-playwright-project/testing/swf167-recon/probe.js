// Interaction probe for SWF167 variation
const { chromium } = require('@playwright/test');
const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'out');
const V = 'https://petinsurancegurus.com{P}?cro_mode=qa&_conv_eforce=100052999.1000257733';
async function open(b, p = '/', dev = { viewport: { width: 1440, height: 900 } }) {
  const ctx = await b.newContext(dev); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 150)));
  await pg.goto(V.replace('{P}', p), { waitUntil: 'domcontentloaded' });
  await pg.waitForSelector('.cre-t-167-accordion_item', { state: 'attached', timeout: 30000 }).catch(() => {});
  await pg.waitForTimeout(2500);
  await pg.evaluate(() => document.querySelectorAll('.cre-t-133-overlay').forEach(e => e.remove()));
  return { ctx, pg, errs };
}
const state = pg => pg.evaluate(() => {
  const it = document.querySelector('.cre-t-167-accordion_item'); if (!it) return null;
  const h = it.querySelector('.cre-t-167-accordion_header'); const r = h.getBoundingClientRect();
  const svg = it.querySelector('svg');
  return { active: it.classList.contains('active'), aria: h.getAttribute('aria-expanded'), bodyDisp: getComputedStyle(it.querySelector('.oxy-pro-accordion_body')).display,
    hdrTop: Math.round(r.top), scrollY: Math.round(scrollY), hash: location.hash,
    iconTf: getComputedStyle(svg).transform, iconParentTf: getComputedStyle(svg.parentElement).transform,
    titleColor: getComputedStyle(it.querySelector('.oxy-pro-accordion_title')).color,
    openItems: [...document.querySelectorAll('.faq-container .oxy-pro-accordion_item.active')].map(i => i.querySelector('.oxy-pro-accordion_title').textContent.trim().slice(0, 30)),
    visibleBodies: [...document.querySelectorAll('.faq-container .oxy-pro-accordion_body')].filter(x => getComputedStyle(x).display !== 'none').length };
});
(async () => {
  const b = await chromium.launch(); const R = {};
  { const { ctx, pg, errs } = await open(b);
    await pg.click('.cre-t-167-donations a'); await pg.waitForTimeout(1800); R.fromTop = await state(pg);
    await pg.screenshot({ path: path.join(OUT, 'p-after-click-top.png') });
    await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(400);
    await pg.click('.cre-t-167-donations a'); await pg.waitForTimeout(1800); R.secondClick = await state(pg);
    await pg.click('.cre-t-167-accordion_header'); await pg.waitForTimeout(700); R.manualClose = await state(pg);
    await pg.click('.cre-t-167-accordion_header'); await pg.waitForTimeout(700); R.manualOpen = await state(pg);
    await pg.locator('.faq-container .oxy-pro-accordion_item:not(.cre-t-167-accordion_item):not(.cre-t-144-accordion_item) .oxy-pro-accordion_header').first().click(); await pg.waitForTimeout(900); R.nativeOpened = await state(pg);
    await pg.locator('.cre-t-144-accordion_item button').first().click().catch(e => R.e144 = e.message.slice(0, 80)); await pg.waitForTimeout(900); R.after144 = await state(pg);
    await pg.click('.cre-t-167-accordion_header'); await pg.waitForTimeout(900); R.reopen167 = await state(pg);
    await pg.screenshot({ path: path.join(OUT, 'p-open-faq.png') });
    await pg.dblclick('.cre-t-167-accordion_header'); await pg.waitForTimeout(900); R.dbl = await state(pg);
    if (R.dbl.active) { await pg.click('.cre-t-167-accordion_header'); await pg.waitForTimeout(700); }
    await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(400);
    await pg.focus('.cre-t-167-donations a'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(1800); R.keyboard = await state(pg);
    const code = fs.readFileSync(path.join(OUT, 'v-1000257733-0.js'), 'utf8').replace(/^function\(convertContext\)\{\s*/, '').replace(/\}\s*$/, '');
    await pg.evaluate(code); await pg.waitForTimeout(2500);
    R.dupe = await pg.evaluate(() => ({ items: document.querySelectorAll('.cre-t-167-accordion_item').length, navDon: document.querySelectorAll('.cre-t-167-donations').length, navText: [...document.querySelectorAll('.header-nav ul > li')].map(l => l.textContent.trim()) }));
    await pg.evaluate(() => scrollTo(0, 0)); await pg.click('.cre-t-167-donations a'); await pg.waitForTimeout(1800); R.afterDupeClick = await state(pg);
    R.errsA = errs; await ctx.close(); }
  { const { ctx, pg } = await open(b);
    await pg.evaluate(() => scrollTo(0, 3000)); await pg.waitForTimeout(600);
    R.navScrolled = await pg.evaluate(() => { const a = document.querySelector('.cre-t-167-donations a'); const r = a.getBoundingClientRect(); return { top: Math.round(r.top), vis: r.top >= 0 && r.bottom <= innerHeight }; });
    await pg.evaluate(() => scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(600);
    await pg.evaluate(() => document.querySelector('.cre-t-167-donations a').click()); await pg.waitForTimeout(2000); R.fromBottom = await state(pg);
    await ctx.close(); }
  for (const p of ['/home/', '/comparison/', '/compare/']) {
    const { ctx, pg, errs } = await open(b, p);
    R['url' + p] = await pg.evaluate(() => ({ canonical: document.querySelector('link[rel=canonical]')?.href, faqFirst: document.querySelector('.faq-container .oxy-pro-accordion_item h4')?.textContent.trim().slice(0, 40), nav: [...document.querySelectorAll('.header-nav ul > li')].map(l => l.textContent.trim()), body167: document.body.classList.contains('cre-t-167') }));
    if (R['url' + p].body167) { await pg.click('.cre-t-167-donations a'); await pg.waitForTimeout(1800); R['url' + p].click = await state(pg); }
    R['url' + p].errs = errs; await ctx.close();
  }
  for (const w of [320, 360, 375, 414, 768, 991, 1024]) {
    const { ctx, pg } = await open(b, '/', { viewport: { width: w, height: 800 }, isMobile: w < 768, hasTouch: w < 768 });
    R['w' + w] = await pg.evaluate(() => {
      const lis = [...document.querySelectorAll('.header-nav ul > li')].filter(l => l.offsetParent);
      const tops = lis.map(l => Math.round(l.getBoundingClientRect().top));
      return { items: lis.map(l => l.textContent.trim()), rows: new Set(tops).size, maxRight: Math.max(...lis.map(l => Math.round(l.getBoundingClientRect().right))), vw: innerWidth, docW: document.documentElement.scrollWidth, fs: lis.map(l => getComputedStyle(l.querySelector('a') || l).fontSize).join(',') };
    });
    await pg.screenshot({ path: path.join(OUT, `w${w}-nav.png`), clip: { x: 0, y: 0, width: w, height: 260 } });
    await ctx.close();
  }
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
