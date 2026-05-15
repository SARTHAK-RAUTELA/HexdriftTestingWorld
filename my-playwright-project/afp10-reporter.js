/**
 * AFP10 Custom HTML Reporter
 * Captures AFP10 test results and generates afp10-qa-report.html
 * Filters on spec file name containing "afp10"
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR     = path.join(__dirname, 'afp10-screenshots');
const FIGMA_IMG  = path.join(__dirname, '../local_testing/Local2/AFP10.png');
const OUTPUT     = path.join(__dirname, '../local_testing/Local2/afp10-qa-report.html');

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function ssB64(name) {
  if (!fs.existsSync(SS_DIR)) return '';
  const files = fs.readdirSync(SS_DIR).filter(f => f.startsWith(name));
  if (!files.length) return '';
  return imgB64(path.join(SS_DIR, files[0]));
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

class Afp10Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('afp10')) return;

    const title     = test.title;
    const projectName = test.parent?.project()?.name ?? 'Unknown';
    const status    = result.status;    // passed | failed | skipped | timedOut

    this._results.push({ title, projectName, status });
  }

  onEnd() {
    if (!this._results.length) return;
    this._generateReport();
  }

  _generateReport() {
    const results = this._results;

    // Extract unique TC names and browsers
    const allBrowsers = [...new Set(results.map(r => r.projectName))];
    const allTCs      = [...new Set(results.map(r => r.title))];

    // Build pass/fail matrix: { tc -> { browser -> status } }
    const matrix = {};
    for (const r of results) {
      if (!matrix[r.title]) matrix[r.title] = {};
      matrix[r.title][r.projectName] = r.status;
    }

    const totalTests  = results.length;
    const passed      = results.filter(r => r.status === 'passed').length;
    const failed      = results.filter(r => r.status === 'failed').length;
    const skipped     = results.filter(r => r.status === 'skipped').length;

    const figmaB64 = imgB64(FIGMA_IMG);

    const desktopBrowsers = allBrowsers.filter(b =>
      b.toLowerCase().includes('chrome desktop') ||
      b.toLowerCase().includes('firefox desktop') ||
      b.toLowerCase().includes('edge desktop') ||
      b.toLowerCase().includes('safari desktop')
    );

    // Screenshots
    const controlShots  = allBrowserScreenshots('control-desktop');
    const variationShots = allBrowserScreenshots('variation-desktop');
    const mobileShots   = allBrowserScreenshots('variation-mobile-hidden');

    function statusBadge(status) {
      if (!status) return '<span class="badge skip">—</span>';
      if (status === 'passed')  return '<span class="badge pass">PASS</span>';
      if (status === 'failed')  return '<span class="badge fail">FAIL</span>';
      if (status === 'skipped') return '<span class="badge skip">SKIP</span>';
      return `<span class="badge skip">${status}</span>`;
    }

    function ssSection(shots, caption) {
      if (!shots.length) return '';
      return shots.map(s => s.src ? `
        <div class="ss-wrap">
          <img src="${s.src}" alt="${caption} — ${s.browser}"/>
          <div class="ss-caption">${caption} · ${s.browser}</div>
        </div>` : '').join('');
    }

    const matrixRows = allTCs.map(tc => {
      const cols = allBrowsers.map(b => `<td>${statusBadge(matrix[tc]?.[b])}</td>`).join('');
      const hasAnyFail = allBrowsers.some(b => matrix[tc]?.[b] === 'failed');
      return `<tr class="${hasAnyFail ? 'row-fail' : ''}"><td class="tc-name">${tc}</td>${cols}</tr>`;
    }).join('\n');

    const browserHeaders = allBrowsers.map(b => `<th>${b.replace(' Desktop', '').replace('Mobile ', '')}</th>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AFP10 QA Report — May 15, 2026</title>
<style>
  :root {
    --orange:#f7921d; --orange-light:#fff4e6; --orange-dark:#c4721a;
    --green:#1a6b50;  --green-light:#e6f4ef;
    --red:#c0392b;    --red-light:#fdf0ef;
    --blue:#1a5276;   --blue-light:#eaf2fb;
    --grey:#f8f9fa;   --border:#dee2e6; --text:#212529; --muted:#6c757d;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.6}
  a{color:var(--orange-dark)}

  /* COVER */
  .cover{background:linear-gradient(135deg,#8a4c00 0%,#c4721a 60%,#f7921d 100%);color:#fff;padding:56px 48px 44px;display:flex;flex-direction:column;gap:12px}
  .cover-logo{font-size:22px;font-weight:800;opacity:.9;letter-spacing:-0.5px}
  .cover h1{font-size:38px;font-weight:800;line-height:1.15;margin-top:6px}
  .cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:14px;opacity:.85;font-size:14px}
  .badge-cover{display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:4px 14px;font-size:13px;margin-top:8px;backdrop-filter:blur(4px)}

  /* LAYOUT */
  .container{max-width:1140px;margin:0 auto;padding:0 32px 64px}
  h2{font-size:21px;font-weight:700;color:var(--orange-dark);margin:44px 0 14px;padding-bottom:8px;border-bottom:2px solid var(--orange-light)}
  h3{font-size:16px;font-weight:700;margin:22px 0 8px;color:#333}
  p{margin-bottom:10px}
  code{background:#f1f3f5;border-radius:4px;padding:1px 6px;font-size:13px;font-family:'SF Mono','Consolas',monospace}

  /* KPI CARDS */
  .kpi-row{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0}
  .kpi{flex:1;min-width:150px;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:4px}
  .kpi.pass-kpi{background:var(--green-light);border:1px solid #b2dfcc}
  .kpi.fail-kpi{background:var(--red-light);border:1px solid #f5c6cb}
  .kpi.skip-kpi{background:#f5f5f5;border:1px solid #ccc}
  .kpi.total-kpi{background:var(--orange-light);border:1px solid #f7c98a}
  .kpi-num{font-size:36px;font-weight:800}
  .kpi.pass-kpi .kpi-num{color:var(--green)}
  .kpi.fail-kpi .kpi-num{color:var(--red)}
  .kpi.skip-kpi .kpi-num{color:#666}
  .kpi.total-kpi .kpi-num{color:var(--orange-dark)}
  .kpi-label{font-size:13px;color:var(--muted);font-weight:500}

  /* MATRIX TABLE */
  table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
  th{background:var(--orange-dark);color:#fff;padding:10px 12px;text-align:left;font-weight:600;white-space:nowrap}
  th:first-child{min-width:300px}
  td{padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
  tr:nth-child(even) td{background:var(--grey)}
  tr.row-fail td{background:#fff5f5!important}
  .tc-name{font-size:13px;font-weight:500;font-family:'SF Mono','Consolas',monospace}

  /* BADGES */
  .badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
  .badge.pass{background:#1a6b50;color:#fff}
  .badge.fail{background:#c0392b;color:#fff}
  .badge.skip{background:#adb5bd;color:#fff}

  /* SECTION INTRO */
  .section-intro{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted)}

  /* DIFF GRID */
  .diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
  .diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
  .diff-card.control{background:#f0f8ff;border-color:#005DAA}
  .diff-card.variation{background:var(--orange-light);border-color:var(--orange)}
  .diff-card h3{margin-top:0;font-size:15px}
  .diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
  .diff-card li{margin-bottom:5px}

  /* INFO CARD */
  .info-card{background:var(--blue-light);border:1px solid #9bc1e0;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
  .info-card table{margin:0}
  .info-card td{background:transparent!important;border:none;padding:4px 12px 4px 0;font-size:14px}
  .info-card td:first-child{font-weight:600;color:var(--blue);width:180px}

  /* SCREENSHOTS */
  .ss-wrap{margin:16px 0;border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .ss-wrap img{width:100%;display:block}
  .ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}
  .ss-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}

  /* TOC */
  .toc{background:var(--orange-light);border:1px solid #f7c98a;border-radius:10px;padding:20px 24px;margin:28px 0}
  .toc h3{color:var(--orange-dark);margin:0 0 12px}
  .toc ol{padding-left:20px}
  .toc li{margin-bottom:5px}
  .toc a{color:var(--orange-dark);text-decoration:none;font-weight:500}
  .toc a:hover{text-decoration:underline}

  /* FOOTER */
  .footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}

  @media(max-width:760px){.diff-grid,.ss-row{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">AFP · Brillmark QA</div>
  <h1>AFP10 QA Report</h1>
  <div><span class="badge-cover">Navigation CTA Button · A/B Test · Sitewide · Desktop Only</span></div>
  <div class="meta">
    <span>📅 May 15, 2026</span>
    <span>🌐 www.financialprofessionals.org</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers</span>
    <span>✅ ${passed} Passed · ❌ ${failed} Failed · ⏭ ${skipped} Skipped</span>
  </div>
</div>

<div class="container">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#test-info">Test Overview &amp; Type</a></li>
    <li><a href="#figma">Design Reference (AFP10.png)</a></li>
    <li><a href="#variations">Control vs Variation</a></li>
    <li><a href="#results">Test Results Summary</a></li>
    <li><a href="#matrix">Full TC × Browser Matrix</a></li>
    <li><a href="#screenshots">Visual Screenshots</a></li>
  </ol>
</div>

<!-- TEST INFO -->
<h2 id="test-info">Test Overview &amp; Type</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>AFP10</strong></td></tr>
    <tr><td>Test Type</td><td>A/B Test — Navigation CTA Button Injection (VWO)</td></tr>
    <tr><td>Site</td><td><code>www.financialprofessionals.org</code> — <strong>Sitewide</strong> (all pages)</td></tr>
    <tr><td>Audience Targeting</td><td><strong>Desktop only</strong> (variation button hidden via CSS at ≤1199px)</td></tr>
    <tr><td>Based on</td><td>Control is winner of AFP05 test</td></tr>
    <tr><td>Test Date</td><td>May 15, 2026</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
    <tr><td>Control files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Variation files</td><td><code>local_testing/Local2/variation/js.js</code> + <code>hello.css</code></td></tr>
    <tr><td>Preview URLs</td><td>Control: <code>?_vis_preview_data=eyJhIjoiMDg0...</code> (v=2) · Variation: (v=3)</td></tr>
    <tr><td>Total TCs</td><td>${allTCs.length} test cases × ${allBrowsers.length} browsers = ${totalTests} total runs</td></tr>
  </table>
</div>

<h3>What testing was done</h3>
<p>This QA run used <strong>Playwright</strong> (automated browser testing) against mock pages that replicate the AFP header's <code>#global-login</code> structure. Both the Control and Variation JavaScript + CSS files were injected into the mock pages to simulate VWO execution. Tests verified:</p>
<ul style="padding-left:20px;margin:8px 0;font-size:14px">
  <li>DOM injection accuracy (body class, button element, position, count)</li>
  <li>Content correctness (button text, link URL, Join AFP text change)</li>
  <li>CSS styling (background color, flex layout, font hierarchy)</li>
  <li>Duplicate-init protection (guard against double injection)</li>
  <li>Sitewide behavior (inner pages served the same header)</li>
  <li>Responsive breakpoint (button hidden at ≤1199px, visible at ≥1200px)</li>
  <li>Visual screenshot capture across all 4 desktop browsers</li>
</ul>

<!-- FIGMA REFERENCE -->
<h2 id="figma">Design Reference — AFP10.png</h2>
<div class="section-intro">The original Figma reference showing Control (Winner of AFP05) on the left and Variation 1 on the right. The variation adds a two-line orange CTA button with "REGISTER FOR AFP 2026" + "Early pricing ends June 26" before the Join AFP button in the global header.</div>
${figmaB64 ? `<div class="ss-wrap"><img src="${figmaB64}" alt="AFP10 Figma Reference"/><div class="ss-caption">AFP10 Design Reference — Control (left) vs Variation 1 (right)</div></div>` : '<p><em>AFP10.png not found — skipped</em></p>'}

<!-- VARIATIONS -->
<h2 id="variations">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control (Winner of AFP05)</h3>
    <ul>
      <li>Files: <code>vB.js</code> + <code>vB.css</code></li>
      <li>Adds single-line button: <strong>"Register for FP&amp;A Forum"</strong></li>
      <li>Orange background: <code>#F7921D</code></li>
      <li>Button class: <code>.cre-t-10-reg</code></li>
      <li>Changes "Join AFP" → <strong>"JOIN AFP"</strong></li>
      <li>Inserts before <code>#global-login .global-login__link--join</code></li>
      <li>No responsive hide rule</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation 1 (AFP10)</h3>
    <ul>
      <li>Files: <code>js.js</code> + <code>hello.css</code></li>
      <li>Adds two-line button:</li>
      <li>Line 1: <strong>"REGISTER FOR AFP 2026"</strong> (13.2px, uppercase, white)</li>
      <li>Line 2: <strong>"Early pricing ends June 26"</strong> (9.5px, 75% opacity, capitalize)</li>
      <li>Orange background: <code>#f7921d</code></li>
      <li>Flex column layout with padding + 2px gap</li>
      <li>Changes "Join AFP" → <strong>"JOIN AFP"</strong></li>
      <li><strong>Hidden at ≤1199px</strong> via <code>@media (max-width: 1199px)</code></li>
    </ul>
  </div>
</div>

<!-- RESULTS SUMMARY -->
<h2 id="results">Test Results Summary</h2>
<div class="kpi-row">
  <div class="kpi total-kpi"><span class="kpi-num">${totalTests}</span><span class="kpi-label">Total Runs</span></div>
  <div class="kpi pass-kpi"><span class="kpi-num">${passed}</span><span class="kpi-label">Passed</span></div>
  <div class="kpi fail-kpi"><span class="kpi-num">${failed}</span><span class="kpi-label">Failed</span></div>
  <div class="kpi skip-kpi"><span class="kpi-num">${skipped}</span><span class="kpi-label">Skipped</span></div>
</div>
${failed === 0 ? '<div style="background:#e6f4ef;border:1px solid #b2dfcc;border-radius:10px;padding:14px 18px;color:#1a6b50;font-weight:600;font-size:15px;margin:16px 0">All tests passed across all browsers. Both Control and Variation are functioning correctly.</div>' : `<div style="background:#fdf0ef;border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:#c0392b;font-weight:600;font-size:15px;margin:16px 0">${failed} test(s) failed. See the matrix below for details.</div>`}

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-intro">Each cell shows PASS / FAIL / SKIP for that test case on that browser. TC-11/TC-25 (screenshots) are skipped on mobile browsers as expected.</div>
<div style="overflow-x:auto">
<table>
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

<!-- SCREENSHOTS -->
<h2 id="screenshots">Visual Screenshots</h2>

<h3>Control — Desktop State</h3>
<div class="section-intro">Orange button "Register for FP&amp;A Forum" visible before the JOIN AFP button. Single-line text.</div>
${controlShots.length ? ssSection(controlShots, 'Control') : '<p><em>No control screenshots found.</em></p>'}

<h3>Variation — Desktop State</h3>
<div class="section-intro">Two-line orange button "REGISTER FOR AFP 2026 / Early pricing ends June 26" visible before JOIN AFP. Flex column layout with subtext at 75% opacity.</div>
${variationShots.length ? ssSection(variationShots, 'Variation') : '<p><em>No variation screenshots found.</em></p>'}

<h3>Variation — Mobile State (button hidden at ≤1199px)</h3>
<div class="section-intro">At 375px viewport, the variation button is hidden via CSS (display:none at max-width:1199px). Only the JOIN AFP and LOGIN buttons remain visible.</div>
${mobileShots.length ? ssSection(mobileShots, 'Variation Mobile Hidden') : '<p><em>No mobile screenshots found.</em></p>'}

<div class="footer">
  AFP10 QA Report · Generated May 15, 2026 · Playwright Automated Tests · www.financialprofessionals.org<br>
  QA by sarthak@brillmark.com · Test suite: afp10-cta-button.spec.js · ${allTCs.length} TCs · ${allBrowsers.length} Browsers
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nAFP10 QA Report generated: ${OUTPUT}`);
    console.log(`File size: ${sizeKB} KB`);
    console.log(`Results: ${passed} passed / ${failed} failed / ${skipped} skipped out of ${totalTests} total`);
  }
}

module.exports = Afp10Reporter;
