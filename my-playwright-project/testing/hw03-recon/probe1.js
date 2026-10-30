// Recon: does the variation load past Cloudflare, what does the gallery DOM look like, and which product URLs can we use.
const { chromium } = require('@playwright/test');
const OUT = __dirname;
const V = 'https://hosewarehouse.com/products/1501pr-by-coilhose-flexcoil-air-hose-fitting-1-4-industrial-connector-1-4-hose-id-pur?cro_mode=qa&_conv_eforce=100053020.1000257789';
(async () => {
  const b = await chromium.launch({ headless: true, channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(V, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(8000);
  console.log('title:', await p.title());
  const info = await p.evaluate(() => {
    const g = document.querySelector('product-gallery');
    const v = document.querySelector('product-gallery .product-gallery__viewer');
    const bd = document.querySelector('.cre-t-03-badges');
    return {
      bodyHasClass: document.body.classList.contains('cre-t-03'),
      gallery: !!g, viewer: !!v, badges: document.querySelectorAll('.cre-t-03-badges').length,
      badgeText: bd && bd.innerText,
      viewerHTML: v && v.outerHTML.slice(0, 1500),
      galleryChildren: g && [...g.children].map(c => c.tagName + '.' + c.className),
      convert: typeof window.convert, font: bd && getComputedStyle(bd.querySelector('span span')).fontFamily,
      bodyFont: getComputedStyle(document.body).fontFamily,
      fontsLoaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight),
      productLinks: [...new Set([...document.querySelectorAll('a[href*="/products/"]')].map(a => a.getAttribute('href').split('?')[0]))].slice(0, 40),
      collLinks: [...new Set([...document.querySelectorAll('a[href*="/collections/"]')].map(a => a.getAttribute('href').split('?')[0]))].slice(0, 30),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await p.screenshot({ path: OUT + '/p1-var-desktop.png' });
  await b.close();
})();
