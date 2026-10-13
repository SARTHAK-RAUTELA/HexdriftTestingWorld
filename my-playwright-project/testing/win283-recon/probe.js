// WIN283: probe why an arm never reaches #orderForm.loaded
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(25000);
  console.log(await p.evaluate(() => ({
    url: location.href,
    orderForm: document.querySelector("#orderForm")?.className,
    addBtns: [...document.querySelectorAll(".order-form__add")].map((e) => e.className + " :: " + e.innerText),
    cls: [...document.body.classList].filter((c) => /cre/i.test(c)),
    line: document.querySelector(".cre-t-283-subtotal-line")?.innerText,
  })), errs);
  await p.screenshot({ path: __dirname + "/out/probe.png" });
  await b.close();
})();
