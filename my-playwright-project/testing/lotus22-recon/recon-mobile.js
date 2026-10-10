// Recon (mobile) for Lotus Test 22: find the visible booking/time controls on a phone viewport.
const { chromium, devices } = require('@playwright/test');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['Pixel 5'], locale: 'en-US', timezoneId: 'America/New_York' });
  const p = await ctx.newPage();
  await p.goto('https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257556', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(7000);
  await p.addStyleTag({ content: '.ch2{display:none!important}' });
  await p.screenshot({ path: path.join(__dirname, 'out', 'mobile-v2-home.png') });
  const vis = await p.evaluate(() => [...document.querySelectorAll('button, a, input, [role]')].filter((e) => e.getClientRects().length && e.getBoundingClientRect().top < 900)
    .map((e) => `${e.tagName} slot=${e.getAttribute('data-slot')} role=${e.getAttribute('role')} txt="${(e.textContent || '').trim().slice(0, 60)}" y=${Math.round(e.getBoundingClientRect().top)}`));
  console.log(vis.join('\n'));
  const trig = await p.evaluate(() => [...document.querySelectorAll('[data-slot="popover-trigger"]')].map((t) => `${t.textContent.trim()} visible=${!!t.getClientRects().length} parentHidden=${t.closest('.hidden,[hidden]')?.className?.slice(0,80)}`));
  console.log('--- triggers\n' + trig.join('\n'));
  await b.close();
})();
