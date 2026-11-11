const { chromium, devices } = require('@playwright/test');
const EXP = '100053078', V = '1000257925';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await ctx.newPage();
  const go = async (p) => { await page.goto(`https://www.lotuscarrental.is${p}?cro_mode=qa&_conv_eforce=${EXP}.${V}`, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(exp => window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 20000 }).catch(() => {}); await page.waitForTimeout(2500); await page.addStyleTag({ content: '.ch2{display:none!important}' }); await page.keyboard.press('Escape'); await page.waitForTimeout(500); };
  for (const p of ['/de', '/de/mietwagen-island', '/fr', '/es', '/it']) {
    await go(p);
    const r = await page.evaluate((exp) => ({ url: location.href, lang: document.documentElement.lang, body: document.body.classList.contains('cre-t-28'), exp: window.convert?.currentData?.experiences?.[exp]?.variation?.id || null, allExp: Object.keys(window.convert?.currentData?.experiences || {}) }), EXP);
    console.log(p, JSON.stringify(r));
  }
  // language links
  await go('/');
  console.log('lang links', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + ' ' + l.href))));
  // timing on fresh page
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(() => scrollTo(0, 200)); await page.waitForTimeout(600);
  await page.evaluate(() => { window.__s = []; const t0 = performance.now(); const h = document.querySelector('header.sticky.top-0'); const f = () => { window.__s.push([Math.round(performance.now() - t0), Math.round(scrollY), h.classList.contains('cre-t-28-header-hidden') ? 1 : 0]); if (performance.now() - t0 < 5000) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 650, yDistance: -2500, speed: 1000, gestureSourceType: 'touch', preventFling: false });
  await page.waitForTimeout(2500);
  const s = await page.evaluate(() => window.__s);
  const moves = s.filter((r, i) => i && r[1] !== s[i - 1][1]);
  console.log('samples', s.length, 'firstMove', moves[0], 'lastMove', moves[moves.length - 1], 'firstHide', s.find(r => r[2] === 1));
  console.log('trace', JSON.stringify(s.filter((_, i) => i % 15 === 0)));
  await browser.close();
})();
