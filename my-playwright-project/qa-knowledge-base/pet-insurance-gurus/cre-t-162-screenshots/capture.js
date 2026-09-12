// One-off screenshot capture for the CRE-T-162 QA report. Not part of the Playwright test suite.
const { chromium, firefox, webkit, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const SITE = "https://petinsurancegurus.com/";
const BUILD_DIR = path.join(__dirname, "..", "..", "..", "..", "local_testing", "Local2", "variation");
const CSS = fs.readFileSync(path.join(BUILD_DIR, "vB.css"), "utf8");
const JS = fs.readFileSync(path.join(BUILD_DIR, "vB.js"), "utf8");
const CARD = '[data-unique="comparison-table"] [data-unique$="-Listing-Only"]';
const OUT = __dirname;

const TARGETS = [
  { name: "chrome-desktop", launcher: chromium, contextOpts: { viewport: { width: 1280, height: 900 } } },
  { name: "firefox-desktop", launcher: firefox, contextOpts: { viewport: { width: 1280, height: 900 } } },
  { name: "edge-desktop", launcher: chromium, launchOpts: { channel: "msedge" }, contextOpts: { viewport: { width: 1280, height: 900 } } },
  { name: "safari-desktop", launcher: webkit, contextOpts: { viewport: { width: 1280, height: 900 } } },
  { name: "mobile-chrome-pixel5", launcher: chromium, contextOpts: { ...devices["Pixel 5"] } },
  { name: "mobile-safari-iphone12", launcher: webkit, contextOpts: { ...devices["iPhone 12"] } },
];

(async () => {
  for (const t of TARGETS) {
    console.log("Capturing", t.name);
    const browser = await t.launcher.launch(t.launchOpts || {});
    const context = await browser.newContext(t.contextOpts || {});
    const page = await context.newPage();
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(CARD, { timeout: 45000 });
    await page.waitForTimeout(1500);
    await page.addStyleTag({ content: CSS });
    await page.addScriptTag({ content: JS });
    await page.waitForSelector("#cre-t-162-section", { state: "attached", timeout: 20000 });
    await page.waitForTimeout(300);

    // Full context shot: header of comparison area, quote card, filter row (shows hidden "Personalize prices").
    await page.screenshot({ path: path.join(OUT, `context-${t.name}.png`) });

    // Close-up of the quote card itself.
    const card = page.locator("#cre-t-162-section");
    await card.screenshot({ path: path.join(OUT, `quote-card-${t.name}.png`) });

    await browser.close();
  }
  console.log("Done.");
})();
