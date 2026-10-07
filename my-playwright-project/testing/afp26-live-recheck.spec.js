// AFP26 post-launch live re-check (2026-10-07).
// Each attempt opens a brand-new browser context (= fresh private window, no
// VWO cookies) and reloads the live homepage until VWO naturally buckets it into
// AFP26 (exp 68) variation (combo 2). A control session is captured too so the
// variation can be compared against it. Writes results.json + screenshots per project.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.financialprofessionals.org/';
const EXP_ID = '68';
const MAX_ATTEMPTS = 14;
const OUT_ROOT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'afp26-live-recheck');

async function freshSession(browser, use) {
  const ctx = await browser.newContext({ ...use });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message.slice(0, 200)));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(id => window._vwo_exp && window._vwo_exp[id] && window._vwo_exp[id].ready, EXP_ID, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const combo = await page.evaluate(id => (window._vwo_exp && window._vwo_exp[id] && window._vwo_exp[id].combination_chosen) || null, EXP_ID);
  return { ctx, page, combo, consoleErrors };
}

async function hideOverlays(page) {
  await page.addStyleTag({ content: '[id*="onetrust"],[class*="cookie-banner"],iframe[title*="chat" i],#hubspot-messages-iframe-container{display:none!important}' }).catch(() => {});
}

async function collect(page) {
  return page.evaluate(() => {
    const vis = el => !!el && el.getBoundingClientRect().width > 0 && el.offsetParent !== null;
    const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
    const cs = el => {
      if (!el) return null;
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return { text: txt(el).slice(0, 90), fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, fontFamily: s.fontFamily.split(',')[0], color: s.color, width: Math.round(r.width), visible: vis(el) };
    };
    const items = [...document.querySelectorAll('.cta-list__item')];
    const heroContent = document.querySelector('.card--hero__content');
    const hcs = heroContent ? getComputedStyle(heroContent) : null;
    const navBtns = [...document.querySelectorAll('.tab-section__nav-btn')];
    const accHeads = [...document.querySelectorAll('.tab-section__heading')];
    const allHrefs = [...document.querySelectorAll('a')].map(a => a.getAttribute('href') || '');
    const doc = document.documentElement;
    return {
      bodyHasClass: document.body.classList.contains('afp-26'),
      hero: {
        title: cs(document.querySelector('.card--hero__title')),
        text: txt(document.querySelector('.card--hero__text')),
        btn: cs(document.querySelector('.card--hero__content .card--hero__btn')),
        btnHref: document.querySelector('.card--hero__content .card--hero__btn')?.getAttribute('href'),
        paddingTop: hcs && hcs.paddingTop, paddingLeft: hcs && hcs.paddingLeft,
      },
      cards: items.map(it => ({
        eyebrow: cs(it.querySelector('.cta-list__subheading')),
        heading: txt(it.querySelector('.cta-list__heading')),
        text: txt(it.querySelector('.cta-list__text')),
        btn: txt(it.querySelector('.cta-list__btn')),
        href: it.querySelector('.cta-list__btn')?.getAttribute('href'),
        target: it.querySelector('.cta-list__btn')?.getAttribute('target'),
      })),
      section2: {
        eyebrow: cs(document.querySelector('.tab-section__title')),
        headline: cs(document.querySelector('.variation-section2-headline')),
        navTabs: navBtns.map(b => ({ ...cs(b), active: b.classList.contains('active') })),
        accordionTabs: accHeads.map(b => ({ text: txt(b), visible: vis(b), active: b.classList.contains('active') || b.getAttribute('aria-expanded') === 'true' })),
        panelEyebrow: cs([...document.querySelectorAll('.variation-eyebrow-already-certified')].find(vis) || document.querySelector('.variation-eyebrow-already-certified')),
        panelTitle: txt([...document.querySelectorAll('.tab-section__content-title')].find(vis)),
        explore: (() => { const a = [...document.querySelectorAll('.variation-explore-recert a')].find(vis) || document.querySelector('.variation-explore-recert a'); return a ? { text: txt(a), href: a.getAttribute('href'), visible: vis(a) } : null; })(),
      },
      todoHrefs: allHrefs.filter(h => /TODO|_vis_preview/i.test(h)),
      horizontalOverflow: doc.scrollWidth > doc.clientWidth + 1 ? doc.scrollWidth - doc.clientWidth : 0,
    };
  });
}

test('AFP26 live re-check — bucket into variation via fresh private sessions', async ({ browser }, testInfo) => {
  test.setTimeout(15 * 60 * 1000);
  const proj = testInfo.project.name;
  const use = { ...testInfo.project.use };
  delete use.defaultBrowserType; delete use.channel;
  const outDir = path.join(OUT_ROOT, proj.replace(/[^a-z0-9]+/gi, '-').toLowerCase());
  fs.mkdirSync(outDir, { recursive: true });

  const attempts = [];
  let variation = null, control = null;
  for (let i = 1; i <= MAX_ATTEMPTS && !(variation && control); i++) {
    const s = await freshSession(browser, use);
    attempts.push(s.combo);
    if (s.combo === '2' && !variation) variation = s;
    else if (s.combo === '1' && !control) control = s;
    else await s.ctx.close();
  }
  const result = { project: proj, attempts, variation: null, control: null, clickThrough: null, tabSwitch: null, consoleErrors: [] };

  if (control) {
    await hideOverlays(control.page);
    result.control = await collect(control.page);
    await control.page.locator('.cta-list').first().scrollIntoViewIfNeeded().catch(() => {});
    await control.page.screenshot({ path: path.join(outDir, 'control-hero-cards.png') });
    await control.ctx.close();
  }

  expect(variation, `never bucketed into variation in ${MAX_ATTEMPTS} fresh sessions (got ${attempts.join(',')})`).toBeTruthy();
  const p = variation.page;
  await hideOverlays(p);
  result.variation = await collect(p);
  await p.screenshot({ path: path.join(outDir, 'variation-hero.png') });
  await p.locator('.cta-list').first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(outDir, 'variation-cards.png') });
  await p.locator('.tab-section').first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(outDir, 'variation-section2.png') });

  // Tab switch: click the first tab (CTP) and confirm the panel changes, then back to Maintain.
  const tabSel = (await p.locator('.tab-section__nav-btn').first().isVisible()) ? '.tab-section__nav-btn' : '.tab-section__heading';
  const tabs = p.locator(tabSel);
  await tabs.nth(0).click();
  await p.waitForTimeout(800);
  const afterCtp = await p.evaluate(() => [...document.querySelectorAll('.tab-section__content-title')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()));
  await p.screenshot({ path: path.join(outDir, 'variation-tab-ctp.png') });
  await tabs.nth(2).click();
  await p.waitForTimeout(800);
  const afterMaintain = await p.evaluate(() => [...document.querySelectorAll('.tab-section__content-title')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()));
  result.tabSwitch = { selector: tabSel, afterCtp, afterMaintain };

  // Click-through on Explore Certifications.
  const certBtn = p.locator('.cta-list__item:nth-child(2) .cta-list__btn');
  await certBtn.scrollIntoViewIfNeeded();
  const [resp] = await Promise.all([
    p.waitForNavigation({ timeout: 45000, waitUntil: 'domcontentloaded' }).catch(() => null),
    certBtn.click(),
  ]);
  result.clickThrough = { landedUrl: p.url(), status: resp ? resp.status() : null, title: await p.title().catch(() => null) };
  await p.screenshot({ path: path.join(outDir, 'variation-cert-landing.png') });

  result.consoleErrors = variation.consoleErrors;
  await variation.ctx.close();
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 1));
});
