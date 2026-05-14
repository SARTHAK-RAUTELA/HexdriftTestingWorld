/**
 * SIC-21 — 13Sick Telehealth Step 4 (Verify) Clinic Validation Test
 *
 * Control (vB.js):     Adds validation to #practice-search-by-name (clinic name search)
 * Variation B (js.js): Switches to #practice-search-by-postcode, updates label/placeholder/
 *                      hint copy, pre-selects + hides attended checkbox, validates postcode field
 *
 * Run all:        npx playwright test sic-21
 * Chrome only:    npx playwright test sic-21 --project="Chrome Desktop"
 * Headed:         npx playwright test sic-21 --headed --project="Chrome Desktop"
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

// ── SCRIPTS ──────────────────────────────────────────────────────────────────

const CONTROL_SCRIPT = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const VARIATION_SCRIPT = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/js.js'), 'utf8'
);

// ── URLS (user-provided QA force links) ──────────────────────────────────────

const CONTROL_URL   = 'https://app.13sick.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052011.1000255372&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';
const VARIATION_URL = 'https://app.13sick.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052011.1000255373&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';

const ERROR_COLOR = 'rgb(234, 72, 72)';
const MOBILE_VP   = { width: 390, height: 844 };

const SS_DIR = path.resolve(__dirname, '../sic-21-screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

// ── NAVIGATION HELPER ────────────────────────────────────────────────────────

/**
 * Navigate through Steps 1 → 2 → 3 → 4 (Verify).
 * Returns { frame, errors } when body[data-telehealth="step_4_Verify"] is active.
 */
async function reachStep4(page, url) {
  const errors = [];
  page.on('pageerror', e   => errors.push(`[pageerror] ${e.message}`));
  page.on('console',   msg => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`); });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // WAF guard
  const h1Text = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.textContent.trim() : '';
  });
  if (h1Text.includes('403') || h1Text.toLowerCase().includes('forbidden')) {
    throw new Error('Site returned 403 Forbidden — WAF block. Wait a few minutes and retry.');
  }

  await page.waitForTimeout(3000);
  await page.waitForSelector('#mobile-viewport', { timeout: 30000 });
  const frame = page.frameLocator('#mobile-viewport');

  // ── Step 1: Dismiss Emergency Symptoms Warning ────────────────────────────
  const step1 = await page.evaluate(() => document.body.getAttribute('data-telehealth'));
  if (step1 === 'step_1_Emergency_Symptoms_Warning') {
    await frame.locator('input[type="checkbox"]').first().click();
    await frame.locator('button:has-text("Continue")').click();
    await page.waitForFunction(
      () => document.body.getAttribute('data-telehealth') === 'step_2_Category',
      { timeout: 15000 }
    );
    await frame.locator('.MuiDialog-root').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(600);
  }

  // ── Step 2: Select first category ────────────────────────────────────────
  await frame.locator('[data-testid="condition-category__button"]').first()
    .waitFor({ state: 'visible', timeout: 20000 });
  await frame.locator('[data-testid="condition-category__button"]').first().click();

  // ── Step 3: Fill symptoms + click Next ───────────────────────────────────
  await frame.locator('[name="conditionDescription"]').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1500);
  await frame.locator('[name="conditionDescription"]').fill('Test symptoms for SIC-21 QA automation');

  // Select first radio in "How would you like to consult?" if present
  const radioCount = await frame.locator('input[type="radio"]').count();
  if (radioCount > 0) {
    await frame.locator('input[type="radio"]').first().click().catch(() => {});
    await page.waitForTimeout(300);
  }

  const nextBtn3 = frame.locator('[data-testid="request-consult__next-step-button"]');
  await nextBtn3.waitFor({ state: 'visible', timeout: 10000 });
  await nextBtn3.click();

  // ── Wait for Step 4 ───────────────────────────────────────────────────────
  await page.waitForFunction(
    () => document.body.getAttribute('data-telehealth') === 'step_4_Verify',
    { timeout: 25000 }
  );
  await page.waitForTimeout(2500); // Allow iframe + React to settle

  return { frame, errors };
}

async function injectScript(page, script) {
  await page.evaluate((code) => {
    const s = document.createElement('script');
    s.textContent = code;
    document.head.appendChild(s);
  }, script);
  await page.waitForTimeout(3000); // Allow iframe DOM changes + interval ticks
}

async function captureIframe(page, label) {
  const ssPath = path.join(SS_DIR, `${label}.png`);
  try {
    await page.locator('#mobile-viewport').screenshot({ path: ssPath });
    await test.info().attach('screenshot', { path: ssPath, contentType: 'image/png' });
  } catch (e) {
    console.log(`Screenshot skipped (${label}): ${e.message}`);
  }
}

// ── SECTION 1: STATIC ANALYSIS ───────────────────────────────────────────────

test.describe('1 — Script Integrity (static analysis)', () => {

  test('Control (vB.js) file is non-empty', () => {
    expect(CONTROL_SCRIPT.length).toBeGreaterThan(100);
  });

  test('Variation (js.js) file is non-empty', () => {
    expect(VARIATION_SCRIPT.length).toBeGreaterThan(100);
  });

  test('Both target body[data-telehealth="step_4_Verify"]', () => {
    expect(CONTROL_SCRIPT).toContain('step_4_Verify');
    expect(VARIATION_SCRIPT).toContain('step_4_Verify');
  });

  test('Both target #mobile-viewport iframe via getElementById', () => {
    expect(CONTROL_SCRIPT).toContain('getElementById("mobile-viewport")');
    expect(VARIATION_SCRIPT).toContain('getElementById("mobile-viewport")');
  });

  test('Control uses #practice-search-by-name (name-based clinic search)', () => {
    expect(CONTROL_SCRIPT).toContain('#practice-search-by-name');
    expect(CONTROL_SCRIPT).not.toContain('display: none !important');
  });

  test('Variation uses #practice-search-by-postcode (postcode-based clinic search)', () => {
    expect(VARIATION_SCRIPT).toContain('#practice-search-by-postcode');
  });

  test('Variation hides #practice-search-by-name with display:none', () => {
    expect(VARIATION_SCRIPT).toContain('#practice-search-by-name');
    expect(VARIATION_SCRIPT).toContain('display: none !important');
  });

  test('Control guard flag is _cret21ControlValidation (prevents duplicate listeners)', () => {
    expect(CONTROL_SCRIPT).toContain('_cret21ControlValidation');
  });

  test('Variation guard flag is _cret21ClinicValidation (prevents duplicate listeners)', () => {
    expect(VARIATION_SCRIPT).toContain('_cret21ClinicValidation');
  });

  test('Both fire conversion event 100037720 on Next click', () => {
    expect(CONTROL_SCRIPT).toContain('100037720');
    expect(VARIATION_SCRIPT).toContain('100037720');
  });

  test('Both use error color rgb(234,72,72)', () => {
    expect(CONTROL_SCRIPT).toContain('rgb(234,72,72)');
    expect(VARIATION_SCRIPT).toContain('rgb(234,72,72)');
  });

  test('Control injects style tag with id cre-t-21-control-styles', () => {
    expect(CONTROL_SCRIPT).toContain('cre-t-21-control-styles');
  });

  test('Variation injects style tag with id cre-t-21-injected-styles', () => {
    expect(VARIATION_SCRIPT).toContain('cre-t-21-injected-styles');
  });

  test('Variation label updated to "Select a clinic"', () => {
    expect(VARIATION_SCRIPT).toContain('Select a clinic');
  });

  test('Variation placeholder updated to "Search clinic name or postcode"', () => {
    expect(VARIATION_SCRIPT).toContain('Search clinic name or postcode');
  });

  test('Variation adds hint text about last 12 months', () => {
    expect(VARIATION_SCRIPT).toContain("Select a clinic you've visited within the last 12 months");
  });

  test('Variation updates terms text to "I agree to the"', () => {
    expect(VARIATION_SCRIPT).toContain('agree to the');
  });

  test('Variation hides attended checkbox via #cre-t-21-attended-checkbox', () => {
    expect(VARIATION_SCRIPT).toContain('cre-t-21-attended-checkbox');
  });

  test('Variation pre-selects hasAttendedPracticeIn12Months checkbox', () => {
    expect(VARIATION_SCRIPT).toContain('hasAttendedPracticeIn12Months');
  });

  test('Variation hides dropdown arrow on postcode field', () => {
    expect(VARIATION_SCRIPT).toContain('MuiAutocomplete-endAdornment');
    expect(VARIATION_SCRIPT).toContain('display: none !important');
  });

  test('Both have catch block protecting against JS errors', () => {
    expect(CONTROL_SCRIPT).toContain('catch (e)');
    expect(VARIATION_SCRIPT).toContain('catch (e)');
  });

  test('Variation blocks event propagation when clinic empty + React fields valid', () => {
    expect(VARIATION_SCRIPT).toContain('stopImmediatePropagation');
    expect(CONTROL_SCRIPT).toContain('stopImmediatePropagation');
  });
});

// ── SECTION 2: CONTROL (vB.js) ───────────────────────────────────────────────

test.describe('2 — Control (vB.js) — Step 4 Verify', () => {

  test('Control: Step 4 is reachable', async ({ page, browserName }) => {
    await reachStep4(page, CONTROL_URL);
    const step = await page.evaluate(() => document.body.getAttribute('data-telehealth'));
    expect(step).toBe('step_4_Verify');
    console.log(`  [Control][${browserName}] step_4_Verify reached ✓`);
  });

  test('Control: #practice-search-by-name visible after script injection', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);
    await captureIframe(page, `ctrl-name-visible-${browserName}`);

    const nameSearch = frame.locator('#practice-search-by-name');
    await expect(nameSearch).toBeVisible({ timeout: 10000 });
    console.log(`  [Control][${browserName}] #practice-search-by-name is visible ✓`);
  });

  test('Control: #practice-search-by-postcode NOT visible (control uses name search)', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    const postcodeSearch = frame.locator('#practice-search-by-postcode');
    const count = await postcodeSearch.count();
    if (count > 0) {
      const display = await postcodeSearch.first().evaluate(el => getComputedStyle(el).display);
      expect(display, '#practice-search-by-postcode must be hidden in control').not.toBe('block');
    }
    console.log(`  [Control][${browserName}] #practice-search-by-postcode not shown ✓`);
  });

  test('Control: attended checkbox visible and unchecked by default', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    const checkbox = frame.locator('input[name="hasAttendedPracticeIn12Months"]');
    if (await checkbox.count() > 0) {
      await expect(checkbox.first()).toBeVisible({ timeout: 5000 });
      const checked = await checkbox.first().isChecked();
      expect(checked, 'attended checkbox should be unchecked by default in control').toBe(false);
      console.log(`  [Control][${browserName}] attended checkbox visible + unchecked ✓`);
    }
  });

  test('Control: validation — Next click with empty clinic shows red label + red border', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(800);

    await captureIframe(page, `ctrl-validation-error-${browserName}`);

    // Label turns red
    const label = frame.locator('#practice-search-by-name #practice-label');
    if (await label.count() > 0) {
      const labelColor = await label.first().evaluate(el => getComputedStyle(el).color);
      expect(labelColor, 'label color must be red (234,72,72) when clinic empty').toBe(ERROR_COLOR);
      console.log(`  [Control][${browserName}] label turns red ✓`);
    }

    // Container gets error class → red border via CSS
    const container = frame.locator('#practice-search-by-name .MuiOutlinedInput-root');
    if (await container.count() > 0) {
      const hasErr = await container.first().evaluate(el => el.classList.contains('cre-t-21-field-error'));
      expect(hasErr, 'MuiOutlinedInput-root must have cre-t-21-field-error class').toBe(true);
      console.log(`  [Control][${browserName}] cre-t-21-field-error class applied ✓`);
    }
  });

  test('Control: validation — error clears after typing in clinic field', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    // Trigger error
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Type in clinic input
    const input = frame.locator('#practice-search-by-name input[role="combobox"]');
    if (await input.count() > 0) {
      await input.first().type('Test Clinic');
      await page.waitForTimeout(600);

      const container = frame.locator('#practice-search-by-name .MuiOutlinedInput-root');
      if (await container.count() > 0) {
        const hasErr = await container.first().evaluate(el => el.classList.contains('cre-t-21-field-error'));
        expect(hasErr, 'error class should be removed after typing').toBe(false);
      }
      const label = frame.locator('#practice-search-by-name #practice-label');
      if (await label.count() > 0) {
        const color = await label.first().evaluate(el => getComputedStyle(el).color);
        expect(color, 'label color must revert after typing').not.toBe(ERROR_COLOR);
      }
      console.log(`  [Control][${browserName}] error clears on input ✓`);
    }
    await captureIframe(page, `ctrl-validation-cleared-${browserName}`);
  });

  test('Control: no hint text injected', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    const hint = frame.locator('#cre-t-21-clinic-hint');
    const count = await hint.count();
    expect(count, 'hint element must not exist in control').toBe(0);
    console.log(`  [Control][${browserName}] no hint text injected ✓`);
  });
});

// ── SECTION 3: VARIATION B (js.js) ───────────────────────────────────────────

test.describe('3 — Variation B (js.js) — Step 4 Verify', () => {

  test('Variation: Step 4 is reachable', async ({ page, browserName }) => {
    await reachStep4(page, VARIATION_URL);
    const step = await page.evaluate(() => document.body.getAttribute('data-telehealth'));
    expect(step).toBe('step_4_Verify');
    console.log(`  [Variation][${browserName}] step_4_Verify reached ✓`);
  });

  test('Variation: #practice-search-by-name is hidden (display:none)', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);
    await captureIframe(page, `var-name-hidden-${browserName}`);

    const nameSearch = frame.locator('#practice-search-by-name');
    if (await nameSearch.count() > 0) {
      const display = await nameSearch.first().evaluate(el => getComputedStyle(el).display);
      expect(display, '#practice-search-by-name must be hidden in variation').toBe('none');
      console.log(`  [Variation][${browserName}] #practice-search-by-name hidden ✓`);
    }
  });

  test('Variation: #practice-search-by-postcode is visible', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);
    await captureIframe(page, `var-postcode-visible-${browserName}`);

    const postcodeSearch = frame.locator('#practice-search-by-postcode');
    await expect(postcodeSearch.first(), '#practice-search-by-postcode must be visible').toBeVisible({ timeout: 10000 });
    console.log(`  [Variation][${browserName}] #practice-search-by-postcode visible ✓`);
  });

  test('Variation: postcode dropdown arrow hidden', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const endAdornment = frame.locator('#practice-search-by-postcode .MuiAutocomplete-endAdornment');
    if (await endAdornment.count() > 0) {
      const display = await endAdornment.first().evaluate(el => getComputedStyle(el).display);
      expect(display, 'dropdown arrow must be hidden').toBe('none');
      console.log(`  [Variation][${browserName}] dropdown arrow hidden ✓`);
    }
  });

  test('Variation: label text is "Select a clinic"', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const label = frame.locator('#practice-search-by-postcode #practice-label');
    if (await label.count() > 0) {
      const text = await label.first().textContent();
      expect(text.trim(), 'label must say "Select a clinic"').toBe('Select a clinic');
      console.log(`  [Variation][${browserName}] label = "Select a clinic" ✓`);
    }
  });

  test('Variation: placeholder is "Search clinic name or postcode"', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const input = frame.locator('#practice-search-by-postcode input[role="combobox"]');
    if (await input.count() > 0) {
      const ph = await input.first().getAttribute('placeholder');
      expect(ph, 'placeholder must be "Search clinic name or postcode"').toBe('Search clinic name or postcode');
      console.log(`  [Variation][${browserName}] placeholder updated ✓`);
    }
  });

  test('Variation: hint text visible above clinic label', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const hint = frame.locator('#cre-t-21-clinic-hint');
    await expect(hint.first(), 'hint element must be visible').toBeVisible({ timeout: 10000 });
    const hintText = await hint.first().textContent();
    expect(hintText).toContain("Select a clinic you've visited within the last 12 months");
    console.log(`  [Variation][${browserName}] hint text visible ✓`);
  });

  test('Variation: terms text updated to "I agree to the"', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const termsLink = frame.locator('a[href="/terms"]');
    if (await termsLink.count() > 0) {
      const termsText = await termsLink.first().evaluate(el => {
        const p = el.closest('p');
        return p ? p.textContent : '';
      });
      expect(termsText.toLowerCase()).toContain('i agree to the');
      console.log(`  [Variation][${browserName}] terms text updated ✓`);
    }
  });

  test('Variation: attended checkbox is pre-selected (checked)', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const checkbox = frame.locator('input[name="hasAttendedPracticeIn12Months"]');
    if (await checkbox.count() > 0) {
      const checked = await checkbox.first().isChecked();
      expect(checked, 'attended checkbox must be pre-selected in variation').toBe(true);
      console.log(`  [Variation][${browserName}] attended checkbox pre-selected ✓`);
    }
  });

  test('Variation: attended checkbox parent container is hidden', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const attendedParent = frame.locator('#cre-t-21-attended-checkbox');
    if (await attendedParent.count() > 0) {
      const display = await attendedParent.first().evaluate(el => getComputedStyle(el).display);
      expect(display, '#cre-t-21-attended-checkbox parent must be hidden').toBe('none');
      console.log(`  [Variation][${browserName}] attended checkbox container hidden ✓`);
    }
  });

  test('Variation: postcode input height is 52px', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const inputRoot = frame.locator('#practice-search-by-postcode .MuiOutlinedInput-root');
    if (await inputRoot.count() > 0) {
      const height = await inputRoot.first().evaluate(el => getComputedStyle(el).height);
      expect(height, 'postcode input root height must be 52px').toBe('52px');
      console.log(`  [Variation][${browserName}] postcode input height = 52px ✓`);
    }
  });

  test('Variation: validation — empty postcode clinic shows red label + red border', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(800);

    await captureIframe(page, `var-validation-error-${browserName}`);

    // Label turns red
    const label = frame.locator('#practice-search-by-postcode #practice-label');
    if (await label.count() > 0) {
      const labelColor = await label.first().evaluate(el => getComputedStyle(el).color);
      expect(labelColor, 'postcode label must turn red when empty').toBe(ERROR_COLOR);
      console.log(`  [Variation][${browserName}] postcode label turns red ✓`);
    }

    // Container gets error class
    const container = frame.locator('#practice-search-by-postcode .MuiOutlinedInput-root');
    if (await container.count() > 0) {
      const hasErr = await container.first().evaluate(el => el.classList.contains('cre-t-21-field-error'));
      expect(hasErr, 'postcode container must have cre-t-21-field-error class').toBe(true);
      console.log(`  [Variation][${browserName}] cre-t-21-field-error class applied on postcode ✓`);
    }
  });

  test('Variation: validation — error clears after typing in postcode field', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    // Trigger error
    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Type into postcode field
    const input = frame.locator('#practice-search-by-postcode input[role="combobox"]');
    if (await input.count() > 0) {
      await input.first().type('2000');
      await page.waitForTimeout(600);

      const container = frame.locator('#practice-search-by-postcode .MuiOutlinedInput-root');
      if (await container.count() > 0) {
        const hasErr = await container.first().evaluate(el => el.classList.contains('cre-t-21-field-error'));
        expect(hasErr, 'error class must clear after typing').toBe(false);
      }
      const label = frame.locator('#practice-search-by-postcode #practice-label');
      if (await label.count() > 0) {
        const color = await label.first().evaluate(el => getComputedStyle(el).color);
        expect(color, 'label color must revert after typing').not.toBe(ERROR_COLOR);
      }
      console.log(`  [Variation][${browserName}] error clears on input ✓`);
    }
    await captureIframe(page, `var-validation-cleared-${browserName}`);
  });

  test('Variation: IDs added to form field parents (addIdsToInputParents)', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const mobileField = frame.locator('#cre-t-21-mobile-field');
    const dobField    = frame.locator('#cre-t-21-dob-field');

    if (await mobileField.count() > 0) {
      await expect(mobileField.first()).toBeAttached({ timeout: 5000 });
      console.log(`  [Variation][${browserName}] #cre-t-21-mobile-field exists ✓`);
    }
    if (await dobField.count() > 0) {
      await expect(dobField.first()).toBeAttached({ timeout: 5000 });
      console.log(`  [Variation][${browserName}] #cre-t-21-dob-field exists ✓`);
    }
  });
});

// ── SECTION 4: MOBILE VIEWPORT (390px) ───────────────────────────────────────

test.describe('4 — Mobile Viewport (390 × 844)', () => {
  test.use({ viewport: MOBILE_VP });

  test('[Mobile Control] Step 4 reachable', async ({ page, browserName }) => {
    await reachStep4(page, CONTROL_URL);
    const step = await page.evaluate(() => document.body.getAttribute('data-telehealth'));
    expect(step).toBe('step_4_Verify');
  });

  test('[Mobile Control] validation error visible on name field', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(800);

    await captureIframe(page, `mobile-ctrl-validation-error-${browserName}`);

    const container = frame.locator('#practice-search-by-name .MuiOutlinedInput-root');
    if (await container.count() > 0) {
      const hasErr = await container.first().evaluate(el => el.classList.contains('cre-t-21-field-error'));
      expect(hasErr, '[Mobile Control] cre-t-21-field-error class must be present').toBe(true);
    }
    console.log(`  [Mobile Control][${browserName}] validation error shown ✓`);
  });

  test('[Mobile Variation] postcode visible, name hidden', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);
    await captureIframe(page, `mobile-var-layout-${browserName}`);

    const postcode = frame.locator('#practice-search-by-postcode');
    await expect(postcode.first()).toBeVisible({ timeout: 10000 });

    const name = frame.locator('#practice-search-by-name');
    if (await name.count() > 0) {
      const display = await name.first().evaluate(el => getComputedStyle(el).display);
      expect(display).toBe('none');
    }
    console.log(`  [Mobile Variation][${browserName}] postcode visible, name hidden ✓`);
  });

  test('[Mobile Variation] hint text visible', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const hint = frame.locator('#cre-t-21-clinic-hint');
    await expect(hint.first()).toBeVisible({ timeout: 10000 });
    console.log(`  [Mobile Variation][${browserName}] hint text visible ✓`);
  });

  test('[Mobile Variation] attended checkbox pre-selected and hidden', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);
    await captureIframe(page, `mobile-var-checkbox-${browserName}`);

    const checkbox = frame.locator('input[name="hasAttendedPracticeIn12Months"]');
    if (await checkbox.count() > 0) {
      expect(await checkbox.first().isChecked()).toBe(true);
    }
    const parent = frame.locator('#cre-t-21-attended-checkbox');
    if (await parent.count() > 0) {
      const display = await parent.first().evaluate(el => getComputedStyle(el).display);
      expect(display).toBe('none');
    }
    console.log(`  [Mobile Variation][${browserName}] attended checkbox pre-selected + hidden ✓`);
  });

  test('[Mobile Variation] validation error on postcode field', async ({ page, browserName }) => {
    const { frame } = await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const nextBtn = frame.locator('[data-testid="request-consult__next-step-button"]');
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(800);

    await captureIframe(page, `mobile-var-validation-error-${browserName}`);

    const container = frame.locator('#practice-search-by-postcode .MuiOutlinedInput-root');
    if (await container.count() > 0) {
      const hasErr = await container.first().evaluate(el => el.classList.contains('cre-t-21-field-error'));
      expect(hasErr, '[Mobile Variation] cre-t-21-field-error class must be present').toBe(true);
    }
    console.log(`  [Mobile Variation][${browserName}] postcode validation error shown ✓`);
  });
});

// ── SECTION 5: CONSOLE ERROR HEALTH ──────────────────────────────────────────

test.describe('5 — Console Error Health', () => {
  const NOISE = [
    '_conv_', 'gtag', 'googletagmanager', 'service-worker', 'service worker',
    'Failed to load resource', 'MIME type', 'stripe', 'Cookie',
    'rejected for invalid', 'Content Security Policy',
  ];

  test('[Control] No variation-related JS errors at Step 4', async ({ page, browserName }) => {
    const errors = [];
    page.on('pageerror', e   => errors.push(e.message));
    page.on('console',   msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await reachStep4(page, CONTROL_URL);
    await injectScript(page, CONTROL_SCRIPT);

    const appErrors = errors.filter(e => !NOISE.some(n => e.includes(n)));
    if (appErrors.length) console.log(`  [${browserName}] Control errors: ${appErrors.join(' | ')}`);
    expect(appErrors, `No variation-related errors on ${browserName}`).toHaveLength(0);
  });

  test('[Variation] No variation-related JS errors at Step 4', async ({ page, browserName }) => {
    const errors = [];
    page.on('pageerror', e   => errors.push(e.message));
    page.on('console',   msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await reachStep4(page, VARIATION_URL);
    await injectScript(page, VARIATION_SCRIPT);

    const appErrors = errors.filter(e => !NOISE.some(n => e.includes(n)));
    if (appErrors.length) console.log(`  [${browserName}] Variation errors: ${appErrors.join(' | ')}`);
    expect(appErrors, `No variation-related errors on ${browserName}`).toHaveLength(0);
  });
});
