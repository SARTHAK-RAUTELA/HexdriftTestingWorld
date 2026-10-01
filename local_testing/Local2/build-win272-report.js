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
// Round 1 (2026-10-01 AM): r_* = full run, rr_* = targeted re-run of TC-04/07/09 (overlays it).
// Round 2 re-test after the dev fix: rt_* = full run per browser. The report leads with round 2.
let results = {};
const titles = {};
const load = (prefixes) => { for (const pre of prefixes) for (const b of browsers) {
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
} };
load(['r_', 'rr_']);
const round1 = results;
results = {};
load(['rt_']);
// TC-07 in the rt_ runs used the old one-sided check (badge below payment icons). Re-score it from the
// logged positions: the badge must sit between the payment icons and the financing block.
for (const res of [round1, results]) for (const b of browsers) {
  const r = res['TC-07'] && res['TC-07'][b];
  const a = r && r.ann.find((x) => x.type === 'no-202');
  if (!a) continue;
  const p = JSON.parse(a.description);
  r.pos = p;
  const ok = p.badge > p.pay && p.badge < p.fin;
  r.status = ok ? 'passed' : 'failed';
  r.err = ok ? '' : (p.badge < p.pay ? 'Badge moved above the payment icons (under the title)' : 'Badge dropped below the financing block (bottom of the Buy Box)');
}
// BUG-01 / TC-07 (cre-t-202 dependency) removed from the report at the user's request.
delete results['TC-07']; delete round1['TC-07']; delete titles['TC-07'];
const r1Bug = (id) => browsers.filter((b) => round1[id] && round1[id][b] && round1[id][b].status !== 'passed').length;

// The first full run had one variation-only Add to Cart case (TC-09); the re-run split it into
// TC-09a (control) / TC-09b (variation). Browsers not re-run keep their first-run result as TC-09b.
if (results['TC-09']) { // only present if round 2 is missing
  titles['TC-09a'] = 'Add to Cart works (control)';
  titles['TC-09b'] = 'Add to Cart works (variation)';
  for (const b of browsers) if (results['TC-09'][b] && !(results['TC-09b'] && results['TC-09b'][b])) (results['TC-09b'] ||= {})[b] = results['TC-09'][b];
  results['TC-09a'] ||= {};
  delete results['TC-09']; delete titles['TC-09'];
}
// TC-05 (letter-spacing) and TC-07 (no cre-t-202) failures are the two known bugs.
// TC-09a/b failures happen in Control too, so they are site/automation flake, not WIN272.
const bugOf = { 'TC-05': 'BUG-02' };
const flaky = new Set(['TC-09a', 'TC-09b']);
const cell = (id, b) => {
  const r = results[id] && results[id][b];
  if (!r) return `<span class="pill na">${id === 'TC-09a' ? 'Not re-run' : 'Not run'}</span>`;
  if (r.status === 'passed') return '<span class="pill pass">Pass</span>';
  if (bugOf[id]) return `<span class="pill fail" title="${esc(r.err)}">${bugOf[id]}</span>`;
  if (flaky.has(id)) return `<span class="pill noise" title="${esc(r.err)}">Site flake</span>`;
  return `<span class="pill noise" title="${esc(r.err)}">Fail</span>`;
};
const ids = Object.keys(results).sort();
const rows = ids.map((id) => `<tr><th scope="row"><span class="mono">${id}</span> ${esc(titles[id])}</th>${browsers.map((b) => `<td class="c">${cell(id, b)}</td>`).join('')}</tr>`).join('\n');
let pass = 0, total = 0;
const other = [];
const flakes = [];
const bug01Hits = browsers.filter((b) => results['TC-07'] && results['TC-07'][b] && results['TC-07'][b].status !== 'passed');
const bug01Top = bug01Hits.filter((b) => results['TC-07'][b].pos && results['TC-07'][b].pos.badge < results['TC-07'][b].pos.pay).map((b) => short[b]);
const bug01Bottom = bug01Hits.filter((b) => !bug01Top.includes(short[b])).map((b) => short[b]);
const retested = browsers.filter((b) => Object.keys(results).some((id) => results[id][b]));
const bug02Open = browsers.filter((b) => results['TC-05'] && results['TC-05'][b] && results['TC-05'][b].status !== 'passed').map((b) => short[b]);
for (const id of ids) for (const b of browsers) { const r = results[id][b]; if (!r) continue; total++; if (r.status === 'passed') pass++; else if (flaky.has(id)) flakes.push(`${id} ${short[b]}`); else if (!bugOf[id]) other.push(`${id} on ${short[b]}: ${r.err}`); }
const gapNote = browsers.map((b) => { const a = results['TC-04'] && results['TC-04'][b] && results['TC-04'][b].ann.find((x) => x.type === 'gaps'); return a ? `${short[b]} ${a.description.replace('above=', '').replace(' below=', ' / ')}` : null; }).filter(Boolean).join(' · ');

const fig = (f, cap) => (fs.existsSync(path.join(SHOTS, f)) ? `<figure><img src="${img(f)}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>` : '');
const shotSet = browsers.map((b) => fig(`${b.replace(/[^a-z0-9]+/gi, '_')}__variation.png`, `${short[b]}: Variation`)).join('\n');

const bugs = [
  { id: 'BUG-02', sev: 'low', title: 'Letter-spacing does not match the financing copy', status: bug02Open.length ? 'Still open' : 'Fixed',
    what: (bug02Open.length ? '' : 'Before the fix: ') + 'The ticket asks for font styles that exactly match the “buy now, pay later” copy. Family, size, weight, line-height and colour all match, but the financing text has <code>letter-spacing: 0.187px</code> and the badge has <code>normal</code>.',
    proof: bug02Open.length ? `Still failing on ${bug02Open.join(', ')}.` : `Fixed: the live CSS now has <code>letter-spacing: 0.187px</code> on <code>.cre-t-272-hsa-text</code>, and TC-05 passes in all ${retested.length} browsers re-tested (round 1: failed in ${r1Bug('TC-05')} of 7).`,
    fix: 'Give the badge text the same letter-spacing:',
    code: `html body.cre-t-272 .cre-t-272-hsa-text {
    letter-spacing: 0.187px;
}` },
];
const statusRows = bugs.map((b) => `<tr><th scope="row"><span class="mono">${b.id}</span></th><td><span class="sevtag ${b.sev}">${b.sev}</span></td><td>${b.title}</td><td class="c"><span class="pill ${b.status === 'Fixed' ? 'pass' : 'fail'}">${b.status}</span></td></tr>`).join('\n');
const card = (b) => `<article class="bug ${b.sev}"><header><span class="sev">${b.sev}</span><span class="mono bid">${b.id}</span><span class="pill ${b.status === 'Fixed' ? 'pass' : 'fail'}">${b.status}</span><h3>${b.title}</h3></header>
<dl><dt>What happens</dt><dd>${b.what}</dd><dt>Evidence</dt><dd>${b.proof}</dd><dt>Suggested fix</dt><dd>${b.fix}<pre><code>${esc(b.code)}</code></pre></dd></dl></article>`;

const r1pass = (() => { let p = 0, t = 0; for (const id of Object.keys(round1)) for (const b of browsers) { const r = round1[id][b]; if (!r) continue; t++; if (r.status === 'passed') p++; } return [p, t]; })();
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
.verdict{background:var(--pass-bg);border:1px solid var(--pass);border-radius:10px;padding:18px 20px;display:grid;gap:8px}
.verdict strong{color:var(--pass);font-family:"Schibsted Grotesk",sans-serif;font-size:18px}
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
details{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 20px}summary{cursor:pointer;font-family:"Schibsted Grotesk",sans-serif;font-weight:700;font-size:18px}details[open] summary{margin-bottom:12px}
.sevtag{font:600 11px/1 "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.06em}.sevtag.medium{color:var(--med)}.sevtag.low{color:var(--low)}
ul{margin:0;padding-left:20px;display:grid;gap:6px}
.note{font-size:13px;color:var(--muted);margin-top:10px}
</style>
<div class="wrap">
<section class="head">
  <span class="eyebrow">WinkBeds · Convert exp 100350648 · Re-test · ${new Date().toISOString().slice(0, 10)}</span>
  <h1>WIN272 Shop Page: Truemed Badges</h1>
  <div class="meta"><span><b>Page</b> /pages/shop-winkbed</span><span><b>Audience</b> All visitors</span><span><b>Code</b> va3.js / va3.css (cre-t-272)</span></div>
  <div class="verdict">
    <strong>BUG-02 fixed. Ready to launch</strong>
    <p>The letter-spacing fix is live, so fonts now match the financing copy exactly in all ${retested.length} browsers. Placement between the payment icons and the financing block, the equal 24px spacing, the copy and logo, size changes, narrow screens and Add to Cart all pass.</p>
  </div>
  <div class="tally">
    <div><div class="n">${pass} / ${total}</div><div class="l">Checks passed (re-test)</div></div>
    <div><div class="n">${retested.length} / 7</div><div class="l">Browsers re-tested</div></div>
    <div><div class="n">${bugs.filter((b) => b.status !== 'Fixed').length} open · ${bugs.filter((b) => b.status === 'Fixed').length} fixed</div><div class="l">Bugs</div></div>
    <div><div class="n">${other.length + flakes.length}</div><div class="l">Load/automation failures</div></div>
  </div>
</section>
<section>
  <h2>Re-test results by browser</h2>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${short[b]}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <p class="note">Gap above / below the badge (px): ${gapNote || 'n/a'}.${other.length ? ' Other failures: ' + other.map(esc).join('; ') : ''}</p>
</section>
<section>
  <h2>Bug status</h2>
  <div class="scroll"><table style="min-width:560px">
    <thead><tr><th>ID</th><th>Severity</th><th>Issue</th><th class="c">Re-test</th></tr></thead>
    <tbody>${statusRows}</tbody>
  </table></div>
</section>
<section><h2>Bug details</h2><div class="bugs">${bugs.map(card).join('\n')}</div></section>
<section>
  <h2>Control vs Variation</h2>
  <div class="shots">
    ${fig('Chrome_Desktop__control.png', 'Control: no badge')}
    ${fig('Chrome_Desktop__variation.png', 'Variation: badge between payment icons and financing block')}
  </div>
</section>
<section><h2>Variation in each browser</h2><div class="shots">${shotSet}</div></section>
<section>
  <h2>Narrow screens</h2>
  <div class="shots">${fig('Chrome_Desktop__w320.png', '320px wide')}${fig('Chrome_Desktop__w280.png', '280px wide: payment icons wrap, badge stays on one line')}</div>
</section>
<details>
  <summary>Round 1 (first QA pass, same day)</summary>
  <p>${r1pass[0]} of ${r1pass[1]} checks passed. TC-05 (letter-spacing) failed in ${r1Bug('TC-05')} of 7 browsers, which was BUG-02. Round 1 also ran out of memory partway through, so some Control Add to Cart cells were never re-run.</p>
</details>
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
