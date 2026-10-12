const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.${process.argv[2] || '1000257610'}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const r = await page.evaluate(() => {
    const path = (e) => { const a = []; while (e && e !== document.body) { a.push(e.tagName + (e.id ? '#' + e.id : '') + '.' + (e.className || '').toString().split(' ').slice(0, 3).join('.')); e = e.parentElement; } return a.join(' < '); };
    const sh = [...document.querySelectorAll('.cre-t-20-Shuttle-details')].filter(s => !s.closest('[id*="car"]'));
    const bn = [...document.querySelectorAll('button')].filter(e => /book now/i.test(e.textContent) && !e.closest('[id*="car"]'));
    const outer = sh[0] && (sh[0].closest('[data-slice-type]') || sh[0].parentElement.parentElement.parentElement);
    return { n: sh.length, path: sh[0] && path(sh[0]), bnN: bn.length, bnPath: bn[0] && path(bn[0]), bnVisible: bn.filter(e => e.getBoundingClientRect().height > 0).length, shVisible: sh.filter(e => e.getBoundingClientRect().height > 0).length,
      exps: Object.entries(window.convert?.currentData?.experiences || {}).map(([k, v]) => k + ':' + v.variation?.id + ':' + (v.variation?.name)),
      bodyCls: document.body.className };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
