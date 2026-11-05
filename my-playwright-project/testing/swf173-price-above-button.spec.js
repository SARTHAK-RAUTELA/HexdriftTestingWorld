// SWF173 — Pet Insurance Gurus — Price Above Button (Desktop)
// Experiment 100053060: control 1000257881, variation 1000257882
// Variation: duplicate each listing's "Average Plan Cost" above its VIEW PLANS button; the right
// column stays vertically centred within the listing. Desktop only. 6 targeted URLs.
// Assertions use the wireframe / ticket, not the code.
const { test, expect, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://petinsurancegurus.com';
const EXP = '100053060';
const ARMS = { control: '1000257881', variation: '1000257882' };
const PAGES = ['/', '/home/', '/comparison/', '/cat-insurance/', '/compare/', '/canada/'];
const PRICE = '.SWF173-price';

const SHOT_ROOT = path.join(__dirname, '..', 'qa-knowledge-base', 'pet-insurance-gurus', 'swf173-screenshots');
async function shot(target, info, id, opts = {}) {
  const d = path.join(SHOT_ROOT, info.project.name.replace(/[^\w]+/g, '-').toLowerCase());
  fs.mkdirSync(d, { recursive: true });
  await target.screenshot({ path: path.join(d, `${id}.png`), ...opts }).catch(() => {});
}
const note = (msg) => test.info().annotations.push({ type: 'note', description: msg });
const url = (arm, p = '/', qs = '') => `${BASE}${p}?cro_mode=qa&_conv_eforce=${EXP}.${ARMS[arm]}${qs}`;

async function open(page, arm, p = '/', qs = '') {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const t0 = Date.now();
  await page.goto(url(arm, p, qs), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.plan-box', { state: 'attached', timeout: 60000 });
  const tBoxes = Date.now() - t0;
  let tPrice = null;
  if (arm === 'variation') {
    await page.waitForSelector(PRICE, { state: 'attached', timeout: 60000 });
    tPrice = Date.now() - t0;
  } else await page.waitForTimeout(8000);
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelectorAll('.cre-t-133-overlay').forEach(e => e.remove()));
  return { errors, tBoxes, tPrice };
}

// Per visible card: duplicated price vs the visible left-column "Average Plan Cost", plus geometry.
const cards = page => page.evaluate(() =>
  [...document.querySelectorAll('.plan-box')].filter(b => b.offsetParent).map(b => {
    const dup = b.querySelector('.SWF173-price');
    const amt = b.querySelector('.SWF173-amount');
    const left = b.querySelector('.plan-detail-column .plan-detail-content');
    const btn = b.querySelector('.plan-button-container');
    const col = btn && btn.parentElement;
    const cta = b.querySelector('.see-plans-button');
    const br = btn && btn.getBoundingClientRect(), cr = col && col.getBoundingClientRect();
    return {
      name: (b.querySelector('img') || {}).alt || '',
      dupCount: b.querySelectorAll('.SWF173-price').length,
      dup: amt ? amt.textContent.replace(/\s+/g, '') : null,
      label: dup ? dup.querySelector('.SWF173-label').innerText.trim() : null,
      left: left ? left.innerText.replace(/\s+/g, '') : null,
      beforeCta: !!(dup && cta && dup.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING),
      centreOff: br && cr ? Math.round(Math.abs((br.top + br.height / 2) - (cr.top + cr.height / 2))) : null,
      // native layout already overflows by 2px in the control (/comparison/, /canada/) — tolerate it
      overflowX: col ? col.scrollWidth > col.clientWidth + 3 : null,
      href: cta && cta.getAttribute('href'),
    };
  }));

// ───────────────────────── 1. Targeted URLs ─────────────────────────
test.describe('SWF173 targeted URLs', () => {
  for (const p of PAGES) {
    test(`${p} — variation adds a matching price above every visible CTA`, async ({ page }, info) => {
      const { errors, tBoxes, tPrice } = await open(page, 'variation', p);
      note(`${p}: listings at ${tBoxes}ms, SWF173 price at ${tPrice}ms (+${tPrice - tBoxes}ms)`);
      const c = await cards(page);
      note(`${p}: ` + c.map(x => `${x.name.replace(' Logo', '')} ${x.dup}|${x.left} off${x.centreOff}`).join('; '));
      const first = page.locator('.plan-box').first();
      await first.scrollIntoViewIfNeeded();
      await shot(first, info, `variation${p.replace(/\//g, '_') || '_'}card1`);
      expect(await page.evaluate(() => document.body.classList.contains('SWF173'))).toBe(true);
      expect(c.length).toBeGreaterThan(0);
      for (const x of c) {
        expect.soft(x.dupCount, `${x.name} one price`).toBe(1);
        expect.soft(x.label, `${x.name} label`).toMatch(/^average plan cost$/i);
        expect.soft(x.dup, `${x.name} duplicated == left column`).toBe(x.left);
        expect.soft(x.beforeCta, `${x.name} price above CTA`).toBe(true);
        expect.soft(x.centreOff, `${x.name} column vertically centred`).toBeLessThanOrEqual(2);
        expect.soft(x.overflowX, `${x.name} no horizontal overflow`).toBe(false);
      }
      expect.soft(errors.filter(e => /SWF173/i.test(e)), 'no SWF173 errors').toEqual([]);
    });

    test(`${p} — control unchanged`, async ({ page }, info) => {
      await open(page, 'control', p);
      expect(await page.locator(PRICE).count()).toBe(0);
      expect(await page.evaluate(() => document.body.classList.contains('SWF173'))).toBe(false);
      const first = page.locator('.plan-box').first();
      await first.scrollIntoViewIfNeeded();
      await shot(first, info, `control${p.replace(/\//g, '_') || '_'}card1`);
    });
  }
});

// ───────────────────────── 2. Design vs wireframe ─────────────────────────
test.describe('SWF173 design', () => {
  test('typography matches wireframe (label grey caps, bold amount, smaller /mo)', async ({ page }) => {
    await open(page, 'variation');
    const s = await page.evaluate(() => {
      const g = (sel) => { const e = document.querySelector(sel); const c = getComputedStyle(e); return { fs: parseFloat(c.fontSize), fw: c.fontWeight, tt: c.textTransform, color: c.color, ff: c.fontFamily }; };
      return { label: g('.SWF173-label'), amt: g('.SWF173-amount'), mo: g('.SWF173-mo'), cta: g('.see-plans-button .button-text') };
    });
    note(JSON.stringify(s));
    expect.soft(s.label.tt).toBe('uppercase');
    expect.soft(Number(s.amt.fw)).toBeGreaterThanOrEqual(700);
    expect.soft(s.label.ff).toMatch(/Montserrat/);
    expect.soft(s.mo.fs, '/mo smaller than the amount (wireframe)').toBeLessThan(s.amt.fs);
  });

  test('CTA hrefs and order unchanged vs control', async ({ page, browser }) => {
    await open(page, 'variation');
    const v = (await cards(page)).map(x => x.href);
    const ctx = await browser.newContext({ viewport: page.viewportSize() });
    const cp = await ctx.newPage();
    await open(cp, 'control');
    const c = (await cards(cp)).map(x => x.href);
    await ctx.close();
    expect(v).toEqual(c);
  });

  for (const w of [1024, 1280, 1440, 1920]) {
    test(`layout at ${w}px — centred, no overflow, price on one line`, async ({ page }, info) => {
      await page.setViewportSize({ width: w, height: 900 });
      await open(page, 'variation');
      const c = await cards(page);
      const lines = await page.evaluate(() => [...document.querySelectorAll('.SWF173-amount')].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().height)));
      note(`${w}: amount heights ${lines.join(',')}; centre offsets ${c.map(x => x.centreOff).join(',')}`);
      const first = page.locator('.plan-box').first();
      await first.scrollIntoViewIfNeeded();
      await shot(first, info, `width-${w}-card1`);
      for (const x of c) {
        expect.soft(x.centreOff, `${x.name} centred`).toBeLessThanOrEqual(2);
        expect.soft(x.overflowX, `${x.name} overflow`).toBe(false);
      }
      for (const h of lines) expect.soft(h, 'amount on one line').toBeLessThan(30);
    });
  }

  test('re-running the code does not duplicate prices', async ({ page }) => {
    await open(page, 'variation');
    const code = fs.readFileSync(path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation', 'vB.js'), 'utf8');
    await page.evaluate(code); await page.evaluate(code);
    await page.waitForTimeout(3500);
    const c = await cards(page);
    for (const x of c) expect.soft(x.dupCount, x.name).toBe(1);
  });
});

// ───────────────────────── 3. Filters / dynamic content ─────────────────────────
test.describe('SWF173 filters', () => {
  for (const pet of ['Cats', 'Dogs']) {
    test(`${pet} tab — duplicated price follows the tab's price`, async ({ page }, info) => {
      await open(page, 'variation');
      const before = await cards(page);
      await page.locator('.oxy-tab', { hasText: pet }).first().click();
      await page.waitForTimeout(4000);
      const c = await cards(page);
      note(`${pet}: ` + c.map(x => `${x.name.replace(' Logo', '')} dup ${x.dup} / left ${x.left}`).join('; '));
      const first = page.locator('.plan-box').first();
      await first.scrollIntoViewIfNeeded();
      await shot(first, info, `tab-${pet.toLowerCase()}-card1`);
      expect(c.some((x, i) => before[i] && x.left !== before[i].left), 'site changed prices on tab').toBe(true);
      for (const x of c) expect.soft(x.dup, `${x.name} dup == left on ${pet}`).toBe(x.left);
    });
  }

  test('Cats → All Pets round-trip — price matches again', async ({ page }) => {
    await open(page, 'variation');
    await page.locator('.oxy-tab', { hasText: 'Cats' }).first().click();
    await page.waitForTimeout(3000);
    await page.locator('.oxy-tab', { hasText: 'All Pets' }).first().click();
    await page.waitForTimeout(3000);
    for (const x of await cards(page)) expect.soft(x.dup, x.name).toBe(x.left);
  });

  test('direct ?petType=cat landing — price matches', async ({ page }) => {
    await open(page, 'variation', '/', '&petType=cat');
    const c = await cards(page);
    note(c.map(x => `${x.dup}/${x.left}`).join('; '));
    for (const x of c) expect.soft(x.dup, x.name).toBe(x.left);
  });

  test('ZIP typed after the observer window (>17s) — price still present and matching', async ({ page }, info) => {
    test.setTimeout(150000);
    const { tPrice } = await open(page, 'variation');
    await page.waitForTimeout(17500);
    const zip = page.locator('input[placeholder*="Zip" i]').first();
    await zip.scrollIntoViewIfNeeded();
    await zip.click();
    await zip.pressSequentially('90210', { delay: 120 });
    await zip.press('Enter').catch(() => {});
    await page.waitForTimeout(6000);
    const c = await cards(page);
    note(`price first at ${tPrice}ms; after ZIP: ` + c.map(x => `${x.name.replace(' Logo', '')} ${x.dup}/${x.left}`).join('; '));
    await shot(page.locator('.plan-box').first(), info, 'zip-late-card1');
    for (const x of c) {
      expect.soft(x.dupCount, `${x.name} price present after ZIP`).toBe(1);
      expect.soft(x.dup, `${x.name} dup == left after ZIP`).toBe(x.left);
    }
  });

  test('Show More clicked after the observer window — revealed cards get the price', async ({ page }, info) => {
    test.setTimeout(150000);
    await open(page, 'variation');
    const n0 = (await cards(page)).length;
    await page.waitForTimeout(18000);
    const btn = page.getByText(/^\s*Show More\s*$/i).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(3000);
    const c = await cards(page);
    note(`cards ${n0} → ${c.length}; ` + c.map(x => `${x.name.replace(' Logo', '')}:${x.dupCount}`).join(', '));
    const missing = c.filter(x => x.dupCount !== 1).map(x => x.name);
    if (missing.length) {
      const el = page.locator('.plan-box').filter({ has: page.locator('.see-plans-button') }).nth(n0);
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await shot(el, info, 'showmore-late-card');
    }
    expect(c.length).toBeGreaterThan(n0);
    expect(missing, 'cards without price after late Show More').toEqual([]);
  });

  test('Show More clicked quickly — revealed cards get the price', async ({ page }) => {
    await open(page, 'variation');
    const btn = page.getByText(/^\s*Show More\s*$/i).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(3000);
    const c = await cards(page);
    expect(c.filter(x => x.dupCount !== 1).map(x => x.name)).toEqual([]);
    for (const x of c) expect.soft(x.dup, x.name).toBe(x.left);
  });
});

// ───────────────────────── 4. Audience ─────────────────────────
test.describe('SWF173 audience', () => {
  test('mobile device does not get the variation (desktop only)', async ({ browser, browserName }, info) => {
    const dev = browserName === 'webkit' ? devices['iPhone 12'] : devices['Pixel 5'];
    const { defaultBrowserType, ...opts } = dev;
    const ctx = await browser.newContext(opts);
    const p = await ctx.newPage();
    await p.goto(url('variation'), { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('.plan-box', { state: 'attached', timeout: 60000 });
    await p.waitForTimeout(12000);
    const n = await p.locator(PRICE).count();
    const conv = await p.evaluate(() => (document.cookie.match(/_conv_v=[^;]*/) || [''])[0]);
    note(`mobile prices: ${n}; bucketed in 100053060: ${/100053060/.test(decodeURIComponent(conv))}`);
    await shot(p.locator('.plan-box').first(), info, 'mobile-card1');
    await ctx.close();
    expect(n).toBe(0);
  });
});
