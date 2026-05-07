const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const TASKS_URL = 'https://trakio.brillmark.com/sarthak-rautelas-workspace/tasks';
const SS = path.join(__dirname, '..', 'trakio-screenshots', 'tasks-inspect');
const COOKIES = [
  { name: 'better-auth.session_data', value: 'eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNi0wNS0xMVQxNDowNzozNC40MDRaIiwidG9rZW4iOiJLeVFEYkRHcjBrU0pHR1RjeXY3VjhscnFrTGpWajBDSiIsImNyZWF0ZWRBdCI6IjIwMjYtMDUtMDRUMTQ6MDc6MzQuNDA0WiIsInVwZGF0ZWRBdCI6IjIwMjYtMDUtMDRUMTQ6MzY6MTUuOTYyWiIsImlwQWRkcmVzcyI6IjIyMy4yMzMuNzAuMTc0IiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Ny4wLjAuMCBTYWZhcmkvNTM3LjM2IiwidXNlcklkIjoiVWlFc2ZSMFp2NmRzOU03OXhKWmh3bjNhRG5wajZwdnMiLCJhY3RpdmVPcmdhbml6YXRpb25JZCI6Im9vQWs4a1NuWnpnRFVyVkVCTzZ4bjVOcWlSQXYzeXI2IiwiaW1wZXJzb25hdGVkQnkiOm51bGwsImlkIjoiaFNkRGlTNVB0SXZhUkR5NHQ1WEpGVVVKNVludjhxNjAifSwidXNlciI6eyJuYW1lIjoiU2FydGhhayBSYXV0ZWxhIiwiZW1haWwiOiJzYXJ0aGFrQGJyaWxsbWFyay5jb20iLCJlbWFpbFZlcmlmaWVkIjp0cnVlLCJpbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xLOGx6Nm5zN1Itbi1NN3IzUUNEUlc1SHJXWm1CMUxCVUZ0UUxHd254TkNEM05MVV94PXM5Ni1jIiwiY3JlYXRlZEF0IjoiMjAyNi0wNS0wNFQxNDowNzozMy45MzZaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0wNFQxNDowNzozMy45MzZaIiwicm9sZSI6InVzZXIiLCJiYW5uZWQiOmZhbHNlLCJiYW5SZWFzb24iOm51bGwsImJhbkV4cGlyZXMiOm51bGwsImlkIjoiVWlFc2ZSMFp2NmRzOU03OXhKWmh3bjNhRG5wajZwdnMifSwidXBkYXRlZEF0IjoxNzc3OTA1Mzc3MTA3LCJ2ZXJzaW9uIjoiMSJ9LCJleHBpcmVzQXQiOjE3Nzc5MDU2NzcxMDcsInNpZ25hdHVyZSI6IjluSlVsckNyTThzUE9abjNCQkJ1eHljMm9TWlhWbUh1WUpaOVNmaktMdnMifQ', domain: 'trakio.brillmark.com', path: '/', httpOnly: false, secure: true, sameSite: 'Lax' },
  { name: 'better-auth.session_token', value: 'KyQDbDGr0kSJGGTcyv7V8lrqkLjVj0CJ.3zjebG3YnRuOEIgZlSOvcRaB8yHbTNJedCBS%2FGMEVD0%3D', domain: 'trakio.brillmark.com', path: '/', httpOnly: false, secure: true, sameSite: 'Lax' },
];

test.use({ headless: false });

test('Deep inspect Tasks page — all elements, HTML, aria, events', async ({ page, context }) => {
  if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true });
  await context.addCookies(COOKIES);
  await page.goto(TASKS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Full page screenshot
  await page.screenshot({ path: path.join(SS, '00-full.png'), fullPage: true });

  // All buttons with full detail
  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map((b, i) => ({
      index: i,
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      disabled: b.disabled,
      classes: b.className,
      testId: b.getAttribute('data-testid'),
      type: b.type,
    }))
  );
  console.log('\n=== BUTTONS ===\n', JSON.stringify(buttons, null, 2));

  // All inputs
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
      tag: el.tagName, type: el.type, name: el.name,
      placeholder: el.placeholder, ariaLabel: el.getAttribute('aria-label'),
      id: el.id, value: el.value,
    }))
  );
  console.log('\n=== INPUTS ===\n', JSON.stringify(inputs, null, 2));

  // All links
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.innerText.trim(), href: a.href,
      ariaLabel: a.getAttribute('aria-label'),
    })).filter(a => a.text || a.ariaLabel)
  );
  console.log('\n=== LINKS ===\n', JSON.stringify(links, null, 2));

  // All clickable roles
  const roles = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="button"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="switch"],[role="option"]')).map(el => ({
      role: el.getAttribute('role'),
      text: el.innerText.trim().slice(0, 80),
      ariaLabel: el.getAttribute('aria-label'),
      ariaSelected: el.getAttribute('aria-selected'),
      ariaChecked: el.getAttribute('aria-checked'),
      testId: el.getAttribute('data-testid'),
    }))
  );
  console.log('\n=== ROLE ELEMENTS ===\n', JSON.stringify(roles, null, 2));

  // Table structure
  const tableInfo = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr, [role="row"]'));
    return rows.map(r => r.innerText.trim().replace(/\n+/g, ' | ').slice(0, 200));
  });
  console.log('\n=== TABLE ROWS ===\n', tableInfo.join('\n'));

  // Check for modals / dialogs already present
  const dialogs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="dialog"],[role="alertdialog"],[data-state="open"]'))
      .map(el => ({ role: el.getAttribute('role'), text: el.innerText.trim().slice(0, 100) }))
  );
  console.log('\n=== DIALOGS (if any) ===\n', JSON.stringify(dialogs, null, 2));

  // Console errors collector
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.waitForTimeout(1000);
  console.log('\n=== CONSOLE ERRORS ===\n', errors.length ? errors : 'None');

  console.log('\n=== INSPECT COMPLETE ===');
});
