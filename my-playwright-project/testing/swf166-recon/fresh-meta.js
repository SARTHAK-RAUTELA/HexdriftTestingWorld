const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ bypassCSP: true });
  const page = await ctx.newPage();
  const bundles = [];
  page.on('response', async r => { if (/convertexperiments\.com\/v1\/js\//.test(r.url())) bundles.push({ url: r.url(), status: r.status(), age: r.headers()['age'], lm: r.headers()['last-modified'], date: r.headers()['date'], cc: r.headers()['cache-control'] }); });
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052988.1000257708&nocache=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => {
    const ex = window.convert.data.experiences; const arr = Array.isArray(ex) ? ex : Object.values(ex);
    const e = arr.find(x => x.id === '100052988');
    return { version: e.version, status: e.status, name: e.name, vars: e.variations.map(v => ({ id: v.id, name: v.name, traffic: v.traffic_allocation, js: (v.changes||[]).map(c => (c.data && c.data.js || '').length), css: (v.changes||[]).map(c => (c.data && c.data.css||'').length) })),
      locations: e.locations, audiences: e.audiences, goals: e.goals, controlJs: (e.variations[0].changes||[]).map(c=>c.data&&c.data.js).join('\n////\n') };
  });
  console.log(JSON.stringify(bundles, null, 1));
  const { controlJs, ...rest } = info; console.log(JSON.stringify(rest, null, 1));
  require('fs').writeFileSync('testing/swf166-recon/out/deployed-r4-control.js', controlJs || '');
  await b.close();
})();
