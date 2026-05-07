const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const WORKSPACE_URL = 'https://trakio.brillmark.com/sarthak-rautelas-workspace';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'trakio-screenshots');

test.use({ headless: false });

test('Explore Trakio Workspace URL', async ({ page }) => {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log('\n=== OPENING WORKSPACE URL ===');
  console.log('URL:', WORKSPACE_URL);

  const response = await page.goto(WORKSPACE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const finalUrl = page.url();
  const statusCode = response ? response.status() : 'unknown';
  console.log('Final URL (after redirects):', finalUrl);
  console.log('HTTP Status:', statusCode);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-workspace-url.png'), fullPage: true });
  console.log('Screenshot saved: 03-workspace-url.png');

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page title:', title);
  console.log('\n--- Page Text ---\n', bodyText.slice(0, 2000));
});
