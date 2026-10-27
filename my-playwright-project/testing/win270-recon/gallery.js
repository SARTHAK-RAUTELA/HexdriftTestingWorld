// Where do the firmness-options image and the new bed image appear (and are they visible) per arm/viewport?
const { chromium } = require('playwright');
const [form = 'mobile', arm = 'variation'] = process.argv.slice(2);
const URL = `https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.${arm === 'control' ? '1003185232' : '1003185233'}`;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(form === 'mobile' ? require('playwright').devices['Pixel 5'] : { viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('.order-form.loaded', { timeout: 40000 }); await p.waitForTimeout(6000);
  const r = await p.evaluate(() => [...document.querySelectorAll('img')].filter((i) => /firmness-options|cre-t-270-newImage|imageSens/.test(i.currentSrc || i.src || i.dataset.src || ''))
    .map((i) => { let e = i, hidden = false; while (e) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') { hidden = true; break; } e = e.parentElement; }
      const c = i.closest('[class*="swiper-container"], .pdp-gallery-grid, .cre-lightbox-popUp'); const slide = i.closest('[data-slide], .swiper-slide');
      return `${(i.currentSrc || i.src).split('/').pop().split('?')[0]} | in ${c ? c.className.split(' ').slice(0, 2).join('.') : '?'} | slide ${slide ? (slide.dataset.slide || [...slide.parentElement.children].indexOf(slide)) : '?'} | ${hidden ? 'HIDDEN' : 'shown'}`; }));
  console.log(form, arm, '\n ' + r.join('\n '));
  console.log('gallery-top slide count', await p.evaluate(() => document.querySelectorAll('.gallery-top .swiper-slide').length));
  await b.close();
})();
