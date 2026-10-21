const { chromium, webkit, devices } = require('playwright');
const OUT = __dirname + '/func';
const BASE = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=';
const shot = (p, o) => p.screenshot({ ...o, timeout: 20000, animations: 'disabled', caret: 'initial' }).catch(() => console.log('shot fail', o.path.split('/').pop()));
const VAR = '5442504495988736', CTRL = '5870626836054016';
(async () => {
  const which = process.argv[2] || 'chromium';
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  for (const [dev, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', devices['iPhone 12']]].filter(d => !process.argv[3] || d[0] === process.argv[3])) {
    const tag = `${which}-${dev}`;
    // control hero for comparison
    let ctx = await b.newContext(opts); let p = await ctx.newPage();
    await p.goto('https://www.thumbtack.com/pro', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForSelector('[class*="pro-signup-hero_heroTitle"]', { timeout: 40000 }); await p.waitForTimeout(4000);
    console.log(tag, 'CONTROL', JSON.stringify(await p.evaluate(() => ({ bm: document.body.classList.contains('bm_preset_jobs_pro_lp'), bar: !!document.querySelector('.bm-hiw-bar'), h1: document.querySelector('[class*="pro-signup-hero_heroTitle"]').innerText }))));
    await shot(p, { path: `${OUT}/${tag}-control-hero.png`, timeout: 60000 }).catch(e => console.log('ctrl shot fail'));
    await ctx.close();

    ctx = await b.newContext(opts); p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => { if (!/insertAdjacentHTML|#418/.test(e.message)) errs.push(e.message.slice(0, 200)); });
    await p.goto(BASE + VAR, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForSelector('.bm-two-ways', { timeout: 40000 }); await p.waitForTimeout(3000);
    const res = {};
    // 1. bar click -> scroll to section
    await p.click('.bm-hiw-bar__btn'); await p.waitForTimeout(2000);
    res.barScroll = await p.evaluate(() => {
      const s = document.querySelector('.bm-two-ways'), t = document.querySelector('.bm-two-ways__title');
      const fixed = [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); if (!['fixed', 'sticky'].includes(c.position)) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.top < 120 && r.bottom > 0 && r.width > 200; }).map(e => (e.className || e.tagName).toString().slice(0, 40) + ' h=' + Math.round(e.getBoundingClientRect().bottom));
      return { scrollY: Math.round(scrollY), sectionTop: Math.round(s.getBoundingClientRect().top), titleTop: Math.round(t.getBoundingClientRect().top), topOverlays: fixed };
    });
    await shot(p, { path: `${OUT}/${tag}-after-bar-click.png` });
    // 2. Sign up for free in section
    await p.locator('.bm-two-ways__signup').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    res.signupCovered = await p.evaluate(() => { const b = document.querySelector('.bm-two-ways__signup').getBoundingClientRect(); const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return el && !el.closest('.bm-two-ways__signup') ? (el.className || el.tagName).toString().slice(0, 60) : 'not covered'; });
    await shot(p, { path: `${OUT}/${tag}-signup-in-view.png` });
    try { await p.click('.bm-two-ways__signup', { timeout: 5000 }); res.signupClick = 'ok'; } catch (e) { res.signupClick = 'BLOCKED: ' + e.message.split('\n')[0]; await p.evaluate(() => document.querySelector('.bm-two-ways__signup').click()); }
    await p.waitForTimeout(2000);
    res.afterSignup = await p.evaluate(() => { const h = document.querySelector('[class*="pro-signup-hero_heroSection"]'); const a = document.activeElement; return { scrollY: Math.round(scrollY), heroTop: Math.round(h.getBoundingClientRect().top), active: a.tagName + ' ' + (a.placeholder || a.getAttribute('aria-label') || ''), activeInHero: h.contains(a) }; });
    await shot(p, { path: `${OUT}/${tag}-after-signup-click.png` });
    // 3. keyboard: focus bar button and Enter
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
    await p.focus('.bm-hiw-bar__btn'); await p.keyboard.press('Enter'); await p.waitForTimeout(2000);
    res.keyboardEnter = await p.evaluate(() => Math.round(document.querySelector('.bm-two-ways').getBoundingClientRect().top));
    // 4. copy persistence after 12s
    await p.waitForTimeout(8000);
    res.persist = await p.evaluate(() => ({ h1: document.querySelector('[class*="pro-signup-hero_heroTitle"]').innerText, sub: document.querySelector('[class*="pro-signup-hero_heroSubhead"]').innerText, bars: document.querySelectorAll('.bm-hiw-bar').length, sections: document.querySelectorAll('.bm-two-ways').length }));
    // 5. hero form still works
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
    const inp = p.locator('[class*="pro-signup-hero_heroSection"] input').first();
    await inp.click(); await inp.fill(''); await p.keyboard.type('House cleaning', { delay: 60 }); await p.waitForTimeout(2500);
    await shot(p, { path: `${OUT}/${tag}-hero-typeahead.png` });
    const opt = p.locator('[class*="search-results_searchResult"]').first();
    res.typeaheadOptions = await p.locator('[class*="search-results_searchResult"]').count(); res.firstOption = res.typeaheadOptions ? await opt.innerText() : null;
    if (res.typeaheadOptions) { await opt.click(); await p.waitForTimeout(800); }
    const before = p.url();
    await p.locator('[class*="pro-signup-hero_heroSection"] button:visible', { hasText: /Sign up/ }).first().click();
    await p.waitForTimeout(6000);
    res.heroSubmit = { from: before.slice(0, 60), to: p.url().slice(0, 140) };
    await shot(p, { path: `${OUT}/${tag}-after-hero-submit.png` });
    res.errors = errs.filter(e => !/pure.cloud|graphql|ApolloError|Branch/.test(e));
    console.log(tag, 'VARIATION', JSON.stringify(res, null, 1));
    await ctx.close();
  }
  await b.close();
})();
