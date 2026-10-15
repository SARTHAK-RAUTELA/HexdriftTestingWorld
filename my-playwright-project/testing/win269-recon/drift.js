// WIN269: why does Trial miss? Click Trial on a fresh load, log section heights that change during the scroll,
// then click again (page now settled) to see if the 2nd click lands.
const pw = require("playwright");
const URL = "https://www.winkbeds.com/pages/shop-winkbed?convert_action=convert_vpreview&convert_e=100350736&convert_v=1003184951";
(async () => {
  const b = await pw.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector(".cre-t-269-link", { state: "visible", timeout: 45000 });
  await p.addStyleTag({ content: "#shopify-section-timedModal,.cre-wb-test-28-overlay,.cre-wb-test-28-popup{display:none!important}" });
  await p.waitForTimeout(8000);
  const snap = () => p.evaluate(() => { const o = {}; document.querySelectorAll("[id^=shopify-section], .cre-t-248-section").forEach((e) => { const k = e.id || e.className.split(" ")[0]; o[k] = Math.round(e.getBoundingClientRect().height); }); return o; });
  for (const round of [1, 2]) {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
    const before = await snap();
    const trialTop = await p.evaluate(() => Math.round(document.querySelector("#shopify-section-shop-the-winkbed-warranty").getBoundingClientRect().top + scrollY));
    await p.evaluate(() => { const l = document.querySelector('.cre-t-269-link[data-cre-target="trial"]'); l.scrollIntoView({ block: "center" }); });
    await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('.cre-t-269-link[data-cre-target="trial"]').click());
    await p.waitForTimeout(5000);
    const after = await snap();
    const res = await p.evaluate(() => ({ y: Math.round(scrollY), top: Math.round(document.querySelector("#shopify-section-shop-the-winkbed-warranty").getBoundingClientRect().top), trialTopNow: Math.round(document.querySelector("#shopify-section-shop-the-winkbed-warranty").getBoundingClientRect().top + scrollY) }));
    const ch = Object.keys(after).filter((k) => before[k] !== after[k]).map((k) => k.replace("shopify-section-", "") + ":" + before[k] + "→" + after[k]);
    console.log("round", round, "trialDocTop before click", trialTop, "after", res.trialTopNow, "landed top", res.top, "\n  changed:", ch.join(" | "));
  }
  // native sticky nav "Trial" tab, for comparison
  await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(1000);
  const tab = p.locator("#shopify-section-shop-nav-bar a, #shopify-section-shop-nav-bar button").filter({ hasText: /^\s*Trial\s*$/ }).first();
  await tab.evaluate((e) => e.click()); await p.waitForTimeout(4000);
  console.log("native nav Trial tab -> trial top:", await p.evaluate(() => Math.round(document.querySelector("#shopify-section-shop-the-winkbed-warranty").getBoundingClientRect().top)));
  await b.close();
})();
