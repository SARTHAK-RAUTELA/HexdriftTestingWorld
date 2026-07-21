// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.thumbtack.com/pro?TT_QA=true';
const VB_JS_PATH = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation', 'vB.js');
const VARIATION_JS = fs.readFileSync(VB_JS_PATH, 'utf-8');

const DESKTOP_H1_SELECTOR = '[class*="hero_heroInnerOffsetRight"] [class*="hero_heroTitle"]';
const MOBILE_H1_SELECTOR = '[class*="hero_heroInnerOffsetLeft"] [class*="hero_heroTitle"]';
const SUBHEAD_SELECTOR = '[class*="hero_heroInnerOffsetRight"] p[class*="Type_text1"]';
const CTA_SELECTOR = '[class*="hero_heroCategoryTaxonSearchBox"] button[type="button"] span[class*="themed_flexWrapper"]';

const EXPECTED_NEW_FIRST_LINE = 'Find more customers in';
const VARIATION_CLASS = 'Pro_landing_page_phase_1';

async function gotoAndWaitPastWafChallenge(page) {
  // thumbtack.com fronts requests with AWS WAF Bot Control: the first response is a
  // 202 challenge shell (x-amzn-waf-action: challenge). The client-side challenge JS
  // resolves and the real Next.js page hydrates in ~2-5s. Wait for the real hero H1
  // to exist before doing anything else, or every DOM assertion sees the challenge shell.
  await page.goto(URL);
  await page.waitForSelector(DESKTOP_H1_SELECTOR, { timeout: 20000 });
}

async function injectVariation(page) {
  await page.addScriptTag({ content: VARIATION_JS });
  // interval-based DOM mutation runs on a 50ms tick; give it a moment to settle.
  // 1.5s (not 500ms) — under sequential multi-browser runs the WAF challenge + Next.js
  // hydration can still be settling, and a short wait here produces flaky snapshots
  // that look like double-injection or missed-update bugs but aren't (see client notes).
  await page.waitForTimeout(1500);
}

async function getHeroState(page) {
  return page.evaluate(({ d, m }) => {
    const desktop = document.querySelector(d);
    const mobile = document.querySelector(m);
    return {
      desktopHtml: desktop ? desktop.innerHTML : null,
      desktopDisplay: desktop ? getComputedStyle(desktop).display : null,
      mobileHtml: mobile ? mobile.innerHTML : null,
      mobileDisplay: mobile ? getComputedStyle(mobile).display : null,
    };
  }, { d: DESKTOP_H1_SELECTOR, m: MOBILE_H1_SELECTOR });
}

test.describe('Thumbtack Pro hero header — "Find more customers" test', () => {
  test('TC-01: Control — desktop hero H1 has baseline "Grow your business in [City]." copy', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    const state = await getHeroState(page);
    expect(state.desktopHtml).toBeTruthy();
    expect(state.desktopHtml).toMatch(/^Grow your business in\s*<br>.+\.$/);
  });

  test('TC-02: Control — mobile-only hero H1 has baseline "Get jobs in [City]." copy (pre-existing, unrelated to control/variant A/B copy in the brief)', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    const state = await getHeroState(page);
    expect(state.mobileHtml).toBeTruthy();
    expect(state.mobileHtml).toMatch(/^Get jobs in<br>.+\.$/);
  });

  test('TC-03: Variation — body gets the variation_name class after injection', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    await injectVariation(page);
    const hasClass = await page.evaluate((cls) => document.body.classList.contains(cls), VARIATION_CLASS);
    expect(hasClass).toBe(true);
  });

  test('TC-04: Variation — desktop hero H1 first line changes to "Find more customers in", city (2nd line) unchanged', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    const before = await getHeroState(page);
    const cityLine = before.desktopHtml.split('<br>')[1];

    await injectVariation(page);
    const after = await getHeroState(page);

    expect(after.desktopHtml.startsWith(EXPECTED_NEW_FIRST_LINE)).toBe(true);
    expect(after.desktopHtml.split('<br>')[1]).toBe(cityLine);
  });

  test('BUG-01 [HIGH, documents known gap] — mobile-only hero H1 is NEVER updated by the variation, on ANY viewport', async ({ page }) => {
    // HERO_H1_SELECTOR in vB.js is scoped to [class*="hero_heroInnerOffsetRight"], which only
    // ever contains the desktop hero markup. The mobile-only H1 lives in a sibling
    // hero_heroInnerOffsetLeft block and is structurally unreachable by this selector.
    // Device targeting for this test is "dWeb + mWeb" per the brief, so mWeb users never see the change.
    await gotoAndWaitPastWafChallenge(page);
    const before = await getHeroState(page);
    await injectVariation(page);
    const after = await getHeroState(page);

    expect(after.mobileHtml).toBe(before.mobileHtml);
    expect(after.mobileHtml).toMatch(/^Get jobs in<br>/); // still the untouched original copy
  });

  test('TC-05 [cosmetic, LOW] — NEW_FIRST_LINE has a double trailing space vs single space in control; renders identically due to HTML whitespace collapsing', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    await injectVariation(page);
    const rawHtml = await page.evaluate((sel) => document.querySelector(sel).innerHTML, DESKTOP_H1_SELECTOR);
    const renderedText = await page.evaluate((sel) => document.querySelector(sel).innerText, DESKTOP_H1_SELECTOR);

    expect(rawHtml.startsWith('Find more customers in  <br>')).toBe(true); // raw markup has 2 spaces (code smell)
    expect(renderedText).not.toMatch(/customers in {2}/); // but the browser collapses it visually — no visible bug
  });

  test('TC-06: Subhead ("Over 30,000+ leads...") is unchanged by the variation', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    const before = await page.locator(SUBHEAD_SELECTOR).first().innerText();
    await injectVariation(page);
    const after = await page.locator(SUBHEAD_SELECTOR).first().innerText();
    expect(after).toBe(before);
    expect(after).toContain('30,000+');
  });

  test('TC-07: CTA button copy ("Sign up for free") is unchanged by the variation', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    const ctas = page.locator(CTA_SELECTOR);
    const count = await ctas.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const text = (await ctas.nth(i).innerText()).trim();
      if (text) expect(text).toBe('Sign up for free');
    }
    await injectVariation(page);
    for (let i = 0; i < count; i++) {
      const text = (await ctas.nth(i).innerText()).trim();
      if (text) expect(text).toBe('Sign up for free');
    }
  });

  test('TC-08: No uncaught page errors thrown while the variation script runs', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await gotoAndWaitPastWafChallenge(page);
    await injectVariation(page);
    expect(pageErrors).toEqual([]);
  });

  test('TC-09: Idempotent re-injection — injecting vB.js twice does not corrupt the H1 or double-mutate it', async ({ page }) => {
    await gotoAndWaitPastWafChallenge(page);
    await injectVariation(page);
    const first = await getHeroState(page);
    await injectVariation(page);
    const second = await getHeroState(page);
    expect(second.desktopHtml).toBe(first.desktopHtml);
    expect(second.desktopHtml.match(new RegExp(EXPECTED_NEW_FIRST_LINE, 'g')) || []).toHaveLength(1);
  });

  test('TC-10: Whichever hero H1 is actually visible on this viewport/device reflects the correct post-injection state (desktop = updated, mobile = known BUG-01 gap)', async ({ page }, testInfo) => {
    await gotoAndWaitPastWafChallenge(page);
    await injectVariation(page);
    const state = await getHeroState(page);

    if (state.desktopDisplay !== 'none') {
      expect(state.desktopHtml.startsWith(EXPECTED_NEW_FIRST_LINE)).toBe(true);
    }
    if (state.mobileDisplay !== 'none') {
      // documents BUG-01: even where the mobile-only H1 is the visible one, it was never touched
      expect(state.mobileHtml).toMatch(/^Get jobs in/);
    }
  });

  test('TC-11: Screenshot — hero section post-injection', async ({ page }, testInfo) => {
    await gotoAndWaitPastWafChallenge(page);
    await injectVariation(page);
    await page.screenshot({ path: `thumbtack-pro-hero-screenshots/${testInfo.project.name.replace(/[^a-z0-9]/gi, '-')}.png` });
  });
});
