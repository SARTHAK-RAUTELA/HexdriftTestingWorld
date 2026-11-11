const { chromium, devices } = require('@playwright/test');
const EXP = '100053078', V = '1000257925';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await ctx.newPage();
  await page.goto(`https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=${EXP}.${V}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(exp => window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.addStyleTag({ content: '.ch2{display:none!important}' });
  const modal = await page.evaluate(() => { const d = document.querySelector('[role=dialog]'); return d && { role: d.getAttribute('role'), attrs: [...d.attributes].map(a => a.name + '=' + a.value.slice(0, 60)) }; });
  console.log('modal', JSON.stringify(modal));
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  console.log('dialogs after esc', await page.locator('[role=dialog]:visible').count());
  const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"], a[href^="https://www.lotuscarrental.is"]')].map(a => a.href.split('?')[0].split('#')[0]))]);
  console.log('links', links.length, JSON.stringify(links));
  // hamburger menu
  const burger = page.locator('header button').last();
  console.log('header buttons', await page.locator('header button').evaluateAll(b => b.map(x => (x.getAttribute('aria-label') || x.textContent).trim().slice(0, 30))));
  await page.evaluate(() => scrollTo(0, 1200)); await page.waitForTimeout(400);
  await page.evaluate(() => scrollTo(0, 1100)); await page.waitForTimeout(400);
  await burger.click(); await page.waitForTimeout(1000);
  const menu = await page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].map(x => [...x.attributes].map(a => a.name + '=' + a.value.slice(0, 50)).join(' ')); const h = document.querySelector('header.sticky.top-0'); return { d, hidden: h.classList.contains('cre-t-28-header-hidden'), y: scrollY, bodyStyle: document.body.getAttribute('style'), htmlStyle: document.documentElement.getAttribute('style') }; });
  console.log('menu open', JSON.stringify(menu));
  await page.screenshot({ path: 'testing/lotus28-recon/menu-open.png' });
  await browser.close();
})();
