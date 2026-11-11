const { chromium, devices } = require('@playwright/test');
const EXP = '100053078', V = '1000257925';
const st = (page) => page.evaluate(() => { const h = document.querySelector('header.sticky.top-0'); return { y: Math.round(scrollY), hidden: h.classList.contains('cre-t-28-header-hidden'), top: Math.round(h.getBoundingClientRect().top) }; });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await ctx.newPage();
  const go = async (p) => { await page.goto(`https://www.lotuscarrental.is${p}?cro_mode=qa&_conv_eforce=${EXP}.${V}`, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(exp => window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 30000 }).catch(() => {}); await page.waitForTimeout(2500); await page.addStyleTag({ content: '.ch2{display:none!important}' }); await page.keyboard.press('Escape'); await page.waitForTimeout(500); };
  await go('/');
  // menu structure
  await page.evaluate(() => scrollTo(0, 1500)); await page.waitForTimeout(300); await page.evaluate(() => scrollTo(0, 1400)); await page.waitForTimeout(400);
  await page.locator('header button[aria-label="Open menu"]').click(); await page.waitForTimeout(1000);
  const m = await page.evaluate(() => { const close = [...document.querySelectorAll('button')].find(b => /close/i.test(b.getAttribute('aria-label') || '') && b.getClientRects().length); let el = close, chain = []; while (el && el !== document.body) { chain.push(el.tagName + '.' + (el.className.baseVal ?? el.className).toString().split(' ').slice(0, 4).join('.') + (el.getAttribute('role') ? '[role=' + el.getAttribute('role') + ']' : '') + (el.hasAttribute('data-open') ? '[data-open]' : '') + (el.getAttribute('data-state') ? '[data-state=' + el.getAttribute('data-state') + ']' : '')); el = el.parentElement; } return { chain, inHeader: !!close?.closest('header'), overflow: getComputedStyle(document.body).overflow + '/' + getComputedStyle(document.documentElement).overflow }; });
  console.log('menu', JSON.stringify(m, null, 1));
  console.log('before scroll in menu', JSON.stringify(await st(page)));
  // user swipes up on menu (touch) -> does page scroll beneath?
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -400, speed: 800, gestureSourceType: 'touch' });
  await page.waitForTimeout(800);
  console.log('after swipe in menu', JSON.stringify(await st(page)));
  await page.screenshot({ path: 'testing/lotus28-recon/menu-after-swipe.png' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  // debounce timing: long continuous touch scroll, sample header state during
  await page.evaluate(() => scrollTo(0, 200)); await page.waitForTimeout(600);
  await page.evaluate(() => { window.__s = []; const t0 = performance.now(); const h = document.querySelector('header.sticky.top-0'); const f = () => { window.__s.push([Math.round(performance.now() - t0), Math.round(scrollY), h.classList.contains('cre-t-28-header-hidden') ? 1 : 0]); if (performance.now() - t0 < 4000) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -2000, speed: 800, gestureSourceType: 'touch', repeatCount: 1 });
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => window.__s);
  const firstMove = s.find(r => r[1] > 215), firstHide = s.find(r => r[2] === 1), lastMove = [...s].reverse().find((r, i, a) => a[i + 1] && a[i + 1][1] !== r[1]);
  console.log('timing: firstMove', firstMove, 'firstHide', firstHide, 'scroll still moving until ~', s.filter((r, i) => i && r[1] !== s[i - 1][1]).pop());
  await page.screenshot({ path: 'testing/lotus28-recon/after-gesture.png' });
  // sticky crawl across pages
  for (const p of ['/our-rental-cars', '/our-rental-cars/4x4', '/insurance', '/faq', '/blog', '/contact', '/about-us/driving-in-iceland', '/rent-a-car-in-iceland/keflavik-airport', '/our-services/airport-shuttle', '/de']) {
    await go(p);
    const r = await page.evaluate(async () => {
      const out = new Set();
      for (const y of [0, 600, 1500, 3000]) { scrollTo(0, y); await new Promise(r => setTimeout(r, 250));
        [...document.querySelectorAll('body *')].forEach(el => { const s = getComputedStyle(el); if ((s.position === 'sticky' || s.position === 'fixed') && el.getClientRects().length && !el.closest('.ch2') && el.tagName !== 'HEADER') out.add(el.tagName + ' ' + s.position + ' top=' + s.top + ' h=' + Math.round(el.getBoundingClientRect().height) + ' ' + (el.className.baseVal ?? el.className).toString().slice(0, 70)); }); }
      return { body: document.body.classList.contains('cre-t-28'), header: !!document.querySelector('header.sticky.top-0'), docH: document.documentElement.scrollHeight, sticky: [...out] };
    });
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(400);
    const a = await st(page);
    await page.evaluate(() => scrollTo(0, 600)); await page.waitForTimeout(400);
    const b = await st(page);
    console.log(p, JSON.stringify(r), 'down', JSON.stringify(a), 'up', JSON.stringify(b));
  }
  await browser.close();
})();
