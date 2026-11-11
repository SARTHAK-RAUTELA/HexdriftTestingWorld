const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'pet-insurance-gurus', 'swf173-price-above-button-qa-report.html');
let h = fs.readFileSync(f, 'utf8');
if (h.includes('id="round2"')) { console.log('already has round 2'); process.exit(0); }
const img = n => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'r2', n)).toString('base64');
const fig = (n, c) => `<figure><img src="${img(n)}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`;
const row = (id, sev, t, st, cls, note) => `<tr><td><code>${id}</code></td><td>${sev}</td><td>${t}</td><td class="${cls}">${st}</td><td>${note}</td></tr>`;

h = h.replace('<span>Tested 5 Nov 2026</span>', '<span>Round 1 + Round 2 retest · 5 Nov 2026</span>');
h = h.replace(/<div class="verdict">[\s\S]*?<\/div>\s*<\/div>/, `<div class="verdict">
  <div class="tile"><b style="color:var(--high)">Not ready</b><span>Round 2 verdict</span></div>
  <div class="tile"><b style="color:var(--high)">1 critical</b><span>new: variation crashes live, 0 prices</span></div>
  <div class="tile"><b style="color:var(--ok)">5 / 6</b><span>original bugs fixed in code</span></div>
  <div class="tile"><b>1 open</b><span>BUG-06 /mo size (CSS typo)</span></div>
</div>`);

const r2 = `<section id="round2">
<h2>Round 2 retest: fix status</h2>
<div class="summary"><p>The dev rewrote the code to keep the observer running and update the price whenever it changes, which is the right approach. <strong>But the deployed code crashes on every load</strong> (BUG-07), so the live variation currently shows no prices. To check whether the logic works, the dev's new code was injected into the control arm with only the undefined <code>filter</code> option removed. With that, BUG-01 to BUG-05 all pass. Two one-line fixes are needed before launch.</p></div>
<div class="scroll"><table><thead><tr><th>Bug</th><th>Sev</th><th>Issue</th><th>Round 2</th><th>Evidence</th></tr></thead><tbody>
${row('BUG-07', 'Critical', 'New: variation throws a ReferenceError, no prices render', 'New · open', 'bad', 'Live force URL: <code>isPlanMutation is not defined</code>, 0 <code>.SWF173-price</code>, no <code>body.SWF173</code>')}
${row('BUG-01', 'High', 'Cats / Dogs tabs keep the All Pets price', 'Fixed in code', 'ok', 'Cats Lemonade $14.65 = left column; Dogs and back to All Pets all match')}
${row('BUG-02', 'High', 'ZIP re-order shows another insurer\'s price', 'Fixed in code', 'ok', 'ZIP 90210 typed after 17s: 8/8 cards match')}
${row('BUG-03', 'Med', 'Late Show More cards unpriced', 'Fixed in code', 'ok', 'Show More at 18s, 8→11 cards, all priced and matching')}
${row('BUG-04', 'Med', 'Best Overall unpriced on /comparison/ + /canada/', 'Fixed in code', 'ok', 'Selector no longer needs <code>.plan-repeater</code>; both pages priced')}
${row('BUG-05', 'Low', 'CRE-T-143 race shows pre-discount price', 'Fixed in code', 'ok', '<code>?petType=cat</code> landing 2 of 2 discounted; the price now re-syncs anyway')}
${row('BUG-06', 'Low', '/mo same size as the amount', 'Not fixed', 'bad', 'New 16px rule is dropped by a stray <code>;</code> in the CSS, so /mo is still 18px')}
</tbody></table></div>
<p class="where" style="margin:0">"Fixed in code" = verified with the dev's code minus the crash line, Chrome desktop 1440px, live site. It becomes live once BUG-07 is fixed and republished.</p>

<article class="bug">
  <div class="bug-head"><span class="pill high">critical</span><span class="id">BUG-07</span><h3>Variation crashes: <code>isPlanMutation is not defined</code></h3></div>
  <p class="where">All 6 URLs · variation <code>1000257882</code> · Convert-served code</p>
  <p>The new init passes <code>filter: isPlanMutation</code> to <code>observeSelector</code>, but no <code>isPlanMutation</code> function exists. The call sits inside a <code>setTimeout</code>, so the outer <code>try/catch</code> does not catch the error. The script stops before any price is inserted. <code>observeSelector</code> never reads <code>filter</code>, so the fix is to delete the option:</p>
  <div class="scroll"><pre style="margin:0;font:.85rem/1.5 var(--mono);background:var(--low-bg);padding:12px;border-radius:6px">- observeSelector(CTA_SELECTOR, init, { rerun: true, debounceDelay: 150, filter: isPlanMutation });
+ observeSelector(CTA_SELECTOR, init, { rerun: true, debounceDelay: 150 });</pre></div>
</article>

<article class="bug">
  <div class="bug-head"><span class="pill low">low</span><span class="id">BUG-06 (still open)</span><h3>The new /mo rule is dropped by a stray semicolon</h3></div>
  <p>vB.css has a lone <code>;</code> between the <code>.SWF173-price</code> rule and the new <code>.SWF173-amount .SWF173-mo</code> rule. At the top level of a stylesheet, CSS reads the <code>;</code> as the start of the next selector. The selector becomes invalid and the browser discards the whole rule. Measured: amount 18px, /mo 18px. With the <code>;</code> removed: /mo 16px. Also set <code>debug = 0</code>; it was left at 1.</p>
</article>

<div class="figs">
${fig('tab-Cats.png', 'Patched code · Cats tab: duplicated $14.65 matches the card')}
${fig('tab-Dogs.png', 'Patched code · Dogs tab: matches the card')}
${fig('zip.png', 'Patched code · ZIP 90210 entered after 17s: matches')}
${fig('bestoverall_comparison_.png', 'Patched code · /comparison/ Best Overall now priced (BUG-04)')}
${fig('bestoverall_canada_.png', 'Patched code · /canada/ Best Overall now priced (BUG-04)')}
</div>
<p class="where" style="margin:0">Also checked with the patched code: all 6 URLs priced with a 0px centre offset, code run twice more with no duplicates, and 0 self-triggered mutations in 10s idle (no observer loop). Still to run after the republish: full Playwright spec on Chrome and Safari, and the Safari mobile-audience check.</p>
</section>

<section>
<h2 style="color:var(--muted)">Round 1 findings (original, for reference)</h2>
</section>
`;
h = h.replace('<section>\n<h2>Bugs</h2>', r2 + '<section>\n<h2>Bugs</h2>');
if (!h.includes('id="round2"')) throw new Error('insert point not found');
fs.writeFileSync(f, h); console.log('ok', h.length);
