// @ts-check
/**
 * CRE-T-143 - Pet Insurance Gurus "Comparison Listing Price Discount"
 *
 * testdetail.md was empty when this suite was first written - see
 * qa-knowledge-base/pet-insurance-gurus/cre-t-143-price-discount.md for the code-as-spec history
 * and the 2026-09-11 retest section (testdetail.md is now populated with the real requirement
 * text + Convert force-preview URLs; see cre-t-143-price-discount-live-preview.spec.js for the
 * preview-link pass that now precedes this code pass, per updated client instruction).
 *
 * Two arms, same naming convention as CRE-T-164/SWF157 for this client: V1 = vB.js/vB.css (13.5%
 * off), V2 = v2.js/v2.css (32.9% off) - CURRENT file mapping as of 2026-09-11 (the arm's own
 * `va3.js`/`va3.css` files were retired; `va3.css` is actually stale cre-t-164 CSS, not a valid
 * substitute, and `v2.css` is ALSO stale/unrelated content - see BUG-04 in the QA doc). Both JS
 * files patch window.fetch to read per-provider prices from insurance-finder/v1/quotes and
 * .../v1/options, insert a `.cre-t-143-discounted-price` span after each real `.ct-span` price,
 * and hide the original via CSS (vB.css does this correctly; v2.css does not - see BUG-04).
 *
 * Neither arm has ever had a documented Convert force-preview URL for use with this style of
 * local-injection-only suite (a real force-preview URL now exists for the live preview check, but
 * this file's purpose is specifically to validate the LOCAL BUILD FILES in isolation), so this
 * suite continues to use LOCAL INJECTION of the real vB.js/vB.css and v2.js/v2.css files against
 * the real live site, mirroring the established pattern for this client
 * (swf151-new-build.spec.js, swf164-rearrange-listings.spec.js).
 *
 * Each arm runs serially against ONE page - this site's CDN rate-limits repeated automated
 * navigation (see qa-knowledge-base/pet-insurance-gurus/_client-notes.md).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SITE = "https://petinsurancegurus.com/";
const BUILD_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const CSS_V1 = fs.readFileSync(path.join(BUILD_DIR, "vB.css"), "utf8");
const JS_V1 = fs.readFileSync(path.join(BUILD_DIR, "vB.js"), "utf8");
const CSS_V2 = fs.readFileSync(path.join(BUILD_DIR, "v2.css"), "utf8");
const JS_V2 = fs.readFileSync(path.join(BUILD_DIR, "v2.js"), "utf8");

const TABLE = '[data-unique="comparison-table"]';
const CARD = TABLE + ' [data-unique$="-Listing-Only"]';

/** Loads the real site fresh and waits for the real listings + async prices to settle. */
async function gotoSite(page) {
  await page.goto(SITE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(CARD, { timeout: 45000 });
  await page.waitForTimeout(2500);
}

/** Injects the given build (css+js) into an already-loaded page. */
async function inject(page, css, js) {
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: js });
  await page.waitForTimeout(1200); // waitForElement poll + fetch-patch + first sync tick
}

/**
 * Reads every real, currently-priced provider card: the provider name (from the logo alt text,
 * the same signal the variation code uses), the original `.ct-span` price, whether the variation
 * marked it hidden, and the injected discounted span (if any) plus its computed visibility.
 */
function readPriceState(page) {
  return page.evaluate(({ TABLE }) => {
    const table = document.querySelector(TABLE);
    const boxes = Array.from(table.querySelectorAll(".plan-box"));
    const visible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden";
    };
    return boxes.map((box) => {
      const logo = box.querySelector(".provider-logo");
      const provider = logo ? (logo.getAttribute("alt") || "").replace(/\s*Logo\s*$/i, "").trim() : null;
      const priceCol = Array.from(box.querySelectorAll(".plan-detail-column")).find((c) => {
        const h = c.querySelector(".plan-detail-heading");
        return h && h.textContent.toLowerCase().includes("average plan cost");
      });
      if (!priceCol) return { provider, found: false };
      const content = priceCol.querySelector(".plan-detail-content");
      const original = content.querySelector(".ct-span:not(.cre-t-143-discounted-price)");
      const discounted = content.querySelector(".cre-t-143-discounted-price");
      const otherTestOverride = content.querySelector('[class*="price-update"]');
      return {
        provider,
        found: true,
        originalText: original ? original.textContent.trim() : null,
        originalHiddenClass: original ? original.classList.contains("cre-t-143-price-original-hidden") : null,
        originalVisible: visible(original),
        discountedText: discounted ? discounted.textContent.trim() : null,
        discountedVisible: visible(discounted),
        discountedSpanCount: content.querySelectorAll(".cre-t-143-discounted-price").length,
        otherTestOverrideText: otherTestOverride ? otherTestOverride.textContent.trim() : null,
        otherTestOverrideVisible: visible(otherTestOverride),
      };
    });
  }, { TABLE });
}

function parsePrice(text) {
  if (!text) return null;
  const m = text.trim().match(/^\$(\d+(?:\.\d+)?)\/mo$/);
  return m ? parseFloat(m[1]) : null;
}

function expectedDiscountedText(originalPriceText, discountPercent) {
  const value = parsePrice(originalPriceText);
  if (value === null) return null;
  return "$" + (value * (1 - discountPercent)).toFixed(2) + "/mo";
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

// ─────────────────────────────────────────────────────────────────────────────
for (const arm of [
  { label: "V1 (vB.js/vB.css, 13.5% off)", css: CSS_V1, js: JS_V1, discountPercent: 0.135 },
  { label: "V2 (v2.js/v2.css, 32.9% off)", css: CSS_V2, js: JS_V2, discountPercent: 0.329 },
]) {
  test.describe(arm.label, () => {
    /** @type {import('@playwright/test').Page} */
    let page;
    let baselineDupes;
    let quotePrices;
    let stopListening;
    const consoleErrors = [];

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
      quotePrices = {};
      const listener = async (res) => {
        if (!/insurance-finder\/v1\/(quotes|options)/.test(res.url())) return;
        try {
          const body = await res.json();
          const list = body.quotes || (body.options && body.options.initialQuotes) || [];
          list.forEach((q) => {
            if (q.providerName && typeof q.standardPlanCost === "string") quotePrices[q.providerName] = q.standardPlanCost;
          });
        } catch (e) {}
      };
      page.on("response", listener);
      stopListening = () => page.off("response", listener);

      await gotoSite(page);
      baselineDupes = await readDuplicateIds(page);
      await inject(page, arm.css, arm.js);
    });

    test.afterAll(async () => {
      if (stopListening) stopListening();
      if (page) await page.close();
    });

    test("TC-01 discounted span is inserted for every priced provider card", async () => {
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      expect(priced.length).toBeGreaterThan(0);
      priced.forEach((c) => {
        expect(c.discountedText, `provider ${c.provider}`).not.toBeNull();
        expect(c.discountedSpanCount, `provider ${c.provider} span count`).toBe(1);
      });
    });

    test("TC-02 discount math matches discountPercent against the site's own live quote price", async () => {
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      let checked = 0;
      priced.forEach((c) => {
        const apiPrice = c.provider && quotePrices[c.provider];
        const base = apiPrice || c.originalText; // fall back to the DOM's own original text
        const expected = expectedDiscountedText(base, arm.discountPercent);
        if (expected) {
          expect(c.discountedText, `provider ${c.provider}`).toBe(expected);
          checked++;
        }
      });
      expect(checked).toBeGreaterThan(0);
    });

    test("TC-03 original price gets the price-original-hidden class", async () => {
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      priced.forEach((c) => {
        expect(c.originalHiddenClass, `provider ${c.provider}`).toBe(true);
      });
    });

    test("TC-04 BUG CANDIDATE: discounted price should be visible to the user", async () => {
      // cre-t-116 runs live at 100% traffic on this site and hides every <span> in the price
      // column except its own `.cre-t-116-price-update`
      // (".cre-t-116-toolTipContentChange .tooltip-container + .plan-detail-content > span:not(.cre-t-116-price-update) { display: none !important; }").
      // cre-t-143's injected `.cre-t-143-discounted-price` span matches that `span:not(...)`
      // selector too, so it is hidden by the same rule the instant it's inserted. Soft assertion
      // so this confirmed, environment-caused failure doesn't hide the rest of the suite - see
      // BUG-01 in the QA doc.
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.discountedText !== null);
      priced.forEach((c) => {
        expect.soft(c.discountedVisible, `provider ${c.provider} discounted price visible`).toBe(true);
      });
    });

    test("TC-05 the visible price on screen is NOT the cre-t-143 discounted price (documents the conflict)", async () => {
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.otherTestOverrideText);
      expect(priced.length).toBeGreaterThan(0);
      priced.forEach((c) => {
        expect(c.otherTestOverrideVisible, `provider ${c.provider} cre-t-116 price visible instead`).toBe(true);
        expect(c.otherTestOverrideText).not.toBe(c.discountedText);
      });
    });

    test("TC-06 breed selected in the URL suppresses the discount entirely", async ({ browser }) => {
      const breedContext = await browser.newContext();
      const breedPage = await breedContext.newPage();
      breedPage.on("pageerror", (e) => consoleErrors.push("pageerror(breed): " + e.message));
      await breedPage.goto(SITE + "?breed=Beagle", { waitUntil: "domcontentloaded" });
      await breedPage.waitForSelector(CARD, { timeout: 45000 });
      await breedPage.waitForTimeout(2500);
      await inject(breedPage, arm.css, arm.js);
      const state = await readPriceState(breedPage);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      expect(priced.length).toBeGreaterThan(0);
      priced.forEach((c) => {
        expect(c.discountedText, `provider ${c.provider} should have no discount span under ?breed=`).toBeNull();
        expect(c.originalHiddenClass, `provider ${c.provider} original should stay visible under ?breed=`).toBe(false);
      });
      await breedContext.close();
    });

    test("TC-07 re-running the variation script does not duplicate the discounted span (idempotent)", async () => {
      await page.evaluate((js) => {
        // eslint-disable-next-line no-eval
        (0, eval)(js);
      }, arm.js);
      await page.waitForTimeout(500);
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.discountedText !== null);
      priced.forEach((c) => {
        expect(c.discountedSpanCount, `provider ${c.provider} after re-inject`).toBe(1);
      });
    });

    test("TC-08 no stray duplicate ids introduced by injection", async () => {
      expect(await readDuplicateIds(page)).toEqual(baselineDupes);
    });

    test("TC-09 no injected-code console/page errors", async () => {
      expect(consoleErrors.filter((e) => /cre-t-143|TypeError|is not a function/i.test(e))).toEqual([]);
    });

    test("TC-10 switching pet-type tab (DOM mutation) keeps exactly one discounted span per card", async () => {
      const tab = page.locator("#comparison-section .oxy-tab, .oxy-tab", { hasText: "Dogs" }).first();
      if (await tab.count()) {
        await tab.click();
        await page.waitForTimeout(2000);
        const stateDogs = await readPriceState(page);
        stateDogs.filter((c) => c.found && c.discountedText !== null).forEach((c) => {
          expect(c.discountedSpanCount, `provider ${c.provider} under Dogs filter`).toBe(1);
        });
        const allTab = page.locator("#comparison-section .oxy-tab, .oxy-tab", { hasText: "All Pets" }).first();
        if (await allTab.count()) {
          await allTab.click();
          await page.waitForTimeout(2000);
        }
      }
    });

    test("TC-12 the tail cards (listings 8-10, revealed via Show More on organic loads) carry the same discount", async () => {
      // Default currently lands already-expanded (SWF164's BUG-01: expandIfCollapsed() is
      // commented out) so no click is needed for these cards to be present, but this still
      // confirms the discount logic covers them per the ticket's explicit "also applies to
      // listings 8, 9 and 10 hidden within the Show More accordion" requirement.
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      expect(priced.length).toBeGreaterThanOrEqual(8);
      const tail = priced.slice(-3);
      tail.forEach((c) => {
        expect(c.discountedText, `tail card provider ${c.provider}`).not.toBeNull();
      });
    });

    test("TC-13 ZIP filter (in-place re-render) keeps the discount applied", async () => {
      const input = page.locator(".zip-textinput input").first();
      if (await input.count()) {
        await input.fill("90210");
        await input.dispatchEvent("change");
        await page.waitForTimeout(2500);
        const state = await readPriceState(page);
        const priced = state.filter((c) => c.found && c.originalText !== null);
        expect(priced.length).toBeGreaterThan(0);
        priced.forEach((c) => {
          expect(c.discountedText, `provider ${c.provider} under ZIP filter`).not.toBeNull();
        });
        await input.fill("");
        await input.dispatchEvent("change");
        await page.waitForTimeout(1500);
      }
    });

    test("TC-14 selecting a breed then reverting to All Breeds re-applies the discount (URL-param round trip)", async ({ browser }) => {
      // Confirmed requirement (testdetail.md Q&A, 2026-09-11): "if a user selects a specific
      // breed and then changes the selection back to the All Breeds option, should we apply the
      // discounted prices again? Yes." This checks the code's own signal
      // (isBreedSelectedInUrl()/isBreedSelectedInResponseData()) via URL-param transitions on a
      // fresh context; the real MUI breed-picker widget round trip is covered end-to-end in
      // cre-t-143-price-discount-live-preview.spec.js against the real force-preview URLs.
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      await p.goto(SITE + "?breed=Beagle", { waitUntil: "domcontentloaded" });
      await p.waitForSelector(CARD, { timeout: 45000 });
      await p.waitForTimeout(2500);
      await inject(p, arm.css, arm.js);
      const withBreed = await readPriceState(p);
      withBreed.filter((c) => c.found && c.originalText !== null).forEach((c) => {
        expect(c.discountedText, `provider ${c.provider} with breed selected`).toBeNull();
      });

      await p.goto(SITE, { waitUntil: "domcontentloaded" });
      await p.waitForSelector(CARD, { timeout: 45000 });
      await p.waitForTimeout(2500);
      await inject(p, arm.css, arm.js);
      const reverted = await readPriceState(p);
      const revertedPriced = reverted.filter((c) => c.found && c.originalText !== null);
      expect(revertedPriced.length).toBeGreaterThan(0);
      revertedPriced.forEach((c) => {
        expect(c.discountedText, `provider ${c.provider} after reverting to All Breeds`).not.toBeNull();
      });
      await ctx.close();
    });

    test("TC-15 BUG CANDIDATE: with the current v2.css file paired to v2.js, is the original price actually hidden?", async () => {
      // v2.css (the file currently mapped to the V2 arm) is stale/unrelated content (leftover
      // pay.com.au cre-t-13 modal CSS) - it contains no rule for `.cre-t-143-price-original-hidden`.
      // vB.css (V1) DOES contain the correct hide rule. This test documents whether that gap is
      // actually visible on screen for V2 when only the current local file pairing is injected.
      test.skip(arm.label.indexOf("V1") === 0, "only relevant to the V2 arm's current css file");
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.discountedText !== null);
      expect(priced.length).toBeGreaterThan(0);
      const stillShowingOriginal = priced.filter((c) => c.originalVisible);
      // Soft assertion: this documents a LOCAL BUILD FILE gap (v2.css mismatch), not necessarily
      // a live production bug - cross-reference against the real V2 force-preview URL result in
      // cre-t-143-price-discount-live-preview.spec.js before treating this as user-facing.
      expect.soft(stillShowingOriginal.length, "cards where original price is STILL visible next to the discount, because v2.css never hides it").toBe(0);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Cross-arm isolation", () => {
  test("TC-11 BUG CANDIDATE: injecting V2 after V1 in the same page context is a no-op (shared global guards)", async ({ browser }) => {
    // Both vB.js and va3.js guard their own init behind the SAME global flag names
    // (window.cre_t_143_fetchPatched / window.cre_t_143_priceObserverStarted). In production only
    // one arm is ever served per visitor, so this is not user-facing, but it means the two files
    // cannot be safely combined/tested together in one page context, and any future code path
    // that loads both (e.g. a QA/preview tool, or a Convert misconfiguration serving both) would
    // silently leave the second script's fetch-patch and DOM observer never installed.
    const page = await browser.newPage();
    await gotoSite(page);
    await inject(page, CSS_V1, JS_V1);
    const afterV1 = await readPriceState(page);
    await inject(page, CSS_V2, JS_V2);
    const afterV2 = await readPriceState(page);

    const v1Discounted = afterV1.find((c) => c.discountedText);
    const v2Discounted = afterV2.find((c) => c.provider === (v1Discounted && v1Discounted.provider));
    expect(v1Discounted).toBeTruthy();
    // Documents the guard collision: V2's 32.9% never overwrites V1's 13.5% once V1 has already
    // patched fetch and started its observer.
    expect.soft(v2Discounted && v2Discounted.discountedText).not.toBe(v1Discounted.discountedText);
    await page.close();
  });
});
