const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (let run = 1; run <= 6; run++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto('https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100053060.1000257882', { waitUntil: 'domcontentloaded' });
    const t0 = Date.now(); const seen = [];
    for (let i = 0; i < 120; i++) {
      const s = await p.evaluate(() => [...document.querySelectorAll('.plan-box')].filter(b => b.offsetParent).map(b => {
        const a = b.querySelector('.SWF173-amount'), l = b.querySelector('.plan-detail-column .plan-detail-content');
        return a && l ? (a.textContent.replace(/\s+/g,'') === l.innerText.replace(/\s+/g,'') ? 'ok' : `BAD ${a.textContent.trim()}≠${l.innerText.trim()}`) : '-';
      }).filter(x => x !== '-')).catch(() => []);
      const bad = s.filter(x => x !== 'ok');
      const tag = s.length ? (bad.length ? `${bad.length}/${s.length} bad (${bad[0]})` : `${s.length} ok`) : 'none';
      if (!seen.length || seen[seen.length - 1].tag !== tag) seen.push({ t: Date.now() - t0, tag });
      await p.waitForTimeout(100);
    }
    console.log(`load ${run}: ` + seen.map(x => `${x.t}ms ${x.tag}`).join('  →  '));
    await ctx.close();
  }
  await b.close();
})();
