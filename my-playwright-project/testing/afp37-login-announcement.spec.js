// AFP37 — Sitewide Login Update Announcement (VWO exp 84), 2026-11-02.
// Modal: sitewide on www.financialprofessionals.org, slides in bottom-left after 5s,
// dismissed via "Got it" / close icon, 7-day cookie `cre-t-37-dismissed`.
// Alert: eWeb login page only (eweb.afponline.org), inserted above the page H1.
// Uses the VWO preview links (variation = combo 2, control = combo 1); the preview
// choice sticks for the rest of the context, so later navigations stay bucketed.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PREVIEW = {
  control: 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg0Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzkzMTcwMzc1MTc2fX19',
  variation: 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg0Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzkzMTcwMzQwNzQwfX19',
};
const PREVIEW_PARAM = new URL(PREVIEW.variation).searchParams.get('_vis_preview_data');
const SECOND_PAGE = 'https://www.financialprofessionals.org/membership/explore-membership/benefits';
const EWEB_LOGIN = `https://eweb.afponline.org/eWeb/DynamicPage.aspx?WebCode=LoginRequired&Site=afp&_vis_preview_data=${PREVIEW_PARAM}`;
const EWEB_FORGOT = `https://eweb.afponline.org/eWeb/DynamicPage.aspx?Site=afp&WebCode=ForgotPassword&_vis_preview_data=${PREVIEW_PARAM}`;
const COPY_TITLE = 'A new AFP login is coming soon';
const COPY_TEXT = 'AFP is updating the way you sign in to our website. Starting in the next few weeks, you’ll need to reset your password the first time you log in. We will have more information for you as we approach the launch date.';
const COOKIE = 'cre-t-37-dismissed';
const OUT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'afp37-qa');

const results = [];
let project = '';

// Records every VWO.event() call so goals can be asserted (preview mode sends no hits).
const GOAL_SPY = `
  window.__afp37Goals = [];
  setInterval(function () {
    if (window.VWO && typeof window.VWO.event === 'function' && !window.VWO.event.__spy) {
      var orig = window.VWO.event;
      var spy = function () { window.__afp37Goals.push([].slice.call(arguments).join(',')); return orig.apply(this, arguments); };
      spy.__spy = true;
      window.VWO.event = spy;
    }
  }, 25);
  // VWO preview debugger panel covers the CTA on phones; real visitors never see it.
  document.addEventListener('DOMContentLoaded', function () {
    var st = document.createElement('style');
    st.textContent = '#vwo-debugger{display:none!important}';
    document.head.appendChild(st);
  });
  // Timestamps for modal injection / open, independent of when the test polls.
  new MutationObserver(function () {
    if (!window.__afp37Inject && document.querySelector('.cre-t-37-modal')) window.__afp37Inject = performance.now();
    if (!window.__afp37Open && document.body && document.body.classList.contains('cre-t-37-modal-open')) window.__afp37Open = performance.now();
  }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
`;

function slug(s) { return s.replace(/[^a-z0-9]+/gi, '-').toLowerCase(); }

async function shot(page, name) {
  const dir = path.join(OUT, slug(project));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file }).catch(() => {});
  return path.relative(OUT, file).replace(/\\/g, '/');
}

async function openVariation(page) {
  await page.addInitScript({ content: GOAL_SPY });
  await page.goto(PREVIEW.variation, { waitUntil: 'domcontentloaded' });
}

// Returns ms between modal injection and the open class, or null if it never opened.
async function waitForOpen(page, timeout = 20000) {
  return page.evaluate(async (timeout) => {
    const t0 = performance.now();
    let injected = document.querySelector('.cre-t-37-modal') ? performance.now() : null;
    const injectedBeforeWait = injected !== null;
    while (performance.now() - t0 < timeout) {
      if (!injected && document.querySelector('.cre-t-37-modal')) injected = performance.now();
      if (document.body && document.body.classList.contains('cre-t-37-modal-open')) {
        await new Promise(r => setTimeout(r, 50));
        const inj = window.__afp37Inject || injected, op = window.__afp37Open || performance.now();
        return { delay: Math.round(op - inj), injectedBeforeWait };
      }
      await new Promise(r => setTimeout(r, 25));
    }
    return null;
  }, timeout);
}

async function modalMetrics(page) {
  return page.evaluate(() => {
    const m = document.querySelector('.cre-t-37-modal');
    if (!m) return null;
    const r = m.getBoundingClientRect();
    const c = m.querySelector('.cre-t-37-modal-close').getBoundingClientRect();
    const cs = el => { const s = getComputedStyle(el); return { fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, fontFamily: s.fontFamily.split(',')[0], color: s.color, bg: s.backgroundColor }; };
    const overlaps = [];
    const hit = (el, label) => {
      if (!el) return;
      const o = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || o.width === 0 || o.height === 0) return;
      const ix = Math.max(0, Math.min(r.right, o.right) - Math.max(r.left, o.left));
      const iy = Math.max(0, Math.min(r.bottom, o.bottom) - Math.max(r.top, o.top));
      if (ix * iy > 0) overlaps.push({ label, area: Math.round(ix * iy), z: st.zIndex, rect: [o.left, o.top, o.width, o.height].map(Math.round) });
    };
    hit(document.querySelector('#hubspot-messages-iframe-container'), 'HubSpot chat');
    document.querySelectorAll('[id*="truste"],[id*="consent"],[class*="consent"]').forEach(e => { if (getComputedStyle(e).position === 'fixed') hit(e, 'Cookie notice #' + e.id); });
    document.querySelectorAll('[class^="hj-survey"]').forEach(e => { if (getComputedStyle(e).position === 'fixed') hit(e, 'Hotjar survey'); });
    const cta = m.querySelector('.cre-t-37-modal-cta');
    // Other large fixed overlays open at the same time (site popups, banners).
    const others = [...document.querySelectorAll('body *')].filter(e => {
      if (m.contains(e) || e.closest('[id*="vwo" i], [class*="vwo" i]')) return false;
      const st = getComputedStyle(e);
      if (st.position !== 'fixed' || st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      const o = e.getBoundingClientRect();
      return o.width * o.height > 40000 && o.bottom > 0 && o.top < innerHeight;
    }).map(e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' z' + getComputedStyle(e).zIndex);
    return {
      vw: innerWidth, vh: innerHeight,
      left: Math.round(r.left), right: Math.round(innerWidth - r.right), bottomGap: Math.round(innerHeight - r.bottom),
      top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height),
      closeInView: c.top >= 0 && c.right <= innerWidth && c.left >= 0, closeSize: Math.round(c.width),
      title: { text: m.querySelector('h2').textContent.trim(), ...cs(m.querySelector('h2')) },
      text: { text: m.querySelector('p').textContent.trim(), ...cs(m.querySelector('p')) },
      cta: { text: cta.textContent.trim(), height: Math.round(cta.getBoundingClientRect().height), ...cs(cta) },
      noHorizontalScroll: document.documentElement.scrollWidth <= innerWidth + 1,
      overlaps, others,
    };
  });
}

async function dismissCookie(context) {
  return (await context.cookies('https://www.financialprofessionals.org')).find(c => c.name === COOKIE) || null;
}

function record(id, title, status, detail, screenshot) {
  results.push({ project, id, title, status, detail, screenshot });
}

test.describe.serial('AFP37 login update announcement', () => {
  test.beforeAll(({}, info) => { project = info.project.name; });
  test.afterAll(() => {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, `results-${slug(project)}.json`), JSON.stringify(results, null, 2));
  });

  test('TC-01..08 modal appears after ~5s with wireframe copy and layout', async ({ page }) => {
    await openVariation(page);
    await page.waitForSelector('.cre-t-37-modal', { state: 'attached', timeout: 30000 });
    const earlyOpen = await page.evaluate(() => document.body.classList.contains('cre-t-37-modal-open'));
    const t = await waitForOpen(page);
    await page.waitForTimeout(700); // slide-in transition
    const m = await modalMetrics(page);
    const s = await shot(page, '01-modal-open');
    const goals = await page.evaluate(() => window.__afp37Goals);
    const mobile = m.vw <= 767;

    record('TC-01', 'Modal injected but hidden before the 5s delay', !earlyOpen ? 'pass' : 'fail', `open at injection: ${earlyOpen}`, s);
    record('TC-02', 'Modal opens ~5s after injection', t && t.delay >= 4300 && t.delay <= 6500 ? 'pass' : 'fail', t ? `delay ${t.delay}ms` : 'never opened', s);
    record('TC-03', 'Copy matches wireframe (title, body, "Got it")',
      m.title.text === COPY_TITLE && m.text.text === COPY_TEXT && m.cta.text === 'Got it' ? 'pass' : 'fail',
      `title "${m.title.text}", CTA "${m.cta.text}", body matches ${m.text.text === COPY_TEXT}`, s);
    const posOk = mobile ? (m.left === 16 && m.right === 16 && m.top >= 0) : (m.left === 24 && m.bottomGap === 24 && m.width === 352);
    record('TC-04', mobile ? 'Mobile: compact full-width bottom card, fully on screen' : 'Desktop: fixed bottom-left, 24px from edges, 352px wide', posOk ? 'pass' : 'fail',
      `left ${m.left}, right ${m.right}, bottom gap ${m.bottomGap}, top ${m.top}, ${m.width}×${m.height} in ${m.vw}×${m.vh}`, s);
    record('TC-05', 'Close icon fully in viewport; no horizontal scroll', m.closeInView && m.noHorizontalScroll ? 'pass' : 'fail',
      `close icon in view ${m.closeInView} (${m.closeSize}px), no h-scroll ${m.noHorizontalScroll}`, s);
    record('TC-06', 'Styling: navy title, #027DB6 CTA, site Gotham fonts',
      m.title.color === 'rgb(0, 43, 73)' && m.cta.bg === 'rgb(2, 125, 182)' && /Gotham/.test(m.title.fontFamily) ? 'pass' : 'fail',
      `title ${m.title.fontFamily} ${m.title.fontSize}/${m.title.fontWeight}; body ${m.text.fontSize}/${m.text.lineHeight}; CTA ${m.cta.bg}, ${m.cta.height}px`, s);
    record('TC-07', '"AFP37 - Modal Shows" goal fires on open', goals.includes('afp37ModalShows') ? 'pass' : 'fail', `VWO.event calls: ${JSON.stringify(goals)}`, s);
    record('TC-08', 'Modal clear of chat / cookie / survey overlays', m.overlaps.length === 0 ? 'pass' : 'fail',
      m.overlaps.length ? JSON.stringify(m.overlaps) : 'no overlap', s);
    record('TC-08b', 'No other popup open at the same time', m.others.length === 0 ? 'pass' : 'fail', m.others.length ? m.others.join(', ') : 'none', s);
    expect(t).not.toBeNull();
  });

  test('TC-09..11 "Got it" dismisses, sets 7-day cookie, stays dismissed on next page', async ({ page, context }) => {
    await openVariation(page);
    await page.waitForSelector('.cre-t-37-modal', { state: 'attached', timeout: 30000 });
    await waitForOpen(page);
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelectorAll('#vwo-debugger').forEach(e => e.remove()));
    await page.locator('.cre-t-37-modal-cta').click();
    await page.waitForTimeout(1500);
    const closed = await page.evaluate(() => !document.body.classList.contains('cre-t-37-modal-open') && getComputedStyle(document.querySelector('.cre-t-37-modal')).visibility === 'hidden');
    const goals = await page.evaluate(() => window.__afp37Goals);
    const ck = await dismissCookie(context);
    const days = ck ? (ck.expires - Date.now() / 1000) / 86400 : 0;
    const s = await shot(page, '02-after-got-it');
    record('TC-09', '"Got it" closes the modal and fires "Modal Dismissed"', closed && goals.includes('afp37ModalDismissed') ? 'pass' : 'fail', `closed ${closed}, VWO.event calls ${JSON.stringify(goals)}`, s);
    record('TC-10', 'Dismiss cookie set for 7 days', ck && days > 6.9 && days < 7.1 ? 'pass' : 'fail', ck ? `${COOKIE} expires in ${days.toFixed(2)} days, domain ${ck.domain}` : 'cookie missing', s);

    await page.goto(SECOND_PAGE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(10000);
    const st = await page.evaluate(() => ({ cls: document.body.classList.contains('cre-t-37'), modal: !!document.querySelector('.cre-t-37-modal'), open: document.body.classList.contains('cre-t-37-modal-open') }));
    const s2 = await shot(page, '03-second-page-after-dismiss');
    record('TC-11', 'After dismissal, modal not shown on another page', st.cls && !st.open ? 'pass' : 'fail', `variation applied ${st.cls}, injected ${st.modal}, open ${st.open}`, s2);
  });

  test('TC-12..13 undismissed modal shows on every page; close icon dismisses', async ({ page, context }) => {
    await openVariation(page);
    await page.waitForSelector('.cre-t-37-modal', { state: 'attached', timeout: 30000 });
    await waitForOpen(page);
    await page.goto(SECOND_PAGE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cre-t-37-modal', { state: 'attached', timeout: 30000 });
    const t = await waitForOpen(page);
    await page.waitForTimeout(700);
    const s = await shot(page, '04-second-page-not-dismissed');
    record('TC-12', 'Not dismissed → modal shows again on the next page', t ? 'pass' : 'fail', t ? `opened, delay ${t.delay}ms` : 'did not open', s);

    await page.evaluate(() => document.querySelectorAll('#vwo-debugger').forEach(e => e.remove()));
    await page.locator('.cre-t-37-modal-close').click();
    await page.waitForTimeout(700);
    const closed = await page.evaluate(() => !document.body.classList.contains('cre-t-37-modal-open'));
    const ck = await dismissCookie(context);
    const s2 = await shot(page, '05-after-close-icon');
    record('TC-13', 'Close icon closes the modal and sets the cookie', closed && ck ? 'pass' : 'fail', `closed ${closed}, cookie set ${!!ck}`, s2);
  });

  test('TC-14 modal does not auto-close', async ({ page }) => {
    await openVariation(page);
    await page.waitForSelector('.cre-t-37-modal', { state: 'attached', timeout: 30000 });
    await waitForOpen(page);
    await page.waitForTimeout(20000);
    const open = await page.evaluate(() => document.body.classList.contains('cre-t-37-modal-open'));
    record('TC-14', 'Modal does not close automatically (20s observed)', open ? 'pass' : 'fail', `still open after 20s: ${open}`, null);
  });

  test('TC-15 reduced motion disables the slide', async ({ browser }, info) => {
    const { defaultBrowserType, ...use } = info.project.use;
    const ctx = await browser.newContext({ ...use, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await openVariation(page);
    await page.waitForSelector('.cre-t-37-modal', { state: 'attached', timeout: 30000 });
    await waitForOpen(page);
    const st = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.cre-t-37-modal')); return { transform: s.transform, transitionDuration: s.transitionDuration }; });
    record('TC-15', 'prefers-reduced-motion: no slide transform / transition', st.transform === 'none' && /^0s/.test(st.transitionDuration) ? 'pass' : 'fail', JSON.stringify(st), null);
    await ctx.close();
  });

  test('TC-16 control shows no modal', async ({ page }) => {
    await page.goto(PREVIEW.control, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(12000);
    const st = await page.evaluate(() => ({ combo: window._vwo_exp && window._vwo_exp[84] && window._vwo_exp[84].combination_chosen, cls: document.body.classList.contains('cre-t-37'), modal: !!document.querySelector('.cre-t-37-modal') }));
    const s = await shot(page, '06-control');
    record('TC-16', 'Control: no modal, no cre-t-37 class', st.combo === '1' && !st.cls && !st.modal ? 'pass' : 'fail', JSON.stringify(st), s);
  });

  test('TC-17..20 eWeb login alert', async ({ page }) => {
    await page.goto(EWEB_LOGIN, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cre-t-37-alert', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(6000);
    const a = await page.evaluate(() => {
      const al = document.querySelector('.cre-t-37-alert');
      const h1 = document.querySelector('#eWebFrameWorkMiddleRow h1');
      if (!al) return null;
      const r = al.getBoundingClientRect(), hr = h1.getBoundingClientRect(), s = getComputedStyle(al);
      const t = getComputedStyle(al.children[0]);
      return {
        count: document.querySelectorAll('.cre-t-37-alert').length,
        before: al.nextElementSibling === h1,
        title: al.children[0].textContent.trim(), text: al.children[1].textContent.trim(),
        bg: s.backgroundColor, border: s.borderTopColor, radius: s.borderRadius, padding: s.padding,
        titleWeight: t.fontWeight, titleSize: t.fontSize,
        leftAligned: Math.abs(r.left - hr.left) < 2, width: Math.round(r.width), vw: innerWidth,
        noHScroll: document.documentElement.scrollWidth <= innerWidth + 1,
        modal: !!document.querySelector('.cre-t-37-modal'),
      };
    });
    const s = await shot(page, '07-eweb-login-alert');
    record('TC-17', 'eWeb login: alert inserted once, directly above the "Sign In" H1', a && a.count === 1 && a.before ? 'pass' : 'fail', a ? `count ${a.count}, directly before H1 ${a.before}` : 'alert missing', s);
    record('TC-18', 'eWeb alert copy matches wireframe', a && a.title === COPY_TITLE && a.text === COPY_TEXT ? 'pass' : 'fail', a ? `title "${a.title}", body matches ${a.text === COPY_TEXT}` : '-', s);
    record('TC-19', 'eWeb alert styling (light-blue box, bold title, aligned with H1, fits viewport)',
      a && a.bg === 'rgb(240, 247, 251)' && a.radius === '8px' && Number(a.titleWeight) >= 600 && a.leftAligned && a.noHScroll ? 'pass' : 'fail',
      a ? `bg ${a.bg}, border ${a.border}, radius ${a.radius}, padding ${a.padding}, title ${a.titleSize}/${a.titleWeight}, aligned ${a.leftAligned}, ${a.width}px of ${a.vw}, no h-scroll ${a.noHScroll}` : '-', s);
    record('TC-20', 'eWeb: sitewide modal NOT shown (excluded)', a && !a.modal ? 'pass' : 'fail', a ? `modal present: ${a.modal}` : '-', s);
  });

  test('TC-21 alert limited to the login page', async ({ page }) => {
    await page.goto(EWEB_FORGOT, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(12000);
    const st = await page.evaluate(() => ({ h1: (document.querySelector('#eWebFrameWorkMiddleRow h1') || {}).textContent, alert: !!document.querySelector('.cre-t-37-alert') }));
    const s = await shot(page, '08-eweb-forgot-password');
    record('TC-21', 'Alert NOT shown on non-login eWeb page (Forgot Password)', !st.alert ? 'pass' : 'fail', `page H1 "${(st.h1 || '').trim()}", alert present ${st.alert}`, s);
  });
});
