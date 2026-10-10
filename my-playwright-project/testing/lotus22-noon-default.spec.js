// Lotus Car Rental — Test 22 — Sitewide — Show noon as default time (Convert exp 100052922)
// Spec: time dropdown shows 12:00 PM by default; V2 renames 12:00 PM to "Noon". Sitewide wherever the
// time selector is present. Run per project: npx playwright test testing/lotus22-noon-default.spec.js --project="Chrome Desktop"
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EXP = '100052922';
const ARMS = [
  { key: 'control', id: '1000257554', label: '12:00 PM', centers: false },
  { key: 'v1', id: '1000257555', label: '12:00 PM', centers: true },
  { key: 'v2', id: '1000257556', label: 'Noon', centers: true },
];
const BASE = 'https://www.lotuscarrental.is';
const q = (id) => `cro_mode=qa&_conv_eforce=${EXP}.${id}`;
const LIST = '[data-slot="popover-content"] .overflow-y-auto, .max-h-52.overflow-y-auto';
const TIME_ONLY = /^\s*(\d{1,2}:\d{2} (AM|PM)|Noon|Midnight)\s*$/;
const SHOT_ROOT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'lotus22-screenshots');

const isMobile = (ti) => /Mobile/.test(ti.project.name);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

async function shot(page, ti, name) {
  const dir = path.join(SHOT_ROOT, slug(ti.project.name));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file });
  await ti.attach(name, { path: file, contentType: 'image/png' });
}

function watchErrors(page) {
  const errs = [];
  // WebKit throws a native cross-origin error from the Prismic preview iframe on every arm incl. control — not test-related
  page.on('pageerror', (e) => { if (!/prismic\.io/.test(e.message)) errs.push(`pageerror: ${e.message}`); });
  page.on('console', (m) => { if (/lotus-22/.test(m.text())) errs.push(`console: ${m.text()}`); });
  return errs;
}

// Wait until Convert has bucketed this experience (it is injected late via GTM), then a settle period.
async function waitConvert(page) {
  await page.waitForFunction((exp) => {
    const e = window.convert && window.convert.currentData && window.convert.currentData.experiences;
    return !!(e && e[exp]);
  }, EXP, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: '.ch2{display:none!important}' }).catch(() => {}); // cookie banner hidden, no consent given
}

async function openHome(page, arm) {
  await page.goto(`${BASE}/?${q(arm.id)}`, { waitUntil: 'domcontentloaded' });
  await waitConvert(page);
}

// Desktop: popover trigger. Mobile: tap "Pick-up at" -> full-screen sheet; time buttons inside it.
async function openSheetIfMobile(page, ti) {
  if (!isMobile(ti)) return;
  await page.locator('button:visible', { hasText: 'Pick-up at' }).first().click();
  await page.waitForTimeout(1200);
}

function timeButton(page, ti, which) {
  if (!isMobile(ti)) return page.locator('[data-slot="popover-trigger"]', { hasText: which === 0 ? 'Pick-up time' : 'Drop-off time' }).first();
  return page.locator('button:visible').filter({ hasText: TIME_ONLY }).nth(which);
}

async function readFieldTexts(page, ti) {
  if (!isMobile(ti)) {
    return Promise.all([0, 1].map(async (i) => (await timeButton(page, ti, i).textContent()).replace(/Pick-up time|Drop-off time/, '').trim()));
  }
  return Promise.all([0, 1].map(async (i) => (await timeButton(page, ti, i).textContent()).trim()));
}

async function openList(page, ti, which) {
  const btn = timeButton(page, ti, which);
  await btn.scrollIntoViewIfNeeded();
  if (isMobile(ti)) {
    // the sheet keeps a calendar/time popover open (fixed full-screen backdrop); tap a blank area until it is gone
    for (let i = 0; i < 3 && await page.locator('div.fixed.inset-0').filter({ visible: true }).count(); i++) {
      await page.mouse.click(8, 300);
      await page.waitForTimeout(600);
    }
  }
  const before = await page.evaluate(() => window.scrollY);
  await btn.click();
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => window.scrollY);
  return { pageScrollDelta: Math.abs(after - before) };
}

function readList(page) {
  return page.evaluate((sel) => {
    const list = [...document.querySelectorAll(sel)].find((l) => l.getClientRects().length && /\d:\d\d|Noon/.test(l.textContent));
    if (!list) return null;
    const lr = list.getBoundingClientRect();
    const btns = [...list.querySelectorAll('button')];
    const sel2 = btns.find((b) => b.classList.contains('bg-accent'));
    const opt = (b) => (b.querySelector('span') ? b.querySelector('span').textContent : b.textContent).trim();
    let centerOffset = null; let selVisible = false;
    if (sel2) {
      const r = sel2.getBoundingClientRect();
      centerOffset = Math.round((r.top + r.height / 2) - (lr.top + lr.height / 2));
      selVisible = r.top >= lr.top - 1 && r.bottom <= lr.bottom + 1;
    }
    return {
      count: btns.length, options: btns.map(opt), selected: sel2 ? opt(sel2) : null, selVisible, centerOffset,
      rowHeight: sel2 ? Math.round(sel2.getBoundingClientRect().height) : null, scrollTop: Math.round(list.scrollTop),
      visible: btns.filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > lr.top + 2 && r.top < lr.bottom - 2; }).map(opt),
    };
  }, LIST);
}

const CONTROL_FIRST = ['12:00 AM', '12:30 AM', '1:00 AM'];

for (const arm of ARMS) {
  test.describe(`Lotus 22 — ${arm.key}`, () => {
    test(`TC01 ${arm.key}: bucketed into correct variation + closed fields show "${arm.label}"`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await openHome(page, arm);
      const bucket = await page.evaluate((exp) => window.convert?.currentData?.experiences?.[exp]?.variation?.id || null, EXP);
      expect.soft(bucket, 'Convert variation id').toBe(arm.id);
      await openSheetIfMobile(page, ti);
      const [pick, drop] = await readFieldTexts(page, ti);
      await shot(page, ti, `${arm.key}-tc01-closed-fields`);
      expect.soft(pick, 'pick-up time field').toBe(arm.label);
      expect.soft(drop, 'drop-off time field').toBe(arm.label);
      expect.soft(errs, 'JS errors').toEqual([]);
    });

    for (const [which, name] of [[0, 'pick-up'], [1, 'drop-off']]) {
      test(`TC0${2 + which} ${arm.key}: ${name} dropdown opens on "${arm.label}"${arm.centers ? ', centered' : ' (baseline: list at top)'}`, async ({ page }, ti) => {
        const errs = watchErrors(page);
        await openHome(page, arm);
        await openSheetIfMobile(page, ti);
        const { pageScrollDelta } = await openList(page, ti, which);
        const l = await readList(page);
        await shot(page, ti, `${arm.key}-tc0${2 + which}-${name}-open`);
        ti.annotations.push({ type: 'list', description: JSON.stringify({ ...l, options: undefined }) });
        expect(l, 'time list rendered').not.toBeNull();
        expect.soft(l.selected, 'selected option').toBe(arm.label);
        expect.soft(l.count, 'option count unchanged (45)').toBe(45);
        if (arm.centers) {
          expect.soft(l.selVisible, `"${arm.label}" fully visible on open`).toBe(true);
          expect.soft(Math.abs(l.centerOffset), `"${arm.label}" centered (offset px, row=${l.rowHeight})`).toBeLessThanOrEqual(Math.ceil(l.rowHeight / 2));
        } else {
          expect.soft(l.scrollTop, 'control: list opens at the top (native behaviour)').toBe(0);
        }
        expect.soft(pageScrollDelta, 'page itself must not scroll when list opens').toBeLessThanOrEqual(2);
        // option text: only 12:00 PM may change, and only in V2
        const norm = l.options.map((o) => o.replace(/Self Service$/, '').trim());
        expect.soft(norm.slice(0, 3), '12:00 AM option must stay "12:00 AM" (spec only renames noon)').toEqual(CONTROL_FIRST);
        expect.soft(norm.filter((o) => o === '12:00 PM').length, '"12:00 PM" option count').toBe(arm.key === 'v2' ? 0 : 1);
        expect.soft(norm.filter((o) => o === 'Noon').length, '"Noon" option count').toBe(arm.key === 'v2' ? 1 : 0);
        expect.soft(errs, 'JS errors').toEqual([]);
      });
    }

    test(`TC04 ${arm.key}: change time to 3:00 PM, reopen, then back to "${arm.label}"`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await openHome(page, arm);
      await openSheetIfMobile(page, ti);
      await openList(page, ti, 0);
      await page.locator(`${LIST.split(',')[1]} button:visible`).filter({ hasText: /^3:00 PM/ }).first().click();
      await page.waitForTimeout(800);
      const [pick1] = await readFieldTexts(page, ti);
      expect.soft(pick1, 'field after picking 3:00 PM').toBe('3:00 PM');
      await openList(page, ti, 0);
      const l = await readList(page);
      await shot(page, ti, `${arm.key}-tc04-reopen-3pm`);
      expect.soft(l.selected, 'selected after change').toBe('3:00 PM');
      if (arm.centers) expect.soft(l.selVisible, '3:00 PM visible on reopen').toBe(true);
      await page.locator(`${LIST.split(',')[1]} button:visible`).filter({ hasText: new RegExp(`^${arm.label}`) }).first().click();
      await page.waitForTimeout(800);
      const [pick2, drop2] = await readFieldTexts(page, ti);
      await shot(page, ti, `${arm.key}-tc04-back-to-noon`);
      expect.soft(pick2, `field after picking ${arm.label} again`).toBe(arm.label);
      expect.soft(drop2, 'drop-off untouched').toBe(arm.label);
      expect.soft(errs, 'JS errors').toEqual([]);
    });

    test(`TC05 ${arm.key}: booking page /rent-a-car-in-iceland (direct load) — time selector shows "${arm.label}"`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await page.goto(`${BASE}/rent-a-car-in-iceland?${q(arm.id)}`, { waitUntil: 'domcontentloaded' });
      await waitConvert(page);
      await page.waitForTimeout(2000);
      const running = await page.evaluate((exp) => Object.keys(window.convert?.currentData?.experiences || {}).includes(exp), EXP);
      const texts = await page.evaluate(() => [...document.querySelectorAll('body *')]
        .filter((e) => e.childElementCount === 0 && e.getClientRects().length && /(12:00 PM|Noon)/.test(e.textContent)).map((e) => e.textContent.trim()));
      await shot(page, ti, `${arm.key}-tc05-booking-page`);
      ti.annotations.push({ type: 'booking', description: JSON.stringify({ running, texts }) });
      expect.soft(running, `experience ${EXP} runs on the booking page (it has a time selector)`).toBe(true);
      const wrong = arm.key === 'v2' ? texts.filter((t) => /12:00 PM/.test(t)) : texts.filter((t) => /Noon/.test(t));
      expect.soft(wrong, `no visible time text contradicting "${arm.label}"`).toEqual([]);
      expect.soft(errs, 'JS errors').toEqual([]);
    });

    test(`TC06 ${arm.key}: homepage → fleet CTA → booking page keeps "${arm.label}"`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await openHome(page, arm);
      // desktop CTA has data-booking-element; mobile CTA is a plain "Search Now" link to the same page
      const cta = page.locator('[data-booking-element^="check-fleet"], a[href="/rent-a-car-in-iceland"]:has-text("Search Now")').filter({ visible: true }).first();
      ti.annotations.push({ type: 'cta-text', description: (await cta.textContent()).trim() });
      await cta.click();
      await page.waitForURL(/rent-a-car-in-iceland/, { timeout: 30000 });
      await waitConvert(page);
      await page.waitForTimeout(2000);
      const texts = await page.evaluate(() => [...document.querySelectorAll('body *')]
        .filter((e) => e.childElementCount === 0 && e.getClientRects().length && /(12:00 PM|Noon)/.test(e.textContent)).map((e) => e.textContent.trim()));
      await shot(page, ti, `${arm.key}-tc06-home-to-booking`);
      ti.annotations.push({ type: 'booking-texts', description: JSON.stringify(texts) });
      expect.soft(texts.length, 'booking page shows the rental time').toBeGreaterThan(0);
      const wrong = arm.key === 'v2' ? texts.filter((t) => /12:00 PM/.test(t)) : texts.filter((t) => /Noon/.test(t));
      expect.soft(wrong, `no visible time text contradicting "${arm.label}"`).toEqual([]);
      expect.soft(errs, 'JS errors').toEqual([]);
    });

    test(`TC07 ${arm.key}: flicker — how long the unmodified time is visible before the variation applies`, async ({ page }, ti) => {
      await page.goto(`${BASE}/?${q(arm.id)}`, { waitUntil: 'commit' });
      const t = await page.evaluate(async (exp) => {
        const t0 = performance.now();
        let fieldSeen = null; let applied = null;
        while (performance.now() - t0 < 30000) {
          const trig = [...document.querySelectorAll('[data-slot="popover-trigger"]')].find((x) => /Pick-up time/.test(x.textContent));
          if (trig && fieldSeen === null) fieldSeen = performance.now();
          if (window.convert?.currentData?.experiences?.[exp]) { applied = performance.now(); break; }
          await new Promise((r) => setTimeout(r, 50));
        }
        const nav = performance.getEntriesByType('navigation')[0];
        return { fieldVisibleMs: fieldSeen && Math.round(fieldSeen), convertAppliedMs: applied && Math.round(applied), dclMs: Math.round(nav.domContentLoadedEventEnd), loadMs: Math.round(nav.loadEventEnd) };
      }, EXP);
      t.unmodifiedWindowMs = t.convertAppliedMs && t.fieldVisibleMs ? t.convertAppliedMs - t.fieldVisibleMs : null;
      ti.annotations.push({ type: 'timing', description: JSON.stringify(t) });
      if (arm.key !== 'control') {
        expect.soft(t.convertAppliedMs, 'Convert applied within 30s').not.toBeNull();
        expect.soft(t.unmodifiedWindowMs, 'original time visible before variation applies (ms) — target ≤ 1000').toBeLessThanOrEqual(1000);
      }
    });
  });
}
