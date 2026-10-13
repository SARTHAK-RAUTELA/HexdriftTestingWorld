// WIN283: on WebKit, track cre-t-202 "Was" badge vs cre-t-283 line over 25s after load
const { webkit } = require("playwright");
const ids = { control: "1003184952", v1: "1003184953", v2: "1003184954" };
(async () => {
  const b = await webkit.launch();
  for (const key of process.argv.slice(2)) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const p = await ctx.newPage();
    await p.goto("https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&_conv_eforce=100350737." + ids[key], { waitUntil: "domcontentloaded", timeout: 60000 });
    await p.waitForSelector(".cre-t-283-subtotal-line", { state: "attached", timeout: 60000 });
    const t0 = Date.now(); let last = "";
    while (Date.now() - t0 < 25000) {
      const s = await p.evaluate(() => [document.querySelector(".cre-t-202-box-strike-price")?.textContent.trim() || "(no 202 badge)", document.querySelector(".cre-t-283-subtotal-line")?.textContent.trim(), [...document.querySelectorAll(".order-form__add.button")].find((x) => x.offsetParent)?.textContent.trim()].join(" | "));
      if (s !== last) { console.log(key, ((Date.now() - t0) / 1000).toFixed(1) + "s", s); last = s; }
      await p.waitForTimeout(500);
    }
    await p.evaluate(() => document.querySelector(".cre-t-283-subtotal-line").scrollIntoView({ block: "center" }));
    await p.screenshot({ path: __dirname + `/out/webkit202-${key}.png` });
    await ctx.close();
  }
  await b.close();
})();
