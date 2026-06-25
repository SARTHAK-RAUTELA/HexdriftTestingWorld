/**
 * SWF135 Custom HTML Reporter
 * Generates swf135-qa-report.html for Pet Insurance Gurus — Badge Overlay Removal.
 * Filters on spec files containing "swf135".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'swf135-screenshots');
const FIGMA_IMG = 'C:\\Users\\Sarthak Rautela\\Downloads\\Group 27.png';
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/swf135-qa-report.html');

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function allScreenshots(prefix) {
  if (!fs.existsSync(SS_DIR)) return [];
  return fs.readdirSync(SS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    .map(f => ({ label: f.replace(prefix + '-', '').replace('.png', ''), src: imgB64(path.join(SS_DIR, f)) }))
    .filter(s => s.src);
}

class Swf135Reporter {
  constructor() { this._results = []; }

  onTestEnd(test, result) {
    if (!test.location.file.includes('swf135')) return;
    const errors = result.errors.map(e =>
      (e.message || String(e)).replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .split('\n').slice(0, 6).join('\n')
    );
    this._results.push({
      title: test.title,
      projectName: test.parent?.project()?.name ?? 'Unknown',
      status: result.status,
      duration: result.duration,
      errors,
    });
  }

  onEnd() { if (this._results.length) this._generate(); }

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
      if (!status)                return '<span class="badge skip">—</span>';
      if (status === 'passed')    return '<span class="badge pass">PASS</span>';
      if (status === 'failed')    return '<span class="badge fail">FAIL</span>';
      if (status === 'skipped')   return '<span class="badge skip">SKIP</span>';
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
      const anyFail = allBrowsers.some(b => matrix[tc]?.[b]?.status === 'failed');
      const cols = allBrowsers.map(b => {
        const cell = matrix[tc]?.[b];
        const tip  = cell?.errors?.length
          ? ` title="${cell.errors[0].replace(/"/g, '&quot;').substring(0, 200)}"` : '';
        return `<td${tip}>${badge(cell?.status)}</td>`;
      }).join('');
      return `<tr class="${anyFail ? 'row-fail' : ''}"><td class="tc-name">${tc}</td>${cols}</tr>`;
    }).join('\n');

    const failedList = results.filter(r => r.status === 'failed').map(r => `<li>
      <strong>${r.title}</strong> [${r.projectName}]
      ${r.errors.length ? `<br><code>${r.errors[0]}</code>` : ''}
    </li>`).join('');

    /* Screenshot groups */
    const ssCtrlHome      = allScreenshots('tc01-ctrl-home');
    const ssCtrlCat       = allScreenshots('tc03-ctrl-cat');
    const ssCtrlScoreTxt  = allScreenshots('tc08-ctrl-score-text');
    const ssCtrlHover     = allScreenshots('tc10-ctrl-hover-overlay');
    const ssCtrlMobile    = allScreenshots('tc13-ctrl-mobile-score-text');
    const ssCtrlMobileTap = allScreenshots('tc14-ctrl-mobile-tap-open');
    const ssVarHome       = allScreenshots('tc16-var-home');
    const ssVarCat        = allScreenshots('tc18-var-cat');
    const ssVarNoIcon     = allScreenshots('tc23-var-no-vicon');
    const ssVarNoHover    = allScreenshots('tc25-var-no-hover-overlay');
    const ssVarMobileIcon = allScreenshots('tc27-var-mobile-no-vicon');
    const ssVarMobileTap  = allScreenshots('tc29-var-mobile-tap');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SWF135 QA Report — Pet Insurance Gurus — Badge Overlay Removal</title>
<style>
:root{
  --teal:#007baa;--teal-l:#e6f4fa;--teal-b:#9bcfe5;
  --dark:#0d2b3e;--dark2:#1a4a6e;
  --green:#1a6b50;--green-l:#e6f4ef;--green-b:#b2dfcc;
  --red:#c0392b;--red-l:#fdf0ef;
  --amber:#b45309;--amber-l:#fffbeb;--amber-b:#fcd34d;
  --grey:#f8f9fa;--border:#dee2e6;--text:#1a202c;--muted:#6c757d;
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
p{margin-bottom:10px}ul{padding-left:20px;margin-bottom:10px}li{margin-bottom:5px}
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
.kpi.pass{background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail{background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip{background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:var(--teal)}.kpi.pass .num{color:#16a34a}.kpi.fail .num{color:var(--red)}.kpi.skip .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--teal);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:400px}
.matrix td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.matrix tr:nth-child(even) td{background:var(--grey)}
.matrix tr.row-fail td{background:#fff0ef!important}
.matrix .tc-name{font-size:13px;font-weight:500;font-family:'SF Mono','Consolas',monospace}
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
.badge.pass{background:#16a34a;color:#fff}.badge.fail{background:var(--red);color:#fff}.badge.skip{background:#adb5bd;color:#fff}
.info-card{background:var(--teal-l);border:1px solid var(--teal-b);border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:7px 12px 7px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:var(--dark2);width:240px;white-space:nowrap}
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.control{background:#f0f8ff;border-color:#005DAA}
.diff-card.variation{background:var(--teal-l);border-color:var(--teal)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--teal)}
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
  <h1>SWF135 QA Report — <span>Scoring Badge &amp; Overlay Removal</span></h1>
  <div class="sub">Automated Playwright QA for SWF135 on Pet Insurance Gurus. The variation removes the dropdown overlay, the "v" chevron icon, and hides "Pet Insurance Gurus Score" on mobile — while keeping the badge score, star, and classification unchanged across all pages.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 petinsurancegurus.com — / · /compare/ · /cat-insurance/</span>
    <span>📱 Desktop · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill teal">🐾 Pet Insurance Gurus</span>
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
    <tr><td>Test ID</td><td><strong>SWF135 / CRE-T-135</strong></td></tr>
    <tr><td>Base Test</td><td>SWF76 (CRE-T-76) — currently running as a deploy</td></tr>
    <tr><td>Test Name</td><td>Pet Insurance Gurus Scoring Badge — Overlay Removal</td></tr>
    <tr><td>Test Type</td><td>Convert.com A/B Test</td></tr>
    <tr><td>Client</td><td>Pet Insurance Gurus</td></tr>
    <tr><td>Variation class</td><td><code>cre-t-76</code> (added to body on both control and variation)</td></tr>
    <tr><td>Key CSS class</td><td><code>.cre-t-76-container</code> — injected badge wrapper</td></tr>
    <tr><td>Control</td><td>SWF76 winner — badge with overlay (Popularity / Value for Money / Reviews dropdown)</td></tr>
    <tr><td>Variation</td><td>Overlay hidden, "v" icon removed, "Pet Insurance Gurus Score" text recentered (hidden on mobile)</td></tr>
    <tr><td>Target Pages</td><td>Homepage (/) · /compare/ · /cat-insurance/</td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Mobile Chrome (Pixel 5 393×851) · Mobile Safari (iPhone 12 390×844)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Browsers</td><td>Chrome · Firefox · Edge · Safari · Mobile Chrome · Mobile Safari</td></tr>
    <tr><td>Total Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total</strong></td></tr>
  </table>
</div>

<h3>Preview URLs</h3>
<table class="url-table">
  <thead><tr><th>Type</th><th>Page</th><th>URL</th></tr></thead>
  <tbody>
    <tr><td><strong>Control</strong></td><td>Homepage</td><td><code>https://petinsurancegurus.com/?utm_campaign=Cro_mode135&amp;_conv_eforce=100052356.1000256173</code></td></tr>
    <tr><td><strong>Control</strong></td><td>/compare/</td><td><code>https://petinsurancegurus.com/compare/?utm_campaign=Cro_mode135&amp;_conv_eforce=100052356.1000256173</code></td></tr>
    <tr><td><strong>Control</strong></td><td>/cat-insurance/</td><td><code>https://petinsurancegurus.com/cat-insurance/?utm_campaign=Cro_mode135&amp;_conv_eforce=100052356.1000256173</code></td></tr>
    <tr><td><strong>Variation</strong></td><td>Homepage</td><td><code>https://petinsurancegurus.com/?utm_campaign=Cro_mode135&amp;_conv_eforce=100052356.1000256174</code></td></tr>
    <tr><td><strong>Variation</strong></td><td>/compare/</td><td><code>https://petinsurancegurus.com/compare/?utm_campaign=Cro_mode135&amp;_conv_eforce=100052356.1000256174</code></td></tr>
    <tr><td><strong>Variation</strong></td><td>/cat-insurance/</td><td><code>https://petinsurancegurus.com/cat-insurance/?utm_campaign=Cro_mode135&amp;_conv_eforce=100052356.1000256174</code></td></tr>
  </tbody>
</table>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">Left panel: Control (SWF76 winner) — badge with "Pet Insurance Gurus Score", "v" chevron, and hover overlay showing sub-scores. Right panel: Variation — overlay removed, chevron removed, "Pet Insurance Gurus Score" text recentered on desktop, hidden on mobile.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="SWF135 Figma Reference"/><div class="ss-caption">SWF135 Figma Design — Left: Control (SWF76) | Right: Variation (overlay removed)</div></div>`
  : '<p><em>Group 27.png not found in Downloads — Figma screenshot skipped.</em></p>'}

<!-- DIFF -->
<h2 id="diff">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control — SWF76 (Running Deploy)</h3>
    <ul>
      <li>✅ Badge: score (e.g. 9.6), green star, classification (Exceptional)</li>
      <li>✅ "Pet Insurance Gurus Score" label visible — desktop <em>and</em> mobile</li>
      <li>✅ "v" chevron icon visible — desktop (in label row) and mobile (in label row)</li>
      <li>✅ Desktop: hover over badge → dropdown overlay appears (Popularity / Value for Money / Reviews)</li>
      <li>✅ Mobile: tap badge → dropdown slides open with X close button</li>
      <li>✅ Cursor: <code>pointer</code> on <code>.cre-t-76-reviews</code></li>
      <li>✅ Trustpilot image hidden, body.cre-t-76 class added</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation — SWF135 Changes</h3>
    <ul>
      <li>✅ Badge score, star, classification <strong>unchanged</strong></li>
      <li>✅ Trustpilot image hidden, body.cre-t-76 class added</li>
      <li>❌ Overlay dropdown <strong>REMOVED</strong> — never shows (hover or tap)</li>
      <li>❌ "v" chevron icon <strong>REMOVED</strong> globally (desktop + mobile)</li>
      <li>✅ "Pet Insurance Gurus Score" label still visible on <strong>desktop</strong> (recentered)</li>
      <li>❌ "Pet Insurance Gurus Score" label <strong>HIDDEN on mobile</strong> (<code>display:none</code> ≤767px)</li>
      <li>❌ Cursor changed to <code>default</code> (not pointer) — no clickable overlay</li>
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers and viewports. The SWF135 variation correctly removes the dropdown overlay and "v" icon while keeping the badge scoring intact.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} runs failed. See the matrix and Failed Tests section below for details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01–03</strong> — Control badge renders on all 3 target pages</li>
  <li><strong>TC-04</strong> — Badge data accuracy: Lemonade 9.6 / Exceptional</li>
  <li><strong>TC-05</strong> — Multiple insurer badges present (≥3 on homepage)</li>
  <li><strong>TC-06</strong> — Trustpilot image hidden (display:none)</li>
  <li><strong>TC-07</strong> — body.cre-t-76 class present</li>
  <li><strong>TC-08</strong> — Desktop: "Pet Insurance Gurus Score" text visible in control</li>
  <li><strong>TC-09</strong> — Desktop: "v" chevron icon visible in control badge</li>
  <li><strong>TC-10</strong> — Desktop: Hover reveals dropdown overlay in control</li>
  <li><strong>TC-11</strong> — Desktop: Dropdown sections (Popularity / Value for Money / Reviews) present</li>
  <li><strong>TC-12</strong> — Desktop: Cursor is pointer on control badge</li>
  <li><strong>TC-13</strong> — Mobile: "Pet Insurance Gurus Score" text visible in control</li>
  <li><strong>TC-14</strong> — Mobile: Tap opens dropdown in control (cre-t-76-dropdown-active)</li>
  <li><strong>TC-15</strong> — Mobile: X close button visible in open dropdown (control)</li>
  <li><strong>TC-16–18</strong> — Variation badge renders on all 3 target pages</li>
  <li><strong>TC-19</strong> — Variation: Badge data unchanged (Lemonade 9.6 / Exceptional)</li>
  <li><strong>TC-20</strong> — Variation: Multiple insurer badges present (≥3)</li>
  <li><strong>TC-21</strong> — Variation: Trustpilot image hidden</li>
  <li><strong>TC-22</strong> — Variation: body.cre-t-76 class present</li>
  <li><strong>TC-23</strong> — Variation Desktop: "v" icon NOT visible (all instances display:none)</li>
  <li><strong>TC-24</strong> — Variation Desktop: "Pet Insurance Gurus Score" text IS visible</li>
  <li><strong>TC-25</strong> — Variation Desktop: Hover does NOT show overlay (display:none)</li>
  <li><strong>TC-26</strong> — Variation Desktop: Cursor is default (not pointer)</li>
  <li><strong>TC-27</strong> — Variation Mobile: "v" icon NOT visible</li>
  <li><strong>TC-28</strong> — Variation Mobile: "Pet Insurance Gurus Score" text NOT visible (display:none)</li>
  <li><strong>TC-29</strong> — Variation Mobile: Tap does NOT open dropdown</li>
  <li><strong>TC-30</strong> — Variation: No badge duplication per insurer card</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Desktop-only TCs skip on mobile browsers; mobile-only TCs skip on desktop browsers. SKIP = not applicable for that browser type.</div>
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
<h2 id="errors">Failed Test Details</h2>
<div class="error-list"><ul>${failedList}</ul></div>
` : ''}

<!-- SCREENSHOTS -->
<h2 id="screenshots">Visual Screenshots</h2>
<div class="section-note">Screenshots captured during the Playwright run against live Convert.com preview URLs.</div>

<h3>TC-01 — Control: Badge on Homepage</h3>
${ssSection(ssCtrlHome, 'Control Homepage Badge')}

<h3>TC-03 — Control: Badge on /cat-insurance/</h3>
${ssSection(ssCtrlCat, 'Control /cat-insurance/')}

<h3>TC-08 — Control Desktop: "Pet Insurance Gurus Score" Text</h3>
${ssSection(ssCtrlScoreTxt, 'Control Score Text')}

<h3>TC-10 — Control Desktop: Hover Dropdown Overlay</h3>
${ssSection(ssCtrlHover, 'Control Hover Overlay')}

<h3>TC-13 — Control Mobile: Score Text Visible</h3>
${ssSection(ssCtrlMobile, 'Control Mobile Score Text')}

<h3>TC-14 — Control Mobile: Tapped Dropdown Open</h3>
${ssSection(ssCtrlMobileTap, 'Control Mobile Tap Open')}

<h3>TC-16 — Variation: Badge on Homepage</h3>
${ssSection(ssVarHome, 'Variation Homepage Badge')}

<h3>TC-18 — Variation: Badge on /cat-insurance/</h3>
${ssSection(ssVarCat, 'Variation /cat-insurance/')}

<h3>TC-23 — Variation Desktop: No "v" Icon</h3>
${ssSection(ssVarNoIcon, 'Variation No V Icon')}

<h3>TC-25 — Variation Desktop: Hover — No Overlay</h3>
${ssSection(ssVarNoHover, 'Variation No Hover Overlay')}

<h3>TC-27 — Variation Mobile: No "v" Icon</h3>
${ssSection(ssVarMobileIcon, 'Variation Mobile No V Icon')}

<h3>TC-29 — Variation Mobile: Tap — No Dropdown</h3>
${ssSection(ssVarMobileTap, 'Variation Mobile No Dropdown')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigate to live Convert.com preview URLs — no local JS/CSS injection. The test code (vB.js/vB.css) is served by the Convert.com platform via <code>_conv_eforce</code>.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Badge presence (TC-01–03, 16–18)</strong>: Used <code>page.waitForSelector('.cre-t-76-container')</code> with 35s timeout to handle async setInterval injection.</li>
  <li><strong>Badge data (TC-04, 19)</strong>: Iterated all <code>.cre-t-76-container</code> elements, read <code>.cre-t-76-total</code> innerText, and verified classification.</li>
  <li><strong>Trustpilot hidden (TC-06, 21)</strong>: <code>getComputedStyle(el).display === 'none'</code> on all <code>#comparison-section .trustpilot-image</code>.</li>
  <li><strong>Hover overlay (TC-10, 25)</strong>: Called <code>page.locator('.cre-t-76-reviews').hover()</code>, then read <code>getComputedStyle('.cre-t-76-review-dropdown').display</code>.</li>
  <li><strong>Dropdown sections (TC-11)</strong>: After hover, read <code>.cre-t-76-dropdown-info1-text</code> from each of the 3 content divs.</li>
  <li><strong>Cursor (TC-12, 26)</strong>: <code>getComputedStyle('.cre-t-76-reviews').cursor</code> — expects "pointer" (control) or "default" (variation).</li>
  <li><strong>Mobile tap (TC-14, 29)</strong>: Used <code>element.tap()</code> then checked <code>classList.contains('cre-t-76-dropdown-active')</code> and <code>getComputedStyle('.cre-t-76-review-dropdown').display</code>.</li>
  <li><strong>Deduplication (TC-30)</strong>: Waited 2s for all setInterval ticks, then verified no <code>[data-unique]</code> list item has more than 1 <code>.cre-t-76-container</code>.</li>
  <li><strong>Desktop/Mobile filtering</strong>: Tests use <code>testInfo.project.name.startsWith('Mobile')</code> to skip inapplicable assertions.</li>
</ul>

<div class="footer">
  SWF135 QA Report · ${dateStr} · Playwright Automated Tests · petinsurancegurus.com<br>
  QA by sarthak@brillmark.com · Spec: swf135-badge-overlay.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nSWF135 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = Swf135Reporter;
