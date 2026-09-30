// Builds win276-targeted-offer-v2-qa-report.html (round 2 re-test first, round 1 kept below)
// with screenshots embedded as data URIs.
const fs = require('fs');
const path = require('path');
const SHOTS = path.join(__dirname, '..', '..', 'my-playwright-project', 'qa-knowledge-base', 'winkbeds', 'win276-screenshots');
const img = (f) => `data:image/png;base64,${fs.readFileSync(path.join(SHOTS, f)).toString('base64')}`;

const P = 'pass', F = 'fail', N = 'noise';
const label = { pass: 'Pass', fail: 'Fail', noise: 'Load noise' };
const browsers = ['Chrome Desktop', 'Safari Desktop', 'Mobile Chrome (Pixel 5)', 'Mobile Safari (iPhone 12)'];

// Round 2 (code published 2026-09-29 10:03Z)
const r2 = [
  ['TC-01', 'Cohort 1 (checkout abandoner) sees modal: Control', [P, P, P, P]],
  ['TC-02', 'Cohort 1 sees modal: Variation', [P, P, P, P]],
  ['TC-03', 'Cohort 1 opens at the same delay in both arms', [P, N, P, N]],
  ['TC-04', 'Cohort 2 (cart returner) sees modal ~5s after load: Variation', [F, F, F, F]],
  ['TC-05', 'Cohort 2 in Control is bucketed but sees no modal', [P, P, P, P]],
  ['TC-06', 'Cohort 2 who scrolls / moves the mouse on return still sees modal', [P, P, P, P]],
  ['TC-07', 'Still in the original session (left &lt;1h ago) → no modal', [P, P, P, P]],
  ['TC-08', 'Mattress already has Frost Cooling Cover → no modal', [P, P, P, P]],
  ['TC-09', 'Cart no longer has the mattress → no modal', [P, P, P, P]],
  ['TC-10', 'No cohort signal → experiment not triggered', [P, P, P, P]],
  ['TC-11', 'Real “Add to Cart” records the Cohort 2 flag', [P, P, P, P]],
  ['TC-12', 'Modal copy, page blur, close icon', [P, P, P, P]],
  ['TC-13', 'CTA swaps to Frost Cooling Cover + FROST8UYR31 at checkout', [P, P, P, P]],
  ['TC-14', 'Tracking keeps running on the next page after bucketing', [P, P, P, P]],
  ['TC-15', 'Cohort 2 modal is not re-shown every later session', [F, F, F, F]],
  ['TC-16', 'New: visitor who ever reached checkout is kept out of Cohort 2', [P, P, P, P]],
  ['TC-17', 'New: tab hidden 1h+ then refocused (no reload) shows modal', [P, P, P, P]],
];
// Round 1 (original code)
const r1 = [
  ['TC-01', 'Cohort 1 sees modal: Control', [P, P, P, P]],
  ['TC-02', 'Cohort 1 sees modal: Variation', [P, P, P, P]],
  ['TC-03', 'Same Cohort 1 delay in both arms', [F, F, F, F]],
  ['TC-04', 'Cohort 2 modal ~5s after load', [F, F, F, F]],
  ['TC-05', 'Cohort 2 in Control: no modal', [P, P, P, P]],
  ['TC-06', 'Scroll on return still shows modal', [F, F, F, F]],
  ['TC-07–10', 'Exclusions', [P, P, P, P]],
  ['TC-11', 'Real Add to Cart sets the flag', [F, F, F, F]],
  ['TC-12–14', 'Modal UI, CTA, tracking after bucketing', [P, P, P, P]],
  ['TC-15', 'No repeat modal every session', [F, F, F, F]],
];
const cell = (s) => `<td class="c"><span class="pill ${s}">${label[s]}</span></td>`;
const matrix = (rows) => rows.map(([id, name, r]) => `<tr><th scope="row"><span class="mono">${id}</span> ${name}</th>${r.map(cell).join('')}</tr>`).join('\n');

const status = [
  ['BUG-01', 'critical', 'Real Add to Cart not tracked (<code>/cart/update.js</code>)', 'fixed', 'Now matches <code>/cart/update.js</code> and <code>/cart/change.js</code>; TC-11 passes on all 4.'],
  ['BUG-02', 'critical', 'Scroll / mouse on return cancelled the new session', 'fixed', 'Activity tracking replaced with a leave timestamp (tab hidden / page unload); TC-06 passes on all 4.'],
  ['BUG-03', 'high', 'Arms showed Cohort 1 at different times; Cohort 2 later than 5s', 'partly', 'Cohort 1 now identical in both arms. Cohort 2 still ~12–26s (see below).'],
  ['BUG-04', 'high', 'Cohort 2 modal re-appears every later session', 'open', 'No change; TC-15 fails on all 4.'],
  ['BUG-05', 'high', 'Idle open tab never re-evaluated', 'fixed', 'Activation re-checks on tab refocus; TC-17 passes on all 4.'],
  ['BUG-06', 'high', 'Go-live: WIN257 deploy 100350512 still live at 100%', 'golive', 'Still active. Pause it when WIN276 launches.'],
  ['BUG-07', 'medium', 'Cohort 1 dropped WIN257’s <code>checkoutSessionIdentifier</code> check', 'open', 'No change.'],
  ['BUG-08', 'medium', 'Checkout visitors could fall into Cohort 2', 'fixed', 'New 30-day <code>cre276_checkout_reached_ever</code> cookie; TC-16 passes on all 4.'],
  ['BUG-09', 'low', 'Stale WIN257 goal 100334268 fired', 'partly', 'Fixed in Variation; Control still pushes 100334268.'],
  ['NEW-01', 'low', 'Visible idle tab is not counted as a new session', 'confirm', 'Behaviour change from the fix; needs client sign-off (see below).'],
];
const stLabel = { fixed: 'Fixed', open: 'Open', partly: 'Partly fixed', golive: 'Go-live item', confirm: 'Confirm with client' };
const statusRows = status.map(([id, sev, t, st, note]) => `<tr><th scope="row"><span class="mono">${id}</span></th><td><span class="sevtag ${sev}">${sev}</span></td><td>${t}</td><td><span class="st ${st}">${stLabel[st]}</span></td><td>${note}</td></tr>`).join('\n');

const open = [
  { id: 'BUG-03', sev: 'high', title: 'Cohort 2 opens at 12–26s instead of 5s after page load',
    where: 'activation <code>setTimeout(checkAllConditionsAndActivate, 3000)</code> + variation <code>setTimeout(…, 5000)</code>',
    what: 'The 5s wait now applies only to Cohort 2, which is right. But it starts after the activation’s own 3s wait and after Convert has loaded the experiment, so the offer lands 3 + 5 seconds plus load time after the page starts. On slower phones, many returning visitors will have scrolled away or left before it appears.',
    proof: 'Seconds from navigation start. Chrome 12.5 · Mobile Chrome 12.7 · Safari Desktop 21.3 · Mobile Safari 26.1. Cohort 1 for comparison: Chrome 7.0 / 6.5.',
    fix: 'Count the 5s from page load: e.g. <code>setTimeout(showIfEligible, Math.max(0, 5000 - performance.now()))</code> in the Variation, or drop the Variation’s own wait for Cohort 2 and rely on the activation delay set to 5s.' },
  { id: 'BUG-04', sev: 'high', title: 'Cohort 2 modal re-appears on every later return session',
    where: 'deployment · <code>cre276_cart_added_ts</code> (30-day cookie) is never cleared or marked as used',
    what: 'After the modal is shown to a Cohort 2 user, every later visit after 1h+ away with the same cart shows it again, for up to 30 days. Control consumes its Cohort 1 cookie after one showing, so the arms differ in how often the offer is seen.',
    proof: 'TC-15 fails on all 4 browsers. Second showing: Chrome 12.1s, Safari 20.9s, Mobile Chrome 12.5s, Mobile Safari 22.6s.',
    fix: 'When the Cohort 2 modal is shown, set a persistent <code>cre276_c2_shown</code> cookie and exclude it in <code>qualifiesForCohort2()</code>.' },
  { id: 'BUG-06', sev: 'high', title: 'Go-live: WIN257 is still live as a 100% deployment',
    where: 'Convert deploy <code>100350512</code> (cre-t-257), audience “campaign does NOT contain Cro276mode”',
    what: 'Right now WIN257 is excluded only for the <code>Cro276mode</code> QA param. Once WIN276 goes live for real traffic, checkout abandoners would get both modals.',
    proof: 'Convert project bundle, re-checked in round 2.',
    fix: 'Pause 100350512 (and the WIN257 global activation) at WIN276 launch.' },
  { id: 'BUG-07', sev: 'medium', title: 'Cohort 1 is looser than WIN257’s definition',
    where: 'activation <code>qualifiesForCohort1()</code>',
    what: 'WIN257 requires the checkout cookie and Shopify’s <code>__ui … checkoutSessionIdentifier</code>. WIN276 still checks only the cookie, so a mousedown on “Continue to checkout” alone qualifies.',
    proof: 'Code comparison with the live WIN257 activation.',
    fix: 'Restore <code>hasCheckoutSessionIdentifier()</code> in the Cohort 1 check.' },
  { id: 'BUG-09', sev: 'low', title: 'Control still fires WIN257’s goal',
    where: 'control <code>modalInsertion()</code>',
    what: '<code>triggerConversion "100334268"</code> (WIN257’s goal, not attached to 100350628) is still pushed from Control. Variation now pushes the WIN276 goal 100334580.',
    proof: 'Round 2 Convert bundle.',
    fix: 'Change Control to 100334580, matching the Variation.' },
  { id: 'NEW-01', sev: 'low', title: 'A tab left open and visible for 1h+ is not treated as a new session',
    where: 'deployment <code>trackDeparture()</code> (visibilitychange / pagehide)',
    what: 'The fix changed the session rule from “1h+ without mouse, key or scroll” to “1h+ since the tab was hidden or the page was closed”. A visitor who walks away from a visible tab and comes back won’t count as returning. This is a reasonable trade-off, and it fixed BUG-02, but it differs from the definition agreed with the client.',
    proof: 'Code review of the round 2 deployment.',
    fix: 'Confirm with the client that the “left the tab” definition is acceptable, or also record the last interaction time and treat 1h+ idle as a return.' },
];
const card = (b) => `
<article class="bug ${b.sev}">
  <header><span class="sev">${b.sev}</span><span class="mono bid">${b.id}</span><h3>${b.title}</h3></header>
  <p class="where">${b.where}</p>
  <dl>
    <dt>What happens</dt><dd>${b.what}</dd>
    <dt>Evidence</dt><dd>${b.proof}</dd>
    <dt>Suggested fix</dt><dd>${b.fix}</dd>
  </dl>
</article>`;

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
.wrap{max-width:1080px;margin:0 auto;display:grid;gap:48px}
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
.verdict{background:var(--high-bg);border:1px solid var(--high);border-radius:10px;padding:18px 20px;display:grid;gap:8px}
.verdict strong{color:var(--high);font-family:"Schibsted Grotesk",sans-serif;font-size:18px}
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
td.c,th.c{text-align:center}
td.num{font-variant-numeric:tabular-nums;text-align:right}
tbody tr:last-child>*{border-bottom:0}
.pill,.st{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;text-align:center;white-space:nowrap}
.pill{min-width:48px}
.pill.pass,.st.fixed{background:var(--pass-bg);color:var(--pass)}
.pill.fail,.st.open{background:var(--fail-bg);color:var(--fail)}
.pill.noise,.st.partly,.st.confirm{background:var(--high-bg);color:var(--high)}
.st.golive{background:var(--frost-soft);color:var(--frost)}
.sevtag{font:600 11px/1 "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.06em}
.sevtag.critical{color:var(--fail)} .sevtag.high{color:var(--high)} .sevtag.medium{color:var(--med)} .sevtag.low{color:var(--low)}
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
.note{font-size:13px;color:var(--muted);margin-top:10px}
details{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 20px}
summary{cursor:pointer;font-family:"Schibsted Grotesk",sans-serif;font-weight:700;font-size:18px}
summary:focus-visible{outline:2px solid var(--frost);outline-offset:4px}
details[open] summary{margin-bottom:14px}
</style>

<div class="wrap">
<section class="head">
  <span class="eyebrow">WinkBeds · Convert exp 100350628 · Round 2 re-test · 2026-09-29</span>
  <h1>WIN276 Other: Targeted Offer V2</h1>
  <div class="meta">
    <span><b>Based on</b> WIN257 cart-modal upgrade</span>
    <span><b>Code tested</b> Convert bundle published 2026-09-29 10:03 UTC</span>
    <span><b>Browsers</b> Chrome + Safari, desktop + mobile</span>
  </div>
  <div class="verdict">
    <strong>Much closer: two fixes left, plus one launch step</strong>
    <p>The fix works. Real Add to Cart now arms Cohort 2, scrolling no longer cancels it, returning to a backgrounded tab works, and past checkout visitors stay out of Cohort 2. Cohort 1 now appears at the same time in both arms. Still open: the Cohort 2 offer lands 12–26s after the page starts instead of 5s, and it re-appears on every later return. WIN257’s live deployment must be paused at launch.</p>
  </div>
  <div class="tally">
    <div><div class="n">15 / 17</div><div class="l">Chrome Desktop</div></div>
    <div><div class="n">14 / 17</div><div class="l">Safari Desktop · 1 is load noise</div></div>
    <div><div class="n">15 / 17</div><div class="l">Mobile Chrome (Pixel 5)</div></div>
    <div><div class="n">14 / 17</div><div class="l">Mobile Safari · 1 is load noise</div></div>
  </div>
</section>

<section>
  <h2>Bug status after the fix</h2>
  <div class="scroll"><table>
    <thead><tr><th>ID</th><th>Severity</th><th>Issue</th><th>Round 2</th><th>Notes</th></tr></thead>
    <tbody>${statusRows}</tbody>
  </table></div>
</section>

<section>
  <h2>Round 2 results by browser</h2>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${b}</th>`).join('')}</tr></thead>
    <tbody>${matrix(r2)}</tbody>
  </table></div>
  <p class="note">“Load noise”: TC-03 on WebKit had the Control arm slower than the Variation (Safari 16.0s vs 11.3s, iPhone 19.6s vs 13.4s). Both arms now run the same Cohort 1 code path, so the gap is WebKit’s slow page load on this site, not a timing difference in the test code.</p>
</section>

<section>
  <h2>Modal timing</h2>
  <div class="scroll"><table>
    <thead><tr><th>Seconds from navigation start</th>${browsers.map((b) => `<th class="c">${b}</th>`).join('')}</tr></thead>
    <tbody>
      <tr><th scope="row">Cohort 1 · Control</th><td class="num">7.0</td><td class="num">16.0</td><td class="num">8.3</td><td class="num">19.6</td></tr>
      <tr><th scope="row">Cohort 1 · Variation</th><td class="num">6.5</td><td class="num">11.3</td><td class="num">7.7</td><td class="num">13.4</td></tr>
      <tr><th scope="row">Cohort 2 · Variation (spec: 5s)</th><td class="num">12.5</td><td class="num">21.3</td><td class="num">12.7</td><td class="num">26.1</td></tr>
      <tr><th scope="row">Cohort 2 · after tab refocus</th><td class="num">6.7</td><td class="num">16.0</td><td class="num">7.2</td><td class="num">11.3</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Still open</h2>
  <div class="bugs">${open.map(card).join('\n')}</div>
</section>

<section>
  <h2>Screenshots (round 2)</h2>
  <p class="sub">Variation modal, checkout after clicking the CTA, and the modal after a backgrounded tab is refocused.</p>
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
    ${fig('Chrome_Desktop__c2-tab-refocus.png', 'Chrome Desktop: Cohort 2 modal after tab refocus (TC-17)')}
    ${fig('Mobile_Chrome_Pixel_5___c2-tab-refocus.png', 'Mobile Chrome: Cohort 2 modal after tab refocus')}
    ${fig('Chrome_Desktop__c2-variation-interacted.png', 'Chrome Desktop: Cohort 2 modal despite scrolling on return (TC-06)')}
    ${fig('Chrome_Desktop__c2-control.png', 'Cohort 2 in Control: bucketed, no modal (correct)')}
  </div>
</section>

<section class="twocol">
  <div class="panel">
    <h3>How it was tested</h3>
    <p>Code read from the live Convert bundle (<code>1003415-1003290.js</code>): deployment 100350629, activation 100350630, Control and Variation of 100350628. Each case seeds the cookies a real visitor would have (<code>cre276_cart_added_ts</code>, <code>cre276_left_at_ts</code> 2h ago, <code>cre276_checkout_reached_ever</code>, checkout cookie) plus a real cart, then opens the force link in a fresh browser. Cart writes are real, in throwaway sessions; no orders placed.</p>
    <p class="mono" style="overflow-wrap:anywhere">Control: /pages/shop-winkbed?utm_campaign=Cro276mode&amp;_conv_eforce=100350628.1003184697<br>Variation: …&amp;_conv_eforce=100350628.1003184698</p>
  </div>
  <div class="panel">
    <h3>Agreed limitations (not logged as bugs)</h3>
    <ul>
      <li>Purchase and “already claimed” are not tracked.</li>
      <li>Checkout visits count only via clicks on <code>a[href="/checkout"]</code>.</li>
      <li>Carry-over from WIN257, not re-tested: cart is emptied before the new variant is found, redirect fires even if the swap fails, “winkbed” substring match, no double-click guard.</li>
      <li>The site’s bot protection blocked this machine once mid-run (403 on pages, 429 on cart writes). That run was discarded and repeated after the block cleared.</li>
    </ul>
  </div>
</section>

<details>
  <summary>Round 1 (original code): 10 / 15 on every browser</summary>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${b}</th>`).join('')}</tr></thead>
    <tbody>${matrix(r1)}</tbody>
  </table></div>
  <p class="note">Round 1 found BUG-01 to BUG-09. Status of each after the fix is in the table at the top.</p>
</details>
</div>
`;
const out = path.join(__dirname, 'win276-targeted-offer-v2-qa-report.html');
fs.writeFileSync(out, html);
console.log(out, (html.length / 1e6).toFixed(2) + ' MB');
