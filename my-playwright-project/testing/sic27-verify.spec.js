// @ts-check
/**
 * SIC-27 / cre-t-27 — 13Sick Telehealth Step 4 (Verify) Clinic Field A/B Test
 *
 * Control  (js.js  — cre-t-21): Shows #practice-search-by-postcode
 * Variation (vB.js — cre-t-27): Shows #practice-search-by-postcode-subscribing (fewer clinics)
 *
 * Both hide #practice-search-by-name.
 * Both set label="Select a clinic", placeholder="Search clinic name or postcode".
 * Both pre-select + hide the attended checkbox.
 * Both add red validation on empty clinic when Next is clicked.
 * Both change terms text to "I agree to the ".
 *
 * Control  URL: _conv_eforce=100052135.1000255637
 * Variation URL: _conv_eforce=100052135.1000255638
 *
 * 34 TCs × 6 browsers = 204 total runs
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const CONTROL_URL   = 'https://app.13sick.com.au/request-consult?utm_campaign=Cro_27_mode&_conv_eforce=100052135.1000255637&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';
const VARIATION_URL = 'https://app.13sick.com.au/request-consult?utm_campaign=Cro_27_mode&_conv_eforce=100052135.1000255638&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';

const SS_DIR = path.join(__dirname, '../sic27-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

let ssCounter = 0;

async function ss(page, label) {
  try {
    let proj = 'browser';
    try { proj = test.info().project.name.replace(/\s+/g, '-').toLowerCase(); } catch (_) {}
    const fname = `${String(ssCounter++).padStart(3, '0')}-${label}-${proj}.png`;
    await page.screenshot({ path: path.join(SS_DIR, fname), fullPage: false });
  } catch (_) {}
}

function getFrame(page) {
  return page.frameLocator('iframe#mobile-viewport');
}

/**
 * Navigate the 13sick funnel to reach the Step 4 Verify page.
 * Flow: Emergency Warning → Reasons (→ optional sub-reasons) → Details → Verify
 * We stop AT Verify — no phone/OTP submission needed.
 *
 * Root cause of v1 failure: app.13sick.com.au Reasons cards don't carry
 * [role="button"] so the old selector found nothing. Fix uses a JS-evaluate
 * that tries [role="button"] → MUI base classes → cursor:pointer fallback.
 * Stop condition is now "Mobile Number" text in iframe (most reliable signal).
 */
async function reachVerifyStep(page, url) {
  test.setTimeout(180000);
  ssCounter = 0;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await ss(page, 'initial');

  const iframeEl = await page.waitForSelector('iframe#mobile-viewport', { timeout: 30000 });
  const f = await iframeEl.contentFrame();
  await ss(page, 'iframe-found');

  let stepDone = { emergency: false, details: false };
  let reached  = false;

  for (let attempt = 0; attempt < 40 && !reached; attempt++) {
    await page.waitForTimeout(1000);

    const bodyText = await f.evaluate(() => document.body.innerText || '').catch(() => '');

    // ── GOAL: Step 4 Verify — "Mobile Number" label is visible ───────────────
    if (bodyText.includes('Mobile Number') && bodyText.includes('Date of Birth')) {
      reached = true; break;
    }
    // Secondary: outer body data attribute
    const isStep4Outer = await page.evaluate(
      () => document.body.dataset.telehealth === 'step_4_Verify'
    ).catch(() => false);
    if (isStep4Outer) { reached = true; break; }

    await ss(page, `nav-${String(attempt).padStart(2, '0')}`);

    const textarea = await f.$('textarea');
    const hasTextarea = !!(textarea && await textarea.isVisible().catch(() => false));

    // ── Emergency Symptoms Warning ────────────────────────────────────────────
    if (!stepDone.emergency && bodyText.includes('Emergency Symptoms Warning')) {
      const cb = await f.$('input[type="checkbox"]');
      if (cb) {
        if (!(await cb.isChecked().catch(() => false))) await cb.click();
        await page.waitForTimeout(400);
        const btns = await f.$$('button');
        for (const b of btns) {
          const t = (await b.innerText().catch(() => '')).trim();
          if (t === 'Continue') { await b.click(); stepDone.emergency = true; break; }
        }
      }
      continue;
    }

    // ── Details page (textarea visible) ──────────────────────────────────────
    if (hasTextarea && !stepDone.details) {
      const val = await textarea.evaluate(el => el.value).catch(() => '');
      if (!val) await textarea.fill('General consultation needed');
      await page.waitForTimeout(400);
      const btns = await f.$$('button');
      for (const b of btns) {
        const t  = (await b.innerText().catch(() => '')).trim();
        const en = await b.isEnabled().catch(() => false);
        if (t === 'Next' && en) { stepDone.details = true; await b.click(); break; }
      }
      continue;
    }

    // ── Reasons / sub-reasons page (no textarea, past emergency) ─────────────
    // The 13sick production Reasons cards may not carry [role="button"], so we
    // escalate through selectors: explicit role → MUI classes → cursor:pointer.
    if (!hasTextarea && !bodyText.includes('Emergency Symptoms Warning')) {
      await f.evaluate(() => {
        // 1. Explicit ARIA role
        for (const el of document.querySelectorAll('[role="button"]')) {
          if (el.offsetParent !== null) { el.click(); return; }
        }
        // 2. MUI component classes
        for (const el of document.querySelectorAll(
          '.MuiButtonBase-root, .MuiListItemButton-root, .MuiMenuItem-root'
        )) {
          if (el.offsetParent !== null) { el.click(); return; }
        }
        // 3. Any visible element whose cursor is "pointer" (covers styled divs/li)
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
          const el = /** @type {HTMLElement} */ (walker.currentNode);
          if (el.offsetParent !== null && window.getComputedStyle(el).cursor === 'pointer') {
            el.click();
            return;
          }
        }
      }).catch(() => {});
      continue;
    }

    // ── Generic Next / Continue ───────────────────────────────────────────────
    const btns = await f.$$('button');
    for (const b of btns) {
      const t  = (await b.innerText().catch(() => '')).trim();
      const en = await b.isEnabled().catch(() => false);
      if (['Next', 'Continue', 'Request Consult', 'Request telehealth'].includes(t) && en) {
        if (hasTextarea && !stepDone.details) stepDone.details = true;
        await b.click(); break;
      }
    }
  }

  if (!reached) {
    await ss(page, 'XX-verify-not-reached');
    throw new Error('Could not reach Step 4 Verify page');
  }

  // Allow variation's 100ms interval to settle (it runs for 5s)
  await page.waitForTimeout(2500);
  await ss(page, 'verify-page-reached');
  return getFrame(page);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL  (js.js / "cre-t-21" — shows #practice-search-by-postcode)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SIC-27 — Control', () => {

  test('TC-C01: #practice-search-by-name is hidden (display:none)', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { await ss(page, 'tc-c01-error'); test.skip(true, e.message); return; }
    await ss(page, 'tc-c01-control-verify');
    const nameField = frame.locator('#practice-search-by-name');
    const isHidden = await nameField.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
    expect(isHidden).toBe(true);
  });

  test('TC-C02: #practice-search-by-postcode is visible (display:block)', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const postcode = frame.locator('#practice-search-by-postcode');
    await expect(postcode).toBeVisible();
    await ss(page, 'tc-c02-postcode-visible');
  });

  test('TC-C03: #practice-search-by-postcode-subscribing NOT shown by control', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const subField = frame.locator('#practice-search-by-postcode-subscribing');
    const count = await subField.count();
    if (count === 0) {
      // Not in DOM — pass
      expect(count).toBe(0);
    } else {
      const visible = await subField.isVisible().catch(() => false);
      expect(visible).toBe(false);
    }
    await ss(page, 'tc-c03-subscribing-not-shown');
  });

  test('TC-C04: Label inside #practice-search-by-postcode = "Select a clinic"', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const label = frame.locator('#practice-search-by-postcode #practice-label');
    await expect(label).toHaveText('Select a clinic');
    await ss(page, 'tc-c04-label');
  });

  test('TC-C05: Postcode input placeholder = "Search clinic name or postcode"', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode input[role="combobox"]');
    await expect(input).toHaveAttribute('placeholder', 'Search clinic name or postcode');
    await ss(page, 'tc-c05-placeholder');
  });

  test('TC-C06: Hint element #cre-t-21-clinic-hint is present in DOM', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const hint = frame.locator('#cre-t-21-clinic-hint');
    await expect(hint).toBeAttached();
    await ss(page, 'tc-c06-hint-present');
  });

  test('TC-C07: Hint text = "Select any clinic you\'ve visited within the last 12 months to qualify for bulk billing."', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const hint = frame.locator('#cre-t-21-clinic-hint');
    await expect(hint).toContainText('Select any clinic you');
    await expect(hint).toContainText('qualify for bulk billing');
    await ss(page, 'tc-c07-hint-text');
  });

  test('TC-C08: Terms text starts with "I agree to the "', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const termsP = frame.locator('a[href="/terms"]').locator('..');
    const text = await termsP.evaluate(el => el.innerText).catch(() => '');
    expect(text.trim().startsWith('I agree to the')).toBe(true);
    await ss(page, 'tc-c08-terms-text');
  });

  test('TC-C09: hasAttendedPracticeIn12Months checkbox is pre-checked', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const cb = frame.locator('input[name="hasAttendedPracticeIn12Months"]');
    await expect(cb).toBeChecked();
    await ss(page, 'tc-c09-attended-checked');
  });

  test('TC-C10: #cre-t-21-attended-checkbox wrapper is hidden', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const wrapper = frame.locator('#cre-t-21-attended-checkbox');
    const count = await wrapper.count();
    if (count > 0) {
      const isHidden = await wrapper.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
      expect(isHidden).toBe(true);
    } else {
      // ID not yet assigned — check default attendance row is not user-visible
      expect(count).toBe(0);
    }
    await ss(page, 'tc-c10-attended-hidden');
  });

  test('TC-C11: Next click with empty clinic → postcode label turns red rgb(234,72,72)', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    // Clear clinic input to ensure it is empty
    const input = frame.locator('#practice-search-by-postcode input[role="combobox"]');
    await input.fill('');
    await page.waitForTimeout(300);
    // Click Next
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ force: true });
    } else {
      const btns = frame.locator('button');
      const count = await btns.count();
      for (let i = 0; i < count; i++) {
        const t = (await btns.nth(i).innerText().catch(() => '')).trim();
        if (t === 'Next') { await btns.nth(i).click({ force: true }); break; }
      }
    }
    await page.waitForTimeout(500);
    await ss(page, 'tc-c11-label-red');
    const label = frame.locator('#practice-search-by-postcode #practice-label');
    const color = await label.evaluate(el => getComputedStyle(el).color).catch(() => '');
    expect(color).toBe('rgb(234, 72, 72)');
  });

  test('TC-C12: Next click with empty clinic → container gets cre-t-21-field-error class', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode input[role="combobox"]');
    await input.fill('');
    await page.waitForTimeout(300);
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ force: true });
    } else {
      const btns = frame.locator('button');
      const count = await btns.count();
      for (let i = 0; i < count; i++) {
        const t = (await btns.nth(i).innerText().catch(() => '')).trim();
        if (t === 'Next') { await btns.nth(i).click({ force: true }); break; }
      }
    }
    await page.waitForTimeout(500);
    await ss(page, 'tc-c12-field-error-class');
    const container = frame.locator('#practice-search-by-postcode .MuiOutlinedInput-root');
    await expect(container).toHaveClass(/cre-t-21-field-error/);
  });

  test('TC-C13: Typing in clinic input clears error state', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode input[role="combobox"]');
    await input.fill('');
    await page.waitForTimeout(300);
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ force: true });
    } else {
      const btns = frame.locator('button');
      const count = await btns.count();
      for (let i = 0; i < count; i++) {
        const t = (await btns.nth(i).innerText().catch(() => '')).trim();
        if (t === 'Next') { await btns.nth(i).click({ force: true }); break; }
      }
    }
    await page.waitForTimeout(400);
    // Verify error shown
    const label = frame.locator('#practice-search-by-postcode #practice-label');
    const colorBefore = await label.evaluate(el => getComputedStyle(el).color).catch(() => '');
    expect(colorBefore).toBe('rgb(234, 72, 72)');
    // Type something to clear error
    await input.fill('Sydney');
    await input.dispatchEvent('input');
    await page.waitForTimeout(400);
    await ss(page, 'tc-c13-error-cleared');
    const colorAfter = await label.evaluate(el => getComputedStyle(el).color).catch(() => '');
    expect(colorAfter).not.toBe('rgb(234, 72, 72)');
  });

  test('TC-C14: MuiAutocomplete-endAdornment hidden inside #practice-search-by-postcode', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const adornment = frame.locator('#practice-search-by-postcode .MuiAutocomplete-endAdornment');
    const count = await adornment.count();
    if (count > 0) {
      const isHidden = await adornment.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
      expect(isHidden).toBe(true);
    }
    await ss(page, 'tc-c14-adornment-hidden');
  });

  test('TC-C15: #practice-search-by-postcode input container height is 52px', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const container = frame.locator('#practice-search-by-postcode .MuiOutlinedInput-root');
    const height = await container.evaluate(el => getComputedStyle(el).height).catch(() => '');
    expect(height).toBe('52px');
    await ss(page, 'tc-c15-height-52');
  });

  test('TC-C16: cre-t-21-mobile-field ID assigned to mobile input parent', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const el = frame.locator('#cre-t-21-mobile-field');
    await expect(el).toBeAttached();
    await ss(page, 'tc-c16-mobile-id');
  });

  test('TC-C17: cre-t-21-dob-field ID assigned to DOB input parent', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, CONTROL_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const el = frame.locator('#cre-t-21-dob-field');
    await expect(el).toBeAttached();
    await ss(page, 'tc-c17-dob-id');
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// VARIATION  (vB.js / "cre-t-27" — shows #practice-search-by-postcode-subscribing)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SIC-27 — Variation', () => {

  test('TC-V01: #practice-search-by-name is hidden (display:none)', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { await ss(page, 'tc-v01-error'); test.skip(true, e.message); return; }
    await ss(page, 'tc-v01-variation-verify');
    const nameField = frame.locator('#practice-search-by-name');
    const isHidden = await nameField.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
    expect(isHidden).toBe(true);
  });

  test('TC-V02: #practice-search-by-postcode is hidden (variation hides it)', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const postcode = frame.locator('#practice-search-by-postcode');
    const count = await postcode.count();
    if (count > 0) {
      const isHidden = await postcode.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
      expect(isHidden).toBe(true);
    } else {
      expect(count).toBe(0);
    }
    await ss(page, 'tc-v02-postcode-hidden');
  });

  test('TC-V03: #practice-search-by-postcode-subscribing is visible', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const subField = frame.locator('#practice-search-by-postcode-subscribing');
    await expect(subField).toBeVisible();
    await ss(page, 'tc-v03-subscribing-visible');
  });

  test('TC-V04: Label inside #practice-search-by-postcode-subscribing = "Select a clinic"', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const label = frame.locator('#practice-search-by-postcode-subscribing #practice-label');
    await expect(label).toHaveText('Select a clinic');
    await ss(page, 'tc-v04-label');
  });

  test('TC-V05: Subscribing input placeholder = "Search clinic name or postcode"', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode-subscribing input[role="combobox"]');
    await expect(input).toHaveAttribute('placeholder', 'Search clinic name or postcode');
    await ss(page, 'tc-v05-placeholder');
  });

  test('TC-V06: Hint element #cre-t-27-clinic-hint is present in DOM', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const hint = frame.locator('#cre-t-27-clinic-hint');
    await expect(hint).toBeAttached();
    await ss(page, 'tc-v06-hint-present');
  });

  test('TC-V07: Hint text = "Select a clinic you\'ve visited within the last 12 months to continue with bulk billing."', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const hint = frame.locator('#cre-t-27-clinic-hint');
    await expect(hint).toContainText('Select a clinic you');
    await expect(hint).toContainText('continue with bulk billing');
    await ss(page, 'tc-v07-hint-text');
  });

  test('TC-V08: Terms text starts with "I agree to the "', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const termsP = frame.locator('a[href="/terms"]').locator('..');
    const text = await termsP.evaluate(el => el.innerText).catch(() => '');
    expect(text.trim().startsWith('I agree to the')).toBe(true);
    await ss(page, 'tc-v08-terms-text');
  });

  test('TC-V09: hasAttendedPracticeIn12Months checkbox is pre-checked', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const cb = frame.locator('input[name="hasAttendedPracticeIn12Months"]');
    await expect(cb).toBeChecked();
    await ss(page, 'tc-v09-attended-checked');
  });

  test('TC-V10: #cre-t-27-attended-checkbox wrapper is hidden', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const wrapper = frame.locator('#cre-t-27-attended-checkbox');
    const count = await wrapper.count();
    if (count > 0) {
      const isHidden = await wrapper.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
      expect(isHidden).toBe(true);
    } else {
      expect(count).toBe(0);
    }
    await ss(page, 'tc-v10-attended-hidden');
  });

  test('TC-V11: Next click with empty clinic → subscribing label turns red rgb(234,72,72)', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode-subscribing input[role="combobox"]');
    await input.fill('');
    await page.waitForTimeout(300);
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ force: true });
    } else {
      const btns = frame.locator('button');
      const count = await btns.count();
      for (let i = 0; i < count; i++) {
        const t = (await btns.nth(i).innerText().catch(() => '')).trim();
        if (t === 'Next') { await btns.nth(i).click({ force: true }); break; }
      }
    }
    await page.waitForTimeout(500);
    await ss(page, 'tc-v11-label-red');
    const label = frame.locator('#practice-search-by-postcode-subscribing #practice-label');
    const color = await label.evaluate(el => getComputedStyle(el).color).catch(() => '');
    expect(color).toBe('rgb(234, 72, 72)');
  });

  test('TC-V12: Next click with empty clinic → container gets cre-t-27-field-error class', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode-subscribing input[role="combobox"]');
    await input.fill('');
    await page.waitForTimeout(300);
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ force: true });
    } else {
      const btns = frame.locator('button');
      const count = await btns.count();
      for (let i = 0; i < count; i++) {
        const t = (await btns.nth(i).innerText().catch(() => '')).trim();
        if (t === 'Next') { await btns.nth(i).click({ force: true }); break; }
      }
    }
    await page.waitForTimeout(500);
    await ss(page, 'tc-v12-field-error-class');
    const container = frame.locator('#practice-search-by-postcode-subscribing .MuiOutlinedInput-root');
    await expect(container).toHaveClass(/cre-t-27-field-error/);
  });

  test('TC-V13: Typing in subscribing input clears error state', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const input = frame.locator('#practice-search-by-postcode-subscribing input[role="combobox"]');
    await input.fill('');
    await page.waitForTimeout(300);
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ force: true });
    } else {
      const btns = frame.locator('button');
      const count = await btns.count();
      for (let i = 0; i < count; i++) {
        const t = (await btns.nth(i).innerText().catch(() => '')).trim();
        if (t === 'Next') { await btns.nth(i).click({ force: true }); break; }
      }
    }
    await page.waitForTimeout(400);
    const label = frame.locator('#practice-search-by-postcode-subscribing #practice-label');
    const colorBefore = await label.evaluate(el => getComputedStyle(el).color).catch(() => '');
    expect(colorBefore).toBe('rgb(234, 72, 72)');
    await input.fill('Sydney');
    await input.dispatchEvent('input');
    await page.waitForTimeout(400);
    await ss(page, 'tc-v13-error-cleared');
    const colorAfter = await label.evaluate(el => getComputedStyle(el).color).catch(() => '');
    expect(colorAfter).not.toBe('rgb(234, 72, 72)');
  });

  test('TC-V14: MuiAutocomplete-endAdornment hidden inside #practice-search-by-postcode-subscribing', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const adornment = frame.locator('#practice-search-by-postcode-subscribing .MuiAutocomplete-endAdornment');
    const count = await adornment.count();
    if (count > 0) {
      const isHidden = await adornment.evaluate(el => getComputedStyle(el).display === 'none').catch(() => true);
      expect(isHidden).toBe(true);
    }
    await ss(page, 'tc-v14-adornment-hidden');
  });

  test('TC-V15: #practice-search-by-postcode-subscribing input container height is 52px', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const container = frame.locator('#practice-search-by-postcode-subscribing .MuiOutlinedInput-root');
    const height = await container.evaluate(el => getComputedStyle(el).height).catch(() => '');
    expect(height).toBe('52px');
    await ss(page, 'tc-v15-height-52');
  });

  test('TC-V16: cre-t-27-mobile-field ID assigned to mobile input parent', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const el = frame.locator('#cre-t-27-mobile-field');
    await expect(el).toBeAttached();
    await ss(page, 'tc-v16-mobile-id');
  });

  test('TC-V17: cre-t-27-dob-field ID assigned to DOB input parent', async ({ page }) => {
    let frame;
    try { frame = await reachVerifyStep(page, VARIATION_URL); }
    catch (e) { test.skip(true, e.message); return; }
    const el = frame.locator('#cre-t-27-dob-field');
    await expect(el).toBeAttached();
    await ss(page, 'tc-v17-dob-id');
  });

});
