// @ts-check
/**
 * Rhino Greenhouses - Test 05 - Cart Reformatted content
 *
 * Site: rhinogreenhouses.co.uk/cart (Shopify) | Platform: Convert.com
 * Audience: All UK users when a greenhouse has been added to the cart
 * Variation body class: cre-t-05
 * Variation files: local_testing/Local2/variation/vB.js / vB.css
 *
 * Hypothesis: on /cart, hide the nav (show only the logo), hide the alert banner, hide the
 * installer prompt, hide the buy box's shipping/delivery section, hide the credit card logos +
 * text, reformat the two remaining pay-now/reserve-later options with new headings/copy per
 * Figma, and change the checkout CTA copy to "continue to checkout".
 *
 * Confirmed live (2026-08-31) against the real Convert.com preview + local code review:
 *   - All hide/reformat changes work correctly and match Figma exactly.
 *   - BUG-01 [HIGH]: the CTA button still reads "checkout securely" - the required copy change
 *     to "continue to checkout" was never implemented in vB.js/vB.css. TC-17 below asserts the
 *     Figma-specified copy per the QA workflow rule (assert the spec, not the code), so it is
 *     EXPECTED TO FAIL until the code is fixed.
 *
 * Force URLs (Convert.com preview, cro_mode=qa):
 *   Control:    _conv_eforce=100052681.1000256969
 *   Variation:  _conv_eforce=100052681.1000256970
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "https://www.rhinogreenhouses.co.uk/cart?cro_mode=qa";
const CONTROL_URL = `${BASE}&_conv_eforce=100052681.1000256969`;
const VARIATION_URL = `${BASE}&_conv_eforce=100052681.1000256970`;

const VARIATION_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const VB_JS = fs.readFileSync(path.join(VARIATION_DIR, "vB.js"), "utf8");

// Rhino Classic 6x8 Tuscan Olive - real, in-stock variant (confirmed live via products.json,
// £2,499.00), matches the product shown in the Figma mockups exactly.
const VARIANT_ID = 39446307766456;

const SEL = {
  secondaryNav: ".header__secondary-nav",
  inlineMenu: ".header__inline-menu",
  headerSearch: ".header__search",
  headerBasket: ".header__basket",
  headerMobileLeft: ".header__mobile-left",
  logo: ".header__heading-link",
  announcementBar: ".announcement-bar",
  installer: ".template__cart__recommended-installer",
  delivery: ".template__cart__deposit-opt-out__delivery",
  discount: ".template__cart__deposit-opt-out__discount",
  paymentIcons: ".cart-payment-icons",
  cartMessage: ".template__cart__message",
  optionPrice1: ".cre-t-05-price-1",
  optionPrice2: ".cre-t-05-price-2",
  headerContent: ".cre-t-05-header-content",
  addSubContent: ".cre-t-05-add-sub-content",
  checkoutBtn: 'button[name="checkout"]',
  orderTotal: ".template__cart__total__figure",
};

const EXPECTED = {
  orderNowHeading: "Order Now",
  reserveLaterHeading: "Reserve for Later",
  orderNowCopy: "We'll get to work on your greenhouse right away and ship it when it's ready (usually 2-6 weeks). Free shipping to UK mainland.",
  reserveLaterCopy: "Pay a 10% deposit and we'll reserve your greenhouse at this price for up to 6 months, regardless of any future price increases. Final balance is due 2 weeks before delivery.",
  checkoutCopy: "continue to checkout", // per Figma - TC-17 documents BUG-01 (code still says "checkout securely")
};

// rhinogreenhouses.co.uk's Shopify /cart/add.js trips a 429 rate-limit challenge under the burst
// of add-to-cart calls this full 7-project suite makes in a short window (confirmed live
// 2026-08-31, same class of platform-level rate limiting as ukradiators.com - see
// qa-knowledge-base/ukradiators/_client-notes.md - but not previously documented for this
// client). Retry with backoff rather than failing the whole describe block over transient 429s.
async function addToCart(page, attempt = 1) {
  if (page.url() === "about:blank") {
    await page.goto("https://www.rhinogreenhouses.co.uk/cart", { waitUntil: "domcontentloaded" });
  }
  const result = await page.evaluate(async (id) => {
    const res = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id, quantity: 1 }] }),
    });
    return { ok: res.ok, status: res.status };
  }, VARIANT_ID);
  if (!result.ok) {
    if (result.status === 429 && attempt < 5) {
      await new Promise((resolve) => setTimeout(resolve, 30000 * attempt));
      return addToCart(page, attempt + 1);
    }
    throw new Error(`cart/add.js returned ${result.status}`);
  }
}

// Cache one cart session's cookies for the whole file run and reuse them across every describe
// block below, instead of calling /cart/add.js once per block - cuts this spec from ~4 add-to-cart
// POSTs per browser project down to 1, which is what actually avoids the 429 rate-limit (a fixed
// retry/backoff on each call wasn't enough once the site's rate window was already primed by a
// prior run - see _client-notes.md).
let cachedStorageState = null;
async function getCartStorageState(browser) {
  if (cachedStorageState) return cachedStorageState;
  const context = await browser.newContext();
  const page = await context.newPage();
  await addToCart(page);
  cachedStorageState = await context.storageState();
  await context.close();
  return cachedStorageState;
}

async function dismissCookieBanner(page) {
  const accept = page.getByRole("button", { name: /accept/i });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click().catch(() => {});
  }
}

async function openCart(page, url, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SEL.orderTotal, { timeout: 20000 });
  await dismissCookieBanner(page);
  await page.waitForTimeout(1500);
}

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe("Rhino T05 - Control", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let context;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(420000); // addToCart's 429 backoff alone can exceed the default 90s hook timeout
    context = await browser.newContext({ storageState: await getCartStorageState(browser) });
    page = await context.newPage();
    await openCart(page, CONTROL_URL, DESKTOP_VIEWPORT);
  });
  test.afterAll(async () => {
    if (context) await context.close();
  });

  test("TC-01 control: no cre-t-05 class, nav/icons/basket all visible", async () => {
    await expect(page.locator("body")).not.toHaveClass(/cre-t-05/);
    await expect(page.locator(SEL.inlineMenu)).toBeVisible();
    await expect(page.locator(SEL.headerSearch)).toBeVisible();
    await expect(page.locator(SEL.headerBasket)).toBeVisible();
  });

  test("TC-02 control: alert banner visible", async () => {
    await expect(page.locator(SEL.announcementBar)).toBeVisible();
  });

  test("TC-03 control: installer prompt visible", async () => {
    await expect(page.locator(SEL.installer)).toBeVisible();
  });

  test("TC-04 control: shipping/delivery section of buy box visible", async () => {
    await expect(page.locator(SEL.delivery)).toBeVisible();
  });

  test("TC-05 control: credit card logos + discount text + PayPal message visible", async () => {
    await expect(page.locator(SEL.paymentIcons)).toBeVisible();
    await expect(page.locator(SEL.discount)).toBeVisible();
    await expect(page.locator(SEL.cartMessage)).toBeVisible();
  });

  test("TC-06 control: original option headings visible (not yet reformatted)", async () => {
    await expect(page.getByText("Amount to pay today for standard delivery")).toBeVisible();
    await expect(page.getByText("Delay delivery past 2 - 6 weeks with 10% deposit")).toBeVisible();
  });

  test("TC-07 control: checkout button says 'checkout securely' (baseline)", async () => {
    await expect(page.locator(SEL.checkoutBtn)).toContainText("checkout securely");
  });
});

test.describe("Rhino T05 - Variation (desktop)", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let context;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(420000); // addToCart's 429 backoff alone can exceed the default 90s hook timeout
    context = await browser.newContext({ storageState: await getCartStorageState(browser) });
    page = await context.newPage();
    await openCart(page, VARIATION_URL, DESKTOP_VIEWPORT);
    await page.waitForSelector("body.cre-t-05", { timeout: 15000 });
  });
  test.afterAll(async () => {
    if (context) await context.close();
  });

  test("TC-08 variation: body.cre-t-05 class present", async () => {
    await expect(page.locator("body")).toHaveClass(/cre-t-05/);
  });

  test("TC-09 variation: nav/search/basket hidden, only logo visible", async () => {
    await expect(page.locator(SEL.inlineMenu)).toBeHidden();
    await expect(page.locator(SEL.headerSearch)).toBeHidden();
    await expect(page.locator(SEL.headerBasket)).toBeHidden();
    await expect(page.locator(SEL.secondaryNav)).toBeHidden();
    await expect(page.locator(SEL.logo)).toBeVisible();
  });

  test("TC-10 variation: alert banner hidden", async () => {
    await expect(page.locator(SEL.announcementBar)).toBeHidden();
  });

  test("TC-11 variation: installer prompt hidden", async () => {
    await expect(page.locator(SEL.installer)).toBeHidden();
  });

  test("TC-12 variation: shipping/delivery section of buy box hidden", async () => {
    await expect(page.locator(SEL.delivery)).toBeHidden();
  });

  test("TC-13 variation: credit card logos + discount text + PayPal message hidden", async () => {
    await expect(page.locator(SEL.paymentIcons)).toBeHidden();
    await expect(page.locator(SEL.discount)).toBeHidden();
    await expect(page.locator(SEL.cartMessage)).toBeHidden();
  });

  test("TC-14 variation: original option headings are hidden (replaced)", async () => {
    await expect(page.getByText("Amount to pay today for standard delivery")).toBeHidden();
    await expect(page.getByText("Delay delivery past 2 - 6 weeks with 10% deposit")).toBeHidden();
  });

  test("TC-15 variation: 'Order Now' heading + exact Figma copy", async () => {
    const opt1 = page.locator(SEL.optionPrice1);
    await expect(opt1.locator(SEL.headerContent)).toHaveText(EXPECTED.orderNowHeading);
    const text = (await opt1.locator(".template__cart__deposit-opt-out__option__text").innerText()).replace(/\s+/g, " ").trim();
    expect(text).toContain(EXPECTED.orderNowCopy);
  });

  test("TC-16 variation: 'Reserve for Later' heading + exact Figma copy", async () => {
    const opt2 = page.locator(SEL.optionPrice2);
    await expect(opt2.locator(SEL.headerContent)).toHaveText(EXPECTED.reserveLaterHeading);
    const text = (await opt2.locator(".template__cart__deposit-opt-out__option__text").innerText()).replace(/\s+/g, " ").trim();
    expect(text).toContain(EXPECTED.reserveLaterCopy);
  });

  test("TC-17 [documents BUG-01, expected to fail] checkout CTA copy should be 'continue to checkout' per Figma", async () => {
    // expect.soft: this must surface as a failure (not be weakened to a pass) per the QA workflow
    // rule of asserting the Figma spec, but must not abort the rest of this serial describe block.
    await expect.soft(page.locator(SEL.checkoutBtn)).toContainText(EXPECTED.checkoutCopy);
  });

  test("TC-18 variation: order total unchanged from control (£2,499.00)", async () => {
    await expect(page.locator(SEL.orderTotal)).toHaveText("£2,499.00");
  });

  test("TC-19 responsive: no horizontal page overflow at desktop viewport", async () => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(DESKTOP_VIEWPORT.width + 5);
  });

  test("TC-20 dedup guard: re-running vB.js does not duplicate injected headings/copy", async () => {
    await page.addScriptTag({ content: VB_JS });
    await page.waitForTimeout(800);
    await expect(page.locator(SEL.optionPrice1).locator(SEL.headerContent)).toHaveCount(1);
    await expect(page.locator(SEL.optionPrice2).locator(SEL.headerContent)).toHaveCount(1);
    await expect(page.locator(SEL.optionPrice1).locator(SEL.addSubContent)).toHaveCount(1);
  });
});

test.describe("Rhino T05 - Variation (mobile viewport, 390x844)", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let context;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(420000); // addToCart's 429 backoff alone can exceed the default 90s hook timeout
    context = await browser.newContext({ storageState: await getCartStorageState(browser) });
    page = await context.newPage();
    await openCart(page, VARIATION_URL, MOBILE_VIEWPORT);
    await page.waitForSelector("body.cre-t-05", { timeout: 15000 });
  });
  test.afterAll(async () => {
    if (context) await context.close();
  });

  test("TC-21 mobile: nav/mobile-left hidden, only logo visible, no horizontal overflow", async () => {
    await expect(page.locator(SEL.headerMobileLeft)).toBeHidden();
    await expect(page.locator(SEL.headerBasket)).toBeHidden();
    await expect(page.locator(SEL.logo)).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 5);
  });

  test("TC-22 mobile: installer prompt + shipping section + payment icons all hidden", async () => {
    await expect(page.locator(SEL.installer)).toBeHidden();
    await expect(page.locator(SEL.delivery)).toBeHidden();
    await expect(page.locator(SEL.paymentIcons)).toBeHidden();
  });

  test("TC-23 mobile: 'Order Now' / 'Reserve for Later' headings visible with reformatted copy", async () => {
    await expect(page.locator(SEL.optionPrice1).locator(SEL.headerContent)).toHaveText(EXPECTED.orderNowHeading);
    await expect(page.locator(SEL.optionPrice2).locator(SEL.headerContent)).toHaveText(EXPECTED.reserveLaterHeading);
  });
});

// Third-party/site noise unrelated to vB.js, which contains zero fetch/XHR/iframe/speechSynthesis
// calls (confirmed via full source read) - so these can only originate from other widgets already
// on the page (feefo reviews, Klaviyo forms, Intelligems pricing), not from this test's code.
// Confirmed live 2026-08-31 on Safari Desktop: WebKit's Intelligent Tracking Prevention blocks
// Klaviyo/Intelligems third-party requests and a sandboxed iframe, plus a stray
// `window.speechSynthesis` call from an unrelated widget - same class of noise as Firefox's
// generic "network error" reports from third-party POSTs.
const KNOWN_PREEXISTING_SITE_ERRORS = [
  /A network error occurred\.?/i,
  /POST request error/i,
  /Unexpected token ':'/i,
  /due to access control checks\.?/i,
  /Blocked a frame at .* from accessing a frame/i,
  /speechSynthesis/i,
  /Cross-origin script load denied/i,
  /recommendationsTab/i, // unrelated Shopify "Product recommendations" widget, not present in vB.js
  /ResizeObserver loop/i, // benign browser warning surfaced as a page error in some engines
];

test.describe("Rhino T05 - Variation console errors", () => {
  test("TC-24 vB.js introduces no uncaught page errors", async ({ browser }, testInfo) => {
    testInfo.setTimeout(420000); // addToCart's 429 backoff alone can exceed the default 90s test timeout
    const context = await browser.newContext({ storageState: await getCartStorageState(browser) });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await openCart(page, VARIATION_URL, DESKTOP_VIEWPORT);
    await page.waitForSelector("body.cre-t-05", { timeout: 15000 });
    await page.waitForTimeout(1500);
    await context.close();
    const newErrors = errors.filter((e) => !KNOWN_PREEXISTING_SITE_ERRORS.some((pattern) => pattern.test(e)));
    expect(newErrors).toEqual([]);
  });
});
