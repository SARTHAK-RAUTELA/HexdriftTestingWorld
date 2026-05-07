/**
 * CRO 111 - Focused Tooltip & 0%-discount Check
 * Checks tooltip text for discount vs. non-discount partners after ZIP filter.
 * Also checks if Odie/AKC/Liberty Mutual appear in the comparison section.
 */

const { chromium } = require('@playwright/test');

const PREVIEW_URL = 'https://petinsurancegurus.com/?utm_campaign=Cro_mode_111&_conv_eforce=100051836.1000254973';
const PARTNER_DISCOUNTS = {
  Lemonade: 0.28, ASPCA: 0.00, Fetch: 0.11, Embrace: 0.17,
  Pumpkin: 0.31, Figo: 0.18, Trupanion: 0.43, Odie: 0.00, AKC: 0.28, 'Liberty Mutual': 0.30,
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function matchPartner(du) {
  const duL = du.toLowerCase();
  for (const [p, r] of Object.entries(PARTNER_DISCOUNTS)) {
    if (duL.includes(p.toLowerCase())) return { partner: p, rate: r };
  }
  return null;
}

async function run() {
  const log = msg => console.log(msg);
  const sec = t => { console.log('\n' + '='.repeat(70) + '\n  ' + t + '\n' + '='.repeat(70)); };

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForSelector('#comparison-section', { timeout: 30000 });
  await sleep(3000);
  log('Page ready.');

  // Check all partners present in DOM
  sec('All Partners in #comparison-section');
  const allPartners = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]'))
      .map(el => el.getAttribute('data-unique'));
  });
  log('Partners found: ' + allPartners.join('\n  '));
  log('\nPartners NOT found: ');
  ['odie', 'akc', 'liberty'].forEach(name => {
    const found = allPartners.some(p => p.toLowerCase().includes(name));
    log(`  ${name}: ${found ? 'present' : 'MISSING from DOM'}`);
  });

  // Apply ZIP
  const zip = '.zip-textinput input.MuiInputBase-input';
  await page.waitForSelector(zip, { timeout: 10000 });
  await page.fill(zip, '10001');
  await sleep(3000);
  log('\nZIP "10001" applied.');

  // Tooltip text check per partner (click popover, read ct-span)
  sec('Tooltip Content Per Partner (after ZIP)');
  const bodyClass = await page.evaluate(() => document.body.classList.contains('cre-t-111-toolTipContentChange'));
  log('body.cre-t-111-toolTipContentChange: ' + bodyClass);

  for (const du of allPartners) {
    const matched = matchPartner(du);
    const partnerName = matched ? matched.partner : du;
    const rate = matched ? matched.rate : null;

    // Check for discount span
    const hasDiscSpan = await page.locator(`[data-unique="${du}"] .cre-t-111-price-update`).count() > 0;
    const discText = hasDiscSpan ? await page.locator(`[data-unique="${du}"] .cre-t-111-price-update`).first().textContent().catch(() => null) : null;

    // Try to click popover and read ct-span text
    let ctSpanText = null;
    try {
      // The ct-span is inside .tooltip-text which is hidden, but after click it may become visible
      const btn = page.locator(`[data-unique="${du}"] .oxy-popover button.plan-cost-tooltip`).first();
      if (await btn.count() > 0) {
        await btn.click({ force: true, timeout: 3000 });
        await sleep(400);
        // Try reading ct-span
        ctSpanText = await page.locator(`[data-unique="${du}"] .tooltip-container .tooltip-text`).textContent({ timeout: 2000 }).catch(() => null);
        if (!ctSpanText || ctSpanText.trim() === '') {
          // Try the inner span
          ctSpanText = await page.evaluate((duAttr) => {
            const item = document.querySelector(`[data-unique="${duAttr}"]`);
            if (!item) return null;
            const tooltipText = item.querySelector('.tooltip-text');
            if (!tooltipText) return null;
            return window.getComputedStyle(tooltipText).display + ' | ' + tooltipText.textContent.trim().substring(0, 200);
          }, du);
        }
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(200);
      }
    } catch (e) {}

    // Also inspect directly via evaluate
    const tooltipInspect = await page.evaluate((duAttr) => {
      const item = document.querySelector(`[data-unique="${duAttr}"]`);
      if (!item) return null;
      const allTooltipEls = Array.from(item.querySelectorAll('.tooltip-text, .tooltip-text *, .ct-span, [class*="tooltip"]'));
      return allTooltipEls.slice(0, 5).map(el => ({
        tag: el.tagName,
        class: el.className.substring(0, 50),
        text: el.textContent.trim().substring(0, 100),
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
      }));
    }, du);

    log(`\n[${partnerName}] (${rate !== null ? (rate * 100).toFixed(0) + '% off' : '?'}) — du="${du}"`);
    log(`  hasDiscountSpan: ${hasDiscSpan}`);
    log(`  discountText: ${discText || 'N/A'}`);
    log(`  ctSpanText: ${ctSpanText ? ctSpanText.trim().substring(0, 150) : 'N/A'}`);
    if (tooltipInspect && tooltipInspect.length > 0) {
      log('  Tooltip DOM elements:');
      tooltipInspect.forEach(el => {
        log(`    <${el.tag} class="${el.class}"> display=${el.display} vis=${el.visibility} text="${el.text}"`);
      });
    }

    // Validation
    if (rate === 0) {
      if (hasDiscSpan) {
        const origNum = await page.evaluate((duAttr) => {
          const orig = document.querySelector(`[data-unique="${duAttr}"] .plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)`);
          return orig ? orig.textContent.trim() : null;
        }, du);
        const discNum = parseFloat((discText || '').replace(/[^0-9.]/g, ''));
        const origParsed = parseFloat((origNum || '').replace(/[^0-9.]/g, ''));
        if (!isNaN(discNum) && !isNaN(origParsed) && Math.abs(discNum - origParsed) < 0.02) {
          log(`  VALIDATION: PASS — 0% discount, discounted price equals original ($${discNum.toFixed(2)}).`);
        } else {
          log(`  VALIDATION: CHECK — 0% discount partner has a discount span. orig=${origNum}, disc=${discText}`);
        }
      } else {
        log('  VALIDATION: PASS — 0% discount partner has no discount span.');
      }
    } else if (rate !== null) {
      if (hasDiscSpan) {
        log('  VALIDATION: PASS — Non-zero discount partner has a discount span.');
      } else {
        log('  VALIDATION: FAIL — Non-zero discount partner missing discount span!');
      }
    }
  }

  // Final tooltip summary
  sec('Tooltip CSS State Summary');
  log('The variation injects body class "cre-t-111-toolTipContentChange" when active.');
  log('The CSS for this body class presumably swaps the .tooltip-text content.');
  log('');
  log('Key observation: Tooltip structure is CSS-driven (oxy-popover), not JS text swap.');
  log('The variation JS changes the body class — CSS then applies different tooltip styles.');
  log('');
  log('Can we verify tooltip CONTENT changed?');
  const tooltipContentCheck = await page.evaluate(() => {
    // The variation says it changes tooltip content for partners with discount > 0
    // Check if there's a second span or modified span inside tooltip-text
    const results = [];
    document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique]').forEach(item => {
      const du = item.getAttribute('data-unique');
      const tooltipText = item.querySelector('.tooltip-text');
      if (tooltipText) {
        const children = Array.from(tooltipText.children);
        results.push({
          du,
          childCount: children.length,
          children: children.map(c => ({
            tag: c.tagName, class: c.className.substring(0, 60),
            text: c.textContent.trim().substring(0, 120),
            display: window.getComputedStyle(c).display,
          })),
        });
      } else {
        results.push({ du, childCount: 0, note: 'No .tooltip-text element' });
      }
    });
    return results;
  });

  tooltipContentCheck.forEach(t => {
    const m = matchPartner(t.du);
    log(`\n[${m ? m.partner : t.du}] .tooltip-text children: ${t.childCount}`);
    if (t.note) {
      log(`  NOTE: ${t.note}`);
    } else {
      t.children.forEach(c => {
        log(`  <${c.tag} class="${c.class}"> display=${c.display}: "${c.text}"`);
      });
    }
  });

  await browser.close();
  log('\nTooltip audit done.');
}

run().catch(err => { console.error(err); process.exit(1); });
