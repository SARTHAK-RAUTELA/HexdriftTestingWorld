// WIN269: build the self-contained HTML QA report from win269-results/results.jsonl (screenshots embedded as base64)
// usage: node testing/win269-recon/build-report.js
const fs = require("fs");
const path = require("path");

const KB = path.join(__dirname, "..", "..", "qa-knowledge-base", "winkbeds");
const SHOTS = path.join(KB, "win269-screenshots");
const OUT = path.join(__dirname, "..", "..", "..", "local_testing", "Local2", "win269-reassurance-benefits-qa-report.html");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const img = (f, cap) => {
  const p = f && path.join(SHOTS, f);
  if (!p || !fs.existsSync(p)) return "";
  return `<figure><img src="data:image/png;base64,${fs.readFileSync(p).toString("base64")}" alt="${esc(cap)}"><figcaption>${cap}</figcaption></figure>`;
};

// last result per (project, title) wins, so re-runs of a single test replace the earlier row
const rows = fs.readFileSync(path.join(KB, "win269-results", "results.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
const last = new Map();
rows.forEach((r) => last.set(r.project + "|" + r.title, r));
const results = [...last.values()];
const BROWSERS = ["Chrome Desktop", "Edge Desktop", "Firefox Desktop", "Safari Desktop"].filter((b) => results.some((r) => r.project === b));
const titles = [...new Set(results.map((r) => r.title))];
const icon = (r) => (!r ? "—" : r.status === "passed" ? "✅" : r.status === "skipped" ? "—" : "❌");
const tally = (b) => { const rs = results.filter((r) => r.project === b); return `${rs.filter((r) => r.status === "passed").length} / ${rs.length}`; };
const landing = (b, t) => { const r = last.get(b + "|" + t); const a = r && r.annotations.find((x) => x.type === "landing"); return a ? b.replace(" Desktop", "") + ": " + a.description.replace(/^.*?:\s*/, "") : ""; };
const BUGS = fs.readFileSync(path.join(__dirname, "bugs.html"), "utf8").replace(/\{\{img:([^|}]+)\|([^}]+)\}\}/g, (_, f, c) => img(f, c));

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WIN269 QA Report</title>
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
.tag.high{color:var(--red)}.tag.med{color:var(--amber)}.tag.low{color:var(--blue)}.tag.obs{color:var(--muted)}
code{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:13px;word-break:break-word}
figure{margin:10px 0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:13px;color:var(--muted);margin-top:6px}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}ul{padding-left:20px}
</style></head><body><main>
<h1>WIN269 — Shop Page · Reassurance Benefits (Desktop)</h1>
<p class="muted">WinkBeds · <code>/pages/shop-winkbed</code> · cre-t-269 · Convert exp 100350736 · Desktop only · QA run 2026-10-15 · ${BROWSERS.join(" · ")} (Playwright)</p>
<div class="grid">
${BROWSERS.map((b) => `<div class="stat"><b>${tally(b)}</b>${b} passed</div>`).join("\n")}
</div>
${BUGS}
<h2>Results matrix</h2>
<p class="muted">✅ pass · ❌ fail · — not run. Landing tests sample the target's top edge once a second for 7s after the click. The sticky header and section nav end at about 165px, and the code's offset is 160px.</p>
<div class="wrap"><table>
<tr><th>Test</th>${BROWSERS.map((b) => `<th>${b.replace(" Desktop", "")}</th>`).join("")}</tr>
${titles.map((t) => `<tr><td>${esc(t)}${t.startsWith("V8") ? `<br><span class="muted">top px: ${BROWSERS.map((b) => esc(landing(b, t))).filter(Boolean).join(" · ")}</span>` : ""}</td>${BROWSERS.map((b) => `<td class="c">${icon(last.get(b + "|" + t))}</td>`).join("")}</tr>`).join("\n")}
</table></div>
<h2>Coverage</h2>
<ul>
<li>Playwright desktop projects, run one at a time: ${BROWSERS.join(", ")}, at 1440px, plus 1366 and 1000. Recon at 1024 and 1280 in Chromium.</li>
<li>Safari = Playwright WebKit on Windows, not real macOS Safari.</li>
<li>Spec: <code>my-playwright-project/testing/win269-reassurance-benefits.spec.js</code> · recon: <code>testing/win269-recon/</code> · raw results: <code>qa-knowledge-base/winkbeds/win269-results/</code></li>
</ul>
</main></body></html>`;

fs.writeFileSync(OUT, html);
console.log("wrote", OUT, (html.length / 1024 / 1024).toFixed(1) + "MB");
