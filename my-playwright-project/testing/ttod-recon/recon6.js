const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const bodies = [];
  p.on('response', async r => { if (/optimizely/.test(r.url()) && /\.js/.test(r.url())) { try { bodies.push([r.url(), await r.text()]); } catch (e) {} } });
  await p.goto('https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[class*="pro-signup-hero_heroTitle"]', { timeout: 60000 }).catch(()=>{}); await p.waitForTimeout(6000); console.log('has section', await p.$('.bm-two-ways') !== null, await p.title());
  for (const [u, t] of bodies) {
    console.log(u, t.length);
    const i = t.indexOf('bm_preset_jobs_pro_lp');
    if (i > -1) { const s = t.lastIndexOf('function', i - 50 > 0 ? i - 50 : 0); fs.writeFileSync(__dirname + '/live-bundle.js', t); console.log('FOUND at', i); }
  }
  await b.close();
})();
