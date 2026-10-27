// WIN270 interactive probe: gallery/lightbox, buy box firmness flow, explore toggle, sticky nav, video, goal hits.
// Usage: node testing/win270-recon/probe.js [chromium|webkit] [desktop|mobile] [control|variation]
const { chromium, webkit, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const [engine = 'chromium', form = 'desktop', arm = 'variation'] = process.argv.slice(2);
const OUT = path.join(__dirname, 'out');
const URL = `https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.${arm === 'control' ? '1003185232' : '1003185233'}`;
const tag = `${engine}-${form}-${arm}`;
const log = (...a) => console.log(`[${tag}]`, ...a);

(async () => {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch();
  const dev = form === 'mobile' ? devices[engine === 'webkit' ? 'iPhone 12' : 'Pixel 5'] : { viewport: { width: 1440, height: 900 } };
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Record code-triggered goals pushed to Convert's queue
    window.__goals = [];
    const hook = () => {
      const q = window._conv_q = window._conv_q || [];
      if (q.__hooked) return;
      const orig = q.push.bind(q);
      q.push = (...a) => { a.forEach((x) => Array.isArray(x) && x[0] === 'triggerConversion' && window.__goals.push(String(x[1]))); return orig(...a); };
      q.__hooked = true;
    };
    hook(); setInterval(hook, 200);
  });
  const net = [];
  page.on('request', (r) => {
    if (/convertexperiments\.com/.test(r.url()) && r.method() === 'POST') {
      const b = r.postData() || '';
      const ids = (b.match(/1003\d{5}/g) || []).filter((x) => /^10033(4|2|21)/.test(x));
      if (ids.length) net.push(...ids);
    }
  });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  const shot = (n) => page.screenshot({ path: `${OUT}/${tag}-${n}.png`, timeout: 15000, animations: 'disabled' }).catch((e) => log('shot fail', n, e.message.slice(0, 80)));
  const jsClick = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
  const center = (sel) => page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.order-form.loaded', { timeout: 40000 });
  await page.waitForTimeout(6000);
  log('goals on load', await page.evaluate(() => window.__goals));

  // ---------- Gallery ----------
  const gal = await page.evaluate(() => {
    const imgsIn = (root) => root ? [...root.querySelectorAll('img')].map((i) => (i.currentSrc || i.src || '').split('/').pop().split('?')[0]).filter(Boolean) : null;
    const containers = [...document.querySelectorAll('[class*="gallery"], [class*="carousel"], [class*="slider"], [class*="lightbox"]')]
      .filter((e) => /pdp|product|gallery|lightbox/i.test(e.className) && e.querySelectorAll('img').length > 3)
      .map((e) => ({ cls: e.className.toString().slice(0, 80), visible: !!e.offsetParent || getComputedStyle(e).position === 'fixed', n: e.querySelectorAll('img').length,
        firmness: imgsIn(e).filter((s) => /firmness-options|cre-t-270/.test(s)) }));
    return containers.slice(0, 12);
  });
  log('gallery containers', JSON.stringify(gal, null, 1));

  if (form === 'desktop') {
    const sel = arm === 'variation' ? '.pdp-gallery-grid button[data-slide="4"]' : '.pdp-gallery-grid button[data-slide="19"]';
    await center(sel); await page.waitForTimeout(800);
    await shot('grid');
    await jsClick(sel); await page.waitForTimeout(2000);
    const lb = await page.evaluate(() => {
      const vis = [...document.querySelectorAll('img')].filter((i) => { const r = i.getBoundingClientRect(); return r.width > 300 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight + 5; });
      return vis.map((i) => (i.currentSrc || i.src).split('/').pop().split('?')[0] + ' ' + Math.round(i.getBoundingClientRect().width));
    });
    log('lightbox visible large images after grid click', lb);
    await shot('lightbox');
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  }

  if (arm === 'variation') {
    // ---------- Buy box ----------
    await center('.cre-t-270-firm-panel'); await page.waitForTimeout(600);
    await shot('buybox');
    const geo = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height].map(Math.round); };
      const ch = document.querySelector('.cre-t-270-firm-change-text').getBoundingClientRect();
      const top = document.elementFromPoint(ch.left + ch.width / 2, ch.top + ch.height / 2);
      const name = document.querySelector('.cre-t-270-firm-name').getBoundingClientRect();
      const topName = document.elementFromPoint(name.left + 5, name.top + name.height / 2);
      return { panel: r('.cre-t-270-firm-panel'), change: r('.cre-t-270-firm-change-text'), select: r('.cre-t-270-firm-select'),
        hitOnChange: top && top.className, hitOnName: topName && topName.className, arrowVisible: !!document.querySelector('.cre-t-270-firm-option .dummySelectFirmness') && getComputedStyle(document.querySelector('.cre-t-270-firm-option .dummySelectFirmness')).display };
    });
    log('panel geometry', JSON.stringify(geo));
    const before = await page.evaluate(() => ({ url: location.search, price: (document.querySelector('.order-form__options') || document.body).innerText.match(/\$[\d,]+/g)?.slice(0, 4) }));
    // Real user-like change through our select
    await page.selectOption('.cre-t-270-firm-select', 'Firmer');
    await page.waitForTimeout(1500);
    const after = await page.evaluate(() => ({
      url: location.search, panel: document.querySelector('.cre-t-270-firm-panel').innerText.replace(/\s+/g, ' ').slice(0, 40),
      orig: document.querySelector('#firmness-select').value, guide: getComputedStyle(document.querySelector('.cre-t-270-firm-label-row .order-form__option-note')).visibility,
      bullet: document.querySelector('.cre-t-270-firm-bullet')?.textContent, cookie: document.cookie.split('; ').filter((c) => /270/.test(c)),
      price: (document.querySelector('.order-form__options') || document.body).innerText.match(/\$[\d,]+/g)?.slice(0, 4), goals: window.__goals.slice(),
    }));
    log('before', JSON.stringify(before)); log('after Firmer', JSON.stringify(after));
    await shot('buybox-firmer');

    // Reload: cookie should restore Firmer
    const variantUrl = after.url;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cre-t-270-firm-panel', { timeout: 40000 }); await page.waitForTimeout(5000);
    log('after reload', JSON.stringify(await page.evaluate(() => ({ url: location.search, orig: document.querySelector('#firmness-select').value, panel: document.querySelector('.cre-t-270-firm-name').textContent, guide: getComputedStyle(document.querySelector('.cre-t-270-firm-label-row .order-form__option-note')).visibility, goals: window.__goals.slice() }))));

    // Variant URL for Plus while the cookie still says Firmer
    const plusId = await page.evaluate(async () => {
      const p = await (await fetch(location.pathname.replace(/\/pages\/.*/, '') + '/products/the-winkbed.js')).json().catch(() => null);
      return p ? p.variants.filter((v) => /Plus/.test(v.title)).map((v) => v.id + ' ' + v.title).slice(0, 3) : null;
    });
    log('plus variants', JSON.stringify(plusId), 'firmer url', variantUrl);
    if (plusId && plusId[0]) {
      const id = plusId[0].split(' ')[0];
      await page.goto(URL + '&variant=' + id, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForSelector('.cre-t-270-firm-panel', { timeout: 40000 }); await page.waitForTimeout(5000);
      log('variant=Plus URL with Firmer cookie', JSON.stringify(await page.evaluate(() => ({ url: location.search, orig: document.querySelector('#firmness-select').value, panel: document.querySelector('.cre-t-270-firm-name').textContent }))));
      await ctx.clearCookies({ name: 'cre-t-270-firmness' }).catch(() => {});
      await page.evaluate(() => { document.cookie = 'cre-t-270-firmness=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; });
      await page.goto(URL + '&variant=' + id, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForSelector('.cre-t-270-firm-panel', { timeout: 40000 }); await page.waitForTimeout(5000);
      log('variant=Plus URL, no cookie', JSON.stringify(await page.evaluate(() => ({ url: location.search, orig: document.querySelector('#firmness-select').value, panel: document.querySelector('.cre-t-270-firm-panel').innerText.replace(/\s+/g, ' ').slice(0, 50), bullet: document.querySelector('.cre-t-270-firm-bullet')?.textContent }))));
      await shot('buybox-plus-url');
    }

    // ---------- Explore ----------
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForSelector('.cre-t-270-explore', { timeout: 40000 }); await page.waitForTimeout(4000);
    await center('.cre-t-270-explore'); await page.waitForTimeout(800);
    await shot('explore-collapsed');
    log('options visible before toggle', await page.evaluate(() => getComputedStyle(document.querySelector('.cre-t-270-explore-options')).display));
    await jsClick('.cre-t-270-explore-toggle'); await page.waitForTimeout(600);
    await shot('explore-open');
    for (const name of ['Soft', 'Plus', 'Luxury Firm']) {
      await jsClick(`.cre-t-270-explore-option[data-firmness="${name}"]`); await page.waitForTimeout(1800);
      log(`explore -> ${name}`, JSON.stringify(await page.evaluate(() => {
        const shown = [...document.querySelectorAll('.winkbed-construction__content-bottom-main-item, .winkbed-construction__accordion-item')]
          .filter((e) => e.offsetParent && e.getBoundingClientRect().height > 50).map((e) => (e.getAttribute('data-attribute') || e.getAttribute('mobile-data-attribute') || e.className.slice(0, 40)) + ': ' + e.innerText.trim().split('\n')[0]);
        return { shown, active: document.querySelector('.cre-t-270-explore-option.cre-t-270-active')?.dataset.firmness, scrollY: Math.round(scrollY), goals: window.__goals.slice() };
      })));
      if (name === 'Plus') await shot('explore-plus-content');
    }
  }

  // ---------- Sticky nav ----------
  await page.evaluate(() => window.scrollTo(0, 2500)); await page.waitForTimeout(1500);
  if (form === 'desktop') {
    const link = await page.evaluate(() => { const t = document.querySelector('.cre37-navigation-link4 .cre37-navigation-link-text'); const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.width > 0 && r.top >= 0 }; });
    log('nav link', JSON.stringify(link));
    await shot('sticky-nav');
    if (link.vis) {
      await page.mouse.click(link.x, link.y); await page.waitForTimeout(2500);
      log('after nav click', JSON.stringify(await page.evaluate(() => {
        const t = document.querySelector('#shopify-section-winkbed-construction').getBoundingClientRect();
        const f = document.querySelector('#firmness'); const fr = f && f.getBoundingClientRect();
        return { scrollY: Math.round(scrollY), constructionTop: Math.round(t.top), firmnessTarget: f ? f.tagName + '.' + f.className.slice(0, 60) + ' top ' + Math.round(fr.top) : null };
      })));
      await shot('after-nav-click');
    }
  }

  // ---------- Video ----------
  await center('.my-thumbnail-overlay'); await page.waitForTimeout(800);
  await shot('video');
  await jsClick('.my-thumbnail-overlay'); await page.waitForTimeout(3000);
  log('video after click', JSON.stringify(await page.evaluate(() => ({ overlay: getComputedStyle(document.querySelector('.my-thumbnail-overlay')).display, iframe: [...document.querySelectorAll('.my-video-container iframe')].map((f) => f.src.slice(0, 120)) }))));
  await shot('video-played');

  log('final goals (queue)', await page.evaluate(() => window.__goals));
  log('goal ids seen in Convert POSTs', [...new Set(net)]);
  log('pageerrors', errs);
  await browser.close();
})().catch((e) => { console.log('FATAL', e.message); process.exit(1); });
