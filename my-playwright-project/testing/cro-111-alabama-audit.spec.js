// @ts-check
const { test, expect } = require('@playwright/test');

const PREVIEW_URL =
  'https://petinsurancegurus.com/?utm_campaign=Cro_mode_111&_conv_eforce=100051836.1000254973';

const ZIP_CODE = '36001';

// Keys are lowercase substrings that appear inside the data-unique attribute
const EXPECTED_DISCOUNTS = {
  lemonade: 28,
  figo: 18,
  odie: 0,
  fetch: 11,
  embrace: 17,
  trupanion: 43,
  pumpkin: 31,
  aspca: 0,
  akc: 28,
  'liberty': 30,   // Liberty Mutual
};

function getDiscountForPartner(dataUnique) {
  const lower = dataUnique.toLowerCase();
  for (const [key, pct] of Object.entries(EXPECTED_DISCOUNTS)) {
    if (lower.includes(key)) return { key, pct };
  }
  return null;
}

function calcExpectedPrice(original, discountPct) {
  if (discountPct === 0) return null; // no discount expected
  const parsed = parseFloat(original.replace(/[^0-9.]/g, ''));
  if (isNaN(parsed)) return null;
  return (Math.ceil(parsed * (1 - discountPct / 100) * 100) / 100).toFixed(2);
}

test.describe('CRO Variation 111 — Alabama ZIP 36001 Audit', () => {
  test('Full variation audit', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(`PAGE ERROR: ${err.message}`);
    });

    // ── 1. Navigate ──────────────────────────────────────────────────────────
    console.log('\n=== STEP 1: Navigating to preview URL ===');
    await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for key elements
    await page.waitForSelector('#comparison-section', { timeout: 20000 });
    await page.waitForSelector('#breed-select', { timeout: 20000 });
    console.log('✓ #comparison-section and #breed-select found');

    // ── 2. Check window.test_111_Experiment ──────────────────────────────────
    console.log('\n=== STEP 2: Checking window.test_111_Experiment ===');
    await page.waitForTimeout(2000); // allow scripts to run
    const experimentValue = await page.evaluate(() => {
      return typeof window.test_111_Experiment !== 'undefined'
        ? JSON.stringify(window.test_111_Experiment)
        : 'undefined';
    });
    console.log(`window.test_111_Experiment = ${experimentValue}`);

    // ── 3. Pre-ZIP checks ────────────────────────────────────────────────────
    console.log('\n=== STEP 3: Pre-ZIP state checks ===');
    const preZipDiscountSpans = await page.$$('.cre-t-111-price-update');
    console.log(`Pre-ZIP .cre-t-111-price-update spans count: ${preZipDiscountSpans.length}`);

    const preZipBodyClass = await page.evaluate(() =>
      document.body.classList.contains('cre-t-111-toolTipContentChange')
    );
    console.log(`Pre-ZIP body class "cre-t-111-toolTipContentChange" present: ${preZipBodyClass}`);

    // ── 4. Enter ZIP code ────────────────────────────────────────────────────
    console.log('\n=== STEP 4: Entering ZIP code 36001 ===');
    const zipInput = await page.waitForSelector('.zip-textinput input.MuiInputBase-input', {
      timeout: 10000,
    });

    await zipInput.click({ clickCount: 3 });
    await zipInput.type(ZIP_CODE, { delay: 80 });

    // Trigger input and change events
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, '.zip-textinput input.MuiInputBase-input');

    console.log('ZIP entered and events dispatched — waiting 1500ms for updates…');
    await page.waitForTimeout(1500);

    // ── 5. Post-ZIP checks ───────────────────────────────────────────────────
    console.log('\n=== STEP 5: Post-ZIP checks ===');

    // Body class
    const postZipBodyClass = await page.evaluate(() =>
      document.body.classList.contains('cre-t-111-toolTipContentChange')
    );
    console.log(`Post-ZIP body class "cre-t-111-toolTipContentChange": ${postZipBodyClass}`);

    // Breed select enabled?
    const breedDisabled = await page.evaluate(() => {
      const el = document.querySelector('#breed-select');
      return el ? el.getAttribute('aria-disabled') : 'element not found';
    });
    const breedEnabled = breedDisabled !== 'true';
    console.log(`#breed-select aria-disabled="${breedDisabled}" → enabled: ${breedEnabled}`);

    // List all partner items
    const partnerData = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]')
      );
      return items.map((item) => {
        const dataUnique = item.getAttribute('data-unique') || '';

        // Original price spans
        const originalSpans = Array.from(
          item.querySelectorAll(
            '.plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)'
          )
        );
        const originalPrices = originalSpans.map((s) => s.textContent.trim());

        // Discounted price spans
        const discountedSpans = Array.from(item.querySelectorAll('.cre-t-111-price-update'));
        const discountedPrices = discountedSpans.map((s) => s.textContent.trim());

        return { dataUnique, originalPrices, discountedPrices };
      });
    });

    console.log(`\nTotal partner items found: ${partnerData.length}`);

    // Build results table
    console.log(
      '\n┌─────────────────────┬──────────────────┬──────────────────┬──────────────────┬────────┐'
    );
    console.log(
      '│ Partner (data-unique)│ Original Price   │ Shown Discounted │ Expected Discount│ Status │'
    );
    console.log(
      '├─────────────────────┼──────────────────┼──────────────────┼──────────────────┼────────┤'
    );

    const results = [];

    for (const partner of partnerData) {
      const match = getDiscountForPartner(partner.dataUnique);
      const discountPct = match ? match.pct : null;

      // Use the first plan detail as representative (or join all)
      const origText = partner.originalPrices.join(' | ') || '—';
      const discText = partner.discountedPrices.join(' | ') || '—';

      let expectedText = '—';
      let status = '—';

      if (discountPct !== null) {
        if (discountPct === 0) {
          // 0% discount: the shown discounted price should equal the original price
          // The span may still exist with the same value, or may not exist at all
          const aspca_same = partner.discountedPrices.length === 0 ||
            partner.discountedPrices.every((dp, i) => {
              const orig = partner.originalPrices[i] || '';
              const origNum = parseFloat(orig.replace(/[^0-9.]/g, ''));
              const discNum = parseFloat(dp.replace(/[^0-9.]/g, ''));
              return Math.abs(origNum - discNum) < 0.02;
            });
          expectedText = 'Same as original (0%)';
          status = aspca_same ? 'PASS' : 'FAIL (unexpected discount applied)';
        } else {
          // Check each original price against its corresponding discounted price
          let allPass = true;
          const expectedPrices = [];

          for (let i = 0; i < partner.originalPrices.length; i++) {
            const orig = partner.originalPrices[i];
            const exp = calcExpectedPrice(orig, discountPct);
            if (exp) expectedPrices.push(`$${exp}`);

            const actual = partner.discountedPrices[i] || '';
            const actualNum = parseFloat(actual.replace(/[^0-9.]/g, ''));
            const expNum = exp ? parseFloat(exp) : null;

            if (exp && expNum !== null && Math.abs(actualNum - expNum) > 0.02) {
              allPass = false;
            }
          }

          expectedText = expectedPrices.join(' | ') || `${discountPct}% off`;
          status = partner.discountedPrices.length === 0 ? 'FAIL (no spans)' : (allPass ? 'PASS' : 'FAIL (price mismatch)');
        }
      } else {
        status = 'UNKNOWN partner';
      }

      results.push({ partner: partner.dataUnique, origText, discText, expectedText, status, discountPct });

      const p = partner.dataUnique.padEnd(20);
      const o = origText.substring(0, 16).padEnd(16);
      const d = discText.substring(0, 16).padEnd(16);
      const e = expectedText.substring(0, 16).padEnd(16);
      const s = status.padEnd(6);
      console.log(`│ ${p}│ ${o} │ ${d} │ ${e} │ ${s} │`);
    }

    console.log(
      '└─────────────────────┴──────────────────┴──────────────────┴──────────────────┴────────┘'
    );

    // Detailed per-partner output
    console.log('\n=== DETAILED PARTNER RESULTS ===');
    for (const r of results) {
      const discLabel =
        r.discountPct !== null ? `Expected discount: ${r.discountPct}%` : 'Not in expected list';
      console.log(`\nPartner: ${r.partner}`);
      console.log(`  Original prices : ${r.origText}`);
      console.log(`  Shown discounted: ${r.discText}`);
      console.log(`  Expected prices : ${r.expectedText}`);
      console.log(`  ${discLabel}`);
      console.log(`  Status          : ${r.status}`);
    }

    // ── 6. Breed dropdown interaction ────────────────────────────────────────
    if (breedEnabled) {
      console.log('\n=== STEP 6: Breed dropdown interaction ===');
      await page.click('#breed-select');

      let breedOptions = [];
      try {
        await page.waitForSelector('[role="listbox"] li', { timeout: 5000 });
        breedOptions = await page.$$eval('[role="listbox"] li', (items) =>
          items.map((li) => li.textContent.trim())
        );
        console.log(`Breed options available (${breedOptions.length}):`);
        breedOptions.slice(0, 20).forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
        if (breedOptions.length > 20) console.log(`  ... and ${breedOptions.length - 20} more`);

        // Select a non-"All Breeds" option
        const specificBreed = breedOptions.find(
          (b) => b.toLowerCase() !== 'all breeds' && b.trim() !== ''
        );
        if (specificBreed) {
          console.log(`\nSelecting breed: "${specificBreed}"`);
          await page.locator('[role="listbox"] li').filter({ hasText: specificBreed }).first().click();
          await page.waitForTimeout(800);

          const afterBreedSpans = await page.$$('.cre-t-111-price-update');
          console.log(
            `After breed selection — .cre-t-111-price-update spans: ${afterBreedSpans.length}`
          );

          // Re-open and select "All Breeds"
          console.log('\nSelecting "All Breeds" again…');
          await page.click('#breed-select');
          await page.waitForSelector('[role="listbox"] li', { timeout: 5000 });
          const allBreedsOption = page.locator('[role="listbox"] li').filter({ hasText: /^All Breeds$/i });
          const allBreedsCount = await allBreedsOption.count();
          if (allBreedsCount > 0) {
            await allBreedsOption.first().click();
          } else {
            await page.keyboard.press('Escape');
          }
          await page.waitForTimeout(800);

          const afterAllBreedsSpans = await page.$$('.cre-t-111-price-update');
          console.log(
            `After "All Breeds" — .cre-t-111-price-update spans: ${afterAllBreedsSpans.length}`
          );
        }
      } catch (e) {
        console.log(`Breed listbox did not appear: ${e.message}`);
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('\n=== STEP 6: Skipped — breed dropdown is NOT enabled after ZIP entry ===');
    }

    // ── 7. Clear ZIP and check reset ─────────────────────────────────────────
    console.log('\n=== STEP 7: Clearing ZIP to check reset ===');
    const zipEl = await page.$('.zip-textinput input.MuiInputBase-input');
    if (zipEl) {
      await zipEl.click({ clickCount: 3 });
      await zipEl.press('Delete');
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, '.zip-textinput input.MuiInputBase-input');
      await page.waitForTimeout(800);

      const postClearDiscountSpans = await page.$$('.cre-t-111-price-update');
      const postClearBodyClass = await page.evaluate(() =>
        document.body.classList.contains('cre-t-111-toolTipContentChange')
      );
      const currentZipVal = await page.inputValue('.zip-textinput input.MuiInputBase-input');
      console.log(`ZIP field value after clear: "${currentZipVal}"`);
      console.log(`Post-clear .cre-t-111-price-update spans: ${postClearDiscountSpans.length}`);
      console.log(`Post-clear body class present: ${postClearBodyClass}`);
      console.log(
        `Reset working: ${postClearDiscountSpans.length === 0 && !postClearBodyClass ? 'YES' : 'PARTIAL/NO'}`
      );
    }

    // ── 8. Console errors ─────────────────────────────────────────────────────
    console.log('\n=== STEP 8: Browser console errors ===');
    if (consoleErrors.length === 0) {
      console.log('No JS console errors detected.');
    } else {
      console.log(`${consoleErrors.length} console error(s):`);
      consoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n=== AUDIT SUMMARY ===');
    console.log(`window.test_111_Experiment : ${experimentValue}`);
    console.log(`Pre-ZIP discount spans     : ${preZipDiscountSpans.length} (expected 0)`);
    console.log(`Pre-ZIP body class         : ${preZipBodyClass} (expected false)`);
    console.log(`Post-ZIP body class        : ${postZipBodyClass} (expected true)`);
    console.log(`Breed dropdown enabled     : ${breedEnabled}`);
    console.log(`Partners found             : ${partnerData.length}`);
    const passCount = results.filter((r) => r.status === 'PASS').length;
    const failCount = results.filter((r) => r.status.startsWith('FAIL')).length;
    console.log(`Discount checks — PASS: ${passCount}, FAIL: ${failCount}`);
    console.log(`Console errors             : ${consoleErrors.length}`);

    // Informational assertions (audit only — we log results above)
    // No hard failures; everything is reported via console.log
  });
});
