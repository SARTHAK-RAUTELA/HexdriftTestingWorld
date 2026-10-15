// WIN269 (cre-t-269) — WinkBeds Shop Page Reassurance Benefits (Desktop)
// Convert exp 100350736 · control 1003184950 · variation 1003184951
// Spec source: wireframe "Group 1944.png" (variation = 6 underlined links, 3 per row, copy/icons/destinations as WIN282).
// Run desktop projects only, one at a time:  npx playwright test win269 --project="Chrome Desktop"
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed?convert_action=convert_vpreview&convert_e=100350736&convert_v=";
const CONTROL = BASE + "1003184950";
const VARIATION = BASE + "1003184951";
const SHOTS = path.join(__dirname, "..", "qa-knowledge-base", "winkbeds", "win269-screenshots");
const RESULTS = path.join(__dirname, "..", "qa-knowledge-base", "winkbeds", "win269-results");
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(RESULTS, { recursive: true });

const ANY_GOAL = "100334667";
// wireframe order (3 per row) + destination + the per-benefit goal the experiment should fire.
// Exp 100350736 has 8 per-benefit code goals attached (100334659-666); the variation code only maps 3 of them,
// so showrooms/usa/rating expect "a per-benefit goal" (any id in that range other than the any-benefit one).
const BENEFITS = [
  { target: "trial", text: "120-Night Home Trial", section: "#shopify-section-shop-the-winkbed-warranty", goal: "100334659" },
  { target: "shipping", text: "Free Shipping & Returns", section: "#faq-content .concertina--open .concertina__title", goal: "100334660" },
  { target: "showrooms", text: "150+ Showrooms", section: null, goal: null },
  { target: "warranty", text: "Lifetime Warranty", section: "#shopify-section-shop-promise", goal: "100334662" },
  { target: "usa", text: "Handmade in the U.S.A.", section: "#shopify-section-shop-hi-touch", goal: null },
  { target: "rating", text: "Rated 4.8 stars", section: "#shopify-section-testimonials", goal: null },
];
const CONTROL_BENEFITS = [
  { text: "120-night risk-free trial", goal: "100334659" },
  { text: "Lifetime warranty", goal: "100334662" },
  { text: "Free shipping and returns", goal: "100334660" },
  { text: "Financing available", goal: "100334666" },
];
const PER_BENEFIT_IDS = ["100334659", "100334660", "100334661", "100334662", "100334663", "100334664", "100334665", "100334666"];

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
  await page.addStyleTag({ content: "#shopify-section-timedModal,.cre-wb-test-28-overlay,.cre-wb-test-28-popup{display:none!important}" }).catch(() => {});
}

async function shot(page, testInfo, name, locator) {
  const file = path.join(SHOTS, `${testInfo.project.name.replace(/\W+/g, "-")}-${name}.png`);
  if (locator) await locator.screenshot({ path: file }).catch(() => page.screenshot({ path: file }));
  else await page.screenshot({ path: file });
  await testInfo.attach(name, { path: file, contentType: "image/png" });
}

// DOM click: fires mousedown (goal listener) + click (scroll listener) like a real pointer click,
// and bypasses popups / WebKit "not stable" actionability loops (see winkbeds/_client-notes.md).
async function domPointerClick(page, selector) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    const opts = { bubbles: true, cancelable: true, view: window, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.click();
  }, selector);
}

test.describe("WIN269 control", () => {
  test("C1 control keeps the native 4-icon bar, no variation bar", async ({ page }, testInfo) => {
    await open(page, CONTROL);
    await expect(page.locator("body")).toHaveClass(/cre-t-269-control/, { timeout: 20000 });
    await expect(page.locator(".cre-t-269-container")).toHaveCount(0);
    await expect(page.locator(".order__benefit")).toHaveCount(4);
    await expect(page.locator(".order__benefits-items")).toBeVisible();
    await page.locator(".order__benefits").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(500);
    await shot(page, testInfo, "C1-control-bar", page.locator(".order__benefits"));
  });

  test("C2 control: each benefit click fires any-benefit + its own goal once", async ({ page }) => {
    await open(page, CONTROL);
    await expect(page.locator("body")).toHaveClass(/cre-t-269-control/, { timeout: 20000 });
    await page.waitForTimeout(1500);
    for (let i = 0; i < CONTROL_BENEFITS.length; i++) {
      await page.evaluate(() => (window.__goals.length = 0));
      await domPointerClick(page, `.order__benefit:nth-child(${i + 1})`);
      await page.waitForTimeout(300);
      const g = await page.evaluate(() => window.__goals.filter((x) => /^1003346(59|6[0-7])$/.test(x)));
      const label = (await page.locator(".order__benefit").nth(i).innerText()).replace(/\s+/g, " ").trim();
      const expected = CONTROL_BENEFITS.find((b) => label.toLowerCase() === b.text.toLowerCase());
      expect.soft(expected, `control item ${i} "${label}" is a known benefit`).toBeTruthy();
      expect.soft(g, `goals for "${label}"`).toEqual([ANY_GOAL, expected && expected.goal]);
    }
  });
});

test.describe("WIN269 variation", () => {
  test("V1 variation bar replaces the native bar with 6 links in wireframe order + copy", async ({ page }, testInfo) => {
    await open(page, VARIATION);
    await expect(page.locator("body")).toHaveClass(/cre-t-269-d/, { timeout: 20000 });
    await expect(page.locator(".cre-t-269-container")).toHaveCount(1);
    await expect(page.locator(".cre-t-269-container")).toBeVisible();
    await expect(page.locator(".order__benefits-items")).toBeHidden();
    const texts = await page.locator(".cre-t-269-link .cre-t-269-text").allInnerTexts();
    expect(texts).toEqual(BENEFITS.map((b) => b.text));
    await page.locator(".cre-t-269-container").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(800);
    await shot(page, testInfo, "V1-variation-bar-1440", page.locator(".cre-t-269-container"));
    await shot(page, testInfo, "V1-variation-page-1440");
  });

  test("V2 layout at 1440: 2 rows x 3 columns, light-blue rounded card (wireframe)", async ({ page }) => {
    await open(page, VARIATION, 1440);
    await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
    const box = await page.locator(".cre-t-269-container").evaluate((c) => {
      const s = getComputedStyle(c);
      const tops = [...c.querySelectorAll(".cre-t-269-item")].map((i) => Math.round(i.getBoundingClientRect().top));
      return { bg: s.backgroundColor, radius: s.borderRadius, rows: [...new Set(tops)].length };
    });
    expect(box.bg).toBe("rgb(237, 244, 252)");
    expect(box.radius).toBe("24px");
    expect(box.rows).toBe(2);
  });

  test("V3 layout at 1366 (common laptop) still matches wireframe 3-per-row", async ({ page }, testInfo) => {
    await open(page, VARIATION, 1366);
    await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
    await page.locator(".cre-t-269-container").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(800);
    await shot(page, testInfo, "V3-variation-bar-1366", page.locator(".cre-t-269-container"));
    const rows = await page.locator(".cre-t-269-item").evaluateAll((items) => new Set(items.map((i) => Math.round(i.getBoundingClientRect().top))).size);
    expect(rows, "wireframe shows 3 links per row (2 rows); 1001-1439px renders 2 per row (3 rows)").toBe(2);
  });

  test("V4 link styling: underlined, navy, pointer, site font, no overflow", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
    const styles = await page.locator(".cre-t-269-link").evaluateAll((links) =>
      links.map((a) => {
        const t = a.querySelector(".cre-t-269-text");
        const s = getComputedStyle(t);
        return { deco: s.textDecorationLine, color: s.color, font: s.fontFamily, cursor: getComputedStyle(a).cursor, overflow: a.getBoundingClientRect().right > a.closest(".cre-t-269-container").getBoundingClientRect().right };
      }),
    );
    for (const s of styles) {
      expect.soft(s.deco).toContain("underline");
      expect.soft(s.color).toBe("rgb(3, 12, 45)");
      expect.soft(s.font).toMatch(/greycliff/i);
      expect.soft(s.cursor).toBe("pointer");
      expect.soft(s.overflow).toBe(false);
    }
  });

  test("V5 all 6 icons load and render", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
    await page.locator(".cre-t-269-container").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await expect
      .poll(() => page.locator(".cre-t-269-icon").evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().width > 0).length), { timeout: 15000 })
      .toBe(6);
  });

  test("V6 not shown at 1000px and below (desktop-only test)", async ({ page }) => {
    await open(page, VARIATION, 1000);
    await page.waitForTimeout(6000);
    await expect(page.locator(".cre-t-269-container")).toBeHidden();
  });

  for (const b of BENEFITS) {
    test(`V7 ${b.target}: click fires any-benefit + per-benefit goal once, no hash change`, async ({ page }) => {
      await open(page, VARIATION);
      await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(1500);
      await page.evaluate(() => (window.__goals.length = 0));
      await domPointerClick(page, `.cre-t-269-link[data-cre-target="${b.target}"]`);
      await page.waitForTimeout(500);
      const goals = await page.evaluate(() => window.__goals.filter((x) => /^1003346(59|6[0-7])$/.test(x)));
      expect.soft(goals.filter((g) => g === ANY_GOAL).length, "any-benefit goal fires once").toBe(1);
      const own = goals.filter((g) => PER_BENEFIT_IDS.includes(g));
      if (b.goal) expect.soft(own, "per-benefit goal").toEqual([b.goal]);
      else expect.soft(own.length, `"${b.text}" needs its own per-benefit goal (ticket: 6 goals)`).toBe(1);
      expect.soft(await page.evaluate(() => location.hash)).toBe("");
    });

    test(`V8 ${b.target}: lands on its section below the sticky nav (fresh load)`, async ({ page }, testInfo) => {
      test.setTimeout(120000);
      await open(page, VARIATION);
      await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(3000);
      await domPointerClick(page, `.cre-t-269-link[data-cre-target="${b.target}"]`);
      const probe = (s) => {
        if (!s) {
          const h = [...document.querySelectorAll("h1,h2,h3")].find((x) => /Try The WinkBed In Person/i.test(x.textContent));
          return h ? Math.round(h.getBoundingClientRect().top) : null;
        }
        const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().height > 0);
        return e ? Math.round(e.getBoundingClientRect().top) : null;
      };
      const tops = [];
      for (let i = 0; i < 7; i++) {
        await page.waitForTimeout(1000);
        tops.push(await page.evaluate(probe, b.section));
      }
      await shot(page, testInfo, `V8-land-${b.target}`);
      testInfo.annotations.push({ type: "landing", description: `${b.target} target top over 7s: ${tops.join(" ")}` });
      const finalTop = tops[tops.length - 1];
      // sticky header + shop nav bar end at ~165px; code uses a 160px offset
      expect(finalTop, `target top should sit just under the sticky nav (100-400px for showrooms heading, 100-260 otherwise); samples ${tops.join(" ")}`).not.toBeNull();
      expect(finalTop).toBeGreaterThanOrEqual(100);
      expect(finalTop).toBeLessThanOrEqual(b.target === "showrooms" ? 400 : 260);
      if (b.target === "shipping") {
        await expect(page.locator("#faq-content .concertina--open .concertina__title").first()).toContainText(/Can I return or exchange/i);
      }
    });
  }

  test("V9 keyboard: Enter on a benefit link scrolls and fires goals", async ({ page }) => {
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => (window.__goals.length = 0));
    const y0 = await page.evaluate(() => scrollY);
    await page.locator('.cre-t-269-link[data-cre-target="rating"]').focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    expect.soft(await page.evaluate(() => scrollY), "page scrolled").not.toBe(y0);
    expect.soft(await page.evaluate(() => window.__goals.includes("100334667")), "any-benefit goal fires on keyboard activation").toBe(true);
  });

  test("V10 no page errors from the variation", async ({ page }) => {
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await open(page, VARIATION);
    await expect(page.locator(".cre-t-269-container")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(3000);
    expect(errs.filter((e) => /269/.test(e))).toEqual([]);
  });
});

test.afterEach(async ({}, testInfo) => {
  const row = {
    project: testInfo.project.name, title: testInfo.title, status: testInfo.status, duration: testInfo.duration,
    errors: testInfo.errors.map((e) => (e.message || "").replace(/\u001b\[[0-9;]*m/g, "").split("\n").slice(0, 6).join("\n")),
    annotations: testInfo.annotations,
    attachments: testInfo.attachments.filter((a) => a.path).map((a) => path.relative(path.join(__dirname, "..", "qa-knowledge-base", "winkbeds"), a.path).replace(/\\/g, "/")),
  };
  fs.appendFileSync(path.join(RESULTS, "results.jsonl"), JSON.stringify(row) + "\n");
});
