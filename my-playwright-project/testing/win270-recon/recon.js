// WIN270 live recon: load control/variation, dump buy box firmness, construction section, nav, video, gallery state.
// Usage: node testing/win270-recon/recon.js [chromium|webkit] [desktop|mobile] [control|variation]
const { chromium, webkit, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const [engine = 'chromium', form = 'desktop', arm = 'variation'] = process.argv.slice(2);
const OUT = path.join(__dirname, 'out');
const URL = `https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.${arm === 'control' ? '1003185232' : '1003185233'}`;

(async () => {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch();
  const dev = form === 'mobile' ? devices[engine === 'webkit' ? 'iPhone 12' : 'Pixel 5'] : { viewport: { width: 1440, height: 900 } };
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  page.on('request', (r) => { if (/convert.*\/js\/\d+-\d+\.js/.test(r.url())) console.log('BUNDLE', r.url()); });
  const tag = `${engine}-${form}-${arm}`;

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.order-form.loaded', { timeout: 40000 }).catch(() => console.log('NO .order-form.loaded'));
  await page.waitForTimeout(6000);

  const d = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const txt = (s) => q(s) ? q(s).innerText.trim().replace(/\s+/g, ' ') : null;
    const vis = (s) => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; };
    const sel = q('#firmness-select');
    return {
      body: [...document.body.classList].filter((c) => /cre/i.test(c)),
      firmLabel: (() => { const o = sel && sel.parentElement.previousElementSibling; return o ? o.innerText.trim() : null; })(),
      selectOptions: sel ? [...sel.options].map((o) => `${o.value} | ${o.text.trim()}`) : null,
      selectValue: sel && sel.value,
      panel: txt('.cre-t-270-firm-panel'),
      guideVisible: (() => { const n = document.querySelector('.cre-t-270-firm-label-row .order-form__option-note') || (sel && sel.parentElement.previousElementSibling && sel.parentElement.previousElementSibling.querySelector('.order-form__option-note')); return n ? getComputedStyle(n).visibility + ' ' + n.innerText.trim() : null; })(),
      bullets: [...document.querySelectorAll('.buybox-tabs-panel li')].map((l) => l.innerText.trim()).slice(0, 8),
      url: location.search,
      constructionHeader: txt('.winkbed-construction__header'),
      constructionSub: txt('.winkbed-construction__subheader'),
      tabsVisible: vis('.winkbed-construction__content-top-header'),
      tabs: [...document.querySelectorAll('.winkbed-construction__content-top-header-item')].map((t) => t.innerText.trim().replace(/\s+/g, ' ') + (t.classList.contains('active') ? ' [active]' : '')),
      activeItem: (() => { const e = [...document.querySelectorAll('[data-attribute]')].find((x) => x.offsetParent && /content-bottom-main-item/.test(x.className)); return e ? e.innerText.trim().replace(/\s+/g, ' ').slice(0, 400) : null; })(),
      lf255: txt('.cre-t-255-wrapper'),
      explore: txt('.cre-t-270-explore'),
      nav: [...document.querySelectorAll('[class*="cre37-navigation-link-text"]')].map((n) => n.innerText.trim() + ' / before=' + getComputedStyle(n, '::before').content),
      mobileNav: [...document.querySelectorAll('#mobilePdpNav option')].map((o) => o.textContent.trim() + '→' + o.getAttribute('data-target')),
      videoHeading: txt('.winkbed-construction-video__heading'),
      videoSub: txt('.winkbed-construction-video__subheading'),
      thumb: q('.winkbed-construction-video__video-inner .my-thumbnail-image') && q('.winkbed-construction-video__video-inner .my-thumbnail-image').getAttribute('src'),
      videoInner: q('.winkbed-construction-video__video-inner') && q('.winkbed-construction-video__video-inner').innerHTML.replace(/\s+/g, ' ').slice(0, 600),
      gridButtons: [...document.querySelectorAll('.pdp-gallery-grid button[data-slide]')].map((b) => b.dataset.slide + ':' + ((b.querySelector('img') || {}).src || '').split('/').pop().split('?')[0]),
    };
  });
  console.log(tag, JSON.stringify(d, null, 1));
  console.log('pageerrors', errs);
  await page.screenshot({ path: `${OUT}/${tag}-top.png` });
  fs.writeFileSync(`${OUT}/${tag}.json`, JSON.stringify(d, null, 1));
  await browser.close();
})();
