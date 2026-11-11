const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const logs = []; p.on('console', m => { if (/SWF173/.test(m.text())) logs.push(m.text()); });
  const bodies = [];
  p.on('response', async r => { try { const u = r.url(); if (/convert|cdn-4|cdn-3/.test(u) && /js/.test(r.headers()['content-type']||'')) { const t = await r.text(); if (/SWF173/.test(t)) bodies.push({u, t}); } } catch {} });
  await p.goto('https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100053060.1000257882', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.plan-box', { state: 'attached', timeout: 60000 });
  await p.waitForTimeout(12000);
  const info = await p.evaluate(() => ({ prices: document.querySelectorAll('.SWF173-price').length, body: document.body.classList.contains('SWF173'), flag: !!window.observeSelectorAddedSWF173,
    css: [...document.querySelectorAll('style')].map(s => s.textContent).filter(t => /SWF173/.test(t)).join('\n----\n'),
    mo: (() => { const e = document.querySelector('.SWF173-mo'), a = document.querySelector('.SWF173-amount'); return e && { mo: getComputedStyle(e).fontSize, amt: getComputedStyle(a).fontSize }; })() }));
  console.log(JSON.stringify(info, null, 1));
  console.log('errors', errs); console.log('logs', logs.slice(0, 10));
  for (const x of bodies) { const i = x.t.indexOf('SWF173'); console.log('SRC', x.u, x.t.length); require('fs').writeFileSync(__dirname + '/convert-bundle.js', x.t); }
  await b.close();
})();
