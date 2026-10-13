// WIN283: build the self-contained HTML QA report (screenshots embedded as base64)
// usage: node testing/win283-recon/build-report.js
const fs = require("fs");
const path = require("path");

const SHOTS = path.join(__dirname, "..", "..", "qa-knowledge-base", "winkbeds", "win283-screenshots");
const OUT = path.join(__dirname, "..", "..", "..", "local_testing", "Local2", "win283-shop-subtotal-v3-qa-report.html");
const img = (f, cap) => {
  const p = path.join(SHOTS, f);
  if (!fs.existsSync(p)) return "";
  return `<figure><img src="data:image/png;base64,${fs.readFileSync(p).toString("base64")}" alt="${cap}"><figcaption>${cap}</figcaption></figure>`;
};

const P = "✅", F = "❌", N = "—", S = "⚠️";
const rows = [
  // TC, desc, chrome c/v1/v2, safari c/v1/v2
  ["TC-01", "Line copy, layout and button copy match wireframe", [P, P, P], [P, P, N]],
  ["TC-02", "Default math: total = price; strike = pre-savings price; saving = strike − total", [P, P, P], [S, P, N]],
  ["TC-03", "Styling (white 600 line, green saving, strike 60% white line-through, +2px, font)", [P, F, F], [P, F, N]],
  ["TC-04", "Add/remove Platform Frame (+$499): count, total, strike update; saving unchanged", [P, S, P], [P, P, N]],
  ["TC-05", "Size Queen → King re-prices line and V2 button", [P, P, P], [S, S, N]],
  ["TC-06", "Mattress Setup &amp; Removal tier: +$225 total, saving +$75", [P, P, P], [S, S, N]],
  ["TC-07", "Add to Cart adds exactly 1 mattress; line keeps showing selection", [P, S, S], [P, S, N]],
  ["TC-08", "Line &amp; button fit (no overflow, ≤2 lines) with WinkBase added", [P, P, P], [P, S, N]],
  ["TC-09", "No cre-t-283 console/page errors", [P, P, P], [P, S, N]],
  ["TC-10", "No-discount edge: no bogus strike / “Saving $0” / “SAVE $0”", [N, F, F], [N, N, N]],
  ["TC-11", "5 fresh loads: saving never stale $0 / mismatched", [P, P, P], [N, N, N]],
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WIN283 QA Report</title>
<style>
:root{--bg:#fff;--fg:#1a1d29;--muted:#5b6170;--card:#f5f6f9;--line:#e1e4ea;--red:#c0392b;--amber:#b7791f;--green:#1e8e3e;--blue:#2457c5}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#12141b;--fg:#e8eaf0;--muted:#a3a9b8;--card:#1c1f29;--line:#2c3040;--red:#ff7b6b;--amber:#f0b44c;--green:#5ccf7d;--blue:#7ea6ff}}
:root[data-theme=dark]{--bg:#12141b;--fg:#e8eaf0;--muted:#a3a9b8;--card:#1c1f29;--line:#2c3040;--red:#ff7b6b;--amber:#f0b44c;--green:#5ccf7d;--blue:#7ea6ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}h1{font-size:26px;margin:0 0 4px}h2{font-size:19px;margin:36px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}h3{font-size:16px;margin:20px 0 6px}
.muted{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:16px 0}
.stat{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}.stat b{display:block;font-size:22px}
table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}th{background:var(--card)}td.c{text-align:center}
.wrap{overflow-x:auto}.bug{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--red);border-radius:8px;padding:12px 14px;margin:14px 0}
.bug.med{border-left-color:var(--amber)}.bug.low{border-left-color:var(--blue)}.bug.obs{border-left-color:var(--muted)}
.tag{display:inline-block;font-size:12px;font-weight:600;padding:1px 8px;border-radius:99px;border:1px solid currentColor;margin-right:6px}
.tag.med{color:var(--amber)}.tag.low{color:var(--blue)}.tag.obs{color:var(--muted)}
code{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:13px;word-break:break-word}
figure{margin:10px 0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:13px;color:var(--muted);margin-top:6px}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}ul{padding-left:20px}
</style></head><body><main>
<h1>WIN283 — Shop Page · Select Sub-Total V3</h1>
<p class="muted">WinkBeds · <code>/pages/shop-winkbed</code> · cre-t-283 · Convert exp 100350737 · All users · QA run 2026-10-13 · Chrome + Safari (Playwright Chromium / WebKit, desktop)</p>

<div class="grid">
<div class="stat"><b>25 / 32</b>Chrome Desktop passed</div>
<div class="stat"><b>9 / 18</b>Safari Desktop passed (run cut short, see coverage)</div>
<div class="stat"><b>2</b>Medium bugs</div>
<div class="stat"><b>2</b>Low bugs + 2 questions</div>
</div>

<h2>Summary</h2>
<ul>
<li><b>Core behaviour works on all three arms.</b> Copy matches the wireframe, and the default math checks out: $1,799 total, <s>$2,570</s>, Saving $771, and V2 shows “ADD TO CART · SAVE $771”. Size changes, accessories and the Setup/Removal tier all re-price the line and the V2 button live. Add to Cart adds exactly one mattress, including through V2's cloned button. No cre-t-283 errors.</li>
<li><b>BUG-01 (Medium):</b> V1/V2 have no guard when there's no compare price. They render a strike price <i>lower</i> than the total plus “Saving $0”, and V2 shows “ADD TO CART · SAVE $0”.</li>
<li><b>BUG-02 (Medium):</b> the V1/V2 line and the V2 button force the <code>Inter</code> font, which the site never loads. They fall back to Helvetica Neue/Arial instead of the site font <code>greycliff-cf</code> that control uses. The wireframe only asks for +2px.</li>
<li><b>BUG-03 (Low):</b> the V1/V2 preview links you were given open greenbuildingsupply.com, a different client. The working links are below.</li>
</ul>

<h2>Preview links (corrected)</h2>
<table><tr><th>Arm</th><th>Working URL</th><th>Local code</th></tr>
<tr><td>Control (WIN266 V2)</td><td><code>https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&amp;_conv_eforce=100350737.1003184952</code></td><td>vB.js / vB.css</td></tr>
<tr><td>V1</td><td><code>https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&amp;_conv_eforce=100350737.1003184953</code></td><td>v2.js / v2.css</td></tr>
<tr><td>V2</td><td><code>https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&amp;_conv_eforce=100350737.1003184954</code></td><td>va3.js / va3.css</td></tr></table>
<p class="muted">The V1/V2 IDs were confirmed by matching the live DOM against the local files: V1 has the struck-through price, and V2 adds the cloned <code>.cre-t-283-add-btn</code>.</p>

<h2>Results matrix</h2>
<p class="muted">✅ pass · ❌ fail (real bug) · ⚠️ failed in the run but traced to test environment or an inherited issue (see notes) · — not run / not applicable</p>
<div class="wrap"><table>
<tr><th>TC</th><th>Scenario</th><th>Chrome<br>Control</th><th>Chrome<br>V1</th><th>Chrome<br>V2</th><th>Safari<br>Control</th><th>Safari<br>V1</th><th>Safari<br>V2</th></tr>
${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td>${r[2].concat(r[3]).map((x) => `<td class="c">${x}</td>`).join("")}</tr>`).join("\n")}
</table></div>
<h3>Notes on the ⚠️ cells</h3>
<ul>
<li><b>TC-07 Chrome V1/V2, Safari V1:</b> a WinkBeds timed popup (<code>cre-wb-test-28-overlay</code>, “We get it. You want to try your mattress…”) covered the button, so the forced click hit the overlay. A separate re-check with no popup showed V1 → cart 1, V2 → cart 1. Each made a single <code>/cart/update.js {"updates":{"33210297618":1}}</code>, so the V2 clone does <b>not</b> double-add.</li>
<li><b>TC-04 Chrome V1:</b> the “before” read caught “Saving $0” because cre-t-202's “Was $2,570” badge hadn't populated yet. That's the stale-$0 race documented on WIN266, inherited by all arms. It corrected itself after the accessory click. TC-11 (15 fresh loads on Chrome) showed 0 mismatches.</li>
<li><b>Safari control TC-02/05/06 and V1 TC-05/06:</b> in Playwright WebKit sessions the site's own price box stayed empty (“Was $ $”), so cre-t-202's strike badge had no value. Control then showed “Saving $0”, and V1 showed the BUG-01 symptom naturally. This is WebKit-on-Windows rendering, <b>not confirmed on real Safari</b>.</li>
<li><b>Safari V1 TC-08/09 and all V2:</b> the run was stopped by the OS for low memory after a WebKit page hung, so V2 on Safari was not covered.</li>
</ul>

<h2>Bugs</h2>

<div class="bug med"><span class="tag med">Medium</span><b>BUG-01: V1/V2 show a strike price lower than the total and “Saving $0” / “SAVE $0” when there's no compare price</b>
<p><b>Where:</b> <code>strikeTotal()</code> in v2.js and va3.js. It sums <code>.cre-t-202-box-strike-price</code> (another test's “Was $X” badge), <code>.order-form__loadup-button-compare-price</code> and the accessories' sale prices, with no check that a compare price exists. The strike is always rendered, and V2 always appends “· SAVE $X” to the button.</p>
<p><b>Repro (Chrome, deterministic):</b> open V1 or V2 → cre-t-202 badge removed/absent → tick Platform Frame. The line reads <code>2 items selected · $2,298 total <s>$499</s> · Saving $0</code> and the V2 button reads <code>ADD TO CART · SAVE $0</code>.</p>
<p><b>Seen naturally (WebKit):</b> <code>1 item selected · $1,799 total <s>$0</s> · Saving $0</code> and, after adding Setup &amp; Removal, <code>2 items selected · $2,024 total <s>$300</s> · Saving $0</code>.</p>
<p><b>Why it matters:</b> the cre-t-202 price test can be paused, ended or slow to load. WIN283 then shows a nonsensical struck-through price and advertises “SAVE $0” on the main CTA. Control only degrades to “Saving $0”.</p>
<p><b>Suggested fix:</b> render the <code>.strike</code> span only when <code>strike &gt; total</code>. Drop “· Saving $X” and V2's “· SAVE $X” when saving is 0. Optionally, fall back to the native price box's compare-at price instead of the cre-t-202 badge.</p>
<div class="shots">${img("v2-no-discount-chrome-desktop.png", "V2 Chrome: no compare price → strike $499 < $2,298 total, Saving $0, SAVE $0")}${img("v1-setup-safari-desktop.png", "V1 WebKit: cre-t-202 badge empty → “$2,024 total $300 (struck) · Saving $0”")}</div>
</div>

<div class="bug med"><span class="tag med">Medium</span><b>BUG-02: V1/V2 line and V2 button use a font that isn't loaded (Inter → falls back to Helvetica Neue/Arial)</b>
<p>v2.css and va3.css set <code>font-family: "Inter","Helvetica Neue",Arial,sans-serif !important</code> on <code>.cre-t-283-subtotal-line</code> and <code>.cre-t-283-add-btn</code>. <code>document.fonts</code> has no Inter face on winkbeds.com, so it renders in a fallback system font. Control and every other Buy Box element use <code>greycliff-cf</code>.</p>
<table><tr><th></th><th>Control</th><th>V1/V2 actual</th><th>Expected (wireframe)</th></tr>
<tr><td>Line font-family</td><td>greycliff-cf</td><td>Inter → Helvetica Neue/Arial</td><td>site font (greycliff-cf)</td></tr>
<tr><td>Line font-size</td><td>13.2px</td><td>15px</td><td>+2px ≈ 15.2px (close enough)</td></tr>
<tr><td>V2 button font</td><td>greycliff-cf 18px (native)</td><td>Inter → Arial 16.7px, letter-spacing 2.8px</td><td>same style as the native button, longer copy</td></tr></table>
<p><b>Fix:</b> remove the font-family overrides (inherit). If “ADD TO CART · SAVE $771” needs to fit on mobile, reduce letter-spacing only.</p>
<div class="shots">${img("v2-default-chrome-desktop.png", "V2 Chrome: line and button visibly in Arial, not the site font")}${img("control-default-chrome-desktop.png", "Control Chrome: greycliff-cf")}</div>
</div>

<div class="bug low"><span class="tag low">Low</span><b>BUG-03: client-supplied V1/V2 preview links point to the wrong site</b>
<p><code>https://www.greenbuildingsupply.com/?cro_mode=qa&amp;_conv_eforce=100052955.1000257634</code> (and <code>…635</code>) loads Green Building Supply's homepage (body class <code>cre-t-13-manual-activation</code>, no <code>#orderForm</code>, no cre-t-283). Use the corrected WinkBeds links above.</p></div>

<div class="bug low"><span class="tag low">Low</span><b>BUG-04: no real space between “total” and the struck-through price</b>
<p>The markup is <code>$1,799 total&lt;strong class="strike"&gt;$2,570&lt;/strong&gt;</code>: the gap is only <code>padding-left:3px</code>, and the strike is nested inside the bold “total” &lt;strong&gt;. Visually it's tighter than the wireframe's word space. Screen readers and copy-paste get “$1,799 total$2,570”. Fix: <code>total&lt;/strong&gt; &lt;s class="strike"&gt;$2,570&lt;/s&gt;</code>.</p></div>

<h2>Questions for the client</h2>
<div class="bug obs"><span class="tag obs">Question</span><b>Q1: should accessory and cooling-fabric discounts count toward “Saving”?</b>
<p>In some loads (other live tests, e.g. cre-t-275) the accessories and Frost Cooling Fabric show compare prices, e.g. “Platform Frame <s>$700</s> $499” and “<s>$175</s> $125”. The cre-t-283 savings only include the mattress (cre-t-202 badge) and the Setup/Removal compare price. Adding Platform Frame raises the strike by +$499, and the saving stays $771 rather than $972. The code comment assumes “Accessories have no strike price”. Control (WIN266 logic) behaves the same, so this isn't a variation regression, but V1/V2 now show the strike explicitly.</p></div>
<div class="bug obs"><span class="tag obs">Note</span><b>Q2: button item-count copy</b>
<p>Control and V1 change the native button to “ADD N ITEMS TO CART” when more than one item is selected; this is native site behaviour, as noted on WIN266. V2 replaces it with “ADD TO CART · SAVE $X” and drops the item count. That matches the wireframe; flagging it so the change is intentional.</p></div>

<h2>What passed (Chrome)</h2>
<ul>
<li>Copy: control “1 item selected · $1,799 total · Saving $771”. V1/V2 add “<s>$2,570</s>”. V2 button: “ADD TO CART · SAVE $771”.</li>
<li>Strike style: rgba(255,255,255,.6), line-through, weight 400. Saving: #22C55E. Line: white, 600. Nothing overflows, and the line stays on one line even with WinkBase added.</li>
<li>King: $2,199 total <s>$3,141</s> · Saving $942 / SAVE $942.</li>
<li>Setup &amp; Removal ($300→$225): $2,024 total <s>$2,870</s> · Saving $846 / SAVE $846 (+$75 correctly added).</li>
<li>Platform Frame: count 2, total $2,298, strike $3,069, saving unchanged; unticking reverts exactly.</li>
<li>After Add to Cart the line still shows the current selection, not the cart contents (per spec, like WIN266).</li>
<li>15 fresh loads (5 per arm): 0 stale “Saving $0” or mismatches.</li>
</ul>

<h2>Coverage &amp; caveats</h2>
<ul>
<li>Browsers: Playwright Chromium (Chrome Desktop) full; Playwright WebKit (Safari Desktop) control + V1 partial. V2 on Safari and real-device Safari (macOS/iOS) were <b>not</b> covered. Recommend a quick manual pass on a real Mac/iPhone, especially V2's button and BUG-01.</li>
<li>Mobile viewports weren't run this round (memory limits).</li>
<li>Spec: <code>my-playwright-project/testing/win283-shop-subtotal-v3.spec.js</code>. Raw results: <code>qa-knowledge-base/winkbeds/win283-results/</code>.</li>
</ul>

<h2>Wireframe vs live</h2>
<div class="shots">${img("wireframe.png", "Wireframe (Group 5.png)")}${img("v1-default-chrome-desktop.png", "V1 live, Chrome")}${img("v2-king-chrome-desktop.png", "V2 live, King size")}${img("v2-setup-chrome-desktop.png", "V2 live, Setup &amp; Removal added")}${img("control-platform-frame-chrome-desktop.png", "Control, Platform Frame added")}${img("v1-platform-frame-safari-desktop.png", "V1 WebKit, Platform Frame added")}</div>
</main></body></html>`;

fs.writeFileSync(OUT, html);
console.log("wrote", OUT, (html.length / 1024 / 1024).toFixed(1) + "MB");
