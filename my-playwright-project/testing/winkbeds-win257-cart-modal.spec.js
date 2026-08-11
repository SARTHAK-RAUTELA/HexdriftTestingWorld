// @ts-check
/**
 * WIN257 / cre-t-257 — "Cart Modal Checkout Upgrade" QA
 *
 * Spec sources (in the order the QA workflow requires):
 *   1. Figma  : Downloads/Group 1931.png  (annotations + exact copy)
 *   2. Video  : local_testing/Local2/variation/v2.js (transcript)
 *   3. Code   : local_testing/Local2/variation/vB.js + vB.css
 *
 * Assertions are written against the FIGMA/TRANSCRIPT spec, not against what the code
 * currently does — a failing test here is a real bug, per _shared/qa-workflow.md.
 *
 * Each test runs in a fresh browser context (Playwright's default), which is an
 * incognito-equivalent private session: no shared cookies, storage or cache.
 *
 * Site quirks applied from qa-knowledge-base/winkbeds/_client-notes.md:
 *   - navigator.webdriver must be spoofed or the site withholds the Buy Box
 *   - use waitUntil:'domcontentloaded' (the load event can exceed 45s)
 *   - use raw DOM clicks, other CRO tests' overlays intercept pointer events
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PDP = 'https://www.winkbeds.com/pages/shop-winkbed';
const HOME = 'https://www.winkbeds.com/';
const QA = 'cro_mode=qa';
const EFORCE_VAR = '_conv_eforce=100350199.1003183627';
const EFORCE_CTL = '_conv_eforce=100350199.1003183626';

const VB_JS = fs.readFileSync(
  path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation', 'vB.js'),
  'utf8',
);
const VB_CSS = fs.readFileSync(
  path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation', 'vB.css'),
  'utf8',
);

const SHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

/** Expected copy — transcribed from the Figma export, exact casing. */
const COPY = {
  eyebrow: 'FREE LIMITED-TIME OFFER',
  title: "We'll upgrade your mattress with Frost™ Cooling Fabric Free",
  description:
    "Complete your order today and we'll upgrade your mattress with our premium cooling fabric, designed to sleep up to 20% cooler with advanced cooling fibers sewn directly into the cover.",
  priceLine: 'Regularly $125. Yours free. Ends tonight at 11:59 PM.',
  cta: 'UPGRADE MY MATTRESS FOR FREE',
  discountUrl: 'https://www.winkbeds.com/discount/FROST3S1CFP?redirect=/checkout',
};

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** Console noise that pre-exists on winkbeds.com and is not ours. */
const IGNORED_ERRORS = [
  /fenixcommerce/i,
  /layout\.theme\.js/i,
  /Failed to fetch/i,
  /CORS policy/i,
  /net::ERR_FAILED/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /Clear-Site-Data/i,
  /googletagmanager|facebook|klaviyo|gorgias|littledata|shopifycloud/i,
  // Pre-existing first-party 404 on winkbeds.com; referenced by neither vB.js nor vB.css.
  // Verified 2026-08-06 — site bug worth reporting to the client, but not a WIN257 defect.
  /underline_blue\.svg/i,
  /compare_at_price/i,
];
const isOurError = (t) => !IGNORED_ERRORS.some((r) => r.test(t));

async function harden(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
}

/** Arm the two "came back from checkout" signals the activation script requires. */
async function armCheckoutReturn(page) {
  await page.addInitScript(() => {
    try {
      document.cookie = 'cre_257_checkout_visited=true; path=/;';
      localStorage.setItem(
        '__ui',
        JSON.stringify({ 2: [{ checkoutSessionIdentifier: 'qa-win257-session' }] }),
      );
    } catch (e) {
      /* storage blocked */
    }
  });
}

const isWebKit = (page) => {
  try {
    return page.context().browser().browserType().name() === 'webkit';
  } catch {
    return false;
  }
};

/**
 * WebKit readiness signal for this page.
 *
 * On winkbeds.com WebKit can leave document.readyState at 'loading' indefinitely — measured
 * at >120s with ZERO pending network requests, so it is not a network problem and no timeout
 * increase fixes it. The head parses slowly (1 -> 28 -> 70 -> 116 children) and <body> only
 * appears around 20-25s. domcontentloaded is therefore simply the wrong readiness signal on
 * WebKit here, and waiting for it reported "Safari fails everything" as though it were a
 * cre-t-257 defect. Chromium and Firefox reach domcontentloaded normally and are left on the
 * original path, so their recorded results stand unchanged.
 */
async function settle(page) {
  await page.waitForSelector('body', { state: 'attached', timeout: 90000 });
  await page.waitForFunction(() => document.body && document.body.childElementCount > 5, null, {
    timeout: 90000,
  });
}

async function go(page, url) {
  if (!isWebKit(page)) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return;
  }
  await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
  await settle(page);
}

async function reloadPage(page) {
  if (!isWebKit(page)) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    return;
  }
  await page.reload({ waitUntil: 'commit' });
  await settle(page);
}

/**
 * The 150-product catalog, fetched ONCE per run rather than once per test.
 *
 * Sustained matrix runs tripped Shopify's rate limiter: /products.json began answering
 * HTTP 429 with an HTML "Verifying your connection..." page, which .json() surfaced as an
 * opaque "Unexpected token '<'" and looked like a product-lookup bug. The catalog is
 * identical for every test, so refetching ~1MB of it 43 times per project was the single
 * largest and most pointless source of that load.
 */
let catalogPromise = null;
async function getCatalog(page) {
  if (catalogPromise) return catalogPromise;
  catalogPromise = (async () => {
    let lastSeen = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 5000 * attempt)); // linear backoff
      const res = await page.request.get('https://www.winkbeds.com/products.json?limit=150', {
        headers: { 'X-Requested-With': 'xmlhttprequest' },
      });
      const body = await res.text();
      if (res.status() === 429) {
        lastSeen = `HTTP 429 rate-limited (attempt ${attempt + 1})`;
        continue;
      }
      try {
        return JSON.parse(body).products;
      } catch {
        lastSeen =
          `HTTP ${res.status()} content-type="${res.headers()['content-type']}" ` +
          `body[0..160]=${JSON.stringify(body.slice(0, 160))}`;
      }
    }
    catalogPromise = null; // let a later test retry rather than cache the failure
    throw new Error(`HARNESS: /products.json unusable after 5 attempts — last: ${lastSeen}`);
  })();
  return catalogPromise;
}

/** Replace the cart with a chosen WinkBed variant. Returns the variant actually added. */
async function setCart(page, { handle, size, cooled = false, quantity = 1, extraHandle = null }) {
  const products = await getCatalog(page);
  const pick = (h, sz, cool) => {
    const p = products.find((x) => x.handle === h);
    if (!p) return null;
    const want = cool ? `${sz} with Frost Cooling Cover` : sz;
    const v = p.variants.find((x) => x.title === want);
    return v ? { id: v.id, title: v.title, product: p.title, price: v.price } : null;
  };
  const main = handle ? pick(handle, size, cooled) : null;
  const items = [];
  if (main) items.push({ id: main.id, quantity });
  if (extraHandle) {
    const p = products.find((x) => x.handle === extraHandle);
    if (p) items.push({ id: p.variants[0].id, quantity: 1 });
  }

  const result = await page.evaluate(async (items) => {
    /*
     * Cart calls, made resilient to Shopify's rate limiter.
     *
     * Sustained matrix runs trip a limiter that answers HTTP 429 with an HTML
     * "Verifying your connection..." page. WebKit's JSON.parse failure message for that is
     * the useless "The string did not match the expected pattern.", so the body is reported
     * explicitly. On a 429 we wait and retry rather than failing the case, because a throttled
     * request says nothing about the variation under test.
     */
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const jf = async (u, o) => {
      let last = '';
      for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt) await sleep(8000 * attempt); // 8s, 16s, 24s
        const r = await fetch(u, o);
        const t = await r.text();
        if (r.status === 429) {
          last = `HTTP 429 rate-limited (attempt ${attempt + 1})`;
          continue;
        }
        try {
          return JSON.parse(t);
        } catch {
          last =
            `HTTP ${r.status} content-type="${r.headers.get('content-type')}" ` +
            `docOrigin="${location.origin}" body[0..160]=${JSON.stringify(t.slice(0, 160))}`;
        }
      }
      throw new Error(`HARNESS: ${u} unusable after 4 attempts — last: ${last}`);
    };
    // Skip the clear+add entirely when the cart already holds exactly this. Saves two
    // production writes whenever a test seeds the same cart twice.
    const cur = await jf('/cart.js');
    const wantCount = items.reduce((n, i) => n + i.quantity, 0);
    const alreadyRight =
      cur.item_count === wantCount &&
      items.every((i) => cur.items.some((c) => c.variant_id === i.id && c.quantity === i.quantity));
    if (!alreadyRight) {
      await fetch('/cart/clear.js', { method: 'POST' });
      if (items.length) {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      }
    }
    const cart = await jf('/cart.js');
    return {
      cartTitles: cart.items.map((i) => `${i.title} x${i.quantity}`),
      itemCount: cart.item_count,
      reused: alreadyRight,
    };
  }, items);

  return { main, ...result };
}

/**
 * Read cart state OUT OF BAND, via the context's APIRequestContext (shares cookies with
 * the browser context) rather than an in-page fetch.
 *
 * Group D blocks the discount redirect with route.abort(); Chromium responds to a failed
 * main-frame navigation by committing an error-page document, and a relative fetch() from
 * that document throws "TypeError: Failed to fetch". An in-page read therefore cannot
 * observe the cart after the CTA has fired. Cart state is cookie-scoped server state, so
 * reading it out of band is both more robust and more faithful.
 */
async function readCart(page) {
  const res = await page.context().request.get('https://www.winkbeds.com/cart.js', {
    headers: { 'X-Requested-With': 'xmlhttprequest' },
  });
  const c = await res.json();
  return {
    count: c.item_count,
    items: c.items.map((i) => ({
      title: i.title,
      variant: i.variant_title,
      qty: i.quantity,
    })),
  };
}

/**
 * Deterministic harness: inject the repo's vB.css + vB.js into the live page.
 * This tests the exact code under review, independently of whether Convert's
 * activation happens to fire in this session.
 */
async function injectVariation(page) {
  await page.addStyleTag({ content: VB_CSS });
  await page.evaluate((src) => {
    document.cookie = 'cre_257_checkout_visited=true; path=/;';
    const s = document.createElement('script');
    s.textContent = src;
    document.body.appendChild(s);
  }, VB_JS);
  /*
   * vB.js:257 polls for its body selector on a 50ms setInterval. A fixed 1200ms sleep is
   * enough on Chromium but NOT on Firefox, where this ~1.8MB page throttles timers: the
   * modal was measured appearing between 1.2s and 3.0s. The old fixed wait therefore
   * reported "modal never rendered on Firefox" as a product bug when it was pure harness
   * impatience. Poll for the outcome instead — per _client-notes.md, prefer polling over
   * fixed waits on this site.
   *
   * Absence is NOT an error here: negative cases rely on this helper too, so the timeout is
   * swallowed and the assertion in the test decides.
   */
  await page
    .waitForSelector('.cre-t-257-modal-overlay', { state: 'attached', timeout: 8000 })
    .catch(() => {});
}

async function modalVisible(page) {
  return page.evaluate(() => {
    const c = document.querySelector('.cre-t-257-modal-container');
    const o = document.querySelector('.cre-t-257-modal-overlay');
    if (!c) return { inDom: false };
    return {
      inDom: true,
      containerDisplay: getComputedStyle(c).display,
      overlayDisplay: o ? getComputedStyle(o).display : 'absent',
      bodyHasOpen: document.body.classList.contains('cre-t-257-modal-open'),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP A — trigger / qualification (real Convert activation path)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('A. Trigger & qualification', () => {
  test('TC-01 Control variant renders no modal and no cre-t-257 artefacts', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_CTL}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await page.waitForTimeout(9000);
    const v = await modalVisible(page);
    expect(v.inDom, 'control must not inject the modal').toBe(false);
    expect(await page.evaluate(() => document.body.classList.contains('cre-t-257'))).toBe(false);
  });

  test('TC-02 SPEC: modal must appear on ANY page — homepage', async ({ page }) => {
    // Transcript 2:39 — "It'll appear on any page on the site."
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await go(page, `${HOME}?${QA}&${EFORCE_VAR}`);
    await injectVariation(page);
    await page.waitForTimeout(2500);
    const v = await modalVisible(page);
    expect(
      v.inDom,
      'BUG-01: vB.js gates on the shop-winkbed PDP body id, so the modal can never render on the homepage',
    ).toBe(true);
  });

  test('TC-03 Modal renders on the PDP when all 4 conditions are met', async ({ page }, ti) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    const v = await modalVisible(page);
    expect(v.inDom).toBe(true);
    expect(v.containerDisplay).toBe('block');
    expect(v.overlayDisplay).toBe('block');
    await page.screenshot({
      path: path.join(SHOT_DIR, `win257-${ti.project.name.replace(/[^a-z0-9]+/gi, '-')}-modal.png`),
      fullPage: false,
      timeout: 45000,
    });
  });

  test('TC-04 Real activation path fires after the 5s delay (no manual injection)', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);

    /*
     * The activation does setTimeout(checkAllConditionsAndActivate, 5000), and that timer
     * starts when Convert's JS executes — i.e. at some point at or after navigationStart.
     *
     * Measuring "3s of Playwright wall-clock after domcontentloaded resolves" is anchored to
     * the wrong reference: on slower browsers domcontentloaded settles late enough that the
     * 3s checkpoint is already past the activation's 5s mark, and the case failed on Edge
     * for that reason alone. So measure IN-PAGE with performance.now(), which is relative to
     * navigationStart, and assert on the modal's actual arrival time.
     */
    /*
     * The ARRIVAL TIME stays anchored to navigationStart (that is what the >=5000 assertion
     * below needs), but the GIVE-UP BUDGET must be relative to when polling starts. Anchoring
     * the deadline to navigationStart too was an over-correction: this evaluate only begins
     * after page.reload() has resolved domcontentloaded, which on Mobile Chrome lands at
     * ~16-20s on this ~1.8MB page. That left 0-4s of budget against an activation that needs
     * 5s, so the poll returned -1 immediately and reported a false "activation never fired" —
     * while TC-10, which waits 14s on the same real activation path, showed it firing fine.
     */
    const appearedAtMs = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const pollStart = performance.now();
          const budget = 20000;
          const tick = () => {
            if (document.querySelector('.cre-t-257-modal-overlay')) return resolve(performance.now());
            if (performance.now() - pollStart > budget) return resolve(-1);
            setTimeout(tick, 50);
          };
          tick();
        }),
    );

    expect(
      appearedAtMs,
      'Convert activation should have executed experiment 100350199 and injected the modal within 20s',
    ).toBeGreaterThan(0);
    expect(
      appearedAtMs,
      `the 5s activation delay must be honoured — modal appeared ${Math.round(appearedAtMs)}ms after navigationStart`,
    ).toBeGreaterThanOrEqual(5000);
  });

  test('TC-05 Does NOT qualify: cart empty', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: null, size: null });
    await reloadPage(page);
    await page.waitForTimeout(14000);
    expect((await modalVisible(page)).inDom).toBe(false);
  });

  test('TC-06 Does NOT qualify: mattress already has Frost Cooling Cover', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen', cooled: true });
    await reloadPage(page);
    await page.waitForTimeout(14000);
    expect((await modalVisible(page)).inDom).toBe(false);
  });

  test('TC-07 Does NOT qualify: two WinkBed mattresses (2 line items)', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, {
      handle: 'the-luxury-firm-winkbed',
      size: 'Queen',
      extraHandle: 'the-softer-winkbed',
    });
    await reloadPage(page);
    await page.waitForTimeout(14000);
    expect((await modalVisible(page)).inDom).toBe(false);
  });

  test('TC-08 SPEC: must NOT qualify with quantity 2 of one WinkBed', async ({ page }) => {
    // Transcript 1:45 — "one WinkBed mattress in their cart. Not two or three or four."
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    const c = await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen', quantity: 2 });
    expect(c.itemCount).toBe(2);
    await reloadPage(page);
    await page.waitForTimeout(14000);
    expect(
      (await modalVisible(page)).inDom,
      'BUG-05: length===1 counts line items, so qty 2 wrongly qualifies',
    ).toBe(false);
  });

  test('TC-09 Does NOT qualify: GravityLux / EcoCloud only', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-gravitylux-medium', size: 'Queen' });
    await reloadPage(page);
    await page.waitForTimeout(14000);
    expect((await modalVisible(page)).inDom).toBe(false);
  });

  test('TC-10 SPEC: must NOT qualify on a non-mattress "WinkBed"-named product', async ({ page }) => {
    // "WinkBeds Blue Collection - B1" contains the substring "winkbed" but is not
    // the shop-winkbed mattress the spec targets (transcript 1:15-1:36).
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    // Seed via the REAL activation path, not injectVariation. BUG-04's claim is that the
    // Convert activation's cartMeetsMattressCondition wrongly qualifies this product;
    // manual injection renders the modal unconditionally and so cannot test a gate at all.
    const seeded = await setCart(page, { handle: 'winkbeds-blue-collection-b1', size: 'Twin' });
    // Guard: if the variant lookup missed, the cart is empty and the test would "pass"
    // for the wrong reason — no item means nothing to qualify.
    expect(seeded.itemCount, `seed failed, cart was ${JSON.stringify(seeded)}`).toBe(1);
    await reloadPage(page);
    await page.waitForTimeout(14000); // activation does setTimeout(check, 5000)
    expect(
      (await modalVisible(page)).inDom,
      'BUG-04: cartMeetsMattressCondition uses title.includes("winkbed"), which matches ' +
        'Blue Collection / Kids Mattress — the offer is shown for a product it cannot upgrade',
    ).toBe(false);
  });

  test('TC-11 Does NOT qualify without the checkout-return signals', async ({ page }) => {
    await harden(page); // deliberately NOT arming cookie/localStorage
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await page.waitForTimeout(14000);
    expect((await modalVisible(page)).inDom).toBe(false);
  });

  test('TC-12 Trigger cookie is armed by clicking a checkout link', async ({ page }) => {
    await harden(page);
    await go(page, `${PDP}?${QA}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await page.waitForTimeout(6000);
    const res = await page.evaluate(() => {
      const a = document.querySelector('a[href="/checkout"]');
      if (!a) return { anchorFound: false, cookie: null };
      a.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      return {
        anchorFound: true,
        cookie: document.cookie.includes('cre_257_checkout_visited=true'),
      };
    });
    expect(res.anchorFound, 'deployment binds a[href="/checkout"] — anchor must exist').toBe(true);
    expect(res.cookie, 'mousedown on the checkout link must set the trigger cookie').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP B — modal content & styling vs Figma
// ─────────────────────────────────────────────────────────────────────────────

test.describe('B. Modal content & styling', () => {
  test.beforeEach(async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
  });

  test('TC-13 Copy matches the Figma exactly', async ({ page }) => {
    const got = await page.evaluate(() => ({
      eyebrow: document.querySelector('.cre-t-257-eyebrow')?.textContent,
      title: document.querySelector('.cre-t-257-title')?.textContent,
      description: document.querySelector('.cre-t-257-description')?.textContent,
      priceLine: document.querySelector('.cre-t-257-price-line')?.textContent,
      cta: document.querySelector('.cre-t-257-cta-text')?.textContent,
    }));
    expect(norm(got.eyebrow)).toBe(COPY.eyebrow);
    expect(norm(got.title)).toBe(COPY.title);
    expect(norm(got.description)).toBe(COPY.description);
    expect(norm(got.priceLine)).toBe(COPY.priceLine);
    expect(norm(got.cta)).toBe(COPY.cta);
  });

  test('TC-14 $125 in the price line is struck through', async ({ page }) => {
    const s = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-257-price-line__strike');
      return el ? { text: el.textContent.trim(), deco: getComputedStyle(el).textDecorationLine } : null;
    });
    expect(s).not.toBeNull();
    expect(s.text).toBe('$125');
    expect(s.deco).toContain('line-through');
  });

  test('TC-15 Overlay dims the page and sits above site content', async ({ page }) => {
    const o = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-257-modal-overlay');
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, pos: cs.position, z: cs.zIndex };
    });
    expect(o.pos).toBe('fixed');
    expect(Number(o.z)).toBeGreaterThan(1000);
    expect(o.bg).toMatch(/rgba?\(/);
  });

  test('TC-16 Underlying page is blurred (Figma "underlying page shading")', async ({ page }) => {
    const b = await page.evaluate(() => ({
      main: document.querySelector('main.main') ? getComputedStyle(document.querySelector('main.main')).filter : 'no-main',
      header: document.querySelector('header.site-header') ? getComputedStyle(document.querySelector('header.site-header')).filter : 'no-header',
      footer: document.querySelector('footer') ? getComputedStyle(document.querySelector('footer')).filter : 'no-footer',
    }));
    expect(b.main).toContain('blur');
    expect(b.header).toContain('blur');
  });

  test('TC-17 Wrapper gradient, radius and shadow match the design', async ({ page }) => {
    const w = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('.cre-t-257-modal-wrapper'));
      return { bg: cs.backgroundImage, radius: cs.borderRadius, shadow: cs.boxShadow };
    });
    expect(w.bg).toContain('gradient');
    expect(w.radius).toBe('12px');
    expect(w.shadow).not.toBe('none');
  });

  test('TC-18 Five snowflake decorations load and are non-interactive', async ({ page }) => {
    const snow = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.cre-t-257-snow-bg')).map((el) => ({
        pe: getComputedStyle(el).pointerEvents,
        src: el.querySelector('img')?.getAttribute('src') || '',
        loaded: el.querySelector('img')?.naturalWidth > 0,
      })),
    );
    expect(snow.length).toBe(5);
    snow.forEach((s) => {
      expect(s.pe).toBe('none');
      expect(s.src).toContain('v2.crocdn.com/Winkbed/WIN257/');
      expect(s.loaded, `snowflake asset failed to load: ${s.src}`).toBe(true);
    });
  });

  test('TC-19 CTA styling: red pill, white bold text', async ({ page }) => {
    const c = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('.cre-t-257-cta'));
      const ts = getComputedStyle(document.querySelector('.cre-t-257-cta-text'));
      return { bg: cs.backgroundColor, radius: cs.borderRadius, cursor: cs.cursor, color: ts.color, weight: ts.fontWeight };
    });
    expect(c.bg).toBe('rgb(254, 95, 76)');
    expect(c.radius).toBe('8px');
    expect(c.cursor).toBe('pointer');
    expect(c.color).toBe('rgb(255, 255, 255)');
    expect(c.weight).toBe('700');
  });

  test('TC-20 Modal is centred and within the 674px max width', async ({ page }) => {
    const m = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-257-modal-container');
      const r = el.getBoundingClientRect();
      return { w: r.width, cx: r.left + r.width / 2, vw: window.innerWidth, vh: window.innerHeight, top: r.top, h: r.height };
    });
    expect(m.w).toBeLessThanOrEqual(674);
    expect(Math.abs(m.cx - m.vw / 2)).toBeLessThan(3);
    expect(m.top).toBeGreaterThanOrEqual(-1);
    expect(m.h).toBeLessThanOrEqual(m.vh + 1);
  });

  test('TC-21 Close icon is present, sized and positioned per CSS', async ({ page }) => {
    const c = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-257-modal-close');
      const cs = getComputedStyle(el);
      return { w: cs.width, cursor: cs.cursor, loaded: el.querySelector('img')?.naturalWidth > 0 };
    });
    expect(c.w).toBe('25px');
    expect(c.cursor).toBe('pointer');
    expect(c.loaded, 'Close.svg failed to load').toBe(true);
  });

  test('TC-22 Spinner is hidden until the CTA is clicked', async ({ page }) => {
    const d = await page.evaluate(() => getComputedStyle(document.querySelector('.cre-t-257-spinner')).display);
    expect(d).toBe('none');
  });

  test('TC-23 No duplicate modal on repeated injection', async ({ page }) => {
    await injectVariation(page);
    const n = await page.evaluate(() => ({
      containers: document.querySelectorAll('.cre-t-257-modal-container').length,
      overlays: document.querySelectorAll('.cre-t-257-modal-overlay').length,
    }));
    expect(n.containers).toBe(1);
    expect(n.overlays).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP C — dismissal
// ─────────────────────────────────────────────────────────────────────────────

test.describe('C. Dismissal', () => {
  test.beforeEach(async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
  });

  test('TC-24 Close icon dismisses the modal', async ({ page }) => {
    await page.evaluate(() => document.querySelector('.cre-t-257-modal-close').click());
    await page.waitForTimeout(300);
    const v = await modalVisible(page);
    expect(v.containerDisplay).toBe('none');
    expect(v.overlayDisplay).toBe('none');
    expect(v.bodyHasOpen).toBe(false);
  });

  test('TC-25 Clicking outside (overlay) dismisses the modal', async ({ page }) => {
    await page.evaluate(() => document.querySelector('.cre-t-257-modal-overlay').click());
    await page.waitForTimeout(300);
    expect((await modalVisible(page)).containerDisplay).toBe('none');
  });

  test('TC-26 Clicking inside the modal does NOT dismiss it', async ({ page }) => {
    await page.evaluate(() => document.querySelector('.cre-t-257-title').click());
    await page.waitForTimeout(300);
    expect((await modalVisible(page)).containerDisplay).toBe('block');
  });

  test('TC-27 Page blur is removed after dismissal', async ({ page }) => {
    await page.evaluate(() => document.querySelector('.cre-t-257-modal-close').click());
    await page.waitForTimeout(300);
    const f = await page.evaluate(() => getComputedStyle(document.querySelector('main.main')).filter);
    expect(f === 'none' || !f.includes('blur')).toBe(true);
  });

  test('TC-28 SPEC: Escape key dismisses the modal', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    expect(
      (await modalVisible(page)).containerDisplay,
      'BUG-11: no keydown handler — Escape does not close the dialog',
    ).toBe('none');
  });

  test('TC-29 SPEC: close control is keyboard operable (Enter)', async ({ page }) => {
    await page.evaluate(() => document.querySelector('.cre-t-257-modal-close').focus());
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(
      (await modalVisible(page)).containerDisplay,
      'BUG-11: role=button + tabindex=0 but click-only handler',
    ).toBe('none');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP D — CTA cart swap + redirect (the money path)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('D. CTA swap & redirect', () => {
  // Group D drives 3 sequential cart writes against production Shopify plus two full page
  // loads; 90s is not enough headroom and produced spurious timeouts.
  test.describe.configure({ timeout: 150000 });

  /** Block the final navigation so we can inspect cart state and the target URL. */
  async function captureRedirect(page) {
    const seen = { url: null };
    await page.route('**/discount/**', async (route) => {
      seen.url = route.request().url();
      await route.abort();
    });
    return seen;
  }

  /**
   * Record every cart write the variation makes. BUG-02 means an empty cart is the
   * signature of "remove succeeded, add failed" — so a bare count assertion cannot tell a
   * logic defect from a throttled /cart/add.js. This makes every failure self-diagnosing.
   */
  function watchCartWrites(page) {
    const writes = [];
    page.on('response', (r) => {
      if (/\/cart\/(add|change|update|clear)\.js/i.test(r.url())) {
        writes.push(`${r.request().method()} ${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}`);
      }
    });
    return writes;
  }

  for (const combo of [
    { handle: 'the-luxury-firm-winkbed', size: 'Queen', label: 'Luxury Firm / Queen' },
    { handle: 'the-softer-winkbed', size: 'King', label: 'Softer / King' },
    { handle: 'the-firmer-winkbed', size: 'Cal. King', label: 'Firmer / Cal. King' },
    { handle: 'the-plus-winkbed', size: 'Twin XL', label: 'Plus / Twin XL' },
  ]) {
    test(`TC-30 Swap keeps size+firmness and adds Frost Cooling — ${combo.label}`, async ({ page }, ti) => {
      await harden(page);
      await armCheckoutReturn(page);
      await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
      const before = await setCart(page, { handle: combo.handle, size: combo.size });
      await reloadPage(page);
      await injectVariation(page);
      const seen = await captureRedirect(page);
      const writes = watchCartWrites(page);

      await page.evaluate(() => document.querySelector('.cre-t-257-cta').click());
      await page.waitForTimeout(9000);

      const after = await readCart(page);
      await ti.attach('cart-writes', {
        body: `${writes.join('\n') || '(none)'}\n\nfinal cart: ${JSON.stringify(after)}`,
        contentType: 'text/plain',
      });
      const trace = `cart writes were:\n${writes.join('\n') || '(none)'}`;
      expect(after.count, `cart must still hold exactly one mattress. ${trace}`).toBe(1);
      expect(after.items[0].title).toContain(before.main.product);
      expect(after.items[0].variant).toBe(`${combo.size} with Frost Cooling Cover`);
      expect(after.items[0].qty).toBe(1);
      expect(seen.url, 'must redirect to the discount URL').toBe(COPY.discountUrl);
    });
  }

  test('TC-31 Spinner replaces the CTA label while the swap runs', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    await captureRedirect(page);
    await page.evaluate(() => document.querySelector('.cre-t-257-cta').click());
    await page.waitForTimeout(150);
    const s = await page.evaluate(() => ({
      spinner: getComputedStyle(document.querySelector('.cre-t-257-spinner')).display,
      label: getComputedStyle(document.querySelector('.cre-t-257-cta-text')).display,
    }));
    expect(s.spinner).toBe('block');
    expect(s.label).toBe('none');
  });

  test('TC-32 SPEC: no redirect when the swap cannot complete', async ({ page }, ti) => {
    // Transcript 4:21 — "once we're confident that that change has been applied,
    // we're going to send them directly to the checkout page".
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    const seen = await captureRedirect(page);
    const writes = watchCartWrites(page);
    // Make the catalog lookup fail — the swap cannot resolve a replacement variant.
    await page.route('**/products.json*', (r) => r.abort());
    await page.evaluate(() => document.querySelector('.cre-t-257-cta').click());
    await page.waitForTimeout(8000);

    const after = await readCart(page);
    await ti.attach('cart-writes', {
      body: `${writes.join('\n') || '(none)'}\n\nfinal cart: ${JSON.stringify(after)}`,
      contentType: 'text/plain',
    });
    expect(
      seen.url,
      'BUG-03: redirect fires unconditionally, so the user reaches checkout with a $125 code and no upgrade',
    ).toBeNull();
    expect(
      after.count,
      'BUG-02: the original item is removed before the replacement is resolved, so a failure empties the cart',
    ).toBe(1);
  });

  test('TC-33 SPEC: double-click must not double-mutate the cart', async ({ page }, ti) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    await captureRedirect(page);
    const writes = watchCartWrites(page);
    await page.evaluate(() => {
      const el = document.querySelector('.cre-t-257-cta');
      el.click();
      el.click();
      el.click();
    });
    await page.waitForTimeout(10000);
    const after = await readCart(page);
    await ti.attach('cart-writes', {
      body: `${writes.join('\n') || '(none)'}\n\nfinal cart: ${JSON.stringify(after)}`,
      contentType: 'text/plain',
    });
    // 3 clicks with an in-flight guard => 3 writes (one run). Without one => 9.
    expect(
      after.count,
      `BUG-06: no in-flight guard, so concurrent runs can double-add or double-remove.\ncart writes were:\n${writes.join('\n')}`,
    ).toBe(1);
  });

  /**
   * TC-40 pins the worst reachable combination of BUG-04 + BUG-03.
   *
   * A "WinkBeds Blue Collection" / "WinkBed Kids Mattress" line item satisfies the
   * substring test at vB.js:64 AND the activation's identical cartMeetsMattressCondition,
   * so the modal is offered. The firmness parse at vB.js:85 then cannot match, so
   * upgradeWinkbedToFrostCooling() `return`s at line 87 — before any cart mutation. But the
   * redirect on vB.js:218 is not conditional on the return value, so the visitor is still
   * sent to /discount/FROST3S1CFP.
   *
   * Net effect: a live $125 discount code is armed with no upgrade delivered and no error
   * shown. This is a revenue-loss path, not a cosmetic one.
   *
   * Distinct from TC-32: there the failure came from a *thrown* fetch, which propagates out
   * of the async handler and happens to skip the redirect. A `return` does not.
   */
  test('TC-40 SPEC: no discount redirect when the item cannot be upgraded', async ({ page }, ti) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);

    // Seed exactly one "winkbed"-named product that is NOT one of the 4 real mattresses.
    const seeded = await page.evaluate(async () => {
      const MATTRESSES = [
        'the-softer-winkbed',
        'the-plus-winkbed',
        'the-luxury-firm-winkbed',
        'the-firmer-winkbed',
      ];
      const { products } = await fetch('/products.json?limit=150', {
        credentials: 'include',
        headers: { 'X-Requested-With': 'xmlhttprequest' },
      }).then((r) => r.json());
      const decoy = products.find(
        (p) =>
          p.title.toLowerCase().includes('winkbed') &&
          !MATTRESSES.includes(p.handle) &&
          p.variants.some((v) => v.available),
      );
      if (!decoy) return { found: false };
      const v = decoy.variants.find((x) => x.available);
      await fetch('/cart/clear.js', { method: 'POST' });
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: v.id, quantity: 1 }] }),
      });
      return { found: true, title: decoy.title, handle: decoy.handle, variant: v.title };
    });

    test.skip(!seeded.found, 'no non-mattress "winkbed"-named product in the live catalog');
    await ti.attach('decoy-product', {
      body: JSON.stringify(seeded, null, 2),
      contentType: 'text/plain',
    });

    await reloadPage(page);
    await injectVariation(page);
    const seen = await captureRedirect(page);
    const writes = watchCartWrites(page);

    await page.evaluate(() => document.querySelector('.cre-t-257-cta').click());
    await page.waitForTimeout(9000);

    const after = await readCart(page);
    await ti.attach('cart-writes', {
      body: `${writes.join('\n') || '(none)'}\n\nfinal cart: ${JSON.stringify(after)}`,
      contentType: 'text/plain',
    });

    // The upgrade provably did not happen…
    expect(
      after.items.some((i) => /frost cooling/i.test(i.variant || '')),
      'no Frost Cooling variant should have been added',
    ).toBe(false);
    // …so the discount must NOT have been armed.
    expect(
      seen.url,
      `BUG-03+BUG-04: "${seeded.title}" qualifies for the modal, cannot be upgraded, yet the ` +
        `$125 discount redirect still fires. Cart writes:\n${writes.join('\n') || '(none)'}`,
    ).toBeNull();
  });

  test('TC-34 Discount URL is exactly the Figma-specified link', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    const seen = await captureRedirect(page);
    await page.evaluate(() => document.querySelector('.cre-t-257-cta').click());
    await page.waitForTimeout(9000);
    expect(seen.url).toBe(COPY.discountUrl);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP E — responsive + hygiene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('E. Responsive & hygiene', () => {
  test('TC-35 Modal fits the viewport with no horizontal overflow', async ({ page }, ti) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);

    // Baseline BEFORE injection. winkbeds.com already overflows horizontally by a varying
    // amount depending on which coexisting CRO tests and lazy sections rendered this run,
    // so an absolute scrollWidth check attributes the site's overflow to our modal. What
    // this case actually claims is that the modal introduces none of its own — a delta.
    const baseline = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      vw: window.innerWidth,
    }));

    await injectVariation(page);
    const m = await page.evaluate(() => {
      const r = document.querySelector('.cre-t-257-modal-container').getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        vw: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    await ti.attach('overflow', {
      body: `baseline scrollWidth=${baseline.scrollWidth} vw=${baseline.vw}\nafter    scrollWidth=${m.scrollWidth} vw=${m.vw}\nmodal rect left=${m.left} right=${m.right}`,
      contentType: 'text/plain',
    });

    expect(m.left).toBeGreaterThanOrEqual(-1);
    expect(m.right).toBeLessThanOrEqual(m.vw + 1);
    expect(
      m.scrollWidth,
      `modal must not introduce horizontal page scroll (site baseline was ${baseline.scrollWidth}px vs viewport ${baseline.vw}px)`,
    ).toBeLessThanOrEqual(Math.max(baseline.scrollWidth, m.vw) + 1);
    await page.screenshot({
      path: path.join(SHOT_DIR, `win257-${ti.project.name.replace(/[^a-z0-9]+/gi, '-')}-responsive.png`),
      timeout: 45000,
    });
  });

  test('TC-36 Snowflakes do not overlap the CTA or the title', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    const clash = await page.evaluate(() => {
      const hit = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
      const targets = ['.cre-t-257-title', '.cre-t-257-cta'].map((s) => ({ s, r: document.querySelector(s).getBoundingClientRect() }));
      const out = [];
      document.querySelectorAll('.cre-t-257-snow-bg').forEach((sn, i) => {
        const sr = sn.getBoundingClientRect();
        targets.forEach((t) => { if (hit(sr, t.r)) out.push(`snow${i} overlaps ${t.s}`); });
      });
      return out;
    });
    expect(clash).toEqual([]);
  });

  test('TC-37 Title uses the mobile type ramp below 768px', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    const t = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('.cre-t-257-title'));
      return { size: cs.fontSize, lh: cs.lineHeight, vw: window.innerWidth };
    });
    if (t.vw <= 767) {
      expect(t.size).toBe('28px');
      expect(t.lh).toBe('34px');
    } else {
      expect(t.size).toBe('31px');
      expect(t.lh).toBe('40px');
    }
  });

  test('TC-38 No JS errors attributable to the variation', async ({ page }, ti) => {
    const errs = [];
    // Console "Failed to load resource: 404" lines carry no URL in their text; the
    // originating URL is on m.location(). Without it a failed run is uninterpretable.
    page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const loc = m.location() || {};
      errs.push(`console: ${m.text()}${loc.url ? ` @ ${loc.url}` : ''}`);
    });
    // Independent record of every non-OK response, so site noise can be told apart
    // from a genuinely missing cre-t-257 asset.
    const badResponses = [];
    page.on('response', (r) => {
      if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`);
    });
    page.on('requestfailed', (r) =>
      badResponses.push(`FAILED ${r.failure()?.errorText || '?'} ${r.url()}`),
    );

    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    await page.evaluate(() => document.querySelector('.cre-t-257-modal-close').click());
    await page.waitForTimeout(1500);

    // The harness itself POSTs /cart/clear.js and /cart/add.js; Shopify answers those
    // with 4xx in some sessions. Those are ours, not the variation's.
    const harnessNoise = /\/cart\/(clear|add|update|change)\.js/i;
    const relevant = badResponses.filter((s) => !harnessNoise.test(s));
    await ti.attach('non-ok-responses', {
      body: badResponses.join('\n') || '(none)',
      contentType: 'text/plain',
    });
    await ti.attach('console-errors', {
      body: errs.join('\n') || '(none)',
      contentType: 'text/plain',
    });

    /*
     * ATTRIBUTION IS AN ALLOWLIST, NOT A DENYLIST.
     *
     * winkbeds.com is a ~1.8MB page carrying Shopify platform beacons, GTM, Klaviyo, Bing,
     * YouTube, Zibby, Bread and fenixcommerce, several of which fail non-deterministically
     * (observed across runs: 404 /assets/underline_blue.svg, a layout.theme.js
     * compare_at_price TypeError, 13x 503 on /.well-known/shopify/monorail). Enumerating
     * that noise is unbounded and made this case flaky rather than informative.
     *
     * This test asks precisely what its title asks: are there errors attributable to the
     * VARIATION? So it matches positively against cre-t-257's own surface — its class
     * prefix, its assets, and the distinctive console.error strings in vB.js. Everything
     * else is captured in the attachments above for human review, but does not fail the run.
     */
    const OURS = [
      /cre-t-257/i,
      /cre_257_checkout_visited/i,
      /Could not determine firmness/i,
      /Could not find product for firmness/i,
      /Could not find variant/i,
      /Found \d+ WinkBed item/i,
      /FROST3S1CFP/i,
    ];
    const attributable = [
      ...errs.filter((t) => OURS.some((r) => r.test(t))),
      ...relevant.filter((s) => /cre-t-257|cre_t_257/i.test(s)),
    ];
    expect(
      attributable,
      `errors attributable to cre-t-257:\n${attributable.join('\n')}\n\n` +
        `(site noise this run, not asserted on:\n${errs.join('\n')})`,
    ).toEqual([]);
  });

  test('TC-39 Background must be scroll-locked while the modal is open', async ({ page }) => {
    await harden(page);
    await armCheckoutReturn(page);
    await go(page, `${PDP}?${QA}&${EFORCE_VAR}`);
    await setCart(page, { handle: 'the-luxury-firm-winkbed', size: 'Queen' });
    await reloadPage(page);
    await injectVariation(page);
    const locked = await page.evaluate(() => {
      const before = window.scrollY;
      window.scrollBy(0, 400);
      return { moved: window.scrollY !== before };
    });
    expect(locked.moved, 'BUG-11: background scrolls behind the modal (no scroll lock)').toBe(false);
  });
});
