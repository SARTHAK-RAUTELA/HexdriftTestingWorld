/**
 * AFP09 Custom HTML Reporter
 * Captures AFP09 test results → afp09-qa-report.html
 * Filters on spec file name containing "afp09"
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'afp09-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/AFP09.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/afp09-qa-report.html');

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function allBrowserScreenshots(prefix) {
  if (!fs.existsSync(SS_DIR)) return [];
  return fs.readdirSync(SS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    .map(f => ({
      browser: f.replace(prefix + '-', '').replace('.png', ''),
      src: imgB64(path.join(SS_DIR, f)),
    }));
}

class Afp09Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('afp09')) return;

    const title       = test.title;
    const projectName = test.parent?.project()?.name ?? 'Unknown';
    const status      = result.status; // passed | failed | skipped | timedOut

    // Capture error message for failed tests
    const errorMsg = result.status === 'failed'
      ? (result.error?.message || '').split('\n').slice(0, 4).join('\n')
      : '';

    this._results.push({ title, projectName, status, errorMsg });
  }

  onEnd() {
    if (!this._results.length) return;
    this._generateReport();
  }

  _generateReport() {
    const results     = this._results;
    const allBrowsers = [...new Set(results.map(r => r.projectName))];
    const allTCs      = [...new Set(results.map(r => r.title))];

    // matrix: { tc -> { browser -> { status, errorMsg } } }
    const matrix = {};
    for (const r of results) {
      if (!matrix[r.title]) matrix[r.title] = {};
      matrix[r.title][r.projectName] = { status: r.status, errorMsg: r.errorMsg };
    }

    const totalTests = results.length;
    const passed     = results.filter(r => r.status === 'passed').length;
    const failed     = results.filter(r => r.status === 'failed').length;
    const skipped    = results.filter(r => r.status === 'skipped').length;

    const figmaB64    = imgB64(FIGMA_IMG);
    const modalShots      = allBrowserScreenshots('modal-desktop');
    const exitIntentShots = allBrowserScreenshots('exit-intent');
    const mobileShots     = allBrowserScreenshots('modal-mobile');

    function badge(status) {
      if (!status) return '<span class="badge skip">—</span>';
      if (status === 'passed')  return '<span class="badge pass">PASS</span>';
      if (status === 'failed')  return '<span class="badge fail">FAIL</span>';
      if (status === 'skipped') return '<span class="badge skip">SKIP</span>';
      return `<span class="badge skip">${status}</span>`;
    }

    function ssSection(shots, caption) {
      if (!shots.length) return '<p><em>No screenshots captured.</em></p>';
      return shots
        .filter(s => s.src)
        .map(s => `
        <div class="ss-wrap">
          <img src="${s.src}" alt="${caption} — ${s.browser}"/>
          <div class="ss-caption">${caption} · ${s.browser}</div>
        </div>`).join('');
    }

    const browserHeaders = allBrowsers
      .map(b => `<th>${b.replace(' Desktop','').replace('Mobile ','📱 ')}</th>`)
      .join('');

    const matrixRows = allTCs.map(tc => {
      const hasAnyFail = allBrowsers.some(b => matrix[tc]?.[b]?.status === 'failed');
      const cols = allBrowsers.map(b => {
        const cell = matrix[tc]?.[b];
        const tip  = cell?.errorMsg
          ? ` title="${cell.errorMsg.replace(/"/g, '&quot;')}"`
          : '';
        return `<td${tip}>${badge(cell?.status)}</td>`;
      }).join('');
      return `<tr class="${hasAnyFail ? 'row-fail' : ''}">
        <td class="tc-name">${tc}</td>${cols}</tr>`;
    }).join('\n');

    // Group failed tests for the dedicated error section
    const failedList = results
      .filter(r => r.status === 'failed')
      .map(r => `<li><strong>${r.title}</strong> [${r.projectName}]${r.errorMsg ? `<br><code>${r.errorMsg.replace(/</g,'&lt;')}</code>` : ''}</li>`)
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AFP09 QA Report — 30-Second Timed Modal + Exit Intent</title>
<style>
:root {
  --gold:#fcd426;  --gold-l:#fffbe6; --gold-d:#c9a91e;
  --dark:#0d1b2a;  --dark2:#1a3a5c;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --blue:#1a5276;  --blue-l:#eaf2fb;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--green)}

/* COVER */
.cover{background:linear-gradient(135deg,var(--dark) 0%,var(--dark2) 55%,#1a4a2e 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
.cover-brand{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7}
.cover h1{font-size:38px;font-weight:800;line-height:1.2;margin-top:4px}
.cover h1 span{color:var(--gold)}
.cover .sub{font-size:17px;opacity:.8;max-width:700px;margin-top:4px}
.cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;opacity:.8;font-size:13px}
.badge-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;backdrop-filter:blur(4px)}
.badge-pill.pass{background:rgba(22,163,74,.25);border-color:rgba(22,163,74,.5)}
.badge-pill.gold{background:rgba(252,212,38,.2);border-color:rgba(252,212,38,.5)}

/* LAYOUT */
.wrap{max-width:1120px;margin:0 auto;padding:0 36px 80px}
h2{font-size:21px;font-weight:700;color:var(--green);margin:52px 0 18px;padding-bottom:9px;border-bottom:2px solid var(--green-l)}
h3{font-size:15px;font-weight:700;margin:22px 0 8px;color:var(--text)}
p{margin-bottom:10px}
ul{padding-left:20px;margin-bottom:10px}
li{margin-bottom:5px}
code{background:#f1f3f5;border-radius:4px;padding:2px 7px;font-size:12.5px;font-family:'SF Mono','Consolas',monospace}

/* TOC */
.toc{background:var(--green-l);border:1px solid var(--green-b);border-radius:12px;padding:22px 26px;margin:32px 0}
.toc h3{color:var(--green);margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.8px}
.toc ol{padding-left:20px;column-count:2;column-gap:40px}
.toc li{margin-bottom:6px}
.toc a{color:var(--green);text-decoration:none;font-weight:500;font-size:14px}
.toc a:hover{text-decoration:underline}

/* KPI CARDS */
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 32px}
.kpi{border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:5px;text-align:center}
.kpi.total{background:var(--blue-l);border:1px solid #9bc1e0}
.kpi.pass {background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail {background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip {background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:var(--blue)}
.kpi.pass  .num{color:#16a34a}
.kpi.fail  .num{color:var(--red)}
.kpi.skip  .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}

/* MATRIX TABLE */
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--green);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
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
.info-card{background:var(--blue-l);border:1px solid #9bc1e0;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:6px 12px 6px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:var(--blue);width:200px;white-space:nowrap}

/* DIFF GRID */
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.control{background:#f0f8ff;border-color:#005DAA}
.diff-card.variation{background:var(--gold-l);border-color:var(--gold-d)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}

/* SECTION NOTE */
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--green)}

/* ALERT */
.alert-pass{background:var(--green-l);border:1px solid var(--green-b);border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0}
.alert-fail{background:var(--red-l);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0}

/* ERROR LIST */
.error-list{background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.error-list li{margin-bottom:10px}
.error-list code{background:#ffe4e4;font-size:12px}

/* SCREENSHOTS */
.ss-wrap{margin:16px 0;border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ss-wrap img{width:100%;display:block}
.ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}

/* FOOTER */
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}

@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · AFP A/B Testing</div>
  <h1>AFP09 QA Report — <span>30-Second Modal + Exit Intent</span></h1>
  <div class="sub">Comprehensive automated QA for the AFP09 timed exit-intent modal variation on financialprofessionals.org</div>
  <div class="meta">
    <span>📅 May 20, 2026</span>
    <span>🌐 www.financialprofessionals.org — Sitewide</span>
    <span>🖥 Desktop Only (≥1024px)</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalTests} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill gold">⏱ 30s Timer + Exit Intent</span>
    <span class="badge-pill gold">🍪 Once-Only via Cookie</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; Info</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#diff">AFP09 vs AFP08 — Key Differences</a></li>
    <li><a href="#results">Test Results Summary</a></li>
    <li><a href="#matrix">Full TC × Browser Matrix</a></li>
    ${failed > 0 ? '<li><a href="#errors">Failed Test Details</a></li>' : ''}
    <li><a href="#screenshots">Visual Screenshots</a></li>
    <li><a href="#methodology">Testing Methodology</a></li>
  </ol>
</div>

<!-- OVERVIEW -->
<h2 id="overview">Test Overview &amp; Info</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>AFP09</strong></td></tr>
    <tr><td>Test Name</td><td>30-Second Timed Modal + Exit Intent</td></tr>
    <tr><td>Test Type</td><td>VWO A/B Test — Exit-Intent / Timed Modal Overlay</td></tr>
    <tr><td>Target URL</td><td><code>https://www.financialprofessionals.org/</code> — <strong>All pages (sitewide)</strong></td></tr>
    <tr><td>Audience</td><td><strong>Desktop only</strong> — CSS media query hides modal at viewport &lt; 1024px</td></tr>
    <tr><td>Modal Trigger</td><td>Fires after <strong>30 seconds</strong> OR on <strong>exit intent</strong> (mouse moves to y ≤ 50px), whichever comes first</td></tr>
    <tr><td>Once-Only</td><td>Cookie <code>exit_popup_dismissed=true</code> prevents repeat showing per browser session</td></tr>
    <tr><td>Key AFP09 Difference</td><td>"View Program &amp; Pricing" links to <strong>AFP 2026 conference homepage</strong> (<code>conference.financialprofessionals.org/</code>), not the schedule page</td></tr>
    <tr><td>Report Date</td><td>May 20, 2026</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalTests} total runs</strong></td></tr>
    <tr><td>Playwright Version</td><td>Current (injected variation pattern)</td></tr>
    <tr><td>VWO Analytics Event</td><td><code>afp09ModalFires</code></td></tr>
  </table>
</div>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">AFP09 uses the same modal design as AFP08 with one key change: the "View Program &amp; Pricing" CTA links to the AFP 2026 conference homepage rather than the program/schedule page. The modal fires after 30s or on exit intent, whichever is first.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="AFP09 Figma Reference"/><div class="ss-caption">AFP09 Figma Design Reference — Dark modal overlay with blurred background</div></div>`
  : '<p><em>AFP09.png not found in local_testing/Local2/ — screenshot skipped.</em></p>'}

<!-- DIFF -->
<h2 id="diff">AFP09 vs AFP08 — Key Differences</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>AFP08 (Reference)</h3>
    <ul>
      <li>Target: <code>conference.financialprofessionals.org</code></li>
      <li>Timer: <strong>15 seconds</strong></li>
      <li>No exit intent trigger</li>
      <li>"View Program &amp; Pricing" → <code>/program/overview/schedule</code></li>
      <li>Once-only via <code>sessionStorage.modalTriggered</code></li>
      <li>VWO event: <code>afp08ModalFires</code></li>
      <li>Blurs <code>.mm-page</code> on show</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>AFP09 (This Test)</h3>
    <ul>
      <li>Target: <strong>All pages</strong> on <code>www.financialprofessionals.org</code></li>
      <li>Timer: <strong>30 seconds</strong></li>
      <li>✅ <strong>Exit intent</strong> trigger (mouse to top, y ≤ 50px, 200ms debounce)</li>
      <li>"View Program &amp; Pricing" → <code>conference.financialprofessionals.org/</code> (homepage)</li>
      <li>Once-only via cookie <code>exit_popup_dismissed=true</code></li>
      <li>VWO event: <code>afp09ModalFires</code></li>
      <li>Blurs <code>#site-header</code> + <code>#site-main</code> on show</li>
    </ul>
  </div>
</div>

<!-- RESULTS SUMMARY -->
<h2 id="results">Test Results Summary</h2>
<div class="kpi-row">
  <div class="kpi total"><span class="num">${totalTests}</span><span class="lbl">Total Runs</span></div>
  <div class="kpi pass"><span class="num">${passed}</span><span class="lbl">Passed</span></div>
  <div class="kpi fail"><span class="num">${failed}</span><span class="lbl">Failed</span></div>
  <div class="kpi skip"><span class="num">${skipped}</span><span class="lbl">Skipped</span></div>
</div>

${failed === 0
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers. The AFP09 modal is functioning correctly — 30-second timer, exit intent, cookie guard, sitewide injection, content matching, and link verification all verified.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalTests} test runs failed. See the matrix below and the Failed Tests section for details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01–02</strong> — DOM injection &amp; body class</li>
  <li><strong>TC-03–05</strong> — 30-second timer (before, at, partial elapsed)</li>
  <li><strong>TC-06–08</strong> — sessionStorage startTime persistence &amp; cross-page navigation</li>
  <li><strong>TC-09–10</strong> — Once-only cookie guard (<code>exit_popup_dismissed</code>)</li>
  <li><strong>TC-11–12</strong> — Exit intent trigger &amp; cookie blocking</li>
  <li><strong>TC-13–14</strong> — Close interactions (X button, overlay click)</li>
  <li><strong>TC-15</strong>  — No duplicate injection</li>
  <li><strong>TC-16</strong>  — Full content &amp; text matching (Figma vs code)</li>
  <li><strong>TC-17–18</strong> — CTA link hrefs (Register Now &amp; View Program &amp; Pricing → homepage)</li>
  <li><strong>TC-19</strong>  — VWO analytics event <code>afp09ModalFires</code></li>
  <li><strong>TC-20–22</strong> — Responsive breakpoints (375px · 768px · 1024px)</li>
  <li><strong>TC-23–25</strong> — Site-wide pages (/membership/ · /events/ · /career/)</li>
  <li><strong>TC-26–27</strong> — Layout max-width &amp; centering (1440px · 1920px)</li>
  <li><strong>TC-28</strong>  — Z-index ordering (overlay 9998, container 9999)</li>
  <li><strong>TC-29</strong>  — Background blur on #site-header &amp; #site-main</li>
  <li><strong>TC-30</strong>  — Wrapper scale at short viewport height</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP for that TC on that browser. Hover over FAIL cells for truncated error details. Desktop-only tests (TC-04, TC-08, TC-10–14, TC-16–19, TC-23–25, TC-26–30) are skipped on Mobile Chrome &amp; Mobile Safari — this is expected behavior.</div>
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
<div class="section-note">Screenshots below were captured during the Playwright test run. Modal-desktop shots show the dark overlay modal with blurred background. Mobile shots confirm modal is hidden at &lt;1024px.</div>

<h3>Modal — Desktop (shown after 30s timer, TC-16 content verified)</h3>
${ssSection(modalShots, 'Modal Desktop')}

<h3>Modal — Exit Intent Trigger (mouse moved to top of viewport, TC-11)</h3>
${ssSection(exitIntentShots, 'Exit Intent')}

<h3>Modal — Mobile State (hidden at &lt;1024px, TC-20)</h3>
${ssSection(mobileShots, 'Modal Mobile Hidden')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests used Playwright with the VWO variation JS and CSS injected directly into mock pages that replicate the real <code>www.financialprofessionals.org</code> page structure (with <code>#site-header</code> and <code>#site-main</code>). Network requests to the live site were intercepted and served the mock HTML, allowing deterministic, isolated testing.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Timer acceleration</strong>: <code>sessionStorage.startTime</code> was pre-set to simulate elapsed time (e.g., 31s), triggering immediate modal display without waiting 30 real seconds.</li>
  <li><strong>Exit intent</strong>: Simulated via <code>page.mouse.move(x, 30)</code> to move the cursor within 50px of the top edge, triggering the debounced mousemove handler.</li>
  <li><strong>Cookie guard</strong>: Tested by pre-setting <code>document.cookie = 'exit_popup_dismissed=true'</code> before variation injection, verifying the modal never shows.</li>
  <li><strong>Site-wide</strong>: Three distinct AFP pages tested (/membership/, /events/, /career/) — all using the same mock HTML with <code>#site-main</code> present.</li>
  <li><strong>Responsive</strong>: Viewport resized to 375px, 768px, and 1024px to verify the <code>@media (min-width: 1024px)</code> breakpoint is enforced.</li>
  <li><strong>Content matching</strong>: TC-16 performs exact text assertions against all Figma-specified copy strings.</li>
</ul>

<div class="footer">
  AFP09 QA Report · May 20, 2026 · Playwright Automated Tests · www.financialprofessionals.org<br>
  QA by sarthak@brillmark.com · Spec: afp09-modal.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalTests} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nAFP09 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalTests} total`);
  }
}

module.exports = Afp09Reporter;
