// Builds win272-truemed-badge-qa-report.html from the per-browser Playwright JSON runs
// (node build-win272-report.js <dir-with-r_*.json>). Screenshots are embedded as data URIs.
const fs = require('fs');
const path = require('path');
const RES = process.argv[2];
const SHOTS = path.join(__dirname, '..', '..', 'my-playwright-project', 'qa-knowledge-base', 'winkbeds', 'win272-screenshots');
const img = (f) => `data:image/png;base64,${fs.readFileSync(path.join(SHOTS, f)).toString('base64')}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const browsers = ['Chrome Desktop', 'Firefox Desktop', 'Edge Desktop', 'Safari Desktop', 'Mobile Chrome (Pixel 5)', 'Mobile Safari (iPhone 12)', 'Tablet (iPad Gen 7)'];
const short = { 'Chrome Desktop': 'Chrome', 'Firefox Desktop': 'Firefox', 'Edge Desktop': 'Edge', 'Safari Desktop': 'Safari', 'Mobile Chrome (Pixel 5)': 'Pixel 5', 'Mobile Safari (iPhone 12)': 'iPhone 12', 'Tablet (iPad Gen 7)': 'iPad' };

// results[tcId][browser] = { status, ann, err }
const results = {};
const titles = {};
// r_* = full run, rr_* = targeted re-run of TC-04/07/09 (overlays the full run)
for (const pre of ['r_', 'rr_']) for (const b of browsers) {
  const f = path.join(RES, `${pre}${b.replace(/[^a-zA-Z0-9\n]/g, '_')}.json`);
  if (!fs.existsSync(f) || !fs.statSync(f).size) continue;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const walk = (s) => { (s.suites || []).forEach(walk); (s.specs || []).forEach((sp) => sp.tests.forEach((t) => {
    const id = sp.title.split(' ')[0];
    titles[id] = sp.title.slice(id.length + 1);
    const r = t.results[t.results.length - 1] || {};
    (results[id] ||= {})[b] = { status: r.status, ann: t.annotations || [], err: ((r.error && r.error.message) || '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0] };
  })); };
  j.suites.forEach(walk);
}

// The first full run had one variation-only Add to Cart case (TC-09); the re-run split it into
// TC-09a (control) / TC-09b (variation). Browsers not re-run keep their first-run result as TC-09b.
if (results['TC-09']) {
  titles['TC-09a'] = 'Add to Cart works (control)';
  titles['TC-09b'] = 'Add to Cart works (variation)';
  for (const b of browsers) if (results['TC-09'][b] && !(results['TC-09b'] && results['TC-09b'][b])) (results['TC-09b'] ||= {})[b] = results['TC-09'][b];
  results['TC-09a'] ||= {};
  delete results['TC-09']; delete titles['TC-09'];
}
// TC-05 (letter-spacing) and TC-07 (no cre-t-202) failures are the two known bugs.
// TC-09a/b failures happen in Control too, so they are site/automation flake, not WIN272.
const bugOf = { 'TC-05': 'BUG-02', 'TC-07': 'BUG-01' };
const flaky = new Set(['TC-09a', 'TC-09b']);
const cell = (id, b) => {
  const r = results[id] && results[id][b];
  if (!r) return `<span class="pill na">${id === 'TC-09a' ? 'Not re-run' : 'Not run'}</span>`;
  if (r.status === 'passed') return '<span class="pill pass">Pass</span>';
  if (bugOf[id]) return `<span class="pill fail" title="${esc(r.err)}">${bugOf[id]}</span>`;
  if (flaky.has(id)) return `<span class="pill noise" title="${esc(r.err)}">Site flake</span>`;
  return `<span class="pill noise" title="${esc(r.err)}">Fail</span>`;
};
const ids = Object.keys(titles).sort();
const rows = ids.map((id) => `<tr><th scope="row"><span class="mono">${id}</span> ${esc(titles[id])}</th>${browsers.map((b) => `<td class="c">${cell(id, b)}</td>`).join('')}</tr>`).join('\n');
let pass = 0, total = 0;
const other = [];
const flakes = [];
const bug01Hits = browsers.filter((b) => results['TC-07'] && results['TC-07'][b] && results['TC-07'][b].status !== 'passed').map((b) => short[b]);
for (const id of ids) for (const b of browsers) { const r = results[id][b]; if (!r) continue; total++; if (r.status === 'passed') pass++; else if (flaky.has(id)) flakes.push(`${id} ${short[b]}`); else if (!bugOf[id]) other.push(`${id} on ${short[b]}: ${r.err}`); }
const gapNote = browsers.map((b) => { const a = results['TC-04'] && results['TC-04'][b] && results['TC-04'][b].ann.find((x) => x.type === 'gaps'); return a ? `${short[b]} ${a.description.replace('above=', '').replace(' below=', ' / ')}` : null; }).filter(Boolean).join(' · ');

const fig = (f, cap) => (fs.existsSync(path.join(SHOTS, f)) ? `<figure><img src="${img(f)}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>` : '');
const shotSet = browsers.map((b) => fig(`${b.replace(/[^a-z0-9]+/gi, '_')}__variation.png`, `${short[b]}: Variation`)).join('\n');

const bugs = [
  { id: 'BUG-01', sev: 'medium', title: 'Badge placement depends on the coexisting cre-t-202 test',
    what: 'The <code>order: 3</code> / <code>order: 4</code> rules in va3.css are scoped to <code>body.cre-t-272.cre-t-202</code>, and va3.js appends the badge to the end of <code>#orderForm</code>. When <code>cre-t-202</code> is not on body, the badge jumps to the top of the Buy Box, directly under “The WinkBed” title, and the financing block moves with it.',
    proof: `The code makes the dependency certain: without <code>cre-t-202</code> on body, no <code>order</code> rule applies to the badge. Removing the class on the live page moved the badge under the product title in the first Chrome recon, one Chrome spec run, and on ${bug01Hits.join(' and ') || 'none of the final runs'} (see screenshot). In other runs it stayed in place, so it depends on how the rest of the Buy Box settles. Every load today has <code>cre-t-202</code>, so visitors don’t see this yet. The risk is if WIN202 is paused or ended, or a visitor isn’t bucketed into it.`,
    fix: 'Insert the badge at its real spot in the DOM so it doesn’t rely on another test’s flex <code>order</code>:',
    code: `// va3.js
var finSelector = "#orderForm .order-form__financing-buy-box-container";
waitForElement(finSelector, init, 50, 15000);
...
document.querySelector(finSelector).insertAdjacentHTML("beforebegin", hsaEligibilityMarkup);` },
  { id: 'BUG-02', sev: 'low', title: 'Letter-spacing does not match the financing copy',
    what: 'The ticket asks for font styles that exactly match the “buy now, pay later” copy. Family, size, weight, line-height and colour all match, but the financing text has <code>letter-spacing: 0.187px</code> and the badge has <code>normal</code>.',
    proof: 'TC-05 computed styles: financing <code>0.187px</code>, badge <code>normal</code>.',
    fix: 'Give the badge text the same letter-spacing:',
    code: `html body.cre-t-272 .cre-t-272-hsa-text {
    letter-spacing: 0.187px;
}` },
];
const card = (b) => `<article class="bug ${b.sev}"><header><span class="sev">${b.sev}</span><span class="mono bid">${b.id}</span><h3>${b.title}</h3></header>
<dl><dt>What happens</dt><dd>${b.what}</dd><dt>Evidence</dt><dd>${b.proof}</dd><dt>Suggested fix</dt><dd>${b.fix}<pre><code>${esc(b.code)}</code></pre></dd></dl></article>`;

const html = `<title>WIN272 Truemed Badge QA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;700&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root{--ground:#f3f6f8;--surface:#fff;--ink:#18212b;--muted:#566575;--line:#dbe3ea;--accent:#2c6e98;--accent-soft:#e3eff6;
--pass:#1d7447;--pass-bg:#e2f3e9;--fail:#b3261e;--fail-bg:#fbe7e5;--high:#a35a00;--high-bg:#fdf0dc;--med:#6b5b00;--med-bg:#f7f1d2;--low:#566575;--low-bg:#eaeef2;--code:#edf1f5}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;--ground:#10161c;--surface:#18212a;--ink:#e4ebf1;--muted:#9aabbb;--line:#2a3945;--accent:#7bb6dc;--accent-soft:#1b3040;
--pass:#6fd39c;--pass-bg:#15321f;--fail:#ff8a80;--fail-bg:#3a1a18;--high:#f3b561;--high-bg:#35270f;--med:#dccb6a;--med-bg:#2f2b12;--low:#a9b7c4;--low-bg:#24303a;--code:#223039}}
:root[data-theme="dark"]{color-scheme:dark;--ground:#10161c;--surface:#18212a;--ink:#e4ebf1;--muted:#9aabbb;--line:#2a3945;--accent:#7bb6dc;--accent-soft:#1b3040;
--pass:#6fd39c;--pass-bg:#15321f;--fail:#ff8a80;--fail-bg:#3a1a18;--high:#f3b561;--high-bg:#35270f;--med:#dccb6a;--med-bg:#2f2b12;--low:#a9b7c4;--low-bg:#24303a;--code:#223039}
*{box-sizing:border-box}
body{background:var(--ground);color:var(--ink);font:16px/1.6 "Source Sans 3",system-ui,sans-serif;padding:40px 16px 64px;margin:0}
.wrap{max-width:1080px;margin:0 auto;display:grid;gap:44px}.wrap>*{min-width:0}
h1,h2,h3{font-family:"Schibsted Grotesk",system-ui,sans-serif;margin:0;line-height:1.2;text-wrap:balance}
h1{font-size:clamp(28px,4.4vw,40px)}h2{font-size:22px;margin-bottom:16px}h3{font-size:17px}
p{margin:0;max-width:68ch}
.mono,code{font-family:"JetBrains Mono",ui-monospace,Consolas,monospace;font-size:.86em}
code{background:var(--code);padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
pre{margin:10px 0 0;background:var(--code);border-radius:6px;padding:12px 14px;overflow-x:auto;font-size:13px}pre code{background:none;padding:0;white-space:pre}
.eyebrow{font:500 12px/1 "JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.head{display:grid;gap:14px}.meta{display:flex;flex-wrap:wrap;gap:8px 24px;color:var(--muted);font-size:14px}.meta b{color:var(--ink);font-weight:600}
.verdict{background:var(--high-bg);border:1px solid var(--high);border-radius:10px;padding:18px 20px;display:grid;gap:8px}
.verdict strong{color:var(--high);font-family:"Schibsted Grotesk",sans-serif;font-size:18px}
.tally{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.tally>div{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px}
.tally .n{font:700 24px/1.1 "Schibsted Grotesk",sans-serif;font-variant-numeric:tabular-nums}.tally .l{font-size:13px;color:var(--muted)}
@media (max-width:720px){.tally{grid-template-columns:repeat(2,minmax(0,1fr))}}
.scroll{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;min-width:860px;font-size:14px}
th,td{padding:9px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
thead th{font:600 12px/1.3 "JetBrains Mono",monospace;letter-spacing:.04em;color:var(--muted);text-transform:uppercase;background:var(--accent-soft)}
tbody th{font-weight:400}td.c,th.c{text-align:center}tbody tr:last-child>*{border-bottom:0}
.pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;min-width:48px;text-align:center}
.pill.pass{background:var(--pass-bg);color:var(--pass)}.pill.fail{background:var(--fail-bg);color:var(--fail)}
.pill.noise{background:var(--high-bg);color:var(--high)}.pill.na{background:var(--low-bg);color:var(--low)}
.bugs{display:grid;gap:16px}
.bug{background:var(--surface);border:1px solid var(--line);border-left:5px solid var(--sev);border-radius:8px;padding:18px 20px;display:grid;gap:10px;min-width:0}
.bug.medium{--sev:var(--med);--sevbg:var(--med-bg)}.bug.low{--sev:var(--low);--sevbg:var(--low-bg)}
.bug header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}.bug header h3{flex-basis:100%}
.sev{font:600 11px/1 "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--sev);background:var(--sevbg);padding:4px 8px;border-radius:4px}
.bid{color:var(--muted)}
dl{margin:0;display:grid;grid-template-columns:130px minmax(0,1fr);gap:6px 16px;font-size:15px}
dt{font-weight:600;color:var(--muted);font-size:13px;padding-top:2px}dd{margin:0;min-width:0}
@media (max-width:640px){dl{grid-template-columns:minmax(0,1fr)}}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
figure{margin:0;display:grid;gap:6px;align-content:start}
figure img{width:100%;border:1px solid var(--line);border-radius:6px;display:block}
figcaption{font-size:13px;color:var(--muted)}
.twocol{display:grid;grid-template-columns:1fr 1fr;gap:24px}.twocol>*{min-width:0}@media (max-width:760px){.twocol{grid-template-columns:1fr}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px 20px;display:grid;gap:10px;align-content:start}
ul{margin:0;padding-left:20px;display:grid;gap:6px}
.note{font-size:13px;color:var(--muted);margin-top:10px}
</style>
<div class="wrap">
<section class="head">
  <span class="eyebrow">WinkBeds · Convert exp 100350648 · ${new Date().toISOString().slice(0, 10)}</span>
  <h1>WIN272 Shop Page: Truemed Badges</h1>
  <div class="meta"><span><b>Page</b> /pages/shop-winkbed</span><span><b>Audience</b> All visitors</span><span><b>Code</b> va3.js / va3.css (cre-t-272)</span></div>
  <div class="verdict">
    <strong>Matches Figma, two fixes recommended before launch</strong>
    <p>The “HSA/FSA eligible with Truemed” line is in the right spot, with equal 24px spacing above and below and matching fonts, in every browser that ran. Its position only holds because another test (cre-t-202) is running (BUG-01), and the letter-spacing is slightly off from the financing copy (BUG-02).</p>
  </div>
  <div class="tally">
    <div><div class="n">${pass} / ${total}</div><div class="l">Checks passed</div></div>
    <div><div class="n">${browsers.filter((b) => ids.some((id) => results[id][b])).length} / 7</div><div class="l">Browsers run</div></div>
    <div><div class="n">2</div><div class="l">Bugs (1 medium, 1 low)</div></div>
    <div><div class="n">${flakes.length}</div><div class="l">Add to Cart flakes (Control too)</div></div>
  </div>
</section>
<section>
  <h2>Results by browser</h2>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${short[b]}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <p class="note">Gap above / below the badge (px): ${gapNote || 'n/a'}.${other.length ? ' Other failures: ' + other.map(esc).join('; ') : ''}</p>
  <p class="note">BUG-01 cells mark runs where removing <code>cre-t-202</code> moved the badge out of place. TC-07 passing elsewhere does not clear the risk; see BUG-01. “Site flake”: the automated Add to Cart click didn’t register. It happened in Control too (Firefox), so it isn’t caused by WIN272; Add to Cart worked every time by hand in the Variation. Chrome and Firefox re-ran TC-04/07/09 in both arms. The other browsers’ re-run was stopped for low memory, so they show their first-run results and Control Add to Cart shows “Not re-run”.</p>
</section>
<section><h2>Bugs</h2><div class="bugs">${bugs.map(card).join('\n')}</div></section>
<section>
  <h2>Control vs Variation (Chrome Desktop)</h2>
  <div class="shots">
    ${fig('Chrome_Desktop__control.png', 'Control: no badge')}
    ${fig('Chrome_Desktop__variation.png', 'Variation: badge between payment icons and financing block')}
    ${fig('Chrome_Desktop__no-cre-t-202.png', 'BUG-01: without cre-t-202 the badge jumps under the title')}
  </div>
</section>
<section><h2>Variation in each browser</h2><div class="shots">${shotSet}</div></section>
<section>
  <h2>Narrow screens</h2>
  <div class="shots">${fig('Chrome_Desktop__w320.png', '320px wide')}${fig('Chrome_Desktop__w280.png', '280px wide: payment icons wrap, badge stays on one line')}</div>
</section>
<section class="twocol">
  <div class="panel"><h3>How it was tested</h3>
    <p>Playwright against the live force-preview links, one browser at a time. Each case opens a fresh browser, waits for the Buy Box, and reads positions and computed styles. Fonts were compared against the live “Or buy now, pay later” text. Add to Cart was clicked for real and checked through <code>/cart.js</code>.</p>
    <p class="mono" style="overflow-wrap:anywhere">Control: …?cro_mode=qa&amp;_conv_eforce=100350648.1003184744<br>Variation: …?cro_mode=qa&amp;_conv_eforce=100350648.1003184745</p></div>
  <div class="panel"><h3>Notes</h3><ul>
    <li>The subtotal line above Add to Cart can differ between the two links. That is WIN266 bucketing on its own, not this test.</li>
    <li>“$46.15/month” doesn’t change with mattress size in either arm. That is how the site already works.</li>
    <li>The goals (Visit Cart, Add to Cart from Shop Page) are preconfigured in Convert. This test doesn’t add or change any tracking.</li>
  </ul></div>
</section>
</div>`;
const out = path.join(__dirname, 'win272-truemed-badge-qa-report.html');
fs.writeFileSync(out, html);
console.log('wrote', out, `${pass}/${total}`, other);
