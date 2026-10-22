const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  const hits = [];
  page.on('response', async r => { if (r.request().resourceType() !== 'script') return; try { const t = await r.text(); const i = t.indexOf('sub4'); if (i >= 0) hits.push({ url: r.url(), snip: t.slice(Math.max(0, i - 1200), i + 400) }); } catch (e) {} });
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const inline = await page.evaluate(() => [...document.scripts].filter(s => !s.src && /sub4/.test(s.textContent)).map(s => { const t = s.textContent, i = t.indexOf('sub4'); return t.slice(Math.max(0, i - 1200), i + 400); }));
  console.log(JSON.stringify({ hits: hits.map(h => ({ url: h.url, snip: h.snip })), inline }, null, 1).slice(0, 6000));
  await b.close();
})();
