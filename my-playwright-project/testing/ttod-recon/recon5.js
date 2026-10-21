const { chromium, webkit, devices } = require('playwright');
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736';
(async () => {
  const which = process.argv[2] || 'chromium';
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  for (const [dev, o] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', devices['iPhone 12']]]) {
    const ctx = await b.newContext(o); const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('.bm-two-ways', { timeout: 40000 }); await p.waitForTimeout(4000);
    const r = await p.evaluate(async () => {
      const h = document.querySelector('[class*="pro-signup-hero_heroSection"]'); const i = h.querySelector('input');
      const attrs = [...i.attributes].map(a => a.name + '=' + a.value.slice(0, 30));
      const ev = []; ['focus', 'blur', 'focusin', 'focusout'].forEach(t => i.addEventListener(t, () => ev.push(t)));
      document.addEventListener('focusin', e => ev.push('doc-focusin:' + (e.target.placeholder || e.target.tagName)), true);
      i.focus(); const a1 = document.activeElement === i;
      await new Promise(r => setTimeout(r, 300));
      const a2 = document.activeElement === i;
      return { attrs, a1, a2, ev, active: document.activeElement.tagName + ' ' + (document.activeElement.className || '').toString().slice(0, 50), hasFocus: document.hasFocus() };
    });
    console.log(which, dev, JSON.stringify(r, null, 1));
    // how the real flow behaves: click section button, then 1.5s later check
    await p.locator('.bm-two-ways__signup').scrollIntoViewIfNeeded();
    await p.evaluate(() => { window.__ev = []; document.addEventListener('focusin', e => window.__ev.push([Math.round(performance.now()), 'in', e.target.placeholder || e.target.className.toString().slice(0, 30)]), true); document.addEventListener('focusout', e => window.__ev.push([Math.round(performance.now()), 'out', e.target.placeholder || e.target.className.toString().slice(0, 30)]), true); });
    await p.evaluate(() => document.querySelector('.bm-two-ways__signup').click());
    await p.waitForTimeout(1500);
    console.log(which, dev, 'flow events', JSON.stringify(await p.evaluate(() => [window.__ev, document.activeElement.placeholder || document.activeElement.tagName])));
    await ctx.close();
  }
  await b.close();
})();
