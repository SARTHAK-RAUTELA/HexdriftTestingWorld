const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [name, opts] of [['mobile', { ...devices['iPhone 12'] }], ['tablet1000', { viewport: { width: 1000, height: 800 } }], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
    delete opts.defaultBrowserType; const c = await b.newContext(opts); const p = await c.newPage();
    await p.goto('https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052950.1000257621', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(8000);
    console.log(name, await p.evaluate(() => { const bg = document.querySelector('[data-hero-element=background]'); return [...bg.querySelectorAll('img')].map(i => (i.closest('picture')?.className || 'orig') + ' => ' + i.currentSrc.slice(0, 140) + ' vis=' + getComputedStyle(i).opacity); }));
    await c.close(); }
  await b.close(); })();
