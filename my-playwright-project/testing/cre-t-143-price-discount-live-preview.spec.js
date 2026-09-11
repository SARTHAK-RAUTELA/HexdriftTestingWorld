// @ts-check
/**
 * CRE-T-143 - Pet Insurance Gurus "Comparison Listing Price Discount" - LIVE PREVIEW RETEST
 *
 * Re-test triggered by testdetail.md finally being populated with the full requirement text
 * (previously empty - see cre-t-143-price-discount.spec.js for the original code-as-spec pass)
 * and real Convert force-preview URLs being supplied:
 *   control: ?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257165
 *   v1:      ?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257165  (SAME as control - see below)
 *   v2:      ?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257167
 *
 * KNOWN DISCREPANCY: control and v1 URLs supplied in testdetail.md are byte-identical (both
 * variation id 1000257165). The prior QA pass (2026-09-10) recorded V1's force variation id as
 * 1000257166, not 165. Both the as-given "165" URL and the previously-documented "166" URL are
 * tested here so the team can be told exactly what each one renders.
 *
 * Per user instruction this run checks the PREVIEW LINKS FIRST (this file), then the local CODE
 * (see cre-t-143-price-discount.spec.js, run after this file).
 */
const { test, expect } = require("@playwright/test");
const path = require("path");

const CONTROL_URL = "https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257165";
const V1_URL_165 = "https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257165";
const V1_URL_166_LEGACY = "https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257166";
const V2_URL = "https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257167";

const TABLE = '[data-unique="comparison-table"]';
const SHOT_DIR = path.join(
  __dirname, "..", "qa-knowledge-base", "pet-insurance-gurus", "cre-t-143-retest-screenshots"
);

async function gotoAndDismiss(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(TABLE, { timeout: 45000 });
  await page.waitForTimeout(2500);
  // CRE-T-133 ZIP modal can appear randomly on any PIG page and block pointer events (per
  // _client-notes.md). Force-remove it defensively if present.
  await page.evaluate(() => {
    const overlay = document.querySelector(".cre-t-133-overlay");
    if (overlay) overlay.remove();
  });
  // Cookie consent banner best-effort dismissal
  for (const sel of [".cmplz-accept", "#accept-cookies", 'button:has-text("Accept All")']) {
    const el = page.locator(sel).first();
    if (await el.count().catch(() => 0)) {
      await el.click({ timeout: 2000 }).catch(() => {});
      break;
    }
  }
}

function readPriceState(page) {
  return page.evaluate(({ TABLE }) => {
    const table = document.querySelector(TABLE);
    const boxes = Array.from(table.querySelectorAll(".plan-box"));
    const visible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden";
    };
    return boxes.map((box, i) => {
      const logo = box.querySelector(".provider-logo");
      const provider = logo ? (logo.getAttribute("alt") || "").replace(/\s*Logo\s*$/i, "").trim() : null;
      const priceCol = Array.from(box.querySelectorAll(".plan-detail-column")).find((c) => {
        const h = c.querySelector(".plan-detail-heading");
        return h && h.textContent.toLowerCase().includes("average plan cost");
      });
      if (!priceCol) return { index: i, provider, found: false };
      const content = priceCol.querySelector(".plan-detail-content");
      const original = content.querySelector(".ct-span:not(.cre-t-143-discounted-price)");
      const discounted = content.querySelector(".cre-t-143-discounted-price");
      return {
        index: i,
        provider,
        found: true,
        originalText: original ? original.textContent.trim() : null,
        originalVisible: visible(original),
        discountedText: discounted ? discounted.textContent.trim() : null,
        discountedVisible: visible(discounted),
        discountedSpanCount: content.querySelectorAll(".cre-t-143-discounted-price").length,
      };
    });
  }, { TABLE });
}

function parsePrice(text) {
  if (!text) return null;
  const m = text.trim().match(/^\$(\d+(?:\.\d+)?)\/mo$/);
  return m ? parseFloat(m[1]) : null;
}

async function clickTab(page, label) {
  const tab = page.locator(".oxy-tab", { hasText: label }).first();
  if (await tab.count()) {
    await tab.click();
    await page.waitForTimeout(2000);
  }
}

const ARMS = [
  { key: "control", url: CONTROL_URL, discountPercent: null },
  { key: "v1-asgiven-165", url: V1_URL_165, discountPercent: 0.135 },
  { key: "v2-167", url: V2_URL, discountPercent: 0.329 },
  { key: "v1-legacy-166", url: V1_URL_166_LEGACY, discountPercent: 0.135 },
];

for (const arm of ARMS) {
  test.describe(`LIVE PREVIEW: ${arm.key}`, () => {
    /** @type {import('@playwright/test').Page} */
    let page;
    const consoleErrors = [];

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
      await gotoAndDismiss(page, arm.url);
    });

    test.afterAll(async () => {
      if (page) await page.close();
    });

    test(`TC-P01 [${arm.key}] default view price state + screenshot`, async ({}, testInfo) => {
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      expect(priced.length, "at least one priced card").toBeGreaterThan(0);

      test.info().annotations.push({ type: "priceState", description: JSON.stringify(state) });

      if (arm.discountPercent === null) {
        priced.forEach((c) => {
          expect.soft(c.discountedText, `${arm.key} provider ${c.provider} should have NO discount`).toBeNull();
        });
      } else {
        priced.forEach((c) => {
          if (c.discountedText === null) return; // recorded as a soft failure below via count check
          const base = parsePrice(c.originalText);
          const expectedVal = "$" + (base * (1 - arm.discountPercent)).toFixed(2) + "/mo";
          expect.soft(c.discountedText, `${arm.key} provider ${c.provider} discount math`).toBe(expectedVal);
        });
        const withDiscount = priced.filter((c) => c.discountedText !== null).length;
        expect.soft(withDiscount, `${arm.key} at least some cards show a discount`).toBeGreaterThan(0);
      }

      try {
        await require("fs").promises.mkdir(SHOT_DIR, { recursive: true });
        const safeBrowser = testInfo.project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
        await page.screenshot({
          path: path.join(SHOT_DIR, `${arm.key}-default-${safeBrowser}.png`),
          fullPage: false,
        });
      } catch (e) {}
    });

    test(`TC-P02 [${arm.key}] all 11 boxes (incl. listings 8-10) carry consistent price state`, async ({}, testInfo) => {
      test.skip(!["Chrome Desktop", "Firefox Desktop", "Edge Desktop", "Safari Desktop"].includes(testInfo.project.name), "desktop-only, full 11-card check");
      const state = await readPriceState(page);
      expect(state.length, "expect all cards including Show-More ones (default lands expanded)").toBeGreaterThanOrEqual(10);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      const lastThree = priced.slice(-3);
      lastThree.forEach((c) => {
        if (arm.discountPercent === null) {
          expect.soft(c.discountedText, `${arm.key} tail-card ${c.provider} (idx ${c.index}) should have no discount`).toBeNull();
        } else {
          expect.soft(c.discountedText, `${arm.key} tail-card ${c.provider} (idx ${c.index}) should have a discount`).not.toBeNull();
        }
      });
    });

    test(`TC-P03 [${arm.key}] Dogs tab keeps consistent price state`, async ({}, testInfo) => {
      test.skip(!["Chrome Desktop", "Firefox Desktop", "Edge Desktop", "Safari Desktop"].includes(testInfo.project.name), "desktop-only");
      await clickTab(page, "Dogs");
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      expect(priced.length).toBeGreaterThan(0);
      priced.forEach((c) => {
        if (arm.discountPercent === null) {
          expect.soft(c.discountedText, `${arm.key} Dogs tab ${c.provider}`).toBeNull();
        } else {
          expect.soft(c.discountedText, `${arm.key} Dogs tab ${c.provider}`).not.toBeNull();
        }
      });
      await clickTab(page, "All Pets");
    });

    test(`TC-P04 [${arm.key}] Cats tab keeps consistent price state`, async ({}, testInfo) => {
      test.skip(!["Chrome Desktop", "Firefox Desktop", "Edge Desktop", "Safari Desktop"].includes(testInfo.project.name), "desktop-only");
      await clickTab(page, "Cats");
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      expect(priced.length).toBeGreaterThan(0);
      priced.forEach((c) => {
        if (arm.discountPercent === null) {
          expect.soft(c.discountedText, `${arm.key} Cats tab ${c.provider}`).toBeNull();
        } else {
          expect.soft(c.discountedText, `${arm.key} Cats tab ${c.provider}`).not.toBeNull();
        }
      });
      await clickTab(page, "All Pets");
    });

    test(`TC-P05 [${arm.key}] ZIP filter keeps consistent price state`, async ({}, testInfo) => {
      test.skip(!["Chrome Desktop", "Firefox Desktop", "Edge Desktop", "Safari Desktop"].includes(testInfo.project.name), "desktop-only");
      const input = page.locator(".zip-textinput input").first();
      if (await input.count()) {
        await input.fill("90210");
        await input.dispatchEvent("change");
        await page.waitForTimeout(2500);
      }
      const state = await readPriceState(page);
      const priced = state.filter((c) => c.found && c.originalText !== null);
      priced.forEach((c) => {
        if (arm.discountPercent === null) {
          expect.soft(c.discountedText, `${arm.key} ZIP ${c.provider}`).toBeNull();
        } else {
          expect.soft(c.discountedText, `${arm.key} ZIP ${c.provider}`).not.toBeNull();
        }
      });
      if (await input.count()) {
        await input.fill("");
        await input.dispatchEvent("change");
        await page.waitForTimeout(1500);
      }
    });

    test(`TC-P06 [${arm.key}] no page/console errors`, async () => {
      expect(consoleErrors.filter((e) => /cre-t-143|TypeError|is not a function/i.test(e))).toEqual([]);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Real breed-widget round trip: select a breed (discount should vanish), then revert to
// "All Breeds" (discount should REAPPLY - confirmed requirement in testdetail.md: "if a user
// selects a specific breed and then changes the selection back to the All Breeds option...
// Yes" apply discount again). Restricted to Chrome Desktop only to bound runtime - this is a
// one-time end-to-end validation of the real user flow, not a per-browser regression check
// (the JS logic itself is browser-agnostic URL/DOM code, already covered per-browser elsewhere).
test.describe("Real breed-widget round trip (Chrome Desktop only)", () => {
  for (const arm of [
    { key: "v1-165", url: V1_URL_165, discountPercent: 0.135 },
    { key: "v2-167", url: V2_URL, discountPercent: 0.329 },
  ]) {
    test(`TC-P07 [${arm.key}] select breed hides discount, revert to All Breeds reapplies it`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== "Chrome Desktop", "single end-to-end widget check, Chrome only");
      const context = await browser.newContext();
      const page = await context.newPage();
      await gotoAndDismiss(page, arm.url);

      // Breed select is disabled until a ZIP is entered (confirmed live via DOM inspection)
      const zipInput = page.locator(".zip-textinput input").first();
      await zipInput.fill("90210");
      await zipInput.dispatchEvent("change");
      await page.waitForTimeout(2500);

      const before = await readPriceState(page);
      const beforeDiscounted = before.filter((c) => c.found && c.discountedText !== null).length;
      expect.soft(beforeDiscounted, `${arm.key} discount present before breed selection`).toBeGreaterThan(0);

      const breedCombo = page.locator("#breed-select");
      await expect(breedCombo).toBeEnabled({ timeout: 15000 });
      await breedCombo.click();
      const listbox = page.locator('ul[role="listbox"] li[role="option"]');
      await listbox.first().waitFor({ state: "visible", timeout: 10000 });
      const optionCount = await listbox.count();
      const specificOption = listbox.filter({ hasNotText: "All Breeds" }).first();
      await (optionCount > 1 ? specificOption : listbox.first()).click();
      await page.waitForTimeout(2500);

      try {
        await require("fs").promises.mkdir(SHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(SHOT_DIR, `${arm.key}-breed-selected.png`) });
      } catch (e) {}

      const afterBreed = await readPriceState(page);
      const afterBreedDiscounted = afterBreed.filter((c) => c.found && c.discountedText !== null).length;
      expect.soft(afterBreedDiscounted, `${arm.key} discount should be gone once a breed is selected`).toBe(0);

      // Revert to All Breeds
      await breedCombo.click();
      const allBreedsOption = page.locator('ul[role="listbox"] li[role="option"]', { hasText: "All Breeds" }).first();
      await allBreedsOption.waitFor({ state: "visible", timeout: 10000 });
      await allBreedsOption.click();
      await page.waitForTimeout(2500);

      try {
        await require("fs").promises.mkdir(SHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(SHOT_DIR, `${arm.key}-breed-reverted.png`) });
      } catch (e) {}

      const afterRevert = await readPriceState(page);
      const afterRevertDiscounted = afterRevert.filter((c) => c.found && c.discountedText !== null).length;
      expect.soft(afterRevertDiscounted, `${arm.key} discount should REAPPLY after reverting to All Breeds`).toBeGreaterThan(0);

      await context.close();
    });
  }
});
