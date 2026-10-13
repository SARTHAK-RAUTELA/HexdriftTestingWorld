// WIN283: accessory/cooling compare prices (cre-t-275 bucket) vs cre-t-283 saving
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  for (let i = 0; i < 4; i++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const p = await ctx.newPage();
    await p.goto("https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&_conv_eforce=100350737.1003184954", { waitUntil: "domcontentloaded", timeout: 60000 });
    await p.waitForSelector(".cre-t-283-subtotal-line", { state: "attached", timeout: 45000 }); await p.waitForTimeout(6000);
    const is275 = await p.evaluate(() => document.body.classList.contains("cre-t-275"));
    const titles = await p.evaluate(() => [...document.querySelectorAll(".accessory-tray_item")].map((i) => i.querySelector(".accessory-item-title").innerHTML.replace(/\s+/g, " ").slice(0, 300)));
    console.log("load", i, "cre-t-275 active:", is275, "\n", titles.join("\n "));
    if (is275) {
      await p.locator(".accessory-tray_item").filter({ hasText: "Platform Frame" }).locator(".add-to-accessory-cart").click({ force: true });
      await p.waitForTimeout(3500);
      console.log(" after frame:", await p.evaluate(() => document.querySelector(".cre-t-283-subtotal-line").textContent + " | " + document.querySelector(".cre-t-283-add-btn").textContent));
      await p.evaluate(() => document.querySelector(".cre-t-283-subtotal-line").scrollIntoView({ block: "center" }));
      await p.screenshot({ path: __dirname + "/out/acc275-v2.png" });
      await ctx.close(); break;
    }
    await ctx.close();
  }
  await b.close();
})();
