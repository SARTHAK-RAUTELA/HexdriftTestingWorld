// Find which element overflows the 320px viewport in the variation
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (const v of ['1000257732', '1000257733']) {
    const ctx = await b.newContext({ viewport: { width: 320, height: 700 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto('https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052999.' + v, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(7000);
    const r = await p.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > cw + 0.5 && e.offsetParent)
        .map(e => (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : e.tagName) + ' ' + Math.round(e.getBoundingClientRect().right) + ' "' + (e.textContent || '').trim().slice(0, 30) + '"');
      return { sw: document.documentElement.scrollWidth, over: over.slice(0, 12) };
    });
    console.log(v, JSON.stringify(r, null, 1));
    if (v.endsWith('33')) await p.screenshot({ path: __dirname + '/out/w320-var-header.png', clip: { x: 0, y: 0, width: 330, height: 200 } });
    await ctx.close();
  }
  await b.close();
})();
