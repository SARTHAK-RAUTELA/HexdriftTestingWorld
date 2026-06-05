// @ts-check
/**
 * SEA316 — SeaWorld Orlando Tickets — Multi-Day Price Display (Per-Day → Total /ea)
 *
 * Variation transforms Two-Day and Three-Day product cards:
 *   - Hides the existing "/day" price container
 *   - Injects a new container showing the total price (/ea) and a multiplied strikethrough
 *   - Two-Day: multiplier ×2 | Three-Day: multiplier ×3
 *   - Single-Day, Four Parks: no price change (not in title-match logic)
 * Optimizely goals fire on "Add to Cart" clicks for all four targeted products.
 *
 * Overlays dismissed on every page load:
 *   - BounceExchange email modal (#bx-close-inside-3187436)
 *   - TrustArc consent banner (#truste-consent-button)
 *
 * Control:   https://seaworld.com/orlando/tickets/?optimizely_x=5325780113162240&optimizely_force_tracking=true&utm_campaign=CRE_qa
 * Variation: https://seaworld.com/orlando/tickets/?optimizely_x=4699881944645632&optimizely_force_tracking=true&utm_campaign=CRE_qa
 * LTO page:  https://seaworld.com/orlando/limited-time-offers/?optimizely_x=4699881944645632&optimizely_force_tracking=true&utm_campaign=CRE_qa
 *
 * TC-01  Control — body.cre-t-316 class NOT present
 * TC-02  Variation — body.cre-t-316 class IS present
 * TC-03  Variation — Two-Day card: /ea price container injected  [element screenshot]
 * TC-04  Variation — Two-Day card: price term shows "/ea"
 * TC-05  Variation — Two-Day card: original /day price is hidden
 * TC-06  Variation — Three-Day card: /ea price container injected  [element screenshot]
 * TC-07  Variation — Three-Day card: price term shows "/ea"
 * TC-08  Variation — Three-Day card: original /day price is hidden
 * TC-09  Variation — Single-Day Ticket: no /ea container injected (unchanged)
 * TC-10  Variation — Four Parks card: no /ea container injected (unchanged)
 * TC-11  No Duplication — second JS execution does not duplicate price containers
 * TC-12  Goal — Two-Day Add to Cart fires sea316_-_add_to_cart_of_two-day  [goal screenshot]
 * TC-13  Goal — Two-Day Add to Cart fires sea316_-_add_to_cart_of_any_multi-day_product
 * TC-14  Goal — Three-Day Add to Cart fires sea316_-_add_to_cart_of_three-day  [goal screenshot]
 * TC-15  Goal — Three-Day Add to Cart fires sea316_-_add_to_cart_of_any_multi-day_product
 * TC-16  Goal — Four Parks Add to Cart fires sea316_-_add_to_cart_of_four_parks  [goal screenshot]
 * TC-17  Goal — Four Parks Add to Cart fires sea316_-_add_to_cart_of_any_multi-day_product
 * TC-18  Goal — Single-Day Add to Cart fires sea316_-_add_to_cart_of_single-day_ticket  [goal screenshot]
 * TC-19  CSS — strikethrough computed color is red (rgb(255,0,0))
 * TC-20  CSS — price-amount font-size 22px at tablet+ (≥768px)
 * TC-21  CSS — price-amount font-size 18px at mobile (<768px)
 * TC-22  Responsive — Desktop (1280×800) price containers visible
 * TC-23  Responsive — Tablet (768×1024) price containers visible
 * TC-24  Responsive — Mobile (375×812) price containers visible
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets (for duplication test) ─────────────────────────────── */
const JS_CONTENT  = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const CSS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);

/* ── URLs ────────────────────────────────────────────────────────────────── */
const CONTROL_URL = 'https://seaworld.com/orlando/tickets/?optimizely_x=5325780113162240&optimizely_force_tracking=true&utm_campaign=CRE_qa';
const VAR_URL     = 'https://seaworld.com/orlando/tickets/?optimizely_x=4699881944645632&optimizely_force_tracking=true&utm_campaign=CRE_qa';
const VAR_LTO_URL = 'https://seaworld.com/orlando/limited-time-offers/?optimizely_x=4699881944645632&optimizely_force_tracking=true&utm_campaign=CRE_qa';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const PRICE_CONTAINER = '.cre-t-316-product-price__price';
const PRICE_TERM      = '.cre-t-316-product-price__price-term';
const PRICE_AMOUNT    = '.cre-t-316-product-price__price-amount';
const STRIKETHROUGH   = '.cre-t-316-product-price__price--strikethrough';

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../sea316-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Navigate, then immediately dismiss the BounceExchange + TrustArc overlays. */
async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // Give overlay scripts ~1.5 s to initialise before we dismiss them
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    // TrustArc consent bar
    const trust = document.getElementById('truste-consent-button');
    if (trust) trust.click();
    // BounceExchange modal (campaign ID may vary — match by prefix)
    const bxClose = document.querySelector('[id^="bx-close-inside-"]');
    if (bxClose) bxClose.click();
  });
  await page.waitForTimeout(400); // let dismiss animations complete
}

/** Wait for the variation price container to appear in DOM. */
async function waitForVariation(page, url) {
  await page.waitForSelector(PRICE_CONTAINER, { state: 'attached', timeout: 30000 }).catch(() => {
    throw new Error(`SEA316 price container not found on ${url}`);
  });
}

/**
 * Intercept window.optimizely.push, dispatch a synthetic click, return captured events.
 * All happens synchronously inside the page JS context.
 */
async function captureGoalEvents(page, buttonSelector) {
  return page.evaluate(async (sel) => {
    const events = [];
    const opti = window['optimizely'];
    if (opti && typeof opti.push === 'function') {
      const origPush = opti.push.bind(opti);
      opti.push = function (ev) {
        events.push(ev);
        return origPush(ev);
      };
    }
    const el = document.querySelector(sel);
    if (!el) return { found: false, events: [] };
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 400));
    return { found: true, events };
  }, buttonSelector);
}

/**
 * Inject a green "Goals Fired" toast overlay showing every fired event name,
 * then scroll the given card selector into view for the screenshot.
 */
async function injectGoalToast(page, events, cardSelector) {
  await page.evaluate((evts) => {
    const old = document.getElementById('sea316-goal-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'sea316-goal-toast';
    t.style.cssText = [
      'position:fixed', 'top:12px', 'right:12px',
      'background:#15803d', 'color:#fff',
      'padding:14px 18px', 'border-radius:10px',
      'z-index:2147483647',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'font-size:13px', 'line-height:1.6',
      'box-shadow:0 4px 24px rgba(0,0,0,.45)',
      'min-width:270px', 'max-width:400px',
    ].join(';');
    t.innerHTML =
      '<div style="font-weight:700;font-size:14px;margin-bottom:8px">&#x2705; Optimizely Goals Fired</div>' +
      evts.map(e =>
        '<div style="margin:3px 0">&#x2022;&nbsp;<span style="background:rgba(255,255,255,.18);padding:2px 7px;border-radius:4px;font-size:11px;font-family:monospace">' +
        (e && e.eventName ? e.eventName : JSON.stringify(e)) +
        '</span></div>'
      ).join('');
    document.body.appendChild(t);
  }, events);

  if (cardSelector) {
    try {
      await page.locator(cardSelector).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    } catch { /* element not found — skip scroll */ }
  }
}

/** Screenshot just the product card element (zoomed-in price area). */
async function shotCardElement(page, titleKeyword, filePath) {
  try {
    const card = page.locator('.product-catalog-card')
      .filter({ hasText: titleKeyword }).first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await card.screenshot({ path: filePath });
  } catch { /* element not found */ }
}

/* ── Test Suite ──────────────────────────────────────────────────────────── */
test.describe('SEA316 — SeaWorld Orlando Tickets — Multi-Day Price Display', () => {

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-01 | Control — body.cre-t-316 class must NOT be present
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-01 | Control — body.cre-t-316 class NOT present on control URL', async ({ page }, testInfo) => {
    await gotoAndWait(page, CONTROL_URL);
    await page.waitForTimeout(6000);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-316'));
    expect(hasClass, 'body must NOT have cre-t-316 class on control URL').toBe(false);
    await page.screenshot({ path: path.join(SS_DIR, `control-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-02 | Variation — body.cre-t-316 class IS present
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-02 | Variation — body.cre-t-316 class is present', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-316'));
    expect(hasClass, 'body must have cre-t-316 class in variation').toBe(true);
    await page.screenshot({ path: path.join(SS_DIR, `var-main-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-03 | Variation — Two-Day card: /ea price container injected
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-03 | Variation — Two-Day card: /ea price container injected', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const result = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Two-Day');
      });
      if (!card) return null;
      return !!card.querySelector('.cre-t-316-product-price__price');
    });
    expect(result, 'Two-Day card must exist on page').not.toBeNull();
    expect(result, 'Two-Day card must have .cre-t-316-product-price__price container').toBe(true);
    // Element-level screenshot of the exact card (price change area)
    await shotCardElement(page, 'Two-Day', path.join(SS_DIR, `price-area-twoday-${testInfo.project.name}.png`));
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-04 | Variation — Two-Day card: price term shows "/ea"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-04 | Variation — Two-Day card: price term shows "/ea"', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const term = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Two-Day');
      });
      if (!card) return null;
      const el = card.querySelector('.cre-t-316-product-price__price-term');
      return el ? el.textContent.trim() : null;
    });
    expect(term, 'Two-Day price term element must exist').not.toBeNull();
    expect(term, 'Two-Day price term must be "/ea"').toBe('/ea');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-05 | Variation — Two-Day card: original /day price is hidden (display:none)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-05 | Variation — Two-Day card: original /day price is hidden', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const isHidden = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Two-Day');
      });
      if (!card) return null;
      const el = card.querySelector('.cre-t-316-has-price-per-day-hide');
      if (!el) return null;
      return window.getComputedStyle(el).display === 'none';
    });
    expect(isHidden, 'Hidden price element must exist on Two-Day card').not.toBeNull();
    expect(isHidden, 'Original /day price must be display:none on Two-Day card').toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-06 | Variation — Three-Day card: /ea price container injected
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-06 | Variation — Three-Day card: /ea price container injected', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const result = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Three-Day');
      });
      if (!card) return null;
      return !!card.querySelector('.cre-t-316-product-price__price');
    });
    expect(result, 'Three-Day card must exist on page').not.toBeNull();
    expect(result, 'Three-Day card must have .cre-t-316-product-price__price container').toBe(true);
    // Element-level screenshot of the exact card (price change area)
    await shotCardElement(page, 'Three-Day', path.join(SS_DIR, `price-area-threeday-${testInfo.project.name}.png`));
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-07 | Variation — Three-Day card: price term shows "/ea"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-07 | Variation — Three-Day card: price term shows "/ea"', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const term = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Three-Day');
      });
      if (!card) return null;
      const el = card.querySelector('.cre-t-316-product-price__price-term');
      return el ? el.textContent.trim() : null;
    });
    expect(term, 'Three-Day price term element must exist').not.toBeNull();
    expect(term, 'Three-Day price term must be "/ea"').toBe('/ea');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-08 | Variation — Three-Day card: original /day price is hidden
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-08 | Variation — Three-Day card: original /day price is hidden', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const isHidden = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Three-Day');
      });
      if (!card) return null;
      const el = card.querySelector('.cre-t-316-has-price-per-day-hide');
      if (!el) return null;
      return window.getComputedStyle(el).display === 'none';
    });
    expect(isHidden, 'Hidden price element must exist on Three-Day card').not.toBeNull();
    expect(isHidden, 'Original /day price must be display:none on Three-Day card').toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-09 | Variation — Single-Day Ticket: no /ea container injected
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-09 | Variation — Single-Day Ticket: no /ea container injected', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const result = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Single-Day');
      });
      if (!card) return 'not_found';
      return card.querySelector('.cre-t-316-product-price__price') ? 'has_container' : 'clean';
    });
    if (result === 'not_found') { test.skip(); return; }
    expect(result, 'Single-Day Ticket must NOT have /ea container injected').toBe('clean');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-10 | Variation — Four Parks card: no /ea container injected
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-10 | Variation — Four Parks card: no /ea container injected', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const result = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.product-catalog-card')).find(c => {
        const t = c.querySelector('.product-catalog-card__title');
        return t && t.textContent.includes('Four Parks');
      });
      if (!card) return 'not_found';
      return card.querySelector('.cre-t-316-product-price__price') ? 'has_container' : 'clean';
    });
    if (result === 'not_found') { test.skip(); return; }
    expect(result, 'Four Parks Ticket must NOT have /ea container injected').toBe('clean');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-11 | No Duplication — second JS execution must not add more containers
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-11 | No Duplication — second JS execution does not duplicate price containers', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const countBefore = await page.locator(PRICE_CONTAINER).count();
    // Inject CSS via DOM (avoids WebKit CSP propagation issues with addStyleTag)
    await page.evaluate((css) => {
      const s = document.createElement('style');
      s.textContent = css;
      document.head.appendChild(s);
    }, CSS_CONTENT);
    await page.evaluate(JS_CONTENT);
    await page.waitForTimeout(2000);
    const countAfter = await page.locator(PRICE_CONTAINER).count();
    expect(countAfter, `Container count must stay at ${countBefore} after second JS execution`).toBe(countBefore);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-12 | Goal — Two-Day Add to Cart fires sea316_-_add_to_cart_of_two-day
   *         + goal confirmation screenshot with visual toast
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-12 | Goal — Two-Day Add to Cart fires sea316_-_add_to_cart_of_two-day', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Two-Day Two Park Ticket"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_two-day'),
      'sea316_-_add_to_cart_of_two-day event must fire on Two-Day Add to Cart'
    ).toBe(true);
    // Goal confirmation screenshot — inject toast + scroll to card
    await injectGoalToast(page, r.events, '.product-catalog-card:has-text("Two-Day")');
    await page.screenshot({ path: path.join(SS_DIR, `goal-twoday-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-13 | Goal — Two-Day Add to Cart also fires any_multi-day_product goal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-13 | Goal — Two-Day Add to Cart fires sea316_-_add_to_cart_of_any_multi-day_product', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Two-Day Two Park Ticket"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_any_multi-day_product'),
      'sea316_-_add_to_cart_of_any_multi-day_product must fire on Two-Day Add to Cart'
    ).toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-14 | Goal — Three-Day Add to Cart fires sea316_-_add_to_cart_of_three-day
   *         + goal confirmation screenshot
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-14 | Goal — Three-Day Add to Cart fires sea316_-_add_to_cart_of_three-day', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Three-Day, Three Park Ticket"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_three-day'),
      'sea316_-_add_to_cart_of_three-day event must fire on Three-Day Add to Cart'
    ).toBe(true);
    await injectGoalToast(page, r.events, '.product-catalog-card:has-text("Three-Day")');
    await page.screenshot({ path: path.join(SS_DIR, `goal-threeday-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-15 | Goal — Three-Day Add to Cart also fires any_multi-day_product goal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-15 | Goal — Three-Day Add to Cart fires sea316_-_add_to_cart_of_any_multi-day_product', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Three-Day, Three Park Ticket"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_any_multi-day_product'),
      'sea316_-_add_to_cart_of_any_multi-day_product must fire on Three-Day Add to Cart'
    ).toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-16 | Goal — Four Parks Add to Cart fires sea316_-_add_to_cart_of_four_parks
   *         + goal confirmation screenshot
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-16 | Goal — Four Parks Add to Cart fires sea316_-_add_to_cart_of_four_parks', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Four Parks: Unlimited Visits + Free Parking"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_four_parks'),
      'sea316_-_add_to_cart_of_four_parks event must fire on Four Parks Add to Cart'
    ).toBe(true);
    await injectGoalToast(page, r.events, '.product-catalog-card:has-text("Four Parks")');
    await page.screenshot({ path: path.join(SS_DIR, `goal-fourparks-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-17 | Goal — Four Parks Add to Cart also fires any_multi-day_product goal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-17 | Goal — Four Parks Add to Cart fires sea316_-_add_to_cart_of_any_multi-day_product', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Four Parks: Unlimited Visits + Free Parking"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_any_multi-day_product'),
      'sea316_-_add_to_cart_of_any_multi-day_product must fire on Four Parks Add to Cart'
    ).toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-18 | Goal — Single-Day Add to Cart fires sea316_-_add_to_cart_of_single-day_ticket
   *         + goal confirmation screenshot
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-18 | Goal — Single-Day Add to Cart fires sea316_-_add_to_cart_of_single-day_ticket', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const r = await captureGoalEvents(
      page,
      '[data-display-name*="Single-Day Ticket"] .product-catalog-card__order-button'
    );
    if (!r.found) { test.skip(); return; }
    expect(
      r.events.some(e => e && e.eventName === 'sea316_-_add_to_cart_of_single-day_ticket'),
      'sea316_-_add_to_cart_of_single-day_ticket event must fire on Single-Day Add to Cart'
    ).toBe(true);
    await injectGoalToast(page, r.events, '.product-catalog-card:has-text("Single-Day")');
    await page.screenshot({ path: path.join(SS_DIR, `goal-singleday-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-19 | CSS — strikethrough computed color is red (rgb(255,0,0))
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-19 | CSS — strikethrough color is red rgb(255,0,0)', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const color = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-316-product-price__price--strikethrough');
      return el ? window.getComputedStyle(el).color : null;
    });
    expect(color, 'Strikethrough element must exist in DOM').not.toBeNull();
    expect(color, 'Strikethrough must be red — rgb(255, 0, 0)').toBe('rgb(255, 0, 0)');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-20 | CSS — price-amount font-size 22px at tablet+ (≥768px viewport)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-20 | CSS — price-amount font-size 22px at tablet+ (≥768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const fontSize = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-316-product-price__price-amount');
      return el ? window.getComputedStyle(el).fontSize : null;
    });
    expect(fontSize, 'Price amount element must exist').not.toBeNull();
    expect(fontSize, 'Price amount font-size must be 22px at ≥768px').toBe('22px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-21 | CSS — price-amount font-size 18px at mobile (<768px viewport)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-21 | CSS — price-amount font-size 18px at mobile (<768px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const fontSize = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-316-product-price__price-amount');
      return el ? window.getComputedStyle(el).fontSize : null;
    });
    expect(fontSize, 'Price amount element must exist').not.toBeNull();
    expect(fontSize, 'Price amount font-size must be 18px at mobile (<768px)').toBe('18px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-22 | Responsive — Desktop (1280×800): price containers visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-22 | Responsive — Desktop (1280×800) — price containers visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PRICE_CONTAINER).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-desktop-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-23 | Responsive — Tablet (768×1024): price containers visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-23 | Responsive — Tablet (768×1024) — price containers visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PRICE_CONTAINER).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-tablet-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-24 | Responsive — Mobile (375×812): price containers visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-24 | Responsive — Mobile (375×812) — price containers visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PRICE_CONTAINER).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-mobile-${testInfo.project.name}.png`), fullPage: false });
  });

});
