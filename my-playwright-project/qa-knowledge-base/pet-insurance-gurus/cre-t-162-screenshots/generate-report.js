// Generates cre-t-162-quote-section-qa-report.html (sibling folder) by embedding the captured
// screenshots as base64 data URIs, following the same self-contained-HTML convention as
// cre-t-143-price-discount-retest-qa-report.html. One-off build script, not part of the app.
const fs = require("fs");
const path = require("path");

const SHOTS = __dirname;
const OUT_DIR = path.join(__dirname, "..");
const OUT_FILE = path.join(OUT_DIR, "cre-t-162-quote-section-qa-report.html");

function b64(name) {
  return "data:image/png;base64," + fs.readFileSync(path.join(SHOTS, name)).toString("base64");
}

const CONTEXT = {
  chrome: b64("context-chrome-desktop.png"),
  firefox: b64("context-firefox-desktop.png"),
  edge: b64("context-edge-desktop.png"),
  safari: b64("context-safari-desktop.png"),
};

const CARD = {
  chrome: b64("quote-card-chrome-desktop.png"),
  firefox: b64("quote-card-firefox-desktop.png"),
  edge: b64("quote-card-edge-desktop.png"),
  safari: b64("quote-card-safari-desktop.png"),
  mobileChrome: b64("quote-card-mobile-chrome-pixel5.png"),
  mobileSafari: b64("quote-card-mobile-safari-iphone12.png"),
};

const TC_ROWS = [
  ["TC-01", "Section injected immediately before #comparison-section", "sitewide x4 pages"],
  ["TC-02", "Quote text/author/source match the code's own config", "sitewide x4 pages"],
  ["TC-03", "'Personalize prices' element (#section-11-584) is hidden", "sitewide x4 pages"],
  ["TC-04", "Quote strip background matches #f5f5f9", "sitewide x4 pages"],
  ["TC-05", "Idempotent — re-running the script does not duplicate the section", "sitewide x4 pages"],
  ["TC-06", "No stray duplicate ids introduced by injection", "sitewide x4 pages"],
  ["TC-07", "No injected-code console/page errors", "sitewide x4 pages"],
  ["TC-08", "Quote persists after switching to the Cats tab (pushState nav)", "interaction"],
  ["TC-09", "Quote persists after returning to All Pets", "interaction"],
  ["TC-10", "Quote persists after entering a ZIP code (in-place React re-render)", "interaction"],
  ["TC-11", "Quote box still shows correct copy after the ZIP re-render", "interaction"],
  ["TC-12", "Quote still injects on a page loaded with ?breed= pre-selected", "breed preload"],
  ["TC-13", "Quote source becomes static/centered below 768px", "responsive"],
];

const tcTableRows = TC_ROWS.map(
  ([id, desc, scope]) =>
    `<tr><td><code>${id}</code></td><td>${desc}</td><td>${scope}</td><td><span class="badge pass">PASS (6/6 browsers)</span></td></tr>`
).join("\n      ");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CRE-T-162 QA Report — Pet Insurance Gurus "Testimonial Quote Section"</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f4f5f7; color: #1a1a1a; margin: 0; padding: 40px; }
  .wrap { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 26px; margin-bottom: 4px; }
  .sub { color: #666; margin-bottom: 30px; }
  .card { background: #fff; border-radius: 10px; padding: 24px 28px; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  h2 { font-size: 18px; border-bottom: 2px solid #3066C9; padding-bottom: 8px; margin-top: 0; }
  h3 { font-size: 15px; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { background: #f0f2f5; }
  .pass { color: #1a7a3c; font-weight: 600; }
  .fail { color: #b3261e; font-weight: 600; }
  .fixed { background: #e3f5e9; border-left: 4px solid #1a7a3c; padding: 12px 16px; border-radius: 4px; margin: 10px 0; }
  .open { background: #fdecea; border-left: 4px solid #b3261e; padding: 12px 16px; border-radius: 4px; margin: 10px 0; }
  .note { background: #eef3fc; border-left: 4px solid #3066C9; padding: 12px 16px; border-radius: 4px; margin: 10px 0; }
  code { background: #f0f2f5; padding: 1px 5px; border-radius: 3px; font-size: 13px; }
  .shots { display: flex; gap: 20px; flex-wrap: wrap; }
  .shots figure { margin: 0; flex: 1; min-width: 240px; }
  .shots img { width: 100%; border: 1px solid #ddd; border-radius: 6px; }
  .shots figcaption { text-align: center; font-size: 13px; color: #555; margin-top: 6px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .badge.pass { background: #e3f5e9; color: #1a7a3c; }
  .badge.fail { background: #fdecea; color: #b3261e; }
  ul { padding-left: 20px; }
  .statgrid { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 14px; }
  .stat { flex: 1; min-width: 150px; background: #f8f9fb; border-radius: 8px; padding: 14px 18px; text-align: center; }
  .stat .num { font-size: 26px; font-weight: 700; }
  .stat .lbl { font-size: 12px; color: #666; margin-top: 2px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>CRE-T-162 — Pet Insurance Gurus "Testimonial Quote Section"</h1>
  <div class="sub">petinsurancegurus.com &middot; local injection of vB.js/vB.css &middot; 2026-09-11 &middot; no ticket/Figma, code treated as spec &middot; 6 browsers: Chrome, Firefox, Edge, Safari Desktop, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)</div>

  <div class="card">
    <h2>Summary</h2>
    <div class="statgrid">
      <div class="stat"><div class="num">204</div><div class="lbl">total checks run (13 TCs &times; 6 browsers)</div></div>
      <div class="stat"><div class="num" style="color:#1a7a3c">204</div><div class="lbl">passed</div></div>
      <div class="stat"><div class="num" style="color:#1a7a3c">0</div><div class="lbl">confirmed bugs</div></div>
      <div class="stat"><div class="num">1</div><div class="lbl">environment flake, root-caused &amp; fixed same session</div></div>
      <div class="stat"><div class="num">2</div><div class="lbl">open questions for the client (not code defects)</div></div>
    </div>
    <p style="margin-top:16px">The variation code does exactly what it says: it inserts a static testimonial quote card immediately above the comparison table, hides the "Personalize prices" copy, and holds up under every interaction this client's site is known to break injected elements with (tab switches, ZIP entry, breed pre-selection) — even though, unusually for this client, the code has no <code>MutationObserver</code> to re-apply itself. No functional defect was found. Two things are worth confirming with the client before this ships (see below) — neither blocks sign-off since no Figma/ticket exists yet to check them against.</p>
  </div>

  <div class="card">
    <h2>Methodology note — testdetail.md / code mismatch found at start of this pass</h2>
    <div class="note"><b>testdetail.md on file describes SWF143/CRE-T-143</b> (sitewide price discount, already QA'd separately). <code>vB.js</code>/<code>vB.css</code> had been rewritten with unrelated content — <code>variation_name = "cre-t-162"</code>, a testimonial quote card. Confirmed with the client this is a real followup test with no Figma/ticket provided; per this client's standing no-ticket fallback (same approach used for the original CRE-T-143 pass), the code itself was treated as the spec. testdetail.md's generic URL-targeting/audience/browser sections were still reused since they're generic to this client's page template, not specific to the price-discount requirement text.</div>
  </div>

  <div class="card">
    <h2>What the code does</h2>
    <p><code>init()</code> waits for <code>#comparison-section</code>, then (once, no re-apply) inserts a <code>&lt;section id="cre-t-162-section"&gt;</code> immediately <code>beforebegin</code> it: a white card with quote text, author line, and source attribution, centered on a light-grey (<code>#f5f5f9</code>) full-width strip. CSS also force-hides <code>#section-11-584</code> ("Personalize prices" copy). A responsive breakpoint at &le;768px adjusts padding/gap and makes the source line static/centered instead of absolute-positioned bottom-right.</p>
    <ul>
      <li><b>Text:</b> "Several times the insurance has made the difference between treatment and euthanasia."</li>
      <li><b>Author:</b> "Dr. Diane Deresienski &bull; Veterinarian, Bowman Animal Hospital"</li>
      <li><b>Source:</b> "Source: The New York Times"</li>
    </ul>
  </div>

  <div class="card">
    <h2>Screenshots — full context (desktop, top of page after injection)</h2>
    <p style="margin-top:-6px;color:#555">These full-page shots also surface the finding below: the site already renders its own permanently-live photo-based quote carousel (top box), and cre-t-162's plain-text card (bottom box) stacks directly beneath it with the same quote.</p>
    <div class="shots">
      <figure><img src="${CONTEXT.chrome}"><figcaption>Chrome Desktop</figcaption></figure>
      <figure><img src="${CONTEXT.firefox}"><figcaption>Firefox Desktop</figcaption></figure>
      <figure><img src="${CONTEXT.edge}"><figcaption>Edge Desktop</figcaption></figure>
      <figure><img src="${CONTEXT.safari}"><figcaption>Safari Desktop</figcaption></figure>
    </div>
  </div>

  <div class="card">
    <h2>Screenshots — quote card close-up, all 6 browsers</h2>
    <div class="shots">
      <figure><img src="${CARD.chrome}"><figcaption>Chrome Desktop</figcaption></figure>
      <figure><img src="${CARD.firefox}"><figcaption>Firefox Desktop</figcaption></figure>
      <figure><img src="${CARD.edge}"><figcaption>Edge Desktop</figcaption></figure>
      <figure><img src="${CARD.safari}"><figcaption>Safari Desktop</figcaption></figure>
      <figure><img src="${CARD.mobileChrome}"><figcaption>Mobile Chrome (Pixel 5)</figcaption></figure>
      <figure><img src="${CARD.mobileSafari}"><figcaption>Mobile Safari (iPhone 12) — note static/centered source line, confirms TC-13</figcaption></figure>
    </div>
  </div>

  <div class="card">
    <h2>Test cases (13 &times; 6 browsers = 204 runs)</h2>
    <table>
      <tr><th>TC</th><th>Scenario</th><th>Scope</th><th>Result</th></tr>
      ${tcTableRows}
    </table>
  </div>

  <div class="card">
    <h2>Environment note — Safari flake, root-caused and fixed (not a code bug)</h2>
    <div class="fixed"><b>Not a defect.</b> First Safari Desktop pass hit two failures on TC-12 (breed-preselected load): a 45s <code>waitForSelector</code> timeout, then — after a fixed 800ms post-inject sleep — a false "not present" read. Both were WebKit slow-load timing: the failure's own accessibility snapshot showed the quote section had, in fact, already rendered by the time of capture. Fixed by replacing the fixed sleep with <code>page.waitForSelector('#cre-t-162-section', {state:'attached'})</code>, the pattern this client's own QA notes prescribe. Re-ran clean, 34/34. Same class of issue as CRE-T-143's TC-06 Safari-only flake.</div>
  </div>

  <div class="card">
    <h2>Checked and found NOT to reproduce: missing MutationObserver</h2>
    <p>Unlike every other recent variation on this client, this build's <code>init()</code> has no <code>MutationObserver</code> — it runs once. This client's site is documented to destroy injected DOM nodes on ZIP/breed re-renders elsewhere on the page. <b>Directly tested (TC-08&ndash;TC-12) and the quote card survives every case</b> — it's inserted as a previous <i>sibling</i> of <code>#comparison-section</code>, not a descendant, so it sits outside the subtree React actually re-renders.</p>
  </div>

  <div class="card">
    <h2>Open questions for the client (not filed as bugs — no Figma exists to check against)</h2>
    <div class="open"><b>1. Author-line wording differs from the previously-confirmed copy on this client.</b> This build: "Dr. Diane Deresienski &bull; Veterinarian, Bowman Animal Hospital". SWF157 (same client, same person) confirmed: "Dr. Diane Deresienski, Managing Veterinarian" (source unchanged, The New York Times). Worth confirming intentional — this client's tests have a documented history of leftover/stale copy surviving clones.</div>
    <div class="open"><b>2. Two quote boxes will show back-to-back once live.</b> The site already renders a separate, permanently-live photo/logo carousel quote card (SWF157's shipped design) directly above where cre-t-162 injects its own plain-text card — see the full-context screenshots above. Not this test's own code at fault, but worth flagging before launch.</div>
  </div>

  <div class="card">
    <h2>Bugs found</h2>
    <p>None. All 204 runs passed.</p>
  </div>
</div>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
console.log("Wrote", OUT_FILE, (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2), "MB");
