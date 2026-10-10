// Recon (sitewide) for Lotus Test 22: which pages render the time widget, and what V2 shows there.
const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const links = require('./out/recon2-chromium-desktop.json').links.filter((l) => l.startsWith('https://www.lotuscarrental.is') && !l.includes('_conv_eforce'));
const Q = 'cro_mode=qa&_conv_eforce=100052922.1000257556';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  const p = await ctx.newPage();
  const rows = { push: (x) => console.log(x) };
  for (const l of links) {
    const u = l + (l.includes('?') ? '&' : '?') + Q;
    try { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 45000 }); } catch (e) { rows.push(`${l} NAV FAIL ${e.message.slice(0, 60)}`); continue; }
    await p.waitForFunction(() => !!window.__lotus22Loaded, null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({
      trig: [...document.querySelectorAll('[data-slot="popover-trigger"]')].filter((t) => /time/i.test(t.textContent)).map((t) => `${t.textContent.trim()}${t.getClientRects().length ? '' : '(hidden)'}`),
      labelled: [...document.querySelectorAll('[data-lotus22-label]')].map((s) => `${s.textContent}<-${s.getAttribute('data-lotus22-label')}${s.closest('[data-slot="popover-trigger"], .max-h-52') ? '' : ' OUTSIDE-WIDGET:' + (s.closest('button')?.outerHTML.slice(0, 120))}`),
      flag: !!window.__lotus22Loaded,
      raw1200: [...document.querySelectorAll('body *')].filter((e) => e.childElementCount === 0 && /12:00\s?PM/i.test(e.textContent)).length,
    }));
    rows.push(`${l.replace('https://www.lotuscarrental.is', '') || '/'} | flag=${r.flag} | trig=${JSON.stringify(r.trig)} | labelled=${JSON.stringify(r.labelled)} | raw12PM=${r.raw1200}`);
  }
  // Search Now flow from homepage
  const p2 = await ctx.newPage();
  await p2.goto('https://www.lotuscarrental.is/?' + Q, { waitUntil: 'domcontentloaded' });
  await p2.waitForFunction(() => !!window.__lotus22Loaded, null, { timeout: 15000 });
  await p2.waitForTimeout(1000);
  await p2.addStyleTag({ content: '.ch2{display:none!important}' });
  await p2.locator('a:visible, button:visible', { hasText: 'Search Now' }).first().click();
  await p2.waitForTimeout(9000);
  await p2.addStyleTag({ content: '.ch2{display:none!important}' });
  await p2.screenshot({ path: path.join(__dirname, 'out', 'v2-search-results.png') });
  const sr = await p2.evaluate(() => ({ url: location.href, trig: [...document.querySelectorAll('[data-slot="popover-trigger"]')].map((t) => t.textContent.trim()).filter(Boolean), times: [...document.querySelectorAll('body *')].filter((e) => e.childElementCount === 0 && /(\d{1,2}:\d{2}|Noon|Midnight)/.test(e.textContent)).map((e) => `${e.tagName}:${e.textContent.trim().slice(0, 50)}`).slice(0, 20) }));
  rows.push('SEARCH RESULTS ' + JSON.stringify(sr, null, 1));
  console.log(rows.join('\n'));
  await b.close();
})();
