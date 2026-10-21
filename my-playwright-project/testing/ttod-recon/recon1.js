const { chromium, webkit, devices } = require('playwright');
const OUT = __dirname;
const URL = process.env.U || 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_x=5442504495988736&optimizely_force_tracking=true';
(async () => {
  const which = process.argv[2] || 'chromium';
  const bt = which === 'webkit' ? webkit : chromium;
  const b = await bt.launch();
  for (const [name, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', devices['iPhone 12']]]) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 150)));
    await p.goto(URL, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[class*="pro-signup-hero_heroTitle"]', { timeout: 30000 }).catch(() => {});
    await p.waitForSelector('.bm-two-ways', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    const info = await p.evaluate(() => {
      const q = s => document.querySelector(s);
      const t = s => q(s) ? q(s).innerText.trim() : null;
      const opt = window.optimizely && window.optimizely.get ? window.optimizely.get('state').getActiveExperimentIds() : null;
      const vm = window.optimizely && window.optimizely.get ? window.optimizely.get('state').getVariationMap() : null;
      return {
        bodyClass: document.body.className,
        h1: t('[class*="pro-signup-hero_heroTitle"]'),
        sub: t('[class*="pro-signup-hero_heroSubhead"]'),
        bar: t('.bm-hiw-bar'),
        twoWays: t('.bm-two-ways'),
        barCount: document.querySelectorAll('.bm-hiw-bar').length,
        twCount: document.querySelectorAll('.bm-two-ways').length,
        prevOfTwo: q('.bm-two-ways') && q('.bm-two-ways').previousElementSibling ? q('.bm-two-ways').previousElementSibling.className : null,
        nextOfTwo: q('.bm-two-ways') && q('.bm-two-ways').nextElementSibling ? q('.bm-two-ways').nextElementSibling.className : null,
        prevOfBar: q('.bm-hiw-bar') && q('.bm-hiw-bar').previousElementSibling ? q('.bm-hiw-bar').previousElementSibling.className : null,
        opt, vm,
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        heroCta: [...document.querySelectorAll('[class*="pro-signup-hero_heroSection"] button')].map(b=>b.innerText.trim()),
        footnote: t('[class*="pro-signup-hero_footnote"]'),
        sections: [...document.querySelectorAll('main > *, section')].slice(0, 25).map(e => e.tagName + '.' + (e.className || '').toString().slice(0, 60)),
      };
    });
    console.log('==== ' + which + ' ' + name, JSON.stringify(info, null, 1));
    console.log('errors', errs.filter(e=>!/insertAdjacentHTML|#418/.test(e)), 'noise', errs.length);
    await p.screenshot({ path: `${OUT}/${which}-${name}-full.png`, fullPage: true });
    await ctx.close();
  }
  await b.close();
})();
