// SWF166: build the self-contained HTML QA report from the Playwright JSON results + screenshots.
// Screenshots are re-encoded as downscaled JPEGs (via Chromium) so the report stays a sensible size.
// usage: node testing/swf166-recon/build-report.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const L2 = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2');
const RES = path.join(L2, 'swf166-results');
const SHOTS = path.join(L2, 'swf166-screenshots');
const OUT = path.join(L2, 'swf166-liberty-first-qa-report.html');
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
  { id: 'BUG-01', sev: 'High', where: 'Convert setup · all devices', tests: 'C01/V01 home',
    title: '/home/ is never targeted — location rule uses http:// instead of https://',
    body: 'Location 100012039 lists <code>http://rentersinsurancegurus.com/home/</code> (both the URL and URL-with-query rules). The site serves <code>https://rentersinsurancegurus.com/home/</code>, so visitors there are never bucketed into either arm — no body class, no Convert entry for 100052988, Lemonade stays #1. <code>/</code> and <code>/comparison/</code> (both https) bucket correctly. Patching only this rule to https in the test browser made /home/ bucket and render V1 correctly (the "home-fixed" rows). The co-running cre-t-163 experiment uses https for the same page.',
    fix: 'In Convert, change both /home/ rules in location 100012039 to <code>https://rentersinsurancegurus.com/home/</code>.' },
  { id: 'BUG-02', sev: 'Medium', where: 'V1 · all pages · all devices', tests: 'V07',
    title: 'Per-partner goals fire on any click inside the card (phone number, blank space)',
    body: 'The SWF166 goals (Lemonade <code>100038330</code>, Liberty <code>100038331</code>) are bound to mousedown on the whole <code>&gt; .plan-box</code>. Pressing the Liberty phone link <code>tel:+18446444275</code> or a column heading like "AVERAGE PLAN COST" fires 100038331, so outbound-click counts will be inflated, more on the Liberty card because it has the phone link. The site\'s own per-partner goals only count <code>a.rt-aff-link</code>.',
    fix: 'Bind to the partner links only, e.g. <code>[data-unique="…Liberty-Mutual-Listing-Only"] a.rt-aff-link</code>, same for Lemonade and the Best Overall card.' },
  { id: 'BUG-03', sev: 'Medium', where: 'V1 · exit modal · all devices', tests: 'V07',
    title: 'Exit-modal "Visit Liberty Mutual" click does not count toward the Liberty goal',
    body: 'The client asked that the per-partner outbound goals include modal clicks. The new modal button (<code>.cre-t-166-button-container a</code>) fires only the generic all-outbound goal <code>100036136</code>, not <code>100038331</code>.',
    fix: 'Add <code>.cre-t-166-button-container a.rt-aff-link</code> to the Liberty goal selector (on control, the native "Visit Lemonade" modal button should count toward the Lemonade goal for a fair comparison).' },
  { id: 'BUG-04', sev: 'Medium', where: 'V1 · /comparison/ · all devices', tests: 'V03 comparison',
    title: 'Two yellow App Store bars on Liberty on /comparison/',
    body: '/comparison/ already ranks Liberty #1 natively and already has a Liberty bar ("458,159 people ranked Liberty Mutual as 4.8"). V1 inserts a second bar ("499,000 … 4.8") below it — the duplicate check only looks for the injected bar, not the native one.',
    fix: 'Skip insertion when the Liberty card already has a native <code>.rating-bar</code> — or, if 499,000 should show everywhere, update the native bar\'s count instead of adding a second one.' },
  { id: 'BUG-05', sev: 'Medium', where: 'V1 · all pages · all devices', tests: 'V03',
    title: 'Typo in the yellow bar: "Libery Mutual"',
    body: 'The injected bar reads "499,000 people ranked <strong>Libery</strong> Mutual as 4.8 on App Store". The typo is in both the deployed Convert code and local vB.js.',
    fix: 'Change "Libery" to "Liberty" in <code>ratingBarHTml</code>.' },
  { id: 'BUG-06', sev: 'Low', where: 'V1 · all pages · all devices', tests: 'V08',
    title: 'JS error on every V1 page: "trigger is not a function"',
    body: '<code>waitForElement(selector, trustpilotContent(), 50, 25000)</code> calls trustpilotContent immediately and passes its <code>undefined</code> return as the callback, which throws when the element appears. The TrustScore swap only works because the listing already exists at init; it would silently do nothing if the listing loaded later.',
    fix: 'Pass the function reference: <code>waitForElement(…, trustpilotContent, 50, 25000)</code>.' },
  { id: 'BUG-07', sev: 'Low', where: 'V1 · / and /home/ · Chromium', tests: 'V08',
    title: 'Brief flash of Lemonade at #1 before the swap',
    body: 'Frame sampling caught Lemonade painted above Liberty for 1–2 frames (24–36 ms on Chrome desktop, 41–95 ms on Pixel 5) on / and /home/. None on WebKit (Safari desktop, iPhone 12), and none on /comparison/ (already Liberty-first). The body class that triggers the reorder CSS is added from a <code>waitForElement("body")</code> 50 ms poll.',
    fix: 'Add <code>cre-t-166</code> to <code>document.documentElement</code> synchronously at the top of the variation (and key the CSS off <code>html.cre-t-166</code>) instead of polling for body.' },
];
const RESOLVED = [
  { id: 'FIXED-01', title: 'Per-partner goals were commented out and used the wrong IDs',
    body: 'At the start of QA the deployed code had the triggerConversion calls commented out with IDs <code>100037396/100037397</code>, which are not attached to experiment 100052988. The code was republished mid-QA (2026-10-21) with live calls to <code>100038330</code> (Lemonade) and <code>100038331</code> (Liberty). Both now fire on their listing CTAs and on the Best Overall CTA — see BUG-02/03 for what is still wrong.' },
];
const NOTES = [
  '<strong>Geo targeting was simulated.</strong> The audience requires one of 30 US states (AR, AZ, CO, CT, DC, FL, GA, IA, IL, IN, MA, MD, MI, MO, NC, NJ, NM, NV, NY, OH, OK, OR, PA, RI, TN, TX, UT, VA, WA, WI — matches "TX, NY, NJ, DC + 26"). The force URLs therefore show nothing from outside the US. The test browser patched only the <code>geo.state == \'TX\'</code> check to true; URL rules, audience, bucketing and the deployed variation code are all real.',
  '<strong>SWF106 targeting could not be compared.</strong> SWF106 is no longer in the Convert project data, so the state list was checked against the brief only.',
  '<strong>modalContent.png was not supplied.</strong> The V1 modal was compared to the native /comparison/ modal, which already promotes Liberty with the same copy — they match.',
  '<strong>Traffic split is 30/70</strong> (control 1000257707 = 30, V1 1000257708 = 70), as per the updated brief.',
  '<strong>Exit intent does not fire on touch devices</strong> (Oxygen <code>on_exit_intent</code>, same on control). On Pixel 5 / iPhone 12 the modal was force-shown to verify content only.',
  '<strong>TrustScore badges are position-based</strong> on this site (#1 = 4.9, #2 = 4.7, same as native /comparison/). V1 swaps them along with the order, which is consistent with the site.',
  '<strong>Unrelated (another test):</strong> cre-t-163 (exp 100052810, currently QA-audience only) shows a veterinarian / pet-insurance quote ("…difference between treatment and euthanasia") on the renters homepage — looks like a PIG clone leftover.',
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
  const evidence = {
    'BUG-01': [await fig(path.join(cd, 'control-home-listings.png'), '/home/ via force URL — not bucketed into 100052988, page untouched (V1 force URL gives the same, see V01 home)', 700)],
    'BUG-04': [await fig(path.join(ip, 'v1-comparison-liberty-card.png'), 'iPhone 12, V1 /comparison/ — native 458,159 bar + injected 499,000 bar', 380)],
    'BUG-05': [await fig(path.join(ip, 'v1-root-liberty-card.png'), 'iPhone 12, V1 / — "Libery Mutual"', 380)],
  };

  const gallery = [];
  for (const p of PROJECTS) {
    const d = path.join(SHOTS, p.dir); const mob = /Mobile/.test(p.name); const w = mob ? 360 : 900;
    const items = [];
    for (const [f, c] of [
      ['control-root-listings', 'Control / — listings (Lemonade #1)'], ['v1-root-listings', 'V1 / — listings (Liberty #1)'],
      ['v1-root-liberty-card', 'V1 / — Liberty card with yellow bar'], ['v1-root-best-overall', 'V1 / — Best Overall (Liberty)'],
      ['v1-root-exit-modal', 'V1 / — exit modal'], ['v1-home-fixed-listings', 'V1 /home/ (https rule) — listings'],
      ['control-comparison-listings', 'Control /comparison/ — native Liberty #1'], ['v1-comparison-liberty-card', 'V1 /comparison/ — duplicate yellow bars'],
      ['v1-comparison-exit-modal', 'V1 /comparison/ — exit modal'],
    ]) items.push(await fig(path.join(d, f + '.png'), c, w));
    gallery.push(`<h3>${esc(p.short)}</h3><div class="grid ${mob ? 'mob' : ''}">${items.join('')}</div>`);
  }
  await browser.close();

  const bugCards = BUGS.map((b) => `<article class="bug-card sev-${b.sev.toLowerCase()}"><header><span class="id">${b.id}</span><span class="sev">${b.sev}</span><span class="meta">${b.where} · tests: ${b.tests}</span></header><h4>${b.title}</h4><p>${b.body}</p><p class="fix"><strong>Fix:</strong> ${b.fix}</p>${(evidence[b.id] || []).join('')}</article>`).join('');
  const fixed = RESOLVED.map((b) => `<article class="bug-card sev-fixed"><header><span class="id">${b.id}</span><span class="sev">Fixed on live</span></header><h4>${b.title}</h4><p>${b.body}</p></article>`).join('');
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
<h1>The Swiftest — SWF166 — Renters Insurance — Move Liberty to #1</h1>
<p class="sub">Renters Insurance Gurus · Convert exp 100052988 · Control 1000257707 (30%) · V1 1000257708 (70%, <code>cre-t-166</code>) · Pages: /, /home/, /comparison/ · Audience: 30 US states · QA 2026-10-21</p>
<div class="kpis">
<div class="kpi"><b>${all.P}/${all.P + all.F}</b><span>checks passed across 4 browsers</span></div>
${PROJECTS.map((p, i) => `<div class="kpi"><b>${tot[i].P}/${tot[i].P + tot[i].F}</b><span>${esc(p.short)}</span></div>`).join('')}
<div class="kpi"><b>${BUGS.length}</b><span>open issues (${sevCount('High')} high, ${sevCount('Medium')} medium, ${sevCount('Low')} low)</span></div>
</div>
<p class="verdict"><strong>Verdict: not ready to launch.</strong> The core swap works on all 4 browsers: Liberty #1, Lemonade #2, numbers 1–7 in order, affiliate links follow each partner, Best Overall shows Liberty with matching data, and the exit modal promotes Liberty. Blocking: <strong>BUG-01</strong> (/home/ traffic is never in the test), <strong>BUG-02/03</strong> (partner goals over-count and miss modal clicks), and <strong>BUG-04/05</strong> (duplicate bar on /comparison/, "Libery" typo). The same results came back on every browser — none of the failures are browser-specific.</p>

<h2>Open issues</h2>${bugCards}
<h2>Resolved during QA</h2>${fixed}

<h2>Notes</h2><ul>${NOTES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Test matrix</h2>
<p class="sub">Expected values come from the brief and the native Liberty-first /comparison/ page, not from the code. "home" = /home/ as configured; "home-fixed" = /home/ with the location rule patched to https so V1 could be checked there. "Details" holds measurements and failure messages.</p>
<div class="tablewrap"><table><thead><tr><th>Test</th>${PROJECTS.map((p) => `<th>${esc(p.short)}</th>`).join('')}<th>Bug</th></tr></thead><tbody>${matrix}</tbody></table></div>

<h2>Scope and method</h2>
<ul>
<li>Order followed: brief + client comments → vB.js/vB.css → deployed Convert code (diffed against local: same apart from rating-bar markup; republished mid-QA, see FIXED-01) → live force URLs → Playwright spec (<code>my-playwright-project/testing/swf166-liberty-first.spec.js</code>) → this report.</li>
<li>Browsers (as requested): Chrome desktop, Safari desktop (WebKit), Chrome mobile (Pixel 5), Safari mobile (iPhone 12), run one at a time.</li>
<li>Covered: Convert bucketing and body class per page, visual order and shown rank numbers, yellow App Store bar (copy, count, rating, one per card, overflow), affiliate hrefs per partner, TrustScore badges, Best Overall content vs the Liberty listing, exit-modal logo, copy and CTA, goal triggers (via a <code>_conv_q.push</code> spy on mousedown), per-frame flash measurement, console/page errors.</li>
<li>Not covered: real iOS/macOS Safari hardware (Playwright WebKit used), real US geo-IP (simulated, see Notes), Convert reporting dashboards.</li>
</ul>

<h2>Screenshots</h2>${gallery.join('')}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', JSON.stringify(tot));
})();
