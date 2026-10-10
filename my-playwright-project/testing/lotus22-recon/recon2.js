// Recon 2 for Lotus Test 22: open each time popover, record options / selected / scroll, plus internal links.
const { chromium, webkit, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ARMS = {
  control: 'https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257554',
  v1: 'https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257555',
  v2: 'https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257556',
};
const OUT = path.join(__dirname, 'out');

const dumpPopover = () => {
  const lists = [...document.querySelectorAll('[data-slot="popover-content"] .overflow-y-auto, .max-h-52.overflow-y-auto')]
    .filter((l) => l.getClientRects().length);
  return lists.map((list) => {
    const lr = list.getBoundingClientRect();
    const btns = [...list.querySelectorAll('button')];
    const sel = btns.find((b) => b.classList.contains('bg-accent'));
    const visibleTexts = btns.filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > lr.top + 2 && r.top < lr.bottom - 2; }).map((b) => b.textContent.trim());
    return {
      count: btns.length, first: btns.slice(0, 3).map((b) => b.textContent.trim()), last: btns.slice(-2).map((b) => b.textContent.trim()),
      selected: sel ? sel.textContent.trim() : null, selectedCls: sel ? sel.className : null,
      scrollTop: list.scrollTop, clientHeight: list.clientHeight, scrollHeight: list.scrollHeight,
      visibleTexts, listCls: list.className, popoverHtml: list.closest('[data-slot="popover-content"]')?.outerHTML.slice(0, 1500),
    };
  });
};

(async () => {
  const engineName = process.argv[2] || 'chromium';
  const mobile = process.argv[3] === 'mobile';
  const engine = engineName === 'webkit' ? webkit : chromium;
  const browser = await engine.launch();
  const result = {};
  for (const [arm, url] of Object.entries(ARMS)) {
    const devOpts = mobile ? (engineName === 'webkit' ? devices['iPhone 12'] : devices['Pixel 5']) : { viewport: { width: 1440, height: 900 } };
    const ctx = await browser.newContext({ ...devOpts, locale: 'en-US', timezoneId: 'America/New_York' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    await page.addStyleTag({ content: '.ch2{display:none!important}' });
    const tag = `${engineName}-${mobile ? 'mobile' : 'desktop'}-${arm}`;
    result[arm] = { triggers: await page.locator('[data-slot="popover-trigger"]').allTextContents() };
    for (const label of ['Pick-up time', 'Drop-off time']) {
      const trig = page.locator('[data-slot="popover-trigger"]', { hasText: label }).first();
      if (!(await trig.count())) { result[arm][label] = 'NO TRIGGER'; continue; }
      await trig.scrollIntoViewIfNeeded();
      await trig.click();
      await page.waitForTimeout(1200);
      result[arm][label] = await page.evaluate(dumpPopover);
      await page.screenshot({ path: path.join(OUT, `${tag}-${label.split(' ')[0]}-open.png`) });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    if (arm === 'control' && !mobile) {
      result.links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.includes('lotuscarrental.is')).map((h) => h.split('#')[0]))]);
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, `recon2-${engineName}-${mobile ? 'mobile' : 'desktop'}.json`), JSON.stringify(result, null, 2));
  for (const arm of Object.keys(ARMS)) {
    const r = result[arm];
    console.log('==', arm, JSON.stringify(r.triggers));
    for (const l of ['Pick-up time', 'Drop-off time']) {
      const p = r[l];
      if (!Array.isArray(p)) { console.log(l, p); continue; }
      p.forEach((x) => console.log(` ${l}: n=${x.count} first=${x.first} sel=${x.selected} scrollTop=${x.scrollTop}/${x.scrollHeight} h=${x.clientHeight} visible=[${x.visibleTexts.join(', ')}]`));
      if (!p.length) console.log(` ${l}: no visible list`);
    }
  }
  if (result.links) console.log('links', result.links.length, result.links.join('\n'));
  await browser.close();
})();
