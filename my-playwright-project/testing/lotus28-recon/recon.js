// node testing/lotus28-recon/recon.js
const { chromium, webkit, devices } = require('@playwright/test');
const EXP = '100053078';
const ARMS = { control: '1000257924', variant: '1000257925' };
(async () => {
  const engine = process.argv[2] === 'webkit' ? webkit : chromium;
  const dev = process.argv[2] === 'webkit' ? devices['iPhone 12'] : devices['Pixel 5'];
  const browser = await engine.launch();
  for (const [k, id] of Object.entries(ARMS)) {
    const ctx = await browser.newContext({ ...dev });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 150)));
    await page.goto(`https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=${EXP}.${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(exp => window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
    const info = await page.evaluate((exp) => {
      const e = window.convert?.currentData?.experiences?.[exp];
      const h = document.querySelector('header.sticky.top-0');
      const headers = [...document.querySelectorAll('header')].map(x => x.className);
      const sticky = [...document.querySelectorAll('*')].filter(el => { const s = getComputedStyle(el); return (s.position === 'sticky' || s.position === 'fixed') && el.getClientRects().length; })
        .map(el => ({ tag: el.tagName, cls: (el.className.baseVal ?? el.className).toString().slice(0, 100), pos: getComputedStyle(el).position, top: getComputedStyle(el).top, z: getComputedStyle(el).zIndex, h: Math.round(el.getBoundingClientRect().height) }));
      const styles = [...document.querySelectorAll('style')].map(s => s.textContent).filter(t => /cre-t-28/.test(t));
      return { variation: e?.variation?.id, bodyCls: document.body.className, headers, headerH: h && h.getBoundingClientRect().height, sticky, styles, docH: document.documentElement.scrollHeight, listener: window.cre_t_28_listenerControl };
    }, EXP);
    console.log(k, JSON.stringify(info, null, 1));
    // scroll test
    const read = () => page.evaluate(() => { const h = document.querySelector('header.sticky.top-0'); const r = h.getBoundingClientRect(); return { y: Math.round(scrollY), top: Math.round(r.top), bottom: Math.round(r.bottom), cls: h.className.includes('cre-t-28-header-hidden'), tf: getComputedStyle(h).transform }; });
    for (const y of [400, 900, 700, 650, 0]) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(500);
      console.log(k, 'scrollTo', y, JSON.stringify(await read()));
    }
    console.log(k, 'errors', errs);
    await page.screenshot({ path: `testing/lotus28-recon/${process.argv[2] || 'chromium'}-${k}.png` });
    await ctx.close();
  }
  await browser.close();
})();
