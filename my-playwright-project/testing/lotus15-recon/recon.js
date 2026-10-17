const { chromium, devices } = require('playwright');
const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'out');
const ARMS = { control: '1000257620', v1: '1000257621', v2: '1000257622' };
const which = process.argv[2] || 'desktop';
(async () => {
  const b = await chromium.launch();
  for (const [arm, id] of Object.entries(ARMS)) {
    const ctx = await b.newContext(which === 'mobile' ? { ...devices['iPhone 12'], browserName: undefined, defaultBrowserType: undefined } : { viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
    await p.goto(`https://www.lotuscarrental.is/?cro_mode=qa&_conv_eforce=100052950.${id}`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(9000);
    await p.locator('.ch2-allow-all-btn, .ch2-btn-primary').first().click({ timeout: 3000 }).catch(() => {});
    await p.waitForTimeout(1500);
    const facts = await p.evaluate(() => {
      const vis = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      const exps = window.convert && convert.currentData && convert.currentData.experiences;
      const q = s => document.querySelector(s);
      const h2s = [...document.querySelectorAll('main h2')].filter(vis).map(h => h.textContent.trim().slice(0, 80));
      const v = q('[class*=lotus_test_15][class*=hero-video]');
      const usp = [...document.querySelectorAll('[class*=hero-usps] li')].map(li => { const i = li.querySelector('img,svg'); const r = i && i.getBoundingClientRect(); return li.textContent.trim() + ' icon=' + (r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none'); });
      const ratingIcon = q('[class*=hero-rating] img'); const rr = ratingIcon && ratingIcon.getBoundingClientRect();
      const cta = [...document.querySelectorAll('[data-booking-element]')].filter(vis).map(e => e.getAttribute('data-booking-element') + ': "' + e.innerText.trim() + '" after=' + getComputedStyle(e, '::after').content);
      const styles = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n');
      return {
        bodyClass: document.body.className, lang: document.documentElement.lang,
        exps: exps ? Object.keys(exps).map(k => k + ':' + (exps[k].variation_id || JSON.stringify(exps[k]).slice(0, 80))) : null,
        h1: [...document.querySelectorAll('h1')].filter(vis).map(h => h.textContent.trim()),
        desc: (q('[class*=hero-desc] p') || {}).textContent,
        usp, cta,
        rating: (q('[class*=hero-rating]') || {}).textContent, ratingIcon: ratingIcon ? ratingIcon.src + ' ' + Math.round(rr.width) + 'x' + Math.round(rr.height) : null,
        ratingHTML: (q('[class*=hero-rating]') || {}).outerHTML?.slice(0, 600),
        heroMedia: [...document.querySelectorAll('[class*=lotus_test_15][class*=hero-media]')].map(m => m.tagName + ' ' + (m.currentSrc || m.querySelector('img')?.currentSrc || m.querySelector('source')?.src)),
        video: v ? { paused: v.paused, muted: v.muted, dur: v.duration, src: v.currentSrc, ready: v.readyState, loop: v.loop, w: v.videoWidth, h: v.videoHeight } : null,
        visibleH2: h2s,
        reviews: document.querySelectorAll('[class*=lotus_test_15][class*=-review]:not([class*=reviews]):not([class*=review__])').length,
        dots: document.querySelectorAll('[class*=reviews__dot]').length,
        plan: [...document.querySelectorAll('[class*=plan__card]')].map(a => a.getAttribute('href') + ' | ' + a.innerText.replace(/\s+/g, ' ').trim()),
        fleetBg: q('[data-section-name=fleet]') && getComputedStyle(q('[data-section-name=fleet]')).backgroundColor,
        liveCssHasDevNotes: /CSS CHANGES ONLY/.test(styles), liveHasReducedMotion: null,
        hScroll: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    console.log('=====', which, arm, JSON.stringify(facts, null, 1)); console.log('errors:', errs.slice(0, 8));
    await p.screenshot({ path: path.join(OUT, `${which}-${arm}-fold.png`) });
    await p.screenshot({ path: path.join(OUT, `${which}-${arm}-full.png`), fullPage: true });
    await ctx.close();
  }
  await b.close();
})();
