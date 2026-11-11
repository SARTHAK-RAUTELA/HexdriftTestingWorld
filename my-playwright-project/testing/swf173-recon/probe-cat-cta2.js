const { chromium } = require('@playwright/test');
const cases = [
  ['plain', 'https://petinsurancegurus.com/cat-insurance/', false],
  ['randomQS', 'https://petinsurancegurus.com/cat-insurance/?x=' + Date.now(), false],
  ['optoutCookieOnly', 'https://petinsurancegurus.com/cat-insurance/', true],
  ['dog', 'https://petinsurancegurus.com/dog-insurance/', false],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, url, cookie] of cases) {
    const ctx = await b.newContext({ viewport: { width: 1920, height: 1000 } });
    if (cookie) await ctx.addCookies([{ name: 'convert_optout', value: '1', domain: '.petinsurancegurus.com', path: '/' }]);
    const p = await ctx.newPage();
    const resp = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    const html = await resp.text();
    await p.waitForTimeout(6000);
    const r = await p.evaluate(() => {
      const rc = document.querySelector('.plan-col-2-repeater-container');
      const d = document.querySelector('.plan-description-container');
      const csr = rc && getComputedStyle(rc), csd = d && getComputedStyle(d);
      const used = document.getElementById('wpr-usedcss');
      // find rules mentioning the selectors in the full sheets
      return {
        hasUsedCss: !!used,
        rc: rc && { dir: csr.flexDirection, wrap: csr.flexWrap, w: rc.offsetWidth },
        desc: d && { w: d.offsetWidth, maxW: csd.maxWidth, width: csd.width, flex: csd.flex },
        usedMentions: used ? (used.textContent.match(/[^}]*plan-(col-2-repeater-container|description-container|button-container)[^}]*\}/g) || []).slice(0, 10) : null,
      };
    });
    console.log('=== ' + name, 'cache hdrs:', JSON.stringify({ cf: resp.headers()['cf-cache-status'], age: resp.headers()['age'], xc: resp.headers()['x-cache'] }), 'rocket-comment:', (html.match(/<!--[^>]*(Rocket|rocket)[^>]*-->/g) || []).join(' | ').slice(0, 300));
    console.log(JSON.stringify(r, null, 1));
    await ctx.close();
  }
  await b.close();
})();
