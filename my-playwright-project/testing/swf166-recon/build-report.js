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
// Main results file first, then any re-run part files (<base>-*.json), which override earlier results.
const resultFiles = (p) => {
  const base = p.file.replace(/\.json$/, '');
  return [p.file, ...fs.readdirSync(RES).filter((f) => f.startsWith(base + '-') && f.endsWith('.json')).sort()].map((f) => path.join(RES, f)).filter((f) => fs.existsSync(f));
};
for (const p of PROJECTS) for (const file of resultFiles(p)) {
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
  { id: 'BUG-08', sev: 'High', where: 'Control + V1 · all pages · all devices', tests: 'C02, V07', still: true,
    title: 'STILL OPEN — Liberty Mutual goal 100038331 never fires (in either arm)',
    body: 'Unchanged since round 2: the Liberty line is still <code>live(\'…&gt; .plan-box, … .rating-bar, …best-overall … &gt; .plan-box\', \'.button.Liberty_Mutual.rt-aff-link\', "mousedown", function () {…})</code>. With the modal selector as an extra 2nd argument, <code>live(selector, event, callback)</code> gets <code>callback = "mousedown"</code>, returns at <code>typeof callback !== "function"</code> and binds nothing. Round 3: mousedown on the Liberty listing CTA, the V1 Best Overall (Liberty) CTA and the V1 modal "Visit Liberty Mutual" button fire no 100038331, in both arms on every page and browser. Lemonade 100038330 fires.',
    fix: 'Join the modal selector into the selector string in both V1 and the control goal script:<br><code>live(\'[data-unique="comparison-table"] &gt; [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link, [data-unique="best-overall"] &gt; [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link, .cre-t-166-button-container a.rt-aff-link\', "mousedown", function () {…})</code>' },
  { id: 'BUG-09', sev: 'Medium', where: 'V1 · exit modal · all pages · all devices', tests: 'V11', isNew: true,
    title: 'NEW — the injected modal button "Visit Liberty Mutual" bypasses the site\'s affiliate click tracking',
    body: 'The site binds its affiliate handler once at page load: <code>$(".rt-aff-link").click(…)</code>. On click it adds <code>sub1</code> (page), <code>sub5</code> (Everflow click ID) and <code>sub3</code>/<code>sub4</code> (running Convert experiment / variation IDs), sends gtag <code>aff_link_click</code>, and opens the partner in a new tab. V1 hides the native modal button and injects a new <code>&lt;a class="button Liberty_Mutual rt-aff-link"&gt;</code> after load, so the handler is never attached. Measured: control modal "Visit Lemonade" goes to <code>…/2F8LBL/?sub1=%2F&amp;sub5=…&amp;sub3=…,100052988&amp;sub4=…,1000257707</code>. V1 modal "Visit Liberty Mutual" goes to a bare <code>…/41NTW2/?sub1=Guru</code> in the same tab: no experiment/variation attribution, no Everflow click ID, no GA event. V1 modal Liberty revenue cannot be attributed to the variation, and the user leaves the site instead of getting a new tab. Listing and Best Overall clicks are attributed correctly (V09 pass).',
    fix: 'Repurpose the native modal button instead of injecting a new one, as the commented-out block in vB.js already does: set the href of <code>.oxy-modal-backdrop .button.lemonade.rt-aff-link</code> to the Liberty URL and change its text to "Visit Liberty Mutual". Then remove the injected <code>.cre-t-166-button-container</code> and the CSS that hides <code>p.button-container</code>. The site handler reads the href at click time, so attribution then works (the Best Overall rewrite already proves this).' },
  { id: 'BUG-02', sev: 'Medium', where: 'Control + V1 · all pages · all devices', tests: 'C02, V07', still: true,
    title: 'STILL OPEN — partner goals are bound to the whole card (a heading counts as an outbound click)',
    body: 'Selectors are unchanged (<code>&gt; .plan-box</code>, <code>.rating-bar</code>). Mousedown on the Lemonade "AVERAGE PLAN COST" heading fires 100038330 (control C02, all pages). Once BUG-08 is fixed with the current selectors, Liberty headings, blank card space and the <code>tel:</code> phone link will fire 100038331 too.',
    fix: 'Bind to the partner links only (<code>a.rt-aff-link</code> inside each partner card).' },
  { id: 'BUG-03', sev: 'Medium', where: 'Control + V1 · exit modal · all devices', tests: 'C02, V07', still: true,
    title: 'STILL OPEN — exit-modal CTA clicks are not counted toward the partner goals',
    body: 'V1 modal "Visit Liberty Mutual" fires only the generic 100036136 (BUG-08). Control modal "Visit Lemonade" fires only 100036136, not 100038330: the Lemonade goal selector does not include the modal button.',
    fix: 'Liberty: see BUG-08. Lemonade (both arms): add <code>.oxy-modal-backdrop a.rt-aff-link.lemonade</code> to the Lemonade goal selector.' },
  { id: 'BUG-10', sev: 'Low', where: 'V1 · / and /home/ · desktop', tests: 'V12', isNew: true,
    title: 'NEW — keyboard Tab order still goes Lemonade → Liberty (visual order is Liberty → Lemonade)',
    body: 'The swap is CSS <code>order</code> only, so DOM order (and therefore Tab and screen-reader order) is unchanged. Tabbing into the list on / and /home/ reaches Lemonade #2 first, then Liberty #1 (WCAG 2.4.3 Focus Order / 1.3.2 Meaningful Sequence). /comparison/ passes because it is Liberty-first natively.',
    fix: 'Physically move the Liberty node before Lemonade in <code>init()</code>, e.g. <code>table.insertBefore(libertyCard, lemonadeCard)</code>, and keep the CSS order as the first-paint fallback.' },
  { id: 'BUG-06', sev: 'Medium', where: 'V1 · all pages · all devices (visible effect seen on Safari /home/)', tests: 'V08, V04 home', still: true,
    title: 'STILL OPEN, now with a visible effect — "trigger is not a function" also makes the TrustScore swap race the page load',
    body: 'Unchanged: <code>waitForElement(…trustpilot-image\', trustpilotContent(), 50, 25000)</code> <em>calls</em> <code>trustpilotContent</code> immediately and passes its <code>undefined</code> return as the callback. That throws "trigger is not a function" on every V1 page (V08). It also means the swap runs exactly once, at <code>init</code> (when <code>body</code> first exists), with no wait or retry. If the TrustScore images are not parsed yet at that moment, the swap is silently skipped. Round 3 caught this on Safari desktop /home/: Liberty at #1 showed the <strong>4.7</strong> badge and Lemonade at #2 the <strong>4.90</strong> badge, the reverse of native /comparison/. Intermittent: 1 of ~11 Safari loads (with 2 tests running in parallel), 0 of 8 when re-run alone. Slower devices and networks make it more likely.',
    fix: 'Pass the reference: <code>waitForElement(…, trustpilotContent, 50, 25000)</code>. The swap then waits until the Liberty TrustScore image exists.' },
  { id: 'BUG-07', sev: 'Low', where: 'V1 · / and /home/ · Chromium', tests: 'V08', still: true,
    title: 'STILL OPEN — brief flash of Lemonade at #1 before the swap',
    body: '1–2 frames of Lemonade-first on / and /home/ in Chromium this round (≈38–40 ms on Chrome desktop). The body class is still added after a <code>waitForElement("body")</code> 50 ms poll.',
    fix: 'Add the class to <code>document.documentElement</code> synchronously at the top of the variation and key the CSS off <code>html.cre-t-166</code>.' },
];
const RESOLVED = [
  { id: 'BUG-01', title: 'Still fixed — /home/ is targeted', body: 'Location 100012039 still lists the https /home/ URL. /home/ buckets into both arms unpatched, and V1 renders there.' },
  { id: 'BUG-04', title: 'Still fixed — one yellow bar on /comparison/', body: 'Exactly one visible bar on Liberty ("499,000 … 4.8") on every browser.' },
  { id: 'BUG-05', title: 'Still fixed — "Liberty" spelling', body: 'The bar reads "499,000 people ranked Liberty Mutual as 4.8 on [App Store]".' },
  { id: 'NEW PASS', title: 'New round-3 checks that pass', body: 'V09: real clicks on Liberty #1 (CTA + logo), Lemonade #2 and Best Overall open the right partner in a new tab, attributed to 100052988 / 1000257708 (sub3/sub4). V10: listings #3–#7 (Farmers, USAA, State Farm, Progressive, Allstate) are identical to control (number, links, TrustScore, bars), and there is no horizontal scroll. V11: the modal X closes the modal, re-opening does not duplicate the injected logo/text/button, and the Liberty button sits fully inside the viewport.' },
];
const NOTES = [
  '<strong>No code change since round 2.</strong> The "updated" local <code>vB.js</code>/<code>vB.css</code> are byte-identical to the round-2 files (git shows no diff). The deployed Convert code, freshly fetched (bundle <code>max-age=300</code>), is still <strong>exp version 12</strong>, the same V1 JS (17,328 chars) and CSS (3,085 chars), and the same control goal script as round 2. Either the fixes were not saved/published in Convert, or a different file was updated. Every round-2 finding therefore reproduces unchanged.',
  '<strong>Code note (no visible impact):</strong> in <code>modalUpdate()</code> the guard is <code>document.querySelector(\'cre-t-166-strong-text\')</code>, which is missing the leading <code>.</code>, so it never matches. It is harmless today because the <code>waitForElement</code> callback runs only once, but fix it alongside the others.',
  '<strong>Geo targeting was simulated.</strong> The audience requires one of 30 US states. Only the <code>geo.state == \'TX\'</code> check in the Convert bundle was patched to true. URL rules, audience, bucketing and deployed code are real.',
  '<strong>Affiliate clicks were stubbed.</strong> In V09/V11, requests to <code>go.rentersinsurancegurus.com</code> were answered locally, so QA clicks did not reach Everflow and did not pollute partner data.',
  '<strong>Exit intent does not fire on touch devices</strong> (same on control). On Pixel 5 / iPhone 12 the modal was force-shown to verify content and behaviour. V12 (keyboard Tab order) is a desktop-only check, n/a on mobile.',
  '<strong>Goal check method:</strong> a <code>window._conv_q.push</code> spy plus a dispatched <code>mousedown</code> on each target. The generic all-outbound goal 100036136 and the site\'s native per-partner goals (100036137–140) fire correctly in both arms.',
  '<strong>Previous rounds</strong> are kept as <code>swf166-liberty-first-qa-report-r1.html</code> and <code>-r2.html</code>, with results in <code>swf166-results/r1</code> and <code>/r2</code>.',
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
    'BUG-09': [await fig(path.join(cd, 'v1-root-exit-modal.png'), 'Chrome desktop, V1 / — the injected "Visit Liberty Mutual" button (no site click handler)', 700)],
  };
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
  const fixed = RESOLVED.map((b) => `<article class="bug-card sev-fixed"><header><span class="id">${b.id}</span><span class="sev">${b.id === 'NEW PASS' ? 'Pass' : 'Still fixed'}</span></header><h4>${b.title}</h4><p>${b.body}</p>${(resolvedEvidence[b.id] || []).join('')}</article>`).join('');
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
<h1>The Swiftest — SWF166 — Renters Insurance — Move Liberty to #1 — Recheck (Round 3)</h1>
<p class="sub">Renters Insurance Gurus · Convert exp 100052988 · Control 1000257707 (30%) · V1 1000257708 (70%, <code>cre-t-166</code>) · Pages: /, /home/, /comparison/ · Audience: 30 US states · Round 3 recheck 2026-10-22 · preview <code>?cro_mode=qa&amp;_conv_eforce=100052988.1000257708</code></p>
<div class="kpis">
<div class="kpi"><b>${all.P}/${all.P + all.F}</b><span>checks passed across 4 browsers</span></div>
${PROJECTS.map((p, i) => `<div class="kpi"><b>${tot[i].P}/${tot[i].P + tot[i].F}</b><span>${esc(p.short)}</span></div>`).join('')}
<div class="kpi"><b>${BUGS.length}</b><span>open issues (${sevCount('High')} high, ${sevCount('Medium')} medium, ${sevCount('Low')} low)</span></div>
</div>
<p class="verdict"><strong>Verdict (round 3): still not ready to launch. Nothing changed since round 2.</strong> The "updated" vB.js/vB.css are identical to the round-2 code, and Convert still serves exp version 12. So every round-2 issue reproduces: <strong>BUG-08 (High)</strong>, the Liberty Mutual goal 100038331 is dead in both arms, plus BUG-02/03 (goal scope, modal clicks), BUG-06 (JS error; this round it also left the TrustScore badges unswapped on one Safari /home/ load) and BUG-07 (short flash). The new round-3 checks found <strong>BUG-09</strong> (Medium): the V1 exit-modal "Visit Liberty Mutual" button skips the site's affiliate tracking, so no sub3/sub4 experiment attribution, no Everflow click ID, no GA event, and it opens in the same tab. They also found <strong>BUG-10</strong> (Low): keyboard Tab order on / and /home/ still goes Lemonade → Liberty. The visual change itself still passes everywhere: order, rank numbers, yellow bar, links, TrustScore, Best Overall, modal content, close/re-open, real-click destinations and listings #3–#7.</p>

<h2>Open issues</h2>${bugCards}
<h2>Regression-checked fixes and new passes</h2>${fixed}

<h2>Notes</h2><ul>${NOTES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Test matrix</h2>
<p class="sub">Expected values come from the brief and the native Liberty-first /comparison/ page, not from the code. "home" = /home/ as configured. V09–V12 are new in round 3 (real clicks + attribution, listings #3–#7 vs control, modal close/re-open + Liberty CTA, keyboard order). "Details" holds measurements and failure messages.</p>
<div class="tablewrap"><table><thead><tr><th>Test</th>${PROJECTS.map((p) => `<th>${esc(p.short)}</th>`).join('')}<th>Bug</th></tr></thead><tbody>${matrix}</tbody></table></div>

<h2>Scope and method</h2>
<ul>
<li>Order followed: brief + client comments → vB.js/vB.css → deployed Convert code (round 3: still exp version 12, identical to round 2 and to local vB.js/vB.css) → live force URLs → Playwright spec (<code>my-playwright-project/testing/swf166-liberty-first.spec.js</code>) → this report.</li>
<li>Browsers (as requested): Chrome desktop, Safari desktop (WebKit), Chrome mobile (Pixel 5), Safari mobile (iPhone 12), run one at a time.</li>
<li>Covered: Convert bucketing and body class per page, visual order and shown rank numbers, yellow App Store bar (copy, count, rating, one per card, overflow), affiliate hrefs per partner, TrustScore badges, Best Overall content vs the Liberty listing, exit-modal logo, copy and CTA, goal triggers (via a <code>_conv_q.push</code> spy on mousedown), per-frame flash measurement, console/page errors. New in round 3: real clicks with the destination URL and sub1/sub3/sub4/sub5 attribution (affiliate hops stubbed), listings #3–#7 compared against control, horizontal overflow, modal close/re-open idempotency and CTA position, and keyboard Tab order (desktop).</li>
<li>Not covered: real iOS/macOS Safari hardware (Playwright WebKit used), real US geo-IP (simulated, see Notes), Convert reporting dashboards.</li>
</ul>

<h2>Screenshots</h2>${gallery.join('')}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', JSON.stringify(tot));
})();
