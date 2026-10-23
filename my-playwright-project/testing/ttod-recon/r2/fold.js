// Round-2 fresh above-the-fold screenshots (no prior scroll, so the hero search fields are not in the sticky bar)
const { chromium, webkit, devices } = require('playwright');
const OUT = __dirname + '/shots';
const VAR = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_x=5442504495988736&optimizely_force_tracking=true';
(async () => {
  const which = process.argv[2] || 'chromium';
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  const sizes = [['1440', { viewport: { width: 1440, height: 900 } }], ['1025', { viewport: { width: 1025, height: 800 } }], ['768', { viewport: { width: 768, height: 1024 } }], ['iphone12', devices['iPhone 12']]];
  for (const [name, opts] of sizes) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    await p.goto(VAR, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(4000);
    await p.screenshot({ path: `${OUT}/${which}-${name}-fold.png`, timeout: 20000, fullPage: name === 'iphone12', clip: name === 'iphone12' ? { x: 0, y: 0, width: 390, height: 1100 } : undefined }).catch(() => console.log('shot fail', name));
    await (await p.$('.bm-two-ways')).screenshot({ path: `${OUT}/${which}-${name}-twoways.png`, timeout: 20000 }).catch(() => console.log('shot fail tw', name));
    await ctx.close();
  }
  await b.close();
})();
