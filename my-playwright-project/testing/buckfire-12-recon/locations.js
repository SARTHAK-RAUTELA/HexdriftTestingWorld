// Extract URL lists for Test 12 (loc 100011763) vs Test 20 deploy (loc 100011864) + homepage locs; save deploy code.
const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://buckfirelaw.com/dog-bite-lawyer/?cro_mode=qa', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const out = await page.evaluate(() => {
    const d = window.convert.data;
    const urls = (id) => { const l = d.locations.find(x => x.id == id); return l ? JSON.stringify(l.rules).match(/"value":"https:[^"]+"/g) : null; };
    const expLoc = d.experiences.map(e => ({ id: e.id, type: e.type, locs: e.locations }));
    const e957 = d.experiences.find(x => x.id == '100052957');
    const ch = e957.variations[0].changes.map(c => c.data || {});
    return { t12: urls('100011763'), t20: urls('100011864'), loc904: urls('100011904'), expLoc, js: ch.map(c => c.js || '').join('\n/*----*/\n'), css: ch.map(c => c.css || '').join('\n') };
  });
  fs.writeFileSync(path.join(__dirname, 'test20-deploy-varC.js'), out.js);
  fs.writeFileSync(path.join(__dirname, 'test20-deploy-varC.css'), out.css);
  delete out.js; delete out.css;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
