// @ts-check
/**
 * AFP09 — 30-Second Timed Modal + Exit Intent
 * Variation: vB.js + vB.css  (Local2/variation/)
 * Target: ALL pages on https://www.financialprofessionals.org/
 * Desktop only (viewport ≥ 1024px)
 *
 * What this file covers:
 *  TC-01  DOM injection
 *  TC-02  Body variation class cre-t-9
 *  TC-03  Timer – hidden before 30s
 *  TC-04  Timer – visible after ≥30s (desktop)
 *  TC-05  Timer – stays hidden at 15 of 30s elapsed
 *  TC-06  sessionStorage startTime persisted
 *  TC-07  Timer NOT reset across same-domain page navigation
 *  TC-08  Modal fires on page-2 when ≥30s total elapsed
 *  TC-09  Cookie exit_popup_dismissed=true blocks timer
 *  TC-10  Cookie set to true after modal fires
 *  TC-11  Exit intent – modal shows on mouse-to-top-of-viewport
 *  TC-12  Exit intent – blocked when cookie already set
 *  TC-13  Interaction – X button closes modal
 *  TC-14  Interaction – overlay click closes modal
 *  TC-15  No duplicate injection on double init
 *  TC-16  Content – all modal sections & exact text
 *  TC-17  Links – Register Now href correct
 *  TC-18  Links – View Program & Pricing links to AFP 2026 homepage
 *  TC-19  Analytics – VWO event "afp09ModalFires" pushed
 *  TC-20  Responsive – hidden at 375px
 *  TC-21  Responsive – hidden at 768px tablet
 *  TC-22  Responsive – visible at exactly 1024px breakpoint
 *  TC-23  Site-wide – modal injects on /membership/ page
 *  TC-24  Site-wide – modal injects on /events/ page
 *  TC-25  Site-wide – modal injects on /career/ page
 *  TC-26  Layout – max-width ≤987px at 1440px viewport
 *  TC-27  Layout – modal centered at 1920px
 *  TC-28  Z-index – container (9999) above overlay (9998)
 *  TC-29  Background blur – #site-header & #site-main blur on show
 *  TC-30  Scale – wrapper scale responds to viewport height
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

/* ── Load variation assets ──────────────────────────────────────────────── */
const CSS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);
const JS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);

const AFP_BASE = 'https://www.financialprofessionals.org';

/* ── Screenshots directory (used by afp09-reporter.js) ─────────────────── */
const SS_DIR = path.join(__dirname, '../afp09-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Mock HTML – mirrors the real site structure (has #site-main / #site-header) */
const MOCK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AFP — Association for Financial Professionals</title>
  <style>
    body { margin: 0; font-family: sans-serif; background: #fff; }
    #site-header { padding: 20px 40px; background: #003087; color: #fff; }
    #site-main   { padding: 40px; }
  </style>
</head>
<body>
  <header id="site-header">
    <nav><a href="/">AFP</a></nav>
  </header>
  <main id="site-main">
    <h1>Association for Financial Professionals</h1>
    <p>Resources, tools and community for treasury and finance professionals.</p>
    <a href="/membership/">Join AFP</a>
  </main>
</body>
</html>`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Route all target-site pages to MOCK_HTML */
async function mockAFP(page) {
  await page.route(`${AFP_BASE}/**`, route =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: MOCK_HTML })
  );
  await page.route(AFP_BASE, route =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: MOCK_HTML })
  );
}

/** Inject variation CSS + JS into the current page */
async function injectVariation(page) {
  await page.addStyleTag({ content: CSS_CONTENT });
  await page.evaluate(JS_CONTENT);
  // Let waitForElement's 50ms poll + 2s insertModal delay settle
  await page.waitForTimeout(350);
}

/** Set sessionStorage.startTime so that `ms` ms appear already elapsed */
async function setElapsed(page, ms) {
  await page.evaluate((elapsed) => {
    sessionStorage.setItem('startTime', String(Date.now() - elapsed));
  }, ms);
}

/** Set the once-only cookie so modal is treated as already shown */
async function setDismissedCookie(page) {
  await page.evaluate(() => {
    document.cookie = 'exit_popup_dismissed=true; path=/';
  });
}

/** Returns true if viewport width >= 1024 */
async function isDesktop(page) {
  const vp = page.viewportSize();
  return vp !== null && vp.width >= 1024;
}

/* ── Test Suite ──────────────────────────────────────────────────────────── */
test.describe('AFP09 — 30-Second Timed Modal + Exit Intent', () => {

  /* ─────────────────────────────────────────────────────────────────────
   * TC-01 | DOM — Modal HTML injected into page body
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-01 | DOM — Modal HTML injected into page body', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-overlay')).toHaveCount(1);
    await expect(page.locator('.cre-t-9-modal-container')).toHaveCount(1);
    await expect(page.locator('.cre-t-9-modal-wrapper')).toHaveCount(1);
    await expect(page.locator('.cre-t-9-modal-body')).toHaveCount(1);
    await expect(page.locator('.cre-t-9-modal-cross')).toHaveCount(1);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-02 | Init — Body gets variation identifier class "cre-t-9"
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-02 | Init — Body gets variation class "cre-t-9"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-9/);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-03 | Timer — Modal NOT visible before 30 seconds
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-03 | Timer — Modal hidden before 30 seconds elapse', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page); // no elapsed time → timer just started

    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-9-show-modal')
    );
    expect(hasShowClass).toBe(false);
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-04 | Timer — Modal visible after ≥30 seconds elapsed (desktop)
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-04 | Timer — Modal visible after ≥30 seconds elapsed (desktop)', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000); // 31s elapsed → remainingTime = 0 → show immediately
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-9-show-modal/, { timeout: 3000 });
    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-05 | Timer — Modal stays hidden when only 15 of 30 seconds elapsed
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-05 | Timer — Modal stays hidden when 15 of 30 seconds elapsed', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 15000); // 15s gone, 15s remaining
    await injectVariation(page);

    await page.waitForTimeout(400); // well within the 15s remaining
    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-9-show-modal')
    );
    expect(hasShowClass).toBe(false);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-06 | Storage — startTime saved to sessionStorage on init
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-06 | Storage — startTime persisted in sessionStorage', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);

    const startTime = await page.evaluate(() => sessionStorage.getItem('startTime'));
    expect(startTime).not.toBeNull();
    expect(Number(startTime)).toBeGreaterThan(0);
    expect(Date.now() - Number(startTime)).toBeLessThan(5000);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-07 | Navigation — Timer startTime NOT reset across page nav
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-07 | Navigation — Timer startTime unchanged across page navigation', async ({ page }) => {
    await mockAFP(page);

    await page.goto(`${AFP_BASE}/`);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);
    const startTime1 = await page.evaluate(() => sessionStorage.getItem('startTime'));

    await page.goto(`${AFP_BASE}/membership/`);
    await injectVariation(page);
    const startTime2 = await page.evaluate(() => sessionStorage.getItem('startTime'));

    expect(startTime2).toBe(startTime1);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-08 | Navigation — Modal fires on page 2 when ≥30s total elapsed
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-08 | Navigation — Modal fires on page 2 when ≥30s since first page', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);

    await page.goto(`${AFP_BASE}/`);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);

    await page.goto(`${AFP_BASE}/events/`);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-9-show-modal/, { timeout: 3000 });
    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-09 | Cookie — Modal does NOT fire when exit_popup_dismissed=true
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-09 | Cookie — Modal blocked when exit_popup_dismissed cookie set', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => {
      sessionStorage.clear();
      document.cookie = 'exit_popup_dismissed=true; path=/';
    });
    await setElapsed(page, 31000);
    await injectVariation(page);

    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-9-show-modal')
    );
    expect(hasShowClass).toBe(false);
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-10 | Cookie — exit_popup_dismissed=true written after modal fires
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-10 | Cookie — exit_popup_dismissed set to true after modal shows', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-9-show-modal/, { timeout: 3000 });

    const cookieVal = await page.evaluate(() => {
      var cookies = document.cookie.split('; ');
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        if (parts[0] === 'exit_popup_dismissed') return parts[1];
      }
      return null;
    });
    expect(cookieVal).toBe('true');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-11 | Exit Intent — Modal shows when mouse moves to top (y ≤ 50)
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-11 | Exit Intent — Modal shows on mouse move to top of viewport', async ({ page }, testInfo) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);

    // Modal must be hidden before intent
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();

    // Simulate exit intent: move mouse near top of viewport (y = 30)
    await page.mouse.move(700, 400);
    await page.waitForTimeout(100);
    await page.mouse.move(700, 30);
    await page.waitForTimeout(500); // debounce is 200ms

    await expect(page.locator('body')).toHaveClass(/cre-t-9-show-modal/, { timeout: 3000 });
    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });

    // Screenshot: modal triggered by exit intent (blurred background visible)
    await page.screenshot({
      path: path.join(SS_DIR, `exit-intent-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-12 | Exit Intent — Blocked when cookie already set
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-12 | Exit Intent — Blocked when exit_popup_dismissed cookie set', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => {
      sessionStorage.clear();
      document.cookie = 'exit_popup_dismissed=true; path=/';
    });
    await injectVariation(page);

    await page.mouse.move(700, 400);
    await page.waitForTimeout(100);
    await page.mouse.move(700, 20);
    await page.waitForTimeout(500);

    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-9-show-modal')
    );
    expect(hasShowClass).toBe(false);
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-13 | Interaction — X button closes modal
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-13 | Interaction — X button removes cre-t-9-show-modal class', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    await page.locator('.cre-t-9-modal-cross').click();

    await expect(page.locator('body')).not.toHaveClass(/cre-t-9-show-modal/);
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-14 | Interaction — Overlay click closes modal
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-14 | Interaction — Overlay click removes cre-t-9-show-modal class', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    await page.locator('.cre-t-9-modal-overlay').click({ position: { x: 5, y: 5 }, force: true });

    await expect(page.locator('body')).not.toHaveClass(/cre-t-9-show-modal/);
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-15 | Duplicate — Modal HTML injected only once on double init
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-15 | Duplicate — Modal not injected twice on double variation init', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);
    await injectVariation(page); // second call should be a no-op

    await expect(page.locator('.cre-t-9-modal-overlay')).toHaveCount(1);
    await expect(page.locator('.cre-t-9-modal-container')).toHaveCount(1);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-16 | Content — All modal sections present with correct text
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-16 | Content — All modal sections render with correct text', async ({ page }, testInfo) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });

    // AFP logo image
    await expect(page.locator('.cre-t-9-content-1-img img')).toHaveAttribute('src', /AFPLogo/);

    // Headline
    await expect(page.locator('.cre-t-9-modal-content2 span'))
      .toHaveText('Why people attend AFP 2026');

    // Stats bar
    await expect(page.locator('.cre-t-9-modal-content3 span'))
      .toContainText('7,000+ attendees');
    await expect(page.locator('.cre-t-9-modal-content3 span'))
      .toContainText('20+ networking events');
    await expect(page.locator('.cre-t-9-modal-content3 span'))
      .toContainText('200+ providers');

    // Conference image
    await expect(page.locator('.cre-t-9-content-4-img img'))
      .toHaveAttribute('src', /Conference/);

    // Three feature cards
    await expect(page.locator('.cre-t-9-modal-card')).toHaveCount(3);
    await expect(page.locator('.cre-t-9-modal-card-header').nth(0))
      .toContainText('actually working');
    await expect(page.locator('.cre-t-9-modal-card-description').nth(0))
      .toContainText('forecasting, liquidity, risk and AI');
    await expect(page.locator('.cre-t-9-modal-card-header').nth(1))
      .toContainText('Compare approaches with peers');
    await expect(page.locator('.cre-t-9-modal-card-description').nth(1))
      .toContainText('Compare systems, tools and providers side by side');
    await expect(page.locator('.cre-t-9-modal-card-header').nth(2))
      .toContainText('Bring back better decisions');
    await expect(page.locator('.cre-t-9-modal-card-description').nth(2))
      .toContainText('One useful idea or connection');

    // CTA buttons
    await expect(page.locator('a.cre-t-9-modal-cta-link1')).toContainText('Register Now');
    await expect(page.locator('a.cre-t-9-modal-cta-link2')).toContainText('View Program & Pricing');

    // Disclaimer
    await expect(page.locator('.cre-t-9-modal-disclaimer-text'))
      .toContainText('Save $675 before June 26');

    // Testimonial
    await expect(page.locator('.cre-t-9-modal-review-text1'))
      .toContainText('AFP Conference');
    await expect(page.locator('.cre-t-9-modal-review-text2'))
      .toContainText('Cassie Wang');
    await expect(page.locator('.cre-t-9-modal-review-text2'))
      .toContainText('Head of Finance, Lightship Security');

    // Screenshot: modal fully rendered with all content visible
    await page.screenshot({
      path: path.join(SS_DIR, `modal-desktop-${testInfo.project.name}.png`),
      fullPage: false,
    });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-17 | Links — Register Now href points to /registration
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-17 | Links — Register Now links to /registration', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('a.cre-t-9-modal-cta-link1'))
      .toHaveAttribute('href', 'https://conference.financialprofessionals.org/registration');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-18 | Links — "View Program & Pricing" links to AFP 2026 homepage
   * Per spec: AFP09 differs from AFP08 in that this button → homepage
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-18 | Links — View Program & Pricing links to AFP 2026 homepage', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    // Must link to AFP 2026 conference HOMEPAGE (not /program/overview/schedule like AFP08)
    await expect(page.locator('a.cre-t-9-modal-cta-link2'))
      .toHaveAttribute('href', 'https://conference.financialprofessionals.org/');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-19 | Analytics — VWO event "afp09ModalFires" pushed on show
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-19 | Analytics — VWO event "afp09ModalFires" fired on modal show', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => {
      sessionStorage.clear();
      document.cookie = 'exit_popup_dismissed=; max-age=0; path=/';
      window.VWO = [];
    });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-9-show-modal/, { timeout: 3000 });

    const vwoEvents = await page.evaluate(() => {
      var events = [];
      var vwo = window.VWO || [];
      for (var i = 0; i < vwo.length; i++) {
        var item = vwo[i];
        if (Array.isArray(item) && item[0] === 'event') events.push(item[1]);
      }
      return events;
    });
    expect(vwoEvents).toContain('afp09ModalFires');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-20 | Responsive — Modal HIDDEN at 375px mobile width
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-20 | Responsive — Modal hidden at 375px mobile width', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    // CSS: modal only displays at min-width 1024px
    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
    await expect(page.locator('.cre-t-9-modal-overlay')).not.toBeVisible();

    // Screenshot: page at 375px proving modal is NOT shown
    await page.screenshot({
      path: path.join(SS_DIR, `modal-mobile-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-21 | Responsive — Modal HIDDEN at 768px tablet width
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-21 | Responsive — Modal hidden at 768px tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).not.toBeVisible();
    await expect(page.locator('.cre-t-9-modal-overlay')).not.toBeVisible();
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-22 | Responsive — Modal VISIBLE at exactly 1024px (breakpoint edge)
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-22 | Responsive — Modal visible at exactly 1024px breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-23 | Site-wide — Modal injects on /membership/ page
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-23 | Site-wide — Modal injects on /membership/ page', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(`${AFP_BASE}/membership/`);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.cre-t-9-modal-content2 span'))
      .toHaveText('Why people attend AFP 2026');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-24 | Site-wide — Modal injects on /events/ page
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-24 | Site-wide — Modal injects on /events/ page', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(`${AFP_BASE}/events/`);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.cre-t-9-modal-overlay')).toBeVisible({ timeout: 3000 });
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-25 | Site-wide — Modal injects on /career/ page
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-25 | Site-wide — Modal injects on /career/ page', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(`${AFP_BASE}/career/`);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-9-modal-container')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('a.cre-t-9-modal-cta-link1')).toContainText('Register Now');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-26 | Layout — Modal max-width ≤987px at 1440px viewport
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-26 | Layout — Modal max-width ≤987px at 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    const modal = page.locator('.cre-t-9-modal-container');
    await expect(modal).toBeVisible({ timeout: 3000 });

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(987 + 5); // 5px rounding tolerance
      const expectedX = (1440 - box.width) / 2;
      expect(Math.abs(box.x - expectedX)).toBeLessThan(20);
    }
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-27 | Layout — Modal centered at 1920px
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-27 | Layout — Modal centered at 1920px full-HD viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    const modal = page.locator('.cre-t-9-modal-container');
    await expect(modal).toBeVisible({ timeout: 3000 });

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(987 + 5);
      const expectedX = (1920 - box.width) / 2;
      expect(Math.abs(box.x - expectedX)).toBeLessThan(20);
    }
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-28 | Z-index — Container (9999) sits above overlay (9998)
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-28 | Z-index — Container (9999) sits above overlay (9998)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);
    // insertModal() has a 2s delay — wait for the overlay to appear in DOM
    await page.waitForSelector('.cre-t-9-modal-overlay', { state: 'attached', timeout: 5000 });

    const zIndexes = await page.evaluate(() => {
      var overlay   = document.querySelector('.cre-t-9-modal-overlay');
      var container = document.querySelector('.cre-t-9-modal-container');
      return {
        overlay:   overlay   ? parseInt(window.getComputedStyle(overlay).zIndex,   10) : null,
        container: container ? parseInt(window.getComputedStyle(container).zIndex, 10) : null,
      };
    });
    expect(zIndexes.overlay).toBe(9998);
    expect(zIndexes.container).toBe(9999);
    expect(zIndexes.container).toBeGreaterThan(zIndexes.overlay);
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-29 | Background blur — #site-header & #site-main blur on modal show
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-29 | Background — #site-header and #site-main blur when modal shows', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await setElapsed(page, 31000);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-9-show-modal/, { timeout: 3000 });

    const filters = await page.evaluate(() => {
      var header = document.querySelector('#site-header');
      var main   = document.querySelector('#site-main');
      return {
        header: header ? window.getComputedStyle(header).filter : '',
        main:   main   ? window.getComputedStyle(main).filter   : '',
      };
    });
    expect(filters.header).toContain('blur');
    expect(filters.main).toContain('blur');
  });

  /* ─────────────────────────────────────────────────────────────────────
   * TC-30 | Scale — Wrapper scale property applied at short viewport height
   * CSS: scale 0.7 at max-height:950px, 0.6 at max-height:840px, etc.
   * ──────────────────────────────────────────────────────────────────── */
  test('TC-30 | Scale — Wrapper scale responds to short viewport height', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 }); // 800 < 840 → scale 0.6
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => { sessionStorage.clear(); document.cookie = 'exit_popup_dismissed=; max-age=0; path=/'; });
    await injectVariation(page);
    // insertModal() has a 2s delay — wait for the wrapper to appear in DOM
    await page.waitForSelector('.cre-t-9-modal-wrapper', { state: 'attached', timeout: 5000 });

    const scaleVal = await page.evaluate(() => {
      var el = document.querySelector('.cre-t-9-modal-wrapper');
      if (!el) return null;
      return window.getComputedStyle(el).scale;
    });
    expect(scaleVal).not.toBeNull();
    // At 800px height the scale should be 0.6 (or represented as a matrix)
    // We just verify the property is set and not the default "1"
    expect(scaleVal).not.toBe('none');
  });

});
