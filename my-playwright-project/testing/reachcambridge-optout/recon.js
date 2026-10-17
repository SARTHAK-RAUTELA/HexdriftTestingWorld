const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const scripts = [];
  page.on('response', async r => {
    if (r.request().resourceType() !== 'script') return;
    try { const t = await r.text(); if (/cre-t/.test(t)) scripts.push(r.url() + ' (' + t.length + ')'); } catch {}
  });
  await page.goto('https://www.reachcambridge.com/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const html = await page.content();
  const inline = await page.evaluate(() => [...document.scripts].filter(s => !s.src && /cre-t/.test(s.textContent)).map(s => s.textContent.slice(0, 300)));
  const srcs = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).filter(s => !/wp-content|wp-includes/.test(s)));
  const globals = await page.evaluate(() => ({ vwo: typeof window._vwo_code, opt: typeof window.optimizely, conv: typeof window._conv_q, convert: typeof window.convert, abtasty: typeof window.ABTasty, vwoExp: window._vwo_exp_ids || null }));
  console.log('SCRIPTS WITH cre-t:', scripts);
  console.log('INLINE WITH cre-t:', inline);
  console.log('3P SCRIPTS:', srcs);
  console.log('GLOBALS:', globals);
  console.log('COOKIES:', (await ctx.cookies()).map(c => c.name));
  await browser.close();
})();
