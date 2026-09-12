// @ts-check
/**
 * CRE-T-162 - Pet Insurance Gurus "Testimonial Quote Section"
 *
 * testdetail.md on file still describes SWF143/CRE-T-143 (sitewide price discount) - that ticket
 * was already fully QA'd, see qa-knowledge-base/pet-insurance-gurus/cre-t-143-price-discount.md.
 * `vB.js`/`vB.css` in local_testing/Local2/variation were rewritten 2026-09-11 (15:23-15:24) with
 * unrelated content: `variation_name = "cre-t-162"`, a static testimonial-quote card injected
 * `beforebegin` #comparison-section, plus CSS hiding `#section-11-584` ("Personalize prices"
 * copy). Per client instruction this is a followup test with no Figma/ticket provided yet, so -
 * same as the original CRE-T-143 pass - this suite treats the code itself as the spec (see
 * qa-knowledge-base/_shared/qa-workflow.md's no-ticket fallback).
 *
 * The card (single static quote, Dr. Diane Deresienski via The New York Times, no carousel, no
 * photo) closely mirrors SWF157 V1 on this same client
 * (qa-knowledge-base/pet-insurance-gurus/swf157-quote-carousel.md - also injected `beforebegin`
 * #comparison-section and hid the "Personalize prices" copy). The quote AUTHOR LINE differs from
 * SWF157's client-confirmed wording though: this build says
 * "Dr. Diane Deresienski • Veterinarian, Bowman Animal Hospital" where SWF157 confirmed
 * "Dr. Diane Deresienski, Managing Veterinarian" (source still The New York Times in both). Flagged
 * as a question for the client, not asserted as a bug, since no Figma exists for cre-t-162 itself.
 *
 * IMPORTANT gap vs. every other recent variation on this client: cre-t-162's init() has NO
 * MutationObserver - it runs `waitForElement('#comparison-section', init)` once and never
 * re-applies. _client-notes.md documents that breed/ZIP filter changes on this site are in-place
 * React re-renders that destroy injected nodes ("use a MutationObserver to re-apply"). This suite
 * checks whether the quote section (inserted as a PREVIOUS SIBLING of #comparison-section, not a
 * child of it) survives those re-renders in practice.
 *
 * Local injection of the real vB.js/vB.css against the real live site - same established pattern
 * for this client (swf151-new-build.spec.js, swf164-rearrange-listings.spec.js,
 * cre-t-143-price-discount.spec.js).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SITE = "https://petinsurancegurus.com/";
const BUILD_DIR = path.join(__dirname, "..", "..", "local_testing", "Local2", "variation");
const CSS = fs.readFileSync(path.join(BUILD_DIR, "vB.css"), "utf8");
const JS = fs.readFileSync(path.join(BUILD_DIR, "vB.js"), "utf8");

const CARD = '[data-unique="comparison-table"] [data-unique$="-Listing-Only"]';
const SECTION = "#cre-t-162-section";

const EXPECTED = {
  text: "“Several times the insurance has made the difference between treatment and euthanasia.”",
  author: "Dr. Diane Deresienski • Veterinarian, Bowman Animal Hospital",
  source: "Source: The New York Times",
};

/** Loads the real site fresh and waits for the real listings to render. */
async function gotoSite(page, extraPath = "") {
  await page.goto(SITE + extraPath, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(CARD, { timeout: 45000 });
  await page.waitForTimeout(1500);
}

/**
 * Injects the real build (css+js) into an already-loaded page and waits for the section itself to
 * attach - never a fixed sleep, per this client's documented WebKit-is-slowest quirk
 * (qa-knowledge-base/pet-insurance-gurus/_client-notes.md).
 */
async function inject(page) {
  await page.addStyleTag({ content: CSS });
  await page.addScriptTag({ content: JS });
  await page.waitForSelector(SECTION, { state: "attached", timeout: 20000 });
}

function readSection(page) {
  return page.evaluate(() => {
    const section = document.querySelector("#cre-t-162-section");
    const comparisonSection = document.querySelector("#comparison-section");
    const personalize = document.querySelector("#section-11-584");
    if (!section) {
      return {
        present: false,
        personalizeHidden: personalize ? getComputedStyle(personalize).display === "none" : null,
      };
    }
    const text = section.querySelector(".cre-t-162-quote-text");
    const author = section.querySelector(".cre-t-162-quote-author");
    const source = section.querySelector(".cre-t-162-quote-source");
    const box = section.querySelector(".cre-t-162-quote-box");
    return {
      present: true,
      boxPresent: !!box,
      text: text ? text.textContent.trim() : null,
      author: author ? author.textContent.trim() : null,
      source: source ? source.textContent.trim() : null,
      immediatelyBeforeComparison: !!comparisonSection && section.nextElementSibling === comparisonSection,
      backgroundColor: getComputedStyle(section).backgroundColor,
      personalizeHidden: personalize ? getComputedStyle(personalize).display === "none" : null,
    };
  });
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
// Sitewide: testdetail.md's own URL-targeting list (reused - same client/site, generic to this
// comparison-table template family) is /, /home/, /comparison/, /compare/.
for (const { label, path: urlPath } of [
  { label: "Home (/)", path: "" },
  { label: "/home/", path: "home/" },
  { label: "/comparison/", path: "comparison/" },
  { label: "/compare/", path: "compare/" },
]) {
  test.describe(`Sitewide - ${label}`, () => {
    /** @type {import('@playwright/test').Page} */
    let page;
    let baselineDupes;
    const consoleErrors = [];

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
      await gotoSite(page, urlPath);
      baselineDupes = await readDuplicateIds(page);
      await inject(page);
    });

    test.afterAll(async () => {
      if (page) await page.close();
    });

    test("TC-01 quote section is injected immediately before #comparison-section", async () => {
      const state = await readSection(page);
      expect(state.present).toBe(true);
      expect(state.boxPresent).toBe(true);
      expect(state.immediatelyBeforeComparison).toBe(true);
    });

    test("TC-02 quote text/author/source match the code's own config", async () => {
      const state = await readSection(page);
      expect(state.text).toBe(EXPECTED.text);
      expect(state.author).toBe(EXPECTED.author);
      expect(state.source).toBe(EXPECTED.source);
    });

    test("TC-03 'Personalize prices' element (#section-11-584) is hidden", async () => {
      const state = await readSection(page);
      expect(state.personalizeHidden).toBe(true);
    });

    test("TC-04 quote box background is the expected light-grey section background", async () => {
      const state = await readSection(page);
      expect(state.backgroundColor).toBe("rgb(245, 245, 249)"); // #f5f5f9
    });

    test("TC-05 idempotent - re-running the script does not duplicate the section", async () => {
      await page.evaluate(JS);
      await page.waitForTimeout(500);
      expect(await page.locator(SECTION).count()).toBe(1);
    });

    test("TC-06 no stray duplicate ids introduced by injection", async () => {
      expect(await readDuplicateIds(page)).toEqual(baselineDupes);
    });

    test("TC-07 no injected-code console/page errors", async () => {
      expect(consoleErrors.filter((e) => /cre-t-162|TypeError|is not a function/i.test(e))).toEqual([]);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Interaction / persistence (no MutationObserver in this build)", () => {
  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await gotoSite(page);
    await inject(page);
  });

  test.afterAll(async () => {
    if (page) await page.close();
  });

  test("TC-08 quote persists after switching to the Cats tab (pushState nav)", async () => {
    await page.locator(".oxy-tab", { hasText: "Cats" }).first().click();
    await page.waitForTimeout(2000);
    expect((await readSection(page)).present).toBe(true);
  });

  test("TC-09 quote persists after returning to All Pets", async () => {
    await page.locator(".oxy-tab", { hasText: "All Pets" }).first().click();
    await page.waitForTimeout(2000);
    expect((await readSection(page)).present).toBe(true);
  });

  test("TC-10 quote persists after entering a ZIP code (in-place React re-render)", async () => {
    const input = page.locator(".zip-textinput input").first();
    await input.fill("90210");
    await input.dispatchEvent("change");
    await page.waitForTimeout(2500);
    expect((await readSection(page)).present).toBe(true);
  });

  test("TC-11 quote box still shows the correct copy after the ZIP re-render (not just present)", async () => {
    const state = await readSection(page);
    expect(state.text).toBe(EXPECTED.text);
  });
});

test.describe("Breed already selected at load time (?breed= URL param)", () => {
  test("TC-12 quote still injects on a page that loads with a breed pre-selected", async ({ page }) => {
    await page.goto(SITE + "?breed=Beagle", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(CARD, { timeout: 45000 });
    await page.waitForTimeout(1500);
    await inject(page);
    expect((await readSection(page)).present).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Responsive layout (mobile <=768px)", () => {
  test("TC-13 quote source becomes static/centered below 768px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSite(page);
    await inject(page);
    const style = await page.evaluate(() => {
      const source = document.querySelector(".cre-t-162-quote-source");
      const cs = source ? getComputedStyle(source) : null;
      return cs ? { position: cs.position, textAlign: cs.textAlign } : null;
    });
    expect(style && style.position).toBe("static");
    expect(style && style.textAlign).toBe("center");
  });
});
