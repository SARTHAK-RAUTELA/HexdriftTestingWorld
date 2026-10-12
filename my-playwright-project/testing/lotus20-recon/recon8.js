const { chromium } = require('@playwright/test');
const path = require('path');
const scan = (page) => page.evaluate(() => {
  const vis = (e) => e.getBoundingClientRect().height > 0;
  const sh = [...document.querySelectorAll('.cre-t-20-Shuttle-details')];
  return { url: location.pathname, lang: document.documentElement.lang, body20: document.body.classList.contains('cre-t-20'), sh: sh.length, shVis: sh.filter(vis).length, modal: !!document.getElementById('cre-t-20-popup__modal') };
});
(async () => {
  const b = await chromium.launch();
  for (const id of ['1000257610', '1000257611']) {
    const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
    await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000); await page.addStyleTag({ content: '.ch2{display:none!important}' });
    await page.locator('[data-action="confirm-dates"]:visible').first().click({ force: true }); await page.waitForTimeout(3000);
    await page.locator('button[aria-label="Language"]:visible').first().click(); await page.waitForTimeout(800);
    await page.getByText('Deutsch', { exact: true }).filter({ visible: true }).first().click();
    await page.waitForTimeout(9000);
    console.log(id, 'SPA->DE', JSON.stringify(await scan(page)));
    await page.screenshot({ path: path.join(__dirname, 'out', `de-spa-${id}.png`) });
    await page.goto(`https://www.lotuscarrental.is/de/mietwagen-island?cro_mode=qa&_conv_eforce=100052946.${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(10000);
    console.log(id, 'direct DE', JSON.stringify(await scan(page)));
    await page.close();
  }
  await b.close();
})();
