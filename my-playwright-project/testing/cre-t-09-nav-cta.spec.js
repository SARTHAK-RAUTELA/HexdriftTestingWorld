// @ts-check
/**
 * CRE-T-09 — pay.com.au — Navbar CTA "Create free account"
 *
 * Variation (vB.js / vB.css): Changes the primary navbar CTA button copy from
 * "Get started" to "Create free account" across:
 *   • Desktop nav        (.pca-header .pay-new-nav .nav-actions .emp)
 *   • Mobile sticky CTA  (.pca-header .nav-links .sticky-get-started #mob-get-started)
 *   • Mobile hamburger   (#pay-new-nav .nav-mobile-cta)
 *   • Footer pane CTAs   (a.pane-footer-cta[href*="register"])
 *
 * Technique: font-size:0 hides original text; CSS ::before { content:'Create free account' }
 * renders the new copy — no DOM mutation, so href/tracking are fully preserved.
 *
 * Coexistence: when PAY05 (CRE-T-05) also runs, the variation adds body.cre-t-05 and adjusts
 * nav-link font-sizes responsively (15px @ 1199px / 17px @ 1310px / 18px @ 1450px).
 *
 * Scope:    Sitewide (all pages)
 * Audience: All users
 *
 * Variation preview URL:
 *   https://pay.com.au/?optimizely_x=5244519875084288&optimizely_force_tracking=true&cre=qa
 *
 * TC-01  body.cre-t-09 class added after variation injection
 * TC-02  Desktop CTA ::before content = "Create free account"                      [screenshot]
 * TC-03  Desktop CTA element font-size = 0px (original text hidden)
 * TC-04  Desktop CTA href contains "register" (destination URL preserved)
 * TC-05  Desktop CTA has display:flex and align-items:center
 * TC-06  Mobile sticky CTA (#mob-get-started) ::before = "Create free account"     [screenshot]
 * TC-07  Mobile sticky CTA href contains "register" (URL preserved)
 * TC-08  Mobile hamburger CTA (.nav-mobile-cta) ::before = "Create free account"   [screenshot]
 * TC-09  Mobile hamburger CTA href contains "register" (URL preserved)
 * TC-10  Footer pane CTA ::before = "Create free account"
 * TC-11  Footer pane CTA href contains "register" (URL preserved)
 * TC-12  Sitewide — How It Works page: desktop CTA text changed
 * TC-13  Sitewide — Pricing page: desktop CTA text changed
 * TC-14  Sitewide — Solutions page: desktop CTA text changed
 * TC-15  PAY05 coexistence — nav-link font-size = 15px at 1199px when cre-t-05 active
 * TC-16  CSS guard — removing body.cre-t-09 reverts ::before content
 * TC-17  No uncaught JS errors thrown by variation code
 * TC-18  Desktop CTA ::before font-size = 16px
 * TC-19  Footer CTA ::before font-size = 15px
 * TC-20  Mobile 390×844 — sticky CTA ::before correct, full viewport screenshot    [screenshot]
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Variation assets ─────────────────────────────────────────────────────── */
const VB_JS  = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/vB.js'),  'utf8');
const VB_CSS = fs.readFileSync(path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8');

/* ── URLs ────────────────────────────────────────────────────────────────── */
const BASE_URL = 'https://pay.com.au/?cre=qa';

/* ── Selectors ───────────────────────────────────────────────────────────── */
const DESKTOP_CTA  = '.pca-header .pay-new-nav .nav-actions .emp';
const MOB_STICKY   = '.pca-header .nav-links .sticky-get-started #mob-get-started';
const MOB_MENU_CTA = '#pay-new-nav .nav-mobile-cta';
const FOOTER_CTA   = 'a.pane-footer-cta[href*="register"]';
const NAV_TTL      = '.pca-header .nav-links ul .header-ttl';

/* ── Expected values ─────────────────────────────────────────────────────── */
const EXPECTED_COPY = 'Create free account';

/* ── Screenshots dir ─────────────────────────────────────────────────────── */
const SS_DIR = path.join(__dirname, '../cre-t-09-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function gotoAndInject(page, url = BASE_URL) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  try {
    await page.locator(
      '[id*="cookie"] button, .cmplz-accept, #accept-cookies, ' +
      '[class*="consent"] button:has-text("Accept"), ' +
      'button:has-text("Accept All"), button:has-text("Accept Cookies")'
    ).first().click({ timeout: 3000 });
  } catch { /* no banner */ }

  try { await page.addStyleTag({ content: VB_CSS }); } catch (e) {
    if (!e.message?.includes('Content-Security-Policy') && !e.message?.includes('violates')) throw e;
  }
  try { await page.addScriptTag({ content: VB_JS }); } catch (e) {
    if (!e.message?.includes('Content-Security-Policy') && !e.message?.includes('violates')) throw e;
  }

  // Verify class applied; retry once if a CDN CSP race silently dropped the script
  await page.waitForFunction(() => document.body.classList.contains('cre-t-09'), { timeout: 3000 })
    .catch(async () => {
      try { await page.addStyleTag({ content: VB_CSS }); } catch { /* ok */ }
      try { await page.addScriptTag({ content: VB_JS }); } catch { /* ok */ }
      await page.waitForFunction(() => document.body.classList.contains('cre-t-09'), { timeout: 5000 });
    });
}

async function getBeforeContent(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return window.getComputedStyle(el, '::before').content;
  }, selector);
}

async function getBeforeFontSize(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return window.getComputedStyle(el, '::before').fontSize;
  }, selector);
}

/* ── Test Suite ──────────────────────────────────────────────────────────── */

test.describe('CRE-T-09 — pay.com.au — Navbar CTA "Create free account"', () => {

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-01 | body.cre-t-09 class added after injection
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-01 | body.cre-t-09 class added after variation injection', async ({ page }) => {
    await gotoAndInject(page);
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-09'));
    expect(hasClass, 'body must carry class cre-t-09 after injection').toBe(true);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-02 | Desktop CTA ::before content = "Create free account"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-02 | Desktop CTA ::before content = "Create free account"', async ({ page }, testInfo) => {
    await gotoAndInject(page);
    const ctaExists = await page.$(DESKTOP_CTA);
    if (!ctaExists) { test.skip(); return; } // desktop nav not rendered on mobile UA
    const content = await getBeforeContent(page, DESKTOP_CTA);
    expect(content, `Desktop CTA ::before must be "${EXPECTED_COPY}"`).toBe(`"${EXPECTED_COPY}"`);
    try { await page.screenshot({ path: path.join(SS_DIR, `tc02-desktop-cta-${testInfo.project.name}.png`) }); } catch { /* non-fatal */ }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-03 | Desktop CTA font-size = 0px (original "Get started" text hidden)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-03 | Desktop CTA element font-size = 0px (original text hidden)', async ({ page }) => {
    await gotoAndInject(page);
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    const fontSize = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? window.getComputedStyle(el).fontSize : null;
    }, DESKTOP_CTA);
    expect(fontSize, 'Desktop CTA font-size must be 0px so original "Get started" is invisible').toBe('0px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-04 | Desktop CTA href contains "register" (destination URL preserved)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-04 | Desktop CTA href contains "register" (URL preserved)', async ({ page }) => {
    await gotoAndInject(page);
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    const href = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el.href || el.getAttribute('href') || '') : null;
    }, DESKTOP_CTA);
    expect(href, 'Desktop CTA href must be non-null').not.toBeNull();
    expect(href, 'Desktop CTA href must contain "register" — destination must not change').toContain('register');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-05 | Desktop CTA has display:flex and align-items:center
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-05 | Desktop CTA has display:flex and align-items:center', async ({ page }) => {
    await gotoAndInject(page);
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    const styles = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return { display: cs.display, alignItems: cs.alignItems };
    }, DESKTOP_CTA);
    expect(styles, 'Desktop CTA element must exist').not.toBeNull();
    expect(styles.display,    'Desktop CTA must be display:flex').toBe('flex');
    expect(styles.alignItems, 'Desktop CTA must be align-items:center').toBe('center');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-06 | Mobile sticky CTA (#mob-get-started) ::before = "Create free account"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-06 | Mobile sticky CTA ::before = "Create free account"', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndInject(page);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), MOB_STICKY);
    if (!exists) { test.skip(); return; }
    const content = await getBeforeContent(page, MOB_STICKY);
    expect(content, `Mobile sticky CTA ::before must be "${EXPECTED_COPY}"`).toBe(`"${EXPECTED_COPY}"`);
    try { await page.screenshot({ path: path.join(SS_DIR, `tc06-mob-sticky-${testInfo.project.name}.png`) }); } catch { /* non-fatal */ }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-07 | Mobile sticky CTA href contains "register" (URL preserved)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-07 | Mobile sticky CTA href contains "register" (URL preserved)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndInject(page);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), MOB_STICKY);
    if (!exists) { test.skip(); return; }
    const href = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el.href || el.getAttribute('href') || '') : null;
    }, MOB_STICKY);
    expect(href, 'Mobile sticky CTA href must contain "register"').toContain('register');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-08 | Mobile hamburger CTA (.nav-mobile-cta) ::before = "Create free account"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-08 | Mobile hamburger CTA ::before = "Create free account"', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndInject(page);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), MOB_MENU_CTA);
    if (!exists) { test.skip(); return; }
    // getComputedStyle works on hidden elements — no need to open the menu for the CSS check
    const content = await getBeforeContent(page, MOB_MENU_CTA);
    expect(content, `Mobile hamburger CTA ::before must be "${EXPECTED_COPY}"`).toBe(`"${EXPECTED_COPY}"`);
    // Attempt to open the mobile menu for a visual screenshot
    try {
      await page.locator(
        'button[aria-label*="menu" i], .nav-hamburger, .hamburger-btn, ' +
        '[class*="hamburger"] button, .mobile-menu-btn, .nav-mobile-toggle, ' +
        '[data-action="toggle-menu"], button.nav-icon'
      ).first().click({ timeout: 3000 });
      await page.waitForTimeout(800);
    } catch { /* hamburger selector not matched — skip menu open */ }
    try { await page.screenshot({ path: path.join(SS_DIR, `tc08-mob-menu-${testInfo.project.name}.png`) }); } catch { /* non-fatal */ }
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-09 | Mobile hamburger CTA href contains "register" (URL preserved)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-09 | Mobile hamburger CTA href contains "register" (URL preserved)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndInject(page);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), MOB_MENU_CTA);
    if (!exists) { test.skip(); return; }
    const href = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el.href || el.getAttribute('href') || '') : null;
    }, MOB_MENU_CTA);
    expect(href, 'Mobile hamburger CTA href must contain "register"').toContain('register');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-10 | Footer pane CTA ::before = "Create free account"
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-10 | Footer pane CTA ::before = "Create free account"', async ({ page }) => {
    await gotoAndInject(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), FOOTER_CTA);
    if (!exists) { test.skip(); return; }
    const content = await getBeforeContent(page, FOOTER_CTA);
    expect(content, `Footer pane CTA ::before must be "${EXPECTED_COPY}"`).toBe(`"${EXPECTED_COPY}"`);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-11 | Footer pane CTA href contains "register" (URL preserved)
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-11 | Footer pane CTA href contains "register" (URL preserved)', async ({ page }) => {
    await gotoAndInject(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), FOOTER_CTA);
    if (!exists) { test.skip(); return; }
    const href = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el.href || el.getAttribute('href') || '') : null;
    }, FOOTER_CTA);
    expect(href, 'Footer pane CTA href must contain "register" — destination must not change').toContain('register');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-12 | Sitewide — How It Works page: desktop CTA text changed
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-12 | Sitewide — How It Works page: desktop CTA text changed', async ({ page }) => {
    await gotoAndInject(page, 'https://pay.com.au/how-it-works/?cre=qa');
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    await page.waitForFunction((sel) => {
      const el = document.querySelector(sel);
      if (!el) return true;
      return window.getComputedStyle(el, '::before').content === '"Create free account"';
    }, DESKTOP_CTA, { timeout: 10000 }).catch(() => {});
    const content = await getBeforeContent(page, DESKTOP_CTA);
    expect(content, 'How It Works page desktop CTA must show "Create free account"').toBe(`"${EXPECTED_COPY}"`);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-13 | Sitewide — Pricing page: desktop CTA text changed
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-13 | Sitewide — Pricing page: desktop CTA text changed', async ({ page }) => {
    await gotoAndInject(page, 'https://pay.com.au/pricing/?cre=qa');
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    await page.waitForFunction((sel) => {
      const el = document.querySelector(sel);
      if (!el) return true;
      return window.getComputedStyle(el, '::before').content === '"Create free account"';
    }, DESKTOP_CTA, { timeout: 10000 }).catch(() => {});
    const content = await getBeforeContent(page, DESKTOP_CTA);
    expect(content, 'Pricing page desktop CTA must show "Create free account"').toBe(`"${EXPECTED_COPY}"`);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-14 | Sitewide — Solutions page: desktop CTA text changed
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-14 | Sitewide — Solutions page: desktop CTA text changed', async ({ page }) => {
    await gotoAndInject(page, 'https://pay.com.au/solutions/?cre=qa');
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    await page.waitForFunction((sel) => {
      const el = document.querySelector(sel);
      if (!el) return true;
      return window.getComputedStyle(el, '::before').content === '"Create free account"';
    }, DESKTOP_CTA, { timeout: 10000 }).catch(() => {});
    const content = await getBeforeContent(page, DESKTOP_CTA);
    expect(content, 'Solutions page desktop CTA must show "Create free account"').toBe(`"${EXPECTED_COPY}"`);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-15 | PAY05 coexistence — nav-link font-size = 15px at 1199px viewport
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-15 | PAY05 coexistence — nav font-size = 15px at 1199px when cre-t-05 active', async ({ page }) => {
    await page.setViewportSize({ width: 1199, height: 800 });
    await gotoAndInject(page);
    // Simulate PAY05 being active by adding the body class the variation listens for
    await page.evaluate(() => document.body.classList.add('cre-t-05'));
    await page.waitForTimeout(200); // CSS reflow
    const navFontSize = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? window.getComputedStyle(el).fontSize : null;
    }, NAV_TTL);
    // At 1199px with both cre-t-09 + cre-t-05, the CSS sets nav links to 15px
    if (navFontSize === null) { test.skip(); return; }
    expect(navFontSize, 'Nav link font-size must be 15px at 1199px when PAY05 is coactive').toBe('15px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-16 | CSS guard — removing body.cre-t-09 reverts ::before content
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-16 | CSS guard — removing body.cre-t-09 reverts ::before content', async ({ page }) => {
    // Block Optimizely CDN to isolate our local vB.css scoping from live CDN interference
    await page.route('**/cdn.optimizely.com/**', route => route.abort());
    await page.route('**/logx.optimizely.com/**', route => route.abort());
    await gotoAndInject(page);
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; } // desktop nav not rendered on mobile UA
    // Confirm applied
    const withClass = await getBeforeContent(page, DESKTOP_CTA);
    expect(withClass, 'With body.cre-t-09, ::before must be "Create free account"').toBe(`"${EXPECTED_COPY}"`);
    // Remove class — poll until CSS reverts (covers WebKit/Edge reflow latency)
    await page.evaluate(() => document.body.classList.remove('cre-t-09'));
    await page.waitForFunction((sel) => {
      const el = document.querySelector(sel);
      if (!el) return true;
      return window.getComputedStyle(el, '::before').content !== '"Create free account"';
    }, DESKTOP_CTA, { timeout: 3000 }).catch(() => {});
    const withoutClass = await getBeforeContent(page, DESKTOP_CTA);
    expect(withoutClass, 'Without body.cre-t-09 class, ::before must revert (not "Create free account")').not.toBe(`"${EXPECTED_COPY}"`);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-17 | No uncaught JS errors thrown by variation code
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-17 | No uncaught JS errors thrown by variation code', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await gotoAndInject(page);
    await page.waitForTimeout(2000);
    const creTErrors = errors.filter(e =>
      e.includes('cre-t-09') ||
      (e.includes('null') && (e.includes('classList') || e.includes('querySelector')))
    );
    expect(creTErrors, 'No uncaught JS errors from variation code').toHaveLength(0);
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-18 | Desktop CTA ::before font-size = 16px
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-18 | Desktop CTA ::before font-size = 16px', async ({ page }) => {
    await gotoAndInject(page);
    if (!await page.$(DESKTOP_CTA)) { test.skip(); return; }
    const fontSize = await getBeforeFontSize(page, DESKTOP_CTA);
    expect(fontSize, 'Desktop CTA ::before font-size must be 16px per CSS design').toBe('16px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-19 | Footer CTA ::before font-size = 15px
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-19 | Footer CTA ::before font-size = 15px (desktop only — mobile overrides to 16px)', async ({ page }) => {
    await gotoAndInject(page);
    // The CSS sets footer ::before to 15px on desktop, but the @media(max-width:1198px) rule
    // overrides to 16px on mobile. Skip mobile viewports to avoid a false failure.
    const vp = page.viewportSize();
    if (vp && vp.width < 1199) { test.skip(); return; }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), FOOTER_CTA);
    if (!exists) { test.skip(); return; }
    const fontSize = await getBeforeFontSize(page, FOOTER_CTA);
    expect(fontSize, 'Footer CTA ::before font-size must be 15px on desktop').toBe('15px');
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * TC-20 | Mobile 390×844 — sticky CTA ::before correct, full viewport screenshot
   * ────────────────────────────────────────────────────────────────────────── */
  test('TC-20 | Mobile 390×844 — sticky CTA ::before correct and body class present', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAndInject(page);
    // Verify body class
    const hasClass = await page.evaluate(() => document.body.classList.contains('cre-t-09'));
    expect(hasClass, 'body must carry cre-t-09 on mobile viewport').toBe(true);
    // Verify mobile sticky CTA if in DOM
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), MOB_STICKY);
    if (exists) {
      const content = await getBeforeContent(page, MOB_STICKY);
      expect(content, `Mobile sticky CTA ::before must be "${EXPECTED_COPY}" at 390px`).toBe(`"${EXPECTED_COPY}"`);
    }
    try { await page.screenshot({ path: path.join(SS_DIR, `tc20-mobile-390-${testInfo.project.name}.png`) }); } catch { /* non-fatal */ }
  });

});
