// SWF166 recon: dump listing order, numbers, rating bars, best-overall, modal, links for control vs V1
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const ARMS = { control: '100052988.1000257707', v1: '100052988.1000257708' };
const PAGES = ['/', '/comparison/', '/home/'];

(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const [arm, ef] of Object.entries(ARMS)) {
    for (const p of PAGES) {
      const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
      const page = await ctx.newPage();
      const logs = [];
      page.on('console', m => logs.push(m.type() + ': ' + m.text()));
      page.on('pageerror', e => logs.push('PAGEERROR: ' + e.message));
      const url = `https://rentersinsurancegurus.com${p}?cro_mode=qa&_conv_eforce=${ef}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(6000);
      const data = await page.evaluate(() => {
        const out = { bodyClass: document.body.className.includes('cre-t-166'), href: location.href };
        const tables = [...document.querySelectorAll('[data-unique="comparison-table"]')];
        out.tableCount = tables.length;
        out.tables = tables.map(t => [...t.children].map(c => {
          const cs = getComputedStyle(c);
          const num = c.querySelector('.plan-number');
          return {
            du: c.getAttribute('data-unique'), order: cs.order, top: Math.round(c.getBoundingClientRect().top + scrollY),
            visible: c.offsetParent !== null,
            numText: num && num.textContent.trim(), numAfter: num && getComputedStyle(num, '::after').content,
            rating: [...c.querySelectorAll('.rating-bar')].map(r => ({ cls: r.className, disp: getComputedStyle(r).display, text: r.innerText.trim() })),
            tp: [...c.querySelectorAll('.trustpilot-image')].map(i => i.getAttribute('src')),
            cre77: [...c.querySelectorAll('[crodatalabel]')].map(i => i.getAttribute('crodatalabel') + ' | ' + i.innerText.trim().slice(0, 80)),
            links: [...c.querySelectorAll('a')].map(a => (a.innerText.trim().slice(0, 30) || '[img]') + ' -> ' + a.getAttribute('href')),
            badge: (c.querySelector('.plan-box') || c).innerText.trim().slice(0, 140).replace(/\s+/g, ' '),
          };
        }));
        const bo = document.querySelector('[data-unique="best-overall"]');
        out.bestOverall = bo ? { html: bo.innerText.trim().replace(/\s+/g, ' ').slice(0, 600), kids: [...bo.children].map(c => c.getAttribute('data-unique')),
          links: [...bo.querySelectorAll('a')].map(a => (a.innerText.trim().slice(0, 30) || '[img]') + ' -> ' + a.getAttribute('href')),
          imgs: [...bo.querySelectorAll('img')].map(i => i.getAttribute('alt') + ' ' + i.getAttribute('src')) } : null;
        const m = document.querySelector('.oxy-modal-backdrop');
        out.modal = m ? { html: m.outerHTML.slice(0, 4000) } : null;
        return out;
      });
      data.logs = logs.filter(l => /cre-t|SWF|error|PAGEERROR|TypeError/i.test(l)).slice(0, 40);
      result[`${arm} ${p}`] = data;
      await page.screenshot({ path: path.join(OUT, `${arm}${p.replace(/\//g, '_')}fold.png`) });
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'recon.json'), JSON.stringify(result, null, 2));
  await browser.close();
  console.log('done');
})();
