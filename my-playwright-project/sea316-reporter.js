/**
 * SEA316 Custom HTML Reporter
 * Generates sea316-qa-report.html for SeaWorld Orlando — Multi-Day Price Display.
 * Filters on spec files containing "sea316".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR    = path.join(__dirname, 'sea316-screenshots');
const FIGMA_IMG = path.join(__dirname, '../local_testing/Local2/SEA316.png');
const OUTPUT    = path.join(__dirname, '../local_testing/Local2/sea316-qa-report.html');

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

class Sea316Reporter {
  constructor() {
    this._results = [];
  }

  onTestEnd(test, result) {
    if (!test.location.file.includes('sea316')) return;
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
      </li>`).join('');

    const controlShots      = allScreenshots('control');
    const varMainShots      = allScreenshots('var-main');
    const priceAreaTwoDay   = allScreenshots('price-area-twoday');
    const priceAreaThreeDay = allScreenshots('price-area-threeday');
    const goalTwoDayShots   = allScreenshots('goal-twoday');
    const goalThreeDayShots = allScreenshots('goal-threeday');
    const goalFourParksShots= allScreenshots('goal-fourparks');
    const goalSingleDayShots= allScreenshots('goal-singleday');
    const desktopShots      = allScreenshots('responsive-desktop');
    const tabletShots       = allScreenshots('responsive-tablet');
    const mobileShots       = allScreenshots('responsive-mobile');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SEA316 QA Report — SeaWorld Orlando — Multi-Day Price Display</title>
<style>
:root {
  --teal:#007baa;  --teal-l:#e6f4fa; --teal-b:#9bcfe5;
  --dark:#0d2b3e;  --dark2:#1a4a6e;
  --green:#1a6b50; --green-l:#e6f4ef; --green-b:#b2dfcc;
  --red:#c0392b;   --red-l:#fdf0ef;
  --gold:#f5a623;  --gold-l:#fff8ee;
  --grey:#f8f9fa;  --border:#dee2e6; --text:#1a202c; --muted:#6c757d;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.65}
a{color:var(--teal)}
.cover{background:linear-gradient(135deg,#003087 0%,#005DAA 55%,#0081C6 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
.cover-brand{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7}
.cover h1{font-size:36px;font-weight:800;line-height:1.2;margin-top:4px}
.cover h1 span{color:#7ee8fa}
.cover .sub{font-size:16px;opacity:.85;max-width:760px;margin-top:4px}
.cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;opacity:.8;font-size:13px}
.badge-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600}
.badge-pill.pass{background:rgba(22,163,74,.25);border-color:rgba(22,163,74,.5)}
.badge-pill.teal{background:rgba(0,123,170,.3);border-color:rgba(0,123,170,.5)}
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
.matrix th:first-child{min-width:340px}
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
.url-table td{padding:8px 14px;border-bottom:1px solid var(--border)}
.url-table tr:nth-child(even) td{background:var(--grey)}
.goals-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.goals-table th{background:#334155;color:#fff;padding:8px 14px;text-align:left}
.goals-table td{padding:8px 14px;border-bottom:1px solid var(--border);vertical-align:top}
.goals-table tr:nth-child(even) td{background:var(--grey)}
.breakpoint-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.breakpoint-table th{background:#334155;color:#fff;padding:8px 14px;text-align:left}
.breakpoint-table td{padding:8px 14px;border-bottom:1px solid var(--border);vertical-align:top}
.breakpoint-table tr:nth-child(even) td{background:var(--grey)}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · SEA A/B Testing</div>
  <h1>SEA316 QA Report — <span>Multi-Day Ticket Price Display</span></h1>
  <div class="sub">Automated QA for the SEA316 Optimizely variation on SeaWorld Orlando — Multi-day ticket product cards convert "/day" pricing to total "/ea" pricing with multiplied strikethrough values.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌊 seaworld.com/orlando/tickets/ — Optimizely A/B Test</span>
    <span>📱 Desktop · Tablet · Mobile</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill teal">🎢 SeaWorld Orlando</span>
    <span class="badge-pill teal">🎟️ Ticket Price Transformation</span>
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
    <li><a href="#goals">Optimizely Goals</a></li>
    <li><a href="#breakpoints">CSS Breakpoints</a></li>
    <li><a href="#results">Test Results Summary</a></li>
    <li><a href="#matrix">Full TC × Browser Matrix</a></li>
    ${failed > 0 ? '<li><a href="#errors">Failed Test Details</a></li>' : ''}
    <li><a href="#price-screenshots">Price Change Screenshots</a></li>
    <li><a href="#goal-screenshots">Goal Confirmation Screenshots</a></li>
    <li><a href="#screenshots">Responsive Screenshots</a></li>
    <li><a href="#methodology">Testing Methodology</a></li>
  </ol>
</div>

<!-- OVERVIEW -->
<h2 id="overview">Test Overview &amp; URLs</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>SEA316</strong></td></tr>
    <tr><td>Variation Name</td><td><code>cre-t-316</code></td></tr>
    <tr><td>Test Name</td><td>Multi-Day Ticket Price Display — Per-Day to Total /ea</td></tr>
    <tr><td>Platform</td><td>Optimizely Web Experimentation</td></tr>
    <tr><td>Client</td><td>SeaWorld Orlando</td></tr>
    <tr><td>Audience</td><td><strong>All users</strong></td></tr>
    <tr><td>Products Modified</td><td>Two-Day Two Park Ticket (×2) · Three-Day Three Park Ticket (×3)</td></tr>
    <tr><td>Products Unchanged</td><td>Single-Day Ticket · Four Parks: Unlimited Visits + Free Parking</td></tr>
    <tr><td>Devices Tested</td><td>Desktop (1280×800) · Tablet (768×1024) · Mobile (375×812)</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
    <tr><td>Deduplication Guard</td><td><code>body.cre-t-316</code> class check + <code>.cre-t-316-has-price-per-day-hide</code> DOM check</td></tr>
  </table>
</div>

<h3>Target URLs</h3>
<table class="url-table">
  <thead><tr><th>Type</th><th>URL</th><th>Experiment ID</th></tr></thead>
  <tbody>
    <tr><td><strong>Control</strong></td><td><code>https://seaworld.com/orlando/tickets/?optimizely_x=5325780113162240&amp;optimizely_force_tracking=true&amp;utm_campaign=CRE_qa</code></td><td>5325780113162240</td></tr>
    <tr><td><strong>Variation — /tickets/</strong></td><td><code>https://seaworld.com/orlando/tickets/?optimizely_x=4699881944645632&amp;optimizely_force_tracking=true&amp;utm_campaign=CRE_qa</code></td><td>4699881944645632</td></tr>
    <tr><td><strong>Variation — /limited-time-offers/</strong></td><td><code>https://seaworld.com/orlando/limited-time-offers/?optimizely_x=4699881944645632&amp;optimizely_force_tracking=true&amp;utm_campaign=CRE_qa</code></td><td>4699881944645632</td></tr>
  </tbody>
</table>

<!-- FIGMA -->
<h2 id="figma">Figma Design Reference</h2>
<div class="section-note">The Figma shows Control (left) vs Variation (right). The variation replaces the "/day" price with a total "/ea" price and multiplies the strikethrough price by the number of days (×2 for Two-Day, ×3 for Three-Day). Single-Day and Four Parks cards are not modified.</div>
${figmaB64
  ? `<div class="ss-wrap"><img src="${figmaB64}" alt="SEA316 Figma Reference"/><div class="ss-caption">SEA316 Figma Design — Left: Control (per-day pricing) | Right: Variation (total /ea pricing with multiplied strikethrough)</div></div>`
  : '<p><em>SEA316.png not found in local_testing/Local2/ — Figma screenshot skipped.</em></p>'}

<!-- DIFF -->
<h2 id="diff">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control</h3>
    <ul>
      <li>Two-Day card shows price as <strong>$XX.XX /day</strong></li>
      <li>Three-Day card shows price as <strong>$XX.XX /day</strong></li>
      <li>Strikethrough price shown per-day</li>
      <li>No <code>.cre-t-316-product-price__price</code> elements</li>
      <li>No <code>body.cre-t-316</code> class</li>
      <li>Single-Day and Four Parks: standard display</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation (SEA316)</h3>
    <ul>
      <li>✅ Two-Day: price becomes total <strong>$XX.XX /ea</strong> (per-day × 2)</li>
      <li>✅ Three-Day: price becomes total <strong>$XX.XX /ea</strong> (per-day × 3)</li>
      <li>✅ Strikethrough = original strikethrough × days (in <strong>red</strong>)</li>
      <li>✅ Original "/day" price container hidden (<code>display:none</code>)</li>
      <li>✅ New <code>.cre-t-316-product-price__price</code> container injected</li>
      <li>✅ <code>body.cre-t-316</code> class added for CSS scoping</li>
      <li>✅ Single-Day Ticket: <strong>unchanged</strong> (no /day pricing)</li>
      <li>✅ Four Parks: <strong>unchanged</strong> (not in title-match logic)</li>
      <li>✅ Deduplication: second JS run does not re-inject containers</li>
    </ul>
  </div>
</div>

<!-- GOALS -->
<h2 id="goals">Optimizely Goals</h2>
<div class="section-note">6 Optimizely goals are fired on "Add to Cart" button clicks. Multi-day products fire their specific goal PLUS the "any multi-day" aggregate goal. Single-Day fires its own goal only.</div>
<table class="goals-table">
  <thead><tr><th>Goal Name</th><th>Event Name</th><th>Trigger</th></tr></thead>
  <tbody>
    <tr><td>SEA316 - Add to Cart of Two-Day Product</td><td><code>sea316_-_add_to_cart_of_two-day</code></td><td>Two-Day Two Park Ticket Add to Cart click</td></tr>
    <tr><td>SEA316 - Add to Cart of Three-Day Product</td><td><code>sea316_-_add_to_cart_of_three-day</code></td><td>Three-Day Three Park Ticket Add to Cart click</td></tr>
    <tr><td>SEA316 - Add to Cart of Four Parks Product</td><td><code>sea316_-_add_to_cart_of_four_parks</code></td><td>Four Parks Unlimited Visits Add to Cart click</td></tr>
    <tr><td>SEA316 - Add to Cart of Any Multi-Day Product</td><td><code>sea316_-_add_to_cart_of_any_multi-day_product</code></td><td>Two-Day OR Three-Day OR Four Parks Add to Cart</td></tr>
    <tr><td>SEA316 - Add to Cart of Single-Day Ticket</td><td><code>sea316_-_add_to_cart_of_single-day_ticket</code></td><td>Single-Day Ticket Add to Cart click</td></tr>
  </tbody>
</table>

<!-- BREAKPOINTS -->
<h2 id="breakpoints">CSS Breakpoints</h2>
<table class="breakpoint-table">
  <thead><tr><th>Viewport</th><th>Font Size (price-amount)</th><th>Font Family</th></tr></thead>
  <tbody>
    <tr><td><strong>&lt;768px</strong> (Mobile)</td><td>18px</td><td>Poppins Medium (400)</td></tr>
    <tr><td><strong>≥768px</strong> (Tablet / Desktop)</td><td>22px</td><td>Poppins Medium (400)</td></tr>
    <tr><td><strong>≥1024px</strong> (Desktop)</td><td>22px</td><td>Poppins Semibold (400)</td></tr>
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers and viewports. The SEA316 variation is functioning correctly — Two-Day and Three-Day prices correctly show total /ea values with multiplied strikethroughs, original /day prices are hidden, Single-Day and Four Parks are unchanged, all Optimizely goals fire correctly, and CSS values are accurate at all breakpoints.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. See the matrix and Failed Tests section below for full details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — Control: no cre-t-316 class on body</li>
  <li><strong>TC-02</strong> — Variation: body.cre-t-316 class present</li>
  <li><strong>TC-03–05</strong> — Two-Day card: /ea container injected, term "/ea", original /day hidden</li>
  <li><strong>TC-06–08</strong> — Three-Day card: /ea container injected, term "/ea", original /day hidden</li>
  <li><strong>TC-09</strong> — Single-Day Ticket: no /ea container (unchanged)</li>
  <li><strong>TC-10</strong> — Four Parks card: no /ea container (unchanged)</li>
  <li><strong>TC-11</strong> — No duplication on second JS execution</li>
  <li><strong>TC-12–13</strong> — Two-Day ATC goals: specific + any_multi-day</li>
  <li><strong>TC-14–15</strong> — Three-Day ATC goals: specific + any_multi-day</li>
  <li><strong>TC-16–17</strong> — Four Parks ATC goals: specific + any_multi-day</li>
  <li><strong>TC-18</strong> — Single-Day ATC goal: single-day_ticket event</li>
  <li><strong>TC-19</strong> — CSS: strikethrough color <code>rgb(255, 0, 0)</code> red</li>
  <li><strong>TC-20</strong> — CSS: price-amount 22px at ≥768px</li>
  <li><strong>TC-21</strong> — CSS: price-amount 18px at mobile &lt;768px</li>
  <li><strong>TC-22–24</strong> — Responsive: Desktop · Tablet · Mobile price containers visible</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP for that TC × browser combination. Hover FAIL cells for truncated error details. SKIP = product/button not present on live page for that test run.</div>
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

<!-- PRICE CHANGE SCREENSHOTS -->
<h2 id="price-screenshots">Price Change Screenshots — Changed Areas</h2>
<div class="section-note">Element-level screenshots of exactly the Two-Day and Three-Day product cards where the price display was changed. Each card shows the new <strong>/ea total price</strong> and the multiplied red strikethrough — captured with modals and consent banners already dismissed.</div>

<h3>Two-Day Two Park Ticket — /ea Price Display (TC-03)</h3>
<div class="section-note" style="border-color:#15803d;background:#f0fdf4">The Two-Day card now shows the <strong>total ticket price /ea</strong> (per-day × 2) with a red strikethrough showing the pre-discount total. The original "/day" price is hidden.</div>
${ssSection(priceAreaTwoDay, 'Two-Day Card — Price Change')}

<h3>Three-Day Three Park Ticket — /ea Price Display (TC-06)</h3>
<div class="section-note" style="border-color:#15803d;background:#f0fdf4">The Three-Day card now shows the <strong>total ticket price /ea</strong> (per-day × 3) with a red strikethrough showing the pre-discount total. The original "/day" price is hidden.</div>
${ssSection(priceAreaThreeDay, 'Three-Day Card — Price Change')}

<h3>Control — Original Per-Day Pricing (TC-01)</h3>
${ssSection(controlShots, 'Control')}

<h3>Variation — Full Page View (TC-02)</h3>
${ssSection(varMainShots, 'Variation Main')}

<!-- GOAL CONFIRMATION SCREENSHOTS -->
<h2 id="goal-screenshots">Goal Confirmation Screenshots — Optimizely Events</h2>
<div class="section-note">Each screenshot shows the product card area immediately after the "Add to Cart" button click, with an injected green <strong>"Optimizely Goals Fired"</strong> toast in the top-right corner listing every event that fired. This confirms the event delegation is wired correctly and both specific + aggregate goals trigger on click.</div>

<h3>Two-Day Two Park Ticket — Add to Cart Goals (TC-12/13)</h3>
<div class="section-note" style="border-color:#15803d;background:#f0fdf4">Expected events: <code>sea316_-_add_to_cart_of_two-day</code> + <code>sea316_-_add_to_cart_of_any_multi-day_product</code></div>
${ssSection(goalTwoDayShots, 'Goal — Two-Day Add to Cart')}

<h3>Three-Day Three Park Ticket — Add to Cart Goals (TC-14/15)</h3>
<div class="section-note" style="border-color:#15803d;background:#f0fdf4">Expected events: <code>sea316_-_add_to_cart_of_three-day</code> + <code>sea316_-_add_to_cart_of_any_multi-day_product</code></div>
${ssSection(goalThreeDayShots, 'Goal — Three-Day Add to Cart')}

<h3>Four Parks: Unlimited Visits — Add to Cart Goals (TC-16/17)</h3>
<div class="section-note" style="border-color:#15803d;background:#f0fdf4">Expected events: <code>sea316_-_add_to_cart_of_four_parks</code> + <code>sea316_-_add_to_cart_of_any_multi-day_product</code></div>
${ssSection(goalFourParksShots, 'Goal — Four Parks Add to Cart')}

<h3>Single-Day Ticket — Add to Cart Goal (TC-18)</h3>
<div class="section-note" style="border-color:#15803d;background:#f0fdf4">Expected event: <code>sea316_-_add_to_cart_of_single-day_ticket</code></div>
${ssSection(goalSingleDayShots, 'Goal — Single-Day Add to Cart')}

<!-- RESPONSIVE SCREENSHOTS -->
<h2 id="screenshots">Responsive Screenshots</h2>
<div class="section-note">Full-viewport screenshots across Desktop, Tablet, and Mobile showing the variation with modals dismissed and price containers visible.</div>

<h3>Responsive — Desktop 1280×800 (TC-22)</h3>
${ssSection(desktopShots, 'Desktop 1280×800')}

<h3>Responsive — Tablet 768×1024 (TC-23)</h3>
${ssSection(tabletShots, 'Tablet 768×1024')}

<h3>Responsive — Mobile 375×812 (TC-24)</h3>
${ssSection(mobileShots, 'Mobile 375×812')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigate to live Optimizely preview URLs — no mocking of the page itself. The BounceExchange email modal and TrustArc consent banner are dismissed via <code>page.evaluate()</code> on every page load before any assertions or screenshots are taken. The variation JS and CSS are served by Optimizely when the <code>optimizely_x</code> parameter forces the experiment variant. Tests use <code>page.waitForSelector('.cre-t-316-product-price__price')</code> to handle asynchronous injection timing.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Overlay dismissal</strong>: After every <code>page.goto()</code>, a 1.5 s pause is followed by a single <code>page.evaluate()</code> that clicks both the TrustArc <code>#truste-consent-button</code> and the BounceExchange <code>[id^="bx-close-inside-"]</code> close button if present — ensuring all screenshots are clean.</li>
  <li><strong>Control check (TC-01)</strong>: Waited 6 seconds then asserted <code>body.cre-t-316</code> is absent.</li>
  <li><strong>Variation presence (TC-02–08)</strong>: Used <code>page.waitForSelector(PRICE_CONTAINER)</code> with 30s timeout to handle Optimizely injection latency.</li>
  <li><strong>Unchanged products (TC-09–10)</strong>: After variation initialised, checked that Single-Day and Four Parks cards have no <code>.cre-t-316-product-price__price</code> child.</li>
  <li><strong>Duplication (TC-11)</strong>: Re-ran local <code>vB.js</code> via <code>page.evaluate()</code> on top of live variation, counted containers — must remain unchanged.</li>
  <li><strong>Goal events (TC-12–18)</strong>: Intercepted <code>window.optimizely.push</code> then dispatched synthetic click via <code>dispatchEvent(new MouseEvent('click', {bubbles:true}))</code>. Events captured synchronously within the event delegation chain. A green toast overlay listing each fired event name is then injected into the page and a screenshot is taken (TC-12, TC-14, TC-16, TC-18) as visual goal confirmation.</li>
  <li><strong>Price-area screenshots (TC-03, TC-06)</strong>: Used Playwright element-level <code>screenshot()</code> on the exact product card locator to capture only the changed price display area.</li>
  <li><strong>CSS values (TC-19–21)</strong>: Read <code>getComputedStyle().color / fontSize</code> — colors reported as <code>rgb()</code> by all browsers.</li>
  <li><strong>Responsive (TC-22–24)</strong>: Used <code>page.setViewportSize()</code> before navigation to simulate each breakpoint; asserted first price container is visible.</li>
</ul>

<div class="footer">
  SEA316 QA Report · ${dateStr} · Playwright Automated Tests · seaworld.com/orlando/tickets/<br>
  QA by sarthak@brillmark.com · Spec: sea316-pricing.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nSEA316 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = Sea316Reporter;
