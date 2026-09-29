// Builds win276-targeted-offer-v2-qa-report.html with screenshots embedded as data URIs.
const fs = require('fs');
const path = require('path');
const SHOTS = path.join(__dirname, '..', '..', 'my-playwright-project', 'qa-knowledge-base', 'winkbeds', 'win276-screenshots');
const img = (f) => `data:image/png;base64,${fs.readFileSync(path.join(SHOTS, f)).toString('base64')}`;

const P = 'pass', F = 'fail';
const cases = [
  ['TC-01', 'Cohort 1 (checkout abandoner) sees modal — Control', [P, P, P, P]],
  ['TC-02', 'Cohort 1 sees modal — Variation', [P, P, P, P]],
  ['TC-03', 'Cohort 1 opens at the same delay in both arms', [F, F, F, F]],
  ['TC-04', 'Cohort 2 (cart returner, idle) sees modal ~5s after load — Variation', [F, F, F, F]],
  ['TC-05', 'Cohort 2 in Control is bucketed but sees no modal', [P, P, P, P]],
  ['TC-06', 'Cohort 2 who scrolls / moves the mouse on return still sees modal', [F, F, F, F]],
  ['TC-07', 'Still in the original session (active &lt;1h) → no modal', [P, P, P, P]],
  ['TC-08', 'Mattress already has Frost Cooling Cover → no modal', [P, P, P, P]],
  ['TC-09', 'Cart no longer has the mattress → no modal', [P, P, P, P]],
  ['TC-10', 'No cohort signal → experiment not triggered', [P, P, P, P]],
  ['TC-11', 'Real “Add to Cart” records the Cohort 2 flag', [F, F, F, F]],
  ['TC-12', 'Modal copy, page blur, close icon', [P, P, P, P]],
  ['TC-13', 'CTA swaps to Frost Cooling Cover + FROST8UYR31 at checkout', [P, P, P, P]],
  ['TC-14', 'Tracking keeps running on the next page after bucketing', [P, P, P, P]],
  ['TC-15', 'Cohort 2 modal is not re-shown every later session', [F, F, F, F]],
];
const browsers = ['Chrome Desktop', 'Safari Desktop', 'Mobile Chrome (Pixel 5)', 'Mobile Safari (iPhone 12)'];
const cell = (s) => `<td class="c"><span class="pill ${s}">${s === P ? 'Pass' : 'Fail'}</span></td>`;
const matrix = cases.map(([id, name, r]) => `<tr><th scope="row"><span class="mono">${id}</span> ${name}</th>${r.map(cell).join('')}</tr>`).join('\n');

const bugs = [
  { id: 'BUG-01', sev: 'critical', title: 'Cohort 2 can never qualify: real Add to Cart is not tracked',
    where: 'cre-t-276-deployment · <code>trackCartAdd()</code>',
    what: 'The deployment wraps <code>window.fetch</code> and only reacts to URLs containing <code>/cart/add</code>. On winkbeds.com both the shop-winkbed Buy Box and the product page add to cart with <code>POST /cart/update.js</code> (<code>{"updates":{"&lt;variant&gt;":1}}</code>). <code>cre276_cart_added_ts</code> is never written, so no real visitor can ever enter Cohort 2 and the Variation behaves exactly like Control.',
    proof: 'TC-11 fails on all 4 browsers. The request log shows only <code>/cart/update.js</code>; the cart holds “The LUXURY FIRM WinkBed - Queen x1” and the flag is <code>null</code>.',
    fix: 'Don’t depend on the request shape. On each page load, read <code>/cart.js</code>; if an eligible WinkBed is in the cart and no flag exists, write the timestamp. At minimum also match <code>/cart/update</code> and <code>/cart/change</code>.' },
  { id: 'BUG-02', sev: 'critical', title: 'Any scroll, mouse move or key press on the return visit cancels the “new session”',
    where: 'deployment <code>trackActivity()</code> + activation <code>qualifiesForCohort2()</code> + variation <code>exclusionLogicsApply()</code>',
    what: 'The first interaction writes <code>cre276_last_active_ts = now</code> immediately (throttle starts at 0). The activation checks <code>isNewSession()</code> 3s later, and the Variation checks it again after a further 5s. A returning visitor who scrolls or moves the mouse in those first ~8s is no longer “new”. Either the experiment never triggers, or the user is bucketed into the Variation and never sees the modal, which dilutes the Variation’s results.',
    proof: 'TC-06 fails on all 4 browsers. Chrome: bucketed into Variation, no modal, <code>last_active</code> 20s old. Safari / mobile: experiment not triggered at all.',
    fix: 'Decide “returning session” once, at deployment init, before the activity listeners are attached (e.g. store <code>sessionStorage.cre276_return_session = 1</code>). The activation and Variation should read that snapshot, not recompute from the live timestamp.' },
  { id: 'BUG-03', sev: 'high', title: 'Control and Variation show Cohort 1 at different times; Cohort 2 is later than 5s',
    where: 'variation <code>init()</code> · <code>setTimeout(…, 5000)</code>',
    what: 'The Variation waits an extra 5s for every user, Cohort 1 included, while the Control shows the modal as soon as the experiment runs. The same audience gets a different experience in each arm, and Variation users who leave within those 5s never see the offer. Cohort 2 also lands at 3s (activation) + 5s (variation) + load time, well past the 5s in the brief.',
    proof: 'Cohort 1, seconds from navigation start. Chrome: Control 6.5 / Variation 11.1. Mobile Chrome: 6.0 / 11.5. Safari Desktop (from DOMContentLoaded): 6.3 / 9.8. Cohort 2: Chrome 11.3s, Mobile Chrome 11.5s, Safari 9.8s, Mobile Safari 20.7s.',
    fix: 'Apply the 5s wait only to Cohort 2, and count it from page load. Leave Cohort 1 timing identical to Control.' },
  { id: 'BUG-04', sev: 'high', title: 'Cohort 2 modal re-appears on every later return session',
    where: 'deployment · <code>cre276_cart_added_ts</code> is never cleared',
    what: 'Once shown, nothing marks the offer as seen. Every time the user comes back after 1h+ with the same cart, the Variation shows the modal again. Control consumes its Cohort 1 cookie after one showing, so the arms also differ in how often the offer is seen.',
    proof: 'TC-15 fails on all 4 browsers (second showing: Chrome 10.8s, Safari 13.9s, Mobile Chrome 7.7s, Mobile Safari 19.9s).',
    fix: 'Set a persistent “shown” flag when the Cohort 2 modal is displayed, or clear the cart-added flag, and check it in the activation.' },
  { id: 'BUG-05', sev: 'high', title: 'A user who returns to an idle open tab is never treated as a new session',
    where: 'activation · evaluation runs only on page load / bfcache <code>pageshow</code>',
    what: 'The agreed definition says any interaction after 1h+ of inactivity counts as a return and re-triggers evaluation. The code never re-evaluates in an open tab, and the first interaction resets the timer, so the next page view isn’t “new” either.',
    proof: 'Code review. Follows from the same timestamp handling as BUG-02.',
    fix: 'In <code>markActive()</code>, if the previous timestamp is 1h+ old, flag a return session and re-run the activation check before overwriting it.' },
  { id: 'BUG-06', sev: 'high', title: 'Go-live: WIN257 is live as a 100% deployment and will stack with WIN276',
    where: 'Convert deploy <code>100350512</code> (cre-t-257), audience “campaign does NOT contain Cro276mode”',
    what: 'WIN257’s modal currently runs for all real traffic, and is excluded only for this QA’s <code>Cro276mode</code> param. When WIN276’s QA audience is removed, checkout abandoners will get both the WIN257 modal and the WIN276 modal unless 100350512 is paused.',
    proof: 'Convert project bundle, 2026-09-29.',
    fix: 'Pause 100350512 (and the WIN257 global activation) at WIN276 launch.' },
  { id: 'BUG-07', sev: 'medium', title: 'Cohort 1 is looser than WIN257’s definition',
    where: 'activation <code>qualifiesForCohort1()</code>',
    what: 'WIN257 requires the checkout cookie <em>and</em> Shopify’s <code>__ui … checkoutSessionIdentifier</code>. WIN276 dropped the second check, so a mousedown on “Continue to checkout” alone qualifies, even if checkout never loaded. The brief says Control should use the existing WIN257 targeting.',
    proof: 'Code comparison with the live WIN257 activation in the Convert global JS.',
    fix: 'Restore <code>hasCheckoutSessionIdentifier()</code> in the Cohort 1 check.' },
  { id: 'BUG-08', sev: 'medium', title: 'Checkout visitors can later fall into Cohort 2',
    where: 'deployment · <code>cre_276_checkout_visited</code> is a session cookie',
    what: 'The “previously reached Checkout” exclusion reads a session cookie that is deleted as soon as the Cohort 1 modal is shown, and is also lost when the browser closes. After either, a checkout visitor with the cart flag set qualifies as Cohort 2 (Variation only), so the cohorts aren’t mutually exclusive as required.',
    proof: 'Code review. Masked today by BUG-01; becomes live once BUG-01 is fixed.',
    fix: 'Also store a persistent <code>localStorage.cre276_checkout_reached</code> and exclude it from Cohort 2.' },
  { id: 'BUG-09', sev: 'low', title: 'Stale WIN257 goal fired from both arms',
    where: 'control + variation <code>modalInsertion()</code>',
    what: '<code>triggerConversion "100334268"</code> is WIN257’s goal (comment still reads “update to WIN276 goal ID”). It isn’t attached to experiment 100350628. The real WIN276 goal <code>100334580</code> is also fired, so tracking works, but the stray call should go.',
    proof: 'Convert bundle goal list for 100350628: 100321041, 100327778, 100324238, 100334580, 100334581.',
    fix: 'Remove the 100334268 push.' },
];
const bugHtml = bugs.map((b) => `
<article class="bug ${b.sev}" id="${b.id.toLowerCase()}">
  <header><span class="sev">${b.sev}</span><span class="mono bid">${b.id}</span><h3>${b.title}</h3></header>
  <p class="where">${b.where}</p>
  <dl>
    <dt>What happens</dt><dd>${b.what}</dd>
    <dt>Evidence</dt><dd>${b.proof}</dd>
    <dt>Suggested fix</dt><dd>${b.fix}</dd>
  </dl>
</article>`).join('\n');

const fig = (f, cap) => `<figure><img src="${img(f)}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;

const html = `<title>WIN276 Targeted Offer QA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root{
  --ground:#f3f6f8; --surface:#ffffff; --ink:#18212b; --muted:#566575; --line:#dbe3ea;
  --frost:#2c6e98; --frost-soft:#e3eff6;
  --pass:#1d7447; --pass-bg:#e2f3e9; --fail:#b3261e; --fail-bg:#fbe7e5;
  --high:#a35a00; --high-bg:#fdf0dc; --med:#6b5b00; --med-bg:#f7f1d2; --low:#566575; --low-bg:#eaeef2;
  --code:#edf1f5;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  color-scheme:dark;
  --ground:#10161c; --surface:#18212a; --ink:#e4ebf1; --muted:#9aabbb; --line:#2a3945;
  --frost:#7bb6dc; --frost-soft:#1b3040;
  --pass:#6fd39c; --pass-bg:#15321f; --fail:#ff8a80; --fail-bg:#3a1a18;
  --high:#f3b561; --high-bg:#35270f; --med:#dccb6a; --med-bg:#2f2b12; --low:#a9b7c4; --low-bg:#24303a;
  --code:#223039;
}}
:root[data-theme="dark"]{
  color-scheme:dark;
  --ground:#10161c; --surface:#18212a; --ink:#e4ebf1; --muted:#9aabbb; --line:#2a3945;
  --frost:#7bb6dc; --frost-soft:#1b3040;
  --pass:#6fd39c; --pass-bg:#15321f; --fail:#ff8a80; --fail-bg:#3a1a18;
  --high:#f3b561; --high-bg:#35270f; --med:#dccb6a; --med-bg:#2f2b12; --low:#a9b7c4; --low-bg:#24303a;
  --code:#223039;
}
*{box-sizing:border-box}
body{background:var(--ground);color:var(--ink);font:16px/1.6 "Source Sans 3",system-ui,-apple-system,"Segoe UI",sans-serif;padding-inline:16px;padding-block:40px 64px}
.wrap{max-width:1040px;margin:0 auto;display:grid;gap:48px}
h1,h2,h3{font-family:"Schibsted Grotesk","Segoe UI",system-ui,sans-serif;text-wrap:balance;margin:0;line-height:1.2}
h1{font-size:clamp(28px,4.4vw,40px);font-weight:700}
h2{font-size:22px;font-weight:700;margin-bottom:16px}
h3{font-size:17px;font-weight:700}
p{margin:0;max-width:68ch}
.mono,code{font-family:"JetBrains Mono",ui-monospace,Consolas,monospace;font-size:.86em}
code{background:var(--code);padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
.eyebrow{font:500 12px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--frost)}
.head{display:grid;gap:14px}
.meta{display:flex;flex-wrap:wrap;gap:8px 24px;color:var(--muted);font-size:14px}
.meta b{color:var(--ink);font-weight:600}
.verdict{background:var(--fail-bg);border:1px solid var(--fail);border-radius:10px;padding:18px 20px;display:grid;gap:8px}
.verdict strong{color:var(--fail);font-family:"Schibsted Grotesk",sans-serif;font-size:18px}
.tally{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.tally div{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px}
.tally .n{font:700 24px/1.1 "Schibsted Grotesk",sans-serif;font-variant-numeric:tabular-nums}
.tally .l{font-size:13px;color:var(--muted)}
@media (max-width:720px){.tally{grid-template-columns:repeat(2,minmax(0,1fr))}}
.scroll{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;min-width:680px;font-size:14px}
th,td{padding:9px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
thead th{font:600 12px/1.3 "JetBrains Mono",monospace;letter-spacing:.04em;color:var(--muted);text-transform:uppercase;background:var(--frost-soft)}
tbody th{font-weight:400}
td.c{text-align:center}
tbody tr:last-child>*{border-bottom:0}
.pill{display:inline-block;min-width:48px;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;text-align:center}
.pill.pass{background:var(--pass-bg);color:var(--pass)}
.pill.fail{background:var(--fail-bg);color:var(--fail)}
.bugs{display:grid;gap:16px}
.bug{background:var(--surface);border:1px solid var(--line);border-left:5px solid var(--sev);border-radius:8px;padding:18px 20px;display:grid;gap:10px}
.bug.critical{--sev:var(--fail);--sevbg:var(--fail-bg)}
.bug.high{--sev:var(--high);--sevbg:var(--high-bg)}
.bug.medium{--sev:var(--med);--sevbg:var(--med-bg)}
.bug.low{--sev:var(--low);--sevbg:var(--low-bg)}
.bug header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}
.bug header h3{flex-basis:100%}
.sev{font:600 11px/1 "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--sev);background:var(--sevbg);padding:4px 8px;border-radius:4px}
.bid{color:var(--muted)}
.where{font-size:14px;color:var(--muted)}
dl{margin:0;display:grid;grid-template-columns:130px 1fr;gap:6px 16px;font-size:15px}
dt{font-weight:600;color:var(--muted);font-size:13px;padding-top:2px}
dd{margin:0}
@media (max-width:640px){dl{grid-template-columns:1fr}dt{padding-top:6px}}
.twocol{display:grid;grid-template-columns:1fr 1fr;gap:24px}
@media (max-width:760px){.twocol{grid-template-columns:1fr}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px 20px;display:grid;gap:10px;align-content:start}
ul{margin:0;padding-left:20px;display:grid;gap:6px}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}
.shots.wide{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
figure{margin:0;display:grid;gap:6px}
figure img{width:100%;border:1px solid var(--line);border-radius:6px;display:block;background:var(--surface)}
figcaption{font-size:13px;color:var(--muted)}
.sub{color:var(--muted);font-size:15px;margin-bottom:14px}
</style>

<div class="wrap">
<section class="head">
  <span class="eyebrow">WinkBeds · Convert exp 100350628 · QA 2026-09-29</span>
  <h1>WIN276 Other: Targeted Offer V2</h1>
  <div class="meta">
    <span><b>Based on</b> WIN257 cart-modal upgrade</span>
    <span><b>Targeting</b> sitewide, all users, custom trigger</span>
    <span><b>Browsers</b> Chrome + Safari, desktop + mobile</span>
  </div>
  <div class="verdict">
    <strong>Not ready to launch</strong>
    <p>The modal, copy and upgrade flow work, and every exclusion rule behaves correctly. But the new Cohort 2 audience, the point of this test, cannot be reached by real visitors (BUG-01). Even when it is armed, it is lost as soon as the user scrolls (BUG-02). As built, the Variation would run as a copy of Control with a 5-second delay.</p>
  </div>
  <div class="tally">
    <div><div class="n">10 / 15</div><div class="l">passed on each of the 4 browsers</div></div>
    <div><div class="n">2</div><div class="l">critical bugs</div></div>
    <div><div class="n">4</div><div class="l">high (incl. 1 go-live item)</div></div>
    <div><div class="n">3</div><div class="l">medium / low</div></div>
  </div>
</section>

<section>
  <h2>How it was tested</h2>
  <p class="sub">Code read directly from the live Convert bundle: <code>cre-t-276-deployment</code> (100350629), <code>creT276Activation</code> (100350630), and the Control and Variation of 100350628. Each case seeds the relevant state (checkout cookie, <code>cre276_cart_added_ts</code>, <code>cre276_last_active_ts</code> set 2h in the past, real cart items), then opens the QA force link in a fresh browser context. Cart writes are real, on winkbeds.com, in throwaway sessions; no orders were placed.</p>
  <div class="twocol">
    <div class="panel"><h3>Control · 1003184697</h3><p class="mono" style="overflow-wrap:anywhere">/pages/shop-winkbed?utm_campaign=Cro276mode&amp;_conv_eforce=100350628.1003184697</p></div>
    <div class="panel"><h3>Variation · 1003184698</h3><p class="mono" style="overflow-wrap:anywhere">/pages/shop-winkbed?utm_campaign=Cro276mode&amp;_conv_eforce=100350628.1003184698</p></div>
  </div>
</section>

<section>
  <h2>Results by browser</h2>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${b}</th>`).join('')}</tr></thead>
    <tbody>${matrix}</tbody>
  </table></div>
</section>

<section>
  <h2>Bugs</h2>
  <div class="bugs">${bugHtml}</div>
</section>

<section class="twocol">
  <div class="panel">
    <h3>Working as specified</h3>
    <ul>
      <li>One combined trigger. Convert buckets Cohort 1 and Cohort 2 users into both arms (TC-05: Cohort 2 in Control enters the test with no modal).</li>
      <li>Exclusions: same session, Cooling Cover already in cart, empty cart, no signals (TC-07 to TC-10).</li>
      <li>Cart check now requires quantity 1, fixing WIN257’s old qty-2 issue.</li>
      <li>CTA replaces the mattress with the “with Frost Cooling Cover” variant and lands on checkout with <code>FROST8UYR31</code> (−$125) applied, on all 4 browsers.</li>
      <li>Copy matches WIN257. Page blurs behind the modal; close icon dismisses.</li>
    </ul>
  </div>
  <div class="panel">
    <h3>Agreed limitations (not logged as bugs)</h3>
    <ul>
      <li>Purchase and “already claimed” are not tracked.</li>
      <li>Checkout visits count only via clicks on <code>a[href="/checkout"]</code>; direct URL or Shop Pay / express buttons are missed.</li>
      <li>Carry-over from WIN257, not re-tested: cart is emptied before the new variant is found, redirect fires even if the swap fails, “winkbed” substring match (Kids / Blue Collection), no double-click guard, limited keyboard support.</li>
      <li>Mobile Safari timings (16–22s) are inflated by slow WebKit loading of this site; the fixed +5s in the code is the defect, not the absolute number.</li>
    </ul>
  </div>
</section>

<section>
  <h2>Screenshots</h2>
  <p class="sub">Modal as shown in the Variation, then checkout after clicking the CTA.</p>
  <div class="shots wide">
    ${fig('Chrome_Desktop__modal-ui.png', 'Chrome Desktop: modal')}
    ${fig('Safari_Desktop__modal-ui.png', 'Safari Desktop: modal')}
    ${fig('Chrome_Desktop__cta-checkout.png', 'Chrome Desktop: checkout, Cooling Cover variant, FROST8UYR31 −$125')}
    ${fig('Safari_Desktop__cta-checkout.png', 'Safari Desktop: checkout after CTA')}
  </div>
  <div class="shots" style="margin-top:18px">
    ${fig('Mobile_Chrome_Pixel_5___modal-ui.png', 'Mobile Chrome (Pixel 5): modal')}
    ${fig('Mobile_Safari_iPhone_12___modal-ui.png', 'Mobile Safari (iPhone 12): modal')}
    ${fig('Mobile_Chrome_Pixel_5___cta-checkout.png', 'Mobile Chrome: checkout after CTA')}
    ${fig('Mobile_Safari_iPhone_12___cta-checkout.png', 'Mobile Safari: checkout after CTA')}
  </div>
  <div class="shots wide" style="margin-top:18px">
    ${fig('Chrome_Desktop__c2-variation.png', 'Cohort 2, Variation: modal shown (state seeded)')}
    ${fig('Chrome_Desktop__c2-control.png', 'Cohort 2, Control: bucketed, no modal (correct)')}
  </div>
</section>

<section class="panel">
  <h3>Before re-test</h3>
  <ul>
    <li>Fix BUG-01 and BUG-02, then re-run TC-04, TC-06 and TC-11 with a real add-to-cart and a real 1h+ gap.</li>
    <li>Pause WIN257 deploy 100350512 at launch (BUG-06).</li>
    <li>Spec: <code>my-playwright-project/testing/win276-targeted-offer-v2.spec.js</code> · raw results: <code>qa-knowledge-base/winkbeds/win276-screenshots/results.jsonl</code></li>
  </ul>
</section>
</div>
`;
const out = path.join(__dirname, 'win276-targeted-offer-v2-qa-report.html');
fs.writeFileSync(out, html);
console.log(out, (html.length / 1e6).toFixed(2) + ' MB');
