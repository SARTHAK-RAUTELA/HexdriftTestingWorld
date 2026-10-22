const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa', { waitUntil: 'load' });
  const t = await page.evaluate(() => { const s = [...document.scripts].find(s => !s.src && /aff_link_click/.test(s.textContent)); const x = s.textContent; const i = x.indexOf('function updateQueryParam'); return x.slice(Math.max(0, i - 2500), i - 800); });
  console.log(t);
  await b.close();
})();
