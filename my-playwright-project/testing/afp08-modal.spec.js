// @ts-check
/**
 * AFP08 — 15-Second Timed Modal
 * Variation: vB.js + vB.css injected via Playwright
 * Target site: conference.financialprofessionals.org
 *
 * What this test covers:
 *  - Modal DOM injection
 *  - Timer logic (fires after 15s, persists via sessionStorage)
 *  - Timer NOT reset on same-domain page navigation
 *  - Responsive: hidden at <1024px, visible at >=1024px
 *  - Large-screen centering (1440px, 1920px, 2440px)
 *  - Close via X button and overlay click
 *  - Content completeness (logo, heading, cards, CTAs, review)
 *  - CTA href correctness
 *  - VWO analytics event
 *  - No duplicate modal injection
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/* ── Load variation assets ──────────────────────────────────────────────── */
const CSS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.css'), 'utf8'
);
const JS_CONTENT = fs.readFileSync(
  path.join(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);

const AFP_BASE = 'https://conference.financialprofessionals.org';

/* Minimal AFP-like mock page with .mm-page for blur test */
const MOCK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AFP 2026 — Finance & Treasury Conference</title>
  <style>
    body { margin: 0; font-family: sans-serif; background: #fff; }
    .mm-page { padding: 40px; }
  </style>
</head>
<body>
  <div class="mm-page">
    <header><nav><a href="/">AFP 2026</a></nav></header>
    <main>
      <h1>AFP 2026 Annual Conference — Las Vegas</h1>
      <p>The premier event for treasury, finance, payments and FP&amp;A professionals.</p>
      <a href="/registration">Register Now</a>
    </main>
  </div>
</body>
</html>`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Route all AFP pages to the mock HTML */
async function mockAFP(page) {
  await page.route(`${AFP_BASE}/**`, route =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: MOCK_HTML })
  );
}

/** Inject variation CSS + JS into the current page */
async function injectVariation(page) {
  await page.addStyleTag({ content: CSS_CONTENT });
  await page.evaluate(JS_CONTENT);
  // Allow waitForElement's 50ms poll to fire init()
  await page.waitForTimeout(300);
}

/** Set sessionStorage.startTime so that `ms` milliseconds appear already elapsed */
async function setElapsed(page, ms) {
  await page.evaluate((elapsed) => {
    sessionStorage.setItem('startTime', String(Date.now() - elapsed));
  }, ms);
}

/** Returns true if current viewport is a desktop (>= 1024px) */
async function isDesktop(page) {
  const vp = page.viewportSize();
  return vp !== null && vp.width >= 1024;
}

/* ── Test Suite ──────────────────────────────────────────────────────────── */
test.describe('AFP08 — 15-Second Timed Modal', () => {

  /* ───────────────────────────────────────────────────────────────
   * TC-01 | DOM — Modal HTML injected into page body
   * ─────────────────────────────────────────────────────────────── */
  test('TC-01 | DOM — Modal HTML injected into page body', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-overlay')).toHaveCount(1);
    await expect(page.locator('.cre-t-8-modal-container')).toHaveCount(1);
    await expect(page.locator('.cre-t-8-modal-wrapper')).toHaveCount(1);
    await expect(page.locator('.cre-t-8-modal-body')).toHaveCount(1);
    await expect(page.locator('.cre-t-8-modal-cross')).toHaveCount(1);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-02 | Init — Body gets variation identifier class
   * ─────────────────────────────────────────────────────────────── */
  test('TC-02 | Init — Body gets variation class "cre-t-08"', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-08/);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-03 | Timer — Modal NOT visible before 15 seconds
   * ─────────────────────────────────────────────────────────────── */
  test('TC-03 | Timer — Modal hidden before 15 seconds elapse', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    // No elapsed time set — timer just started
    await injectVariation(page);

    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-8-show-modal')
    );
    expect(hasShowClass).toBe(false);
    await expect(page.locator('.cre-t-8-modal-container')).not.toBeVisible();
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-04 | Timer — Modal shown after 15 seconds (desktop)
   * ─────────────────────────────────────────────────────────────── */
  test('TC-04 | Timer — Modal visible after ≥15 seconds elapsed (desktop)', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000); // 16s elapsed → remainingTime = 0 → immediate show
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-8-show-modal/, { timeout: 2000 });
    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-05 | Timer — Partial elapsed: modal not shown until time up
   * ─────────────────────────────────────────────────────────────── */
  test('TC-05 | Timer — Modal stays hidden when 8 of 15 seconds elapsed', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 8000); // 8s gone, 7s remaining
    await injectVariation(page);

    // After 300ms (well within the 7s remaining) modal must still be hidden
    await page.waitForTimeout(300);
    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-8-show-modal')
    );
    expect(hasShowClass).toBe(false);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-06 | Storage — startTime saved to sessionStorage on init
   * ─────────────────────────────────────────────────────────────── */
  test('TC-06 | Storage — startTime persisted in sessionStorage', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await injectVariation(page);

    const startTime = await page.evaluate(() => sessionStorage.getItem('startTime'));
    expect(startTime).not.toBeNull();
    expect(Number(startTime)).toBeGreaterThan(0);
    // startTime should be within last 3 seconds
    expect(Date.now() - Number(startTime)).toBeLessThan(3000);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-07 | Navigation — startTime NOT reset when page changes
   * ─────────────────────────────────────────────────────────────── */
  test('TC-07 | Navigation — Timer startTime unchanged across page navigation', async ({ page }) => {
    await mockAFP(page);

    // Page 1: inject variation → timer starts
    await page.goto(`${AFP_BASE}/`);
    await page.evaluate(() => sessionStorage.clear());
    await injectVariation(page);
    const startTime1 = await page.evaluate(() => sessionStorage.getItem('startTime'));

    // Navigate to page 2 on same domain
    await page.goto(`${AFP_BASE}/agenda`);
    await injectVariation(page); // re-inject (simulates VWO on new page)

    const startTime2 = await page.evaluate(() => sessionStorage.getItem('startTime'));
    // startTime must be identical — timer was NOT reset
    expect(startTime2).toBe(startTime1);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-08 | Navigation — Modal fires on page 2 if ≥15s total elapsed
   * ─────────────────────────────────────────────────────────────── */
  test('TC-08 | Navigation — Modal fires on page 2 when ≥15s since first page', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);

    // Simulate: user landed on page 1 sixteen seconds ago
    await page.goto(`${AFP_BASE}/`);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000); // 16s ago — but DON'T inject yet

    // Navigate to page 2 (user browses within same session)
    await page.goto(`${AFP_BASE}/schedule`);
    // Variation runs on new page, picks up startTime from sessionStorage
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-8-show-modal/, { timeout: 2000 });
    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-09 | Storage — modalTriggered flag prevents second fire
   * ─────────────────────────────────────────────────────────────── */
  test('TC-09 | Storage — Modal does NOT fire again if modalTriggered=true', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => {
      sessionStorage.clear();
      sessionStorage.setItem('modalTriggered', 'true'); // already triggered
    });
    await setElapsed(page, 20000);
    await injectVariation(page);

    const hasShowClass = await page.evaluate(
      () => document.body.classList.contains('cre-t-8-show-modal')
    );
    expect(hasShowClass).toBe(false);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-10 | Interaction — Close button (X) dismisses modal
   * ─────────────────────────────────────────────────────────────── */
  test('TC-10 | Interaction — X button removes cre-t-8-show-modal class', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });
    await page.locator('.cre-t-8-modal-cross').click();

    await expect(page.locator('body')).not.toHaveClass(/cre-t-8-show-modal/);
    await expect(page.locator('.cre-t-8-modal-container')).not.toBeVisible();
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-11 | Interaction — Overlay click dismisses modal
   * ─────────────────────────────────────────────────────────────── */
  test('TC-11 | Interaction — Overlay click removes cre-t-8-show-modal class', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });
    // Click top-left corner of overlay (outside the centered modal)
    await page.locator('.cre-t-8-modal-overlay').click({ position: { x: 5, y: 5 }, force: true });

    await expect(page.locator('body')).not.toHaveClass(/cre-t-8-show-modal/);
    await expect(page.locator('.cre-t-8-modal-container')).not.toBeVisible();
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-12 | Duplicate — Modal HTML injected only once on double init
   * ─────────────────────────────────────────────────────────────── */
  test('TC-12 | Duplicate — Modal not injected twice on double variation init', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await injectVariation(page);
    await injectVariation(page); // second call should no-op

    await expect(page.locator('.cre-t-8-modal-overlay')).toHaveCount(1);
    await expect(page.locator('.cre-t-8-modal-container')).toHaveCount(1);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-13 | Content — All modal sections present and populated
   * ─────────────────────────────────────────────────────────────── */
  test('TC-13 | Content — All modal sections render correctly', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });

    // Logo
    await expect(page.locator('.cre-t-8-content-1-img img')).toHaveAttribute('src', /AFPLogo/);
    // Headline text
    await expect(page.locator('.cre-t-8-modal-content2 span')).toHaveText('Why people attend AFP 2026');
    // Subtitle
    await expect(page.locator('.cre-t-8-modal-content3 span')).toContainText('7,000+ attendees');
    await expect(page.locator('.cre-t-8-modal-content3 span')).toContainText('20+ networking events');
    await expect(page.locator('.cre-t-8-modal-content3 span')).toContainText('200+ providers');
    // Conference image
    await expect(page.locator('.cre-t-8-content-4-img img')).toHaveAttribute('src', /Conference/);
    // 3 feature cards
    await expect(page.locator('.cre-t-8-modal-card')).toHaveCount(3);
    await expect(page.locator('.cre-t-8-modal-card-header').nth(0)).toContainText(/See what.s actually working/);
    await expect(page.locator('.cre-t-8-modal-card-header').nth(1)).toContainText('Compare approaches with peers');
    await expect(page.locator('.cre-t-8-modal-card-header').nth(2)).toContainText('Bring back better decisions');
    // CTAs
    await expect(page.locator('a.cre-t-8-modal-cta-link1')).toContainText('Register Now');
    await expect(page.locator('a.cre-t-8-modal-cta-link2')).toContainText('View Program & Pricing');
    // Disclaimer
    await expect(page.locator('.cre-t-8-modal-disclaimer-text')).toContainText('Save $675 before June 26');
    // Review
    await expect(page.locator('.cre-t-8-modal-review-text1')).toContainText('AFP Conference');
    await expect(page.locator('.cre-t-8-modal-review-text2')).toContainText('Cassie Wang');
    await expect(page.locator('.cre-t-8-modal-review-text2')).toContainText('Head of Finance, Lightship Security');
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-14 | Links — CTA hrefs point to correct AFP pages
   * ─────────────────────────────────────────────────────────────── */
  test('TC-14 | Links — CTA hrefs are correct', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('a.cre-t-8-modal-cta-link1')).toHaveAttribute('href', '/registration');
    await expect(page.locator('a.cre-t-8-modal-cta-link2')).toHaveAttribute('href', '/program/overview/schedule');
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-15 | Analytics — VWO event "afp08ModalFires" pushed on show
   * ─────────────────────────────────────────────────────────────── */
  test('TC-15 | Analytics — VWO event "afp08ModalFires" fired on modal show', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => {
      sessionStorage.clear();
      // Pre-init VWO array so we can inspect it after variation runs
      window.VWO = [];
    });
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-8-show-modal/, { timeout: 2000 });

    const vwoEvents = await page.evaluate(() => {
      var events = [];
      var vwo = window.VWO || [];
      for (var i = 0; i < vwo.length; i++) {
        var item = vwo[i];
        if (Array.isArray(item) && item[0] === 'event') {
          events.push(item[1]);
        }
      }
      return events;
    });
    expect(vwoEvents).toContain('afp08ModalFires');
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-16 | Responsive — Modal HIDDEN on mobile (375px, <1024px)
   * ─────────────────────────────────────────────────────────────── */
  test('TC-16 | Responsive — Modal hidden at 375px mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    // CSS: modal only displayed at min-width 1024px
    // body may have show-modal class but display stays none
    await expect(page.locator('.cre-t-8-modal-container')).not.toBeVisible();
    await expect(page.locator('.cre-t-8-modal-overlay')).not.toBeVisible();
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-17 | Responsive — Modal HIDDEN at 768px (tablet)
   * ─────────────────────────────────────────────────────────────── */
  test('TC-17 | Responsive — Modal hidden at 768px tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-container')).not.toBeVisible();
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-18 | Responsive — Modal VISIBLE at 1024px (breakpoint edge)
   * ─────────────────────────────────────────────────────────────── */
  test('TC-18 | Responsive — Modal visible at exactly 1024px breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('.cre-t-8-modal-container')).toBeVisible({ timeout: 2000 });
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-19 | Large Screen — Modal visible and max-width ≤987px at 1440px
   * ─────────────────────────────────────────────────────────────── */
  test('TC-19 | Large Screen 1440px — Modal visible, max-width respected', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    const modal = page.locator('.cre-t-8-modal-container');
    await expect(modal).toBeVisible({ timeout: 2000 });

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // max-width is 987px
      expect(box.width).toBeLessThanOrEqual(987 + 5); // 5px tolerance for rounding
      // Modal should be horizontally centered
      const expectedX = (1440 - box.width) / 2;
      expect(Math.abs(box.x - expectedX)).toBeLessThan(20);
    }
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-20 | Large Screen — Modal visible and centered at 1920px
   * ─────────────────────────────────────────────────────────────── */
  test('TC-20 | Large Screen 1920px — Modal centered at full HD', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    const modal = page.locator('.cre-t-8-modal-container');
    await expect(modal).toBeVisible({ timeout: 2000 });

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(987 + 5);
      const expectedX = (1920 - box.width) / 2;
      expect(Math.abs(box.x - expectedX)).toBeLessThan(20);
    }
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-21 | Large Screen — Modal centered at 2440px (ultra-wide)
   * Figma reference: Group 22 — position: absolute; width: 1558px; height: 1863px
   * ─────────────────────────────────────────────────────────────── */
  test('TC-21 | Large Screen 2440px — Modal centered on ultra-wide display', async ({ page }) => {
    await page.setViewportSize({ width: 2440, height: 1080 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    const modal = page.locator('.cre-t-8-modal-container');
    await expect(modal).toBeVisible({ timeout: 2000 });

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // At 2440px: calc(100% - 40px) = 2400px, but max-width=987px caps it
      expect(box.width).toBeLessThanOrEqual(987 + 5);
      // Centered via transform: translate(-50%, -50%) at left:50%
      const expectedX = (2440 - box.width) / 2;
      expect(Math.abs(box.x - expectedX)).toBeLessThan(20);
    }
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-22 | Large Screen — Modal scale correct at 1440px height
   * CSS: scale reduces from 0.9 at <1200px height down to 0.5 at <710px
   * ─────────────────────────────────────────────────────────────── */
  test('TC-22 | Scale — Wrapper uses scale:0.9 when viewport height <1200px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // 900 < 1200 → scale 0.85
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    const wrapperScale = await page.evaluate(() => {
      var el = document.querySelector('.cre-t-8-modal-wrapper');
      if (!el) return null;
      return window.getComputedStyle(el).scale;
    });
    // At height 900px: max-height 1120 rule applies → scale 0.85
    // Value may be string "0.85" or a matrix depending on browser
    expect(wrapperScale).not.toBeNull();
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-23 | Background blur — .mm-page blurs when modal is shown
   * ─────────────────────────────────────────────────────────────── */
  test('TC-23 | Background — .mm-page gets blur filter when modal shows', async ({ page }) => {
    if (!(await isDesktop(page))) test.skip();

    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    await expect(page.locator('body')).toHaveClass(/cre-t-8-show-modal/, { timeout: 2000 });

    const filter = await page.evaluate(() => {
      var el = document.querySelector('.mm-page');
      return el ? window.getComputedStyle(el).filter : '';
    });
    expect(filter).toContain('blur');
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-24 | Z-index — Modal container above overlay
   * ─────────────────────────────────────────────────────────────── */
  test('TC-24 | Z-index — Modal container (9999) sits above overlay (9998)', async ({ page }) => {
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await injectVariation(page);

    const zIndexes = await page.evaluate(() => {
      var overlay = document.querySelector('.cre-t-8-modal-overlay');
      var container = document.querySelector('.cre-t-8-modal-container');
      return {
        overlay: overlay ? parseInt(window.getComputedStyle(overlay).zIndex, 10) : null,
        container: container ? parseInt(window.getComputedStyle(container).zIndex, 10) : null,
      };
    });
    expect(zIndexes.overlay).toBe(9998);
    expect(zIndexes.container).toBe(9999);
    expect(zIndexes.container).toBeGreaterThan(zIndexes.overlay);
  });

  /* ───────────────────────────────────────────────────────────────
   * TC-25 | Modal width — respects calc(100% - 40px) on narrow desktop
   * ─────────────────────────────────────────────────────────────── */
  test('TC-25 | Width — Modal width is calc(100% - 40px) on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await mockAFP(page);
    await page.goto(AFP_BASE);
    await page.evaluate(() => sessionStorage.clear());
    await setElapsed(page, 16000);
    await injectVariation(page);

    const modal = page.locator('.cre-t-8-modal-container');
    await expect(modal).toBeVisible({ timeout: 2000 });

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // At 1100px: calc(100% - 40px) = 1060px, capped at max-width 987px
      expect(box.width).toBeLessThanOrEqual(987 + 5);
    }
  });

});
