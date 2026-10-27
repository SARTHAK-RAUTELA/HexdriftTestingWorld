// Realistic explore flow: user scrolls to the explore block, then clicks each option; track where the content lands.
const { chromium, webkit, devices } = require('playwright');
const [engine = 'chromium', form = 'desktop'] = process.argv.slice(2);
(async () => {
  const b = await (engine === 'webkit' ? webkit : chromium).launch();
  const dev = form === 'mobile' ? devices[engine === 'webkit' ? 'iPhone 12' : 'Pixel 5'] : { viewport: { width: 1280, height: 720 } };
  const p = await (await b.newContext(dev)).newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto('https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro270mode&_conv_eforce=100350850.1003185233', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('.cre-t-270-explore', { timeout: 60000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => document.querySelector('.cre-t-270-explore').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelector('.cre-t-270-explore-toggle').click());
  await p.waitForTimeout(500);
  for (const n of ['Soft', 'Firm', 'Plus']) {
    // user scrolls back down to the buttons before each click
    await p.evaluate(() => document.querySelector('.cre-t-270-explore').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(800);
    await p.evaluate((n) => document.querySelector(`.cre-t-270-explore-option[data-firmness="${n}"]`).click(), n);
    const track = [];
    for (let i = 0; i < 8; i++) {
      await p.waitForTimeout(400);
      track.push(await p.evaluate((desk) => {
        const sel = desk ? '.winkbed-construction__content-bottom-main-item' : '.winkbed-construction__accordion-item';
        const it = [...document.querySelectorAll(sel)].find((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0);
        return Math.round(scrollY) + '/' + (it ? Math.round(it.getBoundingClientRect().top) : 'x');
      }, form === 'desktop'));
    }
    console.log(engine, form, n, 'scrollY/contentTop over 3.2s:', track.join(' '));
  }
  await b.close();
})();
