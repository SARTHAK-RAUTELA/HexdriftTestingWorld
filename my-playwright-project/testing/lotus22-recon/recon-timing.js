// Recon (timing) for Lotus Test 22: when do Convert scripts load vs DCL/load, and when does V2 apply.
const { chromium, webkit } = require('@playwright/test');
const eng = process.argv[2] === 'webkit' ? webkit : chromium;
(async () => {
  const b = await eng.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  const p = await ctx.newPage();
  const t0 = Date.now();
  const ev = [];
  p.on('request', (r) => { if (/convert|cdn-4|conv|gtm|googletagmanager|cookiehub/i.test(r.url())) ev.push(`${Date.now() - t0}ms REQ ${r.url().slice(0, 110)}`); });
  p.on('domcontentloaded', () => ev.push(`${Date.now() - t0}ms DOMContentLoaded`));
  p.on('load', () => ev.push(`${Date.now() - t0}ms load`));
  await p.goto('https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257556', { waitUntil: 'domcontentloaded' });
  for (let k = 0; k < 120; k++) {
    if (await p.evaluate(() => !!window.__lotus22Loaded).catch(() => false)) { ev.push(`${Date.now() - t0}ms V2 script ran`); break; }
    await p.waitForTimeout(100);
  }
  const scripts = await p.evaluate(() => [...document.scripts].filter((s) => /convert|conv/i.test(s.src + s.textContent.slice(0, 300))).map((s) => `src=${s.src.slice(0, 100)} async=${s.async} defer=${s.defer} inHead=${!!s.closest('head')} strategy=${s.getAttribute('data-nscript')}`));
  console.log(ev.join('\n')); console.log('--- convert script tags\n' + scripts.join('\n'));
  await b.close();
})();
