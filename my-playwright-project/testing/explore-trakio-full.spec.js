const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const WS = 'https://trakio.brillmark.com/sarthak-rautelas-workspace';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'trakio-screenshots');

const COOKIES = [
  {
    name: 'better-auth.session_data',
    value: 'eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNi0wNS0xMVQxNDowNzozNC40MDRaIiwidG9rZW4iOiJLeVFEYkRHcjBrU0pHR1RjeXY3VjhscnFrTGpWajBDSiIsImNyZWF0ZWRBdCI6IjIwMjYtMDUtMDRUMTQ6MDc6MzQuNDA0WiIsInVwZGF0ZWRBdCI6IjIwMjYtMDUtMDRUMTQ6MzY6MTUuOTYyWiIsImlwQWRkcmVzcyI6IjIyMy4yMzMuNzAuMTc0IiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Ny4wLjAuMCBTYWZhcmkvNTM3LjM2IiwidXNlcklkIjoiVWlFc2ZSMFp2NmRzOU03OXhKWmh3bjNhRG5wajZwdnMiLCJhY3RpdmVPcmdhbml6YXRpb25JZCI6Im9vQWs4a1NuWnpnRFVyVkVCTzZ4bjVOcWlSQXYzeXI2IiwiaW1wZXJzb25hdGVkQnkiOm51bGwsImlkIjoiaFNkRGlTNVB0SXZhUkR5NHQ1WEpGVVVKNVludjhxNjAifSwidXNlciI6eyJuYW1lIjoiU2FydGhhayBSYXV0ZWxhIiwiZW1haWwiOiJzYXJ0aGFrQGJyaWxsbWFyay5jb20iLCJlbWFpbFZlcmlmaWVkIjp0cnVlLCJpbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xLOGx6Nm5zN1Itbi1NN3IzUUNEUlc1SHJXWm1CMUxCVUZ0UUxHd254TkNEM05MVV94PXM5Ni1jIiwiY3JlYXRlZEF0IjoiMjAyNi0wNS0wNFQxNDowNzozMy45MzZaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0wNFQxNDowNzozMy45MzZaIiwicm9sZSI6InVzZXIiLCJiYW5uZWQiOmZhbHNlLCJiYW5SZWFzb24iOm51bGwsImJhbkV4cGlyZXMiOm51bGwsImlkIjoiVWlFc2ZSMFp2NmRzOU03OXhKWmh3bjNhRG5wajZwdnMifSwidXBkYXRlZEF0IjoxNzc3OTA1Mzc3MTA3LCJ2ZXJzaW9uIjoiMSJ9LCJleHBpcmVzQXQiOjE3Nzc5MDU2NzcxMDcsInNpZ25hdHVyZSI6IjluSlVsckNyTThzUE9abjNCQkJ1eHljMm9TWlhWbUh1WUpaOVNmaktMdnMifQ',
    domain: 'trakio.brillmark.com',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax',
  },
  {
    name: 'better-auth.session_token',
    value: 'KyQDbDGr0kSJGGTcyv7V8lrqkLjVj0CJ.3zjebG3YnRuOEIgZlSOvcRaB8yHbTNJedCBS%2FGMEVD0%3D',
    domain: 'trakio.brillmark.com',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax',
  },
];

const PAGES = [
  { name: 'dashboard',          url: `${WS}/dashboard` },
  { name: 'my-tasks',           url: `${WS}/tasks` },
  { name: 'worklogs',           url: `${WS}/worklogs` },
  { name: 'my-spaces',          url: `${WS}/spaces` },
  { name: 'projects',           url: `${WS}/projects` },
  { name: 'invoices',           url: `${WS}/invoices` },
  { name: 'clients',            url: `${WS}/clients` },
  { name: 'employee-worklogs',  url: `${WS}/employee-worklogs` },
  { name: 'reports',            url: `${WS}/reports` },
  { name: 'loe-approvals',      url: `${WS}/loe-approvals` },
  { name: 'settings',           url: `${WS}/settings` },
];

test.use({ headless: false });

test('Explore every Trakio page', async ({ page, context }) => {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  await context.addCookies(COOKIES);

  for (let i = 0; i < PAGES.length; i++) {
    const { name, url } = PAGES[i];
    console.log(`\n[${i + 1}/${PAGES.length}] Visiting: ${name} — ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Extra wait for JS-rendered content
      await page.waitForTimeout(3000);

      const finalUrl = page.url();
      const bodyText = await page.evaluate(() => document.body.innerText);
      const pageTitle = await page.title();

      console.log(`  Title   : ${pageTitle}`);
      console.log(`  Final URL: ${finalUrl}`);
      console.log(`  Content preview:\n${bodyText.slice(0, 1200)}`);

      // Collect buttons
      const btns = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button'))
          .map(b => b.innerText.trim())
          .filter(t => t.length > 0)
      );
      console.log(`  Buttons : ${JSON.stringify(btns)}`);

      // Collect inputs
      const inputs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('input, select, textarea'))
          .map(el => ({ tag: el.tagName, type: el.type, name: el.name, placeholder: el.placeholder }))
      );
      console.log(`  Inputs  : ${JSON.stringify(inputs)}`);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `page-${String(i + 1).padStart(2, '0')}-${name}.png`),
        fullPage: true,
      });
      console.log(`  Screenshot saved.`);

    } catch (err) {
      console.log(`  ERROR: ${err.message.split('\n')[0]}`);
      try {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `page-${String(i + 1).padStart(2, '0')}-${name}-error.png`),
          fullPage: true,
        });
      } catch (_) {}
    }
  }

  console.log('\n=== All pages explored ===');
});
