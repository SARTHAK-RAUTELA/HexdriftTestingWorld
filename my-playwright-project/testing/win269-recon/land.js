// WIN269: fresh load per click, click soon after the bar shows (like a real visitor), sample where the target lands.
// usage: node testing/win269-recon/land.js <engine> <width> <target:reps,...>   e.g. trial:4,warranty:2
const pw = require("playwright");
const URL = "https://www.winkbeds.com/pages/shop-winkbed?convert_action=convert_vpreview&convert_e=100350736&convert_v=1003184951";
const SECTION = { trial: "#shopify-section-shop-the-winkbed-warranty", showrooms: ".cre-t-248-section h2, .cre-t-248-section h3", warranty: "#shopify-section-shop-promise", usa: "#shopify-section-shop-hi-touch", rating: "#shopify-section-testimonials", shipping: "#faq-content .concertina--open .concertina__title" };
(async () => {
  const [engName, w, plan] = process.argv.slice(2);
  const b = await pw[engName].launch({ headless: true });
  for (const part of plan.split(",")) {
    const [target, reps] = part.split(":");
    for (let r = 0; r < +reps; r++) {
      const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
      await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
      const p = await ctx.newPage();
      try {
        await p.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        await p.waitForSelector(".cre-t-269-link", { state: "visible", timeout: 45000 });
        await p.addStyleTag({ content: "#shopify-section-timedModal,.cre-wb-test-28-overlay,.cre-wb-test-28-popup{display:none!important}" });
        await p.waitForTimeout(+(process.argv[5] || 3000));
        const sel = `.cre-t-269-link[data-cre-target="${target}"]`;
        await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), sel);
        await p.waitForTimeout(500);
        await p.evaluate((s) => document.querySelector(s).click(), sel);
        const tops = [];
        for (let i = 0; i < 8; i++) { await p.waitForTimeout(1000); tops.push(await p.evaluate((s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; }, SECTION[target])); }
        const ok = tops[tops.length - 1] >= 100 && tops[tops.length - 1] <= 260;
        console.log(engName, w, target, "rep" + (r + 1), ok ? "OK " : "MISS", "top over 8s:", tops.join(" "));
      } catch (e) { console.log(engName, w, target, "rep" + (r + 1), "ERROR", e.message.split("\n")[0]); }
      await ctx.close();
    }
  }
  await b.close();
})();
