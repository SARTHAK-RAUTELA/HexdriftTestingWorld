// @ts-check
/**
 * PAY13 (cre-t-13) — pay.com.au "See your fees" / "Not sure if Pay.com.au is right" modal.
 *
 * Rerun (2026-09-07): client supplied the real Optimizely Activation Code — the
 * `function trigger(activate, options)` snippet that decides WHEN to call activate(), separate
 * from the Variation/Control JS (vB.js/v2.js) that just builds and shows the modal. This
 * replaces the previous round's approach of baking the 40s-timer/exit-intent logic directly
 * into vB.js/v2.js (see cre-t-13-desktop-trigger-update.md BUG-02) — that logic has been
 * stripped back out of vB.js/v2.js so they fire immediately when activate() calls them, matching
 * the real two-stage architecture:
 *   pay13-trigger-variation.js / pay13-trigger-control.js  --calls activate()-->  vB.js / v2.js
 *
 * New finding this round: the activation code enforces desktop-only in JS via
 * `isMobile = window.innerWidth < 768`, not only via the Optimizely audience as assumed last
 * round — that guard is now covered below (mobile viewport tests).
 *
 * Control's activation code was not supplied by the client; it is derived from the variation
 * code with the 40s-timer block removed (isMobile guard, cookie, exit-intent handler kept
 * identical) per the client's stated design: "control fires exit intent only, variation fires
 * exit intent and 40 sec".
 *
 * Tested against a local static fixture (not the live site) using Playwright's Clock API for
 * deterministic timer control, per the existing PAY08 QA notes
 * (qa-knowledge-base/pay-com-au/cre-t-08-vB-exit-intent-mobile-timer.md).
 *
 * Served over a local HTTP server rather than file://: the real trigger code's fired-flag is a
 * `document.cookie` write (`cre-t-13=modal-triggered; path=/`), and Chromium/WebKit silently
 * refuse to persist cookies set on file:// origins (Firefox tolerates it) — an artifact of the
 * fixture's origin, not a defect in the trigger code, since the modal still displays and the
 * goal still fires correctly on file:// in every engine. Production (https://pay.com.au/) is a
 * normal https origin, so this only matters for making the fixture itself trustworthy.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const http = require('http');

const FIXTURE_PATH = path.resolve(__dirname, '../../local_testing/Local2/pay13-fixture.html');
const FIXTURE_HTML = fs.readFileSync(FIXTURE_PATH, 'utf-8');

let fixtureServer;
let fixtureBaseUrl;

test.beforeAll(async () => {
  fixtureServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(FIXTURE_HTML);
  });
  await new Promise((resolve) => fixtureServer.listen(0, '127.0.0.1', resolve));
  const { port } = fixtureServer.address();
  fixtureBaseUrl = `http://127.0.0.1:${port}/`;
});

test.afterAll(async () => {
  await new Promise((resolve) => fixtureServer.close(resolve));
});

const VARIATION_DIR = path.resolve(__dirname, '../../local_testing/Local2/variation');
const TRIGGER_VARIATION_JS = fs.readFileSync(path.join(VARIATION_DIR, 'pay13-trigger-variation.js'), 'utf-8');
const TRIGGER_CONTROL_JS = fs.readFileSync(path.join(VARIATION_DIR, 'pay13-trigger-control.js'), 'utf-8');
const VB_JS = fs.readFileSync(path.join(VARIATION_DIR, 'vB.js'), 'utf-8');
const VB_CSS = fs.readFileSync(path.join(VARIATION_DIR, 'vB.css'), 'utf-8');
const V2_JS = fs.readFileSync(path.join(VARIATION_DIR, 'v2.js'), 'utf-8');
const V2_CSS = fs.readFileSync(path.join(VARIATION_DIR, 'v2.css'), 'utf-8');

const SEL = {
  modal: '.cre-t-13-modal-main',
  overlay: '.cre-t-13-overlay',
  cross: '.cre-t-13-modal-cross-icon-wrapper',
  title: '.cre-t-13-main-title',
  subtitle: '.cre-t-13-sub-title',
  cardTitle: '.cre-t-13-card-title',
  cta: '.cre-t-13-modal-cta',
};

async function loadFixture(page) {
  await page.goto(fixtureBaseUrl, { waitUntil: 'domcontentloaded' });
}

/**
 * Injects the real Optimizely Activation Code plus the Variation/Control JS, wired the way
 * production works: trigger() decides when to fire, and only then does activate() inject the
 * modal-building script into the page (simulating Optimizely injecting the Variation/Control
 * code once the experiment activates).
 */
async function injectTriggerAndVariant(page, { triggerJs, variantJs, variantCss }) {
  await page.addStyleTag({ content: variantCss });
  await page.addScriptTag({
    content: `
      (function () {
        window.__cre_t13_variantJs = ${JSON.stringify(variantJs)};
        window.__cre_t13_activated = false;
        function __cre_t13_activate() {
          window.__cre_t13_activated = true;
          var s = document.createElement('script');
          s.textContent = window.__cre_t13_variantJs;
          document.head.appendChild(s);
        }
        ${triggerJs}
        trigger(__cre_t13_activate, {});
      })();
    `,
  });
  // let the 50ms waitForElement poll interval fire (virtual time under page.clock)
  await page.clock.fastForward(100);
}

async function dispatchExitIntent(page) {
  await page.evaluate(() => {
    document.dispatchEvent(
      new MouseEvent('mouseout', { clientY: 0, relatedTarget: null, bubbles: true })
    );
  });
  // activate() (if it fires) injects vB.js/v2.js, which registers its own fresh
  // waitForElement("body", init, 50, 15000) poll under the already-installed fake clock —
  // advance past that too so init() actually runs and builds/shows the modal.
  await page.clock.fastForward(100);
}

async function getOptimizelyEvents(page, eventName) {
  return page.evaluate((name) => {
    var q = window.optimizely || [];
    return q.filter((item) => item && item.eventName === name).length;
  }, eventName);
}

async function getCookieValue(page, name) {
  return page.evaluate((cname) => {
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(cname + '=') === 0) return c.substring(cname.length + 1);
    }
    return null;
  }, name);
}

// Playwright's toBeVisible() waits for two stable real animation frames via the browser's
// paint loop, which never advances under page.clock's virtualized requestAnimationFrame — even
// though the DOM/CSS state is already correct (confirmed against screenshots taken at the
// moment such assertions "failed" in the prior round). Query the CSSOM directly instead.
async function isModalVisible(page) {
  return page.evaluate(() => {
    var el = document.querySelector('.cre-t-13-modal-main');
    if (!el) return false;
    return el.classList.contains('active') && getComputedStyle(el).display !== 'none';
  });
}

test.describe('PAY13 Variation activation (pay13-trigger-variation.js) — 40s timer OR exit intent', () => {
  test.beforeEach(async ({ page }) => {
    // PAY13 is desktop-only per the client's own trigger code (isMobile = innerWidth < 768);
    // pin a desktop viewport here so trigger behavior is tested consistently across every
    // browser engine in the project matrix, independent of whichever device profile (including
    // the Mobile Chrome/Mobile Safari/Tablet projects) each project defaults to. The dedicated
    // "does NOT activate on a mobile viewport" tests below override this back down.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.clock.install();
    await loadFixture(page);
  });

  test('modal hidden immediately on load, before injecting anything', async ({ page }) => {
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('target time is recorded in sessionStorage as soon as the trigger is set up, but not yet activated', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    const targetTime = await page.evaluate(() => sessionStorage.getItem('cre-t-13-target-time'));
    expect(targetTime).not.toBeNull();
    expect(await page.evaluate(() => window.__cre_t13_activated)).toBe(false);
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('modal stays hidden at 39s, appears at 40s (timer path); cookie + goal + reason set', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });

    await page.clock.fastForward(39000);
    expect(await isModalVisible(page)).toBe(false);

    await page.clock.fastForward(1500); // cross the 40s mark
    await page.clock.fastForward(100); // let vB.js's own waitForElement poll fire and call init()
    expect(await isModalVisible(page)).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('cre-t-13-variation'))).toBe(true);
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(1);
    expect(await page.evaluate(() => window.optimizely_trigger_reason_cre_t_13)).toBe('timer');
    expect(await getCookieValue(page, 'cre-t-13')).toBe('modal-triggered');
  });

  test('exit intent fires the modal early and cancels the 40s timer (no double-fire)', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });

    await page.clock.fastForward(5000); // well before 40s
    await dispatchExitIntent(page);
    expect(await isModalVisible(page)).toBe(true);
    expect(await page.evaluate(() => window.optimizely_trigger_reason_cre_t_13)).toBe('exit_intent');
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(1);

    // fast-forward well past the 40s mark — must not fire again / throw
    await page.clock.fastForward(60000);
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(1);
  });

  test('if the 40s timer fires first, a later exit-intent event does not double-fire (cookie guard)', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });

    await page.clock.fastForward(41000); // timer fires
    await page.clock.fastForward(100); // let vB.js's own waitForElement poll fire and call init()
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(1);

    await dispatchExitIntent(page); // dangling mouseout listener still attached, but cookie guard should no-op it
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(1);
  });

  test('does NOT activate on a mobile viewport, even after exit intent and 40s+', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });

    await dispatchExitIntent(page);
    await page.clock.fastForward(60000);

    expect(await page.evaluate(() => window.__cre_t13_activated)).toBe(false);
    await expect(page.locator(SEL.modal)).toHaveCount(0);
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(0);
  });

  test('40s timer persists across a page reload (cumulative on-site time)', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });

    await page.clock.fastForward(25000); // 25s elapsed, no fire yet
    expect(await isModalVisible(page)).toBe(false);

    // simulate a new page view in the same session
    await loadFixture(page);
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    expect(await isModalVisible(page)).toBe(false);

    // only ~15s should remain (40 - 25), not a fresh 40s
    await page.clock.fastForward(14000);
    expect(await isModalVisible(page)).toBe(false);

    await page.clock.fastForward(2000); // crosses the cumulative 40s mark
    await page.clock.fastForward(100); // let vB.js's own waitForElement poll fire and call init()
    expect(await isModalVisible(page)).toBe(true);
  });

  test('does not re-fire on a subsequent page view once already shown this session', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    await dispatchExitIntent(page);
    expect(await isModalVisible(page)).toBe(true);

    await loadFixture(page); // new page view, same session (cookie persists)
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    await page.clock.fastForward(60000); // well past 40s
    await dispatchExitIntent(page);
    expect(await page.evaluate(() => window.__cre_t13_activated)).toBe(false);
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('content matches variation copy', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    await dispatchExitIntent(page);
    await expect(page.locator(SEL.title)).toContainText('See');
    await expect(page.locator(SEL.title)).toContainText('fees, points and rewards');
    const cardTitles = await page.locator(SEL.cardTitle).allTextContents();
    expect(cardTitles).toEqual(['Create a Free Account', 'See Your Numbers', 'Then Decide']);
    await expect(page.locator(SEL.cta)).toHaveText('Create your free account');
  });

  test('close via cross icon and overlay both hide the modal', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    await dispatchExitIntent(page);
    expect(await isModalVisible(page)).toBe(true);
    await page.evaluate(() => document.querySelector('.cre-t-13-modal-cross-icon-wrapper').click());
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('CTA click fires the click goal and activates the sticky get-started link', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_VARIATION_JS, variantJs: VB_JS, variantCss: VB_CSS });
    await dispatchExitIntent(page);
    await page.evaluate(() => document.querySelector('.cre-t-13-modal-cta').click());
    expect(await getOptimizelyEvents(page, 'pay13_-_clicks_on__create_your_free_account__button')).toBe(1);
    await expect(page).toHaveURL(/#get-started$/);
  });
});

test.describe('PAY13 Control activation (pay13-trigger-control.js, derived) — exit intent only, no timer', () => {
  test.beforeEach(async ({ page }) => {
    // PAY13 is desktop-only per the client's own trigger code (isMobile = innerWidth < 768);
    // pin a desktop viewport here so trigger behavior is tested consistently across every
    // browser engine in the project matrix, independent of whichever device profile (including
    // the Mobile Chrome/Mobile Safari/Tablet projects) each project defaults to. The dedicated
    // "does NOT activate on a mobile viewport" tests below override this back down.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.clock.install();
    await loadFixture(page);
  });

  test('modal never fires from elapsed time alone, even well past 40s', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await page.clock.fastForward(5 * 60 * 1000); // 5 minutes, no exit intent
    expect(await isModalVisible(page)).toBe(false);
    expect(await page.evaluate(() => window.__cre_t13_activated)).toBe(false);
  });

  test('exit intent fires the modal', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    expect(await isModalVisible(page)).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains('cre-t-13-control'))).toBe(true);
    expect(await getOptimizelyEvents(page, 'pay13_-_modal_fires')).toBe(1);
    expect(await getCookieValue(page, 'cre-t-13')).toBe('modal-triggered');
  });

  test('does NOT activate on a mobile viewport, even after exit intent', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    expect(await page.evaluate(() => window.__cre_t13_activated)).toBe(false);
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('does not re-fire on a subsequent page view once already shown this session', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    expect(await isModalVisible(page)).toBe(true);

    await loadFixture(page);
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    expect(await page.evaluate(() => window.__cre_t13_activated)).toBe(false);
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('content matches PAY08 control copy', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    await expect(page.locator(SEL.title)).toContainText('Not sure if Pay.com.au is right for your business?');
    const cardTitles = await page.locator(SEL.cardTitle).allTextContents();
    expect(cardTitles).toEqual(['Create a Free Account', 'Use Your Existing Cards', 'Make a Single Payment']);
    await expect(page.locator(SEL.cta)).toHaveText('Create your free account');
  });

  test('close via cross icon and overlay both hide the modal', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    expect(await isModalVisible(page)).toBe(true);
    await page.evaluate(() => document.querySelector('.cre-t-13-overlay').click());
    await expect(page.locator(SEL.modal)).toHaveCount(0);
  });

  test('CTA click fires the click goal and activates the sticky get-started link', async ({ page }) => {
    await injectTriggerAndVariant(page, { triggerJs: TRIGGER_CONTROL_JS, variantJs: V2_JS, variantCss: V2_CSS });
    await dispatchExitIntent(page);
    await page.evaluate(() => document.querySelector('.cre-t-13-modal-cta').click());
    expect(await getOptimizelyEvents(page, 'pay13_-_clicks_on__create_your_free_account__button')).toBe(1);
    await expect(page).toHaveURL(/#get-started$/);
  });
});
