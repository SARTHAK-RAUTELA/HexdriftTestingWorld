// @ts-check
/**
 * SWF139 — Pet Insurance Gurus
 * Adds an "i" info icon next to the scoring badge (winner of SWF135). Clicking the
 * icon, or the "Pet Insurance Gurus Score" text next to it, smooth-scrolls the user
 * to the Ranking Methodology section further down the page.
 *
 * On desktop the icon sits next to "Pet Insurance Gurus Score". On mobile that copy
 * isn't shown, so the icon instead sits next to the "Exceptional"-style classification
 * text (per Figma note: "put the i next to the badge element that does show").
 *
 * QA method: local `vB.js`/`vB.css` are NOT this test's control code (confirmed to be
 * unrelated WinkBeds cre-t-253 mattress code) — tested against the LIVE Convert preview
 * links instead, per the established workaround (see cre-t-144 spec/memory). Local
 * `js.js`/`hello.css` DO match this test's variation (variation_name "cre-t-139") and
 * were read to inform expected selectors/behavior, then verified against the live site.
 *
 * Client quirks handled (see qa-knowledge-base/pet-insurance-gurus/_client-notes.md):
 *  - CRE-T-133 ZIP modal can overlay & intercept clicks -> force-removed
 *  - Cookie consent banner -> dismissed if present
 *  - Variation injection is async -> waitForSelector(state:'attached'), never fixed sleeps
 *  - /compare/ is the more reliable injection URL for this site
 */
const { test, expect } = require('@playwright/test');

const EXPERIMENT = '100052498';
const EFORCE_CONTROL = `${EXPERIMENT}.1000256530`;
const EFORCE_V1 = `${EXPERIMENT}.1000256531`;
const CAMPAIGN = 'Cro_mode139';

const BASE = 'https://petinsurancegurus.com/';
const TARGET_PATHS = ['compare/', '']; // '' == homepage

const OLD_BADGE = '.cre-t-135-container';
const NEW_BADGE = '.cre-t-139-container';
const INFO_ICON = '.cre-t-139-info-icon';
const DESKTOP_ICON = '.cre-t-139-top-content2-text-wrap .cre-t-139-info-icon';
const MOBILE_ICON = '.cre-t-139-classification-wrap .cre-t-139-info-icon';
const SCORE_TEXT = '.cre-t-139-top-content2 .cre-t-139-top-content2-text';
const CONTENT2 = '.cre-t-139-top-content2';
const RANKING_SECTION = '#content-section';
const ICON_FILL = 'rgb(140, 142, 160)'; // #8C8EA0

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

function url(path, eforce) {
  return `${BASE}${path}?utm_campaign=${CAMPAIGN}&_conv_eforce=${eforce}`;
}

/** Remove cross-test overlays that intercept clicks (CRE-T-133 ZIP modal, cookie banner). */
async function clearOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.cre-t-133-overlay, .cre-t-133-close').forEach((el) => el.remove());
    ['.cmplz-cookiebanner', '#cmplz-cookiebanner-container', '.cookie-banner'].forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  });
}

async function gotoControl(page, path) {
  await page.goto(url(path, EFORCE_CONTROL), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(OLD_BADGE, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
}

async function gotoVariation(page, path) {
  await page.goto(url(path, EFORCE_V1), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(NEW_BADGE, { state: 'attached', timeout: 30000 });
  await page.waitForSelector(INFO_ICON, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
}

// ─────────────────────────────────────────────────────────────────────────────
// Control absence — plain URL, no variation forced
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Control (no variation forced)', () => {
  // A plain, unforced URL can be bucketed into either SWF135's shipped winner or this
  // running experiment by Convert.com's own targeting, so we don't assert which one
  // shows up. What must always hold is the invariant the JS enforces: the info icon
  // only ever exists when cre-t-139 (this experiment's variation) is active.
  test('C-01: info icon is only ever present when body has the cre-t-139 class', async ({ page }) => {
    await page.goto(`${BASE}compare/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000); // delayed scripts can inject late -> wait before asserting
    await clearOverlays(page);
    const bodyHasClass = await page.locator('body').evaluate((el) => el.classList.contains('cre-t-139'));
    const iconCount = await page.locator(INFO_ICON).count();
    if (bodyHasClass) {
      expect(iconCount, 'cre-t-139 was active but no info icon was injected').toBeGreaterThan(0);
    } else {
      expect(iconCount, 'info icon must be absent when cre-t-139 is not active').toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FORCED CONTROL & V1 — injection & targeting, per target URL
// ─────────────────────────────────────────────────────────────────────────────
for (const path of TARGET_PATHS) {
  const label = path === '' ? 'homepage /' : `/${path}`;

  test.describe(`Forced control @ ${label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoControl(page, path);
    });

    test(`Control: body has cre-t-135 class, not cre-t-139 @ ${label}`, async ({ page }) => {
      await expect(page.locator('body')).toHaveClass(/cre-t-135/);
      await expect(page.locator('body')).not.toHaveClass(/cre-t-139/);
    });

    test(`Control: no info icon anywhere on the page @ ${label}`, async ({ page }) => {
      expect(await page.locator(INFO_ICON).count()).toBe(0);
    });

    test(`Control: SWF135 badge(s) present @ ${label}`, async ({ page }) => {
      expect(await page.locator(OLD_BADGE).count()).toBeGreaterThan(0);
    });
  });

  test.describe(`V1 — injection & targeting @ ${label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoVariation(page, path);
    });

    test(`V1: body has cre-t-139 class @ ${label}`, async ({ page }) => {
      await expect(page.locator('body')).toHaveClass(/cre-t-139/);
    });

    test(`V1: old SWF135 badge is fully replaced (not just hidden) @ ${label}`, async ({ page }) => {
      expect(await page.locator(OLD_BADGE).count(), 'old badge should not remain in the DOM').toBe(0);
    });

    test(`V1: at least one new badge injected, each with exactly 2 info icons (desktop+mobile variants) @ ${label}`, async ({ page }) => {
      const containerCount = await page.locator(NEW_BADGE).count();
      expect(containerCount, 'at least one cre-t-139 badge should be injected').toBeGreaterThan(0);
      const iconCount = await page.locator(INFO_ICON).count();
      expect(iconCount, 'each badge should carry exactly 2 icon variants (desktop-visible + mobile-visible)').toBe(containerCount * 2);
    });

    // Liberty Mutual's row (handled by the separate renderLibertyMutual() code path,
    // since it has a different data-unique naming pattern) isn't reliably present on
    // every page/pageview — confirmed live that it's absent from /compare/'s table
    // entirely and only sometimes appears in one of the homepage's rotating widgets.
    // Skip at runtime rather than asserting a page it doesn't render on.
    test(`V1: if a Liberty Mutual row is present, it also gets a badge + icon @ ${label}`, async ({ page }) => {
      const libertyItem = page.locator('[data-unique*="Liberty"][data-unique*="Mutual"]');
      const count = await libertyItem.count();
      test.skip(count === 0, 'Liberty Mutual row not present on this page load');
      await expect(libertyItem.locator(NEW_BADGE)).toHaveCount(1);
      await expect(libertyItem.locator(INFO_ICON)).toHaveCount(2);
    });

    // Same reasoning as above — the homepage's rotating widgets legitimately add/remove
    // rows over time, which looks like duplication if we compare raw counts. /compare/'s
    // stable table lets us confirm the periodic setInterval re-scan (every 250ms) never
    // grows the badge/icon count on its own.
    test(`V1: badge/icon count stays stable over time (no self-duplication) @ ${label}`, async ({ page }) => {
      test.skip(path !== 'compare/', 'homepage widgets legitimately reshuffle/re-render, which is not duplication');
      const before = await page.locator(NEW_BADGE).count();
      await page.waitForTimeout(2000); // let the periodic re-scan interval run a few more cycles
      const after = await page.locator(NEW_BADGE).count();
      expect(after, 'badge count must not grow from the periodic re-scan').toBe(before);
      const iconsAfter = await page.locator(INFO_ICON).count();
      expect(iconsAfter, 'icon count must not grow from the periodic re-scan').toBe(after * 2);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP BEHAVIOUR — /compare/ only (interaction is page-independent)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('V1 — desktop behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoVariation(page, 'compare/');
  });

  test('Desktop: info icon next to "Pet Insurance Gurus Score" is visible; mobile variant is hidden', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    await expect(badge.locator(DESKTOP_ICON)).toBeVisible();
    await expect(badge.locator(MOBILE_ICON)).toBeHidden();
  });

  test('Desktop: "Pet Insurance Gurus Score" text is visible', async ({ page }) => {
    await expect(page.locator(SCORE_TEXT).first()).toBeVisible();
  });

  test('Desktop: icon SVG path fill color is #8C8EA0', async ({ page }) => {
    const fill = await page
      .locator(NEW_BADGE)
      .first()
      .locator(`${DESKTOP_ICON} svg path`)
      .evaluate((el) => getComputedStyle(el).fill);
    expect(fill).toBe(ICON_FILL);
  });

  test('Desktop: cursor is pointer on the icon and on the score text', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    const iconCursor = await badge.locator(DESKTOP_ICON).evaluate((el) => getComputedStyle(el).cursor);
    const textCursor = await badge.locator(SCORE_TEXT).evaluate((el) => getComputedStyle(el).cursor);
    expect(iconCursor).toBe('pointer');
    expect(textCursor).toBe('pointer');
  });

  test('Desktop: #content-section is the Ranking Methodology section', async ({ page }) => {
    await expect(page.locator(RANKING_SECTION)).toContainText('Ranking Methodology');
  });

  test('Desktop: clicking the icon smooth-scrolls the Ranking Methodology section to the top of the viewport', async ({ page }) => {
    await page.locator(NEW_BADGE).first().locator(DESKTOP_ICON).click();
    await page.waitForTimeout(1200); // allow smooth scroll to settle
    const top = await page.locator(RANKING_SECTION).evaluate((el) => el.getBoundingClientRect().top);
    expect(top, `Ranking Methodology section top was ${top}px after clicking the icon`).toBeGreaterThanOrEqual(-10);
    expect(top).toBeLessThanOrEqual(50);
  });

  test('Desktop: clicking "Pet Insurance Gurus Score" text also scrolls to Ranking Methodology', async ({ page }) => {
    await page.locator(SCORE_TEXT).first().click();
    await page.waitForTimeout(1200);
    const top = await page.locator(RANKING_SECTION).evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(-10);
    expect(top).toBeLessThanOrEqual(50);
  });

  test('Desktop: clicking the icon does NOT toggle the review dropdown open state', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    await badge.locator(DESKTOP_ICON).click();
    await page.waitForTimeout(500);
    await expect(badge).not.toHaveClass(/cre-t-139-dropdown-active/);
  });

  // A trailing "Changes for Test 135" override block in the CSS (carried over from
  // SWF135, which removed this dropdown) re-hides .cre-t-139-review-dropdown with
  // higher specificity than the earlier :hover rule. So the dropdown correctly stays
  // hidden on hover — this is intentional legacy behavior, not something SWF139 broke.
  test('Desktop: hovering the badge does NOT reopen the legacy review dropdown (SWF135 removal preserved)', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    await badge.locator('.cre-t-139-reviews').hover();
    await expect(badge.locator('.cre-t-139-review-dropdown')).toBeHidden();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE-VIEWPORT BEHAVIOUR — same 4 desktop browsers, resized to a mobile width
// ─────────────────────────────────────────────────────────────────────────────
test.describe('V1 — mobile-viewport behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoVariation(page, 'compare/');
  });

  test('Mobile: "Pet Insurance Gurus Score" line is hidden entirely', async ({ page }) => {
    await expect(page.locator(CONTENT2).first()).toBeHidden();
  });

  test('Mobile: info icon is visible next to the classification text (e.g. "Exceptional") instead', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    await expect(badge.locator(MOBILE_ICON)).toBeVisible();
    await expect(badge.locator(DESKTOP_ICON)).toBeHidden();
  });

  test('Mobile: clicking the icon still scrolls toward the Ranking Methodology section', async ({ page }) => {
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.locator(NEW_BADGE).first().locator(MOBILE_ICON).click();
    await page.waitForTimeout(1200);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter, 'page should have scrolled down toward the methodology section').toBeGreaterThan(scrollBefore + 100);
  });

  // BUG-01: the mobile info-icon sits inside .cre-t-139-review-top, which has its own
  // click handler toggling the dropdown open state for viewports <992px. That handler
  // fires alongside the icon's own scroll handler on the same click, so tapping the
  // icon leaves the dropdown marked "active" even though the user only asked to jump
  // to the methodology section. Documented as BUG-01 in the QA report, not treated as
  // a hard failure here (it's the confirmed live behavior at the time of testing).
  test('Mobile: BUG-01 — clicking the icon unintentionally also toggles the dropdown-active state', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    await badge.locator(MOBILE_ICON).click();
    await page.waitForTimeout(1200);
    const gotDropdownActive = await badge.evaluate((el) => el.classList.contains('cre-t-139-dropdown-active'));
    expect(gotDropdownActive, 'BUG-01: icon click should NOT also toggle the dropdown, but it currently does').toBe(true);
  });

  // Same trailing CSS override as the desktop hover test: an !important rule at
  // max-width:991px keeps .cre-t-139-review-dropdown permanently display:none even
  // when .cre-t-139-dropdown-active is toggled. So tapping review-top (which still
  // toggles the class per the JS) has no visible effect, and the cross-close icon
  // inside the dropdown is unreachable. Documented as a dead-code note (LOW), not a
  // SWF139 regression — the class-toggle mechanism just has nothing left to control.
  test('Mobile: tapping review-top toggles dropdown-active, but the dropdown stays hidden (dead legacy toggle)', async ({ page }) => {
    const badge = page.locator(NEW_BADGE).first();
    await badge.locator('.cre-t-139-review-top').click();
    await expect(badge).toHaveClass(/cre-t-139-dropdown-active/);
    await expect(badge.locator('.cre-t-139-review-dropdown')).toBeHidden();
  });
});
