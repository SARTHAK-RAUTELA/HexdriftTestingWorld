// @ts-check
/**
 * WIN272 - WinkBeds "Shop Page - Truemed Badges" (cre-t-272, Convert exp 100350648)
 *
 * Variation appends `.cre-t-272-container` ("HSA/FSA eligible with [Truemed logo]") to
 * #orderForm, and uses flex `order` to slot it between the payment-icons row and the
 * "Or buy now, pay later" financing block. Figma (Group 3.png) asks for:
 *   - this exact location,
 *   - font styles exactly matching the financing copy (bold "HSA/FSA eligible", regular "with"),
 *   - equal margin above and below the new element.
 *
 * Code: local_testing/Local2/variation/va3.js / va3.css (body class `cre-t-272`).
 * NOTE: the `order` rules are scoped to `body.cre-t-272.cre-t-202` - placement depends on the
 * coexisting cre-t-202 test (which itself sets financing order:3). TC-07 covers the no-202 case.
 *
 * WinkBeds quirks (qa-knowledge-base/winkbeds/_client-notes.md): navigator.webdriver override,
 * domcontentloaded wait, popups hidden via CSS, raw DOM clicks, polling assertions.
 */
const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed?cro_mode=qa";
const URLS = {
  control: `${BASE}&_conv_eforce=100350648.1003184744`,
  variation: `${BASE}&_conv_eforce=100350648.1003184745`,
};
const BADGE = ".cre-t-272-container";
const PAY = ".order-form__payments-wrapper";
const FIN = ".order-form__financing-buy-box-container";
const FIN_BOLD = ".order-form__financing-buy-box-payment-text-content";
const SHOT_DIR = path.join(__dirname, "..", "qa-knowledge-base", "winkbeds", "win272-screenshots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

async function gotoArm(page, arm) {
  await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(URLS[arm], { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#orderForm.loaded " + PAY, { timeout: 45000 });
  if (arm === "variation") await page.waitForSelector(BADGE, { timeout: 20000 });
  await page.waitForTimeout(2000);
  await dismissPopups(page);
  return errors;
}

// "We get it..." retention popup + other timed overlays: click their close button, then hide
// any fixed full-screen overlay so screenshots of the Buy Box are unobstructed.
async function dismissPopups(page) {
  await page.evaluate(() => {
    document.querySelectorAll("button").forEach((b) => { if (/OK, GOT IT/i.test(b.textContent || "")) b.click(); });
    document.querySelectorAll("body *").forEach((e) => {
      const c = getComputedStyle(e);
      if ((c.position === "fixed") && e.getBoundingClientRect().width >= innerWidth * 0.9 && e.getBoundingClientRect().height >= innerHeight * 0.5) e.style.setProperty("display", "none", "important");
    });
    document.documentElement.style.overflow = "auto"; document.body.style.overflow = "auto";
  });
}

function layout(page) {
  return page.evaluate(({ BADGE, PAY, FIN }) => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY, left: b.left, right: b.right, w: b.width, h: b.height }; };
    return { count: document.querySelectorAll(BADGE).length, badge: r(BADGE), pay: r(PAY), fin: r(FIN), docW: document.documentElement.scrollWidth, vw: innerWidth, body: document.body.className };
  }, { BADGE, PAY, FIN });
}

async function shot(page, name) {
  const proj = test.info().project.name.replace(/[^a-z0-9]+/gi, "_");
  await dismissPopups(page);
  const target = (await page.$(BADGE)) || (await page.$(FIN));
  if (target) await target.evaluate((e) => e.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(600);
  const vp = page.viewportSize();
  const fb = await page.evaluate(() => { const b = document.querySelector("#orderForm").getBoundingClientRect(); return { x: b.left, w: b.width }; });
  const x = Math.max(0, fb.x - 8);
  const clip = { x, y: Math.max(0, vp.height / 2 - 260), width: Math.min(vp.width - x, fb.w + 16), height: Math.min(520, vp.height) };
  await page.screenshot({ path: path.join(SHOT_DIR, `${proj}__${name}.png`), clip });
}

test.describe("WIN272 Truemed badge", () => {
  test("TC-01 control: no badge, native financing block intact", async ({ page }) => {
    const errors = await gotoArm(page, "control");
    const l = await layout(page);
    expect(l.count).toBe(0);
    expect(l.body).not.toMatch(/\bcre-t-272\b/);
    expect(l.fin).not.toBeNull();
    expect(l.fin.top).toBeGreaterThan(l.pay.top);
    await shot(page, "control");
    expect(errors.filter((e) => /272/.test(e))).toEqual([]);
  });

  test("TC-02 variation: single badge with correct copy + Truemed logo loaded", async ({ page }) => {
    const errors = await gotoArm(page, "variation");
    const l = await layout(page);
    expect(l.count).toBe(1);
    expect(l.body).toMatch(/\bcre-t-272\b/);
    const txt = await page.locator(".cre-t-272-hsa-text").evaluate((e) => e.textContent.replace(/\s+/g, " ").trim());
    expect(txt).toBe("HSA/FSA eligible with");
    const img = await page.locator(".cre-t-272-hsa-logo").evaluate((i) => ({ ok: i.complete && i.naturalWidth > 0, alt: i.alt, w: i.getBoundingClientRect().width }));
    expect(img.ok).toBe(true);
    expect(img.alt).toBe("Truemed");
    expect(img.w).toBeGreaterThan(80);
    await shot(page, "variation");
    expect(errors.filter((e) => /272/.test(e))).toEqual([]);
  });

  test("TC-03 placement: below payment icons, above financing block, centered", async ({ page }) => {
    await gotoArm(page, "variation");
    const l = await layout(page);
    expect(l.badge.top).toBeGreaterThanOrEqual(l.pay.bottom);
    expect(l.badge.bottom).toBeLessThanOrEqual(l.fin.top);
    const t = await page.evaluate(() => { const b = document.querySelector(".cre-t-272-hsa-text").getBoundingClientRect(); return b.left + b.width / 2; });
    expect(Math.abs(t - (l.badge.left + l.badge.w / 2))).toBeLessThan(3);
  });

  test("TC-04 equal margin above and below", async ({ page }) => {
    await gotoArm(page, "variation");
    const l = await layout(page);
    const above = l.badge.top - l.pay.bottom;
    const below = l.fin.top - l.badge.bottom;
    test.info().annotations.push({ type: "gaps", description: `above=${above.toFixed(1)} below=${below.toFixed(1)}` });
    expect(Math.abs(above - below)).toBeLessThanOrEqual(2);
  });

  test("TC-05 font styles match the financing copy", async ({ page }) => {
    await gotoArm(page, "variation");
    const s = await page.evaluate(({ FIN_BOLD }) => {
      const pick = (sel) => { const c = getComputedStyle(document.querySelector(sel)); return { family: c.fontFamily, size: c.fontSize, weight: c.fontWeight, lh: c.lineHeight, color: c.color, ls: c.letterSpacing }; };
      return { label: pick(".cre-t-272-hsa-label"), with: pick(".cre-t-272-hsa-with"), finBold: pick(FIN_BOLD) };
    }, { FIN_BOLD });
    test.info().annotations.push({ type: "fonts", description: JSON.stringify(s) });
    for (const k of ["family", "size", "lh", "color", "weight"]) expect.soft(s.label[k], `label ${k}`).toBe(s.finBold[k]);
    expect.soft(s.with.weight, "'with' weight (regular)").toBe("400");
    expect.soft(s.with.size, "'with' size").toBe(s.finBold.size);
    expect.soft(s.label.ls, "letter-spacing matches financing copy").toBe(s.finBold.ls);
  });

  test("TC-06 badge persists (single instance, in place) after size/firmness change", async ({ page }) => {
    await gotoArm(page, "variation");
    for (const [sel, val] of [["#size-select", "King"], ["#firmness-select", "Firmer"], ["#size-select", "Twin"]]) {
      await page.selectOption(sel, val);
      await page.waitForTimeout(2000);
      const l = await layout(page);
      expect(l.count, `${sel}=${val}`).toBe(1);
      expect(l.badge.top).toBeGreaterThanOrEqual(l.pay.bottom);
      expect(l.badge.bottom).toBeLessThanOrEqual(l.fin.top);
    }
  });

  test("TC-07 placement does not depend on cre-t-202 being active", async ({ page }) => {
    await gotoArm(page, "variation");
    // cre-t-202 re-adds its body class on its own, so keep it stripped to simulate the test being off
    await page.evaluate(() => {
      document.body.classList.remove("cre-t-202");
      new MutationObserver(() => { if (document.body.classList.contains("cre-t-202")) document.body.classList.remove("cre-t-202"); })
        .observe(document.body, { attributes: true, attributeFilter: ["class"] });
    });
    await page.waitForTimeout(1500);
    const l = await layout(page);
    test.info().annotations.push({ type: "no-202", description: JSON.stringify({ badge: Math.round(l.badge.top), pay: Math.round(l.pay.top), fin: Math.round(l.fin.top) }) });
    await shot(page, "no-cre-t-202");
    expect.soft(l.badge.top, "badge should still sit below payment icons").toBeGreaterThanOrEqual(l.pay.bottom);
  });

  test("TC-08 narrow widths (320/280): no overflow, logo inside container", async ({ page }) => {
    await gotoArm(page, "variation");
    for (const w of [320, 280]) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.waitForTimeout(800);
      const r = await page.evaluate(() => {
        const c = document.querySelector(".cre-t-272-container").getBoundingClientRect();
        const i = document.querySelector(".cre-t-272-hsa-logo").getBoundingClientRect();
        return { cL: c.left, cR: c.right, iL: i.left, iR: i.right };
      });
      expect(r.iR, `logo right edge @${w}`).toBeLessThanOrEqual(r.cR + 1);
      expect(r.iL).toBeGreaterThanOrEqual(r.cL - 1);
      await shot(page, `w${w}`);
    }
  });

  for (const arm of ["control", "variation"]) {
    test(`TC-09${arm === "control" ? "a" : "b"} Add to Cart works (${arm})`, async ({ page }) => {
      await gotoArm(page, arm);
      const btn = page.locator(".order-form__add.button").first();
      await btn.evaluate((e) => e.scrollIntoView({ block: "center" }));
      await btn.click({ force: true });
      await expect.poll(() => page.evaluate(() => fetch("/cart.js", { cache: "no-store" }).then((r) => r.json()).then((j) => j.item_count)), { timeout: 20000 }).toBeGreaterThan(0);
    });
  }
});
