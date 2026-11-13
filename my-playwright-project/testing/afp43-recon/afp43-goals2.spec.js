// AFP43 page-visit goal map: one visitor per arm visits every forum nav page; record goal ids fired per page.
const { test } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const B = 'https://www.financialprofessionals.org/afp-fp-a--forum';
const PAGES = ['', '/program/schedule-at-a-glance', '/program/educational-sessions', '/program/networking', '/program/keynote-speakers', '/program/past-forum-sessions', '/program/afp-fp-a-forum-attendee-feedback', '/pricing', '/hotel/book-your-hotel', '/hotel/explore-NOLA', '/sponsors/our-sponsors', '/sponsors/sponsor', '/program/keynote-speakers'];
test('page goal map', async ({ browser }) => {
  test.setTimeout(900000);
  const out = {};
  for (let i = 0; i < 10 && Object.keys(out).length < 2; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    let goals = [];
    page.on('request', r => { const m = r.url().match(/_vis_opt_exp_88_goal_(\d+)/); if (m) goals.push(m[1]); });
    await page.goto(B + '?utm_campaign=Cro_mode', { waitUntil: 'domcontentloaded' }); await page.waitForLoadState('load').catch(() => {}); await page.waitForTimeout(4000);
    const arm = await page.evaluate(() => document.querySelector('.cre-t-43-nav-bar') ? 'variation' : (window._vwo_exp && window._vwo_exp[88] && window._vwo_exp[88].combination_chosen) ? 'control' : 'none');
    if (arm === 'none' || out[arm]) { await ctx.close(); continue; }
    const rows = [['home (landing)', [...new Set(goals)]]];
    for (const p of PAGES.slice(1)) {
      goals = [];
      await page.goto(B + p, { waitUntil: 'domcontentloaded' }); await page.waitForLoadState('load').catch(() => {}); await page.waitForTimeout(4000);
      rows.push([p, [...new Set(goals)].sort((a, b) => a - b)]);
    }
    out[arm] = rows; await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'goals2.json'), JSON.stringify(out));
});
