// @ts-check
/**
 * UK Radiators - Test UKRadiators-18 - Hide summer-sale banner + header nav on the
 * magnetic towel bars collection page
 *
 * Site: ukradiators.com/collections/magnetic-towel-bars (Shopify)
 * Variation body class: UKRadiators-18
 * Variation files: local_testing/Local2/variation/vB.js / vB.css
 *
 * Hypothesis: reduce choice / narrow the path to checkout for paid-traffic landers by hiding
 * the yellow sale banner and all header nav (category links, Trade Account, Sale CTA, and the
 * desktop search/phone/account/cart icon cluster), leaving only the logo.
 *
 * Force URLs (Convert.com preview, cro_mode=qa):
 *   Control:    _conv_eforce=100052699.1000257008
 *   Variation:  _conv_eforce=100052699.1000257009
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "https://ukradiators.com/collections/magnetic-towel-bars?cro_mode=qa";
const CONTROL_URL = `${BASE}&_conv_eforce=100052699.1000257008`;
const VARIATION_URL = `${BASE}&_conv_eforce=100052699.1000257009`;
const HOME_URL = "https://ukradiators.com/";

const VARIATION_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const VB_JS = fs.readFileSync(path.join(VARIATION_DIR, "vB.js"), "utf8");

const SEL = {
  saleBanner: "#sale-banner",
  admNavChild: ".adm-nav > div", // 0 = fakeDrawer, 1 = nav row (logo + links), 2 = desktop icon cluster
  navItemSpans: ".nav-draw-level-one > div > span", // category links + Trade Account + Sale, all share this wrapper
  cartIconMobile: 'img[alt="cart"]',
  hamburgerMobile: ".open-nav",
  logo: 'a[href="/"] img[alt="logo"]',
};

async function dismissCookieBanner(page) {
  const accept = page.getByRole("button", { name: "Accept" });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click().catch(() => {});
  }
}

async function gotoVariation(page) {
  await page.goto(VARIATION_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body.UKRadiators-18", { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function gotoControl(page) {
  await page.goto(CONTROL_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SEL.saleBanner, { timeout: 15000 });
  await page.waitForTimeout(1500);
}

test.describe("UKRadiators-18 - Control", () => {
  test("TC-01 control has no UKRadiators-18 class on body", async ({ page }) => {
    await gotoControl(page);
    await expect(page.locator("body")).not.toHaveClass(/UKRadiators-18/);
  });

  test("TC-02 control sale banner is visible", async ({ page }) => {
    await gotoControl(page);
    await expect(page.locator(SEL.saleBanner)).toBeVisible();
  });

  test("TC-03 control nav item wrappers (category links / Trade Account / Sale) are visible", async ({ page }) => {
    await gotoControl(page);
    const spans = page.locator(SEL.navItemSpans);
    const count = await spans.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(spans.nth(i)).toHaveCSS("visibility", "visible");
    }
  });

  test("TC-04 control desktop icon cluster (search/phone/account/cart) is visible at desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoControl(page);
    await expect(page.locator(SEL.admNavChild).nth(2)).toBeVisible();
  });
});

test.describe("UKRadiators-18 - Variation", () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test("TC-05 body gets UKRadiators-18 class", async ({ page }) => {
    await expect(page.locator("body")).toHaveClass(/UKRadiators-18/);
  });

  test("TC-06 sale banner is hidden (display:none)", async ({ page }) => {
    await expect(page.locator(SEL.saleBanner)).toHaveCSS("display", "none");
  });

  test("TC-07 nav item wrappers (category links / Trade Account / Sale) are hidden (visibility:hidden)", async ({
    page,
  }) => {
    const spans = page.locator(SEL.navItemSpans);
    const count = await spans.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(spans.nth(i)).toHaveCSS("visibility", "hidden");
    }
  });

  test("TC-08 desktop icon cluster (search/phone/account/cart) is hidden at desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("body.UKRadiators-18", { timeout: 15000 });
    await expect(page.locator(SEL.admNavChild).nth(2)).toHaveCSS("display", "none");
  });

  test("TC-09 body padding-top collapses to 0 (no gap left by the removed banner)", async ({ page }) => {
    const paddingTop = await page.evaluate(() => getComputedStyle(document.body).paddingTop);
    expect(paddingTop).toBe("0px");
  });

  test("TC-10 [BUG-01] mobile hamburger + cart icons should be hidden per Figma but are NOT", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("body.UKRadiators-18", { timeout: 15000 });
    // Figma variation (mobile) shows only the logo - no cart icon, no hamburger.
    // Current vB.css has no selector covering this container, so both remain visible - this
    // assertion documents the bug by asserting the Figma-specified (hidden) state.
    await expect(page.locator(SEL.cartIconMobile).first()).toBeHidden();
    await expect(page.locator(SEL.hamburgerMobile).first()).toBeHidden();
  });

  test("TC-11 no new DOM elements injected - adm-nav still has exactly 3 children (CSS-only variation)", async ({
    page,
  }) => {
    const count = await page.locator(SEL.admNavChild).count();
    expect(count).toBe(3);
  });

  test("TC-12 CSS guard: removing body class restores banner and nav visibility", async ({ page }) => {
    await page.evaluate(() => document.body.classList.remove("UKRadiators-18"));
    await expect(page.locator(SEL.saleBanner)).toBeVisible();
    await expect(page.locator(SEL.navItemSpans).first()).toHaveCSS("visibility", "visible");
  });

  test("TC-13 duplicate-init guard: re-running vB.js leaves exactly one UKRadiators-18 class", async ({ page }) => {
    await page.addScriptTag({ content: VB_JS });
    await page.waitForTimeout(500);
    const classCount = await page.evaluate(
      () => document.body.className.split(/\s+/).filter((c) => c === "UKRadiators-18").length
    );
    expect(classCount).toBe(1);
  });

  test("TC-14 responsive: no horizontal page overflow at the current viewport", async ({ page }) => {
    const viewport = page.viewportSize();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual((viewport?.width ?? 1280) + 5);
  });
});

test.describe("UKRadiators-18 - Cross-page isolation (SPA-navigation leak check)", () => {
  test("TC-15 variation effects do NOT persist after navigating to the homepage", async ({ page }) => {
    await gotoVariation(page);
    await dismissCookieBanner(page);
    await expect(page.locator("body")).toHaveClass(/UKRadiators-18/);

    // Navigate the same way a real visitor would - click the header logo.
    await Promise.all([
      page.waitForURL(HOME_URL, { timeout: 20000 }).catch(() => {}),
      page.locator(SEL.logo).first().click({ force: true }),
    ]);
    await page.waitForFunction(() => !!document.body, { timeout: 20000 });
    await page.waitForTimeout(2000);

    expect(page.url()).toBe(HOME_URL);
    await expect(page.locator("body")).not.toHaveClass(/UKRadiators-18/);
    await expect(page.locator(SEL.saleBanner)).toBeVisible();
  });
});

// Confirmed via manual control-page check (2026-08-24) that these fire on CONTROL too, with
// non-deterministic counts run-to-run (timing/race-dependent 3rd-party theme + tracking scripts) -
// unrelated to vB.js, which only does `document.querySelector('body').classList.add(...)`.
// Patterns are wording-agnostic across browsers (Chrome/Edge vs Firefox vs Safari phrase the
// same underlying error differently, e.g. "Cannot read properties of null (reading 'append')"
// vs "can't access property \"append\", document.body is null").
const KNOWN_PREEXISTING_SITE_ERRORS = [
  /(?=.*append)(?=.*(null|undefined))/i,
  /swapFirstTwoImages is not a function/i,
  /Invalid URL|not a valid URL|URL constructor|cannot be parsed as a URL/i,
  /Failed to fetch|NetworkError|Load failed/i,
  /Blocked a frame at .* from accessing a frame/i,
  /from accessing a frame with origin .*trustpilot/i,
];

test.describe("UKRadiators-18 - Variation console errors", () => {
  test("TC-16 vB.js introduces no NEW uncaught page errors beyond known pre-existing site errors", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await gotoVariation(page);
    await page.waitForTimeout(1500);

    const newErrors = errors.filter(
      (e) => !KNOWN_PREEXISTING_SITE_ERRORS.some((pattern) => pattern.test(e))
    );
    expect(newErrors).toEqual([]);
  });
});
