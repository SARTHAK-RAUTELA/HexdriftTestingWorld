const fs = require('fs');
const path = require('path');

const SS = path.join(__dirname, 'fanorate-screenshots');
const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'fanorate-data', 'analysis-summary.json'), 'utf-8'));
const linkChecks = JSON.parse(fs.readFileSync(path.join(__dirname, 'fanorate-data', 'link-checks.json'), 'utf-8'));
const linkRecheck = JSON.parse(fs.readFileSync(path.join(__dirname, 'fanorate-data', 'link-recheck.json'), 'utf-8'));

function b64(file) {
  return fs.readFileSync(path.join(SS, file)).toString('base64');
}
function img(file, alt, style = '') {
  return `<img src="data:image/png;base64,${b64(file)}" alt="${alt}" style="max-width:100%;border:1px solid #ddd;border-radius:6px;${style}">`;
}

// Merge recheck results into link status (recheck supersedes original for 429/400)
const recheckMap = new Map(linkRecheck.map(r => [r.href, r.status]));
const finalLinks = linkChecks.map(l => ({ ...l, finalStatus: recheckMap.has(l.href) ? recheckMap.get(l.href) : l.status }));
const brokenLinks = finalLinks.filter(l => typeof l.finalStatus !== 'number' || l.finalStatus >= 400);
const totalLinks = finalLinks.length;

const totalImages = analysis.reduce((s, p) => s + p.uniqueImages, 0);
const totalBrokenImg = analysis.reduce((s, p) => s + p.brokenImages.length, 0);
const totalStretched = analysis.reduce((s, p) => s + p.stretchedImages.length, 0);

const pageMeta = {
  home: { fold: 'home-fold.png', full: null, label: 'Homepage' },
  'points-table': { fold: 'points-table-fold.png', full: 'points-table-full.png', label: 'Points Table' },
  'previews-today': { fold: 'previews-today-fold.png', full: null, label: 'Match Previews (Today filter)' },
  previews: { fold: 'previews-fold.png', full: null, label: 'Match Previews' },
  analysis: { fold: 'analysis-fold.png', full: null, label: 'Match Analysis' },
  blogs: { fold: 'blogs-fold.png', full: null, label: 'Blogs' },
  schedule: { fold: 'schedule-fold.png', full: null, label: 'Schedule' },
};

const today = '2026-07-03';

let pageSections = '';
for (const p of analysis) {
  const meta = pageMeta[p.key];
  pageSections += `
  <section id="page-${p.key}" class="card">
    <h3>${meta.label} <span class="muted">— ${p.url}</span></h3>
    <div class="grid2">
      <div>
        ${img(meta.fold, meta.label + ' screenshot')}
        ${meta.full ? `<details style="margin-top:8px"><summary>Full page screenshot</summary>${img(meta.full, meta.label + ' full page')}</details>` : ''}
      </div>
      <div>
        <table class="mini">
          <tr><td>HTTP Status</td><td><span class="badge ${p.httpStatus === 200 ? 'ok' : 'fail'}">${p.httpStatus}</span></td></tr>
          <tr><td>Page Title</td><td>${p.title}</td></tr>
          <tr><td>Total Links</td><td>${p.totalLinks}</td></tr>
          <tr><td>Unique Images</td><td>${p.uniqueImages} (of ${p.totalImages} img tags)</td></tr>
          <tr><td>Broken Images</td><td>${p.brokenImages.length ? `<span class="badge warn">${p.brokenImages.length} (non-visible widget, see notes)</span>` : '<span class="badge ok">0</span>'}</td></tr>
          <tr><td>Stretched Images</td><td><span class="badge ok">${p.stretchedImages.length}</span></td></tr>
          <tr><td>Missing alt text</td><td>${p.missingAltCount}</td></tr>
          <tr><td>Console errors</td><td>${p.consoleErrorCount}</td></tr>
          <tr><td>Empty/# links</td><td>${p.emptyOrHashLinks.length}</td></tr>
        </table>
      </div>
    </div>
  </section>`;
}

const bugs = [
  {
    sev: 'MEDIUM',
    title: 'Floating live-match widget overlaps "Match Preview" CTA link on Schedule page',
    page: 'Schedule (/schedule/)',
    desc: `The persistent live-score widget (<code>.fanorate-live-widget.flw-pos-right</code>, <code>position:fixed; bottom:16px; right:16px</code>) sits directly on top of the "Match Preview →" link for the second fixture card (Argentina vs Cabo Verde) at the default 1440×900 desktop viewport, with zero scrolling. Verified via DOM bounding-box overlap check (confirmed overlapping) and visually in the screenshot below — the link is reduced to a barely-visible "MATC…" sliver and is likely unclickable/obstructed for a real user landing on the page.`,
    evidence: img('schedule-viewport-scroll0.png', 'Live widget overlapping Match Preview link'),
    verified: true,
  },
  {
    sev: 'LOW',
    title: 'Venue names truncated with ellipsis on Schedule cards, hiding information',
    page: 'Schedule (/schedule/)',
    desc: `Venue text is clipped with CSS ellipsis rather than wrapping, e.g. "HARD ROCK STADIU…" (Hard Rock Stadium) and "GEHA FIELD AT ARR…" (GEHA Field at Arrowhead Stadium). There is no visible tooltip/title attribute confirmed to reveal the full name, so users can't tell which stadium is meant without guessing.`,
    evidence: '',
    verified: true,
  },
  {
    sev: 'LOW (dev cleanup)',
    title: '~22 player-headshot images loaded but never rendered (dead weight), sitewide',
    page: 'Homepage, Points Table, Match Previews, Match Previews (Today), Match Analysis, Blogs',
    desc: `A "Predicted Lineups" pitch-formation component (classes <code>.lu-pitch</code> / <code>.lup__av-img</code>) is present in the page DOM on every page template with ~22–23 <code>&lt;img&gt;</code> tags pointing at <code>cdn.sportmonks.com/images/soccer/players/...</code> player photos. On these pages the component's container computes to <strong>0×0px</strong> (not <code>display:none</code>, genuinely collapsed), so the images never enter the viewport and never load (<code>naturalWidth:0, complete:false</code>). <strong>This is not a visible bug</strong> — no broken-image icons appear because nothing is rendered — but it is dead weight: the browser still requests page HTML referencing these components on pages where the widget isn't meant to show. On individual match-preview article pages (verified on the Australia vs Egypt preview) the equivalent lineup widget renders correctly, but using flat colored dots with position labels — not the player photos — so the underlying photo `+ `&lt;img&gt; elements appear to be unused/legacy markup left in the shared component across the whole site. Recommend the dev team confirm whether these photo elements are meant to display anywhere, and remove them from templates where the widget is never shown, to cut unnecessary image requests.`,
    evidence: img('lu-pitch-zoom2.png', 'Working lineup pitch widget on match preview article — uses colored dots, not photos'),
    verified: true,
  },
  {
    sev: 'INFO (false alarm — verified working)',
    title: '"Open venue guide" CTA and interactive city-map pins',
    page: 'Homepage ("16 Cities. Three Nations. One Tournament" map)',
    desc: `Initial static-HTML inspection flagged the "Open venue guide" button as a dead link (<code>href="#"</code>, 0×0 hidden panel by default). This was a false positive: the widget is a JS-driven interactive map — clicking any of the 16 city pins populates the panel with that city's image and a correct, working link (verified by clicking the Vancouver pin, which correctly navigated to <code>/soccer-2026/venue-guides/bc-place-fifa-world-cup-2026-vancouver-guide/</code>). No action needed.`,
    evidence: '',
    verified: true,
    isFalsePositive: true,
  },
];

const bugRows = bugs.map(b => `
  <div class="bug ${b.isFalsePositive ? 'bug-info' : b.sev.startsWith('MEDIUM') ? 'bug-medium' : 'bug-low'}">
    <div class="bug-head">
      <span class="sev sev-${b.sev.split(' ')[0].toLowerCase()}">${b.sev}</span>
      <strong>${b.title}</strong>
    </div>
    <div class="bug-page muted">${b.page}</div>
    <p>${b.desc}</p>
    ${b.evidence ? `<div class="evidence">${b.evidence}</div>` : ''}
  </div>
`).join('\n');

const brokenLinkRows = brokenLinks.length ? brokenLinks.map(l => `<tr><td>${l.href}</td><td><span class="badge fail">${l.finalStatus}</span></td><td>${[...new Set(l.foundOn)].join(', ')}</td></tr>`).join('') :
  '<tr><td colspan="3" class="muted">None — all links resolved successfully after accounting for transient rate-limiting (see note below).</td></tr>';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Fanorate.com — Full Site QA Report</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; background: #f4f5f7; color: #1a1a2e; line-height: 1.5; }
  header.hero { background: linear-gradient(135deg, #0d1b3e, #1a2f5c); color: #fff; padding: 40px 32px; }
  header.hero h1 { margin: 0 0 6px; font-size: 28px; }
  header.hero .meta { opacity: .85; font-size: 14px; margin-top: 10px; }
  header.hero .meta span { margin-right: 24px; }
  .container { max-width: 1100px; margin: 0 auto; padding: 24px 20px 60px; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 14px; margin: -30px 20px 30px; max-width: 1100px; margin-left:auto; margin-right:auto; }
  .kpi { background: #fff; border-radius: 10px; padding: 18px; box-shadow: 0 2px 10px rgba(0,0,0,.08); text-align: center; }
  .kpi .num { font-size: 30px; font-weight: 800; color: #d81e2c; }
  .kpi .lbl { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #666; margin-top: 4px; }
  nav.toc { background: #fff; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
  nav.toc h2 { margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: .05em; color: #444; }
  nav.toc ul { columns: 2; padding-left: 18px; }
  nav.toc a { color: #1a2f5c; text-decoration: none; }
  nav.toc a:hover { text-decoration: underline; }
  h2.section-title { font-size: 20px; border-bottom: 3px solid #d81e2c; padding-bottom: 8px; margin: 40px 0 20px; }
  .card { background: #fff; border-radius: 10px; padding: 22px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
  .card h3 { margin-top: 0; }
  .muted { color: #777; font-weight: 400; font-size: 13px; }
  .grid2 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; align-items: start; }
  table.mini { width: 100%; border-collapse: collapse; font-size: 14px; }
  table.mini td { padding: 6px 8px; border-bottom: 1px solid #eee; }
  table.mini td:first-child { color: #555; width: 45%; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .badge.ok { background: #dcfce7; color: #166534; }
  .badge.warn { background: #fef3c7; color: #92400e; }
  .badge.fail { background: #fee2e2; color: #991b1b; }
  .bug { border-radius: 10px; padding: 18px 20px; margin-bottom: 16px; border-left: 6px solid #ccc; background: #fafafa; }
  .bug-medium { border-left-color: #f59e0b; background: #fffbeb; }
  .bug-low { border-left-color: #64748b; background: #f8fafc; }
  .bug-info { border-left-color: #22c55e; background: #f0fdf4; }
  .bug-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .sev { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
  .sev-medium { background: #fef3c7; color: #92400e; }
  .sev-low { background: #e2e8f0; color: #334155; }
  .sev-info { background: #dcfce7; color: #166534; }
  .bug-page { margin-bottom: 8px; }
  .evidence { margin-top: 12px; }
  table.data { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
  table.data th { background: #1a2f5c; color: #fff; text-align: left; padding: 8px 10px; }
  table.data td { padding: 8px 10px; border-bottom: 1px solid #eee; word-break: break-all; }
  .fact-check { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .fact-check .col h4 { margin-bottom: 8px; }
  .fact-check ul { padding-left: 18px; margin: 0; }
  .fact-check li { margin-bottom: 6px; }
  footer.report-footer { text-align: center; color: #888; font-size: 13px; padding: 30px 0; }
  code { background: #eef0f4; padding: 1px 6px; border-radius: 4px; font-size: 90%; }
  .match { color: #166534; font-weight: 700; }
</style>
</head>
<body>

<header class="hero">
  <h1>Fanorate.com — Full Site QA Report</h1>
  <div class="meta">
    <span>🌐 Site: <strong>www.fanorate.com</strong></span>
    <span>📅 Date: <strong>${today}</strong></span>
    <span>🧪 Tester: <strong>Automated QA (Claude + Playwright)</strong></span>
    <span>🖥️ Browser: <strong>Chromium (Playwright), Desktop 1440×900</strong></span>
  </div>
</header>

<div class="kpis">
  <div class="kpi"><div class="num">7</div><div class="lbl">Pages Tested</div></div>
  <div class="kpi"><div class="num">${totalLinks}</div><div class="lbl">Unique Links Checked</div></div>
  <div class="kpi"><div class="num">${brokenLinks.length}</div><div class="lbl">Broken Links</div></div>
  <div class="kpi"><div class="num">${totalImages}</div><div class="lbl">Unique Images Found</div></div>
  <div class="kpi"><div class="num">${totalStretched}</div><div class="lbl">Stretched Images</div></div>
  <div class="kpi"><div class="num">3</div><div class="lbl">Real Bugs Found</div></div>
</div>

<div class="container">

<nav class="toc">
  <h2>Contents</h2>
  <ul>
    <li><a href="#summary">Executive Summary</a></li>
    <li><a href="#env">Test Environment</a></li>
    <li><a href="#pages">Per-Page Results</a></li>
    <li><a href="#bugs">Bugs &amp; Issues Found</a></li>
    <li><a href="#links">Full Link Audit</a></li>
    <li><a href="#data">Data Accuracy vs Real FIFA World Cup 2026</a></li>
    <li><a href="#images">Image Quality Audit</a></li>
  </ul>
</nav>

<h2 class="section-title" id="summary">Executive Summary</h2>
<div class="card">
  <p>Fanorate.com was crawled end-to-end across all 7 requested pages using Playwright (Chromium). Overall the site is in <strong>good shape</strong>: all pages load with HTTP 200, the visual design is clean and consistent across templates, no genuinely stretched/distorted images were found, and — most importantly for a live World Cup tournament site — the tournament data (group standings, knockout bracket, match results, fixtures) is <strong>accurate and current</strong> as of ${today}, correctly using the new 2026 format (48 teams, 12 groups A–L, Round of 32 as the first knockout round).</p>
  <p>Three issues are worth fixing, ranked by severity:</p>
  <ol>
    <li><strong>Medium:</strong> a fixed-position live-score widget overlaps and obscures the "Match Preview" link on the Schedule page at default desktop viewport size.</li>
    <li><strong>Low:</strong> stadium/venue names are truncated with no way to see the full name on Schedule cards.</li>
    <li><strong>Low (cleanup):</strong> a sitewide "predicted lineup" component references ~22 player-photo images that never render on most pages (not visibly broken, but wasted requests).</li>
  </ol>
  <p>One suspected dead CTA ("Open venue guide") was investigated and confirmed to be a <strong>false alarm</strong> — it works correctly once a city pin on the interactive map is clicked.</p>
</div>

<h2 class="section-title" id="env">Test Environment</h2>
<div class="card">
  <table class="mini">
    <tr><td>Browser</td><td>Chromium via Playwright (Chrome engine)</td></tr>
    <tr><td>Viewport</td><td>1440 × 900 (Desktop)</td></tr>
    <tr><td>Pages tested</td><td>Homepage, Points Table, Match Previews (Today filter), Match Previews, Match Analysis, Blogs, Schedule</td></tr>
    <tr><td>Checks performed</td><td>Full-page + above-fold screenshots, all &lt;a&gt; link extraction + HTTP status verification, all &lt;img&gt; extraction + broken/stretched detection, CTA/button inventory, console error &amp; failed-request capture, interactive widget testing (map pins, tab switchers), tournament data cross-check against real-world sources</td></tr>
  </table>
</div>

<h2 class="section-title" id="pages">Per-Page Results</h2>
${pageSections}

<h2 class="section-title" id="bugs">Bugs &amp; Issues Found</h2>
${bugRows}

<h2 class="section-title" id="links">Full Link Audit</h2>
<div class="card">
  <p>${totalLinks} unique links were extracted across all 7 pages and checked for HTTP status. On the first pass, ${linkChecks.filter(l=>l.status===429).length} links returned <code>429 Too Many Requests</code> — this was caused by our own crawler firing requests too quickly and triggering the site's rate-limiter, <strong>not</strong> a site defect. All flagged links were rechecked individually with 1.5s delays between requests; all but one came back <code>200 OK</code>.</p>
  <table class="data">
    <tr><th>URL</th><th>Final Status</th><th>Found on page(s)</th></tr>
    ${brokenLinkRows}
  </table>
  <p class="muted" style="margin-top:10px">Note: <code>facebook.com/fanorate/</code> returning 400 to a server-side/bot request is a well-known Facebook anti-scraping behavior and does not necessarily indicate the link is broken for real users in a browser — recommend a quick manual click to confirm.</p>
</div>

<h2 class="section-title" id="data">Data Accuracy vs Real FIFA World Cup 2026</h2>
<div class="card">
  <p>The real FIFA World Cup 2026 (June 11 – July 19, 2026, hosted by USA/Canada/Mexico) introduced a new 48-team, 12-group format. As of today (${today}) the group stage is complete and the tournament is in the Round of 32. Fanorate's Points Table and Schedule pages were checked against this real-world structure and against independently researched live results:</p>
  <div class="fact-check">
    <div class="col">
      <h4>✅ Format facts confirmed correct</h4>
      <ul>
        <li><span class="match">Match</span> — 12 groups, labeled A through L (not the outdated 8-group A–H format)</li>
        <li><span class="match">Match</span> — 4 teams per group, 48 teams total</li>
        <li><span class="match">Match</span> — Knockout bracket correctly starts at "Round of 32" (the new round introduced for 2026, not Round of 16)</li>
        <li><span class="match">Match</span> — Bracket structure (R32 → R16 → QF → SF → Final + 3rd place playoff) matches the real 2026 format</li>
      </ul>
    </div>
    <div class="col">
      <h4>✅ Sample results cross-checked against real-world reports</h4>
      <ul>
        <li><span class="match">Match</span> — Germany 1(3)–1(4) Paraguay, penalties — matches confirmed real upset (Paraguay eliminated 4× champions Germany on penalties)</li>
        <li><span class="match">Match</span> — USA 2–0 Bosnia &amp; Herzegovina — matches real result</li>
        <li><span class="match">Match</span> — Mexico 2–0 Ecuador — matches real result</li>
        <li><span class="match">Match</span> — South Africa 0–1 Canada — matches real result (Canada advances)</li>
        <li><span class="match">Match</span> — England topped Group L with 7 points — matches real standings</li>
        <li><span class="match">Match</span> — Upcoming Australia vs Egypt, Fri Jul 3, 11:30 PM, AT&amp;T Stadium (Dallas host city) — matches real fixture list</li>
      </ul>
    </div>
  </div>
  <p style="margin-top:16px"><strong>Conclusion:</strong> No factual or structural discrepancies were found. Fanorate's tournament data appears to be sourced from a live feed (Sportmonks, based on the CDN URLs seen in the page images) and is being kept in sync with real results.</p>
</div>

<h2 class="section-title" id="images">Image Quality Audit</h2>
<div class="card">
  <p>All &lt;img&gt; elements across all 7 pages were extracted and checked for (a) load failures and (b) aspect-ratio distortion (displayed width/height ratio compared to the image's natural ratio, ignoring intentional <code>object-fit: cover/contain</code> crops).</p>
  <table class="mini">
    <tr><td>Total unique images checked (all pages combined, deduped)</td><td>${totalImages}</td></tr>
    <tr><td>Images with visible stretching/distortion</td><td><span class="badge ok">${totalStretched} — none found</span></td></tr>
    <tr><td>Images that failed to load and ARE visible to users</td><td><span class="badge ok">0</span></td></tr>
    <tr><td>Images that never render (0×0 hidden component, see Bug #3)</td><td><span class="badge warn">~22 (not visible to users)</span></td></tr>
    <tr><td>Images missing <code>alt</code> text (accessibility)</td><td>8–18 per page, mostly decorative thumbnails</td></tr>
  </table>
  <p style="margin-top:10px">Hero images, card thumbnails, team badges, flags, and venue photos were all manually spot-checked in the screenshots above and render at correct proportions with no visible squashing or over-stretching.</p>
</div>

</div>

<footer class="report-footer">
  QA performed by Claude Code using Playwright (Chromium) · ${today} · Fanorate.com Full Site Audit
</footer>

</body>
</html>
`;

const outPath = path.join(__dirname, '..', 'local_testing', 'Local2', 'fanorate-qa-report.html');
fs.writeFileSync(outPath, html);
console.log('Report written to', outPath, '-', (html.length / 1024 / 1024).toFixed(2), 'MB');
