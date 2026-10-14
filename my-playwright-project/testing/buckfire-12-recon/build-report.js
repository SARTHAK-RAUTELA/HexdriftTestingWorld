// Buckfire Test 12 pre-launch re-check: build the self-contained HTML QA report.
// Screenshots are re-encoded to ~900px JPEG via Chromium canvas and embedded as base64.
// usage: node testing/buckfire-12-recon/build-report.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const KB = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'buckfirelaw');
const SHOTS = path.join(KB, 'buckfire-test12-recheck-screenshots');
const RES = path.join(KB, 'buckfire-test12-recheck-results');
const OUT = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2', 'buckfire-test12-recheck-qa-report.html');

const BROWSERS = [
  ['chrome-desktop', 'Chrome Desktop'],
  ['safari-desktop', 'Safari Desktop'],
  ['mobile-chrome', 'Mobile Chrome (Pixel 5)'],
  ['mobile-safari', 'Mobile Safari (iPhone 12)'],
];
const shotSlug = { 'chrome-desktop': 'chrome-desktop', 'safari-desktop': 'safari-desktop', 'mobile-chrome': 'mobile-chrome-pixel-5', 'mobile-safari': 'mobile-safari-iphone-12' };

const PAGES = [
  ['homepage', 'Homepage', '/', 'Shaylynn, Denita, Mike', false],
  ['medical-malpractice', 'Medical Malpractice', '/medical-malpractice-lawyers/', 'Denise, Shaylynn, Mike', true],
  ['dog-bite', 'Dog Bite', '/dog-bite-lawyer/', 'Jessica, Alyssa, Denita', true],
  ['slip-fall-lawyers', 'Slip & Fall (lawyers)', '/slip-and-fall-lawyers/', 'Jessica, Alyssa, Denita', true],
  ['slip-fall-attorneys', 'Slip & Fall (attorneys)', '/slip-and-fall-attorneys/', 'Damian, Alyssa, Denita', true],
  ['free-case-review', 'Free Case Review', '/free-case-review/', 'Shaylynn, Mike, Denita', true],
  ['car-accident', 'Car Accident', '/car-accident-lawyers/', 'Denita, Damian, Mike', true],
  ['personal-injury', 'Personal Injury', '/personal-injury-lawyer/', 'Mike, Shaylynn, Denise', true],
  ['bike-accident', 'Bike Accident', '/bicycle-accident-lawyer/', 'Mike, Jessica, Denita', false],
  ['wrongful-death', 'Wrongful Death', '/wrongful-death-lawyer/', 'Denita, Shaylynn, Denise', false],
  ['nursing-home-abuse', 'Nursing Home Abuse', '/nursing-home-abuse-lawyer/', 'Denise, Alyssa, Mike', false],
  ['birth-injury', 'Birth Injury', '/birth-injury-lawyers/', 'Denise, Alyssa, Mike', false],
  ['truck-accidents', 'Truck Accidents', '/truck-accident-lawyers/', 'Denita, Mike, Damian', false],
];

const strip = (s) => (s || '').replace(/\x1b\[[0-9;]*m/g, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isT20Err = (m) => /Test 20 (winner|card|review|"What Happens)/.test(m);

// results[browser][testTitle] = { status, errs, t12Ok, ann }
const results = {};
for (const [key] of BROWSERS) {
  const f = path.join(RES, `${key}.json`);
  if (!fs.existsSync(f)) continue;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  results[key] = {};
  const walk = (s) => {
    (s.specs || []).forEach((sp) => sp.tests.forEach((t) => {
      const r = t.results[t.results.length - 1] || {};
      const errs = (r.errors || []).map((e) => strip(e.message).split('\n').filter(Boolean)[0]);
      results[key][sp.title] = {
        status: r.status || 'unknown',
        errs,
        t12Ok: ['passed', 'skipped', 'flaky'].includes(r.status) || (errs.length > 0 && errs.every(isT20Err)),
        ann: Object.fromEntries((t.annotations || []).map((a) => [a.type, a.description])),
      };
    }));
    (s.suites || []).forEach(walk);
  };
  j.suites.forEach(walk);
  // Overlay isolated re-runs of flaky tests (<key>-retry.json); mark them so the matrix shows it.
  const rf = path.join(RES, `${key}-retry.json`);
  if (fs.existsSync(rf)) {
    const first = results[key];
    results[key] = {};
    JSON.parse(fs.readFileSync(rf, 'utf8')).suites.forEach(walk);
    const retried = results[key];
    results[key] = first;
    for (const [title, r] of Object.entries(retried)) {
      if (r.status === 'unknown') continue;
      const prev = first[title];
      r.retried = !!prev && !prev.t12Ok;
      r.firstErr = prev && !prev.t12Ok ? prev.errs.filter((e) => !isT20Err(e)).join(' | ') : '';
      first[title] = r;
    }
  }
}
const ran = BROWSERS.filter(([k]) => results[k]);

const rt = (r) => (r.retried ? `<br><small title="${esc('1st run: ' + r.firstErr)}">passed on re-run</small>` : '');
const cell = (r) => {
  if (!r) return '<td class="c muted">not run</td>';
  if (r.status === 'passed' || r.status === 'flaky') return `<td class="c ok">✅${rt(r)}</td>`;
  if (r.status === 'skipped') return '<td class="c muted">skipped</td>';
  if (r.t12Ok) return `<td class="c warn" title="${esc(r.errs.join(' | '))}">✅ T12<br><small>T20 ⚠️</small>${rt(r)}</td>`;
  return `<td class="c bad" title="${esc(r.errs.join(' | '))}">❌<br><small>${esc((r.errs[0] || '').slice(0, 70))}</small></td>`;
};
const findTest = (b, kind, pageKey) => {
  const t = results[b] && Object.keys(results[b]).find((k) => k.startsWith(kind) && k.endsWith(`[${pageKey}]`));
  return t ? results[b][t] : null;
};

let total = 0, passed = 0;
for (const [b] of ran) for (const r of Object.values(results[b])) { total++; if (['passed', 'skipped', 'flaky'].includes(r.status)) passed++; }
let t12Total = 0, t12Pass = 0;
const t12Fails = [];
for (const [b, bl] of ran) for (const [pk, label] of PAGES) for (const kind of ['control', 'variation']) {
  const r = findTest(b, kind, pk); if (!r) continue; t12Total++;
  if (r.t12Ok) t12Pass++; else t12Fails.push(`${bl} · ${label} · ${kind}: ${r.errs.filter((e) => !isT20Err(e)).join(' | ')}`);
}

// Test 20 bucketing seen (evidence that the Test 20 A/B is live)
const t20Seen = {};
for (const [b] of ran) for (const r of Object.values(results[b])) {
  if (!r.ann.baseline) continue;
  const ex = JSON.parse(r.ann.baseline).exps || {};
  for (const id of ['100052695', '100052957']) if (ex[id]) { const k = `${id} → ${ex[id]}`; t20Seen[k] = (t20Seen[k] || 0) + 1; }
}

const interactions = [
  ['Test 20 "What Happens Next?" modal opens/closes', 'Test 20 "What Happens Next?" modal still opens/closes with Test 12 present'],
  ['Only one video plays (T12 card + T20 modal)', 'audio overlap: Test 20 modal video vs Test 12 card video'],
  ['Keyboard access to play button (BUG-03)', 'a11y: play control is keyboard reachable with an accessible name (prior BUG-03)'],
  ['Case-results heading on non-medical pages', 'Test 20 case-results heading copy on non-medical pages (baseline content check)'],
];
const overlapStates = ran.map(([b, label]) => {
  const r = results[b][interactions[1][1]];
  return r && r.ann.state ? `${label}: <code>${esc(r.ann.state)}</code>` : `${label}: ${r ? r.status : 'not run'}`;
});
const headingAnn = (() => { for (const [b] of ran) { const r = results[b][interactions[3][1]]; if (r && r.ann.headings) return JSON.parse(r.ann.headings); } return []; })();

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const cache = {};
  const toJpeg = async (file) => {
    if (cache[file] !== undefined) return cache[file];
    const p = path.join(SHOTS, file);
    if (!fs.existsSync(p)) return (cache[file] = '');
    const b64 = fs.readFileSync(p).toString('base64');
    cache[file] = await page.evaluate(async (src) => {
      const img = new Image(); img.src = src; await img.decode();
      const w = Math.min(900, img.naturalWidth); const h = Math.round(img.naturalHeight * (w / img.naturalWidth));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.72);
    }, `data:image/png;base64,${b64}`);
    return cache[file];
  };
  const fig = async (file, cap) => { const d = await toJpeg(file); return d ? `<figure><img loading="lazy" src="${d}" alt="${esc(cap)}"><figcaption>${esc(cap)}</figcaption></figure>` : ''; };

  let gallery = '';
  for (const [pk, label, p] of PAGES) {
    const figs = [];
    for (const [b, bl] of ran) figs.push(await fig(`${pk}-${shotSlug[b]}-variation-section.png`, `${bl} — variation, Client Stories section`));
    figs.push(await fig(`${pk}-chrome-desktop-variation-playing.png`, 'Chrome Desktop — card 1 playing'));
    figs.push(await fig(`${pk}-mobile-safari-iphone-12-variation-playing.png`, 'Mobile Safari — card 1 playing'));
    figs.push(await fig(`${pk}-chrome-desktop-control-top.png`, 'Chrome Desktop — control (top of page)'));
    figs.push(await fig(`${pk}-mobile-chrome-pixel-5-control-top.png`, 'Mobile Chrome — control (top of page)'));
    gallery += `<details><summary><b>${esc(label)}</b> <span class="muted">${esc(p)}</span></summary><div class="shots">${figs.join('')}</div></details>\n`;
  }
  const interShots = [];
  for (const [b, bl] of ran) {
    interShots.push(await fig(`interaction-${shotSlug[b]}-both-videos.png`, `${bl} — Test 20 modal video playing while Test 12 card video still plays`));
    interShots.push(await fig(`interaction-${shotSlug[b]}-t20-modal-open.png`, `${bl} — Test 20 "What Happens Next?" modal`));
  }
  await browser.close();

  const link = (p, q) => `https://buckfirelaw.com${p}${q}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Buckfire Test 12 Re-check</title>
<style>
:root{--bg:#fff;--fg:#1a1d29;--muted:#5b6170;--card:#f5f6f9;--line:#e1e4ea;--red:#c0392b;--amber:#b7791f;--green:#1e8e3e;--blue:#2457c5;--okbg:#e8f5ec;--warnbg:#fdf4e3;--badbg:#fbeaea}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#12141b;--fg:#e8eaf0;--muted:#a3a9b8;--card:#1c1f29;--line:#2c3040;--red:#ff7b6b;--amber:#f0b44c;--green:#5ccf7d;--blue:#7ea6ff;--okbg:#16281c;--warnbg:#2c2414;--badbg:#2e1a1a}}
:root[data-theme=dark]{--bg:#12141b;--fg:#e8eaf0;--muted:#a3a9b8;--card:#1c1f29;--line:#2c3040;--red:#ff7b6b;--amber:#f0b44c;--green:#5ccf7d;--blue:#7ea6ff;--okbg:#16281c;--warnbg:#2c2414;--badbg:#2e1a1a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1150px;margin:0 auto;padding:24px 16px 64px}h1{font-size:26px;margin:0 0 4px}h2{font-size:19px;margin:36px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}h3{font-size:16px;margin:20px 0 6px}
.muted{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:16px 0}
.stat{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}.stat b{display:block;font-size:22px}
table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}th{background:var(--card)}td.c{text-align:center}
td.ok{background:var(--okbg)}td.warn{background:var(--warnbg)}td.bad{background:var(--badbg)}small{color:var(--muted)}
.wrap{overflow-x:auto}.bug{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--red);border-radius:8px;padding:12px 14px;margin:14px 0}
.bug.med{border-left-color:var(--amber)}.bug.low{border-left-color:var(--blue)}.bug.obs{border-left-color:var(--muted)}
.tag{display:inline-block;font-size:12px;font-weight:600;padding:1px 8px;border-radius:99px;border:1px solid currentColor;margin-right:6px}
.tag.high{color:var(--red)}.tag.med{color:var(--amber)}.tag.low{color:var(--blue)}.tag.obs{color:var(--muted)}
code{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:13px;word-break:break-word}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:13px;color:var(--muted);margin-top:6px}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:12px 0}ul{padding-left:20px}
details{border:1px solid var(--line);border-radius:8px;padding:8px 12px;margin:8px 0}summary{cursor:pointer}
</style></head><body><main>
<h1>Buckfire Law — Test 12 · PPC Landing Pages · Targeted Video Testimonials</h1>
<p class="muted">Pre-launch re-check · Convert exp <code>100052508</code> (12 PPC pages) + <code>100052748</code> (homepage) · QA run 2026-10-14 · ${ran.map(([, l]) => esc(l)).join(' · ')} (Playwright Chromium / WebKit)</p>

<div class="grid">
<div class="stat"><b>${t12Pass} / ${t12Total}</b>Test 12 page checks passed (control + variation, 13 pages × ${ran.length} browsers)</div>
<div class="stat"><b>${passed} / ${total}</b>Tests fully green (incl. Test 20 baseline + interaction checks)</div>
<div class="stat"><b>1</b>Launch blocker — Test 20 not paused</div>
<div class="stat"><b>2</b>Test 12 bugs (1 new, 1 carried) + 1 Test 20 baseline issue</div>
</div>

<h2>Summary</h2>
<ul>
<li><b>Test 12 itself is working</b>${t12Fails.length ? ' on almost every page/browser (exceptions listed below)' : ' on all 13 pages and every browser tested'}: the Client Stories section injects once, directly after <code>#case-results</code>; each page shows the correct 3 clients in order with the correct quote and alt text; posters load; all 3 videos load and play; only one Client Stories video plays at a time; no horizontal scroll; 3 columns on desktop / 1 column on mobile. The control arm shows no section.</li>
<li><b>Blocker — Test 20 is <u>not</u> paused.</b> The client asked to launch Test 12 with the Test 20 winner as control. Early on 2026-10-14 the winner (Variation C, deploy <code>100052957</code>) was live at 100%; by ~11:30 that deploy had been removed and the original <b>Test 20 A/B <code>100052695</code> (33/33/33) was active again</b>; around 12:00 the winner deploy came back briefly (Mobile Safari run), and at <b>12:16 the A/B was active again</b>. The Convert config is switching between the two states, so Test 12's control is currently inconsistent across visitors on the 7 Test 20 pages — in <b>both</b> Test 12 arms. Bucketing seen during this run: ${Object.entries(t20Seen).map(([k, v]) => `<code>${k}</code> ×${v}`).join(', ') || 'n/a'}.</li>
<li><b>Hold the client preview links</b> until <code>100052695</code> is paused and <code>100052957</code> is back on; then re-run this suite (~10 min per browser). The preview links themselves don't change.</li>
</ul>
${t12Fails.length ? `<h3>Test 12 failures (not Test 20 related)</h3><ul>${t12Fails.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}

<h2>Bugs &amp; issues</h2>
<div class="bug"><span class="tag high">BLOCKER</span><b>Test 20 A/B is still running — Test 20 winner is not the control</b>
<p>Expected (client): Test 20 paused, its winner as baseline for both Test 12 arms. Actual: <code>window.convert.data</code> lists <code>100052695</code> as an <i>active a/b</i> with 3 arms (<code>1000256999</code>, <code>1000257000</code>, <code>1000257001</code>, 33% each) on location <code>100011864</code> (Medical Malpractice, Dog Bite, Slip &amp; Fall ×2, Free Case Review, Car Accident, Personal Injury). The Variation C deploy <code>100052957</code> appears and disappears from the served config (present ~10:45 and ~12:00, absent ~11:30 and 12:16). In arm <code>1000256999</code> the "What Happens Next?" card is absent entirely.</p>
<p><b>Fix:</b> pause <code>100052695</code>; re-enable <code>100052957</code> (Variation C, 100%); ping QA to re-run before links go out.</p></div>

<div class="bug med"><span class="tag med">MEDIUM · NEW</span><b>Two videos play at once — Client Stories video keeps playing when the Test 20 "What Happens Next?" video starts</b>
<p>Repro (Medical Malpractice, variation, in a Test 20 arm with the card): play any Client Stories card → scroll up → click "What Happens Next?" → press play in the modal. Both videos play and the audio overlaps. Test 12's pause-others logic only covers <code>.buckfire-12-video</code>; Test 20 has no pause logic.</p>
<p>${overlapStates.join('<br>')}</p>
<p><b>Fix (Test 12 side, as Test 20 becomes the permanent baseline):</b> a capture-phase <code>play</code> listener that pauses every other video on the page — <code>document.addEventListener('play', e =&gt; document.querySelectorAll('video').forEach(v =&gt; { if (v !== e.target) v.pause(); }), true);</code> — this also fixes the old keyboard double-play gap.</p></div>

<div class="bug med"><span class="tag med">MEDIUM · CARRIED (BUG-03)</span><b>Play button is not keyboard-accessible</b>
<p><code>.buckfire-12-play-button</code> is a <code>&lt;div&gt;</code> with <code>tabIndex -1</code>, no <code>role</code>, no <code>aria-label</code>; native controls only appear after the first mouse click, so keyboard / screen-reader users cannot start a video (WCAG 2.1.1 / 4.1.2).</p>
<p><b>Fix:</b> <code>&lt;button type="button" aria-label="Play {Name}'s story"&gt;</code>, or <code>tabindex="0" role="button" aria-label</code> + Enter/Space handler.</p></div>

<div class="bug low"><span class="tag low">TEST 20 BASELINE</span><b>"Our Michigan <u>Medical Negligence</u> Case Results" heading on non-medical pages</b>
<p>Test 20 Variation C hard-codes this heading for all 7 pages in its location; once it is the control, both Test 12 arms will show it directly above Client Stories on Dog Bite, Slip &amp; Fall, Free Case Review, Car Accident and Personal Injury. Not a Test 12 defect. Captured:</p>
<div class="wrap"><table><tr><th>Page</th><th>Heading</th></tr>${headingAnn.map((h) => `<tr><td>${esc(h.page)}</td><td>${esc(h.heading)}</td></tr>`).join('') || '<tr><td colspan=2 class="muted">not captured</td></tr>'}</table></div>
<p class="muted">Note: while the Test 20 A/B is running, a visitor may land in an arm without this change; the heading above was recorded from arms that include it.</p></div>

<div class="bug obs"><span class="tag obs">CONFIRM</span><b>Test 20 winner covers only 7 of the 12 Test 12 PPC pages</b>
<p>Bike Accident, Wrongful Death, Nursing Home Abuse, Birth Injury and Truck Accidents aren't in Test 20's location, so their control is the original page (847 reviews, no "What Happens Next?" card). Confirm that's intended.</p></div>

<h2>Results matrix — Test 12 per page</h2>
<p class="muted">✅ all checks passed · <span style="white-space:nowrap">✅ T12 / T20 ⚠️</span> every Test 12 check passed; only the "Test 20 winner present" check failed (blocker above) · ❌ Test 12 failure. Hover a cell for the error text.</p>
<div class="wrap"><table>
<tr><th rowspan="2">Page</th><th rowspan="2">Clients (order)</th>${ran.map(([, l]) => `<th colspan="2">${esc(l)}</th>`).join('')}</tr>
<tr>${ran.map(() => '<th>Control</th><th>Variation</th>').join('')}</tr>
${PAGES.map(([pk, label, p, clients, t20]) => `<tr><td><b>${esc(label)}</b><br><small>${esc(p)}${t20 ? ' · Test 20 page' : ''}</small></td><td>${esc(clients)}</td>${ran.map(([b]) => cell(findTest(b, 'control', pk)) + cell(findTest(b, 'variation', pk))).join('')}</tr>`).join('\n')}
</table></div>

<p class="muted"><b>Re-runs:</b> cells marked "passed on re-run" timed out on the first full-suite pass (video load / poster load / page load / WebKit screenshot) and passed when that page was re-run on its own — each time a different card or page, consistent with headless network/CPU contention from loading many videos back-to-back, not a page defect. Hover for the first-run error.</p>
<h3>Cross-test interactions &amp; accessibility (Medical Malpractice, variation)</h3>
<div class="wrap"><table>
<tr><th>Check</th>${ran.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr>
${interactions.map(([label, title]) => `<tr><td>${esc(label)}</td>${ran.map(([b]) => cell(results[b][title])).join('')}</tr>`).join('\n')}
</table></div>
<p class="muted">"skipped" on the modal checks = that run's visitor was bucketed into the Test 20 arm with no "What Happens Next?" card (itself a symptom of the blocker).</p>

<h2>What was checked on every page / browser</h2>
<ul>
<li><b>Control arm:</b> Convert buckets into control; no Client Stories section; Test 20 winner baseline present on its 7 pages (deploy active, "What Happens Next?" card, 927 reviews).</li>
<li><b>Variation arm:</b> exactly one section, directly after <code>#case-results</code>, heading "Client Stories"; exactly 3 cards; client name + order + quote match the page mapping; poster alt names the client; 3 distinct clips and posters; no horizontal overflow; 3 columns ≥1100px, 1 column &lt;721px; posters load; each video gets a <code>src</code> on click, reaches <code>readyState ≥ 1</code> without <code>MediaError</code>; card 1 really plays (<code>currentTime</code> advances); after clicking all 3, only one plays; no <code>buckfire-12</code> / <code>cre-t-20</code> page errors.</li>
<li>Unrelated experiment <code>cre-t-21</code> (exit/idle overlay, <code>100052784</code>) suppressed with its own cookies so it can't intercept clicks — out of scope.</li>
</ul>

<h2>Preview links</h2>
<div class="wrap"><table><tr><th>Page</th><th>Variation</th><th>Control</th></tr>
${PAGES.map(([pk, label, p]) => { const home = pk === 'homepage'; const v = home ? '?cro_mode=qa&_conv_eforce=100052748.1000257125' : '?cro_mode=qa&_conv_eforce=100052508.1000256555'; const c = home ? '?cro_mode=qa&_conv_eforce=100052748.1000257124' : '?cro_mode=qa&_conv_eforce=100052508.1000256554'; return `<tr><td>${esc(label)}</td><td><a href="${esc(link(p, v))}">variation</a></td><td><a href="${esc(link(p, c))}">control</a></td></tr>`; }).join('\n')}
</table></div>

<h2>Screenshots</h2>
<h3>Cross-test interaction</h3>
<div class="shots">${interShots.join('')}</div>
<h3>Per page (click to expand)</h3>
${gallery}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB', '| browsers:', ran.map(([k]) => k).join(','), '| t12', t12Pass + '/' + t12Total, '| all', passed + '/' + total);
})();
