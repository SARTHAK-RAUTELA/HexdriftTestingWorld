/**
 * CRE-T-123 Custom HTML Reporter
 * Generates cre-t-123-qa-report.html for Pet Insurance Gurus — Insurer Alert Box.
 * Filters on spec files containing "cre-t-123".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'cre-t-123-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/Group 3.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/cre-t-123-qa-report.html');

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

class CreT123Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('cre-t-123')) return;

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

    const controlShots   = allScreenshots('tc01-control');
    const varAlertShots  = allScreenshots('tc02-variation-alert');
    const dismissedShots = allScreenshots('tc09-dismissed');
    const cookieShots    = allScreenshots('tc11-cookie-guard');
    const nationwideShots= allScreenshots('tc14-nationwide');
    const compareShots   = allScreenshots('tc18-compare-page');
    const desktopShots   = allScreenshots('tc19-desktop');
    const mobileShots    = allScreenshots('tc20-mobile-390');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CRE-T-123 QA Report — Pet Insurance Gurus — Insurer Alert Box</title>
<style>
:root {
  --teal:#007baa;  --teal-l:#e6f4fa; --teal-b:#9bcfe5;
  --dark:#0d2b3e;  --dark2:#1a4a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --amber:#b45309; --amber-l:#fffbeb; --amber-b:#fcd34d;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--teal)}
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
.badge-pill.amber{background:rgba(180,83,9,.3);border-color:rgba(180,83,9,.5)}
.wrap{max-width:1160px;margin:0 auto;padding:0 36px 80px}
h2{font-size:21px;font-weight:700;color:var(--teal);margin:52px 0 18px;padding-bottom:9px;border-bottom:2px solid var(--teal-l)}
h3{font-size:15px;font-weight:700;margin:22px 0 8px;color:var(--text)}
p{margin-bottom:10px}
ul{padding-left:20px;margin-bottom:10px}
li{margin-bottom:5px}
code{background:#f1f3f5;border-radius:4px;padding:2px 7px;font-size:12.5px;font-family:'SF Mono','Consolas',monospace}
.toc{background:var(--teal-l);border:1px solid var(--teal-b);border-radius:12px;padding:22px 26px;margin:32px 0}
.toc h3{color:var(--teal);margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.8px}
.toc ol{padding-left:20px;column-count:2;column-gap:40px}
.toc li{margin-bottom:6px}
.toc a{color:var(--teal);text-decoration:none;font-weight:500;font-size:14px}
.toc a:hover{text-decoration:underline}
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
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--teal);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:360px}
.matrix td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.matrix tr:nth-child(even) td{background:var(--grey)}
.matrix tr.row-fail td{background:#fff0ef!important}
.matrix .tc-name{font-size:13px;font-weight:500;font-family:'SF Mono','Consolas',monospace}
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
.badge.pass{background:#16a34a;color:#fff}
.badge.fail{background:var(--red);color:#fff}
.badge.skip{background:#adb5bd;color:#fff}
.info-card{background:var(--teal-l);border:1px solid var(--teal-b);border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:7px 12px 7px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:var(--dark2);width:220px;white-space:nowrap}
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.control{background:#f0f8ff;border-color:#005DAA}
.diff-card.variation{background:var(--teal-l);border-color:var(--teal)}
.diff-card.discrepancy{background:var(--amber-l);border-color:var(--amber)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--teal)}
.alert-pass{background:var(--green-l);border:1px solid var(--green-b);border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0}
.alert-fail{background:var(--red-l);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0}
.alert-warn{background:var(--amber-l);border:1px solid var(--amber-b);border-radius:10px;padding:14px 18px;color:var(--amber);font-weight:600;font-size:14px;margin:16px 0}
.error-list{background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.error-list li{margin-bottom:10px}
.error-list code{background:#ffe4e4;font-size:12px}
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px;margin:16px 0}
.ss-wrap{border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ss-wrap img{width:100%;display:block}
.ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}
.url-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.url-table th{background:var(--teal);color:#fff;padding:8px 14px;text-align:left}
.url-table td{padding:8px 14px;border-bottom:1px solid var(--border);word-break:break-all}
.url-table tr:nth-child(even) td{background:var(--grey)}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · Pet Insurance Gurus A/B Testing</div>
  <h1>CRE-T-123 QA Report — <span>Insurer Alert Box</span></h1>
  <div class="sub">Automated QA for the CRE-T-123 variation on Pet Insurance Gurus — a dismissible alert box injected above comparison results when the <code>&amp;insurer=</code> query parameter is present. Dynamic company name insertion tested across multiple insurer values and URL encodings.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 petinsurancegurus.com — Homepage + /compare/</span>
    <span>📱 Desktop · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill teal">🐾 Pet Insurance Gurus</span>
    <span class="badge-pill amber">⚠️ Figma/Code Discrepancies Noted</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#discrepancies">Figma vs Code Discrepancies</a></li>
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
    <tr><td>Test ID</td><td><strong>CRE-T-123</strong></td></tr>
    <tr><td>Variation Class</td><td><code>cre-t-123</code></td></tr>
    <tr><td>Test Name</td><td>Insurer Alert Box (similar methodology to SWF109)</td></tr>
    <tr><td>Test Type</td><td>Convert.com A/B Test — Dynamic Insurer Alert</td></tr>
    <tr><td>Client</td><td>Pet Insurance Gurus</td></tr>
    <tr><td>Audience Targeting</td><td><strong>Only users with <code>&amp;insurer=</code> query parameter in URL</strong></td></tr>
    <tr><td>Alert Trigger</td><td>JS waits for <code>#comparison-section [data-unique="comparison-table"]</code>, then injects alert</td></tr>
    <tr><td>Dismiss Behavior</td><td>Click <code>.cre-t-123-close-icon</code> → removes element, sets cookie, removes body class</td></tr>
    <tr><td>Cookie Guard</td><td><code>cre-t-123-cookie=cre-t-123-variation</code> — prevents re-show after dismiss</td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Mobile (390×844)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
  </table>
</div>

<h3>Target URLs</h3>
<table class="url-table">
  <thead><tr><th>Type</th><th>URL</th><th>Variation ID</th></tr></thead>
  <tbody>
    <tr><td><strong>Control</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052296.1000256044&amp;insurer=MetLife+Life+Insurance</code></td><td>1000256044</td></tr>
    <tr><td><strong>Variation — /</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052296.1000256045&amp;insurer=MetLife+Life+Insurance</code></td><td>1000256045</td></tr>
    <tr><td><strong>Variation — /compare/</strong></td><td><code>https://petinsurancegurus.com/compare/?cro_mode=qa&amp;_conv_eforce=100052296.1000256045&amp;insurer=MetLife+Life+Insurance</code></td><td>1000256045</td></tr>
  </tbody>
</table>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">The Figma wireframe shows Control (left) vs Concept 2/Variation (right). The variation injects a yellow-background dismissible alert box between the filter tabs and the first comparison result. The company name from <code>&amp;insurer=</code> is inserted dynamically in both the title and body text.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="CRE-T-123 Figma Reference"/><div class="ss-caption">CRE-T-123 Figma Design — Left: Control | Right: Variation (insurer alert box below filter tabs)</div></div>`
  : '<p><em>Group 3.png not found in local_testing/Local2/ — Figma screenshot skipped.</em></p>'}

<!-- DISCREPANCIES -->
<h2 id="discrepancies">⚠️ Figma vs Code Discrepancies</h2>
<div class="alert-warn">⚠️ The following differences were found between the Figma wireframe and the variation JS/CSS implementation. These require review by the developer before the test goes live.</div>
<div class="diff-card discrepancy" style="margin:20px 0">
  <h3>Copy Discrepancies — Figma vs vB.js</h3>
  <ul>
    <li><strong>Alert Title:</strong> Figma says <code>"Looking <u>for</u> MetLife Life Insurance?"</code> — Code outputs <code>"Looking <u>at</u> MetLife Life Insurance?"</code></li>
    <li><strong>Provider count:</strong> Figma says <code>"29 pet insurers"</code> — Code says <code>"29 pet insurance providers"</code></li>
    <li><strong>Body phrasing:</strong> Figma says <code>"…with instant online approval…"</code> — Code says <code>"…<u>many</u> with instant online approval…"</code></li>
    <li><strong>Body insurer reference:</strong> Figma shows <code>"MetLife Pet Insurance didn't make the list"</code> — Code uses the <em>full insurer param value</em> <code>"MetLife Life Insurance didn't make the list"</code> (by design — param is a life insurer name)</li>
  </ul>
  <p style="margin-top:12px;font-size:13px;"><strong>Tests assert code behavior</strong> (i.e., "Looking at", "29 pet insurance providers", "many with"). If the intent was "Looking for", the JS must be updated.</p>
</div>

<!-- DIFF -->
<h2 id="diff">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control</h3>
    <ul>
      <li>Standard Pet Insurance Gurus comparison page</li>
      <li>No alert box above comparison results</li>
      <li>No <code>.cre-t-123-container</code> in DOM</li>
      <li>No <code>body.cre-t-123</code> class</li>
      <li><code>.page-description ul</code> visible (not hidden)</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation (CRE-T-123)</h3>
    <ul>
      <li>✅ <strong>Alert box</strong> injected above comparison table</li>
      <li>✅ Yellow background: <code>#FEF3D1</code> · border-radius 10px</li>
      <li>✅ Info icon (circular blue SVG) on left</li>
      <li>✅ Dynamic title: <strong>"Looking at [Insurer]?"</strong> (font-weight 600, 18px)</li>
      <li>✅ Dynamic body: static text + <strong>"[Insurer] didn't make the list"</strong></li>
      <li>✅ Bold spans: "instant online approval" + "fast claim payouts"</li>
      <li>✅ X dismiss button (top-right): removes alert + sets cookie</li>
      <li>✅ Cookie guard: <code>cre-t-123-cookie=cre-t-123-variation</code></li>
      <li>✅ <code>body.cre-t-123</code> class added</li>
      <li>✅ <code>.page-description ul</code> hidden (<code>display:none</code>)</li>
      <li>✅ URL encoding: both <code>+</code> and <code>%20</code> decode to spaces</li>
      <li>✅ Deduplication: DOM check prevents double injection</li>
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers and viewports. The CRE-T-123 variation is functioning correctly — dynamic insurer name injection, dismiss behavior, cookie guard, URL encoding (+ and %20), alternate insurer names, /compare/ page, and responsive layouts all verified.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section below for full details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — Control: no alert container injected</li>
  <li><strong>TC-02</strong> — Variation: alert visible with MetLife+Life+Insurance</li>
  <li><strong>TC-03</strong> — Dynamic title: "Looking at MetLife Life Insurance?"</li>
  <li><strong>TC-04</strong> — Dynamic body: insurer name in "didn't make the list"</li>
  <li><strong>TC-05</strong> — Static body: "We've reviewed 29 pet insurance providers"</li>
  <li><strong>TC-06</strong> — Bold spans: "instant online approval" + "fast claim payouts" are font-weight 600</li>
  <li><strong>TC-07</strong> — Body class: <code>body.cre-t-123</code> present in variation</li>
  <li><strong>TC-08</strong> — Dismiss button: <code>.cre-t-123-close-icon</code> visible</li>
  <li><strong>TC-09</strong> — Dismiss: clicking X removes container from DOM</li>
  <li><strong>TC-10</strong> — Cookie: <code>cre-t-123-cookie=cre-t-123-variation</code> set after dismiss</li>
  <li><strong>TC-11</strong> — Cookie guard: alert NOT injected when dismiss cookie pre-set</li>
  <li><strong>TC-12</strong> — URL encoding (+): "MetLife+Life+Insurance" decoded correctly</li>
  <li><strong>TC-13</strong> — URL encoding (%20): "MetLife%20Life%20Insurance" decoded correctly</li>
  <li><strong>TC-14</strong> — Different insurer: "Nationwide+Pet+Insurance" shows correct name</li>
  <li><strong>TC-15</strong> — No duplication: container injected exactly once</li>
  <li><strong>TC-16</strong> — CSS: wrapper background is <code>#FEF3D1</code></li>
  <li><strong>TC-17</strong> — Page list hidden: <code>.page-description ul</code> is <code>display:none</code></li>
  <li><strong>TC-18</strong> — /compare/ page: alert present with insurer param</li>
  <li><strong>TC-19</strong> — Desktop 1280×800: alert visible</li>
  <li><strong>TC-20</strong> — Mobile 390×844: alert fits viewport</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP. Hover over FAIL cells for truncated error details.</div>
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
<div class="section-note">Screenshots captured during the Playwright run against live Convert.com preview URLs.</div>

<h3>TC-01 — Control: No Alert</h3>
${ssSection(controlShots, 'Control — No Alert')}

<h3>TC-02 — Variation: Alert with MetLife Life Insurance</h3>
${ssSection(varAlertShots, 'Variation Alert')}

<h3>TC-09 — After Dismiss (X clicked)</h3>
${ssSection(dismissedShots, 'After Dismiss')}

<h3>TC-11 — Cookie Guard (Alert Not Shown)</h3>
${ssSection(cookieShots, 'Cookie Guard')}

<h3>TC-14 — Different Insurer: Nationwide Pet Insurance</h3>
${ssSection(nationwideShots, 'Nationwide Insurer')}

<h3>TC-18 — /compare/ Page with Alert</h3>
${ssSection(compareShots, '/compare/ Page')}

<h3>TC-19 — Desktop 1280×800</h3>
${ssSection(desktopShots, 'Desktop 1280×800')}

<h3>TC-20 — Mobile 390×844</h3>
${ssSection(mobileShots, 'Mobile 390×844')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigated to live Convert.com preview URLs — no local JS/CSS injection. The variation JS and CSS are served by the Convert.com platform via <code>_conv_eforce</code>.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Control check (TC-01)</strong>: Waited 7 seconds then asserted alert container count is 0.</li>
  <li><strong>Alert presence (TC-02, TC-18)</strong>: Used <code>page.waitForSelector('.cre-t-123-container')</code> with 25s timeout to handle async injection.</li>
  <li><strong>Dynamic content (TC-03–05)</strong>: Read <code>innerText()</code> from <code>.cre-t-123-hero-title</code> and <code>.cre-t-123-subheader-title</code> and verified insurer name and static copy.</li>
  <li><strong>Bold spans (TC-06)</strong>: Queried <code>querySelectorAll('span')</code> inside subheader and checked <code>getComputedStyle().fontWeight</code>.</li>
  <li><strong>Dismiss (TC-09)</strong>: Clicked <code>.cre-t-123-close-icon</code>, waited 600ms, then asserted container count is 0 (element removed from DOM).</li>
  <li><strong>Cookie (TC-10)</strong>: After dismiss, read <code>page.context().cookies()</code> and verified <code>cre-t-123-cookie=cre-t-123-variation</code>.</li>
  <li><strong>Cookie guard (TC-11)</strong>: Used <code>page.context().addCookies()</code> to pre-set dismiss cookie before navigation, then waited 6 seconds and asserted no alert.</li>
  <li><strong>URL encoding (TC-12–13)</strong>: Navigated to variation URL with <code>+</code> and <code>%20</code> encodings respectively and verified decoded name in title.</li>
  <li><strong>Different insurer (TC-14)</strong>: Substituted <code>insurer=Nationwide+Pet+Insurance</code> in URL and verified correct name in title and body.</li>
  <li><strong>No duplication (TC-15)</strong>: Waited 1.5 seconds (multiple setInterval ticks) and counted containers — must be exactly 1.</li>
  <li><strong>CSS (TC-16)</strong>: Read <code>getComputedStyle().backgroundColor</code> from <code>.cre-t-123-wrapper</code>.</li>
  <li><strong>Responsive (TC-19–20)</strong>: Used <code>page.setViewportSize()</code> before navigation; verified visibility and bounding box dimensions.</li>
</ul>

<div class="footer">
  CRE-T-123 QA Report · ${dateStr} · Playwright Automated Tests · petinsurancegurus.com<br>
  QA by sarthak@brillmark.com · Spec: cre-t-123-insurer-alert.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nCRE-T-123 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = CreT123Reporter;
