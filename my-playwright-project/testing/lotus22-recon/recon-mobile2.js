// Recon (mobile) 2 for Lotus Test 22: tap Pick-up on phone, map the drawer + its time control, per arm/engine.
const { chromium, webkit, devices } = require('@playwright/test');
const path = require('path');
const ARMS = { control: '1000257554', v1: '1000257555', v2: '1000257556' };
(async () => {
  const eng = process.argv[2] === 'webkit' ? webkit : chromium;
  const dev = process.argv[2] === 'webkit' ? devices['iPhone 12'] : devices['Pixel 5'];
  const b = await eng.launch();
  for (const [arm, id] of Object.entries(ARMS)) {
    const ctx = await b.newContext({ ...dev, locale: 'en-US', timezoneId: 'America/New_York' });
    const p = await ctx.newPage();
    await p.goto(`https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.${id}`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(7000);
    await p.addStyleTag({ content: '.ch2{display:none!important}' });
    await p.locator('button:visible', { hasText: 'Pick-up at' }).first().click();
    await p.waitForTimeout(1500);
    const timeBtn = p.locator('button:visible', { hasText: /^\s*(\d{1,2}:\d{2} (AM|PM)|Noon)\s*$/ }).first();
    const tb = await timeBtn.boundingBox();
    await p.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2); // 1st tap: closes calendar (backdrop)
    await p.waitForTimeout(800);
    await p.locator('button:visible', { hasText: /^\s*(\d{1,2}:\d{2} (AM|PM)|Noon)\s*$/ }).first().click();
    await p.waitForTimeout(1500);
    const lists = await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => e.getClientRects().length && e.scrollHeight > e.clientHeight + 20 && /(AM|PM|Noon)/.test(e.textContent) && e.querySelectorAll('button').length > 20)
      .map((e) => { const btns=[...e.querySelectorAll('button')]; const lr=e.getBoundingClientRect(); const sel=btns.find(b=>b.classList.contains('bg-accent'));
        return { cls: e.className.toString().slice(0,120), inPopover: !!e.closest('[data-slot="popover-content"]'), matchesLIST: e.matches('[data-slot="popover-content"] .overflow-y-auto, .max-h-52.overflow-y-auto'), scrollTop: e.scrollTop, h: e.clientHeight, sel: sel && sel.textContent.trim(),
          visible: btns.filter(b=>{const r=b.getBoundingClientRect();return r.bottom>lr.top+2&&r.top<lr.bottom-2;}).map(b=>b.textContent.trim()) }; }));
    console.log(JSON.stringify(lists, null, 1));
    const tag = `${process.argv[2] || 'chromium'}-mobile-${arm}`;
    await p.screenshot({ path: path.join(__dirname, 'out', `${tag}-drawer.png`) });
    const info = await p.evaluate(() => {
      const re = /\d{1,2}:\d{2}\s?(AM|PM)|Noon|Midnight/i;
      const vis = [...document.querySelectorAll('button, select, input, [data-slot]')].filter((e) => e.getClientRects().length && re.test(e.textContent || e.value || ''));
      return vis.slice(0, 12).map((e) => `${e.tagName} slot=${e.getAttribute('data-slot')} txt="${(e.textContent || e.value).trim().slice(0, 50)}" cls="${e.className.toString().slice(0, 90)}"`);
    });
    console.log('==', tag, '\n' + info.join('\n'));
    await ctx.close();
  }
  await b.close();
})();
