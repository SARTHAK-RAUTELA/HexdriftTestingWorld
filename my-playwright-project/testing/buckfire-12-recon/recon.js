// Recon for Buckfire Test 12 re-check (2026-10-14): body classes, experiment state, section presence,
// on variation + control force URLs for every page. Usage: node recon.js
const { chromium } = require('@playwright/test');
const PPC_V = '?cro_mode=qa&_conv_eforce=100052508.1000256555';
const PPC_C = '?cro_mode=qa&_conv_eforce=100052508.1000256554';
const HOME_V = '?cro_mode=qa&_conv_eforce=100052748.1000257125';
const PATHS = ['/', '/medical-malpractice-lawyers/', '/dog-bite-lawyer/', '/slip-and-fall-lawyers/', '/slip-and-fall-attorneys/',
  '/free-case-review/', '/car-accident-lawyers/', '/personal-injury-lawyer/', '/bicycle-accident-lawyer/', '/wrongful-death-lawyer/',
  '/nursing-home-abuse-lawyer/', '/birth-injury-lawyers/', '/truck-accident-lawyers/'];
(async () => {
  const browser = await chromium.launch();
  const runs = [];
  for (const p of PATHS) {
    if (p === '/') { runs.push([p, 'V', HOME_V]); runs.push([p, 'C-none', '?cro_mode=qa']); }
    else { runs.push([p, 'V', PPC_V]); runs.push([p, 'C', PPC_C]); }
  }
  for (const [p, arm, q] of runs) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await page.goto('https://buckfirelaw.com' + p + q, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);
      const info = await page.evaluate(() => {
        const conv = window.convert || {};
        let exps = null;
        try { exps = conv.currentData && conv.currentData.experiences ? Object.entries(conv.currentData.experiences).map(([k, v]) => k + ':' + (v.variation && v.variation.id || v.variation_id || JSON.stringify(v).slice(0, 60))) : null; } catch (e) {}
        const names = [...document.querySelectorAll('.buckfire-12-story-card .buckfire-12-name')].map(e => e.textContent.trim());
        return {
          bodyCls: [...document.body.classList].filter(c => !/^(page|wp-|elementor|postid|home$|logged)/.test(c)).join(' '),
          section: document.querySelectorAll('.buckfire-12-client-stories').length,
          names: names.join(', '),
          exps,
          caseResults: !!document.querySelector('#case-results'),
          creEls: [...new Set([...document.querySelectorAll('[class*="cre-t-"],[class*="buckfire-"],[class*="Buckfire"]')].flatMap(e => [...e.classList]).filter(c => /cre-t-|buckfire|Buckfire/.test(c)).map(c => c.replace(/-(?!\d).*$/, '')))].join(' '),
        };
      });
      console.log(JSON.stringify({ p, arm, ...info }));
    } catch (e) { console.log(JSON.stringify({ p, arm, error: e.message.slice(0, 120) })); }
    await ctx.close();
  }
  await browser.close();
})();
