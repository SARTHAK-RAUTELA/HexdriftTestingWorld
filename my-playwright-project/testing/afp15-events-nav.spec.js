// AFP15 — Events Navigation A/B Test
// Variation: AFP 2026 Conference header + 6 new links + ENDS JUNE tag
// Audience: Desktop only  |  Site: all pages on financialprofessionals.org
// Injection: page.addInitScript + page.addStyleTag  — NOT via console/eval
//
// Architecture: beforeAll loads the page ONCE per browser project.
// All assertions run against the already-open Events dropdown.
// This keeps total run time ~5 min instead of ~40 min.

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const SITE_URL = 'https://www.financialprofessionals.org/';
const JS_PATH  = path.resolve(__dirname, '../../local_testing/Local2/variation/vB.js');
const CSS_PATH = path.resolve(__dirname, '../../local_testing/Local2/variation/vB.css');
const SS_DIR   = path.resolve(__dirname, '../afp15-screenshots');

const JS_CODE  = fs.readFileSync(JS_PATH,  'utf8');
const CSS_CODE = fs.readFileSync(CSS_PATH, 'utf8');

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

function browserSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Shared page state — loaded ONCE per browser in beforeAll
let varPage     = null;
let ctrlPage    = null;
let navDebugData = null;

test.describe.serial('AFP15 — Events Nav Variation', () => {

  test.beforeAll(async ({ browser }, testInfo) => {
    // Skip entire suite for mobile projects
    if (testInfo.project.name.toLowerCase().includes('mobile')) return;

    const vp = { width: 1440, height: 900 };

    // ── Variation page (with vB.js + vB.css injected) ──────────────────────────
    const varCtx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true });
    varPage = await varCtx.newPage();
    await varPage.addInitScript({ content: JS_CODE });
    await varPage.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await varPage.addStyleTag({ content: CSS_CODE });
    await varPage.waitForFunction(
      () => document.body.classList.contains('cre-t-15'),
      { timeout: 25000 }
    );

    // ── Capture debug data for selector audit (Chrome only) ────────────────────
    if (testInfo.project.name === 'Chrome Desktop') {
      navDebugData = await varPage.evaluate(() => {
        const li = Array.from(document.querySelectorAll('li.afp-nav__item'))
          .find(el => el.querySelector('button')?.textContent?.trim() === 'Events');
        const subNavTitles = Array.from(document.querySelectorAll('.afp-nav__sub-nav-title'))
          .map(el => ({
            tag: el.tagName, href: el.getAttribute('href'),
            text: el.textContent?.trim().substring(0, 60),
            classes: el.className,
          }));
        return {
          eventsLiClasses: li?.className ?? 'NOT FOUND',
          subNavTitles,
          hasCre15Conference: !!document.querySelector('li.cre-t-15-conference'),
          hasCre15Archive: !!document.querySelector('li.cre-t-15-conference-archive'),
          newItemCount: document.querySelectorAll('li.cre-t-15-nav-item').length,
        };
      });
      const debugPath = path.join(SS_DIR, 'nav-debug.json');
      fs.writeFileSync(debugPath, JSON.stringify(navDebugData, null, 2), 'utf8');
      console.log('\n=== AFP15 Nav Debug ===\n' + JSON.stringify(navDebugData, null, 2));
    }

    // ── Open Events dropdown (variation page) ──────────────────────────────────
    const eventsBtn = varPage.locator('li.afp-nav__item > [type="button"]').filter({ hasText: /^Events$/ });
    await eventsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await eventsBtn.click();
    try {
      await expect(eventsBtn).toHaveAttribute('aria-expanded', 'true', { timeout: 3000 });
    } catch {
      await varPage.waitForTimeout(800);
    }

    // ── Control page (no injection) — for screenshots & comparison ─────────────
    const ctrlCtx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true });
    ctrlPage = await ctrlCtx.newPage();
    await ctrlPage.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const ctrlBtn = ctrlPage.locator('li.afp-nav__item > [type="button"]').filter({ hasText: /^Events$/ });
    await ctrlBtn.waitFor({ state: 'visible', timeout: 15000 });
    await ctrlBtn.click();
    try {
      await expect(ctrlBtn).toHaveAttribute('aria-expanded', 'true', { timeout: 3000 });
    } catch {
      await ctrlPage.waitForTimeout(800);
    }
  });

  test.afterAll(async () => {
    await varPage?.close().catch(() => {});
    await ctrlPage?.close().catch(() => {});
    varPage = null;
    ctrlPage = null;
  });

  // Helper: skip if this is a mobile project or page wasn't loaded
  function skipIfMobileOrNoPage(testInfo) {
    test.skip(
      testInfo.project.name.toLowerCase().includes('mobile'),
      'AFP15 targets desktop only'
    );
    test.skip(!varPage, 'varPage not initialised (setup failed)');
  }

  // ── TC-AFP15-00: Diagnostic ───────────────────────────────────────────────────

  test('TC-AFP15-00 [Diag] Nav structure captured — see nav-debug.json', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Chrome Desktop', 'Diagnostic Chrome only');
    // Just confirm debug data was captured
    expect(navDebugData).not.toBeNull();
    console.log('Debug data:', JSON.stringify(navDebugData, null, 2));
  });

  // ── Group 1: Variation Init ───────────────────────────────────────────────────

  test('TC-AFP15-01 [Init] Body has class cre-t-15', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('body')).toHaveClass(/cre-t-15/);
  });

  test('TC-AFP15-02 [Init] Events nav item gets class cre-t-15-events', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('li.cre-t-15-events')).toBeAttached();
  });

  test('TC-AFP15-03 [Init] Annual Conference li gets class cre-t-15-conference', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('li.cre-t-15-conference')).toBeAttached({ timeout: 5000 });
  });

  test('TC-AFP15-04 [Init] Conference Session Archives li gets class cre-t-15-conference-archive', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('li.cre-t-15-conference-archive')).toBeAttached({ timeout: 5000 });
  });

  test('TC-AFP15-05 [Init] Duplicate-init guard — cre-t-15 appears exactly once on body', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const count = await varPage.evaluate(() =>
      document.body.className.trim().split(/\s+/).filter(c => c === 'cre-t-15').length
    );
    expect(count).toBe(1);
  });

  // ── Group 2: CSS Hide ─────────────────────────────────────────────────────────

  test('TC-AFP15-06 [CSS] Conference Session Archives is hidden (display:none)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const archiveLi = varPage.locator('li.cre-t-15-conference-archive');
    await expect(archiveLi).toBeAttached({ timeout: 5000 });
    const display = await archiveLi.evaluate(el => window.getComputedStyle(el).display);
    expect(display, 'Expected display:none from CSS rule').toBe('none');
  });

  // ── Group 3: Links Count ──────────────────────────────────────────────────────

  test('TC-AFP15-07 [Links] Exactly 6 new nav items injected', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('li.cre-t-15-nav-item')).toHaveCount(6);
  });

  // ── Group 4: Link Text & Visibility ──────────────────────────────────────────

  test('TC-AFP15-08 [Links] "Register & Save $675" — visible, correct text', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const link = varPage.locator('li.cre-t-15-nav-item-register a.afp-nav__link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Register & Save $675');
  });

  test('TC-AFP15-09 [Links] "Schedule at a Glance" — visible, correct text', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const link = varPage.locator('li.cre-t-15-nav-item-glance a.afp-nav__link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Schedule at a Glance');
  });

  test('TC-AFP15-10 [Links] "Team Pricing" — visible, correct text', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const link = varPage.locator('li.cre-t-15-nav-item-pricing a.afp-nav__link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Team Pricing');
  });

  test('TC-AFP15-11 [Links] "CTP / FPAC / CPE Credits" — visible, correct text', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const link = varPage.locator('li.cre-t-15-nav-item-ctp a.afp-nav__link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('CTP / FPAC / CPE Credits');
  });

  test('TC-AFP15-12 [Links] "Convince Your Manager" — visible, correct text', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const link = varPage.locator('li.cre-t-15-nav-item-convince a.afp-nav__link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Convince Your Manager');
  });

  test('TC-AFP15-13 [Links] "Hotel & Travel" — visible, correct text', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const link = varPage.locator('li.cre-t-15-nav-item-hotel a.afp-nav__link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Hotel & Travel');
  });

  // ── Group 5: Link HREFs ───────────────────────────────────────────────────────

  test('TC-AFP15-14 [Href] Register & Save $675 → schedule page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('li.cre-t-15-nav-item-register a.afp-nav__link').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/program/overview/schedule');
  });

  test('TC-AFP15-15 [Href] Schedule at a Glance → schedule page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('li.cre-t-15-nav-item-glance a.afp-nav__link').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/program/overview/schedule');
  });

  test('TC-AFP15-16 [Href] Team Pricing → registration/team', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('li.cre-t-15-nav-item-pricing a.afp-nav__link').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/registration/team');
  });

  test('TC-AFP15-17 [Href] CTP / FPAC / CPE Credits → recertification page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('li.cre-t-15-nav-item-ctp a.afp-nav__link').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/general-information/about-the-event/recertification');
  });

  test('TC-AFP15-18 [Href] Convince Your Manager → convince page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('li.cre-t-15-nav-item-convince a.afp-nav__link').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/general-information/experience/convince');
  });

  test('TC-AFP15-19 [Href] Hotel & Travel → hotel-travel page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('li.cre-t-15-nav-item-hotel a.afp-nav__link').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/hotel-travel');
  });

  // ── Group 6: All links open in _self ──────────────────────────────────────────

  test('TC-AFP15-20 [Links] All 6 new links have target="_self"', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const links = varPage.locator('li.cre-t-15-nav-item a.afp-nav__link');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const target = await links.nth(i).getAttribute('target');
      expect(target, `Link ${i} should have target="_self"`).toBe('_self');
    }
  });

  // ── Group 7: ENDS JUNE Tag ────────────────────────────────────────────────────

  test('TC-AFP15-21 [Tag] ENDS JUNE tag element exists (.cre-t-15-tool)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('.cre-t-15-tool')).toBeAttached();
  });

  test('TC-AFP15-22 [Tag] Tag is visible inside Register & Save item', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('li.cre-t-15-nav-item-register .cre-t-15-tool')).toBeVisible();
  });

  // BUG-01: spec/Figma says "ENDS JUNE 6" — code has "ENDS JUNE 26"
  test('TC-AFP15-23 [Tag][BUG-01] Tag text = "ENDS JUNE 6" per spec — FAIL means code has wrong date', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('.cre-t-15-tool')).toHaveText('ENDS JUNE 6');
  });

  test('TC-AFP15-24 [Tag] Tag background color is #2C8FBF (rgb 44,143,191)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const bg = await varPage.locator('.cre-t-15-tool').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg).toBe('rgb(44, 143, 191)');
  });

  test('TC-AFP15-25 [Tag] Tag text color is white', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const color = await varPage.locator('.cre-t-15-tool').evaluate(el =>
      window.getComputedStyle(el).color
    );
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('TC-AFP15-26 [Tag] Tag font-size is 12px', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const fontSize = await varPage.locator('.cre-t-15-tool').evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    expect(fontSize).toBe('12px');
  });

  test('TC-AFP15-27 [Tag] Tag is positioned absolutely (right-side of Register li)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const pos = await varPage.locator('.cre-t-15-tool').evaluate(el =>
      window.getComputedStyle(el).position
    );
    expect(pos).toBe('absolute');
  });

  test('TC-AFP15-28 [Tag] Tag has border-radius > 0 (pill shape)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const br = await varPage.locator('.cre-t-15-tool').evaluate(el =>
      parseFloat(window.getComputedStyle(el).borderRadius)
    );
    expect(br).toBeGreaterThan(0);
  });

  // ── Group 8: Header Text Change ───────────────────────────────────────────────

  // BUG-02: code adds CSS class to the li but NEVER changes the text "Annual Conference"
  test('TC-AFP15-29 [Header][BUG-02] Sub-nav header text = "AFP 2026 Conference" — FAIL means text change is missing in code', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const header = varPage.locator('li.cre-t-15-conference .afp-nav__sub-nav-title');
    await expect(header).toHaveText('AFP 2026 Conference');
  });

  // ── Group 9: Dropdown & DOM behavior ─────────────────────────────────────────

  test('TC-AFP15-30 [Dropdown] Events button is visible in nav', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('li.cre-t-15-events > [type="button"]')).toBeVisible();
  });

  test('TC-AFP15-31 [Dropdown] Duplicate injection guard — still exactly 6 items after DOM re-check', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const count = await varPage.evaluate(() => {
      const ul = document.querySelector('.cre-t-15-conference ul');
      return ul ? ul.querySelectorAll('.cre-t-15-nav-item').length : 0;
    });
    expect(count).toBe(6);
  });

  // ── Group 10: Desktop viewport ────────────────────────────────────────────────

  test('TC-AFP15-32 [Desktop] Viewport width ≥ 1200px (desktop audience confirmed)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const vp = varPage.viewportSize();
    expect(vp.width).toBeGreaterThanOrEqual(1440);
  });

  // ── Group 11: Control comparison ─────────────────────────────────────────────

  test('TC-AFP15-33 [Control] Control page has NO cre-t-15 body class', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const hasCls = await ctrlPage.evaluate(() => document.body.classList.contains('cre-t-15'));
    expect(hasCls).toBe(false);
  });

  test('TC-AFP15-34 [Control] Control page has NO cre-t-15-nav-item elements', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const count = await ctrlPage.evaluate(() =>
      document.querySelectorAll('li.cre-t-15-nav-item').length
    );
    expect(count).toBe(0);
  });

  // ── Group 12: Screenshots ─────────────────────────────────────────────────────

  test('TC-AFP15-35 [Screenshot] Variation — Events dropdown open', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const slug   = browserSlug(testInfo.project.name);
    const ssPath = path.join(SS_DIR, `variation-desktop-${slug}.png`);
    await varPage.screenshot({ path: ssPath, fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 620 } });
    await testInfo.attach(`variation-${slug}`, { path: ssPath, contentType: 'image/png' });
    expect(fs.existsSync(ssPath)).toBe(true);
  });

  test('TC-AFP15-36 [Screenshot] Control — Events dropdown open (no variation)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const slug   = browserSlug(testInfo.project.name);
    const ssPath = path.join(SS_DIR, `control-desktop-${slug}.png`);
    await ctrlPage.screenshot({ path: ssPath, fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 620 } });
    await testInfo.attach(`control-${slug}`, { path: ssPath, contentType: 'image/png' });
    expect(fs.existsSync(ssPath)).toBe(true);
  });

});
