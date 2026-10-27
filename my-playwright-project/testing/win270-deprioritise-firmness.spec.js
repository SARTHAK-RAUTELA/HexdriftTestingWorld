// @ts-check
/**
 * WIN270 - WinkBeds "Deprioritise Secondary Firmness Levels" (cre-t-270), Convert exp 100350850
 *
 * Goal: make Luxury Firm the clear default and reduce the firmness decision, while keeping all
 * firmness levels reachable. Per wireframe (Group 48098604.png) + client thread:
 *   Buy box   - "Select Firmness:" -> "Firmness:"; white dropdown -> navy panel (green check, name,
 *               "Most Popular" pill ONLY for Luxury Firm, underlined "Change firmness" on the right);
 *               only "Change firmness" opens the native menu; "Firmness guide" hidden until
 *               "Change firmness" is first clicked, then stays; Luxury Firm bullet copy swap;
 *               preserve an explicit selection incl. a variant-specific URL (?firmness=).
 *   Section   - new headline/sub-copy, tabs removed, Luxury Firm by default, WIN255 V2 copy in
 *               control AND variation, "Prefer a different feel? Explore other firmness options"
 *               accordion (collapsed by default) with 4 buttons that behave like the old tabs.
 *   Nav       - "Firmness Options" -> "Comfort & Support", smooth-scrolls to the section above
 *               (the construction / firmness section).
 *   Video     - new headline + sub-copy, new thumbnail (client: keep YouTube controls).
 *   Gallery   - firmness-options image replaced (grid + lightbox/carousel, desktop + mobile) with the
 *               bed image; desktop click opens the lightbox at that image (overrides WIN264).
 *
 * Code: local_testing/Local2/variation/vB.js + vB.css (identical to the deployed variation,
 * verified 2026-10-26). Control has WIN255 V2 code only.
 * WinkBeds quirks: navigator.webdriver override, domcontentloaded, raw DOM clicks (popups).
 */
const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.";
const URLS = { control: BASE + "1003185232", variation: BASE + "1003185233" };
const COOKIE = "cre-t-270-firmness";
const SHOT_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "win270-screenshots");
const GOALS = {
  firmnessClick: "100334728", nonDefaultFirmness: "100334729", guide: "100334730",
  exploreToggle: "100334731", exploreOption: "100334732", video: "100334733",
};
const LF_255 = "Our most popular model, designed to exceed the performance of the finest luxury hotel mattresses.";

const isDesktop = (ti) => !ti.project.use.isMobile;

async function openArm(browser, key, testInfo, opts = {}) {
  const u = testInfo.project.use;
  const context = await browser.newContext({
    viewport: u.viewport, screen: u.screen, userAgent: u.userAgent, deviceScaleFactor: u.deviceScaleFactor,
    isMobile: u.isMobile, hasTouch: u.hasTouch, ignoreHTTPSErrors: true,
  });
  context.setDefaultNavigationTimeout(60000);
  await context.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  if (opts.cookie) await context.addCookies([{ name: COOKIE, value: opts.cookie, domain: "www.winkbeds.com", path: "/" }]);
  const page = await context.newPage();
  const errors = [];
  const goals = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => /error in Test cre-t-270/.test(m.text()) && errors.push("variation: " + m.text()));
  page.on("request", (r) => {
    // Only real conversion events sent to the metrics endpoint (logs.convertexperiments.com echoes goal state)
    if (r.method() === "POST" && /metrics\.convertexperiments\.com\/v1\/track/.test(r.url())) {
      for (const m of (r.postData() || "").matchAll(/"goalId":"(\d+)"/g)) if (Object.values(GOALS).includes(m[1])) goals.push(m[1]);
    }
  });
  await page.goto(URLS[key] + (opts.query || ""), { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".order-form.loaded", { state: "attached", timeout: 60000 });
  if (key === "variation") {
    await page.waitForSelector(".cre-t-270-firm-panel", { state: "attached", timeout: 30000 });
    await page.waitForSelector(".cre-t-270-explore", { state: "attached", timeout: 30000 });
  }
  await page.waitForSelector(".winkbed-construction__content-section", { state: "attached", timeout: 30000 });
  await page.waitForTimeout(3000);
  return { context, page, errors, goals };
}

async function shot(page, testInfo, name) {
  const dir = path.join(SHOT_DIR, testInfo.project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase());
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name + ".png");
  await page.screenshot({ path: file, timeout: 20000, animations: "disabled" }).catch(() => {});
  await testInfo.attach(name, { path: file, contentType: "image/png" }).catch(() => {});
}

const center = (page, sel) => page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel);
const jsClick = (page, sel) => page.evaluate((s) => /** @type {HTMLElement} */ (document.querySelector(s)).click(), sel);
const text = (page, sel) => page.evaluate((s) => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(), sel);
const guideVisibility = (page) => page.evaluate(() => {
  const sel = document.querySelector("#firmness-select");
  const row = sel && sel.parentElement.previousElementSibling;
  const note = row && row.querySelector(".order-form__option-note");
  return note ? getComputedStyle(note).visibility : "missing";
});

async function chooseFirmness(page, value) {
  await page.selectOption(".cre-t-270-firm-select", value, { force: true });
  await expect.poll(() => page.evaluate(() => /** @type {HTMLSelectElement} */ (document.querySelector("#firmness-select")).value)).toBe(value);
  await page.waitForTimeout(800);
}

function buyBoxState(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const vis = (e) => !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0;
    const prices = (q(".order-form").innerText.match(/\$[\d,]+/g) || []).slice(0, 2);
    return {
      original: /** @type {HTMLSelectElement} */ (q("#firmness-select")).value,
      name: q(".cre-t-270-firm-name")?.textContent.trim(),
      badge: q(".cre-t-270-firm-badge")?.textContent.trim(),
      badgeVisible: vis(q(".cre-t-270-firm-badge")),
      checkVisible: vis(q(".cre-t-270-firm-check svg")),
      bullet: q(".cre-t-270-firm-bullet")?.textContent.trim(),
      prices,
      cookie: (document.cookie.match(/cre-t-270-firmness=([^;]*)/) || [])[1] || null,
    };
  });
}

// ===================================================================================== CONTROL
test.describe("WIN270 Control", () => {
  test("C-01 Buy box keeps the native firmness dropdown, label and guide", async ({ browser }, ti) => {
    const { context, page, errors } = await openArm(browser, "control", ti);
    try {
      await center(page, "#firmness-select");
      const s = await page.evaluate(() => {
        const sel = /** @type {HTMLSelectElement} */ (document.querySelector("#firmness-select"));
        const row = sel.parentElement.previousElementSibling;
        return {
          label: row.querySelector("label").textContent.trim(),
          guide: getComputedStyle(row.querySelector(".order-form__option-note")).visibility,
          options: [...sel.options].map((o) => o.text.trim()), value: sel.value,
          panel: !!document.querySelector(".cre-t-270-firm-panel"),
        };
      });
      expect(s.label).toMatch(/^Select Firmness/);
      expect(s.guide).toBe("visible");
      expect(s.value).toBe("Luxury Firm");
      expect(s.options).toEqual(["Softer", "Luxury Firm: Most Popular", "Firmer", "Plus: Heavier People"]);
      expect(s.panel).toBe(false);
      await shot(page, ti, "control-buybox");
      expect(errors.filter((e) => /cre-t-270/.test(e))).toEqual([]);
    } finally { await context.close(); }
  });

  test("C-02 Firmness section keeps tabs + WIN255 V2 Luxury Firm copy", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "control", ti);
    try {
      expect(await text(page, ".winkbed-construction__header")).toMatch(/Find the perfect firmness and support for your sleep style/i);
      const tabsShown = await page.evaluate(() => {
        const desk = document.querySelector(".winkbed-construction__content-top-header");
        const mob = document.querySelector(".winkbed-construction__accordion-item-header");
        const v = (e) => !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0;
        return v(desk) || v(mob);
      });
      expect(tabsShown).toBe(true);
      const sel = isDesktop(ti) ? '[data-attribute="Luxury Firm"] .cre-t-255-wrapper' : '[mobile-data-attribute="Luxury Firm"] .cre-t-255-wrapper';
      await expect.poll(() => text(page, sel)).toBe(LF_255 + " Chosen by 74% of customers");
      expect(await page.locator(".cre-t-270-explore").count()).toBe(0);
      await center(page, sel);
      await shot(page, ti, "control-section");
    } finally { await context.close(); }
  });

  test("C-03 Nav, video and gallery stay original", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "control", ti);
    try {
      expect(await text(page, ".cre37-navigation-link4 .cre37-navigation-link-text")).toBe("Firmness Options");
      expect(await text(page, ".winkbed-construction-video__heading")).toBe("Not sure which WinkBed is right for you?");
      expect(await page.getAttribute(".my-thumbnail-image", "src")).toContain("winkbed-construction-video-thumbnail");
      if (isDesktop(ti)) expect(await page.locator('.pdp-gallery-grid button[data-slide="19"] img').getAttribute("src")).toContain("firmness-options");
    } finally { await context.close(); }
  });
});

// ===================================================================================== VARIATION - BUY BOX
test.describe("WIN270 Variation - Buy box", () => {
  test("TC-01 Label reads 'Firmness:' and the navy panel shows check + Luxury Firm + Most Popular + Change firmness", async ({ browser }, ti) => {
    const { context, page, errors } = await openArm(browser, "variation", ti);
    try {
      await center(page, ".cre-t-270-firm-panel");
      const s = await page.evaluate(() => {
        const sel = document.querySelector("#firmness-select");
        const row = sel.parentElement.previousElementSibling;
        const label = row.querySelector("label");
        const panel = document.querySelector(".cre-t-270-firm-panel");
        const change = document.querySelector(".cre-t-270-firm-change");
        const arrow = document.querySelector(".cre-t-270-firm-option .dummySelectFirmness");
        return {
          label: label.textContent.trim() + getComputedStyle(label, "::after").content.replace(/"/g, "").replace("none", ""),
          panelDisplay: getComputedStyle(panel).display, panelColor: getComputedStyle(panel).color,
          check: document.querySelector(".cre-t-270-firm-check svg circle")?.getAttribute("fill"),
          changeText: document.querySelector(".cre-t-270-firm-change-text").textContent.trim(),
          changeUnderline: getComputedStyle(change).textDecorationLine,
          changeRight: Math.round(panel.getBoundingClientRect().right - change.getBoundingClientRect().right),
          nativeHidden: getComputedStyle(sel).display === "none",
          arrowHidden: !arrow || getComputedStyle(arrow).display === "none",
        };
      });
      expect(s.label).toMatch(/^Firmness:?$/);
      expect(s.panelDisplay).toBe("flex");
      expect(s.panelColor).toBe("rgb(255, 255, 255)");
      expect(s.check).toBe("#22C55E");
      expect(s.changeText).toBe("Change firmness");
      expect(s.changeUnderline).toBe("underline");
      expect(s.changeRight).toBeLessThan(30);
      expect(s.nativeHidden).toBe(true);
      expect(s.arrowHidden).toBe(true);
      const st = await buyBoxState(page);
      expect(st.name).toBe("Luxury Firm");
      expect(st.badge).toBe("Most Popular");
      expect(st.badgeVisible).toBe(true);
      expect(st.checkVisible).toBe(true);
      await shot(page, ti, "buybox-default");
      expect(errors.filter((e) => /cre-t-270/.test(e))).toEqual([]);
    } finally { await context.close(); }
  });

  test("TC-02 'Firmness guide' hidden on load; Luxury Firm benefit bullet shown", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      expect(await guideVisibility(page)).toBe("hidden");
      expect((await buyBoxState(page)).bullet).toBe("Balanced comfort and support with our most popular Luxury Firm");
    } finally { await context.close(); }
  });

  test("TC-03 Only 'Change firmness' opens the menu; the rest of the panel is not clickable", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await center(page, ".cre-t-270-firm-panel");
      await page.waitForTimeout(500);
      const hits = await page.evaluate(() => {
        const at = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e ? e.className.toString() : null; };
        return { change: at(".cre-t-270-firm-change-text"), name: at(".cre-t-270-firm-name"), check: at(".cre-t-270-firm-check"), badge: at(".cre-t-270-firm-badge") };
      });
      expect(hits.change).toContain("cre-t-270-firm-select");
      expect(hits.name).not.toContain("cre-t-270-firm-select");
      expect(hits.check).not.toContain("cre-t-270-firm-select");
      expect(hits.badge).not.toContain("cre-t-270-firm-select");
      const options = await page.$$eval(".cre-t-270-firm-select option", (o) => o.map((x) => x.textContent.trim()));
      expect(options).toEqual(["Softer", "Luxury Firm: Most Popular", "Firmer", "Plus: Heavier People"]);
    } finally { await context.close(); }
  });

  test("TC-04 Clicking 'Change firmness' reveals 'Firmness guide' and it stays after dismissing without a selection", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await center(page, ".cre-t-270-firm-panel");
      await page.waitForTimeout(500);
      const box = await page.locator(".cre-t-270-firm-change-text").boundingBox();
      if (ti.project.use.hasTouch) await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
      await page.keyboard.press("Escape").catch(() => {});
      await page.evaluate(() => /** @type {HTMLElement} */ (document.activeElement)?.blur());
      await page.waitForTimeout(400);
      expect(await guideVisibility(page)).toBe("visible");
      expect((await buyBoxState(page)).original).toBe("Luxury Firm");
      await shot(page, ti, "buybox-guide-revealed");
    } finally { await context.close(); }
  });

  test("TC-05 Selecting Firmer updates panel, original select, price and bullet like control", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await chooseFirmness(page, "Firmer");
      const st = await buyBoxState(page);
      expect(st.name).toBe("Firmer");
      expect(st.badgeVisible).toBe(false);
      expect(st.checkVisible).toBe(true);
      expect(st.prices).toEqual(["$2,570", "$1,799"]);
      expect(st.bullet).toBe("Four firmness options for every sleep style");
      await center(page, ".cre-t-270-firm-panel");
      await shot(page, ti, "buybox-firmer");
    } finally { await context.close(); }
  });

  test("TC-06 Selecting Plus: price $1,999 like control, and no pill (pill is Luxury Firm only)", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await chooseFirmness(page, "Plus");
      const st = await buyBoxState(page);
      expect(st.name).toBe("Plus");
      expect(st.prices).toEqual(["$2,856", "$1,999"]);
      await center(page, ".cre-t-270-firm-panel");
      await shot(page, ti, "buybox-plus");
      expect(st.badgeVisible, `pill shows "${st.badge}" for Plus`).toBe(false);
    } finally { await context.close(); }
  });

  test("TC-07 Back to Luxury Firm restores pill + bullet and clears the session cookie", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await chooseFirmness(page, "Softer");
      expect((await buyBoxState(page)).cookie).toBe("Softer");
      await chooseFirmness(page, "Luxury Firm");
      const st = await buyBoxState(page);
      expect(st.name).toBe("Luxury Firm");
      expect(st.badge).toBe("Most Popular");
      expect(st.bullet).toBe("Balanced comfort and support with our most popular Luxury Firm");
      expect(st.cookie).toBeNull();
    } finally { await context.close(); }
  });

  test("TC-08 An explicitly chosen firmness survives a reload", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await chooseFirmness(page, "Firmer");
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(".cre-t-270-firm-panel", { state: "attached", timeout: 60000 });
      await expect.poll(() => buyBoxState(page).then((s) => s.name), { timeout: 15000 }).toBe("Firmer");
      expect((await buyBoxState(page)).original).toBe("Firmer");
    } finally { await context.close(); }
  });

  test("TC-09 Variant-specific URL (?firmness=plus) is displayed", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti, { query: "&firmness=plus" });
    try {
      await expect.poll(() => buyBoxState(page).then((s) => s.name), { timeout: 15000 }).toBe("Plus");
      expect((await buyBoxState(page)).prices).toEqual(["$2,856", "$1,999"]);
    } finally { await context.close(); }
  });

  test("TC-10 Variant URL wins over an earlier saved choice (?firmness=plus with saved Firmer)", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti, { query: "&firmness=plus", cookie: "Firmer" });
    try {
      await page.waitForTimeout(2000);
      const st = await buyBoxState(page);
      await center(page, ".cre-t-270-firm-panel");
      await shot(page, ti, "buybox-url-vs-cookie");
      expect(st.original, "URL asked for Plus").toBe("Plus");
      expect(st.name).toBe("Plus");
    } finally { await context.close(); }
  });

  test("TC-11 Goals: no firmness goals fire on page load without a user action (saved choice restored)", async ({ browser }, ti) => {
    const { context, page, goals } = await openArm(browser, "variation", ti, { cookie: "Firmer" });
    try {
      await page.waitForTimeout(4000);
      expect((await buyBoxState(page)).name).toBe("Firmer");
      expect(goals.filter((g) => g === GOALS.firmnessClick || g === GOALS.nonDefaultFirmness), "goals sent with no interaction").toEqual([]);
    } finally { await context.close(); }
  });

  test("TC-12 Goals: changing firmness via the panel sends 100334728 + 100334729", async ({ browser }, ti) => {
    const { context, page, goals } = await openArm(browser, "variation", ti);
    try {
      await chooseFirmness(page, "Plus");
      await expect.poll(() => goals.slice(), { timeout: 15000 }).toEqual(expect.arrayContaining([GOALS.firmnessClick, GOALS.nonDefaultFirmness]));
      expect(await page.evaluate((sel) => !!document.querySelector(sel), ".order-form__options .order-form__option:first-child .order-form__option-note"),
        "Firmness guide goal selector matches the guide link").toBe(true);
    } finally { await context.close(); }
  });
});

// ===================================================================================== VARIATION - FIRMNESS SECTION
test.describe("WIN270 Variation - Firmness section", () => {
  test("TC-13 New headline + sub-copy; tabs removed; Luxury Firm content with WIN255 V2 copy by default", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      expect(await page.evaluate(() => document.querySelector(".winkbed-construction__header").innerHTML.trim())).toBe("Engineered for the <span>perfect</span> sleep");
      expect(await text(page, ".winkbed-construction__subheader")).toBe("Handcrafted in the U.S.A. with premium, carefully engineered layers to bring you lasting comfort, support and durability.");
      const s = await page.evaluate((desk) => {
        const v = (e) => !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0;
        const items = [...document.querySelectorAll(desk ? ".winkbed-construction__content-bottom-main-item" : ".winkbed-construction__accordion-item")].filter(v);
        const sub = items[0] && items[0].querySelector("div.winkbed-construction__content-bottom-main-item-top-left-sub-header");
        return {
          tabs: v(document.querySelector(".winkbed-construction__content-top-header")),
          accHeaders: [...document.querySelectorAll(".winkbed-construction__accordion-item-header")].some(v),
          shown: items.map((e) => e.getAttribute("data-attribute") || e.getAttribute("mobile-data-attribute") || e.querySelector(".winkbed-construction__accordion-item-header-text")?.textContent.trim()),
          lf: (items[0]?.querySelector(".cre-t-255-wrapper")?.textContent || "").replace(/\s+/g, " ").trim(),
          oldSubHidden: sub ? getComputedStyle(sub).display === "none" : null,
        };
      }, isDesktop(ti));
      expect(s.tabs).toBe(false);
      expect(s.accHeaders).toBe(false);
      expect(s.shown).toEqual(["Luxury Firm"]);
      expect(s.lf).toBe(LF_255 + " Chosen by 74% of customers");
      expect(s.oldSubHidden).toBe(true);
      await center(page, ".winkbed-construction__header");
      await shot(page, ti, "section-default");
    } finally { await context.close(); }
  });

  test("TC-14 'Prefer a different feel?' link present, accordion collapsed by default", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      expect(await text(page, ".cre-t-270-explore-text")).toBe("Prefer a different feel? Explore other firmness options");
      expect(await page.getAttribute(".cre-t-270-explore-toggle", "aria-expanded")).toBe("false");
      await expect(page.locator(".cre-t-270-explore-options")).toBeHidden();
      await center(page, ".cre-t-270-explore");
      await shot(page, ti, "explore-collapsed");
    } finally { await context.close(); }
  });

  test("TC-15 Toggle expands 4 buttons (Luxury Firm active) and collapses again", async ({ browser }, ti) => {
    const { context, page, goals } = await openArm(browser, "variation", ti);
    try {
      await jsClick(page, ".cre-t-270-explore-toggle");
      await expect(page.locator(".cre-t-270-explore-options")).toBeVisible();
      expect(await page.getAttribute(".cre-t-270-explore-toggle", "aria-expanded")).toBe("true");
      const btns = await page.$$eval(".cre-t-270-explore-option", (b) => b.map((x) => x.textContent.replace(/\s+/g, " ").trim() + (x.classList.contains("cre-t-270-active") ? " *" : "")));
      expect(btns).toEqual(["Soft 4.5/10", "Luxury Firm 6.5/10 *", "Firm 7.5/10", "Plus 8.5/10"]);
      await center(page, ".cre-t-270-explore");
      await shot(page, ti, "explore-open");
      await jsClick(page, ".cre-t-270-explore-toggle");
      await expect(page.locator(".cre-t-270-explore-options")).toBeHidden();
      await expect.poll(() => goals.slice(), { timeout: 15000 }).toContain(GOALS.exploreToggle);
    } finally { await context.close(); }
  });

  test("TC-16 Each button switches the content like the control tabs and brings it into view", async ({ browser }, ti) => {
    const { context, page, goals } = await openArm(browser, "variation", ti);
    try {
      await jsClick(page, ".cre-t-270-explore-toggle");
      for (const name of ["Soft", "Firm", "Plus", "Luxury Firm"]) {
        // buttons sit below the content, so a user is scrolled down to them when clicking
        await center(page, ".cre-t-270-explore");
        await page.waitForTimeout(800);
        await jsClick(page, `.cre-t-270-explore-option[data-firmness="${name}"]`);
        await page.waitForTimeout(1800);
        const s = await page.evaluate((desk) => {
          const v = (e) => !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0;
          const items = [...document.querySelectorAll(desk ? ".winkbed-construction__content-bottom-main-item" : ".winkbed-construction__accordion-item")].filter(v);
          const top = items[0] ? items[0].getBoundingClientRect().top : null;
          return {
            shown: items.map((e) => e.getAttribute("data-attribute") || e.querySelector(".winkbed-construction__accordion-item-header-text")?.textContent.trim()),
            inView: top !== null && top > 0 && top < innerHeight * 0.6,
            active: document.querySelector(".cre-t-270-explore-option.cre-t-270-active")?.getAttribute("data-firmness"),
          };
        }, isDesktop(ti));
        expect(s.shown, name).toEqual([name]);
        expect(s.active).toBe(name);
        expect(s.inView, `${name} content scrolled into view`).toBe(true);
        if (name === "Plus") await shot(page, ti, "explore-plus");
      }
      await expect.poll(() => goals.slice(), { timeout: 15000 }).toContain(GOALS.exploreOption);
    } finally { await context.close(); }
  });
});

// ===================================================================================== VARIATION - NAV / VIDEO / GALLERY
test.describe("WIN270 Variation - Nav, video, gallery", () => {
  test("TC-17 Sticky nav item renamed 'Comfort & Support'", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      if (isDesktop(ti)) {
        const s = await page.evaluate(() => {
          const t = document.querySelector(".cre37-navigation-link4 .cre37-navigation-link-text");
          return { before: getComputedStyle(t, "::before").content, fontSize: getComputedStyle(t).fontSize };
        });
        expect(s.before).toBe('"Comfort & Support"');
        expect(s.fontSize).toBe("0px");
        await page.evaluate(() => window.scrollTo(0, 2500));
        await page.waitForTimeout(1200);
        await shot(page, ti, "sticky-nav");
      } else {
        const opts = await page.$$eval("#mobilePdpNav option", (o) => o.map((x) => x.textContent.trim()));
        expect(opts).toContain("Comfort & Support");
        expect(opts).not.toContain("Firmness Options");
      }
    } finally { await context.close(); }
  });

  test("TC-18 'Comfort & Support' scrolls to the firmness (construction) section", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await page.evaluate(() => window.scrollTo(0, 2500));
      await page.waitForTimeout(1500);
      if (isDesktop(ti)) {
        const b = await page.locator(".cre37-navigation-link4 .cre37-navigation-link-text").boundingBox();
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      } else {
        await page.selectOption("#mobilePdpNav", { label: "Comfort & Support" });
      }
      await page.waitForTimeout(2500);
      const top = await page.evaluate(() => Math.round(document.querySelector("#shopify-section-winkbed-construction").getBoundingClientRect().top));
      await shot(page, ti, "after-comfort-support-click");
      expect(top, "construction section top relative to viewport").toBeGreaterThan(-20);
      expect(top).toBeLessThan(260);
    } finally { await context.close(); }
  });

  test("TC-19 Video headline, sub-copy and NapLab link updated", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      expect(await text(page, ".winkbed-construction-video__heading")).toBe("See how The WinkBed performs in independent testing");
      expect(await text(page, ".winkbed-construction-video__subheading")).toBe("Watch NapLab’s independent review of The WinkBed’s comfort, support, cooling and more.");
      expect(await page.getAttribute(".winkbed-construction-video__subheading a", "href")).toBe("https://naplab.com/mattress-reviews/winkbed-review/");
    } finally { await context.close(); }
  });

  test("TC-20 New video thumbnail loads; clicking it starts the YouTube video", async ({ browser }, ti) => {
    const { context, page, goals } = await openArm(browser, "variation", ti);
    try {
      await center(page, ".my-thumbnail-overlay");
      await expect.poll(() => page.evaluate(() => { const i = /** @type {HTMLImageElement} */ (document.querySelector(".my-thumbnail-image")); return i.complete && i.naturalWidth > 0 && i.src; }), { timeout: 15000 })
        .toBe("https://v2.crocdn.com/Winkbed/test270/thumbnail-image.jpg");
      await shot(page, ti, "video-thumbnail");
      await jsClick(page, ".my-thumbnail-overlay");
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector(".my-thumbnail-overlay")).display), { timeout: 10000 }).toBe("none");
      expect(await page.locator(".my-video-container iframe[src*='youtube.com/embed']").count()).toBeGreaterThan(0);
      await expect.poll(() => goals.slice(), { timeout: 15000 }).toContain(GOALS.video);
    } finally { await context.close(); }
  });

  test("TC-21 Desktop grid: firmness image replaced; click opens the lightbox on the bed image", async ({ browser }, ti) => {
    test.skip(!isDesktop(ti), "grid is desktop-only");
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      await page.waitForSelector('.pdp-gallery-grid button[data-slide="4"] img[src*="cre-t-270-newImage"]', { state: "attached", timeout: 20000 });
      expect(await page.locator('.pdp-gallery-grid img[src*="firmness-options"]').count()).toBe(0);
      await center(page, '.pdp-gallery-grid button[data-slide="4"]');
      await shot(page, ti, "gallery-grid");
      await jsClick(page, '.pdp-gallery-grid button[data-slide="4"]');
      await page.waitForTimeout(1500);
      // The swiper-slide-active node can be empty; assert on the large image actually on screen
      const active = await page.evaluate(() => {
        const pop = document.querySelector(".cre-lightbox-popUp");
        const big = [...document.querySelectorAll(".cre-lightbox-popUp img")].find((i) => {
          const r = i.getBoundingClientRect();
          return r.width > 400 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight + 5;
        });
        return { open: !!pop && getComputedStyle(pop).display !== "none", src: big ? (big.currentSrc || big.src) : "" };
      });
      await shot(page, ti, "gallery-lightbox");
      expect(active.open).toBe(true);
      expect(active.src).toMatch(/winkbed-5-imageSens/);
    } finally { await context.close(); }
  });

  test("TC-22 Firmness-options image removed from the lightbox and carousel", async ({ browser }, ti) => {
    const { context, page } = await openArm(browser, "variation", ti);
    try {
      const left = await page.evaluate(() => [...document.querySelectorAll(".gallery-top img, .lightbox-slider img, .cre-lightbox-popUp img")]
        .map((i) => (i.currentSrc || i.src || i.getAttribute("data-src") || "")).filter((s) => /firmness-options/.test(s)).map((s) => s.split("/").pop().split("?")[0]));
      if (isDesktop(ti) && left.length) {
        // show it: open the lightbox and jump to the firmness slide
        await jsClick(page, '.pdp-gallery-grid button[data-slide="4"]');
        await page.waitForTimeout(1200);
        await page.evaluate(() => {
          const sw = /** @type {any} */ (document.querySelector(".lightbox-slider")).swiper;
          const idx = [...document.querySelectorAll(".lightbox-slider .swiper-slide")].findIndex((s) => /firmness-options/.test(s.innerHTML));
          if (sw && idx >= 0) sw.slideTo(idx, 0);
        });
        await page.waitForTimeout(1000);
        await shot(page, ti, "lightbox-old-firmness-image");
      }
      expect(left, "old firmness image still in lightbox/carousel").toEqual([]);
    } finally { await context.close(); }
  });

  test("TC-23 No horizontal overflow and no variation errors", async ({ browser }, ti) => {
    const { context, page, errors } = await openArm(browser, "variation", ti);
    try {
      await jsClick(page, ".cre-t-270-explore-toggle");
      await page.waitForTimeout(500);
      const over = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        return [...document.querySelectorAll('[class*="cre-t-270"]')].filter((e) => e.getBoundingClientRect().right > vw + 1).map((e) => e.className.toString().slice(0, 50));
      });
      expect(over).toEqual([]);
      expect(errors.filter((e) => /cre-t-270|variation:/.test(e))).toEqual([]);
    } finally { await context.close(); }
  });
});
