// Round-2 functional checks: bar scroll landing, section CTA, hero inputs, typeahead, persistence, errors
const { chromium, webkit, devices } = require('playwright');
const OUT = __dirname + '/shots';
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736';
const shot = (p, path, o = {}) => p.screenshot({ path: `${OUT}/${path}`, timeout: 20000, animations: 'disabled', ...o }).catch(() => console.log('shot fail', path));
const sectionTop = p => p.evaluate(() => Math.round(document.querySelector('.bm-two-ways').getBoundingClientRect().top));
(async () => {
  const which = process.argv[2] || 'chromium';
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  const devs = [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', devices['iPhone 12']]].filter(d => !process.argv[3] || d[0] === process.argv[3]);
  for (const [dev, opts] of devs) {
    const tag = `${which}-${dev}`;
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
    await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(4000);
    const res = {};

    // BUG-01: hero inputs
    res.inputs = await p.evaluate(() => [...document.querySelectorAll('[class*="pro-signup-hero_searchFields"] [class*="TextInput_inputStyles"]')].filter(e => e.getClientRects().length).map(e => {
      const c = getComputedStyle(e); const r = e.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)} bg ${c.backgroundColor} bd ${c.borderTopWidth} ${c.borderTopColor} rad ${c.borderTopLeftRadius}/${c.borderTopRightRadius}`;
    }));
    res.inputInner = await p.evaluate(() => [...document.querySelectorAll('[class*="pro-signup-hero_searchFields"] input')].filter(e => e.getClientRects().length).map(e => {
      const icon = e.parentElement.parentElement.querySelector('[class*="TextInput_inputIconContainer"]');
      return getComputedStyle(e).backgroundColor + ' / icon ' + (icon ? getComputedStyle(icon).backgroundColor : '-');
    }));
    const sf = await p.$('[class*="pro-signup-hero_searchFields"]');
    if (sf) await sf.screenshot({ path: `${OUT}/${tag}-inputs.png`, timeout: 20000 }).catch(() => {});

    // Bar markup: only the CTA is a button now
    res.bar = await p.evaluate(() => {
      const btn = document.querySelector('.bm-hiw-bar__cta'); const wrap = document.querySelector('.bm-hiw-bar__btn');
      return { ctaTag: btn && btn.tagName, wrapTag: wrap.tagName, wrapCursor: getComputedStyle(wrap).cursor, ctaCursor: btn && getComputedStyle(btn).cursor };
    });
    await p.click('.bm-hiw-bar__text'); await p.waitForTimeout(1500);
    res.textClickScrollY = await p.evaluate(() => Math.round(scrollY));
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);

    // BUG-02: CTA click landing, sampled over 4s
    await p.click('.bm-hiw-bar__cta');
    const samples = [];
    for (let i = 0; i < 16; i++) { await p.waitForTimeout(250); samples.push(await sectionTop(p)); }
    res.barLanding = samples;
    res.barFixedTop = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
      const c = getComputedStyle(e); if (!['fixed', 'sticky'].includes(c.position)) return false;
      const r = e.getBoundingClientRect(); return r.height > 0 && r.top < 120 && r.bottom > 0 && r.width > 200;
    }).map(e => (e.className || e.tagName).toString().slice(0, 40) + ' b=' + Math.round(e.getBoundingClientRect().bottom)));
    await shot(p, `${tag}-after-bar-click.png`);
    for (const key of ['Enter', 'Space']) {
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
      await p.focus('.bm-hiw-bar__cta'); await p.keyboard.press(key); await p.waitForTimeout(4000);
      res['kb' + key] = await sectionTop(p);
    }

    // BUG-03: section "Sign up for free" with empty hero fields
    await p.locator('.bm-two-ways__signup').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    res.signupCovered = await p.evaluate(() => {
      const b = document.querySelector('.bm-two-ways__signup').getBoundingClientRect();
      const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return el && !el.closest('.bm-two-ways__signup') ? (el.className || el.tagName).toString().slice(0, 60) : 'not covered';
    });
    await shot(p, `${tag}-signup-in-view.png`);
    const urlBefore = p.url();
    await p.evaluate(() => {
      window.__clicks = [];
      document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b) window.__clicks.push((b.innerText || b.className.toString()).trim().slice(0, 30) + (e.isTrusted ? '' : ' (synthetic)')); }, true);
    });
    try { await p.click('.bm-two-ways__signup', { timeout: 5000 }); } catch (e) { res.signupClickBlocked = e.message.split('\n')[0]; await p.evaluate(() => document.querySelector('.bm-two-ways__signup').click()); }
    const trail = [];
    for (let i = 0; i < 12; i++) { await p.waitForTimeout(500); trail.push(await p.evaluate(() => { const h = document.querySelector('[class*="pro-signup-hero_heroSection"]'); return h ? Math.round(h.getBoundingClientRect().top) : 'nav'; }).catch(() => 'nav')); }
    res.signupHeroTopTrail = trail;
    res.afterSignup = await p.evaluate(() => {
      const h = document.querySelector('[class*="pro-signup-hero_heroSection"]'); const a = document.activeElement;
      const msgs = [...document.querySelectorAll('[class*="rror"], [role="alert"], [aria-invalid="true"]')].filter(e => e.getClientRects().length && (e.innerText || '').trim()).map(e => e.innerText.trim().slice(0, 80));
      return { scrollY: Math.round(scrollY), active: a.tagName + ' ' + (a.placeholder || a.getAttribute('aria-label') || a.innerText || '').slice(0, 40), activeInHero: h ? h.contains(a) : null, clicks: window.__clicks, messages: msgs, typeaheadOpen: document.querySelectorAll('[class*="search-results_searchResult"]').length };
    }).catch(() => ({ navigated: true }));
    res.urlAfterSignup = p.url() !== urlBefore ? p.url().slice(0, 160) : 'unchanged';
    await shot(p, `${tag}-after-signup-click.png`);

    // Section CTA with a service already chosen in the hero
    await p.goto(URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(3000);
    let inp = p.locator('[class*="pro-signup-hero_heroSection"] input:visible').first();
    await inp.click(); await p.keyboard.type('House cleaning', { delay: 60 }); await p.waitForTimeout(2500);
    res.typeahead = await p.locator('[class*="search-results_searchResult"]').count();
    await shot(p, `${tag}-typeahead.png`);
    if (res.typeahead) { await p.locator('[class*="search-results_searchResult"]').first().click(); await p.waitForTimeout(800); }
    await p.locator('.bm-two-ways__signup').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    await p.click('.bm-two-ways__signup', { timeout: 5000 }).catch(() => p.evaluate(() => document.querySelector('.bm-two-ways__signup').click()));
    await p.waitForTimeout(7000);
    res.signupWithServiceTo = p.url().slice(0, 160);
    await shot(p, `${tag}-signup-with-service.png`);

    // Regression: hero form submit direct
    await p.goto(URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(3000);
    inp = p.locator('[class*="pro-signup-hero_heroSection"] input:visible').first();
    await inp.click(); await p.keyboard.type('House cleaning', { delay: 60 }); await p.waitForTimeout(2500);
    if (await p.locator('[class*="search-results_searchResult"]').count()) { await p.locator('[class*="search-results_searchResult"]').first().click(); await p.waitForTimeout(800); }
    await p.locator('[class*="pro-signup-hero_heroSection"] button:visible', { hasText: /Sign up/ }).first().click();
    await p.waitForTimeout(6000);
    res.heroSubmitTo = p.url().slice(0, 160);

    // Persistence / duplicate injection
    await p.goto(URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bm-two-ways', { timeout: 60000 });
    await p.waitForTimeout(12000);
    res.persist = await p.evaluate(() => ({ h1: document.querySelector('[class*="pro-signup-hero_heroTitle"]').innerText, sub: (document.querySelector('[class*="pro-signup-hero_heroSubhead"]') || {}).innerText, bars: document.querySelectorAll('.bm-hiw-bar').length, sections: document.querySelectorAll('.bm-two-ways').length, guard: window.bmPresetJobsProLpEvents }));
    res.errors = [...new Set(errs.filter(e => !/insertAdjacentHTML|#418|Minified React/.test(e)))];
    console.log(tag, JSON.stringify(res, null, 1));
    await ctx.close();
  }
  await b.close();
})();
