// AFP13 — Register & Save Button A/B Test
// Variation: Adds "Register & Save $675" yellow CTA in nav + replaces Login text with profile icon
// Audience: Desktop only  |  Site: all pages on conference.financialprofessionals.org
// Injection: page.addInitScript + page.addStyleTag — NOT via console/eval
//
// Architecture: beforeAll loads the page ONCE per browser project.
// All assertions run against the already-loaded variation page.

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const SITE_URL  = 'https://conference.financialprofessionals.org/';
const JS_PATH   = path.resolve(__dirname, '../../local_testing/Local2/variation/vB.js');
const CSS_PATH  = path.resolve(__dirname, '../../local_testing/Local2/variation/vB.css');
const SS_DIR    = path.resolve(__dirname, '../afp13-screenshots');

const JS_CODE   = fs.readFileSync(JS_PATH,  'utf8');
const CSS_CODE  = fs.readFileSync(CSS_PATH, 'utf8');

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

function browserSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

let varPage  = null;
let ctrlPage = null;

test.describe.serial('AFP13 — Register & Save Button Variation', () => {

  test.beforeAll(async ({ browser }, testInfo) => {
    if (testInfo.project.name.toLowerCase().includes('mobile')) return;

    const vp = { width: 1440, height: 900 };

    // ── Variation page ────────────────────────────────────────────────────────
    const varCtx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true });
    varPage = await varCtx.newPage();
    await varPage.addInitScript({ content: JS_CODE });
    await varPage.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    try {
      await varPage.addStyleTag({ content: CSS_CODE });
    } catch {
      await varPage.evaluate((css) => {
        const s = document.createElement('style');
        s.id = 'afp13-var-css';
        s.textContent = css;
        (document.head || document.documentElement).appendChild(s);
      }, CSS_CODE);
    }
    await varPage.waitForFunction(
      () => document.body.classList.contains('cre-t-13'),
      { timeout: 25000 }
    );

    // ── Control page ──────────────────────────────────────────────────────────
    const ctrlCtx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true });
    ctrlPage = await ctrlCtx.newPage();
    await ctrlPage.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await ctrlPage.waitForTimeout(2000);
  });

  test.afterAll(async () => {
    await varPage?.close().catch(() => {});
    await ctrlPage?.close().catch(() => {});
    varPage  = null;
    ctrlPage = null;
  });

  function skipIfMobileOrNoPage(testInfo) {
    test.skip(
      testInfo.project.name.toLowerCase().includes('mobile'),
      'AFP13 targets desktop only'
    );
    test.skip(!varPage, 'varPage not initialised (setup failed)');
  }

  // ── Group 1: Init ─────────────────────────────────────────────────────────

  test('TC-AFP13-01 [Init] Body has class cre-t-13', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('body')).toHaveClass(/cre-t-13/);
  });

  test('TC-AFP13-02 [Init] Duplicate init guard — cre-t-13 appears exactly once on body', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const count = await varPage.evaluate(() =>
      document.body.className.trim().split(/\s+/).filter(c => c === 'cre-t-13').length
    );
    expect(count).toBe(1);
  });

  // ── Group 2: Register Button Existence ────────────────────────────────────

  test('TC-AFP13-03 [Button] .cre-t-13-button exists in DOM', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('.cre-t-13-button')).toBeAttached();
  });

  test('TC-AFP13-04 [Button] Register button is visible', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('.cre-t-13-button')).toBeVisible();
  });

  test('TC-AFP13-05 [Button] Button inserted immediately before .nav-utilities-wrapper', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const isImmediatelyBefore = await varPage.evaluate(() => {
      const btn     = document.querySelector('.cre-t-13-button');
      const wrapper = document.querySelector('.nav-utilities-wrapper');
      if (!btn || !wrapper) return false;
      return wrapper.previousElementSibling === btn;
    });
    expect(isImmediatelyBefore).toBe(true);
  });

  // ── Group 3: Register Button Content ──────────────────────────────────────

  test('TC-AFP13-06 [Button] Text is "Register & Save $675"', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('.cre-t-13-button-copy-a')).toHaveText('Register & Save $675');
  });

  test('TC-AFP13-07 [Button] href points to /registration', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const href = await varPage.locator('.cre-t-13-button-copy-a').getAttribute('href');
    expect(href).toBe('https://conference.financialprofessionals.org/registration');
  });

  test('TC-AFP13-08 [Button] No target="_blank" — opens in same tab', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const target = await varPage.locator('.cre-t-13-button-copy-a').getAttribute('target');
    expect(target).not.toBe('_blank');
  });

  // ── Group 4: Register Button Styles ───────────────────────────────────────

  test('TC-AFP13-09 [Style] Button background is #FCD426 (yellow — rgb 252,212,38)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const bg = await varPage.locator('.cre-t-13-button-copy-a').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg).toBe('rgb(252, 212, 38)');
  });

  test('TC-AFP13-10 [Style] Button text color is black (rgb 0,0,0)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const color = await varPage.locator('.cre-t-13-button-copy-a').evaluate(el =>
      window.getComputedStyle(el).color
    );
    expect(color).toBe('rgb(0, 0, 0)');
  });

  test('TC-AFP13-11 [Style] Button font-size is 14px', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const fontSize = await varPage.locator('.cre-t-13-button-copy-a').evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    expect(fontSize).toBe('14px');
  });

  test('TC-AFP13-12 [Style] Button font-weight is 500', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const fontWeight = await varPage.locator('.cre-t-13-button-copy-a').evaluate(el =>
      window.getComputedStyle(el).fontWeight
    );
    expect(fontWeight).toBe('500');
  });

  // ── Group 5: Login Icon Replacement ───────────────────────────────────────

  test('TC-AFP13-13 [Login] Profile <img> icon is present inside login link', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    await expect(varPage.locator('.login-link a img')).toBeAttached();
  });

  test('TC-AFP13-14 [Login] Login link direct text nodes are empty (no "Login" text)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const directText = await varPage.locator('.login-link a').evaluate(el =>
      Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join('')
    );
    expect(directText).toBe('');
  });

  test('TC-AFP13-15 [Login] Profile icon src contains "profile.svg"', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const src = await varPage.locator('.login-link a img').getAttribute('src');
    expect(src).toContain('profile.svg');
  });

  test('TC-AFP13-16 [Login] Login link background is transparent (background:none applied)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const bg = await varPage.locator('.login-link a').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent').toBe(true);
  });

  // ── Group 6: CSS Layout Changes ───────────────────────────────────────────

  test('TC-AFP13-17 [CSS] #main-nav-wrapper .nav-utilities is hidden (display:none)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const display = await varPage.evaluate(() => {
      const el = document.querySelector('#main-nav-wrapper .nav-utilities');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display).toBe('none');
  });

  test('TC-AFP13-18 [CSS] .nav-utilities-wrapper has display:flex', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const display = await varPage.evaluate(() => {
      const el = document.querySelector('.nav-utilities-wrapper');
      return el ? window.getComputedStyle(el).display : 'not-found';
    });
    expect(display).toBe('flex');
  });

  // ── Group 7: Sitewide — Multiple Pages ────────────────────────────────────

  test('TC-AFP13-19 [Sitewide] Variation fires on /registration page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const browser = varPage.context().browser();
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
    const page2 = await ctx2.newPage();
    try {
      await page2.addInitScript({ content: JS_CODE });
      await page2.goto('https://conference.financialprofessionals.org/registration', { waitUntil: 'domcontentloaded', timeout: 45000 });
      try {
        await page2.addStyleTag({ content: CSS_CODE });
      } catch {
        await page2.evaluate((css) => {
          const s = document.createElement('style'); s.textContent = css;
          (document.head || document.documentElement).appendChild(s);
        }, CSS_CODE);
      }
      await page2.waitForFunction(() => document.body.classList.contains('cre-t-13'), { timeout: 25000 });
      await expect(page2.locator('body')).toHaveClass(/cre-t-13/);
      await expect(page2.locator('.cre-t-13-button')).toBeAttached();
    } finally {
      await page2.close(); await ctx2.close();
    }
  });

  test('TC-AFP13-20 [Sitewide] Variation fires on /program/overview/schedule page', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const browser = varPage.context().browser();
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
    const page3 = await ctx3.newPage();
    try {
      await page3.addInitScript({ content: JS_CODE });
      await page3.goto('https://conference.financialprofessionals.org/program/overview/schedule', { waitUntil: 'domcontentloaded', timeout: 45000 });
      try {
        await page3.addStyleTag({ content: CSS_CODE });
      } catch {
        await page3.evaluate((css) => {
          const s = document.createElement('style'); s.textContent = css;
          (document.head || document.documentElement).appendChild(s);
        }, CSS_CODE);
      }
      await page3.waitForFunction(() => document.body.classList.contains('cre-t-13'), { timeout: 25000 });
      await expect(page3.locator('body')).toHaveClass(/cre-t-13/);
      await expect(page3.locator('.cre-t-13-button')).toBeAttached();
    } finally {
      await page3.close(); await ctx3.close();
    }
  });

  // ── Group 8: Control Comparison ───────────────────────────────────────────

  test('TC-AFP13-21 [Control] Control page has NO cre-t-13 body class', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const hasCls = await ctrlPage.evaluate(() => document.body.classList.contains('cre-t-13'));
    expect(hasCls).toBe(false);
  });

  test('TC-AFP13-22 [Control] Control page has NO .cre-t-13-button element', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const count = await ctrlPage.evaluate(() =>
      document.querySelectorAll('.cre-t-13-button').length
    );
    expect(count).toBe(0);
  });

  test('TC-AFP13-23 [Control] Control login link has no profile icon (no img injected)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const hasImg = await ctrlPage.evaluate(() =>
      !!document.querySelector('.login-link a img')
    );
    expect(hasImg).toBe(false);
  });

  // ── Group 9: Desktop Viewport ─────────────────────────────────────────────

  test('TC-AFP13-24 [Desktop] Viewport width ≥ 1440px (desktop audience confirmed)', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const vp = varPage.viewportSize();
    expect(vp.width).toBeGreaterThanOrEqual(1440);
  });

  // ── Group 10: Screenshots ─────────────────────────────────────────────────

  test('TC-AFP13-25 [Screenshot] Variation — nav bar with new button + profile icon', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    const slug   = browserSlug(testInfo.project.name);
    const ssPath = path.join(SS_DIR, `variation-desktop-${slug}.png`);
    await varPage.screenshot({ path: ssPath, fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 160 } });
    await testInfo.attach(`variation-${slug}`, { path: ssPath, contentType: 'image/png' });
    expect(fs.existsSync(ssPath)).toBe(true);
  });

  test('TC-AFP13-26 [Screenshot] Control — nav bar without variation', async ({}, testInfo) => {
    skipIfMobileOrNoPage(testInfo);
    test.skip(!ctrlPage, 'Control page not loaded');
    const slug   = browserSlug(testInfo.project.name);
    const ssPath = path.join(SS_DIR, `control-desktop-${slug}.png`);
    await ctrlPage.screenshot({ path: ssPath, fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 160 } });
    await testInfo.attach(`control-${slug}`, { path: ssPath, contentType: 'image/png' });
    expect(fs.existsSync(ssPath)).toBe(true);
  });

});
