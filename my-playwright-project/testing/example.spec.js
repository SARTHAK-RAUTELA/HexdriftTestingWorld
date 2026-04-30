// =============================================================
// 13SICK CRO Test — V2 (15-char minimum) Playwright Test Suite
// =============================================================
// Run:  npx playwright test --project="Chrome Desktop" --headed
// =============================================================

const { test, expect } = require('@playwright/test');

const VARIATION_URL =
  'https://app.13sick.com.au/request-consult?cro_mode=qa&isTelehealth=true&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&_conv_eforce=100051903.1000255143';
const CONTROL_URL =
  'https://app.13sick.com.au/request-consult?isTelehealth=true&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw';

const IFRAME_ID    = '#mobile-viewport';
const NEXT_BTN     = '[data-testid="request-consult__next-step-button"]';
const TEXTAREA     = '[name="conditionDescription"]';
const CUSTOM_ERROR = '.custom-error';
const NATIVE_ERROR = '.css-1ymu8si';
const COUNTER      = '.custom-char-counter';

// ── HELPERS ───────────────────────────────────────────────────

async function getCurrentStep(page) {
  return page.evaluate(() => document.body.getAttribute('data-telehealth'));
}

async function waitForStep(page, stepName, timeout) {
  timeout = timeout || 15000;
  await page.waitForFunction(
    function(s){ return document.body.getAttribute('data-telehealth') === s; },
    stepName,
    { timeout: timeout }
  );
}

async function getFrame(page) {
  const iframeEl = page.locator(IFRAME_ID);
  await iframeEl.waitFor({ timeout: 15000 });
  return iframeEl.contentFrame();
}

/**
 * STEP 1 — Emergency Symptoms Warning
 * Must tick the checkbox then click Continue.
 */
async function handleStep1(page, frame) {
  console.log('  -> Handling Step 1: Emergency Symptoms Warning...');

  const step = await getCurrentStep(page);
  if (step && step.indexOf('step_1') === -1) {
    console.log('  -> Already past step 1');
    return;
  }

  try {
    const checkbox = frame.locator('input[type="checkbox"]').first();
    await checkbox.waitFor({ timeout: 10000 });
    const checked = await checkbox.isChecked();
    if (!checked) {
      await checkbox.click();
      console.log('  -> Ticked emergency confirmation checkbox');
    }
    await page.waitForTimeout(400);
    const continueBtn = frame.locator('button:has-text("Continue")').first();
    await continueBtn.waitFor({ timeout: 5000 });
    await continueBtn.click();
    console.log('  -> Clicked Continue');
  } catch (err) {
    console.log('  -> Step 1 error: ' + err.message);
  }

  await page.waitForFunction(
    function(){ return document.body.getAttribute('data-telehealth') === 'step_2_Category'; },
    { timeout: 12000 }
  ).catch(function(){ console.log('  -> Warning: step_2_Category not confirmed'); });

  console.log('  -> Step 1 complete');
}

/**
 * STEP 2 — Choose a Category
 * Clicks the named category row.
 */
async function handleStep2(page, frame, categoryName) {
  if (!categoryName) categoryName = 'Gut Related';
  console.log('  -> Handling Step 2: Selecting "' + categoryName + '"...');

  await waitForStep(page, 'step_2_Category', 10000)
    .catch(function(){ console.log('  -> step_2_Category wait timed out'); });

  try {
    const row = frame.locator('li, [role="button"]').filter({ hasText: categoryName }).first();
    await row.waitFor({ timeout: 8000 });
    await row.click();
    console.log('  -> Clicked: ' + categoryName);
  } catch (_) {
    try {
      const firstRow = frame.locator('li').first();
      await firstRow.waitFor({ timeout: 5000 });
      await firstRow.click();
      console.log('  -> Clicked first li (fallback)');
    } catch (err) {
      console.log('  -> Could not click category: ' + err.message);
    }
  }

  await page.waitForTimeout(500);

  try {
    const nextBtn = frame.locator(NEXT_BTN);
    const visible = await nextBtn.isVisible().catch(function(){ return false; });
    if (visible) {
      await nextBtn.click();
      console.log('  -> Clicked Next on step 2');
    }
  } catch (_) {}

  console.log('  -> Step 2 complete');
}

/**
 * STEP 3 — Wait for textarea and our counter to load.
 */
async function waitForStep3(page, frame) {
  console.log('  -> Waiting for Step 3 textarea...');

  await waitForStep(page, 'step_3_Symptoms', 15000)
    .catch(function(){ console.log('  -> step_3_Symptoms not confirmed'); });

  await frame.waitForSelector(TEXTAREA, { timeout: 15000 });
  await frame.locator(TEXTAREA).click();

  await frame.waitForSelector(COUNTER, { timeout: 10000 })
    .catch(function(){ console.log('  -> Counter not yet visible'); });

  console.log('  -> Step 3 ready');
}

async function goToStep3(page, categoryName) {
  console.log('\n=> Navigating to Step 3 (variation)...');
  await page.goto(VARIATION_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(IFRAME_ID, { timeout: 15000 });
  const frame = await getFrame(page);
  await handleStep1(page, frame);
  await handleStep2(page, frame, categoryName);
  await waitForStep3(page, frame);
  console.log('OK - Reached Step 3\n');
  return frame;
}

async function goToStep3Control(page, categoryName) {
  console.log('\n=> Navigating to Step 3 (control)...');
  await page.goto(CONTROL_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(IFRAME_ID, { timeout: 15000 });
  const frame = await getFrame(page);
  await handleStep1(page, frame);
  await handleStep2(page, frame, categoryName);
  await frame.waitForSelector(TEXTAREA, { timeout: 15000 });
  await frame.locator(TEXTAREA).click();
  console.log('OK - [CONTROL] Reached Step 3\n');
  return frame;
}

// ══════════════════════════════════════════════════════════════
// 1. CHARACTER COUNTER DISPLAY
// ══════════════════════════════════════════════════════════════

test.describe('1. Character Counter Display', () => {

  test('counter appears on focus and shows 0 / 15', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).click();
    const counter = frame.locator(COUNTER);
    await expect(counter).toBeVisible({ timeout: 5000 });
    await expect(counter).toContainText('0 / 15');
  });

  test('counter updates correctly as user types', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('Hello');
    await expect(frame.locator(COUNTER)).toContainText('5 / 15');
  });

  test('counter turns green at exactly 15 characters', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(15));
    const counter = frame.locator(COUNTER);
    await expect(counter).toContainText('15 / 15');
    const color = await counter.evaluate(function(el){ return el.style.color; });
    expect(color).toBe('green');
  });

  test('counter stays green above 15 characters', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(20));
    const color = await frame.locator(COUNTER).evaluate(function(el){ return el.style.color; });
    expect(color).toBe('green');
  });

  test('counter never shows padded value of 30', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(20));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(800);
    const text = await frame.locator(COUNTER).textContent().catch(function(){ return ''; });
    expect(text).not.toContain('30 / 15');
  });

});

// ══════════════════════════════════════════════════════════════
// 2. VALIDATION ERROR STATES
// ══════════════════════════════════════════════════════════════

test.describe('2. Validation Error States', () => {

  test('Next with 0 chars shows custom 15-char error', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const err = frame.locator(CUSTOM_ERROR);
    await expect(err).toBeVisible();
    await expect(err).toContainText('at least 15 characters');
  });

  test('Next with 14 chars shows custom error', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
  });

  test('Next with 15 chars — no error shown', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(15));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(500);
    const visible = await frame.locator(CUSTOM_ERROR).isVisible().catch(function(){ return false; });
    expect(visible).toBe(false);
  });

  test('native 30-char error never visible on variation', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const visible = await frame.locator(NATIVE_ERROR).isVisible().catch(function(){ return false; });
    expect(visible).toBe(false);
  });

  test('red border on textarea when validation fails', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const outline = await frame.locator('.MuiInputBase-root').first()
      .evaluate(function(el){ return el.style.outline; });
    expect(outline).toContain('rgb(234, 72, 72)');
  });

  test('red border clears after typing 15+ chars', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(15));
    await page.waitForTimeout(300);
    const outline = await frame.locator('.MuiInputBase-root').first()
      .evaluate(function(el){ return el.style.outline; });
    expect(outline).toBe('');
  });

  test('label turns red on failed validation', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const color = await frame.locator('label').first()
      .evaluate(function(el){ return el.style.color; });
    expect(color).toContain('rgb(234, 72, 72)');
  });

  test('label colour restores after 15+ chars', async ({ page }) => {
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(15));
    await page.waitForTimeout(300);
    const color = await frame.locator('label').first()
      .evaluate(function(el){ return el.style.color; });
    expect(color).toBe('');
  });

});

// ══════════════════════════════════════════════════════════════
// 3. NAVIGATION / FORM FLOW
// ══════════════════════════════════════════════════════════════

test.describe('3. Navigation / Form Flow', () => {

  async function testNav(page, charCount) {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(charCount));
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function(){ return document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms'; },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    console.log('  -> After ' + charCount + ' chars: moved to ' + step);
    expect(step).not.toBe('step_3_Symptoms');
  }

  test('15 chars — navigates away from step 3', async ({ page }) => { await testNav(page, 15); });
  test('29 chars — navigates away from step 3', async ({ page }) => { await testNav(page, 29); });
  test('30 chars — navigates away from step 3', async ({ page }) => { await testNav(page, 30); });
  test('50+ chars — navigates away from step 3', async ({ page }) => { await testNav(page, 55); });

  test('after going back — textarea has real value, no dots', async ({ page }) => {
    const TYPED = 'My real symptom text here';
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type(TYPED);
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function(){ return document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms'; },
      { timeout: 15000 }
    );
    const frame2 = await getFrame(page);
    const backBtn = frame2.locator('button:has-text("Back")').first();
    await backBtn.click().catch(function(){ return page.goBack(); });
    await frame2.waitForSelector(TEXTAREA, { timeout: 10000 });
    await page.waitForTimeout(700);
    const value = await frame2.locator(TEXTAREA).inputValue();
    console.log('  -> Value after back: "' + value + '"');
    expect(value).not.toMatch(/\.{3,}/);
    expect(value.trim()).toBe(TYPED);
  });

});

// ══════════════════════════════════════════════════════════════
// 4. EDGE CASES
// ══════════════════════════════════════════════════════════════

test.describe('4. Edge Cases', () => {

  test('15 spaces — fails (.trim() check)', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type(' '.repeat(15));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
  });

  test('15 special chars — passes', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('!@#$%^&*()!@#$%');
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(500);
    const visible = await frame.locator(CUSTOM_ERROR).isVisible().catch(function(){ return false; });
    expect(visible).toBe(false);
  });

  test('paste updates counter correctly', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.fill('Pasted text here!');
    await ta.dispatchEvent('input');
    await expect(frame.locator(COUNTER)).toContainText('17 / 15');
    const color = await frame.locator(COUNTER).evaluate(function(el){ return el.style.color; });
    expect(color).toBe('green');
  });

  test('200+ chars — no performance issues', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.fill('A'.repeat(200));
    await ta.dispatchEvent('input');
    await expect(frame.locator(COUNTER)).toContainText('200 / 15');
    await expect(frame.locator(NEXT_BTN)).toBeEnabled();
  });

});

// ══════════════════════════════════════════════════════════════
// 5. ERROR RECOVERY
// ══════════════════════════════════════════════════════════════

test.describe('5. Error Recovery', () => {

  test('error re-appears after deleting back below 15', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(15));
    await page.waitForTimeout(200);
    await ta.press('Backspace');
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
  });

  test('fails then passes after typing more', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('short');
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    await ta.type('A'.repeat(10));
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function(){ return document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms'; },
      { timeout: 15000 }
    );
  });

  test('rapid clicks — no freeze, navigates once', async ({ page }) => {
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(20));
    const nextBtn = frame.locator(NEXT_BTN);
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();
    await page.waitForFunction(
      function(){ return document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms'; },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    expect(step).not.toBe('step_3_Symptoms');
  });

});

// ══════════════════════════════════════════════════════════════
// 6. DATA INTEGRITY
// ══════════════════════════════════════════════════════════════

test.describe('6. Data Integrity', () => {

  test('textarea never visually shows dots', async ({ page }) => {
    const TYPED = 'My real symptom text';
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type(TYPED);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(600);
    const value = await ta.inputValue().catch(function(){ return ''; });
    console.log('  -> textarea after click: "' + value + '"');
    expect(value).not.toMatch(/\.{3,}/);
  });

  test('POST requests do not contain padded dots', async ({ page }) => {
    const postBodies = [];
    page.on('request', function(req) {
      if (req.method() === 'POST') {
        try { const b = req.postData(); if (b) postBodies.push(b); } catch(_) {}
      }
    });
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('My real symptoms here');
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(2000);
    console.log('  -> POSTs captured: ' + postBodies.length);
    for (var i = 0; i < postBodies.length; i++) {
      if (postBodies[i].indexOf('conditionDescription') !== -1) {
        expect(postBodies[i]).not.toMatch(/conditionDescription.*\.{5,}/);
      }
    }
  });

});

// ══════════════════════════════════════════════════════════════
// 7. DIFFERENT CONDITION TYPES
// ══════════════════════════════════════════════════════════════

test.describe('7. Different Condition Types', () => {

  var CONDITIONS = ['Gut Related', 'Respiratory Related', 'Skin'];

  for (var ci = 0; ci < CONDITIONS.length; ci++) {
    (function(condition) {
      test('"' + condition + '" — 15-char validation works', async ({ page }) => {
        const frame = await goToStep3(page, condition);
        const ta = frame.locator(TEXTAREA);
        await ta.click();
        await ta.type('A'.repeat(15));
        await expect(frame.locator(COUNTER)).toContainText('15 / 15');
        await frame.locator(NEXT_BTN).click();
        await page.waitForFunction(
          function(){ return document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms'; },
          { timeout: 15000 }
        );
        const step = await getCurrentStep(page);
        expect(step).not.toBe('step_3_Symptoms');
      });
    })(CONDITIONS[ci]);
  }

});

// ══════════════════════════════════════════════════════════════
// 9. CONSOLE LOGS CHECK
// ══════════════════════════════════════════════════════════════

test.describe('9. Console Logs', () => {

  test('expected CRE logs appear — no error logs', async ({ page }) => {
    const logs = [];
    const errors = [];
    page.on('console', function(msg) {
      const text = msg.text();
      if (text.indexOf('[CRE-V2-15CHAR]') !== -1) {
        if (text.indexOf('❌') !== -1) errors.push(text);
        else logs.push(text);
      }
    });
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(20));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(2000);

    console.log('  -> CRE logs:');
    logs.forEach(function(l){ console.log('     ' + l); });
    if (errors.length) {
      console.log('  -> CRE errors:');
      errors.forEach(function(l){ console.log('     ' + l); });
    }

    expect(logs.some(function(l){ return l.indexOf('Test script loaded') !== -1; })).toBe(true);
    expect(logs.some(function(l){ return l.indexOf('Textarea found and enhanced') !== -1; })).toBe(true);
    expect(logs.some(function(l){ return l.indexOf('Character counter injected') !== -1; })).toBe(true);
    expect(logs.some(function(l){ return l.indexOf('Validation passed') !== -1; })).toBe(true);
    expect(errors.length).toBe(0);
  });

});

// ══════════════════════════════════════════════════════════════
// 10. CONTROL VERIFICATION
// ══════════════════════════════════════════════════════════════

test.describe('10. Control Verification', () => {

  test('control enforces 30-char minimum', async ({ page }) => {
    const frame = await goToStep3Control(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(15));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(1000);
    const step = await getCurrentStep(page);
    console.log('  -> Step after 15 chars on control: ' + step);
    expect(step).toBe('step_3_Symptoms');
  });

  test('control has no custom counter', async ({ page }) => {
    const frame = await goToStep3Control(page);
    await frame.locator(TEXTAREA).click();
    await frame.locator(TEXTAREA).type('test');
    const visible = await frame.locator(COUNTER).isVisible().catch(function(){ return false; });
    expect(visible).toBe(false);
  });

  test('control has no custom error message', async ({ page }) => {
    const frame = await goToStep3Control(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const visible = await frame.locator(CUSTOM_ERROR).isVisible().catch(function(){ return false; });
    expect(visible).toBe(false);
  });

  test('control passes with 30+ chars', async ({ page }) => {
    const frame = await goToStep3Control(page);
    const ta = frame.locator(TEXTAREA);
    await ta.click();
    await ta.type('A'.repeat(30));
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function(){ return document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms'; },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    expect(step).not.toBe('step_3_Symptoms');
  });

});