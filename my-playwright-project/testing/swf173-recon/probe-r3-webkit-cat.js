const { webkit } = require('@playwright/test');
(async () => {
  const b = await webkit.launch();
  for (let run = 1; run <= 4; run++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
    const t0 = Date.now(); const seen = [];
    try {
      await p.goto('https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100053060.1000257882&petType=cat', { waitUntil: 'domcontentloaded', timeout: 90000 });
      for (let i = 0; i < 60; i++) {
        const s = await p.evaluate(() => { const v = [...document.querySelectorAll('.plan-box')].filter(b => b.offsetParent).slice(0, 7);
          if (!v.length) return 'no cards'; const priced = v.filter(b => b.querySelector('.SWF173-price')).length;
          const bad = v.filter(b => { const a = b.querySelector('.SWF173-amount'), l = b.querySelector('.plan-detail-column .plan-detail-content'); return a && l && a.textContent.replace(/\s+/g,'') !== l.innerText.replace(/\s+/g,''); }).length;
          return `${priced}/${v.length} priced, ${bad} mismatched`; }).catch(() => 'nav');
        if (!seen.length || seen[seen.length - 1].s !== s) seen.push({ t: Date.now() - t0, s });
        await p.waitForTimeout(500);
      }
    } catch (e) { seen.push({ t: Date.now() - t0, s: 'TIMEOUT' }); }
    console.log(`load ${run}: ` + seen.map(x => `${(x.t/1000).toFixed(1)}s ${x.s}`).join('  →  '));
    await ctx.close();
  }
  await b.close();
})();
