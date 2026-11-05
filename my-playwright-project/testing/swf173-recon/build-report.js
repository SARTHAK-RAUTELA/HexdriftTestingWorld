// Builds the self-contained SWF173 QA report (screenshots embedded as base64).
const fs = require('fs');
const path = require('path');
const KB = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'pet-insurance-gurus');
const SS = path.join(KB, 'swf173-screenshots');
const SCR = 'C:/Users/SARTHA~1/AppData/Local/Temp/claude/34c241cda7efc078/7f43f781-57f8-4fbc-9b7d-338a94a3cf9e/scratchpad/swf173-frames';
const img = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const fig = (p, cap) => `<figure><img src="${img(p)}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
const C = (f) => path.join(SS, 'chrome-desktop', f);
const S = (f) => path.join(SS, 'safari-desktop', f);

const bugs = [
  {
    id: 'BUG-01', sev: 'high', title: 'Duplicated price does not follow the Cats / Dogs tabs',
    where: 'All targeted URLs · Chrome + Safari · also visible in the client\'s own screen recording',
    body: `<p>The site changes every listing's Average Plan Cost when a pet-type tab is clicked. The new price above the button keeps the All Pets figure, so the two prices in the same card disagree.</p>
<table><thead><tr><th>Partner</th><th>Cats — left column</th><th>Cats — SWF173</th><th>Dogs — left column</th><th>Dogs — SWF173</th></tr></thead><tbody>
<tr><td>Lemonade</td><td>$14.65/mo</td><td class="bad">$20.28/mo</td><td>$22.76/mo</td><td class="bad">$23.44/mo</td></tr>
<tr><td>ASPCA</td><td>$15.95/mo</td><td class="bad">$34.22/mo</td><td>$38.79/mo</td><td class="bad">$39.56/mo</td></tr>
<tr><td>Fetch</td><td>$17.84/mo</td><td class="bad">$42.49/mo</td><td>$42.49/mo</td><td class="bad">$49.12/mo</td></tr>
<tr><td>Trupanion</td><td>$34.49/mo</td><td class="bad">$92.15/mo</td><td>$106.57/mo</td><td class="bad">$106.53/mo</td></tr>
</tbody></table>
<p>On Dogs the duplicated figure is sometimes the <em>pre-discount</em> price hidden by CRE-T-143 ($23.44 is Lemonade's original All Pets price), and sometimes the stale All Pets price ($20.28). Both are wrong. Returning to All Pets lines the prices up again.</p>
<p><strong>Cause:</strong> <code>addPriceToCard()</code> exits when a card already has <code>.SWF173-price</code>, so a card is priced once and never refreshed. When the React list re-renders a card while the observer is still running, the price is re-read from <code>.plan-detail-content</code> <code>textContent</code>, which still includes CRE-T-143's hidden original span, and the regex takes that first, hidden number.</p>`,
    figs: [[C('tab-cats-card1.png'), 'Chrome · Cats tab: left $14.65/mo, duplicated $20.28/mo'], [S('tab-dogs-card1.png'), 'Safari · Dogs tab: left $22.76/mo, duplicated $20.28/mo']],
  },
  {
    id: 'BUG-02', sev: 'high', title: 'After a ZIP is entered, cards show stale prices, some belonging to another insurer',
    where: '/ · Chrome + Safari · ZIP 90210 typed into "Enter Zip Code"',
    body: `<p>Entering a ZIP re-prices and re-orders the list in place. The injected price nodes stay where they were, so they no longer match. After the re-order they also end up in a different insurer's card:</p>
<table><thead><tr><th>Card (after ZIP)</th><th>Left column</th><th>SWF173 price</th></tr></thead><tbody>
<tr><td>Lemonade</td><td>$30.32/mo</td><td class="bad">$20.28/mo</td></tr>
<tr><td>Embrace</td><td>$29.15/mo</td><td class="bad">$34.22/mo (ASPCA's old price)</td></tr>
<tr><td>ASPCA</td><td>$38.07/mo</td><td class="bad">$42.49/mo (Fetch's old price)</td></tr>
<tr><td>Fetch</td><td>$70.55/mo</td><td class="bad">$44.87/mo (Embrace's old price)</td></tr>
<tr><td>Trupanion</td><td>$173.33/mo</td><td class="bad">$92.15/mo</td></tr>
</tbody></table>
<p>This is the most user-visible failure: a visitor who enters a ZIP sees two different prices in the same card, and one of them belongs to a competitor.</p>`,
    figs: [[C('zip-late-card1.png'), 'Chrome · after ZIP 90210: left $30.32/mo, duplicated $20.28/mo']],
  },
  {
    id: 'BUG-03', sev: 'medium', title: 'Show More cards get no price if clicked about 17s or more after load',
    where: 'All URLs with Show More · Chrome + Safari',
    body: `<p>The observer starts 2s after the code runs and disconnects 15s later. Cards 8–10 (Liberty Mutual, Odie, AKC) only mount when Show More is clicked, so a late click reveals cards with no price above the button. A click within the window works (passed in both browsers).</p>
<p><strong>Fix:</strong> keep a lightweight observer on the listing container for the life of the page (or re-run on Show More / tab / filter clicks), and re-sync every card's price instead of skipping cards that already have one.</p>`,
    figs: [[C('showmore-late-card.png'), 'Chrome · Odie after a late Show More: no price above VIEW PLANS']],
  },
  {
    id: 'BUG-04', sev: 'medium', title: 'Best Overall card has no price on /comparison/ and /canada/',
    where: '/comparison/ (Pets Best, $28.79/mo) · /canada/ (Fetch, $85.89/mo) · Chrome + Safari',
    body: `<p>On these two pages the Best Overall card sits in <code>.best-overall-container</code>, outside <code>.plan-repeater</code>, so <code>CTA_SELECTOR</code> never matches it. On <code>/</code>, <code>/home/</code>, <code>/compare/</code> and <code>/cat-insurance/</code> the Best Overall card does get the price, so the treatment is inconsistent between pages. The brief says "each listing's button". Drop the <code>.plan-repeater</code> prefix from the selector, or confirm with the client that Best Overall is out of scope.</p>`,
    figs: [],
  },
  {
    id: 'BUG-05', sev: 'low', title: 'Race with CRE-T-143 can show the pre-discount price on first paint',
    where: '/?petType=cat · Chrome · intermittent (1 of 2 loads)',
    body: `<p>On one direct landing the duplicated prices were the CRE-T-143 originals ($16.94, $18.44, $20.63…) while the left column showed the discounted figures ($14.65, $15.95, $17.84…). A second load was correct. When SWF173 runs before CRE-T-143 has added <code>.cre-t-143-discounted-price</code>, the fallback reads the original price, and BUG-01's "price once, never refresh" logic means it is never corrected. Reading only visible child spans (see the PIG client notes on CRE-T-116/143) and re-syncing on mutation fixes this along with BUG-01.</p>`,
    figs: [],
  },
  {
    id: 'BUG-06', sev: 'low', title: '"/mo" is the same size as the amount; wireframe shows a larger amount and a smaller "/mo"',
    where: 'Design · all pages · Chrome + Safari',
    body: `<p>Live: amount 18px / 700 and <code>.SWF173-mo</code> 18px / 700 (no rule for it in vB.css). In the wireframe the dollar figure is noticeably larger than the left-column price and "/mo" is set smaller and lighter. Label (12px, #8C8EA0, uppercase, Montserrat 500) matches the wireframe.</p>`,
    figs: [[path.join(SCR, 'wf-price.png'), 'Wireframe · large $20.28 with small /mo'], [C('variation_card1.png'), 'Live variation · $20.28/mo at one size']],
  },
];

const passes = [
  ['Price added above VIEW PLANS on every visible card', 'All 6 URLs', 'Pass'],
  ['Duplicated price equals the visible left-column price on load', '/ · /home/ · /compare/ · /cat-insurance/ · /comparison/ · /canada/', 'Pass (except Best Overall, BUG-04)'],
  ['Reads the CRE-T-143 discounted price, not the hidden original', 'All Pets load', 'Pass'],
  ['Right column vertically centred in the listing', '1024 · 1280 · 1440 · 1920px', 'Pass: 0px offset on every card'],
  ['Price stays on one line, no new overflow', '1024–1920px', 'Pass (the 2px overflow on /comparison/ and /canada/ is native, present in control)'],
  ['Control has no SWF173 markup or body class', 'All 6 URLs', 'Pass'],
  ['CTA hrefs and order identical to control', '/', 'Pass'],
  ['No duplicate prices when code runs twice more', '/', 'Pass (Chrome)'],
  ['Show More clicked early', '/', 'Pass'],
  ['Cats → All Pets round-trip', '/', 'Pass (Chrome)'],
  ['Mobile device not bucketed (desktop only)', 'Pixel 5 emulation', 'Pass (Chrome); Safari not run'],
  ['No SWF173 JavaScript errors', 'All pages', 'Pass'],
];

const html = `<title>SWF173 Price Above Button QA</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* Layout: single reading column, verdict strip, then bug cards with evidence, then coverage table */
:root{
  --bg:#f6f7fb; --surface:#ffffff; --ink:#15182a; --muted:#5d6178; --line:#dfe2ee;
  --accent:#0272e4; --high:#c2272d; --high-bg:#fdecec; --med:#a85c00; --med-bg:#fff3e0; --low:#4a5a7a; --low-bg:#eceff6; --ok:#1d7a46; --ok-bg:#e6f5ec;
  --display:"Montserrat",Arial,sans-serif; --body:"Source Sans 3","Segoe UI",sans-serif; --mono:"JetBrains Mono",Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#11131d;--surface:#1a1d2b;--ink:#e8eaf4;--muted:#a0a5bd;--line:#2c3045;--accent:#5aa6ff;--high:#ff7a7f;--high-bg:#3a1c20;--med:#ffb760;--med-bg:#36280f;--low:#b3bfdc;--low-bg:#242a3c;--ok:#5fd394;--ok-bg:#16301f;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#11131d;--surface:#1a1d2b;--ink:#e8eaf4;--muted:#a0a5bd;--line:#2c3045;--accent:#5aa6ff;--high:#ff7a7f;--high-bg:#3a1c20;--med:#ffb760;--med-bg:#36280f;--low:#b3bfdc;--low-bg:#242a3c;--ok:#5fd394;--ok-bg:#16301f;color-scheme:dark}
body{background:var(--bg);color:var(--ink);font:17px/1.55 var(--body)}
.wrap{max-width:960px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:40px 64px;display:grid;gap:32px}
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0}
h1{font-size:1.9rem;font-weight:700;letter-spacing:-.01em}
h2{font-size:1.25rem;font-weight:700}
h3{font-size:1.05rem;font-weight:600}
.eyebrow{font:600 .75rem/1 var(--display);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
header{display:grid;gap:10px}
.meta{display:flex;flex-wrap:wrap;gap:6px 20px;color:var(--muted);font-size:.95rem}
.meta code,code{font:.85em var(--mono);background:var(--low-bg);padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
.verdict{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 16px;display:grid;gap:4px}
.tile b{font:700 1.6rem/1 var(--display);font-variant-numeric:tabular-nums}
.tile span{color:var(--muted);font-size:.9rem}
.summary{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px 20px}
.summary p{margin:0;max-width:68ch}
.bugs{display:grid;gap:20px}
.bug{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:20px;display:grid;gap:10px;min-width:0}
.bug-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.pill{font:700 .72rem/1 var(--display);letter-spacing:.06em;text-transform:uppercase;padding:5px 8px;border-radius:999px}
.pill.high{color:var(--high);background:var(--high-bg)} .pill.medium{color:var(--med);background:var(--med-bg)} .pill.low{color:var(--low);background:var(--low-bg)}
.id{font:600 .85rem var(--mono);color:var(--muted)}
.where{color:var(--muted);font-size:.92rem;margin:0}
.bug p{margin:0;max-width:72ch}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:.93rem;font-variant-numeric:tabular-nums}
th,td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font:600 .75rem var(--display);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
td.bad{color:var(--high);font-weight:600}
td.ok{color:var(--ok);font-weight:600}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
figure{margin:0;display:grid;gap:6px;min-width:0}
figure img{border:1px solid var(--line);border-radius:6px;background:#fff;width:100%}
figcaption{font-size:.85rem;color:var(--muted)}
.gaps li{margin-bottom:6px}
section{display:grid;gap:14px;min-width:0}
</style>
<div class="wrap">
<header>
  <div class="eyebrow">The Swiftest · Pet Insurance Gurus · QA report</div>
  <h1>SWF173 — Price Above Button (Desktop)</h1>
  <div class="meta">
    <span>Tested 5 Nov 2026</span><span>Convert exp <code>100053060</code></span><span>Control <code>1000257881</code> · Variation <code>1000257882</code></span><span>Chrome + Safari (WebKit) desktop</span>
  </div>
</header>

<div class="verdict">
  <div class="tile"><b style="color:var(--high)">Not ready</b><span>Launch verdict</span></div>
  <div class="tile"><b>2 high</b><span>stale and wrong-insurer prices</span></div>
  <div class="tile"><b>2 med · 2 low</b><span>coverage and design</span></div>
  <div class="tile"><b>19 / 27</b><span>Chrome checks passed</span></div>
</div>

<div class="summary"><p>On a fresh All Pets load the variation matches the wireframe. Every listing gets an "Average Plan Cost" price above VIEW PLANS, the figure matches the card, and the right column is centred to the pixel at 1024–1920px on all six URLs. The problem is that the price is written once and never updated. Clicking Cats or Dogs, entering a ZIP, or clicking Show More after the first ~17 seconds leaves cards with a wrong or missing price, and after a ZIP some cards show another insurer's price. These are the site's main interactions, so the price is wrong for many real visitors.</p></div>

<section>
<h2>Bugs</h2>
<div class="bugs">
${bugs.map(b => `<article class="bug">
  <div class="bug-head"><span class="pill ${b.sev}">${b.sev}</span><span class="id">${b.id}</span><h3>${b.title}</h3></div>
  <p class="where">${b.where}</p>
  ${b.body.replace(/<table>/g, '<div class="scroll"><table>').replace(/<\/table>/g, '</table></div>')}
  ${b.figs.length ? `<div class="figs">${b.figs.map(f => fig(f[0], f[1])).join('')}</div>` : ''}
</article>`).join('\n')}
</div>
</section>

<section>
<h2>What passed</h2>
<div class="scroll"><table><thead><tr><th>Check</th><th>Scope</th><th>Result</th></tr></thead><tbody>
${passes.map(p => `<tr><td>${p[0]}</td><td>${p[1]}</td><td class="ok">${p[2]}</td></tr>`).join('')}
</tbody></table></div>
<div class="figs">${fig(C('control_card1.png'), 'Control · /')}${fig(C('variation_card1.png'), 'Variation · / (All Pets) — correct on load')}</div>
</section>

<section>
<h2>Coverage gaps</h2>
<ul class="gaps">
<li><strong>Safari run incomplete.</strong> The system stopped the WebKit run for low memory after 26 of 27 tests, before results were saved. The Safari screenshots confirm BUG-01, BUG-02, BUG-03 and BUG-04. Eight Safari tests hit the 60s page-load limit (/, /compare/ control, 1024px, 1920px, re-run, Cats, ?petType=cat, round-trip), so they are inconclusive, not failures. The Safari mobile-audience check did not run.</li>
<li><strong>Video has no audio track.</strong> All 47 seconds were reviewed frame by frame. It shows BUG-01 on the Cats and Dogs tabs.</li>
<li>Headless WebKit renders all text, the site's own included, in a lighter weight. This is an environment effect, not a variation defect.</li>
<li>Edge and Firefox were not requested and not run.</li>
</ul>
</section>

<section>
<h2>Suggested fix (one change covers BUG-01, 02, 03, 05)</h2>
<p style="margin:0;max-width:72ch">Replace "insert once, skip if present" with a sync: on every mutation of the listing container (keep the observer alive; it is cheap when debounced), for each <code>.plan-box</code> read the visible left price (<code>.cre-t-143-discounted-price</code>, otherwise only child spans whose computed <code>display</code> is not <code>none</code>), then create or update that card's <code>.SWF173-amount</code>. Drop the <code>.plan-repeater</code> prefix from the selector for BUG-04. Add <code>.SWF173-mo{font-size:…;font-weight:500}</code> and raise the amount size for BUG-06.</p>
</section>
</div>`;

const out = path.join(KB, 'swf173-price-above-button-qa-report.html');
fs.writeFileSync(out, html);
console.log(out, (fs.statSync(out).size / 1024 / 1024).toFixed(2) + ' MB');
