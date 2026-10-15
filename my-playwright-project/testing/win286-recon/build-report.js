// WIN286: build the self-contained HTML QA report (screenshots embedded as base64).
// Pass/fail matrix is the Playwright outcome of each run (2026-10-15); measurements come from results.jsonl.
// usage: node testing/win286-recon/build-report.js
const fs = require('fs');
const path = require('path');

const SHOTS = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'winkbeds', 'win286-screenshots');
const OUT = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2', 'win286-persistent-targeted-offer-qa-report.html');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = (f, cap) => {
  const p = path.join(SHOTS, f);
  if (!fs.existsSync(p)) return '';
  return `<figure><img src="data:image/png;base64,${fs.readFileSync(p).toString('base64')}" alt="${esc(cap)}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
};

// last record per (project, id) wins, so re-runs replace earlier rows
const last = new Map();
fs.readFileSync(path.join(SHOTS, 'results.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).forEach((r) => last.set(r.project + '|' + r.id, r));
const get = (p, id) => last.get(p + '|' + id) || {};

const B = ['Chrome Desktop', 'Safari Desktop', 'Mobile Chrome (Pixel 5)', 'Mobile Safari (iPhone 12)'];
const SHORT = ['Chrome', 'Safari', 'Pixel 5', 'iPhone 12'];
// P pass · F fail · S skipped / not applicable · X not verifiable (site popup blocked it)
const MATRIX = [
  ['TC-01', 'Control: modal unchanged, no new line, no badge after dismissal', 'FFFF', 'Control behaves correctly; fails only on the body class (cre-t-286-variation)'],
  ['TC-02', 'Variation: modal copy and new line under the CTA', 'PPPP'],
  ['TC-03', 'Dismiss (X) shows badge: text, slide-in 0.22s once, position', 'FFFF', 'Text, animation and cookie pass; position off spec (BUG-05)'],
  ['TC-04', 'Dismiss via overlay click shows badge', 'PPPP'],
  ['TC-05', 'Badge stays fixed while scrolling (homepage)', 'PPPP'],
  ['TC-06', 'Badge click reopens modal, badge hidden while open, back after re-dismiss', 'PPPP'],
  ['TC-07', 'Across pages: badge persists, no auto-reopen, no replayed animation', 'FFFF', 'Persists and never reopens; fails on the gap after each load (BUG-04)'],
  ['TC-08', 'Next session: badge returns, modal not auto-opened', 'PPPP'],
  ['TC-09', 'Mattress removed from cart: badge hides on the same page', 'PPPP'],
  ['TC-10', 'Ineligible cart (Frost variant / 2 WinkBeds / qty 2 / empty): no badge', 'PPPP', '4 cases per browser'],
  ['TC-11', 'CTA: cart upgraded to Frost, checkout, no badge afterwards', 'PPPP'],
  ['TC-12', 'Reduced motion: no slide-in', 'PPPP'],
  ['TC-13', 'Close icon mobile-only, 44×44, no overlap with reopen area', 'PPFF', 'BUG-03'],
  ['TC-14', 'Mobile close hides badge for the session, back next session', 'SSPP'],
  ['TC-15', 'Shop page: badge on top while scrolling the Buy Box', 'PPFF', 'BUG-02'],
  ['TC-16', 'Cart drawer opens over the badge', 'PPPX', 'iPhone: the site\'s timed popup (cre-wb-test-28) blocked the drawer twice'],
  ['TC-17', 'Goals fire: modal, CTA, badge click, badge close', 'FFFF', 'BUG-01'],
  ['TC-18', 'Keyboard: Enter on the badge reopens the modal', 'FFSS', 'BUG-06'],
  ['TC-19', 'Never-qualified visitor: no modal, no badge', 'PPPP'],
  ['TC-20', 'Cohort 2 (3-minute idle) fires, dismissal gives badge', 'PPPP', 'Passes only because the threshold is 2 minutes (LAUNCH-01)'],
];
const ICON = { P: '<span class="st p">Pass</span>', F: '<span class="st f">Fail</span>', S: '<span class="st s">n/a</span>', X: '<span class="st x">Blocked</span>' };
const weight = (id) => (id === 'TC-10' ? 4 : 1);
const tally = (i) => {
  const t = { P: 0, F: 0, S: 0, X: 0 };
  MATRIX.forEach(([id, , s]) => { t[s[i]] += weight(id); });
  return t;
};

// measurements
const fmt = (v, u = '') => (v === undefined || v === null ? '—' : v + u);
const measRows = B.map((p, i) => {
  const t3 = get(p, 'TC-03'), t7 = get(p, 'TC-07'), t13 = get(p, 'TC-13'), t20 = get(p, 'TC-20'), t2 = get(p, 'TC-02');
  const lags = (t7.rows || []).map((r) => r.lagAfterDcl).filter((v) => v !== null && v !== undefined);
  return `<tr><td>${SHORT[i]}</td><td class="n">${fmt(t2.secs, 's')}</td><td class="n">${fmt(t3.bottomGapPct, '%')}</td><td class="n">${t3.rect ? t3.rect[0] + 'px' : '—'}</td>
<td class="n">${lags.length ? Math.min(...lags) + '–' + Math.max(...lags) + 's' : '—'}</td><td class="n">${t13.closeVisible ? t13.closeRect[2] + '×' + t13.closeRect[3] + ', ' + t13.overlapPx + 'px²' : 'none'}</td><td class="n">${fmt(t20.secs, 's')}</td></tr>`;
}).join('\n');

const html = `<title>WIN286 Persistent Offer QA</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: single reading column; verdict + scoreboard first, bugs as severity-striped entries, evidence galleries, matrix last. */
:root{
  --bg:#f7fafb; --surface:#ffffff; --ink:#132a33; --muted:#566f78; --line:#d6e3e8;
  --frost:#2f7f9b; --frost-soft:#e4f1f5;
  --crit:#b3261e; --warn:#a15c00; --info:#3559b7; --ok:#1d7a46;
  --display:"Sora",ui-sans-serif,system-ui,sans-serif; --body:"Source Sans 3",ui-sans-serif,system-ui,sans-serif; --mono:"JetBrains Mono",ui-monospace,Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0d1a1f;--surface:#13252c;--ink:#e3eef2;--muted:#9ab3bc;--line:#24414b;--frost:#7cc4dc;--frost-soft:#173640;--crit:#ff8a80;--warn:#f2b866;--info:#9db4ff;--ok:#6fd49a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0d1a1f;--surface:#13252c;--ink:#e3eef2;--muted:#9ab3bc;--line:#24414b;--frost:#7cc4dc;--frost-soft:#173640;--crit:#ff8a80;--warn:#f2b866;--info:#9db4ff;--ok:#6fd49a;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:16px/1.6 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1040px;margin:0 auto;padding-block:32px 72px;display:flex;flex-direction:column;gap:12px}
h1,h2,h3{font-family:var(--display);text-wrap:balance;line-height:1.25;margin:0}
h1{font-size:30px;font-weight:700} h2{font-size:21px;font-weight:600;margin-top:28px;padding-bottom:6px;border-bottom:1px solid var(--line)} h3{font-size:17px;font-weight:600}
p{margin:0;max-width:72ch} .muted{color:var(--muted)}
.eyebrow{font:500 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--frost)}
code{font:13px var(--mono);background:var(--frost-soft);border-radius:4px;padding:1px 5px;word-break:break-word}
.verdict{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--crit);border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;gap:6px}
.score{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.score div{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px;font-variant-numeric:tabular-nums}
.score b{display:block;font:600 24px var(--display)} .score span{color:var(--muted);font-size:14px}
.bug{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;border-left:4px solid var(--crit)}
.bug.med{border-left-color:var(--warn)} .bug.low{border-left-color:var(--info)} .bug.launch{border-left-color:var(--frost)}
.bug ul{margin:0;padding-left:20px}
.sev{display:inline-block;font:600 11px/1.6 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:0 8px;border-radius:99px;border:1px solid currentColor;margin-right:8px;vertical-align:2px}
.sev.high{color:var(--crit)} .sev.med{color:var(--warn)} .sev.low{color:var(--info)} .sev.launch{color:var(--frost)}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;align-items:start}
.shots.wide{grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))}
figure{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px;min-width:0}
figure img{display:block;width:100%;height:auto;max-width:100%;border-radius:4px}
figcaption{font-size:13px;color:var(--muted);margin-top:6px}
.wrap{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}
th,td{border-bottom:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top}
th{font:600 12px var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
td.n,th.n{text-align:right;white-space:nowrap} td.c,th.c{text-align:center}
.st{display:inline-block;font:600 12px var(--mono);padding:1px 8px;border-radius:99px}
.st.p{color:var(--ok);background:color-mix(in srgb,var(--ok) 12%,transparent)} .st.f{color:var(--crit);background:color-mix(in srgb,var(--crit) 12%,transparent)}
.st.s{color:var(--muted)} .st.x{color:var(--warn);background:color-mix(in srgb,var(--warn) 12%,transparent)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.cols>div{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px;min-width:0}
.cols ul{margin:6px 0 0;padding-left:20px}
</style>
<main>
<span class="eyebrow">WinkBeds · WIN286 · Convert exp 100350738</span>
<h1>Persistent Targeted Offer: QA report</h1>
<p class="muted">Sitewide · all users · Control 1003184955 vs Variation 1003184956 · QA 2026-10-15 · Playwright on Chrome, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12). No code was supplied; it was extracted from the live Convert bundle (snapshot 10:39Z).</p>

<div class="verdict"><h3>Not launch-ready</h3>
<p>The badge flow follows the wireframe on every browser: dismiss, then badge; reopen; persistence across pages and sessions; hiding when the cart stops qualifying; no badge after accepting; reduced motion. The blockers are goal tracking (nothing usable fires for WIN286), the badge disappearing under the Buy Box on mobile, and three launch settings.</p></div>

<div class="score">
${B.map((p, i) => { const t = tally(i); return `<div><b>${t.P} / ${t.P + t.F}</b><span>${p} passed${t.S + t.X ? ` · ${t.S + t.X} not run` : ''}</span></div>`; }).join('\n')}
</div>

<h2>Bugs</h2>

<div class="bug"><h3><span class="sev high">High</span>BUG-01 · Goal tracking does not work for WIN286</h3>
<ul>
<li>The Variation pushes the modal-fire goal with an empty id: <code>_conv_q.push(["triggerConversion", ""])</code>. No Convert request carried a WIN286 goal id on any browser (TC-17).</li>
<li>The Control pushes <code>100334580</code>, which is WIN276's "modal fires" goal and isn't attached to exp 100350738. So neither arm records "WIN286 - Modal Fires".</li>
<li>"Clicks on Modal CTA", "Clicks on Sticky Badge" and "Clicks on Sticky Badge Close Icon (mobile)" have no code trigger and no click goal in the experiment. Only code goal <code>100334668</code> is attached, plus revenue, cart visit and Buy Box ATC.</li>
</ul>
<p><b>Fix:</b> create the four goals and attach them to 100350738. Push their ids from both arms (modal fire, CTA click) and from the Variation (badge click, badge close).</p></div>

<div class="bug"><h3><span class="sev high">High</span>BUG-02 · Mobile shop page: badge is hidden under the Buy Box</h3>
<p>The badge has <code>z-index: 99</code>, and on mobile the Buy Box sections paint over it as you scroll through them. <code>elementFromPoint</code> at the badge centre returns <code>.dummySelectFirmness</code>, <code>.order-form__loadup-container</code>, <code>.order-form__freeShipping</code> or <code>li.accessory-tray_item</code> (Pixel 5 at 600–1800px, iPhone 12 at 1800–3000px). That is exactly where the native Frost™ Cooling toggle sits, and the badge can't be seen or tapped there. Desktop is fine.</p>
<div class="shots">${img('Mobile_Chrome_Pixel_5___tc15-shop-buybox.png', 'Pixel 5, shop page scrolled 1200px: dismissed user with an eligible cart, badge should be on the left edge')}${img('Mobile_Safari_iPhone_12___tc03-badge.png', 'iPhone 12, homepage: the badge as it should look')}</div></div>

<div class="bug med"><h3><span class="sev med">Medium</span>BUG-03 · Mobile close icon overlaps the badge's reopen area</h3>
<p>The 44×44 close hit area (<code>top:-8px; right:-8px</code> on the rotated container) covers 36×36px (1296px²) of the badge itself. Tapping the lower end of the badge hits the close icon, which hides the badge for the session instead of reopening the offer. The wireframe says the close icon must not overlap the badge's reopen action. Seen on Pixel 5 and iPhone 12.</p>
<div class="shots">${img('Mobile_Chrome_Pixel_5___tc13-close-icon.png', 'Pixel 5: close icon at the lower right of the badge')}</div></div>

<div class="bug med"><h3><span class="sev med">Medium</span>BUG-04 · Badge vanishes for 2.6–4.3s on every page load</h3>
<p>The wireframe says to keep the badge in place while scrolling and across pages. The badge is only rendered after the activation deployment's <code>setTimeout(…, 3000)</code>, a cart fetch and Convert's <code>executeExperiment</code>, so on every navigation it is missing for several seconds after the page is usable. The measurements table below has the numbers. <b>Suggested fix:</b> for the badge cohort (<code>cre286_modal_dismissed=true</code>), render immediately from the cookie, then check <code>/cart.js</code> and remove the badge if the cart no longer qualifies.</p></div>

<div class="bug low"><h3><span class="sev low">Low</span>BUG-05 · Badge position doesn't match the wireframe</h3>
<p>The container is rotated 90° about its centre, so <code>bottom:20%</code> and <code>left:-75px</code> apply to the unrotated box. Measured: the badge's visual bottom sits <b>8.9–10.5%</b> above the viewport bottom instead of 20%. On desktop it starts at <b>x = −6.8px</b>, so its left edge and padding are clipped; on mobile it's −1.5px. Fix with <code>transform-origin</code>, or compute <code>bottom</code> from the rotated height.</p>
<div class="shots wide">${img('Chrome_Desktop__tc03-badge.png', 'Chrome 1280×720 after dismissing: badge bottom at 10.5%, left edge at −6.8px')}</div></div>

<div class="bug low"><h3><span class="sev low">Low</span>BUG-06 · Badge, close icon and CTA don't respond to the keyboard</h3>
<p>They have <code>role="button" tabindex="0"</code> but only <code>click</code> handlers, so Enter and Space do nothing (TC-18, Chrome and Safari).</p></div>

<div class="bug low"><h3><span class="sev low">Low</span>BUG-07 · Control adds the body class <code>cre-t-286-variation</code></h3>
<p>The Control code sets <code>variation_name</code> to "cre-t-286-variation". The behaviour is correct (no new line, no badge), but analytics and heatmap segments keyed on that class will mix both arms.</p></div>

<h2>Before launch</h2>
<div class="bug launch"><h3><span class="sev launch">Launch</span>LAUNCH-01 · "New session" threshold is 2 minutes</h3>
<p>Deployment 100350740 has <code>ONE_HOUR_MS = 2 * 60 * 1000</code>, and TC-20 confirms Cohort 2 opens after only a 3-minute idle. The live WIN276 deployment already uses 60 minutes. Set it back before launch.</p></div>
<div class="bug launch"><h3><span class="sev launch">Launch</span>LAUNCH-02 · Control is stopped (0% traffic)</h3>
<p>In the bundle, Control 1003184955 is <code>status: stopped, traffic 0</code> and the Variation gets 100%. The force URL still works for QA, but if it launches like this there is no A/B comparison. Confirm the split.</p></div>
<div class="bug launch"><h3><span class="sev launch">Launch</span>LAUNCH-03 · Pause WIN276 when WIN286 goes to all users</h3>
<p>WIN276 (100350628) is live with the audience "campaign does NOT contain Cro286mode", and its deployments 100350629/630 run for everyone. Once WIN286 drops the Cro286mode audience, both experiments qualify the same visitors with separate cookies (cre276_* and cre286_*), so a visitor can get two modals.</p></div>
<div class="bug launch"><h3><span class="sev launch">Launch</span>LAUNCH-04 · Cohort 2 still waits an extra 5s (carried over from WIN276)</h3>
<p>The Variation adds <code>setTimeout(5000)</code> after the activation's 3s wait, so Cohort 2 opens 9.6–10.5s after load. This is the same behaviour as WIN276 BUG-03, flagged here only because WIN286 inherits the existing modal targeting.</p></div>

<h2>Measurements</h2>
<div class="wrap"><table>
<tr><th>Browser</th><th class="n">Cohort 1 modal</th><th class="n">Badge bottom gap (spec 20%)</th><th class="n">Badge left edge</th><th class="n">Badge gap after DCL, 3 pages</th><th class="n">Close icon, overlap</th><th class="n">Cohort 2 modal (3-min idle)</th></tr>
${measRows}
</table></div>

<h2>What works</h2>
<div class="cols">
<div><h3>Modal</h3><ul><li>The copy matches the wireframe, and the new line "Not ready? Close this offer. Reopen it from the side of your screen." is centred under the CTA on all browsers.</li><li>Control shows the unchanged WIN276 modal and no badge.</li><li>Accepting swaps the cart line to "Twin with Frost Cooling Cover", redirects to checkout with FROST8UYR31, and no badge appears afterwards.</li></ul></div>
<div><h3>Badge</h3><ul><li>Appears after closing with X or the overlay. The slide-in takes 0.22s, plays the first time only, and is skipped with reduced motion.</li><li>Clicking it reopens the modal and the badge hides while the modal is open. It returns on re-dismiss, and the modal-fire goal isn't counted again.</li><li>Persists across pages and into a new session, and the modal never reopens automatically.</li><li>Hides immediately when the mattress is removed. A Frost variant, two WinkBeds, qty 2 or an empty cart all give no badge.</li><li>The mobile close hides it for the session and it returns next session. Desktop has no close icon.</li></ul></div>
</div>
<div class="shots">${img('Chrome_Desktop__tc02-variation-modal.png', 'Variation modal with the new line under the CTA (Chrome)')}${img('Chrome_Desktop__tc06-reopened.png', 'Reopened from the badge; badge hidden while the modal is open')}${img('Chrome_Desktop__tc16-cart-drawer.png', 'Cart drawer overlay correctly covers the badge (Chrome)')}${img('Mobile_Safari_iPhone_12___tc02-variation-modal.png', 'Variation modal, iPhone 12')}</div>

<h2>Results matrix</h2>
<div class="wrap"><table>
<tr><th>Case</th><th>Check</th>${SHORT.map((s) => `<th class="c">${s}</th>`).join('')}<th>Note</th></tr>
${MATRIX.map(([id, t, s, note]) => `<tr><td><code>${id}</code></td><td>${esc(t)}</td>${[...s].map((c) => `<td class="c">${ICON[c]}</td>`).join('')}<td class="muted">${esc(note || '')}</td></tr>`).join('\n')}
</table></div>

<h2>How this was tested</h2>
<p class="muted">The spec is <code>testing/win286-persistent-targeted-offer.spec.js</code> (20 cases, 23 checks per browser) and the bundle extractor is <code>testing/win286-recon/extract.js</code>. Each case seeds a real production cart (Luxury Firm Twin) and the WIN286 cookies in a fresh browser context, then loads the force URL. "Next session" means a new context that keeps only persistent cookies. Goal pushes were captured by wrapping <code>window._conv_q</code>. On iPhone 12 the site's own timed popup (cre-wb-test-28) blocked the cart-drawer check twice, so that case is unverified there.</p>
</main>
`;
fs.writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1048576).toFixed(1) + 'MB');
