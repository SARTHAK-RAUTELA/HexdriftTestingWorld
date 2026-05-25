/**
 * SWF128 Custom HTML Reporter
 * Generates swf128-qa-report.html for Pet Insurance Gurus — Filter Icon test.
 * Filters on spec files containing "swf128".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'swf128-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/SWF128.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/swf128-qa-report.html');

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function allScreenshots(prefix) {
  if (!fs.existsSync(SS_DIR)) return [];
  return fs.readdirSync(SS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    .map(f => ({
      label: f.replace(prefix + '-', '').replace('.png', ''),
      src:   imgB64(path.join(SS_DIR, f)),
    }))
    .filter(s => s.src);
}

class Swf128Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('swf128')) return;

    const errors = result.errors.map(e =>
      (e.message || String(e))
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split('\n').slice(0, 5).join('\n')
    );

    this._results.push({
      title:       test.title,
      projectName: test.parent?.project()?.name ?? 'Unknown',
      status:      result.status,
      duration:    result.duration,
      errors,
    });
  }

  onEnd() {
    if (!this._results.length) return;
    this._generate();
  }

  _generate() {
    const results     = this._results;
    const allBrowsers = [...new Set(results.map(r => r.projectName))];
    const allTCs      = [...new Set(results.map(r => r.title))];

    // matrix: { tc -> { browser -> { status, errors } } }
    const matrix = {};
    for (const r of results) {
      if (!matrix[r.title]) matrix[r.title] = {};
      matrix[r.title][r.projectName] = r;
    }

    const totalRuns = results.length;
    const passed    = results.filter(r => r.status === 'passed').length;
    const failed    = results.filter(r => r.status === 'failed').length;
    const skipped   = results.filter(r => r.status === 'skipped').length;

    const figmaB64  = imgB64(FIGMA_IMG);
    const dateStr   = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    function badge(status) {
      if (!status) return '<span class="badge skip">—</span>';
      if (status === 'passed')  return '<span class="badge pass">PASS</span>';
      if (status === 'failed')  return '<span class="badge fail">FAIL</span>';
      if (status === 'skipped') return '<span class="badge skip">SKIP</span>';
      return `<span class="badge skip">${status}</span>`;
    }

    function ssSection(shots, caption) {
      if (!shots.length) return '<p><em>No screenshots captured for this category.</em></p>';
      return `<div class="ss-grid">${shots.map(s => `
        <div class="ss-wrap">
          <img src="${s.src}" alt="${caption} — ${s.label}"/>
          <div class="ss-caption">${caption} · ${s.label}</div>
        </div>`).join('')}</div>`;
    }

    const browserHeaders = allBrowsers
      .map(b => `<th>${b.replace(' Desktop', '').replace('Mobile ', '📱 ')}</th>`)
      .join('');

    const matrixRows = allTCs.map(tc => {
      const hasAnyFail = allBrowsers.some(b => matrix[tc]?.[b]?.status === 'failed');
      const cols = allBrowsers.map(b => {
        const cell = matrix[tc]?.[b];
        const tip  = cell?.errors?.length
          ? ` title="${cell.errors[0].replace(/"/g, '&quot;').substring(0, 200)}"`
          : '';
        return `<td${tip}>${badge(cell?.status)}</td>`;
      }).join('');
      return `<tr class="${hasAnyFail ? 'row-fail' : ''}">
        <td class="tc-name">${tc}</td>${cols}</tr>`;
    }).join('\n');

    const failedList = results
      .filter(r => r.status === 'failed')
      .map(r => `<li>
        <strong>${r.title}</strong> [${r.projectName}]
        ${r.errors.length ? `<br><code>${r.errors[0]}</code>` : ''}
      </li>`)
      .join('');

    // Screenshot groups
    const controlShots     = allScreenshots('control');
    const varHomeShots     = allScreenshots('var-home');
    const varCompShots     = allScreenshots('var-comparison');
    const desktopShots     = allScreenshots('responsive-desktop');
    const tabletShots      = allScreenshots('responsive-tablet');
    const mobileShots      = allScreenshots('responsive-mobile');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SWF128 QA Report — Pet Insurance Gurus — Customize Results Filter Icon</title>
<style>
:root {
  --teal:#007baa;  --teal-l:#e6f4fa; --teal-b:#9bcfe5;
  --dark:#0d2b3e;  --dark2:#1a4a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --gold:#f5a623;  --gold-l:#fff8ee;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--teal)}

/* COVER */
.cover{background:linear-gradient(135deg,var(--dark) 0%,var(--dark2) 55%,#0d4a5e 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
.cover-brand{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7}
.cover h1{font-size:36px;font-weight:800;line-height:1.2;margin-top:4px}
.cover h1 span{color:#7ee8fa}
.cover .sub{font-size:16px;opacity:.85;max-width:760px;margin-top:4px}
.cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;opacity:.8;font-size:13px}
.badge-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600}
.badge-pill.pass{background:rgba(22,163,74,.25);border-color:rgba(22,163,74,.5)}
.badge-pill.teal{background:rgba(0,123,170,.3);border-color:rgba(0,123,170,.5)}

/* LAYOUT */
.wrap{max-width:1160px;margin:0 auto;padding:0 36px 80px}
h2{font-size:21px;font-weight:700;color:var(--teal);margin:52px 0 18px;padding-bottom:9px;border-bottom:2px solid var(--teal-l)}
h3{font-size:15px;font-weight:700;margin:22px 0 8px;color:var(--text)}
p{margin-bottom:10px}
ul{padding-left:20px;margin-bottom:10px}
li{margin-bottom:5px}
code{background:#f1f3f5;border-radius:4px;padding:2px 7px;font-size:12.5px;font-family:'SF Mono','Consolas',monospace}

/* TOC */
.toc{background:var(--teal-l);border:1px solid var(--teal-b);border-radius:12px;padding:22px 26px;margin:32px 0}
.toc h3{color:var(--teal);margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.8px}
.toc ol{padding-left:20px;column-count:2;column-gap:40px}
.toc li{margin-bottom:6px}
.toc a{color:var(--teal);text-decoration:none;font-weight:500;font-size:14px}
.toc a:hover{text-decoration:underline}

/* KPI CARDS */
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 32px}
.kpi{border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:5px;text-align:center}
.kpi.total{background:var(--teal-l);border:1px solid var(--teal-b)}
.kpi.pass {background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail {background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip {background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:var(--teal)}
.kpi.pass  .num{color:#16a34a}
.kpi.fail  .num{color:var(--red)}
.kpi.skip  .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}

/* MATRIX TABLE */
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--teal);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:320px}
.matrix td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.matrix tr:nth-child(even) td{background:var(--grey)}
.matrix tr.row-fail td{background:#fff0ef!important}
.matrix .tc-name{font-size:13px;font-weight:500;font-family:'SF Mono','Consolas',monospace}

/* BADGES */
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
.badge.pass{background:#16a34a;color:#fff}
.badge.fail{background:var(--red);color:#fff}
.badge.skip{background:#adb5bd;color:#fff}

/* INFO CARD */
.info-card{background:var(--teal-l);border:1px solid var(--teal-b);border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:7px 12px 7px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:var(--dark2);width:210px;white-space:nowrap}

/* DIFF GRID */
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.control{background:#f0f8ff;border-color:#005DAA}
.diff-card.variation{background:var(--teal-l);border-color:var(--teal)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}

/* SECTION NOTE */
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--teal)}

/* ALERTS */
.alert-pass{background:var(--green-l);border:1px solid var(--green-b);border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0}
.alert-fail{background:var(--red-l);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0}

/* ERROR LIST */
.error-list{background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.error-list li{margin-bottom:10px}
.error-list code{background:#ffe4e4;font-size:12px}

/* SCREENSHOTS */
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px;margin:16px 0}
.ss-wrap{border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ss-wrap img{width:100%;display:block}
.ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}

/* URL TABLE */
.url-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.url-table th{background:var(--teal);color:#fff;padding:8px 14px;text-align:left}
.url-table td{padding:8px 14px;border-bottom:1px solid var(--border)}
.url-table tr:nth-child(even) td{background:var(--grey)}

/* FOOTER */
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}

@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · SWF A/B Testing</div>
  <h1>SWF128 QA Report — <span>Customize Results Filter Icon</span></h1>
  <div class="sub">Automated QA for the SWF128 variation on Pet Insurance Gurus — filter icon + "Customize results for your pet" copy injected above comparison filters</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 petinsurancegurus.com — 3 Target URLs</span>
    <span>📱 Desktop · Tablet · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill teal">🐾 Pet Insurance Gurus</span>
    <span class="badge-pill teal">🔍 Filter Icon + Copy</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#diff">Control vs Variation</a></li>
    <li><a href="#results">Test Results Summary</a></li>
    <li><a href="#matrix">Full TC × Browser Matrix</a></li>
    ${failed > 0 ? '<li><a href="#errors">Failed Test Details</a></li>' : ''}
    <li><a href="#screenshots">Visual Screenshots</a></li>
    <li><a href="#methodology">Testing Methodology</a></li>
  </ol>
</div>

<!-- OVERVIEW -->
<h2 id="overview">Test Overview &amp; URLs</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>SWF128</strong></td></tr>
    <tr><td>Test Name</td><td>Customize Results for Your Pet — Filter Icon + Copy</td></tr>
    <tr><td>Test Type</td><td>Convert.com A/B Test — UI Enhancement on Comparison Section</td></tr>
    <tr><td>Client</td><td>Pet Insurance Gurus</td></tr>
    <tr><td>Audience</td><td><strong>All users</strong></td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Tablet (768×1024) · Mobile (375×812)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop · Mobile Chrome · Mobile Safari</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
    <tr><td>Conversion Goal ID</td><td><code>100037760</code></td></tr>
    <tr><td>Deduplication Guard</td><td><code>.cre-t-128-icon-text-wrapper</code> DOM check + <code>window.creT128GoalFired</code> flag</td></tr>
  </table>
</div>

<h3>Target URLs</h3>
<table class="url-table">
  <thead><tr><th>Type</th><th>URL</th><th>Variation ID</th></tr></thead>
  <tbody>
    <tr><td><strong>Control</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052131.1000255629</code></td><td>1000255629</td></tr>
    <tr><td><strong>Variation — /</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052131.1000255630</code></td><td>1000255630</td></tr>
    <tr><td><strong>Variation — /home/</strong></td><td><code>https://petinsurancegurus.com/home/?cro_mode=qa&amp;_conv_eforce=100052131.1000255630</code></td><td>1000255630</td></tr>
    <tr><td><strong>Variation — /comparison/</strong></td><td><code>https://petinsurancegurus.com/comparison/?cro_mode=qa&amp;_conv_eforce=100052131.1000255630</code></td><td>1000255630</td></tr>
  </tbody>
</table>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">SWF128 adds a filter icon + "Customize results for your pet" label above the pet filter tabs (All Pets / Cats / Dogs), and reduces the margin between the filters and the insurance plan results below.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="SWF128 Figma Reference"/><div class="ss-caption">SWF128 Figma Design — Left: Control | Right: Variation (icon + copy added, margin reduced)</div></div>`
  : '<p><em>SWF128.png not found in local_testing/Local2/ — Figma screenshot skipped.</em></p>'}

<!-- DIFF -->
<h2 id="diff">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control</h3>
    <ul>
      <li>No icon or copy above filter tabs</li>
      <li>Default margin between filters and results</li>
      <li>No <code>.cre-t-128-icon-text-wrapper</code> in DOM</li>
      <li>No conversion goal listener attached</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation (SWF128)</h3>
    <ul>
      <li>✅ <strong>Filter SVG icon</strong> from <code>v2.crocdn.com/SwiftTest/test128/filter.svg</code></li>
      <li>✅ <strong>"Customize results for your pet"</strong> text label</li>
      <li>✅ Inserted <strong>before</strong> <code>#comparison-section .filter-options</code></li>
      <li>✅ <code>.filter-options</code> <strong>margin-top: 0px</strong> (reduced)</li>
      <li>✅ <code>#comparison-section>.ct-section-inner-wrap</code> <strong>align-items: flex-start</strong></li>
      <li>✅ Conversion goal <code>100037760</code> on filter tab / breed / ZIP clicks</li>
      <li>✅ Deduplication: DOM check + <code>window.creT128GoalFired</code> flag</li>
    </ul>
  </div>
</div>

<!-- RESULTS SUMMARY -->
<h2 id="results">Test Results Summary</h2>
<div class="kpi-row">
  <div class="kpi total"><span class="num">${totalRuns}</span><span class="lbl">Total Runs</span></div>
  <div class="kpi pass"><span class="num">${passed}</span><span class="lbl">Passed</span></div>
  <div class="kpi fail"><span class="num">${failed}</span><span class="lbl">Failed</span></div>
  <div class="kpi skip"><span class="num">${skipped}</span><span class="lbl">Skipped</span></div>
</div>

${failed === 0
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers. The SWF128 variation is functioning correctly — icon injection, text content, no duplication, CSS margins, goal tracking, and responsive behaviour all verified.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix below and the Failed Tests section for details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — Control URL: no icon-text-wrapper injected</li>
  <li><strong>TC-02–04</strong> — Variation on all 3 target URLs: wrapper present</li>
  <li><strong>TC-05</strong> — Exact text "Customize results for your pet"</li>
  <li><strong>TC-06</strong> — Filter SVG icon: CDN src + alt text</li>
  <li><strong>TC-07</strong> — No duplication on second JS execution (console paste simulation)</li>
  <li><strong>TC-08</strong> — CSS: <code>.filter-options</code> margin-top = 0px</li>
  <li><strong>TC-09</strong> — Goal tracking: filter tab click pushes <code>triggerConversion</code></li>
  <li><strong>TC-10</strong> — Goal tracking: ZIP code click pushes <code>triggerConversion</code></li>
  <li><strong>TC-11–13</strong> — Responsive: Desktop (1280×800) · Tablet (768×1024) · Mobile (375×812)</li>
  <li><strong>TC-14</strong> — CSS: <code>#comparison-section>.ct-section-inner-wrap</code> align-items flex-start</li>
  <li><strong>TC-15</strong> — Sitewide: all 3 variation URLs render icon text exactly once</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP for that TC × browser combination. Hover over FAIL cells for truncated error details.</div>
<div style="overflow-x:auto">
<table class="matrix">
  <thead>
    <tr>
      <th>Test Case</th>
      ${browserHeaders}
    </tr>
  </thead>
  <tbody>
    ${matrixRows}
  </tbody>
</table>
</div>

${failed > 0 ? `
<!-- ERRORS -->
<h2 id="errors">Failed Test Details</h2>
<div class="error-list">
  <ul>${failedList}</ul>
</div>
` : ''}

<!-- SCREENSHOTS -->
<h2 id="screenshots">Visual Screenshots</h2>
<div class="section-note">Screenshots captured during the Playwright run against live preview URLs. They show the variation rendered across browsers and viewports.</div>

<h3>Control — No Icon Text (TC-01)</h3>
${ssSection(controlShots, 'Control')}

<h3>Variation Homepage (/) — Icon Text Injected (TC-02)</h3>
${ssSection(varHomeShots, 'Variation Homepage')}

<h3>Variation /comparison/ — Icon Text Injected (TC-04)</h3>
${ssSection(varCompShots, 'Variation Comparison')}

<h3>Responsive — Desktop 1280×800 (TC-11)</h3>
${ssSection(desktopShots, 'Desktop 1280×800')}

<h3>Responsive — Tablet 768×1024 (TC-12)</h3>
${ssSection(tabletShots, 'Tablet 768×1024')}

<h3>Responsive — Mobile 375×812 (TC-13)</h3>
${ssSection(mobileShots, 'Mobile 375×812')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigated to live Convert.com preview URLs — no mocking. The variation JS and CSS are served by the Convert.com platform when the <code>_conv_eforce</code> parameter is present. Tests rely on the platform-injected variation and do not manually inject code, except for the duplication test (TC-07) which explicitly re-runs <code>vB.js</code> to simulate a console paste.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Control check (TC-01)</strong>: Navigated to the control preview URL and waited 6 seconds before asserting the element is absent.</li>
  <li><strong>Variation element (TC-02–04, TC-15)</strong>: Used <code>page.waitForSelector('.cre-t-128-icon-text-wrapper')</code> with a 20s timeout to confirm platform injection.</li>
  <li><strong>Content (TC-05–06)</strong>: Asserted exact text and SVG <code>src</code> attribute against Figma spec.</li>
  <li><strong>Duplication (TC-07)</strong>: Re-ran <code>vB.js</code> via <code>page.evaluate()</code> on top of the live variation, then counted wrappers — must be exactly 1.</li>
  <li><strong>CSS (TC-08, TC-14)</strong>: Used <code>window.getComputedStyle()</code> to read computed property values.</li>
  <li><strong>Goal tracking (TC-09–10)</strong>: Reset <code>window._conv_q = []</code> then dispatched <code>mousedown</code> events, checked array for <code>triggerConversion</code> entries.</li>
  <li><strong>Responsive (TC-11–13)</strong>: Used <code>page.setViewportSize()</code> before navigation.</li>
</ul>

<div class="footer">
  SWF128 QA Report · ${dateStr} · Playwright Automated Tests · petinsurancegurus.com<br>
  QA by sarthak@brillmark.com · Spec: swf128-filter-icon.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nSWF128 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = Swf128Reporter;
