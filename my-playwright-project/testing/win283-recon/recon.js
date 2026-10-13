// WIN283 recon: load each arm, dump line/button state + computed styles, screenshot the buy box.
// usage: node testing/win283-recon/recon.js <chromium|webkit> [armKey ...]
const { chromium, webkit } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&_conv_eforce=";
const ARMS = {
  control: BASE + "100350737.1003184952",
  v1guess: BASE + "100350737.1003184953",
  v2guess: BASE + "100350737.1003184954",
  gbs_v1: "https://www.greenbuildingsupply.com/?cro_mode=qa&_conv_eforce=100052955.1000257634",
  gbs_v2: "https://www.greenbuildingsupply.com/?cro_mode=qa&_conv_eforce=100052955.1000257635",
};
const OUT = path.join(__dirname, "out");

(async () => {
  const engineName = process.argv[2] === "webkit" ? "webkit" : "chromium";
  const engine = engineName === "webkit" ? webkit : chromium;
  const keys = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(ARMS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await engine.launch({ headless: true });
  for (const key of keys) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => /283|error in Test/i.test(m.text()) && errs.push("console: " + m.text()));
    try {
      await page.goto(ARMS[key], { waitUntil: "domcontentloaded", timeout: 60000 });
      if (key.startsWith("gbs")) {
        await page.waitForTimeout(6000);
        const info = await page.evaluate(() => ({
          url: location.href, title: document.title,
          creClasses: [...document.body.classList].filter((c) => /cre|cro/i.test(c)),
          hasOrderForm: !!document.querySelector("#orderForm"),
          has283: !!document.querySelector("[class*='283']"),
        }));
        console.log(key, JSON.stringify(info, null, 1));
        await page.screenshot({ path: path.join(OUT, `${key}.png`) });
      } else {
        await page.waitForSelector("#orderForm.loaded .order-form__add.button", { timeout: 45000 });
        await page.waitForTimeout(7000);
        const info = await page.evaluate(() => {
          const cs = (el, p) => (el ? getComputedStyle(el)[p] : null);
          const line = document.querySelector(".cre-t-283-subtotal-line");
          const strike = line && line.querySelector(".strike");
          const orig = document.querySelector(".order-form__add.button:not(.cre-t-283-add-btn)");
          const clone = document.querySelector(".cre-t-283-add-btn");
          return {
            creClasses: [...document.body.classList].filter((c) => /cre|cro/i.test(c)),
            lineCount: document.querySelectorAll(".cre-t-283-subtotal-line").length,
            lineHTML: line && line.innerHTML,
            lineText: line && line.innerText,
            lineFont: line && [cs(line, "fontSize"), cs(line, "fontWeight"), cs(line, "fontFamily"), cs(line, "color"), cs(line, "order")].join(" | "),
            strikeStyle: strike && [cs(strike, "color"), cs(strike, "textDecorationLine"), cs(strike, "fontWeight"), cs(strike, "paddingLeft")].join(" | "),
            savingColor: line && line.querySelector("span") && cs(line.querySelector("span"), "color"),
            origBtn: orig && { text: orig.innerText, display: cs(orig, "display"), tag: orig.tagName, cls: orig.className },
            cloneBtn: clone && { text: clone.innerText, tag: clone.tagName, font: [cs(clone, "fontSize"), cs(clone, "letterSpacing"), cs(clone, "fontFamily")].join(" | "), tabIndex: clone.tabIndex, role: clone.getAttribute("role") },
            basePrice: document.querySelector(".price-row__pay-option-price")?.textContent.trim(),
            strike202: document.querySelector(".cre-t-202-box-strike-price")?.textContent.trim(),
            setupCompare: document.querySelector(".order-form__loadup-button-compare-price")?.textContent.trim(),
            setupBtn: document.querySelector(".order-form__loadup-button")?.innerText.replace(/\s+/g, " "),
            accessories: [...document.querySelectorAll(".accessory-tray_item")].map((i) => i.querySelector(".accessory-item-title")?.textContent.trim().replace(/\s+/g, " ") + (i.querySelector(".add-to-accessory-cart")?.checked ? " [x]" : "")),
            interLoaded: document.fonts ? [...document.fonts].filter((f) => /inter/i.test(f.family)).map((f) => f.family + ":" + f.weight + ":" + f.status) : null,
          };
        });
        console.log(key, JSON.stringify(info, null, 1), "\nerrors:", errs);
        const line = page.locator(".cre-t-283-subtotal-line");
        if (await line.count()) await line.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(OUT, `${key}-${engineName}.png`) });
      }
    } catch (e) {
      console.log(key, "FAILED", e.message.split("\n")[0]);
    }
    await ctx.close();
  }
  await browser.close();
})();
