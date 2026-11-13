// dump WIN291 + WIN269 experience config (variations code, audiences, urls) and current bucketing
const pw = require("playwright");
(async () => {
  const url = process.argv[2];
  const b = await pw.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(10000);
  const out = await p.evaluate(() => {
    const d = convert.data.experiences; const arr = Array.isArray(d) ? d : Object.values(d);
    const pick = arr.filter((e) => ["100350916", "100350736"].includes(String(e.id))).map((e) => ({
      id: e.id, name: e.name, status: e.status, type: e.type, locations: e.locations, audiences: e.audiences, site_area: e.site_area, settings: e.settings,
      global_js: (e.global_js || "").slice(0, 300),
      variations: (e.variations || []).map((v) => ({ id: v.id, name: v.name, alloc: v.traffic_allocation, status: v.status, changes: (v.changes || []).map((c) => ({ type: c.type, js: c.data && (c.data.js || "").slice(0, 1500), css: c.data && (c.data.css || "").slice(0, 200) })) })),
    }));
    const ce = convert.currentData.experiences;
    return { pick, cur: Object.keys(ce).map((k) => k + "=" + (ce[k].variation && ce[k].variation.id)), cls: [...document.body.classList].filter((x) => /cre/.test(x)), has269: !!document.querySelector(".cre-t-269-container"), has291: !!document.querySelector(".cre-t-291-container"), cookies: document.cookie.split(";").filter((c) => /conv|_conv/.test(c)).map((c) => c.trim().slice(0, 300)) };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
