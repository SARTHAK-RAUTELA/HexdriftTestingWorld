// @ts-check
/**
 * WIN266 - WinkBeds "Shop Page - Select Sub-Total V2"
 *
 * Control is the winning variation from WIN253 (cre-t-253 sub-total line, now shipped/permanent
 * as `.cro-subtotal-line`, "Your sub-total is $X"). This ticket (cre-t-266, code currently in
 * vB.js/vB.css = V1, v2.js/v2.css = V2) replaces it with a new `.cre-t-266-subtotal-line` and
 * hides `.cro-subtotal-line` via CSS. Per Figma (Group 1.png):
 *   - V1: "You're adding $X to your cart · Saving $Y"
 *   - V2: "N item(s) selected · $X total · Saving $Y" (plus, confirmed live but NOT shown in
 *     Figma: V2 also syncs the Add-to-Cart button label to "ADD N ITEMS TO CART" when N>1 -
 *     flagged as an open question for the client, see the .md report)
 *
 * v2.css on file is STALE/unrelated (leftover pay-com-au cre-t-13 modal CSS - same
 * shared-scratch-file quirk documented for other tickets, e.g. SWF155/PAY19). The actual styling
 * for both V1 and V2's `.cre-t-266-subtotal-line` comes from vB.css (shared class name/body class
 * `cre-t-266` used by both variation scripts), confirmed against live computed styles below.
 *
 * Preview URLs supplied by client (control corrected mid-conversation - originally pasted as
 * identical to V2's URL):
 *   control: _conv_eforce=100350521.1003184429
 *   v1:      _conv_eforce=100350521.1003184430
 *   v2:      _conv_eforce=100350521.1003184431
 *
 * KNOWN BUG (confirmed via 12+ live trials during recon, reproduces on both V1 and V2 - see
 * BUG-01 in the .md report): the "Saving $Y" figure intermittently renders as "Saving $0" instead
 * of the correct value. Root cause: `strikeTotal()` reads `.cre-t-202-box-strike-price` (a
 * coexisting test's "Was $X" badge), which appears to populate asynchronously after
 * `injectSubtotalLine()`'s first render. The only re-render chances are two short-lived intervals
 * (250ms x3s wrapping 500ms x3s) fired once from init() - if the badge's real value lands outside
 * that window relative to the poll ticks, the stale $0 is never corrected (no persistent refresh
 * loop exists after ~6s). TC-BUG01 below runs repeated fresh page loads to capture this rate.
 *
 * WinkBeds site quirks applied throughout (qa-knowledge-base/winkbeds/_client-notes.md):
 * navigator.webdriver override (site withholds the Buy Box otherwise), domcontentloaded wait,
 * raw DOM .click() for checkboxes/buttons (occlusion from popups), polling assertions over fixed
 * waits (300-500ms re-render interval).
 */
const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "https://www.winkbeds.com/pages/shop-winkbed";
const CAMPAIGN = "utm_campaign=Cro266mode";
const URLS = {
  control: `${BASE}?${CAMPAIGN}&_conv_eforce=100350521.1003184429`,
  v1: `${BASE}?${CAMPAIGN}&_conv_eforce=100350521.1003184430`,
  v2: `${BASE}?${CAMPAIGN}&_conv_eforce=100350521.1003184431`,
};

const READY_SELECTOR = "#orderForm.loaded .order-form__add.button";
const LINE = ".cre-t-266-subtotal-line";
const OLD_LINE = ".cro-subtotal-line";

const SHOT_DIR = path.join(__dirname, "..", "qa-knowledge-base", "winkbeds", "win266-screenshots");

async function withWebdriverOverride(context) {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
}

async function gotoArm(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(READY_SELECTOR, { timeout: 45000 });
  await page.waitForTimeout(2500);
}

function readState(page) {
  return page.evaluate(({ LINE, OLD_LINE }) => {
    function extractNum(text) {
      const m = (text || "").replace(/,/g, "").match(/\$([0-9]+(\.[0-9]+)?)/);
      return m ? parseFloat(m[1]) : 0;
    }
    const line = document.querySelector(LINE);
    const oldLine = document.querySelector(OLD_LINE);
    const basePrice = extractNum(document.querySelector(".price-row__pay-option-price")?.textContent);
    const comparePrice = extractNum(document.querySelector(".order-form__loadup-button-compare-price")?.textContent);
    const strikeBadge = extractNum(document.querySelector(".cre-t-202-box-strike-price")?.textContent);
    const setupBtn = document.querySelector(".order-form__loadup-button");
    const setupPlus = setupBtn && setupBtn.querySelector(".order-form__loadup-button-icon-plus");
    const setupSelected = !!(setupPlus && setupPlus.classList.contains("hide"));
    const setupPriceEl = setupBtn && setupBtn.querySelector(".order-form__loadup-button-price");
    const setupPrice = setupSelected && setupPriceEl ? extractNum(setupPriceEl.textContent) : 0;
    let accessoriesTotal = 0;
    let checkedAccessories = 0;
    document.querySelectorAll(".accessory-tray_item").forEach((item) => {
      const cb = item.querySelector(".add-to-accessory-cart");
      const titleEl = item.querySelector(".accessory-item-title");
      if (cb && cb.checked && titleEl) {
        accessoriesTotal += extractNum(titleEl.textContent);
        checkedAccessories += 1;
      }
    });
    const addBtn = document.querySelector(".order-form__add.button");
    return {
      bodyClass: document.body.className,
      linePresent: !!line,
      lineHtml: line ? line.innerHTML : null,
      lineText: line ? line.textContent.trim() : null,
      lineDisplay: line ? getComputedStyle(line).display : null,
      lineColor: line ? getComputedStyle(line).color : null,
      lineFontSize: line ? getComputedStyle(line).fontSize : null,
      lineFontWeight: line ? getComputedStyle(line).fontWeight : null,
      savingSpanColor: line && line.querySelector("span") ? getComputedStyle(line.querySelector("span")).color : null,
      oldLinePresent: !!oldLine,
      oldLineText: oldLine ? oldLine.textContent.trim() : null,
      oldLineDisplay: oldLine ? getComputedStyle(oldLine).display : null,
      basePrice,
      comparePrice,
      strikeBadge,
      setupSelected,
      setupPrice,
      accessoriesTotal,
      checkedAccessories,
      expectedTotal: basePrice + setupPrice + accessoriesTotal,
      expectedStrikeTotal: comparePrice + strikeBadge + accessoriesTotal,
      addBtnText: addBtn ? addBtn.textContent.trim() : null,
    };
  }, { LINE, OLD_LINE });
}

async function clickAccessoryByName(page, nameFragment) {
  // CONFIRMED 2026-09-15 (BUG-02 downgrade): a JS-evaluated cb.click() dispatches an
  // isTrusted:false click the site's delegated listener does not react to the same way a real
  // click does (manual click-through updates the total; the old evaluate-based click did not).
  // Use a real Playwright pointer click (force: true to route around popup occlusion, same reason
  // the old code used raw DOM clicks) so the dispatched events match a genuine user interaction.
  const item = page.locator(".accessory-tray_item").filter({ hasText: nameFragment }).first();
  if ((await item.count()) === 0) return false;
  await item.locator(".add-to-accessory-cart").click({ force: true });
  return true;
}

async function waitForLineText(page, predicate, timeout = 6000) {
  await expect
    .poll(async () => (await readState(page)).lineText, { timeout, intervals: [200] })
    .toEqual(expect.stringMatching(predicate));
}

async function takeShot(page, testInfo, name) {
  try {
    await fs.promises.mkdir(SHOT_DIR, { recursive: true });
    const safeBrowser = testInfo.project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    await page.screenshot({ path: path.join(SHOT_DIR, `${name}-${safeBrowser}.png`) });
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────────────────
for (const [key, url] of Object.entries(URLS)) {
  test.describe(`WIN266 [${key}]`, () => {
    /** @type {import('@playwright/test').Page} */
    let page;
    /** @type {import('@playwright/test').BrowserContext} */
    let context;
    const consoleErrors = [];

    test.beforeAll(async ({ browser }) => {
      context = await browser.newContext();
      await withWebdriverOverride(context);
      page = await context.newPage();
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
      await gotoArm(page, url);
    });

    test.afterAll(async () => {
      if (context) await context.close();
    });

    test(`TC-01 [${key}] correct subtotal line variant is rendered`, async ({}, testInfo) => {
      // cre-t-266-subtotal-line injects asynchronously (same race family as BUG-01) - poll instead
      // of a single-shot read so a slow-to-render script doesn't produce a false negative.
      await expect
        .poll(async () => (await readState(page)).linePresent, { timeout: 8000, intervals: [250] })
        .toBe(true);
      const s = await readState(page);
      if (key === "control") {
        // CONFIRMED LIVE 2026-09-14: WIN253's standalone `.cro-subtotal-line` no longer exists in the
        // DOM at all (not merely hidden) - the legacy "Your sub-total is $X" copy now renders through
        // the SAME `.cre-t-266-subtotal-line` element used by v1/v2, just with the old text for control.
        // Original assumption (separate .cro-subtotal-line element persists untouched for control) was stale.
        expect(s.linePresent, "cre-t-266 line element should render (shared across all 3 arms)").toBe(true);
        expect(s.lineText).toMatch(/^Your sub-total is \$[\d,]+$/);
        expect(s.oldLinePresent, ".cro-subtotal-line selector no longer exists on the page").toBe(false);
      } else {
        expect(s.linePresent).toBe(true);
        // CONFIRMED LIVE 2026-09-14: .cro-subtotal-line no longer exists in the DOM at all (not just
        // hidden) once cre-t-266 is active - checking for its absence, not a "none" display value.
        expect(s.oldLinePresent, ".cro-subtotal-line should no longer exist once cre-t-266 is active").toBe(false);
        if (key === "v1") {
          expect(s.lineText).toMatch(/^You.re adding \$[\d,]+ to your cart · Saving \$[\d,]+$/);
        } else {
          expect(s.lineText).toMatch(/^\d+ items? selected · \$[\d,]+ total · Saving \$[\d,]+$/);
        }
      }
      await takeShot(page, testInfo, `${key}-baseline`);
    });

    test(`TC-02 [${key}] rendered total matches base + setup + accessories formula`, async ({}, testInfo) => {
      test.skip(key === "control", "control has no dynamic recompute test in scope, formula shared with WIN253");
      const s = await readState(page);
      const totalInLine = parseFloat((s.lineText.match(/\$([\d,]+)/) || [])[1]?.replace(/,/g, "") || "NaN");
      expect(totalInLine).toBe(s.expectedTotal);
    });

    test(`TC-03 [${key}] line styling matches spec (13.2px, 600 weight, white, green saving span)`, async ({}, testInfo) => {
      test.skip(key === "control", "styling spec is for the new cre-t-266 line only");
      const s = await readState(page);
      expect(s.lineFontSize).toBe("13.2px");
      expect(s.lineColor).toBe("rgb(255, 255, 255)");
      expect(s.savingSpanColor).toBe("rgb(34, 197, 94)"); // #22C55E
    });

    test(`TC-04 [${key}] checking Platform Frame accessory updates total (+$499), keeps saving amount`, async ({}, testInfo) => {
      test.skip(key === "control", "control's sub-total line does not surface a Saving figure to protect");
      const before = await readState(page);
      const ok = await clickAccessoryByName(page, "Platform Frame");
      expect(ok, "Platform Frame accessory checkbox should exist").toBe(true);
      await expect
        .poll(async () => (await readState(page)).expectedTotal, { timeout: 6000, intervals: [200] })
        .toBe(before.expectedTotal + 499);
      // CONFIRMED 2026-09-15: the site's own scheduleSubtotalRefresh() re-renders on a 500ms
      // interval for up to 3s - a loose "any $ figure present" wait passes on the very first
      // (stale) read and races ahead of that refresh on fast browsers. Poll the actual parsed
      // total instead so the assertion waits the full refresh window before failing.
      const expectedNewTotal = before.expectedTotal + 499;
      await expect
        .poll(
          async () => {
            const s = await readState(page);
            return parseFloat((s.lineText.match(/\$([\d,]+)/) || [])[1]?.replace(/,/g, "") || "NaN");
          },
          { timeout: 5000, intervals: [250] }
        )
        .toBe(expectedNewTotal);
      const after = await readState(page);
      // CONFIRMED 2026-09-15: a real click shows V1 (vB.js, which has no button-text code at all)
      // ALSO gets "ADD 2 ITEMS TO CART" - this is native WinkBeds site behavior on the Add button,
      // not test-injected logic (only v2.js explicitly sets btn.textContent, redundantly with the
      // native behavior). Assert it's consistent across both arms rather than assuming V1 differs.
      if (key === "v2") {
        expect(after.lineText).toMatch(/^2 items selected/);
      }
      expect(after.addBtnText).toBe("ADD 2 ITEMS TO CART");
      await takeShot(page, testInfo, `${key}-accessory-checked`);
      // Revert for isolation from later tests in this describe block
      await clickAccessoryByName(page, "Platform Frame");
      await page.waitForTimeout(1000);
    });

    test(`TC-05 [${key}] no injected-code console/page errors`, async () => {
      // Scoped to cre-t-266 specifically: a pre-existing, unrelated site error
      // ("TypeError: ... reading 'compare_at_price'") fires on every page load regardless of
      // arm/variation and is not caused by the cre-t-266 injected code - confirmed live 2026-09-14.
      expect(consoleErrors.filter((e) => /cre-t-266/i.test(e))).toEqual([]);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG-01 regression: repeated fresh loads to capture the intermittent "Saving $0" race.
// Kept to a small sample per project (5) to bound runtime across the 4-project matrix;
// see the .md report for the full 12-trial recon sample used to first confirm this bug.
test.describe("BUG-01 regression: intermittent stale Saving $0", () => {
  for (const key of ["v1", "v2"]) {
    test(`TC-BUG01 [${key}] Saving figure should never mismatch the live strike badge (5 fresh loads)`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== "Chrome Desktop", "race-condition sampling, single browser to bound runtime");
      const results = [];
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        await withWebdriverOverride(context);
        const page = await context.newPage();
        await gotoArm(page, URLS[key]);
        await page.waitForTimeout(2500);
        const s = await readState(page);
        const savingInLine = parseFloat(
          (s.lineText.match(/Saving \$([\d,]+)/) || [])[1]?.replace(/,/g, "") || "NaN"
        );
        const expectedSaving = Math.max(0, s.expectedStrikeTotal - s.expectedTotal);
        results.push({ savingInLine, expectedSaving, strikeBadge: s.strikeBadge });
        await context.close();
      }
      test.info().annotations.push({ type: "bug01-samples", description: JSON.stringify(results) });
      const mismatches = results.filter((r) => r.savingInLine !== r.expectedSaving);
      // Documented as expect.soft: this test's PURPOSE is to measure/confirm the known flaky bug,
      // not to gate the build - see BUG-01 in the .md report. A hard failure here is expected
      // and correct until WinkBeds/the variation code fixes the race.
      expect.soft(mismatches.length, `${key}: ${mismatches.length}/5 loads showed a stale/incorrect Saving figure (BUG-01)`).toBe(0);
    });
  }
});
