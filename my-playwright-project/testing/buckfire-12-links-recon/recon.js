// Recon 2026-11-03: Test 12 "link under each story" change — dump Convert exps + rendered markup
const { chromium } = require('@playwright/test');
const urls = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const url of urls) {
    const ctx = await b.newContext(); const page = await ctx.newPage();
    await ctx.addCookies(['cre-t-21-overlay-dismissed','cre-t-21-overlay-shown','cre-t-21-conversion-done'].map(name=>({name,value:'1',domain:'buckfirelaw.com',path:'/'})));
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch(e) { console.log('GOTO ERR', e.message); }
    await page.waitForTimeout(8000);
    const out = await page.evaluate(() => {
      const c = window.convert || {};
      const ex = (c.data && c.data.experiences) || [];
      const cur = c.currentData && c.currentData.experiences;
      const sec = document.querySelector('.buckfire-12-client-stories, .testimonial-card, [class*="testimonial-card"]');
      return {
        body: document.body.className.split(' ').filter(x=>/cre|Buckfire|buckfire/i.test(x)),
        exps: ex.filter(e=>/12|story|stor|testim|video/i.test(e.name||'')).map(e=>({id:e.id,name:e.name,status:e.status,vars:(e.variations||[]).map(v=>v.id+':'+v.name)})),
        current: cur,
        html: sec ? sec.outerHTML.replace(/\s+/g,' ').slice(0,5000) : null,
      };
    });
    console.log('=== ' + url + '\n' + JSON.stringify(out, null, 1));
    await ctx.close();
  }
  await b.close();
})();
