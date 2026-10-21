const { chromium } = require('playwright');
const OUT = 'D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/local_testing/Local2/ttod-screenshots';
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1025, height: 800 } }); const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(4000);
  // scroll fully right to show the overflow strip
  await p.evaluate(() => scrollTo(document.documentElement.scrollWidth, 0)); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/bug-1025-overflow-scrolled-right.png` });
  await p.evaluate(() => scrollTo(0, 0));
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(800);
  const f = await p.$('[class*="pro-signup-hero_searchFields"]');
  await f.screenshot({ path: `${OUT}/bug-input-styling-variation.png` });
  await b.close();
  const b2 = await chromium.launch(); const p2 = await (await b2.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p2.goto('https://www.thumbtack.com/pro', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p2.waitForSelector('[class*="pro-signup-hero_searchFields"]', { timeout: 60000 }); await p2.waitForTimeout(4000);
  await (await p2.$('[class*="pro-signup-hero_searchFields"]')).screenshot({ path: `${OUT}/bug-input-styling-control.png` });
  await b2.close();
})();
