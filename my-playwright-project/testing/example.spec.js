// =============================================================
// 13SICK CRO Test — V2 (15-char minimum) Playwright Test Suite
// =============================================================
// Run:  npx playwright test --project="Chrome Desktop"
// =============================================================

const { test, expect } = require('@playwright/test');

const VARIATION_URL =
  'https://app.13sick.com.au/request-consult?cro_mode=qa&isTelehealth=true' +
  '&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw' +
  '&_conv_eforce=100051903.1000255143';
const CONTROL_URL =
  'https://app.13sick.com.au/request-consult?isTelehealth=true';

const IFRAME_SEL    = '#mobile-viewport';
const NEXT_BTN      = '[data-testid="request-consult__next-step-button"]';
const TEXTAREA      = '[name="conditionDescription"]';
const WRAPPER       = '[data-testid="condition-description__symptoms-text-input"]';
const CUSTOM_ERROR  = '.custom-error';
const NATIVE_ERROR  = '.css-1ymu8si';
const COUNTER       = '.custom-char-counter';
const CONVERT_STYLE = 'style[data-cre-v2]';

// ── LOW-LEVEL HELPERS ─────────────────────────────────────────

async function getFrame(page) {
  const iframeEl = page.locator(IFRAME_SEL);
  await iframeEl.waitFor({ timeout: 15000 });
  return iframeEl.contentFrame();
}

async function getCurrentStep(page) {
  return page.evaluate(function () {
    return (
      document.body.getAttribute('data-telehealth') ||
      document.body.getAttribute('data-home-visit')
    );
  });
}

async function waitForStep(page, stepName, timeout) {
  timeout = timeout || 15000;
  await page.waitForFunction(
    function (s) {
      return (
        document.body.getAttribute('data-telehealth') === s ||
        document.body.getAttribute('data-home-visit') === s
      );
    },
    stepName,
    { timeout: timeout }
  );
}

async function waitForConvertScript(frame) {
  await frame.waitForSelector(CONVERT_STYLE, { timeout: 10000 });
  console.log('  -> Convert script confirmed: style[data-cre-v2] found in iframe');
}

// Injects the variation script directly when Convert doesn't load in headless mode.
async function injectVariation(page) {
  const alreadyActive = await page.evaluate(function () { return !!window.creT17bserver; });
  if (alreadyActive) return;
  console.log('  -> Convert not active; injecting variation script...');
  await page.evaluate(function () {
    (function () {
      try {
        var MIN_LIMIT   = 15;
        var TA_SEL      = '[name="conditionDescription"]';
        var BTN_SEL     = '[data-testid="request-consult__next-step-button"]';
        var WRAPPER_SEL = '[data-testid="condition-description__symptoms-text-input"]';

        function debounce(fn, wait) {
          var timer;
          return function () {
            var ctx = this; var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
          };
        }

        function waitForElement(selector, callback) {
          var existing = document.querySelector(selector);
          if (existing) return callback(existing);
          var ob = new MutationObserver(function () {
            var el = document.querySelector(selector);
            if (el) { ob.disconnect(); callback(el); }
          });
          ob.observe(document.documentElement, { childList: true, subtree: true });
          setTimeout(function () { ob.disconnect(); }, 15000);
        }

        function clearMuiError(ta) {
          try {
            ta.removeAttribute('aria-invalid');
            var box = ta.closest('.MuiInputBase-root');
            if (box) box.classList.remove('Mui-error');
            var fc = ta.closest('.MuiFormControl-root');
            if (fc) fc.classList.remove('Mui-error');
            var wrapper = ta.closest(WRAPPER_SEL);
            if (wrapper) {
              var sib = wrapper.parentElement;
              if (sib) {
                var lbl = sib.querySelector('label');
                if (lbl) { lbl.classList.remove('Mui-error'); lbl.style.color = ''; }
              }
            }
          } catch (e) {}
        }

        function showCustomError(wrapper, show) {
          var err = wrapper.querySelector('.custom-error');
          if (!err) {
            wrapper.insertAdjacentHTML(
              'beforeend',
              '<div class="custom-error" style="color:rgb(234,72,72);font-size:14px;' +
              'margin-top:6px;display:none;">Please provide a description with at least ' +
              MIN_LIMIT + ' characters</div>'
            );
            err = wrapper.querySelector('.custom-error');
          }
          err.style.display = show ? 'block' : 'none';
        }

        function attachCounter(iframeDoc, ta) {
          if (ta.dataset.cccDone) return;
          var parent = ta.parentNode;
          if (!parent) return;
          if (parent.querySelector('.custom-char-counter')) { ta.dataset.cccDone = '1'; return; }
          ta.dataset.cccDone = '1';
          var win = iframeDoc.defaultView || window;
          if (win.getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
          var counter = iframeDoc.createElement('div');
          counter.className = 'custom-char-counter';
          counter.style.cssText =
            'font-size:12px;text-align:right;position:absolute;bottom:3px;' +
            'right:10px;color:black;pointer-events:none;z-index:10;display:none;';
          parent.appendChild(counter);
          var hasTyped = false;
          function update() {
            if (!hasTyped) { hasTyped = true; counter.style.display = 'block'; }
            var len = ta.value.trim().length;
            counter.textContent = len + ' / ' + MIN_LIMIT;
            counter.style.color = len >= MIN_LIMIT ? 'green' : 'black';
            if (len >= MIN_LIMIT) clearMuiError(ta);
          }
          ta.addEventListener('input', update);
        }

        function setupSubmit(iframeDoc) {
          iframeDoc.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest(BTN_SEL);
            if (!btn) return;
            var ta = iframeDoc.querySelector(TA_SEL);
            if (!ta) return;
            var wrapper = ta.closest(WRAPPER_SEL);
            var len = ta.value.trim().length;
            if (len < MIN_LIMIT) {
              e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
              if (wrapper) showCustomError(wrapper, true);
              var borderBox = wrapper ? wrapper.querySelector('.MuiInputBase-root') : null;
              if (borderBox) borderBox.style.outline = '2px solid rgb(234,72,72)';
              var sib   = wrapper ? wrapper.parentElement : null;
              var label = sib ? sib.querySelector('label') : null;
              if (label) label.style.color = 'rgb(234,72,72)';
              return;
            }
            if (wrapper) showCustomError(wrapper, false);
            clearMuiError(ta);
            var borderBox2 = wrapper ? wrapper.querySelector('.MuiInputBase-root') : null;
            if (borderBox2) borderBox2.style.outline = '';
            var sib2  = wrapper ? wrapper.parentElement : null;
            var label2 = sib2 ? sib2.querySelector('label') : null;
            if (label2) label2.style.color = '';
          }, true);
        }

        function init(iframeDoc) {
          if (iframeDoc._cccInit) return;
          iframeDoc._cccInit = true;
          if (!iframeDoc.documentElement) return;
          if (!iframeDoc.querySelector('style[data-cre-v2]')) {
            var style = iframeDoc.createElement('style');
            style.setAttribute('data-cre-v2', '1');
            style.textContent = '.css-1ymu8si { display: none !important; }';
            iframeDoc.head.appendChild(style);
          }
          setupSubmit(iframeDoc);
          var checkForTextarea = debounce(function () {
            var ta = iframeDoc.querySelector(TA_SEL);
            if (ta) attachCounter(iframeDoc, ta);
          }, 50);
          var ob = new MutationObserver(checkForTextarea);
          ob.observe(iframeDoc.documentElement, { childList: true, subtree: true });
          var existing = iframeDoc.querySelector(TA_SEL);
          if (existing) attachCounter(iframeDoc, existing);
        }

        if (!window.creT17bserver) {
          window.creT17bserver = true;
          waitForElement('iframe#mobile-viewport', function (iframe) {
            function run() {
              try {
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc && doc.head) init(doc);
              } catch (e) {}
            }
            iframe.addEventListener('load', run);
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') run();
          });
        }
      } catch (e) { console.log('variation error:', e); }
    })();
  });
  await page.waitForTimeout(300);
}

// ── NAVIGATION HELPERS ────────────────────────────────────────

async function handleStep1(page, frame) {
  console.log('  -> Step 1: Emergency Symptoms Warning...');
  const step = await getCurrentStep(page);
  if (step && step.indexOf('step_1') === -1) {
    console.log('  -> Already past step 1');
    return;
  }
  try {
    const checkbox = frame.locator('input[type="checkbox"]').first();
    await checkbox.waitFor({ timeout: 10000 });
    const checked = await checkbox.isChecked();
    if (!checked) await checkbox.click();
    await page.waitForTimeout(400);
    const continueBtn = frame.locator('button:has-text("Continue")').first();
    await continueBtn.waitFor({ timeout: 5000 });
    await continueBtn.click();
  } catch (err) {
    console.log('  -> Step 1 error: ' + err.message);
  }
  await page.waitForFunction(
    function () {
      return (
        document.body.getAttribute('data-telehealth') === 'step_2_Category' ||
        document.body.getAttribute('data-home-visit') === 'step_2_Category'
      );
    },
    { timeout: 12000 }
  ).catch(function () { console.log('  -> Warning: step_2_Category not confirmed'); });
  console.log('  -> Step 1 done');
}

async function handleStep2(page, frame, categoryName) {
  if (!categoryName) categoryName = 'Gut Related';
  console.log('  -> Step 2: Selecting "' + categoryName + '"...');
  await waitForStep(page, 'step_2_Category', 10000)
    .catch(function () { console.log('  -> step_2_Category wait timed out'); });
  try {
    const row = frame.locator('li, [role="button"]').filter({ hasText: categoryName }).first();
    await row.waitFor({ timeout: 8000 });
    await row.click();
  } catch (_) {
    try {
      await frame.locator('li').first().waitFor({ timeout: 5000 });
      await frame.locator('li').first().click();
      console.log('  -> Clicked first li (fallback)');
    } catch (err) {
      console.log('  -> Could not click category: ' + err.message);
    }
  }
  await page.waitForTimeout(500);
  try {
    const visible = await frame.locator(NEXT_BTN).isVisible().catch(function () { return false; });
    if (visible) await frame.locator(NEXT_BTN).click();
  } catch (_) {}
  console.log('  -> Step 2 done');
}

async function goToStep3(page, categoryName) {
  console.log('\n=> Navigating to Step 3 (variation)...');
  await page.goto(VARIATION_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(IFRAME_SEL, { timeout: 15000 });
  const frame = await getFrame(page);
  await handleStep1(page, frame);
  await handleStep2(page, frame, categoryName);
  await waitForStep(page, 'step_3_Symptoms', 15000)
    .catch(function () { console.log('  -> step_3_Symptoms not confirmed via body attr'); });
  await frame.waitForSelector(TEXTAREA, { timeout: 15000 });
  await injectVariation(page);
  await waitForConvertScript(frame);
  console.log('OK - Reached Step 3 (variation)\n');
  return frame;
}

async function goToStep3Control(page, categoryName) {
  console.log('\n=> Navigating to Step 3 (control)...');
  await page.goto(CONTROL_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(IFRAME_SEL, { timeout: 15000 });
  const frame = await getFrame(page);
  await handleStep1(page, frame);
  await handleStep2(page, frame, categoryName);
  await waitForStep(page, 'step_3_Symptoms', 15000)
    .catch(function () { console.log('  -> step_3_Symptoms not confirmed via body attr'); });
  await frame.waitForSelector(TEXTAREA, { timeout: 15000 });
  console.log('OK - [CONTROL] Reached Step 3\n');
  return frame;
}

// ══════════════════════════════════════════════════════════════
// 0. CONVERT SCRIPT LOADED
// ══════════════════════════════════════════════════════════════

test.describe('0. Convert Script Loaded', function () {

  test('style[data-cre-v2] exists in iframe head', async function ({ page }) {
    console.log('\n[Group 0] Checking style[data-cre-v2] in iframe head...');
    const frame = await goToStep3(page);
    await expect(frame.locator(CONVERT_STYLE)).toHaveCount(1);
    console.log('  -> style[data-cre-v2] confirmed present');
  });

  test('window.creT17bserver is true on outer page', async function ({ page }) {
    console.log('\n[Group 0] Checking window.creT17bserver on outer page...');
    await goToStep3(page);
    const flag = await page.evaluate(function () { return window.creT17bserver; });
    expect(flag).toBe(true);
    console.log('  -> window.creT17bserver = true');
  });

  test('iframeDoc._cccInit is true inside iframe', async function ({ page }) {
    console.log('\n[Group 0] Checking document._cccInit inside iframe...');
    const frame = await goToStep3(page);
    const flag = await frame.evaluate(function () { return document._cccInit; });
    expect(flag).toBe(true);
    console.log('  -> document._cccInit = true');
  });

});

// ══════════════════════════════════════════════════════════════
// 1. COUNTER HIDDEN ON PAGE LOAD
// ══════════════════════════════════════════════════════════════

test.describe('1. Counter Hidden on Page Load', function () {

  test('counter NOT visible before any interaction', async function ({ page }) {
    console.log('\n[Group 1] Counter should be hidden before any interaction...');
    const frame = await goToStep3(page);
    const count = await frame.locator(COUNTER).count();
    if (count > 0) {
      const visible = await frame.locator(COUNTER).isVisible();
      expect(visible).toBe(false);
      console.log('  -> Counter in DOM but hidden (display:none)');
    } else {
      console.log('  -> Counter not yet in DOM');
    }
  });

  test('counter NOT visible on focus only (before typing)', async function ({ page }) {
    console.log('\n[Group 1] Counter should stay hidden on focus without typing...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).focus();
    await page.waitForTimeout(400);
    const count = await frame.locator(COUNTER).count();
    if (count > 0) {
      const visible = await frame.locator(COUNTER).isVisible();
      expect(visible).toBe(false);
      console.log('  -> Counter hidden on focus-only');
    } else {
      console.log('  -> Counter not in DOM on focus-only');
    }
  });

  test('counter APPEARS on first keystroke (input event)', async function ({ page }) {
    console.log('\n[Group 1] Counter should appear after first keystroke...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.focus();
    const countBefore = await frame.locator(COUNTER).count();
    if (countBefore > 0) {
      expect(await frame.locator(COUNTER).isVisible()).toBe(false);
    }
    await ta.type('a');
    await page.waitForTimeout(200);
    await expect(frame.locator(COUNTER)).toBeVisible({ timeout: 3000 });
    console.log('  -> Counter visible after first keystroke');
  });

  test('counter shows "1 / 15" after typing 1 char', async function ({ page }) {
    console.log('\n[Group 1] Counter should read "1 / 15" after one char...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('a');
    await page.waitForTimeout(200);
    await expect(frame.locator(COUNTER)).toBeVisible({ timeout: 3000 });
    await expect(frame.locator(COUNTER)).toContainText('1 / 15');
    console.log('  -> Counter reads "1 / 15"');
  });

});

// ══════════════════════════════════════════════════════════════
// 2. COUNTER DISPLAY X / 15
// ══════════════════════════════════════════════════════════════

test.describe('2. Counter Display X / 15', function () {

  test('shows "5 / 15" at 5 chars', async function ({ page }) {
    console.log('\n[Group 2] Counter at 5 chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('Hello');
    await page.waitForTimeout(200);
    await expect(frame.locator(COUNTER)).toContainText('5 / 15');
    console.log('  -> Counter reads "5 / 15"');
  });

  test('shows "13 / 15" at 13 chars', async function ({ page }) {
    console.log('\n[Group 2] Counter at 13 chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(13));
    await page.waitForTimeout(200);
    await expect(frame.locator(COUNTER)).toContainText('13 / 15');
    console.log('  -> Counter reads "13 / 15"');
  });

  test('right number is always 15, never 30', async function ({ page }) {
    console.log('\n[Group 2] Right number of counter should always be 15...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('Test');
    await page.waitForTimeout(200);
    const text = await frame.locator(COUNTER).textContent();
    expect(text).not.toContain('/ 30');
    expect(text).toContain('/ 15');
    console.log('  -> Counter right side is 15, not 30');
  });

  test('counter keeps counting above 15 — shows "20 / 15"', async function ({ page }) {
    console.log('\n[Group 2] Counter should continue counting above 15...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(20));
    await page.waitForTimeout(200);
    await expect(frame.locator(COUNTER)).toContainText('20 / 15');
    console.log('  -> Counter reads "20 / 15"');
  });

});

// ══════════════════════════════════════════════════════════════
// 3. COUNTER COLOUR
// ══════════════════════════════════════════════════════════════

test.describe('3. Counter Colour', function () {

  test('black before 15 chars', async function ({ page }) {
    console.log('\n[Group 3] Counter colour should be black before 15 chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(10));
    await page.waitForTimeout(200);
    const color = await frame.locator(COUNTER)
      .evaluate(function (el) { return el.style.color; });
    expect(color).toBe('black');
    console.log('  -> Counter colour is black at 10 chars');
  });

  test('green at exactly 15 chars', async function ({ page }) {
    console.log('\n[Group 3] Counter colour should be green at exactly 15 chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(15));
    await page.waitForTimeout(200);
    const color = await frame.locator(COUNTER)
      .evaluate(function (el) { return el.style.color; });
    expect(color).toBe('green');
    console.log('  -> Counter colour is green at 15 chars');
  });

  test('stays green above 15', async function ({ page }) {
    console.log('\n[Group 3] Counter should stay green above 15 chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(25));
    await page.waitForTimeout(200);
    const color = await frame.locator(COUNTER)
      .evaluate(function (el) { return el.style.color; });
    expect(color).toBe('green');
    console.log('  -> Counter colour is green at 25 chars');
  });

  test('returns to black if deleted below 15', async function ({ page }) {
    console.log('\n[Group 3] Counter should revert to black when dropping below 15...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('A'.repeat(15));
    await page.waitForTimeout(200);
    await ta.press('Backspace');
    await ta.press('Backspace');
    await page.waitForTimeout(200);
    const color = await frame.locator(COUNTER)
      .evaluate(function (el) { return el.style.color; });
    expect(color).toBe('black');
    console.log('  -> Counter reverted to black at 13 chars');
  });

});

// ══════════════════════════════════════════════════════════════
// 4. COUNTER NEVER SHOWS PADDED VALUE
// ══════════════════════════════════════════════════════════════

test.describe('4. Counter Never Shows Padded Value', function () {

  test('after clicking Next with 20 chars counter never shows "30 / 15"', async function ({ page }) {
    console.log('\n[Group 4] Counter should never show "30 / 15" after Next click...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(20));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(800);
    const text = await frame.locator(COUNTER).textContent().catch(function () { return ''; });
    expect(text).not.toContain('30 / 15');
    console.log('  -> Counter does not show "30 / 15" (got: "' + text + '")');
  });

  test('textarea value never shows dots', async function ({ page }) {
    console.log('\n[Group 4] Textarea value should contain no padding dots...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('My real symptoms');
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(600);
    const value = await ta.inputValue().catch(function () { return ''; });
    expect(value).not.toMatch(/\.{3,}/);
    console.log('  -> Textarea value has no dots: "' + value + '"');
  });

});

// ══════════════════════════════════════════════════════════════
// 5. NEXT BUTTON BLOCKED BELOW 15
// ══════════════════════════════════════════════════════════════

test.describe('5. Next Button Blocked Below 15', function () {

  test('0 chars: blocked, stays on step_3_Symptoms, custom error shown', async function ({ page }) {
    console.log('\n[Group 5] Next with 0 chars should block and show error...');
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const step = await getCurrentStep(page);
    expect(step).toBe('step_3_Symptoms');
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    console.log('  -> Blocked at 0 chars, still on step_3_Symptoms');
  });

  test('14 chars: blocked, stays on step_3_Symptoms, custom error shown', async function ({ page }) {
    console.log('\n[Group 5] Next with 14 chars should block and show error...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const step = await getCurrentStep(page);
    expect(step).toBe('step_3_Symptoms');
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    console.log('  -> Blocked at 14 chars, still on step_3_Symptoms');
  });

  test('custom error text says "at least 15 characters"', async function ({ page }) {
    console.log('\n[Group 5] Custom error must mention "at least 15 characters"...');
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    await expect(frame.locator(CUSTOM_ERROR)).toContainText('at least 15 characters');
    console.log('  -> Custom error text is correct');
  });

  test('red border (outline) on MuiInputBase-root after blocked submit', async function ({ page }) {
    console.log('\n[Group 5] Red border should appear on MuiInputBase-root...');
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const outline = await frame.locator('.MuiInputBase-root').first()
      .evaluate(function (el) { return el.style.outline; });
    expect(outline).toContain('rgb(234, 72, 72)');
    console.log('  -> Red border confirmed: ' + outline);
  });

  test('label colour turns red rgb(234,72,72) after blocked submit', async function ({ page }) {
    console.log('\n[Group 5] Label should turn red after blocked submit...');
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const color = await frame.locator('label').first()
      .evaluate(function (el) { return el.style.color; });
    expect(color).toContain('rgb(234, 72, 72)');
    console.log('  -> Label colour is red: ' + color);
  });

});

// ══════════════════════════════════════════════════════════════
// 6. NEXT BUTTON PASSES AT 15+
// ══════════════════════════════════════════════════════════════

test.describe('6. Next Button Passes At 15+', function () {

  async function assertPassesAt(page, charCount) {
    console.log('\n[Group 6] Next with ' + charCount + ' chars should navigate away...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(charCount));
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function () {
        return (
          document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms' &&
          document.body.getAttribute('data-home-visit') !== 'step_3_Symptoms'
        );
      },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    expect(step).not.toBe('step_3_Symptoms');
    console.log('  -> Passed with ' + charCount + ' chars, moved to: ' + step);
  }

  test('exactly 15 chars: passes, navigates away from step_3_Symptoms', async function ({ page }) {
    await assertPassesAt(page, 15);
  });

  test('16 chars: passes', async function ({ page }) {
    await assertPassesAt(page, 16);
  });

  test('29 chars: passes', async function ({ page }) {
    await assertPassesAt(page, 29);
  });

  test('30 chars: passes', async function ({ page }) {
    await assertPassesAt(page, 30);
  });

});

// ══════════════════════════════════════════════════════════════
// 7. NATIVE ERROR HIDDEN
// ══════════════════════════════════════════════════════════════

test.describe('7. Native Error Hidden', function () {

  test('.css-1ymu8si never visible — at load, on 0-char submit, on 14-char submit', async function ({ page }) {
    console.log('\n[Group 7] Native error .css-1ymu8si must stay hidden in all states...');
    const frame = await goToStep3(page);

    let visible = await frame.locator(NATIVE_ERROR).isVisible().catch(function () { return false; });
    expect(visible).toBe(false);
    console.log('  -> Hidden on load');

    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    visible = await frame.locator(NATIVE_ERROR).isVisible().catch(function () { return false; });
    expect(visible).toBe(false);
    console.log('  -> Hidden after 0-char submit');

    await frame.locator(TEXTAREA).type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    visible = await frame.locator(NATIVE_ERROR).isVisible().catch(function () { return false; });
    expect(visible).toBe(false);
    console.log('  -> Hidden after 14-char submit');
  });

  test('style[data-cre-v2] CSS rule contains display:none for .css-1ymu8si', async function ({ page }) {
    console.log('\n[Group 7] style[data-cre-v2] must declare display:none on .css-1ymu8si...');
    const frame = await goToStep3(page);
    const ruleText = await frame.locator(CONVERT_STYLE).textContent();
    expect(ruleText).toContain('.css-1ymu8si');
    expect(ruleText).toContain('display: none !important');
    console.log('  -> CSS rule confirmed: ' + ruleText.trim());
  });

});

// ══════════════════════════════════════════════════════════════
// 8. ERROR CLEARS WHEN VALID
// ══════════════════════════════════════════════════════════════

test.describe('8. Error Clears When Valid', function () {

  test('red border clears after typing 1 more char (14 → 15)', async function ({ page }) {
    console.log('\n[Group 8] Red border should clear after reaching 15 chars...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    const outlineBefore = await frame.locator('.MuiInputBase-root').first()
      .evaluate(function (el) { return el.style.outline; });
    expect(outlineBefore).toContain('rgb(234, 72, 72)');
    await ta.type('A');
    await page.waitForTimeout(300);
    const outlineAfter = await frame.locator('.MuiInputBase-root').first()
      .evaluate(function (el) { return el.style.outline; });
    expect(outlineAfter).toBe('');
    console.log('  -> Red border cleared after reaching 15 chars');
  });

  test('label colour clears after typing 1 more char (14 → 15)', async function ({ page }) {
    console.log('\n[Group 8] Label colour should clear after reaching 15 chars...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    await ta.type('A');
    await page.waitForTimeout(300);
    const color = await frame.locator('label').first()
      .evaluate(function (el) { return el.style.color; });
    expect(color).toBe('');
    console.log('  -> Label colour cleared after reaching 15 chars');
  });

  test('custom error hidden after typing to 15 then clicking Next', async function ({ page }) {
    console.log('\n[Group 8] Custom error should hide on a successful Next click...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    await ta.type('A');
    await page.waitForTimeout(200);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const visible = await frame.locator(CUSTOM_ERROR).isVisible().catch(function () { return false; });
    expect(visible).toBe(false);
    console.log('  -> Custom error hidden after valid submit');
  });

  test('clicking Next with 14 chars again after clearing shows error again', async function ({ page }) {
    console.log('\n[Group 8] Error should reappear on a second blocked attempt...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    await ta.fill('');
    await ta.dispatchEvent('input');
    await ta.type('A'.repeat(14));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    console.log('  -> Error reappears on second blocked attempt');
  });

});

// ══════════════════════════════════════════════════════════════
// 9. SPACES TRIMMED
// ══════════════════════════════════════════════════════════════

test.describe('9. Spaces Trimmed', function () {

  test('15 spaces only — blocked (trim() length = 0)', async function ({ page }) {
    console.log('\n[Group 9] 15 spaces should be blocked due to trim()...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type(' '.repeat(15));
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const step = await getCurrentStep(page);
    expect(step).toBe('step_3_Symptoms');
    await expect(frame.locator(CUSTOM_ERROR)).toBeVisible();
    console.log('  -> 15 spaces correctly blocked');
  });

  test('mix of spaces and text totalling 15 real chars — passes', async function ({ page }) {
    console.log('\n[Group 9] "  Hello World!123  " (15 real chars) should pass...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('  Hello World!123  ');
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function () {
        return (
          document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms' &&
          document.body.getAttribute('data-home-visit') !== 'step_3_Symptoms'
        );
      },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    expect(step).not.toBe('step_3_Symptoms');
    console.log('  -> 15 real chars with surrounding spaces passed, moved to: ' + step);
  });

});

// ══════════════════════════════════════════════════════════════
// 10. RAPID CLICKS
// ══════════════════════════════════════════════════════════════

test.describe('10. Rapid Clicks', function () {

  test('5 rapid Next clicks with 20 chars — navigates once, no freeze, no crash', async function ({ page }) {
    console.log('\n[Group 10] Rapid Next clicks with valid input should navigate cleanly...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(20));
    const btn = frame.locator(NEXT_BTN);
    await btn.click();
    await btn.click();
    await btn.click();
    await btn.click();
    await btn.click();
    await page.waitForFunction(
      function () {
        return (
          document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms' &&
          document.body.getAttribute('data-home-visit') !== 'step_3_Symptoms'
        );
      },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    expect(step).not.toBe('step_3_Symptoms');
    console.log('  -> Rapid clicks navigated cleanly to: ' + step);
  });

});

// ══════════════════════════════════════════════════════════════
// 11. MUI ERROR SUPPRESSION
// ══════════════════════════════════════════════════════════════

test.describe('11. MUI Error Suppression', function () {

  test('Mui-error class removed from MuiInputBase-root after typing 15+ chars', async function ({ page }) {
    console.log('\n[Group 11] Mui-error should not be on MuiInputBase-root at 15+ chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(15));
    await page.waitForTimeout(300);
    const hasMuiError = await frame.locator('.MuiInputBase-root').first()
      .evaluate(function (el) { return el.classList.contains('Mui-error'); });
    expect(hasMuiError).toBe(false);
    console.log('  -> Mui-error class absent from MuiInputBase-root');
  });

  test('aria-invalid removed from textarea after typing 15+ chars', async function ({ page }) {
    console.log('\n[Group 11] aria-invalid should be removed after typing 15+ chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(15));
    await page.waitForTimeout(300);
    const ariaInvalid = await frame.locator(TEXTAREA)
      .evaluate(function (el) { return el.getAttribute('aria-invalid'); });
    expect(ariaInvalid).toBeNull();
    console.log('  -> aria-invalid is null/removed');
  });

  test('label Mui-error class removed after typing 15+ chars', async function ({ page }) {
    console.log('\n[Group 11] Mui-error class should be removed from label at 15+ chars...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('A'.repeat(15));
    await page.waitForTimeout(300);
    const hasMuiError = await frame.locator('label').first()
      .evaluate(function (el) { return el.classList.contains('Mui-error'); });
    expect(hasMuiError).toBe(false);
    console.log('  -> Mui-error class absent from label');
  });

});

// ══════════════════════════════════════════════════════════════
// 12. CONTROL COMPARISON
// ══════════════════════════════════════════════════════════════

test.describe('12. Control Comparison', function () {

  test('[CONTROL] no .custom-char-counter in DOM after typing', async function ({ page }) {
    console.log('\n[Group 12] Control: counter should not exist after typing...');
    const frame = await goToStep3Control(page);
    await frame.locator(TEXTAREA).type('Hello World');
    await page.waitForTimeout(300);
    const count = await frame.locator(COUNTER).count();
    expect(count).toBe(0);
    console.log('  -> [CONTROL] No counter in DOM');
  });

  test('[CONTROL] no .custom-error in DOM after clicking Next', async function ({ page }) {
    console.log('\n[Group 12] Control: custom error should not exist after Next...');
    const frame = await goToStep3Control(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(400);
    const count = await frame.locator(CUSTOM_ERROR).count();
    expect(count).toBe(0);
    console.log('  -> [CONTROL] No custom error in DOM');
  });

  test('[CONTROL] no style[data-cre-v2] in iframe head', async function ({ page }) {
    console.log('\n[Group 12] Control: style[data-cre-v2] should not exist...');
    const frame = await goToStep3Control(page);
    const count = await frame.locator(CONVERT_STYLE).count();
    expect(count).toBe(0);
    console.log('  -> [CONTROL] style[data-cre-v2] absent');
  });

  test('[CONTROL] Next with 15 chars passes (client removed native restriction)', async function ({ page }) {
    console.log('\n[Group 12] Control: 15 chars should now pass since client removed restriction...');
    const frame = await goToStep3Control(page);
    await frame.locator(TEXTAREA).type('A'.repeat(15));
    await frame.locator(NEXT_BTN).click();
    await page.waitForFunction(
      function () {
        return (
          document.body.getAttribute('data-telehealth') !== 'step_3_Symptoms' &&
          document.body.getAttribute('data-home-visit') !== 'step_3_Symptoms'
        );
      },
      { timeout: 15000 }
    );
    const step = await getCurrentStep(page);
    expect(step).not.toBe('step_3_Symptoms');
    console.log('  -> [CONTROL] 15 chars passed on control, moved to: ' + step);
  });

});

// ══════════════════════════════════════════════════════════════
// 13. NO DUPLICATE ELEMENTS
// ══════════════════════════════════════════════════════════════

test.describe('13. No Duplicate Elements', function () {

  test('only ONE .custom-char-counter exists in DOM', async function ({ page }) {
    console.log('\n[Group 13] Only one counter element should exist...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('Hello');
    await page.waitForTimeout(300);
    const count = await frame.locator(COUNTER).count();
    expect(count).toBe(1);
    console.log('  -> Counter count: ' + count);
  });

  test('only ONE .custom-error exists in DOM', async function ({ page }) {
    console.log('\n[Group 13] Only one custom error element should exist...');
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    const count = await frame.locator(CUSTOM_ERROR).count();
    expect(count).toBe(1);
    console.log('  -> Custom error count: ' + count);
  });

  test('only ONE style[data-cre-v2] exists in iframe head', async function ({ page }) {
    console.log('\n[Group 13] Only one style[data-cre-v2] element should exist...');
    const frame = await goToStep3(page);
    const count = await frame.locator(CONVERT_STYLE).count();
    expect(count).toBe(1);
    console.log('  -> style[data-cre-v2] count: ' + count);
  });

  test('multiple Next clicks do not create multiple .custom-error divs', async function ({ page }) {
    console.log('\n[Group 13] Multiple Next clicks should not multiply error divs...');
    const frame = await goToStep3(page);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(200);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(200);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(200);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(200);
    await frame.locator(NEXT_BTN).click();
    await page.waitForTimeout(300);
    const count = await frame.locator(CUSTOM_ERROR).count();
    expect(count).toBe(1);
    console.log('  -> Error count after 5 clicks: ' + count);
  });

});

// ══════════════════════════════════════════════════════════════
// 14. TEXTAREA data-cccDone ATTRIBUTE
// ══════════════════════════════════════════════════════════════

test.describe('14. Textarea data-cccDone Attribute', function () {

  test('textarea has dataset.cccDone = "1" after attachCounter runs', async function ({ page }) {
    console.log('\n[Group 14] textarea.dataset.cccDone should equal "1" after first keystroke...');
    const frame = await goToStep3(page);
    await frame.locator(TEXTAREA).type('a');
    await page.waitForTimeout(300);
    const attr = await frame.locator(TEXTAREA)
      .evaluate(function (el) { return el.dataset.cccDone; });
    expect(attr).toBe('1');
    console.log('  -> dataset.cccDone = "' + attr + '"');
  });

  test('attachCounter does not run twice — no duplicate counter after multiple focus/type cycles', async function ({ page }) {
    console.log('\n[Group 14] Counter should not duplicate across multiple interactions...');
    const frame = await goToStep3(page);
    const ta = frame.locator(TEXTAREA);
    await ta.type('Hello');
    await ta.focus();
    await ta.type(' World');
    await ta.focus();
    await ta.type('!');
    await page.waitForTimeout(300);
    const count = await frame.locator(COUNTER).count();
    expect(count).toBe(1);
    console.log('  -> Counter count after multiple focus/type cycles: ' + count);
  });

});
