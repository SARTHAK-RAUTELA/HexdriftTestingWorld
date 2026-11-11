const { chromium } = require('@playwright/test');
const urls = [
  ['cat', 'https://petinsurancegurus.com/cat-insurance/'],
  ['cat-optout', 'https://petinsurancegurus.com/cat-insurance/?convert_optout=1'],
  ['home', 'https://petinsurancegurus.com/'],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, url] of urls) {
    const ctx = await b.newContext({ viewport: { width: 1920, height: 1000 } });
    if (name.includes('optout')) await ctx.addCookies([{ name: 'convert_optout', value: '1', domain: '.petinsurancegurus.com', path: '/' }]);
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForTimeout(9000);
    const r = await p.evaluate(() => {
      const out = {};
      const c = window.convert || {};
      try { out.convertExps = JSON.stringify(c.currentData && c.currentData.experiences || c.currentData || null).slice(0, 1500); } catch (e) { out.convertExps = 'err ' + e.message; }
      out.cookies = document.cookie.split(';').filter(x => /conv/.test(x)).map(x => x.trim().slice(0, 300));
      out.bodyCls = document.body.className;
      out.htmlCls = document.documentElement.className;
      out.creNodes = [...new Set([...document.querySelectorAll('[class*="cre-t"],[class*="SWF"],[class*="swf"]')].flatMap(e => [...e.classList].filter(k => /cre-t|swf/i.test(k))))];
      out.styleIds = [...document.querySelectorAll('style')].map(s => (s.id || '') + ':' + s.textContent.length + ':' + s.textContent.slice(0, 80).replace(/\s+/g, ' '));
      const box = [...document.querySelectorAll('.plan-box')].find(x => x.offsetParent);
      if (box) {
        const walk = (el, d) => d > 4 ? [] : [...el.children].flatMap(ch => {
          const r = ch.getBoundingClientRect(); const cs = getComputedStyle(ch);
          return [`${'  '.repeat(d)}${ch.tagName}.${[...ch.classList].join('.')} x=${Math.round(r.x)} w=${Math.round(r.width)} h=${Math.round(r.height)} disp=${cs.display} flex=${cs.flex} order=${cs.order}`, ...walk(ch, d + 1)];
        });
        out.tree = walk(box, 0).filter(l => !/^\s{8}/.test(l)).slice(0, 60);
      }
      return out;
    });
    console.log('=== ' + name + ' ' + url); console.log(JSON.stringify(r, null, 1));
    await p.screenshot({ path: `C:/Users/SARTHA~1/AppData/Local/Temp/claude/34c241cda7efc078/1c8044c7-a0bf-4985-846e-0173d46440cb/scratchpad/${name}.png` });
    await ctx.close();
  }
  await b.close();
})();
