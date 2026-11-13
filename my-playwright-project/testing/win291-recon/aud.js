const pw = require("playwright");
(async () => {
  const b = await pw.chromium.launch(); const ctx = await b.newContext();
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  await p.goto("https://www.winkbeds.com/pages/shop-winkbed", { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(8000);
  console.log(JSON.stringify(await p.evaluate(() => { const a = convert.data.audiences; const arr = Array.isArray(a) ? a : Object.values(a || {}); const l = convert.data.locations; const larr = Array.isArray(l) ? l : Object.values(l || {}); return { aud: arr.filter((x) => ["10036068", "10036080"].includes(String(x.id))), loc: larr.filter((x) => String(x.id) === "10033214") }; }), null, 1));
  await b.close();
})();
