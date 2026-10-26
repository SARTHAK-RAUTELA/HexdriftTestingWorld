// Visual + DOM recon of SWF167 control/variation on desktop and mobile, all target URLs
const { chromium, devices } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out');
const EXP = '100052999', CTRL = '1000257732', VAR = '1000257733';
(async () => {
  const b = await chromium.launch();
  // 1. which code mentions the goal ids?
  {
    const p = await (await b.newContext()).newPage();
    await p.goto('https://petinsurancegurus.com/?cro_mode=qa', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4000);
    const hits = await p.evaluate(() => {
      const s = JSON.stringify(window.convert.data); const out = {};
      for (const id of ['100034508', '100038337']) { const r = []; let i = -1; while ((i = s.indexOf(id, i + 1)) !== -1) r.push(s.slice(Math.max(0, i - 160), i + 40)); out[id] = r; }
      const ex = window.convert.data.experiences; const arr = Array.isArray(ex) ? ex : Object.values(ex);
      out.activeOnPIG = arr.filter(e => e.status === 'active').map(e => e.id + ' ' + (e.goals || []).join(','));
      return out;
    });
    fs.writeFileSync(path.join(OUT, 'goal-hits.json'), JSON.stringify(hits, null, 1));
    console.log('goal-hit counts', Object.fromEntries(Object.entries(hits).map(([k, v]) => [k, v.length])));
    await p.close();
  }
  // 2. /compare/ status
  for (const u of ['/', '/home/', '/comparison/', '/compare/']) {
    const r = await (await b.newContext()).request.get('https://petinsurancegurus.com' + u, { maxRedirects: 0 }).catch(e => null);
    console.log('status', u, r && r.status(), r && r.headers().location);
  }
  // 3. render
  for (const [dname, dev] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', devices['iPhone 12']]]) {
    for (const [arm, vid] of [['control', CTRL], ['variation', VAR]]) {
      const ctx = await b.newContext({ ...dev }); const p = await ctx.newPage();
      await p.goto(`https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=${EXP}.${vid}`, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(7000);
      await p.evaluate(() => document.querySelectorAll('.cre-t-133-overlay').forEach(e => e.remove()));
      const info = await p.evaluate(() => {
        const navs = [...document.querySelectorAll('.oxy-site-navigation')].map(n => ({
          cls: n.className, visible: !!n.offsetParent || getComputedStyle(n).display !== 'none',
          items: [...n.querySelectorAll('li.menu-item > a, li > a')].map(a => a.textContent.trim() + ' -> ' + a.getAttribute('href') + (a.offsetParent ? '' : ' [hidden]')),
        }));
        const faq = [...document.querySelectorAll('.faq-container .oxy-pro-accordion_item')].slice(0, 3).map(i => i.className + ' | ' + i.querySelector('h4,.oxy-pro-accordion_title')?.textContent.trim());
        const hdr = document.querySelector('.cre-t-167-accordion_header'); const nat = document.querySelector('.faq-container .oxy-pro-accordion_item:not(.cre-t-167-accordion_item) .oxy-pro-accordion_header');
        const st = el => el && (s => ({ fs: s.fontSize, tt: s.textTransform, ls: s.letterSpacing, pad: s.padding, color: s.color, ff: s.fontFamily.slice(0, 30), h: el.offsetHeight }))(getComputedStyle(el));
        const ttl = el => el && st(el.querySelector('.oxy-pro-accordion_title'));
        const body = document.querySelector('.cre-t-167-accordion_body');
        return { bodyCls: document.body.className.split(' ').filter(c => /cre-t|swf/i.test(c)), navs, faq,
          newHdr: st(hdr), natHdr: st(nat), newTitle: ttl(hdr), natTitle: ttl(nat),
          newBodyDisplay: body && getComputedStyle(body).display,
          conv_v: document.cookie.split('; ').find(c => c.startsWith('_conv_v')) };
      });
      console.log('\n==', dname, arm, JSON.stringify(info, null, 1));
      await p.screenshot({ path: path.join(OUT, `${dname}-${arm}-top.png`) });
      const faqEl = p.locator('.faq-container').first();
      if (await faqEl.count()) { await faqEl.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, `${dname}-${arm}-faq.png`) }); }
      await ctx.close();
    }
  }
  await b.close();
})();
