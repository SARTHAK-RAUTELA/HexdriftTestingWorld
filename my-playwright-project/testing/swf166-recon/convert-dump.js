const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const d = await page.evaluate(() => JSON.stringify(window.convert.data));
  fs.writeFileSync(path.join(__dirname, 'out', 'convert-data.json'), d);
  await b.close();
})();
