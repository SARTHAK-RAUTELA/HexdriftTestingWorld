// Recon (race) for Lotus Test 22: sample V2 field text over time on N fresh loads to measure relabel reliability.
const { chromium, webkit } = require('@playwright/test');
const eng = process.argv[2] === 'webkit' ? webkit : chromium;
const N = +(process.argv[3] || 6);
(async () => {
  const b = await eng.launch();
  for (let i = 0; i < N; i++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
    const p = await ctx.newPage();
    const t0 = Date.now();
    await p.goto('https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257556', { waitUntil: 'domcontentloaded' });
    const samples = [];
    for (let k = 0; k < 12; k++) {
      samples.push(await p.evaluate(() => {
        const t = [...document.querySelectorAll('[data-slot="popover-trigger"]')].find((x) => /Pick-up time/.test(x.textContent));
        return `${t ? t.textContent.replace('Pick-up time', '') : '-'}${window.__lotus22Loaded ? '*' : ''}`;
      }).catch(() => 'ERR'));
      await p.waitForTimeout(1000);
    }
    console.log(`load ${i + 1} (${process.argv[2] || 'chromium'}): ${samples.join(' | ')}  [* = V2 script loaded]`);
    await ctx.close();
  }
  await b.close();
})();
