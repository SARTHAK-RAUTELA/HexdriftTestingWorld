const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://trakio.brillmark.com';
const LOGIN_URL = 'https://trakio.brillmark.com/auth/sign-in?callbackUrl=%2F';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'trakio-screenshots');

function ensureDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.use({ headless: false });

test('Explore Trakio - Login Page', async ({ page }) => {
  ensureDir();

  console.log('\n=== EXPLORING TRAKIO APP ===\n');

  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login-page.png'), fullPage: true });
  console.log('Screenshot saved: 01-login-page.png');

  const title = await page.title();
  console.log('Page title:', title);
  console.log('Current URL:', page.url());

  const allText = await page.evaluate(() => document.body.innerText);
  console.log('\n--- Page Text Content ---\n', allText.slice(0, 3000));

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      name: i.name,
      placeholder: i.placeholder,
      id: i.id,
    }));
  });
  console.log('\n--- Form Inputs ---\n', JSON.stringify(inputs, null, 2));

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      type: b.type,
    }));
  });
  console.log('\n--- Buttons ---\n', JSON.stringify(buttons, null, 2));

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href,
    })).filter(a => a.text.length > 0);
  });
  console.log('\n--- Links ---\n', JSON.stringify(links, null, 2));

  console.log('\n=== Login page exploration complete ===');
  console.log('NOTE: Credentials needed to proceed further.');
});
