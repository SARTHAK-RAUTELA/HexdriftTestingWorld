// Dump currently-deployed SWF166 V1 code from window.convert.data → out/deployed-<tag>.js/.css
const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const tag = process.argv[2] || 'latest';
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const c = await page.evaluate(() => {
    const ex = window.convert.data.experiences; const arr = Array.isArray(ex) ? ex : Object.values(ex);
    const e = arr.find(x => x.id === '100052988');
    return { ...e.variations[1].changes[0].data, version: e.version, traffic: e.variations.map(v => v.traffic_allocation) };
  });
  fs.writeFileSync(path.join(__dirname, 'out', `deployed-${tag}.js`), c.js);
  fs.writeFileSync(path.join(__dirname, 'out', `deployed-${tag}.css`), c.css);
  console.log('version', c.version, 'traffic', c.traffic, 'js', c.js.length, 'css', c.css.length);
  await b.close();
})();
