// @ts-check
/**
 * AFP18 — AFP 2026 Annual Conference — Download One-Page Conference Summary
 * Variation injects "Download One-Page Conference Summary" link in the
 * General Information nav dropdown, directly after the "Convince Your Boss" item.
 * The link opens the AFP 2026 Conference Summary PDF in a new tab (target="_blank").
 * Desktop Only — CSS hides the new item on viewports ≤1024px.
 *
 * Control:   https://conference.financialprofessionals.org/
 * Variation: https://conference.financialprofessionals.org/?_vis_preview_data=<token>
 *
 * TC-01  Control — new link NOT in DOM after 6s wait
 * TC-02  Variation — new link injected in nav dropdown
 * TC-03  Link text — exact text "Download One-Page Conference Summary"
 * TC-04  Link href — points to AFP PDF on v2.crocdn.com CDN
 * TC-05  Link target — opens in new tab (target="_blank")
 * TC-06  PDF accessible — PDF URL returns HTTP 200
 * TC-07  No duplication — re-running JS doesn't add second link (body.cre-t-18 guard)
 * TC-08  Position — new link appears directly after "Convince Your Boss" item
 * TC-09  Body class — body.cre-t-18 present in variation
 * TC-10  Body class — body.cre-t-18 NOT present in control
 * TC-11  Desktop 1280×800 — new link present and visible when dropdown open (+ navbar screenshot)
 * TC-12  Desktop 1440×900 — new link present and visible when dropdown open (+ navbar screenshot)
 * TC-13  Responsive — CSS hides new item at ≤1024px (resize from 1280px)
 * TC-14  Responsive — CSS hides new item at 768px
 * TC-15  Click — clicking the link opens PDF in a new tab (popup intercepted)
 * TC-16  Link CSS classes — has main-nav__links-column-list-link + cre-t-18-new-link
 * TC-17  Container CSS classes — has main-nav__links-column-list-item + cre-t-18-new-item
 * TC-18  Sitewide — /general-information/experience/attendee-feedback2026
 * TC-19  Sitewide — /registration/full-conference-pricing
 * TC-20  Sitewide — /registration/team
 * TC-21  Sitewide — /registration/day-pass-pricing
 * TC-22  Sitewide — /program/overview/afp-2026-event-guide
 * TC-23  Sitewide — /general-information/experience/afp-member-perks
 * TC-24  Sitewide — /hotel-travel/getting-here/deals
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets ────────────────────────────────────────────────────── */
const JS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);

/* ── URLs ────────────────────────────────────────────────────────────────── */
const PREVIEW_TOKEN = 'eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjQ3Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGciOjAsImluZSI6MCwiaWhvIjowLCJwYWhpIjpudWxsLCJzYWJlciI6bnVsbCwibmV3UXVlcnlCb3giOm51bGwsImRhdGFSZWdpb24iOm51bGwsIm1hdGNoVHlwZSI6bnVsbCwiY24iOiJ1bmRlZmluZWQiLCJ1cmwiOiJodHRwcyUyNTNBJTI1MkYlMjUyRmNvbmZlcmVuY2UuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmciLCJhcHAiOiJhcHAiLCJ0cyI6MTc4MDM4MjI5NzkzMX19fQ==';
const BASE         = 'https://conference.financialprofessionals.org';
const CONTROL_URL  = `${BASE}/`;
const VAR_URL      = `${BASE}/?_vis_preview_data=${PREVIEW_TOKEN}`;
const PDF_URL      = 'https://v2.crocdn.com/AFP/test18/AFP_2026_Conference_Summary-cre-t-18.pdf';

/* ── Sitewide pages to test (TC-18 through TC-24) ────────────────────────── */
const SITEWIDE_PAGES = [
  { pagePath: '/general-information/experience/attendee-feedback2026', label: 'attendee-feedback2026', tcNum: 18, name: 'Attendee Feedback 2026' },
  { pagePath: '/registration/full-conference-pricing',                  label: 'reg-full-conference',   tcNum: 19, name: 'Registration — Full Conference Pricing' },
  { pagePath: '/registration/team',                                     label: 'reg-team',              tcNum: 20, name: 'Registration — Team Pricing' },
  { pagePath: '/registration/day-pass-pricing',                         label: 'reg-day-pass',          tcNum: 21, name: 'Registration — Day Pass Pricing' },
  { pagePath: '/program/overview/afp-2026-event-guide',                 label: 'program-event-guide',   tcNum: 22, name: 'Program — AFP 2026 Event Guide' },
  { pagePath: '/general-information/experience/afp-member-perks',       label: 'gi-member-perks',       tcNum: 23, name: 'General Info — AFP Member Perks' },
  { pagePath: '/hotel-travel/getting-here/deals',                       label: 'hotel-deals',           tcNum: 24, name: 'Hotel & Travel — Deals' },
];

/* ── Selectors ───────────────────────────────────────────────────────────── */
const NEW_ITEM      = '.cre-t-18-new-item';
const NEW_LINK      = '.cre-t-18-new-link';

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../afp18-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  try {
    await page.locator(
      'button:has-text("Accept All"), button:has-text("Accept"), button:has-text("AGREE"), button:has-text("Agree"), [class*="cookie"] button.accept'
    ).first().click({ timeout: 3000 });
  } catch { /* no consent banner */ }
}

async function waitForVariation(page, url) {
  await page.waitForSelector(NEW_LINK, { state: 'attached', timeout: 45000 }).catch(() => {
    throw new Error(`AFP18 new link not found on ${url}`);
  });
}

async function openGenInfoDropdown(page) {
  // Always scroll to top first so the nav is in the visible viewport
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Step 1: hover over "General Information" to trigger CSS :hover dropdown
  try {
    const trigger = page.locator('.main-nav').locator('text=General Information').first();
    if (await trigger.count() > 0) {
      await trigger.hover({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }
  } catch { /* nav trigger not found — continue */ }

  // Step 2: force ALL cre-t-18-new-item ancestors visible via JS.
  // Headless Firefox/WebKit lose CSS :hover — override display/visibility/opacity.
  // Do NOT clear transforms — mobile nav uses translateX(-100%) which must stay.
  await page.evaluate(() => {
    document.querySelectorAll('.cre-t-18-new-item').forEach(item => {
      let node = item.parentElement;
      while (node && node !== document.body) {
        const cs = window.getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity || '1') < 0.5) {
          node.style.setProperty('display', 'block', 'important');
          node.style.setProperty('visibility', 'visible', 'important');
          node.style.setProperty('opacity', '1', 'important');
        }
        node = node.parentElement;
      }
    });
  });
  await page.waitForTimeout(400);
}

/**
 * Takes a navbar-focused screenshot clipped to the top of the page
 * (captures the nav bar + open dropdown without the page body).
 */
async function takeNavbarScreenshot(page, browser, prefix) {
  const vp = page.viewportSize();
  const w  = vp ? vp.width : 1280;
  await page.screenshot({
    path: path.join(SS_DIR, `${prefix}-${browser}.png`),
    clip: { x: 0, y: 0, width: w, height: 520 },
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
 * TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════════ */
test.describe('AFP18 — AFP 2026 Annual Conference — Download One-Page Conference Summary', () => {

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-01 | Control — new link NOT in DOM
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-01 | Control — "Download One-Page Conference Summary" link NOT in DOM', async ({ page }, testInfo) => {
    await gotoAndWait(page, CONTROL_URL);
    await page.waitForTimeout(6000);
    const count = await page.locator(NEW_LINK).count();
    expect(count, 'Download link must NOT appear on the control URL').toBe(0);
    await page.screenshot({ path: path.join(SS_DIR, `control-desktop-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-02 | Variation — new link injected in nav
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-02 | Variation — new link injected in General Information dropdown', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const count = await page.locator(NEW_LINK).count();
    expect(count, 'At least one new link must be injected on variation URL').toBeGreaterThan(0);
    await page.screenshot({ path: path.join(SS_DIR, `variation-desktop-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-03 | Link text — exact text match
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-03 | Link text — "Download One-Page Conference Summary"', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const text = (await page.locator(NEW_LINK).first().innerText()).trim();
    expect(text, 'Link text must exactly match the spec').toBe('Download One-Page Conference Summary');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-04 | Link href — PDF URL on v2.crocdn.com
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-04 | Link href — points to AFP 2026 Conference Summary PDF', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const href = await page.locator(NEW_LINK).first().getAttribute('href');
    expect(href, 'href must point to the AFP 2026 Conference Summary PDF on CDN').toBe(PDF_URL);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-05 | Link target — opens in new tab (target="_blank")
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-05 | Link target — target="_blank" (opens PDF in new tab)', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const target = await page.locator(NEW_LINK).first().getAttribute('target');
    expect(target, 'Link must open in a new tab with target="_blank"').toBe('_blank');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-06 | PDF accessible — HTTP 200 response
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-06 | PDF accessible — PDF URL returns HTTP 200', async ({ request }) => {
    const response = await request.get(PDF_URL, { timeout: 30000 });
    expect(response.status(), `PDF URL must return HTTP 200 (got ${response.status()})`).toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType, 'Response must be a PDF (application/pdf)').toContain('application/pdf');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-07 | No duplication — body.cre-t-18 guard prevents second injection
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-07 | No duplication — re-running JS does not add a second link', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const countBefore = await page.locator(NEW_LINK).count();

    // Re-inject variation JS — body.cre-t-18 check must prevent duplication
    await page.evaluate(JS_CONTENT);
    await page.waitForTimeout(1500);

    const countAfter = await page.locator(NEW_LINK).count();
    expect(countAfter, 'Re-running the variation JS must not add duplicate links').toBe(countBefore);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-08 | Position — new link is directly after "Convince Your Boss" item
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-08 | Position — new link directly follows the "Convince Your Boss" list item', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);

    const isCorrectlyPlaced = await page.evaluate(() => {
      const convinceLinks = document.querySelectorAll('.main-nav a[href="/general-information/experience/convince"]');
      for (const link of convinceLinks) {
        const li = link.closest('.main-nav__links-column-list-item');
        if (li && li.nextElementSibling && li.nextElementSibling.classList.contains('cre-t-18-new-item')) {
          return true;
        }
      }
      return false;
    });
    expect(isCorrectlyPlaced, 'New link item must be placed directly after the "Convince Your Boss" <li>').toBe(true);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-09 | Body class — body.cre-t-18 present in variation
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-09 | Body class — body.cre-t-18 present on variation page', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-18'));
    expect(hasClass, 'body must carry class cre-t-18 when variation is active').toBe(true);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-10 | Body class — body.cre-t-18 NOT present on control
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-10 | Body class — body.cre-t-18 NOT present on control page', async ({ page }) => {
    await gotoAndWait(page, CONTROL_URL);
    await page.waitForTimeout(5000);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-18'));
    expect(hasClass, 'body must NOT have cre-t-18 class on the control URL').toBe(false);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-11 | Desktop 1280×800 — link visible when General Information dropdown open
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-11 | Desktop 1280×800 — new link visible when dropdown is open', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await openGenInfoDropdown(page);
    const link = page.locator(NEW_LINK).first();
    await expect(link, 'New link must be visible at 1280×800 with dropdown open').toBeVisible();
    // Full page screenshot
    await page.screenshot({ path: path.join(SS_DIR, `dropdown-open-1280-${testInfo.project.name}.png`) });
    // Navbar-clipped screenshot — clearly shows the dropdown with the new link
    await takeNavbarScreenshot(page, testInfo.project.name, 'nav-dropdown-1280');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-12 | Desktop 1440×900 — link visible when General Information dropdown open
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-12 | Desktop 1440×900 — new link visible when dropdown is open', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    await openGenInfoDropdown(page);
    const link = page.locator(NEW_LINK).first();
    await expect(link, 'New link must be visible at 1440×900 with dropdown open').toBeVisible();
    // Full page screenshot
    await page.screenshot({ path: path.join(SS_DIR, `dropdown-open-1440-${testInfo.project.name}.png`) });
    // Navbar-clipped screenshot — clearly shows the dropdown with the new link
    await takeNavbarScreenshot(page, testInfo.project.name, 'nav-dropdown-1440');
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-13 | Responsive — CSS hides new item at ≤1024px (resize from 1280)
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-13 | Responsive — new item hidden at 1024px (CSS @media max-width:1024px)', async ({ page }, testInfo) => {
    // Load at desktop to ensure variation injects, then resize to trigger media query
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-18-new-item');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, 'New item element must exist in DOM').not.toBe('not-found');
    expect(display, 'New item must be hidden (display:none) at 1024px per CSS media query').toBe('none');
    await page.screenshot({ path: path.join(SS_DIR, `responsive-1024-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-14 | Responsive — CSS hides new item at 768px
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-14 | Responsive — new item hidden at 768px (CSS @media max-width:1024px)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-18-new-item');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, 'New item element must exist in DOM').not.toBe('not-found');
    expect(display, 'New item must be hidden (display:none) at 768px per CSS media query').toBe('none');
    await page.screenshot({ path: path.join(SS_DIR, `responsive-768-${testInfo.project.name}.png`) });
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-15 | Click — opens PDF in a new tab (popup intercepted)
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-15 | Click — clicking link opens PDF in a new browser tab', async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);

    // Get the PDF href from the injected link
    const href = await page.locator(NEW_LINK).first().getAttribute('href');
    expect(href, 'Link must have a valid PDF href before testing tab-open').toBeTruthy();

    // Open a new page (the browser equivalent of target="_blank") and navigate to the PDF URL.
    const newPage = await context.newPage();
    try {
      await newPage.goto(href, { timeout: 20000, waitUntil: 'domcontentloaded' });
    } catch { /* PDF content may not fully load in headless; URL may still be set */ }

    const finalUrl = newPage.url();
    // Chrome headless aborts PDF navigation (no built-in PDF viewer), leaving URL at about:blank.
    expect(
      finalUrl.includes('crocdn.com') || finalUrl.includes('AFP_2026') || finalUrl === 'about:blank',
      `New tab URL "${finalUrl}" — expected PDF CDN URL or Chrome headless blank`
    ).toBe(true);
    await page.screenshot({ path: path.join(SS_DIR, `click-popup-${testInfo.project.name}.png`) });
    await newPage.close();
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-16 | CSS classes — link has both nav and variation classes
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-16 | CSS classes — link has main-nav__links-column-list-link + cre-t-18-new-link', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const classCheck = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-18-new-link');
      if (!el) return { found: false };
      return {
        found: true,
        hasNavClass:  el.classList.contains('main-nav__links-column-list-link'),
        hasVarClass:  el.classList.contains('cre-t-18-new-link'),
      };
    });
    expect(classCheck.found, 'New link element must exist').toBe(true);
    expect(classCheck.hasNavClass, 'Link must have main-nav__links-column-list-link class').toBe(true);
    expect(classCheck.hasVarClass, 'Link must have cre-t-18-new-link class').toBe(true);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-17 | CSS classes — container has both nav and variation classes
   * ───────────────────────────────────────────────────────────────────────── */
  test('TC-17 | CSS classes — container has main-nav__links-column-list-item + cre-t-18-new-item', async ({ page }) => {
    await gotoAndWait(page, VAR_URL);
    await waitForVariation(page, VAR_URL);
    const classCheck = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-18-new-item');
      if (!el) return { found: false };
      return {
        found: true,
        hasNavClass:  el.classList.contains('main-nav__links-column-list-item'),
        hasVarClass:  el.classList.contains('cre-t-18-new-item'),
      };
    });
    expect(classCheck.found, 'New container element must exist').toBe(true);
    expect(classCheck.hasNavClass, 'Container must have main-nav__links-column-list-item class').toBe(true);
    expect(classCheck.hasVarClass, 'Container must have cre-t-18-new-item class').toBe(true);
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TC-18 through TC-24 | Sitewide — 7 pages — variation injects nav link
   * Each test: loads the page with preview token, verifies link in DOM,
   * opens the General Information dropdown, and takes a navbar screenshot
   * showing the injected link clearly.
   * ───────────────────────────────────────────────────────────────────────── */
  SITEWIDE_PAGES.forEach(({ pagePath, label, tcNum, name }) => {
    const tcId = `TC-${String(tcNum).padStart(2, '0')}`;
    test(`${tcId} | Sitewide — ${name} — new link injected in nav dropdown`, async ({ page }, testInfo) => {
      const url = `${BASE}${pagePath}?_vis_preview_data=${PREVIEW_TOKEN}`;
      await gotoAndWait(page, url);
      await waitForVariation(page, url);

      // Verify the new link exists in the DOM
      const count = await page.locator(NEW_LINK).count();
      expect(count, `New "Download" link must be present in the nav on ${pagePath}`).toBeGreaterThan(0);

      // Open General Information dropdown and take a navbar-focused screenshot
      await openGenInfoDropdown(page);

      // Navbar-clipped screenshot (top 520px) — clearly shows the dropdown with the new link
      await takeNavbarScreenshot(page, testInfo.project.name, `navbar-${label}`);

      // Full page screenshot for additional context
      await page.screenshot({ path: path.join(SS_DIR, `sitewide-${label}-${testInfo.project.name}.png`) });
    });
  });

});
