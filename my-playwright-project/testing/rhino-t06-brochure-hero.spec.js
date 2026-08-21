// @ts-check
/**
 * Rhino Greenhouses - Test 06 - Brochure page hero rebuild + bestsellers swap
 *
 * Site: rhinogreenhouses.co.uk/pages/request-a-brochure (Shopify)
 * Variation body class: Test_06
 * Variation files: local_testing/Local2/variation/vB.js / vB.css
 *
 * Hypothesis: promote the strongest hero headline/subhead + an autoplay brochure video above the
 * fold, hide "what's in the pack" + the now-empty request/video section below the form, swap the
 * 3-collection block for the homepage's 4-item bestsellers block, and hide the bottom image gallery.
 *
 * Force URLs (Convert.com preview, cro_mode=qa):
 *   Control:    _conv_eforce=100052693.1000256995
 *   Variation:  _conv_eforce=100052693.1000256996
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "https://www.rhinogreenhouses.co.uk/pages/request-a-brochure?cro_mode=qa";
const CONTROL_URL = `${BASE}&_conv_eforce=100052693.1000256995`;
const VARIATION_URL = `${BASE}&_conv_eforce=100052693.1000256996`;

const VARIATION_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const VB_JS = fs.readFileSync(path.join(VARIATION_DIR, "vB.js"), "utf8");

const SEL = {
  heading: "#brochure_content__heading",
  subheading: ".qa-hero-subheading",
  bodycopy: ".qa-hero-bodycopy",
  video: ".qa-hero-video",
  whatsInPack: ".whats-in-pack-toggle",
  brochureDesc: ".brochure_description",
  requestSection: "#shopify-section-template--27460884431223__media_with_text_ff7q34",
  collectionsSection: "#shopify-section-template--27460884431223__multicolumn_QmtE6E",
  bestsellers: "#qa-bestsellers-swap-section",
  gallery1: "#shopify-section-template--27460884431223__gallery_panel_NMwzyz",
};

const EXPECTED_HEADING = "Request our free, beautiful brochure pack";
const EXPECTED_SUBHEADING = "and imagine your new Rhino over a cuppa";
const EXPECTED_BODYCOPY =
  "If you can't get to see a Rhino in real life, this is the next best thing! Because our greenhouses come with more as standard than any other, we'll also include a swatch of metal colour samples with your brochure!";

async function gotoVariation(page) {
  await page.goto(VARIATION_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body.Test_06", { timeout: 15000 });
  await page.waitForSelector(SEL.subheading, { timeout: 15000 });
  await page.waitForSelector(SEL.bestsellers, { timeout: 15000 });
}

test.describe("Rhino T06 - Control", () => {
  test("TC-01 control has no Test_06 class and no hero injections", async ({ page }) => {
    await page.goto(CONTROL_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(SEL.heading);
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toHaveClass(/Test_06/);
    await expect(page.locator(SEL.subheading)).toHaveCount(0);
    await expect(page.locator(SEL.bodycopy)).toHaveCount(0);
    await expect(page.locator(SEL.video)).toHaveCount(0);
    await expect(page.locator(SEL.bestsellers)).toHaveCount(0);
  });

  test("TC-02 control heading is the original, unshortened copy", async ({ page }) => {
    await page.goto(CONTROL_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(SEL.heading);
    await expect(page.locator(SEL.heading)).not.toHaveText(EXPECTED_HEADING);
  });

  test("TC-03 control shows what's-in-the-pack, request section, collections; no bestsellers swap", async ({
    page,
  }) => {
    await page.goto(CONTROL_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(SEL.whatsInPack);
    // .whats-in-pack-toggle matches BOTH the Digital and Physical brochure tab panels;
    // only the active tab's copy is actually visible, so match on :visible rather than .first().
    await expect(page.locator(`${SEL.whatsInPack}:visible`)).toHaveCount(1);
    await expect(page.locator(SEL.requestSection)).toBeVisible();
    await expect(page.locator(SEL.collectionsSection)).toBeVisible();
    await expect(page.locator(SEL.gallery1)).toBeVisible();
  });
});

test.describe("Rhino T06 - Variation", () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test("TC-04 body gets Test_06 class", async ({ page }) => {
    await expect(page.locator("body")).toHaveClass(/Test_06/);
  });

  test("TC-05 hero heading text matches Figma exactly", async ({ page }) => {
    await expect(page.locator(SEL.heading)).toHaveText(EXPECTED_HEADING);
  });

  test("TC-06 subheading moved into hero with correct copy", async ({ page }) => {
    const text = (await page.locator(SEL.subheading).textContent())?.trim();
    expect(text).toBe(EXPECTED_SUBHEADING);
  });

  test("TC-07 body copy moved into hero with correct copy", async ({ page }) => {
    const text = (await page.locator(SEL.bodycopy).textContent())?.trim().replace(/\s+/g, " ");
    expect(text).toBe(EXPECTED_BODYCOPY);
  });

  test("TC-08 DOM order is heading -> subheading -> bodycopy -> video -> form", async ({ page }) => {
    const order = await page.evaluate(() => {
      const heading = document.getElementById("brochure_content__heading");
      const out = [];
      let n = heading;
      while (n) {
        out.push(n.className || n.id || n.tagName);
        n = n.nextElementSibling;
      }
      return out;
    });
    const idxSub = order.findIndex((c) => /qa-hero-subheading/.test(c));
    const idxBody = order.findIndex((c) => /qa-hero-bodycopy/.test(c));
    const idxVideo = order.findIndex((c) => /qa-hero-video/.test(c));
    expect(idxSub).toBeGreaterThan(-1);
    expect(idxBody).toBeGreaterThan(idxSub);
    expect(idxVideo).toBeGreaterThan(idxBody);
  });

  test("TC-09 what's-in-the-pack copy is hidden", async ({ page }) => {
    await expect(page.locator(SEL.whatsInPack).first()).toBeHidden();
    await expect(page.locator(SEL.brochureDesc).first()).toBeHidden();
  });

  test("TC-10 emptied request/video section is hidden", async ({ page }) => {
    await expect(page.locator(SEL.requestSection)).toBeHidden();
  });

  test("TC-11 collections section hidden and bestsellers section shown in its place", async ({ page }) => {
    await expect(page.locator(SEL.collectionsSection)).toBeHidden();
    await expect(page.locator(SEL.bestsellers)).toBeVisible();
    const isNextSibling = await page.evaluate(() => {
      const collections = document.querySelector(
        "#shopify-section-template--27460884431223__multicolumn_QmtE6E"
      );
      const bestsellers = document.getElementById("qa-bestsellers-swap-section");
      return collections?.nextElementSibling === bestsellers;
    });
    expect(isNextSibling).toBe(true);
  });

  test("TC-12 bestsellers section actually contains product cards", async ({ page }) => {
    // Imported markup uses plain divs (no <li>/.grid__item) - product links are the reliable anchor.
    const count = await page.locator(`${SEL.bestsellers} a[href*="/products/"]`).count();
    expect(count).toBeGreaterThan(0);
  });

  test("TC-13 bottom image gallery is hidden", async ({ page }) => {
    await expect(page.locator(SEL.gallery1)).toBeHidden();
  });

  test("TC-14 no duplicate injection when variation script runs a second time", async ({ page }) => {
    await page.addScriptTag({ content: VB_JS });
    await page.waitForTimeout(1000);
    await expect(page.locator(SEL.subheading)).toHaveCount(1);
    await expect(page.locator(SEL.bodycopy)).toHaveCount(1);
    await expect(page.locator(SEL.video)).toHaveCount(1);
    await expect(page.locator(SEL.bestsellers)).toHaveCount(1);
    await expect(page.locator(SEL.heading)).toHaveText(EXPECTED_HEADING);
  });

  test("TC-15 responsive: no horizontal page overflow at the current viewport", async ({ page }) => {
    const viewport = page.viewportSize();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual((viewport?.width ?? 1280) + 5);
  });

  test("TC-16 [KNOWN SITE ISSUE, not introduced by this test - see BUG-01] hero video actually loads/plays", async ({
    page,
  }) => {
    const video = page.locator(`${SEL.video} video`);
    await expect(video).toHaveCount(1);
    await page.waitForTimeout(2000);
    const readyState = await video.evaluate((v) => v.readyState);
    expect(readyState).toBeGreaterThan(0);
  });
});

test.describe("Rhino T06 - Variation console errors", () => {
  test("TC-17 no uncaught page errors from the variation script", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await gotoVariation(page);
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});
