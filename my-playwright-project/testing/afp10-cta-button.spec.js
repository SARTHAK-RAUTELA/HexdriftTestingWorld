// @ts-check
/**
 * AFP10 — Navigation CTA Button A/B Test
 * Control : vB.js + vB.css  — "Register for FP&A Forum" (single-line orange button)
 * Variation: js.js + hello.css — "REGISTER FOR AFP 2026 / Early pricing ends June 26" (two-line)
 * Site    : www.financialprofessionals.org (sitewide)
 * Audience: Desktop only (variation button hidden via CSS at max-width ≤1199px)
 * Browsers: Chrome, Firefox, Edge, Safari (Desktop) + Mobile Chrome / Mobile Safari
 *
 * Test coverage:
 *  - DOM injection (body class, button element count)
 *  - Button position (before Join AFP link)
 *  - Content (text, href)
 *  - Styles (background color, flex-direction, font sizes)
 *  - Join AFP text change
 *  - Duplicate-init guard
 *  - Sitewide (inner page)
 *  - Responsive breakpoint (hidden ≤1199px, visible ≥1200px)
 *  - Visual screenshots for report
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/* ── Load variation assets ──────────────────────────────────────────────── */
const CSS_CONTROL = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);
const JS_CONTROL = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const CSS_VARIATION = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/hello.css'), 'utf8'
);
const JS_VARIATION = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/js.js'), 'utf8'
);

const AFP_BASE = 'https://www.financialprofessionals.org';
const SS_DIR   = path.join(__dirname, '../afp10-screenshots');

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Mock page: minimal AFP header with #global-login structure ─────────── */
const MOCK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AFP - Association for Financial Professionals</title>
  <style>
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#fff; }
    #afp-site-header { display:flex; justify-content:flex-end; align-items:center; padding:12px 24px; background:#fff; border-bottom:1px solid #e5e5e5; box-shadow:0 1px 4px rgba(0,0,0,.08); }
    .global-login { display:flex; align-items:center; gap:8px; }
    .global-login__link { display:inline-flex; align-items:center; padding:8px 14px; text-decoration:none; color:#333; font-size:14px; letter-spacing:.5px; }
    .global-login__link--join { background:#005DAA; color:#fff; }
    .global-login__link--login { background:transparent; color:#005DAA; border:1px solid #005DAA; }
    main { padding:48px 24px; }
    h1 { font-size:28px; color:#1a1a1a; }
  </style>
</head>
<body>
  <header id="afp-site-header">
    <nav id="global-login" class="global-login">
      <a class="global-login__link global-login__link--join" href="https://www.afponline.org/join">
        <span class="global-login__link-text">Join AFP</span>
      </a>
      <a class="global-login__link global-login__link--login" href="#">LOGIN</a>
    </nav>
    <nav id="global-logout" style="display:none">
      <a class="global-login__link" href="#">Logout</a>
    </nav>
  </header>
  <main>
    <h1>Association for Financial Professionals</h1>
    <p>The premier professional association for treasury, finance, and accounting professionals.</p>
  </main>
</body>
</html>`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function mockAFP(page) {
  await page.route(`${AFP_BASE}/**`, route =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: MOCK_HTML })
  );
}

async function injectControl(page) {
  await page.addStyleTag({ content: CSS_CONTROL });
  await page.evaluate(JS_CONTROL);
  await page.waitForTimeout(300);
}

async function injectVariation(page) {
  await page.addStyleTag({ content: CSS_VARIATION });
  await page.evaluate(JS_VARIATION);
  await page.waitForTimeout(300);
}

async function isDesktop(page) {
  const vp = page.viewportSize();
  return vp !== null && vp.width > 1199;
}

async function saveScreenshot(page, name, browserName) {
  const fp = path.join(SS_DIR, `${name}-${browserName}.png`);
  await page.screenshot({ path: fp, fullPage: false });
}

/* ══════════════════════════════════════════════════════════════════════════
 * SUITE: AFP10 — Navigation CTA Button A/B Test
 * ══════════════════════════════════════════════════════════════════════════ */
test.describe('AFP10 — Navigation CTA Button A/B Test', () => {

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  SECTION 1 — CONTROL (vB.js + vB.css)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  test('TC-01 | Control DOM — Body receives class "cre-t-10" after init', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-10/);
  });

  test('TC-02 | Control DOM — Button .cre-t-10-reg injected exactly once', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveCount(1);
  });

  test('TC-03 | Control DOM — Button inserted BEFORE the Join AFP link in DOM order', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    const order = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('#global-login .global-login__link'));
      const regIdx  = links.findIndex(el => el.classList.contains('cre-t-10-reg'));
      const joinIdx = links.findIndex(el => el.classList.contains('global-login__link--join'));
      return { regIdx, joinIdx };
    });
    expect(order.regIdx).toBeGreaterThanOrEqual(0);
    expect(order.joinIdx).toBeGreaterThanOrEqual(0);
    expect(order.regIdx).toBeLessThan(order.joinIdx);
  });

  test('TC-04 | Control Content — Button text is "Register for FP&A Forum"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toContainText('Register for FP&A Forum');
  });

  test('TC-05 | Control Content — Button has NO .cre-t-10-reg-text2 span (single-line only)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    await expect(page.locator('.cre-t-10-reg-text2')).toHaveCount(0);
  });

  test('TC-06 | Control Content — Join AFP link text changed to "JOIN AFP"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    const joinText = await page.locator(
      '#global-login .global-login__link--join .global-login__link-text'
    ).textContent();
    expect(joinText?.trim()).toBe('JOIN AFP');
  });

  test('TC-07 | Control Style — Button background is orange rgb(247, 146, 29)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    const bg = await page.evaluate(() => {
      const el = document.querySelector('#global-login .cre-t-10-reg');
      return el ? window.getComputedStyle(el).backgroundColor : '';
    });
    expect(bg).toBe('rgb(247, 146, 29)');
  });

  test('TC-08 | Control Link — Button href points to conference.financialprofessionals.org/', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveAttribute(
      'href', 'https://conference.financialprofessionals.org/'
    );
  });

  test('TC-09 | Control Sitewide — Button also appears on an inner page (/membership)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(`${AFP_BASE}/membership`);
    await injectControl(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveCount(1);
    await expect(page.locator('#global-login .cre-t-10-reg')).toContainText('Register for FP&A Forum');
  });

  test('TC-10 | Control Duplicate — Button NOT injected twice on double init', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);
    await injectControl(page); // second call must be a no-op (body already has cre-t-10)

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveCount(1);
  });

  test('TC-11 | Control Screenshot — Visual reference captured at desktop', async ({ page, browserName }) => {
    if (!(await isDesktop(page))) test.skip();
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectControl(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toBeVisible();
    await saveScreenshot(page, 'control-desktop', browserName);
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  SECTION 2 — VARIATION (js.js + hello.css)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  test('TC-12 | Variation DOM — Body receives class "cre-t-10" after init', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-10/);
  });

  test('TC-13 | Variation DOM — Button .cre-t-10-reg injected exactly once', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveCount(1);
  });

  test('TC-14 | Variation DOM — Button inserted BEFORE the Join AFP link in DOM order', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const order = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('#global-login .global-login__link'));
      const regIdx  = links.findIndex(el => el.classList.contains('cre-t-10-reg'));
      const joinIdx = links.findIndex(el => el.classList.contains('global-login__link--join'));
      return { regIdx, joinIdx };
    });
    expect(order.regIdx).toBeGreaterThanOrEqual(0);
    expect(order.joinIdx).toBeGreaterThanOrEqual(0);
    expect(order.regIdx).toBeLessThan(order.joinIdx);
  });

  test('TC-15 | Variation Content — Text1 span present with "REGISTER FOR AFP 2026"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    // Scoped to #global-login — addButton() also inserts in #global-logout, giving 2 global matches
    await expect(page.locator('#global-login .cre-t-10-reg .cre-t-10-reg-text1')).toHaveCount(1);
    await expect(page.locator('#global-login .cre-t-10-reg .cre-t-10-reg-text1')).toContainText('REGISTER FOR AFP 2026');
  });

  test('TC-16 | Variation Content — Text2 span present with "Early pricing ends June 26"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    // Scoped to #global-login — same reason as TC-15
    await expect(page.locator('#global-login .cre-t-10-reg .cre-t-10-reg-text2')).toHaveCount(1);
    await expect(page.locator('#global-login .cre-t-10-reg .cre-t-10-reg-text2')).toContainText('Early pricing ends June 26');
  });

  test('TC-17 | Variation Content — Join AFP link text changed to "JOIN AFP"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const joinText = await page.locator(
      '#global-login .global-login__link--join .global-login__link-text'
    ).textContent();
    expect(joinText?.trim()).toBe('JOIN AFP');
  });

  test('TC-18 | Variation Style — Button background is orange rgb(247, 146, 29)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const bg = await page.evaluate(() => {
      const el = document.querySelector('#global-login .cre-t-10-reg');
      return el ? window.getComputedStyle(el).backgroundColor : '';
    });
    expect(bg).toBe('rgb(247, 146, 29)');
  });

  test('TC-19 | Variation Style — Button uses flex-direction: column (two-line layout)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const flexDir = await page.evaluate(() => {
      const el = document.querySelector('#global-login .cre-t-10-reg');
      return el ? window.getComputedStyle(el).flexDirection : '';
    });
    expect(flexDir).toBe('column');
  });

  test('TC-20 | Variation Link — Button href points to conference.financialprofessionals.org/', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveAttribute(
      'href', 'https://conference.financialprofessionals.org/'
    );
  });

  test('TC-21 | Variation Responsive — Button HIDDEN at 375px mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const display = await page.evaluate(() => {
      const el = document.querySelector('#global-login .cre-t-10-reg');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display).toBe('none');
  });

  test('TC-22 | Variation Responsive — Button HIDDEN at 1199px breakpoint edge', async ({ page }) => {
    await page.setViewportSize({ width: 1199, height: 800 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const display = await page.evaluate(() => {
      const el = document.querySelector('#global-login .cre-t-10-reg');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display).toBe('none');
  });

  test('TC-23 | Variation Responsive — Button VISIBLE at 1200px (just above breakpoint)', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    const display = await page.evaluate(() => {
      const el = document.querySelector('#global-login .cre-t-10-reg');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display).not.toBe('none');
    expect(display).toBeTruthy();
  });

  test('TC-24 | Variation Duplicate — Button NOT injected twice on double init', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);
    await injectVariation(page); // second call must be a no-op (body already has cre-t-10)

    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveCount(1);
  });

  test('TC-25 | Variation Screenshot — Visual reference captured at desktop', async ({ page, browserName }) => {
    if (!(await isDesktop(page))) test.skip();
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    await expect(page.locator('#global-login .cre-t-10-reg')).toBeVisible();
    await saveScreenshot(page, 'variation-desktop', browserName);
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  SECTION 3 — MOBILE SCREENSHOT
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  test('TC-26 | Variation Mobile Screenshot — Button hidden state at 375px', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await injectVariation(page);

    // Button exists in DOM but is CSS-hidden (display:none)
    await expect(page.locator('#global-login .cre-t-10-reg')).toHaveCount(1);
    await saveScreenshot(page, 'variation-mobile-hidden', browserName);
  });

});
