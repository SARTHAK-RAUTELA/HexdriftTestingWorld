// Build the WIN291 QA HTML report from win291-results/results.jsonl + screenshots (relative paths, KB winkbeds folder).
const fs = require("fs"), path = require("path");
const KB = path.join(__dirname, "..", "..", "qa-knowledge-base", "winkbeds");
const rows = fs.readFileSync(path.join(KB, "win291-results", "results.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const ARTIFACT = (r) => r.project.match(/Firefox|Safari/) && /^V4 /.test(r.title) && r.errors.every((e) => /page must not scroll/.test(e));
const projects = [...new Set(rows.map((r) => r.project))];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const tally = projects.map((p) => { const rs = rows.filter((r) => r.project === p); const pass = rs.filter((r) => r.status === "passed").length; const art = rs.filter(ARTIFACT).length; return `<tr><td>${p}</td><td>${rs.length}</td><td class="ok">${pass}</td><td class="bad">${rs.length - pass - art}</td><td>${art}</td></tr>`; }).join("");
const titles = [...new Set(rows.map((r) => r.title))];
const matrix = titles.map((t) => `<tr><td>${esc(t)}</td>${projects.map((p) => { const r = rows.find((x) => x.project === p && x.title === t); if (!r) return "<td>–</td>"; if (r.status === "passed") return '<td class="ok">PASS</td>'; if (ARTIFACT(r)) return '<td class="warn" title="page reflow, not the click">PASS*</td>'; return `<td class="bad" title="${esc(r.errors.join(" "))}">FAIL</td>`; }).join("")}</tr>`).join("");
const img = (f, cap) => fs.existsSync(path.join(KB, "win291-screenshots", f)) ? `<figure><img src="win291-screenshots/${f}" loading="lazy"><figcaption>${cap}</figcaption></figure>` : "";
const widths = [1001, 1100, 1280, 1366, 1440, 1920].map((w) => `<div class="pair">${img(`Chrome-Desktop-V7-win269-winner-${w}.png`, `WIN269 winner (= intended control) ${w}px`)}${img(`Chrome-Desktop-V7-variation-${w}.png`, `WIN291 variation ${w}px`)}</div>`).join("");
const browsers = projects.map((p) => img(`${p.replace(/\W+/g, "-")}-V1-variation-bar-1440.png`, `${p} variation 1440`)).join("");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WIN291 QA Report</title>
<style>:root{--bg:#fff;--fg:#1b1f24;--mut:#5b6470;--line:#e3e6ea;--ok:#127a3c;--bad:#b42318;--warn:#9a6700;--card:#f6f8fa}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0f1115;--fg:#e6e8eb;--mut:#9aa3ad;--line:#2a2f36;--ok:#4ac26b;--bad:#ff7b72;--warn:#d29922;--card:#161a20}}
body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px;max-width:1100px;margin:auto}h1{font-size:24px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 8px;border-bottom:1px solid var(--line);padding-bottom:4px}
.mut{color:var(--mut)}table{border-collapse:collapse;width:100%;font-size:13px;display:block;overflow-x:auto}td,th{border:1px solid var(--line);padding:5px 8px;text-align:left}th{background:var(--card)}
.ok{color:var(--ok);font-weight:600}.bad{color:var(--bad);font-weight:600}.warn{color:var(--warn);font-weight:600}
.bug{background:var(--card);border-left:4px solid var(--bad);padding:10px 14px;margin:10px 0;border-radius:4px}.bug.q{border-color:var(--warn)}.bug.pass{border-color:var(--ok)}
figure{margin:8px 0}img{max-width:100%;border:1px solid var(--line);border-radius:6px}figcaption{font-size:12px;color:var(--mut)}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:700px){.pair{grid-template-columns:1fr}}code{background:var(--card);padding:1px 4px;border-radius:3px}</style></head><body>
<h1>WIN291 — Shop Page Reassurance Benefits V2 (Desktop)</h1>
<p class="mut">WinkBeds · Convert exp 100350916 (control 1003185379 / variation 1003185380) · QA 2026-11-11 · Chrome, Edge, Firefox, Safari (WebKit) desktop</p>
<p><b>Verdict: NOT READY.</b> The variation is correct on all 4 browsers. The control arm is empty, so the test as configured doesn't compare what the ticket asks for.</p>
<h2>Summary</h2><table><tr><th>Browser</th><th>Tests</th><th>Pass</th><th>Fail</th><th>PASS* (harness)</th></tr>${tally}</table>
<p class="mut">PASS* = the "no scroll" check tripped because the page reflowed by itself (shop-box/WIN248 shift). A no-click baseline reproduced the same 497px jump in Firefox; a DOM click never scrolled the page in Firefox or WebKit.</p>
<h2>Bugs</h2>
<div class="bug"><b>BUG-01 · Critical · Control arm has no code</b><br>Ticket: "The control is the winner from WIN269" (6 underlined scroll links). Convert variation 1003185379 has <code>changes: []</code>, so the control renders the native 4-icon bar (365-night risk-free trial / Lifetime warranty / Free shipping and returns / Financing available). The test would measure native bar vs. no-link bar, not links vs. no links. Fails on all 4 browsers.<br><b>Fix:</b> put the WIN269 variation code (cre-t-269-d JS+CSS) in the WIN291 control.</div>
<div class="bug"><b>BUG-02 · Critical · WIN291 goals are not fired in the control</b><br>The 7 custom goals (any-benefit 100334789; per-benefit 100334790/791/792/793/804/805) exist only in the variation JS. Clicking a benefit in the control fires nothing, so none of the 7 goals can be compared. The WIN269 code fires the old WIN269 IDs (1003346xx); swap them for the WIN291 IDs when porting.</div>
<div class="bug q"><b>Q-01 · Launch: WIN269 is still active 50/50</b><br>QA audiences are mutually exclusive (WIN291 needs <code>utm_campaign</code> containing Cro291mode, WIN269 excludes it). Once that condition is removed at launch, both experiments target the same page and desktop audience: WIN269 must be paused, or its winner deployed, first.</div>
<div class="bug q"><b>Q-02 · Loom audio not reviewed</b><br>No speech-to-text here. Frames were reviewed (Trello card + variation demo); verbal-only notes may be missing.</div>
<div class="bug pass"><b>Variation: passes</b><br>No &lt;a&gt;/href/role/tabindex; underline none (incl. hover); cursor default; every benefit click (text or icon) fires 100334789 + its own goal exactly once; no goals on load; no scroll, no URL/hash change; icons load; hidden at ≤1000px; single injection; no JS errors. Layout identical to the live WIN269 winner at 6 widths (card size, rows, item positions ±3px, font). Live code = local vB.js/vB.css.<br><span class="mut">Inherited from WIN269 (not a regression): 2 per row from 1001 to 1199px, 3 per row from 1200px.</span></div>
<h2>Control vs variation (1440, Chrome)</h2><div class="pair">${img("Chrome-Desktop-C1-control-bar.png", "WIN291 control as deployed: native 4-icon bar (BUG-01)")}${img("Chrome-Desktop-V1-variation-bar-1440.png", "WIN291 variation")}</div>
<h2>WIN269 winner vs WIN291 variation by width</h2>${widths}
<h2>Variation per browser (1440)</h2><div class="pair">${browsers}</div>
<h2>Full matrix</h2><table><tr><th>Test</th>${projects.map((p) => `<th>${p.replace(" Desktop", "")}</th>`).join("")}</tr>${matrix}</table>
<p class="mut">Spec: testing/win291-reassurance-benefits-v2.spec.js · recon: testing/win291-recon/</p></body></html>`;
fs.writeFileSync(path.join(KB, "win291-reassurance-benefits-v2-qa-report.html"), html);
console.log("ok", rows.length, "rows");
