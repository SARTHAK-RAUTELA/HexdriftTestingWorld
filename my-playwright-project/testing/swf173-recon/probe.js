const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const t0 = Date.now();
  await p.goto('https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100053060.1000257882', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.SWF173-price', { state: 'attached', timeout: 40000 });
  console.log('first price at ms', Date.now() - t0);
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelectorAll('.cre-t-133-overlay').forEach(e => e.remove()));
  const info = await p.evaluate(() => {
    const boxes = [...document.querySelectorAll('.plan-box')];
    const cs = (el, k) => el ? getComputedStyle(el)[k] : null;
    return {
      bodyCls: document.body.className.split(' ').filter(c => /swf|cre-t/i.test(c)),
      rootFs: cs(document.documentElement, 'fontSize'),
      conv: document.cookie.match(/_conv_v=[^;]*/)?.[0]?.slice(0, 400),
      boxes: boxes.map(bx => {
        const pr = bx.querySelector('.SWF173-price'); const btn = bx.querySelector('.plan-button-container');
        const col = btn && btn.parentElement; const r = bx.getBoundingClientRect(); const br = btn && btn.getBoundingClientRect();
        const left = bx.querySelector('.plan-detail-column .plan-detail-content');
        return {
          name: (bx.querySelector('img')?.alt || '').slice(0, 30), visible: !!bx.offsetParent, h: Math.round(r.height),
          price: pr?.textContent.trim(), left: left?.innerText.trim(), leftHTML: left?.innerHTML.slice(0, 200),
          btnContH: br && Math.round(br.height), btnContTop: br && Math.round(br.top - r.top), boxH: Math.round(r.height),
          btnContDisplay: cs(btn, 'display'), btnContJustify: cs(btn, 'justifyContent'), parentAlign: cs(col, 'alignItems'), parentCls: col?.className,
          btnHTML: btn?.outerHTML.slice(0, 600),
        };
      }),
      lbl: (() => { const e = document.querySelector('.SWF173-label'); return e && { fs: cs(e, 'fontSize'), c: cs(e, 'color'), fw: cs(e, 'fontWeight'), ff: cs(e, 'fontFamily'), ls: cs(e, 'letterSpacing') }; })(),
      amt: (() => { const e = document.querySelector('.SWF173-amount'); return e && { fs: cs(e, 'fontSize'), fw: cs(e, 'fontWeight'), ff: cs(e, 'fontFamily'), c: cs(e, 'color') }; })(),
      mo: (() => { const e = document.querySelector('.SWF173-mo'); return e && { fs: cs(e, 'fontSize'), fw: cs(e, 'fontWeight') }; })(),
      nativeLbl: (() => { const e = document.querySelector('.plan-detail-column .plan-detail-title, .plan-detail-column div'); return e && { t: e.textContent.trim().slice(0,40), fs: cs(e, 'fontSize'), c: cs(e, 'color'), fw: cs(e,'fontWeight') }; })(),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  console.log('errors', errs);
  await p.screenshot({ path: __dirname + '/v-desktop.png', fullPage: false });
  await b.close();
})();
