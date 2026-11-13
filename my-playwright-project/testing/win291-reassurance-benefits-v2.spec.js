// WIN291 (cre-t-291) — WinkBeds Shop Page Reassurance Benefits V2 (Desktop)
// Convert exp 100350916 · control 1003185379 · variation 1003185380 · QA audience: utm_campaign contains "Cro291mode" + desktop
// Spec: control = WIN269 winner (6 underlined scroll links, cre-t-269-d). Variation = same, but no links + no underline.
// Goals: 6 per-benefit (100334790-793, 804, 805) + any-benefit 100334789.
// Run desktop projects one at a time:  npx playwright test win291 --project="Chrome Desktop"
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro291mode&_conv_eforce=100350916.";
const CONTROL = BASE + "1003185379";
const VARIATION = BASE + "1003185380";
// WIN269 winner (reference for "the same"): forced WIN269 variation, no Cro291mode param
const WIN269_WINNER = "https://www.winkbeds.com/pages/shop-winkbed?_conv_eforce=100350736.1003184951";
const KB = path.join(__dirname, "..", "qa-knowledge-base", "winkbeds");
const SHOTS = path.join(KB, "win291-screenshots");
const RESULTS = path.join(KB, "win291-results");
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(RESULTS, { recursive: true });

const ANY_GOAL = "100334789";
const BENEFITS = [
  { target: "trial", text: "365-Night Home Trial", goal: "100334790" },
  { target: "shipping", text: "Free Shipping & Returns", goal: "100334791" },
  { target: "showrooms", text: "150+ Showrooms", goal: "100334792" },
  { target: "warranty", text: "Lifetime Warranty", goal: "100334793" },
  { target: "usa", text: "Handmade in the U.S.A.", goal: "100334804" },
  { target: "rating", text: "Rated 4.8 stars", goal: "100334805" },
];
const WIN291_GOALS = [ANY_GOAL, ...BENEFITS.map((b) => b.goal)];

async function open(page, url, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.__goals = [];
    setInterval(() => {
      const q = (window._conv_q = window._conv_q || []);
      if (q.__hooked) return;
      const orig = q.push.bind(q);
      q.push = function (...a) {
        a.forEach((x) => Array.isArray(x) && x[0] === "triggerConversion" && window.__goals.push(String(x[1])));
        return orig(...a);
      };
      q.__hooked = true;
    }, 20);
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".order__benefits", { state: "attached", timeout: 45000 });
  await page.addStyleTag({ content: "#shopify-section-timedModal,.cre-wb-test-28-overlay,.cre-wb-test-28-popup,#cre-t-18-modal{display:none!important}" }).catch(() => {});
}

async function shot(page, testInfo, name, locator) {
  const file = path.join(SHOTS, `${testInfo.project.name.replace(/\W+/g, "-")}-${name}.png`);
  if (locator) await locator.screenshot({ path: file }).catch(() => page.screenshot({ path: file }));
  else await page.screenshot({ path: file });
  await testInfo.attach(name, { path: file, contentType: "image/png" });
}

async function centerBar(page) {
  await page.evaluate(() => document.querySelector(".order__benefits")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(700);
}

// geometry of a benefit bar (prefix = cre-t-269 or cre-t-291), relative to the container
async function barGeometry(page, prefix) {
  return page.evaluate((p) => {
    const c = document.querySelector(`.${p}-container`);
    if (!c || c.getBoundingClientRect().height === 0) return null;
    const cr = c.getBoundingClientRect();
    const items = [...c.querySelectorAll(`.${p}-link`)].map((a) => {
      const r = a.getBoundingClientRect();
      const t = a.querySelector(`.${p}-text`);
      const s = getComputedStyle(t);
      return { text: t.innerText.trim(), x: Math.round(r.left - cr.left), y: Math.round(r.top - cr.top), w: Math.round(r.width), font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight}` };
    });
    const cs = getComputedStyle(c);
    return { w: Math.round(cr.width), h: Math.round(cr.height), bg: cs.backgroundColor, radius: cs.borderRadius, rows: new Set(items.map((i) => i.y)).size, items };
  }, prefix);
}

test.describe("WIN291 control (= WIN269 winner)", () => {
  test("C1 control shows the WIN269 winner bar: 6 underlined links", async ({ page }, testInfo) => {
    await open(page, CONTROL);
    await page.waitForTimeout(8000);
    await centerBar(page);
    await shot(page, testInfo, "C1-control-bar", page.locator(".order__benefits"));
    const state = await page.evaluate(() => ({
      winner: document.querySelectorAll(".cre-t-269-container a.cre-t-269-link").length,
      native: getComputedStyle(document.querySelector(".order__benefits-items")).display,
      nativeText: [...document.querySelectorAll(".order__benefit")].map((e) => e.innerText.replace(/\s+/g, " ").trim()),
    }));
    testInfo.annotations.push({ type: "control-state", description: JSON.stringify(state) });
    expect(state.winner, `control should render the WIN269 winner (6 links); it renders the native bar instead: ${state.nativeText.join(" | ")}`).toBe(6);
  });

  test("C2 control: clicking a benefit fires the WIN291 any-benefit + per-benefit goals", async ({ page }) => {
    await open(page, CONTROL);
    await page.waitForTimeout(8000);
    await page.evaluate(() => (window.__goals.length = 0));
    const sel = (await page.locator(".cre-t-269-link").count()) ? ".cre-t-269-link" : ".order__benefit";
    await page.evaluate((s) => { const e = document.querySelector(s); e.scrollIntoView({ block: "center" }); e.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); e.click(); }, sel);
    await page.waitForTimeout(800);
    const g = await page.evaluate(() => window.__goals);
    expect(g.filter((x) => x === "100334789"), `control (${sel}) fired [${g.join(",")}]; WIN291 goals are only coded in the variation`).toHaveLength(1);
  });
});

test.describe("WIN291 variation", () => {
  test("V1 bar replaces the native bar: 6 benefits, WIN269 order + copy", async ({ page }, testInfo) => {
    await open(page, VARIATION);
    await expect(page.locator("body")).toHaveClass(/cre-t-291-d/, { timeout: 20000 });
    await expect(page.locator(".cre-t-291-container")).toHaveCount(1);
    await expect(page.locator(".cre-t-291-container")).toBeVisible();
    await expect(page.locator(".order__benefits-items")).toBeHidden();
    await expect(page.locator(".cre-t-269-container")).toHaveCount(0);
    expect(await page.locator(".cre-t-291-text").allInnerTexts()).toEqual(BENEFITS.map((b) => b.text));
    await centerBar(page);
    await shot(page, testInfo, "V1-variation-bar-1440", page.locator(".order__benefits"));
    await shot(page, testInfo, "V1-variation-page-1440");
  });

  test("V2 no links: no <a>/href, no underline, default cursor, not in tab order", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-291-container")).toBeVisible({ timeout: 20000 });
    const r = await page.evaluate(() => {
      const c = document.querySelector(".cre-t-291-container");
      return {
        anchors: c.querySelectorAll("a, [href], [role=link], [role=button]").length,
        tabbable: c.querySelectorAll("[tabindex]:not([tabindex='-1']), a, button").length,
        items: [...c.querySelectorAll(".cre-t-291-link")].map((a) => {
          const t = a.querySelector(".cre-t-291-text");
          return { deco: getComputedStyle(t).textDecorationLine + "/" + getComputedStyle(a).textDecorationLine, cursor: getComputedStyle(a).cursor + "/" + getComputedStyle(t).cursor };
        }),
      };
    });
    expect(r.anchors).toBe(0);
    expect(r.tabbable).toBe(0);
    for (const i of r.items) {
      expect.soft(i.deco).toBe("none/none");
      expect.soft(i.cursor).toBe("default/default");
    }
  });

  test("V3 hover: no underline / link affordance appears", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-291-container")).toBeVisible({ timeout: 20000 });
    await centerBar(page);
    for (const b of BENEFITS) {
      const el = page.locator(`.cre-t-291-link[data-cre-target="${b.target}"]`);
      await el.hover({ force: true });
      const s = await el.evaluate((a) => { const t = a.querySelector(".cre-t-291-text"); return getComputedStyle(t).textDecorationLine + "|" + getComputedStyle(t).color + "|" + getComputedStyle(a).cursor; });
      expect.soft(s, b.target).toBe("none|rgb(3, 12, 45)|default");
    }
  });

  for (const b of BENEFITS) {
    test(`V4 ${b.target}: click fires any-benefit + own goal once, no scroll, no navigation`, async ({ page }) => {
      await open(page, VARIATION);
      await expect(page.locator(".cre-t-291-container")).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(1500);
      await centerBar(page);
      expect(await page.evaluate((ids) => window.__goals.filter((g) => ids.includes(g)), WIN291_GOALS), "no WIN291 goal before any click").toEqual([]);
      const y0 = await page.evaluate(() => Math.round(scrollY));
      const u0 = page.url();
      await page.locator(`.cre-t-291-link[data-cre-target="${b.target}"]`).click({ force: true });
      await page.waitForTimeout(2500);
      const goals = await page.evaluate((ids) => window.__goals.filter((g) => ids.includes(g)), WIN291_GOALS);
      expect.soft(goals.sort()).toEqual([ANY_GOAL, b.goal].sort());
      expect.soft(Math.abs((await page.evaluate(() => Math.round(scrollY))) - y0), "page must not scroll").toBeLessThanOrEqual(2);
      expect.soft(page.url()).toBe(u0);
    });
  }

  test("V5 clicking the icon and the card padding: icon counts, padding does not", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-291-container")).toBeVisible({ timeout: 20000 });
    await centerBar(page);
    await page.evaluate(() => (window.__goals.length = 0));
    await page.locator('.cre-t-291-link[data-cre-target="usa"] .cre-t-291-icon').click({ force: true });
    await page.waitForTimeout(500);
    expect.soft(await page.evaluate(() => window.__goals.slice()), "icon click").toEqual([ANY_GOAL, "100334804"]);
    await page.evaluate(() => (window.__goals.length = 0));
    await page.locator(".cre-t-291-wrapper").click({ position: { x: 5, y: 5 }, force: true });
    await page.waitForTimeout(500);
    expect.soft(await page.evaluate((ids) => window.__goals.filter((g) => ids.includes(g)), WIN291_GOALS), "padding click").toEqual([]);
  });

  test("V6 all 6 icons load and render", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-291-container")).toBeVisible({ timeout: 20000 });
    await centerBar(page);
    await expect
      .poll(() => page.locator(".cre-t-291-icon").evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().width > 0).length), { timeout: 15000 })
      .toBe(6);
  });

  for (const w of [1001, 1100, 1280, 1366, 1440, 1920]) {
    test(`V7 ${w}px: layout identical to the WIN269 winner (card, rows, item positions, font), no overflow`, async ({ browser }, testInfo) => {
      test.setTimeout(150000);
      const ctxA = await browser.newContext();
      const ctxB = await browser.newContext();
      const a = await ctxA.newPage();
      const b = await ctxB.newPage();
      await open(a, VARIATION, w);
      await open(b, WIN269_WINNER, w);
      await expect(a.locator(".cre-t-291-container")).toBeVisible({ timeout: 25000 });
      await expect(b.locator(".cre-t-269-container")).toBeVisible({ timeout: 25000 });
      await a.waitForTimeout(2500);
      await b.waitForTimeout(2500);
      await centerBar(a);
      await centerBar(b);
      await shot(a, testInfo, `V7-variation-${w}`, a.locator(".order__benefits"));
      await shot(b, testInfo, `V7-win269-winner-${w}`, b.locator(".order__benefits"));
      const ga = await barGeometry(a, "cre-t-291");
      const gb = await barGeometry(b, "cre-t-269");
      testInfo.annotations.push({ type: "geometry", description: `${w}px WIN291 ${ga.w}x${ga.h} rows ${ga.rows} | WIN269 ${gb.w}x${gb.h} rows ${gb.rows}` });
      expect.soft(ga.bg).toBe(gb.bg);
      expect.soft(ga.radius).toBe(gb.radius);
      expect.soft(ga.rows, "rows").toBe(gb.rows);
      expect.soft(Math.abs(ga.h - gb.h), `card height ${ga.h} vs ${gb.h}`).toBeLessThanOrEqual(2);
      ga.items.forEach((it, i) => {
        const ref = gb.items[i];
        expect.soft(it.text).toBe(ref.text);
        expect.soft(it.font, `${it.text} font`).toBe(ref.font);
        expect.soft(Math.abs(it.x - ref.x) + Math.abs(it.y - ref.y), `${it.text} position ${it.x},${it.y} vs ${ref.x},${ref.y}`).toBeLessThanOrEqual(3);
        expect.soft(it.x + it.w, `${it.text} inside the card`).toBeLessThanOrEqual(ga.w);
      });
      await ctxA.close();
      await ctxB.close();
    });
  }

  test("V8 not shown at 1000px (desktop-only CSS breakpoint), native bar unaffected", async ({ page }, testInfo) => {
    await open(page, VARIATION, 1000);
    await page.waitForTimeout(7000);
    await expect(page.locator(".cre-t-291-container")).toBeHidden();
    const nativeVisible = await page.locator(".order__benefits-items").isVisible();
    testInfo.annotations.push({ type: "1000px", description: `native bar visible: ${nativeVisible}` });
  });

  test("V9 no page errors from the variation, single injection after 10s", async ({ page }) => {
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-291-container")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(10000);
    await expect(page.locator(".cre-t-291-container")).toHaveCount(1);
    expect(errs.filter((e) => /291|cre-t-29/.test(e))).toEqual([]);
  });
});

test.afterEach(async ({}, testInfo) => {
  const row = {
    project: testInfo.project.name, title: testInfo.title, status: testInfo.status, duration: testInfo.duration,
    errors: testInfo.errors.map((e) => (e.message || "").replace(/\u001b\[[0-9;]*m/g, "").split("\n").slice(0, 6).join("\n")),
    annotations: testInfo.annotations,
    attachments: testInfo.attachments.filter((a) => a.path).map((a) => path.relative(KB, a.path).replace(/\\/g, "/")),
  };
  fs.appendFileSync(path.join(RESULTS, "results.jsonl"), JSON.stringify(row) + "\n");
});
