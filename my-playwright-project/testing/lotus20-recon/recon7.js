const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.1000257610`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const st = () => page.evaluate(() => [...document.querySelectorAll('[data-state="open"]')].map(e => e.tagName + ':' + (e.getAttribute('aria-label') || e.getAttribute('data-slot') || e.className.toString().slice(0, 40))));
  console.log('initial', await st());
  await page.keyboard.press('Escape'); await page.waitForTimeout(800); console.log('after esc', await st());
  await page.locator('button[aria-label="Close"][data-state="open"]').first().click({ position: { x: 640, y: 600 } }).catch(e => console.log('clickerr', e.message.slice(0, 200)));
  await page.waitForTimeout(800); console.log('after backdrop click', await st());
  await page.mouse.click(1000, 650); await page.waitForTimeout(800); console.log('after mouse click', await st());
  await page.waitForTimeout(3000); console.log('3s later', await st());
  await b.close();
})();
