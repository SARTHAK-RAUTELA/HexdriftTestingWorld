const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'pet-insurance-gurus', 'swf173-price-above-button-qa-report.html');
let h = fs.readFileSync(f, 'utf8');
if (h.includes('id="round3"')) { console.log('already has round 3'); process.exit(0); }
const img = n => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'r2', n)).toString('base64');
const row = (id, t, st, cls, note) => `<tr><td><code>${id}</code></td><td>${t}</td><td class="${cls}">${st}</td><td>${note}</td></tr>`;
h = h.replace('<span>Round 1 + Round 2 retest · 5 Nov 2026</span>', '<span>Round 1 → Round 3 retest · 5 Nov 2026</span>');
h = h.replace(/<div class="verdict">[\s\S]*?<\/div>\s*<\/div>/, `<div class="verdict">
  <div class="tile"><b style="color:var(--ok)">Ready</b><span>Round 3 verdict (1 low note)</span></div>
  <div class="tile"><b style="color:var(--ok)">27 / 27</b><span>Chrome desktop, live</span></div>
  <div class="tile"><b>22 / 27</b><span>Safari: 3 page-load timeouts, 2 test artifacts</span></div>
  <div class="tile"><b style="color:var(--ok)">7 / 7</b><span>bugs fixed (BUG-01 → BUG-07)</span></div>
</div>`);
const r3 = `<section id="round3">
<h2>Round 3 retest (live): all bugs fixed</h2>
<div class="summary"><p>The dev added the missing <code>isPlanMutation</code> filter and republished. The live variation no longer throws, prices every card on all 6 URLs, and follows tab, ZIP and Show More changes. The full spec passes 27/27 in Chrome against the live site. Safari shows no variation defects. One low-severity note remains: a short flicker of the pre-discount price on first load.</p></div>
<div class="scroll"><table><thead><tr><th>Bug</th><th>Issue</th><th>Round 3</th><th>Live evidence</th></tr></thead><tbody>
${row('BUG-07', 'ReferenceError, no prices', 'Fixed', 'ok', '0 errors, 8/8 cards priced, <code>body.SWF173</code> present')}
${row('BUG-01', 'Cats / Dogs tabs stale', 'Fixed', 'ok', 'Cats Lemonade $14.65, Dogs $22.76, both match the card. Round-trip to All Pets matches')}
${row('BUG-02', 'ZIP shows another insurer\'s price', 'Fixed', 'ok', 'ZIP 90210 after 17s re-orders cards; every price matches its own card')}
${row('BUG-03', 'Late Show More unpriced', 'Fixed', 'ok', 'Show More at 18s: 8→11 cards, all priced (Chrome + Safari)')}
${row('BUG-04', 'Best Overall unpriced', 'Fixed', 'ok', '/comparison/ Pets Best $24.90 and /canada/ priced')}
${row('BUG-05', 'petType=cat pre-discount price', 'Fixed', 'ok', 'Chrome 1/1 and WebKit 4/4 loads settle on the discounted price')}
${row('BUG-06', '/mo same size as amount', 'Fixed', 'ok', 'Live CSS: amount 18px, /mo 16px (Convert copy has no stray <code>;</code>)')}
</tbody></table></div>

<article class="bug">
  <div class="bug-head"><span class="pill low">low</span><span class="id">NOTE-01</span><h3>Pre-discount price flickers for about 0.3s on first load</h3></div>
  <p class="where">/ · Chrome 4 of 6 loads, WebKit 1 of 4 · not a blocker</p>
  <p>Sampled every 100ms: during the first ~1.5s the copied price sometimes shows the CRE-T-143 original (e.g. <strong>$23.44</strong> while the card shows <strong>$20.28</strong>) for 250–450ms. It then corrects itself and stays right (stable from ~1.9s in every load). Cause: the first insert can run before CRE-T-143 has swapped in <code>.cre-t-143-discounted-price</code>. Optional fix: skip the first insert until that span exists on pages where CRE-T-143 runs, or read only visible price spans.</p>
  <div class="figs"><figure><img src="${img('r3-live-card.png')}" alt="Live card mid-flicker showing $23.44 above the button vs $20.28 in the card" loading="lazy"><figcaption>Live, captured mid-flicker: $23.44 (pre-discount) above VIEW PLANS vs $20.28 in the card. It corrects within half a second.</figcaption></figure></div>
</article>

<div class="summary"><p><strong>Safari 22/27, and why the 5 failures aren't variation bugs.</strong> Dogs tab, quick Show More and the iPhone 12 audience check hit the known WebKit 60s page-load timeout before any listing rendered (inconclusive; the mobile audience passes in Chrome/Pixel 5 with 0 prices and not bucketed). <code>/comparison/</code> flagged Liberty Mutual, Odie and AKC: these sit collapsed behind Show More, WebKit returns an empty native price for them, and the SWF173 price ($42.66 / $26.28 / $48.34) is present. The <code>?petType=cat</code> failure did not reproduce in 4 direct WebKit loads (all 7/7 priced and matching within about 1s).</p></div>
<p class="where" style="margin:0">Housekeeping: local <code>vB.css</code> in the repo still has the stray <code>;</code>. Convert's copy is clean, so the repo file is behind the deployed CSS.</p>
</section>

<section>
<h2 style="color:var(--muted)">Round 2 (superseded)</h2>
</section>
`;
h = h.replace('<section id="round2">', r3 + '<section id="round2">');
h = h.replace('<h2>Round 2 retest: fix status</h2>', '<h2>Round 2 retest: fix status <span style="color:var(--muted);font-weight:500">(superseded by Round 3)</span></h2>');
if (!h.includes('id="round3"')) throw new Error('insert failed');
fs.writeFileSync(f, h); console.log('ok', h.length);
