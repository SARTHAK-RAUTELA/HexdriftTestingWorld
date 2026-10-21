const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  for (let run = 1; run <= 3; run++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    const scripts = [];
    p.on('response', async r => { const u = r.url(); if (r.request().resourceType() === 'script' && /optimizely|cdn-pci|20611073899/.test(u)) { try { const t = await r.text(); scripts.push(u.slice(0, 90) + ' ' + t.length); if (t.includes('bm_preset_jobs_pro_lp')) fs.writeFileSync(__dirname + '/live-bundle.js', t); } catch (e) {} } });
    await p.goto('https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[class*="pro-signup-hero_heroTitle"]', { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(8000);
    const st = await p.evaluate(() => { const o = window.optimizely; let vm = null; try { vm = o.get('state').getVariationMap()['6154131621019648']; } catch (e) {} return { opt: typeof o, vm, sec: !!document.querySelector('.bm-two-ways'), body: document.body.className, url: location.href.slice(0, 80) }; });
    console.log('run', run, JSON.stringify(st), scripts);
    await ctx.close();
  }
  await b.close();
})();
