// @ts-check
/**
 * SWF146 — Renters Insurance Gurus TrustScore Badge Restyle (SWF135-style, badge alone)
 *
 * Restyles the TrustScore review badge on the comparison listings (Trustpilot-style stars)
 * to match the Pet Insurance Gurus SWF135 badge-alone look (score + star + classification,
 * "{Site} Score" copy underneath on desktop). No overlay/dropdown markup — confirmed the
 * client wants the SWF135 *variation* (badge alone), not SWF135's control (which had the
 * hover/tap breakdown overlay).
 *
 * Score conversion: client confirmed via chat — "Whatever the score is for a listing on a
 * specific URL, you can double that score (even if it varies between pages)." vB.js already
 * implements this: each of the 3 targeted pages (/, /home/, /comparison/) hardcodes its own
 * mainScore per partner and a `total` that is exactly mainScore * 2. Live control scores were
 * manually verified to match the hardcoded mainScore values before writing this spec
 * (Lemonade 4.9, Farmers 4.4, USAA 4.4, Allstate 3.9 confirmed live on "/").
 *
 * Desktop copy: "Renters Insurance Gurus Score" (correctly site-specific in this vB.js —
 * unlike CRE-T-136, this clone did NOT carry over "Pet Insurance Gurus" leftover copy).
 *
 * QA method: as of test date the live Convert.com force URLs (control eforce …628 and
 * variation eforce …629) both render the CURRENT PRODUCTION state (8 Trustpilot-style badges,
 * no .cre-t-146-container, no cre-t-146 body class) — this experiment's variation payload
 * has not been published to Convert.com yet. Confirmed via a direct DOM check on the forced
 * variation URL (trustpilotImages: 8, cre146Containers: 0). This is the same "local build
 * ahead of live" situation documented for CRE-T-08 (see qa-knowledge-base): tests inject the
 * local vB.js/vB.css directly onto the real live pages via addStyleTag/addScriptTag rather
 * than relying on the unpublished force URL.
 *
 * Site quirk (new): /comparison/ renders the Liberty Mutual row TWICE (same
 * data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only" appears at position 1
 * and 8 in the dynamic list) — confirmed live. Not a vB.js bug; each DOM row is independent
 * and both correctly receive a badge with Liberty Mutual's data.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const VB_JS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8');
const VB_CSS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8');

const BASE = 'https://rentersinsurancegurus.com';
const TARGET_PATHS = ['/', '/home/', '/comparison/'];

const TRUSTPILOT = '.ct-image.trustpilot-image';
const BADGE = '.cre-t-146-container';
const REVIEWS = '.cre-t-146-reviews';
const TOTAL = '.cre-t-146-total';
const CLASSIFICATION = '.cre-t-146-classification';
const CONTENT1 = '.cre-t-146-top-content1';
const CONTENT1_MOBILE = '.cre-t-146-top-content1-mobile';
const CONTENT2 = '.cre-t-146-top-content2';
const CONTENT2_TEXT = '.cre-t-146-top-content2-text';
const DROPDOWN_ICON_IN_CONTENT1 = `${CONTENT1} .cre-t-146-top-content2-icon`;

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const SCORE_COPY = 'Renters Insurance Gurus Score';

/** Expected data per targeted page — mirrors the hardcoded arrays in vB.js. */
const EXPECTED = {
  '/': [
    { dataLabel: 'outbound-partner-clicks-Lemonade-Listing-Only', partner: 'Lemonade', classification: 'Exceptional', total: '9.8' },
    { dataLabel: 'outbound-partner-clicks-Liberty-Mutual-Listing-Only', partner: 'Liberty Mutual', classification: 'Excellent', total: '9.4' },
    { dataLabel: 'outbound-partner-clicks-Farmers-Listing-Only', partner: 'Farmers Insurance', classification: 'Very Good', total: '8.8' },
    { dataLabel: 'outbound-partner-clicks-USAA-Listing-Only', partner: 'USAA', classification: 'Very Good', total: '8.8' },
    { dataLabel: 'outbound-partner-clicks-State-Farm-Listing-Only', partner: 'State Farm', classification: 'Good', total: '8.4' },
    { dataLabel: 'outbound-partner-clicks-Progressive-Listing-Only', partner: 'Progressive', classification: 'Good', total: '8.0' },
    { dataLabel: 'outbound-partner-clicks-Allstate-Listing-Only', partner: 'Allstate', classification: 'Average', total: '7.8' },
  ],
  '/home/': [
    { dataLabel: 'outbound-partner-clicks-Lemonade-Listing-Only', partner: 'Lemonade', classification: 'Exceptional', total: '9.8' },
    { dataLabel: 'outbound-partner-clicks-Liberty-Mutual-Listing-Only', partner: 'Liberty Mutual', classification: 'Excellent', total: '9.4' },
    { dataLabel: 'outbound-partner-clicks-Farmers-Listing-Only', partner: 'Farmers Insurance', classification: 'Very Good', total: '8.8' },
    { dataLabel: 'outbound-partner-clicks-USAA-Listing-Only', partner: 'USAA', classification: 'Very Good', total: '8.6' },
    { dataLabel: 'outbound-partner-clicks-State-Farm-Listing-Only', partner: 'State Farm', classification: 'Very Good', total: '8.6' },
    { dataLabel: 'outbound-partner-clicks-Progressive-Listing-Only', partner: 'Progressive', classification: 'Good', total: '8.0' },
    { dataLabel: 'outbound-partner-clicks-Allstate-Listing-Only', partner: 'Allstate', classification: 'Average', total: '7.8' },
  ],
  '/comparison/': [
    { dataLabel: 'outbound-partner-clicks-Liberty-Mutual-Listing-Only', partner: 'Liberty Mutual', classification: 'Exceptional', total: '9.8' },
    { dataLabel: 'outbound-partner-clicks-Lemonade-Listing-Only', partner: 'Lemonade', classification: 'Excellent', total: '9.4' },
    { dataLabel: 'outbound-partner-clicks-Farmers-Listing-Only', partner: 'Farmers Insurance', classification: 'Very Good', total: '8.8' },
    { dataLabel: 'outbound-partner-clicks-USAA-Listing-Only', partner: 'USAA', classification: 'Very Good', total: '8.8' },
    { dataLabel: 'outbound-partner-clicks-State-Farm-Listing-Only', partner: 'State Farm', classification: 'Good', total: '8.4' },
    { dataLabel: 'outbound-partner-clicks-Progressive-Listing-Only', partner: 'Progressive', classification: 'Good', total: '8.0' },
    { dataLabel: 'outbound-partner-clicks-Allstate-Listing-Only', partner: 'Allstate', classification: 'Average', total: '7.8' },
  ],
};

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
  await page.waitForSelector('#comparison-section', { state: 'attached', timeout: 30000 });
  await dismissBanners(page);
}

/** Navigate to the real live page and inject the local vB.css/vB.js on top of it. */
async function gotoVariation(page, urlPath) {
  await gotoControl(page, urlPath);
  try {
    await page.addStyleTag({ content: VB_CSS });
  } catch (e) {
    if (!e.message || !e.message.includes('Content-Security-Policy')) throw e;
  }
  try {
    await page.addScriptTag({ content: VB_JS });
  } catch (e) {
    if (!e.message || !e.message.includes('Content-Security-Policy')) throw e;
  }
  await page.waitForFunction(() => document.body.classList.contains('cre-t-146'), { timeout: 5000 }).catch(async () => {
    try {
      await page.addStyleTag({ content: VB_CSS });
    } catch {
      /* ok */
    }
    try {
      await page.addScriptTag({ content: VB_JS });
    } catch {
      /* ok */
    }
  });
  await page.waitForTimeout(300);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROL — real live pages, no injection
// ─────────────────────────────────────────────────────────────────────────────
for (const urlPath of TARGET_PATHS) {
  test.describe(`Control @ ${urlPath}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoControl(page, urlPath);
    });

    test(`Control: body does NOT have cre-t-146 class @ ${urlPath}`, async ({ page }) => {
      await expect(page.locator('body')).not.toHaveClass(/cre-t-146/);
    });

    test(`Control: no cre-t-146 badge present @ ${urlPath}`, async ({ page }) => {
      expect(await page.locator(BADGE).count()).toBe(0);
    });

    test(`Control: original Trustpilot-style badges are visible @ ${urlPath}`, async ({ page }) => {
      const count = await page.locator(TRUSTPILOT).count();
      expect(count).toBeGreaterThan(0);
      const firstDisplay = await page.locator(TRUSTPILOT).first().evaluate((el) => getComputedStyle(el).display);
      expect(firstDisplay).not.toBe('none');
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIATION — local vB.js/vB.css injected onto the real live pages
// ─────────────────────────────────────────────────────────────────────────────
for (const urlPath of TARGET_PATHS) {
  const expectedPartners = EXPECTED[urlPath];

  test.describe(`Variation @ ${urlPath}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoVariation(page, urlPath);
    });

    test(`V: body gets cre-t-146 class @ ${urlPath}`, async ({ page }) => {
      await expect(page.locator('body')).toHaveClass(/cre-t-146/);
    });

    test(`V: original Trustpilot images are hidden @ ${urlPath}`, async ({ page }) => {
      const displays = await page.locator(TRUSTPILOT).evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
      expect(displays.length).toBeGreaterThan(0);
      for (const d of displays) expect(d).toBe('none');
    });

    test(`V: a badge is injected for every dynamic listing row @ ${urlPath}`, async ({ page }) => {
      const rowCount = await page.locator('#comparison-section .oxy-dynamic-list > [data-unique]').count();
      const badgeCount = await page.locator(BADGE).count();
      expect(badgeCount).toBe(rowCount);
      expect(badgeCount).toBeGreaterThan(0);
    });

    test(`V: badge is "alone" — no dropdown chevron, cursor is default not pointer @ ${urlPath}`, async ({ page }) => {
      const badge = page.locator(BADGE).first();
      await expect(badge.locator(DROPDOWN_ICON_IN_CONTENT1)).toBeHidden();
      const cursor = await badge.locator(REVIEWS).evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toBe('default');
    });

    test(`V: desktop copy reads "${SCORE_COPY}" (not Pet Insurance Gurus Score) @ ${urlPath}`, async ({ page }) => {
      const texts = await page.locator(`${BADGE} ${CONTENT2_TEXT}`).allTextContents();
      expect(texts.length).toBeGreaterThan(0);
      for (const t of texts) expect(t.trim()).toBe(SCORE_COPY);
    });

    for (const partner of expectedPartners) {
      test(`V: ${partner.partner} shows total ${partner.total} and classification "${partner.classification}" @ ${urlPath}`, async ({ page }) => {
        const row = page.locator(`[data-unique="${partner.dataLabel}"]`).first();
        const badge = row.locator(BADGE);
        await expect(badge.locator(TOTAL)).toHaveText(partner.total);
        const classifications = await badge.locator(CLASSIFICATION).allTextContents();
        expect(classifications.length).toBeGreaterThan(0);
        for (const c of classifications) expect(c).toBe(partner.classification);
      });
    }

    test(`V: no duplication — re-running the injection script leaves badge count unchanged @ ${urlPath}`, async ({ page }) => {
      const before = await page.locator(BADGE).count();
      try {
        await page.addScriptTag({ content: VB_JS });
      } catch (e) {
        if (!e.message || !e.message.includes('Content-Security-Policy')) throw e;
      }
      await page.waitForTimeout(500);
      const after = await page.locator(BADGE).count();
      expect(after, 're-running the variation JS must not inject a second badge per row').toBe(before);
    });

    test(`V: CSS guard — removing the injected style/script reverts to Trustpilot badges @ ${urlPath}`, async ({ page }) => {
      // vB.js runs a 250ms forceInsertion re-scan for a full 10s after injection, which
      // would otherwise re-insert badges we just removed mid-window (race confirmed live
      // on Firefox @ /home/). Wait out that window first so the guard check is stable.
      await page.waitForTimeout(10500);
      await page.evaluate(() => {
        document.body.classList.remove('cre-t-146');
        document.querySelectorAll('.cre-t-146-container').forEach((el) => el.remove());
        document.querySelectorAll('style').forEach((s) => {
          if (s.textContent && s.textContent.includes('cre-t-146')) s.remove();
        });
      });
      const displays = await page.locator(TRUSTPILOT).evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
      for (const d of displays) expect(d).not.toBe('none');
      expect(await page.locator(BADGE).count()).toBe(0);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE — /comparison/ (stable single table) at desktop vs mobile viewport
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Variation — responsive @ /comparison/', () => {
  test('Desktop 1280x800: score copy visible, mobile-only block hidden', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoVariation(page, '/comparison/');
    const badge = page.locator(BADGE).first();
    await expect(badge.locator(CONTENT2)).toBeVisible();
    await expect(badge.locator(CONTENT1_MOBILE)).toBeHidden();
  });

  test('Mobile 390x844: score copy hidden; classification still visible via top-content1-text', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoVariation(page, '/comparison/');
    const badge = page.locator(BADGE).first();
    await expect(badge.locator(CONTENT2)).toBeHidden();
    // Classification remains readable through the main .top-content1-text span (shared
    // with desktop) even though the dedicated mobile block never renders — see BUG-01 below.
    await expect(badge.locator(`${CONTENT1} .cre-t-146-top-content1-text ${CLASSIFICATION}`)).toBeVisible();
  });

  // BUG-01 [LOW, confirmed]: .cre-t-146-top-content1-mobile is a leftover block (classification
  // + dropdown chevron, mirroring the PIG SWF135/139 template) that is meant to render as the
  // mobile-only alternate to the desktop score line. Its own `@media (max-width: 767px)` rule
  // sets it to `display: none`, so the parent hide wins over the child overrides declared in
  // the same media query (e.g. the chevron's `display: flex`) and the block never renders at
  // any viewport. No visible defect for the end user — the classification text is still shown
  // via `.cre-t-146-top-content1-text` on both desktop and mobile — but the block + its CSS
  // appear to be dead code that should be removed, or the `display: none` corrected if the
  // separate mobile variant was actually intended to show.
  test('BUG-01: .cre-t-146-top-content1-mobile never renders (display:none inside its own mobile media query)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoVariation(page, '/comparison/');
    const badge = page.locator(BADGE).first();
    await expect(badge.locator(CONTENT1_MOBILE)).toBeHidden();
  });
});
