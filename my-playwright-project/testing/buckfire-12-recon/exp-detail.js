// Detail for specific experiment ids: locations/rules + JS snippet, to map Test 20 deploy coverage.
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://buckfirelaw.com/dog-bite-lawyer/?cro_mode=qa', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const out = await page.evaluate(() => {
    const d = window.convert.data; const exps = d.experiences;
    const locs = d.locations || [];
    const pick = (id) => { const e = exps.find(x => x.id == id); if (!e) return null;
      const ch = (e.variations || []).map(v => (v.changes || []).map(c => ({ js: (c.data && (c.data.js || c.data.custom_js) || '').slice(0, 1500) })));
      return { id, status: e.status, locIds: e.locations, site_area: JSON.stringify(e.site_area || '').slice(0, 800), changes: ch, keys: Object.keys(e) }; };
    const locDump = locs.map(l => ({ id: l.id, name: l.name, rules: JSON.stringify(l.rules || '').slice(0, 900) }));
    return { e957: pick('100052957'), e784: pick('100052784'), e508locs: (exps.find(x => x.id == '100052508') || {}).locations, locDump };
  });
  console.log(JSON.stringify(out, null, 1).slice(0, 12000));
  await b.close();
})();
