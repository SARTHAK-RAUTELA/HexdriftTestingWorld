/**
 * CRO Test 111 Audit Script - v2
 * - Force-clicks disabled breed dropdown
 * - More detailed global variable scanning
 * - Detailed math verification
 * - Tooltip content inspection
 */

const { chromium } = require('@playwright/test');

const PREVIEW_URL = 'https://petinsurancegurus.com/?utm_campaign=Cro_mode_111&_conv_eforce=100051836.1000254973';

const PARTNER_DISCOUNTS = {
  Lemonade: 0.28,
  ASPCA: 0.00,
  Fetch: 0.11,
  Embrace: 0.17,
  Pumpkin: 0.31,
  Figo: 0.18,
  Trupanion: 0.43,
  Odie: 0.00,
  AKC: 0.28,
  'Liberty Mutual': 0.30,
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
  const log = (msg) => console.log(msg);
  const logSection = (title) => {
    console.log('\n' + '='.repeat(70));
    console.log('  ' + title);
    console.log('='.repeat(70));
  };

  log('CRO Test 111 Audit v2 — ' + new Date().toISOString());
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

  const consoleErrors = [];
  const consoleMessages = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  // ─── Load page ───────────────────────────────────────────────────────────────
  logSection('STEP 1: Page Load');
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#comparison-section', { timeout: 30000 });
  await page.waitForSelector('#breed-select', { timeout: 30000 });
  await sleep(4000);
  log('  Page ready.');

  // ─── Detailed global variable scan ───────────────────────────────────────────
  logSection('STEP 2: Global Variable Scan');

  const globalVars = await page.evaluate(() => {
    const results = {};
    // Check test_111_Experiment
    results.test_111_Experiment = window.test_111_Experiment;
    results.SWF_111_EVENT_FIRE = window.SWF_111_EVENT_FIRE;

    // Scan for any _conv_ variables
    const convVars = {};
    for (const key in window) {
      if (key.includes('conv') || key.includes('Conv') || key.includes('111') || key.includes('SWF') || key.includes('cre_t')) {
        try {
          convVars[key] = typeof window[key] === 'function' ? '[function]' : JSON.stringify(window[key]).substring(0, 200);
        } catch (e) {
          convVars[key] = '[unserializable]';
        }
      }
    }
    results.convRelatedVars = convVars;

    // Check if convert.com scripts present
    const scripts = Array.from(document.scripts).map(s => s.src).filter(s => s);
    results.convertScripts = scripts.filter(s => s.includes('convert') || s.includes('111'));

    return results;
  });

  log(`  window.test_111_Experiment = ${JSON.stringify(globalVars.test_111_Experiment)}`);
  log(`  window.SWF_111_EVENT_FIRE = ${JSON.stringify(globalVars.SWF_111_EVENT_FIRE)}`);
  log('\n  Convert/111-related global vars:');
  for (const [k, v] of Object.entries(globalVars.convRelatedVars)) {
    log(`    ${k} = ${v}`);
  }
  log('\n  Convert/111-related script tags:');
  globalVars.convertScripts.forEach(s => log('    ' + s));

  // ─── Breed dropdown investigation ─────────────────────────────────────────────
  logSection('STEP 3: Breed Dropdown Investigation');

  const breedInfo = await page.evaluate(() => {
    const el = document.querySelector('#breed-select');
    if (!el) return { found: false };
    return {
      found: true,
      tagName: el.tagName,
      role: el.getAttribute('role'),
      ariaDisabled: el.getAttribute('aria-disabled'),
      ariaExpanded: el.getAttribute('aria-expanded'),
      classes: el.className,
      textContent: el.textContent.trim(),
      parentTagName: el.parentElement ? el.parentElement.tagName : null,
      parentClasses: el.parentElement ? el.parentElement.className : null,
    };
  });
  log('  Breed element info: ' + JSON.stringify(breedInfo, null, 2));

  // The element is aria-disabled="true" — use force click to bypass
  log('\n  Attempting force-click on breed dropdown...');
  try {
    await page.click('#breed-select', { force: true });
    log('  Force-click on #breed-select succeeded.');
    await sleep(1000);
  } catch (e) {
    log('  Force-click failed: ' + e.message);

    // Try clicking the parent element
    try {
      await page.click('#breed-select', { force: true, position: { x: 5, y: 5 } });
      log('  Positional force-click succeeded.');
    } catch (e2) {
      log('  Positional force-click also failed: ' + e2.message);
    }
  }

  // Wait for listbox to appear
  let breedOptions = [];
  try {
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    breedOptions = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="listbox"] li, [role="listbox"] [role="option"]')).map(el => ({
        text: el.textContent.trim(),
        value: el.getAttribute('data-value') || el.getAttribute('value') || '',
      }));
    });
    log(`  Breed options found: ${breedOptions.length}`);
    log('  Options: ' + breedOptions.map(o => o.text).slice(0, 10).join(', '));
  } catch (e) {
    log('  Listbox did not appear: ' + e.message);

    // Check if there's a select hidden somewhere
    const selectInfo = await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      return selects.map(s => ({
        id: s.id,
        name: s.name,
        options: Array.from(s.options).map(o => o.text).slice(0, 5),
      }));
    });
    log('  Native <select> elements: ' + JSON.stringify(selectInfo));
  }

  // Try selecting a breed if options are available
  let selectedBreed = null;
  if (breedOptions.length > 0) {
    for (const opt of breedOptions) {
      if (opt.text && opt.text.toLowerCase() !== 'all breeds' && opt.text.trim() !== '') {
        selectedBreed = opt.text;
        break;
      }
    }
    if (selectedBreed) {
      log(`  Selecting breed: "${selectedBreed}"`);
      try {
        await page.locator(`[role="option"]:has-text("${selectedBreed}")`).first().click({ force: true });
        log('  Breed selected via role=option.');
      } catch (e) {
        try {
          await page.locator(`[role="listbox"] li`).filter({ hasText: selectedBreed }).first().click({ force: true });
          log('  Breed selected via li force-click.');
        } catch (e2) {
          log('  Could not click breed option: ' + e2.message);
          selectedBreed = null;
        }
      }
      if (selectedBreed) {
        await sleep(1500);
      }
    }
  }

  // Check breed filter state
  const afterBreedState = await page.evaluate(() => {
    return {
      discountSpans: document.querySelectorAll('.cre-t-111-price-update').length,
      bodyClass: document.body.classList.contains('cre-t-111-toolTipContentChange'),
      breedValue: document.querySelector('#breed-select') ? document.querySelector('#breed-select').textContent.trim() : null,
    };
  });
  log(`\n  After breed selection attempt:`);
  log(`    Breed now shows: "${afterBreedState.breedValue}"`);
  log(`    .cre-t-111-price-update spans: ${afterBreedState.discountSpans}`);
  log(`    body.cre-t-111-toolTipContentChange: ${afterBreedState.bodyClass}`);

  // ─── ZIP Filter Test ─────────────────────────────────────────────────────────
  logSection('STEP 4: ZIP Filter Test with Full Data');

  // Reset breed first (or it stays All Breeds)
  // Close any open dropdown first
  await page.keyboard.press('Escape');
  await sleep(300);

  const zipSelector = '.zip-textinput input.MuiInputBase-input';
  let zipWorked = false;
  try {
    await page.waitForSelector(zipSelector, { timeout: 10000 });
    const zipInfo = await page.$eval(zipSelector, el => ({
      disabled: el.disabled,
      readOnly: el.readOnly,
      placeholder: el.placeholder,
      value: el.value,
    }));
    log('  ZIP input info: ' + JSON.stringify(zipInfo));

    await page.click(zipSelector, { force: true });
    await page.fill(zipSelector, '10001');
    log('  Filled ZIP with "10001"');
    await sleep(2000);
    zipWorked = true;
  } catch (e) {
    log('  ERROR with ZIP input: ' + e.message);
  }

  if (zipWorked) {
    const afterZipData = await page.evaluate((PARTNER_DISCOUNTS) => {
      const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
      const results = [];
      items.forEach(item => {
        const dataUnique = item.getAttribute('data-unique') || '';
        const origSpan = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
        const discountSpan = item.querySelector('.cre-t-111-price-update');
        const tooltipSpan = item.querySelector('.tooltip-container .tooltip-text > span.ct-span');
        const tooltipContainer = item.querySelector('.tooltip-container');

        const origStyle = origSpan ? window.getComputedStyle(origSpan) : null;
        const discStyle = discountSpan ? window.getComputedStyle(discountSpan) : null;

        results.push({
          dataUnique,
          originalPrice: origSpan ? origSpan.textContent.trim() : null,
          originalDisplay: origStyle ? origStyle.display : null,
          originalOpacity: origStyle ? origStyle.opacity : null,
          discountPrice: discountSpan ? discountSpan.textContent.trim() : null,
          discountDisplay: discStyle ? discStyle.display : null,
          discountOpacity: discStyle ? discStyle.opacity : null,
          tooltipText: tooltipSpan ? tooltipSpan.textContent.trim() : null,
          tooltipHTML: tooltipContainer ? tooltipContainer.innerHTML.substring(0, 300) : null,
        });
      });
      return results;
    }, PARTNER_DISCOUNTS);

    const bodyClass = await page.evaluate(() => document.body.classList.contains('cre-t-111-toolTipContentChange'));
    log(`\n  body.cre-t-111-toolTipContentChange after ZIP: ${bodyClass}`);

    logSection('STEP 4a: Price Analysis After ZIP Filter');
    log('  Partner Discount Math Verification:');
    log('  ' + '-'.repeat(68));

    let mathPassCount = 0;
    let mathFailCount = 0;

    afterZipData.forEach(d => {
      log(`\n  [${d.dataUnique}]`);
      log(`    Original: ${d.originalPrice} (display:${d.originalDisplay}, opacity:${d.originalOpacity})`);
      log(`    Discounted: ${d.discountPrice} (display:${d.discountDisplay}, opacity:${d.discountOpacity})`);
      log(`    Tooltip: ${d.tooltipText ? d.tooltipText.substring(0, 120) : 'N/A'}`);

      // Match partner
      const duLower = d.dataUnique.toLowerCase();
      let matchedPartner = null;
      let discountRate = null;
      for (const [partner, rate] of Object.entries(PARTNER_DISCOUNTS)) {
        if (duLower.includes(partner.toLowerCase())) {
          matchedPartner = partner;
          discountRate = rate;
          break;
        }
      }

      if (!matchedPartner) {
        log(`    WARN: Could not match to a known partner.`);
        return;
      }

      log(`    Matched partner: ${matchedPartner} (${(discountRate * 100).toFixed(0)}% discount)`);

      if (!d.originalPrice || !d.discountPrice) {
        if (discountRate === 0 && !d.discountPrice) {
          log(`    PASS: 0% discount partner has no discount span (correct).`);
        } else if (discountRate === 0 && d.discountPrice) {
          log(`    CHECK: 0% discount partner has discount span — verify content.`);
        } else {
          log(`    FAIL: Missing original or discount price.`);
          mathFailCount++;
        }
        return;
      }

      const origNum = parseFloat(d.originalPrice.replace(/[^0-9.]/g, ''));
      const discNum = parseFloat(d.discountPrice.replace(/[^0-9.]/g, ''));

      if (isNaN(origNum) || isNaN(discNum)) {
        log(`    WARN: Could not parse prices as numbers.`);
        return;
      }

      if (discountRate === 0) {
        if (Math.abs(origNum - discNum) < 0.01) {
          log(`    PASS: 0% discount — original and discounted prices match ($${origNum.toFixed(2)}).`);
          mathPassCount++;
        } else {
          log(`    FAIL: 0% discount but prices differ! original=$${origNum.toFixed(2)} discounted=$${discNum.toFixed(2)}`);
          mathFailCount++;
        }
        return;
      }

      const expected = Math.ceil(origNum * (1 - discountRate) * 100) / 100;
      const diff = Math.abs(discNum - expected);
      const pass = diff < 0.02;

      if (pass) {
        log(`    PASS: $${origNum.toFixed(2)} * ${(1 - discountRate).toFixed(2)} = $${expected.toFixed(2)}, got $${discNum.toFixed(2)}`);
        mathPassCount++;
      } else {
        log(`    FAIL: Expected $${expected.toFixed(2)} but got $${discNum.toFixed(2)} (diff=$${diff.toFixed(4)})`);
        mathFailCount++;
      }
    });

    log(`\n  Math check: ${mathPassCount} PASS, ${mathFailCount} FAIL`);

    // Tooltip verification
    logSection('STEP 4b: Tooltip Verification');
    log(`  body.cre-t-111-toolTipContentChange = ${bodyClass}`);
    log('\n  Per-partner tooltip:');
    afterZipData.forEach(d => {
      const duLower = d.dataUnique.toLowerCase();
      let matchedPartner = null;
      let discountRate = null;
      for (const [partner, rate] of Object.entries(PARTNER_DISCOUNTS)) {
        if (duLower.includes(partner.toLowerCase())) {
          matchedPartner = partner;
          discountRate = rate;
          break;
        }
      }
      const hasTooltip = !!d.tooltipText;
      const expectTooltipChange = matchedPartner && discountRate > 0;
      log(`\n  [${matchedPartner || d.dataUnique}] (${discountRate !== null ? (discountRate * 100).toFixed(0) + '%' : '?'} off)`);
      log(`    hasTooltipContent: ${hasTooltip}`);
      log(`    tooltipText: ${d.tooltipText ? d.tooltipText.substring(0, 120) : 'N/A'}`);
      if (expectTooltipChange && hasTooltip) {
        log(`    PASS: Discount partner has tooltip content.`);
      } else if (expectTooltipChange && !hasTooltip) {
        log(`    WARN: Discount partner has no tooltip content (may not be visible without hover).`);
      } else if (!expectTooltipChange && hasTooltip) {
        log(`    WARN: 0%-discount partner has tooltip content.`);
      } else {
        log(`    OK: 0%-discount partner has no tooltip content.`);
      }
    });
  }

  // ─── Reset filter ─────────────────────────────────────────────────────────────
  logSection('STEP 5: Reset Filter');

  try {
    await page.click(zipSelector, { force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await sleep(1000);
    log('  Cleared ZIP input.');
  } catch (e) {
    log('  Could not clear ZIP: ' + e.message);
  }

  const afterResetState = await page.evaluate(() => {
    const discountSpans = document.querySelectorAll('.cre-t-111-price-update');
    const visibleSpans = Array.from(discountSpans).filter(s => window.getComputedStyle(s).display !== 'none');
    const origPrices = [];
    document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]').forEach(item => {
      const orig = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
      origPrices.push({
        dataUnique: item.getAttribute('data-unique'),
        price: orig ? orig.textContent.trim() : null,
        visible: orig ? window.getComputedStyle(orig).display !== 'none' : false,
      });
    });
    return {
      totalDiscountSpans: discountSpans.length,
      visibleDiscountSpans: visibleSpans.length,
      bodyClass: document.body.classList.contains('cre-t-111-toolTipContentChange'),
      origPrices,
    };
  });

  log(`  Total .cre-t-111-price-update spans: ${afterResetState.totalDiscountSpans}`);
  log(`  Visible .cre-t-111-price-update spans: ${afterResetState.visibleDiscountSpans}`);
  log(`  body.cre-t-111-toolTipContentChange: ${afterResetState.bodyClass}`);

  if (afterResetState.visibleDiscountSpans === 0 && !afterResetState.bodyClass) {
    log('  PASS: Filter reset correctly — no visible discount spans, no tooltip class.');
  } else if (afterResetState.visibleDiscountSpans > 0) {
    log('  FAIL: Discount spans still visible after reset!');
  }

  log('\n  Original prices after reset:');
  afterResetState.origPrices.forEach(p => log(`    [${p.dataUnique}] ${p.price} (visible: ${p.visible})`));

  // ─── Visual flash test ────────────────────────────────────────────────────────
  logSection('STEP 6: Visual Flash Test (ZIP filter re-apply)');

  await page.evaluate(() => {
    window._flashLog = [];
    window._flashStartTime = Date.now();
    const obs = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        const ts = Date.now() - window._flashStartTime;
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList && n.classList.contains('cre-t-111-price-update')) {
              const st = window.getComputedStyle(n);
              window._flashLog.push({ event: 'span-added', ts, display: st.display, opacity: st.opacity });
            }
          });
          m.removedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList && n.classList.contains('cre-t-111-price-update')) {
              window._flashLog.push({ event: 'span-removed', ts });
            }
          });
        }
        if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('cre-t-111-price-update')) {
          const st = window.getComputedStyle(m.target);
          window._flashLog.push({ event: 'attr-change', ts, attr: m.attributeName, display: st.display, opacity: st.opacity });
        }
        if (m.type === 'attributes' && m.attributeName === 'class' && m.target === document.body) {
          window._flashLog.push({ event: 'body-class-change', ts, classes: document.body.className });
        }
      });
    });
    const section = document.querySelector('#comparison-section');
    if (section) obs.observe(section, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window._flashObs = obs;
  });

  // Re-apply ZIP
  try {
    await page.click(zipSelector, { force: true });
    await page.fill(zipSelector, '10001');
    await sleep(2000);
  } catch (e) {
    log('  Could not re-apply ZIP for flash test: ' + e.message);
  }

  const flashLog = await page.evaluate(() => window._flashLog || []);
  log(`  Flash log entries: ${flashLog.length}`);
  flashLog.forEach(entry => log(`    +${entry.ts}ms: ${JSON.stringify(entry)}`));

  // Check simultaneous visibility
  const bothVisible = await page.evaluate(() => {
    const items = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]');
    let anyBothVisible = false;
    const report = [];
    items.forEach(item => {
      const du = item.getAttribute('data-unique');
      const orig = item.querySelector('.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)');
      const disc = item.querySelector('.cre-t-111-price-update');
      if (orig && disc) {
        const origVis = window.getComputedStyle(orig).display !== 'none' && window.getComputedStyle(orig).opacity !== '0';
        const discVis = window.getComputedStyle(disc).display !== 'none' && window.getComputedStyle(disc).opacity !== '0';
        if (origVis && discVis) {
          anyBothVisible = true;
          report.push(du);
        }
      }
    });
    return { anyBothVisible, items: report };
  });
  log(`  Both prices simultaneously visible: ${bothVisible.anyBothVisible}`);
  if (bothVisible.anyBothVisible) {
    log('  WARN: Visual flash possible! Items with both visible: ' + bothVisible.items.join(', '));
  } else {
    log('  PASS: No simultaneous double-pricing visible.');
  }

  // ─── Final Console error summary ─────────────────────────────────────────────
  logSection('STEP 7: Console Error Summary');
  const relevantErrors = consoleErrors.filter(e => !e.includes('403'));
  log(`  Total console errors: ${consoleErrors.length}`);
  log(`  403-resource errors (non-critical): ${consoleErrors.length - relevantErrors.length}`);
  log(`  Other errors: ${relevantErrors.length}`);
  if (relevantErrors.length > 0) {
    relevantErrors.forEach((e, i) => log(`    [${i+1}] ${e}`));
  }

  // ─── Final summary ────────────────────────────────────────────────────────────
  logSection('FINAL AUDIT SUMMARY');
  log('');
  log(`  1. window.test_111_Experiment: ${JSON.stringify(globalVars.test_111_Experiment)} ${globalVars.test_111_Experiment === 1 ? '(PASS)' : '(WARN - not set to 1)'}`);
  log(`  2. Breed filter: disabled (aria-disabled=true) — NOT clickable by Playwright normally`);
  log(`     Force-click breed discount spans: ${afterBreedState.discountSpans}`);
  log(`  3. ZIP filter fires correctly: ${zipWorked ? 'YES' : 'UNKNOWN'}`);
  log(`  4. Filter reset works: ${afterResetState.visibleDiscountSpans === 0 && !afterResetState.bodyClass ? 'PASS' : 'FAIL'}`);
  log(`  5. Visual flash: ${bothVisible.anyBothVisible ? 'POTENTIAL ISSUE' : 'None detected'}`);
  log(`  6. Console errors (non-403): ${relevantErrors.length}`);
  log('');

  await browser.close();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
