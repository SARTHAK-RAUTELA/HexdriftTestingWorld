// Test 24 functional + design probe. usage: node func.js <desktop|mobile> [chromium|webkit|firefox]
const { chromium, webkit, firefox, devices } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const mode = process.argv[2] || 'desktop', eng = process.argv[3] || 'chromium';
const engine = { chromium, webkit, firefox }[eng];
const tag = `${mode}-${eng}`;
const OUT = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'buckfirelaw', 'buckfire-test24-results');
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
const V = 'https://buckfirelaw.com/case-types/personal-injury/autism-abuse/?cro_mode=qa&_conv_eforce=100053058.1000257876';
const T12 = 'https://buckfirelaw.com/personal-injury-lawyer/?cro_mode=qa&_conv_eforce=100052508.1000256555';
const results = [];
const rec = (id, name, pass, detail) => { results.push({ id, name, pass, detail }); console.log((pass === null ? 'INFO' : pass ? 'PASS' : 'FAIL') + ' ' + id + ' ' + name + ' :: ' + JSON.stringify(detail)); };

(async () => {
  const b = await engine.launch();
  const opts = mode === 'mobile' ? (eng === 'webkit' ? { ...devices['iPhone 12'] } : { ...devices['Pixel 5'] }) : { viewport: { width: 1366, height: 900 } };
  if (eng === 'firefox') delete opts.isMobile;
  const ctx = await b.newContext(opts);
  await ctx.addCookies(['cre-t-21-overlay-dismissed', 'cre-t-21-overlay-shown', 'cre-t-21-conversion-done']
    .map((name) => ({ name, value: '1', domain: 'buckfirelaw.com', path: '/' })));
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(V, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.buckfire-24-story-card', { timeout: 25000 });
  await page.evaluate(() => {
    window.__convQ = [];
    const q = window._conv_q = window._conv_q || [];
    const orig = q.push.bind(q);
    q.push = function (x) { window.__convQ.push(JSON.stringify(x)); return orig(x); };
  });
  await page.waitForTimeout(1500);
  const card = page.locator('.buckfire-24-story-card');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const d = await page.evaluate(() => {
    const c = document.querySelector('.buckfire-24-story-card');
    const cs = (el) => getComputedStyle(el);
    const img = c.querySelector('img'), v = c.querySelector('video'), pb = c.querySelector('.buckfire-24-play-button');
    const p = c.querySelector('.buckfire-24-story-content p'), n = c.querySelector('.buckfire-24-name');
    const form = document.querySelector('#sidebar-main .sidebar_form');
    const r = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    return {
      card: r(c), form: r(form), thumb: r(c.querySelector('.buckfire-24-video-thumb')),
      imgLoaded: img.complete && img.naturalWidth > 0, imgNat: img.naturalWidth + 'x' + img.naturalHeight,
      vSrc: v.getAttribute('src'), preload: v.getAttribute('preload'), playsinline: v.hasAttribute('playsinline'),
      pb: { bg: cs(pb).backgroundColor, w: cs(pb).width, tab: pb.tabIndex, role: pb.getAttribute('role'), label: pb.getAttribute('aria-label') },
      quote: { text: p.textContent, size: cs(p).fontSize, weight: cs(p).fontWeight, family: cs(p).fontFamily, color: cs(p).color, lh: cs(p).lineHeight },
      name: { text: n.textContent, size: cs(n).fontSize, weight: cs(n).fontWeight, family: cs(n).fontFamily },
      border: cs(c).borderTopColor + ' ' + cs(c).borderTopWidth, heading: !!c.querySelector('h1,h2,h3,h4'),
      contentPad: cs(c.querySelector('.buckfire-24-story-content')).padding,
      hScroll: document.documentElement.scrollWidth > window.innerWidth,
      vw: window.innerWidth,
    };
  });
  rec('T01', 'Card renders above sidebar form', d.card.y + d.card.h <= d.form.y + 2, { card: d.card, form: d.form });
  rec('T02', 'Card width matches form width', Math.abs(d.card.w - d.form.w) <= 2, { card: d.card.w, form: d.form.w });
  rec('T03', 'Poster loads', d.imgLoaded, d.imgNat);
  rec('T04', 'Lazy: no src, preload=none, playsinline', !d.vSrc && d.preload === 'none' && d.playsinline, { src: d.vSrc, preload: d.preload, playsinline: d.playsinline });
  rec('T05', 'Thumb ratio 415:233', Math.abs(d.thumb.w / d.thumb.h - 415 / 233) < 0.03, d.thumb);
  rec('T06', 'No horizontal scroll', !d.hScroll, d.vw);
  rec('I01', 'Play button style', null, d.pb);
  rec('I02', 'Quote/name typography', null, { quote: d.quote, name: d.name, heading: d.heading, border: d.border, pad: d.contentPad });
  rec('T07', 'Play button keyboard-focusable', d.pb.tab >= 0 || !!d.pb.role, d.pb);
  await card.screenshot({ path: path.join(OUT, 'shots', `${tag}-card-idle.png`) });

  await page.locator('.buckfire-24-play-button').click();
  const pl = await page.waitForFunction(() => { const v = document.querySelector('.buckfire-24-video'); return v.readyState >= 2 && v.currentTime > 0.3; }, null, { timeout: 45000 }).then(() => true).catch(() => false);
  const st = await page.evaluate(() => {
    const v = document.querySelector('.buckfire-24-video'); const c = v.closest('.buckfire-24-video-thumb');
    return { src: v.currentSrc, rs: v.readyState, t: v.currentTime, paused: v.paused, controls: v.controls, err: v.error && v.error.code,
      imgHidden: getComputedStyle(c.querySelector('img')).display === 'none', pbHidden: getComputedStyle(c.querySelector('.buckfire-24-play-button')).display === 'none',
      vw: v.videoWidth, q: window.__convQ };
  });
  rec('T08', 'Video plays after play-button click', pl && !st.err, { rs: st.rs, t: st.t, err: st.err, vw: st.vw });
  rec('T09', 'Correct clip for autism-abuse (Mike)', /mike\.mp4/i.test(st.src), st.src);
  rec('T10', 'Poster + play button hidden, controls on', st.imgHidden && st.pbHidden && st.controls, { img: st.imgHidden, pb: st.pbHidden, controls: st.controls });
  rec('T11', 'Goal 100038435 fired once', st.q.filter((x) => x.includes('100038435')).length === 1, st.q);
  await card.screenshot({ path: path.join(OUT, 'shots', `${tag}-card-playing.png`) });
  await page.evaluate(async () => { const v = document.querySelector('.buckfire-24-video'); v.pause(); await new Promise((r) => setTimeout(r, 300)); await v.play().catch(() => {}); });
  await page.waitForTimeout(1500);
  const q2 = await page.evaluate(() => window.__convQ);
  rec('T12', 'Goal not re-fired on resume', q2.filter((x) => x.includes('100038435')).length === 1, q2);
  rec('T13', 'No variation page errors', !errs.some((e) => /buckfire-24|Cre_24|BuckfireLaw_24/.test(e)), [...new Set(errs)]);
  await page.screenshot({ path: path.join(OUT, 'shots', `${tag}-autism-abuse-viewport.png`) });

  if (mode === 'desktop' && eng === 'chromium') {
    const p2 = await ctx.newPage();
    await p2.goto(T12, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p2.waitForSelector('.buckfire-12-story-card', { timeout: 25000 }).catch(() => {});
    await p2.waitForTimeout(2000);
    const t12 = await p2.evaluate(() => {
      const c = document.querySelector('.buckfire-12-story-card'); if (!c) return null;
      const cs = (el) => el && getComputedStyle(el);
      const pb = c.querySelector('.buckfire-12-play-button'), p = c.querySelector('p'), n = c.querySelector('.buckfire-12-name');
      return { pbBg: cs(pb).backgroundColor, pbBorder: cs(pb).border, pbW: cs(pb).width, pbHTML: pb.innerHTML.slice(0, 200),
        quote: { size: cs(p).fontSize, weight: cs(p).fontWeight, family: cs(p).fontFamily, lh: cs(p).lineHeight },
        name: n && { size: cs(n).fontSize, weight: cs(n).fontWeight }, border: cs(c).border };
    });
    rec('I03', 'Test 12 live card style (consistency reference)', null, t12);
    const el = await p2.$('.buckfire-12-story-card');
    if (el) { await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: path.join(OUT, 'shots', `${tag}-test12-reference-card.png`) }); }
  }
  fs.writeFileSync(path.join(OUT, `func-${tag}.json`), JSON.stringify(results, null, 1));
  await b.close();
})();
