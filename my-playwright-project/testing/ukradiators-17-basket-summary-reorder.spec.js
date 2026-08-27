// @ts-check
/**
 * UK Radiators - Test 17 (cre-t-17) - Basket Summary reorder on /cart (MOBILE ONLY)
 *
 * Site: ukradiators.com/cart (Shopify) | Platform: Convert.com
 * Variation files: local_testing/Local2/variation/v2.js / vB.css
 *
 * Hypothesis: on mobile, the theme's default flex "order" already renders the Basket Summary
 * ABOVE "Your Basket" (control). The variation moves the Basket Summary DOM node to sit inline,
 * right before the "Continue Shopping" link (i.e. AFTER the product list), only at
 * `max-width: 768px`. Above that breakpoint the variation must behave exactly like control.
 *
 * Confirmed via live DOM inspection (2026-08-27) that the `[data-discounts] + .cart__item-delivery
 * .cart__item-sub.cart__item-row` CSS rule in vB.css does NOT target a "Delivery" line - it targets
 * the "Basket Summary" heading `<strong class="basket-summary-title">` (which happens to share the
 * `.cart__item-delivery.cart__item-sub.cart__item-row` classes in this theme's markup). This hides
 * the redundant heading once the summary is relocated inline - confirmed to match the Figma V1
 * mobile mock (no heading shown in the inline block), so this is intentional, not a bug.
 *
 * IMPORTANT (site quirk, see qa-knowledge-base/ukradiators/_client-notes.md): ukradiators.com's
 * Cloudflare-style bot-protection challenge trips on ~7-8 rapid POST /cart/add.js calls within
 * a couple of minutes, returning HTTP 429 with a "Verifying your connection..." HTML page instead
 * of cart JSON. Each `test.describe` block below therefore adds to cart ONCE (serial mode, shared
 * context via beforeAll/afterAll) instead of once per test - this keeps the whole spec to 4 total
 * add-to-cart calls.
 *
 * Force URLs (Convert.com preview, cro_mode=qa):
 *   Control:    _conv_eforce=100052714.1000257045
 *   Variation:  _conv_eforce=100052714.1000257046
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "https://ukradiators.com/cart?cro_mode=qa";
const CONTROL_URL = `${BASE}&_conv_eforce=100052714.1000257045`;
const VARIATION_URL = `${BASE}&_conv_eforce=100052714.1000257046`;

const VARIATION_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const V2_JS = fs.readFileSync(path.join(VARIATION_DIR, "v2.js"), "utf8");

// Real, normally-priced variants (confirmed live 2026-08-27) - avoids the £0.00 "call for price"
// products that show a non-standard delivery message and clutter report screenshots.
const CART_ITEMS = [
  { id: 57513821700469, quantity: 1 }, // Typhoon - Brushed Brass Electric Towel Rail, £266.00
  { id: 57454425866613, quantity: 1 }, // Grace III Ceramic White Cast Iron Column Radiator, £381.65
];

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

const SEL = {
  cartPage: ".cart__page",
  cartProduct: ".cart-product",
  cartSidebar: ".cart-sidebar",
  outerMarker: ".cre-t-17-outer",
  summaryInlineClass: "cre-t-17-summary-inline",
  basketSummaryHeading: ".basket-summary-title",
  checkoutBtn: 'button.cart__checkout[name="checkout"]',
  expressCheckout: ".additional-checkout-buttons, .shopify-payment-button",
};

async function addToCart(page) {
  // Use the real page's own fetch() (matches the site's normal AJAX-add flow) rather than
  // Playwright's APIRequestContext (page.request.*) - the latter's fingerprint/headers reliably
  // trip ukradiators.com's Cloudflare-style bot-protection challenge (HTTP 429) even when curl
  // and a real in-page fetch() both succeed. See _client-notes.md.
  if (page.url() === "about:blank") {
    await page.goto("https://ukradiators.com/cart", { waitUntil: "domcontentloaded" });
  }
  const result = await page.evaluate(async (items) => {
    const res = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return { ok: res.ok, status: res.status };
  }, CART_ITEMS);
  if (!result.ok) {
    throw new Error(
      `cart/add.js returned ${result.status} - likely the site's bot-protection challenge; space out runs (see _client-notes.md)`
    );
  }
}

async function dismissCookieBanner(page) {
  const accept = page.getByRole("button", { name: "Accept" });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click().catch(() => {});
  }
}

function findContinueShoppingLink(page) {
  return page.locator(`${SEL.cartProduct} a[href="/collections/"]`).filter({ hasText: "Continue Shopping" });
}

// Pacing between describe blocks - ukradiators.com's bot-protection challenge is rate/frequency
// based (total requests in a rolling window, not endpoint-specific), so a fresh context starting
// a new request burst right after the previous block's page loads can trip it. See _client-notes.md.
async function pace(seconds) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// Navigate only - assumes the cart already has items (added once per describe block).
async function openCart(page, url, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SEL.cartProduct, { timeout: 20000 });
  await page.waitForSelector(SEL.cartSidebar, { timeout: 20000 });
  await dismissCookieBanner(page);
  await page.waitForTimeout(1500);
}

test.describe("UKRadiators-17 - Control", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    await pace(45);
    context = await browser.newContext();
    page = await context.newPage();
    await addToCart(page);
  });
  test.afterAll(async () => {
    await context.close();
  });

  test("TC-01 control: no cre-t-17 marker/class exists anywhere on the page (mobile viewport)", async () => {
    await openCart(page, CONTROL_URL, MOBILE_VIEWPORT);
    await expect(page.locator(SEL.outerMarker)).toHaveCount(0);
    await expect(page.locator(`.${SEL.summaryInlineClass}`)).toHaveCount(0);
  });

  test("TC-02 control: Basket Summary is a sibling of the product list, not nested inside it (mobile viewport)", async () => {
    await openCart(page, CONTROL_URL, MOBILE_VIEWPORT);
    const isInside = await page.evaluate(({ p, s }) => {
      return document.querySelector(p).contains(document.querySelector(s));
    }, { p: SEL.cartProduct, s: SEL.cartSidebar });
    expect(isInside).toBe(false);
  });

  test("TC-03 control: Basket Summary renders ABOVE the product list on mobile (theme default flex order)", async () => {
    await openCart(page, CONTROL_URL, MOBILE_VIEWPORT);
    const sidebarTop = await page.locator(SEL.cartSidebar).boundingBox();
    const productTop = await page.locator(SEL.cartProduct).boundingBox();
    expect(sidebarTop.y).toBeLessThan(productTop.y);
  });

  test("TC-04 control: Basket Summary heading ('Basket Summary' text) is visible", async () => {
    await openCart(page, CONTROL_URL, MOBILE_VIEWPORT);
    await expect(page.locator(SEL.basketSummaryHeading)).toBeVisible();
  });

  test("TC-05 control at desktop viewport: same structure, no cre-t-17 marker", async () => {
    await openCart(page, CONTROL_URL, DESKTOP_VIEWPORT);
    await expect(page.locator(SEL.outerMarker)).toHaveCount(0);
    const isInside = await page.evaluate(({ p, s }) => {
      return document.querySelector(p).contains(document.querySelector(s));
    }, { p: SEL.cartProduct, s: SEL.cartSidebar });
    expect(isInside).toBe(false);
  });
});

test.describe("UKRadiators-17 - Variation (mobile viewport, 390x844)", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let context;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(240000); // pace(120) alone exceeds the default 90s hook timeout
    await pace(60);
    context = await browser.newContext();
    page = await context.newPage();
    await addToCart(page);
    await openCart(page, VARIATION_URL, MOBILE_VIEWPORT);
    // .cre-t-17-outer is intentionally `display:none` by v2.js - wait for "attached", not "visible".
    await page.waitForSelector(SEL.outerMarker, { state: "attached", timeout: 15000 });
  });
  test.afterAll(async () => {
    await context.close();
  });

  test("TC-06 marker + summary-inline class present on cart-sidebar at mobile viewport", async () => {
    await expect(page.locator(SEL.outerMarker)).toHaveCount(1);
    await expect(page.locator(SEL.cartSidebar)).toHaveClass(new RegExp(SEL.summaryInlineClass));
  });

  test("TC-07 cart-sidebar is moved to be a DOM child of cart-product", async () => {
    const isInside = await page.evaluate(({ p, s }) => {
      return document.querySelector(p).contains(document.querySelector(s));
    }, { p: SEL.cartProduct, s: SEL.cartSidebar });
    expect(isInside).toBe(true);
  });

  test("TC-08 cart-sidebar sits immediately before the Continue Shopping link (DOM adjacency)", async () => {
    const isImmediatelyBefore = await page.evaluate(({ s }) => {
      const sidebar = document.querySelector(s);
      const link = [...document.querySelectorAll('.cart-product a[href="/collections/"]')].find((a) =>
        a.textContent.includes("Continue Shopping")
      );
      return sidebar.nextElementSibling === link;
    }, { s: SEL.cartSidebar });
    expect(isImmediatelyBefore).toBe(true);
  });

  test("TC-09 visual order: Basket Summary renders above Continue Shopping, below the product list (matches Figma V1)", async () => {
    const sidebarBox = await page.locator(SEL.cartSidebar).boundingBox();
    const continueBox = await findContinueShoppingLink(page).first().boundingBox();
    expect(sidebarBox.y).toBeLessThan(continueBox.y);
  });

  test("TC-10 CSS spec match on the inline Basket Summary block", async () => {
    const cs = await page.evaluate((s) => {
      const el = document.querySelector(s);
      const c = getComputedStyle(el);
      return {
        marginTop: c.marginTop,
        marginBottom: c.marginBottom,
        paddingTop: c.paddingTop,
        paddingBottom: c.paddingBottom,
        borderTopWidth: c.borderTopWidth,
        borderBottomWidth: c.borderBottomWidth,
        borderBottomStyle: c.borderBottomStyle,
        borderBottomColor: c.borderBottomColor,
      };
    }, SEL.cartSidebar);
    expect(cs.marginTop).toBe("0px");
    expect(cs.marginBottom).toBe("24px");
    expect(cs.paddingTop).toBe("24px");
    expect(cs.paddingBottom).toBe("24px");
    expect(cs.borderTopWidth).toBe("0px");
    expect(cs.borderBottomWidth).toBe("1px");
    expect(cs.borderBottomStyle).toBe("solid");
    expect(cs.borderBottomColor).toBe("rgb(217, 217, 217)");
  });

  test("TC-11 [confirms intentional behavior] redundant 'Basket Summary' heading is hidden once inlined", async () => {
    // Matches Figma V1: no duplicate heading shown in the relocated block. See file header note -
    // the CSS selector targeting this is `[data-discounts] + .cart__item-delivery...`, which happens
    // to match the heading element in this theme's markup, not a literal delivery row.
    await expect(page.locator(SEL.basketSummaryHeading)).toBeHidden();
  });

  test("TC-12 core summary content still present after the move: Subtotal, Delivery, Total labels", async () => {
    await expect(page.getByText("Subtotal (incl. VAT):")).toBeVisible();
    await expect(page.locator(SEL.cartSidebar).getByText("Delivery", { exact: true })).toBeVisible();
    await expect(page.locator(SEL.cartSidebar).locator(".total-row")).toContainText("Total:");
  });

  test("TC-13 Checkout button still present, visible, and enabled inside the moved summary", async () => {
    const btn = page.locator(SEL.cartSidebar).locator(SEL.checkoutBtn);
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(btn).toContainText("Checkout Securely Now");
  });

  test("TC-14 Express checkout buttons (Shop Pay / PayPal) still present inside the moved summary", async () => {
    const express = page.locator(SEL.cartSidebar).locator(SEL.expressCheckout);
    expect(await express.count()).toBeGreaterThan(0);
  });

  test("TC-15 duplicate-init guard: re-running v2.js leaves exactly one marker and one summary-inline element", async () => {
    await page.addScriptTag({ content: V2_JS });
    await page.waitForTimeout(800);
    const outerCount = await page.locator(SEL.outerMarker).count();
    const inlineCount = await page.locator(`.${SEL.summaryInlineClass}`).count();
    const sidebarCount = await page.locator(SEL.cartSidebar).count();
    expect(outerCount).toBe(1);
    expect(inlineCount).toBe(1);
    expect(sidebarCount).toBe(1);
  });

  test("TC-16 responsive: no horizontal page overflow at mobile viewport", async () => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 5);
  });

  test("TC-17 cart totals unchanged: Total value matches the control page (same cart)", async () => {
    const variationTotal = await page.locator(SEL.cartSidebar).locator("[data-total] .money").first().textContent();
    await openCart(page, CONTROL_URL, MOBILE_VIEWPORT);
    const controlTotal = await page.locator(SEL.cartSidebar).locator("[data-total] .money").first().textContent();
    expect(variationTotal.trim()).toBe(controlTotal.trim());
  });
});

// Consolidated into a SINGLE page navigation (desktop viewport), then all resizing happens on the
// already-loaded page via setViewportSize - the matchMedia listener v2.js registers on init fires
// on every resize without a reload. This keeps the whole describe block to 1 request burst instead
// of 3, which matters given ukradiators.com's aggressive rate-based bot-protection (see _client-notes.md).
test.describe("UKRadiators-17 - Variation at desktop viewport (mobile-only gate)", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let context;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(240000); // pace(120) alone exceeds the default 90s hook timeout
    await pace(60);
    context = await browser.newContext();
    page = await context.newPage();
    await addToCart(page);
    await openCart(page, VARIATION_URL, DESKTOP_VIEWPORT);
    await page.waitForSelector(SEL.outerMarker, { state: "attached", timeout: 15000 });
  });
  test.afterAll(async () => {
    await context.close();
  });

  test("TC-18 at desktop viewport (1440x900) the summary stays in its original position - NOT moved", async () => {
    // Script still runs (sets up the media-query listener) but should not apply the mobile move.
    const isInside = await page.evaluate(({ p, s }) => {
      return document.querySelector(p).contains(document.querySelector(s));
    }, { p: SEL.cartProduct, s: SEL.cartSidebar });
    expect(isInside).toBe(false);
    await expect(page.locator(`.${SEL.summaryInlineClass}`)).toHaveCount(0);
  });

  test("TC-19 resize desktop -> mobile: summary moves inline live via the matchMedia listener", async () => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.waitForTimeout(1000);
    await page.waitForSelector(`.${SEL.summaryInlineClass}`, { timeout: 5000 }).catch(() => {});
    const isInside = await page.evaluate(({ p, s }) => {
      return document.querySelector(p).contains(document.querySelector(s));
    }, { p: SEL.cartProduct, s: SEL.cartSidebar });
    expect(isInside).toBe(true);
  });

  test("TC-20 resize mobile -> desktop: summary is restored to its original position", async () => {
    // Continues from TC-19's mobile state (already moved inline) - resize back up.
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.waitForTimeout(1000);
    const isInside = await page.evaluate(({ p, s }) => {
      return document.querySelector(p).contains(document.querySelector(s));
    }, { p: SEL.cartProduct, s: SEL.cartSidebar });
    expect(isInside).toBe(false);
    await expect(page.locator(`.${SEL.summaryInlineClass}`)).toHaveCount(0);
  });
});

// See qa-knowledge-base/ukradiators/_client-notes.md - these fire on CONTROL too, wording varies
// per browser engine. Re-confirmed applicable on /cart during this test's own live DOM checks.
const KNOWN_PREEXISTING_SITE_ERRORS = [
  /(?=.*append)(?=.*(null|undefined))/i,
  /swapFirstTwoImages is not a function/i,
  /Invalid URL|not a valid URL|URL constructor|cannot be parsed as a URL/i,
  /Failed to fetch|NetworkError|Load failed/i,
  /Blocked a frame at .* from accessing a frame/i,
  /from accessing a frame with origin .*trustpilot/i,
  // Firefox-only (2026-08-27, /cart page): "id is not defined" thrown from a third-party cart-
  // tracking plugin's observeCartChanges/cartObserver (installSuperPlugin) - confirmed via stack
  // trace to originate outside v2.js entirely, and reproduces the same way with v2.js absent.
  /id is not defined/i,
];

test.describe("UKRadiators-17 - Variation console errors", () => {
  test("TC-21 v2.js introduces no NEW uncaught page errors beyond known pre-existing site errors", async ({ page }, testInfo) => {
    testInfo.setTimeout(240000); // pace(120) alone exceeds the default 90s test timeout
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await pace(60);
    await addToCart(page);
    await openCart(page, VARIATION_URL, MOBILE_VIEWPORT);
    await page.waitForSelector(SEL.outerMarker, { state: "attached", timeout: 15000 });
    await page.waitForTimeout(1500);

    const newErrors = errors.filter((e) => !KNOWN_PREEXISTING_SITE_ERRORS.some((pattern) => pattern.test(e)));
    expect(newErrors).toEqual([]);
  });
});
