// WIN291 recon: load an arm, dump benefit bar state + exp goals, click each benefit, screenshot.
// usage: node testing/win291-recon/recon.js <chromium|webkit|firefox> <control|variation> <width> [click]
const pw = require("playwright");
const path = require("path");
const BASE = "https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro291mode&_conv_eforce=100350916.";
const ARMS = { control: BASE + "1003185379", variation: BASE + "1003185380" };
const OUT = path.join(__dirname, "out");
(async () => {
  const [engName, arm, w, doClick] = process.argv.slice(2);
  const b = await pw[engName].launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.__goals = [];
    setInterval(() => {
      const q = (window._conv_q = window._conv_q || []);
      if (q.__hooked) return;
      const orig = q.push.bind(q);
      q.push = function (...a) { a.forEach((x) => Array.isArray(x) && x[0] === "triggerConversion" && window.__goals.push(String(x[1]))); return orig(...a); };
      q.__hooked = true;
    }, 20);
  });
  const p = await ctx.newPage();
  const errs = [], logs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => /cre|269|291/i.test(m.text()) && logs.push(m.text().slice(0, 200)));
  await p.goto(ARMS[arm], { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector(".order__benefits", { state: "attached", timeout: 45000 });
  await p.waitForTimeout(9000);
  await p.addStyleTag({ content: "#shopify-section-timedModal,.cre-wb-test-28-overlay,.cre-wb-test-28-popup{display:none!important}" });
  const info = await p.evaluate(() => {
    const cs = (el, k) => (el ? getComputedStyle(el)[k] : null);
    const r = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top + scrollY), Math.round(x.width), Math.round(x.height)].join(","); };
    const cont = document.querySelector('.order__benefits [class*="cre-t-2"][class$="-container"]');
    const exps = {};
    try { const d = window.convert && convert.data && convert.data.experiences; (Array.isArray(d) ? d : Object.values(d || {})).forEach((e) => { if (/291|269/.test(e.name || "") || /100350916|100350736/.test(String(e.id))) exps[e.id] = { name: e.name, status: e.status, goals: e.goals, variations: (e.variations || []).map((v) => v.id + ":" + v.name) }; }); } catch (e) {}
    let cur = null; try { const ce = convert.currentData.experiences; cur = Object.keys(ce).map((k) => k + "=" + (ce[k].variation && ce[k].variation.id)); } catch (e) {}
    return {
      classes: [...document.body.classList].filter((x) => /cre|cro/i.test(x)),
      nativeItemsDisplay: cs(document.querySelector(".order__benefits-items"), "display"),
      containerClass: cont && cont.className, containerCount: document.querySelectorAll('.order__benefits [class$="-container"][class*="cre-t-"]').length,
      container: cont && { bg: cs(cont, "backgroundColor"), radius: cs(cont, "borderRadius"), rect: r(cont), cols: cs(cont.querySelector('[role="list"]'), "gridTemplateColumns"), pad: cs(cont.firstElementChild, "padding") },
      items: cont ? [...cont.querySelectorAll('[class$="-link"]')].map((a) => { const t = a.querySelector('[class$="-text"]'); const i = a.querySelector("img"); return { tag: a.tagName, text: t && t.innerText, href: a.getAttribute("href"), tabindex: a.getAttribute("tabindex"), role: a.getAttribute("role"), target: a.dataset.creTarget, rect: r(a), font: t && [cs(t, "fontFamily").slice(0, 25), cs(t, "fontSize"), cs(t, "fontWeight"), cs(t, "lineHeight"), cs(t, "letterSpacing"), cs(t, "color"), cs(t, "textDecorationLine")].join("|"), cursor: cs(a, "cursor"), img: i && i.naturalWidth + "x" + i.naturalHeight + " " + Math.round(i.getBoundingClientRect().width) + "x" + Math.round(i.getBoundingClientRect().height) }; }) : null,
      exps, cur,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await p.evaluate(() => document.querySelector(".order__benefits")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(800);
  const tag = `${arm}-${engName}-${w}`;
  await p.screenshot({ path: path.join(OUT, `${tag}.png`) });
  const bar = p.locator(".order__benefits");
  if (await bar.isVisible()) await bar.screenshot({ path: path.join(OUT, `${tag}-bar.png`) });
  if (doClick) {
    const sel = '.order__benefits [class$="-link"]';
    const n = await p.locator(sel).count();
    for (let i = 0; i < n; i++) {
      await p.evaluate(() => document.querySelector(".order__benefits")?.scrollIntoView({ block: "center" }));
      await p.waitForTimeout(600);
      await p.evaluate(() => (window.__goals.length = 0));
      const y0 = await p.evaluate(() => scrollY), u0 = p.url();
      const el = p.locator(sel).nth(i);
      const label = await el.innerText();
      await el.click({ force: true });
      await p.waitForTimeout(2500);
      console.log("CLICK", JSON.stringify(label.trim()), "goals", JSON.stringify(await p.evaluate(() => window.__goals)), "scrollDelta", (await p.evaluate(() => scrollY)) - y0, "urlChanged", p.url() !== u0);
    }
  }
  console.log("errors:", errs.slice(0, 5), "\nlogs:", logs.slice(0, 12));
  await b.close();
})().catch((e) => { console.log("FAILED", e.message.split("\n")[0]); process.exit(1); });
