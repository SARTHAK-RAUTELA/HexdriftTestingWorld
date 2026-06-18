// @ts-check
/**
 * CRE-T-133 — Pet Insurance Gurus — ZIP Code Pop-up Modal (V1 vs V2)
 *
 * V1 (vB.js / vB.css): ZIP modal WITH close button (X)
 *   - X button visible top-right; clicking outside card also dismisses
 *   - Cookie cre-t-133-seen set on close or valid ZIP submit
 *
 * V2 (js.js / hello.css): ZIP modal WITHOUT close button
 *   - No X button, no backdrop-click dismiss
 *   - Cookie cre-t-133-v2-seen set immediately when modal is injected
 *
 * Both show 1 s after page load; suppressed if "zip" appears in URL.
 * Target pages: petinsurancegurus.com homepage + /compare/
 * Audience: All users | Desktop · Mobile
 *
 * V1 preview: https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052293.1000256038
 * V2 preview: https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052293.1000256039
 *
 * TC-01  V1 — body.cre-t-133 class added on homepage
 * TC-02  V1 — modal overlay injected and visible  [screenshot]
 * TC-03  V1 — close button (X) is present in modal
 * TC-04  V1 — clicking X closes modal (hidden attr set, modal-active removed)  [screenshot]
 * TC-05  V1 — clicking overlay backdrop closes modal  [screenshot]
 * TC-06  V1 — modal suppressed when URL contains "zip"
 * TC-07  V1 — modal appears on /compare/ page  [screenshot]
 * TC-08  V2 — modal overlay injected and visible  [screenshot]
 * TC-09  V2 — close button (X) NOT present in modal  [screenshot]
 * TC-10  V2 — cookie cre-t-133-v2-seen set on inject (no user action needed)
 * TC-11  V2 — clicking overlay backdrop does NOT close modal  [screenshot]
 * TC-12  V2 — modal suppressed when URL contains "zip"
 * TC-13  V2 — modal appears on /compare/ page  [screenshot]
 * TC-14  ZIP — non-numeric characters stripped in real time
 * TC-15  ZIP — input limited to 5 digits max
 * TC-16  ZIP — empty/invalid submit shows red error border (#e02424)  [screenshot]
 * TC-17  ZIP — typing into input clears red error border
 * TC-18  Content — heading "Enter your ZIP for pet insurance prices in your area"
 * TC-19  Content — submit label "Show my prices" + CSS text-transform:uppercase
 * TC-20  Responsive — Mobile 390×844: modal card visible and fits viewport
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets ────────────────────────────────────────────────────── */
const V1_JS  = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/vB.js'),     'utf8');
const V1_CSS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/vB.css'),    'utf8');
const V2_JS  = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/js.js'),     'utf8');
const V2_CSS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/hello.css'), 'utf8');

/* ── Preview URLs ────────────────────────────────────────────────────────── */
const V1_URL         = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052293.1000256038';
const V2_URL         = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052293.1000256039';
const V1_COMPARE_URL = 'https://petinsurancegurus.com/compare/?cro_mode=qa&_conv_eforce=100052293.1000256038';
const V2_COMPARE_URL = 'https://petinsurancegurus.com/compare/?cro_mode=qa&_conv_eforce=100052293.1000256039';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const OVERLAY      = '.cre-t-133-overlay';
const CARD         = '.cre-t-133-card';
const CLOSE_BTN    = '.cre-t-133-close';
const INPUT        = '.cre-t-133-input';
const SUBMIT       = '.cre-t-133-submit';
const HEADING      = '.cre-t-133-heading';
const SUBMIT_LABEL = '.cre-t-133-submit-label';

/* ── Expected values ─────────────────────────────────────────────────────── */
const ERR_BORDER_COLOR = 'rgb(224, 36, 36)'; // #e02424 browser-normalised

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../cre-t-133-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  try {
    await page.locator(
      '[id*="cookie"] button.accept, .cmplz-accept, #accept-cookies, ' +
      '[class*="consent"] button:has-text("Accept"), button:has-text("Accept All")'
    ).first().click({ timeout: 3000 });
  } catch { /* no consent banner present */ }
}

async function waitForModal(page) {
  await page.waitForSelector(OVERLAY, { state: 'attached', timeout: 12000 });
  await page.waitForTimeout(300);
}

/* ── Test Suite ──────────────────────────────────────────────────────────── */

test.describe('CRE-T-133 — Pet Insurance Gurus — ZIP Code Pop-up Modal', () => {

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-01 | V1 — body.cre-t-133 class added on homepage
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-01 | V1 — body.cre-t-133 class added on homepage', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-133'));
    expect(hasClass, 'body must have class cre-t-133 in V1').toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-02 | V1 — modal overlay injected and visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-02 | V1 — modal overlay injected and visible', async ({ page }, testInfo) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await expect(page.locator(OVERLAY).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `tc02-v1-modal-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-03 | V1 — close button (X) present in modal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-03 | V1 — close button (X) present in modal', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await expect(page.locator(CLOSE_BTN).first()).toBeVisible();
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-04 | V1 — clicking X closes modal (hidden attr set + modal-active removed)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-04 | V1 — clicking X button closes modal', async ({ page }, testInfo) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await page.locator(CLOSE_BTN).first().click({ force: true });
    await page.waitForTimeout(400);
    const hidden = await page.evaluate(() => {
      const ov = document.querySelector('.cre-t-133-overlay');
      return ov ? ov.hasAttribute('hidden') : null;
    });
    expect(hidden, 'Overlay must have [hidden] attribute after clicking X').toBe(true);
    const modalActive = await page.evaluate(() =>
      document.body.classList.contains('cre-t-133-modal-active')
    );
    expect(modalActive, 'body must lose cre-t-133-modal-active class after close').toBe(false);
    await page.screenshot({ path: path.join(SS_DIR, `tc04-v1-close-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-05 | V1 — clicking overlay backdrop (outside card) closes modal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-05 | V1 — clicking overlay backdrop closes modal', async ({ page }, testInfo) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    // Mousedown at top-left viewport corner — inside overlay, outside centred card
    await page.mouse.move(5, 5);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(400);
    const hidden = await page.evaluate(() => {
      const ov = document.querySelector('.cre-t-133-overlay');
      return ov ? ov.hasAttribute('hidden') : null;
    });
    expect(hidden, 'Overlay must be hidden after clicking backdrop').toBe(true);
    await page.screenshot({ path: path.join(SS_DIR, `tc05-v1-backdrop-close-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-06 | V1 — modal suppressed when URL contains "zip"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-06 | V1 — modal NOT shown when URL contains "zip"', async ({ page }) => {
    await gotoAndWait(page, V1_URL + '&zip=90210');
    await page.waitForTimeout(2500);
    const count = await page.locator(OVERLAY).count();
    expect(count, 'Modal must NOT appear when URL contains "zip"').toBe(0);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-07 | V1 — modal appears on /compare/ page
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-07 | V1 — modal appears on /compare/ page', async ({ page }, testInfo) => {
    await gotoAndWait(page, V1_COMPARE_URL);
    await waitForModal(page);
    await expect(page.locator(OVERLAY).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `tc07-v1-compare-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-08 | V2 — modal overlay injected and visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-08 | V2 — modal overlay injected and visible', async ({ page }, testInfo) => {
    await gotoAndWait(page, V2_URL);
    await waitForModal(page);
    await expect(page.locator(OVERLAY).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `tc08-v2-modal-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-09 | V2 — close button (X) NOT present in modal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-09 | V2 — close button (X) NOT present in modal', async ({ page }, testInfo) => {
    await gotoAndWait(page, V2_URL);
    await waitForModal(page);
    const count = await page.locator(CLOSE_BTN).count();
    expect(count, 'V2 modal must NOT have a close button').toBe(0);
    await page.screenshot({ path: path.join(SS_DIR, `tc09-v2-no-close-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-10 | V2 — cookie cre-t-133-v2-seen set on inject (no user action)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-10 | V2 — cookie cre-t-133-v2-seen set immediately on modal inject', async ({ page }) => {
    await gotoAndWait(page, V2_URL);
    await waitForModal(page);
    const cookies = await page.context().cookies();
    const seen = cookies.find(c => c.name === 'cre-t-133-v2-seen');
    expect(seen, 'cre-t-133-v2-seen cookie must exist after modal inject').toBeDefined();
    expect(seen.value, 'Cookie value must be "1"').toBe('1');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-11 | V2 — clicking overlay backdrop does NOT close modal
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-11 | V2 — clicking overlay backdrop does NOT dismiss modal', async ({ page }, testInfo) => {
    await gotoAndWait(page, V2_URL);
    await waitForModal(page);
    await page.mouse.move(5, 5);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(400);
    const hidden = await page.evaluate(() => {
      const ov = document.querySelector('.cre-t-133-overlay');
      return ov ? ov.hasAttribute('hidden') : false;
    });
    expect(hidden, 'V2 modal must stay open after backdrop click (no dismiss handler)').toBe(false);
    await page.screenshot({ path: path.join(SS_DIR, `tc11-v2-backdrop-stays-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-12 | V2 — modal suppressed when URL contains "zip"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-12 | V2 — modal NOT shown when URL contains "zip"', async ({ page }) => {
    await gotoAndWait(page, V2_URL + '&zip=90210');
    await page.waitForTimeout(2500);
    const count = await page.locator(OVERLAY).count();
    expect(count, 'V2 modal must NOT appear when URL contains "zip"').toBe(0);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-13 | V2 — modal appears on /compare/ page
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-13 | V2 — modal appears on /compare/ page', async ({ page }, testInfo) => {
    await gotoAndWait(page, V2_COMPARE_URL);
    await waitForModal(page);
    await expect(page.locator(OVERLAY).first()).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `tc13-v2-compare-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-14 | ZIP — non-numeric characters stripped in real time
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-14 | ZIP input — non-numeric characters stripped in real time', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await page.locator(INPUT).first().fill('abc12');
    await page.waitForTimeout(200);
    const val = await page.locator(INPUT).first().inputValue();
    expect(val, 'Non-numeric chars must be stripped — only "12" should remain').toBe('12');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-15 | ZIP — input limited to 5 digits max
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-15 | ZIP input — limited to 5 digits max', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await page.locator(INPUT).first().fill('123456789');
    await page.waitForTimeout(200);
    const val = await page.locator(INPUT).first().inputValue();
    expect(val, 'ZIP value must be truncated to exactly 5 digits').toBe('12345');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-16 | ZIP — invalid/empty submit shows red error border (#e02424)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-16 | ZIP input — invalid submit shows red error border', async ({ page }, testInfo) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    // Use evaluate to fire the submit event directly — clicking type="submit" in Firefox
    // headless with { force: true } triggers native form navigation before JS e.preventDefault()
    await page.evaluate(() => {
      const form = document.querySelector('.cre-t-133-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(300);
    const borderColor = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-133-input');
      return el ? window.getComputedStyle(el).borderTopColor : null;
    });
    expect(borderColor, `Error border must be ${ERR_BORDER_COLOR} (#e02424)`).toBe(ERR_BORDER_COLOR);
    await page.screenshot({ path: path.join(SS_DIR, `tc16-invalid-zip-${testInfo.project.name}.png`) });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-17 | ZIP — typing clears the red error border
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-17 | ZIP input — typing clears red error border', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await page.evaluate(() => {
      const form = document.querySelector('.cre-t-133-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(200);
    await page.locator(INPUT).first().fill('9');
    await page.waitForTimeout(200);
    const inlineBorder = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-133-input');
      return el ? el.style.borderColor : null;
    });
    expect(inlineBorder, 'Inline borderColor must be cleared ("") after typing').toBe('');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-18 | Content — heading text matches Figma design
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-18 | Content — heading matches Figma design text', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    const text = await page.locator(HEADING).first().innerText();
    expect(
      text.replace(/\s+/g, ' ').trim(),
      'Heading must read "Enter your ZIP for pet insurance prices in your area"'
    ).toContain('Enter your ZIP for pet insurance prices in your area');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-19 | Content — submit label "Show my prices" with CSS text-transform:uppercase
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-19 | Content — submit label text and CSS text-transform uppercase', async ({ page }) => {
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    const labelText = await page.locator(SUBMIT_LABEL).first().textContent();
    expect(labelText.trim(), 'Submit label HTML text must be "Show my prices"').toBe('Show my prices');
    const textTransform = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-133-submit-label');
      return el ? window.getComputedStyle(el).textTransform : null;
    });
    expect(textTransform, 'CSS text-transform must be "uppercase"').toBe('uppercase');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-20 | Responsive — Mobile 390×844: modal card visible and fits viewport
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-20 | Responsive — Mobile 390×844 — modal card visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndWait(page, V1_URL);
    await waitForModal(page);
    await expect(page.locator(CARD).first()).toBeVisible();
    const box = await page.locator(CARD).first().boundingBox();
    expect(box, 'Card must have a bounding box').not.toBeNull();
    expect(box.width, 'Card width must be ≤ 390px on mobile').toBeLessThanOrEqual(390);
    await page.screenshot({ path: path.join(SS_DIR, `tc20-mobile-390-${testInfo.project.name}.png`) });
  });

});
