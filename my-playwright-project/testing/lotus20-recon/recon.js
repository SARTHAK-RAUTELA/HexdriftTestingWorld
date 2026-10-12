// Recon for LOTUS20: what each arm renders on the listing page.
const { chromium, webkit, devices } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const EXP = '100052946';
const ARMS = { control: '1000257609', v1: '1000257610', v2: '1000257611' };
const engine = process.argv[2] === 'webkit' ? webkit : chromium;
const dev = process.argv[3] ? devices[process.argv[3]] : { viewport: { width: 1440, height: 900 } };
(async () => {
  const browser = await engine.launch();
  for (const [k, id] of Object.entries(ARMS)) {
    const ctx = await browser.newContext(dev); const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(`https://www.lotuscarrental.is/rent-a-car-in-iceland?cro_mode=qa&_conv_eforce=${EXP}.${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(exp => window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(5000);
    const info = await page.evaluate((exp) => {
      const cards = [...document.querySelectorAll('[data-slice-type="fleet_category"] [id*="car"]')];
      const third = [...document.querySelectorAll('[data-slice-type="fleet_category"] [id*="car"]>div:nth-child(3)')];
      const sh = [...document.querySelectorAll('.cre-t-20-Shuttle-details')];
      const shuttleish = [...document.querySelectorAll('body *')].filter(e => e.children.length < 3 && /shuttle/i.test(e.textContent) && e.textContent.length < 80).slice(0, 8).map(e => ({ tag: e.tagName, cls: e.className?.toString().slice(0, 80), txt: e.textContent.trim().slice(0, 80) }));
      const ss = [...document.querySelectorAll('style')].filter(s => /cre-t-20/.test(s.textContent)).map(s => s.textContent.slice(0, 3000));
      return {
        lang: document.documentElement.lang, bodyCls: document.body.className,
        exp: window.convert?.currentData?.experiences?.[exp],
        allExps: Object.keys(window.convert?.currentData?.experiences || {}),
        cardCount: cards.length, cardIds: cards.slice(0, 5).map(c => c.id),
        thirdCount: third.length, thirdHTML: third[0]?.outerHTML.slice(0, 1500),
        shCount: sh.length, shVisible: sh.filter(e => e.getBoundingClientRect().height > 0).length,
        shuttleish, modal: !!document.getElementById('cre-t-20-popup__modal'),
        modalHTML: document.getElementById('cre-t-20-popup__modal')?.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 2500),
        cssLen: ss.map(s => s.length), css: ss,
      };
    }, EXP);
    info.errs = errs;
    fs.writeFileSync(path.join(__dirname, 'out', `${k}-${process.argv[2] || 'chromium'}-${(process.argv[3] || 'desktop').replace(/\W+/g, '')}.json`), JSON.stringify(info, null, 2));
    await page.screenshot({ path: path.join(__dirname, 'out', `${k}-${process.argv[3] ? 'mobile' : 'desktop'}.png`) });
    console.log(k, JSON.stringify({ lang: info.lang, exp: info.exp, cards: info.cardCount, third: info.thirdCount, sh: info.shCount, shVis: info.shVisible, modal: info.modal, errs: errs.length, shuttleish: info.shuttleish }));
    await ctx.close();
  }
  await browser.close();
})();
