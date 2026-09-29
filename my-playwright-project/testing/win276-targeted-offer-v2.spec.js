// WIN276 — WinkBeds "Other - Targeted Offer V2" (Convert exp 100350628)
// Control = WIN257 modal for Cohort 1 only; Variation = Cohort 1 + Cohort 2.
// Cohort 1 = clicked a[href="/checkout"] (cookie cre_276_checkout_visited) + 1 eligible WinkBed in cart.
// Cohort 2 = eligible WinkBed added to cart (ls cre276_cart_added_ts), no checkout, 1h+ inactive, returns.
// State is seeded directly so each rule can be tested in isolation. Real carts on production, fresh contexts.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.winkbeds.com';
const SEED_URL = `${BASE}/pages/sleep-calculator?utm_campaign=Cro276mode`;
const ARM = { control: '1003184697', variation: '1003184698' };
const forceUrl = (arm, p = '/pages/shop-winkbed') => `${BASE}${p}?utm_campaign=Cro276mode&_conv_eforce=100350628.${ARM[arm]}`;
const PLAIN_TWIN = 33210297426;          // The LUXURY FIRM WinkBed - Twin
const COOLED_TWIN = 47108603052219;      // Luxury Firm - Twin with Frost Cooling Cover
const TWO_HOURS = 2 * 60 * 60 * 1000;
// Kept outside test-results/, which Playwright wipes at the start of every run.
const OUT = path.join(__dirname, '..', 'qa-knowledge-base', 'winkbeds', 'win276-screenshots');
const RESULTS = path.join(OUT, 'results.jsonl');

const isWebKit = (tp) => /Safari/.test(tp.project.name);

async function prep(page) {
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  // Record modal-open time relative to navigation start (DOMContentLoaded is very late on mobile).
  await page.addInitScript(() => {
    const iv = setInterval(() => {
      if (document.body && document.body.classList.contains('cre-t-276-modal-open')) { window.__qaModalAt = performance.now(); clearInterval(iv); }
    }, 50);
  });
  page.__logs = [];
  page.on('console', (m) => { const t = m.text(); if (/276|Activated/i.test(t)) page.__logs.push(t); });
}

async function go(page, url, tp) {
  await page.goto(url, { waitUntil: isWebKit(tp) ? 'commit' : 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => document.body && document.body.children.length > 3, null, { timeout: 60000 });
  return Date.now();
}

// Seed origin state on a neutral page, then load the force URL fresh.
async function seed(page, tp, { cart = null, checkoutCookie = false, cartAddedTs = null, lastActiveAgo = null }) {
  await go(page, SEED_URL, tp);
  await page.waitForTimeout(2500);
  await page.evaluate(async ({ cart, checkoutCookie, cartAddedTs, lastActiveAgo }) => {
    await fetch('/cart/clear.js', { method: 'POST' });
    if (cart) await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: { [cart]: 1 } }) });
    if (checkoutCookie) document.cookie = 'cre_276_checkout_visited=true; path=/;';
    else document.cookie = 'cre_276_checkout_visited=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('cre276_cart_added_ts');
    if (cartAddedTs !== null) localStorage.setItem('cre276_cart_added_ts', String(Date.now() - cartAddedTs));
    if (lastActiveAgo !== null) localStorage.setItem('cre276_last_active_ts', String(Date.now() - lastActiveAgo));
  }, { cart, checkoutCookie, cartAddedTs, lastActiveAgo });
}

async function state(page) {
  return page.evaluate(() => {
    const c = document.querySelector('.cre-t-276-modal-container');
    return {
      modalOpen: document.body.classList.contains('cre-t-276-modal-open'),
      modalVisible: !!c && getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().height > 0,
      armClass: [...document.body.classList].filter((x) => /cre-t-276-(control|variation)/.test(x)),
      activated: window.test_276_Experiment === 1,
      helpers: !!window.CRE276_helpers,
      checkoutCookie: document.cookie.includes('cre_276_checkout_visited=true'),
      bucket: (decodeURIComponent(document.cookie).match(/100350628\.\{v\.(\d+)/) || [])[1] || null,
    };
  });
}

// Poll up to `ms` for the modal; returns seconds from navigation start to modal-open (or null).
async function waitModal(page, t0, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const at = await page.evaluate(() => window.__qaModalAt || null).catch(() => null);
    if (at) return +(at / 1000).toFixed(1);
    await page.waitForTimeout(250);
  }
  return null;
}

async function shot(page, tp, name) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = `${tp.project.name.replace(/[^a-z0-9]+/gi, '_')}__${name}.png`;
  await page.screenshot({ path: path.join(OUT, file), timeout: 60000 }).catch(() => {});
  return file;
}

function record(tp, id, data) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.appendFileSync(RESULTS, JSON.stringify({ project: tp.project.name, id, ...data }) + '\n');
}

test.setTimeout(180000);

test.beforeEach(async ({ page }) => prep(page));

// ── A. Cohort 1 (checkout abandoner) ──────────────────────────────────────────
for (const arm of ['control', 'variation']) {
  test(`TC-01/02 Cohort 1 sees modal in ${arm}`, async ({ page }, tp) => {
    await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
    const t0 = await go(page, forceUrl(arm), tp);
    const secs = await waitModal(page, t0, 20000);
    await page.waitForTimeout(1200);
    const s = await state(page);
    const file = await shot(page, tp, `c1-${arm}`);
    record(tp, `C1-${arm}`, { secs, ...s, file, logs: page.__logs });
    expect(secs, 'modal should open for Cohort 1').not.toBeNull();
    expect(s.modalVisible).toBe(true);
    expect(s.armClass).toEqual([`cre-t-276-${arm}`]);
    expect(s.checkoutCookie, 'checkout cookie consumed after show').toBe(false);
  });
}

test('TC-03 Cohort 1 opens at the same delay in both arms', async ({}, tp) => {
  const rows = fs.readFileSync(RESULTS, 'utf8').trim().split('\n').map(JSON.parse).filter((r) => r.project === tp.project.name);
  const c = rows.filter((r) => r.id === 'C1-control').pop(), v = rows.filter((r) => r.id === 'C1-variation').pop();
  record(tp, 'C1-delay-compare', { control: c && c.secs, variation: v && v.secs });
  expect(c && v && c.secs && v.secs, 'both arms measured').toBeTruthy();
  expect(Math.abs(v.secs - c.secs), `Cohort 1 delay control=${c.secs}s variation=${v.secs}s`).toBeLessThan(2);
});

// ── B. Cohort 2 (cart returner) ───────────────────────────────────────────────
test('TC-04 Cohort 2 idle return → Variation shows modal ~5s after load', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 25000);
  await page.waitForTimeout(1200);
  const s = await state(page);
  const file = await shot(page, tp, 'c2-variation');
  record(tp, 'C2-variation-idle', { secs, ...s, file, logs: page.__logs });
  expect(secs, 'modal should open for Cohort 2 in Variation').not.toBeNull();
  expect(s.modalVisible).toBe(true);
  expect(secs, `spec: 5s after page load, observed ${secs}s`).toBeLessThanOrEqual(7);
});

test('TC-05 Cohort 2 in Control → bucketed into experiment, no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('control'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  const file = await shot(page, tp, 'c2-control');
  record(tp, 'C2-control', { secs, ...s, file, logs: page.__logs });
  expect(s.activated, 'experiment should still be triggered for Cohort 2').toBe(true);
  expect(secs, 'Control must not show modal to Cohort 2').toBeNull();
});

test('TC-06 Cohort 2 who scrolls/moves mouse right after landing still gets the modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  await page.goto(forceUrl('variation'), { waitUntil: 'commit', timeout: 90000 });
  const t0 = Date.now();
  // Interact 1.5s after navigation start, before any 3s/5s timer has run.
  await page.waitForFunction(() => performance.now() > 1500, null, { timeout: 60000 });
  expect(await page.evaluate(() => !!window.__qaModalAt), 'modal already open before interaction; test would be meaningless').toBe(false);
  // A real returning visitor scrolls / moves the mouse within the first seconds.
  // Keep browsing (scroll/mouse every 0.5s for ~6s) so the listener is attached for at least part of it.
  for (let i = 0; i < 12; i++) {
    await page.evaluate((i) => { window.scrollBy(0, i % 2 ? -150 : 150); window.dispatchEvent(new Event('scroll')); }, i).catch(() => {});
    if (!tp.project.use.isMobile) await page.mouse.move(400 + i * 5, 300).catch(() => {});
    await page.waitForTimeout(500);
  }
  const secs = await waitModal(page, t0, 20000);
  const s = await state(page);
  const lastActiveAge = await page.evaluate(() => Date.now() - +localStorage.getItem('cre276_last_active_ts'));
  const file = await shot(page, tp, 'c2-variation-interacted');
  record(tp, 'C2-variation-interacted', { secs, lastActiveAge, ...s, file, logs: page.__logs });
  expect(secs, 'user who interacts on return should still count as a new session').not.toBeNull();
});

test('TC-07 Cohort 2 still in original session (active <1h) → no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: 10 * 60 * 1000, lastActiveAgo: 10 * 60 * 1000 });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C2-same-session', { secs, ...s });
  expect(secs).toBeNull();
  expect(s.activated).toBe(false);
});

test('TC-08 Cohort 2 but mattress already has Frost Cooling Cover → no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: COOLED_TWIN, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C2-cooled', { secs, ...s });
  expect(secs).toBeNull();
});

test('TC-09 Cohort 2 flag set but cart now empty → no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: null, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C2-empty-cart', { secs, ...s });
  expect(secs).toBeNull();
});

test('TC-10 Non-qualifying visitor (no cohort signals) → experiment not triggered', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 12000);
  const s = await state(page);
  record(tp, 'no-signal', { secs, ...s });
  expect(secs).toBeNull();
  expect(s.activated).toBe(false);
});

// ── C. Real add-to-cart must arm Cohort 2 ────────────────────────────────────
test('TC-11 Real Buy Box "Add to Cart" records the Cohort 2 cart-added flag', async ({ page }, tp) => {
  await seed(page, tp, {});
  await go(page, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`, tp);
  await page.waitForSelector('#orderForm.loaded .order-form__add.button', { timeout: 60000 });
  await page.waitForTimeout(3000);
  const reqs = [];
  page.on('request', (r) => { if (/\/cart\/(add|update)/.test(r.url()) && r.method() === 'POST') reqs.push(r.url().replace(BASE, '')); });
  await page.evaluate(() => document.querySelector('.order-form__add.button').click());
  await page.waitForTimeout(8000);
  const r = await page.evaluate(async () => ({
    ts: localStorage.getItem('cre276_cart_added_ts'),
    cart: (await (await fetch('/cart.js')).json()).items.map((i) => `${i.title} x${i.quantity}`),
  }));
  const file = await shot(page, tp, 'real-atc');
  record(tp, 'real-atc', { ...r, reqs: [...new Set(reqs)], file });
  expect(r.cart.length, 'item was added').toBeGreaterThan(0);
  expect(r.ts, `cart-added flag not written; site used ${[...new Set(reqs)].join(', ')}`).not.toBeNull();
});

// ── D. Modal behaviour (variation, Cohort 1 seed) ────────────────────────────
test('TC-12 Modal copy, close icon and overlay dismiss', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
  const t0 = await go(page, forceUrl('variation'), tp);
  expect(await waitModal(page, t0, 20000)).not.toBeNull();
  await page.waitForTimeout(1000);
  await shot(page, tp, 'modal-ui');
  const copy = await page.evaluate(() => ({
    eyebrow: document.querySelector('.cre-t-276-eyebrow').innerText.trim(),
    title: document.querySelector('.cre-t-276-title').innerText.trim(),
    price: document.querySelector('.cre-t-276-price-line').innerText.trim(),
    cta: document.querySelector('.cre-t-276-cta-text').innerText.trim(),
    blur: getComputedStyle(document.querySelector('main.main') || document.body).filter,
    box: (() => { const r = document.querySelector('.cre-t-276-modal-container').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, vw: innerWidth, vh: innerHeight }; })(),
  }));
  await page.evaluate(() => document.querySelector('.cre-t-276-modal-close').click());
  await page.waitForTimeout(600);
  const closed = !(await page.evaluate(() => document.body.classList.contains('cre-t-276-modal-open')));
  record(tp, 'modal-ui', { copy, closed });
  expect(copy.eyebrow).toMatch(/FREE LIMITED-TIME OFFER/i);
  expect(copy.title).toContain('Frost™ Cooling Fabric Free');
  expect(copy.price).toMatch(/Regularly \$125\. Yours free\. Ends tonight at 11:59 PM\./);
  expect(copy.cta).toMatch(/UPGRADE MY MATTRESS FOR FREE/i);
  expect(copy.box.l).toBeGreaterThanOrEqual(0);
  expect(copy.box.r).toBeLessThanOrEqual(copy.box.vw + 1);
  expect(closed).toBe(true);
});

test('TC-13 CTA swaps mattress to Frost Cooling Cover and goes to discounted checkout', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  expect(await waitModal(page, t0, 25000), 'Cohort 2 modal needed for CTA test').not.toBeNull();
  await page.waitForTimeout(800);
  const nav = page.waitForURL(/checkout|discount/, { timeout: 45000 }).catch(() => null);
  await page.evaluate(() => document.querySelector('.cre-t-276-cta').click());
  await nav;
  await page.waitForTimeout(4000);
  const url = page.url();
  const file = await shot(page, tp, 'cta-checkout');
  const cart = await page.request.get(`${BASE}/cart.js`).then((r) => r.json()).catch(() => ({ items: [] }));
  const items = cart.items.map((i) => `${i.title} x${i.quantity}`);
  record(tp, 'cta', { url, items, file });
  expect(items.some((t) => /Frost Cooling Cover/i.test(t)), `cart after CTA: ${items.join('; ')}`).toBe(true);
  expect(items.filter((t) => /winkbed/i.test(t)).length).toBe(1);
  expect(url).toMatch(/checkout/);
});

// ── E. After bucketing: does tracking keep running on later pages? ─────────────
test('TC-14 After Variation bucketing, deployment helpers still load on next page', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
  const t0 = await go(page, forceUrl('variation'), tp);
  await waitModal(page, t0, 20000);
  await go(page, `${BASE}/?utm_campaign=Cro276mode`, tp);
  await page.waitForTimeout(8000);
  const s = await state(page);
  const cookie = await page.evaluate(() => decodeURIComponent(document.cookie).match(/_conv_v=[^;]*/)?.[0] || '');
  record(tp, 'post-bucket-next-page', { ...s, varInCookie: cookie.includes('1003184698') });
  expect(s.helpers, 'cre-t-276-deployment (activity/cart/checkout tracking) must keep running').toBe(true);
});

// ── F. Frequency: Cohort 2 modal after it was already shown once ───────────────
test('TC-15 Cohort 2 modal is not re-shown on every later return session', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, lastActiveAgo: TWO_HOURS });
  let t0 = await go(page, forceUrl('variation'), tp);
  const first = await waitModal(page, t0, 25000);
  // Simulate the user leaving again for 2h and coming back.
  await page.evaluate((ago) => localStorage.setItem('cre276_last_active_ts', String(Date.now() - ago)), TWO_HOURS);
  t0 = await go(page, forceUrl('variation'), tp);
  const second = await waitModal(page, t0, 25000);
  const ts = await page.evaluate(() => localStorage.getItem('cre276_cart_added_ts'));
  record(tp, 'C2-repeat', { first, second, cartAddedTsStillSet: !!ts });
  expect(first).not.toBeNull();
  expect(second, 'modal re-appeared on the 2nd return session (no frequency cap)').toBeNull();
});
