// WIN269: list Convert goals in the loaded project config that look like WIN269 / benefit goals
const pw = require("playwright");
(async () => {
  const b = await pw.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  await p.goto("https://www.winkbeds.com/pages/shop-winkbed?convert_action=convert_vpreview&convert_e=100350736&convert_v=1003184951", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(12000);
  const full = await p.evaluate(() => window.convert.data.goals.filter((g) => +g.id >= 100334659 && +g.id <= 100334667)); console.log(JSON.stringify(full));
  const out = await p.evaluate(() => {
    const found = []; const seen = new Set();
    const walk = (o, path, d) => {
      if (!o || typeof o !== "object" || d > 7 || seen.has(o)) return; seen.add(o);
      if (o.id && o.name && /^1003(34|29)/.test(String(o.id))) found.push(o.id + " = " + o.name + " @" + path);
      if (o.id && o.name && /^100350736$/.test(String(o.id))) found.push("EXP " + o.name + " goals=" + JSON.stringify(o.goals || o.goal_ids || null) + " @" + path);
      for (const k in o) { try { walk(o[k], path + "." + k, d + 1); } catch (e) {} }
    };
    walk(window.convert, "convert", 0); walk(window._conv_data || null, "_conv_data", 0);
    return { keys: window.convert ? Object.keys(window.convert).slice(0, 30) : null, found: [...new Set(found)].slice(0, 80) };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
