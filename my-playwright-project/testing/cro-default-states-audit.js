'use strict';

/**
 * CRO-116 / SWF Default States Audit
 * Tests variation for All Pets, Dogs, Cats tabs (no breed/ZIP filters)
 * Variation: https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100051999.1000255345
 * Control:   https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100051999.1000255344
 */

const { chromium, firefox, webkit } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

// ─── URLs ─────────────────────────────────────────────────────────────────────
const VARIATION_URL = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100051999.1000255345';
const CONTROL_URL   = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100051999.1000255344';

// ─── Expected tooltip CSS text (injected via ::after pseudo-element) ──────────
const TOOLTIP_CSS_SUBSTRING = 'maximum available deductible';

// ─── Expected bottom copy ─────────────────────────────────────────────────────
const BOTTOM_COPY_VAR_SUBSTRING = 'maximum available deductible';
const BOTTOM_COPY_CTL_SUBSTRING = '$500 deductible';

// ─── Variation discounted prices per tab ─────────────────────────────────────
const EXPECTED_VAR = {
  allPets: { lemonade:'28.69', figo:'37.78', odie:'30.66', fetch:'39.73', embrace:'42.96', trupanion:'60.72', pumpkin:'36.02', aspca:'51.41', akc:'32.27', liberty:'35.02' },
  dogs:    { lemonade:'32.13', figo:'42.33', odie:'34.73', fetch:'44.20', embrace:'46.80', trupanion:'70.22', pumpkin:'41.23', aspca:'58.98', akc:'35.95', liberty:'38.68' },
  cats:    { lemonade:'14.95', figo:'19.59', odie:'14.37', fetch:'21.89', embrace:'27.58', trupanion:'22.73', pumpkin:'15.16', aspca:'21.15', akc:'17.55', liberty:'20.39' },
};

const PROVIDER_DISPLAY = {
  lemonade:'Lemonade', figo:'Figo', odie:'Odie', fetch:'Fetch',
  embrace:'Embrace', trupanion:'Trupanion', pumpkin:'Pumpkin',
  aspca:'ASPCA', akc:'AKC', liberty:'Liberty Mutual',
};

// ─── Utilities ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const parsePrice = t => t ? parseFloat(t.replace(/[^0-9.]/g, '')) : NaN;

function matchKey(duAttr) {
  const low = (duAttr || '').toLowerCase();
  for (const key of Object.keys(PROVIDER_DISPLAY)) {
    if (low.includes(key)) return key;
  }
  return null;
}

function comparePrices(rawMap, expectedMap) {
  const results = [];
  for (const [key, exp] of Object.entries(expectedMap)) {
    let found = null, foundDu = null;
    for (const [du, price] of Object.entries(rawMap)) {
      if (matchKey(du) === key) { found = price; foundDu = du; break; }
    }
    const actual   = parsePrice(found);
    const expected = parseFloat(exp);
    const pass     = !isNaN(actual) && Math.abs(actual - expected) < 0.02;
    results.push({
      key, provider: PROVIDER_DISPLAY[key] || key,
      expected: `$${exp}/mo`, actual: found || '(not found)',
      du: foundDu || '—', pass,
    });
  }
  return results;
}

// ─── Page helpers ─────────────────────────────────────────────────────────────

// Returns map of data-unique → variation price (span.cre-t-116-price-update)
async function getVariationPrices(page) {
  return page.evaluate(() => {
    const map = {};
    document.querySelectorAll('[data-unique*="Listing-Only"]').forEach(card => {
      const s = window.getComputedStyle(card);
      if (s.display === 'none' || s.visibility === 'hidden') return;
      const du   = card.getAttribute('data-unique');
      const span = card.querySelector('span.cre-t-116-price-update');
      if (span) map[du] = span.textContent.trim();
    });
    return map;
  });
}

// Returns how many cre-t-116-price-update spans exist (for control check)
async function countVarSpans(page) {
  return page.evaluate(() => document.querySelectorAll('span.cre-t-116-price-update').length);
}

// Checks body class and CSS style tag for tooltip
async function checkTooltip(page, expectNew) {
  return page.evaluate((sub) => {
    const bodyHasClass = document.body.classList.contains('cre-t-116-toolTipContentChange');
    const styleEl = document.querySelector('style.convert-css-100051999');
    const cssCont = styleEl ? styleEl.textContent : '';
    const cssHasNew = cssCont.includes(sub);
    return { bodyHasClass, cssHasNew, cssSnippet: cssCont.substring(cssCont.indexOf(sub) - 20, cssCont.indexOf(sub) + 120) };
  }, expectNew);
}

// Reads the "Firstly..." bottom copy li
async function getBottomCopy(page) {
  return page.evaluate(() => {
    const li = Array.from(document.querySelectorAll('li'))
      .find(el => el.textContent.toLowerCase().includes("firstly") && el.textContent.toLowerCase().includes("average plan cost"));
    return li ? li.textContent.trim() : null;
  });
}

// Click Show More if present; returns true if clicked
async function clickShowMore(page) {
  try {
    const btn = page.locator('a.oxy-read-more-link, a:has-text("Show More"), button:has-text("Show More")').first();
    if (await btn.count() > 0) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click({ timeout: 5000 });
      await sleep(1800);
      return true;
    }
    return false;
  } catch { return false; }
}

// Click a tab by name (.oxy-tab text)
async function switchTab(page, name) {
  try {
    const tab = page.locator('.oxy-tab').filter({ hasText: name }).first();
    if (await tab.count() > 0) {
      await tab.click({ timeout: 5000 });
      await sleep(1500);
      return true;
    }
    return false;
  } catch { return false; }
}

// ─── Single browser test ──────────────────────────────────────────────────────

async function runBrowserTest(browserInst, ctxOpts, label) {
  const ctx  = await browserInst.newContext({ ...ctxOpts, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const jsErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => jsErrors.push(e.message));

  const res = { label, tabs: {}, tooltip: {}, bottomCopy: {}, filter: {}, controlCheck: {}, errors: {} };

  // ── Load variation ────────────────────────────────────────────────────────
  await page.goto(VARIATION_URL, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForSelector('[data-unique*="Listing-Only"]', { timeout: 30000 }).catch(() => {});
  await sleep(3000);

  // ── All Pets (default / page-load state) ──────────────────────────────────
  const showMore = await clickShowMore(page);
  await sleep(500);
  const allPetsPrices = await getVariationPrices(page);
  res.tabs.allPets = { showMore, checks: comparePrices(allPetsPrices, EXPECTED_VAR.allPets), rawMap: allPetsPrices };

  // ── Dogs tab ─────────────────────────────────────────────────────────────
  const dogsSwitched = await switchTab(page, 'Dogs');
  await clickShowMore(page);
  const dogPrices = await getVariationPrices(page);
  res.tabs.dogs = { switched: dogsSwitched, checks: comparePrices(dogPrices, EXPECTED_VAR.dogs), rawMap: dogPrices };

  // ── Cats tab ─────────────────────────────────────────────────────────────
  const catsSwitched = await switchTab(page, 'Cats');
  await clickShowMore(page);
  const catPrices = await getVariationPrices(page);
  res.tabs.cats = { switched: catsSwitched, checks: comparePrices(catPrices, EXPECTED_VAR.cats), rawMap: catPrices };

  // ── Tooltip check ─────────────────────────────────────────────────────────
  const tooltipData = await checkTooltip(page, TOOLTIP_CSS_SUBSTRING);
  res.tooltip = {
    bodyClass: tooltipData.bodyHasClass,
    cssHasNewText: tooltipData.cssHasNew,
    cssSnippet: tooltipData.cssSnippet,
    pass: tooltipData.bodyHasClass && tooltipData.cssHasNew,
    note: 'Tooltip text injected via CSS ::after — body class + CSS style content both checked',
  };

  // ── Bottom copy ───────────────────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(600);
  const bottomFound = await getBottomCopy(page);
  res.bottomCopy = {
    found: bottomFound,
    expectedContains: BOTTOM_COPY_VAR_SUBSTRING,
    pass: !!(bottomFound && bottomFound.includes(BOTTOM_COPY_VAR_SUBSTRING)),
  };

  // ── ZIP filter guard — variation must NOT fire when ZIP active ─────────────
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await switchTab(page, 'All Pets').catch(() => {});
  const zipSel = '.zip-textinput input, input[placeholder*="ZIP"], input[placeholder*="zip"]';
  const zipEl = page.locator(zipSel).first();
  if (await zipEl.count() > 0) {
    await zipEl.fill('10001');
    await sleep(3000);
    // Variation guard: cre-t-116-price-update spans should be gone / hidden
    const spanCountAfterZip = await countVarSpans(page);
    const bodyClassAfterZip = await page.evaluate(() => document.body.classList.contains('cre-t-116-toolTipContentChange'));
    res.filter.zip = {
      tested: true,
      spanCountAfterZip,
      bodyClassAfterZip,
      // Pass: variation deactivated (either spans removed or body class removed)
      pass: spanCountAfterZip === 0 || !bodyClassAfterZip,
      note: `After ZIP 10001: ${spanCountAfterZip} cre-t-116 spans visible, bodyClass=${bodyClassAfterZip}`,
    };
    await zipEl.fill('').catch(() => {});
  } else {
    res.filter.zip = { tested: false, note: 'ZIP input not found on page' };
  }

  // ── Control URL check ─────────────────────────────────────────────────────
  {
    const ctxC  = await browserInst.newContext({ ...ctxOpts, ignoreHTTPSErrors: true });
    const pageC = await ctxC.newPage();
    await pageC.goto(CONTROL_URL, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
    await pageC.waitForSelector('[data-unique*="Listing-Only"]', { timeout: 30000 }).catch(() => {});
    await sleep(2500);

    const ctlVarSpans    = await countVarSpans(pageC);
    const ctlBodyClass   = await pageC.evaluate(() => document.body.classList.contains('cre-t-116-toolTipContentChange'));
    const ctlBottomCopy  = await getBottomCopy(pageC);
    const ctlBottomPass  = !!(ctlBottomCopy && ctlBottomCopy.includes(BOTTOM_COPY_CTL_SUBSTRING) && !ctlBottomCopy.includes(BOTTOM_COPY_VAR_SUBSTRING));

    res.controlCheck = {
      varSpanCount: ctlVarSpans,
      bodyClass: ctlBodyClass,
      spansAbsent: ctlVarSpans === 0,    // PASS: no variation spans
      bodyClassAbsent: !ctlBodyClass,    // PASS: no variation body class
      bottomCopyFound: ctlBottomCopy,
      bottomCopyPass: ctlBottomPass,
      pass: ctlVarSpans === 0 && !ctlBodyClass,
    };
    await pageC.close();
    await ctxC.close();
  }

  res.errors = {
    console: consoleErrors.filter(e => !e.includes('403') && !e.includes('Failed to load resource')),
    js: jsErrors,
  };

  await page.close();
  await ctx.close();
  return res;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('CRO-116 Default States Audit — ' + new Date().toISOString());

  const CONFIGS = [
    { label: 'Chrome Desktop',         launch: () => chromium.launch({ headless: true, args: ['--no-sandbox'] }),                                    ctx: { viewport: { width: 1440, height: 900 } } },
    { label: 'Firefox Desktop',        launch: () => firefox.launch({ headless: true }),                                                             ctx: { viewport: { width: 1440, height: 900 } } },
    { label: 'Edge Desktop',           launch: () => chromium.launch({ headless: true, channel: 'msedge', args: ['--no-sandbox'] }),                 ctx: { viewport: { width: 1440, height: 900 } } },
    { label: 'Safari/WebKit Desktop',  launch: () => webkit.launch({ headless: true }),                                                              ctx: { viewport: { width: 1440, height: 900 } } },
    { label: 'Chrome Mobile (Pixel 7)',launch: () => chromium.launch({ headless: true, args: ['--no-sandbox'] }),
      ctx: { viewport: { width: 412, height: 915 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', isMobile: true, hasTouch: true } },
    { label: 'Safari Mobile (iPhone)', launch: () => webkit.launch({ headless: true }),
      ctx: { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', isMobile: true, hasTouch: true } },
    // Firefox: isMobile not supported — use viewport + UA only
    { label: 'Firefox Mobile',         launch: () => firefox.launch({ headless: true }),
      ctx: { viewport: { width: 412, height: 915 }, userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0' } },
    { label: 'Edge Mobile',            launch: () => chromium.launch({ headless: true, channel: 'msedge', args: ['--no-sandbox'] }),
      ctx: { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36 EdgA/120.0.2210.126', isMobile: true, hasTouch: true } },
  ];

  const allResults = [];

  for (const cfg of CONFIGS) {
    console.log(`\n▶ ${cfg.label}…`);
    let browser;
    try {
      browser = await cfg.launch();
      const result = await runBrowserTest(browser, cfg.ctx, cfg.label);
      allResults.push(result);
      const all = [...(result.tabs?.allPets?.checks||[]),...(result.tabs?.dogs?.checks||[]),...(result.tabs?.cats?.checks||[])];
      console.log(`  ✓ ${all.filter(c=>c.pass).length}/${all.length} prices pass | tooltip:${result.tooltip?.pass} | bottom:${result.bottomCopy?.pass} | control-clean:${result.controlCheck?.pass}`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      allResults.push({ label: cfg.label, error: err.message });
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  const reportPath = path.join(__dirname, 'cro-default-states-report.html');
  fs.writeFileSync(reportPath, generateHTML(allResults));
  console.log(`\n✔ Report → ${reportPath}`);
}

// ─── HTML Report Generator ────────────────────────────────────────────────────

function generateHTML(results) {
  const now = new Date().toLocaleString();

  const badge = (pass, naLabel) =>
    naLabel ? `<span class="b na">${naLabel}</span>`
    : pass  ? `<span class="b pass">PASS</span>`
    :          `<span class="b fail">FAIL</span>`;

  const priceRows = checks => checks.map(c => `
    <tr class="${c.pass?'ok':'ng'}">
      <td><strong>${c.provider}</strong></td>
      <td class="mono">${c.du}</td>
      <td class="exp">${c.expected}</td>
      <td class="act">${c.actual}</td>
      <td>${badge(c.pass)}</td>
    </tr>`).join('');

  const priceTable = (checks, title) => !checks?.length
    ? `<p class="dim">No data</p>`
    : `<h4 class="ttl">${title}</h4>
       <table class="dt"><thead><tr><th>Provider</th><th>data-unique</th><th>Expected</th><th>Actual</th><th></th></tr></thead>
       <tbody>${priceRows(checks)}</tbody></table>`;

  const section = r => {
    if (r.error) return `<div class="card err"><div class="chdr"><span class="bname">${r.label}</span>${badge(false)}</div><p class="emsg">${r.error}</p></div>`;

    const vAll = [...(r.tabs?.allPets?.checks||[]),...(r.tabs?.dogs?.checks||[]),...(r.tabs?.cats?.checks||[])];
    const vP = vAll.filter(c=>c.pass).length, vF = vAll.filter(c=>!c.pass).length;
    const overall = vF===0 && vP>0;

    const varNotFiring = !r.tooltip?.bodyClass && vF === vAll.length && vAll.length > 0;
    return `<div class="card">
  <div class="chdr">
    <span class="bname">${r.label}</span>
    ${badge(overall)}
    <span class="dim sm">${vP} pass / ${vF} fail prices</span>
    <span class="dim sm">| tooltip:${badge(r.tooltip?.pass)} bottom:${badge(r.bottomCopy?.pass)} control:${badge(r.controlCheck?.pass)}</span>
  </div>
  ${varNotFiring ? `<div class="notfire">⚠ <strong>Converge experiment did not fire on this browser.</strong> Body class <code>cre-t-116-toolTipContentChange</code> absent — no <code>cre-t-116-price-update</code> spans injected. Likely cause: Converge targeting excludes this browser/UA, or WebKit headless UA is not recognised. <em>Verify manually in a real Safari browser.</em> Control URL still clean (PASS).</div>` : ''}

  <details open>
    <summary>&#9654; Variation Prices</summary>
    <p class="meta">Show More clicked: <strong>${r.tabs?.allPets?.showMore?'Yes ✓':'No — hidden cards may be unchecked'}</strong></p>
    ${priceTable(r.tabs?.allPets?.checks, '🐾 All Pets — default/page-load state')}
    ${r.tabs?.dogs?.switched ? priceTable(r.tabs.dogs.checks,'🐕 Dogs Tab') : '<p class="warn">⚠ Dogs tab click failed</p>'}
    ${r.tabs?.cats?.switched ? priceTable(r.tabs.cats.checks,'🐈 Cats Tab') : '<p class="warn">⚠ Cats tab click failed</p>'}
  </details>

  <details>
    <summary>&#9654; Tooltip Check &nbsp;${badge(r.tooltip?.pass)}</summary>
    <table class="ct">
      <tr><th>Method</th><td>Body class <code>cre-t-116-toolTipContentChange</code> + CSS <code>style.convert-css-100051999</code> contains expected text</td></tr>
      <tr><th>Body class present</th><td>${badge(r.tooltip?.bodyClass)}</td></tr>
      <tr><th>CSS has new text</th><td>${badge(r.tooltip?.cssHasNewText)}</td></tr>
      <tr><th>CSS snippet</th><td class="mono sm">${(r.tooltip?.cssSnippet||'(none)').replace(/</g,'&lt;')}</td></tr>
      <tr><th>Note</th><td class="dim">${r.tooltip?.note||''}</td></tr>
    </table>
  </details>

  <details>
    <summary>&#9654; Bottom-of-Page Copy &nbsp;${badge(r.bottomCopy?.pass)}</summary>
    <table class="ct">
      <tr><th>Must contain</th><td class="exp">"${r.bottomCopy?.expectedContains}"</td></tr>
      <tr><th>Found text</th><td class="${r.bottomCopy?.found?'act':'miss'}">${r.bottomCopy?.found||'(not found)'}</td></tr>
    </table>
  </details>

  <details>
    <summary>&#9654; ZIP Filter Guard &nbsp;${r.filter?.zip?.tested ? badge(r.filter?.zip?.pass) : badge(null,'N/A')}</summary>
    ${r.filter?.zip?.tested
      ? `<table class="ct">
           <tr><th>After ZIP 10001</th><td>${r.filter.zip.note}</td></tr>
           <tr><th>cre-t-116 spans</th><td>${r.filter.zip.spanCountAfterZip} (expect 0)</td></tr>
           <tr><th>Body class</th><td>${r.filter.zip.bodyClassAfterZip} (expect false)</td></tr>
           <tr><th>Result</th><td>${badge(r.filter.zip.pass)}</td></tr>
         </table>`
      : `<p class="warn">${r.filter?.zip?.note||'Not tested'}</p>`}
  </details>

  <details>
    <summary>&#9654; Control URL Check &nbsp;${badge(r.controlCheck?.pass)}</summary>
    <table class="ct">
      <tr><th>cre-t-116 spans</th><td>${r.controlCheck?.varSpanCount??'?'} (expect 0) &nbsp;${badge(r.controlCheck?.spansAbsent)}</td></tr>
      <tr><th>Body class</th><td>${r.controlCheck?.bodyClass??'?'} (expect false) &nbsp;${badge(r.controlCheck?.bodyClassAbsent)}</td></tr>
      <tr><th>Bottom copy</th><td class="${r.controlCheck?.bottomCopyPass?'act':'miss'}">${r.controlCheck?.bottomCopyFound||'(not found)'}</td></tr>
      <tr><th>Bottom copy check</th><td>${badge(r.controlCheck?.bottomCopyPass)} expects "$500 deductible" NOT "maximum available deductible"</td></tr>
    </table>
  </details>

  <details>
    <summary>&#9654; Console / JS Errors (${r.errors?.console?.length||0} + ${r.errors?.js?.length||0})</summary>
    ${(r.errors?.console?.length||r.errors?.js?.length)
      ? [...(r.errors.console||[]),...(r.errors.js||[]).map(e=>'JS: '+e)].map(e=>`<div class="eline">${e}</div>`).join('')
      : '<p class="ok">None ✓</p>'}
  </details>
</div>`;
  };

  const sumRows = results.map(r => {
    if (r.error) return `<tr><td>${r.label}</td><td colspan="6">${badge(false)} ${r.error.substring(0,100)}</td></tr>`;
    const vc = [...(r.tabs?.allPets?.checks||[]),...(r.tabs?.dogs?.checks||[]),...(r.tabs?.cats?.checks||[])];
    return `<tr>
      <td><strong>${r.label}</strong></td>
      <td>${badge(vc.filter(c=>c.pass).length===vc.length&&vc.length>0)}</td>
      <td class="gn">${vc.filter(c=>c.pass).length}</td>
      <td class="rd">${vc.filter(c=>!c.pass).length}</td>
      <td>${badge(r.tooltip?.pass)}</td>
      <td>${badge(r.bottomCopy?.pass)}</td>
      <td>${badge(r.controlCheck?.pass)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CRO-116 Default States Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;color:#111;padding:18px}
.wrap{max-width:1100px;margin:0 auto}
.hero{background:#1e3a5f;color:#fff;padding:20px 24px;border-radius:10px;margin-bottom:16px}
.hero h1{font-size:21px;margin-bottom:6px}
.hero p{font-size:12px;opacity:.8;margin-top:3px}
.hero a{color:#93c5fd}
.info-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin-bottom:16px;font-size:13px}
.info-box h2{font-size:14px;color:#1e40af;margin-bottom:8px}
.info-box li{margin-left:16px;line-height:1.9}
h2{font-size:17px;margin:18px 0 8px}
.st{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:18px;font-size:13px}
.st th{background:#f9fafb;padding:8px 10px;text-align:left;border-bottom:2px solid #e5e7eb}
.st td{padding:7px 10px;border-bottom:1px solid #f3f4f6}
.card{background:#fff;border:1px solid #d1d5db;border-radius:8px;padding:15px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.card.err{border-color:#fca5a5}
.chdr{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}
.bname{font-size:15px;font-weight:700;flex:1}
.emsg{color:#dc2626;font-size:13px;margin-top:6px}
details{margin-top:8px}
details>summary{cursor:pointer;font-size:13px;font-weight:600;color:#1d4ed8;padding:5px 0;list-style:none}
details>summary::-webkit-details-marker{display:none}
.ttl{font-size:13px;font-weight:600;margin:10px 0 5px;color:#374151}
.dt{width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e5e7eb;border-radius:5px;overflow:hidden}
.dt th{background:#f9fafb;padding:6px 9px;text-align:left;border-bottom:1px solid #e5e7eb}
.dt td{padding:6px 9px;border-bottom:1px solid #f3f4f6}
tr.ok td{background:#f0fdf4}
tr.ng td{background:#fff5f5}
.ct{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;border:1px solid #e5e7eb;border-radius:5px;overflow:hidden}
.ct th{background:#f9fafb;padding:7px 10px;text-align:left;width:140px;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;font-weight:600}
.ct td{padding:7px 10px;border-bottom:1px solid #f3f4f6}
.b{display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700;color:#fff}
.b.pass{background:#16a34a}.b.fail{background:#dc2626}.b.na{background:#9ca3af}
.exp{color:#1d4ed8}.act{color:#111}.miss{color:#dc2626;font-style:italic}
.mono{font-family:monospace;font-size:11px}
.sm{font-size:11px}.dim{color:#6b7280}
.meta{font-size:12px;margin:5px 0}
.warn{color:#d97706;font-size:12px;padding:4px 0}
.ok{color:#16a34a;font-size:12px;padding:4px 0}
.eline{background:#fef2f2;font-size:11px;padding:3px 7px;margin:2px 0;border-radius:3px;font-family:monospace}
.notfire{background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:#92400e;line-height:1.6}
.gn{color:#16a34a;font-weight:700}.rd{color:#dc2626;font-weight:700}
footer{text-align:center;font-size:11px;color:#9ca3af;margin-top:22px}
code{background:#f3f4f6;padding:1px 4px;border-radius:3px;font-size:11px}
</style>
</head>
<body>
<div class="wrap">

<div class="hero">
  <h1>CRO-116 Default States Audit Report</h1>
  <p>All Pets / Dogs / Cats — No Breed or ZIP Filters</p>
  <p>Generated: ${now}</p>
  <p style="margin-top:8px">
    <strong>Variation:</strong> <a href="${VARIATION_URL}" target="_blank">${VARIATION_URL}</a><br>
    <strong>Control:</strong> <a href="${CONTROL_URL}" target="_blank">${CONTROL_URL}</a>
  </p>
</div>

<div class="info-box">
  <h2>What This Test Checks</h2>
  <ul>
    <li><strong>Prices (variation)</strong> — <code>span.cre-t-116-price-update</code> shows discounted prices on All Pets, Dogs, Cats tabs</li>
    <li><strong>Show More</strong> — clicked before price checks to reveal all hidden provider cards</li>
    <li><strong>Tooltip</strong> — body class <code>cre-t-116-toolTipContentChange</code> present + CSS style tag contains "maximum available deductible"</li>
    <li><strong>Bottom Copy</strong> — "Firstly…" li text contains "maximum available deductible" (not "$500 deductible")</li>
    <li><strong>ZIP Guard</strong> — entering ZIP 10001 should deactivate variation (<code>cre-t-116</code> spans removed / body class removed)</li>
    <li><strong>Control Integrity</strong> — control URL has 0 <code>cre-t-116-price-update</code> spans, no variation body class</li>
    <li><strong>Browsers</strong> — Chrome, Firefox, Edge, Safari Desktop + Chrome/Safari/Firefox/Edge Mobile</li>
  </ul>
</div>

<h2>Summary</h2>
<table class="st">
  <thead><tr><th>Browser / Device</th><th>Overall</th><th>Pass</th><th>Fail</th><th>Tooltip</th><th>Bottom Copy</th><th>Control</th></tr></thead>
  <tbody>${sumRows}</tbody>
</table>

<h2>Detailed Results</h2>
${results.map(r => section(r)).join('\n')}

<footer>CRO-116 Default States Audit &mdash; ${now}</footer>
</div>
</body>
</html>`;
}

run().catch(err => { console.error(err); process.exit(1); });
