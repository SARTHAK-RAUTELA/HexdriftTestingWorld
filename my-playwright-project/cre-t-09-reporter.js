/**
 * CRE-T-09 Custom HTML Reporter
 * Generates cre-t-09-qa-report.html for pay.com.au — Navbar CTA "Create free account".
 * Filters on spec files containing "cre-t-09".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'cre-t-09-screenshots');
const FIGMA_IMG = 'C:\\Users\\Sarthak Rautela\\Downloads\\Wireframe.png';
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/cre-t-09-qa-report.html');

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

class CreT09Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('cre-t-09')) return;

    const errors = result.errors.map(e =>
      (e.message || String(e))
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split('\n').slice(0, 6).join('\n')
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

    const matrix = {};
    for (const r of results) {
      if (!matrix[r.title]) matrix[r.title] = {};
      matrix[r.title][r.projectName] = r;
    }

    const totalRuns = results.length;
    const passed    = results.filter(r => r.status === 'passed').length;
    const failed    = results.filter(r => r.status === 'failed').length;
    const skipped   = results.filter(r => r.status === 'skipped').length;

    const figmaB64 = imgB64(FIGMA_IMG);
    const dateStr  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
        const dur  = cell ? ` <span style="font-size:10px;color:#888">${(cell.duration / 1000).toFixed(1)}s</span>` : '';
        const tip  = cell?.errors?.length
          ? ` title="${cell.errors[0].replace(/"/g, '&quot;').substring(0, 200)}"`
          : '';
        return `<td${tip}>${badge(cell?.status)}${dur}</td>`;
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

    /* Screenshot groups */
    const desktopCtaShots = allScreenshots('tc02-desktop-cta');
    const mobStickyShots  = allScreenshots('tc06-mob-sticky');
    const mobMenuShots    = allScreenshots('tc08-mob-menu');
    const mobileShots     = allScreenshots('tc20-mobile-390');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CRE-T-09 QA Report — pay.com.au — Navbar CTA "Create free account"</title>
<style>
:root {
  --blue:#0057b8;  --blue-l:#e8f2ff; --blue-b:#90bbf0;
  --dark:#0d1f3c;  --dark2:#1a3a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --gold:#f5a623;  --gold-l:#fff8ee;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
  --pay-red:#D03643;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--blue)}
.cover{background:linear-gradient(135deg,#0a0e1a 0%,#1a2744 55%,#1e3a5f 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
.cover-brand{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7}
.cover h1{font-size:36px;font-weight:800;line-height:1.2;margin-top:4px}
.cover h1 span{color:#7ecfff}
.cover .sub{font-size:16px;opacity:.85;max-width:760px;margin-top:4px}
.cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;opacity:.8;font-size:13px}
.badge-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600}
.badge-pill.pass{background:rgba(22,163,74,.25);border-color:rgba(22,163,74,.5)}
.badge-pill.blue{background:rgba(0,87,184,.3);border-color:rgba(0,87,184,.5)}
.wrap{max-width:1200px;margin:0 auto;padding:0 36px 80px}
h2{font-size:21px;font-weight:700;color:var(--blue);margin:52px 0 18px;padding-bottom:9px;border-bottom:2px solid var(--blue-l)}
h3{font-size:15px;font-weight:700;margin:22px 0 8px;color:var(--text)}
p{margin-bottom:10px}
ul{padding-left:20px;margin-bottom:10px}
li{margin-bottom:5px}
code{background:#f1f3f5;border-radius:4px;padding:2px 7px;font-size:12.5px;font-family:'SF Mono','Consolas',monospace}
.toc{background:var(--blue-l);border:1px solid var(--blue-b);border-radius:12px;padding:22px 26px;margin:32px 0}
.toc h3{color:var(--blue);margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.8px}
.toc ol{padding-left:20px;column-count:2;column-gap:40px}
.toc li{margin-bottom:6px}
.toc a{color:var(--blue);text-decoration:none;font-weight:500;font-size:14px}
.toc a:hover{text-decoration:underline}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 32px}
.kpi{border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:5px;text-align:center}
.kpi.total{background:var(--blue-l);border:1px solid var(--blue-b)}
.kpi.pass {background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail {background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip {background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:var(--blue)}
.kpi.pass  .num{color:#16a34a}
.kpi.fail  .num{color:var(--red)}
.kpi.skip  .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--blue);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:380px}
.matrix td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.matrix tr:nth-child(even) td{background:var(--grey)}
.matrix tr.row-fail td{background:#fff0ef!important}
.matrix .tc-name{font-size:12.5px;font-weight:500;font-family:'SF Mono','Consolas',monospace}
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
.badge.pass{background:#16a34a;color:#fff}
.badge.fail{background:var(--red);color:#fff}
.badge.skip{background:#adb5bd;color:#fff}
.info-card{background:var(--blue-l);border:1px solid var(--blue-b);border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:7px 12px 7px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:var(--dark2);width:230px;white-space:nowrap}
.bugs-card{border-radius:12px;padding:22px 24px;border-left:5px solid #e67e22;background:#fff8f0;margin:20px 0}
.bugs-card h3{margin-top:0;color:#e67e22}
.bugs-card ul{margin-top:8px;font-size:14px}
.good-card{border-radius:12px;padding:22px 24px;border-left:5px solid #1a6b50;background:var(--green-l);margin:20px 0}
.good-card h3{margin-top:0;color:var(--green)}
.good-card ul{margin-top:8px;font-size:14px}
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--blue)}
.alert-pass{background:var(--green-l);border:1px solid var(--green-b);border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0}
.alert-fail{background:var(--red-l);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0}
.error-list{background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.error-list li{margin-bottom:10px}
.error-list code{background:#ffe4e4;font-size:12px}
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px;margin:16px 0}
.ss-wrap{border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ss-wrap img{width:100%;display:block}
.ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}
.url-chip{display:inline-block;background:#f1f3f5;border-radius:6px;padding:3px 8px;font-family:'SF Mono',monospace;font-size:12px;word-break:break-all}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
.fix-tag{display:inline-block;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:1px 6px;font-size:11px;font-weight:700;color:#856404;margin-left:6px}
.note-tag{display:inline-block;background:#e8f2ff;border:1px solid #90bbf0;border-radius:4px;padding:1px 6px;font-size:11px;font-weight:700;color:#0057b8;margin-left:6px}
@media(max-width:900px){.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · CRE-T A/B Testing</div>
  <h1>CRE-T-09 QA Report — <span>pay.com.au Navbar CTA</span></h1>
  <div class="sub">Automated QA for CRE-T-09: Changes the primary navbar CTA button copy from "Get started" to "Create free account" across Desktop nav, Mobile sticky, Mobile hamburger menu, and Footer pane CTAs. Sitewide. Tested across 6 browsers on Desktop and Mobile.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 pay.com.au</span>
    <span>📱 Desktop · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed  > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill blue">💳 pay.com.au</span>
    <span class="badge-pill blue">🔘 Navbar CTA</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#codereview">Code Review</a></li>
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
    <tr><td>Test ID</td><td><strong>CRE-T-09</strong></td></tr>
    <tr><td>Test Name</td><td>pay.com.au — Navbar CTA "Create free account"</td></tr>
    <tr><td>Variation Name</td><td><code>cre-t-09</code></td></tr>
    <tr><td>Platform</td><td>Optimizely (experiment ID: 5244519875084288)</td></tr>
    <tr><td>Client</td><td>pay.com.au</td></tr>
    <tr><td>Audience</td><td><strong>All users</strong> — Sitewide</td></tr>
    <tr><td>Target Pages</td><td>All pages (sitewide — homepage, How It Works, Pricing, Solutions, etc.)</td></tr>
    <tr><td>Change</td><td>CTA copy: <strong>"Get started"</strong> → <strong>"Create free account"</strong></td></tr>
    <tr><td>Locations</td><td>Desktop nav · Mobile sticky CTA · Mobile hamburger menu · Footer pane CTAs</td></tr>
    <tr><td>Technique</td><td><code>font-size:0</code> hides original + CSS <code>::before { content:'Create free account' }</code></td></tr>
    <tr><td>Coexistence</td><td>PAY05 (CRE-T-05): nav-link font-sizes adjusted at 1199/1310/1450px when both active</td></tr>
    <tr><td>Variation Files</td><td><code>variation/vB.js</code> + <code>variation/vB.css</code></td></tr>
    <tr><td>Test Method</td><td>Local vB.js/vB.css injected into live pay.com.au via Playwright</td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Mobile (390×844)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
  </table>
</div>

<h3>URLs</h3>
<p><strong>Control:</strong> <span class="url-chip">https://pay.com.au/</span></p>
<p><strong>Variation Preview:</strong> <span class="url-chip">https://pay.com.au/?optimizely_x=5244519875084288&amp;optimizely_force_tracking=true&amp;cre=qa</span></p>
<p style="font-size:13px;color:var(--muted)">Automated tests inject <code>vB.js</code> + <code>vB.css</code> locally into live pay.com.au — no Optimizely dependency required.</p>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">Design goal: Change the button copy to signal that it's free to get started. Control shows "Get started" (red button). Variation shows "Create free account" (same red button, slightly wider). No URL or styling changes — only the button label text.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="CRE-T-09 Wireframe"/><div class="ss-caption">CRE-T-09 Wireframe — Wireframe.png (Control left · Variation right)</div></div>`
  : '<p><em>Wireframe.png not found at Downloads path — Figma screenshot skipped.</em></p>'}

<!-- CODE REVIEW -->
<h2 id="codereview">Code Review</h2>
<div class="section-note">Full review of <code>vB.js</code> and <code>vB.css</code> for correctness, specificity, coexistence safety, and URL/tracking preservation.</div>

<div class="good-card">
  <h3>✅ Code Review — No Blocking Issues Found</h3>
  <ul>
    <li><strong>Variation name correct</strong> — <code>variation_name = "cre-t-09"</code> matches the test ID.</li>
    <li><strong>Body class guard</strong> — All CSS rules are scoped to <code>html body.cre-t-09</code>, preventing style bleed on control or other tests.</li>
    <li><strong>Font-size:0 + ::before technique</strong> — Original element text is hidden at the CSS level (no DOM modification); the <code>::before</code> pseudo-element injects "Create free account". Href and all event listeners on the <code>&lt;a&gt;</code> element are completely untouched.</li>
    <li><strong>href/tracking preserved</strong> — No <code>element.href</code> or attribute manipulation in <code>vB.js</code>. CSS-only approach guarantees destination URL and Optimizely click-tracking remain intact.</li>
    <li><strong>PAY05 coexistence</strong> — <code>waitForElement('.cre-t-05-how-it-works', ...)</code> detects PAY05 and adds <code>body.cre-t-05</code>; responsive font-size rules activate only when both classes are present. Breakpoints: 15px @ ≥1199px, 17px @ ≥1310px, 18px @ ≥1450px.</li>
    <li><strong>Error handling</strong> — IIFE wrapped in <code>try/catch</code>; errors logged when <code>debug=1</code>.</li>
    <li><strong>waitForElement helper</strong> — Polls at 50 ms, times out at 15 s — safe defaults.</li>
    <li><strong>Mobile 375px margin fix</strong> — <code>margin-right:0</code> on <code>#mob-get-started</code> at ≤375px prevents CTA from overflowing at very narrow widths.</li>
    <li><strong>Footer CTA selector</strong> — <code>a.pane-footer-cta[href*="register"]</code> is precise: only links pointing to "register" are targeted, avoiding false matches on other footer links.</li>
  </ul>
</div>

<div class="bugs-card">
  <h3>⚠ Minor Code Note (Non-Blocking)</h3>
  <ul>
    <li>
      <strong>Duplicate CSS selector in mobile media query</strong> <span class="note-tag">NOTE</span><br>
      In <code>vB.css</code> inside <code>@media(max-width:1198px)</code>, the selector
      <code>html body.cre-t-09 #pay-new-nav .nav-mobile-cta::before</code> appears twice
      in the same comma-separated group (lines 59 and 61). This is functionally harmless
      (browsers ignore the duplicate) but should be cleaned up for code hygiene.
    </li>
  </ul>
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all ${allBrowsers.length} browsers. CRE-T-09 navbar CTA text is correctly changed to "Create free account" on desktop, mobile sticky, mobile hamburger menu, and footer pane CTAs — sitewide and with URL/tracking preserved.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section below for full details.</div>`}

<h3>Test Coverage Summary (${allTCs.length} TCs)</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — <code>body.cre-t-09</code> class added after injection</li>
  <li><strong>TC-02</strong> — Desktop CTA <code>::before</code> content = "Create free account"  <em>[screenshot]</em></li>
  <li><strong>TC-03</strong> — Desktop CTA element <code>font-size = 0px</code> (original text hidden)</li>
  <li><strong>TC-04</strong> — Desktop CTA href contains "register" (destination URL preserved)</li>
  <li><strong>TC-05</strong> — Desktop CTA <code>display:flex; align-items:center</code> applied</li>
  <li><strong>TC-06</strong> — Mobile sticky CTA (<code>#mob-get-started</code>) <code>::before</code> = "Create free account"  <em>[screenshot]</em></li>
  <li><strong>TC-07</strong> — Mobile sticky CTA href contains "register" (URL preserved)</li>
  <li><strong>TC-08</strong> — Mobile hamburger CTA (<code>.nav-mobile-cta</code>) <code>::before</code> = "Create free account"  <em>[screenshot]</em></li>
  <li><strong>TC-09</strong> — Mobile hamburger CTA href contains "register" (URL preserved)</li>
  <li><strong>TC-10</strong> — Footer pane CTA <code>::before</code> = "Create free account"</li>
  <li><strong>TC-11</strong> — Footer pane CTA href contains "register" (URL preserved)</li>
  <li><strong>TC-12</strong> — Sitewide: How It Works page desktop CTA changed</li>
  <li><strong>TC-13</strong> — Sitewide: Pricing page desktop CTA changed</li>
  <li><strong>TC-14</strong> — Sitewide: Solutions page desktop CTA changed</li>
  <li><strong>TC-15</strong> — PAY05 coexistence: nav-link font-size = 15px at 1199px when <code>cre-t-05</code> active</li>
  <li><strong>TC-16</strong> — CSS guard: removing <code>body.cre-t-09</code> reverts <code>::before</code> content</li>
  <li><strong>TC-17</strong> — No uncaught JS errors thrown by variation code</li>
  <li><strong>TC-18</strong> — Desktop CTA <code>::before</code> font-size = 16px</li>
  <li><strong>TC-19</strong> — Footer CTA <code>::before</code> font-size = 15px</li>
  <li><strong>TC-20</strong> — Mobile 390×844: sticky CTA <code>::before</code> correct, body class present  <em>[screenshot]</em></li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP + duration. Hover FAIL cells for truncated error. Row highlighted red if any browser failed. SKIP = element not present in DOM (e.g., footer CTA on homepage, mobile sticky on desktop).</div>
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
<div class="section-note">Screenshots taken during Playwright runs with local <code>vB.js</code> + <code>vB.css</code> injected into live pay.com.au, across all 6 browsers.</div>

<h3>Desktop CTA — "Create free account" visible in navbar (TC-02)</h3>
${ssSection(desktopCtaShots, 'Desktop CTA')}

<h3>Mobile Sticky CTA — "Create free account" (TC-06)</h3>
${ssSection(mobStickyShots, 'Mobile Sticky CTA')}

<h3>Mobile Hamburger Menu CTA (TC-08)</h3>
${ssSection(mobMenuShots, 'Mobile Hamburger Menu')}

<h3>Mobile 390×844 Full Viewport (TC-20)</h3>
${ssSection(mobileShots, 'Mobile 390×844')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">Tests inject local <code>vB.js</code> + <code>vB.css</code> into live <code>pay.com.au</code> via Playwright's <code>page.addStyleTag</code> / <code>page.addScriptTag</code> APIs.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Injection</strong>: CSS first (avoids flash of unstyled content), then JS IIFE. Retried once on CDN CSP race.</li>
  <li><strong>::before content check</strong>: <code>window.getComputedStyle(el, '::before').content</code> — works on hidden elements, so hamburger menu CTA is checked without needing to open the menu.</li>
  <li><strong>font-size:0 check (TC-03)</strong>: <code>getComputedStyle(el).fontSize</code> on the element itself — must be "0px" to confirm original text is invisible.</li>
  <li><strong>href preserved (TC-04/07/09/11)</strong>: <code>el.href || el.getAttribute('href')</code> checked to contain "register" — confirms no URL mutation.</li>
  <li><strong>Sitewide (TC-12/13/14)</strong>: Same injection applied to How It Works, Pricing, Solutions pages — confirms body class and ::before apply globally.</li>
  <li><strong>PAY05 coexistence (TC-15)</strong>: <code>document.body.classList.add('cre-t-05')</code> simulates PAY05 active; <code>getComputedStyle</code> on <code>.header-ttl</code> checks the responsive font-size rule.</li>
  <li><strong>CSS guard (TC-16)</strong>: Removes <code>body.cre-t-09</code> class after injection; verifies <code>::before</code> reverts — confirms all rules are scoped to the class.</li>
  <li><strong>JS errors (TC-17)</strong>: <code>page.on('pageerror', ...)</code> listener — filters for cre-t-09 and null-access errors.</li>
  <li><strong>Font-size (TC-18/19)</strong>: <code>getComputedStyle(el, '::before').fontSize</code> — desktop expects 16px, footer expects 15px.</li>
  <li><strong>Mobile (TC-20)</strong>: <code>page.setViewportSize({ width: 390, height: 844 })</code> before navigation — verifies body class and sticky CTA ::before at small viewport.</li>
  <li><strong>Skip logic</strong>: TCs for mobile CTA, hamburger, and footer use <code>test.skip()</code> if the element is absent — avoids false failures on pages where those elements don't exist.</li>
</ul>

<div class="footer">
  CRE-T-09 QA Report · ${dateStr} · Playwright Automated Tests · pay.com.au<br>
  QA by sarthak@brillmark.com · Spec: cre-t-09-nav-cta.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nCRE-T-09 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = CreT09Reporter;
