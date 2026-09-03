// @ts-check
/**
 * Disability ID (disabilityid.co.uk) - Sitewide "Apply" primary CTA copy test
 *
 * Platform: Convert.com | Hypothesis: soften/replace the word "Apply" on the primary CTA
 * (hero, sticky header/nav, footer, repeated in-page buttons) to lower perceived effort.
 * New users only, sitewide (excludes the application funnel on forms.disabilityid.co.uk).
 *
 * Variation files (identical structure, only the inserted string differs):
 *   local_testing/Local2/variation/va1.js -> "Get started"
 *   local_testing/Local2/variation/va2.js -> "Start now"
 *   local_testing/Local2/variation/va3.js -> "Get my card"
 *   local_testing/Local2/variation/vB.js  -> "Apply for my card" (this is v4)
 *   local_testing/Local2/variation/vB.css -> shared hide rule: html body.cre-t-02 .cre-t-02-hide { display:none !important }
 *
 * Live DOM confirmed (2026-09-02) via direct Playwright inspection of the preview URLs:
 * exactly 3 real primary "Apply" CTAs match `a[href*="apply" i]` AND have a direct child
 * whose own trimmed text is exactly "apply" (case-insensitive) - the code's dual check
 * (outer textContent.includes('apply') + inner child exact-match) correctly EXCLUDES the
 * "Renew" button (which also links to /apply), "Join 300,000+ card holders", and
 * "Start my application" - all of which share the same href but different visible text:
 *   1. Header/nav "Apply" button (always visible, class `button is-green-fill w-inline-block`)
 *   2. Hero section "Apply" button, next to hero "Renew" (class `...is-light-green-fill...`)
 *   3. Mobile-only "Apply" button inside the bottom `SECTION.apply` CTA block
 *      (`.hide-desktop` ancestor - only rendered <992px; its `.hide-tablet` desktop sibling
 *      already reads "Start my application", untouched by design since it's not literal "Apply")
 *
 * IMPORTANT test-methodology note: `el.innerText` on an element inside a `display:none`
 * ancestor falls back to `textContent` per spec (which includes the CSS-hidden original
 * "Apply" text), producing a false "ApplyGet started" reading for CTA #3 on desktop
 * viewports where it's legitimately hidden. Assertions below check the *rendered* text only
 * where the element is actually visible, and separately verify the old text node is
 * `display:none` via computed style rather than trusting `innerText` on a non-rendered subtree.
 *
 * No footer "Apply" CTA exists on this site currently (confirmed - the real `<footer>` only
 * has a "Renew" link, a newsletter form, and an unrelated "National Carers Card" button) -
 * the dev note's "footer button" bullet does not currently apply; flagged as an observation,
 * not a code defect, in the QA report.
 *
 * Force URLs (Convert.com preview, cro_mode=qa):
 *   Control: _conv_eforce=100052760.1000257155
 *   v1:      _conv_eforce=100052760.1000257156  "Get started"
 *   v2:      _conv_eforce=100052760.1000257157  "Start now"
 *   v3:      _conv_eforce=100052760.1000257158  "Get my card"
 *   v4:      _conv_eforce=100052760.1000257159  "Apply for my card"
 */
const { test, expect } = require('@playwright/test');

const BASE = 'https://www.disabilityid.co.uk';
const FORCE = '100052760';
const URLS = {
  control: `${BASE}/?cro_mode=qa&_conv_eforce=${FORCE}.1000257155`,
  v1: `${BASE}/?cro_mode=qa&_conv_eforce=${FORCE}.1000257156`,
  v2: `${BASE}/?cro_mode=qa&_conv_eforce=${FORCE}.1000257157`,
  v3: `${BASE}/?cro_mode=qa&_conv_eforce=${FORCE}.1000257158`,
  v4: `${BASE}/?cro_mode=qa&_conv_eforce=${FORCE}.1000257159`,
};
const FAQ_URLS = {
  control: `${BASE}/faq?cro_mode=qa&_conv_eforce=${FORCE}.1000257155`,
  v1: `${BASE}/faq?cro_mode=qa&_conv_eforce=${FORCE}.1000257156`,
};

const EXPECTED_TEXT = {
  control: 'Apply',
  v1: 'Get started',
  v2: 'Start now',
  v3: 'Get my card',
  v4: 'Apply for my card',
};
const BODY_CLASS = 'cre-t-02';

const SEL = {
  applyHrefLinks: 'a[href*="apply" i]',
};

async function getRenderedText(locator) {
  // Robust against innerText's textContent-fallback for non-rendered (display:none ancestor) elements.
  return locator.evaluate((el) => {
    if (!el.isConnected) return '';
    const isRendered = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!isRendered) return '__NOT_RENDERED__';
    return el.innerText.trim();
  });
}

async function getOldApplyHiddenState(page) {
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('.cre-t-02-hide'));
    return nodes.map((n) => ({
      text: n.textContent.trim(),
      display: getComputedStyle(n).display,
    }));
  });
}

for (const variant of ['control', 'v1', 'v2', 'v3', 'v4']) {
  test.describe(`Disability ID Apply CTA copy - ${variant}`, () => {
    test(`homepage: header + hero Apply CTA text, href, Renew unaffected [${variant}]`, async ({ page }) => {
      await page.goto(URLS[variant], { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const bodyClass = await page.evaluate(() => document.body.className);
      if (variant === 'control') {
        expect(bodyClass).not.toMatch(new RegExp(`\\b${BODY_CLASS}\\b`));
      } else {
        expect(bodyClass).toMatch(new RegExp(`\\b${BODY_CLASS}\\b`));
      }

      const headerBtn = page.locator('.right-nav a[href*="apply" i], .navbar-content a[href*="apply" i]').first();
      await expect(headerBtn).toBeVisible();
      expect((await getRenderedText(headerBtn))).toBe(EXPECTED_TEXT[variant]);
      await expect(headerBtn).toHaveAttribute('href', 'https://forms.disabilityid.co.uk/apply');

      // Class-based, not text-based: the hero "Apply" button's own textContent includes the
      // CSS-hidden original "Apply" text alongside the new string (e.g. "ApplyGet started"), so an
      // anchored hasText/toHaveText regex against the <a> never matches - see file header note.
      const heroApply = page.locator('.root_hero-section .button-group a.is-light-green-fill').first();
      await expect(heroApply).toBeVisible();
      expect((await getRenderedText(heroApply))).toBe(EXPECTED_TEXT[variant]);
      await expect(heroApply).toHaveAttribute('href', 'https://forms.disabilityid.co.uk/apply');

      const heroRenew = page.locator('.root_hero-section .button-group a.is-white-border');
      await expect(heroRenew).toHaveText('Renew');

      const navRenew = page.locator('nav a[href="/renew"], header a[href="/renew"]').first();
      await expect(navRenew).toHaveText('Renew');

      if (variant !== 'control') {
        const hidden = await getOldApplyHiddenState(page);
        const oldApplyEntries = hidden.filter((h) => h.text.toLowerCase() === 'apply');
        expect(oldApplyEntries.length).toBeGreaterThanOrEqual(2); // header + hero at minimum
        for (const entry of oldApplyEntries) {
          expect(entry.display).toBe('none');
        }
      }
    });

    test(`inner page (/faq): header Apply CTA replaced, in-content "apply" mentions untouched [${variant}]`, async ({ page }) => {
      test.skip(!FAQ_URLS[variant], 'only control/v1 checked for inner-page sitewide coverage');
      await page.goto(FAQ_URLS[variant], { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const headerBtn = page.locator('.right-nav a[href*="apply" i], .navbar-content a[href*="apply" i]').first();
      await expect(headerBtn).toBeVisible();
      expect((await getRenderedText(headerBtn))).toBe(EXPECTED_TEXT[variant]);

      const contentApplyLinks = page.locator('a[href*="apply" i]:not([class])');
      const count = await contentApplyLinks.count();
      for (let i = 0; i < count; i++) {
        const text = (await contentApplyLinks.nth(i).innerText()).trim();
        expect(text.toLowerCase()).not.toBe(EXPECTED_TEXT[variant].toLowerCase());
      }
    });

    test(`mobile-only bottom "Apply" CTA (SECTION.apply) replaced correctly [${variant}]`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(URLS[variant], { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const mobileApplyBtn = page.locator('section.apply .hide-desktop a[href*="apply" i]').first();
      await expect(mobileApplyBtn).toBeVisible();
      expect((await getRenderedText(mobileApplyBtn))).toBe(EXPECTED_TEXT[variant]);

      const desktopVariantBtn = page.locator('section.apply .hide-tablet a[href*="apply" i]').first();
      await expect(desktopVariantBtn).toHaveText(/Start my application/);
    });

    test(`320px width: longest variant text does not overflow header/hero button [${variant}]`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(URLS[variant], { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const headerBtn = page.locator('.right-nav a[href*="apply" i], .navbar-content a[href*="apply" i]').first();
      await expect(headerBtn).toBeVisible();
      const box = await headerBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) expect(box.x + box.width).toBeLessThanOrEqual(320);

      const overflowCheck = await headerBtn.evaluate((el) => {
        const textDiv = Array.from(el.children).find(
          (c) => getComputedStyle(c).display !== 'none' && c.textContent.trim().length > 0
        );
        return textDiv ? textDiv.scrollWidth <= textDiv.clientWidth + 2 : true;
      });
      expect(overflowCheck).toBe(true);
    });
  });
}

test.describe('Disability ID Apply CTA copy - application funnel exclusion', () => {
  test('forms.disabilityid.co.uk/apply is never affected by the experiment', async ({ page }) => {
    const res = await page.goto(
      `https://forms.disabilityid.co.uk/apply?cro_mode=qa&_conv_eforce=${FORCE}.1000257156`,
      { waitUntil: 'domcontentloaded', timeout: 30000 }
    ).catch(() => null);
    test.skip(!res, 'funnel subdomain unreachable from this environment');
    await page.waitForTimeout(3000);
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).not.toMatch(new RegExp(`\\b${BODY_CLASS}\\b`));
  });
});
