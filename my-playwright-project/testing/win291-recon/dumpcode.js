const pw = require("playwright"); const fs = require("fs");
(async () => {
  const b = await pw.chromium.launch(); const ctx = await b.newContext();
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  await p.goto("https://www.winkbeds.com/pages/shop-winkbed", { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(8000);
  const r = await p.evaluate(() => { const d = convert.data.experiences; const arr = Array.isArray(d) ? d : Object.values(d); const o = {}; arr.filter((e) => ["100350916", "100350736"].includes(String(e.id))).forEach((e) => e.variations.forEach((v) => (v.changes || []).filter((c) => c.type === "customCode").forEach((c) => { o[v.id] = { js: c.data.js, css: c.data.css }; }))); return o; });
  for (const [id, c] of Object.entries(r)) { fs.writeFileSync(`out/${id}.js`, (c.js || "").replace(/\r/g, "")); fs.writeFileSync(`out/${id}.css`, (c.css || "").replace(/\r/g, "")); }
  console.log(Object.keys(r)); await b.close();
})();
