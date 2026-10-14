// Check whether Test 20 A/B (100052695) is active again vs the Variation C deploy (100052957), across fresh visitors.
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (let i = 0; i < 6; i++) {
    const ctx = await b.newContext(); const page = await ctx.newPage();
    await page.goto('https://buckfirelaw.com/dog-bite-lawyer/?cro_mode=qa&_conv_eforce=100052508.1000256555', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => window.convert && window.convert.currentData, null, { timeout: 20000 });
    await page.waitForTimeout(3000);
    const r = await page.evaluate(() => {
      const d = window.convert.data;
      const e = (id) => { const x = d.experiences.find(y => y.id == id); return x ? { status: x.status, type: x.type, name: x.name, locs: x.locations, vars: x.variations.map(v => v.id + ':' + v.traffic_allocation + ':' + ((v.changes || []).map(c => (c.data && c.data.js || '').match(/variation_name\s*=\s*"([^"]+)"/)).filter(Boolean).map(m => m[1]).join('|'))) } : null; };
      return { cur: Object.fromEntries(Object.entries(window.convert.currentData.experiences).map(([k, v]) => [k, v.variation.id])), e695: e('100052695'), e957: e('100052957'), teaser: !!document.querySelector('.cre-t-20-video-teaser-block') };
    });
    console.log(JSON.stringify(i === 0 ? r : { cur: r.cur, teaser: r.teaser }));
    await ctx.close();
  }
  await b.close();
})();
