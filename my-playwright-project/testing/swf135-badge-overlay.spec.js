// @ts-check
/**
 * SWF135 (CRE-T-135) — Pet Insurance Gurus — Scoring Badge & Overlay Removal
 *
 * Control  = SWF76 winner (running as deploy): badge with score/star/classification,
 *            "Pet Insurance Gurus Score" label, "v" dropdown icon, hover overlay showing
 *            Popularity / Value for Money / Reviews sub-scores.
 * Variation = Same badge + scoring, but:
 *            1. Overlay dropdown REMOVED (badge + scoring stay)
 *            2. "v" dropdown icon REMOVED (desktop + mobile)
 *            3. "Pet Insurance Gurus Score" text RECENTERED on desktop (still visible)
 *            4. Mobile (<767px): "Pet Insurance Gurus Score" text NOT shown
 *            5. Cursor changes from pointer → default
 *
 * Target pages: / · /compare/ · /cat-insurance/
 * Browsers: Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop ·
 *           Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)
 *
 * Control  preview: ?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256173
 * Variation preview: ?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256174
 *
 * TC-01  Control: Badge renders on homepage                                         [ss]
 * TC-02  Control: Badge renders on /compare/
 * TC-03  Control: Badge renders on /cat-insurance/
 * TC-04  Control: Badge data correct — Lemonade 9.6 / Exceptional
 * TC-05  Control: ≥3 insurer badges present on homepage
 * TC-06  Control: Trustpilot image display:none in comparison section
 * TC-07  Control: body.cre-t-76 class added
 * TC-08  Control — Desktop: "Pet Insurance Gurus Score" text visible               [ss]
 * TC-09  Control — Desktop: "v" dropdown icon visible
 * TC-10  Control — Desktop: Hover on badge shows dropdown overlay                  [ss]
 * TC-11  Control — Desktop: Dropdown has Popularity / Value for Money / Reviews sections
 * TC-12  Control — Desktop: Badge cursor is pointer
 * TC-13  Control — Mobile:  "Pet Insurance Gurus Score" text visible               [ss]
 * TC-14  Control — Mobile:  Tap badge → cre-t-76-dropdown-active + dropdown visible [ss]
 * TC-15  Control — Mobile:  X close button visible in open dropdown
 * TC-16  Variation: Badge renders on homepage                                       [ss]
 * TC-17  Variation: Badge renders on /compare/
 * TC-18  Variation: Badge renders on /cat-insurance/
 * TC-19  Variation: Badge data unchanged — Lemonade 9.6 / Exceptional
 * TC-20  Variation: ≥3 insurer badges present on homepage
 * TC-21  Variation: Trustpilot image display:none in comparison section
 * TC-22  Variation: body.cre-t-76 class added
 * TC-23  Variation — Desktop: "v" dropdown icon NOT visible                        [ss]
 * TC-24  Variation — Desktop: "Pet Insurance Gurus Score" text IS visible
 * TC-25  Variation — Desktop: Hover does NOT show dropdown overlay                 [ss]
 * TC-26  Variation — Desktop: Cursor is default (not pointer)
 * TC-27  Variation — Mobile:  "v" icon NOT visible                                 [ss]
 * TC-28  Variation — Mobile:  "Pet Insurance Gurus Score" text NOT visible
 * TC-29  Variation — Mobile:  Tap badge does NOT open dropdown                     [ss]
 * TC-30  Variation: No badge duplication — each insurer card has exactly 1 badge
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Preview URLs ────────────────────────────────────────────────────────── */
const CTRL_HOME    = 'https://petinsurancegurus.com/?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256173';
const CTRL_COMPARE = 'https://petinsurancegurus.com/compare/?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256173';
const CTRL_CAT     = 'https://petinsurancegurus.com/cat-insurance/?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256173';
const VAR_HOME     = 'https://petinsurancegurus.com/?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256174';
const VAR_COMPARE  = 'https://petinsurancegurus.com/compare/?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256174';
const VAR_CAT      = 'https://petinsurancegurus.com/cat-insurance/?utm_campaign=Cro_mode135&_conv_eforce=100052356.1000256174';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const CONTAINER      = '.cre-t-76-container';
const REVIEWS_WRAP   = '.cre-t-76-reviews';
const TOTAL          = '.cre-t-76-total';
const CLASSIFICATION = '.cre-t-76-classification';
const SCORE_TEXT     = '.cre-t-76-top-content2-text';
const DROPDOWN       = '.cre-t-76-review-dropdown';
const DROPDOWN_C1    = '.cre-t-76-dropdown-content1';
const DROPDOWN_C2    = '.cre-t-76-dropdown-content2';
const DROPDOWN_C3    = '.cre-t-76-dropdown-content3';
const CROSS          = '.cre-t-76-cross';
const TRUSTPILOT     = '#comparison-section .ct-image.trustpilot-image';

/* ── Expected values ─────────────────────────────────────────────────────── */
const LEMONADE_SCORE = '9.6';
const LEMONADE_CLASS = 'Exceptional';

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../swf135-screenshots');
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

/* Dismiss any overlaying modals (CRE-T-133 ZIP modal, etc.) that block tap events */
async function dismissModals(page) {
  try {
    await page.waitForTimeout(300); // let modal fully render
    const hasModal = await page.locator('.cre-t-133-overlay').count() > 0;
    if (!hasModal) return;

    // V1: close icon present — click it
    const closeIcon = page.locator('.cre-t-133-close-icon');
    if (await closeIcon.count() > 0) {
      await closeIcon.first().click({ force: true, timeout: 3000 });
      await page.waitForTimeout(400);
      return;
    }

    // V2 / any other: forcibly remove overlay from DOM so it stops intercepting events
    await page.evaluate(() => {
      ['.cre-t-133-overlay', '.cre-t-133-container', '.cre-t-133-backdrop'].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
      document.body.style.overflow = '';
      document.body.style.position = '';
    });
    await page.waitForTimeout(200);
  } catch { /* no modal present */ }
}

async function waitForBadge(page, label) {
  await page.waitForSelector(CONTAINER, { state: 'attached', timeout: 35000 }).catch(() => {
    throw new Error(`cre-t-76 badge not found on: ${label}`);
  });
  await page.waitForTimeout(400);
  await dismissModals(page); // always clear CRE-T-133 overlay before interacting
}

async function badgeExists(page, url) {
  await gotoAndWait(page, url);
  const found = await page.waitForSelector(CONTAINER, { state: 'attached', timeout: 30000 })
    .then(() => true).catch(() => false);
  if (found) await dismissModals(page);
  return found;
}

function isMobile(testInfo) {
  return testInfo.project.name.startsWith('Mobile');
}

/* ── Tests ───────────────────────────────────────────────────────────────── */
test.describe('SWF135 — Pet Insurance Gurus — Scoring Badge & Overlay', () => {

  /* ════════════════════════════════════════════════════════════════
   *  GROUP A — CONTROL  (TC-01 … TC-15)
   * ════════════════════════════════════════════════════════════════ */

  test('TC-01 | Control — Badge renders on homepage', async ({ page }, testInfo) => {
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control /');
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Control homepage must show ≥1 cre-t-76 badge').toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: path.join(SS_DIR, `tc01-ctrl-home-${testInfo.project.name}.png`) });
  });

  test('TC-02 | Control — Badge renders on /compare/', async ({ page }) => {
    await gotoAndWait(page, CTRL_COMPARE);
    await waitForBadge(page, 'Control /compare/');
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Control /compare/ must show ≥1 badge').toBeGreaterThanOrEqual(1);
  });

  test('TC-03 | Control — Badge renders on /cat-insurance/', async ({ page }, testInfo) => {
    const found = await badgeExists(page, CTRL_CAT);
    if (!found) { test.skip(); return; }
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Control /cat-insurance/ badge count ≥1').toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: path.join(SS_DIR, `tc03-ctrl-cat-${testInfo.project.name}.png`) });
  });

  test('TC-04 | Control — Badge data correct: Lemonade 9.6 / Exceptional', async ({ page }) => {
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (Lemonade data)');
    const all = page.locator(CONTAINER);
    const count = await all.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const score = (await all.nth(i).locator(TOTAL).first().innerText()).trim();
      if (score === LEMONADE_SCORE) {
        const classTexts = await all.nth(i).locator(CLASSIFICATION).allInnerTexts();
        expect(classTexts.some(t => t.trim() === LEMONADE_CLASS),
          `Badge ${LEMONADE_SCORE} must show classification "${LEMONADE_CLASS}"`).toBe(true);
        found = true; break;
      }
    }
    expect(found, `Badge with score "${LEMONADE_SCORE}" (Lemonade) must exist on control homepage`).toBe(true);
  });

  test('TC-05 | Control — At least 3 insurer badges on homepage', async ({ page }) => {
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (multi-badge)');
    await page.waitForTimeout(1500);
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Control homepage must inject ≥3 insurer badges').toBeGreaterThanOrEqual(3);
  });

  test('TC-06 | Control — Trustpilot image hidden (display:none)', async ({ page }) => {
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (trustpilot)');
    const tpCount = await page.locator(TRUSTPILOT).count();
    if (tpCount === 0) return;
    const allHidden = await page.evaluate(sel => {
      return [...document.querySelectorAll(sel)].every(
        el => window.getComputedStyle(el).display === 'none'
      );
    }, TRUSTPILOT);
    expect(allHidden, 'All #comparison-section .trustpilot-image must be display:none').toBe(true);
  });

  test('TC-07 | Control — body.cre-t-76 class added', async ({ page }) => {
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (body class)');
    const has = await page.evaluate(() => document.body.classList.contains('cre-t-76'));
    expect(has, 'body must carry class cre-t-76 in control').toBe(true);
  });

  test('TC-08 | Control — Desktop: "Pet Insurance Gurus Score" text visible', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (score text desktop)');
    await expect(page.locator(SCORE_TEXT).first()).toBeVisible();
    const txt = await page.locator(SCORE_TEXT).first().innerText();
    expect(txt.trim()).toBe('Pet Insurance Gurus Score');
    await page.screenshot({ path: path.join(SS_DIR, `tc08-ctrl-score-text-${testInfo.project.name}.png`) });
  });

  test('TC-09 | Control — Desktop: "v" dropdown icon visible', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (v icon)');
    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-top-content2 .cre-t-76-top-content2-icon');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, '"v" icon inside .cre-t-76-top-content2 must not be display:none on desktop').not.toBe('none');
    expect(display).not.toBe('not-found');
  });

  test('TC-10 | Control — Desktop: Hover shows dropdown overlay', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (hover overlay)');
    await page.locator(REVIEWS_WRAP).first().hover();
    await page.waitForTimeout(200);
    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-review-dropdown');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, 'Dropdown must be display:block on hover in control desktop').toBe('block');
    await page.screenshot({ path: path.join(SS_DIR, `tc10-ctrl-hover-overlay-${testInfo.project.name}.png`) });
  });

  test('TC-11 | Control — Desktop: Dropdown has Popularity / Value for Money / Reviews', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (dropdown sections)');
    await page.locator(REVIEWS_WRAP).first().hover();
    await page.waitForTimeout(200);
    const t1 = await page.locator(`${DROPDOWN_C1} .cre-t-76-dropdown-info1-text`).first().innerText();
    const t2 = await page.locator(`${DROPDOWN_C2} .cre-t-76-dropdown-info1-text`).first().innerText();
    const t3 = await page.locator(`${DROPDOWN_C3} .cre-t-76-dropdown-info1-text`).first().innerText();
    expect(t1.trim()).toBe('Popularity');
    expect(t2.trim()).toBe('Value for Money');
    expect(t3.trim()).toBe('Reviews');
  });

  test('TC-12 | Control — Desktop: Badge cursor is pointer', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / (cursor)');
    const cursor = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-reviews');
      return el ? window.getComputedStyle(el).cursor : null;
    });
    expect(cursor, '.cre-t-76-reviews cursor must be "pointer" in control').toBe('pointer');
  });

  test('TC-13 | Control — Mobile: "Pet Insurance Gurus Score" text visible', async ({ page }, testInfo) => {
    if (!isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / mobile (score text)');
    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-top-content2');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, '.cre-t-76-top-content2 must not be display:none on mobile control').not.toBe('none');
    expect(display).not.toBe('not-found');
    await page.screenshot({ path: path.join(SS_DIR, `tc13-ctrl-mobile-score-text-${testInfo.project.name}.png`) });
  });

  test('TC-14 | Control — Mobile: Tap badge opens dropdown', async ({ page }, testInfo) => {
    if (!isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / mobile (tap dropdown)');
    const firstCard = page.locator(CONTAINER).first();
    await firstCard.locator(REVIEWS_WRAP).tap();
    await page.waitForTimeout(400);
    const isActive = await firstCard.evaluate(el => el.classList.contains('cre-t-76-dropdown-active'));
    expect(isActive, 'Tap must add cre-t-76-dropdown-active class in control mobile').toBe(true);
    const dropDisplay = await firstCard.evaluate(el => {
      const d = el.querySelector('.cre-t-76-review-dropdown');
      return d ? window.getComputedStyle(d).display : 'not-found';
    });
    expect(dropDisplay, 'Dropdown must be display:block after tap in control mobile').toBe('block');
    await page.screenshot({ path: path.join(SS_DIR, `tc14-ctrl-mobile-tap-open-${testInfo.project.name}.png`) });
  });

  test('TC-15 | Control — Mobile: X close button visible in open dropdown', async ({ page }, testInfo) => {
    if (!isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, CTRL_HOME);
    await waitForBadge(page, 'Control / mobile (X btn)');
    await page.locator(CONTAINER).first().locator(REVIEWS_WRAP).tap();
    await page.waitForTimeout(400);
    const crossDisplay = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-cross');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(crossDisplay, '.cre-t-76-cross must be visible (flex) on mobile in control').not.toBe('none');
    expect(crossDisplay).not.toBe('not-found');
  });

  /* ════════════════════════════════════════════════════════════════
   *  GROUP B — VARIATION  (TC-16 … TC-30)
   * ════════════════════════════════════════════════════════════════ */

  test('TC-16 | Variation — Badge renders on homepage', async ({ page }, testInfo) => {
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation /');
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Variation homepage must show ≥1 cre-t-76 badge').toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: path.join(SS_DIR, `tc16-var-home-${testInfo.project.name}.png`) });
  });

  test('TC-17 | Variation — Badge renders on /compare/', async ({ page }) => {
    await gotoAndWait(page, VAR_COMPARE);
    await waitForBadge(page, 'Variation /compare/');
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Variation /compare/ must show ≥1 badge').toBeGreaterThanOrEqual(1);
  });

  test('TC-18 | Variation — Badge renders on /cat-insurance/', async ({ page }, testInfo) => {
    const found = await badgeExists(page, VAR_CAT);
    if (!found) { test.skip(); return; }
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Variation /cat-insurance/ badge count ≥1').toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: path.join(SS_DIR, `tc18-var-cat-${testInfo.project.name}.png`) });
  });

  test('TC-19 | Variation — Badge data unchanged: Lemonade 9.6 / Exceptional', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (Lemonade data)');
    const all = page.locator(CONTAINER);
    const count = await all.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const score = (await all.nth(i).locator(TOTAL).first().innerText()).trim();
      if (score === LEMONADE_SCORE) {
        const classTexts = await all.nth(i).locator(CLASSIFICATION).allInnerTexts();
        expect(classTexts.some(t => t.trim() === LEMONADE_CLASS),
          `Variation Lemonade badge must still show "${LEMONADE_CLASS}"`).toBe(true);
        found = true; break;
      }
    }
    expect(found, `Variation must keep Lemonade badge with score "${LEMONADE_SCORE}"`).toBe(true);
  });

  test('TC-20 | Variation — At least 3 insurer badges on homepage', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (multi-badge)');
    await page.waitForTimeout(1500);
    const count = await page.locator(CONTAINER).count();
    expect(count, 'Variation homepage must inject ≥3 insurer badges').toBeGreaterThanOrEqual(3);
  });

  test('TC-21 | Variation — Trustpilot image hidden (display:none)', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (trustpilot)');
    const tpCount = await page.locator(TRUSTPILOT).count();
    if (tpCount === 0) return;
    const allHidden = await page.evaluate(sel => {
      return [...document.querySelectorAll(sel)].every(
        el => window.getComputedStyle(el).display === 'none'
      );
    }, TRUSTPILOT);
    expect(allHidden, 'All trustpilot images must be display:none in variation').toBe(true);
  });

  test('TC-22 | Variation — body.cre-t-76 class added', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (body class)');
    const has = await page.evaluate(() => document.body.classList.contains('cre-t-76'));
    expect(has, 'body must carry class cre-t-76 in variation').toBe(true);
  });

  test('TC-23 | Variation — Desktop: "v" dropdown icon NOT visible', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (v icon absent)');
    const allHidden = await page.evaluate(() => {
      const icons = document.querySelectorAll('.cre-t-76-top-content2-icon');
      if (icons.length === 0) return true;
      return [...icons].every(el => window.getComputedStyle(el).display === 'none');
    });
    expect(allHidden, 'All .cre-t-76-top-content2-icon elements must be display:none in variation').toBe(true);
    await page.screenshot({ path: path.join(SS_DIR, `tc23-var-no-vicon-${testInfo.project.name}.png`) });
  });

  test('TC-24 | Variation — Desktop: "Pet Insurance Gurus Score" text IS visible', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (score text desktop)');
    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-top-content2');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, '.cre-t-76-top-content2 must be visible on desktop variation').not.toBe('none');
    expect(display).not.toBe('not-found');
    const txt = await page.locator(SCORE_TEXT).first().innerText();
    expect(txt.trim()).toBe('Pet Insurance Gurus Score');
  });

  test('TC-25 | Variation — Desktop: Hover does NOT show dropdown overlay', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (hover no overlay)');
    await page.locator(REVIEWS_WRAP).first().hover();
    await page.waitForTimeout(200);
    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-review-dropdown');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, 'Dropdown must remain display:none on hover in variation desktop').toBe('none');
    await page.screenshot({ path: path.join(SS_DIR, `tc25-var-no-hover-overlay-${testInfo.project.name}.png`) });
  });

  test('TC-26 | Variation — Desktop: Cursor is default on badge', async ({ page }, testInfo) => {
    if (isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (cursor default)');
    const cursor = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-reviews');
      return el ? window.getComputedStyle(el).cursor : null;
    });
    expect(cursor, '.cre-t-76-reviews cursor must be "default" in variation').toBe('default');
  });

  test('TC-27 | Variation — Mobile: "v" icon NOT visible', async ({ page }, testInfo) => {
    if (!isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / mobile (v icon absent)');
    const allHidden = await page.evaluate(() => {
      const icons = document.querySelectorAll('.cre-t-76-top-content2-icon');
      if (icons.length === 0) return true;
      return [...icons].every(el => window.getComputedStyle(el).display === 'none');
    });
    expect(allHidden, '"v" icon must be display:none on mobile variation').toBe(true);
    await page.screenshot({ path: path.join(SS_DIR, `tc27-var-mobile-no-vicon-${testInfo.project.name}.png`) });
  });

  test('TC-28 | Variation — Mobile: "Pet Insurance Gurus Score" text NOT visible', async ({ page }, testInfo) => {
    if (!isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / mobile (score text hidden)');
    const display = await page.evaluate(() => {
      const el = document.querySelector('.cre-t-76-top-content2');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display, '.cre-t-76-top-content2 must be display:none on mobile in variation').toBe('none');
  });

  test('TC-29 | Variation — Mobile: Tap badge does NOT open dropdown', async ({ page }, testInfo) => {
    if (!isMobile(testInfo)) { test.skip(); return; }
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / mobile (tap no dropdown)');
    await page.locator(CONTAINER).first().locator(REVIEWS_WRAP).tap();
    await page.waitForTimeout(400);
    const dropDisplay = await page.locator(CONTAINER).first().evaluate(el => {
      const d = el.querySelector('.cre-t-76-review-dropdown');
      return d ? window.getComputedStyle(d).display : 'not-found';
    });
    expect(dropDisplay, 'Dropdown must remain display:none after tap in variation mobile').toBe('none');
    await page.screenshot({ path: path.join(SS_DIR, `tc29-var-mobile-tap-${testInfo.project.name}.png`) });
  });

  test('TC-30 | Variation — No badge duplication per insurer card', async ({ page }) => {
    await gotoAndWait(page, VAR_HOME);
    await waitForBadge(page, 'Variation / (dedup)');
    await page.waitForTimeout(2000);
    const dupFound = await page.evaluate(() => {
      const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
      for (const item of items) {
        if (item.querySelectorAll('.cre-t-76-container').length > 1) return true;
      }
      return false;
    });
    expect(dupFound, 'No insurer card must have >1 badge (dedup guard must work)').toBe(false);
  });

});
