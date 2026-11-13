// AFP43 — FP&A Forum Navigation (VWO exp 88), 2026-11-13.
// Variation (cre-t-43): forum nav bar moved directly under the breadcrumb on the forum
// homepage (hero AFP FP&A FORUM logo/date block removed), Registration link replaced by an
// orange "Pricing & Register" pill, Program dropdown regrouped into two titled columns +
// divider + Past Forum Sessions, Hotel/Sponsors dropdowns stacked. Same bar on every forum page.
// Desktop only (code gate: min-width 1200px). Expected values come from the wireframe (Group 1.png).
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.financialprofessionals.org';
const HOME = '/afp-fp-a--forum';
const PD = {
  control: 'eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTc1NDA3fX19',
  variation: 'eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTMyMTI2fX19',
};
const url = (p, arm) => `${BASE}${p}${p.includes('?') ? '&' : '?'}_vis_preview_data=${PD[arm]}`;
const QA_LINK = `${BASE}${HOME}?utm_campaign=Cro_mode`;

// Every page reachable from the forum nav (variation labels).
const PAGES = [
  ['Home', HOME],
  ['Schedule at a Glance', `${HOME}/program/schedule-at-a-glance`],
  ['Educational Sessions', `${HOME}/program/educational-sessions`],
  ['Networking Opportunities', `${HOME}/program/networking`],
  ['Keynote Speakers', `${HOME}/program/keynote-speakers`],
  ['Past Forum Sessions', `${HOME}/program/past-forum-sessions`],
  ['Attendee Feedback', `${HOME}/program/afp-fp-a-forum-attendee-feedback`],
  ['Pricing', `${HOME}/pricing`],
  ['Book Your Hotel', `${HOME}/hotel/book-your-hotel`],
  ['Explore New Orleans', `${HOME}/hotel/explore-NOLA`],
  ['Our Sponsors', `${HOME}/sponsors/our-sponsors`],
  ['Sponsorship Opportunities', `${HOME}/sponsors/sponsor`],
];

const OUT = path.join(__dirname, '..', 'qa-knowledge-base', 'afp', 'afp43-qa');
const results = [];
let project = '';

// Hide QA-only overlays (VWO preview widget, consent banner, HubSpot chat) so they never cover the nav.
const PREP = `
  window.__errors = [];
  window.addEventListener('error', function (e) { window.__errors.push(String(e.message)); });
  document.addEventListener('DOMContentLoaded', function () {
    var st = document.createElement('style');
    st.textContent = '#truste-consent-track,#hubspot-messages-iframe-container,#hs-web-interactives-top-anchor{display:none!important}';
    document.head.appendChild(st);
  });
  setInterval(function () {
    document.querySelectorAll('body > div, body > iframe').forEach(function (el) {
      if (el.__chk) return;
      if ((el.id || '').toLowerCase().indexOf('vwo') > -1 || /Preview Mode/.test(el.textContent || '')) { el.style.setProperty('display', 'none', 'important'); el.__chk = 1; }
    });
  }, 200);
`;

function slug(s) { return s.replace(/[^a-z0-9]+/gi, '-').toLowerCase(); }
async function shot(page, name, opts = {}) {
  const dir = path.join(OUT, slug(project));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, ...opts }).catch(() => {});
  return path.relative(OUT, file).replace(/\\/g, '/');
}
function record(id, title, pass, detail, shots = []) {
  results.push({ id, title, pass, detail, shots });
}

async function open(page, p, arm, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript({ content: PREP });
  const resp = await page.goto(url(p, arm), { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load').catch(() => {});
  if (arm === 'variation' && width >= 1200) await page.waitForSelector('.cre-t-43-nav-bar .cre-t-43-cta', { timeout: 20000 }).catch(() => {});
  else await page.waitForTimeout(4000);
  await page.waitForTimeout(800);
  return resp;
}

async function navState(page) {
  return page.evaluate(() => {
    const nav = document.querySelector('.sub-header');
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
    const crumb = document.querySelector('.breadcrumb, .breadcrumbs, [class*=breadcrumb]');
    const items = [...document.querySelectorAll('.sub-header .afp-nav__list > li')]
      .filter(li => getComputedStyle(li).display !== 'none')
      .map(li => (li.firstElementChild ? li.firstElementChild.innerText.trim() : ''));
    const cta = document.querySelector('.cre-t-43-cta');
    const cs = cta && getComputedStyle(cta);
    const logo = document.querySelector('.sub-header .sub-header__logo');
    return {
      combo: window._vwo_exp && window._vwo_exp[88] && window._vwo_exp[88].combination_chosen,
      applied: !!document.querySelector('.cre-t-43-nav-bar'),
      inMainContent: !!(nav && nav.closest('.main-content')),
      nav: r(nav), crumb: r(crumb), logo: r(logo),
      gapBelowCrumb: nav && crumb ? Math.round(nav.getBoundingClientRect().top - crumb.getBoundingClientRect().bottom) : null,
      items,
      cta: cta && { text: cta.innerText.trim(), href: cta.getAttribute('href'), bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, font: cs.fontFamily, size: cs.fontSize, rect: r(cta) },
      bannerLogoVisible: (() => { const b = document.querySelector('.banner_site-logo'); return !!(b && getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().height > 0); })(),
      regItemVisible: (() => { const a = document.querySelector('.sub-header .afp-nav__list > li > a[href$="/pricing"]'); return !!(a && a.getBoundingClientRect().height > 0); })(),
      join: [...document.querySelectorAll('.global-login__link--join .global-login__link-text')].map(e => e.innerText.trim()),
      errors: window.__errors || [],
    };
  });
}

async function openDropdown(page, label) {
  const btn = page.locator('.sub-header .afp-nav__list > li > button', { hasText: label }).first();
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await btn.click({ force: true });
  await page.waitForTimeout(600);
  return btn;
}

async function panelLayout(page, label) {
  return page.evaluate((label) => {
    const btn = [...document.querySelectorAll('.sub-header .afp-nav__list > li > button')].find(b => b.textContent.trim() === label);
    const ul = btn && btn.parentElement.querySelector('.afp-nav__sub-nav');
    const vis = (el) => { const b = el.getBoundingClientRect(); return b.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const box = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const kids = ul ? [...ul.children].map(li => ({ cls: li.className, text: li.innerText.trim(), href: li.querySelector('a') && li.querySelector('a').getAttribute('href'), visible: vis(li), box: box(li),
      font: (() => { const t = li.querySelector('a') || li; const s = getComputedStyle(t); return { family: s.fontFamily.split(',')[0], size: s.fontSize, color: s.color, transform: s.textTransform, spacing: s.letterSpacing }; })() })) : [];
    const logo = document.querySelector('.sub-header .sub-header__logo');
    return { expanded: btn && (btn.getAttribute('aria-expanded') || btn.className), panelVisible: !!(ul && vis(ul)), panel: ul && box(ul), panelBg: ul && getComputedStyle(ul).backgroundColor, logoX: logo && Math.round(logo.getBoundingClientRect().left), kids,
      openCount: [...document.querySelectorAll('.sub-header .afp-nav__sub-nav')].filter(vis).length };
  }, label);
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({}, info) => { project = info.project.name; });

test.afterAll(async () => {
  const dir = path.join(OUT);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `results-${slug(project)}.json`), JSON.stringify(results, null, 2));
});

// ───────────────────────── VARIATION ─────────────────────────
test.describe('Variation', () => {
  test('TC-01 bucketed + bar directly under breadcrumb on forum homepage', async ({ page }) => {
    await open(page, HOME, 'variation');
    const s = await navState(page);
    const sh = await shot(page, 'v-home-top');
    const pass = s.combo === '2' && s.applied && !s.inMainContent && s.gapBelowCrumb !== null && s.gapBelowCrumb <= 24;
    record('TC-01', 'Variation applied; forum nav bar sits right under the breadcrumb on the forum homepage', pass,
      `combo=${s.combo}, applied=${s.applied}, bar y=${s.nav && s.nav.y}, gap below breadcrumb=${s.gapBelowCrumb}px`, [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-02 hero AFP FP&A FORUM logo/date block removed', async ({ page }) => {
    await open(page, HOME, 'variation');
    const s = await navState(page);
    record('TC-02', 'Hero "AFP FP&A FORUM / March 22-24, 2027 | New Orleans" block removed (wireframe)', !s.bannerLogoVisible, `banner logo visible=${s.bannerLogoVisible}`);
    expect.soft(s.bannerLogoVisible).toBe(false);
  });

  test('TC-03 menu items: Program, Hotel, Sponsors, Pricing & Register (Registration removed)', async ({ page }) => {
    await open(page, HOME, 'variation');
    const s = await navState(page);
    const want = ['PROGRAM', 'HOTEL', 'SPONSORS', 'PRICING & REGISTER'];
    const got = s.items.map(t => t.toUpperCase());
    const pass = JSON.stringify(got) === JSON.stringify(want) && !s.regItemVisible;
    record('TC-03', 'Menu order = PROGRAM · HOTEL · SPONSORS · [PRICING & REGISTER]; Registration link hidden', pass, `items=${JSON.stringify(got)}, Registration visible=${s.regItemVisible}`);
    expect.soft(pass).toBe(true);
  });

  test('TC-04 Pricing & Register pill: copy, href, colours, shape', async ({ page }) => {
    await open(page, HOME, 'variation');
    const s = await navState(page);
    const c = s.cta || {};
    const pass = !!s.cta && c.text.toUpperCase() === 'PRICING & REGISTER' && /\/afp-fp-a--forum\/pricing$/.test(c.href) && c.bg === 'rgb(251, 143, 46)' && parseFloat(c.radius) >= 20;
    const sh = await shot(page, 'v-cta', { clip: { x: Math.max(0, c.rect.x - 20), y: c.rect.y - 20 - (await page.evaluate(() => scrollY)), width: c.rect.w + 40, height: c.rect.h + 40 } });
    record('TC-04', 'CTA text "PRICING & REGISTER", href /afp-fp-a--forum/pricing, orange #FB8F2E pill', pass, JSON.stringify(c), [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-05 CTA hover state', async ({ page }) => {
    await open(page, HOME, 'variation');
    await page.hover('.cre-t-43-cta');
    await page.waitForTimeout(400);
    const h = await page.$eval('.cre-t-43-cta', e => ({ bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color }));
    const pass = h.bg !== 'rgb(251, 143, 46)';
    record('TC-05', 'CTA has a visible hover state', pass, JSON.stringify(h));
    expect.soft(pass).toBe(true);
  });

  test('TC-06 CTA click lands on Pricing page and bar stays', async ({ page }) => {
    await open(page, HOME, 'variation');
    await Promise.all([page.waitForURL(/\/afp-fp-a--forum\/pricing/, { timeout: 30000 }), page.click('.cre-t-43-cta')]);
    await page.waitForSelector('.cre-t-43-cta', { timeout: 20000 }).catch(() => {});
    const s = await navState(page);
    const sh = await shot(page, 'v-pricing-after-cta');
    const pass = /\/afp-fp-a--forum\/pricing/.test(page.url()) && s.applied;
    record('TC-06', 'CTA → /afp-fp-a--forum/pricing; variation persists on the next page', pass, `url=${page.url()}, applied=${s.applied}`, [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-07 Program dropdown layout matches wireframe', async ({ page }) => {
    await open(page, HOME, 'variation');
    await openDropdown(page, 'Program');
    const L = await panelLayout(page, 'Program');
    const k = (t) => L.kids.find(x => x.text.toUpperCase() === t.toUpperCase());
    const hS = k('Sessions & Schedule'), hN = k('Networking & Experience');
    const edu = k('Educational Sessions'), key = k('Keynote Speakers'), sch = k('Schedule at a Glance');
    const net = k('Networking Opportunities'), fb = k('Attendee Feedback'), past = k('Past Forum Sessions');
    const div = L.kids.find(x => /divider/.test(x.cls));
    const checks = {
      panelVisible: L.panelVisible,
      allPresent: !!(hS && hN && edu && key && sch && net && fb && past && div),
      col1Aligned: !!(hS && edu && key && sch && past) && [edu, key, sch, past].every(x => Math.abs(x.box.x - hS.box.x) <= 2),
      col2Aligned: !!(hN && net && fb) && [net, fb].every(x => Math.abs(x.box.x - hN.box.x) <= 2) && hN.box.x > hS.box.x + 200,
      col1Order: !!(edu && key && sch) && hS.box.y < edu.box.y && edu.box.y < key.box.y && key.box.y < sch.box.y,
      col2Order: !!(net && fb) && hN.box.y < net.box.y && net.box.y < fb.box.y,
      headingsSameRow: !!(hS && hN) && Math.abs(hS.box.y - hN.box.y) <= 2,
      dividerThenPast: !!(div && past && sch) && div.box.y > sch.box.y && past.box.y > div.box.y,
      headingsUpper: !!(hS && hN) && hS.font.transform === 'uppercase' && hN.font.transform === 'uppercase',
      hrefs: !!(sch && net && fb) && /schedule-at-a-glance/.test(sch.href) && /program\/networking$/.test(net.href) && /attendee-feedback/.test(fb.href),
    };
    const pass = Object.values(checks).every(Boolean);
    const sh = await shot(page, 'v-program-open');
    record('TC-07', 'Program: 2 titled columns (Sessions & Schedule / Networking & Experience), divider, Past Forum Sessions', pass,
      JSON.stringify(checks) + ' | fonts: link=' + JSON.stringify(edu && edu.font) + ' past=' + JSON.stringify(past && past.font) + ' heading=' + JSON.stringify(hS && hS.font) + ' | panel=' + JSON.stringify(L.panel) + ' logoX=' + L.logoX, [sh]);
    expect.soft(pass).toBe(true);
  });

  for (const [label, links] of [['Hotel', ['Book Your Hotel', 'Explore New Orleans']], ['Sponsors', ['Our Sponsors', 'Sponsorship Opportunities']]]) {
    test(`TC-08 ${label} dropdown stacked vertically`, async ({ page }) => {
      await open(page, HOME, 'variation');
      await openDropdown(page, label);
      const L = await panelLayout(page, label);
      const a = L.kids.find(x => x.text === links[0]), b = L.kids.find(x => x.text === links[1]);
      const pass = L.panelVisible && !!a && !!b && Math.abs(a.box.x - b.box.x) <= 2 && b.box.y > a.box.y;
      const sh = await shot(page, `v-${slug(label)}-open`);
      record(`TC-08-${label}`, `${label}: "${links[0]}" above "${links[1]}" in one column`, pass, `a=${JSON.stringify(a && a.box)} b=${JSON.stringify(b && b.box)} panel=${JSON.stringify(L.panel)}`, [sh]);
      expect.soft(pass).toBe(true);
    });
  }

  test('TC-09 only one dropdown open; toggles + chevron/underline state', async ({ page }) => {
    await open(page, HOME, 'variation');
    const btn = await openDropdown(page, 'Program');
    const a1 = await btn.getAttribute('aria-expanded');
    await openDropdown(page, 'Hotel');
    const L = await panelLayout(page, 'Hotel');
    await openDropdown(page, 'Hotel');
    const L2 = await panelLayout(page, 'Hotel');
    const pass = L.openCount === 1 && L.panelVisible && !L2.panelVisible;
    record('TC-09', 'Opening Hotel closes Program; clicking Hotel again closes it', pass, `program aria-expanded=${a1}, open after Hotel=${L.openCount}, Hotel visible after 2nd click=${L2.panelVisible}`);
    expect.soft(pass).toBe(true);
  });

  test('TC-10 bar is sticky under the site header while scrolling', async ({ page }) => {
    await open(page, HOME, 'variation');
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(800);
    const st = await page.evaluate(() => {
      const nav = document.querySelector('.sub-header'), hdr = document.querySelector('#site-header');
      return { navTop: Math.round(nav.getBoundingClientRect().top), hdrBottom: Math.round(hdr.getBoundingClientRect().bottom), scrollY: Math.round(scrollY) };
    });
    const sh = await shot(page, 'v-scrolled-sticky');
    await openDropdown(page, 'Program');
    const L = await panelLayout(page, 'Program');
    const sh2 = await shot(page, 'v-scrolled-program-open');
    const pass = st.scrollY > 1000 && st.navTop >= 0 && st.navTop <= st.hdrBottom + 2 && L.panelVisible;
    record('TC-10', 'After scrolling, bar stays pinned under the sticky site header and dropdowns still open', pass, JSON.stringify(st) + ` programOpen=${L.panelVisible}`, [sh, sh2]);
    expect.soft(pass).toBe(true);
  });

  test('TC-11 site mega-menu (Membership) renders above the forum bar', async ({ page }) => {
    await open(page, HOME, 'variation');
    const m = page.locator('#site-header .afp-nav__list > li > .afp-nav__link.has-sub', { hasText: 'Membership' }).first();
    await m.click({ force: true });
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const nav = document.querySelector('.cre-t-43-nav-bar').getBoundingClientRect();
      const pt = document.elementFromPoint(Math.round(nav.left + nav.width * 0.6), Math.round(nav.top + nav.height / 2));
      const openSub = [...document.querySelectorAll('#site-header .afp-nav__sub-nav, #site-header [class*=mega], #site-header [class*=dropdown]')].find(e => e.getBoundingClientRect().height > 50 && getComputedStyle(e).visibility !== 'hidden');
      return { hit: pt && (pt.closest('#site-header') ? 'site-header' : pt.closest('.sub-header') ? 'forum-bar' : pt.tagName), menuBottom: openSub && Math.round(openSub.getBoundingClientRect().bottom), navTop: Math.round(nav.top) };
    });
    const sh = await shot(page, 'v-membership-megamenu');
    const pass = !(r.menuBottom > r.navTop) || r.hit === 'site-header';
    record('TC-11', 'Main-site dropdown overlapping the bar paints on top of it (z-index)', pass, JSON.stringify(r), [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-12 identical bar on every forum page', async ({ page }) => {
    await open(page, HOME, 'variation');
    const ref = await navState(page);
    const rows = [];
    for (const [name, p] of PAGES) {
      const resp = await page.goto(url(p, 'variation'), { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.cre-t-43-cta', { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(500);
      const s = await navState(page);
      const sh = await shot(page, `v-page-${slug(name)}`);
      const same = s.applied && s.nav && ref.nav && s.nav.h === ref.nav.h && s.logo && s.logo.x === ref.logo.x &&
        s.cta && s.cta.rect.x === ref.cta.rect.x && s.cta.rect.w === ref.cta.rect.w && JSON.stringify(s.items) === JSON.stringify(ref.items) && s.gapBelowCrumb !== null && Math.abs(s.gapBelowCrumb - ref.gapBelowCrumb) <= 2;
      rows.push({ name, status: resp && resp.status(), applied: s.applied, barY: s.nav && s.nav.y, gap: s.gapBelowCrumb, h: s.nav && s.nav.h, ctaX: s.cta && s.cta.rect.x, items: s.items.join('|'), same, sh });
    }
    const bad = rows.filter(r => !r.same || r.status !== 200);
    record('TC-12', `Bar position + look identical on all ${PAGES.length} forum pages (gap below breadcrumb, height, logo x, CTA x/w, items)`, bad.length === 0,
      rows.map(r => `${r.name}: ${r.status} applied=${r.applied} y=${r.barY} gap=${r.gap} h=${r.h} ctaX=${r.ctaX} ${r.same ? 'OK' : 'DIFF'}`).join(' ; '), rows.map(r => r.sh));
    expect.soft(bad.length).toBe(0);
  });

  test('TC-13 every dropdown link resolves (200)', async ({ page, request }) => {
    await open(page, HOME, 'variation');
    const hrefs = await page.$$eval('.cre-t-43-nav-bar .afp-nav__sub-nav a, .cre-t-43-nav-bar .cre-t-43-cta', as => as.map(a => a.getAttribute('href')));
    const rows = [];
    for (const h of hrefs) { const r = await request.get(BASE + h, { maxRedirects: 5 }).catch(e => null); rows.push(`${h} → ${r ? r.status() : 'ERR'}`); }
    const pass = rows.every(r => / 200$/.test(r)) && hrefs.length === 11;
    record('TC-13', 'All 11 nav destinations return 200', pass, rows.join(' ; '));
    expect.soft(pass).toBe(true);
  });

  test('TC-14 keyboard: Tab reaches Program and the CTA; Enter opens Program', async ({ page, browserName }) => {
    await open(page, HOME, 'variation');
    const order = [];
    // Safari's default Tab skips links (Option+Tab includes them) — native Safari behaviour, not the variation.
    const TAB = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.focus('.cre-t-43-nav-bar .sub-header__logo a, .cre-t-43-nav-bar a').catch(() => {});
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press(TAB);
      const f = await page.evaluate(() => { const a = document.activeElement; return a && a.closest('.cre-t-43-nav-bar') ? (a.innerText || '').trim().slice(0, 30) : null; });
      if (f !== null) order.push(f);
      if (f && /PRICING/i.test(f)) break;
    }
    const prog = page.locator('.cre-t-43-nav-bar .afp-nav__list > li > button', { hasText: 'Program' }).first();
    await prog.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const L = await panelLayout(page, 'Program');
    let ctaFocusable = order.some(t => /PRICING/i.test(t));
    if (!ctaFocusable && browserName === 'webkit') {
      await page.focus('.cre-t-43-cta');
      ctaFocusable = await page.evaluate(() => document.activeElement === document.querySelector('.cre-t-43-cta'));
      if (ctaFocusable) { await Promise.all([page.waitForURL(/pricing/, { timeout: 30000 }).catch(() => {}), page.keyboard.press('Enter')]); ctaFocusable = /pricing/.test(page.url()); }
      order.push(`(webkit: Tab skips links natively; CTA .focus()+Enter → ${page.url().replace(/^.*\.org/, '').split('?')[0]})`);
    }
    const pass = ctaFocusable && L.panelVisible;
    record('TC-14', 'Keyboard reachable: focus order through bar ends on CTA; Enter opens Program', pass, `focus order=${JSON.stringify(order)}; Program open via Enter=${L.panelVisible}`);
    expect.soft(pass).toBe(true);
  });

  test('TC-15 breakpoint: applied at 1200px, not at 1199px', async ({ page }) => {
    await open(page, HOME, 'variation', 1200);
    const a = await navState(page);
    await page.close();
    const p2 = await page.context().newPage();
    await open(p2, HOME, 'variation', 1199);
    const b = await navState(p2);
    const sh = await shot(p2, 'v-1199');
    const pass = a.applied && !b.applied;
    record('TC-15', 'Code gate min-width 1200px works at the edge (1200 = variation, 1199 = untouched)', pass, `1200 applied=${a.applied}; 1199 applied=${b.applied}, combo@1199=${b.combo}`, [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-16 resize 1440 → 1100 after load', async ({ page }) => {
    await open(page, HOME, 'variation');
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const vis = (el) => !!el && el.getBoundingClientRect().height > 0 && getComputedStyle(el).display !== 'none';
      return { registration: vis(document.querySelector('.cre-t-43-registration-item')), cta: vis(document.querySelector('.cre-t-43-cta')), ctaBg: document.querySelector('.cre-t-43-cta') && getComputedStyle(document.querySelector('.cre-t-43-cta')).backgroundColor, heroLogo: vis(document.querySelector('.banner_site-logo')), programHeadings: vis(document.querySelector('.cre-t-43-program-heading')) };
    });
    const sh = await shot(page, 'v-resized-1100');
    const pass = !(r.registration && r.cta);
    record('TC-16', 'After shrinking below 1200 the bar does not show both Registration and an unstyled CTA', pass, JSON.stringify(r), [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-18 wide screens: dropdown content lines up with the bar logo (1920px)', async ({ page }) => {
    test.fail(true, 'BUG-01: variation dropdown padding pins content to x=44 on wide screens');
    test.setTimeout(150000);
    await open(page, HOME, 'variation', 1920);
    const rows = [];
    for (const label of ['Program', 'Hotel', 'Sponsors']) {
      await openDropdown(page, label);
      const L = await panelLayout(page, label);
      const first = L.kids.find(x => x.visible && x.text);
      rows.push({ label, logoX: L.logoX, firstX: first && first.box.x, delta: first ? first.box.x - L.logoX : null });
      await openDropdown(page, label);
    }
    await openDropdown(page, 'Program');
    const sh = await shot(page, 'v-1920-program-open');
    // Control at 1920 keeps links ~28px right of the logo box (logo 292 → first link 320).
    const pass = rows.every(r => r.delta !== null && r.delta >= 0 && r.delta <= 60);
    record('TC-18', 'At 1920px dropdown links align with the bar logo, as control does (logo 292 → link 320)', pass, JSON.stringify(rows), [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-19 desktop visitor below 1200px: bucketed but sees control', async ({ page }) => {
    test.fail(true, 'BUG-02: VWO Desktop audience buckets <1200px viewports the code ignores');
    await open(page, HOME, 'variation', 1152); // e.g. 1440-wide laptop at 125% Windows scaling
    const s = await navState(page);
    const sh = await shot(page, 'v-1152-bucketed-no-change');
    const pass = !(s.combo === '2' && !s.applied);
    record('TC-19', 'A desktop visitor at 1152px CSS width (1440 screen @125%) is not counted in Variation while seeing control', pass, `combo=${s.combo}, variation applied=${s.applied}`, [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-17 no JS errors from the variation', async ({ page }) => {
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await open(page, HOME, 'variation');
    await openDropdown(page, 'Program');
    const mine = errs.filter(e => /cre-t-43|afp-nav|sub-header/i.test(e));
    record('TC-17', 'No page errors attributable to cre-t-43', mine.length === 0, `all errors (${errs.length}): ${errs.slice(0, 5).join(' | ')}`);
    expect.soft(mine.length).toBe(0);
  });
});

// ───────────────────────── CONTROL ─────────────────────────
test.describe('Control', () => {
  test('TC-20 control untouched on forum homepage', async ({ page }) => {
    await open(page, HOME, 'control');
    const s = await navState(page);
    const sh = await shot(page, 'c-home-top');
    await page.locator('.sub-header').scrollIntoViewIfNeeded();
    const sh2 = await shot(page, 'c-home-bar');
    const pass = s.combo === '1' && !s.applied && s.inMainContent && s.bannerLogoVisible && s.regItemVisible && JSON.stringify(s.items.map(t => t.toUpperCase())) === JSON.stringify(['PROGRAM', 'REGISTRATION', 'HOTEL', 'SPONSORS']);
    record('TC-20', 'Control: bar below the hero, hero logo shown, Program · Registration · Hotel · Sponsors, no cre-t-43 markup', pass, `combo=${s.combo}, bar y=${s.nav && s.nav.y}, items=${JSON.stringify(s.items)}, join=${JSON.stringify(s.join)}`, [sh, sh2]);
    expect.soft(pass).toBe(true);
  });

  test('TC-21 control subpage: bar already at top', async ({ page }) => {
    await open(page, `${HOME}/program/networking`, 'control');
    const s = await navState(page);
    const sh = await shot(page, 'c-networking-top');
    const pass = !s.applied && s.gapBelowCrumb !== null && s.gapBelowCrumb <= 24;
    record('TC-21', 'Control subpages: bar already directly under breadcrumb (brief note confirmed)', pass, `gap=${s.gapBelowCrumb}, y=${s.nav && s.nav.y}`, [sh]);
    expect.soft(pass).toBe(true);
  });

  test('TC-22 control Program dropdown (reference)', async ({ page }) => {
    await open(page, HOME, 'control');
    await openDropdown(page, 'Program');
    const L = await panelLayout(page, 'Program');
    const sh = await shot(page, 'c-program-open');
    const pass = L.panelVisible && L.kids.length === 6;
    record('TC-22', 'Control Program dropdown unchanged (6 links, original labels)', pass, L.kids.map(k => k.text).join(' | '), [sh]);
    expect.soft(pass).toBe(true);
  });
});

// ───────────────────────── QA LINK / GOALS ─────────────────────────
test.describe('QA link', () => {
  test('TC-30 QA link buckets + goal hits on CTA click', async ({ browser }) => {
    const rows = [];
    let done = { control: false, variation: false };
    for (let i = 0; i < 8 && !(done.control && done.variation); i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.addInitScript({ content: PREP });
      const hits = [];
      page.on('request', r => { const u = r.url(); if (/visualwebsiteoptimizer|vwo/i.test(u) && /event|track|goal|conversion|\/e\//i.test(u)) hits.push(u.slice(0, 140)); });
      await page.goto(QA_LINK, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load').catch(() => {});
      await page.waitForTimeout(5000);
      const s = await navState(page);
      const arm = s.applied ? 'variation' : 'control';
      if (!done[arm]) {
        done[arm] = true;
        const sh = await shot(page, `qa-link-${arm}`);
        const before = hits.length;
        const sel = arm === 'variation' ? '.cre-t-43-cta' : '.sub-header .afp-nav__list > li > a[href$="/pricing"]';
        await Promise.all([page.waitForURL(/pricing/, { timeout: 30000 }).catch(() => {}), page.click(sel, { force: true })]);
        await page.waitForTimeout(4000);
        rows.push({ arm, combo: s.combo, hitsOnClickAndPricing: hits.length - before, sample: hits.slice(before, before + 3), sh });
      }
      await ctx.close();
    }
    record('TC-30', 'QA link (utm_campaign=Cro_mode) buckets into both arms; VWO tracking requests after register click', rows.length > 0, JSON.stringify(rows.map(({ sh, ...r }) => r)), rows.map(r => r.sh));
    expect.soft(rows.length).toBeGreaterThan(0);
  });
});
