// LOTUS15: build the self-contained HTML QA report from the Playwright JSON results + screenshots.
// Screenshots are re-encoded as downscaled JPEGs (via Chromium) so the report stays a sensible size.
// usage: node testing/lotus15-recon/build-report.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const L2 = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2');
const RES = path.join(L2, 'lotus15-results');
const SHOTS = path.join(L2, 'lotus15-screenshots');
const OUT = path.join(L2, 'lotus15-homepage-new-hero-qa-report.html');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');

const PROJECTS = [
  { name: 'Chrome Desktop', short: 'Chrome desktop', files: ['chrome-desktop.json'] },
  { name: 'Safari Desktop', short: 'Safari desktop', files: ['safari-desktop.json', 'safari-desktop-t14.json'] },
  { name: 'Mobile Chrome (Pixel 5)', short: 'Chrome mobile (Pixel 5)', files: ['pixel5.json'] },
  { name: 'Mobile Safari (iPhone 12)', short: 'Safari mobile (iPhone 12)', files: ['iphone12.json', 'iphone12-t14.json'] },
];

// results[title][project] = { status, error, notes } — later files (re-runs) override earlier ones
const results = {}; const order = [];
for (const p of PROJECTS) {
  for (const f of p.files) {
    const file = path.join(RES, f);
    if (!fs.existsSync(file)) continue;
    const walk = (s) => {
      (s.suites || []).forEach(walk);
      for (const sp of s.specs || []) for (const t of sp.tests) {
        const r = t.results[t.results.length - 1]; if (!r) continue;
        if (!results[sp.title]) { results[sp.title] = {}; order.push(sp.title); }
        results[sp.title][p.name] = {
          status: r.status === 'passed' ? 'P' : r.status === 'skipped' ? 'S' : 'F',
          error: strip(r.error?.message).split('\n').slice(0, 4).join('\n'),
          notes: (t.annotations || []).map((a) => a.description),
        };
      }
    };
    JSON.parse(fs.readFileSync(file, 'utf8')).suites.forEach(walk);
  }
}

const BUGS = [
  { id: 'BUG-01', sev: 'Medium', arms: 'V1 + V2', where: 'All devices', tests: 'T13',
    title: '"Plan your trip" shows the 4 newest blog posts, not the 4 in the wireframe',
    body: 'The code fetches /blog and takes the first 4 posts, so the section changes whenever a new post is published. Live today: <em>Iceland in October 2026</em>, <em>What is the Best Month to Visit Iceland?</em>, <em>How Many Days Do You Need to Visit Iceland?</em>, <em>Is Iceland Expensive?</em>. Wireframe: <em>How Many Days…</em>, <em>Campervan vs Car Rental in Iceland</em>, <em>Renting a Car in Iceland with Kids</em>, <em>How to Rent a Car in Iceland</em>. Only one matches.',
    fix: 'Client decision: if the wireframe posts are intended, hard-code those 4 slugs (fall back to latest if one is missing); if "latest" is intended, close as accepted.' },
  { id: 'BUG-02', sev: 'Medium', arms: 'V2', where: 'All devices, mostly mobile data', tests: 'manual',
    title: 'Hero video is 23.6 MB and preloads in full on every device',
    body: '<code>1000200424_compressed.mp4</code> (1280×720, 45 s) is 23,572,027 bytes, and the video tag uses <code>preload="auto"</code> with no mobile variant. Phones on cellular download ~24 MB on the homepage, which will slow LCP and may skew the V2 result.',
    fix: 'Re-encode a smaller mobile version (e.g. 720p→480p, ~3–5 MB) served by a media query, or lazy-start the video after load; keep the poster image.' },
  { id: 'BUG-03', sev: 'Low', arms: 'V2', where: 'All devices', tests: 'T03',
    title: 'Feature (USP) icons are different sizes in V2',
    body: 'V2 icons render at their natural SVG size: 20×20, 22×16, 20×20, 19×22 (V1 forces all four to 16×16 like the wireframe). The V2 Google rating badge also differs from V1 (209×40 vs 240×46 on desktop). The two variants should look identical apart from the background.',
    fix: 'Port V1’s ICON_STYLE / inline 16px sizing to va3.js, and match the rating icon height.' },
  { id: 'BUG-04', sev: 'Low', arms: 'V2', where: 'All devices', tests: 'T18',
    title: 'Video ignores the "reduce motion" accessibility setting',
    body: 'With <code>prefers-reduced-motion: reduce</code> the V2 video still autoplays. The guard exists in vB.js (where it is unused, since V1 is image mode) but was removed from va3.js.',
    fix: 'Restore the <code>matchMedia("(prefers-reduced-motion: reduce)")</code> check in va3.js and show the static image instead.' },
  { id: 'BUG-05', sev: 'Low', arms: 'V1 + V2', where: 'Desktop only', tests: 'T06',
    title: 'Screen readers still announce "Check the fleet" on the desktop CTA',
    body: 'The "Search Now" label is painted with CSS <code>::after</code> on a <code>font-size:0</code> button, so the button’s accessible name stays "Check the fleet" (WCAG 2.5.3 label-in-name). Mobile is fine — the site’s mobile button already says "Search Now".',
    fix: 'Add <code>aria-label="Search Now"</code> to <code>[data-booking-element="check-fleet-desktop"]</code> (and remove it in removeVariation).' },
  { id: 'BUG-06', sev: 'Low', arms: 'V1 + V2', where: 'Code only', tests: 'manual',
    title: 'Code tidy-up: unclosed span, developer notes shipped in V2 CSS',
    body: 'Rating markup opens <code>&lt;span class="…hero-rating__icons"&gt;</code> and never closes it (the browser nests the text span inside it). va3.css ships "CSS CHANGES ONLY — 1) REPLACE… 2) REMOVE…" instructions and a duplicate <code>.reviews__track</code> rule — this is live.',
    fix: 'Close the span after the icon; delete the instruction comments and the duplicate rule.' },
];
const RESOLVED = [
  { id: 'FIXED-01', title: 'V1 mobile/tablet hero showed control’s own photo',
    body: 'At recon time (live code + local vB.js line 11) V1 below 1024px loaded <code>afxmOcBOoF08xtoI_defender-lava-field-lake-aerial.jpg</code> — the same image control uses. Live Convert code now has <code>HERO_IMAGE_MOBILE = ".../test15/1.jpg"</code>; re-verified at 390, 820 and 1000px and T04 passes on both phones. <strong>The local vB.js is stale</strong> — update it so it is not re-deployed.' },
];

const ICON = { P: '<span class="st p">Pass</span>', F: '<span class="st f">Fail</span>', S: '<span class="st s">n/a</span>' };
const bugFor = (title) => {
  const m = title.match(/^T(\d+)/); const t = m && 'T' + m[1].padStart(2, '0');
  return BUGS.filter((b) => b.tests.split(/[ ,]+/).includes(t)).map((b) => b.id).join(', ');
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
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sdir = (p) => path.join(SHOTS, slug(p));

  // totals
  const tot = PROJECTS.map((p) => { const t = { P: 0, F: 0, S: 0 }; order.forEach((o) => { const r = results[o][p.name]; if (r) t[r.status]++; }); return t; });
  const all = tot.reduce((a, t) => ({ P: a.P + t.P, F: a.F + t.F }), { P: 0, F: 0 });

  const matrix = order.map((title) => {
    const cells = PROJECTS.map((p) => { const r = results[title][p.name]; return `<td>${r ? ICON[r.status] : '<span class="st s">not run</span>'}</td>`; }).join('');
    const notes = [...new Set(PROJECTS.flatMap((p) => { const r = results[title][p.name]; return r ? [...r.notes, r.status === 'F' ? r.error : ''] : []; }).filter(Boolean))];
    return `<tr><td>${esc(title)}</td>${cells}<td class="bug">${bugFor(title)}</td></tr>` +
      (notes.length ? `<tr class="detail"><td colspan="${PROJECTS.length + 2}"><details><summary>Details</summary><pre>${esc(notes.join('\n'))}</pre></details></td></tr>` : '');
  }).join('');

  // screenshot galleries
  const gallery = [];
  for (const p of PROJECTS) {
    const d = sdir(p.name); const mob = /Mobile/.test(p.name); const w = mob ? 340 : 900;
    const items = [];
    for (const [f, c] of [
      ['control-T01-fold', 'Control — first screen'], ['v1-T01-fold', 'V1 — first screen'], ['v2-T01-fold', 'V2 — first screen'],
      ['v1-T08-reviews', 'V1 — new reviews section'], ['v1-T10-expanded', 'V1 — review expanded (Read more)'], ['v1-T09-last-page', 'V1 — carousel last page'], ['v1-T09-swiped', 'V1 — carousel after swipe'],
      ['v1-T11-fleet', 'V1 — fleet section (grey, new title)'], ['v1-T12-plan', 'V1 — Plan your trip'], ['v2-T03-usps', 'V2 — USP icons (uneven sizes)'], ['v1-T03-usps', 'V1 — USP icons'],
      ['v2-T04-hero-video', 'V2 — video hero'], ['v1-T15-after-cta', 'V1 — after clicking Search Now'],
    ]) items.push(await fig(path.join(d, f + '.png'), c, w));
    const full = [];
    for (const a of ['control', 'v1', 'v2']) full.push(await fig(path.join(d, `${a}-T01-full-page.png`), `${a.toUpperCase()} — full page`, mob ? 300 : 520));
    gallery.push(`<h3>${esc(p.short)}</h3><div class="grid ${mob ? 'mob' : ''}">${items.join('')}</div><details><summary>Full-page screenshots (control / V1 / V2)</summary><div class="grid full">${full.join('')}</div></details>`);
  }
  const wire = [];
  for (const [f, c] of [['v1-0', 'Wireframe V1/V2 — hero'], ['v1-1', 'Wireframe — reviews'], ['v1-2', 'Wireframe — fleet + Plan your trip']])
    wire.push(await fig(path.join(__dirname, 'wire', f + '.png'), c, 700));
  const sheet = await fig(path.join(__dirname, 'out', 'video-contact-sheet.png'), 'V2 video frames at 0.5–44 s: three spliced clips (sunset road → lava field / mountain → straight snowy road)', 1300);
  await browser.close();

  const bugCards = BUGS.map((b) => `<article class="bug-card sev-${b.sev.toLowerCase()}"><header><span class="id">${b.id}</span><span class="sev">${b.sev}</span><span class="meta">${b.arms} · ${b.where} · tests: ${b.tests}</span></header><h4>${b.title}</h4><p>${b.body}</p><p class="fix"><strong>Suggested fix:</strong> ${b.fix}</p></article>`).join('');
  const fixed = RESOLVED.map((b) => `<article class="bug-card sev-fixed"><header><span class="id">${b.id}</span><span class="sev">Fixed on live</span></header><h4>${b.title}</h4><p>${b.body}</p></article>`).join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lotus Test 15 QA</title>
<style>
:root{--bg:#f6f6f4;--card:#fff;--ink:#18181b;--mute:#6b6b70;--line:#e4e4e7;--pass:#15803d;--passbg:#dcfce7;--fail:#b91c1c;--failbg:#fee2e2;--warn:#a16207;--warnbg:#fef3c7;--accent:#0b5345}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24;--accent:#5eead4}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1200px;margin:0 auto;padding:32px 16px 80px}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:40px 0 12px;padding-top:8px;border-top:1px solid var(--line)}h3{font-size:16px;margin:28px 0 10px}
.sub{color:var(--mute);margin:0 0 20px}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:20px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:24px}.kpi span{color:var(--mute);font-size:13px}
.verdict{background:var(--warnbg);border-left:4px solid var(--warn);padding:14px 16px;border-radius:8px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:14px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--bg);font-weight:600}
.tablewrap{overflow-x:auto}.st{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:600}.st.p{background:var(--passbg);color:var(--pass)}.st.f{background:var(--failbg);color:var(--fail)}.st.s{background:var(--line);color:var(--mute)}
tr.detail td{padding:0 10px 8px;border-bottom:1px solid var(--line)}details summary{cursor:pointer;color:var(--mute);font-size:13px}pre{white-space:pre-wrap;font-size:12px;background:var(--bg);padding:8px;border-radius:6px;margin:6px 0 0}
td.bug{font-weight:600;color:var(--fail);white-space:nowrap}
.bug-card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--warn);border-radius:10px;padding:14px 16px;margin:12px 0}
.bug-card.sev-medium{border-left-color:#ea580c}.bug-card.sev-low{border-left-color:#ca8a04}.bug-card.sev-fixed{border-left-color:var(--pass)}
.bug-card header{display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:13px}.bug-card .id{font-weight:700}.bug-card .sev{padding:1px 8px;border-radius:999px;background:var(--bg)}.bug-card .meta{color:var(--mute)}
.bug-card h4{margin:8px 0 6px;font-size:16px}.bug-card p{margin:6px 0}.fix{color:var(--mute)}code{font-size:13px;background:var(--bg);padding:0 4px;border-radius:4px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px}.grid.mob{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}.grid.full{grid-template-columns:repeat(3,1fr);align-items:start}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:12px;color:var(--mute);margin-top:6px}
ul{padding-left:20px}@media (max-width:640px){.grid,.grid.mob,.grid.full{grid-template-columns:1fr}}
</style></head><body><main>
<h1>Lotus Car Rental — Test 15 — Homepage new hero</h1>
<p class="sub">Convert exp 100052950 · Control 1000257620 · V1 1000257621 (static image, <code>lotus_test_15_B</code>) · V2 1000257622 (video, <code>lotus_test_15_C</code>) · URL https://www.lotuscarrental.is/ · All users · QA run 2026-10-16</p>
<div class="kpis">
<div class="kpi"><b>${all.P}/${all.P + all.F}</b><span>checks passed across 4 browsers</span></div>
${PROJECTS.map((p, i) => `<div class="kpi"><b>${tot[i].P}/${tot[i].P + tot[i].F}</b><span>${esc(p.short)}</span></div>`).join('')}
<div class="kpi"><b>${BUGS.length}</b><span>open issues (0 high, 2 medium, 4 low)</span></div>
</div>
<p class="verdict"><strong>Verdict: OK to launch once BUG-01 is decided.</strong> Every wireframe change renders on all 4 browsers: new hero copy, 4 USPs, "Search Now", Google rating summary, the 14-review carousel, "Why Lotus?" removed, retitled grey fleet section, "Plan your trip" replacing "Before your trip", FAQ and footer unchanged. The V2 video is three spliced clips as requested. The one serious bug found during recon (V1 mobile showing control’s photo) is already fixed on live. All remaining failures are the issues listed below — no layout breakage, no JS errors from the variation, no horizontal scroll.</p>

<h2>Open issues</h2>${bugCards}
<h2>Resolved during QA</h2>${fixed}

<h2>Test matrix</h2>
<p class="sub">Expected values come from the wireframes, not the code. "Details" holds measurements and failure messages.</p>
<div class="tablewrap"><table><thead><tr><th>Test</th>${PROJECTS.map((p) => `<th>${esc(p.short)}</th>`).join('')}<th>Bug</th></tr></thead><tbody>${matrix}</tbody></table></div>

<h2>Scope and method</h2>
<ul>
<li>Order followed: wireframes → vB.js/vB.css and va3.js/va3.css → live force URLs → Playwright spec (<code>my-playwright-project/testing/lotus15-homepage-new-hero.spec.js</code>) → this report.</li>
<li>Browsers (as requested): Chrome desktop (1280×720), Safari desktop (WebKit), Chrome mobile (Pixel 5), Safari mobile (iPhone 12). Runs went one browser at a time to avoid memory kills.</li>
<li>Covered: arm/body-class and Convert assignment, hero copy, USPs, hero media (image / video playing, muted, looping, inline), CTA label and accessible name, rating link, review section position and count, carousel arrows/dots/swipe, Read more / Show less, fleet title and background, Plan your trip content, links and images, SPA navigation away and Back (variation cleaned up and re-applied with no duplicates), Search Now booking flow, FAQ accordion and footer, horizontal overflow, German homepage exclusion, reduced motion.</li>
<li>Test-side noise filtered: WebKit cross-origin errors from the site’s Prismic and menni.ai chatbot iframes and from Next.js <code>?_rsc=</code> prefetches (site-level, all arms). The site’s 403 console errors appear on control too.</li>
<li>Co-running Convert experiences on the homepage: 100052977 (<code>cre-t-18</code>) everywhere and 100052832 (<code>cre-t-17</code>) on mobile. No visual conflict seen.</li>
<li>Not covered: real iOS/macOS Safari hardware (Playwright WebKit used), tablet-specific layout (spot-checked at 820/1000px only), Convert goal tracking (none specified in the ticket).</li>
</ul>

<h2>Design reference and video check</h2><div class="grid">${wire.join('')}</div>${sheet}

<h2>Screenshots</h2>${gallery.join('')}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', JSON.stringify(tot));
})();
