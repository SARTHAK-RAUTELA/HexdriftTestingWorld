/**
 * SIC-24 Custom HTML Reporter
 * Filters on spec file name containing "sic24"
 * Output: local_testing/Local2/sic24-qa-report.html
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'sic24-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/SIC24.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/sic24-qa-report.html');

function imgB64(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

function ssForTC(tcSlug) {
  if (!fs.existsSync(SS_DIR)) return [];
  const browserPattern = /(chrome-desktop|firefox-desktop|edge-desktop|safari-desktop|mobile-chrome[^.]*|mobile-safari[^.]*)/i;
  return fs.readdirSync(SS_DIR)
    .filter(f => f.toLowerCase().includes(tcSlug.toLowerCase()) && f.endsWith('.png'))
    .map(f => {
      const m = f.match(browserPattern);
      return { browser: m ? m[1] : f.replace('.png', '').split('-').slice(-2).join('-'), src: imgB64(path.join(SS_DIR, f)) };
    })
    .filter(s => s.src);
}

class Sic24Reporter {
  constructor() { this._results = []; }

  onTestEnd(test, result) {
    if (!test.location.file.includes('sic24')) return;
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
    const CONTROL_URL   = 'https://stg-patient.doctordoctor.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052082.1000255517&isTelehealth=true';
    const VARIATION_URL = 'https://stg-patient.doctordoctor.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052082.1000255518&isTelehealth=true';
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
      if (!st) return '<span class="badge skip">—</span>';
      if (st === 'passed')  return '<span class="badge pass">PASS</span>';
      if (st === 'failed')  return '<span class="badge fail">FAIL</span>';
      if (st === 'skipped') return '<span class="badge skip">SKIP</span>';
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
      .map(b => `<th>${b.replace(' Desktop','').replace('Mobile ','📱 ')}</th>`)
      .join('');

    const matrixRows = allTCs.map(tc => {
      const anyFail = allBrowsers.some(b => matrix[tc]?.[b]?.status === 'failed');
      const rowCls  = anyFail ? 'row-fail' : '';
      const cells   = allBrowsers.map(b => {
        const d = matrix[tc]?.[b];
        const err = d?.errorMsg ? `<pre class="err-block">${esc(d.errorMsg)}</pre>` : '';
        return `<td>${badge(d?.status)}${err}</td>`;
      }).join('');
      // derive screenshot prefix from TC number
      const tcNum = (tc.match(/TC-(\d+)/) || [])[1];
      const prefix = tcNum ? `tc${tcNum.padStart(2,'0')}-` : '';
      const shots  = prefix ? ssRow(prefix) : '';
      const ssSection = shots ? `<tr><td colspan="${allBrowsers.length + 1}"><div class="ss-row">${shots}</div></td></tr>` : '';
      return `<tr class="${rowCls}"><td class="tc-name">${esc(tc)}</td>${cells}</tr>${ssSection}`;
    }).join('');

    // ── Bugs section from code analysis ──────────────────────────────────────
    const bugsHtml = `
    <div class="bug-card sev-high">
      <div class="bug-header">
        <span class="sev-badge high">HIGH</span>
        <strong>BUG-01 — Cancel button clicked twice on "Leave Queue" in modal</strong>
      </div>
      <p><strong>Where:</strong> <code>vB.js</code> — <code>bindModal()</code>, listener for <code>#cqm-leave</code></p>
      <p><strong>Symptom:</strong> When "Leave Queue" is clicked in the modal, <code>realBtn.click()</code> is called immediately AND then <code>triggerCancel()</code> is called below — both click the same <code>[data-testid="consult-requested__cancel-button"]</code>. Double-clicking the cancel button can trigger the cancel confirmation page twice, causing undefined navigation behavior.</p>
      <pre class="code-block">live("#cqm-leave", "click", function(e) {
  var realBtn = iframeDoc.querySelector(REAL_CANCEL_SELECTOR);
  if (realBtn) realBtn.click();   // ← first click
  e.preventDefault();
  closeModal();
  triggerCancel();                 // ← second click (same button!)
}, iframeDoc);</pre>
      <p><strong>Fix:</strong> Remove the inline <code>realBtn.click()</code> and keep only <code>triggerCancel()</code>, or remove <code>triggerCancel()</code> and keep the inline call.</p>
    </div>

    <div class="bug-card sev-high">
      <div class="bug-header">
        <span class="sev-badge high">HIGH</span>
        <strong>BUG-02 — Cancel flow does not redirect to home page (reported)</strong>
      </div>
      <p><strong>Flow:</strong> Queue page → Leave Queue → modal → Leave Queue → "Changed my mind" page → Cancel Request → <em>expected: home page, actual: stays on same page or unknown state</em></p>
      <p><strong>Likely cause:</strong> The underlying app's cancel/redirect logic is separate from the variation. Additionally, BUG-01's double-click of the cancel button may interfere with the app's navigation state machine.</p>
      <p><strong>CSS risk:</strong> The rule <code>#custom-queue-modal + div &#123; display: none !important; &#125;</code> hides the sibling <code>&lt;div&gt;</code> of the modal. If the "Changed my mind" page renders as a sibling <em>before</em> <code>removeBlock()</code> fires (debounce delay: 150 ms), that page's content will be invisible — user sees a blank screen.</p>
      <p><strong>Fix:</strong> Remove the <code>#custom-queue-modal + div</code> rule. It's not needed now that <code>removeBlock()</code> properly removes the modal from the DOM. Also fix BUG-01.</p>
    </div>

    <div class="bug-card sev-medium">
      <div class="bug-header">
        <span class="sev-badge medium">MEDIUM</span>
        <strong>BUG-03 — Stray closing brace in injected CSS</strong>
      </div>
      <p><strong>Where:</strong> <code>vB.js</code> — <code>style.innerHTML</code>, last line of CSS (after the <code>@media</code> block)</p>
      <p><strong>Symptom:</strong> An extra <code>}</code> at the end of the CSS string creates an invalid CSS rule. While most browsers ignore it silently, it can cause the DevTools CSS parser to flag errors and may break CSS in strict-mode environments.</p>
      <pre class="code-block">@media (max-width: 767px) {
    ...
}


}        ← extra stray brace</pre>
      <p><strong>Fix:</strong> Remove the trailing <code>}</code>.</p>
    </div>

    <div class="bug-card sev-low">
      <div class="bug-header">
        <span class="sev-badge low">LOW</span>
        <strong>BUG-04 — Hardcoded name "Bruce Richardson" in variation HTML</strong>
      </div>
      <p><strong>Where:</strong> <code>vB.js</code> HTML template — <code>&lt;p class="cqb-title"&gt;Thank you, Bruce Richardson.&lt;/p&gt;</code></p>
      <p><strong>Symptom:</strong> Every user sees "Bruce Richardson" instead of their own name. The real patient's name is available in the underlying app's DOM but is not read dynamically.</p>
      <p><strong>Fix:</strong> Read the patient name from the existing control page DOM before injecting, e.g. from a <code>[data-testid*="patient-name"]</code> element or similar, and interpolate it into the template string.</p>
    </div>

    <div class="bug-card sev-low">
      <div class="bug-header">
        <span class="sev-badge low">LOW</span>
        <strong>BUG-05 — "Stay in Queue" button uses fixed width (288px) — breaks on narrow mobile</strong>
      </div>
      <p><strong>Where:</strong> <code>vB.js</code> — <code>.cqm-stay</code> CSS rule: <code>width: 288px</code></p>
      <p><strong>Symptom:</strong> On viewports narrower than ~330px the button overflows the dialog (max-width 365px with 37+40px padding). The button should be <code>width: 100%</code> inside the modal dialog.</p>
      <p><strong>Fix:</strong> Change <code>width: 288px</code> → <code>width: 100%</code> on <code>.cqm-stay</code>.</p>
    </div>
    `;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SIC-24 QA Report</title>
<style>
  :root{--pass:#1a7f4b;--fail:#c0392b;--skip:#888;--bg:#f5f6f8;--card:#fff;--border:#dde1e7}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Roboto,Arial,sans-serif;background:var(--bg);color:#1a1a1a;font-size:14px}
  .page{max-width:1300px;margin:0 auto;padding:32px 24px}
  /* header */
  .report-header{background:#0a2540;color:#fff;padding:36px 40px;border-radius:10px;margin-bottom:28px}
  .report-header h1{font-size:26px;font-weight:700;margin-bottom:6px}
  .report-header p{opacity:.75;font-size:13px;line-height:1.6}
  .meta-row{display:flex;flex-wrap:wrap;gap:24px;margin-top:16px;font-size:12px;opacity:.85}
  .meta-row span b{opacity:1;color:#7ec8e3}
  /* kpi */
  .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .kpi{background:var(--card);border-radius:8px;padding:20px 24px;border:1px solid var(--border);text-align:center}
  .kpi .num{font-size:40px;font-weight:700;line-height:1}
  .kpi .lbl{font-size:12px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
  .kpi.pass .num{color:var(--pass)}
  .kpi.fail .num{color:var(--fail)}
  .kpi.skip .num{color:var(--skip)}
  /* section */
  .section{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:24px;margin-bottom:24px}
  .section h2{font-size:16px;font-weight:700;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}
  /* table */
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:8px 12px;border:1px solid var(--border);text-align:left;vertical-align:top}
  th{background:#f0f2f5;font-weight:600;font-size:12px}
  tr.row-fail{background:#fff8f8}
  .tc-name{font-weight:500;max-width:320px;word-break:break-word}
  /* badges */
  .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:.4px}
  .badge.pass{background:#d4edda;color:var(--pass)}
  .badge.fail{background:#f8d7da;color:var(--fail)}
  .badge.skip{background:#e9ecef;color:var(--skip)}
  /* error */
  .err-block{background:#fff0f0;border-left:3px solid var(--fail);padding:6px 10px;margin-top:4px;font-size:11px;white-space:pre-wrap;word-break:break-all;color:#7a1f1f}
  /* screenshots */
  .ss-row{display:flex;flex-wrap:wrap;gap:12px;padding:8px 0}
  .ss-wrap{display:flex;flex-direction:column;align-items:center;max-width:280px}
  .ss-wrap img{width:100%;border:1px solid var(--border);border-radius:4px}
  .ss-caption{font-size:11px;color:#666;margin-top:4px;text-align:center}
  /* figma compare */
  .figma-row{display:flex;gap:24px;flex-wrap:wrap}
  .figma-row>div{flex:1;min-width:200px}
  .figma-row img{width:100%;border:1px solid var(--border);border-radius:4px}
  .figma-lbl{font-size:12px;font-weight:600;margin-bottom:6px;color:#555}
  /* bugs */
  .bug-card{border-radius:8px;padding:18px 20px;margin-bottom:16px;border-left:5px solid}
  .bug-card.sev-high{background:#fff5f5;border-color:#c0392b}
  .bug-card.sev-medium{background:#fffaf0;border-color:#e67e22}
  .bug-card.sev-low{background:#f0f8ff;border-color:#2980b9}
  .bug-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .sev-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;color:#fff;letter-spacing:.5px}
  .sev-badge.high{background:#c0392b}
  .sev-badge.medium{background:#e67e22}
  .sev-badge.low{background:#2980b9}
  .bug-card p{font-size:13px;line-height:1.7;margin-top:6px}
  .code-block{background:#1e1e2e;color:#cdd6f4;font-family:monospace;font-size:12px;padding:12px 16px;border-radius:6px;margin-top:8px;overflow-x:auto;white-space:pre}
  /* env */
  .env-table td:first-child{font-weight:600;width:180px}
  /* toc */
  .toc{list-style:none;padding:0;columns:2;gap:24px}
  .toc li{padding:4px 0}
  .toc a{color:#0a2540;text-decoration:none;font-size:13px}
  .toc a:hover{text-decoration:underline}
  @media(max-width:600px){.kpi-row{grid-template-columns:1fr 1fr}.toc{columns:1}}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="report-header">
    <h1>SIC-24 — Queue Page A/B Test &nbsp;|&nbsp; QA Report</h1>
    <p>Verifying the Variation queue page redesign (vB.js) against Figma wireframe SIC24.png</p>
    <div class="meta-row">
      <span><b>Date:</b> ${new Date().toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'})}</span>
      <span><b>Tester:</b> Automated (Playwright) + Manual Review</span>
      <span><b>Control URL:</b> <a href="${CONTROL_URL}" style="color:#7ec8e3" target="_blank">_conv_eforce=…1000255517</a></span>
      <span><b>Variation URL:</b> <a href="${VARIATION_URL}" style="color:#7ec8e3" target="_blank">_conv_eforce=…1000255518</a></span>
      <span><b>Env:</b> Staging — stg-patient.doctordoctor.com.au</span>
    </div>
  </div>

  <!-- KPI -->
  <div class="kpi-row">
    <div class="kpi"><div class="num">${total}</div><div class="lbl">Total Runs</div></div>
    <div class="kpi pass"><div class="num">${passed}</div><div class="lbl">Passed</div></div>
    <div class="kpi fail"><div class="num">${failed}</div><div class="lbl">Failed</div></div>
    <div class="kpi skip"><div class="num">${skipped}</div><div class="lbl">Skipped</div></div>
  </div>

  <!-- TOC -->
  <div class="section">
    <h2>Table of Contents</h2>
    <ul class="toc">
      <li><a href="#env">1. Test Environment</a></li>
      <li><a href="#figma">2. Figma Reference</a></li>
      <li><a href="#matrix">3. Test Result Matrix</a></li>
      <li><a href="#bugs">4. Bugs &amp; Issues Found</a></li>
      <li><a href="#code">5. Code Analysis</a></li>
      <li><a href="#screenshots">6. Screenshots</a></li>
    </ul>
  </div>

  <!-- ENV -->
  <div class="section" id="env">
    <h2>1. Test Environment</h2>
    <table class="env-table">
      <tr><td>Platform</td><td>Windows 11 Home — Playwright headless</td></tr>
      <tr><td>Playwright</td><td>Latest (package.json)</td></tr>
      <tr><td>Browsers tested</td><td>Chrome Desktop · Edge Desktop · Firefox Desktop · Safari (WebKit) · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
      <tr><td>Desktop viewport</td><td>1280 × 800</td></tr>
      <tr><td>Mobile viewport</td><td>Pixel 5: 393 × 851 · iPhone 12: 390 × 844</td></tr>
      <tr><td>Test credentials</td><td>Mobile: 0499999999 · DOB: 20/04/1969 · OTP: 12312</td></tr>
      <tr><td>Variation file</td><td>local_testing/Local2/variation/vB.js</td></tr>
      <tr><td>Figma reference</td><td>local_testing/Local2/SIC24.png</td></tr>
    </table>
  </div>

  <!-- FIGMA -->
  <div class="section" id="figma">
    <h2>2. Figma Reference — SIC24</h2>
    ${figmaB64 ? `<img src="${figmaB64}" alt="SIC24 Figma" style="max-width:100%;border:1px solid #dde1e7;border-radius:6px"/>` : '<p><em>Figma image not found at expected path.</em></p>'}
    <div style="margin-top:16px">
      <p style="font-weight:600;margin-bottom:8px">Key Figma requirements extracted:</p>
      <ul style="padding-left:20px;font-size:13px;line-height:2">
        <li>Add "Queue" as 5th breadcrumb step (Consult &rsaquo; Reasons &rsaquo; Details &rsaquo; Verify &rsaquo; <strong>Queue</strong>)</li>
        <li>Card header: green pulsing dot · bold "In queue" · separator · "Waiting for next available doctor"</li>
        <li>Card body: small green checkmark circle · "Thank you, [Name]." · 2 paragraphs</li>
        <li>Footer: outlined grey "Leave Queue" button (replaces "Cancel Request")</li>
        <li>Modal on Leave Queue: "Are you sure you want to leave the queue?" · "Leaving now means you'll lose your place." · blue "Stay in Queue" button · grey "Leave Queue" link · X close button</li>
        <li>Page should use funnel-style layout matching preceding steps</li>
        <li>Remove flashing where possible</li>
        <li>When doctor accepts consultation → page state changes → variation must NOT apply anymore (removeBlock logic)</li>
      </ul>
    </div>
  </div>

  <!-- MATRIX -->
  <div class="section" id="matrix">
    <h2>3. Test Result Matrix</h2>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>Test Case</th>${bHeaders}</tr></thead>
      <tbody>${matrixRows}</tbody>
    </table>
    </div>
  </div>

  <!-- BUGS -->
  <div class="section" id="bugs">
    <h2>4. Bugs &amp; Issues Found</h2>
    ${bugsHtml}
  </div>

  <!-- CODE ANALYSIS -->
  <div class="section" id="code">
    <h2>5. Code Analysis — vB.js</h2>
    <table>
      <thead><tr><th>Item</th><th>File / Line area</th><th>Observation</th><th>Severity</th></tr></thead>
      <tbody>
        <tr>
          <td>Double cancel click</td>
          <td><code>bindModal()</code> — <code>#cqm-leave</code> listener</td>
          <td><code>realBtn.click()</code> is called inline AND via <code>triggerCancel()</code> — cancel fired twice</td>
          <td><span class="badge fail">HIGH</span></td>
        </tr>
        <tr>
          <td><code>#custom-queue-modal + div {display:none}</code></td>
          <td>CSS style block</td>
          <td>Hides the sibling div of the modal. If removeBlock() fires after the next page renders (150 ms debounce delay), the next page's root element may be invisible</td>
          <td><span class="badge fail">HIGH</span></td>
        </tr>
        <tr>
          <td>Stray closing brace</td>
          <td>End of <code>style.innerHTML</code> CSS string</td>
          <td>Extra <code>}</code> after the <code>@media</code> block — invalid CSS; ignored by browsers but flags in linters</td>
          <td><span class="badge skip">MEDIUM</span></td>
        </tr>
        <tr>
          <td>Hardcoded patient name</td>
          <td>HTML template — <code>.cqb-title</code></td>
          <td><code>"Thank you, Bruce Richardson."</code> — not dynamic, every user sees this name</td>
          <td><span class="badge skip">MEDIUM</span></td>
        </tr>
        <tr>
          <td>Fixed-width Stay button</td>
          <td><code>.cqm-stay</code> CSS — <code>width: 288px</code></td>
          <td>Overflows on viewports narrower than ~330px; should be <code>width: 100%</code></td>
          <td><span class="badge skip">LOW</span></td>
        </tr>
        <tr>
          <td>removeBlock() timing race</td>
          <td><code>startKeepAlive()</code> — debounce 150 ms</td>
          <td>React may render the next step's DOM before removeBlock fires, briefly showing the variation on the wrong page state</td>
          <td><span class="badge skip">LOW</span></td>
        </tr>
        <tr>
          <td>Background color rule</td>
          <td><code>.sic24_test .MuiGrid2-container</code> CSS</td>
          <td>Sets background to #FAFBFA — matches Figma. Correctly removed when <code>sic24_test</code> class is removed.</td>
          <td><span class="badge pass">OK</span></td>
        </tr>
        <tr>
          <td><code>removeBlock()</code> logic</td>
          <td><code>injectBlock()</code> — cancel button check</td>
          <td>Correctly removes <code>#custom-queue-block</code>, <code>#custom-queue-modal</code>, and <code>sic24_test</code> class when cancel button disappears</td>
          <td><span class="badge pass">OK</span></td>
        </tr>
        <tr>
          <td>Modal backdrop rule</td>
          <td><code>live("#custom-queue-modal")</code></td>
          <td>Click on backdrop ID closes modal — correct implementation</td>
          <td><span class="badge pass">OK</span></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px;padding:16px;background:#fff8e1;border-radius:6px;border-left:4px solid #f9a825">
      <strong>Suggested Fix for BUG-01 (double cancel click):</strong>
      <pre class="code-block">// BEFORE (broken)
live("#cqm-leave", "click", function(e) {
  var realBtn = iframeDoc.querySelector(REAL_CANCEL_SELECTOR);
  if (realBtn) realBtn.click();   // ← REMOVE THIS LINE
  e.preventDefault();
  closeModal();
  triggerCancel();                 // ← keep only this
}, iframeDoc);

// AFTER (fixed)
live("#cqm-leave", "click", function(e) {
  e.preventDefault();
  closeModal();
  triggerCancel();
}, iframeDoc);</pre>
    </div>

    <div style="margin-top:16px;padding:16px;background:#fff8e1;border-radius:6px;border-left:4px solid #f9a825">
      <strong>Suggested Fix for BUG-02 (CSS hiding next page):</strong>
      <pre class="code-block">// REMOVE this CSS rule entirely from style.innerHTML:
// #custom-queue-modal + div {
//     display: none !important;
// }
// removeBlock() already removes #custom-queue-modal from the DOM,
// so this rule is no longer needed and causes a 150ms visibility gap.</pre>
    </div>
  </div>

  <!-- SCREENSHOTS -->
  <div class="section" id="screenshots">
    <h2>6. Screenshots — All Browsers</h2>
    ${(() => {
      if (!fs.existsSync(SS_DIR)) return '<p><em>No screenshots directory found.</em></p>';
      const files = fs.readdirSync(SS_DIR).filter(f => f.endsWith('.png'));
      if (!files.length) return '<p><em>No screenshots captured.</em></p>';
      return '<div class="ss-row">' +
        files.map(f => {
          const b64 = imgB64(path.join(SS_DIR, f));
          return b64 ? `<div class="ss-wrap"><img src="${b64}" alt="${f}"/><div class="ss-caption">${f.replace('.png','')}</div></div>` : '';
        }).join('') +
        '</div>';
    })()}
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;font-size:12px;color:#999;padding:24px 0">
    SIC-24 QA Report &nbsp;·&nbsp; Generated ${new Date().toLocaleString('en-AU')} &nbsp;·&nbsp; Tester: sarthak@brillmark.com
  </div>

</div>
</body>
</html>`;

    fs.writeFileSync(OUTPUT, html, 'utf8');
    console.log(`\n[SIC-24 Reporter] Report written → ${OUTPUT}\n`);
  }
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

module.exports = Sic24Reporter;
