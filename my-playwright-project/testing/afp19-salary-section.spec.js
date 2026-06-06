// @ts-check
/**
 * AFP19 — AFP Compensation Survey Hero Section Replacement
 * Target URL: https://www.financialprofessionals.org/home/afp--be-the-one-with-the-answers
 * Audience:   All users  |  Platform: VWO
 *
 * Variation (Try_Free_Cta_Hide) replaces .finance-wrap innerHTML with a
 * two-column salary section: left = h1 + description + bullets, right = AFP
 * report image. Also moves #site-main > .section after .salary-bullets and
 * adds body.Try_Free_Cta_Hide class.
 *
 * Testing approach: JS/CSS injected via page.evaluate() since VWO preview
 * is not rendering (confirmed working via manual console injection).
 *
 * TC-01  Control  — .salary-section NOT in DOM before injection
 * TC-02  Variation — body.Try_Free_Cta_Hide class present after injection
 * TC-03  Variation — .salary-section injected inside .finance-wrap  [element screenshot]
 * TC-04  Variation — .salary-left and .salary-right columns both present
 * TC-05  Variation — h1 headline present in .salary-left
 * TC-06  Variation — h1 .highlight span contains "finance" accent text
 * TC-07  Variation — .salary-desc contains "5,000+" data claim
 * TC-08  Variation — exactly 3 bullet items in .salary-bullets  [element screenshot]
 * TC-09  Variation — bullet 1: "salary kept up with peers"
 * TC-10  Variation — bullet 2: "bonuses differ across finance roles"
 * TC-11  Variation — bullet 3: "certifications are linked to real salary premiums"
 * TC-12  Variation — .check-icon with SVG polyline present in all 3 bullets
 * TC-13  Variation — AFP compensation report image in .salary-right  [element screenshot]
 * TC-14  Variation — AFP report image URL returns HTTP 200
 * TC-15  No duplication — second JS injection does not create second .salary-section
 * TC-16  CSS — .salary-section computed display is flex
 * TC-17  CSS — .salary-left max-width is 665px (Figma spec)
 * TC-18  CSS — h1 .highlight color is rgb(240, 124, 42) (#f07c2a orange)
 * TC-19  CSS — .salary-bullets li text color is white rgb(255, 255, 255)
 * TC-20  CSS — .doc-image-wrap img has CSS transform (rotation) applied
 * TC-21  Responsive — Desktop 1280×800: .salary-section visible  [screenshot]
 * TC-22  Responsive — Tablet 768×1024: .salary-section visible  [screenshot]
 * TC-23  Responsive — Mobile 390×844: .salary-inner flex-direction is column  [screenshot]
 * TC-24  CSS — .form-card .hs-button background is #FB9030 (Figma spec)
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets ────────────────────────────────────────────────────── */
const JS_CONTENT  = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const CSS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);

/* ── URLs ────────────────────────────────────────────────────────────────── */
const TARGET_URL        = 'https://www.financialprofessionals.org/home/afp--be-the-one-with-the-answers';
const AFP_REPORT_IMG_URL = 'https://www.financialprofessionals.org/images/default-source/2025-fp-a-forum-recap/inside-page-of-the-afp-comepnsation-report.png?sfvrsn=433bf36b_1';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const SALARY_SECTION = '.salary-section';
const SALARY_INNER   = '.salary-inner';
const SALARY_LEFT    = '.salary-left';
const SALARY_RIGHT   = '.salary-right';
const SALARY_BULLETS = '.salary-bullets';

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../afp19-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);
  try {
    await page.locator(
      '#onetrust-accept-btn-handler, button:has-text("Accept All"), button:has-text("Accept Cookies")'
    ).first().click({ timeout: 3000 });
  } catch { /* no consent banner */ }
}

async function injectVariation(page) {
  await page.evaluate((css) => {
    if (document.getElementById('afp19-var-css')) return;
    const s = document.createElement('style');
    s.id = 'afp19-var-css';
    s.textContent = css;
    document.head.appendChild(s);
  }, CSS_CONTENT);
  await page.evaluate(JS_CONTENT);
}

async function waitForVariation(page) {
  await page.waitForSelector(SALARY_SECTION, { state: 'attached', timeout: 8000 }).catch(() => {
    throw new Error('AFP19 .salary-section not found after JS injection — .finance-wrap may be missing');
  });
}

async function injectAndWait(page) {
  await injectVariation(page);
  await waitForVariation(page);
}

/* ── Test Suite ──────────────────────────────────────────────────────────── */
test.describe('AFP19 — AFP Compensation Survey Hero Section Replacement', () => {

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-01 | Control — .salary-section NOT present before injection
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-01 | Control — .salary-section NOT present before injection', async ({ page }, testInfo) => {
    await gotoAndWait(page, TARGET_URL);
    await page.waitForTimeout(5000);
    const count = await page.locator(SALARY_SECTION).count();
    expect(count, '.salary-section must NOT exist on page before variation code is injected').toBe(0);
    await page.screenshot({ path: path.join(SS_DIR, `control-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-02 | Variation — body.Try_Free_Cta_Hide class present
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-02 | Variation — body.Try_Free_Cta_Hide class present after injection', async ({ page }, testInfo) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const hasClass = await page.evaluate(() => document.body.classList.contains('Try_Free_Cta_Hide'));
    expect(hasClass, 'body must have Try_Free_Cta_Hide class after variation injection').toBe(true);
    await page.screenshot({ path: path.join(SS_DIR, `var-main-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-03 | Variation — .salary-section injected inside .finance-wrap
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-03 | Variation — .salary-section injected inside .finance-wrap', async ({ page }, testInfo) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const insideFinanceWrap = await page.evaluate(() => {
      const fw = document.querySelector('.finance-wrap');
      if (!fw) return false;
      return !!fw.querySelector('.salary-section');
    });
    expect(insideFinanceWrap, '.salary-section must be a descendant of .finance-wrap').toBe(true);
    try {
      const el = page.locator(SALARY_SECTION).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await el.screenshot({ path: path.join(SS_DIR, `salary-section-${testInfo.project.name}.png`) });
    } catch { /* skip element screenshot if element not capturable */ }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-04 | Variation — two-column layout present
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-04 | Variation — .salary-left and .salary-right columns both present', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const leftCount  = await page.locator(SALARY_LEFT).count();
    const rightCount = await page.locator(SALARY_RIGHT).count();
    expect(leftCount,  '.salary-left column must be present in the injected layout').toBeGreaterThan(0);
    expect(rightCount, '.salary-right column must be present in the injected layout').toBeGreaterThan(0);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-05 | Variation — h1 headline present in .salary-left
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-05 | Variation — h1 headline text is present in .salary-left', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector('.salary-left h1');
      return h1 ? h1.textContent.trim() : null;
    });
    expect(h1Text, 'h1 must exist inside .salary-left').not.toBeNull();
    expect(h1Text.length, 'h1 must have meaningful text content (>10 chars)').toBeGreaterThan(10);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-06 | Variation — h1 .highlight span contains "finance"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-06 | Variation — h1 .highlight span contains "finance" accent text', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const highlightText = await page.evaluate(() => {
      const el = document.querySelector('.salary-left h1 .highlight');
      return el ? el.textContent.trim() : null;
    });
    expect(highlightText, '.highlight span must exist inside .salary-left h1').not.toBeNull();
    expect(highlightText.toLowerCase(), '.highlight text must contain "finance"').toContain('finance');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-07 | Variation — description contains "5,000+"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-07 | Variation — .salary-desc contains "5,000+" data claim', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const descText = await page.evaluate(() => {
      const el = document.querySelector('.salary-desc');
      return el ? el.textContent : null;
    });
    expect(descText, '.salary-desc element must exist in the injected HTML').not.toBeNull();
    expect(descText, 'Description must contain "5,000+" data reference').toContain('5,000+');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-08 | Variation — exactly 3 bullet items in .salary-bullets
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-08 | Variation — exactly 3 bullet items in .salary-bullets', async ({ page }, testInfo) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const count = await page.locator(`${SALARY_BULLETS} li`).count();
    expect(count, '.salary-bullets must have exactly 3 <li> items per Figma spec').toBe(3);
    try {
      const el = page.locator(SALARY_BULLETS).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await el.screenshot({ path: path.join(SS_DIR, `bullets-${testInfo.project.name}.png`) });
    } catch { /* skip */ }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-09 | Variation — bullet 1 text
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-09 | Variation — bullet 1: "salary kept up with peers"', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const text = await page.evaluate(() => {
      const li = document.querySelectorAll('.salary-bullets li');
      return li[0] ? li[0].textContent : null;
    });
    expect(text, 'Bullet 1 must exist').not.toBeNull();
    expect(text, 'Bullet 1 must contain "salary kept up with peers"').toContain('salary kept up with peers');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-10 | Variation — bullet 2 text
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-10 | Variation — bullet 2: "bonuses differ across finance roles"', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const text = await page.evaluate(() => {
      const li = document.querySelectorAll('.salary-bullets li');
      return li[1] ? li[1].textContent : null;
    });
    expect(text, 'Bullet 2 must exist').not.toBeNull();
    expect(text, 'Bullet 2 must contain "bonuses differ across finance roles"').toContain('bonuses differ across finance roles');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-11 | Variation — bullet 3 text
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-11 | Variation — bullet 3: "certifications are linked to real salary premiums"', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const text = await page.evaluate(() => {
      const li = document.querySelectorAll('.salary-bullets li');
      return li[2] ? li[2].textContent : null;
    });
    expect(text, 'Bullet 3 must exist').not.toBeNull();
    expect(text, 'Bullet 3 must contain "certifications are linked"').toContain('certifications are linked');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-12 | Variation — .check-icon with SVG present in all bullet items
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-12 | Variation — .check-icon with SVG polyline present in all 3 bullets', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const checks = await page.evaluate(() => {
      const items = document.querySelectorAll('.salary-bullets li');
      return Array.from(items).map((li, i) => ({
        index:   i,
        hasIcon: !!li.querySelector('.check-icon'),
        hasSvg:  !!li.querySelector('.check-icon svg'),
      }));
    });
    expect(checks.length, 'Must have 3 bullet items to check').toBe(3);
    for (const c of checks) {
      expect(c.hasIcon, `Bullet ${c.index + 1} must have .check-icon element`).toBe(true);
      expect(c.hasSvg,  `Bullet ${c.index + 1} must have SVG inside .check-icon`).toBe(true);
    }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-13 | Variation — AFP compensation report image in .salary-right
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-13 | Variation — AFP compensation report image in .salary-right', async ({ page }, testInfo) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const imgSrc = await page.evaluate(() => {
      const img = document.querySelector('.salary-right .doc-image-wrap img');
      return img ? img.getAttribute('src') : null;
    });
    expect(imgSrc, '.doc-image-wrap img must exist in .salary-right').not.toBeNull();
    expect(imgSrc, 'Image src must reference AFP compensation report asset').toContain('afp-comepnsation-report');
    try {
      const el = page.locator('.salary-right').first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await el.screenshot({ path: path.join(SS_DIR, `salary-image-${testInfo.project.name}.png`) });
    } catch { /* skip */ }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-14 | Variation — AFP report image URL returns HTTP 200
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-14 | Variation — AFP report image URL returns HTTP 200', async ({ request }) => {
    const resp = await request.get(AFP_REPORT_IMG_URL, { timeout: 20000 }).catch(() => null);
    if (!resp) { test.skip(); return; }
    expect(resp.status(), `AFP report image must return HTTP 200 — got ${resp.status()}`).toBe(200);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-15 | No duplication — second JS injection does not create second section
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-15 | No Duplication — second JS injection does not create second .salary-section', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const countBefore = await page.locator(SALARY_SECTION).count();
    await page.evaluate(JS_CONTENT);
    await page.waitForTimeout(2000);
    const countAfter = await page.locator(SALARY_SECTION).count();
    expect(countAfter, `Section count must remain at ${countBefore} after second JS execution`).toBe(countBefore);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-16 | CSS — .salary-section computed display is flex
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-16 | CSS — .salary-section computed display is flex', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const display = await page.evaluate(() => {
      const el = document.querySelector('.salary-section');
      return el ? window.getComputedStyle(el).display : null;
    });
    expect(display, '.salary-section element must exist').not.toBeNull();
    expect(display, '.salary-section must have display:flex').toBe('flex');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-17 | CSS — .salary-left max-width is 665px (Figma spec)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-17 | CSS — .salary-left max-width is 665px (Figma spec)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const maxWidth = await page.evaluate(() => {
      const el = document.querySelector('.salary-left');
      return el ? window.getComputedStyle(el).maxWidth : null;
    });
    expect(maxWidth, '.salary-left element must exist').not.toBeNull();
    expect(maxWidth, '.salary-left max-width must be 665px per Figma spec').toBe('665px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-18 | CSS — h1 .highlight color is #f07c2a orange
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-18 | CSS — h1 .highlight color is rgb(240, 124, 42) (#f07c2a orange)', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const color = await page.evaluate(() => {
      const el = document.querySelector('.salary-left h1 .highlight');
      return el ? window.getComputedStyle(el).color : null;
    });
    expect(color, '.highlight span must exist in .salary-left h1').not.toBeNull();
    expect(color, '.highlight color must be #f07c2a — rgb(240, 124, 42)').toBe('rgb(240, 124, 42)');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-19 | CSS — bullet list item text color is white
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-19 | CSS — .salary-bullets li text color is white rgb(255, 255, 255)', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const color = await page.evaluate(() => {
      const li = document.querySelector('.salary-bullets li');
      return li ? window.getComputedStyle(li).color : null;
    });
    expect(color, '.salary-bullets li must exist').not.toBeNull();
    expect(color, 'Bullet list text must be white — rgb(255, 255, 255)').toBe('rgb(255, 255, 255)');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-20 | CSS — .doc-image-wrap img has CSS transform (rotation)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-20 | CSS — .doc-image-wrap img has CSS transform (rotation) applied', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const transform = await page.evaluate(() => {
      const img = document.querySelector('.doc-image-wrap img');
      return img ? window.getComputedStyle(img).transform : null;
    });
    expect(transform, '.doc-image-wrap img must exist').not.toBeNull();
    expect(transform, '.doc-image-wrap img must have a CSS transform (rotate(-4deg)) applied').not.toBe('none');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-21 | Responsive — Desktop 1280×800: .salary-section visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-21 | Responsive — Desktop 1280×800: .salary-section visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const el = page.locator(SALARY_SECTION).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-desktop-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-22 | Responsive — Tablet 768×1024: .salary-section visible
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-22 | Responsive — Tablet 768×1024: .salary-section visible', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const el = page.locator(SALARY_SECTION).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible();
    await page.screenshot({ path: path.join(SS_DIR, `responsive-tablet-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-23 | Responsive — Mobile 390×844: .salary-inner flex-direction column
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-23 | Responsive — Mobile 390×844: .salary-inner flex-direction is column', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    const flexDir = await page.evaluate(() => {
      const el = document.querySelector('.salary-inner');
      return el ? window.getComputedStyle(el).flexDirection : null;
    });
    expect(flexDir, '.salary-inner must exist at mobile viewport').not.toBeNull();
    expect(flexDir, '.salary-inner flex-direction must be column at ≤900px mobile breakpoint').toBe('column');
    await page.screenshot({ path: path.join(SS_DIR, `responsive-mobile-${testInfo.project.name}.png`), fullPage: false });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-24 | CSS — form button background is #FB9030 (Figma spec)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-24 | CSS — .form-card .hs-button background is #FB9030 (Figma spec)', async ({ page }) => {
    await gotoAndWait(page, TARGET_URL);
    await injectAndWait(page);
    // Wait up to 5s for HubSpot to render its button inside .form-card
    await page.waitForSelector('.form-card .hs-button, .form-card .hs-submit input[type=submit]', { timeout: 5000 }).catch(() => {});
    const bgColor = await page.evaluate(() => {
      // Only match within .form-card scope — avoids false-positive from HubSpot ID-scoped rule
      const el =
        document.querySelector('.form-card .hs-button') ||
        document.querySelector('.form-card .hs-submit input[type=submit]');
      return el ? window.getComputedStyle(el).backgroundColor : null;
    });
    if (!bgColor) { test.skip(); return; }
    // #FB9030 = rgb(251, 144, 48)
    expect(bgColor, 'Submit button within .form-card must have background #FB9030 — rgb(251, 144, 48)').toBe('rgb(251, 144, 48)');
  });

});
