// WIN283: map size select, setup modal and cart-add flow on the V2 arm
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  const adds = []; p.on("request", (r) => /cart\/add|cart\/update|cart\/change/.test(r.url()) && r.method() === "POST" && adds.push(r.url()));
  await p.goto("https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&_conv_eforce=100350737.1003184954", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector(".cre-t-283-add-btn", { timeout: 45000 }); await p.waitForTimeout(6000);
  console.log(await p.evaluate(() => ({
    sizes: [...document.querySelectorAll("#size-select option")].map((o) => o.value + "=" + o.text + (o.selected ? "*" : "")),
    sizeTag: document.querySelector("#size-select")?.tagName,
    firm: [...document.querySelectorAll("#firmness-select option")].map((o) => o.text),
    popup: [...document.querySelectorAll(".pop-loadup__service-button")].map((b) => b.className + " :: " + b.innerText.replace(/\s+/g, " ")),
    origTab: document.querySelector(".cre-t-283-add-btn-original")?.tabIndex,
    origRole: document.querySelector(".cre-t-283-add-btn-original")?.getAttribute("role"),
  })));
  // size change
  const opts = await p.$$eval("#size-select option", (o) => o.map((x) => x.value));
  await p.selectOption("#size-select", opts[opts.length - 1]);
  await p.waitForTimeout(4000);
  console.log("after size", await p.evaluate(() => [document.querySelector(".cre-t-283-subtotal-line").innerText, document.querySelector(".cre-t-283-add-btn").innerText, document.querySelector(".price-row__pay-option-price").innerText, document.querySelector(".cre-t-202-box-strike-price")?.innerText]));
  // setup modal
  await p.evaluate(() => document.querySelector(".order-form__loadup-button").click());
  await p.waitForTimeout(1500);
  console.log("popup", await p.evaluate(() => [...document.querySelectorAll(".pop-loadup__service-button")].map((b) => (b.offsetParent ? "VIS " : "hid ") + b.innerText.replace(/\s+/g, " "))));
  await p.screenshot({ path: __dirname + "/out/setup-modal.png" });
  await b.close();
})();
