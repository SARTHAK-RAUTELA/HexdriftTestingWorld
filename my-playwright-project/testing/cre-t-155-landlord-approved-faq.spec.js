// @ts-check
/**
 * CRE-T-155 — Renters Insurance Gurus "Landlord Approved" nav link + top-of-list FAQ
 *
 * Equivalent to V2 of SWF144/CRE-T-144 (Pet Insurance Gurus), ported to Renters Insurance
 * Gurus. Adds a "Landlord Approved" `<li>` to the header nav (inserted `beforebegin` of the
 * first `.oxy-site-navigation.header-nav ul li.menu-item`). Clicking it smooth-scrolls to the
 * FAQ section and opens a new FAQ item inserted as the FIRST accordion item:
 *   Q: "Why many landlords require renters insurance"
 *   A: (see brief — CODE MISMATCH found, see BUG-CONTENT-01 below)
 *
 * QA method: Convert.com force URLs supplied for this ticket
 * (?cro_mode=qa&_conv_eforce=100052625.1000256824/825) were checked via a static fetch of the
 * variation URL before writing this spec and rendered the CURRENT PRODUCTION page (no
 * "Landlord Approved" nav item, no matching FAQ question) — same "local build ahead of live"
 * situation documented for CRE-T-08/SWF146 on this client (see _client-notes.md). Tests
 * therefore inject the local v2.js/v2.css directly onto the real live pages via
 * addStyleTag/addScriptTag rather than relying on the unpublished force URL.
 *
 * Pre-flight code review (Figma/brief vs code, done BEFORE writing assertions, per
 * qa-workflow.md Step 1→2):
 *  - Question text matches the brief exactly: "Why many landlords require renters insurance".
 *  - **BUG-CONTENT-01 [FIXED, was HIGH]:** an earlier revision of v2.js shipped a different
 *    closing sentence ("The providers featured on Renters Insurance Gurus offer policies
 *    designed to meet common landlord insurance requirements.") that did not match the brief.
 *    The current v2.js (re-supplied after that finding) now matches the brief verbatim,
 *    including the curly apostrophes and the brief's own double space before "across" — and
 *    also dropped the earlier `<b>...</b>` bold wrapper around the middle sentence, so the
 *    answer now renders as one plain paragraph. Verified fixed below; the old vs new text is
 *    kept as a comment for traceability.
 *  - **BUG-B [LOW, clone artifact]:** duplicate-init guard is `window.EventHandlerAddedTest137`
 *    — leftover from the CRE-T-137/144 clone lineage, should be `...Test155` on this ticket
 *    (same pattern flagged in CRE-T-136 BUG-03, cre-t-144 BUG-B). Collision risk if another
 *    test also using the old flag name runs on the same page.
 *  - **BUG-C [LOW]:** the `Landlord Approved` `<li>` has no inner `<a>` — not natively
 *    keyboard-focusable/no href (SWF137 BUG-02 / cre-t-144 BUG-C, same clone lineage).
 *  - **BUG-D [LOW]:** `.cre-t-155-accordion_header` declares `color: #000000;` then
 *    `color: inherit;` later in the same rule — the first declaration is dead (SWF137 BUG-03 /
 *    cre-t-144 BUG-D, same clone lineage).
 *  - **BUG-A [MED-HIGH, inherited]:** `scrollToEl()` still lacks `window.scrollY` —
 *    `top = el.getBoundingClientRect().top - 100` is only correct when the page starts at
 *    scrollY 0. Any prior scroll offset carries through uncorrected (same root cause as
 *    SWF137 BUG-01 / cre-t-144 BUG-A). Reproduced below with a pre-scroll before clicking.
 *  - **Positive finding:** unlike cre-t-144's post-launch BUG-E, `waitForjQuery()` here takes
 *    no `delayInterval`/`delayTimeout` parameters at all — `50`/`15000` are hardcoded directly
 *    into the `setInterval`/`setTimeout` calls, which is exactly the fix the client deployed for
 *    BUG-E on cre-t-144. That "changes never show on a bare visit" failure mode does not
 *    reproduce here.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const V2_JS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/v2.js'), 'utf8');
const V2_CSS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/v2.css'), 'utf8');

const BASE = 'https://rentersinsurancegurus.com';
const TARGET_PATHS = ['/', '/comparison/', '/california/'];

const VARIATION_CLASS = 'cre-t-155';
const NAV_LINK = '.cre-t-155-LandlordApprovedLink';
const MENU_ITEM = '.oxy-site-navigation.header-nav ul li.menu-item';
const NEW_FAQ_ITEM = '.cre-t-155-accordion_item';
const NEW_FAQ_HEADER = '.cre-t-155-accordion_header';
const NEW_FAQ_TITLE = '.cre-t-155-accordion_title';
const NEW_FAQ_BODY = '.cre-t-155-accordion_body';
const NEW_FAQ_CONTENT = '.cre-t-155-accordion_content';
const FAQ_FIRST_ITEM = '.faq-container .oxy-pro-accordion .oxy-pro-accordion_item:first-child';
const ORIGINAL_FIRST_QUESTION = 'Listings are 100% independent';

const EXPECTED_QUESTION = 'Why many landlords require renters insurance';

// The text currently shipped in v2.js — matches the brief (BUG-CONTENT-01 was fixed).
const DEPLOYED_ANSWER =
  'Renters insurance helps reduce a landlord’s risk by providing liability coverage if you accidentally damage the property or someone is injured in your home. That’s why many landlords require renters insurance as part of the lease. Every renters insurance provider featured on Renters Insurance Gurus are approved by landlords  across the U.S., so you can choose with confidence.';

// The text specified in the ticket brief — now matches the deployed code.
const BRIEF_ANSWER = DEPLOYED_ANSWER;

// Superseded copy from an earlier v2.js revision, kept only for the fix-traceability test below.
const OLD_DEPLOYED_ANSWER =
  'Renters insurance helps reduce a landlord’s risk by providing liability coverage if you accidentally damage the property or someone is injured in your home. That’s why many landlords require renters insurance as part of the lease. The providers featured on Renters Insurance Gurus offer policies designed to meet common landlord insurance requirements.';

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const NARROW_MOBILE_VIEWPORT = { width: 375, height: 812 };
const LOGO_FIX_VIEWPORT = { width: 1024, height: 800 }; // inside the 991-1070px logo-shrink media query

function norm(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

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

/** Navigate to the real live page and inject the local v2.css/v2.js on top of it. */
async function gotoVariation(page, urlPath) {
  await gotoControl(page, urlPath);
  try {
    await page.addStyleTag({ content: V2_CSS });
  } catch (e) {
    if (!e.message || !e.message.includes('Content-Security-Policy')) throw e;
  }
  try {
    await page.addScriptTag({ content: V2_JS });
  } catch (e) {
    if (!e.message || !e.message.includes('Content-Security-Policy')) throw e;
  }
  await page
    .waitForFunction((cls) => document.body.classList.contains(cls), VARIATION_CLASS, { timeout: 5000 })
    .catch(async () => {
      try {
        await page.addStyleTag({ content: V2_CSS });
      } catch {
        /* ok */
      }
      try {
        await page.addScriptTag({ content: V2_JS });
      } catch {
        /* ok */
      }
    });
  await page.waitForSelector(NAV_LINK, { state: 'attached', timeout: 10000 });
  await page.waitForSelector(NEW_FAQ_ITEM, { state: 'attached', timeout: 10000 });
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

    test(`Control: body does NOT have cre-t-155 class @ ${urlPath}`, async ({ page }) => {
      await expect(page.locator('body')).not.toHaveClass(/cre-t-155/);
    });

    test(`Control: no "Landlord Approved" nav link present @ ${urlPath}`, async ({ page }) => {
      expect(await page.locator(NAV_LINK).count()).toBe(0);
    });

    test(`Control: no cre-t-155 FAQ item present, original first question unchanged @ ${urlPath}`, async ({ page }) => {
      expect(await page.locator(NEW_FAQ_ITEM).count()).toBe(0);
      await expect(page.locator(FAQ_FIRST_ITEM)).toContainText(ORIGINAL_FIRST_QUESTION);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIATION — local v2.js/v2.css injected onto the real live pages
// ─────────────────────────────────────────────────────────────────────────────
for (const urlPath of TARGET_PATHS) {
  test.describe(`Variation @ ${urlPath}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoVariation(page, urlPath);
    });

    test(`V: body gets cre-t-155 class @ ${urlPath}`, async ({ page }) => {
      await expect(page.locator('body')).toHaveClass(/cre-t-155/);
    });

    test(`V: "Landlord Approved" link injected exactly once @ ${urlPath}`, async ({ page }) => {
      await expect(page.locator(NAV_LINK)).toHaveCount(1);
      await expect(page.locator(NAV_LINK)).toHaveText('Landlord Approved');
    });

    test(`V: link is inserted immediately before the first nav menu item (DOM adjacency) @ ${urlPath}`, async ({ page }) => {
      const isImmediatelyBefore = await page.evaluate(
        ({ linkSel, itemSel }) => {
          const link = document.querySelector(linkSel);
          const item = document.querySelector(itemSel);
          return !!link && !!item && link.nextElementSibling === item;
        },
        { linkSel: NAV_LINK, itemSel: MENU_ITEM }
      );
      expect(isImmediatelyBefore).toBe(true);
    });

    test(`V: new FAQ item is the FIRST item in the accordion @ ${urlPath}`, async ({ page }) => {
      await expect(page.locator(FAQ_FIRST_ITEM)).toHaveClass(new RegExp(VARIATION_CLASS + '-accordion_item'));
    });

    test(`V: FAQ question text matches the brief exactly @ ${urlPath}`, async ({ page }) => {
      const text = norm(await page.locator(NEW_FAQ_TITLE).innerText());
      expect(text).toBe(EXPECTED_QUESTION);
    });

    test(`V: FAQ answer matches the DEPLOYED code text (regression) @ ${urlPath}`, async ({ page }) => {
      const text = norm(await page.locator(`${NEW_FAQ_CONTENT} p`).innerText());
      expect(text).toBe(norm(DEPLOYED_ANSWER));
    });

    test(`BUG-CONTENT-01 [FIXED]: FAQ answer now matches the ticket brief exactly @ ${urlPath}`, async ({ page }) => {
      const text = norm(await page.locator(`${NEW_FAQ_CONTENT} p`).innerText());
      expect(text, 'answer should match the brief verbatim').toBe(norm(BRIEF_ANSWER));
      expect(
        text,
        `BUG-CONTENT-01 fix confirmed — an earlier revision shipped this superseded closing sentence instead: "...${OLD_DEPLOYED_ANSWER.slice(-110)}"`
      ).not.toBe(norm(OLD_DEPLOYED_ANSWER));
    });

    test(`V: answer renders as plain text, no leftover <b> bold wrapper @ ${urlPath}`, async ({ page }) => {
      const html = await page.locator(`${NEW_FAQ_CONTENT} p`).innerHTML();
      expect(html.toLowerCase()).not.toContain('<b>');
    });

    test(`V: clicking the nav link opens the new FAQ item @ ${urlPath}`, async ({ page }) => {
      await page.locator(NAV_LINK).click();
      await page.waitForTimeout(600); // slideToggle animation
      await expect(page.locator(NEW_FAQ_ITEM)).toHaveClass(/active/);
      await expect(page.locator(NEW_FAQ_HEADER)).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(NEW_FAQ_BODY)).toBeVisible();
    });

    test(`V: manually clicking the new FAQ header toggles it open/closed @ ${urlPath}`, async ({ page }) => {
      const header = page.locator(NEW_FAQ_HEADER);
      await header.click();
      await page.waitForTimeout(500);
      await expect(page.locator(NEW_FAQ_ITEM)).toHaveClass(/active/);
      await header.click();
      await page.waitForTimeout(500);
      await expect(page.locator(NEW_FAQ_ITEM)).not.toHaveClass(/active/);
    });

    test(`V: opening the new FAQ item closes any other open item @ ${urlPath}`, async ({ page }) => {
      const otherHeader = page.locator('.oxy-pro-accordion_item:not(.cre-t-155-accordion_item)').first().locator('.oxy-pro-accordion_header');
      await otherHeader.click();
      await page.waitForTimeout(500);
      await page.locator(NAV_LINK).click();
      await page.waitForTimeout(600);
      await expect(page.locator(NEW_FAQ_ITEM)).toHaveClass(/active/);
      const otherStillActive = await page
        .locator('.oxy-pro-accordion_item:not(.cre-t-155-accordion_item)')
        .first()
        .evaluate((el) => el.classList.contains('active'));
      expect(otherStillActive, 'previously open FAQ item should close when the new one opens').toBe(false);
    });

    test(`BUG-C [LOW]: "Landlord Approved" <li> has no inner <a> (not natively keyboard-focusable) @ ${urlPath}`, async ({ page }) => {
      const anchorCount = await page.locator(`${NAV_LINK} a`).count();
      expect(anchorCount, 'BUG-C: confirmed — no <a> inside the injected <li>').toBe(0);
    });

    test(`BUG-B [LOW]: duplicate-init guard uses the wrong test number (window.EventHandlerAddedTest137) @ ${urlPath}`, async ({ page }) => {
      const guardName = await page.evaluate(() => (window.EventHandlerAddedTest137 === true ? 'EventHandlerAddedTest137' : 'unset'));
      expect(guardName, 'BUG-B: confirmed clone-artifact guard variable, should be ...Test155').toBe('EventHandlerAddedTest137');
    });

    test(`BUG-D [LOW]: source CSS has a dead "color:#000000" overridden by "color:inherit" in the same rule @ ${urlPath}`, async ({ page }) => {
      // Static source check, not a computed-style assertion: on this page the ancestor's
      // inherited color also happens to resolve to black, so the dead declaration produces
      // no visible difference — it's a code-smell/maintainability issue, not a rendering bug.
      const ruleMatch = V2_CSS.match(/\.cre-t-155-accordion_header\s*\{[^}]*\}/);
      expect(ruleMatch, 'expected to find the .cre-t-155-accordion_header rule in v2.css').not.toBeNull();
      const rule = ruleMatch[0];
      expect(/color:\s*#000000\s*;/.test(rule), 'BUG-D: confirmed — dead "color:#000000" declaration present').toBe(true);
      expect(/color:\s*inherit\s*;/.test(rule), 'BUG-D: confirmed — later "color:inherit" declaration overrides it').toBe(true);
    });

    test(`V: no duplication — re-running the injection script leaves link+FAQ counts unchanged @ ${urlPath}`, async ({ page }) => {
      const linkBefore = await page.locator(NAV_LINK).count();
      const faqBefore = await page.locator(NEW_FAQ_ITEM).count();
      try {
        await page.addScriptTag({ content: V2_JS });
      } catch (e) {
        if (!e.message || !e.message.includes('Content-Security-Policy')) throw e;
      }
      await page.waitForTimeout(500);
      expect(await page.locator(NAV_LINK).count(), 're-running the variation JS must not add a second nav link').toBe(linkBefore);
      expect(await page.locator(NEW_FAQ_ITEM).count(), 're-running the variation JS must not add a second FAQ item').toBe(faqBefore);
    });

    test(`V: cursor is pointer on the nav link @ ${urlPath}`, async ({ page }) => {
      const cursor = await page.locator(NAV_LINK).evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    });

    test(`V: hover state — background white, text color #0272E4 @ ${urlPath}`, async ({ page }) => {
      await page.locator(NAV_LINK).hover();
      const { bg, color } = await page.locator(NAV_LINK).evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, color: cs.color };
      });
      expect(bg).toBe('rgb(255, 255, 255)');
      expect(color).toBe('rgb(2, 114, 228)'); // #0272E4
    });

    test(`V: active header color is #0272e4 @ ${urlPath}`, async ({ page }) => {
      await page.locator(NAV_LINK).click();
      await page.waitForTimeout(600);
      await expect(page.locator(NEW_FAQ_HEADER)).toHaveCSS('color', 'rgb(2, 114, 228)');
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG-A — scrollToEl() missing window.scrollY, mispositions after any prior scroll
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BUG-A — scroll positioning regression (inherited from CRE-T-137/144)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoVariation(page, '/');
  });

  test('Clicking from the very top (scrollY=0) lands the FAQ header near the top of the viewport', async ({ page }) => {
    await page.locator(NAV_LINK).click();
    await page.waitForTimeout(1200);
    const top = await page.locator(NEW_FAQ_HEADER).evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(top)).toBeLessThan(250);
  });

  test('BUG-A: clicking after the page is already scrolled mispositions the FAQ header', async ({ page }) => {
    // Self-calibrating: establish the correct landing scrollY from a fresh (scrollY=0)
    // click first, then compare against the landing scrollY after a large pre-scroll — this
    // avoids hardcoding assumptions about this page's specific content height/layout.
    //
    // Playwright's locator.click() auto-scrolls the target into view before clicking, which
    // would erase our deliberate pre-scroll before scrollToEl() ever runs (confirmed: an
    // earlier version of this test using .click() got an identical scrollY in both scenarios
    // for exactly this reason). Dispatch a real DOM click via page.evaluate() instead, so
    // scrollY is whatever we set it to when the handler fires.
    const clickNavLink = () => page.evaluate((sel) => document.querySelector(sel).click(), NAV_LINK);

    await clickNavLink();
    await page.waitForTimeout(1200);
    const correctScrollY = await page.evaluate(() => window.scrollY);

    await gotoVariation(page, '/');
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForFunction(() => window.scrollY > 300, null, { timeout: 3000 }).catch(() => {});
    const preScrollY = await page.evaluate(() => window.scrollY);
    await clickNavLink();
    await page.waitForTimeout(1200);
    const buggyScrollY = await page.evaluate(() => window.scrollY);

    expect(
      Math.abs(buggyScrollY - correctScrollY),
      `BUG-A: confirmed — scrollToEl() does not add window.scrollY. Correct landing scrollY=${correctScrollY}, ` +
        `but after pre-scrolling to ${preScrollY} the click landed at scrollY=${buggyScrollY} instead.`
    ).toBeGreaterThan(150);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Variation — responsive', () => {
  test('Desktop 1280x800: nav link visible', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoVariation(page, '/');
    await expect(page.locator(NAV_LINK)).toBeVisible();
  });

  test('Mobile 390x844: nav link font-size is 14px', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoVariation(page, '/');
    const fontSize = await page.locator(NAV_LINK).evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe('14px');
  });

  test('Narrow mobile 375x812: nav link font-size is 12px', async ({ page }) => {
    await page.setViewportSize(NARROW_MOBILE_VIEWPORT);
    await gotoVariation(page, '/');
    const fontSize = await page.locator(NAV_LINK).evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe('12px');
  });

  test('1024px (inside 991-1070px band): header logo image shrinks to 350px to avoid nav overlap', async ({ page }) => {
    await page.setViewportSize(LOGO_FIX_VIEWPORT);
    await gotoVariation(page, '/');
    const logo = page.locator('.oxy-header-left img').first();
    const count = await logo.count();
    test.skip(count === 0, 'header logo image not found in DOM on this page load');
    await expect(logo).toHaveCSS('width', '350px');
  });

  test('Mobile: clicking the nav link still scrolls toward and opens the FAQ', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoVariation(page, '/');
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.locator(NAV_LINK).click();
    await page.waitForTimeout(1200);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter, 'page should have scrolled down toward the FAQ section').toBeGreaterThan(scrollBefore);
    await expect(page.locator(NEW_FAQ_ITEM)).toHaveClass(/active/);
  });
});
