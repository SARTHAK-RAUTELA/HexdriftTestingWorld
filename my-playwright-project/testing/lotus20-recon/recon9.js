const { chromium, devices } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (const dev of [{ viewport: { width: 1280, height: 720 } }, devices['Pixel 5']]) {
    const page = await (await b.newContext(dev)).newPage();
    await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.1000257610`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000); await page.addStyleTag({ content: '.ch2{display:none!important}' });
    const upd = page.locator('[data-action="confirm-dates"]:visible');
    console.log('confirm-dates visible:', await upd.count(), 'panel open:', await page.locator('button[aria-label="Close"][data-state="open"]:visible').count());
    if (await upd.count()) { await upd.first().click({ force: true }); await page.waitForTimeout(3000); }
    console.log('after: confirm-dates visible', await page.locator('[data-action="confirm-dates"]:visible').count(), 'filters:', await page.locator('[data-filter]').evaluateAll(es => es.map(e => e.getAttribute('data-filter') + ':' + e.tagName + ':' + (e.getBoundingClientRect().height > 0))));
    const sort = page.locator('[data-filter="sort"]:visible').first();
    if (await sort.count()) {
      await sort.scrollIntoViewIfNeeded(); await sort.click(); await page.waitForTimeout(1000);
      console.log(await page.evaluate(() => [...document.querySelectorAll('[data-state="open"], [role="listbox"], [role="menu"], [data-slot*="content"]')].map(e => e.tagName + '|' + (e.getAttribute('role') || '') + '|' + (e.getAttribute('data-slot') || '') + '|' + e.innerText.replace(/\n/g, ' / ').slice(0, 150))));
      console.log(await page.evaluate(() => [...document.querySelectorAll('[role="option"],[role="menuitemradio"],[role="radio"],label,li,button')].filter(e => /price|recommend|newest|popular|high/i.test(e.textContent) && e.getBoundingClientRect().height > 0 && e.textContent.length < 40).map(e => e.tagName + '|' + e.getAttribute('role') + '|' + e.textContent.trim())));
    }
    await page.close();
  }
  await b.close();
})();
