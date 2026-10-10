// Recon (search flow) for Lotus Test 22: /rent-a-car-in-iceland 12:00 PM nodes + homepage Search Now destination.
const { chromium } = require('@playwright/test');
const path = require('path');
const Q = 'cro_mode=qa&_conv_eforce=100052922.1000257556';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  const p = await ctx.newPage();
  await p.goto('https://www.lotuscarrental.is/rent-a-car-in-iceland?' + Q, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(10000);
  console.log('rent-a-car flag', await p.evaluate(() => !!window.__lotus22Loaded));
  console.log(await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.childElementCount === 0 && /12:00\s?PM/i.test(e.textContent))
    .map((e) => `${e.tagName} visible=${!!e.getClientRects().length} inBtn=${!!e.closest('button')} :: ${e.parentElement.textContent.trim().slice(0, 140)}`).join('\n')));
  await p.addStyleTag({ content: '.ch2{display:none!important}' });
  await p.screenshot({ path: path.join(__dirname, 'out', 'v2-rent-a-car.png'), fullPage: false });

  await p.goto('https://www.lotuscarrental.is/?' + Q, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => !!window.__lotus22Loaded, null, { timeout: 20000 });
  await p.addStyleTag({ content: '.ch2{display:none!important}' });
  const cands = await p.evaluate(() => [...document.querySelectorAll('a, button')].filter((e) => /Search Now/i.test(e.textContent)).map((e) => `${e.tagName} href=${e.getAttribute('href')} vis=${!!e.getClientRects().length}`));
  console.log('search candidates', cands);
  const sn = p.locator('a, button').filter({ hasText: 'Search Now' }).filter({ visible: true }).first();
  console.log('href', await sn.getAttribute('href'));
  await sn.click();
  await p.waitForTimeout(10000);
  await p.addStyleTag({ content: '.ch2{display:none!important}' }).catch(() => {});
  await p.screenshot({ path: path.join(__dirname, 'out', 'v2-search-results.png') });
  console.log('landed', p.url(), 'flag', await p.evaluate(() => !!window.__lotus22Loaded));
  console.log(await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.childElementCount === 0 && /(\d{1,2}:\d{2}\s?(AM|PM)?|Noon|Midnight)/i.test(e.textContent) && e.getClientRects().length)
    .map((e) => `${e.tagName} inBtn=${!!e.closest('button')} :: ${e.textContent.trim().slice(0, 60)}`).slice(0, 25).join('\n')));
  await b.close();
})();
