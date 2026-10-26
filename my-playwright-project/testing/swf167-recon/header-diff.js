// Compare control vs variation header geometry at the breakpoints the variation CSS touches
const { chromium } = require('@playwright/test');
const U = v => `https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052999.${v}`;
(async () => {
  const b = await chromium.launch();
  for (const w of [320, 360, 700, 1000, 1440]) {
    const row = {};
    for (const [arm, v] of [['ctrl', '1000257732'], ['var', '1000257733']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 768, hasTouch: w < 768 });
      const p = await ctx.newPage();
      await p.goto(U(v), { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(7000);
      row[arm] = await p.evaluate(() => {
        const logo = document.querySelector('.oxy-header-left img');
        const lis = [...document.querySelectorAll('.oxy-site-navigation.header-nav ul > li')].filter(l => l.offsetParent && l.textContent.trim());
        return { logoW: logo && Math.round(logo.getBoundingClientRect().width), margins: lis.map(l => getComputedStyle(l).marginRight).join(','),
          fs: lis.map(l => getComputedStyle(l.querySelector('a') || l).fontSize).join(','), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
      });
      await ctx.close();
    }
    console.log(w, JSON.stringify(row));
  }
  await b.close();
})();
