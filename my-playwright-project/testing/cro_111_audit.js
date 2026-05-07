/**
 * CRO Test 111 Audit Script
 * Audits the A/B test variation on petinsurancegurus.com
 * Run: node testing/cro_111_audit.js
 */

const { chromium } = require('@playwright/test');

const PREVIEW_URL = 'https://petinsurancegurus.com/?utm_campaign=Cro_mode_111&_conv_eforce=100051836.1000254973';

const PARTNER_DISCOUNTS = {
  lemonade: 0.28,
  figo: 0.18,
  odie: 0.00,
  fetch: 0.11,
  embrace: 0.17,
  trupanion: 0.43,
  pumpkin: 0.31,
  aspca: 0.00,
  akc: 0.28,
  'liberty mutual': 0.30,
};

function ceilCents(value) {
  return Math.ceil(value * 100) / 100;
}

function expectedDiscountedPrice(original, discountRate) {
  return ceilCents(original * (1 - discountRate));
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const report = [];
  const log = (msg) => { console.log(msg); report.push(msg); };
  const logSection = (title) => {
    const line = '\n' + '='.repeat(60);
    console.log(line);
    console.log(`  ${title}`);
    console.log('='.repeat(60));
    report.push(line);
    report.push(`  ${title}`);
    report.push('='.repeat(60));
  };

  log('Starting CRO Test 111 Audit at ' + new Date().toISOString());
  log('URL: ' + PREVIEW_URL);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  // ─── STEP 1: Load page ───────────────────────────────────────────────────────
  logSection('STEP 1: Page Load');
  try {
    await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    log('  Page loaded (domcontentloaded).');

    // Wait for key elements
    await page.waitForSelector('#comparison-section', { timeout: 30000 });
    log('  #comparison-section found.');
    await page.waitForSelector('#breed-select', { timeout: 30000 });
    log('  #breed-select found.');

    // Extra wait for dynamic content
    await sleep(3000);
    log('  Waited 3s for dynamic content.');
  } catch (e) {
    log('  ERROR loading page: ' + e.message);
    await browser.close();
    return report;
  }

  // ─── STEP 2: Check global JS variables ───────────────────────────────────────
  logSection('STEP 2: Global JS Variables');
  const testVar = await page.evaluate(() => window.test_111_Experiment);
  const swfVar = await page.evaluate(() => typeof window.SWF_111_EVENT_FIRE !== 'undefined' ? window.SWF_111_EVENT_FIRE : '__NOT_SET__');
  log(`  window.test_111_Experiment = ${JSON.stringify(testVar)}`);
  log(`  window.SWF_111_EVENT_FIRE = ${JSON.stringify(swfVar)}`);

  if (testVar === 1) {
    log('  PASS: test_111_Experiment is set to 1 (variation active).');
  } else if (testVar === undefined || testVar === null) {
    log('  WARN: test_111_Experiment is NOT set — variation may not be loaded yet or URL forcing failed.');
  } else {
    log(`  WARN: test_111_Experiment has unexpected value: ${testVar}`);
  }

  // ─── STEP 3: Pre-filter state ─────────────────────────────────────────────────
  logSection('STEP 3: Pre-Filter State');

  const preFilterDiscountSpans = await page.$$('.cre-t-111-price-update');
  log(`  .cre-t-111-price-update spans before filter: ${preFilterDiscountSpans.length}`);

  const preFilterBodyClass = await page.evaluate(() => document.body.classList.contains('cre-t-111-toolTipContentChange'));
  log(`  body.classList contains cre-t-111-toolTipContentChange before filter: ${preFilterBodyClass}`);

  if (preFilterDiscountSpans.length === 0 && !preFilterBodyClass) {
    log('  PASS: No discount spans and no tooltip class before filter (correct).');
  } else {
    log('  FAIL: Discount spans or tooltip class present BEFORE filter — premature firing!');
  }

  // Capture original prices for math check later
  const originalPriceData = await page.evaluate(() => {
    const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
    const result = [];
    items.forEach((item) => {
      const nameEl = item.querySelector('[data-unique]') || item;
      const dataUnique = item.getAttribute('data-unique') || '';
      const priceSpan = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
      const priceText = priceSpan ? priceSpan.textContent.trim() : null;
      result.push({ dataUnique, priceText });
    });
    return result;
  });

  log('\n  Original prices (pre-filter):');
  originalPriceData.forEach(d => log(`    [${d.dataUnique}] price = ${d.priceText}`));

  // ─── STEP 4: Apply Breed Filter ───────────────────────────────────────────────
  logSection('STEP 4: Apply Breed Filter');

  // Get current breed value
  const breedBefore = await page.$eval('#breed-select', el => el.textContent.trim()).catch(() => 'N/A');
  log(`  Breed dropdown text before click: "${breedBefore}"`);

  // Click breed dropdown
  try {
    await page.click('#breed-select');
    log('  Clicked #breed-select');
    await page.waitForSelector('[role="listbox"] li', { timeout: 10000 });
    log('  Listbox options appeared.');
  } catch (e) {
    log('  ERROR: Could not open breed dropdown: ' + e.message);
  }

  // Get all options
  const breedOptions = await page.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('[role="listbox"] li'));
    return lis.map(li => ({ text: li.textContent.trim(), value: li.getAttribute('data-value') || '' }));
  });
  log(`  Available breed options (${breedOptions.length}): ${breedOptions.slice(0, 8).map(o => o.text).join(', ')}${breedOptions.length > 8 ? '...' : ''}`);

  // Select a non-"All Breeds" option
  let selectedBreed = null;
  for (const opt of breedOptions) {
    if (opt.text && opt.text.toLowerCase() !== 'all breeds' && opt.text.trim() !== '') {
      selectedBreed = opt.text;
      break;
    }
  }

  if (selectedBreed) {
    log(`  Selecting breed: "${selectedBreed}"`);
    try {
      await page.click(`[role="listbox"] li >> text="${selectedBreed}"`);
    } catch (e) {
      // Try clicking by index
      try {
        const nonAllIndex = breedOptions.findIndex(o => o.text.toLowerCase() !== 'all breeds' && o.text.trim() !== '');
        if (nonAllIndex >= 0) {
          await page.locator('[role="listbox"] li').nth(nonAllIndex).click();
          log(`  Clicked breed option at index ${nonAllIndex}`);
        }
      } catch (e2) {
        log('  ERROR selecting breed: ' + e2.message);
      }
    }
  } else {
    log('  WARN: No non-All-Breeds option found.');
  }

  await sleep(1500);
  log('  Waited 1500ms after breed selection.');

  // Check discount spans
  const afterBreedDiscountSpans = await page.$$('.cre-t-111-price-update');
  const afterBreedDiscountCount = afterBreedDiscountSpans.length;
  log(`\n  .cre-t-111-price-update spans after breed filter: ${afterBreedDiscountCount}`);

  if (afterBreedDiscountCount > 0) {
    log('  PASS: Discount spans appeared after breed filter.');
  } else {
    log('  FAIL: No discount spans after breed filter — variation did not fire!');
  }

  // Check body class
  const afterBreedBodyClass = await page.evaluate(() => document.body.classList.contains('cre-t-111-toolTipContentChange'));
  log(`  body has cre-t-111-toolTipContentChange after breed filter: ${afterBreedBodyClass}`);

  // Capture discounted prices and original prices
  const afterBreedPriceData = await page.evaluate(() => {
    const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
    const result = [];
    items.forEach((item) => {
      const dataUnique = item.getAttribute('data-unique') || '';
      const origSpan = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
      const discountSpan = item.querySelector('.cre-t-111-price-update');
      const tooltipSpan = item.querySelector('.tooltip-container .tooltip-text > span.ct-span');
      result.push({
        dataUnique,
        originalPrice: origSpan ? origSpan.textContent.trim() : null,
        originalVisible: origSpan ? window.getComputedStyle(origSpan).display !== 'none' : false,
        discountPrice: discountSpan ? discountSpan.textContent.trim() : null,
        discountVisible: discountSpan ? window.getComputedStyle(discountSpan).display !== 'none' : false,
        tooltipText: tooltipSpan ? tooltipSpan.textContent.trim() : null,
      });
    });
    return result;
  });

  log('\n  Prices after breed filter:');
  afterBreedPriceData.forEach(d => {
    log(`    [${d.dataUnique}]`);
    log(`      Original: ${d.originalPrice} (visible: ${d.originalVisible})`);
    log(`      Discounted: ${d.discountPrice} (visible: ${d.discountVisible})`);
    log(`      Tooltip: ${d.tooltipText ? d.tooltipText.substring(0, 100) : 'N/A'}`);
  });

  // ─── STEP 4b: Math verification ───────────────────────────────────────────────
  logSection('STEP 4b: Math Verification on Prices');

  afterBreedPriceData.forEach(d => {
    if (!d.originalPrice || !d.discountPrice) return;

    // Extract numeric value
    const origNum = parseFloat(d.originalPrice.replace(/[^0-9.]/g, ''));
    const discNum = parseFloat(d.discountPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(origNum) || isNaN(discNum)) return;

    // Find partner discount by dataUnique
    let matchedPartner = null;
    let matchedDiscount = null;
    for (const [partner, rate] of Object.entries(PARTNER_DISCOUNTS)) {
      if (d.dataUnique.toLowerCase().includes(partner)) {
        matchedPartner = partner;
        matchedDiscount = rate;
        break;
      }
    }

    if (matchedPartner === null) {
      log(`  [${d.dataUnique}] - could not match to a known partner for math check.`);
      return;
    }

    if (matchedDiscount === 0) {
      log(`  [${d.dataUnique}] (${matchedPartner}) - 0% discount, should have no change.`);
      if (d.discountPrice) {
        log(`    WARN: discountPrice present (${d.discountPrice}) even though discount is 0%.`);
      }
      return;
    }

    const expected = expectedDiscountedPrice(origNum, matchedDiscount);
    const diff = Math.abs(discNum - expected);
    const pass = diff < 0.01;
    log(`  [${d.dataUnique}] (${matchedPartner}, ${(matchedDiscount * 100).toFixed(0)}% off):`);
    log(`    Original: $${origNum.toFixed(2)}, Expected discounted: $${expected.toFixed(2)}, Actual: $${discNum.toFixed(2)} — ${pass ? 'PASS' : 'FAIL (diff: ' + diff.toFixed(4) + ')'}`);
  });

  // ─── STEP 4c: Tooltip check for partners ──────────────────────────────────────
  logSection('STEP 4c: Tooltip & Body Class Checks');

  log(`  body.cre-t-111-toolTipContentChange: ${afterBreedBodyClass}`);

  const partnerTooltipCheck = await page.evaluate(() => {
    const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
    const result = [];
    items.forEach(item => {
      const dataUnique = item.getAttribute('data-unique') || '';
      const tooltipEl = item.querySelector('.tooltip-container .tooltip-text > span.ct-span');
      const hasDiscountSpan = !!item.querySelector('.cre-t-111-price-update');
      result.push({
        dataUnique,
        hasDiscountSpan,
        tooltipText: tooltipEl ? tooltipEl.textContent.trim().substring(0, 150) : null,
      });
    });
    return result;
  });

  partnerTooltipCheck.forEach(d => {
    const du = d.dataUnique.toLowerCase();
    let isZeroDiscount = false;
    for (const [partner, rate] of Object.entries(PARTNER_DISCOUNTS)) {
      if (du.includes(partner) && rate === 0) {
        isZeroDiscount = true;
        break;
      }
    }
    log(`\n  [${d.dataUnique}]`);
    log(`    hasDiscountSpan: ${d.hasDiscountSpan}`);
    log(`    isZeroDiscountPartner: ${isZeroDiscount}`);
    log(`    tooltipText: ${d.tooltipText ? d.tooltipText.substring(0, 120) : 'N/A'}`);
    if (isZeroDiscount && d.hasDiscountSpan) {
      log('    FAIL: 0%-discount partner has a discount span!');
    }
  });

  // ─── STEP 5: ZIP Filter (reset breed first) ───────────────────────────────────
  logSection('STEP 5: ZIP Filter Test');

  // Reset breed to All Breeds
  log('  Resetting breed to "All Breeds"...');
  try {
    await page.click('#breed-select');
    await page.waitForSelector('[role="listbox"] li', { timeout: 10000 });
    const allBreedsOption = await page.locator('[role="listbox"] li').filter({ hasText: 'All Breeds' }).first();
    await allBreedsOption.click();
    log('  Selected "All Breeds".');
    await sleep(800);
  } catch (e) {
    log('  WARN: Could not reset breed: ' + e.message);
  }

  // Check state after breed reset
  const afterBreedResetDiscountSpans = await page.$$('.cre-t-111-price-update');
  log(`  .cre-t-111-price-update spans after breed reset: ${afterBreedResetDiscountSpans.length}`);

  // Now type ZIP
  const zipSelector = '.zip-textinput input.MuiInputBase-input';
  try {
    await page.waitForSelector(zipSelector, { timeout: 10000 });
    await page.click(zipSelector);
    await page.fill(zipSelector, '10001');
    log('  Typed ZIP code "10001"');
    await sleep(1500);
  } catch (e) {
    log('  WARN: Could not fill ZIP input: ' + e.message);
  }

  const afterZipDiscountSpans = await page.$$('.cre-t-111-price-update');
  log(`  .cre-t-111-price-update spans after ZIP filter: ${afterZipDiscountSpans.length}`);

  const afterZipBodyClass = await page.evaluate(() => document.body.classList.contains('cre-t-111-toolTipContentChange'));
  log(`  body.cre-t-111-toolTipContentChange after ZIP filter: ${afterZipBodyClass}`);

  if (afterZipDiscountSpans.length > 0) {
    log('  PASS: Discount spans appeared after ZIP filter.');
  } else {
    log('  FAIL: No discount spans after ZIP filter.');
  }

  const afterZipPriceData = await page.evaluate(() => {
    const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
    const result = [];
    items.forEach((item) => {
      const dataUnique = item.getAttribute('data-unique') || '';
      const origSpan = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
      const discountSpan = item.querySelector('.cre-t-111-price-update');
      result.push({
        dataUnique,
        originalPrice: origSpan ? origSpan.textContent.trim() : null,
        discountPrice: discountSpan ? discountSpan.textContent.trim() : null,
      });
    });
    return result;
  });

  log('\n  Prices after ZIP filter:');
  afterZipPriceData.forEach(d => {
    log(`    [${d.dataUnique}] original=${d.originalPrice} discounted=${d.discountPrice}`);
  });

  // ─── STEP 6: Reset filters ───────────────────────────────────────────────────
  logSection('STEP 6: Reset Filters');

  // Clear ZIP
  try {
    await page.click(zipSelector);
    // Select all and delete
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    log('  Cleared ZIP input.');
    await sleep(800);
  } catch (e) {
    log('  WARN clearing ZIP: ' + e.message);
  }

  const afterResetDiscountSpans = await page.$$('.cre-t-111-price-update');
  log(`  .cre-t-111-price-update spans after filter reset: ${afterResetDiscountSpans.length}`);

  const afterResetBodyClass = await page.evaluate(() => document.body.classList.contains('cre-t-111-toolTipContentChange'));
  log(`  body.cre-t-111-toolTipContentChange after reset: ${afterResetBodyClass}`);

  if (afterResetDiscountSpans.length === 0) {
    log('  PASS: Discount spans removed after reset.');
  } else {
    // Check if they are hidden
    const allHidden = await page.evaluate(() => {
      const spans = document.querySelectorAll('.cre-t-111-price-update');
      return Array.from(spans).every(s => window.getComputedStyle(s).display === 'none');
    });
    log(`  NOTE: Discount spans still exist (${afterResetDiscountSpans.length}) but all hidden: ${allHidden}`);
    if (allHidden) {
      log('  PASS: Discount spans are hidden after reset (acceptable).');
    } else {
      log('  FAIL: Discount spans still visible after reset!');
    }
  }

  // Verify original prices restored
  const afterResetPriceData = await page.evaluate(() => {
    const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
    const result = [];
    items.forEach(item => {
      const dataUnique = item.getAttribute('data-unique') || '';
      const origSpan = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
      result.push({
        dataUnique,
        originalPrice: origSpan ? origSpan.textContent.trim() : null,
        originalVisible: origSpan ? window.getComputedStyle(origSpan).display !== 'none' : false,
      });
    });
    return result;
  });

  log('\n  Prices after reset:');
  afterResetPriceData.forEach(d => {
    log(`    [${d.dataUnique}] original=${d.originalPrice} (visible: ${d.originalVisible})`);
  });

  // ─── STEP 7: Visual flash check ───────────────────────────────────────────────
  logSection('STEP 7: Visual Flash Check');

  // Apply breed filter again and check timing
  log('  Re-applying breed filter to check for flash...');
  let flashObserved = null;
  try {
    await page.click('#breed-select');
    await page.waitForSelector('[role="listbox"] li', { timeout: 10000 });

    // Inject MutationObserver before clicking to detect rapid show/hide
    await page.evaluate(() => {
      window._flashLog = [];
      window._flashObs = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          if (m.type === 'childList') {
            m.addedNodes.forEach(n => {
              if (n.classList && n.classList.contains('cre-t-111-price-update')) {
                window._flashLog.push({ event: 'span-added', ts: Date.now(), style: window.getComputedStyle(n).display });
              }
            });
          }
          if (m.type === 'attributes' && m.attributeName === 'style') {
            const el = m.target;
            if (el.classList && el.classList.contains('cre-t-111-price-update')) {
              window._flashLog.push({ event: 'style-change', ts: Date.now(), display: window.getComputedStyle(el).display });
            }
          }
        });
      });
      const section = document.querySelector('#comparison-section');
      if (section) {
        window._flashObs.observe(section, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
      }
    });

    const nonAllIndex = breedOptions.findIndex(o => o.text.toLowerCase() !== 'all breeds' && o.text.trim() !== '');
    if (nonAllIndex >= 0) {
      await page.locator('[role="listbox"] li').nth(nonAllIndex).click();
    }
    await sleep(1000);

    flashObserved = await page.evaluate(() => window._flashLog || []);
    log(`  Flash log entries: ${flashObserved.length}`);
    if (flashObserved.length > 0) {
      flashObserved.slice(0, 10).forEach(entry => log(`    ${JSON.stringify(entry)}`));
    }

    // Check if both original and new spans were briefly visible at same time
    const bothVisible = await page.evaluate(() => {
      const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
      let anyBothVisible = false;
      items.forEach(item => {
        const orig = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
        const disc = item.querySelector('.cre-t-111-price-update');
        if (orig && disc) {
          const origVis = window.getComputedStyle(orig).display !== 'none';
          const discVis = window.getComputedStyle(disc).display !== 'none';
          if (origVis && discVis) anyBothVisible = true;
        }
      });
      return anyBothVisible;
    });
    log(`  Both original and discounted spans visible simultaneously: ${bothVisible}`);
    if (bothVisible) {
      log('  WARN: Potential visual flash — both prices shown at same time!');
    } else {
      log('  OK: Only one set of prices visible at a time.');
    }
  } catch (e) {
    log('  WARN: Flash check error: ' + e.message);
  }

  // ─── STEP 8: JS Console Errors ───────────────────────────────────────────────
  logSection('STEP 8: Console Errors & Warnings');

  if (consoleErrors.length === 0) {
    log('  No JS console errors detected.');
  } else {
    log(`  JS Console Errors (${consoleErrors.length}):`);
    consoleErrors.forEach((e, i) => log(`    [${i + 1}] ${e}`));
  }

  if (consoleWarnings.length === 0) {
    log('  No JS console warnings detected.');
  } else {
    log(`  JS Console Warnings (${consoleWarnings.length}):`);
    consoleWarnings.slice(0, 10).forEach((w, i) => log(`    [${i + 1}] ${w}`));
  }

  // ─── FINAL SUMMARY ───────────────────────────────────────────────────────────
  logSection('FINAL SUMMARY');

  log(`  test_111_Experiment value: ${testVar}`);
  log(`  SWF_111_EVENT_FIRE: ${swfVar}`);
  log(`  Pre-filter discount spans: ${preFilterDiscountSpans.length} (expected 0)`);
  log(`  Post-breed-filter discount spans: ${afterBreedDiscountCount} (expected > 0)`);
  log(`  Post-zip-filter discount spans: ${afterZipDiscountSpans.length} (expected > 0)`);
  log(`  Post-reset discount spans hidden/removed: ${afterResetDiscountSpans.length === 0 ? 'removed' : afterResetDiscountSpans.length + ' remain'}`);
  log(`  Console errors: ${consoleErrors.length}`);

  await browser.close();
  log('\n  Audit complete.');
  return report;
}

run().then(report => {
  console.log('\n\nAudit finished. Check output above.');
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
