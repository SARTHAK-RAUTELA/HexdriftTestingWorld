// SWF167 (cre-t-167) — Pet Insurance Gurus — Donation Matching
// Experiment 100052999: control 1000257732, variation 1000257733 (only ONE variation exists in Convert;
// the ticket asks for 4 copy variants: Donations / Donate / Giving / Help a Pet).
// Variation: replace header "Contact" with "Donations" (between How We Rank and About); clicking it
// smooth-scrolls to the FAQ and auto-opens a new first FAQ "We donate to animal welfare charities and match your gifts".
// Assertions use the Figma / ticket values, not the code's.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://petinsurancegurus.com';
const EXP = '100052999';
const ARMS = { control: '1000257732', variation: '1000257733' };
const PAGES = ['/', '/home/', '/comparison/', '/compare/'];
const QUESTION = 'We donate to animal welfare charities and match your gifts';
const ANSWER = 'We donate for every policy purchased through us, helping animals in need. Want to join us? Donate to the American Humane Society and forward your receipt to info@petinsurancegurus.com. We’ll match your donation up to $100, doubling your impact.';
const COPY_VARIANTS = ['Donations', 'Donate', 'Giving', 'Help a Pet'];
const BLUE = 'rgb(2, 114, 228)';
const ITEM = '.cre-t-167-accordion_item';
const HDR = '.cre-t-167-accordion_header';
const LINK = '.cre-t-167-donations a';
// Goals pre-existing on the site that other experiments fire; anything else is a SWF167 goal.
const SITE_GOALS = ['100034508'];

const SHOT_ROOT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'swf167-screenshots');
async function shot(page, info, id, opts = {}) {
  const d = path.join(SHOT_ROOT, info.project.name.replace(/[^\w]+/g, '-').toLowerCase());
  fs.mkdirSync(d, { recursive: true });
  await page.screenshot({ path: path.join(d, `${id}.png`), ...opts }).catch(() => {});
}
const note = (msg) => test.info().annotations.push({ type: 'note', description: msg });

async function open(page, arm, p = '/') {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${BASE}${p}?cro_mode=qa&_conv_eforce=${EXP}.${ARMS[arm]}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load').catch(() => {});
  if (arm === 'variation') await page.waitForSelector(ITEM, { state: 'attached', timeout: 30000 });
  else await page.waitForTimeout(6000);
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll('.cre-t-133-overlay').forEach(e => e.remove()));
  return errors;
}

const navItems = page => page.evaluate(() =>
  [...document.querySelectorAll('.oxy-site-navigation.header-nav ul > li')]
    .filter(l => l.offsetParent && l.textContent.trim())
    .map(l => { const a = l.querySelector('a'); return { text: l.textContent.trim(), href: a && a.getAttribute('href') }; }));

const faqState = page => page.evaluate(([ITEM, HDR]) => {
  const it = document.querySelector(ITEM); if (!it) return null;
  const h = it.querySelector(HDR); const r = h.getBoundingClientRect();
  return {
    active: it.classList.contains('active'),
    aria: h.getAttribute('aria-expanded'),
    bodyVisible: getComputedStyle(it.querySelector('.oxy-pro-accordion_body')).display !== 'none',
    hdrTop: Math.round(r.top), vh: innerHeight, hash: location.hash,
    iconRotated: getComputedStyle(it.querySelector('svg')).transform !== 'none',
    titleColor: getComputedStyle(it.querySelector('.oxy-pro-accordion_title')).color,
    openTitles: [...document.querySelectorAll('.faq-container .oxy-pro-accordion_item.active .oxy-pro-accordion_title')].map(t => t.textContent.trim()),
    visibleBodies: [...document.querySelectorAll('.faq-container .oxy-pro-accordion_body')].filter(b => getComputedStyle(b).display !== 'none').length,
  };
}, [ITEM, HDR]);

async function clickDonations(page) {
  await page.locator(LINK).scrollIntoViewIfNeeded();
  await page.locator(LINK).click();
  await page.waitForTimeout(2000); // 300ms slide + 350ms delay + smooth scroll
}

async function spyGoals(page) {
  await page.evaluate(() => {
    window.__goals = [];
    window._conv_q = window._conv_q || [];
    const orig = window._conv_q.push;
    window._conv_q.push = function () {
      [...arguments].forEach(a => { if (Array.isArray(a) && a[0] === 'triggerConversion') window.__goals.push(String(a[1])); });
      return orig.apply(this, arguments);
    };
  });
}

// ─────────────────────────────── CONTROL ───────────────────────────────
test.describe('Control', () => {
  test('C01 Control: Contact link kept, no Donations link, no new FAQ', async ({ page }, info) => {
    const errors = await open(page, 'control');
    const nav = await navItems(page);
    note('Nav: ' + nav.map(n => n.text).join(' | '));
    await shot(page, info, 'C01-control-header');
    expect(nav.map(n => n.text)).toContain('Contact');
    expect(nav.find(n => n.text === 'Contact').href).toContain('/contact-us');
    for (const label of COPY_VARIANTS) expect(nav.map(n => n.text)).not.toContain(label);
    expect(await page.locator(ITEM).count()).toBe(0);
    expect(await page.evaluate(() => document.body.classList.contains('cre-t-167'))).toBe(false);
    const first = await page.locator('.faq-container .oxy-pro-accordion_item .oxy-pro-accordion_title').first().textContent();
    note('First FAQ in control: ' + first.trim());
    expect(first.trim()).not.toBe(QUESTION);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

// ─────────────────────────────── VARIATION ───────────────────────────────
test.describe('Variation', () => {
  test('V01 Header: Contact replaced by "Donations" between How We Rank and About', async ({ page }, info) => {
    await open(page, 'variation');
    const nav = await navItems(page);
    const texts = nav.map(n => n.text);
    note('Nav: ' + texts.join(' | '));
    await shot(page, info, 'V01-variation-header');
    expect(texts).not.toContain('Contact');
    expect(texts.filter(t => t === 'Donations')).toHaveLength(1);
    const i = texts.indexOf('Donations');
    expect(texts[i - 1]).toBe('How We Rank');
    expect(texts[i + 1]).toBe('About');
    expect(nav[i].href).toBe('#faq-donations');
    // same typography as its neighbours
    const fonts = await page.evaluate(() => [...document.querySelectorAll('.oxy-site-navigation.header-nav ul > li > a')]
      .filter(a => a.offsetParent).map(a => { const s = getComputedStyle(a); return s.fontSize + ' ' + s.fontWeight + ' ' + s.color; }));
    note('Nav link styles: ' + fonts.join(' | '));
    expect(new Set(fonts).size).toBe(1);
  });

  test('V02 New FAQ inserted first, exact Figma copy, collapsed by default', async ({ page }, info) => {
    await open(page, 'variation');
    const titles = await page.locator('.faq-container .oxy-pro-accordion_item .oxy-pro-accordion_title').allTextContents();
    note('First 3 FAQs: ' + titles.slice(0, 3).map(t => t.trim()).join(' | '));
    expect(await page.locator(ITEM).count()).toBe(1);
    expect(titles[0].trim()).toBe(QUESTION);
    const ans = (await page.locator(`${ITEM} .oxy-pro-accordion_body`).textContent()).replace(/\s+/g, ' ').trim();
    expect(ans).toBe(ANSWER);
    const s = await faqState(page);
    expect(s.active).toBe(false);
    expect(s.bodyVisible).toBe(false);
    expect(s.aria).toBe('false');
    await page.locator('.faq-container').first().scrollIntoViewIfNeeded();
    await shot(page, info, 'V02-faq-collapsed');
  });

  test('V03 New FAQ matches native FAQ styling (closed)', async ({ page }, info) => {
    await open(page, 'variation');
    const st = await page.evaluate(() => {
      const pick = el => { const s = getComputedStyle(el); return { fontSize: s.fontSize, fontFamily: s.fontFamily, fontWeight: s.fontWeight, color: s.color, textTransform: s.textTransform }; };
      const n = document.querySelector('.faq-container .oxy-pro-accordion_item:not(.cre-t-167-accordion_item):not(.cre-t-144-accordion_item)');
      const v = document.querySelector('.cre-t-167-accordion_item');
      const box = el => { const s = getComputedStyle(el); return { padTop: s.paddingTop, padBottom: s.paddingBottom, borderBottom: getComputedStyle(el.closest('.oxy-pro-accordion_item')).borderBottom }; };
      return { nTitle: pick(n.querySelector('.oxy-pro-accordion_title')), vTitle: pick(v.querySelector('.oxy-pro-accordion_title')),
        nBox: box(n.querySelector('.oxy-pro-accordion_header')), vBox: box(v.querySelector('.cre-t-167-accordion_header')),
        nIcon: n.querySelector('svg').getBoundingClientRect().width, vIcon: v.querySelector('svg').getBoundingClientRect().width };
    });
    note(JSON.stringify(st));
    expect(st.vTitle).toEqual(st.nTitle);
    expect(st.vBox).toEqual(st.nBox);
    expect(st.vIcon).toBe(st.nIcon);
    await page.locator(ITEM).scrollIntoViewIfNeeded();
    await shot(page, info, 'V03-faq-style');
  });

  test('V04 Clicking Donations (from top) scrolls to and opens the new FAQ', async ({ page }, info) => {
    await open(page, 'variation');
    await page.evaluate(() => scrollTo(0, 0));
    await clickDonations(page);
    const s = await faqState(page);
    note(JSON.stringify(s));
    await shot(page, info, 'V04-after-donations-click');
    expect(s.active).toBe(true);
    expect(s.bodyVisible).toBe(true);
    expect(s.aria).toBe('true');
    expect(s.hdrTop).toBeGreaterThanOrEqual(0);
    expect(s.hdrTop).toBeLessThan(s.vh * 0.5); // question lands in the upper half of the viewport
    expect(s.hash).toBe('');                   // no #faq-donations jump / URL change
    expect(s.iconRotated).toBe(true);          // "+" becomes "×" (Figma)
    expect(s.titleColor).toBe(BLUE);           // open title is blue (Figma)
    expect(s.openTitles).toEqual([QUESTION]);
  });

  test('V05 Clicking Donations after scrolling to the page bottom still lands on the FAQ', async ({ page }, info) => {
    await open(page, 'variation');
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    // header is not sticky: the user has to come back up, so trigger the link where it sits
    await page.evaluate(sel => document.querySelector(sel).click(), LINK);
    await page.waitForTimeout(2200);
    const s = await faqState(page);
    note(JSON.stringify(s));
    await shot(page, info, 'V05-from-bottom');
    expect(s.active).toBe(true);
    expect(s.hdrTop).toBeGreaterThanOrEqual(0);
    expect(s.hdrTop).toBeLessThan(s.vh * 0.5);
  });

  test('V06 Clicking Donations again while open keeps it open (no toggle-close)', async ({ page }, info) => {
    await open(page, 'variation');
    await clickDonations(page);
    await page.evaluate(() => scrollTo(0, 0));
    await clickDonations(page);
    const s = await faqState(page);
    note(JSON.stringify(s));
    await shot(page, info, 'V06-second-click');
    expect(s.active).toBe(true);
    expect(s.bodyVisible).toBe(true);
    expect(s.aria).toBe('true');
  });

  test('V07 Manual open/close of the new FAQ toggles body, icon and aria-expanded', async ({ page }, info) => {
    await open(page, 'variation');
    await page.locator(HDR).scrollIntoViewIfNeeded();
    await page.locator(HDR).click(); await page.waitForTimeout(700);
    const o = await faqState(page);
    await shot(page, info, 'V07-manual-open');
    await page.locator(HDR).click(); await page.waitForTimeout(700);
    const c = await faqState(page);
    note('open: ' + JSON.stringify(o) + ' closed: ' + JSON.stringify(c));
    expect([o.active, o.bodyVisible, o.aria, o.iconRotated]).toEqual([true, true, 'true', true]);
    expect([c.active, c.bodyVisible, c.aria, c.iconRotated]).toEqual([false, false, 'false', false]);
  });

  test('V08 Opening the new FAQ closes an open native FAQ (one open at a time)', async ({ page }, info) => {
    await open(page, 'variation');
    const native = page.locator('.faq-container .oxy-pro-accordion_item:not(.cre-t-167-accordion_item):not(.cre-t-144-accordion_item) .oxy-pro-accordion_header').first();
    await native.scrollIntoViewIfNeeded(); await native.click(); await page.waitForTimeout(800);
    await page.locator(HDR).click(); await page.waitForTimeout(900);
    const s = await faqState(page);
    note(JSON.stringify(s));
    await shot(page, info, 'V08-native-then-new');
    expect(s.openTitles).toEqual([QUESTION]);
    expect(s.visibleBodies).toBe(1);
  });

  test('V09 Opening the new FAQ closes an open SWF144 "Vets love pet insurance" FAQ', async ({ page }, info) => {
    await open(page, 'variation');
    const has144 = await page.locator('.cre-t-144-accordion_item').count();
    test.skip(!has144, 'cre-t-144 not active in this session');
    const vet = page.locator('.cre-t-144-accordion_item button').first();
    await vet.scrollIntoViewIfNeeded(); await vet.click(); await page.waitForTimeout(800);
    await page.evaluate(() => scrollTo(0, 0));
    await clickDonations(page);   // the real user path: nav link while Vets FAQ is open
    const s = await faqState(page);
    note(JSON.stringify(s));
    await shot(page, info, 'V09-144-then-donations');
    expect(s.openTitles).toEqual([QUESTION]);
    expect(s.visibleBodies).toBe(1);
  });

  test('V10 Opening a native FAQ closes the new FAQ and resets its aria-expanded', async ({ page }, info) => {
    await open(page, 'variation');
    await page.locator(HDR).scrollIntoViewIfNeeded();
    await page.locator(HDR).click(); await page.waitForTimeout(700);
    const native = page.locator('.faq-container .oxy-pro-accordion_item:not(.cre-t-167-accordion_item):not(.cre-t-144-accordion_item) .oxy-pro-accordion_header').first();
    await native.click(); await page.waitForTimeout(900);
    const s = await faqState(page);
    note('after native open: ' + JSON.stringify(s));
    await shot(page, info, 'V10-new-then-native');
    expect(s.active).toBe(false);
    expect(s.bodyVisible).toBe(false);
    expect(s.aria, 'aria-expanded stays "true" on a closed item').toBe('false');
    // reopen: aria must say expanded
    await page.locator(HDR).click(); await page.waitForTimeout(900);
    const r = await faqState(page);
    note('after reopen: ' + JSON.stringify(r));
    expect(r.active).toBe(true);
    expect(r.aria, 'aria-expanded inverted after reopen').toBe('true');
  });

  test('V11 Keyboard: Donations link is focusable and Enter opens the FAQ', async ({ page, browserName }, info) => {
    test.skip(!!info.project.use.isMobile, 'no keyboard on touch devices');
    await open(page, 'variation');
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator(LINK).focus();
    const focused = await page.evaluate(sel => document.activeElement === document.querySelector(sel), LINK);
    expect(focused).toBe(true);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const s = await faqState(page);
    note(browserName + ' ' + JSON.stringify(s));
    await shot(page, info, 'V11-keyboard');
    expect(s.active).toBe(true);
    expect(s.hdrTop).toBeLessThan(s.vh * 0.5);
  });

  test('V12 Re-running the variation code does not duplicate the FAQ or nav link', async ({ page }, info) => {
    await open(page, 'variation');
    const code = fs.readFileSync(path.join(__dirname, 'swf167-recon', 'out', 'v-1000257733-0.js'), 'utf8')
      .replace(/^function\(convertContext\)\{\s*/, '').replace(/\}\s*$/, '');
    await page.evaluate(code); await page.evaluate(code);
    await page.waitForTimeout(3000);
    const nav = (await navItems(page)).map(n => n.text);
    note('Nav after 3 runs: ' + nav.join(' | '));
    expect(await page.locator(ITEM).count()).toBe(1);
    expect(nav.filter(t => t === 'Donations')).toHaveLength(1);
    // one click must still give one clean open (no double-bound handlers toggling twice)
    await page.evaluate(() => scrollTo(0, 0));
    await clickDonations(page);
    const s = await faqState(page);
    await shot(page, info, 'V12-after-rerun');
    expect(s.active).toBe(true);
  });

  for (const p of PAGES) {
    test(`V13 Target URL ${p}: nav swap, FAQ first, link opens FAQ`, async ({ page }, info) => {
      const errors = await open(page, 'variation', p);
      const nav = (await navItems(page)).map(n => n.text);
      note(`${p} nav: ${nav.join(' | ')}`);
      expect(nav).toContain('Donations');
      expect(nav).not.toContain('Contact');
      const first = await page.locator('.faq-container .oxy-pro-accordion_item .oxy-pro-accordion_title').first().textContent();
      expect(first.trim()).toBe(QUESTION);
      await page.evaluate(() => scrollTo(0, 0));
      await clickDonations(page);
      const s = await faqState(page);
      await shot(page, info, `V13-${p.replace(/\W+/g, '') || 'root'}`);
      expect(s.active).toBe(true);
      expect(s.hdrTop).toBeLessThan(s.vh * 0.5);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }

  test('V14 Header layout: nav on one row, no overlap with logo/Prices, no horizontal scroll', async ({ page }, info) => {
    await open(page, 'variation');
    const m = await page.evaluate(() => {
      const lis = [...document.querySelectorAll('.oxy-site-navigation.header-nav ul > li')].filter(l => l.offsetParent && l.textContent.trim());
      const rects = lis.map(l => l.getBoundingClientRect());
      const prices = [...document.querySelectorAll('header a, .oxy-header a')].find(a => /^\s*Prices\s*$/.test(a.textContent) && a.offsetParent);
      const pr = prices && prices.getBoundingClientRect();
      const overlap = pr ? rects.some(r => r.right > pr.left && r.left < pr.right && r.bottom > pr.top && r.top < pr.bottom) : false;
      return { rows: new Set(rects.map(r => Math.round(r.top))).size, overlap, maxRight: Math.max(...rects.map(r => r.right)), vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth };
    });
    note(JSON.stringify(m));
    await shot(page, info, 'V14-header', { clip: { x: 0, y: 0, width: page.viewportSize().width, height: 260 } });
    expect(m.rows).toBe(1);
    expect(m.overlap).toBe(false);
    expect(m.maxRight).toBeLessThanOrEqual(m.vw);
    expect(m.sw).toBeLessThanOrEqual(m.vw);
  });

  test('V15 Copy variants V1–V4 (Donations/Donate/Giving/Help a Pet) all fit the header', async ({ page }, info) => {
    // Only V1 exists in Convert; simulate the other labels in the same slot to check layout per browser.
    await open(page, 'variation');
    const out = [];
    for (const label of COPY_VARIANTS) {
      const m = await page.evaluate(([LINK, label]) => {
        document.querySelector(LINK).textContent = label;
        const lis = [...document.querySelectorAll('.oxy-site-navigation.header-nav ul > li')].filter(l => l.offsetParent && l.textContent.trim());
        const rects = lis.map(l => l.getBoundingClientRect());
        return { label, rows: new Set(rects.map(r => Math.round(r.top))).size, maxRight: Math.round(Math.max(...rects.map(r => r.right))), vw: document.documentElement.clientWidth };
      }, [LINK, label]);
      out.push(m);
      await shot(page, info, `V15-${label.replace(/\W+/g, '')}`, { clip: { x: 0, y: 0, width: page.viewportSize().width, height: 260 } });
    }
    note(JSON.stringify(out));
    for (const m of out) {
      expect(m.rows, `${m.label} wraps`).toBe(1);
      expect(m.maxRight, `${m.label} overflows`).toBeLessThanOrEqual(m.vw);
    }
  });

  test('V16 Goals: Donations-link click / FAQ open fire SWF167 goals', async ({ page }, info) => {
    await open(page, 'variation');
    await spyGoals(page);
    await page.evaluate(() => { window.__goals = []; scrollTo(0, 0); });
    await clickDonations(page);
    const linkGoals = await page.evaluate(() => window.__goals.slice());
    await page.locator(HDR).click(); await page.waitForTimeout(500); // close
    await page.evaluate(() => { window.__goals = []; });
    await page.locator(HDR).click(); await page.waitForTimeout(700); // manual open
    const manualGoals = await page.evaluate(() => window.__goals.slice());
    const own = g => g.filter(x => !SITE_GOALS.includes(x));
    note(`link click → [${linkGoals}] · manual FAQ open → [${manualGoals}]`);
    await shot(page, info, 'V16-goals');
    expect(own(linkGoals).length, 'no goal fired for "Clicks on Donations Link" / "Donations FAQ opens"').toBeGreaterThanOrEqual(2);
    expect(own(manualGoals).length, 'no goal fired for "Donations FAQ opens (manually)"').toBeGreaterThanOrEqual(1);
  });

  test('V17 "See How" link exists (custom goal "Clicks on See How Link")', async ({ page }, info) => {
    await open(page, 'variation');
    const n = await page.locator('a, button').filter({ hasText: /^\s*see how\s*$/i }).count();
    note(`elements with text "See how": ${n}`);
    await shot(page, info, 'V17-hero');
    expect(n, 'no "See How" link in Figma or code, but the ticket has a goal for it').toBeGreaterThan(0);
  });

  test('V18 SWF144 coexistence: Donations FAQ sits above "Vets love pet insurance"', async ({ page }, info) => {
    await open(page, 'variation');
    const titles = (await page.locator('.faq-container .oxy-pro-accordion_item .oxy-pro-accordion_title').allTextContents()).map(t => t.trim());
    note('FAQ order: ' + titles.slice(0, 3).join(' | '));
    const has144 = titles.includes('Vets love pet insurance');
    test.skip(!has144, 'cre-t-144 not active');
    expect(titles[0]).toBe(QUESTION);
    expect(titles[1]).toBe('Vets love pet insurance');
  });
});
