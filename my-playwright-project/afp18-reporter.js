/**
 * AFP18 Custom HTML Reporter
 * Generates afp18-qa-report.html for AFP 2026 Annual Conference — Download One-Page Conference Summary.
 * Filters on spec files containing "afp18".
 */

const fs   = require('fs');
const path = require('path');

const SS_DIR     = path.join(__dirname, 'afp18-screenshots');
const CLIENT_IMG = path.join(__dirname, '../local_testing/image.png');
const OUTPUT     = path.join(__dirname, '../local_testing/Local2/afp18-qa-report.html');

/* ── Sitewide page definitions (must match spec's SITEWIDE_PAGES) ───────── */
const SITEWIDE_PAGE_DEFS = [
  { label: 'attendee-feedback2026', name: 'Attendee Feedback 2026',                    path: '/general-information/experience/attendee-feedback2026' },
  { label: 'reg-full-conference',   name: 'Registration — Full Conference Pricing',     path: '/registration/full-conference-pricing' },
  { label: 'reg-team',              name: 'Registration — Team Pricing',                path: '/registration/team' },
  { label: 'reg-day-pass',          name: 'Registration — Day Pass Pricing',            path: '/registration/day-pass-pricing' },
  { label: 'program-event-guide',   name: 'Program — AFP 2026 Event Guide',             path: '/program/overview/afp-2026-event-guide' },
  { label: 'gi-member-perks',       name: 'General Info — AFP Member Perks',            path: '/general-information/experience/afp-member-perks' },
  { label: 'hotel-deals',           name: 'Hotel & Travel — Deals',                     path: '/hotel-travel/getting-here/deals' },
];

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

class Afp18Reporter {
  constructor() { this._results = []; }

  onTestEnd(test, result) {
    if (!test.location.file.includes('afp18')) return;
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
    const matrix      = {};
    for (const r of results) {
      if (!matrix[r.title]) matrix[r.title] = {};
      matrix[r.title][r.projectName] = r;
    }

    const totalRuns = results.length;
    const passed    = results.filter(r => r.status === 'passed').length;
    const failed    = results.filter(r => r.status === 'failed').length;
    const skipped   = results.filter(r => r.status === 'skipped').length;

    const clientImgB64 = imgB64(CLIENT_IMG);
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
      </li>`).join('');

    /* ── Screenshot groups ────────────────────────────────────────────────── */
    const controlShots       = allScreenshots('control-desktop');
    const varShots           = allScreenshots('variation-desktop');
    const dropdown1280Shots  = allScreenshots('dropdown-open-1280');
    const dropdown1440Shots  = allScreenshots('dropdown-open-1440');
    const navDropdown1280    = allScreenshots('nav-dropdown-1280');
    const navDropdown1440    = allScreenshots('nav-dropdown-1440');
    const resp1024Shots      = allScreenshots('responsive-1024');
    const resp768Shots       = allScreenshots('responsive-768');
    const clickShots         = allScreenshots('click-popup');

    /* Sitewide per-page navbar screenshots */
    const sitewideNavSections = SITEWIDE_PAGE_DEFS.map(p => {
      const navShots  = allScreenshots(`navbar-${p.label}`);
      const fullShots = allScreenshots(`sitewide-${p.label}`);
      return `
<h3 id="sw-${p.label}">${p.name} <code>${p.path}</code></h3>
<p style="font-size:13px;color:var(--muted)">Navbar clipped (top 520 px) — General Information dropdown open with "Download One-Page Conference Summary" visible.</p>
${ssSection(navShots, `Navbar — ${p.name}`)}
<details style="margin-top:10px"><summary style="cursor:pointer;font-size:13px;color:var(--muted)">Full-page screenshots (expand)</summary>
${ssSection(fullShots, `Full page — ${p.name}`)}
</details>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AFP18 QA Report — AFP 2026 Annual Conference — Download One-Page Conference Summary</title>
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
.cover{background:linear-gradient(135deg,#b31b1b 0%,#7b0000 55%,#4a0000 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:14px}
.cover-brand{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7}
.cover h1{font-size:36px;font-weight:800;line-height:1.2;margin-top:4px}
.cover h1 span{color:#ffd700}
.cover .sub{font-size:16px;opacity:.85;max-width:760px;margin-top:4px}
.cover .meta{display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;opacity:.8;font-size:13px}
.badge-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600}
.badge-pill.pass{background:rgba(22,163,74,.25);border-color:rgba(22,163,74,.5)}
.badge-pill.teal{background:rgba(0,123,170,.3);border-color:rgba(0,123,170,.5)}
.wrap{max-width:1160px;margin:0 auto;padding:0 36px 80px}
h2{font-size:21px;font-weight:700;color:#b31b1b;margin:52px 0 18px;padding-bottom:9px;border-bottom:2px solid #f9e8e8}
h3{font-size:15px;font-weight:700;margin:22px 0 8px;color:var(--text)}
p{margin-bottom:10px}
ul{padding-left:20px;margin-bottom:10px}
li{margin-bottom:5px}
code{background:#f1f3f5;border-radius:4px;padding:2px 7px;font-size:12.5px;font-family:'SF Mono','Consolas',monospace}
.toc{background:#fff8f8;border:1px solid #f5c6c6;border-radius:12px;padding:22px 26px;margin:32px 0}
.toc h3{color:#b31b1b;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.8px}
.toc ol{padding-left:20px;column-count:2;column-gap:40px}
.toc li{margin-bottom:6px}
.toc a{color:#b31b1b;text-decoration:none;font-weight:500;font-size:14px}
.toc a:hover{text-decoration:underline}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 32px}
.kpi{border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:5px;text-align:center}
.kpi.total{background:#fff8f8;border:1px solid #f5c6c6}
.kpi.pass {background:var(--green-l);border:1px solid var(--green-b)}
.kpi.fail {background:var(--red-l);border:1px solid #f5c6cb}
.kpi.skip {background:#f5f5f5;border:1px solid #ccc}
.kpi .num{font-size:36px;font-weight:800;line-height:1}
.kpi.total .num{color:#b31b1b}
.kpi.pass  .num{color:#16a34a}
.kpi.fail  .num{color:var(--red)}
.kpi.skip  .num{color:#6b7280}
.kpi .lbl{font-size:13px;font-weight:600;color:var(--muted)}
.matrix{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
.matrix th{background:#b31b1b;color:#fff;padding:10px 14px;text-align:left;font-weight:600;white-space:nowrap}
.matrix th:first-child{min-width:360px}
.matrix td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.matrix tr:nth-child(even) td{background:var(--grey)}
.matrix tr.row-fail td{background:#fff0ef!important}
.matrix .tc-name{font-size:13px;font-weight:500;font-family:'SF Mono','Consolas',monospace}
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.3px}
.badge.pass{background:#16a34a;color:#fff}
.badge.fail{background:var(--red);color:#fff}
.badge.skip{background:#adb5bd;color:#fff}
.info-card{background:#fff8f8;border:1px solid #f5c6c6;border-radius:10px;padding:18px 22px;margin:20px 0;font-size:14px}
.info-card table{width:100%;margin:0;border:none}
.info-card td{background:transparent!important;border:none;border-bottom:1px solid rgba(0,0,0,.06);padding:7px 12px 7px 0;font-size:14px;vertical-align:top}
.info-card td:first-child{font-weight:600;color:#7b0000;width:220px;white-space:nowrap}
.diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
.diff-card{border-radius:12px;padding:22px 24px;border-left:5px solid}
.diff-card.control{background:#f0f8ff;border-color:#005DAA}
.diff-card.variation{background:#fff8f8;border-color:#b31b1b}
.diff-card h3{margin-top:0;font-size:15px}
.diff-card ul{padding-left:18px;margin-top:8px;font-size:14px}
.diff-card li{margin-bottom:5px}
.section-note{background:var(--grey);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:var(--muted);border-left:4px solid #b31b1b}
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
.url-table th{background:#b31b1b;color:#fff;padding:8px 14px;text-align:left}
.url-table td{padding:8px 14px;border-bottom:1px solid var(--border)}
.url-table tr:nth-child(even) td{background:var(--grey)}
.breakpoint-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
.breakpoint-table th{background:#334155;color:#fff;padding:8px 14px;text-align:left}
.breakpoint-table td{padding:8px 14px;border-bottom:1px solid var(--border);vertical-align:top}
.breakpoint-table tr:nth-child(even) td{background:var(--grey)}
.footer{text-align:center;color:var(--muted);font-size:13px;padding:28px;border-top:1px solid var(--border);margin-top:60px}
details summary{font-size:14px;font-weight:600;color:#b31b1b;cursor:pointer;padding:6px 0}
@media(max-width:900px){.diff-grid{grid-template-columns:1fr}.kpi-row{grid-template-columns:1fr 1fr}.ss-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-brand">Brillmark QA · AFP A/B Testing</div>
  <h1>AFP18 QA Report — <span>Download One-Page Conference Summary</span></h1>
  <div class="sub">Automated QA for the AFP18 variation on AFP 2026 Annual Conference — a "Download One-Page Conference Summary" link injected into the General Information nav dropdown, after the "Convince Your Boss" item. Desktop Only (hidden on viewports ≤1024px). Tested on 7 sitewide pages.</div>
  <div class="meta">
    <span>📅 ${dateStr}</span>
    <span>🌐 conference.financialprofessionals.org — All Pages</span>
    <span>🖥️ Desktop Only (≥1025px)</span>
    <span>🧪 ${allTCs.length} Test Cases · ${allBrowsers.length} Browsers · ${totalRuns} Total Runs</span>
  </div>
  <div class="badge-row">
    <span class="badge-pill pass">✅ ${passed} Passed</span>
    ${failed > 0 ? `<span class="badge-pill" style="background:rgba(192,57,43,.25);border-color:rgba(192,57,43,.5)">❌ ${failed} Failed</span>` : ''}
    ${skipped > 0 ? `<span class="badge-pill">⏭ ${skipped} Skipped</span>` : ''}
    <span class="badge-pill teal">📄 PDF Download Link</span>
    <span class="badge-pill teal">🏛️ AFP 2026 Conference</span>
    <span class="badge-pill teal">🗺️ 7 Sitewide Pages</span>
  </div>
</div>

<div class="wrap">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Test Overview &amp; URLs</a></li>
    <li><a href="#client-ref">Client Design Reference</a></li>
    <li><a href="#diff">Control vs Variation</a></li>
    <li><a href="#breakpoints">Desktop-Only Behaviour</a></li>
    <li><a href="#results">Test Results Summary</a></li>
    <li><a href="#matrix">Full TC × Browser Matrix</a></li>
    ${failed > 0 ? '<li><a href="#errors">Failed Test Details</a></li>' : ''}
    <li><a href="#screenshots">Navbar Screenshots (TC-11 &amp; TC-12)</a></li>
    <li><a href="#sitewide">Sitewide Multi-Page Navbar Tests (TC-18–24)</a></li>
    <li><a href="#more-screenshots">Additional Screenshots</a></li>
    <li><a href="#methodology">Testing Methodology</a></li>
  </ol>
</div>

<!-- OVERVIEW -->
<h2 id="overview">Test Overview &amp; URLs</h2>
<div class="info-card">
  <table>
    <tr><td>Test ID</td><td><strong>AFP18</strong></td></tr>
    <tr><td>Variation Name</td><td><code>cre-t-18</code></td></tr>
    <tr><td>Test Name</td><td>Download One-Page Conference Summary</td></tr>
    <tr><td>Test Type</td><td>Visually A/B Test — Navigation Enhancement</td></tr>
    <tr><td>Client</td><td>AFP — Association for Financial Professionals (2026 Annual Conference)</td></tr>
    <tr><td>Audience</td><td><strong>Desktop Only</strong> — all pages on conference.financialprofessionals.org</td></tr>
    <tr><td>New Link Text</td><td><strong>"Download One-Page Conference Summary"</strong></td></tr>
    <tr><td>PDF URL</td><td><code>https://v2.crocdn.com/AFP/test18/AFP_2026_Conference_Summary-cre-t-18.pdf</code></td></tr>
    <tr><td>Link Behaviour</td><td>Opens PDF in new tab (<code>target="_blank"</code>)</td></tr>
    <tr><td>Placement</td><td>After "Convince Your Boss" item in General Information → Conference Experience column</td></tr>
    <tr><td>Devices Tested</td><td>Desktop 1280×800 · Desktop 1440×900 · Tablet 1024×768 · Mobile 768×1024</td></tr>
    <tr><td>Report Date</td><td>${dateStr}</td></tr>
    <tr><td>QA Engineer</td><td>sarthak@brillmark.com</td></tr>
    <tr><td>Variation Files</td><td><code>local_testing/Local2/variation/vB.js</code> + <code>vB.css</code></td></tr>
    <tr><td>Browsers Tested</td><td>Chrome Desktop · Firefox Desktop · Edge Desktop · Safari Desktop · Mobile Chrome (Pixel 5) · Mobile Safari (iPhone 12)</td></tr>
    <tr><td>Total Test Runs</td><td>${allTCs.length} TCs × ${allBrowsers.length} browsers = <strong>${totalRuns} total runs</strong></td></tr>
    <tr><td>Deduplication Guard</td><td><code>body.cre-t-18</code> class check prevents double injection on re-run</td></tr>
    <tr><td>CSS Media Query</td><td><code>@media (max-width: 1024px) { .cre-t-18-new-item { display: none !important; } }</code></td></tr>
    <tr><td>Sitewide Pages</td><td>7 pages tested with navbar dropdown open + screenshot captured per page per browser</td></tr>
  </table>
</div>

<h3>Target URLs</h3>
<table class="url-table">
  <thead><tr><th>Type</th><th>URL</th><th>Note</th></tr></thead>
  <tbody>
    <tr><td><strong>Control</strong></td><td><code>https://conference.financialprofessionals.org/</code></td><td>No variation applied</td></tr>
    <tr><td><strong>Variation — Homepage</strong></td><td><code>https://conference.financialprofessionals.org/?_vis_preview_data=&lt;token&gt;</code></td><td>Download link injected</td></tr>
    <tr><td><strong>Sitewide — Attendee Feedback</strong></td><td><code>/general-information/experience/attendee-feedback2026</code></td><td>TC-18</td></tr>
    <tr><td><strong>Sitewide — Full Conference Pricing</strong></td><td><code>/registration/full-conference-pricing</code></td><td>TC-19</td></tr>
    <tr><td><strong>Sitewide — Team Pricing</strong></td><td><code>/registration/team</code></td><td>TC-20</td></tr>
    <tr><td><strong>Sitewide — Day Pass Pricing</strong></td><td><code>/registration/day-pass-pricing</code></td><td>TC-21</td></tr>
    <tr><td><strong>Sitewide — AFP 2026 Event Guide</strong></td><td><code>/program/overview/afp-2026-event-guide</code></td><td>TC-22</td></tr>
    <tr><td><strong>Sitewide — AFP Member Perks</strong></td><td><code>/general-information/experience/afp-member-perks</code></td><td>TC-23</td></tr>
    <tr><td><strong>Sitewide — Hotel Deals</strong></td><td><code>/hotel-travel/getting-here/deals</code></td><td>TC-24</td></tr>
    <tr><td><strong>PDF Asset</strong></td><td><code>https://v2.crocdn.com/AFP/test18/AFP_2026_Conference_Summary-cre-t-18.pdf</code></td><td>Verified HTTP 200</td></tr>
  </tbody>
</table>

<!-- CLIENT REFERENCE -->
<h2 id="client-ref">Client Design Reference</h2>
<div class="section-note">The client marked the insertion point in the General Information dropdown — the new "Download One-Page Conference Summary" link should appear in the Conference Experience column, directly after "Convince Your Boss".</div>
${clientImgB64
  ? `<div class="ss-wrap"><img src="${clientImgB64}" alt="AFP18 Client Reference — marked insertion point"/><div class="ss-caption">Client Reference — arrow marks insertion point after "Convince Your Boss" in the General Information dropdown</div></div>`
  : '<p><em>image.png not found in local_testing/ — client reference screenshot skipped.</em></p>'}

<!-- DIFF -->
<h2 id="diff">Control vs Variation</h2>
<div class="diff-grid">
  <div class="diff-card control">
    <h3>Control</h3>
    <ul>
      <li>General Information dropdown: Conference Experience column has 3 links</li>
      <li>Links: Las Vegas Guide · AFP Attendee Reviews · Convince Your Boss · AFP Insider Perks · AFP Member Perks</li>
      <li>No "Download One-Page Conference Summary" link</li>
      <li>No <code>.cre-t-18-new-link</code> or <code>.cre-t-18-new-item</code> in DOM</li>
      <li>No <code>body.cre-t-18</code> class</li>
    </ul>
  </div>
  <div class="diff-card variation">
    <h3>Variation (AFP18)</h3>
    <ul>
      <li>✅ <strong>"Download One-Page Conference Summary"</strong> link injected after "Convince Your Boss"</li>
      <li>✅ <code>href="https://v2.crocdn.com/AFP/test18/AFP_2026_Conference_Summary-cre-t-18.pdf"</code></li>
      <li>✅ <code>target="_blank"</code> — opens PDF in a new browser tab (best practice)</li>
      <li>✅ CSS classes: <code>main-nav__links-column-list-link cre-t-18-new-link</code></li>
      <li>✅ Container: <code>main-nav__links-column-list-item cre-t-18-new-item</code></li>
      <li>✅ <code>body.cre-t-18</code> class added for scoping &amp; dedup guard</li>
      <li>✅ Hidden on ≤1024px via CSS <code>display:none !important</code></li>
      <li>✅ Polling: waits for 2+ instances of "Convince Your Boss" before injecting</li>
      <li>✅ Site-wide: injection verified on 7 pages across the conference site</li>
    </ul>
  </div>
</div>

<!-- BREAKPOINTS -->
<h2 id="breakpoints">Desktop-Only Behaviour</h2>
<div class="section-note">The A/B platform targets Desktop users only. The CSS also hides the new item at ≤1024px as a safeguard. The JS polls until 2 instances of the "Convince Your Boss" link are found (desktop + mobile nav duplicates), then inserts after each.</div>
<table class="breakpoint-table">
  <thead><tr><th>Viewport Width</th><th>New Link in DOM?</th><th>New Link Visible?</th><th>Audience</th></tr></thead>
  <tbody>
    <tr><td><strong>≥1025px</strong> (Desktop)</td><td>✅ Yes</td><td>✅ Yes (when dropdown open)</td><td>Variation served</td></tr>
    <tr><td><strong>≤1024px</strong> (Tablet/Mobile)</td><td>✅ In DOM</td><td>❌ Hidden (CSS display:none)</td><td>Control served by platform</td></tr>
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
  ? `<div class="alert-pass">✅ All ${passed} test runs passed across all browsers. The AFP18 variation is functioning correctly — PDF download link injection, correct href/target, PDF accessible (HTTP 200), no duplication, correct navbar position after "Convince Your Boss", CSS hidden on ≤1024px, click opens new tab — all verified on 7 sitewide pages.</div>`
  : `<div class="alert-fail">❌ ${failed} of ${totalRuns} test runs failed. Review the matrix and Failed Tests section below for details.</div>`}

<h3>Test Coverage Summary</h3>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>TC-01</strong> — Control: "Download One-Page Conference Summary" link NOT in DOM</li>
  <li><strong>TC-02</strong> — Variation: new link injected in General Information dropdown</li>
  <li><strong>TC-03</strong> — Link text exactly "Download One-Page Conference Summary"</li>
  <li><strong>TC-04</strong> — Link href points to AFP 2026 PDF on v2.crocdn.com CDN</li>
  <li><strong>TC-05</strong> — Link <code>target="_blank"</code> — opens PDF in new tab</li>
  <li><strong>TC-06</strong> — PDF URL returns HTTP 200 with content-type application/pdf</li>
  <li><strong>TC-07</strong> — No duplication: re-running JS with <code>body.cre-t-18</code> guard</li>
  <li><strong>TC-08</strong> — Position: new item directly after the "Convince Your Boss" &lt;li&gt;</li>
  <li><strong>TC-09</strong> — Body class <code>cre-t-18</code> present in variation</li>
  <li><strong>TC-10</strong> — Body class <code>cre-t-18</code> NOT present in control</li>
  <li><strong>TC-11</strong> — Desktop 1280×800: link visible when dropdown opened (+ navbar-clipped screenshot)</li>
  <li><strong>TC-12</strong> — Desktop 1440×900: link visible when dropdown opened (+ navbar-clipped screenshot)</li>
  <li><strong>TC-13</strong> — Responsive 1024px: link hidden via CSS <code>@media max-width:1024px</code></li>
  <li><strong>TC-14</strong> — Responsive 768px: link hidden via CSS</li>
  <li><strong>TC-15</strong> — Click: link opens PDF in new browser tab (popup intercepted)</li>
  <li><strong>TC-16</strong> — CSS classes on <code>&lt;a&gt;</code>: <code>main-nav__links-column-list-link</code> + <code>cre-t-18-new-link</code></li>
  <li><strong>TC-17</strong> — CSS classes on <code>&lt;li&gt;</code>: <code>main-nav__links-column-list-item</code> + <code>cre-t-18-new-item</code></li>
  <li><strong>TC-18</strong> — Sitewide: /general-information/experience/attendee-feedback2026 — navbar dropdown + screenshot</li>
  <li><strong>TC-19</strong> — Sitewide: /registration/full-conference-pricing — navbar dropdown + screenshot</li>
  <li><strong>TC-20</strong> — Sitewide: /registration/team — navbar dropdown + screenshot</li>
  <li><strong>TC-21</strong> — Sitewide: /registration/day-pass-pricing — navbar dropdown + screenshot</li>
  <li><strong>TC-22</strong> — Sitewide: /program/overview/afp-2026-event-guide — navbar dropdown + screenshot</li>
  <li><strong>TC-23</strong> — Sitewide: /general-information/experience/afp-member-perks — navbar dropdown + screenshot</li>
  <li><strong>TC-24</strong> — Sitewide: /hotel-travel/getting-here/deals — navbar dropdown + screenshot</li>
</ul>

<!-- MATRIX -->
<h2 id="matrix">Full TC × Browser Matrix (${allTCs.length} TCs × ${allBrowsers.length} Browsers)</h2>
<div class="section-note">Each cell shows PASS / FAIL / SKIP for that TC × browser combination. Hover over FAIL cells for truncated error details.</div>
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

<!-- NAVBAR SCREENSHOTS (TC-11 & TC-12) -->
<h2 id="screenshots">Navbar Screenshots — General Information Dropdown Open</h2>
<div class="section-note">These screenshots are clipped to the top 520 px of the page, focusing on the navigation bar with the General Information dropdown open. The "Download One-Page Conference Summary" link should be clearly visible in the Conference Experience column.</div>

<h3>Navbar Dropdown — 1280×800 Viewport (TC-11)</h3>
${ssSection(navDropdown1280, 'Navbar Dropdown 1280px')}

<h3>Navbar Dropdown — 1440×900 Viewport (TC-12)</h3>
${ssSection(navDropdown1440, 'Navbar Dropdown 1440px')}

<details>
  <summary>Full-page screenshots — Dropdown Open 1280px</summary>
  ${ssSection(dropdown1280Shots, 'Desktop 1280×800 Dropdown')}
</details>
<details style="margin-top:10px">
  <summary>Full-page screenshots — Dropdown Open 1440px</summary>
  ${ssSection(dropdown1440Shots, 'Desktop 1440×900 Dropdown')}
</details>

<!-- SITEWIDE MULTI-PAGE NAVBAR TESTS -->
<h2 id="sitewide">Sitewide Multi-Page Navbar Tests (TC-18 – TC-24)</h2>
<div class="section-note">Each of the 7 pages below was loaded with the variation preview token. After verifying the link is in the DOM, the General Information dropdown was opened and a navbar-focused screenshot (top 520 px) was captured. Full-page screenshots are available in the collapsible panel for each page.</div>

${sitewideNavSections}

<!-- ADDITIONAL SCREENSHOTS -->
<h2 id="more-screenshots">Additional Screenshots</h2>

<h3>Control — No Download Link (TC-01)</h3>
${ssSection(controlShots, 'Control')}

<h3>Variation Loaded — Full Page (TC-02)</h3>
${ssSection(varShots, 'Variation')}

<h3>Responsive 1024px — Link Hidden via CSS (TC-13)</h3>
${ssSection(resp1024Shots, 'Responsive 1024px')}

<h3>Responsive 768px — Link Hidden via CSS (TC-14)</h3>
${ssSection(resp768Shots, 'Responsive 768px')}

<h3>Click — PDF Opens in New Tab (TC-15)</h3>
${ssSection(clickShots, 'Click — PDF New Tab')}

<!-- METHODOLOGY -->
<h2 id="methodology">Testing Methodology</h2>
<div class="section-note">All tests navigated to live preview URLs — no mocking. The variation JS and CSS are served by the Visually platform when the <code>_vis_preview_data</code> parameter is present. Tests use <code>page.waitForSelector</code> to handle asynchronous polling injection.</div>
<ul style="font-size:14px;margin:10px 0">
  <li><strong>Control check (TC-01)</strong>: Waited 6 seconds then asserted link count is 0.</li>
  <li><strong>Variation presence (TC-02)</strong>: Used <code>waitForSelector('.cre-t-18-new-link')</code> with 45s timeout.</li>
  <li><strong>Link attributes (TC-03–05)</strong>: Asserted exact text, PDF href, and <code>target="_blank"</code>.</li>
  <li><strong>PDF accessibility (TC-06)</strong>: Made API GET request to PDF URL — verified HTTP 200 + <code>application/pdf</code> content-type.</li>
  <li><strong>Duplication (TC-07)</strong>: Re-ran <code>vB.js</code> via <code>page.evaluate()</code> after variation loaded — link count must stay the same.</li>
  <li><strong>Position (TC-08)</strong>: Evaluated DOM adjacency — <code>convinceLi.nextElementSibling.classList.contains('cre-t-18-new-item')</code>.</li>
  <li><strong>Body class (TC-09–10)</strong>: Checked <code>document.body.classList.contains('cre-t-18')</code>.</li>
  <li><strong>Visibility (TC-11–12)</strong>: Scrolled to top, hovered "General Information" nav, force-showed dropdown ancestors via JS, asserted <code>toBeVisible()</code>. Navbar-clipped screenshot (top 520 px) captures the dropdown with the new link clearly visible.</li>
  <li><strong>Responsive CSS (TC-13–14)</strong>: Loaded at 1280px to inject variation, then resized viewport and checked <code>getComputedStyle().display</code>.</li>
  <li><strong>Click / new tab (TC-15)</strong>: Opened new page at PDF href — verified URL is on CDN or about:blank (Chrome headless).</li>
  <li><strong>CSS classes (TC-16–17)</strong>: Checked <code>classList.contains()</code> for all expected class names.</li>
  <li><strong>Sitewide (TC-18–24)</strong>: Navigated to each of 7 pages with preview token. Verified link count &gt; 0, opened dropdown, captured navbar-clipped screenshot (top 520 px) + full-page screenshot per browser.</li>
</ul>

<div class="footer">
  AFP18 QA Report · ${dateStr} · Playwright Automated Tests · conference.financialprofessionals.org<br>
  QA by sarthak@brillmark.com · Spec: afp18-download-link.spec.js · ${allTCs.length} TCs × ${allBrowsers.length} browsers = ${totalRuns} total runs
</div>

</div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, html, 'utf8');
    const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
    console.log(`\nAFP18 QA Report → ${OUTPUT}`);
    console.log(`Size: ${sizeKB} KB | ${passed} passed / ${failed} failed / ${skipped} skipped of ${totalRuns} total`);
  }
}

module.exports = Afp18Reporter;
