/**
 * AFP13 Custom HTML Reporter
 * Generates afp13-qa-report.html with SIC-19 style:
 *   — per-test rows with inline screenshots
 *   — 4-browser desktop matrix
 *   — Figma reference embedded
 *   — Control vs Variation screenshot comparison
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'afp13-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/AFP13.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/afp13-qa-report.html');

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function ssB64ForBrowser(prefix, browser) {
  if (!fs.existsSync(SS_DIR)) return '';
  const slug = browser.toLowerCase().replace(/\s+/g, '-');
  const f    = path.join(SS_DIR, `${prefix}-${slug}.png`);
  return fs.existsSync(f) ? imgB64(f) : '';
}

class Afp13Reporter {
  constructor() {
    this._results = [];
    this._started = Date.now();
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('afp13')) return;

    const errors = result.errors.map(e =>
      (e.message || String(e)).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    );
    const attachments = (result.attachments || [])
      .filter(a => a.contentType === 'image/png' && a.path && fs.existsSync(a.path))
      .map(a => ({ name: a.name, src: imgB64(a.path) }));

    this._results.push({
      title:       test.title,
      projectName: test.parent?.project()?.name ?? 'Unknown',
      status:      result.status,
      duration:    result.duration,
      errors,
      attachments,
    });
  }

  onEnd() {
    if (!this._results.length) return;
    this._generate();
  }

  _generate() {
    const results     = this._results;
    const allBrowsers = [...new Set(results.map(r => r.projectName))]
      .filter(b => !b.toLowerCase().includes('mobile'))
      .sort();
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

    const figmaB64  = imgB64(FIGMA_IMG);
    const dateStr   = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
    const bugTCs    = allTCs.filter(tc => tc.includes('[BUG]'));

    function badge(status) {
      if (!status)              return '<span class="badge skip">—</span>';
      if (status === 'passed')  return '<span class="badge pass">PASS</span>';
      if (status === 'failed')  return '<span class="badge fail">FAIL</span>';
      if (status === 'skipped') return '<span class="badge skip">SKIP</span>';
      return `<span class="badge skip">${status}</span>`;
    }

    function durationStr(ms) {
      if (!ms && ms !== 0) return '—';
      return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
    }

    const detailRows = allTCs.map((tc, idx) => {
      const isBug    = tc.includes('[BUG]');
      const hasFail  = Object.values(matrix[tc] || {}).some(r => r.status === 'failed');
      const rowClass = isBug ? 'row-bug' : (hasFail ? 'row-fail' : '');

      const browserCells = allBrowsers.map(b => {
        const r = matrix[tc]?.[b];
        return `<td class="cell-center">${badge(r?.status)}<br><span class="dur">${durationStr(r?.duration)}</span></td>`;
      }).join('');

      let errorHtml = '';
      for (const b of allBrowsers) {
        const r = matrix[tc]?.[b];
        if (r?.errors?.length) {
          errorHtml += `<div class="err-block"><strong>${b}:</strong><pre>${r.errors.join('\n\n')}</pre></div>`;
        }
      }

      let ssHtml = '';
      for (const b of allBrowsers) {
        const r = matrix[tc]?.[b];
        if (r?.attachments?.length) {
          r.attachments.forEach(a => {
            if (a.src) ssHtml += `<div class="ss-wrap"><img src="${a.src}" alt="${a.name}"/><div class="ss-caption">${tc} · ${b} · ${a.name}</div></div>`;
          });
        }
      }

      // Pull from screenshot files for screenshot TCs
      if (tc.includes('TC-AFP13-25') || tc.includes('TC-AFP13-26')) {
        const prefix = tc.includes('25') ? 'variation-desktop' : 'control-desktop';
        allBrowsers.forEach(b => {
          const slug = b.toLowerCase().replace(/\s+/g, '-');
          const src  = ssB64ForBrowser(prefix.replace('-desktop', ''), b);
          if (src && !ssHtml.includes(slug)) {
            ssHtml += `<div class="ss-wrap"><img src="${src}" alt="${prefix} ${b}"/><div class="ss-caption">${prefix.replace('-desktop','')} · ${b.replace(' Desktop','')}</div></div>`;
          }
        });
      }

      const hasDetail = errorHtml || ssHtml;

      return `
<tr class="${rowClass}" onclick="toggleDetail('d${idx}')" style="cursor:pointer">
  <td class="tc-name">${isBug ? '<span class="bug-badge">BUG</span> ' : ''}${tc}</td>
  ${browserCells}
  <td class="cell-center"><span class="toggle-icon" id="icon${idx}">▶</span></td>
</tr>
${hasDetail ? `<tr class="detail-row" id="d${idx}" style="display:none">
  <td colspan="${allBrowsers.length + 2}" class="detail-cell">
    ${errorHtml ? `<div class="err-section"><strong>Errors:</strong>${errorHtml}</div>` : ''}
    ${ssHtml    ? `<div class="ss-section">${ssHtml}</div>` : ''}
  </td>
</tr>` : ''}`;
    }).join('\n');

    const browserHeaders = allBrowsers.map(b =>
      `<th>${b.replace(' Desktop', '').replace('Mobile ', '')}</th>`
    ).join('');

    const controlShots  = allBrowsers.map(b => ({ browser: b, src: ssB64ForBrowser('control-desktop', b) })).filter(s => s.src);
    const varShots      = allBrowsers.map(b => ({ browser: b, src: ssB64ForBrowser('variation-desktop', b) })).filter(s => s.src);

    function ssGrid(shots, caption) {
      if (!shots.length) return '<p><em>No screenshots captured.</em></p>';
      return `<div class="ss-row">${shots.map(s => `
        <div class="ss-wrap">
          <img src="${s.src}" alt="${caption} — ${s.browser}"/>
          <div class="ss-caption">${caption} · ${s.browser.replace(' Desktop', '')}</div>
        </div>`).join('')}</div>`;
    }

    const bugSummary = bugTCs.length ? `
<h2 id="bugs">Bugs Found (${bugTCs.length})</h2>
<div class="section-intro">These test cases are expected to FAIL — they expose code defects found during Figma vs code comparison.</div>
<table>
  <thead><tr><th>Bug #</th><th>Test Case</th><th>Expected (Figma/Spec)</th><th>Actual (Code)</th><th>Severity</th></tr></thead>
  <tbody>
    ${bugTCs.map((tc, i) => `<tr class="row-fail"><td><strong>BUG-0${i + 1}</strong></td><td class="tc-name">${tc}</td><td>—</td><td>—</td><td><span class="badge fail">HIGH</span></td></tr>`).join('')}
  </tbody>
</table>` : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AFP13 QA Report — ${dateStr}</title>
<style>
  :root{
    --yellow:#FCD426;--yellow-dark:#c4a300;--yellow-light:#fffbe6;
    --green:#1a6b50;--green-light:#e6f4ef;
    --red:#c0392b;--red-light:#fdf0ef;
    --blue:#1a5276;--blue-light:#eaf2fb;
    --navy:#0d1b2a;--navy-mid:#1b3050;
    --grey:#f8f9fa;--border:#dee2e6;--text:#212529;--muted:#6c757d;
    --purple:#6f42c1;--purple-light:#f3f0ff;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.6}
  a{color:var(--navy-mid)}

  .cover{background:linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 60%,#2a5080 100%);color:#fff;padding:56px 48px 44px;display:flex;flex-direction:column;gap:12px}
  .cover-logo{font-size:22px;font-weight:800;opacity:.9}
  .cover h1{font-size:38px;font-weight:800;line-height:1.15;margin-top:6px}
  .cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:14px;opacity:.85;font-size:14px}
  .badge-cover{display:inline-block;background:var(--yellow);color:var(--navy);border-radius:20px;padding:4px 16px;font-size:13px;font-weight:700;margin-top:8px}

  .container{max-width:1200px;margin:0 auto;padding:0 32px 64px}
  h2{font-size:21px;font-weight:700;color:var(--navy-mid);margin:44px 0 14px;padding-bottom:8px;border-bottom:3px solid var(--yellow)}
  h3{font-size:16px;font-weight:700;margin:22px 0 8px;color:#333}
  p{margin-bottom:10px}
  code{background:#f1f3f5;border-radius:4px;padding:1px 6px;font-size:13px;font-family:'SF Mono',Consolas,monospace}
  pre{background:#1e1e1e;color:#d4d4d4;border-radius:8px;padding:12px 16px;font-size:12px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;margin:8px 0}

  .kpi-row{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0}
  .kpi{flex:1;min-width:150px;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:4px}
  .kpi.pass-kpi{background:var(--green-light);border:1px solid #b2dfcc}
  .kpi.fail-kpi{background:var(--red-light);border:1px solid #f5c6cb}
  .kpi.skip-kpi{background:#f5f5f5;border:1px solid #ccc}
  .kpi.total-kpi{background:var(--yellow-light);border:1px solid #f5d96c}
  .kpi-num{font-size:36px;font-weight:800}
  .kpi.pass-kpi .kpi-num{color:var(--green)}
  .kpi.fail-kpi .kpi-num{color:var(--red)}
  .kpi.skip-kpi .kpi-num{color:#666}
  .kpi.total-kpi .kpi-num{color:var(--yellow-dark)}
  .kpi-label{font-size:13px;color:var(--muted);font-weight:500}

  table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
  th{background:var(--navy-mid);color:#fff;padding:10px 12px;text-align:left;font-weight:600;white-space:nowrap}
  th:first-child{min-width:340px}
  td{padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
  tr:nth-child(even) td{background:var(--grey)}
  tr.row-fail td{background:#fff5f5!important}
  tr.row-bug td{background:var(--purple-light)!important}
  tr.detail-row td{background:#fafafa!important;padding:16px 20px}
  .tc-name{font-size:12px;font-weight:500;font-family:'SF Mono',Consolas,monospace}
  .cell-center{text-align:center}
  .dur{font-size:10px;color:var(--muted);display:block;margin-top:2px}

  .badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
  .badge.pass{background:#1a6b50;color:#fff}
  .badge.fail{background:#c0392b;color:#fff}
  .badge.skip{background:#adb5bd;color:#fff}
  .bug-badge{display:inline-block;background:var(--purple);color:#fff;border-radius:4px;font-size:10px;font-weight:700;padding:1px 6px;margin-right:4px;vertical-align:middle}

  .section-intro{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted)}

  .diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
  .diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
  .diff-card.control{background:#f0f4ff;border-color:#1a5276}
  .diff-card.variation{background:var(--yellow-light);border-color:var(--yellow-dark)}
  .diff-card h3{margin-top:0;font-size:15px}
  .diff-card ul{padding-left:18px;margin-top:8px;font-size:14px;line-height:1.8}

  .info-card{background:var(--blue-light);border:1px solid #9bc1e0;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
  .info-card table{margin:0}
  .info-card td{background:transparent!important;border:none;padding:4px 12px 4px 0;font-size:14px}
  .info-card td:first-child{font-weight:600;color:var(--blue);width:200px}

  .ss-wrap{margin:12px 0;border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .ss-wrap img{width:100%;display:block}
  .ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}
  .ss-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
  .ss-section{margin-top:12px}
  .err-block{margin:8px 0;padding:12px 16px;background:#fff5f5;border-left:3px solid var(--red);border-radius:4px}
  .err-section{margin-bottom:12px}
  .toggle-icon{font-size:10px;color:var(--muted);user-select:none}

  .toc{background:var(--yellow-light);border:1px solid #f5d96c;border-radius:10px;padding:20px 24px;margin:28px 0}
  .toc h3{color:var(--yellow-dark);margin:0 0 12px}
  .toc ol{padding-left:20px;columns:2}
  .toc li{margin-bottom:5px}
  .toc a{color:var(--navy-mid);text-decoration:none;font-weight:500}
  .toc a:hover{text-decoration:underline}

  .footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}

  @media(max-width:760px){.diff-grid,.ss-row{grid-template-columns:1fr}.toc ol{columns:1}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">AFP · Brillmark QA</div>
  <h1>AFP13 QA Report</h1>
  <div><span class="badge-cover">Register &amp; Save CTA Button · cre-t-13 · Desktop Only · Sitewide</span></div>
  <div class="meta">
    <span>${dateStr}</span>
    <span>conference.financialprofessionals.org</span>
    <span>${allTCs.length} Test Cases · ${allBrowsers.length} Browsers</span>
    <span>${passed} Passed · ${failed} Failed · ${skipped} Skipped</span>
    ${bugTCs.length ? `<span>⚠ ${bugTCs.length} Bug(s) Found</span>` : '<span>✓ No Bugs Found</span>'}
  </div>
</div>

<div class="container">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#test-info">Test Overview</a></li>
    <li><a href="#figma">Figma Reference</a></li>
    <li><a href="#variations">Control vs Variation</a></li>
    <li><a href="#results">Results Summary</a></li>
    ${bugTCs.length ? '<li><a href="#bugs">Bugs Found</a></li>' : ''}
    <li><a href="#matrix">TC × Browser Matrix</a></li>
    <li><a href="#screenshots">Visual Screenshots</a></li>
  </ol>
</div>

<!-- TEST INFO -->
<h2 id="test-info">Test Overview</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>AFP13 (cre-t-13)</strong></td></tr>
    <tr><td>Test Type</td><td>A/B Test — Register &amp; Save CTA Button in Navigation (VWO)</td></tr>
    <tr><td>Site</td><td><code>conference.financialprofessionals.org</code> — All pages (sitewide)</td></tr>
    <tr><td>Audience</td><td><strong>Desktop only</strong></td></tr>
    <tr><td>Control URL</td><td><code>https://conference.financialprofessionals.org/</code></td></tr>
    <tr><td>Variation URL</td><td>VWO preview link (cre-t-13 injected via Playwright addInitScript)</td></tr>
    <tr><td>Test Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Injection Method</td><td>Playwright <code>page.addInitScript</code> + <code>page.addStyleTag</code> — no console/eval</td></tr>
    <tr><td>Total TCs</td><td>${allTCs.length} test cases × ${allBrowsers.length} browsers = ${totalRuns} total runs</td></tr>
    <tr><td>Bugs Found</td><td><strong style="color:${bugTCs.length ? 'var(--red)' : 'var(--green)'}">${bugTCs.length} bug(s)</strong></td></tr>
  </table>
</div>
<h3>What was tested</h3>
<ul style="padding-left:20px;font-size:14px;line-height:1.9">
  <li>Variation init: body class <code>cre-t-13</code> applied, duplicate-init guard</li>
  <li>Register button: existence, visibility, DOM position (before .nav-utilities-wrapper)</li>
  <li>Register button content: exact text "Register &amp; Save $675", correct href to /registration, no target="_blank"</li>
  <li>Register button styles: background #FCD426 (yellow), text color black, font-size 14px, font-weight 500</li>
  <li>Login icon replacement: profile.svg injected, original "Login" text removed, background transparent</li>
  <li>CSS changes: .nav-utilities hidden (display:none), .nav-utilities-wrapper → display:flex</li>
  <li>Sitewide coverage: variation fires on /registration and /program/overview/schedule</li>
  <li>Control comparison: no cre-t-13 class, no button, no icon on unmodified page</li>
  <li>Desktop viewport: ≥ 1440px confirmed</li>
  <li>Screenshots: variation nav + control nav, per browser</li>
</ul>

<!-- FIGMA -->
<h2 id="figma">Figma Reference — AFP13.png</h2>
<div class="section-intro">
  Control (left): standard nav with red/orange "Login" button.<br>
  Variation (right): yellow "Register &amp; Save $675" CTA added before nav utilities; "Login" button replaced with a profile icon. Tooltip annotation confirms button links to /registration.
</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="AFP13 Figma"/><div class="ss-caption">AFP13 Figma — Control (left) vs Variation (right)</div></div>`
  : '<p><em>AFP13.png not found — skipped</em></p>'}

<!-- VARIATIONS -->
<h2 id="variations">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control — Current State</h3>
    <ul>
      <li>Standard nav header on all pages</li>
      <li>Red/orange "Login" button with text in nav</li>
      <li>No CTA button for registration</li>
      <li>.nav-utilities visible</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation — cre-t-13</h3>
    <ul>
      <li>Yellow <strong>"Register &amp; Save $675"</strong> button added before nav utilities</li>
      <li>Button links to <code>/registration</code></li>
      <li>"Login" text removed — replaced with profile SVG icon</li>
      <li><code>.nav-utilities</code> hidden; wrapper becomes flex</li>
      <li>Desktop only · Sitewide · No mobile firing</li>
    </ul>
  </div>
</div>

<!-- RESULTS -->
<h2 id="results">Results Summary</h2>
<div class="kpi-row">
  <div class="kpi total-kpi"><span class="kpi-num">${totalRuns}</span><span class="kpi-label">Total Runs</span></div>
  <div class="kpi pass-kpi"><span class="kpi-num">${passed}</span><span class="kpi-label">Passed</span></div>
  <div class="kpi fail-kpi"><span class="kpi-num">${failed}</span><span class="kpi-label">Failed</span></div>
  <div class="kpi skip-kpi"><span class="kpi-num">${skipped}</span><span class="kpi-label">Skipped</span></div>
</div>
${failed === 0
  ? '<div style="background:var(--green-light);border:1px solid #b2dfcc;border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0">✓ All tests passed across all browsers.</div>'
  : `<div style="background:var(--red-light);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0">${failed} test(s) failed — see matrix below for details. Purple rows = expected failures (code bugs). Red rows = unexpected failures.</div>`}

<!-- BUGS -->
${bugSummary}

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} browsers)</h2>
<div class="section-intro">Click any row to expand error details and inline screenshots.</div>
<div style="overflow-x:auto">
<table>
  <thead>
    <tr>
      <th>Test Case</th>
      ${browserHeaders}
      <th style="width:36px"></th>
    </tr>
  </thead>
  <tbody>
    ${detailRows}
  </tbody>
</table>
</div>

<!-- SCREENSHOTS -->
<h2 id="screenshots">Visual Screenshots</h2>

<h3>Control — Navigation Bar (no variation)</h3>
<div class="section-intro">Baseline state: standard nav with "Login" button, no CTA button injected.</div>
${ssGrid(controlShots, 'Control')}

<h3>Variation — Navigation Bar (cre-t-13 active)</h3>
<div class="section-intro">Variation state: yellow "Register &amp; Save $675" button in nav, Login text replaced with profile icon.</div>
${ssGrid(varShots, 'Variation')}

<div class="footer">
  AFP13 QA Report · Generated ${dateStr} · Playwright Automated Tests · conference.financialprofessionals.org<br>
  QA by sarthak@brillmark.com · afp13-register-btn.spec.js · ${allTCs.length} TCs · ${allBrowsers.length} Browsers
  ${bugTCs.length ? ` · <strong style="color:var(--red)">${bugTCs.length} BUG(S) FOUND — fix before launch</strong>` : ' · No bugs found'}
</div>

</div>

<script>
function toggleDetail(id){
  var row=document.getElementById(id);
  if(!row) return;
  var idx=id.replace('d','');
  var icon=document.getElementById('icon'+idx);
  if(row.style.display==='none'){row.style.display='';if(icon)icon.textContent='▼';}
  else{row.style.display='none';if(icon)icon.textContent='▶';}
}
</script>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nAFP13 QA Report → ${OUTPUT} (${kb} KB)`);
    console.log(`Results: ${passed} passed / ${failed} failed / ${skipped} skipped / ${totalRuns} total`);
    if (bugTCs.length) console.log(`BUGS FOUND: ${bugTCs.length} — fix before launch`);
  }
}

module.exports = Afp13Reporter;
