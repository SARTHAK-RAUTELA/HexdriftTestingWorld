// Debug TC-16 (explore Soft scroll) and TC-21 (lightbox active image) on desktop Chrome.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto('https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.1003185233', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('.cre-t-270-explore', { timeout: 60000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => document.querySelector('.cre-t-270-explore-toggle').click());
  for (const n of ['Soft', 'Firm']) {
    await p.evaluate((n) => document.querySelector(`.cre-t-270-explore-option[data-firmness="${n}"]`).click(), n);
    for (const t of [300, 800, 1800, 3000]) {
      await p.waitForTimeout(t === 300 ? 300 : t - [300, 800, 1800, 3000][[300, 800, 1800, 3000].indexOf(t) - 1]);
      console.log(n, t, JSON.stringify(await p.evaluate(() => {
        const items = [...document.querySelectorAll('.winkbed-construction__content-bottom-main-item')].filter((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0);
        const c = document.querySelector('.winkbed-construction__content-bottom-main-container').getBoundingClientRect();
        return { y: Math.round(scrollY), items: items.map((e) => e.getAttribute('data-attribute') + '@' + Math.round(e.getBoundingClientRect().top)), container: Math.round(c.top), vh: innerHeight };
      })));
    }
  }
  await p.screenshot({ path: __dirname + '/out/dbg-soft.png' });
  // lightbox
  await p.evaluate(() => document.querySelector('.pdp-gallery-grid button[data-slide="4"]').click());
  await p.waitForTimeout(1500);
  console.log(JSON.stringify(await p.evaluate(() => {
    const pop = document.querySelector('.cre-lightbox-popUp');
    const sl = document.querySelector('.lightbox-slider');
    return { popCls: pop.className, popDisplay: getComputedStyle(pop).display, sliderParent: sl.parentElement.className, active: [...sl.querySelectorAll('.swiper-slide')].map((s, i) => i + ':' + s.className.replace('swiper-slide', '').trim() + ':' + ((s.querySelector('img') || {}).src || '').split('/').pop().split('?')[0]).filter((x) => /active/.test(x)) };
  })));
  await b.close();
})();
