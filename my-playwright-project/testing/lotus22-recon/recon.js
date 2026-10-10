// Recon for Lotus Car Rental Test 22: dumps the time selector DOM + defaults per arm.
const { chromium, webkit } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ARMS = {
  control: 'https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257554',
  v1: 'https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257555',
  v2: 'https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052922.1000257556',
};
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const engine = process.argv[2] === 'webkit' ? webkit : chromium;
  const browser = await engine.launch();
  for (const [arm, url] of Object.entries(ARMS)) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', timezoneId: 'America/New_York' });
    const page = await ctx.newPage();
    const logs = [];
    page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const info = await page.evaluate(() => {
      const re = /\d{1,2}:\d{2}\s?(AM|PM)|Noon|Midnight/i;
      const els = [...document.querySelectorAll('button, input, select, [role="combobox"]')]
        .filter((b) => re.test(b.textContent || b.value || ''))
        .map((b) => ({ tag: b.tagName, text: (b.textContent || b.value).trim().slice(0, 80), cls: b.className.toString().slice(0, 160), html: b.outerHTML.slice(0, 600) }));
      return {
        url: location.href,
        title: document.title,
        convert: typeof window.convert !== 'undefined',
        lotusFlag: window.__lotus22Loaded || null,
        timeEls: els,
        labelled: [...document.querySelectorAll('[data-lotus22-label]')].map((s) => s.textContent),
      };
    });
    await page.screenshot({ path: path.join(OUT, `${arm}-home.png`) });
    fs.writeFileSync(path.join(OUT, `${arm}-info.json`), JSON.stringify({ info, logs: logs.slice(0, 80) }, null, 2));
    fs.writeFileSync(path.join(OUT, `${arm}-body.html`), await page.content());
    console.log(arm, JSON.stringify(info.timeEls.map((e) => e.text)), 'convert:', info.convert, 'flag:', info.lotusFlag, 'labelled:', info.labelled);
    await ctx.close();
  }
  await browser.close();
})();
