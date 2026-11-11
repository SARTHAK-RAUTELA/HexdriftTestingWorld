// Lotus Car Rental — Test 28 — Sitewide (mobile) — Hide header on scroll down (Convert exp 100053078)
// Spec: hide the sticky header when the user scrolls down; show it again when the user scrolls up.
// Targeting: lotuscarrental.is sitewide, all mobile users. Scope: mobile Chrome + mobile Safari only.
// Run: npx playwright test testing/lotus28-hide-header.spec.js --project="Mobile Chrome (Pixel 5)"
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EXP = '100053078';
const ARMS = [
  { key: 'control', id: '1000257924', hides: false },
  { key: 'variant', id: '1000257925', hides: true },
];
const BASE = 'https://www.lotuscarrental.is';
const HEADER = 'header.sticky.top-0';
const HIDDEN = 'cre-t-28-header-hidden';
const SHOT_ROOT = path.join(__dirname, '..', 'qa-knowledge-base', 'lotus', 'lotus28-screenshots');
const PAGES = ['/our-rental-cars', '/our-rental-cars/4x4', '/insurance', '/faq', '/blog', '/about-us/driving-in-iceland',
  '/rent-a-car-in-iceland/keflavik-airport', '/our-services/airport-shuttle', '/contact'];
const LOCALES = ['/de', '/es'];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const url = (p, arm) => `${BASE}${p}?cro_mode=qa&_conv_eforce=${EXP}.${arm.id}`;

async function shot(page, ti, name) {
  const dir = path.join(SHOT_ROOT, slug(ti.project.name));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file });
  await ti.attach(name, { path: file, contentType: 'image/png' });
}

function watchErrors(page) {
  const errs = [];
  // React #418 (hydration mismatch) fires on some pages in BOTH arms incl. control — site-native, not test-related
  // WebKit reports Microsoft Clarity beacon CORS blocks as pageerrors in both arms — 3rd-party noise
  page.on('pageerror', (e) => { if (!/prismic\.io|React error #418|clarity\.ms/.test(e.message)) errs.push(`pageerror: ${e.message}`); });
  page.on('console', (m) => { if (/cre-t-28/i.test(m.text())) errs.push(`console: ${m.text()}`); });
  return errs;
}

async function open(page, p, arm) {
  await page.goto(url(p, arm), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((exp) => !!window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(2000);
  // cookie banner hidden (no consent given); site promo modal ("Singles Day offer", Base UI dialog) closed via Escape
  // cre-t-18 = another live Lotus test's timed "Private Rate" modal; it intercepts taps (not part of Test 28)
  await page.addStyleTag({ content: '.ch2,#cre-t-18-modal{display:none!important}' }).catch(() => {});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

const state = (page) => page.evaluate(({ HEADER, HIDDEN }) => {
  const h = document.querySelector(HEADER);
  if (!h) return null;
  const r = h.getBoundingClientRect();
  return { y: Math.round(scrollY), top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), hidden: h.classList.contains(HIDDEN) };
}, { HEADER, HIDDEN });

// scroll and let the 100ms debounce + 0.1s transition settle
async function scrollTo(page, y, settle = 450) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(settle);
  return state(page);
}

const visible = (s) => s.top === 0 && s.bottom === s.height;
const offscreen = (s) => s.bottom <= 0;

for (const arm of ARMS) {
  test.describe(`Lotus 28 — ${arm.key}`, () => {
    test(`TC01 ${arm.key}: bucketed + variation markers`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await open(page, '/', arm);
      const r = await page.evaluate(({ EXP, HEADER }) => ({
        bucket: window.convert?.currentData?.experiences?.[EXP]?.variation?.id || null,
        body: document.body.classList.contains('cre-t-28'),
        css: [...document.querySelectorAll('style')].some((s) => /cre-t-28-header-hidden/.test(s.textContent)),
        headers: document.querySelectorAll(HEADER).length,
      }), { EXP, HEADER });
      expect.soft(r.bucket, 'Convert variation id').toBe(arm.id);
      expect.soft(r.body, 'body.cre-t-28').toBe(arm.hides);
      expect.soft(r.css, 'variation CSS injected').toBe(arm.hides);
      expect.soft(r.headers, 'exactly one sticky header').toBe(1);
      await shot(page, ti, `${arm.key}-top`);
      expect.soft(errs, 'no JS errors').toEqual([]);
    });

    test(`TC02 ${arm.key}: scroll down → header ${arm.hides ? 'hidden' : 'stays visible'}`, async ({ page }, ti) => {
      await open(page, '/', arm);
      expect.soft(visible(await state(page)), 'visible at top').toBe(true);
      await scrollTo(page, 300);
      const s = await scrollTo(page, 900);
      if (arm.hides) {
        expect.soft(s.hidden, 'hidden class').toBe(true);
        expect.soft(offscreen(s), `header fully off-screen (bottom=${s.bottom})`).toBe(true);
        // nothing of the header left covering content at the top of the viewport
        const topEl = await page.evaluate((H) => !!document.elementFromPoint(200, 5)?.closest(H), HEADER);
        expect.soft(topEl, 'element at top of viewport is page content, not header').toBe(false);
      } else {
        expect.soft(visible(s), 'control header still pinned').toBe(true);
        expect.soft(s.hidden).toBe(false);
      }
      await shot(page, ti, `${arm.key}-scrolled-down`);
    });

    test(`TC03 ${arm.key}: scroll up → header visible again`, async ({ page }, ti) => {
      await open(page, '/', arm);
      await scrollTo(page, 600);
      await scrollTo(page, 1400);
      const up = await scrollTo(page, 1200);
      expect.soft(visible(up), `visible after scroll up (top=${up.top})`).toBe(true);
      expect.soft(up.hidden).toBe(false);
      await shot(page, ti, `${arm.key}-scrolled-up`);
      // down again re-hides; repeated cycles keep working
      const down2 = await scrollTo(page, 1600);
      expect.soft(down2.hidden, 'hides again on 2nd scroll down').toBe(arm.hides);
      const up2 = await scrollTo(page, 1500);
      expect.soft(visible(up2), 'shows again on 2nd scroll up').toBe(true);
    });

    test(`TC04 ${arm.key}: back at top + small-scroll thresholds`, async ({ page }) => {
      await open(page, '/', arm);
      await scrollTo(page, 800);
      await scrollTo(page, 1000);
      const top = await scrollTo(page, 0);
      expect.soft(visible(top), 'visible at top').toBe(true);
      const near = await scrollTo(page, 15); // inside 20px top offset
      expect.soft(visible(near), 'visible within top offset (15px)').toBe(true);
      // jitter < 10px while hidden must not flicker it back
      await scrollTo(page, 700);
      const a = await scrollTo(page, 900);
      const b = await scrollTo(page, 895);
      expect.soft(b.hidden, '5px up-jitter does not toggle').toBe(a.hidden);
    });

    test(`TC05 ${arm.key}: continuous swipe — header hides while scrolling`, async ({ page }, ti) => {
      // Simulates one finger swipe + momentum: scroll events every frame for ~1.2s with no pause.
      await open(page, '/', arm);
      // start from a REVEALED header mid-page (scroll down, then up), so the swipe starts with it visible
      await scrollTo(page, 1000, 600);
      const start = await scrollTo(page, 800, 600);
      expect.soft(visible(start), 'header revealed before swipe').toBe(true);
      const trace = await page.evaluate(({ HEADER, HIDDEN }) => new Promise((resolve) => {
        const h = document.querySelector(HEADER); const t0 = performance.now(); const out = [];
        const step = () => {
          const t = performance.now() - t0;
          if (t < 1200) window.scrollBy(0, 12);
          out.push([Math.round(t), Math.round(scrollY), h.classList.contains(HIDDEN) ? 1 : 0]);
          if (t < 1700) requestAnimationFrame(step); else resolve(out);
        };
        requestAnimationFrame(step);
      }), { HEADER, HIDDEN });
      const firstHide = trace.find((r) => r[2] === 1);
      const scrollEnd = trace.filter((r, i) => i && r[1] !== trace[i - 1][1]).pop();
      ti.annotations.push({ type: 'timing', description: `first hide at ${firstHide ? firstHide[0] + 'ms' : 'never'}; scrolling stopped at ${scrollEnd?.[0]}ms (y=${scrollEnd?.[1]})` });
      if (arm.hides) {
        expect.soft(firstHide, 'header hid at some point').toBeTruthy();
        expect.soft(firstHide && firstHide[0], 'header should hide during the swipe (<400ms), not only after it stops').toBeLessThan(400);
      } else {
        expect.soft(firstHide, 'control never hides').toBeFalsy();
      }
    });

    test(`TC06 ${arm.key}: hamburger menu after scroll`, async ({ page }, ti) => {
      await open(page, '/', arm);
      await scrollTo(page, 1200);
      await scrollTo(page, 1500);
      await scrollTo(page, 1300); // scroll up reveals header with menu button
      const btn = page.locator('header button[aria-label="Open menu"]');
      await expect.soft(btn).toBeInViewport();
      await btn.click();
      await page.waitForTimeout(900);
      const overlay = page.locator('div.fixed.inset-0.z-\\[60\\]');
      await expect.soft(overlay, 'mobile menu overlay open').toBeVisible();
      await shot(page, ti, `${arm.key}-menu-open`);
      await page.locator('button[aria-label*="lose" i]:visible').first().click().catch(() => page.keyboard.press('Escape'));
      await page.waitForTimeout(700);
      const s = await state(page);
      expect.soft(visible(s), 'header visible after closing menu').toBe(true);
    });

    test(`TC07 ${arm.key}: sitewide — English pages`, async ({ page }, ti) => {
      test.setTimeout(400000);
      const errs = watchErrors(page);
      const bad = [];
      for (const p of PAGES) {
        await open(page, p, arm);
        const body = await page.evaluate(() => document.body.classList.contains('cre-t-28'));
        const docH = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        const mid = Math.min(900, docH - 50);
        await scrollTo(page, Math.round(mid / 2));
        const down = await scrollTo(page, mid);
        let up = await scrollTo(page, mid - 150);
        if (!visible(up)) { // re-sample: distinguish slow transition (settles) from stuck header
          await page.waitForTimeout(1000);
          const again = await state(page);
          ti.annotations.push({ type: 'resample', description: `${p}: up@450ms top=${up.top} → up@1450ms top=${again.top}` });
          up = again;
        }
        const ok = arm.hides ? body && down.hidden && offscreen(down) && visible(up) : !body && visible(down) && visible(up);
        if (!ok) bad.push(`${p}: body=${body} down=${JSON.stringify(down)} up=${JSON.stringify(up)}`);
        if (p === '/our-rental-cars') { await scrollTo(page, mid + 300); await shot(page, ti, `${arm.key}-our-rental-cars-down`); }
      }
      expect.soft(bad, 'pages where behaviour is wrong').toEqual([]);
      expect.soft(errs, 'no JS errors').toEqual([]);
    });

    test(`TC08 ${arm.key}: sitewide — localised pages (/de, /es)`, async ({ page }, ti) => {
      const res = [];
      for (const p of LOCALES) {
        await open(page, p, arm);
        const r = await page.evaluate((EXP) => ({ bucket: window.convert?.currentData?.experiences?.[EXP]?.variation?.id || null, body: document.body.classList.contains('cre-t-28') }), EXP);
        await scrollTo(page, 500);
        const down = await scrollTo(page, 900);
        res.push({ p, ...r, hidden: down.hidden });
        if (p === '/de') await shot(page, ti, `${arm.key}-de-scrolled-down`);
      }
      ti.annotations.push({ type: 'locales', description: JSON.stringify(res) });
      for (const r of res) expect.soft(r.bucket, `${r.p} bucketed into ${arm.key}`).toBe(arm.id);
      if (arm.hides) for (const r of res) expect.soft(r.hidden, `${r.p} header hides`).toBe(true);
    });

    test(`TC09 ${arm.key}: >1024px gate + rotate/resize while hidden`, async ({ page }, ti) => {
      await open(page, '/', arm);
      await scrollTo(page, 600);
      const hiddenNarrow = await scrollTo(page, 1000);
      expect.soft(hiddenNarrow.hidden).toBe(arm.hides);
      await page.setViewportSize({ width: 1100, height: 800 });
      await page.waitForTimeout(500);
      await scrollTo(page, 1200);
      const wide = await scrollTo(page, 1400);
      expect.soft(visible(wide), `header visible at 1100px after resize (top=${wide.top}, hidden=${wide.hidden})`).toBe(true);
      await shot(page, ti, `${arm.key}-resized-1100`);
    });
  });
}
