const { chromium } = require('@playwright/test');
const ARMS = { control: '1000257609', v1: '1000257610' };
(async () => {
  const b = await chromium.launch();
  for (const [k, id] of Object.entries(ARMS)) {
    const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
    await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=100052946.${id}`, { waitUntil: 'domcontentloaded' });
    for (const t of [3000, 6000, 10000]) {
      await page.waitForTimeout(t === 3000 ? 3000 : 3500);
      const r = await page.evaluate(() => {
        const sh = [...document.querySelectorAll('.cre-t-20-Shuttle-details')];
        const cards = [...document.querySelectorAll('[data-slice-type="fleet_category"] [id*="car"]')];
        const ids = cards.map(c => c.id);
        return {
          open: [...document.querySelectorAll('[data-state="open"]')].map(e => e.tagName + '.' + (e.getAttribute('data-slot') || e.getAttribute('aria-label') || '')).slice(0, 6),
          cards: cards.length, uniqIds: new Set(ids).size, sh: sh.length,
          shParents: [...new Set(sh.map(s => s.parentElement.closest('[id*="car"]')?.id))].length,
          perCardMax: Math.max(0, ...cards.map(c => c.querySelectorAll('.cre-t-20-Shuttle-details').length)),
          bookNow: [...document.querySelectorAll('button,a')].filter(e => /book now/i.test(e.textContent)).map(e => e.tagName + ':' + !!e.closest('[id*="car"]')).slice(0, 4),
          cardBtns: cards[0] ? [...cards[0].querySelectorAll('button,a')].map(e => e.tagName + ':' + e.textContent.trim().slice(0, 25)) : [],
          sections: document.querySelectorAll('[data-slice-type="fleet_category"]').length,
          url: location.href.slice(-60),
        };
      });
      console.log(k, t, JSON.stringify(r));
    }
    await page.close();
  }
  await b.close();
})();
