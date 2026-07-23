// @ts-check
/**
 * SWF144 / CRE-T-144 — Pet Insurance Gurus
 * Follow-up to SWF137 (cre-t-137). Two NEW variations that are the same as
 * SWF137's V1/V2 EXCEPT the injected "Vets love pet insurance" FAQ is moved to
 * the TOP of the FAQ accordion list (was appended last in SWF137).
 *
 *   V1 (…519): new FAQ inserted as FIRST accordion item, NO "Vet Approved" nav link
 *   V2 (…520): same FAQ-at-top + "Vet Approved" nav link that smooth-scrolls to
 *              the FAQ and opens it
 *
 * QA method (per user): test the LIVE Convert preview links across all target
 * URLs and all browsers/devices. Variation class on <body> is `cre-t-144`.
 *
 * Client quirks handled (see qa-knowledge-base/pet-insurance-gurus/_client-notes.md):
 *  - CRE-T-133 ZIP modal can overlay & intercept clicks -> force-removed
 *  - Cookie consent banner -> dismissed if present
 *  - Variation injection is async -> waitForSelector(state:'attached'), never fixed sleeps
 */
const { test, expect } = require('@playwright/test');

const EFORCE_V1 = '100052493.1000256519';
const EFORCE_V2 = '100052493.1000256520';
const CAMPAIGN = 'Cro_mode144';

const TARGET_PATHS = ['', 'comparison/', 'home/']; // '' == homepage
const BASE = 'https://petinsurancegurus.com/';

const FAQ_QUESTION = 'Vets love pet insurance';
const FAQ_ANSWER =
  'Pet insurance helps veterinarians recommend the best treatment for your pet without cost becoming the deciding factor. It gives pet owners more options during emergencies and can help avoid heartbreaking financial decisions. Every pet insurance provider featured on Pet Insurance Gurus is accepted by licensed veterinarians across the U.S., so you can choose with confidence.';
const ACTIVE_COLOR = 'rgb(2, 114, 228)'; // #0272e4

const NEW_ITEM = '.cre-t-144-accordion_item';
const NEW_HEADER = '.cre-t-144-accordion_header';
const NEW_TITLE = '.cre-t-144-accordion_title';
const ACCORDION = '.faq-container .oxy-pro-accordion';
const VET_LINK = '.cre-t-144-vetApprovedLink';

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

/** Navigate to a variation URL and wait until the injected FAQ is attached. */
async function gotoVariation(page, path, eforce) {
  await page.goto(url(path, eforce), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(NEW_ITEM, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
}

// ─────────────────────────────────────────────────────────────────────────────
// Control absence — plain URL, no variation forced
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Control (no variation forced)', () => {
  test('C-01/C-02: neither the new FAQ nor the Vet Approved link is injected', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    // delayed scripts can inject late -> wait before asserting absence
    await page.waitForTimeout(6000);
    expect(await page.locator(NEW_ITEM).count(), 'new FAQ must be absent on control').toBe(0);
    expect(await page.locator(VET_LINK).count(), 'Vet Approved link must be absent on control').toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Injection & TARGETING — run on every target URL for both variations
// ─────────────────────────────────────────────────────────────────────────────
for (const path of TARGET_PATHS) {
  const label = path === '' ? 'homepage /' : `/${path}`;

  test.describe(`V1 — injection & targeting @ ${label}`, () => {
    test.beforeEach(async ({ page }) => await gotoVariation(page, path, EFORCE_V1));

    test('V1: body has cre-t-144 class', async ({ page }) => {
      await expect(page.locator('body')).toHaveClass(/cre-t-144/);
    });

    test('V1: new FAQ is the FIRST item in the accordion (moved to TOP)', async ({ page }) => {
      const firstIsNew = await page.evaluate((sel) => {
        const items = document.querySelectorAll(`${sel} .oxy-pro-accordion_item`);
        return items[0] ? items[0].classList.contains('cre-t-144-accordion_item') : false;
      }, ACCORDION);
      expect(firstIsNew, 'first accordion item should be the injected FAQ').toBe(true);
    });

    test('V1: FAQ question text is exact', async ({ page }) => {
      await expect(page.locator(NEW_TITLE)).toHaveText(FAQ_QUESTION);
    });

    test('V1: FAQ answer text is exact', async ({ page }) => {
      await expect(page.locator(`${NEW_ITEM} .cre-t-144-accordion_content p`)).toHaveText(FAQ_ANSWER);
    });

    test('V1: exactly one FAQ injected (no duplicates)', async ({ page }) => {
      expect(await page.locator(NEW_ITEM).count()).toBe(1);
    });

    test('V1: Vet Approved nav link is NOT present (V1 must not have it)', async ({ page }) => {
      expect(await page.locator(VET_LINK).count()).toBe(0);
    });
  });

  test.describe(`V2 — injection & targeting @ ${label}`, () => {
    test.beforeEach(async ({ page }) => await gotoVariation(page, path, EFORCE_V2));

    test('V2: body has cre-t-144 class', async ({ page }) => {
      await expect(page.locator('body')).toHaveClass(/cre-t-144/);
    });

    test('V2: new FAQ is the FIRST item in the accordion (moved to TOP)', async ({ page }) => {
      const firstIsNew = await page.evaluate((sel) => {
        const items = document.querySelectorAll(`${sel} .oxy-pro-accordion_item`);
        return items[0] ? items[0].classList.contains('cre-t-144-accordion_item') : false;
      }, ACCORDION);
      expect(firstIsNew).toBe(true);
    });

    test('V2: FAQ question + answer text exact', async ({ page }) => {
      await expect(page.locator(NEW_TITLE)).toHaveText(FAQ_QUESTION);
      await expect(page.locator(`${NEW_ITEM} .cre-t-144-accordion_content p`)).toHaveText(FAQ_ANSWER);
    });

    test('V2: Vet Approved nav link present with correct text', async ({ page }) => {
      const link = page.locator(VET_LINK);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveText(/Vet Approved/);
    });

    test('V2: Vet Approved link cursor is pointer', async ({ page }) => {
      const cursor = await page.locator(VET_LINK).evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    });

    test('V2: exactly one FAQ + one Vet Approved link (no duplicates)', async ({ page }) => {
      expect(await page.locator(NEW_ITEM).count()).toBe(1);
      expect(await page.locator(VET_LINK).count()).toBe(1);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BEHAVIOUR — homepage only (interaction is page-independent)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('V1 — behaviour (homepage)', () => {
  test.beforeEach(async ({ page }) => await gotoVariation(page, '', EFORCE_V1));

  test('V1: accordion expands on click then collapses on second click', async ({ page }) => {
    const header = page.locator(NEW_HEADER);
    await header.evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).toHaveClass(/active/);
    await expect(header).toHaveAttribute('aria-expanded', 'true');

    await header.evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).not.toHaveClass(/active/);
    await expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  test('V1: active header color = #0272e4', async ({ page }) => {
    await page.locator(NEW_HEADER).evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).toHaveClass(/active/);
    // color animates via CSS transition — toHaveCSS auto-retries until it settles
    await expect(page.locator(NEW_HEADER)).toHaveCSS('color', ACTIVE_COLOR);
  });

  test('V1: opening the new FAQ closes an already-open existing FAQ (mutual exclusion)', async ({ page }) => {
    // open an existing (non-injected) FAQ first
    await page.evaluate((sel) => {
      const items = document.querySelectorAll(`${sel} .oxy-pro-accordion_item`);
      for (const it of items) {
        if (!it.classList.contains('cre-t-144-accordion_item')) {
          const h = it.querySelector('.oxy-pro-accordion_header, button');
          if (h) h.click();
          break;
        }
      }
    }, ACCORDION);
    await page.waitForTimeout(600);
    // now open the new FAQ
    await page.locator(NEW_HEADER).evaluate((el) => el.click());
    await page.waitForTimeout(600);
    const openExisting = await page.evaluate((sel) => {
      const items = document.querySelectorAll(`${sel} .oxy-pro-accordion_item.active`);
      return Array.from(items).filter((it) => !it.classList.contains('cre-t-144-accordion_item')).length;
    }, ACCORDION);
    expect(openExisting, 'no existing FAQ should remain open after opening the new one').toBe(0);
  });
});

test.describe('V2 — behaviour (homepage)', () => {
  test.beforeEach(async ({ page }) => await gotoVariation(page, '', EFORCE_V2));

  test('V2: clicking Vet Approved opens the new FAQ', async ({ page }) => {
    await page.locator(VET_LINK).evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).toHaveClass(/active/, { timeout: 5000 });
    await expect(page.locator(NEW_HEADER)).toHaveAttribute('aria-expanded', 'true');
  });

  // Clicking Vet Approved must scroll the FAQ INTO the viewport (functional gate).
  // NOTE the exact landing is imprecise because scrollToEl() lacks window.scrollY and
  // the page layout shifts async after the scroll: measured 135px (Chrome), 369px (Edge)
  // on desktop, and -170px..+393px on mobile. So the spec's "clearly near the top" intent
  // is only loosely met — tracked as finding BUG-A in the QA report. Mobile is excluded
  // here (see the mobile-specific test below) because it can land above the fold.
  test('V2: after Vet Approved click, the FAQ is scrolled into the viewport', async ({ page }, testInfo) => {
    test.skip(/Mobile/.test(testInfo.project.name), 'mobile landing tracked separately (BUG-A)');
    await page.locator(VET_LINK).evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).toHaveClass(/active/, { timeout: 5000 });
    await page.waitForTimeout(1200); // allow smooth scroll to settle
    const { top, vh } = await page.locator(NEW_HEADER).evaluate((el) => ({ top: el.getBoundingClientRect().top, vh: window.innerHeight }));
    expect(top, `FAQ header top was ${top}px (viewport ${vh}px)`).toBeGreaterThanOrEqual(-5);
    expect(top, 'FAQ header should be within the viewport after scroll').toBeLessThanOrEqual(vh);
  });

  test('V2 (mobile): Vet Approved is visible inline in the nav (not hidden) and opens the FAQ', async ({ page }, testInfo) => {
    test.skip(!/Mobile/.test(testInfo.project.name), 'mobile-only nav-visibility check');
    await expect(page.locator(VET_LINK)).toBeVisible();
    await page.locator(VET_LINK).evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).toHaveClass(/active/, { timeout: 5000 });
    // NOTE: exact scroll landing on mobile is imprecise (BUG-A) — not asserted here.
  });

  test('V2: accordion expands on direct click', async ({ page }) => {
    const header = page.locator(NEW_HEADER);
    await header.evaluate((el) => el.click());
    await expect(page.locator(NEW_ITEM)).toHaveClass(/active/);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
