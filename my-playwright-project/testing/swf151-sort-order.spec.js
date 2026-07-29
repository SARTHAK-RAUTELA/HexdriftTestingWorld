// @ts-check
/**
 * SWF151 (internal cre-t-151) — Pet Insurance Gurus "Sort by" feature
 *
 * Adds a "Sort by" pill (Best Rated / Lowest Price) into the existing pet-type/breed/ZIP
 * filter row on the comparison listings. V1 defaults to "Best Rated" (the site's own,
 * un-re-ranked order); V2 defaults to "Lowest Price" (pre-sorted on load, no interaction
 * needed). Selecting "Lowest Price" fades the listings, re-sorts by ascending displayed
 * price, and swaps the pinned "Best Overall" card's badge text to "Lowest Price" (the card
 * itself never moves — it always stays last). An "i" icon smooth-scrolls to the "Ranking
 * Methodology" section. See ticket for full behavior description.
 *
 * *** TICKET TYPO — READ BEFORE CHANGING THE EFORCE IDS BELOW ***
 * The client's ticket pasted the SAME preview URL (eforce .1000256663) for BOTH the V1 and
 * V2 rows. Live recon (2026-07-29) confirmed that .1000256663 is actually the REAL V1
 * ("Best Rated" default) link, and .1000256664 — not mentioned twice in the ticket — is the
 * REAL V2 ("Lowest Price" pre-sorted) link. This was flagged back to the client as an action
 * item so they don't hand out the wrong V2 URL. Do not "fix" these constants back to match
 * the ticket text; they are already the live-verified values.
 *
 * QA method: unlike SWF139/CRE-T-144, the local `vB.js`/`v2.js`/`vB.css`/`v2.css` in
 * local_testing/Local2/variation/ DO genuinely match this ticket (variation_name
 * "cre-t-151" in both, identical code apart from DEFAULT_SORT_MODE) — confirmed by reading
 * both files side by side. Testing is still done against the LIVE force-preview URLs (not
 * local injection) per the established pattern on this site, since the live DOM/site quirks
 * (price-override duplicate span, filter re-render behavior, CRE-T-133 modal) can only be
 * observed against the real page.
 *
 * Client quirks handled (see qa-knowledge-base/pet-insurance-gurus/_client-notes.md):
 *  - CRE-T-133 ZIP modal can overlay & intercept clicks -> force-removed after navigation
 *  - Cookie consent banner -> removed if present
 *  - Variation injection is async -> waitForSelector(state:'attached'), never fixed sleeps
 *  - Prices shown are NOT plain textContent — a hidden duplicate price span from the live
 *    cre-t-116 test must be excluded by only reading visible children (matches vB.js's own
 *    getVisibleText()/isVisible() logic, replicated in getListingPrices() below)
 *  - Convert.com CDN has rate-limited repeated automated navigation in past QA sessions on
 *    this site — later-browser flakiness in a single run is a known non-bug pattern
 */
const { test, expect } = require('@playwright/test');

const EXPERIMENT = '100052556';
const EFORCE_V1 = `${EXPERIMENT}.1000256663`; // "Best Rated" default — real V1 (ticket typo, see header)
const EFORCE_V2 = `${EXPERIMENT}.1000256664`; // "Lowest Price" default — real V2 (ticket typo, see header)
const BASE = 'https://petinsurancegurus.com/';

const VARIATION_CLASS = 'cre-t-151';
const DROPDOWN = '#rt-sort-dropdown';
const TOGGLE = '#rt-sort-toggle';
const TOGGLE_VALUE = '.rt-sort-toggle-value';
const TOGGLE_LABEL = '.rt-sort-toggle-label';
const MENU = '.rt-sort-menu';
const OPTION = (value) => `.rt-sort-option[data-value="${value}"]`;
const COPY = '#rt-sort-copy';
const COPY_VALUE = '.rt-sort-value';
const TOOLTIP_ICON = '[data-rt-tooltip]';
const FILTERS_FIELDS = '.filter-options .additional-filters';
const HEADER_ROW = '.filter-label-icon-container';
const ZIP_INPUT = '.zip-textinput input';
const BREED_SELECT = '.breed-select';
const ZIP_FIELD = '.zip-textinput';
const LISTING_ITEM = '[data-unique$="-Listing-Only"]';
const REPEATER = '#comparison-section .plan-repeater';
const BEST_OVERALL_MARKER = '.best-overall-bubble';
const BEST_OVERALL_TEXT = '.best-overall-text';

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const TABLET_VIEWPORT = { width: 900, height: 900 };
const MOBILE_767 = { width: 767, height: 900 };
const MOBILE_390 = { width: 390, height: 844 };
const MOBILE_375 = { width: 375, height: 844 };
const MOBILE_360 = { width: 360, height: 780 }; // <=374.98px — sort field drops to own full row
const MOBILE_370 = { width: 370, height: 780 }; // <=374.98px, second sample point

function url(eforce) {
  return `${BASE}?cro_mode=qa&_conv_eforce=${eforce}`;
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

async function gotoV1(page) {
  await page.goto(url(EFORCE_V1), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DROPDOWN, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
}

async function gotoV2(page) {
  await page.goto(url(EFORCE_V2), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DROPDOWN, { state: 'attached', timeout: 30000 });
  await clearOverlays(page);
}

async function gotoBare(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000); // delayed scripts can inject late -> wait before asserting absence
  await clearOverlays(page);
}

/** data-unique order of every listing block currently in the repeater (pinned card included, last). */
async function getListingOrder(page) {
  return page.evaluate((sel) => {
    const repeater = document.querySelector(sel.repeater);
    if (!repeater) return [];
    return Array.prototype.filter
      .call(repeater.children, (el) => el.matches && el.matches(sel.item))
      .map((el) => el.getAttribute('data-unique'));
  }, { repeater: REPEATER, item: LISTING_ITEM });
}

/** Per-item { dataUnique, isPinned, price } — price read the same way vB.js does (visible children only). */
async function getListingPrices(page) {
  return page.evaluate((sel) => {
    function isVisible(el) {
      if (!el) return false;
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    }
    function getVisibleText(el) {
      if (!el.children.length) return el.textContent;
      let out = '';
      for (const child of el.children) if (isVisible(child)) out += ' ' + child.textContent;
      return out.trim() ? out : el.textContent;
    }
    function getPrice(item) {
      const columns = item.querySelectorAll('.plan-detail-column');
      for (const col of columns) {
        const heading = col.querySelector('.plan-detail-heading');
        if (heading && heading.textContent.trim().toLowerCase().indexOf('average plan cost') !== -1) {
          const contentEl = col.querySelector('.plan-detail-content');
          if (contentEl) {
            const match = getVisibleText(contentEl).replace(/,/g, '').match(/[\d.]+/);
            return match ? parseFloat(match[0]) : Infinity;
          }
        }
      }
      return Infinity;
    }
    const repeater = document.querySelector(sel.repeater);
    if (!repeater) return [];
    const items = Array.prototype.filter.call(repeater.children, (el) => el.matches && el.matches(sel.item));
    return items.map((el) => ({
      dataUnique: el.getAttribute('data-unique'),
      isPinned: !!el.querySelector(sel.marker),
      price: getPrice(el),
    }));
  }, { repeater: REPEATER, item: LISTING_ITEM, marker: BEST_OVERALL_MARKER });
}

async function selectSortOption(page, value) {
  await page.locator(TOGGLE).click();
  await expect(page.locator(DROPDOWN)).toHaveClass(/is-open/);
  await page.locator(OPTION(value)).click();
  // 220ms fade-out delay + reorder + 400ms fade-in — give it comfortable headroom to settle.
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Control absence — bare URL never has the sort feature (confirmed live invariant)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Control (bare, unforced URL)', () => {
  test('C-01: bare URL has neither the cre-t-151 body class nor the sort dropdown', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoBare(page);
    await expect(page.locator('body')).not.toHaveClass(new RegExp(VARIATION_CLASS));
    expect(await page.locator(DROPDOWN).count(), 'sort dropdown must not exist on the bare/unforced URL').toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V1 — injection & defaults (desktop)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('V1 — injection & defaults (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoV1(page);
  });

  test('V1: body has cre-t-151 class', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(new RegExp(VARIATION_CLASS));
  });

  test('V1: default toggle value is "Best Rated"', async ({ page }) => {
    await expect(page.locator(TOGGLE_VALUE)).toHaveText('Best Rated');
  });

  test('V1: default aria-selected/is-selected state — best-rated selected, lowest-price not', async ({ page }) => {
    await expect(page.locator(OPTION('best-rated'))).toHaveClass(/is-selected/);
    await expect(page.locator(OPTION('best-rated'))).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator(OPTION('lowest-price'))).not.toHaveClass(/is-selected/);
    await expect(page.locator(OPTION('lowest-price'))).toHaveAttribute('aria-selected', 'false');
  });

  test('V1: opening the menu shows only the two option labels, no "Sort by" prefix', async ({ page }) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DROPDOWN)).toHaveClass(/is-open/);
    const menuText = (await page.locator(MENU).textContent()) || '';
    expect(menuText.toLowerCase()).not.toContain('sort by');
    expect(menuText).toContain('Best Rated');
    expect(menuText).toContain('Lowest Price');
  });

  test('V1: default order is the site\'s native order (pinned card is last)', async ({ page }) => {
    const order = await getListingOrder(page);
    expect(order.length, 'should be at least a couple of listing cards on the page').toBeGreaterThan(1);
    const prices = await getListingPrices(page);
    const lastItem = prices[prices.length - 1];
    expect(lastItem.isPinned, 'pinned Best Overall card must be the last item even in default order').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V1 — interaction (desktop)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('V1 — interaction (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoV1(page);
  });

  test('Toggle click opens the menu (.is-open + aria-expanded=true)', async ({ page }) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DROPDOWN)).toHaveClass(/is-open/);
    await expect(page.locator(TOGGLE)).toHaveAttribute('aria-expanded', 'true');
  });

  test('Clicking outside the dropdown closes the menu', async ({ page }) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DROPDOWN)).toHaveClass(/is-open/);
    await page.locator('h1, .filter-label-icon-container').first().click({ force: true });
    await expect(page.locator(DROPDOWN)).not.toHaveClass(/is-open/);
  });

  test('Escape key closes the menu', async ({ page }) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DROPDOWN)).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator(DROPDOWN)).not.toHaveClass(/is-open/);
  });

  test('Selecting "Lowest Price": toggle value updates and copy updates', async ({ page }) => {
    await selectSortOption(page, 'lowest-price');
    await expect(page.locator(TOGGLE_VALUE)).toHaveText('Lowest Price');
    await expect(page.locator(COPY_VALUE)).toHaveText('lowest price');
  });

  test('Selecting "Lowest Price": menu closes and lowest-price option becomes selected', async ({ page }) => {
    await selectSortOption(page, 'lowest-price');
    await expect(page.locator(DROPDOWN)).not.toHaveClass(/is-open/);
    await expect(page.locator(OPTION('lowest-price'))).toHaveClass(/is-selected/);
    await expect(page.locator(OPTION('lowest-price'))).toHaveAttribute('aria-selected', 'true');
  });

  test('Selecting "Lowest Price": sortable listings re-order to strictly ascending price', async ({ page }) => {
    await selectSortOption(page, 'lowest-price');
    const prices = await getListingPrices(page);
    const sortable = prices.filter((p) => !p.isPinned);
    expect(sortable.length).toBeGreaterThan(1);
    for (let i = 1; i < sortable.length; i++) {
      expect(sortable[i].price, `item ${i} price ${sortable[i].price} should be >= previous ${sortable[i - 1].price}`)
        .toBeGreaterThanOrEqual(sortable[i - 1].price);
    }
  });

  test('Selecting "Lowest Price": pinned Best Overall card stays last and its badge becomes "Lowest Price"', async ({ page }) => {
    const order = await getListingOrder(page);
    await selectSortOption(page, 'lowest-price');
    const newOrder = await getListingOrder(page);
    expect(newOrder[newOrder.length - 1]).toBe(order[order.length - 1]); // same card still last
    const pinnedCard = page.locator(LISTING_ITEM).filter({ has: page.locator(BEST_OVERALL_MARKER) }).first();
    await expect(pinnedCard.locator(BEST_OVERALL_TEXT)).toHaveText('Lowest Price');
  });

  test('Switching back to "Best Rated" restores the original order and "Best Overall" badge', async ({ page }) => {
    const originalOrder = await getListingOrder(page);
    await selectSortOption(page, 'lowest-price');
    const sortedOrder = await getListingOrder(page);
    expect(sortedOrder).not.toEqual(originalOrder); // sanity: the sort actually did something
    await selectSortOption(page, 'best-rated');
    const restoredOrder = await getListingOrder(page);
    expect(restoredOrder).toEqual(originalOrder);
    await expect(page.locator(TOGGLE_VALUE)).toHaveText('Best Rated');
    await expect(page.locator(COPY_VALUE)).toHaveText('best rated');
    const pinnedCard = page.locator(LISTING_ITEM).filter({ has: page.locator(BEST_OVERALL_MARKER) }).first();
    await expect(pinnedCard.locator(BEST_OVERALL_TEXT)).toHaveText('Best Overall');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// "i" tooltip icon — Ranking Methodology scroll (desktop + mobile)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('"i" icon — scroll to Ranking Methodology', () => {
  async function assertScrollsToMethodology(page) {
    await expect(page.locator('h2,h3,h4', { hasText: /ranking methodology/i }).first()).toBeVisible({ timeout: 15000 }).catch(() => {});
    const heading = page.locator('h2,h3,h4', { hasText: /ranking methodology/i }).first();
    expect(await heading.count(), 'a "Ranking Methodology" heading must exist somewhere on the page').toBeGreaterThan(0);
    await page.locator(TOOLTIP_ICON).first().click();
    await page.waitForTimeout(1200); // allow smooth scroll to settle
    const top = await heading.evaluate((el) => {
      const target = el.closest('section') || el;
      return target.getBoundingClientRect().top;
    });
    expect(top, `Ranking Methodology target top was ${top}px after clicking the "i" icon`).toBeGreaterThanOrEqual(-10);
    expect(top).toBeLessThanOrEqual(60);
  }

  test('Desktop: "i" icon exists and clicking it scrolls the methodology section near the viewport top', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoV1(page);
    expect(await page.locator(TOOLTIP_ICON).count(), '"i" icon should exist').toBeGreaterThan(0);
    await assertScrollsToMethodology(page);
  });

  test('Mobile (390px): "i" icon exists and clicking it scrolls the methodology section near the viewport top', async ({ page }) => {
    await page.setViewportSize(MOBILE_390);
    await gotoV1(page);
    expect(await page.locator(TOOLTIP_ICON).count(), '"i" icon should exist on mobile too').toBeGreaterThan(0);
    await assertScrollsToMethodology(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Desktop layout — sort field + copy placement at >=992px
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Desktop layout (>=992px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoV1(page);
  });

  test('Sort field lives inside the filter row, alongside breed + ZIP', async ({ page }) => {
    const dropdownParentMatches = await page.locator(DROPDOWN).evaluate((el, sel) => !!el.closest(sel), FILTERS_FIELDS);
    expect(dropdownParentMatches, 'sort dropdown should be inside .filter-options .additional-filters').toBe(true);
  });

  test('Copy line ("Sorted by ...") sits in the header row (.filter-label-icon-container) at desktop width', async ({ page }) => {
    const copy = page.locator(COPY);
    await expect(copy).toBeVisible();
    const inHeaderRow = await copy.evaluate((el, sel) => !!el.closest(sel), HEADER_ROW);
    expect(inHeaderRow, 'copy should be appended into .filter-label-icon-container at >=992px').toBe(true);
    await expect(copy).toHaveClass(/rt-sort-copy--header/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mobile / responsive layout
// ─────────────────────────────────────────────────────────────────────────────
const NARROW_ROW_VIEWPORTS = [
  { label: '767px', viewport: MOBILE_767 },
  { label: '390px', viewport: MOBILE_390 },
  { label: '375px', viewport: MOBILE_375 },
];

test.describe('Mobile layout — breed/ZIP/sort share row 2, "Sort by:" label hidden (375-767px)', () => {
  for (const { label, viewport } of NARROW_ROW_VIEWPORTS) {
    test(`${label}: ZIP placeholder is "ZIP code" and "Sort by:" label is hidden`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoV1(page);
      await expect(page.locator(ZIP_INPUT)).toHaveAttribute('placeholder', 'ZIP code');
      const labelDisplay = await page.locator(TOGGLE_LABEL).evaluate((el) => getComputedStyle(el).display);
      expect(labelDisplay, `"Sort by:" label should be hidden at ${label}`).toBe('none');
    });

    test(`${label}: breed, ZIP, and sort field share the same row`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoV1(page);
      const [breedTop, zipTop, sortTop] = await Promise.all([
        page.locator(BREED_SELECT).first().evaluate((el) => el.getBoundingClientRect().top),
        page.locator(ZIP_FIELD).first().evaluate((el) => el.getBoundingClientRect().top),
        page.locator(DROPDOWN).evaluate((el) => el.getBoundingClientRect().top),
      ]);
      expect(Math.abs(breedTop - sortTop), `breed field and sort field should be on the same row at ${label}`).toBeLessThan(10);
      expect(Math.abs(zipTop - sortTop), `ZIP field and sort field should be on the same row at ${label}`).toBeLessThan(10);
    });
  }
});

test.describe('Smallest phones (<=374.98px) — sort field drops to its own full-width row', () => {
  for (const { label, viewport } of [
    { label: '370px', viewport: MOBILE_370 },
    { label: '360px', viewport: MOBILE_360 },
  ]) {
    test(`${label}: "Sort by:" label reappears and sort field wraps to a full-width third line`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoV1(page);
      const labelDisplay = await page.locator(TOGGLE_LABEL).evaluate((el) => getComputedStyle(el).display);
      expect(labelDisplay, `"Sort by:" label should be visible again at ${label}`).not.toBe('none');

      const zipTop = await page.locator(ZIP_FIELD).first().evaluate((el) => el.getBoundingClientRect().top);
      const sortTop = await page.locator(DROPDOWN).evaluate((el) => el.getBoundingClientRect().top);
      expect(sortTop, `sort field should wrap below the breed/ZIP row at ${label}`).toBeGreaterThan(zipTop + 10);

      const [dropdownWidth, filtersWidth] = await Promise.all([
        page.locator(DROPDOWN).evaluate((el) => el.getBoundingClientRect().width),
        page.locator(FILTERS_FIELDS).evaluate((el) => el.getBoundingClientRect().width),
      ]);
      expect(dropdownWidth / filtersWidth, `sort field should span (near) the full row width at ${label}`).toBeGreaterThan(0.9);
    });

    test(`${label}: ZIP placeholder is still "ZIP code" (mobile shortening still applies)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoV1(page);
      await expect(page.locator(ZIP_INPUT)).toHaveAttribute('placeholder', 'ZIP code');
    });
  }
});

test.describe('Tablet layout (~900px) — tabs on row 1, fields share row 2', () => {
  test('900px: breed, ZIP, and sort field all present and roughly aligned', async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    await gotoV1(page);
    await expect(page.locator(DROPDOWN)).toBeVisible();
    const [breedTop, sortTop] = await Promise.all([
      page.locator(BREED_SELECT).first().evaluate((el) => el.getBoundingClientRect().top),
      page.locator(DROPDOWN).evaluate((el) => el.getBoundingClientRect().top),
    ]);
    expect(Math.abs(breedTop - sortTop)).toBeLessThan(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V2 — pre-sorted by "Lowest Price" on load, no interaction required
// ─────────────────────────────────────────────────────────────────────────────
test.describe('V2 — pre-sorted on load', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoV2(page);
  });

  test('V2: body has cre-t-151 class (same variation name as V1)', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(new RegExp(VARIATION_CLASS));
  });

  test('V2: toggle value is already "Lowest Price" with no interaction', async ({ page }) => {
    await expect(page.locator(TOGGLE_VALUE)).toHaveText('Lowest Price');
  });

  test('V2: copy is already "Sorted by lowest price."', async ({ page }) => {
    await expect(page.locator(COPY_VALUE)).toHaveText('lowest price');
  });

  test('V2: lowest-price option is already is-selected / aria-selected=true', async ({ page }) => {
    await expect(page.locator(OPTION('lowest-price'))).toHaveClass(/is-selected/);
    await expect(page.locator(OPTION('lowest-price'))).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator(OPTION('best-rated'))).not.toHaveClass(/is-selected/);
  });

  test('V2: listings are already in ascending-price order on first load', async ({ page }) => {
    const prices = await getListingPrices(page);
    const sortable = prices.filter((p) => !p.isPinned);
    expect(sortable.length).toBeGreaterThan(1);
    for (let i = 1; i < sortable.length; i++) {
      expect(sortable[i].price).toBeGreaterThanOrEqual(sortable[i - 1].price);
    }
    const lastItem = prices[prices.length - 1];
    expect(lastItem.isPinned, 'pinned card should still be last even pre-sorted').toBe(true);
  });

  test('V2: pinned card badge already reads "Lowest Price" on load', async ({ page }) => {
    const pinnedCard = page.locator(LISTING_ITEM).filter({ has: page.locator(BEST_OVERALL_MARKER) }).first();
    await expect(pinnedCard.locator(BEST_OVERALL_TEXT)).toHaveText('Lowest Price');
  });
});
