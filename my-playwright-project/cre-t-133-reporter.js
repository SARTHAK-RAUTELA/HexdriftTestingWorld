/**
 * CRE-T-133 Custom HTML Reporter
 * Generates cre-t-133-qa-report.html for Pet Insurance Gurus — ZIP Code Pop-up Modal.
 * Filters on spec files containing "cre-t-133".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'cre-t-133-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/Group 48098551.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/cre-t-133-qa-report.html');

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

class CreT133Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('cre-t-133')) return;

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
        const dur  = cell ? ` <span style="font-size:10px;color:#888">${(cell.duration/1000).toFixed(1)}s</span>` : '';
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
    const v1ModalShots       = allScreenshots('tc02-v1-modal');
    const v1CloseShots       = allScreenshots('tc04-v1-close');
    const v1BackdropShots    = allScreenshots('tc05-v1-backdrop-close');
    const v1CompareShots     = allScreenshots('tc07-v1-compare');
    const v2ModalShots       = allScreenshots('tc08-v2-modal');
    const v2NoCloseShots     = allScreenshots('tc09-v2-no-close');
    const v2BackdropShots    = allScreenshots('tc11-v2-backdrop-stays');
    const v2CompareShots     = allScreenshots('tc13-v2-compare');
    const invalidZipShots    = allScreenshots('tc16-invalid-zip');
    const mobileShots        = allScreenshots('tc20-mobile-390');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CRE-T-133 QA Report — Pet Insurance Gurus — ZIP Code Pop-up Modal</title>
<style>
:root {
  --blue:#0057b8;  --blue-l:#e8f2ff; --blue-b:#90bbf0;
  --dark:#0d1f3c;  --dark2:#1a3a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --gold:#f5a623;  --gold-l:#fff8ee;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
  --v1:#2563eb;    --v2:#16a34a;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--blue)}
.cover{background:linear-gradient(135deg,#001f5b 0%,#0035a0 55%,#0057b8 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
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
.matrix th:first-child{min-width:340px}
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
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.v1{background:#eff6ff;border-color:var(--v1)}
.diff-card.v2{background:#f0fdf4;border-color:var(--v2)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card .v1-label{color:var(--v1);font-weight:700}
.diff-card .v2-label{color:var(--v2);font-weight:700}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}
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
.url-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.url-table th{background:var(--blue);color:#fff;padding:8px 14px;text-align:left}
.url-table td{padding:8px 14px;border-bottom:1px solid var(--border)}
.url-table tr:nth-child(even) td{background:var(--grey)}
.goal-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.goal-table th{background:#334155;color:#fff;padding:8px 14px;text-align:left}
.goal-table td{padding:8px 14px;border-bottom:1px solid var(--border);vertical-align:top}
.goal-table tr:nth-child(even) td{background:var(--grey)}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · CRE A/B Testing</div>
  <h1>CRE-T-133 QA Report — <span>Pet Insurance Gurus ZIP Code Pop-up Modal</span></h1>
  <div class="sub">Automated QA for CRE-T-133 on Pet Insurance Gurus. Two variations tested: V1 has a close (X) button and cookie set on dismiss; V2 has no close button and cookie set immediately on inject. Modal appears 1 s after page load on homepage and /compare/.</div>
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
    <span class="badge-pill blue">🐾 Pet Insurance Gurus</span>
    <span class="badge-pill blue">📍 ZIP Pop-up Modal</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#diff">V1 vs V2 Differences</a></li>
    <li><a href="#goals">Conversion Goal IDs</a></li>
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
    <tr><td>Test ID</td><td><strong>CRE-T-133</strong></td></tr>
    <tr><td>Test Name</td><td>Pet Insurance Gurus — ZIP Code Pop-up Modal</td></tr>
    <tr><td>Variation Name</td><td><code>cre-t-133</code> (V1) / <code>cre-t-133-v2</code> (V2)</td></tr>
    <tr><td>Test Type</td><td>Convert.com A/B Test — ZIP Modal with Two Variation Flavours</td></tr>
    <tr><td>Client</td><td>Pet Insurance Gurus</td></tr>
    <tr><td>Audience</td><td><strong>All users</strong> — Desktop &amp; Mobile</td></tr>
    <tr><td>Target Pages</td><td>Homepage (<code>petinsurancegurus.com/</code>) and Compare page (<code>/compare/</code>)</td></tr>
    <tr><td>URL Guard</td><td>Modal suppressed when <code>window.location.href</code> contains "zip"</td></tr>
    <tr><td>Modal Trigger</td><td>1 second after body available — <code>setTimeout(..., 1000)</code></td></tr>
    <tr><td>V1 Files</td><td><code>variation/vB.js</code> + <code>variation/vB.css</code></td></tr>
    <tr><td>V2 Files</td><td><code>variation/js.js</code> + <code>variation/hello.css</code></td></tr>
    <tr><td>CSS Note</td><td>Both V1 and V2 CSS files are <strong>identical</strong> — only the JS differs</td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Mobile (390×844)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
  </table>
</div>

<h3>Preview URLs</h3>
<table class="url-table">
  <thead><tr><th>Variation</th><th>Preview URL</th><th>Experiment ID</th></tr></thead>
  <tbody>
    <tr><td><strong>V1 — Homepage</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052293.1000256038</code></td><td>1000256038</td></tr>
    <tr><td><strong>V2 — Homepage</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052293.1000256039</code></td><td>1000256039</td></tr>
    <tr><td><strong>V1 — /compare/</strong></td><td><code>https://petinsurancegurus.com/compare/?cro_mode=qa&amp;_conv_eforce=100052293.1000256038</code></td><td>1000256038</td></tr>
    <tr><td><strong>V2 — /compare/</strong></td><td><code>https://petinsurancegurus.com/compare/?cro_mode=qa&amp;_conv_eforce=100052293.1000256039</code></td><td>1000256039</td></tr>
  </tbody>
</table>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">The Figma design shows V1 (left) and V2 (right) side by side. V1 has a close (X) button in the top-right corner of the card. V2 does not have a close button — users must submit a valid ZIP to dismiss the modal.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="CRE-T-133 Figma Reference"/><div class="ss-caption">CRE-T-133 Figma Design — Left: V1 (with close X button) | Right: V2 (no close button)</div></div>`
  : '<p><em>Group 48098551.png not found — Figma screenshot skipped.</em></p>'}

<!-- DIFF -->
<h2 id="diff">V1 vs V2 Differences</h2>
<div class="section-note">Both variations share the same modal layout, content, and CSS. The only code differences are the presence of the close button and the cookie timing/naming behaviour.</div>
<div class="diff-grid">
  <div class="diff-card v1">
    <h3><span class="v1-label">V1</span> — vB.js (with close button)</h3>
    <ul>
      <li>✅ <strong>Close button (X)</strong> visible at top-right of card</li>
      <li>✅ <strong>Clicking outside card</strong> (overlay backdrop mousedown) closes modal</li>
      <li>✅ Cookie: <code>cre-t-133-seen</code></li>
      <li>✅ Cookie set <strong>on close</strong> (X click or backdrop) OR valid ZIP submit</li>
      <li>✅ Close fires goals <code>100037880</code> + <code>100037881</code></li>
      <li>✅ <code>body.cre-t-133-modal-active</code> removed on close</li>
    </ul>
  </div>
  <div class="diff-card v2">
    <h3><span class="v2-label">V2</span> — js.js (without close button)</h3>
    <ul>
      <li>❌ <strong>No close button (X)</strong> in modal — cannot dismiss without ZIP</li>
      <li>❌ <strong>No backdrop-click handler</strong> — clicking outside does nothing</li>
      <li>✅ Cookie: <code>cre-t-133-v2-seen</code></li>
      <li>✅ Cookie set <strong>immediately on modal inject</strong> (before any user action)</li>
      <li>✅ No "seen" cookie set on valid ZIP submit (already set on inject)</li>
      <li>✅ Modal hides via <code>[hidden]</code> attribute only after valid ZIP submit</li>
    </ul>
  </div>
</div>

<h3>Shared behaviour (both V1 and V2)</h3>
<ul style="font-size:14px;margin:10px 0">
  <li>Modal injected into <code>document.body</code> after 1 s delay via <code>setTimeout</code></li>
  <li>Guard: <code>window.location.href.toLowerCase().indexOf("zip") !== -1</code> → no modal</li>
  <li>Guard: existing <code>.cre-t-133-overlay</code> → no double inject</li>
  <li>Same CSS files — same card dimensions, colours, responsive breakpoints</li>
  <li>ZIP input: numeric-only strip, max 5 digits, red border <code>#e02424</code> on invalid</li>
  <li>Valid ZIP submission fills page ZIP field, submits page form, hides modal</li>
  <li>Conversion goals: 100037876 (shown) · 100037877 (ZIP engaged) · 100037878 (submit clicked) · 100037879 (valid submit) · 100037881 (seen/done)</li>
  <li>Hero image: <code>v2.crocdn.com/SwiftTest/swf133/dogs.png</code></li>
  <li>5 insurer logos: Fetch · ASPCA · Lemonade · Embrace · Trupanion</li>
</ul>

<!-- GOALS -->
<h2 id="goals">Conversion Goal IDs</h2>
<table class="goal-table">
  <thead><tr><th>Goal ID</th><th>Event</th><th>V1</th><th>V2</th></tr></thead>
  <tbody>
    <tr><td><code>100037876</code></td><td>Modal shown / injected</td><td>✅</td><td>✅</td></tr>
    <tr><td><code>100037877</code></td><td>User types in ZIP input (first engagement)</td><td>✅</td><td>✅</td></tr>
    <tr><td><code>100037878</code></td><td>Submit button first clicked</td><td>✅</td><td>✅</td></tr>
    <tr><td><code>100037879</code></td><td>Valid 5-digit ZIP submitted</td><td>✅</td><td>✅</td></tr>
    <tr><td><code>100037880</code></td><td>Modal closed (X or backdrop click)</td><td>✅</td><td>❌ (no close path)</td></tr>
    <tr><td><code>100037881</code></td><td>Already seen / modal done</td><td>✅</td><td>✅</td></tr>
  </tbody>
</table>

<!-- RESULTS SUMMARY -->
<h2 id="results">Test Results Summary</h2>
<div class="kpi-row">
  <div class="kpi total"><span class="num">${totalRuns}</span><span class="lbl">Total Runs</span></div>
  <div class="kpi pass"><span class="num">${passed}</span><span class="lbl">Passed</span></div>
  <div class="kpi fail"><span class="num">${failed}</span><span class="lbl">Failed</span></div>
  <div class="kpi skip"><span class="num">${skipped}</span><span class="lbl">Skipped</span></div>
</div>

${failed === 0
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all ${allBrowsers.length} browsers. CRE-T-133 V1 and V2 are both functioning correctly — modal appearance, close behaviour, cookie logic, ZIP validation, content, and responsive layout all verified.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section below for full details.</div>`}

<h3>Test Coverage Summary (20 TCs)</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — V1: <code>body.cre-t-133</code> class added</li>
  <li><strong>TC-02</strong> — V1: modal overlay injected and visible on homepage  <em>[screenshot]</em></li>
  <li><strong>TC-03</strong> — V1: close button (X) present in modal</li>
  <li><strong>TC-04</strong> — V1: clicking X closes modal — <code>[hidden]</code> set, modal-active removed  <em>[screenshot]</em></li>
  <li><strong>TC-05</strong> — V1: clicking overlay backdrop closes modal  <em>[screenshot]</em></li>
  <li><strong>TC-06</strong> — V1: modal suppressed when URL contains "zip"</li>
  <li><strong>TC-07</strong> — V1: modal appears on /compare/ page  <em>[screenshot]</em></li>
  <li><strong>TC-08</strong> — V2: modal overlay injected and visible on homepage  <em>[screenshot]</em></li>
  <li><strong>TC-09</strong> — V2: close button (X) NOT present  <em>[screenshot]</em></li>
  <li><strong>TC-10</strong> — V2: cookie <code>cre-t-133-v2-seen</code> set on inject (no user action)</li>
  <li><strong>TC-11</strong> — V2: clicking backdrop does NOT close modal  <em>[screenshot]</em></li>
  <li><strong>TC-12</strong> — V2: modal suppressed when URL contains "zip"</li>
  <li><strong>TC-13</strong> — V2: modal appears on /compare/ page  <em>[screenshot]</em></li>
  <li><strong>TC-14</strong> — ZIP: non-numeric characters stripped in real time</li>
  <li><strong>TC-15</strong> — ZIP: input limited to 5 digits max</li>
  <li><strong>TC-16</strong> — ZIP: invalid/empty submit shows red border <code>#e02424</code>  <em>[screenshot]</em></li>
  <li><strong>TC-17</strong> — ZIP: typing clears the red error border</li>
  <li><strong>TC-18</strong> — Content: heading text matches Figma design</li>
  <li><strong>TC-19</strong> — Content: submit label "Show my prices" + CSS <code>text-transform:uppercase</code></li>
  <li><strong>TC-20</strong> — Responsive: Mobile 390×844 — modal card visible and ≤390px wide  <em>[screenshot]</em></li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP + duration for that TC × browser combination. Hover FAIL cells for truncated error details. Row highlighted in red if any browser failed.</div>
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
<div class="section-note">Screenshots from live Convert.com preview URLs, captured during the Playwright run across browsers.</div>

<h3>V1 — Modal Visible (TC-02)</h3>
${ssSection(v1ModalShots, 'V1 Modal')}

<h3>V1 — After X Close Click (TC-04)</h3>
${ssSection(v1CloseShots, 'V1 Close')}

<h3>V1 — After Backdrop Click (TC-05)</h3>
${ssSection(v1BackdropShots, 'V1 Backdrop Close')}

<h3>V1 — /compare/ Page Modal (TC-07)</h3>
${ssSection(v1CompareShots, 'V1 Compare Page')}

<h3>V2 — Modal Visible — No Close Button (TC-08 &amp; TC-09)</h3>
${ssSection(v2ModalShots, 'V2 Modal')}

<h3>V2 — No Close Button Confirmation (TC-09)</h3>
${ssSection(v2NoCloseShots, 'V2 No Close')}

<h3>V2 — Backdrop Click — Modal Stays Open (TC-11)</h3>
${ssSection(v2BackdropShots, 'V2 Backdrop Stays')}

<h3>V2 — /compare/ Page Modal (TC-13)</h3>
${ssSection(v2CompareShots, 'V2 Compare Page')}

<h3>ZIP Validation — Red Error Border (TC-16)</h3>
${ssSection(invalidZipShots, 'Invalid ZIP Error')}

<h3>Responsive — Mobile 390×844 (TC-20)</h3>
${ssSection(mobileShots, 'Mobile 390×844')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigated to live Convert.com preview URLs using <code>_conv_eforce</code> params — no JS/CSS injection mocking. The variation code runs as it would in a real experiment.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Modal wait</strong>: <code>page.waitForSelector('.cre-t-133-overlay', { state: 'attached', timeout: 12000 })</code> handles the 1 s inject delay.</li>
  <li><strong>Close button (TC-04)</strong>: Clicked <code>.cre-t-133-close</code> → verified <code>overlay.hasAttribute('hidden')</code> and <code>body.classList.contains('cre-t-133-modal-active')</code> is false.</li>
  <li><strong>Backdrop click (TC-05, TC-11)</strong>: <code>page.mouse.move(5, 5); page.mouse.down();</code> at top-left viewport corner — inside overlay but outside the centred card.</li>
  <li><strong>Cookie check (TC-10)</strong>: <code>page.context().cookies()</code> after modal appears — V2 sets cookie on inject without any user interaction.</li>
  <li><strong>ZIP stripping (TC-14–15)</strong>: <code>page.locator(INPUT).fill(...)</code> triggers the native <code>input</code> event; the variation's live listener cleans the value.</li>
  <li><strong>Error border (TC-16)</strong>: Empty submit → <code>getComputedStyle(el).borderTopColor</code> checked for <code>rgb(224, 36, 36)</code> = #e02424.</li>
  <li><strong>Error clear (TC-17)</strong>: After invalid submit, typed '9' → <code>el.style.borderColor</code> checked for empty string (cleared inline style).</li>
  <li><strong>CSS text-transform (TC-19)</strong>: <code>getComputedStyle(el).textTransform</code> asserted as <code>"uppercase"</code>.</li>
  <li><strong>Responsive (TC-20)</strong>: <code>page.setViewportSize({ width: 390, height: 844 })</code> before navigation; card boundingBox width checked ≤ 390px.</li>
</ul>

<div class="footer">
  CRE-T-133 QA Report · ${dateStr} · Playwright Automated Tests · petinsurancegurus.com<br>
  QA by sarthak@brillmark.com · Spec: cre-t-133-zip-modal.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nCRE-T-133 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = CreT133Reporter;
