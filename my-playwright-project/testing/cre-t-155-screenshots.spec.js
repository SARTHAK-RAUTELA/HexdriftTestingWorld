// @ts-check
/**
 * CRE-T-155 — screenshot capture only (not part of the pass/fail suite).
 * Produces representative PNGs into my-playwright-project/cre-t-155-screenshots/ for the
 * HTML QA report. See testing/cre-t-155-landlord-approved-faq.spec.js for full context.
 */
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const V2_JS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/v2.js'), 'utf8');
const V2_CSS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/v2.css'), 'utf8');

const BASE = 'https://rentersinsurancegurus.com';
const NAV_LINK = '.cre-t-155-LandlordApprovedLink';
const NEW_FAQ_ITEM = '.cre-t-155-accordion_item';

const OUT_DIR = path.join(__dirname, '..', 'cre-t-155-screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function dismissBanners(page) {
  try {
    await page
      .locator('.cmplz-accept, #accept-cookies, button:has-text("Accept All"), button:has-text("Accept Cookies")')
      .first()
      .click({ timeout: 2000 });
  } catch {
    /* no banner present */
  }
}

async function gotoControl(page, urlPath) {
  await page.goto(`${BASE}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('.faq-container', { state: 'attached', timeout: 30000 });
  await dismissBanners(page);
}

async function gotoVariation(page, urlPath) {
  await gotoControl(page, urlPath);
  await page.addStyleTag({ content: V2_CSS });
  await page.addScriptTag({ content: V2_JS });
  await page.waitForSelector(NAV_LINK, { state: 'attached', timeout: 10000 });
  await page.waitForSelector(NEW_FAQ_ITEM, { state: 'attached', timeout: 10000 });
}

test('Control — header nav, no Landlord Approved link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoControl(page, '/');
  await page.screenshot({ path: path.join(OUT_DIR, 'control-desktop-header.png'), clip: { x: 0, y: 0, width: 1280, height: 200 } });
});

test('Variation desktop — Landlord Approved link in header', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoVariation(page, '/');
  await page.screenshot({ path: path.join(OUT_DIR, 'variation-desktop-header.png'), clip: { x: 0, y: 0, width: 1280, height: 200 } });
});

test('Variation desktop — FAQ opened after clicking the link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoVariation(page, '/');
  await page.locator(NAV_LINK).click();
  await page.waitForTimeout(1200);
  await page.locator(NEW_FAQ_ITEM).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'variation-desktop-faq-open.png') });
});

test('Variation desktop — hover state on the nav link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoVariation(page, '/');
  await page.locator(NAV_LINK).hover();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT_DIR, 'variation-desktop-hover.png'), clip: { x: 0, y: 0, width: 1280, height: 200 } });
});

test('Variation mobile (390px) — header + FAQ opened', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoVariation(page, '/');
  await page.screenshot({ path: path.join(OUT_DIR, 'variation-mobile-header.png'), clip: { x: 0, y: 0, width: 390, height: 200 } });
  await page.locator(NAV_LINK).click();
  await page.waitForTimeout(1200);
  await page.locator(NEW_FAQ_ITEM).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'variation-mobile-faq-open.png') });
});

test('Variation — /comparison/ page with link+FAQ active', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoVariation(page, '/comparison/');
  await page.screenshot({ path: path.join(OUT_DIR, 'variation-comparison-header.png'), clip: { x: 0, y: 0, width: 1280, height: 200 } });
});
