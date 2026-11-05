// List every Convert experience in the served config (id/name/status/type/vars)
const { chromium } = require('@playwright/test');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(7000);
  console.log(JSON.stringify(await p.evaluate(() => { const d = (window.convert||{}).data||{}; const ex = d.experiences || [];
    return { n: ex.length, ex: ex.map(e => [e.id, e.name, e.status, e.type, (e.variations||[]).map(v=>v.id).join('/') , JSON.stringify(e.locations||e.location_ids||'')].join(' | ')), cur: Object.keys((window.convert.currentData||{}).experiences||{}) }; }), null, 1));
  await b.close(); })();
