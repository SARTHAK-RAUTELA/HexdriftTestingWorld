// @ts-check
/**
 * PAY19 (cre-t-19) — pay.com.au "Getting Started" modal V2, Sitewide, Mobile only.
 *
 * Control: existing winning-variation-of-PAY08 code already live on the site (not supplied as a
 * local file for this round) — fires at 20s, mobile only. Not exercised here; verify visually
 * against the control preview URL.
 *
 * Variation 1 (vB.js/vB.css): new design per Figma, meant to fit the whole modal on most mobile
 * devices without scrolling, fires at 40s (not 20s).
 * Variation 2 (v2.js/v2.css): same design as V1, new copy (icons shared with PAY13).
 *
 * Mobile-only targeting for this test is enforced by the Optimizely audience config, not a JS
 * device check (confirmed) — unlike PAY13, there is no isMobile gate in vB.js/v2.js to test.
 *
 * Tested against a local static fixture (not the live site) using Playwright's Clock API for
 * deterministic timer control, per existing PAY08/PAY13 QA notes (live-site timer/exit-intent
 * testing is flaky due to 15+ third-party scripts on pay.com.au competing for the main thread —
 * see qa-knowledge-base/pay-com-au/cre-t-08-vB-exit-intent-mobile-timer.md and
 * cre-t-13-desktop-trigger-update.md).
 *
 * Served over a local HTTP server rather than file://: this client's fired-flag is a
 * `document.cookie` write (`cre-t-19=modal-shown; path=/`), and Chromium/WebKit silently refuse
 * to persist cookies set on file:// origins (Firefox tolerates it) — see _client-notes.md.
 *
 * Only run against the mobile projects (this is a mobile-only test):
 *   npx playwright test pay19-getting-started-modal --project="Mobile Chrome (Pixel 5)" --project="Mobile Safari (iPhone 12)"
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const http = require('http');

const FIXTURE_PATH = path.resolve(__dirname, '../../local_testing/Local2/pay19-fixture.html');
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
const VB_JS = fs.readFileSync(path.join(VARIATION_DIR, 'vB.js'), 'utf-8');
const VB_CSS = fs.readFileSync(path.join(VARIATION_DIR, 'vB.css'), 'utf-8');
const V2_JS = fs.readFileSync(path.join(VARIATION_DIR, 'v2.js'), 'utf-8');
const V2_CSS = fs.readFileSync(path.join(VARIATION_DIR, 'v2.css'), 'utf-8');

const SEL = {
  modal: '.cre-t-19-modal-main',
  overlay: '.cre-t-19-overlay',
  cross: '.cre-t-19-modal-cross-icon-wrapper',
  title: '.cre-t-19-main-title',
  subtitle: '.cre-t-19-sub-title',
  cardTitle: '.cre-t-19-card-title',
  cardSubtitle: '.cre-t-19-card-subtitle',
  highlight: '.cre-t-19-highlight',
  cta: '.cre-t-19-modal-cta',
  container: '.cre-t-19-modal-container',
  inner: '.cre-t-19-modal-inner',
};

async function loadFixture(page) {
  await page.goto(fixtureBaseUrl, { waitUntil: 'domcontentloaded' });
}

async function injectVariant(page, { js, css }) {
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: js });
  // let vB.js/v2.js's own waitForElement("body", init, 50, 15000) poll fire under the
  // already-installed fake clock (same two-stage-timer gotcha documented for PAY13).
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

// toBeVisible()/click() locator actions wait on real animation-frame paint stability, which
// never resolves under page.clock's virtualized requestAnimationFrame (see PAY13 notes) — query
// the CSSOM directly and dispatch clicks via page.evaluate instead.
async function isModalVisible(page) {
  return page.evaluate((sel) => {
    var el = document.querySelector(sel);
    if (!el) return false;
    return el.classList.contains('active') && getComputedStyle(el).display !== 'none';
  }, SEL.modal);
}

async function clickEl(page, selector) {
  await page.evaluate((sel) => document.querySelector(sel).click(), selector);
}

const VARIANTS = [
  { name: 'V1 (vB.js/vB.css)', js: VB_JS, css: VB_CSS },
  { name: 'V2 (v2.js/v2.css)', js: V2_JS, css: V2_CSS },
];

for (const variant of VARIANTS) {
  test.describe(`PAY19 ${variant.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.install();
      await loadFixture(page);
    });

    test('modal hidden immediately on load, before injecting anything', async ({ page }) => {
      await expect(page.locator(SEL.modal)).toHaveCount(0);
    });

    test('cumulative target time is recorded in sessionStorage as soon as the script initializes', async ({ page }) => {
      await injectVariant(page, variant);
      const targetTime = await page.evaluate(() => sessionStorage.getItem('cre-t-19-variation-time'));
      expect(targetTime).not.toBeNull();
      expect(await isModalVisible(page)).toBe(false);
    });

    test("BUG: fires at 20s instead of the spec'd 40s (VARIATION_DELAY_SECONDS is still 20)", async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(19000);
      expect(await isModalVisible(page)).toBe(false);
      await page.clock.fastForward(2000); // crosses 20s — should NOT have fired yet per the 40s spec
      await page.clock.fastForward(1100); // let the 1s poll interval + waitForElement tick
      expect(await isModalVisible(page)).toBe(false); // documents the bug: this fails on current code
    });

    test('fires at 40s per the ticket spec (hidden at 39s, visible at 40s)', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(39000);
      expect(await isModalVisible(page)).toBe(false); // fails today — actual code already fired at 20s
      await page.clock.fastForward(2000);
      expect(await isModalVisible(page)).toBe(true);
      expect(await getOptimizelyEvents(page, 'pay19_-_modal_fires')).toBe(1);
      expect(await getCookieValue(page, 'cre-t-19')).toBe('modal-shown');
    });

    test('40s timer persists across a simulated page reload (cumulative time, not reset)', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(30000); // 30s elapsed (past the current 20s bug, before the 40s spec)
      await loadFixture(page); // new page view, same tab/session
      await injectVariant(page, variant);
      // only ~10s should remain toward the 40s cumulative target
      await page.clock.fastForward(9000);
      expect(await isModalVisible(page)).toBe(false);
      await page.clock.fastForward(2000);
      expect(await isModalVisible(page)).toBe(true);
    });

    test('does not re-fire on a later page view once already shown this session (cookie guard)', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(41000);
      expect(await isModalVisible(page)).toBe(true);

      await loadFixture(page);
      await injectVariant(page, variant);
      await page.clock.fastForward(41000);
      expect(await isModalVisible(page)).toBe(false);
      expect(await page.evaluate(() => document.querySelectorAll('.cre-t-19-modal-main').length)).toBe(0);
    });

    test('close via cross icon hides the modal', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(41000);
      expect(await isModalVisible(page)).toBe(true);
      await clickEl(page, SEL.cross);
      expect(await isModalVisible(page)).toBe(false);
    });

    test('close via overlay click hides the modal', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(41000);
      expect(await isModalVisible(page)).toBe(true);
      await clickEl(page, SEL.overlay);
      expect(await isModalVisible(page)).toBe(false);
    });

    test('CTA click fires the click goal, activates the sticky get-started link, and closes the modal', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(41000);
      await clickEl(page, SEL.cta);
      expect(await getOptimizelyEvents(page, 'pay19_-_clicks_on__create_your_free_account__button')).toBe(1);
      await expect(page).toHaveURL(/#get-started$/);
      expect(await isModalVisible(page)).toBe(false);
    });

    test('whole modal content fits on the mobile viewport without being clipped or requiring scroll', async ({ page }) => {
      await injectVariant(page, variant);
      await page.clock.fastForward(41000);
      const viewport = page.viewportSize();
      const layout = await page.evaluate((sel) => {
        const container = document.querySelector(sel.container);
        const inner = document.querySelector(sel.inner);
        const rect = container.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          containerClientHeight: container.clientHeight,
          innerScrollHeight: inner.scrollHeight,
        };
      }, SEL);
      expect(layout.top).toBeGreaterThanOrEqual(0);
      expect(layout.bottom).toBeLessThanOrEqual(viewport.height);
      // content taller than the visible container is silently clipped (overflow:hidden), not scrollable
      expect(layout.innerScrollHeight).toBeLessThanOrEqual(layout.containerClientHeight + 1);
    });
  });
}

test.describe('PAY19 V1 (vB.js/vB.css) — content vs Figma', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await loadFixture(page);
    await injectVariant(page, VARIANTS[0]);
    await page.clock.fastForward(41000);
  });

  test('main title matches Figma exactly', async ({ page }) => {
    await expect(page.locator(SEL.title)).toHaveText('Not sure if pay.com.au is right for your business?', { useInnerText: true });
  });

  test('subtitle paragraph is present in the DOM but hidden (no subtitle shown, per Figma)', async ({ page }) => {
    await expect(page.locator(SEL.subtitle)).toHaveCount(1);
    const display = await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).display, SEL.subtitle);
    expect(display).toBe('none');
  });

  test('3 feature cards match Figma copy', async ({ page }) => {
    const titles = await page.locator(SEL.cardTitle).allTextContents();
    expect(titles).toEqual(['Create a Free Account', 'Use Your Existing Cards', 'Start With a Single Payment']);
    const subtitles = (await page.locator(SEL.cardSubtitle).allTextContents()).map((t) => t.trim());
    expect(subtitles).toEqual([
      'Get set up in minutes. No charge unless you make a payment.',
      'Keep using your cards, bank accounts and software.',
      'See your fees, points and rewards before you pay.',
    ]);
  });

  test('CTA button text matches Figma', async ({ page }) => {
    await expect(page.locator(SEL.cta)).toHaveText('Create your free account');
  });
});

test.describe('PAY19 V2 (v2.js/v2.css) — content vs Figma', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await loadFixture(page);
    await injectVariant(page, VARIANTS[1]);
    await page.clock.fastForward(41000);
  });

  test('main title matches Figma, with "your" as a separately-styled highlight span', async ({ page }) => {
    await expect(page.locator(SEL.title)).toContainText('See');
    await expect(page.locator(SEL.title)).toContainText('fees, points and rewards');
    await expect(page.locator(SEL.highlight)).toHaveText('your');
  });

  test('3 feature cards match Figma copy (PAY13-style icons/content)', async ({ page }) => {
    const titles = await page.locator(SEL.cardTitle).allTextContents();
    expect(titles).toEqual(['Create a Free Account', 'See Your Numbers', 'Then Decide']);
    const subtitles = (await page.locator(SEL.cardSubtitle).allTextContents()).map((t) => t.trim());
    expect(subtitles).toEqual([
      'Get started in minutes. No credit card required.',
      "See what you'd pay and earn based on your spend, card and rewards option.",
      'If the numbers make sense, make your first payment and start earning.',
    ]);
  });

  test('CTA button text matches Figma', async ({ page }) => {
    await expect(page.locator(SEL.cta)).toHaveText('Create your free account');
  });

  test('BUG: "your" highlight is not colored — v2.css has no .cre-t-19-highlight rule (wrong CSS file, scoped to .cre-t-13-control)', async ({ page }) => {
    const color = await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).color, SEL.highlight);
    // Figma spec: #3066C9 (rgb(48, 102, 201)) — v2.css only defines .cre-t-13-control .cre-t-13-highlight
    expect(color).toBe('rgb(48, 102, 201)'); // fails today — inherits default black text color
  });

  test('BUG: modal renders with none of its CSS — v2.css is entirely scoped to .cre-t-13-control, not .cre-t-19-variation', async ({ page }) => {
    const styles = await page.evaluate((sel) => {
      const overlay = document.querySelector(sel.overlay);
      const container = document.querySelector(sel.container);
      return {
        overlayPosition: getComputedStyle(overlay).position,
        containerPosition: getComputedStyle(container).position,
      };
    }, SEL);
    // Figma/vB.css spec: overlay + container are position:fixed, full-bleed overlay + centered card.
    // v2.css defines this only under `.cre-t-13-control .cre-t-13-overlay`/`.cre-t-13-modal-container`,
    // which never matches (v2.js adds body class `cre-t-19-variation`) — so both fall back to `static`.
    expect(styles.overlayPosition).toBe('fixed');
    expect(styles.containerPosition).toBe('fixed');
  });
});
