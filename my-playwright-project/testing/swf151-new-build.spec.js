// @ts-check
/**
 * SWF151 / cre-t-151 - Sort feature REBUILD (local_testing/swf151-new-code)
 *
 * The rebuild is not in the Convert experiment yet, so there are no force URLs for it. These tests
 * therefore load the real petinsurancegurus.com page and inject the local vB/v2 files into it. That
 * still exercises the genuine article: SWF116 and SWF111 both run at 100% traffic on the live site,
 * so the price-override markup this feature has to read is present exactly as it would be in
 * production. Once the build is in Convert, swap `applyVariation` for a force-URL navigation.
 *
 * Each describe block runs serially against ONE page. This site's CDN rate-limits repeated
 * automated navigation (see qa-knowledge-base/pet-insurance-gurus/_client-notes.md), so tests share
 * a page rather than re-navigating per test.
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SITE = "https://petinsurancegurus.com/";
const BUILD_DIR = path.join(__dirname, "..", "..", "local_testing", "swf151-new-code");
const CSS = fs.readFileSync(path.join(BUILD_DIR, "vB.css"), "utf8");
const JS_V1 = fs.readFileSync(path.join(BUILD_DIR, "vB.js"), "utf8");
const JS_V2 = fs.readFileSync(path.join(BUILD_DIR, "v2.js"), "utf8");

const LISTING = '#comparison-section .plan-repeater > [data-unique$="-Listing-Only"]';

/** Loads the site, waits for the real listings, then injects the build. */
async function applyVariation(page, js) {
  await page.goto(SITE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(LISTING, { timeout: 45000 });
  await page.waitForTimeout(2500); // let the async per-provider prices settle
  await page.addStyleTag({ content: CSS });
  await page.addScriptTag({ content: js });
  await page.waitForSelector("#cre-t-151-sort-dropdown", { timeout: 15000 });
  await page.waitForTimeout(600); // first refresh tick
}

/**
 * The visible ranking: each sortable card's data-unique plus the price the user actually sees.
 * Mirrors the production rule - check the <body> class first (cre-t-111, then cre-t-116), and only
 * fall back to the site's control .ct-span, which stays in the DOM underneath any override.
 */
function readRanking(page) {
  return page.evaluate(() => {
    const OVERRIDES = [
      ["cre-t-111-toolTipContentChange", "cre-t-111-price-update"],
      ["cre-t-116-toolTipContentChange", "cre-t-116-price-update"],
    ];
    const visible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
    };
    const priceOf = (card) => {
      const cols = card.querySelectorAll(".plan-detail-column");
      for (const col of cols) {
        const h = col.querySelector(".plan-detail-heading");
        if (!h || !h.textContent.toLowerCase().includes("average plan cost")) continue;
        const content = col.querySelector(".plan-detail-content");
        if (!content) continue;
        for (const pair of OVERRIDES) {
          if (!document.body.classList.contains(pair[0])) continue;
          const span = content.querySelector("." + pair[1]);
          if (span && visible(span)) return parseFloat(span.textContent.replace(/[^\d.]/g, ""));
        }
        const ctrl = content.querySelector(".ct-span") || content;
        return parseFloat(ctrl.textContent.replace(/[^\d.]/g, ""));
      }
      return NaN;
    };
    const repeater = document.querySelector("#comparison-section .plan-repeater");
    const cards = Array.prototype.filter.call(
      repeater.children,
      (el) => el.matches && el.matches('[data-unique$="-Listing-Only"]')
    );
    // Visual order, which is what the user sees - CSS `order` decouples it from DOM order.
    const sortable = cards.filter((el) => !el.querySelector(".best-overall-bubble"));
    const withOrder = sortable.map((el) => ({
      id: el.getAttribute("data-unique"),
      price: priceOf(el),
      order: parseInt(getComputedStyle(el).order, 10) || 0,
      rank: (el.querySelector(".plan-number") || {}).textContent,
    }));
    withOrder.sort((a, b) => a.order - b.order);
    const pinned = cards.filter((el) => el.querySelector(".best-overall-bubble"))[0] || null;
    return {
      visual: withOrder,
      pinned: pinned && {
        id: pinned.getAttribute("data-unique"),
        badge: (pinned.querySelector(".best-overall-text") || {}).textContent,
        triggers: pinned.querySelectorAll('button[aria-label="Open popover"]').length,
      },
    };
  });
}

/**
 * Ids that appear more than once. The SITE already ships plenty of these - Oxygen's repeater emits
 * the same id on every repeated card (span-126-63-1-1, icon-popover-*, toggle--pro-accordion-*) -
 * so the only meaningful assertion is that WE add none on top of that baseline.
 */
function readDuplicateIds(page) {
  return page.evaluate(() => {
    const counts = {};
    document.querySelectorAll("[id]").forEach((el) => {
      if (el.id) counts[el.id] = (counts[el.id] || 0) + 1;
    });
    return Object.keys(counts)
      .filter((id) => counts[id] > 1)
      .sort();
  });
}

/** The order the site itself renders, read before anything is injected. */
function readControlOrder(page) {
  return page.evaluate(() => {
    const repeater = document.querySelector("#comparison-section .plan-repeater");
    return Array.prototype.filter
      .call(repeater.children, (el) => el.matches && el.matches('[data-unique$="-Listing-Only"]'))
      .filter((el) => !el.querySelector(".best-overall-bubble"))
      .map((el) => el.getAttribute("data-unique"));
  });
}

const openMenu = (page) => page.click("#cre-t-151-sort-toggle");
const pick = async (page, value) => {
  await page.click(`.cre-t-151-sort-option[data-value="${value}"]`);
  await page.waitForTimeout(900); // sort + the debounced refresh tick
};

// ─────────────────────────────────────────────────────────────────────────────
test.describe("V1 - defaults to Best Rated", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;
  let controlOrder;
  let baselineDupes;
  const consoleErrors = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(LISTING, { timeout: 45000 });
    await page.waitForTimeout(2500);
    controlOrder = await readControlOrder(page); // BEFORE injection - the site's own order
    baselineDupes = await readDuplicateIds(page); // ditto - the site's own duplicate ids
    await page.addStyleTag({ content: CSS });
    await page.addScriptTag({ content: JS_V1 });
    await page.waitForSelector("#cre-t-151-sort-dropdown", { timeout: 15000 });
    await page.waitForTimeout(600);
  });

  test.afterAll(async () => {
    if (page) await page.close();
  });

  test("TC-01 body carries the variation class", async () => {
    await expect(page.locator("body")).toHaveClass(/cre-t-151/);
  });

  test("TC-02 sort pill injected once, reading Best Rated", async () => {
    await expect(page.locator("#cre-t-151-sort-dropdown")).toHaveCount(1);
    await expect(page.locator(".cre-t-151-sort-toggle-value")).toHaveText("Best Rated");
  });

  test("TC-03 copy line injected once, reading best rated", async () => {
    await expect(page.locator("#cre-t-151-sort-copy")).toHaveCount(1);
    await expect(page.locator(".cre-t-151-sort-value")).toHaveText("best rated");
  });

  test("TC-04 Best Rated leaves the site's own order untouched", async () => {
    const r = await readRanking(page);
    expect(r.visual.map((v) => v.id)).toEqual(controlOrder);
  });

  test("TC-05 menu opens with exactly the two options, no 'Sort by' prefix", async () => {
    await openMenu(page);
    await expect(page.locator("#cre-t-151-sort-dropdown")).toHaveClass(/cre-t-151-is-open/);
    const labels = await page.locator(".cre-t-151-sort-option").allTextContents();
    expect(labels.map((t) => t.replace(/[✓\s]+/g, " ").trim())).toEqual(["Best Rated", "Lowest Price"]);
  });

  test("TC-06 Escape closes the menu", async () => {
    await page.keyboard.press("Escape");
    await expect(page.locator("#cre-t-151-sort-dropdown")).not.toHaveClass(/cre-t-151-is-open/);
  });

  test("TC-07 click outside closes the menu", async () => {
    await openMenu(page);
    await page.locator("h1, h2").first().click({ force: true });
    await expect(page.locator("#cre-t-151-sort-dropdown")).not.toHaveClass(/cre-t-151-is-open/);
  });

  test("TC-08 Lowest Price updates the pill and the copy", async () => {
    await openMenu(page);
    await pick(page, "lowest-price");
    await expect(page.locator(".cre-t-151-sort-toggle-value")).toHaveText("Lowest Price");
    await expect(page.locator(".cre-t-151-sort-value")).toHaveText("lowest price");
  });

  test("TC-09 Lowest Price orders the cards by ascending displayed price", async () => {
    const r = await readRanking(page);
    const prices = r.visual.map((v) => v.price);
    expect(prices.every((p) => !Number.isNaN(p))).toBe(true);
    expect(prices).toEqual(prices.slice().sort((a, b) => a - b));
  });

  test("TC-10 rank bubbles renumber to match the visible order", async () => {
    const r = await readRanking(page);
    expect(r.visual.map((v) => v.rank)).toEqual(r.visual.map((_, i) => String(i + 1)));
  });

  test("TC-11 pinned card badge switches to Lowest Price", async () => {
    const r = await readRanking(page);
    expect(r.pinned.badge).toBe("Lowest Price");
  });

  test("TC-12 pinned card data-unique matches the new #1 card", async () => {
    const r = await readRanking(page);
    expect(r.pinned.id).toBe(r.visual[0].id);
  });

  test("TC-13 pinned card keeps exactly two tooltip triggers", async () => {
    const r = await readRanking(page);
    expect(r.pinned.triggers).toBe(2); // not 0 (lost into the clone) and not 4 (duplicated)
  });

  test("TC-14 cloning adds no id attributes and no new duplicate ids", async () => {
    // stripIds() must leave the CLONED markup free of ids. The only ids legitimately inside the
    // clone belong to the real popover triggers, which are moved in rather than copied - they are
    // the site's own bound elements and keep their own ids, and a move duplicates nothing.
    const strayIds = await page.evaluate(() =>
      Array.prototype.filter
        .call(document.querySelectorAll(".cre-t-151-clone [id]"), function (el) {
          return !el.closest('button[aria-label="Open popover"]');
        })
        .map(function (el) {
          return el.id;
        })
    );
    expect(strayIds).toEqual([]);
    // The real invariant: the set of duplicated ids is unchanged from before we injected.
    expect(await readDuplicateIds(page)).toEqual(baselineDupes);
  });

  test("TC-15 switching back to Best Rated restores the control order exactly", async () => {
    await openMenu(page);
    await pick(page, "best-rated");
    const r = await readRanking(page);
    expect(r.visual.map((v) => v.id)).toEqual(controlOrder);
    expect(r.pinned.badge).toBe("Best Overall");
    expect(r.pinned.id).toBe(controlOrder[0]);
  });

  test("TC-16 REGRESSION sort, switch pet type repeatedly, revert - order still matches control", async () => {
    await openMenu(page);
    await pick(page, "lowest-price");
    const labels = ["Cats", "Dogs", "Cats", "All Pets"];
    for (let i = 0; i < labels.length; i++) {
      const tab = page.locator("#comparison-section .oxy-tab", { hasText: labels[i] }).first();
      if (await tab.count()) {
        await tab.click();
        await page.waitForTimeout(1600);
      }
    }
    await openMenu(page);
    await pick(page, "best-rated");
    await page.waitForTimeout(1200);
    const r = await readRanking(page);
    expect(r.visual.map((v) => v.id)).toEqual(controlOrder);
  });

  test("TC-17 no console or page errors during the run", async () => {
    expect(consoleErrors.filter((e) => /cre-t-151|TypeError|is not a function/i.test(e))).toEqual([]);
  });

  test("TC-18 responsive sort field visible, ZIP placeholder shortened below 768px", async () => {
    const width = page.viewportSize().width;
    await expect(page.locator("#cre-t-151-sort-dropdown")).toBeVisible();
    const placeholder = await page
      .locator("#comparison-section .zip-textinput input")
      .getAttribute("placeholder");
    if (width <= 767) expect(placeholder).toBe("ZIP code");
    else expect(placeholder).not.toBe("ZIP code");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("V2 - defaults to Lowest Price", () => {
  test.describe.configure({ mode: "serial" });
  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await applyVariation(page, JS_V2);
  });

  test.afterAll(async () => {
    if (page) await page.close();
  });

  test("TC-19 loads already reading Lowest Price, no interaction", async () => {
    await expect(page.locator(".cre-t-151-sort-toggle-value")).toHaveText("Lowest Price");
    await expect(page.locator(".cre-t-151-sort-value")).toHaveText("lowest price");
  });

  test("TC-20 lowest-price option is already the selected one", async () => {
    await expect(page.locator('.cre-t-151-sort-option[data-value="lowest-price"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("TC-21 cards are already in ascending price order on first paint", async () => {
    const r = await readRanking(page);
    const prices = r.visual.map((v) => v.price);
    expect(prices).toEqual(prices.slice().sort((a, b) => a - b));
  });

  test("TC-22 pinned card already mirrors the cheapest provider", async () => {
    const r = await readRanking(page);
    expect(r.pinned.badge).toBe("Lowest Price");
    expect(r.pinned.id).toBe(r.visual[0].id);
  });
});
