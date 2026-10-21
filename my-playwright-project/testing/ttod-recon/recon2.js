const { chromium, webkit } = require('playwright');
const OUT = __dirname + '/resp';
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_x=5442504495988736&optimizely_force_tracking=true';
(async () => {
  const which = process.argv[2] || 'chromium';
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('.bm-two-ways', { timeout: 60000 });
  await p.waitForTimeout(3000);
  for (const w of [320, 375, 390, 414, 768, 820, 1024, 1025, 1100, 1180, 1280, 1440, 1920]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const over = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > de.clientWidth + 1 && getComputedStyle(e).position !== 'fixed'; })
        .slice(0, 6).map(e => (e.className || e.tagName).toString().slice(0, 50) + ' r=' + Math.round(e.getBoundingClientRect().right));
      const box = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.width), Math.round(b.height)]; };
      const cs = (s, props) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return props.map(p => c[p]).join(' | '); };
      return {
        sw: de.scrollWidth, cw: de.clientWidth, over,
        heroInner: box('[class*="pro-signup-hero_heroInner"]'), heroImg: box('[class*="pro-signup-hero_heroImage"]'),
        title: cs('[class*="pro-signup-hero_heroTitle"]', ['fontSize', 'fontWeight', 'textAlign']),
        input: cs('[class*="pro-signup-hero_searchFields"] input', ['backgroundColor', 'borderTopColor', 'borderTopWidth']),
        inputWrap: (() => { const i = document.querySelector('[class*="pro-signup-hero_searchFields"] input'); if (!i) return null; let e = i; const out = []; for (let k = 0; k < 4; k++) { e = e.parentElement; const c = getComputedStyle(e); out.push(c.borderTopWidth + ' ' + c.borderTopColor + ' bg ' + c.backgroundColor); } return out; })(),
        footAlign: cs('[class*="pro-signup-hero_footnote"]', ['textAlign']),
        bar: box('.bm-hiw-bar__btn'), cards: box('.bm-two-ways__cards'),
        cardTops: [...document.querySelectorAll('.bm-two-ways__card')].map(c => Math.round(c.getBoundingClientRect().top)),
        twTitle: cs('.bm-two-ways__title', ['fontSize', 'fontFamily']), signup: box('.bm-two-ways__signup'),
      };
    });
    console.log(w, JSON.stringify(r));
    if ([375, 768, 1024, 1100, 1440].includes(w)) {
      const hero = await p.$('[class*="pro-signup-hero_heroSection"]');
      await hero.scrollIntoViewIfNeeded();
      const hb = await hero.boundingBox(); const bb = await (await p.$('.bm-hiw-bar')).boundingBox();
      await p.screenshot({ timeout: 20000, path: `${OUT}/${which}-${w}-hero.png`, fullPage: true, clip: { x: 0, y: hb.y + (await p.evaluate(() => scrollY)), width: w, height: hb.height + bb.height } }).catch(()=>console.log('shot fail'));
      await (await p.$('.bm-two-ways')).screenshot({ timeout: 20000, path: `${OUT}/${which}-${w}-twoways.png` }).catch(()=>console.log('shot fail'));
    }
  }
  await b.close();
})();
