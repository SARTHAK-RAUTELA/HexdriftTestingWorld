// Recon (button) for Lotus Test 22: identify the desktop Search Now element via elementFromPoint.
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257556', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  await p.addStyleTag({ content: '.ch2{display:none!important}' });
  console.log(await p.evaluate(() => { const e = document.elementFromPoint(1242, 396); const c = e.closest('a,button,[role]') || e; return c.outerHTML.slice(0, 500); }));
  await b.close();
})();
