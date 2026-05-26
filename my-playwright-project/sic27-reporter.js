/**
 * SIC-27 Custom HTML Reporter
 * Filters on spec files containing "sic27"
 * Output: local_testing/Local2/sic27-qa-report.html
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'sic27-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/SIC21.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/sic27-qa-report.html');

const CONTROL_URL   = 'https://app.13sick.com.au/request-consult?utm_campaign=Cro_27_mode&_conv_eforce=100052135.1000255637&isTelehealth=true';
const VARIATION_URL = 'https://app.13sick.com.au/request-consult?utm_campaign=Cro_27_mode&_conv_eforce=100052135.1000255638&isTelehealth=true';

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function ssForTC(tcSlug) {
  if (!fs.existsSync(SS_DIR)) return [];
  return fs.readdirSync(SS_DIR)
    .filter(f => f.toLowerCase().includes(tcSlug.toLowerCase()) && f.endsWith('.png'))
    .map(f => {
      const m = f.match(/(chrome[^.]*|firefox[^.]*|edge[^.]*|safari[^.]*|mobile[^.]*)/i);
      return { browser: m ? m[1] : f.replace('.png', '').split('-').slice(-2).join('-'), src: imgB64(path.join(SS_DIR, f)) };
    })
    .filter(s => s.src);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class Sic27Reporter {
  constructor() { this._results = []; }

  onTestEnd(test, result) {
    if (!test.location.file.includes('sic27')) return;
    const errorMsg = result.status === 'failed'
      ? (result.error?.message || '').split('\n').slice(0, 6).join('\n')
      : '';
    this._results.push({
      title:       test.title,
      projectName: test.parent?.project()?.name ?? 'Unknown',
      status:      result.status,
      duration:    result.duration,
      errorMsg,
    });
  }

  onEnd() {
    if (!this._results.length) return;
    this._generateReport();
  }

  _generateReport() {
    const R           = this._results;
    const allBrowsers = [...new Set(R.map(r => r.projectName))];
    const allTCs      = [...new Set(R.map(r => r.title))];
    const total   = R.length;
    const passed  = R.filter(r => r.status === 'passed').length;
    const failed  = R.filter(r => r.status === 'failed').length;
    const skipped = R.filter(r => r.status === 'skipped').length;

    const matrix = {};
    for (const r of R) {
      if (!matrix[r.title]) matrix[r.title] = {};
      matrix[r.title][r.projectName] = { status: r.status, errorMsg: r.errorMsg, duration: r.duration };
    }

    const figmaB64 = imgB64(FIGMA_IMG);

    function badge(st) {
      if (!st)             return '<span class="badge skip">—</span>';
      if (st === 'passed') return '<span class="badge pass">PASS</span>';
      if (st === 'failed') return '<span class="badge fail">FAIL</span>';
      if (st === 'skipped')return '<span class="badge skip">SKIP</span>';
      return `<span class="badge skip">${st}</span>`;
    }

    function ssRow(prefix) {
      const shots = ssForTC(prefix);
      if (!shots.length) return '';
      return shots.map(s => `
        <div class="ss-wrap">
          <img src="${s.src}" alt="${s.browser}"/>
          <div class="ss-caption">${s.browser}</div>
        </div>`).join('');
    }

    const bHeaders = allBrowsers
      .map(b => `<th>${b.replace(' Desktop', '').replace('Mobile ', '📱 ')}</th>`)
      .join('');

    const matrixRows = allTCs.map(tc => {
      const anyFail = allBrowsers.some(b => matrix[tc]?.[b]?.status === 'failed');
      const rowCls  = anyFail ? 'row-fail' : '';
      const cells   = allBrowsers.map(b => {
        const d   = matrix[tc]?.[b];
        const err = d?.errorMsg ? `<pre class="err-block">${esc(d.errorMsg)}</pre>` : '';
        return `<td>${badge(d?.status)}${err}</td>`;
      }).join('');

      const tcSlug = (tc.match(/TC-[CV]\d+/) || [''])[0].toLowerCase().replace('-', '-');
      const shots  = tcSlug ? ssRow(tcSlug) : '';
      const ssSection = shots
        ? `<tr><td colspan="${allBrowsers.length + 1}"><div class="ss-row">${shots}</div></td></tr>`
        : '';
      return `<tr class="${rowCls}"><td class="tc-name">${esc(tc)}</td>${cells}</tr>${ssSection}`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SIC-27 QA Report</title>
<style>
  :root{--pass:#1a7f4b;--fail:#c0392b;--skip:#888;--bg:#f5f6f8;--card:#fff;--border:#dde1e7}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Roboto,Arial,sans-serif;background:var(--bg);color:#1a1a1a;font-size:14px}
  .page{max-width:1300px;margin:0 auto;padding:32px 24px}
  .report-header{background:#0a2540;color:#fff;padding:36px 40px;border-radius:10px;margin-bottom:28px}
  .report-header h1{font-size:26px;font-weight:700;margin-bottom:6px}
  .report-header p{opacity:.75;font-size:13px;line-height:1.6}
  .meta-row{display:flex;flex-wrap:wrap;gap:24px;margin-top:16px;font-size:12px;opacity:.85}
  .meta-row span b{opacity:1;color:#7ec8e3}
  .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .kpi{background:var(--card);border-radius:8px;padding:20px 24px;border:1px solid var(--border);text-align:center}
  .kpi .num{font-size:40px;font-weight:700;line-height:1}
  .kpi .lbl{font-size:12px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
  .kpi.pass .num{color:var(--pass)}.kpi.fail .num{color:var(--fail)}.kpi.skip .num{color:var(--skip)}
  .section{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:24px;margin-bottom:24px}
  .section h2{font-size:16px;font-weight:700;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:8px 12px;border:1px solid var(--border);text-align:left;vertical-align:top}
  th{background:#f0f2f5;font-weight:600;font-size:12px}
  tr.row-fail{background:#fff8f8}
  .tc-name{font-weight:500;max-width:340px;word-break:break-word}
  .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:.4px}
  .badge.pass{background:#d4edda;color:var(--pass)}.badge.fail{background:#f8d7da;color:var(--fail)}.badge.skip{background:#e9ecef;color:var(--skip)}
  .err-block{background:#fff0f0;border-left:3px solid var(--fail);padding:6px 10px;margin-top:4px;font-size:11px;white-space:pre-wrap;word-break:break-all;color:#7a1f1f}
  .ss-row{display:flex;flex-wrap:wrap;gap:12px;padding:8px 0}
  .ss-wrap{display:flex;flex-direction:column;align-items:center;max-width:260px}
  .ss-wrap img{width:100%;border:1px solid var(--border);border-radius:4px}
  .ss-caption{font-size:11px;color:#666;margin-top:4px;text-align:center}
  .toc{list-style:none;padding:0;columns:2;gap:24px}
  .toc li{padding:4px 0}
  .toc a{color:#0a2540;text-decoration:none;font-size:13px}
  .toc a:hover{text-decoration:underline}
  .env-table td:first-child{font-weight:600;width:200px}
  .diff-row{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px}
  .diff-card{flex:1;min-width:240px;background:#f9fafc;border:1px solid var(--border);border-radius:6px;padding:14px}
  .diff-card h4{font-size:13px;font-weight:700;margin-bottom:8px;color:#0a2540}
  .diff-card ul{padding-left:18px;font-size:13px;line-height:2}
  @media(max-width:600px){.kpi-row{grid-template-columns:1fr 1fr}.toc{columns:1}}
</style>
</head>
<body>
<div class="page">

  <div class="report-header">
    <h1>SIC-27 — Telehealth Step 4 Clinic Field A/B Test &nbsp;|&nbsp; QA Report</h1>
    <p>Testing the new <code>#practice-search-by-postcode-subscribing</code> field (Variation) vs the existing <code>#practice-search-by-postcode</code> field (Control) on the 13sick Step 4 Verify page.</p>
    <div class="meta-row">
      <span><b>Ticket:</b> SIC-27 / cre-t-27</span>
      <span><b>Date:</b> ${new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      <span><b>Tester:</b> Automated (Playwright) + Manual Review</span>
      <span><b>Control URL:</b> <a href="${CONTROL_URL}" style="color:#7ec8e3" target="_blank">_conv_eforce=…1000255637</a></span>
      <span><b>Variation URL:</b> <a href="${VARIATION_URL}" style="color:#7ec8e3" target="_blank">_conv_eforce=…1000255638</a></span>
      <span><b>Env:</b> Production — app.13sick.com.au</span>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi"><div class="num">${total}</div><div class="lbl">Total Runs</div></div>
    <div class="kpi pass"><div class="num">${passed}</div><div class="lbl">Passed</div></div>
    <div class="kpi fail"><div class="num">${failed}</div><div class="lbl">Failed</div></div>
    <div class="kpi skip"><div class="num">${skipped}</div><div class="lbl">Skipped</div></div>
  </div>

  <div class="section">
    <h2>Table of Contents</h2>
    <ul class="toc">
      <li><a href="#env">1. Test Environment</a></li>
      <li><a href="#figma">2. Figma Reference (SIC21 design basis)</a></li>
      <li><a href="#diff">3. Control vs Variation Diff</a></li>
      <li><a href="#matrix">4. Test Result Matrix</a></li>
      <li><a href="#screenshots">5. Screenshots</a></li>
    </ul>
  </div>

  <div class="section" id="env">
    <h2>1. Test Environment</h2>
    <table class="env-table">
      <tr><td>Platform</td><td>Windows 11 Home — Playwright headless</td></tr>
      <tr><td>Playwright</td><td>^1.59.1</td></tr>
      <tr><td>Browsers tested</td><td>Chrome Desktop · Edge Desktop · Firefox Desktop · Safari (WebKit) · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
      <tr><td>Desktop viewport</td><td>1280 × 800</td></tr>
      <tr><td>Mobile viewport</td><td>Pixel 5: 393 × 851 · iPhone 12: 390 × 844</td></tr>
      <tr><td>Control spec file</td><td>local_testing/Local2/variation/js.js (cre-t-21 / "Variation B" of SIC-21, now deployed as V1 Control)</td></tr>
      <tr><td>Variation spec file</td><td>local_testing/Local2/variation/vB.js (cre-t-27)</td></tr>
      <tr><td>Figma reference</td><td>local_testing/Local2/SIC21.png (same design basis)</td></tr>
      <tr><td>Total TCs</td><td>34 (TC-C01–TC-C17 Control + TC-V01–TC-V17 Variation)</td></tr>
    </table>
  </div>

  <div class="section" id="figma">
    <h2>2. Figma Reference — SIC21 Design Basis</h2>
    ${figmaB64
      ? `<img src="${figmaB64}" alt="SIC21 Figma" style="max-width:100%;border:1px solid #dde1e7;border-radius:6px"/>`
      : '<p><em>Figma image not found at expected path.</em></p>'}
    <p style="margin-top:12px;font-size:13px;color:#555">
      Both Control and Variation share the same visual design from SIC-21 (same label, placeholder, hint area, validation colours).
      The only difference is <strong>which field element</strong> is shown.
    </p>
  </div>

  <div class="section" id="diff">
    <h2>3. Control vs Variation — Key Differences</h2>
    <div class="diff-row">
      <div class="diff-card">
        <h4>Control (js.js — cre-t-21)</h4>
        <ul>
          <li>Hides <code>#practice-search-by-name</code></li>
          <li>Shows <code>#practice-search-by-postcode</code></li>
          <li>Hint: "…to <strong>qualify</strong> for bulk billing."</li>
          <li>Error class: <code>cre-t-21-field-error</code></li>
          <li>Parent IDs prefixed: <code>cre-t-21-*</code></li>
        </ul>
      </div>
      <div class="diff-card">
        <h4>Variation (vB.js — cre-t-27)</h4>
        <ul>
          <li>Hides <code>#practice-search-by-name</code> <strong>AND</strong> <code>#practice-search-by-postcode</code></li>
          <li>Shows <code>#practice-search-by-postcode-subscribing</code> (fewer clinics)</li>
          <li>Hint: "…to <strong>continue</strong> with bulk billing."</li>
          <li>Error class: <code>cre-t-27-field-error</code></li>
          <li>Parent IDs prefixed: <code>cre-t-27-*</code></li>
        </ul>
      </div>
    </div>
    <p style="margin-top:14px;font-size:13px">
      Both share: label = "Select a clinic" · placeholder = "Search clinic name or postcode" ·
      terms text = "I agree to the " · attended checkbox pre-selected + hidden ·
      red validation (<code>rgb(234,72,72)</code>) on empty Next click · input height 52px ·
      MuiAutocomplete-endAdornment hidden.
    </p>
  </div>

  <div class="section" id="matrix">
    <h2>4. Test Result Matrix</h2>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>Test Case</th>${bHeaders}</tr></thead>
      <tbody>${matrixRows}</tbody>
    </table>
    </div>
  </div>

  <div class="section" id="screenshots">
    <h2>5. Screenshots — All Browsers</h2>
    ${(() => {
      if (!fs.existsSync(SS_DIR)) return '<p><em>No screenshots directory found.</em></p>';
      const files = fs.readdirSync(SS_DIR).filter(f => f.endsWith('.png'));
      if (!files.length) return '<p><em>No screenshots captured.</em></p>';
      return '<div class="ss-row">' +
        files.map(f => {
          const b64 = imgB64(path.join(SS_DIR, f));
          return b64 ? `<div class="ss-wrap"><img src="${b64}" alt="${f}"/><div class="ss-caption">${f.replace('.png', '')}</div></div>` : '';
        }).join('') + '</div>';
    })()}
  </div>

  <div style="text-align:center;font-size:12px;color:#999;padding:24px 0">
    SIC-27 QA Report &nbsp;·&nbsp; Generated ${new Date().toLocaleString('en-AU')} &nbsp;·&nbsp; Tester: sarthak@brillmark.com
  </div>

</div>
</body>
</html>`;

    fs.writeFileSync(OUTPUT, html, 'utf8');
    console.log(`\n[SIC-27 Reporter] Report written → ${OUTPUT}\n`);
  }
}

module.exports = Sic27Reporter;
