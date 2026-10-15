// WIN286 — WinkBeds "Other - Persistent Targeted Offer" (Convert exp 100350738)
// Follow-up to WIN276: same cooling-cover modal + new line under the CTA; after a dismissal (no accept) a fixed
// "Free Cooling Cover" badge sits on the left edge and reopens the modal. Badge persists across pages/sessions while
// the cart still holds exactly one eligible WinkBed (qty 1, no Frost cover). Mobile (<=1076px) adds a 44x44 close
// icon that hides the badge for the session.
// Code (no files supplied) was extracted from the live Convert bundle (_s_t 2026-10-15 10:39:40Z) with
// testing/win286-recon/extract.js: deploy 100350740 (helpers), deploy 100350741 (activation), Control 1003184955,
// Variation 1003184956. Cookies: cre_286_checkout_visited (session, Cohort 1), cre286_modal_dismissed (30d),
// cre286_badge_hidden_session (session), cre286_badge_seen (30d, slide-in once), cre286_cart_added_ts / session_ts.
// State is seeded directly so each rule can be tested in isolation. Real carts on production, fresh contexts.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.winkbeds.com';
const SEED_URL = `${BASE}/pages/sleep-calculator?utm_campaign=Cro286mode`;
const ARM = { control: '1003184955', variation: '1003184956' };
const forceUrl = (arm, p = '/') => `${BASE}${p}?utm_campaign=Cro286mode&_conv_eforce=100350738.${ARM[arm]}`;
const PLAIN_TWIN = 33210297426;          // The LUXURY FIRM WinkBed - Twin
const COOLED_TWIN = 47108603052219;      // Luxury Firm - Twin with Frost Cooling Cover
const SOFTER_TWIN = 33210269138;         // The SOFTER WinkBed - Twin
const GOAL_IDS = ['100334668', '100321041', '100324238', '100327778'];
const DOMAIN = 'www.winkbeds.com';
// Kept outside test-results/, which Playwright wipes at the start of every run.
const OUT = path.join(__dirname, '..', 'qa-knowledge-base', 'winkbeds', 'win286-screenshots');
const RESULTS = path.join(OUT, process.env.WIN286_RESULTS || 'results.jsonl');

const isMobile = (tp) => /Mobile/.test(tp.project.name);
const isWebKit = (tp) => /Safari/.test(tp.project.name);
const slow = (tp, ms) => (isWebKit(tp) ? ms * 2 : ms);

async function prep(page) {
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await page.addInitScript(() => {
    // Timings relative to navigation start, recorded from inside the page (DOMContentLoaded is late on mobile).
    window.__qa = { modalAt: null, badgeAt: null, animations: 0, conv: [] };
    const iv = setInterval(() => {
      if (!document.body) return;
      if (!window.__qa.modalAt && document.body.classList.contains('cre-t-286-modal-open')) window.__qa.modalAt = performance.now();
      if (!window.__qa.badgeAt && document.querySelector('.cre-t-286-side-button-container')) window.__qa.badgeAt = performance.now();
    }, 50);
    setTimeout(() => clearInterval(iv), 60000);
    new MutationObserver((ms) => {
      for (const m of ms) if (m.target.classList && m.target.classList.contains('cre-t-286-side-button-animate')) {
        window.__qa.animations++; window.__qa.animDuration = getComputedStyle(m.target).animationDuration;
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
    // Record every _conv_q push (goal triggers), surviving Convert re-assigning the queue or its push().
    const wrapQ = (q) => {
      if (!q || q.__qaWrapped) return q;
      let inner = q.push;
      Object.defineProperty(q, 'push', { configurable: true,
        get: () => function (...a) { try { window.__qa.conv.push(JSON.stringify(a)); } catch (e) {} return inner.apply(this, a); },
        set: (fn) => { inner = fn; } });
      Object.defineProperty(q, '__qaWrapped', { value: true });
      return q;
    };
    let q = wrapQ([]);
    Object.defineProperty(window, '_conv_q', { configurable: true, get: () => q, set: (v) => { q = wrapQ(v); } });
  });
  page.__goalsNet = new Set();
  page.on('request', (r) => {
    if (!/convert/i.test(r.url())) return;
    let blob = r.url() + ' ' + (r.postData() || '');
    try { blob = decodeURIComponent(blob); } catch (e) {}
    for (const g of GOAL_IDS) if (blob.includes(g)) page.__goalsNet.add(g);
  });
}

async function go(page, url, tp) {
  await page.goto(url, { waitUntil: isWebKit(tp) ? 'commit' : 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => document.body && document.body.children.length > 3, null, { timeout: 60000 });
}

const ck = (name, value, session) => ({ name, value, domain: DOMAIN, path: '/', ...(session ? {} : { expires: Math.floor(Date.now() / 1000) + 30 * 86400 }) });

// Seed cart + WIN286 cookies. Cohort 1 = checkout cookie + 1 eligible WinkBed; `dismissed` = returning user who
// already closed the modal (badge-only cohort).
async function seed(page, tp, { cart = PLAIN_TWIN, checkout = false, dismissed = false, badgeSeen = dismissed, extra = [] } = {}) {
  await go(page, SEED_URL, tp);
  await page.waitForTimeout(2500);
  await page.evaluate(async (cart) => {
    await fetch('/cart/clear.js', { method: 'POST' });
    if (cart) await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: typeof cart === 'object' ? cart : { [cart]: 1 } }) });
  }, cart);
  await page.goto('about:blank');
  const ctx = page.context();
  await ctx.clearCookies({ name: /^(cre_286_|cre286_)/ });
  const add = [...extra];
  if (checkout) add.push(ck('cre_286_checkout_visited', 'true', true));
  if (dismissed) add.push(ck('cre286_modal_dismissed', 'true'));
  if (badgeSeen) add.push(ck('cre286_badge_seen', 'true'));
  if (add.length) await ctx.addCookies(add);
}

// "Next session": new browser context carrying only the persistent cookies (session cookies die with the browser).
async function newSession(page, tp, browser) {
  const kept = (await page.context().cookies()).filter((c) => c.expires > 0);
  await page.context().close();
  const ctx = await browser.newContext(tp.project.use);
  await ctx.addCookies(kept);
  const p = await ctx.newPage();
  await prep(p);
  return p;
}

async function waitFor(page, fn, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = await page.evaluate(fn).catch(() => null);
    if (v) return v;
    await page.waitForTimeout(250);
  }
  return null;
}
const modalOpenAt = (page, ms) => waitFor(page, () => window.__qa && window.__qa.modalAt && +(window.__qa.modalAt / 1000).toFixed(1), ms);

async function badge(page) {
  return page.evaluate(() => {
    const c = document.querySelector('.cre-t-286-side-button-container');
    const modal = document.querySelector('.cre-t-286-modal-container');
    const out = {
      modalVisible: !!modal && getComputedStyle(modal).display !== 'none' && modal.getBoundingClientRect().height > 0,
      bodyClasses: [...document.body.classList].filter((x) => /cre-t-286/.test(x)),
      cookies: document.cookie.split('; ').filter((k) => /^cre_?286/.test(k)),
      convPushes: window.__qa ? window.__qa.conv.filter((s) => /triggerConversion|executeExperiment/.test(s)) : [],
      animations: window.__qa ? window.__qa.animations : null, animDuration: window.__qa && window.__qa.animDuration,
      badgeAt: window.__qa && window.__qa.badgeAt && +(window.__qa.badgeAt / 1000).toFixed(1),
      dcl: +(performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd / 1000).toFixed(1),
    };
    if (!c) return { ...out, exists: false, visible: false };
    const r = c.getBoundingClientRect();
    const btn = c.querySelector('.cre-t-286-side-button').getBoundingClientRect();
    const x = c.querySelector('.cre-t-286-side-button-close');
    const xr = x.getBoundingClientRect();
    const hit = (px, py) => { const e = document.elementFromPoint(px, py); return e ? (e.closest('.cre-t-286-side-button-close') ? 'close' : e.closest('.cre-t-286-side-button') ? 'badge' : e.tagName + '.' + [...e.classList].slice(0, 2).join('.')) : null; };
    const shown = getComputedStyle(c).display !== 'none' && r.width > 0;
    return { ...out, exists: true, visible: shown,
      text: c.querySelector('.cre-t-286-side-button-text').innerText.trim(),
      rect: [r.left, r.top, r.right, r.bottom].map((v) => +v.toFixed(1)), vw: innerWidth, vh: innerHeight,
      bottomGapPct: +(((innerHeight - r.bottom) / innerHeight) * 100).toFixed(1),
      centreHit: shown ? hit(btn.left + btn.width / 2, btn.top + btn.height / 2) : null,
      closeVisible: getComputedStyle(x).display !== 'none' && xr.width > 0,
      closeRect: [xr.left, xr.top, xr.width, xr.height].map((v) => +v.toFixed(1)),
      closeHit: xr.width ? hit(xr.left + xr.width / 2, xr.top + xr.height / 2) : null,
      // Overlap of the close hit area with the badge's own (reopen) box, and who wins in the overlap.
      overlapPx: Math.round(Math.max(0, Math.min(xr.right, btn.right) - Math.max(xr.left, btn.left)) * Math.max(0, Math.min(xr.bottom, btn.bottom) - Math.max(xr.top, btn.top))),
      overlapHit: hit((Math.max(xr.left, btn.left) + Math.min(xr.right, btn.right)) / 2, (Math.max(xr.top, btn.top) + Math.min(xr.bottom, btn.bottom)) / 2),
    };
  });
}
const badgeVisible = (page, ms) => waitFor(page, () => {
  const c = document.querySelector('.cre-t-286-side-button-container');
  return !!c && getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().width > 0;
}, ms);

const domClick = (page, sel) => page.evaluate((s) => document.querySelector(s).click(), sel);

async function shot(page, tp, name) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = `${tp.project.name.replace(/[^a-z0-9]+/gi, '_')}__${name}.png`;
  await page.screenshot({ path: path.join(OUT, file), timeout: 60000 }).catch(() => {});
  return file;
}
function record(tp, id, data) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.appendFileSync(RESULTS, JSON.stringify({ project: tp.project.name, id, at: new Date().toISOString(), ...data }) + '\n');
}

// Cohort 1 user lands on the Variation homepage, sees the modal, closes it (X by default).
async function openAndDismiss(page, tp, { via = '.cre-t-286-modal-close' } = {}) {
  await seed(page, tp, { checkout: true });
  await go(page, forceUrl('variation'), tp);
  const secs = await modalOpenAt(page, slow(tp, 30000));
  expect(secs, 'Cohort 1 modal should open').toBeTruthy();
  await page.waitForTimeout(1200);
  await domClick(page, via);
  await badgeVisible(page, 5000);
  await page.waitForTimeout(600);
  return secs;
}

test.setTimeout(240000);
test.beforeEach(async ({ page }) => prep(page));

// ── A. Modal (both arms) ──────────────────────────────────────────────────────
test('TC-01 Control: Cohort 1 modal unchanged, no new copy, no badge after dismissal', async ({ page }, tp) => {
  await seed(page, tp, { checkout: true });
  await go(page, forceUrl('control'), tp);
  const secs = await modalOpenAt(page, slow(tp, 30000));
  await page.waitForTimeout(1200);
  const file = await shot(page, tp, 'tc01-control-modal');
  const disclaimer = await page.locator('.cre-t-286-cta__disclaimer').count();
  const arm = await page.evaluate(() => [...document.body.classList].filter((c) => /cre-t-286-(control|variation)/.test(c)));
  if (secs) await domClick(page, '.cre-t-286-modal-close');
  await page.waitForTimeout(4000);
  const b = await badge(page);
  const file2 = await shot(page, tp, 'tc01-control-dismissed');
  record(tp, 'TC-01', { secs, arm, disclaimer, ...b, file, file2 });
  expect(secs, 'Control modal opens for Cohort 1 (control is "stopped"/0% in Convert — force URL only)').toBeTruthy();
  expect(arm).toEqual(['cre-t-286-control']);
  expect(disclaimer, 'Control has no new disclaimer line').toBe(0);
  expect(b.exists, 'Control shows no badge').toBe(false);
});

test('TC-02 Variation: modal copy matches wireframe incl. new line under the CTA', async ({ page }, tp) => {
  await seed(page, tp, { checkout: true });
  await go(page, forceUrl('variation'), tp);
  const secs = await modalOpenAt(page, slow(tp, 30000));
  await page.waitForTimeout(1500);
  const copy = await page.evaluate(() => {
    const t = (s) => document.querySelector(s)?.innerText.replace(/\s+/g, ' ').trim();
    const cta = document.querySelector('.cre-t-286-cta').getBoundingClientRect();
    const dr = document.querySelector('.cre-t-286-cta__disclaimer').getBoundingClientRect();
    return { eyebrow: t('.cre-t-286-eyebrow'), title: t('.cre-t-286-title'), price: t('.cre-t-286-price-line'), cta: t('.cre-t-286-cta-text'),
      disclaimer: t('.cre-t-286-cta__disclaimer'), belowCta: dr.top >= cta.bottom, centred: Math.abs((dr.left + dr.right) / 2 - (cta.left + cta.right) / 2) < 4,
      fontSize: getComputedStyle(document.querySelector('.cre-t-286-cta__disclaimer')).fontSize,
      arm: [...document.body.classList].filter((c) => /cre-t-286-(control|variation)/.test(c)) };
  });
  const file = await shot(page, tp, 'tc02-variation-modal');
  record(tp, 'TC-02', { secs, ...copy, file });
  expect(secs).toBeTruthy();
  expect(copy.arm).toEqual(['cre-t-286-variation']);
  expect(copy.eyebrow).toBe('FREE LIMITED-TIME OFFER');
  expect(copy.title).toMatch(/We'll upgrade your mattress with Frost™ Cooling Fabric Free/);
  expect(copy.price).toBe('Regularly $125. Yours free. Ends tonight at 11:59 PM.');
  expect(copy.cta).toBe('UPGRADE MY MATTRESS FOR FREE');
  expect(copy.disclaimer).toBe('Not ready? Close this offer. Reopen it from the side of your screen.');
  expect(copy.belowCta && copy.centred, 'line sits centred under the CTA').toBe(true);
});

// ── B. Badge appearance / position / animation ────────────────────────────────
test('TC-03 Dismiss (X) shows badge: text, left edge, bottom 20%, slide-in 200-250ms once', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  const b = await badge(page);
  record(tp, 'TC-03', { ...b, file: await shot(page, tp, 'tc03-badge') });
  expect(b.visible, 'badge visible after dismissal').toBe(true);
  expect(b.text).toBe('Free Cooling Cover');
  expect(b.cookies).toContain('cre286_modal_dismissed=true');
  expect(b.animations, 'slide-in plays on first appearance').toBe(1);
  expect(parseFloat(b.animDuration) * 1000, `animation ${b.animDuration}`).toBeGreaterThanOrEqual(200);
  expect(parseFloat(b.animDuration) * 1000).toBeLessThanOrEqual(250);
  expect.soft(Math.abs(b.rect[0]), `badge left edge at x=${b.rect[0]} (flush = 0)`).toBeLessThanOrEqual(1);
  expect.soft(Math.abs(b.bottomGapPct - 20), `badge bottom is ${b.bottomGapPct}% above viewport bottom (spec 20%)`).toBeLessThanOrEqual(1.5);
});

test('TC-04 Dismiss via overlay click also shows badge', async ({ page }, tp) => {
  await openAndDismiss(page, tp, { via: '.cre-t-286-modal-overlay' });
  const b = await badge(page);
  record(tp, 'TC-04', { ...b, file: await shot(page, tp, 'tc04-overlay-dismiss') });
  expect(b.visible).toBe(true);
  expect(b.modalVisible).toBe(false);
});

test('TC-05 Badge stays fixed while scrolling (homepage)', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  const before = await badge(page);
  const samples = [];
  for (const y of [800, 2000, 4000]) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(900);
    const b = await badge(page);
    samples.push({ y, rect: b.rect, centreHit: b.centreHit });
  }
  record(tp, 'TC-05', { before: before.rect, samples, file: await shot(page, tp, 'tc05-scrolled') });
  for (const s of samples) {
    expect(s.rect, `badge moved at scroll ${s.y}`).toEqual(before.rect);
    expect(s.centreHit, `badge covered at scroll ${s.y}`).toBe('badge');
  }
});

// ── C. Interaction ────────────────────────────────────────────────────────────
test('TC-06 Badge click reopens modal, badge hidden while open, restored after re-dismiss, no re-animation', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  const fires1 = (await badge(page)).convPushes.filter((s) => /triggerConversion/.test(s)).length;
  await domClick(page, '.cre-t-286-side-button');
  await page.waitForTimeout(800);
  const open = await badge(page);
  const file = await shot(page, tp, 'tc06-reopened');
  await domClick(page, '.cre-t-286-modal-close');
  await page.waitForTimeout(1200);
  const closed = await badge(page);
  const fires2 = closed.convPushes.filter((s) => /triggerConversion/.test(s)).length;
  record(tp, 'TC-06', { open, closed, fires1, fires2, file });
  expect(open.modalVisible, 'modal reopened').toBe(true);
  expect(open.visible, 'badge hidden while modal open').toBe(false);
  expect(closed.modalVisible).toBe(false);
  expect(closed.visible, 'badge restored after second dismissal').toBe(true);
  expect(closed.animations, 'no second slide-in').toBe(1);
  expect(fires2, 'reopen does not count as an automatic modal fire').toBe(fires1);
});

test('TC-07 Across pages: badge persists, no auto-reopen, no re-animation, appears promptly', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  const rows = [];
  for (const p of ['/pages/shop-winkbed', '/pages/mattress-quiz', '/']) {
    await go(page, `${BASE}${p}`, tp); // plain URL: Convert bucketing cookie carries the arm
    const shown = await badgeVisible(page, slow(tp, 25000));
    await page.waitForTimeout(3000);
    const b = await badge(page);
    rows.push({ p, shown: !!shown, badgeAt: b.badgeAt, dcl: b.dcl, lagAfterDcl: b.badgeAt && b.dcl ? +(b.badgeAt - b.dcl).toFixed(1) : null,
      modalVisible: b.modalVisible, animations: b.animations, centreHit: b.centreHit });
  }
  record(tp, 'TC-07', { rows, file: await shot(page, tp, 'tc07-next-page') });
  for (const r of rows) {
    expect(r.shown, `badge on ${r.p}`).toBe(true);
    expect(r.modalVisible, `modal must not auto-open on ${r.p}`).toBe(false);
    expect(r.animations, `no slide-in replay on ${r.p}`).toBe(0);
  }
  for (const r of rows) expect.soft(r.lagAfterDcl, `badge appears ${r.lagAfterDcl}s after DOMContentLoaded on ${r.p} ("keep it in place across pages")`).toBeLessThanOrEqual(1.5);
});

test('TC-08 Next session: badge returns (dismissal remembered), modal not auto-opened', async ({ page, browser }, tp) => {
  await openAndDismiss(page, tp);
  const p2 = await newSession(page, tp, browser);
  await go(p2, `${BASE}/pages/shop-winkbed`, tp);
  const shown = await badgeVisible(p2, slow(tp, 25000));
  await p2.waitForTimeout(2500);
  const b = await badge(p2);
  record(tp, 'TC-08', { shown: !!shown, ...b, file: await shot(p2, tp, 'tc08-next-session') });
  expect(shown, 'badge in a new session').toBeTruthy();
  expect(b.modalVisible).toBe(false);
  await p2.context().close();
});

// ── D. Ongoing eligibility ────────────────────────────────────────────────────
test('TC-09 Mattress removed from cart: badge hides on the same page and stays gone', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  await page.evaluate(async () => {
    const cart = await (await fetch('/cart.js')).json();
    await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: cart.items[0].key, quantity: 0 }) });
  });
  const gone = await waitFor(page, () => !document.querySelector('.cre-t-286-side-button-container'), 5000);
  await go(page, `${BASE}/pages/shop-winkbed`, tp);
  await page.waitForTimeout(slow(tp, 10000));
  const next = await badge(page);
  record(tp, 'TC-09', { goneSamePage: !!gone, nextPage: next.exists, file: await shot(page, tp, 'tc09-cart-emptied') });
  expect(gone, 'badge removed on same page after cart change').toBeTruthy();
  expect(next.exists, 'no badge on next page').toBe(false);
});

for (const [name, cart] of [['Frost cover variant', COOLED_TWIN], ['two WinkBeds', { [PLAIN_TWIN]: 1, [SOFTER_TWIN]: 1 }], ['qty 2', { [PLAIN_TWIN]: 2 }], ['empty cart', null]]) {
  test(`TC-10 Dismissed user, cart ineligible (${name}): no badge`, async ({ page }, tp) => {
    await seed(page, tp, { cart, dismissed: true });
    await go(page, forceUrl('variation', '/pages/shop-winkbed'), tp);
    await page.waitForTimeout(slow(tp, 12000));
    const b = await badge(page);
    record(tp, `TC-10 ${name}`, b);
    expect(b.exists).toBe(false);
    expect(b.modalVisible).toBe(false);
  });
}

test('TC-11 Accepting (CTA) upgrades cart, goes to checkout, no badge afterwards', async ({ page }, tp) => {
  await seed(page, tp, { checkout: true });
  await go(page, forceUrl('variation'), tp);
  expect(await modalOpenAt(page, slow(tp, 30000))).toBeTruthy();
  await page.waitForTimeout(1000);
  await Promise.all([
    page.waitForURL(/checkout|checkouts/, { timeout: 60000, waitUntil: 'commit' }).catch(() => null),
    domClick(page, '.cre-t-286-cta'),
  ]);
  const url = page.url();
  await page.waitForTimeout(2000);
  const file = await shot(page, tp, 'tc11-checkout');
  await go(page, `${BASE}/pages/shop-winkbed`, tp);
  await page.waitForTimeout(slow(tp, 10000));
  const cart = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).items.map((i) => i.variant_title + ' x' + i.quantity));
  const b = await badge(page);
  record(tp, 'TC-11', { url, cart, badge: b.exists, cookies: b.cookies, modalVisible: b.modalVisible, file });
  expect(url).toMatch(/checkout/);
  expect(cart.join('|')).toMatch(/Frost Cooling Cover x1/);
  expect(b.exists, 'no badge after accepting').toBe(false);
  expect(b.cookies.join(';')).not.toMatch(/cre286_modal_dismissed=true/);
});

test('TC-12 Reduced motion: badge appears without the slide-in', async ({ page }, tp) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openAndDismiss(page, tp);
  const b = await badge(page);
  record(tp, 'TC-12', b);
  expect(b.visible).toBe(true);
  expect(b.animations).toBe(0);
});

// ── E. Mobile close icon ──────────────────────────────────────────────────────
test('TC-13 Close icon: mobile-only, >=44x44, does not overlap the reopen area', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  const b = await badge(page);
  record(tp, 'TC-13', { ...b, file: await shot(page, tp, 'tc13-close-icon') });
  if (!isMobile(tp)) {
    expect(b.closeVisible, 'no close icon on desktop').toBe(false);
    return;
  }
  expect(b.closeVisible).toBe(true);
  expect(b.closeRect[2]).toBeGreaterThanOrEqual(44);
  expect(b.closeRect[3]).toBeGreaterThanOrEqual(44);
  expect(b.closeHit, 'close icon centre is tappable').toBe('close');
  expect(b.overlapPx, `close hit area overlaps the badge by ${b.overlapPx}px² (taps there hit: ${b.overlapHit})`).toBe(0);
});

test('TC-14 Mobile close: hides badge for the session, back next session', async ({ page, browser }, tp) => {
  test.skip(!isMobile(tp), 'close icon is mobile-only');
  await openAndDismiss(page, tp);
  await domClick(page, '.cre-t-286-side-button-close');
  await page.waitForTimeout(800);
  const after = await badge(page);
  await go(page, `${BASE}/pages/shop-winkbed`, tp);
  await page.waitForTimeout(slow(tp, 12000));
  const samePage2 = await badge(page);
  const p2 = await newSession(page, tp, browser);
  await go(p2, `${BASE}/pages/shop-winkbed`, tp);
  const back = await badgeVisible(p2, slow(tp, 25000));
  record(tp, 'TC-14', { hiddenNow: !after.exists, cookies: after.cookies, nextPageSameSession: samePage2.exists, nextSession: !!back, file: await shot(p2, tp, 'tc14-next-session') });
  expect(after.exists).toBe(false);
  expect(after.cookies).toContain('cre286_badge_hidden_session=true');
  expect(samePage2.exists, 'still hidden on next page this session').toBe(false);
  expect(back, 'badge back next session').toBeTruthy();
  await p2.context().close();
});

// ── F. Coexistence with the shop page ─────────────────────────────────────────
test('TC-15 Shop page: badge stays on top / usable while scrolling through the Buy Box', async ({ page }, tp) => {
  await seed(page, tp, { dismissed: true });
  await go(page, forceUrl('variation', '/pages/shop-winkbed'), tp);
  expect(await badgeVisible(page, slow(tp, 25000))).toBeTruthy();
  await page.waitForTimeout(1500);
  const samples = [];
  for (const y of [0, 600, 1200, 1800, 3000]) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(1000);
    const b = await badge(page);
    samples.push({ y, centreHit: b.centreHit, closeHit: b.closeVisible ? b.closeHit : 'n/a' });
    if (y === 1200) await shot(page, tp, 'tc15-shop-buybox');
  }
  record(tp, 'TC-15', { samples });
  for (const s of samples) expect.soft(s.centreHit, `badge covered by ${s.centreHit} at scroll ${s.y}`).toBe('badge');
});

test('TC-16 Add to Cart drawer: badge does not sit on top of the cart drawer', async ({ page }, tp) => {
  await seed(page, tp, { dismissed: true });
  await go(page, forceUrl('variation', '/pages/shop-winkbed'), tp);
  expect(await badgeVisible(page, slow(tp, 25000))).toBeTruthy();
  await page.evaluate(() => document.querySelector('.cre-wb-test-28-overlay')?.remove());
  await page.evaluate(() => { const b = document.querySelector('.order-form__add'); b.scrollIntoView({ block: 'center' }); b.click(); });
  const drawer = await waitFor(page, () => {
    const d = [...document.querySelectorAll('.pop-cart, [class*="pop-cart"]')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 200 && r.height > 200 && getComputedStyle(e).visibility !== 'hidden'; });
    return d && [...d.classList].join('.');
  }, slow(tp, 15000));
  await page.waitForTimeout(1500);
  const b = await badge(page);
  record(tp, 'TC-16', { drawer, centreHit: b.centreHit, badgeVisible: b.visible, file: await shot(page, tp, 'tc16-cart-drawer') });
  test.skip(!drawer, 'cart drawer did not open (site popup / rate limit) — see screenshot');
  expect(b.centreHit, 'badge must not draw over the cart drawer or its overlay').not.toBe('badge');
});

// ── G. Goals ──────────────────────────────────────────────────────────────────
test('TC-17 Goals: modal fire, CTA click, badge click, badge close (mobile) are tracked', async ({ page }, tp) => {
  await openAndDismiss(page, tp);
  await domClick(page, '.cre-t-286-side-button');
  await page.waitForTimeout(800);
  await domClick(page, '.cre-t-286-modal-close');
  await page.waitForTimeout(800);
  if (isMobile(tp)) { await domClick(page, '.cre-t-286-side-button-close'); await page.waitForTimeout(800); }
  const pushes = await page.evaluate(() => window.__qa.conv);
  const triggers = pushes.filter((s) => /triggerConversion/.test(s));
  record(tp, 'TC-17', { pushes, triggers, netGoals: [...page.__goalsNet] });
  expect(triggers.length, 'at least one goal push').toBeGreaterThan(0);
  expect.soft(triggers.every((s) => !/"triggerConversion",""/.test(s)), `modal-fire goal pushed with an EMPTY goal id: ${triggers.join(' ')}`).toBe(true);
  expect.soft(triggers.length, `expected modal-fire + badge-click${isMobile(tp) ? ' + badge-close' : ''} goals, got ${triggers.length}`).toBeGreaterThanOrEqual(isMobile(tp) ? 3 : 2);
});

test('TC-18 Keyboard: badge reachable and Enter reopens the modal', async ({ page }, tp) => {
  test.skip(isMobile(tp), 'keyboard check on desktop only');
  await openAndDismiss(page, tp);
  await page.focus('.cre-t-286-side-button');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  const b = await badge(page);
  record(tp, 'TC-18', { modalVisible: b.modalVisible });
  expect(b.modalVisible, 'role=button/tabindex=0 but only a click handler').toBe(true);
});

// ── H. Targeting regression ───────────────────────────────────────────────────
test('TC-19 Never-qualified visitor: no modal, no badge', async ({ page }, tp) => {
  await seed(page, tp, { cart: PLAIN_TWIN });
  await go(page, forceUrl('variation'), tp);
  await page.waitForTimeout(slow(tp, 14000));
  const b = await badge(page);
  record(tp, 'TC-19', b);
  expect(b.modalVisible).toBe(false);
  expect(b.exists).toBe(false);
});

test('TC-20 Cohort 2 (3-min idle) fires because ONE_HOUR_MS is 2 min; dismiss -> badge', async ({ page }, tp) => {
  const now = Date.now();
  await seed(page, tp, { extra: [ck('cre286_cart_added_ts', String(now - 10 * 60000)), ck('cre286_session_ts', String(now - 3 * 60000))] });
  await go(page, forceUrl('variation'), tp);
  const secs = await modalOpenAt(page, slow(tp, 30000));
  if (secs) { await page.waitForTimeout(1000); await domClick(page, '.cre-t-286-modal-close'); }
  const shown = await badgeVisible(page, 5000);
  const b = await badge(page);
  record(tp, 'TC-20', { secs, badge: !!shown, cookies: b.cookies });
  test.info().annotations.push({ type: 'launch', description: `Cohort 2 opened after a 3-minute idle (${secs}s) - new-session threshold is 2 min, must be 60 min at launch` });
  expect(secs, 'Cohort 2 modal opens (2-min QA threshold)').toBeTruthy();
  expect(shown, 'Cohort 2 dismissal also yields the badge').toBeTruthy();
});
