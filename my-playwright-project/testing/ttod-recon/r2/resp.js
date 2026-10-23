// Round-2 responsive sweep: horizontal overflow (BUG-04), hero grid, new hero + card images
const { chromium, webkit } = require('playwright');
const OUT = __dirname + '/shots';
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_x=5442504495988736&optimizely_force_tracking=true';
(async () => {
  const which = process.argv[2] || 'chromium';
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(4000);
  console.log(which, 'images', JSON.stringify(await p.evaluate(async () => {
    const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(src.split('/').pop() + ' ' + i.naturalWidth + 'x' + i.naturalHeight); i.onerror = () => r(src + ' FAILED'); i.src = src; });
    const hero = getComputedStyle(document.querySelector('[class*="pro-signup-hero_heroImage"]')).backgroundImage.slice(5, -2);
    const cards = [...document.querySelectorAll('.bm-two-ways__card img')];
    return { hero: await load(hero), cards: await Promise.all(cards.map(i => load(i.src))), cardAlts: cards.map(i => i.alt), cardsComplete: cards.map(i => i.complete && i.naturalWidth > 0) };
  })));
  for (const w of [320, 375, 390, 414, 768, 820, 1024, 1025, 1040, 1060, 1080, 1100, 1120, 1180, 1280, 1366, 1440, 1920]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const over = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > de.clientWidth + 1 && getComputedStyle(e).position !== 'fixed'; })
        .slice(0, 4).map(e => (e.className || e.tagName).toString().slice(0, 40) + ' r=' + Math.round(e.getBoundingClientRect().right));
      const box = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
      return {
        sw: de.scrollWidth, cw: de.clientWidth, over,
        inner: box('[class*="pro-signup-hero_heroInner"]'), title: box('[class*="pro-signup-hero_heroTitle"]'), fields: box('[class*="pro-signup-hero_searchFields"]'), img: box('[class*="pro-signup-hero_heroImage"]'),
        cards: [...document.querySelectorAll('.bm-two-ways__card')].map(c => { const b = c.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width)]; }),
      };
    });
    console.log(which, w, JSON.stringify(r));
    if ([375, 768, 1024, 1025, 1100, 1440].includes(w)) {
      const hero = await p.$('[class*="pro-signup-hero_heroSection"]');
      const hb = await hero.evaluate(e => { const r = e.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; });
      const bh = await p.$eval('.bm-hiw-bar', e => e.getBoundingClientRect().height);
      await p.screenshot({ timeout: 20000, path: `${OUT}/${which}-${w}-hero.png`, fullPage: true, clip: { x: 0, y: hb.y, width: w, height: hb.h + bh } }).catch(() => console.log('shot fail'));
      await (await p.$('.bm-two-ways')).screenshot({ timeout: 20000, path: `${OUT}/${which}-${w}-twoways.png` }).catch(() => console.log('shot fail'));
    }
  }
  await b.close();
})();
