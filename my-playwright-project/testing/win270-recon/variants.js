// Find the firmness variant ids/prices and what the theme does on a firmness change (URL, variant input, price).
const { chromium } = require('playwright');
const URL = 'https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.1003185232';
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('.order-form.loaded', { timeout: 40000 }); await p.waitForTimeout(5000);
  const state = () => p.evaluate(() => ({
    url: location.search,
    ids: [...document.querySelectorAll('.order-form [name="id"], .order-form [data-variant-id], .order-form [data-variant]')].slice(0, 4).map((e) => e.name + '=' + (e.value || e.dataset.variantId || e.dataset.variant)),
    size: document.querySelector('.order-form select[name*="ize"], #size-select') && document.querySelector('.order-form select[name*="ize"], #size-select').value,
    price: document.querySelector('.order-form').innerText.match(/\$[\d,]+/g).slice(0, 5),
  }));
  console.log('init', JSON.stringify(await state()));
  console.log('meta', await p.evaluate(() => { const m = window.ShopifyAnalytics && ShopifyAnalytics.meta && ShopifyAnalytics.meta.product; return m ? JSON.stringify(m.variants.filter((v) => /Queen/.test(v.public_title || v.name)).map((v) => [v.id, v.public_title, v.price])) : 'none'; }));
  console.log('handles', await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/products/"]')].map((a) => a.getAttribute('href').split('?')[0]))].slice(0, 10).join(' ')));
  for (const v of ['Firmer', 'Plus', 'Softer', 'Luxury Firm']) {
    await p.selectOption('#firmness-select', v); await p.waitForTimeout(1200);
    console.log(v, JSON.stringify(await state()));
  }
  await b.close();
})();
