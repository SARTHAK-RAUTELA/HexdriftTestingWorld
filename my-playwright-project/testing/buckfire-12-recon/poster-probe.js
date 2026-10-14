// Why does the "all posters loaded" poll fail on homepage / nursing-home? Dump img attrs + naturalWidth after scroll.
const { chromium } = require('@playwright/test');
const url = process.argv[2];
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.buckfire-12-story-card', { timeout: 20000 });
  await page.locator('.buckfire-12-client-stories').scrollIntoViewIfNeeded();
  await page.waitForTimeout(6000);
  console.log(JSON.stringify(await page.$$eval('.buckfire-12-story-card img', (is) => is.map((i) => ({ src: i.getAttribute('src'), cur: i.currentSrc, nw: i.naturalWidth, complete: i.complete, loading: i.loading, cls: i.className })))));
  const resp = await Promise.all((await page.$$eval('.buckfire-12-story-card img', (is) => is.map((i) => i.src))).map(async (u) => [u, (await page.request.get(u)).status()]));
  console.log(JSON.stringify(resp));
  await b.close();
})();
