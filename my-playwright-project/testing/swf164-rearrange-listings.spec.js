// @ts-check
/**
 * SWF164 / cre-t-164 - Pet Insurance Gurus "Rearrange Listings"
 *
 * Ticket: reorders the 10-partner comparison list + swaps several rating scores/labels for two
 * arms (Proposed Control = vB.js/vB.css, Proposed Variation = va3.js/va3.css). Requirement: with the
 * "All Pets" filter (the default / no filter active), the test order+ratings apply. With ANY other
 * filter active (Cats, Dogs, breed, ZIP), sorting reverts to the site's native order, but the
 * TEST RATINGS must keep showing (not reverted).
 *
 * Live force-preview recon (2026-09-09) found variation 1000257233 (Proposed Control / V1) does not
 * inject any cre-t-164 markup on the live site, even though the Convert bucketing cookie confirms
 * this browser IS assigned to that variation (_conv_v exp map shows
 * 100052787.{v.1000257233-g.{}}) - i.e. Convert has not had vB.js/vB.css wired to that variation slot
 * yet. Variation 1000257236 (Proposed Variation / V2) DOES work live. RESOLVED 2026-09-10: client
 * issued a new V1 variation ID, 1000257234, confirmed live-working via recon (body carries
 * cre-t-164-default, toggle present). This suite still uses LOCAL INJECTION of the real
 * vB.js/vB.css and va3.js/va3.css files against the real live site for both arms, for consistency
 * across QA passes, mirroring the established swf151-new-build.spec.js pattern for this client.
 *
 * Each describe block runs serially against ONE page - this site's CDN rate-limits repeated
 * automated navigation (see qa-knowledge-base/pet-insurance-gurus/_client-notes.md).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SITE = "https://petinsurancegurus.com/";
const BUILD_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const CSS_V1 = fs.readFileSync(path.join(BUILD_DIR, "vB.css"), "utf8");
const JS_V1 = fs.readFileSync(path.join(BUILD_DIR, "vB.js"), "utf8");
const CSS_V2 = fs.readFileSync(path.join(BUILD_DIR, "va3.css"), "utf8");
const JS_V2 = fs.readFileSync(path.join(BUILD_DIR, "va3.js"), "utf8");

const REPEATER = '.plan-repeater[data-unique="comparison-table"]';
const CARD = REPEATER + ' > [data-unique$="-Listing-Only"]';

// Per the Google Sheet in the ticket.
const CONTROL_ORDER = ["Lemonade", "Fetch", "Embrace", "Pumpkin", "Figo", "Liberty Mutual", "Trupanion", "Odie", "ASPCA", "AKC"];
const CONTROL_RATINGS = {
  Lemonade: "9.6 Exceptional",
  Fetch: "8.6 Excellent",
  Embrace: "8.5 Excellent",
  Pumpkin: "8.1 Very Good",
  Figo: "7.4 Very Good",
  "Liberty Mutual": "6.7 Good",
  Trupanion: "6.5 Good",
  Odie: "4.8 Average",
  ASPCA: "4.5 Average",
  AKC: "4.3 Average",
};

const VARIATION_ORDER = ["Lemonade", "Pumpkin", "Fetch", "Embrace", "Figo", "Liberty Mutual", "Trupanion", "Odie", "ASPCA", "AKC"];
const VARIATION_RATINGS = {
  Lemonade: "9.6 Exceptional",
  Pumpkin: "8.7 Excellent",
  Fetch: "8.6 Excellent",
  Embrace: "8.5 Excellent",
  Figo: "7.4 Very Good",
  "Liberty Mutual": "6.7 Good",
  Trupanion: "6.5 Good",
  Odie: "4.8 Average",
  ASPCA: "4.5 Average",
  AKC: "4.3 Average",
};

/** Loads the real site fresh and waits for the real listings to render. */
async function gotoSite(page) {
  await page.goto(SITE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(CARD, { timeout: 45000 });
  await page.waitForTimeout(2500); // let async per-provider data settle
}

/** Injects the given build (css+js) into an already-loaded page. */
async function inject(page, css, js) {
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: js });
  await page.waitForTimeout(1000); // waitForElement poll interval + first init tick
}

/**
 * Reads what a human actually SEES: for each card, the visible rank number and rating text.
 * Rating overrides land as CSS ::after content (never DOM text), so textContent alone can't see
 * them - getComputedStyle(el, '::after').content is the only way to read what's rendered.
 */
function readListing(page) {
  return page.evaluate(
    ({ REPEATER, CARD }) => {
      const renderedText = (el) => {
        if (!el) return null;
        const after = getComputedStyle(el, "::after").content;
        if (after && after !== "none" && after !== '""') {
          return after.replace(/^"|"$/g, "");
        }
        return el.textContent.trim();
      };
      const repeater = document.querySelector(REPEATER);
      const all = Array.from(document.querySelectorAll(CARD));
      const cards = all.map((el) => {
        const m = /^outbound-partner-clicks-(.+)-Listing-Only$/.exec(el.getAttribute("data-unique") || "");
        const cs = getComputedStyle(el);
        return {
          name: m ? m[1] : el.getAttribute("data-unique"),
          hasBubble: !!el.querySelector(".best-overall-bubble"),
          order: parseInt(cs.order, 10) || 0,
          visible: cs.display !== "none",
          rank: renderedText(el.querySelector(".plan-number")),
          total: renderedText(el.querySelector(".cre-t-135-total")),
          classification: renderedText(el.querySelector(".cre-t-135-classification")),
        };
      });
      const sortable = cards.filter((c) => !c.hasBubble);
      sortable.sort((a, b) => a.order - b.order);
      return {
        bodyClasses: document.body.className,
        repeaterCollapsed: repeater ? repeater.classList.contains("cre-t-164-collapsed") : null,
        allCards: sortable,
        visibleCards: sortable.filter((c) => c.visible),
        toggleText: document.querySelector(".cre-t-164-toggle-text")
          ? document.querySelector(".cre-t-164-toggle-text").textContent.trim()
          : null,
      };
    },
    { REPEATER, CARD }
  );
}

const rating = (c) => (c.total && c.classification ? `${c.total} ${c.classification}` : null);

async function clickTab(page, label) {
  const tab = page.locator(`${REPEATER} .oxy-tab, .oxy-tab`, { hasText: label }).first();
  await tab.click();
  await page.waitForTimeout(2000);
}

async function readDuplicateIds(page) {
  return page.evaluate(() => {
    const counts = {};
    document.querySelectorAll("[id]").forEach((el) => {
      if (el.id) counts[el.id] = (counts[el.id] || 0) + 1;
    });
    return Object.keys(counts).filter((id) => counts[id] > 1).sort();
  });
}

/** Ground truth: what the SITE ITSELF shows for a given filter, no variation injected. */
async function readNativeFiltered(browser, label) {
  const page = await browser.newPage();
  await gotoSite(page);
  if (label !== "All Pets") await clickTab(page, label);
  const state = await readListing(page);
  await page.close();
  return state.allCards.map((c) => ({ name: c.name, rating: rating(c) }));
}

// ─────────────────────────────────────────────────────────────────────────────
for (const arm of [
  { label: "V1 - Proposed Control (vB.js/vB.css)", css: CSS_V1, js: JS_V1, order: CONTROL_ORDER, ratings: CONTROL_RATINGS },
  { label: "V2 - Proposed Variation (va3.js/va3.css)", css: CSS_V2, js: JS_V2, order: VARIATION_ORDER, ratings: VARIATION_RATINGS },
]) {
  test.describe(arm.label, () => {
    // Deliberately NOT serial mode: a known-bug failure (e.g. TC-02) must not skip the rest of
    // the suite. Declaration order + shared `page` are still guaranteed by workers:1 /
    // fullyParallel:false in playwright.config.js.
    /** @type {import('@playwright/test').Page} */
    let page;
    let baselineDupes;
    const consoleErrors = [];

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
      await gotoSite(page);
      baselineDupes = await readDuplicateIds(page);
      await inject(page, arm.css, arm.js);
    });

    test.afterAll(async () => {
      if (page) await page.close();
    });

    test("TC-01 body carries the cre-t-164-default class (All Pets, no filter)", async () => {
      await expect(page.locator("body")).toHaveClass(/cre-t-164-default/);
    });

    test("TC-02 default load shows all 10 cards expanded (no Show More needed)", async () => {
      // Code comment states default should always land expanded; expandIfCollapsed() is
      // commented out in updateFilterState() in both vB.js and va3.js, so this is expected to
      // FAIL live - reconfirmed 2026-09-10 after a full rewrite of both files (BUG-01, still open).
      // expect.soft() so this confirmed bug doesn't abort the rest of the serial suite.
      const state = await readListing(page);
      expect.soft(state.visibleCards.length).toBe(10);
    });

    test("TC-03 Show More reveals the remaining cards in correct order", async () => {
      const toggle = page.locator(".cre-t-164-toggle");
      if (await toggle.count()) {
        const text = await page.locator(".cre-t-164-toggle-text").textContent();
        if (text && text.trim() === "Show More") {
          await toggle.click();
          await page.waitForTimeout(400);
        }
      }
      const state = await readListing(page);
      expect(state.visibleCards.length).toBe(10);
    });

    test("TC-04 All Pets order matches the ticket's proposed order", async () => {
      const state = await readListing(page);
      expect(state.visibleCards.map((c) => c.name)).toEqual(arm.order);
    });

    test("TC-05 All Pets ratings match the ticket's proposed ratings", async () => {
      const state = await readListing(page);
      const actual = {};
      state.visibleCards.forEach((c) => (actual[c.name] = rating(c)));
      expect(actual).toEqual(arm.ratings);
    });

    test("TC-06 rank bubbles renumber 1-10 matching the visible order", async () => {
      const state = await readListing(page);
      expect(state.visibleCards.map((c) => c.rank)).toEqual(state.visibleCards.map((_, i) => String(i + 1)));
    });

    test("TC-07 pinned Best Overall duplicate card exists and is not part of the sortable set", async () => {
      const hasBubble = await page.evaluate(
        (CARD) => Array.from(document.querySelectorAll(CARD)).some((el) => !!el.querySelector(".best-overall-bubble")),
        CARD
      );
      expect(hasBubble).toBe(true);
    });

    test("TC-08 no stray duplicate ids introduced by injection", async () => {
      expect(await readDuplicateIds(page)).toEqual(baselineDupes);
    });

    test.describe("Cats filter", () => {
      let nativeCats;
      test.beforeAll(async ({ browser }) => {
        nativeCats = await readNativeFiltered(browser, "Cats");
        await clickTab(page, "Cats");
      });

      test("TC-09 order matches the site's own native Cats order (sorting reverts)", async () => {
        const state = await readListing(page);
        expect(state.visibleCards.map((c) => c.name)).toEqual(nativeCats.map((c) => c.name));
      });

      test("TC-10 ratings still show the TEST values, not the native ones", async () => {
        // Ticket requirement: "the ratings will continue to be applied from the test" while a
        // filter is active. Confirmed 2026-09-10: rating ::after overrides are no longer gated
        // behind body.cre-t-164-default (only order/serial-number rules are) - so this passes.
        const state = await readListing(page);
        const actual = {};
        state.visibleCards.forEach((c) => (actual[c.name] = rating(c)));
        const expected = {};
        state.visibleCards.forEach((c) => {
          if (arm.ratings[c.name]) expected[c.name] = arm.ratings[c.name];
        });
        expect(actual).toEqual(expected);
      });

      test.afterAll(async () => {
        await clickTab(page, "All Pets");
      });
    });

    test("TC-11 switching back to All Pets restores the test order", async () => {
      const state = await readListing(page);
      expect(state.visibleCards.map((c) => c.name)).toEqual(arm.order);
    });

    test.describe("Dogs filter", () => {
      let nativeDogs;
      test.beforeAll(async ({ browser }) => {
        nativeDogs = await readNativeFiltered(browser, "Dogs");
        await clickTab(page, "Dogs");
      });

      test("TC-12 order matches the site's own native Dogs order (sorting reverts)", async () => {
        const state = await readListing(page);
        expect(state.visibleCards.map((c) => c.name)).toEqual(nativeDogs.map((c) => c.name));
      });

      test("TC-13 ratings still show the TEST values under Dogs filter", async () => {
        const state = await readListing(page);
        const actual = {};
        state.visibleCards.forEach((c) => (actual[c.name] = rating(c)));
        const expected = {};
        state.visibleCards.forEach((c) => {
          if (arm.ratings[c.name]) expected[c.name] = arm.ratings[c.name];
        });
        expect(actual).toEqual(expected);
      });

      test.afterAll(async () => {
        await clickTab(page, "All Pets");
      });
    });

    test("TC-14 switching back to All Pets after Dogs restores the test order again", async () => {
      const state = await readListing(page);
      expect(state.visibleCards.map((c) => c.name)).toEqual(arm.order);
    });

    test.describe("ZIP filter", () => {
      test.beforeAll(async () => {
        const input = page.locator('.zip-textinput input').first();
        await input.fill("90210");
        await input.dispatchEvent("change");
        await page.waitForTimeout(2000);
      });

      test("TC-15 body loses cre-t-164-default once a ZIP is entered", async () => {
        await expect(page.locator("body")).not.toHaveClass(/cre-t-164-default/);
      });

      test("TC-16 ratings still show the TEST values under a ZIP filter", async () => {
        const state = await readListing(page);
        const actual = {};
        state.visibleCards.forEach((c) => (actual[c.name] = rating(c)));
        const expected = {};
        state.visibleCards.forEach((c) => {
          if (arm.ratings[c.name]) expected[c.name] = arm.ratings[c.name];
        });
        expect(actual).toEqual(expected);
      });

      test.afterAll(async () => {
        const input = page.locator('.zip-textinput input').first();
        await input.fill("");
        await input.dispatchEvent("change");
        await page.waitForTimeout(2000);
      });
    });

    test("TC-17 clearing ZIP restores the test order", async () => {
      const state = await readListing(page);
      expect(state.visibleCards.map((c) => c.name)).toEqual(arm.order);
    });

    test("TC-18 overridden rating font-size matches an un-overridden sibling's (font: inherit holds)", async () => {
      const sizes = await page.evaluate(
        ({ CARD }) => {
          const cards = Array.from(document.querySelectorAll(CARD));
          const get = (name) => {
            const el = cards.find((c) => (c.getAttribute("data-unique") || "").includes(name));
            const t = el && el.querySelector(".cre-t-135-total");
            return t ? getComputedStyle(t).fontSize : null;
          };
          return { fetch: get("Fetch"), embrace: get("Embrace") };
        },
        { CARD }
      );
      expect(sizes.fetch).toBe(sizes.embrace);
    });

    test("TC-19 no injected-code console/page errors", async () => {
      expect(consoleErrors.filter((e) => /cre-t-164|TypeError|is not a function/i.test(e))).toEqual([]);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Native baseline (no variation injected)", () => {
  test("TC-20 bare page shows the currently-hardcoded order (ground truth)", async ({ page }) => {
    await gotoSite(page);
    const state = await readListing(page);
    expect(state.visibleCards.slice(0, 7).map((c) => c.name)).toEqual([
      "Lemonade",
      "ASPCA",
      "Fetch",
      "Embrace",
      "Pumpkin",
      "Figo",
      "Trupanion",
    ]);
  });
});
