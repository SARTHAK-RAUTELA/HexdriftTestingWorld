const { test } = require('@playwright/test');

const LOGIN_URL = 'https://trakio.brillmark.com/auth/sign-in?callbackUrl=%2F';
const EMAIL = 'sarthak@brillmark.com';

test.use({ headless: false });

test('Send magic link to sarthak@brillmark.com', async ({ page }) => {
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.fill('input[type="email"]', EMAIL);
  await page.waitForTimeout(500);

  await page.click('button[type="submit"]');
  console.log(`\nMagic link sent to: ${EMAIL}`);

  await page.waitForTimeout(4000);

  const url = page.url();
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Current URL after submit:', url);
  console.log('Page text after submit:\n', bodyText.slice(0, 1000));

  await page.screenshot({
    path: require('path').join(__dirname, '..', 'trakio-screenshots', '02-after-magic-link-sent.png'),
    fullPage: true,
  });
  console.log('Screenshot saved: 02-after-magic-link-sent.png');
  console.log('\n>>> CHECK YOUR EMAIL and paste the magic link URL here <<<');
});
