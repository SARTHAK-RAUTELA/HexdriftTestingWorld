// WIN283: does clicking Add to Cart actually add to cart per arm? (real mouse click at button centre)
const { chromium } = require("playwright");
const ids = { control: "1003184952", v1: "1003184953", v2: "1003184954" };
(async () => {
  const b = await chromium.launch();
  for (const key of process.argv.slice(2)) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const p = await ctx.newPage();
    const posts = []; p.on("request", (r) => r.method() === "POST" && /winkbeds\.com\/cart/.test(r.url()) && posts.push(r.url().replace(/.*\/cart/, "/cart") + " " + (r.postData() || "").slice(0, 160)));
    const logs = []; p.on("console", (m) => /283|error/i.test(m.text()) && logs.push(m.text().slice(0, 200)));
    await p.goto("https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&_conv_eforce=100350737." + ids[key], { waitUntil: "domcontentloaded", timeout: 60000 });
    await p.waitForSelector(".cre-t-283-subtotal-line", { state: "attached", timeout: 45000 }); await p.waitForTimeout(6000);
    const sel = key === "v2" ? ".cre-t-283-add-btn" : ".order-form__add.button";
    await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), sel);
    await p.waitForTimeout(800);
    const info = await p.evaluate((s) => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { box: [r.x, r.y, r.width, r.height], topEl: top && top.className, btnHTML: el.outerHTML.slice(0, 300) }; }, sel);
    console.log(key, JSON.stringify(info));
    await p.locator(sel).first().click({ force: true });
    await p.waitForTimeout(10000);
    const cart = await p.evaluate(() => fetch("/cart.js", { cache: "no-store" }).then((r) => r.json()).then((c) => c.item_count + " :: " + c.items.map((i) => i.title + " x" + i.quantity).join(", ")));
    console.log(key, "cart:", cart, "\n posts:", posts, "\n logs:", logs);
    await p.screenshot({ path: __dirname + `/out/atc-${key}.png` });
    await ctx.close();
  }
  await b.close();
})();
