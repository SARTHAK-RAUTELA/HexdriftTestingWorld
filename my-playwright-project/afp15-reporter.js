/**
 * AFP15 Custom HTML Reporter
 * Generates afp15-qa-report.html with SIC-19 style:
 *   — per-test rows with inline screenshots
 *   — bug callout section
 *   — Figma reference embedded
 *   — 4-browser desktop matrix
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'afp15-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/AFP15 figma.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/afp15-qa-report.html');

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

class Afp15Reporter {
  constructor() {
    this._results  = [];   // { title, projectName, status, duration, errors, attachments }
    this._started  = Date.now();
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('afp15')) return;

    const errors = result.errors.map(e => (e.message || String(e)).replace(/</g, '&lt;').replace(/>/g, '&gt;'));
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
    const results      = this._results;
    const allBrowsers  = [...new Set(results.map(r => r.projectName))]
      .filter(b => !b.toLowerCase().includes('mobile'))
      .sort();
    const allTCs       = [...new Set(results.map(r => r.title))];

    // matrix: { tc -> { browser -> {status, errors, attachments} } }
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
    const dateStr   = new Date().toLocaleDateString('en-AU', { year:'numeric', month:'long', day:'numeric' });

    // Identify bug TCs
    const bugTCs = allTCs.filter(tc => tc.includes('[BUG]'));

    function badge(status) {
      if (!status) return '<span class="badge skip">—</span>';
      if (status === 'passed')  return '<span class="badge pass">PASS</span>';
      if (status === 'failed')  return '<span class="badge fail">FAIL</span>';
      if (status === 'skipped') return '<span class="badge skip">SKIP</span>';
      return `<span class="badge skip">${status}</span>`;
    }

    function durationStr(ms) {
      if (!ms && ms !== 0) return '—';
      return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
    }

    // Build per-TC detail rows (expandable)
    const detailRows = allTCs.map((tc, idx) => {
      const isBug    = tc.includes('[BUG]');
      const rowClass = isBug ? 'row-bug' : (Object.values(matrix[tc] || {}).some(r => r.status === 'failed') ? 'row-fail' : '');

      const browserCells = allBrowsers.map(b => {
        const r = matrix[tc]?.[b];
        return `<td class="cell-center">${badge(r?.status)}<br><span class="dur">${durationStr(r?.duration)}</span></td>`;
      }).join('');

      // Error detail section
      let errorHtml = '';
      for (const b of allBrowsers) {
        const r = matrix[tc]?.[b];
        if (r?.errors?.length) {
          errorHtml += `<div class="err-block"><strong>${b}:</strong><pre>${r.errors.join('\n\n')}</pre></div>`;
        }
      }

      // Screenshot attachments
      let ssHtml = '';
      for (const b of allBrowsers) {
        const r = matrix[tc]?.[b];
        if (r?.attachments?.length) {
          r.attachments.forEach(a => {
            if (a.src) ssHtml += `<div class="ss-wrap"><img src="${a.src}" alt="${a.name}"/><div class="ss-caption">${tc} · ${b} · ${a.name}</div></div>`;
          });
        }
      }

      // Also check screenshot files for TC-AFP15-34 and TC-AFP15-35
      if (tc.includes('TC-AFP15-34') || tc.includes('TC-AFP15-35')) {
        const prefix = tc.includes('34') ? 'variation-desktop' : 'control-desktop';
        allBrowsers.forEach(b => {
          const slug = b.toLowerCase().replace(/\s+/g, '-');
          const src  = ssB64ForBrowser(prefix.replace('-desktop',''), b);
          if (src && !ssHtml.includes(slug)) {
            ssHtml += `<div class="ss-wrap"><img src="${src}" alt="${prefix} ${b}"/><div class="ss-caption">${prefix.replace('-desktop','')} · ${b}</div></div>`;
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
    ${ssHtml ? `<div class="ss-section">${ssHtml}</div>` : ''}
  </td>
</tr>` : ''}`;
    }).join('\n');

    const browserHeaders = allBrowsers.map(b =>
      `<th>${b.replace(' Desktop','').replace('Mobile ','')}</th>`
    ).join('');

    // Bug summary section
    const bugSummary = bugTCs.length ? `
<h2 id="bugs">Bugs Found (${bugTCs.length})</h2>
<div class="section-intro">These test cases are expected to FAIL — they expose code defects found during Figma vs code comparison before tests were written.</div>
<table>
  <thead><tr><th>Bug #</th><th>Test Case</th><th>Expected (Figma/Spec)</th><th>Actual (Code)</th><th>Severity</th></tr></thead>
  <tbody>
    <tr class="row-fail">
      <td><strong>BUG-01</strong></td>
      <td class="tc-name">TC-AFP15-22</td>
      <td>Tag text: <code>ENDS JUNE 6</code></td>
      <td>Code has: <code>ENDS JUNE 26</code></td>
      <td><span class="badge fail">HIGH</span></td>
    </tr>
    <tr class="row-fail">
      <td><strong>BUG-02</strong></td>
      <td class="tc-name">TC-AFP15-28</td>
      <td>Header text: <code>AFP 2026 Conference</code></td>
      <td>Code only adds CSS class — <strong>no text change</strong> in JS or CSS</td>
      <td><span class="badge fail">HIGH</span></td>
    </tr>
  </tbody>
</table>
<div class="info-card" style="margin-top:16px">
  <strong>Action required before launching this variation:</strong>
  <ul style="padding-left:20px;margin-top:8px;font-size:14px;line-height:1.8">
    <li><strong>BUG-01 Fix:</strong> In <code>vB.js</code> line 82 — change <code>"ENDS JUNE 26"</code> → <code>"ENDS JUNE 6"</code></li>
    <li><strong>BUG-02 Fix:</strong> In <code>vB.js</code> — after adding class <code>cre-t-15-conference</code>, add: <code>element.textContent = 'AFP 2026 Conference';</code></li>
  </ul>
</div>` : '';

    // Control vs Variation screenshots
    const controlShots  = allBrowsers.map(b => ({ browser: b, src: ssB64ForBrowser('control-desktop', b) })).filter(s => s.src);
    const varShots      = allBrowsers.map(b => ({ browser: b, src: ssB64ForBrowser('variation-desktop', b) })).filter(s => s.src);

    function ssGrid(shots, caption) {
      if (!shots.length) return '<p><em>No screenshots captured.</em></p>';
      return `<div class="ss-row">${shots.map(s => `
        <div class="ss-wrap">
          <img src="${s.src}" alt="${caption} — ${s.browser}"/>
          <div class="ss-caption">${caption} · ${s.browser.replace(' Desktop','')}</div>
        </div>`).join('')}</div>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AFP15 QA Report — ${dateStr}</title>
<style>
  :root{
    --orange:#f7921d;--orange-light:#fff4e6;--orange-dark:#c4721a;
    --green:#1a6b50;--green-light:#e6f4ef;
    --red:#c0392b;--red-light:#fdf0ef;
    --blue:#1a5276;--blue-light:#eaf2fb;
    --grey:#f8f9fa;--border:#dee2e6;--text:#212529;--muted:#6c757d;
    --purple:#6f42c1;--purple-light:#f3f0ff;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.6}
  a{color:var(--orange-dark)}

  .cover{background:linear-gradient(135deg,#8a4c00 0%,#c4721a 60%,#f7921d 100%);color:#fff;padding:56px 48px 44px;display:flex;flex-direction:column;gap:12px}
  .cover-logo{font-size:22px;font-weight:800;opacity:.9}
  .cover h1{font-size:38px;font-weight:800;line-height:1.15;margin-top:6px}
  .cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:14px;opacity:.85;font-size:14px}
  .badge-cover{display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:4px 14px;font-size:13px;margin-top:8px}

  .container{max-width:1200px;margin:0 auto;padding:0 32px 64px}
  h2{font-size:21px;font-weight:700;color:var(--orange-dark);margin:44px 0 14px;padding-bottom:8px;border-bottom:2px solid var(--orange-light)}
  h3{font-size:16px;font-weight:700;margin:22px 0 8px;color:#333}
  p{margin-bottom:10px}
  code{background:#f1f3f5;border-radius:4px;padding:1px 6px;font-size:13px;font-family:'SF Mono',Consolas,monospace}
  pre{background:#1e1e1e;color:#d4d4d4;border-radius:8px;padding:12px 16px;font-size:12px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;margin:8px 0}

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

  table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
  th{background:var(--orange-dark);color:#fff;padding:10px 12px;text-align:left;font-weight:600;white-space:nowrap}
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
  .diff-card.control{background:#f0f8ff;border-color:#005DAA}
  .diff-card.variation{background:var(--orange-light);border-color:var(--orange)}
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

  .toc{background:var(--orange-light);border:1px solid #f7c98a;border-radius:10px;padding:20px 24px;margin:28px 0}
  .toc h3{color:var(--orange-dark);margin:0 0 12px}
  .toc ol{padding-left:20px;columns:2}
  .toc li{margin-bottom:5px}
  .toc a{color:var(--orange-dark);text-decoration:none;font-weight:500}
  .toc a:hover{text-decoration:underline}

  .footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}

  @media(max-width:760px){.diff-grid,.ss-row{grid-template-columns:1fr}.toc ol{columns:1}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">AFP · Brillmark QA</div>
  <h1>AFP15 QA Report</h1>
  <div><span class="badge-cover">Events Navigation A/B Test · cre-t-15 · Desktop Only · Sitewide</span></div>
  <div class="meta">
    <span>${dateStr}</span>
    <span>www.financialprofessionals.org</span>
    <span>${allTCs.length} Test Cases · ${allBrowsers.length} Browsers</span>
    <span>${passed} Passed · ${failed} Failed · ${skipped} Skipped</span>
    ${bugTCs.length ? `<span>⚠ ${bugTCs.length} Bugs Found</span>` : ''}
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
    <li><a href="#bugs">Bugs Found</a></li>
    <li><a href="#matrix">TC × Browser Matrix</a></li>
    <li><a href="#screenshots">Visual Screenshots</a></li>
  </ol>
</div>

<!-- TEST INFO -->
<h2 id="test-info">Test Overview</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>AFP15 (cre-t-15)</strong></td></tr>
    <tr><td>Test Type</td><td>A/B Test — Events Navigation Dropdown Enhancement (VWO)</td></tr>
    <tr><td>Site</td><td><code>www.financialprofessionals.org</code> — All pages (sitewide)</td></tr>
    <tr><td>Audience</td><td><strong>Desktop only</strong></td></tr>
    <tr><td>Trigger</td><td>Fires when user clicks the <strong>Events</strong> menu item</td></tr>
    <tr><td>Test Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Injection Method</td><td>Playwright <code>page.addInitScript</code> + <code>page.addStyleTag</code> — no console/eval</td></tr>
    <tr><td>Total TCs</td><td>${allTCs.length} test cases × ${allBrowsers.length} browsers = ${totalRuns} total runs</td></tr>
    <tr><td>Bugs Found</td><td><strong style="color:var(--red)">${bugTCs.length} bugs</strong> — see Bugs section below</td></tr>
  </table>
</div>
<h3>What was tested</h3>
<ul style="padding-left:20px;font-size:14px;line-height:1.9">
  <li>Variation init: body class, nav class assignments, duplicate-init guard</li>
  <li>CSS hide: <code>Conference Session Archives</code> link is hidden</li>
  <li>Links count: exactly 6 new nav items injected</li>
  <li>Link text accuracy (exact string match per Figma) for all 6 links</li>
  <li>Link href accuracy (exact URL match per spec) for all 6 links</li>
  <li>ENDS JUNE tag: presence, visibility, text, color, font-size, position, border-radius</li>
  <li>Header text change to "AFP 2026 Conference"</li>
  <li>Dropdown behavior: Events click opens dropdown, all links visible, target=_self</li>
  <li>No duplicate injection on re-init</li>
  <li>Desktop viewport (≥1200px)</li>
  <li>Screenshots: variation state and control state per browser</li>
</ul>

<!-- FIGMA -->
<h2 id="figma">Figma Reference — AFP15 figma.png</h2>
<div class="section-intro">Control (left) shows the existing Events dropdown with "Annual Conference" header and "AFP 2026" + "Conference Session Archives" links. Variation (right) shows the new "AFP 2026 Conference" header, 6 new links, and the "ENDS JUNE 6" tag badge.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="AFP15 Figma"/><div class="ss-caption">AFP15 Figma — Control (left) vs Variation (right)</div></div>`
  : '<p><em>AFP15 figma.png not found — skipped</em></p>'}

<!-- VARIATIONS -->
<h2 id="variations">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control — Current State</h3>
    <ul>
      <li>Events dropdown: header "Annual Conference"</li>
      <li>Links: AFP 2026, Conference Session Archives</li>
      <li>Meetings &amp; Events column unchanged</li>
      <li>No tag badges</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation — cre-t-15</h3>
    <ul>
      <li>Header changes to <strong>"AFP 2026 Conference"</strong></li>
      <li>"Conference Session Archives" link hidden</li>
      <li>6 new links injected under conference section</li>
      <li><strong>"ENDS JUNE 6"</strong> blue tag on Register link</li>
      <li>Desktop only (no mobile firing)</li>
      <li>Fires on Events menu click (no flash)</li>
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
  ? '<div style="background:var(--green-light);border:1px solid #b2dfcc;border-radius:10px;padding:14px 18px;color:var(--green);font-weight:600;font-size:15px;margin:16px 0">All tests passed across all browsers.</div>'
  : `<div style="background:var(--red-light);border:1px solid #f5c6cb;border-radius:10px;padding:14px 18px;color:var(--red);font-weight:600;font-size:15px;margin:16px 0">${failed} test(s) failed — see bug section and matrix below. Purple rows = expected failures (code bugs).</div>`}

<!-- BUGS -->
${bugSummary}

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} browsers)</h2>
<div class="section-intro">Click any row to expand error details and inline screenshots. Purple rows are BUG tests (expected failures). Red rows are unexpected failures.</div>
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

<h3>Control — Events Dropdown (no variation)</h3>
<div class="section-intro">Baseline state: Events dropdown open, showing original "Annual Conference" header and links.</div>
${ssGrid(controlShots, 'Control')}

<h3>Variation — Events Dropdown (cre-t-15 active)</h3>
<div class="section-intro">Variation state: 6 new links injected, ENDS JUNE tag visible, Conference Session Archives hidden.</div>
${ssGrid(varShots, 'Variation')}

<div class="footer">
  AFP15 QA Report · Generated ${dateStr} · Playwright Automated Tests · www.financialprofessionals.org<br>
  QA by sarthak@brillmark.com · afp15-events-nav.spec.js · ${allTCs.length} TCs · ${allBrowsers.length} Browsers
  ${bugTCs.length ? ` · <strong style="color:var(--red)">${bugTCs.length} BUGS FOUND — fix before launch</strong>` : ''}
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
    console.log(`\nAFP15 QA Report → ${OUTPUT} (${kb} KB)`);
    console.log(`Results: ${passed} passed / ${failed} failed / ${skipped} skipped / ${totalRuns} total`);
    if (bugTCs.length) console.log(`BUGS FOUND: ${bugTCs.length} — fix before launch`);
  }
}

module.exports = Afp15Reporter;
