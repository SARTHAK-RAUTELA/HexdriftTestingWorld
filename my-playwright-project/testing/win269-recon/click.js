// WIN269: click each benefit, record _conv_q goal pushes, URL hash, and where the page lands over time.
// usage: node testing/win269-recon/click.js <engine> <control|variation> <width>
const pw = require("playwright");
const path = require("path");
const BASE = "https://www.winkbeds.com/pages/shop-winkbed?convert_action=convert_vpreview&convert_e=100350736&convert_v=";
const ARMS = { control: BASE + "1003184950", variation: BASE + "1003184951" };
const SECTION = { trial: "#shopify-section-shop-the-winkbed-warranty", shipping: "#faq-content", showrooms: "#shopify-section-shop-frames", warranty: "#shopify-section-shop-promise", usa: "#shopify-section-shop-hi-touch", rating: "#shopify-section-testimonials" };
(async () => {
  const [engName, arm, w] = process.argv.slice(2);
  const b = await pw[engName].launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.__goals = [];
    const hook = () => {
      const q = (window._conv_q = window._conv_q || []);
      if (q.__hooked) return;
      const orig = q.push.bind(q);
      q.push = function (...a) { a.forEach((x) => Array.isArray(x) && x[0] === "triggerConversion" && window.__goals.push(String(x[1]))); return orig(...a); };
      q.__hooked = true;
    };
    setInterval(hook, 20);
  });
  const p = await ctx.newPage();
  await p.goto(ARMS[arm], { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector(".order__benefits", { state: "attached", timeout: 45000 });
  await p.waitForTimeout(10000);
  await p.addStyleTag({ content: "#shopify-section-timedModal,.cre-wb-test-28-overlay,.cre-wb-test-28-popup{display:none!important}" });
  const convInfo = await p.evaluate(() => {
    const d = window.convert && (window.convert.data || window.convert);
    const goals = d && d.goals ? (Array.isArray(d.goals) ? d.goals : Object.values(d.goals)).map((g) => g.id + ":" + g.name).filter((s) => /269|benefit/i.test(s)) : "n/a";
    return { goals };
  });
  console.log("convert goals:", JSON.stringify(convInfo));
  const sel = arm === "control" ? ".order__benefit" : ".cre-t-269-link";
  const n = await p.locator(sel).count(); const order = (process.argv[5] || "").split(",").filter(Boolean).map(Number);
  for (const i of (order.length ? order : [...Array(n).keys()])) {
    await p.evaluate(() => { window.scrollTo(0, 0); window.__goals.length = 0; history.replaceState(null, "", location.pathname + location.search); });
    await p.waitForTimeout(400);
    const el = p.locator(sel).nth(i);
    await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(600);
    const label = (await el.innerText()).replace(/\s+/g, " ").trim();
    const target = arm === "control" ? null : await el.getAttribute("data-cre-target");
    const y0 = await p.evaluate(() => scrollY);
    const hit = await el.evaluate((e) => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h ? (e.contains(h) ? "self" : h.tagName + "." + h.className) : "none"; }); console.log("hit-test:", hit);
    await el.click({ force: true });
    const samples = [];
    for (const t of [1500, 3000, 6000]) {
      await p.waitForTimeout(t - (samples.length ? [0, 1500, 3000][samples.length] : 0));
      samples.push(await p.evaluate((s) => { const e = s && document.querySelector(s); return { y: Math.round(scrollY), top: e ? Math.round(e.getBoundingClientRect().top) : null }; }, target ? SECTION[target] : null));
    }
    const after = await p.evaluate(() => {
      const hdr = [...document.querySelectorAll("header, .header, [class*=sticky]")].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return (s.position === "fixed" || s.position === "sticky") && r.top <= 1 && r.height > 0 && r.height < 300; }).map((e) => Math.round(e.getBoundingClientRect().bottom));
      const stickyBottom = Math.max(0, ...hdr);
      const at = document.elementFromPoint(innerWidth / 2, stickyBottom + 20);
      let s = at; while (s && !(s.id || "").startsWith("shopify-section")) s = s.parentElement;
      const faqOpen = [...document.querySelectorAll("#faq-content .concertina--open .concertina__title")].map((t) => t.textContent.trim().slice(0, 40));
      return { hash: location.hash, stickyBottom, sectionAtTop: s && s.id, faqOpen, goals: window.__goals.slice() };
    });
    console.log(JSON.stringify({ label, target, y0, samples, ...after }));
    await p.screenshot({ path: path.join(__dirname, "out", `land-${arm}-${engName}-${w}-${target || i}.png`) });
  }
  // keyboard activation on first link (variation only)
  if (arm === "variation") {
    await p.evaluate(() => { window.scrollTo(0, 0); window.__goals.length = 0; });
    await p.locator(sel).first().focus();
    await p.keyboard.press("Enter");
    await p.waitForTimeout(3000);
    console.log("keyboard Enter on first link:", JSON.stringify(await p.evaluate(() => ({ y: Math.round(scrollY), goals: window.__goals.slice(), hash: location.hash }))));
  }
  await b.close();
})().catch((e) => { console.log("FAILED", e.message.split("\n")[0]); process.exit(1); });
