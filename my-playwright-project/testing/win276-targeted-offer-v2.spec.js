// WIN276 — WinkBeds "Other - Targeted Offer V2" (Convert exp 100350628)
// Control = WIN257 modal for Cohort 1 only; Variation = Cohort 1 + Cohort 2.
// Cohort 1 = clicked a[href="/checkout"] (cookie cre_276_checkout_visited) + 1 eligible WinkBed in cart.
// Cohort 2 = eligible WinkBed added to cart (cookie cre276_cart_added_ts), never reached checkout
// (cookie cre276_checkout_reached_ever), left 1h+ ago (cookie cre276_left_at_ts, written on tab-hidden/pagehide).
// Round 2 (2026-09-29 PM): state moved from localStorage to cookies after the client's fix.
// Round 3 (2026-09-30): Variation code re-shipped (vB.js/vB.css == live bundle _s_t 2026-09-30 04:47Z); results-r3.jsonl.
// Round 4 (2026-09-30 PM): client moved cohort logic into the deployment; session clock is cre276_session_ts again
// (activity-refreshed). Both the old (left_at) and new (session_ts) cookies are seeded so either model is exercised.
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
const SOFTER_TWIN = 33210269138;           // The SOFTER WinkBed - Twin (a second, different WinkBed)
const PILLOW = 47501937901755;             // Resort Pillow (non-mattress item)
const TWO_HOURS = 2 * 60 * 60 * 1000;
// Round 4 QA build uses a 2-minute "new session" threshold (ONE_HOUR_MS = 2 * 60 * 1000, confirmed by the client for testing;
// must be 1h at launch). "Same session" cases therefore seed 30s, which is inside both thresholds.
const SAME_SESSION = 30 * 1000;
// Last-seen clock: cre276_left_at_ts (round 2/3 model) and cre276_session_ts (round 4 model).
const SESSION_COOKIES = ['cre276_left_at_ts', 'cre276_session_ts'];
const sessionCookies = (agoMs) => SESSION_COOKIES.map((name) => ({ name, value: String(Date.now() - agoMs), domain: 'www.winkbeds.com', path: '/', expires: Math.floor(Date.now() / 1000) + 86400 }));
// Kept outside test-results/, which Playwright wipes at the start of every run.
const OUT = path.join(__dirname, '..', 'qa-knowledge-base', 'winkbeds', 'win276-screenshots');
const RESULTS = path.join(OUT, process.env.WIN276_RESULTS || 'results-r6.jsonl');

const isWebKit = (tp) => /Safari/.test(tp.project.name);

// WIN276_LOCAL=1 swaps the activation / Control / Variation code inside the live Convert bundle for the
// local fixed files in local_testing/Local2/variation/, so fixes can be verified before they are published.
const LOCAL_DIR = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation');
// WIN276_LOCAL=1 swaps all of them; WIN276_LOCAL=deploy,variation swaps only the named blocks.
const LOCAL_CODE = [
  ['deploy', '{"id":"100350629","name"', 'win276-deployment.js'],
  ['activation', '{"id":"100350630","name"', 'win276-activation.js'],
  ['control', '{"id":"1003184697","name"', 'win276-control.js'],
  ['variation', '{"id":"1003184698","name"', 'vB.js'],
];
function swapBundleCode(src) {
  const pick = process.env.WIN276_LOCAL === '1' ? null : process.env.WIN276_LOCAL.split(',');
  for (const [key, marker, file] of LOCAL_CODE) {
    if (pick && !pick.includes(key)) continue;
    const a = src.indexOf(marker);
    const s = src.indexOf('(function () {', a);
    const e = src.lastIndexOf('})();', src.indexOf('}}}', s)) + '})();'.length;
    if (a < 0 || s < 0 || e <= s) throw new Error(`WIN276_LOCAL: code block for ${file} not found in bundle`);
    src = src.slice(0, s) + fs.readFileSync(path.join(LOCAL_DIR, file), 'utf8') + src.slice(e);
  }
  return src;
}

async function prep(page) {
  if (process.env.WIN276_LOCAL) {
    await page.route(/convertexperiments\.com\/v1\/js\/1003415-1003290\.js/, async (route) => {
      const res = await route.fetch();
      await route.fulfill({ response: res, body: swapBundleCode(await res.text()) });
    });
  }
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  // Record modal-open time relative to navigation start (DOMContentLoaded is very late on mobile).
  await page.addInitScript(() => {
    const iv = setInterval(() => {
      if (document.body && document.body.classList.contains('cre-t-276-modal-open')) { window.__qaModalAt = performance.now(); clearInterval(iv); }
    }, 50);
  });
  page.__logs = [];
  page.on('console', (m) => { const t = m.text(); if (/276|Activated/i.test(t)) page.__logs.push(t); });
  // Goals: 100334580 = modal shown (code trigger), 100334581 = CTA click (Convert click goal), 100334268 = stale WIN257 goal.
  // Seen in Convert tracking requests and in the base64 `__event` cart attribute Convert writes.
  page.__goals = new Set();
  page.on('request', (r) => {
    let blob = r.url() + ' ' + (r.postData() || '');
    const m = blob.match(/__event%22%3A%22([^%&]+)|"__event":"([^"]+)"/);
    if (m) { try { blob += Buffer.from(decodeURIComponent(m[1] || m[2]), 'base64').toString(); } catch (e) {} }
    for (const g of ['100334580', '100334581', '100334268']) if (blob.includes(g)) page.__goals.add(g);
  });
}

async function go(page, url, tp) {
  await page.goto(url, { waitUntil: isWebKit(tp) ? 'commit' : 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => document.body && document.body.children.length > 3, null, { timeout: 60000 });
  return Date.now();
}

// Seed origin state. The site-wide pagehide handler rewrites cre276_left_at_ts on every unload, so
// cookies are written AFTER leaving the seed page (= user closed the tab and came back later).
// checkoutSession: Shopify's localStorage `__ui` checkout marker, which a real checkout visit leaves behind
// (WIN257's second Cohort 1 signal). Defaults to on whenever the checkout cookie is seeded.
async function seed(page, tp, { cart = null, checkoutCookie = false, checkoutSession = checkoutCookie, reachedEver = false, cartAddedTs = null, leftAgo = null }) {
  await go(page, SEED_URL, tp);
  await page.waitForTimeout(2500);
  await page.evaluate(async ({ cart, checkoutSession }) => {
    if (checkoutSession) localStorage.setItem('__ui', JSON.stringify({ 2: [{ checkoutSessionIdentifier: 'qa-seeded-session' }] }));
    else localStorage.removeItem('__ui');
    await fetch('/cart/clear.js', { method: 'POST' });
    if (cart) await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: typeof cart === 'object' ? cart : { [cart]: 1 } }) });
  }, { cart, checkoutSession });
  await page.goto('about:blank');
  const ctx = page.context();
  const names = ['cre_276_checkout_visited', 'cre276_checkout_reached_ever', 'cre276_cart_added_ts', 'cre276_left_at_ts', 'cre276_c2_shown', 'cre276_session_ts', 'cre276_cohort2_shown', 'cre276_active_cohort'];
  await ctx.clearCookies({ name: new RegExp('^(' + names.join('|') + ')$') });
  const ck = (name, value, session) => ({ name, value, domain: 'www.winkbeds.com', path: '/', ...(session ? {} : { expires: Math.floor(Date.now() / 1000) + 30 * 86400 }) });
  const add = [];
  if (checkoutCookie) add.push(ck('cre_276_checkout_visited', 'true', true));
  if (reachedEver || checkoutCookie) add.push(ck('cre276_checkout_reached_ever', 'true'));
  if (cartAddedTs !== null) add.push(ck('cre276_cart_added_ts', String(Date.now() - cartAddedTs)));
  if (leftAgo !== null) for (const n of SESSION_COOKIES) add.push(ck(n, String(Date.now() - leftAgo)));
  if (add.length) await ctx.addCookies(add);
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
// WebKit loads this site 2-3x slower (Cohort 2 lands at 26-30s on iPhone), so its window is doubled.
const isWebKitPage = (page) => page.context().browser().browserType().name() === 'webkit';
async function waitModal(page, t0, ms) {
  const end = Date.now() + (isWebKitPage(page) ? ms * 2 : ms);
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
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
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
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('control'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  const file = await shot(page, tp, 'c2-control');
  record(tp, 'C2-control', { secs, ...s, file, logs: page.__logs });
  expect(s.activated, 'experiment should still be triggered for Cohort 2').toBe(true);
  expect(secs, 'Control must not show modal to Cohort 2').toBeNull();
});

test('TC-06 Cohort 2 who scrolls/moves mouse right after landing still gets the modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
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
  const leftAge = await page.evaluate(() => Date.now() - +(document.cookie.match(/cre276_(?:session_ts|left_at_ts)=([0-9]+)/) || [])[1]);
  const file = await shot(page, tp, 'c2-variation-interacted');
  record(tp, 'C2-variation-interacted', { secs, leftAge, ...s, file, logs: page.__logs });
  expect(secs, 'user who interacts on return should still count as a new session').not.toBeNull();
});

test('TC-07 Cohort 2 still in original session (active <1h) → no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: SAME_SESSION, leftAgo: SAME_SESSION });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C2-same-session', { secs, ...s });
  expect(secs).toBeNull();
  expect(s.activated).toBe(false);
});

test('TC-08 Cohort 2 but mattress already has Frost Cooling Cover → no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: COOLED_TWIN, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C2-cooled', { secs, ...s });
  expect(secs).toBeNull();
});

test('TC-09 Cohort 2 flag set but cart now empty → no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: null, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
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
    ts: (document.cookie.match(/cre276_cart_added_ts=([0-9]+)/) || [])[1] || null,
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

test('TC-13 CTA: loading state, swaps to Frost Cooling Cover (same firmness/size/qty), discounted checkout, click goal', async ({ page }, tp) => {
  // Seeded as Cohort 1: the CTA code is identical for both cohorts, and Cohort 1 does not depend on the session clock.
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
  const t0 = await go(page, forceUrl('variation'), tp);
  expect(await waitModal(page, t0, 25000), 'modal needed for CTA test').not.toBeNull();
  await page.waitForTimeout(800);
  const before = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).items.map((i) => `${i.title} x${i.quantity}`));
  const nav = page.waitForURL(/checkout|discount/, { timeout: 45000 }).catch(() => null);
  await page.click('.cre-t-276-cta');
  const loading = await page.evaluate(() => ({
    cls: document.body.classList.contains('cre-t-276-cta-clicked'),
    spinner: getComputedStyle(document.querySelector('.cre-t-276-spinner')).display,
    text: getComputedStyle(document.querySelector('.cre-t-276-cta-text')).display,
  })).catch(() => null);
  await nav;
  await page.waitForTimeout(4000);
  const url = page.url();
  const file = await shot(page, tp, 'cta-checkout');
  const cart = await page.request.get(`${BASE}/cart.js`).then((r) => r.json()).catch(() => ({ items: [] }));
  const items = cart.items.map((i) => `${i.title} x${i.quantity}`);
  // The code shows on the Shopify checkout order summary (no discount_code cookie on this store).
  const discount = await page.locator('body').innerText().then((t) => (t.match(/FROST8UYR31/) || [])[0] || null).catch(() => null);
  record(tp, 'cta', { url, before, items, loading, discount, goals: [...page.__goals], file });
  expect(loading && loading.cls && loading.spinner !== 'none' && loading.text === 'none', `loading state ${JSON.stringify(loading)}`).toBe(true);
  expect(items, 'plain mattress removed, cooled twin of the same firmness added at qty 1').toEqual(['The LUXURY FIRM WinkBed - Twin with Frost Cooling Cover x1']);
  expect(url).toMatch(/checkout/);
  expect(discount, 'discount code applied on checkout').toBe('FROST8UYR31');
  expect(page.__goals.has('100334581'), `CTA click goal 100334581 sent (seen: ${[...page.__goals]})`).toBe(true);
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
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  let t0 = await go(page, forceUrl('variation'), tp);
  const first = await waitModal(page, t0, 40000);
  // Simulate the user leaving again for 2h and coming back.
  await page.goto('about:blank');
  await page.context().addCookies(sessionCookies(TWO_HOURS));
  t0 = await go(page, forceUrl('variation'), tp);
  const second = await waitModal(page, t0, 40000);
  const ts = await page.evaluate(() => (document.cookie.match(/cre276_cart_added_ts=([0-9]+)/) || [])[1]);
  record(tp, 'C2-repeat', { first, second, cartAddedTsStillSet: !!ts });
  expect(first).not.toBeNull();
  expect(second, 'modal re-appeared on the 2nd return session (no frequency cap)').toBeNull();
});

// ── G. Round 2 additions ───────────────────────────────────────────────────────
test('TC-16 Cohort 2 who ever reached checkout is excluded (Variation)', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, reachedEver: true, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C2-reached-checkout-ever', { secs, ...s });
  expect(secs, 'checkout visitor must stay out of Cohort 2').toBeNull();
  expect(s.activated).toBe(false);
});

test('TC-17 Tab hidden 1h+ then refocused (no reload) → Variation shows modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, cartAddedTs: SAME_SESSION, leftAgo: SAME_SESSION });
  const t0 = await go(page, forceUrl('variation'), tp);
  expect(await waitModal(page, t0, 10000), 'same session: no modal before the tab is backgrounded').toBeNull();
  // The tab was hidden 2h ago (what the visibilitychange handler would have recorded), now it becomes visible.
  // Written with the same attributes as seed() so there is exactly one cookie of this name.
  await page.context().addCookies(sessionCookies(TWO_HOURS));
  const copies = await page.evaluate(() => document.cookie.split('; ').filter((c) => c.startsWith('cre276_session_ts=')).length);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const t1 = Date.now();
  let at = null;
  while (Date.now() - t1 < (isWebKitPage(page) ? 40000 : 20000)) { if (await page.evaluate(() => document.body.classList.contains('cre-t-276-modal-open'))) { at = +((Date.now() - t1) / 1000).toFixed(1); break; } await page.waitForTimeout(250); }
  const s = await state(page);
  await shot(page, tp, 'c2-tab-refocus');
  record(tp, 'C2-tab-refocus', { secsAfterRefocus: at, leftAtCopies: copies, ...s });
  expect(at, 'modal after refocus').not.toBeNull();
});

// ── H. Round 3 fix verification ────────────────────────────────────────────────
test('TC-18 Checkout cookie without Shopify checkout session (__ui) → not Cohort 1, no modal', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true, checkoutSession: false });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, 'C1-no-checkout-session', { secs, ...s });
  expect(secs, 'WIN257 requires checkoutSessionIdentifier as well as the cookie').toBeNull();
  expect(s.activated).toBe(false);
});

// ── I. Round 4: activity-based session clock (cre276_session_ts), real add-to-cart, nothing seeded ──
async function realAtc(page, tp, url) {
  await go(page, url, tp);
  await page.waitForSelector('#orderForm.loaded .order-form__add.button', { timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('.order-form__add.button').click());
  await page.waitForTimeout(8000);
  return page.evaluate(() => ({ added: (document.cookie.match(/cre276_cart_added_ts=([0-9]+)/) || [])[1] || null, session: (document.cookie.match(/cre276_session_ts=([0-9]+)/) || [])[1] || null }));
}
const nudge = async (page, tp, i) => {
  await page.evaluate((i) => { window.scrollBy(0, i % 2 ? -120 : 120); window.dispatchEvent(new Event('scroll')); }, i).catch(() => {});
  if (!tp.project.use.isMobile) await page.mouse.move(300 + (i % 40) * 5, 300).catch(() => {});
};

test('TC-19 Idle 1h+ on the add-to-cart page, then the user moves again → Variation shows modal', async ({ page }, tp) => {
  test.setTimeout(240000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, forceUrl('variation'));
  expect(armed.added, 'real ATC armed Cohort 2').not.toBeNull();
  // Visible tab left idle for 2h: backdate the session clock the same way the site writes it (document.cookie).
  await page.evaluate(() => { document.cookie = `cre276_session_ts=${Date.now() - 2 * 3600e3}; expires=${new Date(Date.now() + 30 * 864e5).toUTCString()}; path=/;`; });
  await page.waitForTimeout(6000); // past the 5s activity throttle
  await page.evaluate(() => { window.__qaModalAt = null; });
  const t1 = Date.now();
  for (let i = 0; i < 4; i++) { await nudge(page, tp, i); await page.waitForTimeout(400); }
  let at = null;
  while (Date.now() - t1 < (isWebKitPage(page) ? 40000 : 20000)) { if (await page.evaluate(() => document.body.classList.contains('cre-t-276-modal-open'))) { at = +((Date.now() - t1) / 1000).toFixed(1); break; } await page.waitForTimeout(250); }
  const s = await state(page);
  await shot(page, tp, 'c2-idle-same-page');
  record(tp, 'C2-idle-same-page', { secsAfterActivity: at, armed, ...s, logs: page.__logs });
  expect(at, 'returning after 1h+ idle on the same tab should show the offer').not.toBeNull();
});

test('TC-20 User keeps browsing other pages after add-to-cart (never leaves) → no modal', async ({ page }, tp) => {
  test.setTimeout(420000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added, 'real ATC armed Cohort 2').not.toBeNull();
  // Continuous browsing on another page for 2.5 min (activity every 2s).
  await go(page, `${BASE}/pages/sleep-calculator?utm_campaign=Cro276mode`, tp);
  const until = Date.now() + 150000;
  for (let i = 0; Date.now() < until; i++) { await nudge(page, tp, i); await page.waitForTimeout(2000); }
  const beforeNav = await page.evaluate(() => Date.now() - +((document.cookie.match(/cre276_session_ts=([0-9]+)/) || [])[1] || 0));
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 20000);
  const s = await state(page);
  await shot(page, tp, 'c2-still-browsing');
  record(tp, 'C2-still-browsing', { secs, sessionTsAgeMsBeforeNav: beforeNav, armed, ...s, logs: page.__logs });
  expect(secs, `user active the whole time (session_ts age ${Math.round(beforeNav / 1000)}s) was treated as a returning visitor`).toBeNull();
});

test('TC-21 End to end, nothing seeded: real add-to-cart, leave the site 2.5 min (QA threshold 2 min), return → modal', async ({ page }, tp) => {
  test.setTimeout(420000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added, 'real ATC armed Cohort 2').not.toBeNull();
  await page.goto('about:blank');             // user leaves the site
  await page.waitForTimeout(150000);
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 30000);
  const s = await state(page);
  const cookies = await page.evaluate(() => document.cookie.split('; ').filter((c) => /cre_?276/.test(c)));
  await shot(page, tp, 'c2-real-return');
  record(tp, 'C2-real-return', { secs, armed, cookies, ...s, logs: page.__logs });
  expect(secs, 'returning cart abandoner should get the Cohort 2 modal').not.toBeNull();
});

// ── J. Round 5: client checklist cases (2026-09-30) ────────────────────────────
const cartList = (page) => page.evaluate(async () => (await (await fetch('/cart.js')).json()).items.map((i) => `${i.title} x${i.quantity}`));
const cookieAge = (page, name) => page.evaluate((name) => { const m = document.cookie.match(new RegExp(name + '=([0-9]+)')); return m ? Date.now() - +m[1] : null; }, name);
const setSiteCookie = (page, name, value) => page.evaluate(([n, v]) => { document.cookie = `${n}=${v}; expires=${new Date(Date.now() + 30 * 864e5).toUTCString()}; path=/;`; }, [name, value]);
async function noModalCase(page, tp, id, seedOpts, arm = 'variation') {
  await seed(page, tp, seedOpts);
  const t0 = await go(page, forceUrl(arm), tp);
  const secs = await waitModal(page, t0, 15000);
  const s = await state(page);
  record(tp, id, { secs, ...s, goals: [...page.__goals] });
  return { secs, s };
}

test('TC-22 Cohort 1 with two different WinkBeds in cart → no modal', async ({ page }, tp) => {
  const { secs } = await noModalCase(page, tp, 'C1-two-winkbeds', { cart: { [PLAIN_TWIN]: 1, [SOFTER_TWIN]: 1 }, checkoutCookie: true });
  expect(secs).toBeNull();
});
test('TC-23 Cohort 1 but mattress already has Frost Cooling Cover → no modal', async ({ page }, tp) => {
  const { secs } = await noModalCase(page, tp, 'C1-cooled', { cart: COOLED_TWIN, checkoutCookie: true });
  expect(secs).toBeNull();
});
test('TC-24 Cohort 2 with quantity 2 of the same WinkBed → no modal', async ({ page }, tp) => {
  const { secs } = await noModalCase(page, tp, 'C2-qty2', { cart: { [PLAIN_TWIN]: 2 }, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  expect(secs).toBeNull();
});
test('TC-25 Cohort 2 with two different WinkBeds at return → no modal', async ({ page }, tp) => {
  const { secs } = await noModalCase(page, tp, 'C2-two-winkbeds', { cart: { [PLAIN_TWIN]: 1, [SOFTER_TWIN]: 1 }, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  expect(secs).toBeNull();
});
test('TC-26 Cohort 2 mattress swapped for a non-mattress item → no modal', async ({ page }, tp) => {
  const { secs } = await noModalCase(page, tp, 'C2-swapped-pillow', { cart: PILLOW, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  expect(secs).toBeNull();
});

test('TC-27 Modal layout; close icon and overlay click dismiss without changing the cart; no re-show on reload', async ({ page }, tp) => {
  test.setTimeout(240000);
  // Round A: close icon
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
  let t0 = await go(page, forceUrl('variation'), tp);
  expect(await waitModal(page, t0, 25000), 'modal shown').not.toBeNull();
  await page.waitForTimeout(1000);
  const layout = await page.evaluate(() => {
    const vis = (sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; };
    const ov = document.querySelector('.cre-t-276-modal-overlay');
    return {
      overlay: vis('.cre-t-276-modal-overlay'), overlayBg: ov && getComputedStyle(ov).backgroundColor,
      blur: getComputedStyle(document.querySelector('main.main') || document.body).filter,
      eyebrow: vis('.cre-t-276-eyebrow'), title: vis('.cre-t-276-title'), description: vis('.cre-t-276-description'),
      price: vis('.cre-t-276-price-line'), strike: getComputedStyle(document.querySelector('.cre-t-276-price-line__strike')).textDecorationLine,
      close: vis('.cre-t-276-modal-close'), cta: vis('.cre-t-276-cta'), snow: document.querySelectorAll('.cre-t-276-snow-bg img').length,
    };
  });
  const cartBefore = await cartList(page);
  const urlBefore = page.url();
  await page.click('.cre-t-276-modal-close');
  await page.waitForTimeout(1500);
  const closedA = !(await page.evaluate(() => document.body.classList.contains('cre-t-276-modal-open')));
  const cartAfterClose = await cartList(page);
  const urlSame = page.url() === urlBefore;
  // Reload with no state change: checkout cookie was consumed, so no second showing
  t0 = await go(page, forceUrl('variation'), tp);
  const reloadSecs = await waitModal(page, t0, 15000);
  // Round B: overlay click (fresh qualifying visit)
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
  t0 = await go(page, forceUrl('variation'), tp);
  expect(await waitModal(page, t0, 25000), 'modal shown (round B)').not.toBeNull();
  await page.waitForTimeout(1000);
  const vp = page.viewportSize() || { width: 400, height: 600 };
  await page.mouse.click(8, vp.height - 8);
  await page.waitForTimeout(1500);
  const closedB = !(await page.evaluate(() => document.body.classList.contains('cre-t-276-modal-open')));
  const cartAfterOverlay = await cartList(page);
  record(tp, 'modal-close-overlay', { layout, closedA, closedB, cartBefore, cartAfterClose, cartAfterOverlay, urlSame, reloadSecs });
  for (const k of ['overlay', 'eyebrow', 'title', 'description', 'price', 'close', 'cta']) expect(layout[k], `${k} visible`).toBe(true);
  expect(layout.blur).toContain('blur');
  expect(layout.strike).toContain('line-through');
  expect(layout.snow).toBe(5);
  expect(closedA, 'close icon dismisses').toBe(true);
  expect(urlSame, 'close does not navigate').toBe(true);
  expect(cartAfterClose, 'close does not change the cart').toEqual(cartBefore);
  expect(reloadSecs, 'no second showing on reload without state change').toBeNull();
  expect(closedB, 'overlay click dismisses').toBe(true);
  expect(cartAfterOverlay, 'overlay close does not change the cart').toEqual(cartBefore);
});

test('TC-28 Modal-shown goal 100334580 fires only for eligible users', async ({ page }, tp) => {
  await noModalCase(page, tp, 'goal-ineligible', { cart: PLAIN_TWIN });
  await page.waitForTimeout(4000);
  const ineligible = [...page.__goals];
  page.__goals.clear();
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 25000);
  await page.waitForTimeout(6000);
  const eligible = [...page.__goals];
  record(tp, 'goal-fire', { ineligible, eligible, secs });
  expect(ineligible, 'no modal goal for ineligible visitor').not.toContain('100334580');
  expect(secs).not.toBeNull();
  expect(eligible, 'modal goal sent for eligible visitor').toContain('100334580');
});

test('TC-29 Visitor with both Cohort 1 and Cohort 2 signals gets the Cohort 1 experience', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 25000);
  const s = await state(page);
  const cohort = await page.evaluate(() => (document.cookie.match(/cre276_active_cohort=([0-9])/) || [])[1] || null);
  record(tp, 'both-signals', { secs, cohort, ...s });
  expect(secs).not.toBeNull();
  expect(cohort, 'Cohort 1 takes priority').toBe('1');
});

test('TC-30 Mouse, key and scroll each reset the inactivity clock (in isolation)', async ({ page }, tp) => {
  test.setTimeout(240000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added, 'real ATC armed tracking (listeners attach here)').not.toBeNull();
  const res = {};
  for (const evt of ['none', 'mousemove', 'keydown', 'scroll']) {
    await setSiteCookie(page, 'cre276_session_ts', Date.now() - 60000); // 60s idle (< 2 min QA threshold)
    await page.waitForTimeout(6000);                                   // clear the 5s throttle
    if (evt === 'mousemove') await page.evaluate(() => window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 })));
    if (evt === 'keydown') await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' })));
    if (evt === 'scroll') await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
    await page.waitForTimeout(1500);
    res[evt] = Math.round((await cookieAge(page, 'cre276_session_ts')) / 1000);
  }
  record(tp, 'activity-reset', { armed, agesSec: res });
  expect(res.none, 'baseline: nothing else refreshed the clock').toBeGreaterThanOrEqual(60);
  for (const evt of ['mousemove', 'keydown', 'scroll']) expect(res[evt], `${evt} refreshed the clock`).toBeLessThan(5);
});

test('TC-31 Active in short bursts for longer than the threshold, no single long gap → not a new session', async ({ page }, tp) => {
  test.setTimeout(360000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added).not.toBeNull();
  const until = Date.now() + 160000; // 2m40s total, a burst every ~50s (each gap < 2 min QA threshold)
  while (Date.now() < until) { await page.evaluate(() => window.dispatchEvent(new Event('scroll'))); await page.waitForTimeout(50000); }
  const ageBefore = await cookieAge(page, 'cre276_session_ts');
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 20000);
  const s = await state(page);
  record(tp, 'bursts', { secs, sessionTsAgeSecBeforeNav: ageBefore && Math.round(ageBefore / 1000), ...s });
  expect(secs).toBeNull();
});

test('TC-32 Reaches checkout after add-to-cart (before threshold) → treated as Cohort 1 on return', async ({ page }, tp) => {
  test.setTimeout(240000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added).not.toBeNull();
  // The site's checkout links are a[href="/checkout"]; the deployment listens for mousedown on them.
  await page.evaluate(() => { const a = document.createElement('a'); a.href = '/checkout'; a.textContent = 'qa checkout'; document.body.appendChild(a); a.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
  await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(8000);
  const atCheckout = { url: page.url(), ui: await page.evaluate(() => !!localStorage.getItem('__ui')).catch(() => null) };
  const t0 = await go(page, forceUrl('variation'), tp);
  const secs = await waitModal(page, t0, 25000);
  const s = await state(page);
  const cohort = await page.evaluate(() => (document.cookie.match(/cre276_active_cohort=([0-9])/) || [])[1] || null);
  await shot(page, tp, 'c1-after-real-checkout');
  record(tp, 'real-checkout-then-return', { secs, cohort, atCheckout, ...s });
  expect(secs, 'checkout visitor sees the Cohort 1 offer').not.toBeNull();
  expect(cohort).toBe('1');
});

test('TC-33 After the Cohort 1 modal, a later idle return does not qualify for Cohort 2', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN, checkoutCookie: true, cartAddedTs: TWO_HOURS, leftAgo: TWO_HOURS });
  let t0 = await go(page, forceUrl('variation'), tp);
  const first = await waitModal(page, t0, 25000);
  await page.goto('about:blank');
  await page.context().addCookies(sessionCookies(TWO_HOURS));
  t0 = await go(page, forceUrl('variation'), tp);
  const second = await waitModal(page, t0, 20000);
  const s = await state(page);
  record(tp, 'c1-then-idle-return', { first, second, ...s });
  expect(first).not.toBeNull();
  expect(second, 'checkout visitor must not fall into Cohort 2 later').toBeNull();
});

// ── K. Round 6: real browser close (only persistent cookies + localStorage survive) ──
async function reopenBrowser(browser, oldContext, tp) {
  const st = await oldContext.storageState();
  const kept = { cookies: st.cookies.filter((c) => c.expires && c.expires > 0), origins: st.origins };
  const dropped = st.cookies.filter((c) => !(c.expires && c.expires > 0) && /cre_?276/.test(c.name)).map((c) => c.name);
  await oldContext.close();
  const ctx = await browser.newContext({ ...tp.project.use, storageState: kept });
  const page = await ctx.newPage();
  await prep(page);
  return { page, dropped };
}

test('TC-34 Cohort 2: add to cart, close the browser, reopen after the threshold → modal', async ({ page, browser }, tp) => {
  test.setTimeout(420000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added, 'real ATC armed Cohort 2').not.toBeNull();
  const { page: p2, dropped } = await reopenBrowser(browser, page.context(), tp);
  await p2.waitForTimeout(150000); // browser closed for 2.5 min (QA threshold 2 min)
  const t0 = await go(p2, forceUrl('variation'), tp);
  const secs = await waitModal(p2, t0, 30000);
  const s = await state(p2);
  const cart = await cartList(p2);
  await shot(p2, tp, 'c2-browser-reopen');
  record(tp, 'C2-browser-reopen', { secs, cart, dropped, armed, ...s, logs: p2.__logs });
  await p2.context().close();
  expect(cart.length, 'cart survives the browser close').toBeGreaterThan(0);
  expect(secs, 'cart returner after a browser close gets the Cohort 2 modal').not.toBeNull();
});

test('TC-35 Cohort 1: reach checkout, close the browser, reopen → modal?', async ({ page, browser }, tp) => {
  test.setTimeout(300000);
  await seed(page, tp, {});
  const armed = await realAtc(page, tp, `${BASE}/pages/shop-winkbed?utm_campaign=Cro276mode`);
  expect(armed.added).not.toBeNull();
  await page.evaluate(() => { const a = document.createElement('a'); a.href = '/checkout'; a.textContent = 'qa checkout'; document.body.appendChild(a); a.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
  await page.goto(BASE + '/checkout', { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(8000);
  const { page: p2, dropped } = await reopenBrowser(browser, page.context(), tp);
  const t0 = await go(p2, forceUrl('variation'), tp);
  const secs = await waitModal(p2, t0, 25000);
  const s = await state(p2);
  const cart = await cartList(p2);
  record(tp, 'C1-browser-reopen', { secs, cart, dropped, ...s, logs: p2.__logs });
  await p2.context().close();
  expect(secs, `checkout abandoner after a browser close (session cookies dropped: ${dropped.join(', ')})`).not.toBeNull();
});
