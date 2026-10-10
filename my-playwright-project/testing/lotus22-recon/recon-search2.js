// Recon (search flow 2) for Lotus Test 22: Convert data on booking page; SPA nav from home -> booking per arm.
const { chromium } = require('@playwright/test');
const path = require('path');
const ARMS = { control: '1000257554', v1: '1000257555', v2: '1000257556' };
(async () => {
  const b = await chromium.launch();
  // 2) SPA nav: homepage -> click the visible Search Now -> booking page
  for (const [arm, id] of Object.entries(ARMS)) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
    const p = await ctx.newPage();
    await p.goto(`https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.${id}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.convert && document.querySelector('.ch2'), null, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(4000);
    await p.addStyleTag({ content: '.ch2{display:none!important}' });
    const sn = p.locator('[data-booking-element^="check-fleet"]').filter({ visible: true }).first();
    const html = await sn.evaluate((e) => e.closest('a,button,[role=button]')?.outerHTML.slice(0, 200) || e.outerHTML.slice(0, 200));
    await sn.click();
    await p.waitForURL(/rent-a-car/, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(4000);
    const r = await p.evaluate(() => ({ url: location.href, flag: !!window.__lotus22Loaded, times: [...document.querySelectorAll('button span')].filter((s) => s.getClientRects().length && /^(\d{1,2}:\d{2}\s?(AM|PM)|Noon|Midnight)$/i.test(s.textContent.trim())).map((s) => s.textContent.trim()) }));
    console.log(`SPA ${arm}: el=${html.slice(0, 90)} -> ${r.url} flag=${r.flag} times=${JSON.stringify(r.times)}`);
    await p.screenshot({ path: path.join(__dirname, 'out', `spa-${arm}-booking.png`) });
    // open booking pick-up time list
    const t = p.locator('button:visible').filter({ hasText: /^\s*(\d{1,2}:\d{2} (AM|PM)|Noon)\s*$/ }).first();
    await t.click(); await p.waitForTimeout(1200);
    const lst = await p.evaluate(() => [...document.querySelectorAll('[data-slot="popover-content"] .overflow-y-auto, .max-h-52.overflow-y-auto')].filter((l) => l.getClientRects().length).map((l) => { const lr = l.getBoundingClientRect(); const bs = [...l.querySelectorAll('button')]; return { sel: bs.find((x) => x.classList.contains('bg-accent'))?.textContent.trim(), top: l.scrollTop, vis: bs.filter((x) => { const q = x.getBoundingClientRect(); return q.bottom > lr.top + 2 && q.top < lr.bottom - 2; }).map((x) => x.textContent.trim()) }; }));
    console.log(`   booking list: ${JSON.stringify(lst)}`);
    await p.screenshot({ path: path.join(__dirname, 'out', `spa-${arm}-booking-open.png`) });
    await ctx.close();
  }
  await b.close();
})();
