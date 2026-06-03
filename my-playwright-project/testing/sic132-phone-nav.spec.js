// @ts-check
/**
 * SIC132 — Pet Insurance Gurus — Phone Number in Header Navigation
 * Variation injects "+1 (800) 693-3529" with a phone icon into the header nav
 * after the "Contact" menu item. On viewports ≤375 px the Contact link is
 * dropped to avoid wrapping; at ≤767 px fonts and icon shrink.
 *
 * Control:   https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052189.1000255762
 * Variation:
 *   URL-1  https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052189.1000255763
 *   URL-2  https://petinsurancegurus.com/home/?cro_mode=qa&_conv_eforce=100052189.1000255763
 *   URL-3  https://petinsurancegurus.com/comparison/?cro_mode=qa&_conv_eforce=100052189.1000255763
 * Audience: All users | Desktop · Tablet · Mobile
 *
 * TC-01  Control — phone container NOT in header nav
 * TC-02  Variation (/) — phone container injected once
 * TC-03  Variation (/home/) — phone container injected once
 * TC-04  Variation (/comparison/) — phone container injected once
 * TC-05  Content — phone link text is "+1 (800) 693-3529"
 * TC-06  Content — phone icon img present with CDN src
 * TC-07  Phone link — href="tel:+18006933529" (click-to-call)
 * TC-08  No Duplication — second JS execution does not add second phone container
 * TC-09  Responsive — Desktop (1280×800) phone container visible
 * TC-10  Responsive — Tablet (768×1024) phone container visible
 * TC-11  Responsive — Mobile (390×844) phone visible AND Contact visible
 * TC-12  Responsive — Narrow Mobile (360×780) phone visible BUT Contact hidden
 * TC-13  CSS — phone link computed color is #0272E4 on desktop
 * TC-14  CSS — phone link font-size is 16px on desktop (>767px)
 * TC-15  CSS — phone link font-size is 13px on mobile (≤767px)
 * TC-16  CSS — phone icon computed width is 14px on desktop
 * TC-17  CSS — phone icon computed width is 9px on mobile (≤767px)
 * TC-18  CSS — phone link hover color is #358EE9
 * TC-19  Sitewide — all 3 variation URLs render phone container exactly once
 * TC-20  Body class — body.cre-t-132 is present in variation
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets (duplication test) ────────────────────────────────── */
const JS_CONTENT  = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const CSS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);

/* ── Preview URLs ────────────────────────────────────────────────────────── */
const CONTROL_URL = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052189.1000255762';
const VAR_URL     = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052189.1000255763';
const VAR_HOME_URL = 'https://petinsurancegurus.com/home/?cro_mode=qa&_conv_eforce=100052189.1000255763';
const VAR_COMP_URL = 'https://petinsurancegurus.com/comparison/?cro_mode=qa&_conv_eforce=100052189.1000255763';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const PHONE_CONTAINER = '.cre-t-132-phone-container';
const PHONE_LINK      = '.cre-t-132-phone-link';
const PHONE_ICON      = '.cre-t-132-phone-icon';
const CONTACT_ITEM    = '.cre-t-132-contact-item';

/* ── Expected values ─────────────────────────────────────────────────────── */
const PHONE_TEXT   = '+1 (800) 693-3529';
const PHONE_HREF   = 'tel:+18006933529';
const ICON_CDN_SRC = 'cre-132-phone-icon.svg';
const COLOR_NORMAL = 'rgb(2, 114, 228)';   // #0272E4
const COLOR_HOVER  = 'rgb(53, 142, 233)';  // #358EE9

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../sic132-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  try {
    await page.locator(
      '[id*="cookie"] button.accept, .cmplz-accept, #accept-cookies, ' +
      '[class*="consent"] button:has-text("Accept"), button:has-text("Accept All")'
    ).first().click({ timeout: 3000 });
  } catch { /* no consent banner */ }
}

async function waitForVariation(page, url) {
  await page.waitForSelector(PHONE_CONTAINER, { state: 'attached', timeout: 30000 }).catch(() => {
    throw new Error(`SIC132 phone container not found on ${url}`);
  });
}

/* ── Tests ───────────────────────────────────────────────────────────────── */
test.describe('SIC132 — Pet Insurance Gurus — Phone Number in Header Nav', () => {

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-01 | Control — phone container must NOT appear
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-01 | Control — no phone container on control URL', async ({ page }, testInfo) => {
    await gotoAndWait(page, CONTROL_URL);
    await page.waitForTimeout(6000);
    const count = await page.locator(PHONE_CONTAINER).count();
    expect(count, 'Phone container must NOT appear on control URL').toBe(0);
    await page.screenshot({ path: path.join(SS_DIR, `control-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-02 | Variation (/) — phone container injected once
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-02 | Variation (/) — phone container injected', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_CONTAINER)).toHaveCount(1);
    await page.screenshot({ path: path.join(SS_DIR, `var-home-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-03 | Variation (/home/) — phone container injected once
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-03 | Variation (/home/) — phone container injected', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME_URL);
    await waitForVariation(page, VAR_HOME_URL);
    await expect(page.locator(PHONE_CONTAINER)).toHaveCount(1);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-04 | Variation (/comparison/) — phone container injected once
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-04 | Variation (/comparison/) — phone container injected', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_COMP_URL);
    await waitForVariation(page, VAR_COMP_URL);
    await expect(page.locator(PHONE_CONTAINER)).toHaveCount(1);
    await page.screenshot({ path: path.join(SS_DIR, `var-comparison-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-05 | Content — phone link text is "+1 (800) 693-3529"
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-05 | Content — phone text is "+1 (800) 693-3529"', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_LINK)).toHaveText(PHONE_TEXT);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-06 | Content — phone icon img present with CDN src
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-06 | Content — phone icon img present with CDN src', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_ICON)).toHaveAttribute('src', new RegExp(ICON_CDN_SRC));
    await expect(page.locator(PHONE_ICON)).toHaveAttribute('alt', 'Phone Icon');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-07 | Phone link — href="tel:+18006933529" for click-to-call
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-07 | Phone link — href is tel:+18006933529', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_LINK)).toHaveAttribute('href', PHONE_HREF);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-08 | No Duplication — second JS run must not add a second phone container
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-08 | No Duplication — second JS execution does not duplicate phone element', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);

    await page.addStyleTag({ content: CSS_CONTENT });
    await page.evaluate(JS_CONTENT);
    await page.waitForTimeout(1000);

    await expect(page.locator(PHONE_CONTAINER)).toHaveCount(1);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-09 | Responsive — Desktop (1280×800) phone container visible
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-09 | Responsive — Desktop (1280×800) — phone visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_CONTAINER)).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-desktop-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-10 | Responsive — Tablet (768×1024) phone container visible
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-10 | Responsive — Tablet (768×1024) — phone visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_CONTAINER)).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-tablet-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-11 | Responsive — Mobile (390×844): phone visible, Contact visible
   * 390 > 375 so Contact drop rule does NOT apply
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-11 | Responsive — Mobile (390×844) — phone visible, Contact visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await expect(page.locator(PHONE_CONTAINER)).toBeVisible();
    // Contact item should be visible at 390px (only hidden at ≤375px)
    const contactDisplay = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-contact-item');
      return el ? window.getComputedStyle(el).display : null;
    });
    expect(contactDisplay, 'Contact item must exist in DOM at 390px').not.toBeNull();
    expect(contactDisplay, 'Contact must NOT be hidden at 390px (only at ≤375px)').not.toBe('none');
    await page.screenshot({ path: path.join(SS_DIR, `responsive-mobile-390-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-12 | Responsive — Narrow Mobile (360×780): phone visible, Contact hidden
   * 360 ≤ 375 so Contact drop rule applies — phone must still show
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-12 | Responsive — Narrow Mobile (360×780) — phone visible, Contact hidden', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    // Phone should still be visible
    await expect(page.locator(PHONE_CONTAINER)).toBeVisible();
    // Contact item must be hidden (CSS ≤375px rule)
    const contactDisplay = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-contact-item');
      return el ? window.getComputedStyle(el).display : null;
    });
    expect(contactDisplay, 'Contact item must exist in DOM at 360px').not.toBeNull();
    expect(contactDisplay, 'Contact must be hidden at 360px (≤375px rule)').toBe('none');
    await page.screenshot({ path: path.join(SS_DIR, `responsive-mobile-360-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-13 | CSS — phone link color is #0272E4 on desktop
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-13 | CSS — phone link color is #0272E4 on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const color = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-phone-link');
      return el ? window.getComputedStyle(el).color : null;
    });
    expect(color, 'Phone link element must exist').not.toBeNull();
    expect(color, `Phone link color must be ${COLOR_NORMAL} (#0272E4)`).toBe(COLOR_NORMAL);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-14 | CSS — phone link font-size is 16px on desktop (viewport > 767px)
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-14 | CSS — phone link font-size is 16px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const fontSize = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-phone-link');
      return el ? window.getComputedStyle(el).fontSize : null;
    });
    expect(fontSize, 'Phone link element must exist').not.toBeNull();
    expect(fontSize, 'Phone link font-size must be 16px on desktop').toBe('16px');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-15 | CSS — phone link font-size is 13px on mobile (≤767px)
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-15 | CSS — phone link font-size is 13px on mobile (≤767px)', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 812 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const fontSize = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-phone-link');
      return el ? window.getComputedStyle(el).fontSize : null;
    });
    expect(fontSize, 'Phone link element must exist').not.toBeNull();
    expect(fontSize, 'Phone link font-size must be 13px on mobile (≤767px)').toBe('13px');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-16 | CSS — phone icon computed width is 14px on desktop
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-16 | CSS — phone icon width is 14px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const width = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-phone-icon');
      return el ? window.getComputedStyle(el).width : null;
    });
    expect(width, 'Phone icon element must exist').not.toBeNull();
    expect(width, 'Phone icon width must be 14px on desktop').toBe('14px');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-17 | CSS — phone icon computed width is 9px on mobile (≤767px)
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-17 | CSS — phone icon width is 9px on mobile (≤767px)', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 812 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const width = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-phone-icon');
      return el ? window.getComputedStyle(el).width : null;
    });
    expect(width, 'Phone icon element must exist').not.toBeNull();
    expect(width, 'Phone icon width must be 9px on mobile (≤767px)').toBe('9px');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-18 | CSS — phone link hover color is #358EE9
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-18 | CSS — phone link hover color is #358EE9', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await page.locator(PHONE_LINK).hover();
    await page.waitForTimeout(200);
    const hoverColor = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-132-phone-link');
      return el ? window.getComputedStyle(el).color : null;
    });
    expect(hoverColor, 'Phone link element must exist').not.toBeNull();
    expect(hoverColor, `Phone link hover color must be ${COLOR_HOVER} (#358EE9)`).toBe(COLOR_HOVER);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-19 | Sitewide — all 3 variation URLs render phone container exactly once
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-19 | Sitewide — all 3 variation URLs render phone container', async ({ page }) => {
    const urls = [VAR_URL, VAR_HOME_URL, VAR_COMP_URL];
    for (const url of urls) {
      await gotoAndWait(page, url);
      await waitForVariation(page, url);
      const count = await page.locator(PHONE_CONTAINER).count();
      expect(count, `Expected exactly 1 phone container on ${url}`).toBe(1);
    }
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-20 | Body class — body.cre-t-132 is present in variation
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-20 | Body class — body.cre-t-132 present in variation', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-132'));
    expect(hasClass, 'body must have class cre-t-132 in variation').toBe(true);
  });

});
