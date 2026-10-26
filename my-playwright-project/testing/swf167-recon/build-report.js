// SWF167: build the self-contained HTML QA report from the Playwright JSON results + screenshots.
// Screenshots are re-encoded as downscaled JPEGs (via Chromium) so the report stays a sensible size.
// usage: node testing/swf167-recon/build-report.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const L2 = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2');
const RES = path.join(L2, 'swf167-results');
const SHOTS = path.join(L2, 'swf167-screenshots');
const OUT = path.join(L2, 'swf167-donation-matching-qa-report.html');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');

const PROJECTS = [
  { name: 'Chrome Desktop', short: 'Chrome', file: 'chrome-desktop.json', dir: 'chrome-desktop' },
  { name: 'Edge Desktop', short: 'Edge', file: 'edge-desktop.json', dir: 'edge-desktop' },
  { name: 'Firefox Desktop', short: 'Firefox', file: 'firefox-desktop.json', dir: 'firefox-desktop' },
  { name: 'Safari Desktop', short: 'Safari', file: 'safari-desktop.json', dir: 'safari-desktop' },
  { name: 'Mobile Chrome (Pixel 5)', short: 'Pixel 5', file: 'pixel5.json', dir: 'mobile-chrome-pixel-5-' },
  { name: 'Mobile Safari (iPhone 12)', short: 'iPhone 12', file: 'iphone12.json', dir: 'mobile-safari-iphone-12-' },
];

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
        notes: (r.annotations || t.annotations || []).map((a) => a.description).filter(Boolean),
      };
    }
  };
  JSON.parse(fs.readFileSync(file, 'utf8')).suites.forEach(walk);
}

const BUGS = [
  { id: 'BUG-01', sev: 'High', where: 'Variation · all pages · all devices', tests: 'V16',
    title: 'None of the 3 custom goals is implemented: no click or FAQ-open conversion ever fires',
    body: 'The ticket lists three goals: <em>Clicks on Donations Link</em>, <em>Clicks on See How Link</em> and <em>Donations FAQ opens (manually or by clicking on one of the links)</em>. The deployed variation code has no <code>_conv_q.push([\'triggerConversion\', …])</code> call at all. Experiment 100052999 has only two goals attached. <code>100034508</code> is the site-wide "Outbound Partner Clicks – All Sources" goal (fired by experiment 100052764, not by this test). <code>100038337</code> is a <code>code_trigger</code> goal that nothing on the site triggers. A spy on <code>_conv_q.push</code> saw zero SWF167 conversions after a Donations click and after a manual FAQ open, on every browser. The test cannot measure its outcome as built.',
    fix: 'Create the 3 goals in Convert, attach them to exp 100052999 (both arms), and fire them from the variation: in the Donations click handler <code>_conv_q.push([\'triggerConversion\', \'&lt;donations-link-goal&gt;\'])</code>; in the FAQ toggle, when the item becomes <code>active</code> (both from the link and manually), <code>_conv_q.push([\'triggerConversion\', \'&lt;faq-open-goal&gt;\'])</code>; and the same for the See How link once it exists (Q-01).' },
  { id: 'BUG-02', sev: 'High', where: 'Convert setup', tests: '— (config), V15',
    title: 'Only one variation is built: V2 "Donate", V3 "Giving" and V4 "Help a Pet" are missing',
    body: 'The brief asks for four variations that differ only in the link copy (V1 Donations, V2 Donate, V3 Giving, V4 Help a Pet). Convert exp 100052999 has only control <code>1000257732</code> (50%) and one variation <code>1000257733</code> (50%), and its code hard-codes <code>link.textContent = "Donations"</code>. Only one preview link was supplied. The other three copies were checked by swapping the label in place (V15). Layout is fine on every QA device, but see BUG-05 for 320px.',
    fix: 'Add three more variations (or one shared code block with a per-variation label), set the split to 20/20/20/20/20, and share the force URLs so V2–V4 can be QA\'d live.' },
  { id: 'BUG-03', sev: 'Medium', where: 'Variation · all pages · all devices (needs SWF144 live, which it is)', tests: 'V09',
    title: 'Opening the Donations FAQ leaves the SWF144 "Vets love pet insurance" FAQ open: two answers expanded at once',
    body: 'If "Vets love pet insurance" (injected by the live SWF144 test) is open and the user clicks <strong>Donations</strong> in the header, or opens the new FAQ manually, both items stay expanded. Native FAQs are closed correctly (V08 passes). Cause: the close loop calls <code>$active.find(".oxy-pro-accordion_header").trigger("click")</code> for any item that is not a cre-t-167 item, but the SWF144 item\'s button is <code>.cre-t-144-accordion_header</code> with no <code>oxy-pro-accordion_header</code> class, so nothing is clicked.',
    fix: 'Treat any injected item the same way as cre-t-167\'s own: <code>if ($active.is(".cre-t-167-accordion_item, .cre-t-144-accordion_item")) { slideUp body; set aria-expanded=false; removeClass("active") } else { trigger native header click }</code>. Alternatively, trigger <code>click</code> on <code>$active.children("button")</code>.' },
  { id: 'BUG-04', sev: 'Low', where: 'Variation · all pages · all devices', tests: 'V10',
    title: 'aria-expanded on the Donations FAQ gets out of sync (says "true" while closed, then "false" while open)',
    body: 'Open the Donations FAQ, then open any native FAQ. The site\'s handler closes the Donations item (removes <code>active</code> and slides it up) but leaves <code>aria-expanded="true"</code>. On the next open, the variation <em>toggles</em> the attribute, so the open item now reports <code>aria-expanded="false"</code>. This misleads screen readers. It is not visible.',
    fix: 'Set the attribute from state instead of toggling: after <code>$item.toggleClass("active")</code> use <code>$button.attr("aria-expanded", $item.hasClass("active") ? "true" : "false")</code>. In <code>openFAQ()</code>, also check <code>aria-expanded</code> and <code>active</code> together.' },
  { id: 'BUG-05', sev: 'Low', where: 'Variation · mobile ≤ 359px wide', tests: 'recon (320px)',
    title: '6px horizontal scroll at 320px: "Donations" is wider than "Contact"',
    body: 'At 320px wide (iPhone SE 1st gen, small Androids) the header nav <code>ul</code> ends at 326px, so the whole page scrolls sideways by 6px. Control measures 311px with no overflow. Per copy at 320px: Donations 326, <strong>Help a Pet 326</strong> (also overflows), Donate 308, Giving 302. Every copy fits at 360px and wider, so all QA devices (390–1440px) pass.',
    fix: 'In the existing <code>@media (max-width: 370px)</code> block, reduce the nav item gap, e.g. <code>html body .oxy-header-right nav li { margin-right: 6px !important; }</code> (it is 10px now), or drop the font to 11px.' },
  { id: 'Q-01', sev: 'Question', where: 'Ticket / Figma', tests: 'V17',
    title: '"See How" link has a goal but appears nowhere in Figma or code',
    body: 'Goal "SWF167 – Clicks on See How Link" and "…by clicking on one of the links" imply a second entry point (probably next to "We donate for every policy purchased" in the hero). Figma shows only the header Donations link and the FAQ, and the code builds nothing else. Please confirm where the "See How" link goes, with its copy and placement, or whether the goal should be dropped.',
    fix: 'Client/designer to confirm. If needed, add the link and wire it to <code>openFAQ("donations")</code> plus its own goal.' },
  { id: 'Q-02', sev: 'Question', where: 'Variation · FAQ list', tests: 'V02',
    title: 'Near-duplicate FAQ: native "We donate to animal welfare charities" is still in the list',
    body: 'The new first FAQ "We donate to animal welfare charities and match your gifts" repeats the topic of the existing native FAQ "We donate to animal welfare charities" (about 11th in the list). Figma doesn\'t say whether to keep or hide it.',
    fix: 'Confirm with the client. If it should go, hide it in the variation only.' },
  { id: 'CLEAN-01', sev: 'Low', where: 'vB.css / vB.js', tests: 'code review',
    title: 'Clone leftovers from SWF144 (no visual impact)',
    body: '<code>.cre-t-167-vetApprovedLink</code> rules (3 blocks) target an element that doesn\'t exist in this test. The header rules (logo 350px at 991–1060px, nav <code>li</code> margin 10px ≤768px, 12px font ≤370px) duplicate SWF144\'s CSS: control and variation measure identically at 320/360/700/1000/1440px. <code>.cre-t-167-accordion_header</code> declares <code>color</code> twice. Like SWF144, the FAQ question is an <code>&lt;h4&gt;</code> inside a <code>&lt;button&gt;</code>, and the button has no <code>aria-controls</code>.',
    fix: 'Remove the dead <code>vetApprovedLink</code> rules. Keep the header rules only if SWF144 may be switched off while this test runs.' },
];
const PASSES = [
  'Header: <strong>Contact → Donations</strong>, placed between How We Rank and About as in Figma, with the same font, size and colour as its neighbours (V01).',
  'New FAQ is <strong>first</strong> in the list (above SWF144\'s "Vets love pet insurance"). Question and answer match Figma word for word. It is collapsed on load (V02, V18).',
  'Closed FAQ styling is identical to the native items: font, weight, colour, padding, divider and icon size (V03).',
  'Clicking Donations smooth-scrolls to the FAQ and auto-opens it: blue title (#0272E4), "+" rotated to "×", no <code>#faq-donations</code> in the URL. It works from the top and from the page bottom, with the question landing ~100–135px from the viewport top (V04, V05).',
  'A second Donations click keeps it open. Manual open/close works. Opening it closes any open native FAQ (V06–V08).',
  'Keyboard: the link is focusable and Enter works (desktop, V11). Re-running the code creates no duplicate FAQ, link or handler (V12). No page JS errors.',
  'All four targeted URLs work: <code>/</code>, <code>/home/</code>, <code>/comparison/</code> and <code>/compare/</code> (V13). The nav stays on one row with no overlap with Prices and no sideways scroll on every QA device (V14). All 4 copy variants fit (V15).',
  'Control keeps "Contact → /contact-us/" with no new FAQ (C01).',
];
const NOTES = [
  '<strong>Deployed = local.</strong> The code in Convert (exp version 12) is byte-identical to <code>local_testing/Local2/variation/vB.js</code> / <code>vB.css</code>, apart from Convert\'s wrapper function.',
  '<strong>Pre-launch settings to change:</strong> the audience is QA-only (<code>cro_mode=qa</code> cookie or query). Traffic is 50/50 across the only 2 arms. The location rule also includes <code>/compare/</code>, which is in the ticket title but not in the URL list. It works there too.',
  '<strong>"Vet Approved" in Figma</strong> comes from SWF144, which is live in both arms on <code>/</code>, <code>/home/</code> and <code>/comparison/</code>. On <code>/compare/</code> SWF144 does not run, so the nav there is How We Rank · Donations · About. This is expected and not a SWF167 issue.',
  '<code>local_testing/Local2/variation/testdetail.md</code> is stale (it describes SWF162 Life Insurance) and was ignored.',
  'Console shows a few <code>403</code> resource errors on every page in both arms. These come from the site, not from this test.',
  '<strong>Mobile Playwright runs (Pixel 5, iPhone 12) were stopped by the system for low memory and are not in the matrix yet.</strong> Mobile was still checked in Chromium recon: iPhone 12 render, a 320–1024px nav width sweep, and the Donations click on a mobile viewport. Re-run with <code>--project="Mobile Chrome (Pixel 5)"</code> / <code>"Mobile Safari (iPhone 12)"</code>.',
  'Not covered: real iOS/macOS hardware (Playwright WebKit used), V2–V4 as real Convert variations (they don\'t exist yet), and Convert reporting dashboards.',
];

const ICON = { P: '<span class="st p">Pass</span>', F: '<span class="st f">Fail</span>', S: '<span class="st s">n/a</span>' };
const bugFor = (title) => { const id = title.slice(0, 3); return BUGS.filter((b) => b.tests.split(/[\s,]+/).includes(id)).map((b) => b.id).join(', '); };

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

  const ran = PROJECTS.filter((p) => order.some((o) => results[o][p.name]));
  const tot = ran.map((p) => { const t = { P: 0, F: 0, S: 0 }; order.forEach((o) => { const r = results[o][p.name]; if (r) t[r.status]++; }); return t; });
  const all = tot.reduce((a, t) => ({ P: a.P + t.P, F: a.F + t.F, S: a.S + t.S }), { P: 0, F: 0, S: 0 });

  const matrix = order.map((title) => {
    const cells = ran.map((p) => { const r = results[title][p.name]; return `<td>${r ? ICON[r.status] : '<span class="st s">not run</span>'}</td>`; }).join('');
    const notes = [...new Set(ran.flatMap((p) => { const r = results[title][p.name]; return r ? [...r.notes.map((n) => p.short + ': ' + n), r.status === 'F' ? p.short + ' FAIL: ' + r.error : ''] : []; }).filter(Boolean))];
    return `<tr><td>${esc(title)}</td>${cells}<td class="bug">${bugFor(title)}</td></tr>` +
      (notes.length ? `<tr class="detail"><td colspan="${ran.length + 2}"><details><summary>Details</summary><pre>${esc(notes.join('\n'))}</pre></details></td></tr>` : '');
  }).join('');

  const cd = path.join(SHOTS, 'chrome-desktop');
  const evidence = {
    'BUG-03': [await fig(path.join(cd, 'V09-144-then-donations.png'), 'Chrome desktop: Vets FAQ open → click Donations → both stay open', 760)],
    'BUG-05': [await fig(path.join(SHOTS, 'w320-var-header.png'), 'Variation at 320px: nav runs 6px past the right edge', 340)],
    'Q-01': [await fig(path.join(cd, 'V17-hero.png'), 'Chrome desktop: hero, no "See How" link', 700)],
  };

  const FIGMA = 'C:/Users/Sarthak Rautela/Downloads/Group 3.png';
  const figma = fs.existsSync(FIGMA) ? await fig(FIGMA, 'Figma: control vs variation', 1100) : '';

  const gallery = [];
  for (const p of ran) {
    const d = path.join(SHOTS, p.dir); const mob = /Mobile/.test(p.name); const w = mob ? 360 : 900;
    const items = [];
    for (const [f, c] of [
      ['C01-control-header', 'Control: Contact in header'], ['V01-variation-header', 'Variation: Donations in header'],
      ['V02-faq-collapsed', 'New FAQ first, collapsed'], ['V04-after-donations-click', 'After Donations click: scrolled + open'],
      ['V08-native-then-new', 'Native open → new FAQ open (native closes)'], ['V09-144-then-donations', 'Vets FAQ open → Donations (BUG-03)'],
      ['V13-compare', '/compare/ after Donations click'], ['V15-HelpaPet', 'Header with "Help a Pet" (V4 copy)'],
    ]) items.push(await fig(path.join(d, f + '.png'), c, w));
    gallery.push(`<h3>${esc(p.short)}</h3><div class="grid ${mob ? 'mob' : ''}">${items.join('')}</div>`);
  }
  await browser.close();

  const bugCards = BUGS.map((b) => `<article class="bug-card sev-${b.sev.toLowerCase()}"><header><span class="id">${b.id}</span><span class="sev">${b.sev}</span><span class="meta">${b.where} · tests: ${b.tests}</span></header><h4>${b.title}</h4><p>${b.body}</p><p class="fix"><strong>Fix:</strong> ${b.fix}</p>${(evidence[b.id] || []).join('')}</article>`).join('');
  const sevCount = (s) => BUGS.filter((b) => b.sev === s).length;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SWF167 Donation Matching QA</title>
<style>
:root{--bg:#f6f6f4;--card:#fff;--ink:#18181b;--mute:#6b6b70;--line:#e4e4e7;--pass:#15803d;--passbg:#dcfce7;--fail:#b91c1c;--failbg:#fee2e2;--warn:#a16207;--warnbg:#fef3c7;--q:#1d4ed8}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24;--q:#93c5fd}}
:root[data-theme=dark]{--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24;--q:#93c5fd}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1200px;margin:0 auto;padding:32px 16px 80px}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:40px 0 12px;padding-top:8px;border-top:1px solid var(--line)}h3{font-size:16px;margin:28px 0 10px}
.sub{color:var(--mute);margin:0 0 20px}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:20px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:24px}.kpi span{color:var(--mute);font-size:13px}
.verdict{background:var(--failbg);border-left:4px solid var(--fail);padding:14px 16px;border-radius:8px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:14px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--bg);font-weight:600}
.tablewrap{overflow-x:auto}.st{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:600}.st.p{background:var(--passbg);color:var(--pass)}.st.f{background:var(--failbg);color:var(--fail)}.st.s{background:var(--bg);color:var(--mute)}
tr.detail td{padding:0 10px 8px;border-bottom:1px solid var(--line)}details summary{cursor:pointer;color:var(--mute);font-size:13px}pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:var(--bg);padding:8px;border-radius:6px}
td.bug{font-weight:600;color:var(--fail);white-space:nowrap}
.bug-card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--warn);border-radius:10px;padding:14px 16px;margin:12px 0}
.bug-card.sev-high{border-left-color:var(--fail)}.bug-card.sev-medium{border-left-color:#ea580c}.bug-card.sev-low{border-left-color:#ca8a04}.bug-card.sev-question{border-left-color:var(--q)}
.bug-card header{display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:13px}.bug-card .id{font-weight:700}.bug-card .sev{padding:1px 8px;border-radius:999px;background:var(--bg)}.bug-card .meta{color:var(--mute)}
.bug-card h4{margin:8px 0 6px;font-size:16px}.bug-card p{margin:6px 0}.fix{color:var(--mute)}code{font-size:13px;background:var(--bg);padding:0 4px;border-radius:4px;word-break:break-word}
.bug-card figure{max-width:760px;margin-top:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px}.grid.mob{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:12px;color:var(--mute);margin-top:6px}
ul{padding-left:20px}li{margin:4px 0}@media (max-width:640px){.grid,.grid.mob{grid-template-columns:1fr}}
</style></head><body><main>
<h1>The Swiftest — SWF167 — Pet Insurance — Donation Matching</h1>
<p class="sub">Pet Insurance Gurus · Convert exp 100052999 · Control 1000257732 · Variation 1000257733 (<code>cre-t-167</code>, "Donations") · Pages: /, /home/, /comparison/, /compare/ · QA 2026-10-26</p>
<div class="kpis">
<div class="kpi"><b>${all.P}/${all.P + all.F}</b><span>checks passed across ${ran.length} browsers/devices${all.S ? ` (${all.S} n/a)` : ''}</span></div>
${ran.map((p, i) => `<div class="kpi"><b>${tot[i].P}/${tot[i].P + tot[i].F}</b><span>${esc(p.short)}</span></div>`).join('')}
<div class="kpi"><b>${BUGS.length}</b><span>findings (${sevCount('High')} high, ${sevCount('Medium')} medium, ${sevCount('Low')} low, ${sevCount('Question')} questions)</span></div>
</div>
<p class="verdict"><strong>Verdict: not ready to launch.</strong> The visual change and interaction match Figma on every browser and device: the Donations link, the new first FAQ, smooth-scroll + auto-open, and styling. <strong>Blocking:</strong> no goals are wired (BUG-01), so the test can't measure anything, and only 1 of the 4 copy variations exists in Convert (BUG-02). Also fix: the SWF144 FAQ stays open alongside the Donations FAQ (BUG-03). The failures are the same on every browser.</p>

<h2>Findings</h2>${bugCards}

<h2>What passes</h2><ul>${PASSES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Notes</h2><ul>${NOTES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Test matrix</h2>
<p class="sub">Expected values come from Figma and the ticket, not from the code. Failing tests are the defects above. "n/a" = not applicable on that device (keyboard on touch devices). "Details" holds measurements and failure messages.</p>
<div class="tablewrap"><table><thead><tr><th>Test</th>${ran.map((p) => `<th>${esc(p.short)}</th>`).join('')}<th>Bug</th></tr></thead><tbody>${matrix}</tbody></table></div>

<h2>Design reference</h2>${figma}

<h2>Scope and method</h2>
<ul>
<li>Order followed: Figma → vB.js/vB.css → deployed Convert code (extracted from <code>window.convert.data</code>, identical to local) → live force URLs → Playwright spec <code>my-playwright-project/testing/swf167-donation-matching.spec.js</code> → this report.</li>
<li>Browsers: Chrome, Edge, Firefox, Safari (WebKit) desktop at 1280×720, run one at a time (Pixel 5 / iPhone 12 runs pending, see Notes). Extra width sweep at 320/360/375/414/768/991/1024/1440px in Chromium (recon scripts in <code>testing/swf167-recon/</code>).</li>
<li>Covered: bucketing, nav swap (text, href, order, styling), FAQ injection (position, copy, default state, styling), link click from top and bottom, repeat click, manual toggle, interplay with native and SWF144 FAQs, aria state, keyboard, re-run/duplication, all 4 URLs, header layout and overflow, all 4 copy labels, goal firing (<code>_conv_q.push</code> spy), page errors, control unchanged.</li>
</ul>

<h2>Screenshots</h2>${gallery.join('')}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', JSON.stringify(tot));
})();
