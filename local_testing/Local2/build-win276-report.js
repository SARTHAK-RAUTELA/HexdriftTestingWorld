// Builds win276-targeted-offer-v2-qa-report.html: round 5 re-test first (client checklist, Chrome Desktop),
// earlier rounds collapsed below. Screenshots are embedded as data URIs.
const fs = require('fs');
const path = require('path');
const SHOTS = path.join(__dirname, '..', '..', 'my-playwright-project', 'qa-knowledge-base', 'winkbeds', 'win276-screenshots');
const img = (f) => `data:image/png;base64,${fs.readFileSync(path.join(SHOTS, f)).toString('base64')}`;

const P = 'pass', F = 'fail', N = 'noise', M = 'masked';
const label = { pass: 'Pass', fail: 'Fail', noise: 'Load noise', masked: 'Pass, re-test' };
const cell = (s) => `<span class="pill ${s}">${label[s]}</span>`;

// ── Round 5 (bundle published 2026-09-30 11:04Z, Chrome Desktop, QA threshold 2 min) ──
const r5 = [
  ['TC-01', 'Cohort 1 (checkout visitor) sees modal: Control', P, '15.4s'],
  ['TC-02', 'Cohort 1 sees modal: Variation', P, '8.0s'],
  ['TC-03', 'Cohort 1 opens at the same delay in both arms', N, 'Control 15.4s vs Variation 8.0s; Control runs first on a cold cache every run'],
  ['TC-04', 'Cohort 2 modal ~5s after page load: Variation', F, '17.7s (BUG-03)'],
  ['TC-05', 'Cohort 2 in Control is bucketed, sees no modal', F, 'Never bucketed (NEW-02). No modal, which is right'],
  ['TC-06', 'Cohort 2 who scrolls right after landing still sees modal', P, ''],
  ['TC-07', 'Same session (last activity 30s ago) → no modal', P, ''],
  ['TC-08', 'Cohort 2, mattress already has Frost Cooling Cover → no modal', M, 'Correct, but Cohort 2 rarely fires at all (NEW-02)'],
  ['TC-09', 'Cohort 2, mattress no longer in cart → no modal', M, 'As above'],
  ['TC-10', 'No checkout visit, no add-to-cart → no modal, browsing continues', P, ''],
  ['TC-11', 'Real “Add to Cart” arms Cohort 2', P, 'Site uses /cart/update.js'],
  ['TC-12', 'Modal copy, blur, close icon', P, ''],
  ['TC-13', 'CTA: spinner, swap to Frost Cooling Cover, checkout with FROST8UYR31, click goal', P, 'LUXURY FIRM Twin → LUXURY FIRM Twin with Frost Cooling Cover ×1; −$125'],
  ['TC-14', 'Tracking keeps running on the next page after bucketing', P, ''],
  ['TC-15', 'Cohort 2 modal is not re-shown every later return', F, 'First showing never happened (NEW-02), so the cap could not be tested'],
  ['TC-16', 'Visitor who ever reached checkout stays out of Cohort 2', P, ''],
  ['TC-17', 'Tab hidden past the threshold, then refocused → modal', P, '6.3s after refocus'],
  ['TC-18', 'Checkout cookie without Shopify checkout session → not Cohort 1', F, 'Modal at 7.8s (BUG-07)'],
  ['TC-19', 'Idle past the threshold on the same tab, then moves again → modal', P, 'Fixed this round: 6.1s after activity'],
  ['TC-20', 'Keeps browsing other pages after add-to-cart → no modal', M, 'Passes only because NEW-02 keeps resetting the clock'],
  ['TC-21', 'End to end, nothing seeded: add to cart, leave 2.5 min, return → modal', F, 'No modal. Clock reset at the moment of return (NEW-02)'],
  ['TC-22', 'Cohort 1 with two different WinkBeds → no modal', P, ''],
  ['TC-23', 'Cohort 1, mattress already has Frost Cooling Cover → no modal', P, ''],
  ['TC-24', 'Cohort 2 with quantity 2 of one WinkBed → no modal', M, 'Correct, but Cohort 2 rarely fires at all (NEW-02)'],
  ['TC-25', 'Cohort 2 with two different WinkBeds → no modal', M, 'As above'],
  ['TC-26', 'Cohort 2 mattress swapped for a pillow → no modal', M, 'As above'],
  ['TC-27', 'Layout; close icon and overlay close without cart changes; no re-show on reload', P, ''],
  ['TC-28', 'Modal goal 100334580 fires only for eligible visitors', P, ''],
  ['TC-29', 'Both Cohort 1 and Cohort 2 signals → Cohort 1 experience', P, 'cre276_active_cohort = 1'],
  ['TC-30', 'Mouse, key and scroll each reset the inactivity clock', P, 'Clock age 2s after each event, 68s with no event'],
  ['TC-31', 'Short bursts over more than the threshold, no long gap → not a new session', P, 'Last burst 50s before navigation; no modal'],
  ['TC-32', 'Real checkout visit after add-to-cart → Cohort 1 on return', P, 'Modal at 6.5s, cohort 1, Shopify __ui present'],
  ['TC-33', 'After the Cohort 1 modal, a later idle return is not Cohort 2', P, ''],
];
const r5Rows = r5.map(([id, name, s, note]) => `<tr><th scope="row"><span class="mono">${id}</span> ${name}</th><td class="c">${cell(s)}</td><td class="note-cell">${note}</td></tr>`).join('\n');
const count = (s) => r5.filter((r) => r[2] === s).length;

// Client checklist (32 items) mapped to the cases above
const checklist = [
  ['Cohort 1 modal only for checkout visitors who return with the required session condition', F, 'TC-01, TC-02, TC-32 pass; TC-18 fails: the cookie alone qualifies (BUG-07)'],
  ['No modal for users who have not visited checkout', P, 'TC-10'],
  ['Modal only when the cart has exactly one WinkBed', P, 'TC-01, TC-22'],
  ['No modal with multiple WinkBeds', P, 'TC-22'],
  ['No modal when the mattress already has Frost Cooling Cover', P, 'TC-23, TC-08'],
  ['Layout: overlay, blur, offer copy, close icon, CTA', P, 'TC-12, TC-27'],
  ['Close icon dismisses without cart changes', P, 'TC-27'],
  ['Clicking outside the modal closes it', P, 'TC-27'],
  ['Modal goal fires only for eligible users', P, 'TC-28'],
  ['CTA shows a loading state', P, 'TC-13'],
  ['CTA removes the existing mattress variant', P, 'TC-13'],
  ['Frost Cooling Cover variant added with the same firmness, size and quantity', P, 'TC-13'],
  ['Redirect to checkout with the discount applied', P, 'TC-13 (FROST8UYR31, −$125)'],
  ['CTA click goal fires', P, 'TC-13 (100334581)'],
  ['Non-qualifying users browse without a modal', P, 'TC-10'],
  ['Cohort 2 modal for add-to-cart, no checkout, return after 1h+ inactivity', F, 'TC-21 fails end to end; TC-04 fires only when it wins the race (NEW-02)'],
  ['No modal on return within the same session', P, 'TC-07'],
  ['No modal if an eligible mattress was never added', P, 'TC-10'],
  ['Reached checkout in the original session → Cohort 1, not Cohort 2', P, 'TC-16, TC-32'],
  ['Exactly one WinkBed, quantity 1', M, 'TC-24 (see NEW-02)'],
  ['No modal with multiple WinkBeds at return', M, 'TC-25 (see NEW-02)'],
  ['No modal when the mattress was removed or swapped', M, 'TC-09, TC-26 (see NEW-02)'],
  ['No modal when the cover was added before the return', M, 'TC-08 (see NEW-02)'],
  ['Cohort 2 modal waits 5s after page load', F, 'TC-04: 17.7s (BUG-03)'],
  ['Mouse, key and scroll each reset the inactivity timer', P, 'TC-30'],
  ['Short bursts spanning 1h+ with no 1h gap → not a new session', P, 'TC-31'],
  ['Both cohorts qualify → Cohort 1 takes priority', P, 'TC-29'],
  ['Control: Cohort 1 sees modal, Cohort-2-only sees none', P, 'TC-01, TC-05 (no modal)'],
  ['Variation: both cohorts see the modal', F, 'Cohort 1 passes (TC-02); Cohort 2 blocked by NEW-02'],
  ['Reaches checkout before the threshold → moved into Cohort 1', P, 'TC-32'],
  ['After the Cohort 1 modal, no later Cohort 2 from the old cart timestamp', P, 'TC-33'],
  ['No second modal after close and reload with no state change', P, 'TC-27'],
];
const checkRows = checklist.map(([t, s, where], i) => `<tr><td class="num">${i + 1}</td><th scope="row">${t}</th><td class="c">${cell(s)}</td><td class="note-cell">${where}</td></tr>`).join('\n');
const ck = (s) => checklist.filter((r) => r[1] === s).length;

const status = [
  ['NEW-02', 'critical', 'Convert’s own cart write resets Cohort 2 tracking on every page load', 'open', 'Found in round 4, still open. Blocks every Cohort 2 case.'],
  ['BUG-03', 'high', 'Cohort 2 modal later than 5s after page load', 'open', '17.7s on Chrome.'],
  ['BUG-04', 'high', 'Cohort 2 modal re-appears every later return', 'blocked', 'New 30-day <code>cre276_cohort2_shown</code> cap looks right, but NEW-02 clears it. Re-test after NEW-02.'],
  ['BUG-02', 'critical', 'Activity on return cancels the new session', 'fixed', 'Round 5 reads the old timestamp before refreshing it. TC-06 and TC-19 pass.'],
  ['BUG-06', 'high', 'Go-live: WIN257 deploy 100350512 still active at 100%', 'golive', 'Still active. Pause at WIN276 launch.'],
  ['NEW-03', 'high', 'Go-live: session threshold is 2 minutes', 'golive', 'Intentional for QA (client confirmed). Set <code>ONE_HOUR_MS</code> back to <code>60 * 60 * 1000</code>.'],
  ['BUG-07', 'medium', 'Cohort 1 skips WIN257’s <code>checkoutSessionIdentifier</code> check', 'open', 'TC-18 fails.'],
  ['BUG-09', 'low', 'Control fires WIN257’s goal 100334268', 'open', 'Control code unchanged.'],
  ['NEW-04', 'low', 'Variation registers <code>init</code> twice; <code>exclusionLogicsApply()</code> unused', 'open', 'Guarded, no visible effect. Cleanup.'],
  ['BUG-01', 'critical', 'Real Add to Cart not tracked', 'fixed', 'Fixed in round 2; TC-11 still passes.'],
  ['BUG-05', 'high', 'Idle open tab never re-evaluated', 'fixed', 'Refocus check (TC-17) and activity re-check (TC-19) both pass.'],
  ['BUG-08', 'medium', 'Checkout visitors could fall into Cohort 2', 'fixed', 'TC-16 and TC-33 pass.'],
  ['NEW-01', 'low', 'Visible idle tab not counted as returning', 'fixed', 'The activity-based session rule is back, matching the agreed definition.'],
];
const stLabel = { fixed: 'Fixed', open: 'Open', blocked: 'Blocked by NEW-02', golive: 'Go-live item' };
const statusRows = status.map(([id, sev, t, st, note]) => `<tr><th scope="row"><span class="mono">${id}</span></th><td><span class="sevtag ${sev}">${sev}</span></td><td>${t}</td><td><span class="st ${st}">${stLabel[st]}</span></td><td>${note}</td></tr>`).join('\n');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const open = [
  { id: 'NEW-02', sev: 'critical', title: 'Convert’s own cart write resets Cohort 2 on every page load',
    where: 'deployment <code>trackCartAdd()</code> → <code>armCohort2Tracking()</code>',
    what: 'Convert’s Shopify integration sends <code>POST /cart/update.js</code> with only a <code>__event</code> cart attribute on every page load and goal. The deployment counts any successful cart request with an eligible cart as a new add, so it resets <code>cre276_session_ts</code> and <code>cre276_cart_added_ts</code> to now and clears <code>cre276_cohort2_shown</code>. When that request lands before the 3s activation check, the returning visitor looks mid-session and gets nothing. When it lands after, the “already shown” cap is wiped.',
    proof: 'TC-21 (real add to cart, leave 2.5 min, return): no modal, both cookies stamped at the second of return. Request body captured: <code>{"attributes":{"__event":"eyJjaWQiOiIxMDAzNDE1Ii…"}}</code> (cid 1003415 is WinkBeds’ Convert account). TC-05 and TC-15 fail the same way.',
    fix: 'Arm only when not already armed, so attribute writes and other cart updates leave the state alone:',
    code: `cartMeetsMattressCondition().then(function (eligible) {
    if (eligible) {
        if (!getCartAddedTs()) armCohort2Tracking(); // first eligible add only
    } else {
        disarmCohort2Tracking();                     // removing or swapping re-arms cleanly later
    }
});` },
  { id: 'BUG-03', sev: 'high', title: 'Cohort 2 modal opens at 17.7s instead of 5s after page load',
    where: 'activation <code>setTimeout(checkAllConditionsAndActivate, 3000)</code> + variation <code>setTimeout(…, 5000)</code>',
    what: 'The Variation’s 5s wait starts only after the activation’s own 3s wait and after Convert loads the experiment, so the offer lands 8s plus load time after the page starts.',
    proof: 'TC-04: 17.7s from navigation start on Chrome Desktop. Cohort 1 on the same run: 8.0s.',
    fix: 'Wait only for what is left of the 5s:',
    code: `var remaining = Math.max(0, 5000 - performance.now());
setTimeout(async function () { /* re-verify, then showModal() */ }, remaining);` },
  { id: 'BUG-07', sev: 'medium', title: 'The checkout cookie alone qualifies a visitor as Cohort 1',
    where: 'deployment <code>getQualifyingCohort()</code>',
    what: 'WIN257 required both the checkout cookie and Shopify’s <code>checkoutSessionIdentifier</code> in <code>localStorage.__ui</code>. WIN276 checks only the cookie, which is set by a mousedown on any <code>a[href="/checkout"]</code>.',
    proof: 'TC-18: cookie seeded without <code>__ui</code>, modal at 7.8s.',
    fix: 'Add the WIN257 check:',
    code: `function hasCheckoutSessionIdentifier() {
    try {
        var ui = JSON.parse(localStorage.getItem('__ui') || '{}');
        return !!(ui && ui[2] && ui[2][0] && ui[2][0].checkoutSessionIdentifier);
    } catch (e) { return false; }
}
if (checkoutSignal && hasCheckoutSessionIdentifier() && cartOk) return 1;` },
  { id: 'BUG-09', sev: 'low', title: 'Control still fires WIN257’s goal',
    where: 'control <code>modalInsertion()</code>',
    what: 'Control pushes <code>triggerConversion "100334268"</code> (WIN257, not attached to 100350628) as well as the WIN276 goal 100334580 from <code>init()</code>.',
    proof: 'Round 5 Convert bundle, Control variation 1003184697.',
    fix: 'Delete the <code>100334268</code> push in <code>modalInsertion()</code>.', code: '' },
];
const card = (b) => `
<article class="bug ${b.sev}">
  <header><span class="sev">${b.sev}</span><span class="mono bid">${b.id}</span><h3>${b.title}</h3></header>
  <p class="where">${b.where}</p>
  <dl>
    <dt>What happens</dt><dd>${b.what}</dd>
    <dt>Evidence</dt><dd>${b.proof}</dd>
    <dt>Suggested fix</dt><dd>${b.fix}${b.code ? `<pre><code>${esc(b.code)}</code></pre>` : ''}</dd>
  </dl>
</article>`;

const fig = (f, cap) => (fs.existsSync(path.join(SHOTS, f)) ? `<figure><img src="${img(f)}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>` : '');

// ── Earlier rounds (kept for history) ──
const browsers = ['Chrome Desktop', 'Safari Desktop', 'Mobile Chrome (Pixel 5)', 'Mobile Safari (iPhone 12)'];
const r2 = [
  ['TC-01/02', 'Cohort 1 sees modal (both arms)', [P, P, P, P]],
  ['TC-03', 'Same Cohort 1 delay in both arms', [P, N, P, N]],
  ['TC-04', 'Cohort 2 modal ~5s after load', [F, F, F, F]],
  ['TC-05–14', 'Exclusions, real Add to Cart, modal UI, CTA, tracking', [P, P, P, P]],
  ['TC-15', 'No repeat modal every session', [F, F, F, F]],
  ['TC-16/17', 'Checkout exclusion, tab refocus', [P, P, P, P]],
];
const r1 = [
  ['TC-01/02', 'Cohort 1 sees modal (both arms)', [P, P, P, P]],
  ['TC-03', 'Same Cohort 1 delay in both arms', [F, F, F, F]],
  ['TC-04', 'Cohort 2 modal ~5s after load', [F, F, F, F]],
  ['TC-06', 'Scroll on return still shows modal', [F, F, F, F]],
  ['TC-11', 'Real Add to Cart sets the flag', [F, F, F, F]],
  ['TC-15', 'No repeat modal every session', [F, F, F, F]],
  ['Others', 'Exclusions, modal UI, CTA, tracking', [P, P, P, P]],
];
const matrix = (rows) => rows.map(([id, name, r]) => `<tr><th scope="row"><span class="mono">${id}</span> ${name}</th>${r.map((s) => `<td class="c">${cell(s)}</td>`).join('')}</tr>`).join('\n');
const history = [
  ['Round 1', '2026-09-29 AM', 'Original code', '10/15 on each of 4 browsers', 'BUG-01 to BUG-09 found.'],
  ['Round 2', '2026-09-29 PM', 'Leave-timestamp session model', '14–15/17 on 4 browsers', 'BUG-01, 02, 05, 08 fixed.'],
  ['Round 3', '2026-09-30 AM', 'Cohort 1 shown instantly in Variation', 'Chrome 15/17 (run stopped for low memory)', 'BUG-03 and BUG-04 still open.'],
  ['Round 4', '2026-09-30 PM', 'Cohort logic moved to deployment; activity clock', 'Chrome 12/20', 'NEW-02 found; idle-tab re-check regressed.'],
  ['Round 5', '2026-09-30 PM', 'Re-check reads the clock before refreshing it', 'Chrome 27/33', 'Idle-tab fixed; NEW-02 still open.'],
];
const histRows = history.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('\n');

const html = `<title>WIN276 Targeted Offer QA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: one reading column of QA sections; summary → checklist → cases → open bugs → evidence → history */
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
.wrap>*{min-width:0}
h1,h2,h3{font-family:"Schibsted Grotesk","Segoe UI",system-ui,sans-serif;text-wrap:balance;margin:0;line-height:1.2}
h1{font-size:clamp(28px,4.4vw,40px);font-weight:700}
h2{font-size:22px;font-weight:700;margin-bottom:16px}
h3{font-size:17px;font-weight:700}
p{margin:0;max-width:68ch}
.mono,code{font-family:"JetBrains Mono",ui-monospace,Consolas,monospace;font-size:.86em}
code{background:var(--code);padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
pre{margin:10px 0 0;background:var(--code);border-radius:6px;padding:12px 14px;overflow-x:auto;font-size:13px;line-height:1.5}
pre code{background:none;padding:0;overflow-wrap:normal;white-space:pre}
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
td.c,th.c{text-align:center}
td.num{font-variant-numeric:tabular-nums;text-align:right;color:var(--muted)}
td.note-cell{color:var(--muted);font-size:13px}
tbody tr:last-child>*{border-bottom:0}
.pill,.st{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;text-align:center;white-space:nowrap}
.pill{min-width:48px}
.pill.pass,.st.fixed{background:var(--pass-bg);color:var(--pass)}
.pill.fail,.st.open{background:var(--fail-bg);color:var(--fail)}
.pill.noise,.pill.masked,.st.blocked{background:var(--high-bg);color:var(--high)}
.st.golive{background:var(--frost-soft);color:var(--frost)}
.sevtag{font:600 11px/1 "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.06em}
.sevtag.critical{color:var(--fail)} .sevtag.high{color:var(--high)} .sevtag.medium{color:var(--med)} .sevtag.low{color:var(--low)}
.bugs{display:grid;gap:16px}
.bug{background:var(--surface);border:1px solid var(--line);border-left:5px solid var(--sev);border-radius:8px;padding:18px 20px;display:grid;gap:10px;min-width:0}
.bug.critical{--sev:var(--fail);--sevbg:var(--fail-bg)}
.bug.high{--sev:var(--high);--sevbg:var(--high-bg)}
.bug.medium{--sev:var(--med);--sevbg:var(--med-bg)}
.bug.low{--sev:var(--low);--sevbg:var(--low-bg)}
.bug header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}
.bug header h3{flex-basis:100%}
.sev{font:600 11px/1 "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--sev);background:var(--sevbg);padding:4px 8px;border-radius:4px}
.bid{color:var(--muted)}
.where{font-size:14px;color:var(--muted)}
dl{margin:0;display:grid;grid-template-columns:130px minmax(0,1fr);gap:6px 16px;font-size:15px}
dt{font-weight:600;color:var(--muted);font-size:13px;padding-top:2px}
dd{margin:0;min-width:0}
@media (max-width:640px){dl{grid-template-columns:minmax(0,1fr)}dt{padding-top:6px}}
.twocol{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.twocol>*{min-width:0}
@media (max-width:760px){.twocol{grid-template-columns:1fr}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px 20px;display:grid;gap:10px;align-content:start}
ul{margin:0;padding-left:20px;display:grid;gap:6px}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
figure{margin:0;display:grid;gap:6px}
figure img{width:100%;border:1px solid var(--line);border-radius:6px;display:block;background:var(--surface)}
figcaption{font-size:13px;color:var(--muted)}
.sub{color:var(--muted);font-size:15px;margin-bottom:14px}
.note{font-size:13px;color:var(--muted);margin-top:10px}
details{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 20px}
summary{cursor:pointer;font-family:"Schibsted Grotesk",sans-serif;font-weight:700;font-size:18px}
summary:focus-visible{outline:2px solid var(--frost);outline-offset:4px}
details[open] summary{margin-bottom:14px}
details h3{margin:18px 0 10px}
</style>

<div class="wrap">
<section class="head">
  <span class="eyebrow">WinkBeds · Convert exp 100350628 · Round 5 re-test · 2026-09-30</span>
  <h1>WIN276 Other: Targeted Offer V2</h1>
  <div class="meta">
    <span><b>Code tested</b> Convert bundle published 2026-09-30 11:04 UTC</span>
    <span><b>Browser</b> Chrome Desktop</span>
    <span><b>Session threshold</b> 2 min (QA build; 1h at launch)</span>
  </div>
  <div class="verdict">
    <strong>Not ready to launch: Cohort 2 is still blocked</strong>
    <p>Cohort 1, the modal, the CTA swap, the discount and both goals all work. This round fixed the idle-tab case: a visitor who comes back to an open tab now gets the offer. But Convert’s own cart write still resets the Cohort 2 tracking on every page load, so a real cart returner usually sees nothing (NEW-02). The Cohort 2 timing (BUG-03) and the Cohort 1 checkout-session check (BUG-07) are also still open.</p>
  </div>
  <div class="tally">
    <div><div class="n">${count(P) + count(M)} / ${r5.length}</div><div class="l">Cases passed, Chrome Desktop</div></div>
    <div><div class="n">${count(F)}</div><div class="l">Failed (3 from NEW-02)</div></div>
    <div><div class="n">${ck(P)} / ${checklist.length}</div><div class="l">Client checklist items passing</div></div>
    <div><div class="n">${count(M)}</div><div class="l">Pass, re-test after NEW-02</div></div>
  </div>
</section>

<section>
  <h2>Bug status</h2>
  <div class="scroll"><table>
    <thead><tr><th>ID</th><th>Severity</th><th>Issue</th><th>Round 5</th><th>Notes</th></tr></thead>
    <tbody>${statusRows}</tbody>
  </table></div>
</section>

<section>
  <h2>Client checklist</h2>
  <p class="sub">The 32 cases from the client’s list, each mapped to the test cases that cover it.</p>
  <div class="scroll"><table>
    <thead><tr><th class="c">#</th><th>Case</th><th class="c">Result</th><th>Covered by</th></tr></thead>
    <tbody>${checkRows}</tbody>
  </table></div>
  <p class="note">“Pass, re-test”: the modal correctly stays hidden, but Cohort 2 rarely fires at all while NEW-02 is open, so these checks prove less than they appear to. Re-run after the fix.</p>
</section>

<section>
  <h2>Test cases (Chrome Desktop)</h2>
  <div class="scroll"><table>
    <thead><tr><th>Case</th><th class="c">Result</th><th>Detail</th></tr></thead>
    <tbody>${r5Rows}</tbody>
  </table></div>
  <p class="note">Times are seconds from navigation start. TC-03 has had Control slower than Variation in every run today; Control always runs first on a cold cache and both arms run the same Cohort 1 code, so this is logged as load noise.</p>
</section>

<section>
  <h2>Still open</h2>
  <div class="bugs">${open.map(card).join('\n')}</div>
</section>

<section>
  <h2>Screenshots (round 5, Chrome Desktop)</h2>
  <div class="shots">
    ${fig('Chrome_Desktop__modal-ui.png', 'Variation modal: overlay, blur, offer copy, close icon, CTA')}
    ${fig('Chrome_Desktop__cta-checkout.png', 'After CTA: LUXURY FIRM Twin with Frost Cooling Cover, FROST8UYR31 −$125')}
    ${fig('Chrome_Desktop__c2-idle-same-page.png', 'TC-19 fixed: modal after an idle tab becomes active again')}
    ${fig('Chrome_Desktop__c1-after-real-checkout.png', 'TC-32: real checkout visit, back on the site, Cohort 1 modal')}
    ${fig('Chrome_Desktop__c2-real-return.png', 'TC-21 fails: real cart returner after 2.5 min, no modal (NEW-02)')}
    ${fig('Chrome_Desktop__c2-tab-refocus.png', 'TC-17: modal after a backgrounded tab is refocused')}
  </div>
</section>

<section class="twocol">
  <div class="panel">
    <h3>How it was tested</h3>
    <p>Code read from the live Convert bundle (<code>1003415-1003290.js</code>): deployment 100350629, activation 100350630, Control and Variation of 100350628. The local <code>vB.js</code> and <code>vB.css</code> match the live Variation exactly. Most cases seed the cookies a real visitor would have plus a real cart, then open the force link in a fresh browser. TC-19 to TC-21 and TC-30 to TC-32 use a real Add to Cart and real waits against the 2-minute QA threshold. Goals are read from Convert’s tracking requests. No orders placed.</p>
    <p class="mono" style="overflow-wrap:anywhere">Control: /pages/shop-winkbed?utm_campaign=Cro276mode&amp;_conv_eforce=100350628.1003184697<br>Variation: …&amp;_conv_eforce=100350628.1003184698</p>
  </div>
  <div class="panel">
    <h3>Scope and limits</h3>
    <ul>
      <li>Round 5 ran on Chrome Desktop only. NEW-02 comes from Convert’s request, not the browser, so Safari and mobile are held until it is fixed.</li>
      <li>Before launch: set the session threshold back to 1 hour and pause WIN257 deploy 100350512.</li>
      <li>Carry-over from WIN257, not re-tested: cart is emptied before the new variant is found, redirect fires even if the swap fails, “winkbed” substring match, no double-click guard.</li>
    </ul>
  </div>
</section>

<details>
  <summary>Earlier rounds</summary>
  <div class="scroll"><table>
    <thead><tr><th>Round</th><th>When</th><th>Code change</th><th>Result</th><th>Outcome</th></tr></thead>
    <tbody>${histRows}</tbody>
  </table></div>
  <h3>Round 2 by browser</h3>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${b}</th>`).join('')}</tr></thead>
    <tbody>${matrix(r2)}</tbody>
  </table></div>
  <h3>Round 1 by browser</h3>
  <div class="scroll"><table>
    <thead><tr><th>Case</th>${browsers.map((b) => `<th class="c">${b}</th>`).join('')}</tr></thead>
    <tbody>${matrix(r1)}</tbody>
  </table></div>
</details>
</div>
`;
const out = path.join(__dirname, 'win276-targeted-offer-v2-qa-report.html');
fs.writeFileSync(out, html);
console.log(out, (html.length / 1e6).toFixed(2) + ' MB', 'cases', r5.length, 'pass', count(P), 'masked', count(M), 'fail', count(F), 'noise', count(N), '| checklist pass', ck(P), 'masked', ck(M), 'fail', ck(F));
