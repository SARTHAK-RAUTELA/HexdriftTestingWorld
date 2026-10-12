const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.1000257610`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const r = await page.evaluate(() => {
    const ex = window.convert?.currentData?.experiences || {};
    const out = {};
    for (const [k, v] of Object.entries(ex)) out[k] = (v.variation?.changes || []).map(c => ({ type: c.type, js: c.data?.js, css: c.data?.css }));
    const orig = [...document.querySelectorAll('[data-slice-type="fleet_category"] [id*="car"]')];
    out._origVisible = orig.filter(e => e.getBoundingClientRect().height > 0).length;
    out._orig = orig.length;
    out._clones = document.querySelectorAll('cre-t-lotus-16-card').length;
    out._expNames = Object.fromEntries(Object.entries(window.convert?.data?.experiences || {}).map(([k, v]) => [k, v.name]).filter(([k]) => ex[k]));
    return out;
  });
  fs.writeFileSync(path.join(__dirname, 'out', 'other-exps.json'), JSON.stringify(r, null, 2));
  console.log(r._orig, r._origVisible, r._clones, JSON.stringify(r._expNames));
  for (const k of Object.keys(r).filter(k => !k.startsWith('_'))) console.log(k, r[k].map(c => c.type + ' js:' + (c.js || '').length + ' css:' + (c.css || '').length).join(' | '));
  await b.close();
})();
