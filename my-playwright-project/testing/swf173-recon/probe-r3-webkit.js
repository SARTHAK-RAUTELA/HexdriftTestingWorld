const { webkit } = require('@playwright/test');
const B = 'https://petinsurancegurus.com';
(async () => {
  const b = await webkit.launch();
  for (const [pth, qs] of [['/comparison/', ''], ['/comparison/', ''], ['/', '&petType=cat'], ['/', '&petType=cat']]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    try {
      await p.goto(`${B}${pth}?cro_mode=qa&_conv_eforce=100053060.1000257882${qs}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await p.waitForSelector('.plan-box', { state: 'attached', timeout: 90000 });
      await p.waitForTimeout(10000);
      const r = await p.evaluate(() => ({ body: document.body.classList.contains('SWF173'), cards: [...document.querySelectorAll('.plan-box')].filter(b => b.offsetParent).map(b => {
        const pr = b.querySelector('.SWF173-price'), l = b.querySelector('.plan-detail-column .plan-detail-content');
        return `${((b.querySelector('img')||{}).alt||'').replace(/ ?logo.*$/i,'').slice(0,14)}: ${pr ? pr.querySelector('.SWF173-amount').textContent : 'NONE'} | left "${l ? l.innerText.trim() : 'n/a'}" | ${pr ? 'h' + Math.round(pr.getBoundingClientRect().height) : ''}`;
      }) }));
      console.log(`\n${pth}${qs} body.SWF173=${r.body} errors=${JSON.stringify(errs)}\n  ` + r.cards.join('\n  '));
      if (/comparison/.test(pth)) await p.locator('.plan-box:visible').nth(9).screenshot({ path: __dirname + '/r2/webkit-comparison-card10.png' }).catch(() => {});
    } catch (e) { console.log(`\n${pth}${qs} TIMEOUT ${e.message.slice(0, 80)}`); }
    await ctx.close();
  }
  await b.close();
})();
