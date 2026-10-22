// SWF166 (cre-t-166) — Renters Insurance Gurus — Move Liberty Mutual to #1 (30 geo states)
// Experiment 100052988: control 1000257707 (30%), V1 1000257708 (70%).
// The audience is geo-targeted (30 US states via convert.getUserData().geo.state). QA runs from
// outside the US, so the Convert bundle is patched in-flight to make the TX check return true —
// everything else (URL location rules, audience, bucketing, deployed variation code) stays real.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://rentersinsurancegurus.com';
const EXP = '100052988';
const ARMS = { control: '1000257707', v1: '1000257708' };
// Round 2 (2026-10-21): the /home/ location rule is now https, so /home/ runs unpatched.
// (Round 1 used a 'home-fixed' entry with fixHome: true to patch the http:// rule.)
const PAGES = [
  { p: '/', label: 'root' },
  { p: '/home/', label: 'home' },
  { p: '/comparison/', label: 'comparison' },
];
const LIB = 'outbound-partner-clicks-Liberty-Mutual-Listing-Only';
const LEM = 'outbound-partner-clicks-Lemonade-Listing-Only';
const LIB_AFF = 'https://go.rentersinsurancegurus.com/9W598/41NTW2/?sub1=Guru';
const LEM_AFF = 'https://go.rentersinsurancegurus.com/9W598/2F8LBL/?sub1=Guru';
const REST = ['Farmers', 'USAA', 'State-Farm', 'Progressive', 'Allstate'];
const SWF166_GOALS = ['100038330', '100038331'];
const affOffer = u => (u || '').split('?')[0];
const attributed = u => {
  const q = new URL(u || 'about:blank').searchParams;
  return (q.get('sub3') || '').split(',').includes(EXP) && (q.get('sub4') || '').split(',').includes(ARMS.v1);
};

const SHOT_ROOT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'swf166-screenshots');

function shotDir(info) {
  const d = path.join(SHOT_ROOT, info.project.name.replace(/[^\w]+/g, '-').toLowerCase());
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function open(page, arm, pg) {
  const p = pg.p;
  await page.route(/convertexperiments\.com\/v1\/js\/.*\.js/, async route => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.split("window.convert.getUserData().geo.state == 'TX'").join('true');
    if (pg.fixHome) body = body.split(String.raw`http:\/\/rentersinsurancegurus.com\/home\/`).join(String.raw`https:\/\/rentersinsurancegurus.com\/home\/`);
    await route.fulfill({ response: res, body });
  });
  // Flicker probe: every animation frame, record whether Lemonade is painted above Liberty.
  await page.addInitScript(([LIB, LEM]) => {
    window.__flick = { lemFirstFrames: 0, libFirstFrames: 0, firstLemFirstAt: null, lastLemFirstAt: null, firstLibFirstAt: null };
    const tick = () => {
      const t = document.querySelector('[data-unique="comparison-table"]');
      const lib = t && t.querySelector(':scope > [data-unique="' + LIB + '"]');
      const lem = t && t.querySelector(':scope > [data-unique="' + LEM + '"]');
      if (lib && lem && lib.offsetHeight > 0 && lem.offsetHeight > 0) {
        const now = Math.round(performance.now());
        if (lem.getBoundingClientRect().top < lib.getBoundingClientRect().top) {
          window.__flick.lemFirstFrames++;
          if (window.__flick.firstLemFirstAt === null) window.__flick.firstLemFirstAt = now;
          window.__flick.lastLemFirstAt = now;
        } else {
          window.__flick.libFirstFrames++;
          if (window.__flick.firstLibFirstAt === null) window.__flick.firstLibFirstAt = now;
        }
      }
      if (performance.now() < 15000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [LIB, LEM]);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${BASE}${p}?cro_mode=qa&_conv_eforce=${EXP}.${ARMS[arm]}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(4000);
  return errors;
}

// Visible listings in rendered (visual) order
async function listing(page) {
  return page.evaluate(() => {
    const t = document.querySelector('[data-unique="comparison-table"]');
    return [...t.children].filter(c => c.offsetHeight > 0).map(c => {
      const n = c.querySelector('.plan-number');
      const after = n ? getComputedStyle(n, '::after').content.replace(/"/g, '') : '';
      const own = n ? parseFloat(getComputedStyle(n).fontSize) : 0;
      return {
        du: c.getAttribute('data-unique'),
        top: c.getBoundingClientRect().top + scrollY,
        shownNumber: after && after !== 'none' && after !== 'normal' ? after : (own > 0 ? n.textContent.trim() : ''),
        bars: [...c.querySelectorAll('.rating-bar')].filter(b => b.offsetHeight > 0).map(b => b.innerText.replace(/\s+/g, ' ').trim()),
        trust: (c.querySelector('.trustpilot-image') || {}).src || '',
        hrefs: [...c.querySelectorAll('a.rt-aff-link, a.ct-link-button')].map(a => a.getAttribute('href')),
      };
    }).sort((a, b) => a.top - b.top);
  });
}

async function convertState(page) {
  return page.evaluate(exp => {
    const cd = window.convert && window.convert.currentData;
    const e = cd && cd.experiences && cd.experiences[exp];
    return { bucketed: !!e, variation: e && e.variation && String(e.variation.id), body166: document.body.classList.contains('cre-t-166') };
  }, EXP);
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
async function mousedownGoals(page, selector) {
  return page.evaluate(sel => {
    window.__goals = [];
    const el = document.querySelector(sel);
    if (!el) return null;
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return window.__goals.slice();
  }, selector);
}

async function openExitModal(page, isMobile) {
  if (!isMobile) {
    await page.mouse.move(600, 300);
    await page.waitForTimeout(300);
    await page.mouse.move(600, 5, { steps: 5 });
    await page.mouse.move(600, -10);
    await page.evaluate(() => document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientY: -5, bubbles: false })));
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { clientY: -5, relatedTarget: null, bubbles: true })));
    await page.waitForTimeout(1200);
  }
  const visible = await page.locator('.oxy-modal-backdrop').evaluate(m => getComputedStyle(m).display !== 'none' && m.offsetHeight > 0).catch(() => false);
  if (!visible) {
    // Exit intent cannot fire on touch devices: force-show to verify content only.
    await page.evaluate(() => { const m = document.querySelector('.oxy-modal-backdrop'); m.classList.add('live'); m.style.display = 'flex'; });
    await page.waitForTimeout(500);
  }
  return visible;
}

async function modalState(page) {
  return page.evaluate(() => {
    const m = document.querySelector('.oxy-modal-backdrop');
    const vis = el => el && el.offsetHeight > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
    return {
      logos: [...m.querySelectorAll('img')].filter(vis).map(i => i.getAttribute('alt')),
      lead: (m.querySelector('h2 + p') || {}).innerText,
      buttons: [...m.querySelectorAll('a.rt-aff-link')].filter(vis).map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') })),
    };
  });
}

for (const pg of PAGES) {
  const p = pg.label;
  test.describe(`SWF166 ${p}`, () => {
    test(`C01 control ${p}: unchanged (no cre-t-166, native order kept)`, async ({ page }, info) => {
      const errors = await open(page, 'control', pg);
      const st = await convertState(page);
      const rows = await listing(page);
      await page.screenshot({ path: path.join(shotDir(info), `control-${p}-fold.png`) });
      await page.locator('[data-unique="comparison-table"]').screenshot({ path: path.join(shotDir(info), `control-${p}-listings.png`) }).catch(() => {});
      info.annotations.push({ type: 'data', description: JSON.stringify({ st, order: rows.map(r => r.du.replace('outbound-partner-clicks-', '').replace('-Listing-Only', '')), errors }) });
      expect(st.bucketed, 'bucketed into 100052988').toBe(true);
      expect(st.variation).toBe(ARMS.control);
      expect(st.body166).toBe(false);
      expect(await page.locator('.cre-t-166-rating-bar, .cre-t-166-image-wrapper, .cre-t-166-button-container').count()).toBe(0);
      expect(rows.map(r => r.shownNumber)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    });

    // Round 2: control now carries its own goal code ("cre-t-166-goal") for the per-partner goals.
    test(`C02 control ${p}: per-partner outbound goals fire on the right links only`, async ({ page }, info) => {
      await open(page, 'control', pg);
      await spyGoals(page);
      const libCta = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LIB}"] .plan-button-container a`);
      const lemCta = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LEM}"] .plan-button-container a`);
      const boCta = await mousedownGoals(page, '[data-unique="best-overall"] .plan-button-container a');
      const modalLem = await mousedownGoals(page, '.oxy-modal-backdrop a.rt-aff-link');
      const libPhone = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LIB}"] a[href^="tel:"]`);
      const lemBlank = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LEM}"] .plan-detail-heading`);
      const r = { libCta, lemCta, boCta, modalLem, libPhone, lemBlank };
      info.annotations.push({ type: 'data', description: JSON.stringify(r) });
      const only = arr => (arr || []).filter(g => SWF166_GOALS.includes(g));
      expect(only(lemCta), 'control Lemonade listing CTA').toEqual(['100038330']);
      expect(only(libCta), 'control Liberty listing CTA').toEqual(['100038331']);
      expect(only(boCta), 'control Best Overall (Lemonade) CTA').toEqual(['100038330']);
      expect(only(libPhone), 'phone (tel:) link is not an outbound partner click').toEqual([]);
      expect(only(lemBlank), 'non-link area of the card is not an outbound partner click').toEqual([]);
      expect(only(modalLem), 'control modal "Visit Lemonade" CTA').toEqual(['100038330']);
    });

    test(`V01 v1 ${p}: bucketed + body class (location rule matches)`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      const st = await convertState(page);
      info.annotations.push({ type: 'data', description: JSON.stringify(st) });
      expect(st.bucketed, `Convert did not bucket ${p} into ${EXP}`).toBe(true);
      expect(st.variation).toBe(ARMS.v1);
      expect(st.body166).toBe(true);
    });

    if (pg.targetingOnly) return;

    test(`V02 v1 ${p}: Liberty #1, Lemonade #2, rest unchanged, numbers 1-7 sequential`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      const rows = await listing(page);
      await page.locator('[data-unique="comparison-table"]').screenshot({ path: path.join(shotDir(info), `v1-${p}-listings.png`) });
      await page.screenshot({ path: path.join(shotDir(info), `v1-${p}-fold.png`) });
      const names = rows.map(r => r.du.replace('outbound-partner-clicks-', '').replace('-Listing-Only', ''));
      info.annotations.push({ type: 'data', description: JSON.stringify({ names, numbers: rows.map(r => r.shownNumber) }) });
      expect(names).toEqual(['Liberty-Mutual', 'Lemonade', ...REST]);
      expect(rows.map(r => r.shownNumber)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    });

    test(`V03 v1 ${p}: yellow App Store bar moved to Liberty — 4.8 / 499,000, exactly one`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      const rows = await listing(page);
      const lib = rows.find(r => r.du === LIB), lem = rows.find(r => r.du === LEM);
      const card = page.locator(`[data-unique="comparison-table"] > [data-unique="${LIB}"]`);
      await card.scrollIntoViewIfNeeded().catch(() => {});
      await card.screenshot({ path: path.join(shotDir(info), `v1-${p}-liberty-card.png`) });
      const overflow = await page.evaluate(sel => {
        const b = [...document.querySelectorAll(sel)].find(x => x.offsetHeight > 0);
        return b ? b.scrollWidth - b.clientWidth : null;
      }, `[data-unique="comparison-table"] > [data-unique="${LIB}"] .rating-bar`);
      info.annotations.push({ type: 'data', description: JSON.stringify({ libBars: lib.bars, lemBars: lem.bars, overflow }) });
      expect(lem.bars, 'Lemonade must have no visible yellow bar').toEqual([]);
      expect(lib.bars.length, 'Liberty must have exactly one visible yellow bar').toBe(1);
      expect(lib.bars[0]).toContain('499,000');
      expect(lib.bars[0]).toContain('people ranked Liberty Mutual as 4.8 on');
      expect(overflow, 'bar content overflows').toBeLessThanOrEqual(1);
    });

    test(`V04 v1 ${p}: affiliate links follow the partner in the listing`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      const rows = await listing(page);
      const lib = rows.find(r => r.du === LIB), lem = rows.find(r => r.du === LEM);
      info.annotations.push({ type: 'data', description: JSON.stringify({ lib: lib.hrefs, lem: lem.hrefs, trust: rows.slice(0, 2).map(r => r.trust.split('/').pop()) }) });
      expect(lib.hrefs.length).toBeGreaterThan(0);
      lib.hrefs.forEach(h => expect(h).toBe(LIB_AFF));
      lem.hrefs.forEach(h => expect(h).toBe(LEM_AFF));
      // TrustScore badge is position-based on this site (#1 = 4.90, #2 = 4.7 — matches native /comparison/)
      expect(rows[0].trust).toContain('4.90-trustscore');
      expect(rows[1].trust).toContain('4.7-trustscore');
    });

    test(`V05 v1 ${p}: "Best Overall" listing at the bottom is Liberty Mutual`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      const bo = page.locator('[data-unique="best-overall"]');
      await bo.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await bo.screenshot({ path: path.join(shotDir(info), `v1-${p}-best-overall.png`) });
      const ref = await page.evaluate(LIB => {
        const c = document.querySelector('[data-unique="comparison-table"] > [data-unique="' + LIB + '"]');
        return { details: [...c.querySelectorAll('.plan-detail-content')].map(x => x.innerText.trim()), bullets: c.querySelector('.plan-description-container ul').innerText.replace(/\s+/g, ' ').trim() };
      }, LIB);
      const d = await bo.evaluate(el => ({
        details: [...el.querySelectorAll('.plan-detail-content')].map(x => x.innerText.trim()),
        bullets: ((el.querySelector('.plan-description-container ul') || {}).innerText || '').replace(/\s+/g, ' ').trim(),
        kid: el.firstElementChild && el.firstElementChild.getAttribute('data-unique'),
        alt: [...el.querySelectorAll('img')].map(i => i.getAttribute('alt')).join('|'),
        src: [...el.querySelectorAll('img')].map(i => i.getAttribute('src')).join('|'),
        hrefs: [...el.querySelectorAll('a.rt-aff-link, a.ct-link-button')].map(a => a.getAttribute('href')),
        text: el.innerText.replace(/\s+/g, ' '),
      }));
      info.annotations.push({ type: 'data', description: JSON.stringify({ ...d, ref }) });
      expect(d.kid).toBe(LIB);
      expect(d.alt).toMatch(/liberty/i);
      expect(d.src).toContain('liberty-mutual-logo');
      d.hrefs.forEach(h => expect(h).toBe(LIB_AFF));
      expect(d.details, 'plan cost / property / liability match the Liberty listing').toEqual(ref.details);
      expect(d.bullets, 'description bullets match the Liberty listing').toBe(ref.bullets);
      expect(d.text).not.toMatch(/Lemonade/);
      expect(d.text).toContain('Best Overall');
    });

    test(`V06 v1 ${p}: exit modal promotes Liberty Mutual`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      const fired = await openExitModal(page, !!info.project.use.isMobile);
      await page.screenshot({ path: path.join(shotDir(info), `v1-${p}-exit-modal.png`) });
      const m = await modalState(page);
      info.annotations.push({ type: 'data', description: JSON.stringify({ exitIntentFired: fired, ...m }) });
      expect(m.logos).toEqual(['Liberty Mutual']);
      expect(m.lead).toMatch(/^Liberty Mutual is an excellent option/);
      expect(m.lead).not.toMatch(/Lemonade/);
      expect(m.buttons).toEqual([{ text: 'Visit Liberty Mutual', href: LIB_AFF }]);
    });

    test(`V07 v1 ${p}: outbound-click goals — per-partner incl. modal`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      await spyGoals(page);
      const libCta = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LIB}"] .plan-button-container a`);
      const lemCta = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LEM}"] .plan-button-container a`);
      const boCta = await mousedownGoals(page, '[data-unique="best-overall"] .plan-button-container a');
      const modalLib = await mousedownGoals(page, '.cre-t-166-button-container a');
      const libPhone = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LIB}"] a[href^="tel:"]`);
      const libBlank = await mousedownGoals(page, `[data-unique="comparison-table"] > [data-unique="${LIB}"] .plan-detail-heading`);
      const r = { libCta, lemCta, boCta, modalLib, libPhone, libBlank };
      info.annotations.push({ type: 'data', description: JSON.stringify(r) });
      // generic "all outbound" goal is wired by Convert global JS
      expect(libCta).toContain('100036136');
      expect(modalLib).toContain('100036136');
      // SWF166 per-partner goals attached to the experiment must fire somewhere
      const only = arr => (arr || []).filter(g => SWF166_GOALS.includes(g));
      const libSwf = only(libCta), lemSwf = only(lemCta);
      expect(libSwf.length, 'Liberty listing CTA fires no SWF166 partner goal').toBe(1);
      expect(lemSwf.length, 'Lemonade listing CTA fires no SWF166 partner goal').toBe(1);
      expect(libSwf[0]).not.toBe(lemSwf[0]);
      expect(only(boCta), 'Best Overall (Liberty) CTA').toEqual(libSwf);
      expect(only(libPhone), 'phone (tel:) link is not an outbound partner click').toEqual([]);
      expect(only(libBlank), 'non-link area of the card is not an outbound partner click').toEqual([]);
      expect(only(modalLib), 'Modal "Visit Liberty Mutual" CTA').toEqual(libSwf);
    });

    test(`V08 v1 ${p}: no flash of Lemonade-first order + no JS errors`, async ({ page }, info) => {
      const errors = await open(page, 'v1', pg);
      const f = await page.evaluate(() => window.__flick);
      const flashMs = f.firstLemFirstAt !== null && f.firstLibFirstAt !== null ? f.firstLibFirstAt - f.firstLemFirstAt : 0;
      info.annotations.push({ type: 'data', description: JSON.stringify({ ...f, flashMs, errors }) });
      expect(errors, 'JS errors on V1').toEqual([]);
      expect(f.lemFirstFrames, `Lemonade painted above Liberty for ${f.lemFirstFrames} frames (~${flashMs}ms)`).toBe(0);
    });

    // ---- Round 3 (2026-10-22): extra functional coverage ----

    // Real clicks (not synthetic mousedown). Affiliate hops are stubbed so QA never logs a click on the partner network.
    test(`V09 v1 ${p}: real CTA clicks open the right partner (listing #1/#2, Best Overall)`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      await page.context().route(/go\.rentersinsurancegurus\.com/, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>stub' }));
      const clickTo = async sel => {
        const a = page.locator(sel).first();
        await a.scrollIntoViewIfNeeded();
        const [pop] = await Promise.all([page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null), a.click()]);
        const url = pop ? pop.url() : page.url();
        if (pop) await pop.close(); else await page.goBack().catch(() => {});
        return url;
      };
      const r = {
        first: await clickTo('[data-unique="comparison-table"] > [data-unique="' + LIB + '"] .plan-button-container a'),
        firstLogo: await clickTo('[data-unique="comparison-table"] > [data-unique="' + LIB + '"] a.provider-link'),
        second: await clickTo('[data-unique="comparison-table"] > [data-unique="' + LEM + '"] .plan-button-container a'),
        bestOverall: await clickTo('[data-unique="best-overall"] .plan-button-container a'),
      };
      info.annotations.push({ type: 'data', description: JSON.stringify(r) });
      // The site's own click handler ($('.rt-aff-link').click) rewrites the href: sub1=page, sub5=Everflow cid,
      // sub3/sub4 = running Convert experiment / variation IDs. Check partner + V1 attribution, not the raw href.
      expect(affOffer(r.first)).toBe(affOffer(LIB_AFF));
      expect(affOffer(r.firstLogo)).toBe(affOffer(LIB_AFF));
      expect(affOffer(r.second)).toBe(affOffer(LEM_AFF));
      expect(affOffer(r.bestOverall)).toBe(affOffer(LIB_AFF));
      for (const u of Object.values(r)) expect(attributed(u), `click not attributed to ${EXP}/${ARMS.v1}: ${u}`).toBe(true);
    });

    test(`V10 v1 ${p}: listings #3-#7 identical to control + no horizontal overflow`, async ({ page }, info) => {
      await open(page, 'control', pg);
      const ctl = (await listing(page)).filter(r => ![LIB, LEM].includes(r.du));
      const p2 = await page.context().newPage();
      await open(p2, 'v1', pg);
      const v1 = (await listing(p2)).filter(r => ![LIB, LEM].includes(r.du));
      const ov = await p2.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth }));
      const strip = rs => rs.map(({ du, shownNumber, bars, trust, hrefs }) => ({ du, shownNumber, bars, trust: trust.split('/').pop(), hrefs }));
      info.annotations.push({ type: 'data', description: JSON.stringify({ ctl: strip(ctl), v1: strip(v1), ov }) });
      expect(strip(v1)).toEqual(strip(ctl));
      expect(ov.docW, 'page scrolls horizontally').toBeLessThanOrEqual(ov.vw);
    });

    test(`V11 v1 ${p}: exit modal — close works, re-open does not duplicate, Liberty CTA navigates`, async ({ page }, info) => {
      await open(page, 'v1', pg);
      await page.context().route(/go\.rentersinsurancegurus\.com/, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>stub' }));
      const mobile = !!info.project.use.isMobile;
      await openExitModal(page, mobile);
      const counts = () => page.evaluate(() => ['.cre-t-166-image-wrapper', '.cre-t-166-strong-text', '.cre-t-166-button-container'].map(s => document.querySelectorAll(s).length));
      const shown = () => page.locator('.oxy-modal-backdrop').evaluate(m => getComputedStyle(m).display !== 'none' && m.offsetHeight > 0);
      const c1 = await counts();
      await page.locator('.oxy-modal-backdrop .oxy-close-modal').click();
      await page.waitForTimeout(800);
      const afterClose = await shown();
      await openExitModal(page, mobile);
      const c2 = await counts();
      const btn = page.locator('.cre-t-166-button-container a');
      const box = await btn.boundingBox();
      const vp = page.viewportSize();
      const [req] = await Promise.all([page.waitForRequest(/go\.rentersinsurancegurus\.com/, { timeout: 8000 }).catch(() => null), btn.click()]);
      const r = { c1, afterClose, c2, box, vp, nav: req && req.url() };
      info.annotations.push({ type: 'data', description: JSON.stringify(r) });
      expect(c1).toEqual([1, 1, 1]);
      expect(afterClose, 'modal still visible after clicking X').toBe(false);
      expect(c2, 'injected modal content duplicated on re-open').toEqual([1, 1, 1]);
      expect(box && box.x >= 0 && box.x + box.width <= vp.width, 'Liberty modal CTA inside the viewport').toBe(true);
      expect(affOffer(r.nav)).toBe(affOffer(LIB_AFF));
      // native modal "Visit Lemonade" in control is attributed (sub3/sub4); the injected V1 button must be too
      expect(attributed(r.nav), 'modal Liberty click carries no sub3/sub4 experiment attribution').toBe(true);
    });

    test(`V12 v1 ${p}: keyboard Tab order follows the new visual order (Liberty before Lemonade)`, async ({ page }, info) => {
      test.skip(!!info.project.use.isMobile, 'keyboard Tab order is a desktop check');
      await open(page, 'v1', pg);
      await page.evaluate(() => { const t = document.querySelector('[data-unique="comparison-table"]'); t.setAttribute('tabindex', '-1'); t.focus(); });
      const seq = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        const du = await page.evaluate(() => { const c = document.activeElement.closest('[data-unique="comparison-table"] > *'); return c ? c.getAttribute('data-unique').replace('outbound-partner-clicks-', '').replace('-Listing-Only', '') : null; });
        if (du && seq[seq.length - 1] !== du) seq.push(du);
      }
      info.annotations.push({ type: 'data', description: JSON.stringify({ seq }) });
      expect(seq.slice(0, 2)).toEqual(['Liberty-Mutual', 'Lemonade']);
    });
  });
}
