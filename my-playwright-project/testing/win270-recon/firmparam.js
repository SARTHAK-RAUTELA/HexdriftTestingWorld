// ?firmness= URL param vs the cre-t-270-firmness session cookie, per arm.
const { chromium, webkit } = require('playwright');
const [engine = 'chromium'] = process.argv.slice(2);
const base = (v) => `https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.${v}`;
(async () => {
  const b = await (engine === 'webkit' ? webkit : chromium).launch();
  const run = async (label, url, cookie) => {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    if (cookie) await ctx.addCookies([{ name: 'cre-t-270-firmness', value: cookie, domain: 'www.winkbeds.com', path: '/' }]);
    const p = await ctx.newPage();
    await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForSelector('.order-form.loaded', { timeout: 40000 }); await p.waitForTimeout(6000);
    console.log(label, JSON.stringify(await p.evaluate(() => ({ select: document.querySelector('#firmness-select').value,
      panel: document.querySelector('.cre-t-270-firm-name') && document.querySelector('.cre-t-270-firm-name').textContent,
      badge: document.querySelector('.cre-t-270-firm-badge') && document.querySelector('.cre-t-270-firm-badge').textContent,
      bullet: document.querySelector('.cre-t-270-firm-bullet') && document.querySelector('.cre-t-270-firm-bullet').textContent,
      price: document.querySelector('.order-form').innerText.match(/\$[\d,]+/g).slice(0, 2) }))));
    await ctx.close();
  };
  await run('control  ?firmness=plus          ', base('1003185232') + '&firmness=plus');
  await run('variation ?firmness=plus          ', base('1003185233') + '&firmness=plus');
  await run('variation ?firmness=softer        ', base('1003185233') + '&firmness=softer');
  await run('variation ?firmness=plus +cookie=Firmer', base('1003185233') + '&firmness=plus', 'Firmer');
  await run('variation ?firmness=luxuryfirm +cookie=Plus', base('1003185233') + '&firmness=luxuryfirm', 'Plus');
  await b.close();
})();
