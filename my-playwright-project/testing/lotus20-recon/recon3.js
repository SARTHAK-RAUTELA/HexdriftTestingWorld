const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto('https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.1000257610', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.addStyleTag({ content: '.ch2{display:none!important}' });
  const hdr = page.locator('header button:visible');
  console.log('header buttons', await hdr.count());
  for (let i = 0; i < await hdr.count(); i++) console.log(i, await hdr.nth(i).getAttribute('aria-label'), (await hdr.nth(i).innerText()).slice(0, 20));
  // globe is likely the 2nd icon button
  await hdr.nth(0).click(); await page.waitForTimeout(1200);
  console.log(await page.evaluate(() => [...document.querySelectorAll('[role=menu] *,[data-slot*=popover-content] *,[data-slot*=dropdown] *,[role=listbox] *')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.tagName + ':' + e.textContent.trim() + ':' + (e.closest('a')?.href || '')).slice(0, 30)));
  await b.close();
})();
