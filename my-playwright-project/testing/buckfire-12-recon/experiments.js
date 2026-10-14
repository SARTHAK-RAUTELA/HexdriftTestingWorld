// Dump Convert experiment names/status/variations visible in the page config (to identify Test 20).
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://buckfirelaw.com/dog-bite-lawyer/?cro_mode=qa', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const out = await page.evaluate(() => {
    const c = window.convert || {}; const res = {};
    const src = (c.data && (c.data.experiences || (c.data.data && c.data.data.experiences))) || null;
    if (Array.isArray(src)) res.list = src.map(e => ({ id: e.id, name: e.name, status: e.status, type: e.type, vars: (e.variations || []).map(v => v.id + ':' + v.name + ':' + (v.traffic_allocation ?? '')) }));
    res.keys = Object.keys(c).slice(0, 40);
    res.current = c.currentData && c.currentData.experiences;
    res.bodyCls = document.body.className;
    return res;
  });
  console.log(JSON.stringify(out, null, 1).slice(0, 6000));
  await b.close();
})();
