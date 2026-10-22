// Which affiliate clicks get the site's sub1/sub3/sub4/sub5 attribution rewrite? (affiliate hops stubbed)
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [arm, v] of [['control', '1000257707'], ['v1', '1000257708']]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.route(/go\.rentersinsurancegurus\.com/, r => r.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }));
    await ctx.route(/convertexperiments\.com\/v1\/js\/.*\.js/, async r => { const res = await r.fetch(); let t = await res.text(); t = t.split("window.convert.getUserData().geo.state == 'TX'").join('true'); await r.fulfill({ response: res, body: t }); });
    const page = await ctx.newPage();
    await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052988.' + v, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    await page.evaluate(() => { const m = document.querySelector('.oxy-modal-backdrop'); m.classList.add('live'); m.style.display = 'flex'; });
    await page.waitForTimeout(500);
    const sel = arm === 'v1' ? '.cre-t-166-button-container a' : '.oxy-modal-backdrop p.button-container a';
    const [req] = await Promise.all([ctx.waitForEvent('request', { predicate: r => /go\.rentersinsurancegurus/.test(r.url()), timeout: 8000 }).catch(() => null), page.locator(sel).click()]);
    out[arm + '-modal'] = req && req.url();
    out[arm + '-modal-attrs'] = await page.evaluate(s => { const a = document.querySelector(s); return a && [...a.attributes].map(x => x.name + '=' + x.value); }, sel);
    // find the rewriter
    out.rewriter = await page.evaluate(() => [...document.scripts].map(s => s.src || s.textContent).filter(t => /sub3|sub4|sub5/.test(t)).map(t => t.length > 300 ? (t.match(/.{0,300}sub4.{0,300}/s) || [t.slice(0, 300)])[0] : t));
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
