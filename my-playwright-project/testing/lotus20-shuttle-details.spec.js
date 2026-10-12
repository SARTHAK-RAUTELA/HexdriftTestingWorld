// Lotus Car Rental — Test 20 — Listings page — Simplified shuttle details (Convert exp 100052946)
// V1: Test 14 shuttle text link ("Free, fast shuttle") kept, modal content changed to the wireframe copy.
// V2: same shuttle text, no link/modal (text only). Control: no shuttle line.
// Co-running exp 100052833 (cre-t-lotus-16 "Recommended" feed) hides the real [id^=car-] cards and shows
// innerHTML clones (<cre-t-lotus-16-card>) — every check here runs on the cards the user can actually SEE.
// Run per project: npx playwright test testing/lotus20-shuttle-details.spec.js --project="Chrome Desktop"
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EXP = '100052946';
const ARMS = [
  { key: 'control', id: '1000257609' },
  { key: 'v1', id: '1000257610' },
  { key: 'v2', id: '1000257611' },
];
const BASE = 'https://www.lotuscarrental.is/rent-a-car-in-iceland';
const CARDS = '[data-slice-type="fleet_category"] [id^="car-"], cre-t-lotus-16-card';
const SH = '.cre-t-20-Shuttle-details';
const VIS_SH = `${SH}:visible`;
const MODAL = '#cre-t-20-popup__modal';
const SHOT_ROOT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'lotus20-screenshots');
const MODAL_COPY = {
  title: 'Local prices, a short ride away',
  items: [
    "Iceland's local car rental companies are based in the rental zone just outside the airport, not in the terminal.",
    "It's how we keep prices lower than the international chains.",
    'The free shuttle gets you to our door in just five minutes.',
  ],
  button: 'OK, Got It',
};

const isMobile = (ti) => /Mobile/.test(ti.project.name);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

async function shot(page, ti, name, opts = {}) {
  const dir = path.join(SHOT_ROOT, slug(ti.project.name));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await (opts.locator || page).screenshot({ path: file });
  await ti.attach(name, { path: file, contentType: 'image/png' });
}

function note(ti, text) { ti.annotations.push({ type: 'observation', description: text }); }

function watchErrors(page) {
  const errs = [];
  // WebKit throws a native cross-origin error from the Prismic preview iframe on every arm incl. control — not test-related
  page.on('pageerror', (e) => { if (!/prismic\.io/.test(e.message)) errs.push(`pageerror: ${e.message}`); });
  page.on('console', (m) => { if (/cre-t-20/.test(m.text())) errs.push(`console: ${m.text()}`); });
  return errs;
}

// A visitor without dates gets the "Rental time" panel auto-opened (control too); its backdrop swallows clicks and
// Escape/backdrop clicks do not close it — only "Update" (data-action="confirm-dates") does, like a real user.
async function closeDatePicker(page) {
  // Mobile equivalent: full-screen "Iceland Awaits." sheet (div.fixed.inset-0.bg-white, lg:hidden) closed by "Check the fleet".
  for (let i = 0; i < 2; i++) {
    const backdrop = page.locator('button[aria-label="Close"][data-state="open"]:visible, div.fixed.inset-0.bg-white:visible');
    if (!(await backdrop.count())) return;
    const upd = page.locator('[data-action="confirm-dates"]:visible').first();
    if (await upd.count()) await upd.click({ force: true }).catch(() => {});
    else await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
    await settleFeed(page);
  }
}

// Wait for the LOTUS-16 feed to finish building when it is active, else just settle.
async function settleFeed(page) {
  await page.waitForFunction(() => {
    const rec = document.documentElement.classList.contains('cre-t-lotus-16-recommended-mode');
    return !rec || !!document.querySelector('[data-cre-t-lotus-16-feed][data-cre-t-lotus-16-ready]');
  }, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

async function open(page, arm, ti) {
  await page.goto(`${BASE}?cro_mode=qa&_conv_eforce=${EXP}.${arm.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((exp) => !!window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 30000 }).catch(() => {});
  await page.locator('[id^="car-"]').first().waitFor({ state: 'attached', timeout: 30000 });
  await page.waitForTimeout(1500);
  await settleFeed(page);
  await page.addStyleTag({ content: '.ch2{display:none!important}' }).catch(() => {}); // cookie banner hidden, no consent given
  await closeDatePicker(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  if (ti) {
    const ctx = await page.evaluate(() => ({
      exps: Object.entries(window.convert?.currentData?.experiences || {}).map(([k, v]) => `${k}:${v.variation?.id}`),
      lotus16Feed: document.documentElement.classList.contains('cre-t-lotus-16-recommended-mode'),
    }));
    await ti.attach('bucketing', { body: JSON.stringify(ctx), contentType: 'application/json' });
  }
}

// Snapshot of what the user sees: visible cards + the shuttle line inside each.
function scanVisible(page) {
  return page.evaluate(({ CARDS, SH }) => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.width > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const cards = [...document.querySelectorAll(CARDS)].filter(vis);
    const per = cards.map((c) => c.querySelectorAll(SH).length);
    return {
      visibleCards: cards.length,
      clones: cards.filter((c) => c.tagName === 'CRE-T-LOTUS-16-CARD').length,
      per,
      missing: cards.filter((c) => !c.querySelector(SH)).map((c) => c.id || c.getAttribute('data-cre-t-lotus-16-source')),
      dupes: per.filter((n) => n > 1).length,
      shTotal: document.querySelectorAll(SH).length,
      shVisible: [...document.querySelectorAll(SH)].filter(vis).length,
      texts: [...new Set([...document.querySelectorAll(SH)].map((e) => e.textContent.trim()))],
      underCurrency: cards.filter((c) => c.querySelector(SH)?.previousElementSibling?.matches('[card-price-currency="others"]')).length,
      icon: cards[0]?.querySelector(`${SH} svg`)?.getBoundingClientRect().toJSON() || null,
      bookNowVisible: cards.filter((c) => [...c.querySelectorAll('[data-button-type="booked-a-car"], button')].some((b) => /book now/i.test(b.textContent) && vis(b))).length,
      shOutsideCard: cards.filter((c) => { const s = c.querySelector(SH); if (!s) return false; const a = c.getBoundingClientRect(), b = s.getBoundingClientRect(); return b.left < a.left - 1 || b.right > a.right + 1 || b.bottom > a.bottom + 1; }).length,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      lotus16Feed: document.documentElement.classList.contains('cre-t-lotus-16-recommended-mode'),
    };
  }, { CARDS, SH });
}

function expectShuttleOnEveryVisibleCard(r) {
  expect(r.visibleCards).toBeGreaterThan(0);
  expect(r.missing, 'visible cards without a shuttle line').toEqual([]);
  expect(r.dupes, 'visible cards with >1 shuttle line').toBe(0);
  expect(r.texts).toEqual(['Free, fast shuttle']);
}

const firstVisibleShuttle = (page) => page.locator(VIS_SH).first();
const modalOpen = (page) => page.evaluate(() => document.body.classList.contains('cre-t-20-showShuttleModal'));

async function clickShuttle(page, idx = 0) {
  const s = page.locator(VIS_SH).nth(idx);
  await s.scrollIntoViewIfNeeded();
  await s.click();
  await page.waitForTimeout(500);
}

for (const arm of ARMS) {
  test.describe(`LOTUS20 ${arm.key}`, () => {
    test(`${arm.key} TC01 — shuttle line ${arm.key === 'control' ? 'absent' : 'on every visible card, under the EUR/USD/GBP line'}`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await open(page, arm, ti);
      const r = await scanVisible(page);
      await ti.attach('scan', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
      if (arm.key === 'control') {
        expect(r.visibleCards).toBeGreaterThan(0);
        expect(r.shTotal).toBe(0);
        expect(await page.locator(MODAL).count()).toBe(0);
      } else {
        expectShuttleOnEveryVisibleCard(r);
        expect(r.underCurrency).toBe(r.visibleCards);
        expect(Math.round(r.icon.width)).toBe(24);
        expect(Math.round(r.icon.height)).toBe(24);
      }
      const first = page.locator(CARDS).filter({ visible: true }).first();
      await first.scrollIntoViewIfNeeded();
      await shot(page, ti, `${arm.key}-tc01-first-card`, { locator: first });
      expect(errs).toEqual([]);
    });

    test(`${arm.key} TC02 — card layout intact, no horizontal overflow`, async ({ page }, ti) => {
      await open(page, arm);
      const r = await scanVisible(page);
      await ti.attach('scan', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
      expect(r.overflowX).toBeLessThanOrEqual(0);
      expect(r.shOutsideCard).toBe(0);
      expect(r.bookNowVisible).toBe(r.visibleCards);
      await page.locator(CARDS).filter({ visible: true }).nth(1).scrollIntoViewIfNeeded();
      await shot(page, ti, `${arm.key}-tc02-cards-viewport`);
    });

    if (arm.key === 'control') return;

    test(`${arm.key} TC03 — shuttle text styling (${arm.key === 'v1' ? 'link: underline + pointer' : 'text only: no underline, no pointer'})`, async ({ page }, ti) => {
      await open(page, arm);
      const st = await firstVisibleShuttle(page).evaluate((e) => {
        const c = getComputedStyle(e);
        return { fontSize: c.fontSize, color: c.color, deco: c.textDecorationLine, cursor: c.cursor, gap: c.gap, display: c.display, tag: e.tagName, role: e.getAttribute('role'), tabIndex: e.tabIndex };
      });
      await ti.attach('style', { body: JSON.stringify(st, null, 2), contentType: 'application/json' });
      expect(st.fontSize).toBe('12px');
      expect(st.color).toBe('rgb(0, 0, 0)');
      expect(st.display).toBe('flex');
      if (arm.key === 'v1') {
        expect(st.deco).toBe('underline');
        expect(st.cursor).toBe('pointer');
        if (st.role === null && st.tabIndex < 0) note(ti, 'V1 shuttle "link" is a plain <div> — no role="button"/tabindex, so it is not keyboard-focusable.');
      } else {
        expect.soft(st.deco, 'V2 must not look like a link').toBe('none');
        expect.soft(st.cursor, 'V2 is text only — pointer cursor suggests it is clickable').not.toBe('pointer');
      }
      const block = firstVisibleShuttle(page).locator('xpath=..');
      await block.scrollIntoViewIfNeeded();
      await shot(page, ti, `${arm.key}-tc03-shuttle-text`, { locator: block });
    });

    if (arm.key === 'v2') {
      test('v2 TC04 — clicking the shuttle text does nothing (no modal, no navigation)', async ({ page }, ti) => {
        const errs = watchErrors(page);
        await open(page, arm);
        const url = page.url();
        await clickShuttle(page, 0);
        expect(await page.locator(MODAL).count()).toBe(0);
        expect(await modalOpen(page)).toBe(false);
        expect(page.url()).toBe(url);
        expect(await page.locator('[role="dialog"]:visible').count()).toBe(0);
        await shot(page, ti, 'v2-tc04-after-click');
        expect(errs).toEqual([]);
      });
      return;
    }

    // ── V1 modal ───────────────────────────────────────────────
    test('v1 TC04 — click shuttle link opens the new modal with wireframe copy', async ({ page }, ti) => {
      const errs = watchErrors(page);
      await open(page, arm);
      expect(await page.locator(MODAL).count()).toBe(1);
      await expect(page.locator(MODAL)).toBeHidden();
      const url = page.url();
      await clickShuttle(page, 0);
      await expect(page.locator(MODAL)).toBeVisible();
      expect(page.url()).toBe(url);
      const m = await page.evaluate(() => {
        const q = (s) => document.querySelector(s);
        const box = q('.cre-t-20-modal').getBoundingClientRect();
        const t = getComputedStyle(q('.cre-t-20-title'));
        const cl = getComputedStyle(q('.cre-t-20-close'));
        return {
          title: q('.cre-t-20-title').textContent.trim(),
          items: [...document.querySelectorAll('.cre-t-20-item')].map((e) => e.textContent.trim()),
          button: q('.cre-t-20-button').textContent.trim(),
          box: box.toJSON(), vw: window.innerWidth, vh: window.innerHeight,
          titleFont: t.fontSize, titleLines: Math.round(q('.cre-t-20-title').getBoundingClientRect().height / parseFloat(t.lineHeight)),
          listStyle: getComputedStyle(q('.cre-t-20-list')).listStyleType,
          btnBg: getComputedStyle(q('.cre-t-20-button')).backgroundColor,
          btnTag: q('.cre-t-20-button').tagName,
          overlay: getComputedStyle(q('#cre-t-20-popup__modal')).backgroundColor,
          closeRect: q('.cre-t-20-close').getBoundingClientRect().toJSON(), closeBg: cl.backgroundColor,
          modalScrolls: q('.cre-t-20-modal').scrollHeight > q('.cre-t-20-modal').clientHeight + 1,
          labelledBy: !!document.getElementById(q('.cre-t-20-modal').getAttribute('aria-labelledby')),
          headerZ: getComputedStyle(document.querySelector('header')).zIndex,
          topEl: (() => { const e = document.elementFromPoint(box.left + box.width / 2, box.top + 10); return e && (e.closest('.cre-t-20-modal') ? 'modal' : e.tagName + '.' + e.className.toString().slice(0, 40)); })(),
        };
      });
      await ti.attach('modal', { body: JSON.stringify(m, null, 2), contentType: 'application/json' });
      expect(m.title).toBe(MODAL_COPY.title);
      expect(m.items).toEqual(MODAL_COPY.items);
      expect(m.button).toBe(MODAL_COPY.button);
      expect(m.listStyle).toBe('disc');
      expect(m.btnBg).toBe('rgb(11, 79, 74)');
      expect(m.topEl, 'modal top edge must not be covered by the sticky header').toBe('modal');
      // fits the viewport and roughly centred
      expect(m.box.left).toBeGreaterThanOrEqual(0);
      expect(m.box.right).toBeLessThanOrEqual(m.vw);
      expect(m.box.top).toBeGreaterThanOrEqual(0);
      expect(m.box.bottom).toBeLessThanOrEqual(m.vh);
      expect(Math.abs((m.box.left + m.box.right) / 2 - m.vw / 2)).toBeLessThan(2);
      expect(m.closeRect.right).toBeLessThanOrEqual(m.box.right);
      expect(m.closeRect.top).toBeGreaterThanOrEqual(m.box.top);
      if (m.overlay === 'rgba(0, 0, 0, 0)') note(ti, 'No backdrop/overlay behind the modal (overlay div is commented out) — the listing stays undimmed. Confirm against the wireframe.');
      if (!m.labelledBy) note(ti, 'aria-labelledby="cre-t-20-modal-title" points to an id that does not exist (h2 has no id).');
      if (m.btnTag !== 'BUTTON') note(ti, '"OK, Got It" is a <div>, not a <button> — not keyboard reachable.');
      if (m.modalScrolls) note(ti, `Modal content scrolls inside the dialog at ${m.vw}x${m.vh}.`);
      await shot(page, ti, 'v1-tc04-modal-open');
      await shot(page, ti, 'v1-tc04-modal-only', { locator: page.locator('.cre-t-20-modal') });
      expect(errs).toEqual([]);
    });

    test('v1 TC05 — X close button closes the modal', async ({ page }, ti) => {
      await open(page, arm);
      await clickShuttle(page, 0);
      await expect(page.locator(MODAL)).toBeVisible();
      await page.locator('.cre-t-20-close').click();
      await expect(page.locator(MODAL)).toBeHidden();
      expect(await modalOpen(page)).toBe(false);
    });

    test('v1 TC06 — "OK, Got It" button closes the modal', async ({ page }, ti) => {
      await open(page, arm);
      await clickShuttle(page, 0);
      await page.locator('.cre-t-20-button').click();
      await expect(page.locator(MODAL)).toBeHidden();
      expect(await modalOpen(page)).toBe(false);
    });

    test('v1 TC07 — clicking outside the modal closes it; clicking inside does not', async ({ page }, ti) => {
      await open(page, arm);
      await clickShuttle(page, 0);
      await page.locator('.cre-t-20-title').click();
      await expect(page.locator(MODAL)).toBeVisible();
      await page.locator('.cre-t-20-item').first().click();
      await expect(page.locator(MODAL)).toBeVisible();
      await page.mouse.click(5, page.viewportSize().height - 5); // padding area of the fixed wrapper
      await expect(page.locator(MODAL)).toBeHidden();
    });

    test('v1 TC08 — modal re-opens repeatedly and from a card further down the list', async ({ page }, ti) => {
      const errs = watchErrors(page);
      await open(page, arm);
      for (let i = 0; i < 3; i++) {
        await clickShuttle(page, 0);
        await expect(page.locator(MODAL)).toBeVisible();
        await page.locator('.cre-t-20-close').click();
        await expect(page.locator(MODAL)).toBeHidden();
      }
      const n = await page.locator(VIS_SH).count();
      await clickShuttle(page, Math.min(n - 1, 12));
      await expect(page.locator(MODAL)).toBeVisible();
      const box = await page.locator('.cre-t-20-modal').boundingBox();
      const vp = page.viewportSize();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
      expect(await page.locator(MODAL).count()).toBe(1);
      await shot(page, ti, 'v1-tc08-modal-from-card-13');
      expect(errs).toEqual([]);
    });

    test('v1 TC09 — Escape key / background scroll behaviour (observational)', async ({ page }, ti) => {
      await open(page, arm);
      await clickShuttle(page, 0);
      const before = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(600);
      const after = await page.evaluate(() => window.scrollY);
      if (after !== before) note(ti, `Background page scrolls while the modal is open (scrollY ${before} → ${after}); no scroll lock.`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const openAfterEsc = await modalOpen(page);
      if (openAfterEsc) note(ti, 'Escape does not close the modal.');
      await ti.attach('result', { body: JSON.stringify({ scrollBefore: before, scrollAfter: after, openAfterEsc }), contentType: 'application/json' });
    });
  });
}

// Re-render triggers. LOTUS-16 rebuilds its clone feed on these; Test 20 must still be on every visible card.
for (const arm of ARMS.filter((a) => a.key !== 'control')) {
  test(`LOTUS20 ${arm.key} TC10 — sort change (feed → native list): shuttle on every visible card, no dupes`, async ({ page }, ti) => {
    await open(page, arm);
    const sort = page.locator('[data-filter="sort"]:visible').first();
    await sort.scrollIntoViewIfNeeded();
    await sort.click();
    await page.waitForTimeout(800);
    await page.locator('button:visible', { hasText: /^\s*High price first\s*$/ }).first().click();
    await page.waitForTimeout(3000);
    await closeDatePicker(page);
    const r = await scanVisible(page);
    await ti.attach('scan', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
    expectShuttleOnEveryVisibleCard(r);
    if (arm.key === 'v1') {
      await clickShuttle(page, 0);
      await expect(page.locator(MODAL)).toBeVisible();
      expect(await page.locator(MODAL).count()).toBe(1);
    }
    await shot(page, ti, `${arm.key}-tc10-after-sort`);
  });

  test(`LOTUS20 ${arm.key} TC11 — currency change ISK→EUR (feed rebuild): shuttle on every visible card, no dupes`, async ({ page }, ti) => {
    await open(page, arm);
    if (isMobile(ti)) {
      const menu = page.locator('header button:visible').last();
      await menu.click(); await page.waitForTimeout(800);
    }
    await page.locator('button[aria-label="Currency"]:visible').first().click();
    await page.waitForTimeout(800);
    await page.getByText(/^EUR\b/).filter({ visible: true }).first().click();
    await page.waitForTimeout(4000); // LOTUS-16 rebuilds at +500ms and +1500ms
    await closeDatePicker(page);
    await page.keyboard.press('Escape').catch(() => {});
    const r = await scanVisible(page);
    const price = await page.locator(`${CARDS} [card-price-currency]`).filter({ visible: true }).first().textContent().catch(() => '');
    await ti.attach('scan', { body: JSON.stringify({ price, ...r }, null, 2), contentType: 'application/json' });
    expectShuttleOnEveryVisibleCard(r);
    await shot(page, ti, `${arm.key}-tc11-after-currency`);
  });

  test(`LOTUS20 ${arm.key} TC12 — date "Update" (feed cleared + rebuilt): shuttle on every visible card, no dupes`, async ({ page }, ti) => {
    await open(page, arm);
    // re-open the collapsed "Rental time" summary via its edit (sliders) button, then confirm
    await page.locator('div', { has: page.getByText('Rental time', { exact: true }) }).filter({ has: page.locator('button:visible') }).last().locator('button:visible').first().click();
    await page.waitForTimeout(1000);
    const upd = page.locator('[data-action="confirm-dates"]:visible').first();
    await expect(upd).toBeVisible();
    await upd.click({ force: true });
    await page.waitForTimeout(1500);
    await settleFeed(page);
    await page.waitForTimeout(1500);
    await closeDatePicker(page);
    const r = await scanVisible(page);
    await ti.attach('scan', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
    expectShuttleOnEveryVisibleCard(r);
    await shot(page, ti, `${arm.key}-tc12-after-update`);
  });

  // Audience: English users only — switch to Deutsch, nothing should be injected.
  test(`LOTUS20 ${arm.key} TC13 — not applied on non-English (Deutsch) listing page`, async ({ page }, ti) => {
    await open(page, arm);
    if (isMobile(ti)) {
      await page.locator('header button:visible').last().click().catch(() => {}); // hamburger
      await page.waitForTimeout(800);
    }
    await page.locator('button[aria-label="Language"]:visible').first().click();
    await page.waitForTimeout(800);
    await page.getByText('Deutsch', { exact: true }).filter({ visible: true }).first().click();
    await page.waitForFunction(() => document.documentElement.lang !== 'en-us', null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(6000);
    const r = await page.evaluate(({ CARDS, SH }) => {
      const vis = (e) => e.getBoundingClientRect().height > 0;
      return { url: location.href, lang: document.documentElement.lang, cards: document.querySelectorAll(CARDS).length, sh: document.querySelectorAll(SH).length, shVisible: [...document.querySelectorAll(SH)].filter(vis).length };
    }, { CARDS, SH });
    await ti.attach('de', { body: JSON.stringify(r), contentType: 'application/json' });
    expect(r.lang).not.toBe('en-us');
    expect(r.cards).toBeGreaterThan(0);
    expect(r.shVisible, 'English shuttle line visible on the German page').toBe(0);
    if (r.sh) note(ti, `In-app switch to Deutsch leaves ${r.sh} hidden .cre-t-20-Shuttle-details nodes in the DOM (observer keeps running; CSS is en-us scoped so nothing shows). Direct load of /de/ injects nothing.`);
    await closeDatePicker(page);
    await shot(page, ti, `${arm.key}-tc13-deutsch`);
  });
}
