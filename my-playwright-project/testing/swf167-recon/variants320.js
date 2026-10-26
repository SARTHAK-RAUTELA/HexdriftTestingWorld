// Width of the header nav for each copy variant at 320/360/375px
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (const w of [320, 360, 375]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto('https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052999.1000257733', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('.cre-t-167-donations a', { timeout: 30000 }); await p.waitForTimeout(1500);
    const out = [];
    for (const label of ['Contact', 'Donations', 'Donate', 'Giving', 'Help a Pet']) {
      out.push(await p.evaluate(label => { document.querySelector('.cre-t-167-donations a').textContent = label;
        const ul = document.querySelector('.oxy-site-navigation.header-nav ul');
        return label + '=' + Math.round(ul.getBoundingClientRect().right) + '/' + document.documentElement.scrollWidth; }, label));
    }
    console.log(w, out.join('  '));
    await ctx.close();
  }
  await b.close();
})();
