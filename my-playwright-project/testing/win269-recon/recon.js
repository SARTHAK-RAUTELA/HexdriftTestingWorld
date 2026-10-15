// WIN269 recon: load an arm at a width, dump benefit bar state, screenshot it.
// usage: node testing/win269-recon/recon.js <chromium|webkit|firefox> <control|variation> <width> [label]
const pw = require("playwright");
const path = require("path");
const BASE = "https://www.winkbeds.com/pages/shop-winkbed?convert_action=convert_vpreview&convert_e=100350736&convert_v=";
const ARMS = { control: BASE + "1003184950", variation: BASE + "1003184951" };
const OUT = path.join(__dirname, "out");
(async () => {
  const [engName, arm, w, label] = process.argv.slice(2);
  const b = await pw[engName].launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(ARMS[arm], { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector(".order__benefits", { state: "attached", timeout: 45000 });
  await p.waitForTimeout(8000);
  const info = await p.evaluate(() => {
    const cs = (el, k) => (el ? getComputedStyle(el)[k] : null);
    const bar = document.querySelector(".order__benefits");
    const c = document.querySelector(".cre-t-269-container");
    const r = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top + scrollY), Math.round(x.width), Math.round(x.height)].join(","); };
    return {
      classes: [...document.body.classList].filter((x) => /cre|cro/i.test(x)),
      barDisplay: cs(bar, "display"), barRect: r(bar),
      nativeItems: [...document.querySelectorAll(".order__benefit")].map((e) => e.innerText.replace(/\s+/g, " ") + " [" + cs(e, "display") + "]"),
      nativeItemsDisplay: cs(document.querySelector(".order__benefits-items"), "display"),
      container: c && { display: cs(c, "display"), bg: cs(c, "backgroundColor"), radius: cs(c, "borderRadius"), rect: r(c), count: document.querySelectorAll(".cre-t-269-container").length, cols: cs(c.querySelector(".cre-t-269-main"), "gridTemplateColumns") },
      links: [...document.querySelectorAll(".cre-t-269-link")].map((a) => {
        const t = a.querySelector(".cre-t-269-text"), i = a.querySelector("img");
        return { text: t.innerText, href: a.getAttribute("href"), target: a.dataset.creTarget, rect: r(a), font: [cs(t, "fontFamily").slice(0, 30), cs(t, "fontSize"), cs(t, "fontWeight"), cs(t, "color"), cs(t, "textDecorationLine"), cs(a, "cursor")].join("|"), img: i && i.naturalWidth + "x" + i.naturalHeight + " " + i.src.split("/").slice(-2).join("/") };
      }),
    };
  });
  console.log(JSON.stringify(info, null, 1), "\nerrors:", errs.slice(0, 5));
  await p.evaluate(() => document.querySelector(".order__benefits")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, `${label || arm + "-" + engName + "-" + w}.png`) });
  const bar = p.locator(".order__benefits");
  if (await bar.isVisible()) await bar.screenshot({ path: path.join(OUT, `${label || arm + "-" + engName + "-" + w}-bar.png`) });
  await b.close();
})().catch((e) => { console.log("FAILED", e.message.split("\n")[0]); process.exit(1); });
