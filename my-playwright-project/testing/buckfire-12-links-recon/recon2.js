// Dump only the JS of the active Test-12-family experiments + rendered component, for given URLs
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (const url of process.argv.slice(2)) {
    const ctx = await b.newContext(); const page = await ctx.newPage();
    await ctx.addCookies(['cre-t-21-overlay-dismissed','cre-t-21-overlay-shown','cre-t-21-conversion-done'].map(name=>({name,value:'1',domain:'buckfirelaw.com',path:'/'})));
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch(e) { console.log('GOTO ERR', e.message); }
    await page.waitForTimeout(8000);
    const out = await page.evaluate(() => {
      const cur = (window.convert && window.convert.currentData && window.convert.currentData.experiences) || {};
      const exps = {};
      for (const [id, e] of Object.entries(cur)) {
        const js = ((e.variation && e.variation.changes) || []).map(c => (c.data && c.data.js) || '').join('\n');
        exps[id] = { var: e.variation && e.variation.id, name: e.variation && e.variation.name, hasStory: /storyUrl|Full Story|client-stories/i.test(js),
          js: /storyUrl|Full Story|client-stories|testimonial/i.test(js) ? js : '(other)' };
      }
      const comp = document.querySelector('.buckfire-12-client-stories, [class*="testimonial-card"]');
      return { body: document.body.className.split(' ').filter(x=>/cre-t|Buckfire/i.test(x)), exps,
        links: [...document.querySelectorAll('a')].filter(a=>/full story/i.test(a.textContent)).map(a=>a.textContent.trim()+' -> '+a.href),
        comp: comp ? comp.outerHTML.replace(/\s+/g,' ').slice(0,2500) : null };
    });
    console.log('=== ' + url + '\nbody: ' + out.body + '\nlinks: ' + JSON.stringify(out.links, null, 1) + '\ncomp: ' + out.comp);
    for (const [id, e] of Object.entries(out.exps)) console.log(`-- exp ${id} var ${e.var} ${e.name} story=${e.hasStory}\n${e.js === '(other)' ? '' : e.js.slice(0, 9000)}`);
    await ctx.close();
  }
  await b.close();
})();
