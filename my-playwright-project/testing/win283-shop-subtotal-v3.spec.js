// @ts-check
/**
 * WIN283 - WinkBeds "Shop Page - Select Sub-Total V3" (cre-t-283)
 *
 * Control = WIN266's winning V2 line: "N item(s) selected · $X total · Saving $Y".
 * Per wireframe (Group 5.png):
 *   - V1: same line, font +2px, plus the original pre-savings price struck through after "total"
 *         ("$1,799 total $2,570 · Saving $771").
 *   - V2: V1 + the savings amount in the button copy ("ADD TO CART · SAVE $771").
 * Like WIN266, amount/saving are dynamic and reflect what is being added to cart at that moment,
 * not the cart contents.
 *
 * Code (local_testing/Local2/variation): vB.js/vB.css = control, v2.js/v2.css = V1,
 * va3.js/va3.css = V2. V2 hides the native `.order-form__add.button` (`.cre-t-283-add-btn-original`)
 * and inserts a cloned div `.cre-t-283-add-btn` whose click forwards to the original.
 *
 * Preview URLs: the client-supplied V1/V2 links point at greenbuildingsupply.com (experiment
 * 100052955, a different client) and do not load WIN283 at all. The WinkBeds experiment is
 * 100350737; variation IDs 1003184953 (V1) and 1003184954 (V2) were confirmed live 2026-10-13 by
 * matching the rendered DOM against v2.js / va3.js.
 *
 * WinkBeds quirks (qa-knowledge-base/winkbeds/_client-notes.md): navigator.webdriver override,
 * domcontentloaded, forced/raw clicks for popup occlusion, polling assertions.
 */
const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro283mode&_conv_eforce=100350737.";
const URLS = {
  control: BASE + "1003184952",
  v1: BASE + "1003184953",
  v2: BASE + "1003184954",
};
const LINE = ".cre-t-283-subtotal-line";
const SHOT_DIR = path.join(__dirname, "..", "qa-knowledge-base", "winkbeds", "win283-screenshots");

async function openArm(browser, key, testInfo) {
  const slow = /Mobile|Safari/.test(testInfo.project.name);
  const u = testInfo.project.use;
  const context = await browser.newContext({
    viewport: u.viewport, screen: u.screen, userAgent: u.userAgent, deviceScaleFactor: u.deviceScaleFactor,
    isMobile: u.isMobile, hasTouch: u.hasTouch, ignoreHTTPSErrors: true,
  });
  context.setDefaultNavigationTimeout(60000);
  await context.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const page = await context.newPage();
  const errors = [];
  const cartPosts = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => /error in Test cre-t-283/.test(m.text()) && errors.push("variation: " + m.text()));
  page.on("request", (r) => r.method() === "POST" && /cart/i.test(r.url()) && cartPosts.push(r.url()));
  await page.goto(URLS[key], { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#orderForm.loaded .order-form__add", { state: "attached", timeout: 60000 });
  await expect.poll(() => page.locator(LINE).count(), { timeout: slow ? 20000 : 10000 }).toBe(1);
  // let init()'s 3s force-refresh window settle (and cre-t-202's strike badge populate)
  await page.waitForTimeout(3500);
  return { context, page, errors, cartPosts };
}

function readState(page) {
  return page.evaluate((LINE) => {
    const num = (t) => {
      const m = (t || "").replace(/,/g, "").match(/\$([0-9]+(\.[0-9]+)?)/);
      return m ? parseFloat(m[1]) : null;
    };
    const cs = (el, p) => (el ? getComputedStyle(el)[p] : null);
    const line = document.querySelector(LINE);
    const text = line ? line.textContent.replace(/\s+/g, " ").trim() : "";
    const strike = line && line.querySelector(".strike");
    const span = line && line.querySelector("span");
    const visibleBtn = [...document.querySelectorAll(".order-form__add.button")].find((b) => b.offsetParent !== null);
    const nativeBtn = document.querySelector(".order-form__add.button:not(.cre-t-283-add-btn)");
    const setupBtn = document.querySelector(".order-form__loadup-button");
    const setupPlus = setupBtn && setupBtn.querySelector(".order-form__loadup-button-icon-plus");
    let acc = 0, accCount = 0;
    document.querySelectorAll(".accessory-tray_item").forEach((i) => {
      const cb = i.querySelector(".add-to-accessory-cart");
      if (cb && cb.checked) { acc += num(i.querySelector(".accessory-item-title")?.textContent) || 0; accCount++; }
    });
    const setupSelected = !!(setupPlus && setupPlus.classList.contains("hide"));
    return {
      bodyClasses: [...document.body.classList].filter((c) => /cre-t-(2\d\d)/.test(c)),
      lineCount: document.querySelectorAll(LINE).length,
      text,
      count: +((text.match(/^(\d+) items? selected/) || [])[1] || NaN),
      total: num((text.match(/\$[\d,]+ total/) || [])[0]),
      strike: strike ? num(strike.textContent) : null,
      saving: span ? num(span.textContent) : null,
      hasStrike: !!strike,
      btnText: visibleBtn ? visibleBtn.textContent.replace(/\s+/g, " ").trim() : null,
      btnIsClone: !!(visibleBtn && visibleBtn.classList.contains("cre-t-283-add-btn")),
      nativeBtnVisible: !!(nativeBtn && nativeBtn.offsetParent !== null),
      base: num(document.querySelector(".price-row__pay-option-price")?.textContent),
      strike202: num(document.querySelector(".cre-t-202-box-strike-price")?.textContent),
      setupSelected,
      setupPrice: setupSelected ? num(setupBtn.querySelector(".order-form__loadup-button-price")?.textContent) : 0,
      setupCompare: num(document.querySelector(".order-form__loadup-button-compare-price")?.textContent),
      acc, accCount,
      style: line && {
        fontSize: parseFloat(cs(line, "fontSize")), fontFamily: cs(line, "fontFamily"), fontWeight: cs(line, "fontWeight"),
        color: cs(line, "color"), savingColor: cs(span, "color"),
        strikeColor: cs(strike, "color"), strikeDeco: cs(strike, "textDecorationLine"),
        overflow: line.scrollWidth > line.clientWidth + 1,
        lines: Math.round(line.getBoundingClientRect().height / parseFloat(cs(line, "lineHeight"))),
      },
      btnStyle: visibleBtn && {
        fontFamily: cs(visibleBtn, "fontFamily"), fontSize: cs(visibleBtn, "fontSize"),
        overflow: visibleBtn.scrollWidth > visibleBtn.clientWidth + 1,
        height: visibleBtn.getBoundingClientRect().height,
      },
      nativeBtnFont: nativeBtn && cs(nativeBtn, "fontFamily"),
    };
  }, LINE);
}

async function shot(page, testInfo, name) {
  try {
    await fs.promises.mkdir(SHOT_DIR, { recursive: true });
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), LINE);
    await page.waitForTimeout(400);
    const proj = testInfo.project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const file = path.join(SHOT_DIR, `${name}-${proj}.png`);
    await page.screenshot({ path: file });
    await testInfo.attach(name, { path: file, contentType: "image/png" });
  } catch (e) {}
}

async function toggleAccessory(page, name) {
  const item = page.locator(".accessory-tray_item").filter({ hasText: name }).first();
  await item.locator(".add-to-accessory-cart").click({ force: true });
}

const expectedLine = {
  control: /^\d+ items? selected · \$[\d,]+ total · Saving \$[\d,]+$/,
  v1: /^\d+ items? selected · \$[\d,]+ total ?\$[\d,]+ · Saving \$[\d,]+$/,
  v2: /^\d+ items? selected · \$[\d,]+ total ?\$[\d,]+ · Saving \$[\d,]+$/,
};
const fmt = (n) => "$" + n.toLocaleString("en-US");

for (const key of Object.keys(URLS)) {
  test.describe(`WIN283 [${key}]`, () => {
    test(`TC-01 [${key}] line copy, layout & button copy match wireframe`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      const s = await readState(page);
      testInfo.annotations.push({ type: "state", description: JSON.stringify({ text: s.text, btn: s.btnText, classes: s.bodyClasses }) });
      await shot(page, testInfo, `${key}-default`);
      expect(s.bodyClasses).toContain("cre-t-283");
      expect(s.lineCount).toBe(1);
      expect(s.text).toMatch(expectedLine[key]);
      expect(s.hasStrike).toBe(key !== "control");
      if (key === "v2") {
        expect(s.btnIsClone, "visible button should be the cre-t-283 clone").toBe(true);
        expect(s.nativeBtnVisible, "native button hidden").toBe(false);
        expect(s.btnText).toBe(`ADD TO CART · SAVE ${fmt(s.saving)}`);
      } else {
        expect(s.btnText).toBe("ADD TO CART");
      }
      await context.close();
    });

    test(`TC-02 [${key}] default math: total = price, strike = pre-savings price, saving = strike - total`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      const s = await readState(page);
      testInfo.annotations.push({ type: "state", description: JSON.stringify(s) });
      expect(s.count).toBe(1);
      expect(s.total).toBe(s.base);
      expect(s.saving, "saving must not be stale $0 (WIN266 BUG-01 race)").toBeGreaterThan(0);
      expect(s.saving).toBe(s.strike202 - s.base);
      if (key !== "control") {
        expect(s.strike).toBe(s.strike202);
        expect(s.strike - s.total).toBe(s.saving);
      }
      await context.close();
    });

    test(`TC-03 [${key}] styling per wireframe`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      const s = await readState(page);
      testInfo.annotations.push({ type: "style", description: JSON.stringify({ line: s.style, btn: s.btnStyle, nativeBtnFont: s.nativeBtnFont }) });
      expect(s.style.color).toBe("rgb(255, 255, 255)");
      expect(s.style.savingColor).toBe("rgb(34, 197, 94)");
      const narrow = (testInfo.project.use.viewport?.width || 1280) <= 360;
      if (key === "control") {
        expect(s.style.fontSize).toBeCloseTo(13.2, 1);
      } else {
        // wireframe: +2px over control's 13.2px (≈15.2px); <=360px media query drops back
        if (!narrow) expect(s.style.fontSize).toBeGreaterThanOrEqual(15);
        expect(s.style.strikeColor).toBe("rgba(255, 255, 255, 0.6)");
        expect(s.style.strikeDeco).toBe("line-through");
        // wireframe only asks for +2px — the page font (greycliff-cf, same as control) should be kept
        expect.soft(s.style.fontFamily, "V1/V2 line font family should match control (site font)").toMatch(/greycliff/i);
      }
      if (key === "v2") {
        expect.soft(s.btnStyle.fontFamily, "V2 button font family should match native button").toBe(s.nativeBtnFont);
      }
      await context.close();
    });

    test(`TC-04 [${key}] add/remove Platform Frame (+$499): count, total & strike update, saving unchanged`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      const before = await readState(page);
      await toggleAccessory(page, "Platform Frame");
      await expect.poll(async () => (await readState(page)).total, { timeout: 6000 }).toBe(before.total + 499);
      const after = await readState(page);
      await shot(page, testInfo, `${key}-platform-frame`);
      testInfo.annotations.push({ type: "after", description: JSON.stringify({ text: after.text, btn: after.btnText }) });
      expect(after.count).toBe(2);
      expect(after.saving).toBe(before.saving);
      if (key !== "control") expect(after.strike).toBe(before.strike + 499);
      if (key === "v2") expect(after.btnText).toBe(`ADD TO CART · SAVE ${fmt(before.saving)}`);
      await toggleAccessory(page, "Platform Frame");
      await expect.poll(async () => (await readState(page)).total, { timeout: 6000 }).toBe(before.total);
      const reverted = await readState(page);
      expect(reverted.count).toBe(1);
      expect(reverted.text).toBe(before.text);
      await context.close();
    });

    test(`TC-05 [${key}] size change (Queen → King) re-prices line and button`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      const before = await readState(page);
      await page.selectOption("#size-select", "King");
      await expect.poll(async () => (await readState(page)).base, { timeout: 8000 }).not.toBe(before.base);
      await expect.poll(async () => { const s = await readState(page); return s.total === s.base && s.saving === s.strike202 - s.base; }, { timeout: 6000 }).toBe(true);
      const s = await readState(page);
      testInfo.annotations.push({ type: "king", description: JSON.stringify({ text: s.text, btn: s.btnText }) });
      await shot(page, testInfo, `${key}-king`);
      if (key !== "control") expect(s.strike).toBe(s.strike202);
      if (key === "v2") expect(s.btnText).toBe(`ADD TO CART · SAVE ${fmt(s.saving)}`);
      await context.close();
    });

    test(`TC-06 [${key}] Mattress Setup & Removal tier: total includes service, saving never drops`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      const before = await readState(page);
      await page.evaluate(() => document.querySelector(".order-form__loadup-button").click());
      await page.locator(".pop-loadup__service-button").first().waitFor({ state: "visible", timeout: 8000 });
      await page.locator(".pop-loadup__service-button").first().click({ force: true });
      await expect.poll(async () => (await readState(page)).setupSelected, { timeout: 8000 }).toBe(true);
      await expect.poll(async () => { const s = await readState(page); return s.total === s.base + s.setupPrice + s.acc; }, { timeout: 6000 }).toBe(true);
      await page.waitForTimeout(1500);
      const s = await readState(page);
      testInfo.annotations.push({ type: "setup", description: JSON.stringify({ text: s.text, btn: s.btnText, setupPrice: s.setupPrice, setupCompare: s.setupCompare, classes: s.bodyClasses }) });
      await shot(page, testInfo, `${key}-setup`);
      expect(s.count).toBe(2);
      expect(s.total).toBe(before.total + s.setupPrice);
      const compare = s.setupCompare || s.setupPrice;
      expect(s.saving, `saving should be ${before.saving} + service discount ${compare - s.setupPrice}`).toBe(before.saving + (compare - s.setupPrice));
      if (key !== "control") expect(s.strike - s.total).toBe(s.saving);
      if (key === "v2") expect(s.btnText).toBe(`ADD TO CART · SAVE ${fmt(s.saving)}`);
      await context.close();
    });

    test(`TC-07 [${key}] Add to Cart adds exactly one mattress; line keeps showing the selection, not the cart`, async ({ browser }, testInfo) => {
      const { context, page, cartPosts } = await openArm(browser, key, testInfo);
      const before = await readState(page);
      const sel = key === "v2" ? ".cre-t-283-add-btn" : ".order-form__add.button";
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), sel);
      const readCart = () => page.evaluate(() => fetch("/cart.js", { cache: "no-store" }).then((r) => r.json()).then((c) => ({ count: c.item_count, items: c.items.map((i) => i.title + " x" + i.quantity) })));
      expect((await readCart()).count).toBe(0);
      await page.locator(sel).first().click({ force: true });
      await expect.poll(async () => (await readCart()).count, { timeout: 15000 }).toBeGreaterThan(0);
      await page.waitForTimeout(4000);
      const cart = await readCart();
      testInfo.annotations.push({ type: "cart", description: JSON.stringify({ cartPosts, cart }) });
      await shot(page, testInfo, `${key}-after-atc`);
      expect(cart.count, "exactly one mattress added per click").toBe(1);
      const after = await readState(page);
      expect(after.text).toBe(before.text);
      await context.close();
    });

    test(`TC-08 [${key}] line & button fit the viewport (no overflow)`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      await toggleAccessory(page, "WinkBase");
      await expect.poll(async () => (await readState(page)).count, { timeout: 6000 }).toBe(2);
      await page.waitForTimeout(1500);
      const s = await readState(page);
      testInfo.annotations.push({ type: "layout", description: JSON.stringify({ text: s.text, line: s.style, btn: s.btnStyle }) });
      await shot(page, testInfo, `${key}-layout-winkbase`);
      expect(s.style.overflow).toBe(false);
      expect(s.style.lines).toBeLessThanOrEqual(2);
      expect(s.btnStyle.overflow).toBe(false);
      await context.close();
    });

    test(`TC-09 [${key}] no cre-t-283 errors`, async ({ browser }, testInfo) => {
      const { context, page, errors } = await openArm(browser, key, testInfo);
      await toggleAccessory(page, "Ice Mattress Protector");
      await page.waitForTimeout(3500);
      expect(errors.filter((e) => /283/.test(e))).toEqual([]);
      await context.close();
    });
  });
}

test.describe("WIN283 edge cases (Chrome Desktop only)", () => {
  test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "Chrome Desktop", "code-path check, one browser"));

  for (const key of ["v1", "v2"]) {
    test(`TC-10 [${key}] no strike/"SAVE $0" shown when there is no discount (cre-t-202 strike badge absent)`, async ({ browser }, testInfo) => {
      const { context, page } = await openArm(browser, key, testInfo);
      // simulate cre-t-202 being off / no compare price: remove its "Was $X" badge, then trigger a refresh
      await page.evaluate(() => document.querySelectorAll(".cre-t-202-box-strike-price").forEach((e) => e.remove()));
      await toggleAccessory(page, "Platform Frame");
      await page.waitForTimeout(3500);
      const s = await readState(page);
      testInfo.annotations.push({ type: "no-discount", description: JSON.stringify({ text: s.text, btn: s.btnText }) });
      await shot(page, testInfo, `${key}-no-discount`);
      expect.soft(s.strike === null || s.strike > s.total, `strike price ${s.strike} must not be <= total ${s.total}`).toBe(true);
      expect.soft(s.text, "no 'Saving $0'").not.toMatch(/Saving \$0$/);
      if (key === "v2") expect.soft(s.btnText).not.toMatch(/SAVE \$0$/);
      await context.close();
    });
  }

  for (const key of ["control", "v1", "v2"]) {
    test(`TC-11 [${key}] 5 fresh loads: saving never stale $0 / mismatched`, async ({ browser }, testInfo) => {
      test.setTimeout(300000);
      const bad = [];
      for (let i = 0; i < 5; i++) {
        const { context, page } = await openArm(browser, key, testInfo);
        const s = await readState(page);
        if (s.saving !== s.strike202 - s.base || (key !== "control" && s.strike !== s.strike202)) bad.push(s.text + " | 202=" + s.strike202);
        await context.close();
      }
      testInfo.annotations.push({ type: "mismatches", description: JSON.stringify(bad) });
      expect(bad).toEqual([]);
    });
  }
});
