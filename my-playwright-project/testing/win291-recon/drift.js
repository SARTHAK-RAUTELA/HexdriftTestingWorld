// does the page scroll on its own (reflow) after centering the bar, with and without a benefit click?
const pw = require("playwright");
(async () => {
  const eng = process.argv[2];
  const b = await pw[eng].launch();
  for (const mode of ["noclick", "domclick", "noclick", "domclick"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const p = await ctx.newPage();
    await p.goto("https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro291mode&_conv_eforce=100350916.1003185380", { waitUntil: "domcontentloaded", timeout: 60000 });
    await p.waitForSelector(".cre-t-291-container", { timeout: 45000 });
    await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelector(".order__benefits").scrollIntoView({ block: "center" }));
    await p.waitForTimeout(700);
    const y0 = await p.evaluate(() => scrollY), b0 = await p.evaluate(() => Math.round(document.querySelector(".cre-t-291-container").getBoundingClientRect().top));
    if (mode === "domclick") await p.evaluate(() => document.querySelector('.cre-t-291-link[data-cre-target="shipping"]').click());
    const s = [];
    for (let i = 0; i < 5; i++) { await p.waitForTimeout(500); s.push(await p.evaluate(() => Math.round(scrollY))); }
    const docH = await p.evaluate(() => document.documentElement.scrollHeight);
    console.log(eng, mode, "y0", y0, "samples", s.join(" "), "barTop0", b0, "docH", docH);
    await ctx.close();
  }
  await b.close();
})();
