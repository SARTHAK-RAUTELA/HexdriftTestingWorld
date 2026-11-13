// AFP43 goal map: which _vis_opt_exp_88_goal_N fires for each user action, per arm (QA link, real tracking).
const { test } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const QA = 'https://www.financialprofessionals.org/afp-fp-a--forum?utm_campaign=Cro_mode';
test('goal map', async ({ browser }) => {
  test.setTimeout(600000);
  const out = { defs: null, arms: {} };
  for (let i = 0; i < 10 && Object.keys(out.arms).length < 2; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    let goals = [];
    page.on('request', r => { const m = r.url().match(/_vis_opt_exp_88_goal_(\d+)/); if (m) goals.push(m[1]); });
    const step = async (name, fn) => { goals = []; await fn(); await page.waitForTimeout(3500); return [name, [...new Set(goals)].sort()]; };
    const steps = [];
    steps.push(await step('land home', async () => { await page.goto(QA, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(3000); }));
    const arm = await page.evaluate(() => document.querySelector('.cre-t-43-nav-bar') ? 'variation' : 'control');
    if (out.arms[arm]) { await ctx.close(); continue; }
    if (!out.defs) out.defs = await page.evaluate(() => { const e = window._vwo_exp && window._vwo_exp[88]; return e && { name: e.name, combos: e.comb_n, goals: Object.fromEntries(Object.entries(e.goals || {}).map(([k, g]) => [k, { type: g.type, url: g.url || g.urlRegex, pUrl: g.pUrl, pExcludeUrl: g.pExcludeUrl, sel: g.cssSelectors || g.cSel || g.selector }])) }; });
    await page.addStyleTag({ content: '#truste-consent-track,#hubspot-messages-iframe-container{display:none!important}' }).catch(() => {});
    const btn = (t) => page.locator('.sub-header .afp-nav__list > li > button', { hasText: t }).first();
    steps.push(await step('open Program dropdown', async () => { await btn('Program').click({ force: true }); }));
    steps.push(await step('open Hotel dropdown', async () => { await btn('Hotel').click({ force: true }); }));
    steps.push(await step('click Program > Keynote Speakers', async () => { await btn('Program').click({ force: true }); await page.waitForTimeout(400); await Promise.all([page.waitForURL(u => true, { waitUntil: 'commit' }).then(() => page.waitForLoadState('domcontentloaded')), page.locator('.sub-header .afp-nav__sub-nav a[href*="keynote-speakers"]').first().click({ force: true })]); }));
    steps.push(await step('click Sponsors > Our Sponsors', async () => { await btn('Sponsors').click({ force: true }); await page.waitForTimeout(400); await Promise.all([page.waitForURL(u => true, { waitUntil: 'commit' }).then(() => page.waitForLoadState('domcontentloaded')), page.locator('.sub-header .afp-nav__sub-nav a[href*="our-sponsors"]').first().click({ force: true })]); }));
    const reg = arm === 'variation' ? '.cre-t-43-cta' : '.sub-header .afp-nav__list > li > a[href$="/pricing"]';
    steps.push(await step('click Registration / Pricing & Register', async () => { await Promise.all([page.waitForURL(u => true, { waitUntil: 'commit' }).then(() => page.waitForLoadState('domcontentloaded')), page.locator(reg).first().click({ force: true })]); }));
    steps.push(await step('direct visit Book Your Hotel', async () => { await page.goto('https://www.financialprofessionals.org/afp-fp-a--forum/hotel/book-your-hotel', { waitUntil: 'domcontentloaded' }); }));
    out.arms[arm] = steps;
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'goals.json'), JSON.stringify(out, null, 2));
});
