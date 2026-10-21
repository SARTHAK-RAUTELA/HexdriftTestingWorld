const { chromium, webkit, devices } = require('playwright');
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_force_tracking=true&optimizely_x=5442504495988736';
(async () => {
  const which = process.argv[2] || 'chromium';
  const b = await (which === 'webkit' ? webkit : chromium).launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => {
    window.__calls = [];
    const orig = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (o) {
      window.__calls.push([Math.round(performance.now()), this.tagName, this.placeholder || this.className.toString().slice(0, 30), this.isConnected]);
      const r = orig.call(this, o);
      window.__calls.push(['after', document.activeElement === this, document.activeElement.tagName]);
      return r;
    };
    document.addEventListener('focusin', e => window.__calls.push(['focusin', e.target.placeholder || e.target.tagName]), true);
    document.addEventListener('focusout', e => window.__calls.push(['focusout', e.target.placeholder || e.target.className.toString().slice(0, 30)]), true);
  });
  await p.locator('.bm-two-ways__signup').scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.mouse.click(...(await (async () => { const bb = await p.locator('.bm-two-ways__signup').boundingBox(); return [bb.x + bb.width / 2, bb.y + 10]; })()));
  await p.waitForTimeout(2500);
  console.log(which, JSON.stringify(await p.evaluate(() => ({ calls: window.__calls, active: document.activeElement.tagName + ' ' + (document.activeElement.placeholder || ''), y: scrollY }))));
  await b.close();
})();
