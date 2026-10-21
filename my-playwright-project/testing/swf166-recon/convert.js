const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const page = await ctx.newPage();
  const logs = []; page.on('console', m => logs.push(m.type() + ': ' + m.text()));
  const reqs = []; page.on('response', r => { if (r.status() >= 400 || /convert|conv/i.test(r.url())) reqs.push(r.status() + ' ' + r.url().slice(0, 160)); });
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052988.1000257708', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const d = await page.evaluate(() => {
    const o = {};
    try { const c = window.convert; o.keys = c ? Object.keys(c).slice(0, 40) : null;
      const data = c && (c.data || c.currentData);
      o.hasExp = JSON.stringify(window.convert?.data?.experiences || {}).includes('100052988');
      const exps = (c.data && c.data.experiences) || [];
      const e = (Array.isArray(exps) ? exps : Object.values(exps)).find(x => String(x.id) === '100052988');
      o.exp = e ? JSON.stringify(e).slice(0, 3000) : null;
      o.current = JSON.stringify(c.currentData || c.historicalData || {}).slice(0, 1500);
    } catch (e) { o.err = e.message; }
    o.cookies = document.cookie.split(';').filter(x => /conv/i.test(x)).map(x => x.trim().slice(0, 300));
    return o;
  });
  console.log(JSON.stringify(d, null, 1));
  console.log(reqs.join('\n'));
  console.log(logs.filter(l => /conv|cre|166/i.test(l)).join('\n'));
  await b.close();
})();
