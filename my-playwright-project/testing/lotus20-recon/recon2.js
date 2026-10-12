const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto('https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.1000257610', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.cre-t-20-Shuttle-details').length > 5, null, { timeout: 30000 });
  await page.addStyleTag({ content: '.ch2{display:none!important}' });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const card = document.querySelector('[data-slice-type="fleet_category"] [id*="car"]');
    const anc = []; let e = card; while (e && e !== document.body) { anc.push(e.tagName + (e.getAttribute('href') ? `[href=${e.getAttribute('href')}]` : '') + '.' + (e.className || '').toString().slice(0, 60)); e = e.parentElement; }
    const links = [...card.querySelectorAll('a,button')].map(a => a.tagName + ':' + a.textContent.trim().slice(0, 30) + ':' + (a.getAttribute('href') || ''));
    const langs = [...document.querySelectorAll('a[hreflang], link[hreflang]')].map(a => a.getAttribute('hreflang') + '=' + a.getAttribute('href'));
    const btns = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().top < 400 && b.getBoundingClientRect().height).map(b => b.textContent.trim().slice(0, 30));
    const close = getComputedStyle(document.querySelector('.cre-t-20-close'));
    const sh = document.querySelector('.cre-t-20-Shuttle-details'); const shs = getComputedStyle(sh);
    return { anc, links, langs, btns, closeBg: close.backgroundColor, teal800: getComputedStyle(document.documentElement).getPropertyValue('--color-teal-800'),
      sh: { td: shs.textDecorationLine, cur: shs.cursor, fs: shs.fontSize, role: sh.getAttribute('role'), tab: sh.tabIndex, rect: sh.getBoundingClientRect().toJSON() },
      cardHTML: card.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/<img[^>]*>/g, '<img/>').slice(0, 2500) };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
