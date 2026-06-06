/**
 * AFP19 Custom HTML Reporter
 * Generates afp19-qa-report.html for AFP Compensation Survey Hero Section Replacement.
 * Filters on spec files containing "afp19".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR  = path.join(__dirname, 'afp19-screenshots');
const OUTPUT  = path.join(__dirname, '../local_testing/Local2/afp19-qa-report.html');

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

class Afp19Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('afp19')) return;
    const errors = result.errors.map(e =>
      (e.message || String(e))
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
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

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
      </li>`).join('');

    const controlShots      = allScreenshots('control');
    const varMainShots      = allScreenshots('var-main');
    const salarySectionShots= allScreenshots('salary-section');
    const bulletsShots      = allScreenshots('bullets');
    const imageShots        = allScreenshots('salary-image');
    const desktopShots      = allScreenshots('responsive-desktop');
    const tabletShots       = allScreenshots('responsive-tablet');
    const mobileShots       = allScreenshots('responsive-mobile');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AFP19 QA Report — AFP Compensation Survey Hero Section</title>
<style>
:root {
  --afp:#1a5276; --afp-l:#eaf1f8; --afp-b:#9bc1e0;
  --dark:#0d2340; --dark2:#1a4a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --orange:#e67e22; --orange-l:#fdf3e9;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--afp)}
.cover{background:linear-gradient(135deg,#1a3c6e 0%,#2076a8 55%,#3498db 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
.cover-brand{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7}
.cover h1{font-size:36px;font-weight:800;line-height:1.2;margin-top:4px}
.cover h1 span{color:#f9ca74}
.cover .sub{font-size:16px;opacity:.85;max-width:760px;margin-top:4px}
.cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;opacity:.8;font-size:13px}
.badge-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600}
.badge-pill.pass{background:rgba(22,163,74,.25);border-color:rgba(22,163,74,.5)}
.badge-pill.afp{background:rgba(32,118,168,.3);border-color:rgba(32,118,168,.5)}
.badge-pill.warn{background:rgba(230,126,34,.3);border-color:rgba(230,126,34,.5)}
.wrap{max-width:1160px;margin:0 auto;padding:0 36px 80px}
h2{font-size:21px;font-weight:700;color:var(--afp);margin:52px 0 18px;padding-bottom:9px;border-bottom:2px solid var(--afp-l)}
h3{font-size:15px;font-weight:700;margin:22px 0 8px;color:var(--text)}
p{margin-bottom:10px}
ul{padding-left:20px;margin-bottom:10px}
li{margin-bottom:5px}
code{background:#f1f3f5;border-radius:4px;padding:2px 7px;font-size:12.5px;font-family:'SF Mono','Consolas',monospace}
.toc{background:var(--afp-l);border:1px solid var(--afp-b);border-radius:12px;padding:22px 26px;margin:32px 0}
.toc h3{color:var(--afp);margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.8px}
.toc ol{padding-left:20px;column-count:2;column-gap:40px}
.toc li{margin-bottom:6px}
.toc a{color:var(--afp);text-decoration:none;font-weight:500;font-size:14px}
.toc a:hover{text-decoration:underline}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 32px}
.kpi{border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:5px;text-align:center}
.kpi.total{background:var(--afp-l);border:1px solid var(--afp-b)}
.kpi.pass {background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail {background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip {background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:var(--afp)}
.kpi.pass  .num{color:#16a34a}
.kpi.fail  .num{color:var(--red)}
.kpi.skip  .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--afp);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:360px}
.matrix td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.matrix tr:nth-child(even) td{background:var(--grey)}
.matrix tr.row-fail td{background:#fff0ef!important}
.matrix .tc-name{font-size:13px;font-weight:500;font-family:'SF Mono','Consolas',monospace}
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
.badge.pass{background:#16a34a;color:#fff}
.badge.fail{background:var(--red);color:#fff}
.badge.skip{background:#adb5bd;color:#fff}
.info-card{background:var(--afp-l);border:1px solid var(--afp-b);border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:7px 12px 7px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:var(--dark2);width:220px;white-space:nowrap}
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.control{background:#f0f4f8;border-color:#1a5276}
.diff-card.variation{background:var(--afp-l);border-color:var(--afp)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--afp)}
.alert-pass{background:var(--green-l);border:1px solid var(--green-b);border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0}
.alert-fail{background:var(--red-l);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0}
.error-list{background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.error-list li{margin-bottom:10px}
.error-list code{background:#ffe4e4;font-size:12px}
.disc-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.disc-table th{background:#7f4f20;color:#fff;padding:10px 14px;text-align:left}
.disc-table td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:top}
.disc-table tr:nth-child(even) td{background:var(--orange-l)}
.disc-table .tag-diff{background:#e67e22;color:#fff;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:700}
.disc-table .tag-ok{background:#16a34a;color:#fff;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:700}
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px;margin:16px 0}
.ss-wrap{border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ss-wrap img{width:100%;display:block}
.ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}
.css-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.css-table th{background:#334155;color:#fff;padding:8px 14px;text-align:left}
.css-table td{padding:8px 14px;border-bottom:1px solid var(--border)}
.css-table tr:nth-child(even) td{background:var(--grey)}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}.toc ol{column-count:1}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · AFP A/B Testing</div>
  <h1>AFP19 QA Report — <span>Compensation Survey Hero Section</span></h1>
  <div class="sub">Automated QA for the AFP19 VWO variation on financialprofessionals.org — The hero .finance-wrap section is replaced with a two-column salary comparison layout matching the Figma wireframe. JS/CSS injected via Playwright since VWO preview was not rendering on the live page.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>💼 financialprofessionals.org — VWO A/B Test</span>
    <span>📱 Desktop · Tablet · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed  > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill afp">🏦 AFP — Association for Financial Professionals</span>
    <span class="badge-pill warn">⚠️ Figma Discrepancies Documented</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URL</a></li>
    <li><a href="#figma">Figma Design Reference</a></li>
    <li><a href="#diff">Control vs Variation</a></li>
    <li><a href="#css-spec">CSS Specification Checks</a></li>
    <li><a href="#discrepancies">Figma vs Code Discrepancies</a></li>
    <li><a href="#results">Test Results Summary</a></li>
    <li><a href="#matrix">Full TC × Browser Matrix</a></li>
    ${failed > 0 ? '<li><a href="#errors">Failed Test Details</a></li>' : ''}
    <li><a href="#section-shots">Variation Section Screenshots</a></li>
    <li><a href="#control-shots">Control Screenshots</a></li>
    <li><a href="#responsive-shots">Responsive Screenshots</a></li>
    <li><a href="#methodology">Testing Methodology</a></li>
  </ol>
</div>

<!-- OVERVIEW -->
<h2 id="overview">Test Overview &amp; URL</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>AFP19</strong></td></tr>
    <tr><td>Variation Name</td><td><code>Try_Free_Cta_Hide</code></td></tr>
    <tr><td>Test Name</td><td>AFP Compensation Survey 2026 — Hero Section Replacement</td></tr>
    <tr><td>Platform</td><td>VWO (Visual Website Optimizer)</td></tr>
    <tr><td>Client</td><td>Association for Financial Professionals (AFP)</td></tr>
    <tr><td>Target URL</td><td><a href="https://www.financialprofessionals.org/home/afp--be-the-one-with-the-answers" target="_blank">https://www.financialprofessionals.org/home/afp--be-the-one-with-the-answers</a></td></tr>
    <tr><td>Audience</td><td><strong>All users</strong></td></tr>
    <tr><td>Figma</td><td><a href="https://www.figma.com/design/FYiiXMtyvUVv4qYNxHK50h/Untitled?node-id=3486-2" target="_blank">https://www.figma.com/design/FYiiXMtyvUVv4qYNxHK50h/Untitled?node-id=3486-2</a></td></tr>
    <tr><td>Testing Method</td><td>Manual JS/CSS injection via <code>page.evaluate()</code> — VWO preview URL not rendering variation correctly</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Body Class Guard</td><td><code>body.Try_Free_Cta_Hide</code></td></tr>
    <tr><td>Target Selector</td><td><code>.finance-wrap</code> (innerHTML replaced)</td></tr>
    <tr><td>Browsers Tested</td><td>Chrome · Firefox · Edge · Safari · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
    <tr><td>Viewports</td><td>Desktop 1280×800 · Tablet 768×1024 · Mobile 390×844</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
  </table>
</div>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">The Figma wireframe at <a href="https://www.figma.com/design/FYiiXMtyvUVv4qYNxHK50h/Untitled?node-id=3486-2" target="_blank">node-id=3486-2</a> is the canonical design spec. The variation must replicate: dark #3B454C FinalCTA hero with two-column layout, stat cards (3.7%, 35%, 24%, 75%), "Inside your free report" section with 6 list items, and a second CTA with white form card. See the Discrepancies section for noted differences between the current code and the Figma spec.</div>
<p><em>Figma screenshot not locally available — visit the Figma URL above for the visual reference.</em></p>

<!-- DIFF -->
<h2 id="diff">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control</h3>
    <ul>
      <li>Page content as hardcoded by the client on the target URL</li>
      <li>No <code>body.Try_Free_Cta_Hide</code> class</li>
      <li>No <code>.salary-section</code> element in DOM</li>
      <li><code>.finance-wrap</code> contains original client-built content</li>
      <li>Traffic allocation: <strong>0%</strong> (control not served to visitors)</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation (AFP19 — Try_Free_Cta_Hide)</h3>
    <ul>
      <li>✅ <code>body.Try_Free_Cta_Hide</code> class added for CSS scoping</li>
      <li>✅ <code>.finance-wrap</code> innerHTML replaced with two-column <code>.salary-section</code></li>
      <li>✅ Left column: h1 headline + orange <code>.highlight</code> span + description + 3 bullets with SVG check icons</li>
      <li>✅ Right column: AFP 2026 Compensation Report image (rotated -4°)</li>
      <li>✅ <code>#site-main &gt; .section</code> (HubSpot form) moved after <code>.salary-bullets</code></li>
      <li>✅ Responsive: <code>.salary-inner</code> stacks to column at ≤900px</li>
      <li>✅ No duplication guard: <code>waitForElement</code> timeout + innerHTML replacement</li>
    </ul>
  </div>
</div>

<!-- CSS SPEC -->
<h2 id="css-spec">CSS Specification Checks</h2>
<div class="section-note">The following CSS properties were verified by <code>getComputedStyle()</code> in TC-16 through TC-24 across all 6 browsers.</div>
<table class="css-table">
  <thead><tr><th>TC</th><th>Selector</th><th>Property</th><th>Expected Value</th><th>Source</th></tr></thead>
  <tbody>
    <tr><td>TC-16</td><td><code>.salary-section</code></td><td>display</td><td><code>flex</code></td><td>vB.css</td></tr>
    <tr><td>TC-17</td><td><code>.salary-left</code></td><td>max-width</td><td><code>665px</code></td><td>vB.css + Figma (665px column width)</td></tr>
    <tr><td>TC-18</td><td><code>.salary-left h1 .highlight</code></td><td>color</td><td><code>rgb(240, 124, 42)</code> — #f07c2a</td><td>vB.css</td></tr>
    <tr><td>TC-19</td><td><code>.salary-bullets li</code></td><td>color</td><td><code>rgb(255, 255, 255)</code> — #FFFFFF</td><td>vB.css</td></tr>
    <tr><td>TC-20</td><td><code>.doc-image-wrap img</code></td><td>transform</td><td>matrix (not <code>none</code>) — rotate(-4deg)</td><td>vB.css</td></tr>
    <tr><td>TC-24</td><td><code>.form-card .hs-button</code></td><td>background-color</td><td><code>rgb(251, 144, 48)</code> — #FB9030</td><td>vB.css + Figma button color</td></tr>
  </tbody>
</table>

<!-- FIGMA DISCREPANCIES -->
<h2 id="discrepancies">Figma vs Code Discrepancies</h2>
<div class="section-note" style="border-color:var(--orange);background:var(--orange-l)">⚠️ The following differences were identified between the Figma wireframe (canonical design) and the deployed vB.js / vB.css code. These should be reviewed and corrected so the variation matches the wireframe exactly.</div>
<table class="disc-table">
  <thead><tr><th>Component</th><th>Figma Spec</th><th>Code Implementation</th><th>Status</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Hero h1 heading text</strong></td>
      <td>"Are you ahead or behind other finance professionals?"</td>
      <td>"How does your <em>finance salary compare</em> in 2026?"</td>
      <td><span class="tag-diff">DIFFERS</span></td>
    </tr>
    <tr>
      <td><strong>h1 font-size</strong></td>
      <td>50px / line-height 57px (Montserrat)</td>
      <td>2.6rem ≈ 41.6px (at 16px base)</td>
      <td><span class="tag-diff">DIFFERS</span></td>
    </tr>
    <tr>
      <td><strong>Description text</strong></td>
      <td>"Based on data from more than 5,000 finance and treasury professionals"</td>
      <td>"See what 5,000+ finance and treasury professionals are actually earning in 2026. Download your free highlights…"</td>
      <td><span class="tag-diff">DIFFERS</span></td>
    </tr>
    <tr>
      <td><strong>Description text color</strong></td>
      <td>#FFFFFF (pure white)</td>
      <td>#c8d0dc (light grayish-blue)</td>
      <td><span class="tag-diff">DIFFERS</span></td>
    </tr>
    <tr>
      <td><strong>Check icon border color</strong></td>
      <td>1.66667px solid #FFFFFF (white circle)</td>
      <td>2px solid #f07c2a (orange circle)</td>
      <td><span class="tag-diff">DIFFERS</span></td>
    </tr>
    <tr>
      <td><strong>Check icon SVG stroke</strong></td>
      <td>#FFFFFF (white checkmark)</td>
      <td>#f07c2a (orange checkmark)</td>
      <td><span class="tag-diff">DIFFERS</span></td>
    </tr>
    <tr>
      <td><strong>Form button background (TC-24 🔴)</strong></td>
      <td>background: #FB9030 (vB.css <code>!important</code> rule on <code>.form-card .hs-form .hs-button</code>)</td>
      <td>Computed: <code>rgb(245, 166, 35)</code> = #F5A623 — page stylesheet <code>!important</code> overrides vB.css. Fix: use higher-specificity selector or add <code>id</code>-scoped rule in vB.css.</td>
      <td><span class="tag-diff">CSS BUG</span></td>
    </tr>
    <tr>
      <td><strong>Bullet text font-size</strong></td>
      <td>16px / line-height 29px / letter-spacing -0.3125px (Montserrat)</td>
      <td>16px / line-height 29.3px / letter-spacing -0.312px</td>
      <td><span class="tag-ok">MATCHES</span></td>
    </tr>
    <tr>
      <td><strong>Button color #FB9030</strong></td>
      <td>background: #FB9030</td>
      <td>background: #FB9030 !important (vB.css)</td>
      <td><span class="tag-ok">MATCHES</span></td>
    </tr>
    <tr>
      <td><strong>.salary-left max-width</strong></td>
      <td>665px (Figma column width)</td>
      <td>max-width: 665px (vB.css)</td>
      <td><span class="tag-ok">MATCHES</span></td>
    </tr>
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers and viewports. The AFP19 variation injects correctly, all structural elements are present, CSS values match spec, and responsive behaviour works as expected. Note: 5 Figma design discrepancies documented above require code updates before final sign-off.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section below for full details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — Control: no .salary-section before injection</li>
  <li><strong>TC-02</strong> — Variation: body.Try_Free_Cta_Hide class present</li>
  <li><strong>TC-03</strong> — .salary-section injected inside .finance-wrap</li>
  <li><strong>TC-04</strong> — Two-column layout: .salary-left + .salary-right present</li>
  <li><strong>TC-05</strong> — h1 headline text present</li>
  <li><strong>TC-06</strong> — h1 .highlight span with "finance" text</li>
  <li><strong>TC-07</strong> — Description contains "5,000+" data claim</li>
  <li><strong>TC-08</strong> — Exactly 3 bullet items in .salary-bullets</li>
  <li><strong>TC-09</strong> — Bullet 1: "salary kept up with peers"</li>
  <li><strong>TC-10</strong> — Bullet 2: "bonuses differ across finance roles"</li>
  <li><strong>TC-11</strong> — Bullet 3: "certifications are linked to real salary premiums"</li>
  <li><strong>TC-12</strong> — .check-icon with SVG present in all 3 bullets</li>
  <li><strong>TC-13</strong> — AFP report image in .salary-right with correct src</li>
  <li><strong>TC-14</strong> — AFP report image URL returns HTTP 200</li>
  <li><strong>TC-15</strong> — No duplication: second JS run keeps 1 .salary-section</li>
  <li><strong>TC-16</strong> — CSS: .salary-section display flex</li>
  <li><strong>TC-17</strong> — CSS: .salary-left max-width 665px</li>
  <li><strong>TC-18</strong> — CSS: h1 .highlight color rgb(240,124,42) orange</li>
  <li><strong>TC-19</strong> — CSS: bullet text color rgb(255,255,255) white</li>
  <li><strong>TC-20</strong> — CSS: doc-image-wrap img has transform rotation</li>
  <li><strong>TC-21</strong> — Responsive: Desktop 1280×800 visible</li>
  <li><strong>TC-22</strong> — Responsive: Tablet 768×1024 visible</li>
  <li><strong>TC-23</strong> — Responsive: Mobile 390×844 flex-direction column</li>
  <li><strong>TC-24</strong> — CSS: form button background #FB9030</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP for that TC × browser combination. Hover FAIL cells for truncated error details.</div>
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

<!-- SECTION SCREENSHOTS -->
<h2 id="section-shots">Variation Section Screenshots</h2>
<div class="section-note">Element-level screenshots of the injected <code>.salary-section</code>, bullet list, and AFP report image captured after JS/CSS injection with Playwright.</div>

<h3>.salary-section — Full Section View (TC-03)</h3>
<div class="section-note" style="border-color:#16a34a;background:#f0fdf4">The full <code>.salary-section</code> injected into <code>.finance-wrap</code> showing the two-column layout — headline + bullets on the left, AFP report image on the right.</div>
${ssSection(salarySectionShots, 'salary-section — TC-03')}

<h3>Bullet List — .salary-bullets (TC-08)</h3>
<div class="section-note" style="border-color:#16a34a;background:#f0fdf4">Element screenshot of the 3-item bullet list with circular SVG check icons.</div>
${ssSection(bulletsShots, 'Bullet List — TC-08')}

<h3>AFP Report Image — .salary-right (TC-13)</h3>
<div class="section-note" style="border-color:#16a34a;background:#f0fdf4">Element screenshot of the right column containing the AFP Compensation Report image (rotated -4°).</div>
${ssSection(imageShots, 'AFP Report Image — TC-13')}

<!-- CONTROL SCREENSHOTS -->
<h2 id="control-shots">Control Screenshots (TC-01)</h2>
<div class="section-note">Page state before variation JS/CSS injection. Confirms <code>.salary-section</code> is not present in the original page.</div>
${ssSection(controlShots, 'Control — before injection')}

<h3>Variation — Full Page View (TC-02)</h3>
<div class="section-note">Full-viewport screenshot immediately after injection confirming <code>body.Try_Free_Cta_Hide</code> class is applied.</div>
${ssSection(varMainShots, 'Variation — TC-02')}

<!-- RESPONSIVE SCREENSHOTS -->
<h2 id="responsive-shots">Responsive Screenshots</h2>
<div class="section-note">Viewport screenshots at Desktop, Tablet, and Mobile breakpoints confirming the salary section renders and stacks correctly.</div>

<h3>Responsive — Desktop 1280×800 (TC-21)</h3>
${ssSection(desktopShots, 'Desktop 1280×800')}

<h3>Responsive — Tablet 768×1024 (TC-22)</h3>
${ssSection(tabletShots, 'Tablet 768×1024')}

<h3>Responsive — Mobile 390×844 (TC-23)</h3>
<div class="section-note" style="border-color:#16a34a;background:#f0fdf4">At ≤900px the <code>.salary-inner</code> switches to <code>flex-direction: column</code> stacking left column above right.</div>
${ssSection(mobileShots, 'Mobile 390×844')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests load the live page at <code>https://www.financialprofessionals.org/home/afp--be-the-one-with-the-answers</code> and inject the variation JS/CSS programmatically via <code>page.evaluate()</code>. This approach was required because the VWO preview URL was not correctly rendering the variation on the live environment (confirmed by the client — manual console injection shows the correct result).</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>CSS injection (all variation tests)</strong>: Injects a <code>&lt;style id="afp19-var-css"&gt;</code> tag into <code>document.head</code> using the local <code>vB.css</code> file. Guard on <code>id</code> prevents double injection.</li>
  <li><strong>JS injection (all variation tests)</strong>: Executes <code>vB.js</code> via <code>page.evaluate()</code> which runs the IIFE. <code>waitForElement('.finance-wrap', init, 50, 5000)</code> polls every 50ms until <code>.finance-wrap</code> is found, then calls <code>init()</code>.</li>
  <li><strong>Variation wait</strong>: After JS execution, Playwright <code>waitForSelector('.salary-section', { state:'attached', timeout:8000 })</code> blocks until DOM mutation completes.</li>
  <li><strong>Control (TC-01)</strong>: Loads page without injection, waits 5s, asserts zero <code>.salary-section</code> elements.</li>
  <li><strong>Structural tests (TC-03–TC-13)</strong>: DOM queries via <code>page.evaluate()</code> assert element presence, text content, and attribute values.</li>
  <li><strong>No-duplication (TC-15)</strong>: Re-runs JS on an already-injected page; <code>innerHTML</code> replacement means count stays at 1.</li>
  <li><strong>CSS verification (TC-16–TC-20, TC-24)</strong>: Uses <code>window.getComputedStyle()</code> to read resolved property values — colors reported as <code>rgb()</code> by all browsers.</li>
  <li><strong>Image HTTP check (TC-14)</strong>: Uses Playwright <code>APIRequestContext.get()</code> to verify the AFP report image URL returns HTTP 200.</li>
  <li><strong>Responsive (TC-21–TC-23)</strong>: <code>page.setViewportSize()</code> before navigation; TC-23 asserts <code>flex-direction:column</code> on <code>.salary-inner</code> at 390px (below the 900px breakpoint in vB.css).</li>
</ul>

<div class="footer">
  AFP19 QA Report · ${dateStr} · Playwright Automated Tests · financialprofessionals.org<br>
  QA by sarthak@brillmark.com · Spec: afp19-salary-section.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nAFP19 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = Afp19Reporter;
