/**
 * CRE-T-137 Custom HTML Reporter
 * Generates local_testing/Local2/cre-t-137-qa-report.html
 * Pet Insurance Gurus — "Vets love pet insurance" FAQ + Vet Approved Nav Link
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR  = path.join(__dirname, 'cre-t-137-screenshots');
const OUTPUT  = path.join(__dirname, '../local_testing/Local2/cre-t-137-qa-report.html');

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

class CreT137Reporter {
  constructor() { this._results = []; }

  onTestEnd(test, result) {
    if (!test.location.file.includes('cre-t-137')) return;
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
      if (!status)              return '<span class="badge skip">—</span>';
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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CRE-T-137 QA Report — Pet Insurance Gurus — Vet FAQ + Nav Link</title>
<style>
:root {
  --teal:#007baa; --teal-l:#e6f4fa; --teal-b:#9bcfe5;
  --dark:#0d2b3e; --dark2:#1a4a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b; --red-l:#fdf0ef;
  --amber:#b45309; --amber-l:#fffbeb; --amber-b:#fcd34d;
  --grey:#f8f9fa; --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
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
.badge-pill.warn{background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)}
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
.kpi.pass{background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail{background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip{background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:var(--teal)}
.kpi.pass  .num{color:#16a34a}
.kpi.fail  .num{color:var(--red)}
.kpi.skip  .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:var(--teal);color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:380px}
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
.diff-card.v1{background:var(--teal-l);border-color:var(--teal)}
.diff-card.v2{background:#f0fff4;border-color:#16a34a}
.diff-card.bug{background:var(--amber-l);border-color:var(--amber)}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}
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
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid var(--teal)}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · Pet Insurance Gurus A/B Testing</div>
  <h1>CRE-T-137 QA Report — <span>Vet FAQ + Vet Approved Nav Link</span></h1>
  <div class="sub">Automated QA for CRE-T-137 — Both variations inject a "Vets love pet insurance" FAQ accordion after the existing FAQ list. V2 additionally adds a "Vet Approved" nav link that smooth-scrolls to and opens the new FAQ.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 petinsurancegurus.com — Homepage</span>
    <span>📱 Desktop · Tablet · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill warn">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill teal">🐾 Pet Insurance Gurus</span>
    <span class="badge-pill amber">⚠️ 3 Pre-flight Code Bugs Flagged</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#wireframe">Wireframe Reference</a></li>
    <li><a href="#preflight">Pre-flight Code Review Bugs</a></li>
    <li><a href="#diff">Control vs V1 vs V2</a></li>
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
    <tr><td>Test ID</td><td><strong>CRE-T-137</strong></td></tr>
    <tr><td>Variation Class</td><td><code>cre-t-137</code></td></tr>
    <tr><td>Test Name</td><td>"Vets love pet insurance" FAQ + Vet Approved Nav Link</td></tr>
    <tr><td>Platform</td><td>Convert.com A/B Test — 1 Control, 2 Variations</td></tr>
    <tr><td>Client</td><td>Pet Insurance Gurus</td></tr>
    <tr><td>Audience Targeting</td><td>All users — Desktop, Mobile, Tablet</td></tr>
    <tr><td>V1 Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>V2 Files</td><td><code>local_testing/Local2/variation/js.js</code> + <code>hello.css</code></td></tr>
    <tr><td>FAQ Injection Point</td><td><code>.faq-container .oxy-pro-accordion .oxy-pro-accordion_item:last-child</code> (insertAdjacentHTML afterend)</td></tr>
    <tr><td>V2 Nav Injection</td><td><code>.oxy-site-navigation.header-nav ul li.menu-item</code> (insertAdjacentHTML beforebegin)</td></tr>
    <tr><td>FAQ Content</td><td>Question: "Vets love pet insurance" · Answer: full paragraph (editable in Convert)</td></tr>
    <tr><td>Devices Tested</td><td>Desktop 1280×800 · Tablet 768×1024 · Mobile 375×812</td></tr>
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
    <tr><td><strong>Control</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052380.1000256235</code></td><td>1000256235</td></tr>
    <tr><td><strong>V1</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052380.1000256236</code></td><td>1000256236</td></tr>
    <tr><td><strong>V2</strong></td><td><code>https://petinsurancegurus.com/?cro_mode=qa&amp;_conv_eforce=100052380.1000256237</code></td><td>1000256237</td></tr>
  </tbody>
</table>

<!-- WIREFRAME -->
<h2 id="wireframe">Wireframe Reference</h2>
<div class="section-note">The Wireframe.jpg shows the Pet Insurance Gurus homepage with two red annotation arrows:
  (1) "Add 'Vet approved' link here" pointing to the navigation area (between existing nav links and Prices button).
  (2) "Add additional FAQ here" pointing to the bottom of the existing FAQ list, after "You're always in control".
  The FAQ items use the same accordion style (+/− toggle) as existing items.</div>

<!-- PRE-FLIGHT -->
<h2 id="preflight">⚠️ Pre-flight Code Review Bugs</h2>
<div class="alert-warn">⚠️ The following bugs were identified by reading js.js / vB.js / hello.css / vB.css BEFORE running tests. Tests assert against actual code behavior; these bugs require developer review.</div>

<div style="display:grid;gap:16px;margin:20px 0">
  <div class="diff-card bug">
    <h3>BUG-01 [V2 · MEDIUM] — scrollToEl() missing window.scrollY</h3>
    <ul>
      <li><strong>File:</strong> <code>js.js</code>, <code>scrollToEl()</code> function</li>
      <li><strong>Code:</strong> <code>var top = scrollHeight - 100; scrollTo(&#123; top: top &#125;)</code></li>
      <li><strong>Issue:</strong> <code>getBoundingClientRect().top</code> returns the element's distance from the current viewport top — NOT from the document top. Without adding <code>window.scrollY</code>, the scroll target is only accurate when the page starts at the top (<code>scrollY = 0</code>).</li>
      <li><strong>Fix:</strong> <code>var top = window.scrollY + scrollHeight - 100;</code></li>
      <li><strong>Impact:</strong> If a user has already scrolled down and clicks "Vet Approved" again (e.g. after reading the FAQ and scrolling back up to nav), the scroll target will be wrong. In the primary use case (click from page top), it works correctly.</li>
    </ul>
  </div>
  <div class="diff-card bug">
    <h3>BUG-02 [V2 · LOW] — "Vet Approved" &lt;li&gt; has no inner &lt;a&gt; tag</h3>
    <ul>
      <li><strong>File:</strong> <code>js.js</code>, <code>addVetApprovedLink()</code></li>
      <li><strong>Code:</strong> <code>&lt;li class='cre-t-137-vetApprovedLink'&gt; Vet Approved &lt;/li&gt;</code></li>
      <li><strong>Issue:</strong> All existing nav items are <code>&lt;li&gt;&lt;a href="#"&gt;...&lt;/a&gt;&lt;/li&gt;</code>. Site CSS for nav font, padding, line-height, and hover effects likely targets <code>li a</code> — those rules won't apply to a bare <code>&lt;li&gt;</code> without an <code>&lt;a&gt;</code>. Result: "Vet Approved" may have different font size, weight, padding, or spacing than "How We Rank", "About", "Contact".</li>
      <li><strong>Recommendation:</strong> Wrap in <code>&lt;a href="javascript:void(0)"&gt;</code> or use <code>&lt;a role="button"&gt;</code> to inherit nav link styling.</li>
    </ul>
  </div>
  <div class="diff-card bug">
    <h3>BUG-03 [Both V1 &amp; V2 · LOW] — Duplicate color declaration in CSS</h3>
    <ul>
      <li><strong>Files:</strong> <code>vB.css</code> line 3, <code>hello.css</code> line 12</li>
      <li><strong>Code:</strong> <code>.cre-t-137-accordion_header &#123; color: #000000; ... color: inherit; &#125;</code></li>
      <li><strong>Issue:</strong> <code>color: inherit</code> always overrides <code>color: #000000</code> (same specificity, later declaration wins). The first <code>color: #000000</code> is a dead rule. Minor CSS quality issue, no functional impact.</li>
    </ul>
  </div>
</div>

<!-- DIFF -->
<h2 id="diff">Control vs V1 vs V2</h2>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin:20px 0">
  <div class="diff-card control">
    <h3>Control</h3>
    <ul>
      <li>Standard Pet Insurance Gurus homepage</li>
      <li>No new FAQ accordion item</li>
      <li>No <code>.cre-t-137-accordion_item</code></li>
      <li>No <code>body.cre-t-137</code> class</li>
      <li>Nav unchanged (no "Vet Approved")</li>
    </ul>
  </div>
  <div class="diff-card v1">
    <h3>V1 (vB.js + vB.css)</h3>
    <ul>
      <li>✅ <code>body.cre-t-137</code> class added</li>
      <li>✅ New FAQ item appended after last existing FAQ</li>
      <li>✅ Question: "Vets love pet insurance" (uppercase via CSS)</li>
      <li>✅ Full answer paragraph (editable in Convert)</li>
      <li>✅ Accordion toggle: open/close with 300ms slideToggle</li>
      <li>✅ Mutual exclusion with existing FAQs</li>
      <li>✅ Active/hover color: <code>#0272e4</code></li>
      <li>❌ No "Vet Approved" nav link</li>
    </ul>
  </div>
  <div class="diff-card v2">
    <h3>V2 (js.js + hello.css)</h3>
    <ul>
      <li>✅ All V1 features above</li>
      <li>✅ "Vet Approved" nav link (before first nav item)</li>
      <li>✅ Click → smooth-scroll to FAQ (100px offset from top)</li>
      <li>✅ Click → auto-opens accordion if closed</li>
      <li>✅ Hover color: <code>#0272E4</code>, cursor: pointer</li>
      <li>⚠️ BUG-01: scroll missing <code>window.scrollY</code></li>
      <li>⚠️ BUG-02: no <code>&lt;a&gt;</code> tag inside nav <code>&lt;li&gt;</code></li>
    </ul>
  </div>
</div>

<!-- RESULTS -->
<h2 id="results">Test Results Summary</h2>
<div class="kpi-row">
  <div class="kpi total"><span class="num">${totalRuns}</span><span class="lbl">Total Runs</span></div>
  <div class="kpi pass"><span class="num">${passed}</span><span class="lbl">Passed</span></div>
  <div class="kpi fail"><span class="num">${failed}</span><span class="lbl">Failed</span></div>
  <div class="kpi skip"><span class="num">${skipped}</span><span class="lbl">Skipped</span></div>
</div>

${failed === 0
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers and viewports. CRE-T-137 FAQ injection, accordion toggle, mutual exclusion, font-family match, active color, responsive visibility, V2 Vet Approved nav link, scroll behavior, and mobile DOM presence all verified.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section for full details.</div>`}

<h3>Test Coverage</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — Control: no new FAQ item injected</li>
  <li><strong>TC-02</strong> — Control: no "Vet Approved" link</li>
  <li><strong>TC-03</strong> — V1: body.cre-t-137 class added</li>
  <li><strong>TC-04</strong> — V1: new FAQ appended as last accordion item (no duplication)</li>
  <li><strong>TC-05</strong> — V1: FAQ question text = "Vets love pet insurance"</li>
  <li><strong>TC-06</strong> — V1: FAQ answer text exact match</li>
  <li><strong>TC-07</strong> — V1: no "Vet Approved" link (V1 must not have it)</li>
  <li><strong>TC-08</strong> — V1: accordion expands on click (aria-expanded=true, body visible)</li>
  <li><strong>TC-09</strong> — V1: accordion collapses on second click (aria-expanded=false)</li>
  <li><strong>TC-10</strong> — V1: mutual exclusion — opening new FAQ closes any open existing FAQ</li>
  <li><strong>TC-11</strong> — V1: FAQ header font-family matches existing items</li>
  <li><strong>TC-12</strong> — V1: FAQ header active color = #0272e4 / rgb(2,114,228)</li>
  <li><strong>TC-13</strong> — V1: new FAQ visible on desktop 1280×800</li>
  <li><strong>TC-14</strong> — V1: new FAQ visible on mobile 375×812</li>
  <li><strong>TC-15</strong> — V1: new FAQ visible on tablet 768×1024</li>
  <li><strong>TC-16</strong> — V2: body.cre-t-137 class added</li>
  <li><strong>TC-17</strong> — V2: new FAQ appended (same as V1)</li>
  <li><strong>TC-18</strong> — V2: "Vet Approved" nav link present with text "Vet Approved"</li>
  <li><strong>TC-19</strong> — V2: "Vet Approved" cursor = pointer</li>
  <li><strong>TC-20</strong> — V2: "Vet Approved" hover color = rgb(2,114,228) / #0272E4</li>
  <li><strong>TC-21</strong> — V2: click "Vet Approved" → FAQ accordion opens (aria-expanded=true)</li>
  <li><strong>TC-22</strong> — V2: click "Vet Approved" → FAQ positioned ≤250px from viewport top</li>
  <li><strong>TC-23</strong> — V2: accordion direct-click expands correctly</li>
  <li><strong>TC-24</strong> — V2: mutual exclusion same as V1</li>
  <li><strong>TC-25</strong> — V2: "Vet Approved" visible on desktop 1280×800</li>
  <li><strong>TC-26</strong> — V2: FAQ and Vet Approved both DOM-present on mobile 375×812</li>
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

<h3>TC-01 — Control: No New FAQ</h3>
${ssSection(allScreenshots('tc01-control'), 'Control — No FAQ')}

<h3>TC-07 — V1: Nav (No Vet Approved Link)</h3>
${ssSection(allScreenshots('tc07-v1-no-vet-link'), 'V1 — No Vet Link')}

<h3>TC-08 — V1: FAQ Accordion Open</h3>
${ssSection(allScreenshots('tc08-v1-faq-open'), 'V1 — FAQ Open')}

<h3>TC-13 — V1: Desktop 1280×800</h3>
${ssSection(allScreenshots('tc13-v1-desktop'), 'V1 Desktop')}

<h3>TC-14 — V1: Mobile 375×812</h3>
${ssSection(allScreenshots('tc14-v1-mobile'), 'V1 Mobile')}

<h3>TC-15 — V1: Tablet 768×1024</h3>
${ssSection(allScreenshots('tc15-v1-tablet'), 'V1 Tablet')}

<h3>TC-18 — V2: Vet Approved Link in Nav</h3>
${ssSection(allScreenshots('tc18-v2-vet-approved-link'), 'V2 — Vet Approved Link')}

<h3>TC-21 — V2: FAQ Opens After Vet Approved Click</h3>
${ssSection(allScreenshots('tc21-v2-vet-click-opens-faq'), 'V2 — Click Opens FAQ')}

<h3>TC-25 — V2: Desktop 1280×800</h3>
${ssSection(allScreenshots('tc25-v2-vet-link-desktop'), 'V2 Desktop')}

<h3>TC-26 — V2: Mobile 375×812</h3>
${ssSection(allScreenshots('tc26-v2-mobile'), 'V2 Mobile')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigated to live Convert.com preview URLs with <code>_conv_eforce</code> parameters. No local JS/CSS injection.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>FAQ injection (TC-04, TC-17)</strong>: Used <code>page.waitForSelector('.cre-t-137-accordion_item')</code> with 20s timeout to confirm async injection. Verified item is the last child in <code>.oxy-pro-accordion</code>.</li>
  <li><strong>Content checks (TC-05, TC-06)</strong>: Read <code>innerText()</code> from <code>.cre-t-137-accordion_title</code> and <code>.cre-t-137-accordion_content p</code>, compared exact strings.</li>
  <li><strong>Accordion open/close (TC-08, TC-09, TC-23)</strong>: Clicked header with <code>force:true</code> (to bypass any overlay), waited 450ms (300ms animation + buffer), then checked <code>aria-expanded</code> attribute and body visibility.</li>
  <li><strong>Mutual exclusion (TC-10, TC-24)</strong>: Opened existing FAQ via its jQuery handler, then clicked new FAQ — verified existing loses <code>active</code> class.</li>
  <li><strong>Font-family match (TC-11)</strong>: Read <code>getComputedStyle().fontFamily</code> from new and existing accordion headers, compared values.</li>
  <li><strong>Active color (TC-12)</strong>: Opened accordion (active state), then read <code>getComputedStyle().color</code> from <code>.cre-t-137-accordion_item.active .cre-t-137-accordion_header</code>.</li>
  <li><strong>Responsive (TC-13–15, TC-25–26)</strong>: Used <code>page.setViewportSize()</code> before navigation.</li>
  <li><strong>Vet Approved link (TC-18)</strong>: Verified DOM attachment + innerText trim = "Vet Approved".</li>
  <li><strong>Hover color (TC-20)</strong>: Called <code>.hover()</code> then read <code>getComputedStyle().color</code>.</li>
  <li><strong>Scroll + open (TC-21, TC-22)</strong>: Clicked Vet Approved link, waited 800ms (smooth scroll + animation), then checked <code>aria-expanded</code> and <code>boundingBox().y ≤ 250</code>.</li>
  <li><strong>Modal dismissal</strong>: Before interaction tests, attempted to close any CRE-T-133 ZIP modal via <code>.cre-t-133-close</code> selector.</li>
</ul>

<div class="footer">
  CRE-T-137 QA Report · ${dateStr} · Playwright Automated Tests · petinsurancegurus.com<br>
  QA by sarthak@brillmark.com · Spec: cre-t-137-vet-faq.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nCRE-T-137 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = CreT137Reporter;
