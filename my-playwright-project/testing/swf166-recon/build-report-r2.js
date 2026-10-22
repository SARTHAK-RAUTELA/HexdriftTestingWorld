// SWF166: build the self-contained HTML QA report from the Playwright JSON results + screenshots.
// Screenshots are re-encoded as downscaled JPEGs (via Chromium) so the report stays a sensible size.
// usage: node testing/swf166-recon/build-report.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const L2 = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2');
const RES = path.join(L2, 'swf166-results', 'r2');
const SHOTS = path.join(L2, 'swf166-screenshots-r2');
const OUT = path.join(L2, 'swf166-liberty-first-qa-report-r2.html');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');

const PROJECTS = [
  { name: 'Chrome Desktop', short: 'Chrome desktop', file: 'chrome-desktop.json', dir: 'chrome-desktop' },
  { name: 'Safari Desktop', short: 'Safari desktop', file: 'safari-desktop.json', dir: 'safari-desktop' },
  { name: 'Mobile Chrome (Pixel 5)', short: 'Chrome mobile (Pixel 5)', file: 'pixel5.json', dir: 'mobile-chrome-pixel-5-' },
  { name: 'Mobile Safari (iPhone 12)', short: 'Safari mobile (iPhone 12)', file: 'iphone12.json', dir: 'mobile-safari-iphone-12-' },
];

// results[title][project] = { status, error, notes }
const results = {}; const order = [];
for (const p of PROJECTS) {
  const file = path.join(RES, p.file);
  if (!fs.existsSync(file)) continue;
  const walk = (s) => {
    (s.suites || []).forEach(walk);
    for (const sp of s.specs || []) for (const t of sp.tests) {
      const r = t.results[t.results.length - 1]; if (!r) continue;
      if (!results[sp.title]) { results[sp.title] = {}; order.push(sp.title); }
      results[sp.title][p.name] = {
        status: r.status === 'passed' ? 'P' : r.status === 'skipped' ? 'S' : 'F',
        error: strip(r.error?.message).split('\n').filter(Boolean).slice(0, 6).join('\n'),
        notes: (r.annotations || t.annotations || []).map((a) => a.description),
      };
    }
  };
  JSON.parse(fs.readFileSync(file, 'utf8')).suites.forEach(walk);
}

const BUGS = [
  { id: 'BUG-08', sev: 'High', where: 'Control + V1 · all pages · all devices', tests: 'C02, V07', isNew: true,
    title: 'NEW — Liberty Mutual goal 100038331 never fires (in either arm)',
    body: 'Round 2 changed the Liberty goal line to <code>live(\'…&gt; .plan-box, … .rating-bar, …best-overall … &gt; .plan-box\', \'.button.Liberty_Mutual.rt-aff-link\', "mousedown", function () {…})</code>. The modal selector was passed as a <em>separate argument</em>, so <code>live(selector, event, callback)</code> receives <code>event = ".button.Liberty_Mutual.rt-aff-link"</code> and <code>callback = "mousedown"</code>, hits <code>if (typeof callback !== "function") return;</code> and binds nothing. Result: mousedown on the Liberty listing CTA, the V1 Best Overall (Liberty) CTA and the V1 modal "Visit Liberty Mutual" CTA fire no 100038331 at all. The same line is in the new control goal code (<code>cre-t-166-goal</code>), so the Liberty goal is dead in both arms. The Lemonade goal 100038330 still fires. In round 1 Liberty fired (too broadly, see BUG-02); now it reports zero.',
    fix: 'Append the modal selector to the selector string instead of adding a 4th argument, in both V1 and control:<br><code>live(\'[data-unique="comparison-table"] &gt; [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link, [data-unique="best-overall"] &gt; [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link, .cre-t-166-button-container a.rt-aff-link\', "mousedown", function () {…})</code>' },
  { id: 'BUG-02', sev: 'Medium', where: 'Control + V1 · all pages · all devices', tests: 'C02, V07', still: true,
    title: 'STILL OPEN — partner goals bound to the whole card (headings, blank space, phone link count as outbound clicks)',
    body: 'Selectors are unchanged: still <code>&gt; .plan-box</code> and <code>.rating-bar</code>. Mousedown on the Lemonade "AVERAGE PLAN COST" heading still fires 100038330 (control C02, all pages). Liberty does not currently over-fire only because its handler is dead (BUG-08). Once that line is fixed with the current selectors, the Liberty phone link <code>tel:</code> and headings will fire 100038331 again.',
    fix: 'Bind to the partner links only (<code>a.rt-aff-link</code> inside each partner card), not <code>.plan-box</code> / <code>.rating-bar</code>.' },
  { id: 'BUG-03', sev: 'Medium', where: 'Control + V1 · exit modal · all devices', tests: 'C02, V07', still: true,
    title: 'STILL OPEN — exit-modal CTA clicks are not counted toward the partner goals',
    body: 'V1 modal "Visit Liberty Mutual" (<code>.cre-t-166-button-container a</code>) fires only the generic <code>100036136</code>, no 100038331, because of BUG-08. Control modal "Visit Lemonade" (<code>.oxy-modal-backdrop a.rt-aff-link</code>) fires only 100036136, no 100038330: the Lemonade selector was not extended to the modal.',
    fix: 'V1/control Liberty: see BUG-08. Control (and V1) Lemonade: add <code>.oxy-modal-backdrop a.rt-aff-link.lemonade</code> (or the modal button\'s selector) to the Lemonade goal so both arms count modal clicks the same way.' },
  { id: 'BUG-06', sev: 'Low', where: 'V1 · all pages · all devices', tests: 'V08', still: true,
    title: 'STILL OPEN — JS error on every V1 page: "trigger is not a function"',
    body: 'Unchanged: <code>waitForElement(…trustpilot-image\', trustpilotContent(), 50, 25000)</code> still calls the function and passes its <code>undefined</code> return as the callback.',
    fix: 'Pass the reference: <code>waitForElement(…, trustpilotContent, 50, 25000)</code>.' },
  { id: 'BUG-07', sev: 'Low', where: 'V1 · / and /home/ · Chromium', tests: 'V08', still: true,
    title: 'STILL OPEN — brief flash of Lemonade at #1 before the swap',
    body: 'Still 2 frames of Lemonade-first on / and /home/ on Chromium (61–75 ms on Chrome desktop this round). Init still waits on a <code>waitForElement("body")</code> 50 ms poll before adding the body class.',
    fix: 'Add the class to <code>document.documentElement</code> synchronously at the top of the variation and key the CSS off <code>html.cre-t-166</code>.' },
];
const RESOLVED = [
  { id: 'BUG-01', title: '/home/ now targeted — location rule is https', body: 'Location 100012039 now lists <code>https://rentersinsurancegurus.com/home/</code> (URL and URL-with-query). /home/ buckets into both arms unpatched, and V1 renders correctly there (V01–V06 home pass).' },
  { id: 'BUG-04', title: 'Single yellow bar on /comparison/', body: 'New CSS hides the native Liberty <code>.rating-bar:not(.cre-t-166-rating-bar)</code>. /comparison/ now shows exactly one bar, "499,000 … 4.8".' },
  { id: 'BUG-05', title: '"Libery" typo fixed', body: 'The bar now reads "499,000 people ranked Liberty Mutual as 4.8 on [App Store]".' },
  { id: 'NOTE', title: 'Control now has per-partner goal code', body: 'Control 1000257707 now runs a goal-only script (<code>cre-t-166-goal</code>) so both arms can report 100038330/100038331. This is the right approach, but it copies the broken Liberty line (BUG-08).' },
];
const NOTES = [
  '<strong>Re-runs (not product bugs).</strong> The first iPhone 12 run was stopped by the system for low memory after 23/30 tests, so the 10 /comparison/ tests were re-run on their own. Pixel 5 C01 /comparison/ hit a 45 s page-load timeout and was re-run. The matrix shows the re-run results.',
  '<strong>Round 2 (recheck, 2026-10-21).</strong> Deployed Convert code was re-extracted (exp version 12) and matches local vB.js/vB.css exactly. Changes since round 1: typo fix, CSS hides native Liberty bar, Best Overall delay 300→700 ms, Liberty goal line edited (now broken), /home/ location rule → https, control goal script added. Round-1 report kept as <code>swf166-liberty-first-qa-report-r1.html</code>.',
  '<strong>Geo targeting was simulated.</strong> The audience requires one of 30 US states. The test browser patched only the <code>geo.state == \'TX\'</code> check to true. URL rules, audience, bucketing and the deployed variation code are all real. /home/ is no longer patched.',
  '<strong>Traffic split is 30/70</strong> (control 1000257707 = 30, V1 1000257708 = 70).',
  '<strong>Exit intent does not fire on touch devices</strong> (same on control). On Pixel 5 / iPhone 12 the modal was force-shown to verify content only.',
  '<strong>Goal check method:</strong> a <code>window._conv_q.push</code> spy plus a dispatched <code>mousedown</code> on each target. The generic all-outbound goal 100036136 and the site\'s native per-partner goals (100036137–140) fire correctly in both arms.',
];

const ICON = { P: '<span class="st p">Pass</span>', F: '<span class="st f">Fail</span>', S: '<span class="st s">n/a</span>' };
const bugFor = (title) => {
  const id = title.slice(0, 3); const page = title.split(' ')[2].replace(/:$/, '');
  return BUGS.filter((b) => b.tests.split(/\s*,\s*/).some((t) => {
    const [tid, pg] = t.split(' ');
    return tid.split('/').includes(id) && (!pg || pg === page);
  })).map((b) => b.id).join(', ');
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const jpg = async (file, maxW = 900) => {
    if (!fs.existsSync(file)) return null;
    await page.setContent(`<style>body{margin:0}img{display:block;max-width:${maxW}px;height:auto}</style><img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}">`);
    await page.waitForFunction(() => document.images[0].complete);
    const box = await page.locator('img').boundingBox();
    await page.setViewportSize({ width: Math.ceil(box.width), height: Math.min(Math.ceil(box.height), 16000) });
    return (await page.locator('img').screenshot({ type: 'jpeg', quality: 72 })).toString('base64');
  };
  const fig = async (file, cap, maxW) => { const b = await jpg(file, maxW); return b ? `<figure><img src="data:image/jpeg;base64,${b}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>` : ''; };

  const tot = PROJECTS.map((p) => { const t = { P: 0, F: 0, S: 0 }; order.forEach((o) => { const r = results[o][p.name]; if (r) t[r.status]++; }); return t; });
  const all = tot.reduce((a, t) => ({ P: a.P + t.P, F: a.F + t.F }), { P: 0, F: 0 });

  const matrix = order.map((title) => {
    const cells = PROJECTS.map((p) => { const r = results[title][p.name]; return `<td>${r ? ICON[r.status] : '<span class="st s">not run</span>'}</td>`; }).join('');
    const notes = [...new Set(PROJECTS.flatMap((p) => { const r = results[title][p.name]; return r ? [...r.notes.map((n) => p.short + ': ' + n), r.status === 'F' ? p.short + ' FAIL: ' + r.error : ''] : []; }).filter(Boolean))];
    return `<tr><td>${esc(title)}</td>${cells}<td class="bug">${bugFor(title)}</td></tr>` +
      (notes.length ? `<tr class="detail"><td colspan="${PROJECTS.length + 2}"><details><summary>Details</summary><pre>${esc(notes.join('\n'))}</pre></details></td></tr>` : '');
  }).join('');

  // evidence figures for the bug cards
  const cd = path.join(SHOTS, 'chrome-desktop'); const ip = path.join(SHOTS, 'mobile-safari-iphone-12-');
  const evidence = {};
  const resolvedEvidence = {
    'BUG-01': [await fig(path.join(cd, 'v1-home-listings.png'), 'Chrome desktop, V1 /home/ (unpatched) — Liberty #1', 700)],
    'BUG-04': [await fig(path.join(ip, 'v1-comparison-liberty-card.png'), 'iPhone 12, V1 /comparison/ — one bar, 499,000', 380)],
    'BUG-05': [await fig(path.join(ip, 'v1-root-liberty-card.png'), 'iPhone 12, V1 / — "Liberty Mutual"', 380)],
  };

  const gallery = [];
  for (const p of PROJECTS) {
    const d = path.join(SHOTS, p.dir); const mob = /Mobile/.test(p.name); const w = mob ? 360 : 900;
    const items = [];
    for (const [f, c] of [
      ['control-root-listings', 'Control / — listings (Lemonade #1)'], ['v1-root-listings', 'V1 / — listings (Liberty #1)'],
      ['v1-root-liberty-card', 'V1 / — Liberty card with yellow bar'], ['v1-root-best-overall', 'V1 / — Best Overall (Liberty)'],
      ['v1-root-exit-modal', 'V1 / — exit modal'], ['v1-home-listings', 'V1 /home/ — listings (now targeted)'],
      ['control-comparison-listings', 'Control /comparison/ — native Liberty #1'], ['v1-comparison-liberty-card', 'V1 /comparison/ — single yellow bar'],
      ['v1-comparison-exit-modal', 'V1 /comparison/ — exit modal'],
    ]) items.push(await fig(path.join(d, f + '.png'), c, w));
    gallery.push(`<h3>${esc(p.short)}</h3><div class="grid ${mob ? 'mob' : ''}">${items.join('')}</div>`);
  }
  await browser.close();

  const bugCards = BUGS.map((b) => `<article class="bug-card sev-${b.sev.toLowerCase()}"><header><span class="id">${b.id}</span><span class="sev">${b.sev}</span><span class="meta">${b.where} · tests: ${b.tests}</span></header><h4>${b.title}</h4><p>${b.body}</p><p class="fix"><strong>Fix:</strong> ${b.fix}</p>${(evidence[b.id] || []).join('')}</article>`).join('');
  const fixed = RESOLVED.map((b) => `<article class="bug-card sev-fixed"><header><span class="id">${b.id}</span><span class="sev">${b.id === 'NOTE' ? 'Change' : 'Fixed on live'}</span></header><h4>${b.title}</h4><p>${b.body}</p>${(resolvedEvidence[b.id] || []).join('')}</article>`).join('');
  const sevCount = (s) => BUGS.filter((b) => b.sev === s).length;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SWF166 Liberty First QA</title>
<style>
:root{--bg:#f6f6f4;--card:#fff;--ink:#18181b;--mute:#6b6b70;--line:#e4e4e7;--pass:#15803d;--passbg:#dcfce7;--fail:#b91c1c;--failbg:#fee2e2;--warn:#a16207;--warnbg:#fef3c7}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24}}
:root[data-theme=dark]{--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1200px;margin:0 auto;padding:32px 16px 80px}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:40px 0 12px;padding-top:8px;border-top:1px solid var(--line)}h3{font-size:16px;margin:28px 0 10px}
.sub{color:var(--mute);margin:0 0 20px}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:20px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:24px}.kpi span{color:var(--mute);font-size:13px}
.verdict{background:var(--failbg);border-left:4px solid var(--fail);padding:14px 16px;border-radius:8px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:14px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--bg);font-weight:600}
.tablewrap{overflow-x:auto}.st{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:600}.st.p{background:var(--passbg);color:var(--pass)}.st.f{background:var(--failbg);color:var(--fail)}.st.s{background:var(--bg);color:var(--mute)}
tr.detail td{padding:0 10px 8px;border-bottom:1px solid var(--line)}details summary{cursor:pointer;color:var(--mute);font-size:13px}pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:var(--bg);padding:8px;border-radius:6px}
td.bug{font-weight:600;color:var(--fail);white-space:nowrap}
.bug-card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--warn);border-radius:10px;padding:14px 16px;margin:12px 0}
.bug-card.sev-high{border-left-color:var(--fail)}.bug-card.sev-medium{border-left-color:#ea580c}.bug-card.sev-low{border-left-color:#ca8a04}.bug-card.sev-fixed{border-left-color:var(--pass)}
.bug-card header{display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:13px}.bug-card .id{font-weight:700}.bug-card .sev{padding:1px 8px;border-radius:999px;background:var(--bg)}.bug-card .meta{color:var(--mute)}
.bug-card h4{margin:8px 0 6px;font-size:16px}.bug-card p{margin:6px 0}.fix{color:var(--mute)}code{font-size:13px;background:var(--bg);padding:0 4px;border-radius:4px;word-break:break-word}
.bug-card figure{max-width:720px;margin-top:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px}.grid.mob{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:12px;color:var(--mute);margin-top:6px}
ul{padding-left:20px}li{margin:4px 0}@media (max-width:640px){.grid,.grid.mob{grid-template-columns:1fr}}
</style></head><body><main>
<h1>The Swiftest — SWF166 — Renters Insurance — Move Liberty to #1 — Recheck (Round 2)</h1>
<p class="sub">Renters Insurance Gurus · Convert exp 100052988 · Control 1000257707 (30%) · V1 1000257708 (70%, <code>cre-t-166</code>) · Pages: /, /home/, /comparison/ · Audience: 30 US states · Round 2 recheck 2026-10-21</p>
<div class="kpis">
<div class="kpi"><b>${all.P}/${all.P + all.F}</b><span>checks passed across 4 browsers</span></div>
${PROJECTS.map((p, i) => `<div class="kpi"><b>${tot[i].P}/${tot[i].P + tot[i].F}</b><span>${esc(p.short)}</span></div>`).join('')}
<div class="kpi"><b>${BUGS.length}</b><span>open issues (${sevCount('High')} high, ${sevCount('Medium')} medium, ${sevCount('Low')} low)</span></div>
</div>
<p class="verdict"><strong>Verdict (round 2): still not ready to launch.</strong> Fixed: /home/ is now targeted (BUG-01), a single yellow bar on /comparison/ (BUG-04) and the "Liberty" typo (BUG-05). The visual change passes on every browser and page: order, rank numbers, yellow bar, affiliate links, TrustScore, Best Overall and exit modal. <strong>Blocking: BUG-08</strong>, a regression from this round. The Liberty Mutual goal 100038331 is now dead in both arms because of a misplaced argument in <code>live()</code>, so the test cannot measure its main outcome. BUG-02/03 (goal scope, modal clicks) and BUG-06/07 (JS error, short flash) remain. Failures are identical on every browser.</p>

<h2>Open issues</h2>${bugCards}
<h2>Fixed since round 1</h2>${fixed}

<h2>Notes</h2><ul>${NOTES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Test matrix</h2>
<p class="sub">Expected values come from the brief and the native Liberty-first /comparison/ page, not from the code. "home" = /home/ as configured (no patch needed in round 2). C02 is new in round 2 (control goal script). "Details" holds measurements and failure messages.</p>
<div class="tablewrap"><table><thead><tr><th>Test</th>${PROJECTS.map((p) => `<th>${esc(p.short)}</th>`).join('')}<th>Bug</th></tr></thead><tbody>${matrix}</tbody></table></div>

<h2>Scope and method</h2>
<ul>
<li>Order followed: brief + client comments → vB.js/vB.css → deployed Convert code (round 2: identical to local vB.js/vB.css, exp version 12) → live force URLs → Playwright spec (<code>my-playwright-project/testing/swf166-liberty-first.spec.js</code>) → this report.</li>
<li>Browsers (as requested): Chrome desktop, Safari desktop (WebKit), Chrome mobile (Pixel 5), Safari mobile (iPhone 12), run one at a time.</li>
<li>Covered: Convert bucketing and body class per page, visual order and shown rank numbers, yellow App Store bar (copy, count, rating, one per card, overflow), affiliate hrefs per partner, TrustScore badges, Best Overall content vs the Liberty listing, exit-modal logo, copy and CTA, goal triggers (via a <code>_conv_q.push</code> spy on mousedown), per-frame flash measurement, console/page errors.</li>
<li>Not covered: real iOS/macOS Safari hardware (Playwright WebKit used), real US geo-IP (simulated, see Notes), Convert reporting dashboards.</li>
</ul>

<h2>Screenshots</h2>${gallery.join('')}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', JSON.stringify(tot));
})();
