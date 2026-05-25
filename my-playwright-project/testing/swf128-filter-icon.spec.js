// @ts-check
/**
 * SWF128 — Pet Insurance Gurus — Customize Results Filter Icon + Copy
 * Variation adds "Customize results for your pet" text + filter icon before
 * the filter-options element inside #comparison-section.
 *
 * Control:    https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052131.1000255629
 * Variation:
 *   URL-1  https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052131.1000255630
 *   URL-2  https://petinsurancegurus.com/home/?cro_mode=qa&_conv_eforce=100052131.1000255630
 *   URL-3  https://petinsurancegurus.com/comparison/?cro_mode=qa&_conv_eforce=100052131.1000255630
 * Audience: All users | Desktop · Tablet · Mobile
 *
 * TC-01  Control — no icon-text-wrapper on control URL
 * TC-02  Variation homepage (/) — icon-text-wrapper injected
 * TC-03  Variation /home/ — icon-text-wrapper injected
 * TC-04  Variation /comparison/ — icon-text-wrapper injected
 * TC-05  Content — exact text "Customize results for your pet"
 * TC-06  Content — filter SVG icon present with correct CDN src
 * TC-07  No Duplication — second JS execution does not duplicate element
 * TC-08  CSS — .filter-options margin-top is 0px
 * TC-09  Goal — filter tab click pushes triggerConversion to _conv_q
 * TC-10  Goal — ZIP code field click pushes triggerConversion to _conv_q
 * TC-11  Responsive — Desktop (1280×800) element visible
 * TC-12  Responsive — Tablet (768×1024) element visible
 * TC-13  Responsive — Mobile (375×812) element visible
 * TC-14  CSS — #comparison-section>.ct-section-inner-wrap has align-items flex-start
 * TC-15  Sitewide — all 3 variation URLs render icon-text-wrapper
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets (for duplication test only) ───────────────────────── */
const JS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const CSS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);

/* ── Preview URLs ────────────────────────────────────────────────────────── */
const CONTROL_URL   = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052131.1000255629';
const VAR_HOME_URL  = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052131.1000255630';
const VAR_HOME2_URL = 'https://petinsurancegurus.com/home/?cro_mode=qa&_conv_eforce=100052131.1000255630';
const VAR_COMP_URL  = 'https://petinsurancegurus.com/comparison/?cro_mode=qa&_conv_eforce=100052131.1000255630';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const WRAPPER_SEL = '.cre-t-128-icon-text-wrapper';
const TEXT_SEL    = '.cre-t-128-icon-text';
const ICON_SEL    = '.cre-t-128-filter-icon';

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../swf128-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // Try to dismiss any cookie consent banner that might block interactions
  try {
    await page.locator(
      '[id*="cookie"] button.accept, .cmplz-accept, #accept-cookies, ' +
      '[class*="consent"] button:has-text("Accept"), button:has-text("Accept All")'
    ).first().click({ timeout: 3000 });
  } catch { /* ignore — no consent banner */ }
}

async function waitForVariation(page, url) {
  // Wait for the variation element to appear (platform injects it asynchronously)
  // 30s timeout to handle slower WebKit page loads
  await page.waitForSelector(WRAPPER_SEL, { state: 'attached', timeout: 30000 }).catch(() => {
    throw new Error(`SWF128 variation icon-text-wrapper not found on ${url}`);
  });
}

/* ── Tests ───────────────────────────────────────────────────────────────── */
test.describe('SWF128 — Pet Insurance Gurus — Customize Results Filter Icon', () => {

  /* ───────────────────────────────────────────────────────────────────────
   * TC-01 | Control — no icon-text-wrapper on control URL
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-01 | Control — No cre-t-128-icon-text-wrapper on control URL', async ({ page }, testInfo) => {
    await gotoAndWait(page, CONTROL_URL);
    // Give the page 6 seconds for any delayed scripts before asserting absence
    await page.waitForTimeout(6000);
    const count = await page.locator(WRAPPER_SEL).count();
    expect(count, 'Variation element must NOT appear on control URL').toBe(0);
    await page.screenshot({
      path: path.join(SS_DIR, `control-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-02 | Variation homepage (/) — icon-text-wrapper injected exactly once
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-02 | Variation (/) — cre-t-128-icon-text-wrapper injected', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(WRAPPER_SEL)).toHaveCount(1);
    await page.screenshot({
      path: path.join(SS_DIR, `var-home-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-03 | Variation /home/ — icon-text-wrapper injected
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-03 | Variation (/home/) — cre-t-128-icon-text-wrapper injected', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME2_URL);
    await waitForVariation(page, VAR_HOME2_URL);
    await expect(page.locator(WRAPPER_SEL)).toHaveCount(1);
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-04 | Variation /comparison/ — icon-text-wrapper injected
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-04 | Variation (/comparison/) — cre-t-128-icon-text-wrapper injected', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_COMP_URL);
    await waitForVariation(page, VAR_COMP_URL);
    await expect(page.locator(WRAPPER_SEL)).toHaveCount(1);
    await page.screenshot({
      path: path.join(SS_DIR, `var-comparison-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-05 | Content — exact text "Customize results for your pet"
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-05 | Content — Exact text "Customize results for your pet"', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(TEXT_SEL)).toHaveText('Customize results for your pet');
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-06 | Content — filter SVG icon has correct CDN src + alt text
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-06 | Content — Filter SVG icon present with CDN src and alt text', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(ICON_SEL)).toHaveAttribute('src', /filter\.svg/);
    await expect(page.locator(ICON_SEL)).toHaveAttribute('alt', 'Filter Icon');
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-07 | No Duplication — running JS a second time (console paste) does
   *         NOT create a duplicate icon-text-wrapper
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-07 | No Duplication — Second JS execution does not duplicate element', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);

    // Simulate pasting the variation code into the browser console a second time
    await page.addStyleTag({ content: CSS_CONTENT });
    await page.evaluate(JS_CONTENT);
    await page.waitForTimeout(1000); // allow any async init to settle

    // Must still be exactly 1 wrapper
    await expect(page.locator(WRAPPER_SEL)).toHaveCount(1);
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-08 | CSS — .filter-options margin-top is 0px in variation
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-08 | CSS — .filter-options margin-top is 0px', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);

    const marginTop = await page.evaluate(() => {
      var el = document.querySelector('.filter-options');
      return el ? window.getComputedStyle(el).marginTop : null;
    });
    expect(marginTop, '.filter-options must exist on the page').not.toBeNull();
    expect(marginTop).toBe('0px');
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-09 | Goal — filter tab mousedown pushes triggerConversion to _conv_q
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-09 | Goal — Filter tab click pushes triggerConversion event', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);

    // Intercept _conv_q after page + variation have loaded
    await page.evaluate(() => { window._conv_q = []; });

    const tabSel = '.filter-options .oxy-tabs .oxy-tab';
    const tabCount = await page.locator(tabSel).count();
    if (tabCount === 0) {
      test.skip();
      return;
    }

    // Dispatch bubbling mousedown so the document-level live() listener catches it
    await page.locator(tabSel).nth(1).dispatchEvent('mousedown', { bubbles: true, cancelable: true });
    await page.waitForTimeout(300);

    const convQ = await page.evaluate(() => window._conv_q || []);
    const hasTrigger = Array.isArray(convQ) && convQ.some(
      item => Array.isArray(item) && item[0] === 'triggerConversion'
    );
    expect(hasTrigger).toBe(true);
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-10 | Goal — ZIP code field mousedown pushes triggerConversion to _conv_q
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-10 | Goal — ZIP code field click pushes triggerConversion event', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);

    await page.evaluate(() => { window._conv_q = []; });

    const zipSel = '[placeholder="Enter Zip Code"]';
    const zipCount = await page.locator(zipSel).count();
    if (zipCount === 0) {
      test.skip();
      return;
    }

    await page.locator(zipSel).first().dispatchEvent('mousedown', { bubbles: true, cancelable: true });
    await page.waitForTimeout(300);

    const convQ = await page.evaluate(() => window._conv_q || []);
    const hasTrigger = Array.isArray(convQ) && convQ.some(
      item => Array.isArray(item) && item[0] === 'triggerConversion'
    );
    expect(hasTrigger).toBe(true);
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-11 | Responsive — Desktop (1280×800) icon-text-wrapper visible
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-11 | Responsive — Desktop (1280×800) — icon-text visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(WRAPPER_SEL)).toBeVisible();
    await page.screenshot({
      path: path.join(SS_DIR, `responsive-desktop-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-12 | Responsive — Tablet (768×1024) icon-text-wrapper visible
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-12 | Responsive — Tablet (768×1024) — icon-text visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(WRAPPER_SEL)).toBeVisible();
    await page.screenshot({
      path: path.join(SS_DIR, `responsive-tablet-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-13 | Responsive — Mobile (375×812) icon-text-wrapper visible
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-13 | Responsive — Mobile (375×812) — icon-text visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(WRAPPER_SEL)).toBeVisible();
    await page.screenshot({
      path: path.join(SS_DIR, `responsive-mobile-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-14 | CSS — #comparison-section>.ct-section-inner-wrap align-items flex-start
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-14 | CSS — #comparison-section inner-wrap has align-items flex-start', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);

    const alignItems = await page.evaluate(() => {
      var el = document.querySelector('#comparison-section>.ct-section-inner-wrap');
      return el ? window.getComputedStyle(el).alignItems : null;
    });
    expect(alignItems, '#comparison-section>.ct-section-inner-wrap must exist').not.toBeNull();
    expect(alignItems).toBe('flex-start');
  });

  /* ───────────────────────────────────────────────────────────────────────
   * TC-15 | Sitewide — all 3 variation URLs render icon-text-wrapper exactly once
   * ───────────────────────────────────────────────────────────────────── */
  test('TC-15 | Sitewide — All 3 variation URLs render icon-text-wrapper', async ({ page }) => {
    const urls = [VAR_HOME_URL, VAR_HOME2_URL, VAR_COMP_URL];
    for (const url of urls) {
      await gotoAndWait(page, url);
      await waitForVariation(page, url);
      const count = await page.locator(WRAPPER_SEL).count();
      expect(count, `Expected exactly 1 wrapper on ${url}`).toBe(1);
    }
  });

});
