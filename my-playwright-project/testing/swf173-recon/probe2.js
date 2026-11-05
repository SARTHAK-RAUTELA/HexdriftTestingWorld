const { chromium } = require('@playwright/test');
const U = (arm, p, qs='') => `https://petinsurancegurus.com${p}?cro_mode=qa&_conv_eforce=100053060.${arm}${qs}`;
(async () => {
  const b = await chromium.launch();
  const go = async (u, fn, wait = 9000) => { const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); await p.goto(u, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.plan-box', { timeout: 60000 }); await p.waitForTimeout(wait); const r = await fn(p); await c.close(); return r; };
  // 1. petType=cat: DOM of first card price slot, timeline
  console.log('CAT', JSON.stringify(await go(U('1000257882', '/', '&petType=cat'), p => p.evaluate(() => {
    const b = document.querySelector('.plan-box');
    return { slot: b.querySelector('.plan-detail-column .plan-detail-content').innerHTML, dup: b.querySelector('.SWF173-amount')?.textContent, body: document.body.className.split(' ').filter(c=>/cre|swf/i.test(c)) };
  }))));
  // 2. Dogs tab click
  console.log('DOGS', JSON.stringify(await go(U('1000257882', '/'), async p => { await p.locator('.oxy-tab', { hasText: 'Dogs' }).first().click(); await p.waitForTimeout(4000); return p.evaluate(() => { const b = document.querySelector('.plan-box'); return { slot: b.querySelector('.plan-detail-column .plan-detail-content').innerHTML, dup: b.querySelector('.SWF173-amount')?.textContent, n: b.querySelectorAll('.SWF173-price').length }; }); })));
  // 3. last card /comparison/ and overflow on control vs variation
  for (const arm of ['1000257881', '1000257882']) for (const pg of ['/comparison/', '/canada/']) {
    console.log('LAST', arm, pg, JSON.stringify(await go(U(arm, pg), p => p.evaluate(() => {
      const boxes = [...document.querySelectorAll('.plan-box')].filter(b => b.offsetParent);
      const last = boxes[boxes.length - 1];
      const btn = last.querySelector('.plan-button-container'); const col = btn.parentElement;
      const cta = last.querySelector('a.see-plans-button, a[class*=button]');
      let anc = []; let e = last; for (let i = 0; i < 6 && e; i++) { anc.push(e.className.slice(0, 50)); e = e.parentElement; }
      return { anc, ctaOuter: cta?.outerHTML.slice(0, 260), inRepeater: !!last.closest('.plan-repeater'),
        ovf: boxes.map(b => { const c = b.querySelector('.plan-button-container').parentElement; return c.scrollWidth - c.clientWidth; }).join(','),
        colW: col.clientWidth, sw: col.scrollWidth, kids: [...col.children].map(k => k.className.slice(0,40) + ':' + k.scrollWidth) };
    }))));
  }
  await b.close();
})();
