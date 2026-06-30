/**
 * CRE-T-08 Custom HTML Reporter
 * Generates cre-t-08-qa-report.html for pay.com.au — Timed Pop-up Modal.
 * Filters on spec files containing "cre-t-08".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'cre-t-08-screenshots');
const FIGMA_IMG = 'C:\\Users\\Sarthak Rautela\\Downloads\\Group 1000004621.png';
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/cre-t-08-qa-report.html');

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

class CreT08Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('cre-t-08')) return;

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
    const modalActiveShots  = allScreenshots('tc02-modal-active');
    const closeXShots       = allScreenshots('tc07-close-x');
    const overlayCloseShots = allScreenshots('tc08-overlay-close');
    const ctaButtonShots    = allScreenshots('tc17-cta-button');
    const ctaClickShots     = allScreenshots('tc19-cta-click');
    const mobileShots       = allScreenshots('tc20-mobile-390');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CRE-T-08 QA Report — pay.com.au — Timed Pop-up Modal</title>
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
@media(max-width:900px){.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · CRE-T A/B Testing</div>
  <h1>CRE-T-08 QA Report — <span>pay.com.au Timed Pop-up Modal</span></h1>
  <div class="sub">Automated QA for CRE-T-08: "Not sure if Pay.com.au is right for your business?" modal. Fires 3 s after page load (30 s in production). Blurred overlay, X close icon, three feature cards, and "Create your free account" CTA. Tested across 6 browsers on Desktop and Mobile.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 pay.com.au</span>
    <span>📱 Desktop · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill blue">💳 pay.com.au</span>
    <span class="badge-pill blue">⏱ Timed Modal</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#bugs">Bugs Found &amp; Fixed</a></li>
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
    <tr><td>Test ID</td><td><strong>CRE-T-08</strong></td></tr>
    <tr><td>Test Name</td><td>pay.com.au — "Not sure if Pay.com.au is right for your business?" Timed Modal</td></tr>
    <tr><td>Variation Name</td><td><code>cre-t-08</code></td></tr>
    <tr><td>Platform</td><td>Optimizely (experiment ID: 5560508867149824)</td></tr>
    <tr><td>Client</td><td>pay.com.au</td></tr>
    <tr><td>Audience</td><td><strong>All users</strong> — Desktop &amp; Mobile</td></tr>
    <tr><td>Target Page</td><td>pay.com.au homepage</td></tr>
    <tr><td>Modal Trigger</td><td>3 s after body available (QA build) · 30 s in production</td></tr>
    <tr><td>Session Guard</td><td>Cookie <code>cre-t-08=modal-triggered</code> — modal fires once per session</td></tr>
    <tr><td>Variation Files</td><td><code>variation/vB.js</code> + <code>variation/vB.css</code></td></tr>
    <tr><td>Test Method</td><td>Local vB.js/vB.css injected into live pay.com.au (3 s QA build)</td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Mobile (390×844)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
  </table>
</div>

<h3>Preview URL (live — 30 s prod delay)</h3>
<p><span class="url-chip">https://pay.com.au/?optimizely_x=5560508867149824&amp;optimizely_force_tracking=true&amp;cre=qa</span></p>
<p style="font-size:13px;color:var(--muted)">Note: automated tests inject the local 3 s QA build directly to avoid the 30 s production delay. The live URL above can be used for manual browser verification.</p>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">The design specifies: blurred + darker background overlay, X close button inside the modal, three feature cards (laptop / card / rocket icons), and a red "Create your free account" CTA button. Font family: Pay, Europa, sans-serif.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="CRE-T-08 Figma Reference"/><div class="ss-caption">CRE-T-08 Figma Design — Group 1000004621.png</div></div>`
  : '<p><em>Group 1000004621.png not found at Downloads path — Figma screenshot skipped.</em></p>'}

<!-- BUGS FOUND & FIXED -->
<h2 id="bugs">Bugs Found &amp; Fixed During QA</h2>
<div class="bugs-card">
  <h3>⚠ Issues Found in vB.js / vB.css — All Fixed</h3>
  <ul>
    <li>
      <strong>Bug 1 — Timer: 30 s → 3 s</strong> <span class="fix-tag">FIXED</span><br>
      <code>MODAL_DELAY_SECONDS</code> was 30 in <code>vB.js</code>. Changed to 3 for QA testing speed. Restore to 30 before going live.
    </li>
    <li>
      <strong>Bug 2 — HTML syntax: duplicate quote in subtitle div</strong> <span class="fix-tag">FIXED</span><br>
      Line 99 of <code>vB.js</code> had <code>class="cre-t-08-sub-title""</code> (extra closing quote). Fixed to <code>class="cre-t-08-sub-title"</code>.
    </li>
    <li>
      <strong>Bug 3 — X close icon outside modal on wide screens</strong> <span class="fix-tag">FIXED</span><br>
      <code>.cre-t-08-modal-cross-icon-wrapper</code> was <code>position: fixed; top: 20px; right: 20px</code> — on viewports wider than ~994 px the X floated 80–400 px to the right of the modal box. Changed to <code>position: absolute</code> so it anchors inside the <code>position: fixed</code> container. Matches Figma design.
    </li>
    <li>
      <strong>Bug 4 — CTA click crashes if mobile nav element absent</strong> <span class="fix-tag">FIXED</span><br>
      <code>document.querySelector(".sticky-get-started a#mob-get-started").click()</code> would throw <code>TypeError: Cannot read properties of null</code> on desktop (element doesn't exist), preventing <code>hideModal()</code> from running. Added null check with fallback selectors.
    </li>
    <li>
      <strong>Bug 5 — CSS specificity gap on subtitle</strong> <span class="fix-tag">FIXED</span><br>
      <code>.cre-t-08-sub-title</code> was missing the <code>html body.cre-t-08</code> prefix used on every other rule, so its styles could bleed outside the variation scope. Added prefix for consistency.
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all ${allBrowsers.length} browsers. CRE-T-08 modal is functioning correctly — timing, open/close, session guard, content, colour, and responsive layout all verified.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section below for full details.</div>`}

<h3>Test Coverage Summary (${allTCs.length} TCs)</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — <code>body.cre-t-08</code> class added after injection</li>
  <li><strong>TC-02</strong> — Modal fires after ~3 s — <code>.active</code> on modal-main  <em>[screenshot]</em></li>
  <li><strong>TC-03</strong> — Overlay covers full viewport (position:fixed, 100% w/h)</li>
  <li><strong>TC-04</strong> — Overlay has <code>backdrop-filter: blur</code> (blurry background design)</li>
  <li><strong>TC-05</strong> — Modal container is position:fixed and centred (50%/50% translate)</li>
  <li><strong>TC-06</strong> — X close icon is inside modal container bounds (position:absolute fix)</li>
  <li><strong>TC-07</strong> — Clicking X close icon dismisses modal — <code>.active</code> removed  <em>[screenshot]</em></li>
  <li><strong>TC-08</strong> — Clicking overlay (outside modal) dismisses modal  <em>[screenshot]</em></li>
  <li><strong>TC-09</strong> — Cookie <code>cre-t-08=modal-triggered</code> set after modal fires</li>
  <li><strong>TC-10</strong> — Modal suppressed when session cookie is pre-set (once-per-session guard)</li>
  <li><strong>TC-11</strong> — <code>body.cre-t-08-freeze</code> (overflow:hidden) applied while modal is open</li>
  <li><strong>TC-12</strong> — <code>cre-t-08-freeze</code> removed from body after modal dismissed</li>
  <li><strong>TC-13</strong> — Title: "Not sure if Pay.com.au is right for your business?"</li>
  <li><strong>TC-14</strong> — Subtitle contains "single payment" and "Pay.com.au" copy</li>
  <li><strong>TC-15</strong> — Three feature card titles: Free Account / Existing Cards / Single Payment</li>
  <li><strong>TC-16</strong> — Three feature icons (SVG) load successfully (not broken)</li>
  <li><strong>TC-17</strong> — CTA "Create your free account" visible  <em>[screenshot]</em></li>
  <li><strong>TC-18</strong> — CTA background colour: <code>#D03643</code> (rgb(208, 54, 67))</li>
  <li><strong>TC-19</strong> — CTA click closes modal, no uncaught JS errors  <em>[screenshot]</em></li>
  <li><strong>TC-20</strong> — Mobile 390×844 — modal visible, cards stacked vertically  <em>[screenshot]</em></li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP + duration. Hover FAIL cells for truncated error. Row highlighted in red if any browser failed.</div>
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
<div class="section-note">Screenshots captured during the Playwright run with local vB.js/vB.css injected into live pay.com.au, across all 6 browsers.</div>

<h3>Modal Active — After 3 s Delay (TC-02)</h3>
${ssSection(modalActiveShots, 'Modal Active')}

<h3>After X Close Click (TC-07)</h3>
${ssSection(closeXShots, 'Close X')}

<h3>After Overlay Click (TC-08)</h3>
${ssSection(overlayCloseShots, 'Overlay Close')}

<h3>CTA Button Visible (TC-17)</h3>
${ssSection(ctaButtonShots, 'CTA Button')}

<h3>After CTA Click — Modal Dismissed (TC-19)</h3>
${ssSection(ctaClickShots, 'CTA Click')}

<h3>Mobile 390×844 (TC-20)</h3>
${ssSection(mobileShots, 'Mobile 390×844')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">Tests inject local <code>vB.js</code> + <code>vB.css</code> into live <code>pay.com.au</code> via Playwright's <code>page.addStyleTag</code> / <code>page.addScriptTag</code>. The local build uses <code>MODAL_DELAY_SECONDS = 3</code> (vs 30 in prod).</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Injection</strong>: CSS injected first (no flash), then JS IIFE runs immediately and schedules the 3 s timer.</li>
  <li><strong>Modal wait</strong>: <code>page.waitForSelector('.cre-t-08-modal-main.active', { timeout: 8000 })</code> — handles the 3 s delay with a 5 s safety margin.</li>
  <li><strong>X close (TC-07)</strong>: Clicked <code>.cre-t-08-modal-cross-icon-wrapper</code> → verified <code>.active</code> removed from <code>.cre-t-08-modal-main</code>.</li>
  <li><strong>Overlay close (TC-08)</strong>: <code>page.mouse.click(5, 5)</code> at top-left viewport corner — inside overlay, outside centred modal container.</li>
  <li><strong>Session guard (TC-10)</strong>: Pre-set <code>document.cookie = "cre-t-08=modal-triggered; path=/"</code> before injecting JS → waited 5.5 s → verified no <code>.active</code> modal.</li>
  <li><strong>Scroll lock (TC-11/12)</strong>: <code>getComputedStyle(document.body).overflow</code> checked for "hidden" while open and restored after close.</li>
  <li><strong>Colour check (TC-18)</strong>: <code>getComputedStyle(el).backgroundColor</code> compared to <code>rgb(208, 54, 67)</code> (#D03643).</li>
  <li><strong>Icon load (TC-16)</strong>: <code>img.complete &amp;&amp; img.naturalWidth &gt; 0</code> for all 3 SVG feature icons.</li>
  <li><strong>CTA error check (TC-19)</strong>: <code>page.on('pageerror', ...)</code> listener — verified no uncaught TypeError from the null-checked get-started link handler.</li>
  <li><strong>Mobile (TC-20)</strong>: <code>page.setViewportSize({ width: 390, height: 844 })</code> before navigation. Verified <code>flex-direction: column</code> on feature container.</li>
  <li><strong>X inside modal (TC-06)</strong>: Compared <code>getBoundingClientRect()</code> of cross wrapper vs container — cross must be within container bounds (fixed in CSS from <code>position:fixed</code> to <code>position:absolute</code>).</li>
</ul>

<h3>Restore Before Going Live</h3>
<div style="background:#fff8f0;border:1px solid #ffc107;border-radius:10px;padding:14px 18px;font-size:14px;color:#856404;margin:16px 0">
  ⚠ <strong>IMPORTANT:</strong> <code>MODAL_DELAY_SECONDS</code> in <code>vB.js</code> was set to <code>3</code> for QA speed. Change it back to <strong>30</strong> before the variation goes live in Optimizely.
</div>

<div class="footer">
  CRE-T-08 QA Report · ${dateStr} · Playwright Automated Tests · pay.com.au<br>
  QA by sarthak@brillmark.com · Spec: cre-t-08-pay-modal.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nCRE-T-08 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = CreT08Reporter;
