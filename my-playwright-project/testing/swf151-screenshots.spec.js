// @ts-check
/**
 * SWF151 — screenshot capture only (not part of the pass/fail suite).
 * Produces representative PNGs into my-playwright-project/swf151-screenshots/ for the
 * HTML QA report. Run per-project AFTER the main swf151-sort-order.spec.js run finishes,
 * to avoid adding extra load to this site's rate-limited Convert.com CDN during the real
 * assertion run. See testing/swf151-sort-order.spec.js for full context/selectors.
 */
const { test } = require('@playwright/test');
const path = require('path');

const EXPERIMENT = '100052556';
const EFORCE_V1 = `${EXPERIMENT}.1000256663`;
const EFORCE_V2 = `${EXPERIMENT}.1000256664`;
const BASE = 'https://petinsurancegurus.com/';
const DROPDOWN = '#rt-sort-dropdown';
const TOGGLE = '#rt-sort-toggle';
const OPTION_LOWEST = '.rt-sort-option[data-value="lowest-price"]';

const OUT_DIR = path.join(__dirname, '..', 'swf151-screenshots');

function url(eforce) {
  return `${BASE}?cro_mode=qa&_conv_eforce=${eforce}`;
}

async function clearOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.cre-t-133-overlay, .cre-t-133-close').forEach((el) => el.remove());
    ['.cmplz-cookiebanner', '#cmplz-cookiebanner-container', '.cookie-banner'].forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  });
}

test('V1 desktop — menu open (Best Rated default)', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(url(EFORCE_V1), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DROPDOWN, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
  await page.locator(TOGGLE).scrollIntoViewIfNeeded();
  await page.locator(TOGGLE).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, `v1-desktop-menu-open-${testInfo.project.name.replace(/[^a-z0-9]+/gi, '-')}.png`), fullPage: false });
});

test('V1 desktop — after Lowest Price sort', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(url(EFORCE_V1), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DROPDOWN, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
  await page.locator(TOGGLE).click();
  await page.locator(OPTION_LOWEST).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, `v1-desktop-lowest-price-${testInfo.project.name.replace(/[^a-z0-9]+/gi, '-')}.png`), fullPage: false });
});

test('V1 mobile (~390px) — sort field in filter row', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url(EFORCE_V1), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DROPDOWN, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
  await page.locator(DROPDOWN).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, `v1-mobile-390-${testInfo.project.name.replace(/[^a-z0-9]+/gi, '-')}.png`), fullPage: false });
});

test('V2 desktop — pre-sorted on load', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(url(EFORCE_V2), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DROPDOWN, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, `v2-desktop-presorted-${testInfo.project.name.replace(/[^a-z0-9]+/gi, '-')}.png`), fullPage: false });
});
