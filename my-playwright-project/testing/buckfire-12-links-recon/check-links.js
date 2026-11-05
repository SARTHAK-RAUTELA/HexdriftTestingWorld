// Buckfire Test 12 — 2026-11-03 "Full Story link under each story" + page->client mapping check.
// usage: node check-links.js <desktop|mobile> [webkit]
const { chromium, webkit, devices } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const mode = process.argv[2] || 'desktop';
const useWebkit = process.argv[3] === 'webkit';
const engine = useWebkit ? webkit : chromium;
const tag = `${mode}-${useWebkit ? 'webkit' : 'chromium'}`;
const OUT = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'buckfirelaw', 'buckfire-test12-links-results');
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });

// Client-supplied link sheet 2026-11-03 (Alyssa typo "client-stores" corrected; Sandra from /client-stories/ index)
const STORY = {
  Denita: '/client-stories/wrongful-death/denita/', Alyssa: '/client-stories/pedestrian-accident/alyssa/',
  Damian: '/client-stories/auto-accident/damian/', Denise: '/client-stories/wrongful-death/denise/',
  Jessica: '/client-stories/motorcycle-accident/jessica/', Mike: '/client-stories/catastrophic-injury/mike/',
  Shaylynn: '/client-stories/wrongful-death/shaylynn/', Sandra: '/client-stories/premises-liability/sandra/',
};
const PPC = '?cro_mode=qa&_conv_eforce=100052508.1000256555';
const HOME = '?cro_mode=qa&_conv_eforce=100052748.1000257125';
const CT = '?utm_campaign=cre_qa&_conv_eforce=100052509.1000256557';
const P = [
  ['Homepage', '/', HOME, 'Shaylynn,Denita,Mike'],
  ['PPC Medical Malpractice', '/medical-malpractice-lawyers/', PPC, 'Denise,Shaylynn,Mike'],
  ['PPC Dog Bite', '/dog-bite-lawyer/', PPC, 'Jessica,Alyssa,Denita'],
  ['PPC Slip & Fall (lawyers)', '/slip-and-fall-lawyers/', PPC, 'Jessica,Alyssa,Sandra'],
  ['PPC Slip & Fall (attorneys)', '/slip-and-fall-attorneys/', PPC, 'Damian,Alyssa,Sandra'],
  ['PPC Free Case Review', '/free-case-review/', PPC, 'Shaylynn,Mike,Denita'],
  ['PPC Car Accident', '/car-accident-lawyers/', PPC, 'Denita,Damian,Mike'],
  ['PPC Personal Injury', '/personal-injury-lawyer/', PPC, 'Mike,Shaylynn,Denise'],
  ['PPC Bike Accident', '/bicycle-accident-lawyer/', PPC, 'Mike,Jessica,Sandra'],
  ['PPC Wrongful Death', '/wrongful-death-lawyer/', PPC, 'Denita,Shaylynn,Denise'],
  ['PPC Nursing Home Abuse', '/nursing-home-abuse-lawyer/', PPC, 'Denise,Alyssa,Mike'],
  ['PPC Birth Injury', '/birth-injury-lawyers/', PPC, 'Denise,Alyssa,Mike'],
  ['PPC Truck Accidents', '/truck-accident-lawyers/', PPC, 'Denita,Mike,Damian'],
  ['CT Medical Malpractice', '/case-types/medical-malpractice/', CT, 'Denise'],
  ['CT Personal Injury', '/case-types/personal-injury/', CT, 'Mike'],
  ['CT Car Accident', '/case-types/car-accidents/', CT, 'Denita'],
  ['CT Motorcycle Accidents', '/case-types/motorcycle-accidents/', CT, 'Jessica'],
  ['CT Product Liability', '/case-types/product-liability/', CT, 'Alyssa'],
  ['CT Truck Accidents', '/case-types/truck-accidents/', CT, 'Denita'],
  ['CT Dog Bite', '/case-types/dog-bite/', CT, 'Damian'],
  ['CT Dog Bite (child page /children/)', '/case-types/dog-bite/children/', CT, 'Damian'],
  ['CT Cerebral Palsy', '/case-types/cerebral-palsy/', CT, 'Shaylynn'],
  ['CT Nursing Home Abuse', '/case-types/nursing-home-abuse/', CT, 'Denise'],
  ['CT Wrongful Death', '/case-types/wrongful-death/', CT, 'Denita'],
  ['CT Slip & Fall', '/case-types/slip-and-fall/', CT, 'Sandra'],
];
const CARD = '.buckfire-12-story-card, .testimonial-card';
const linkStatus = {};

(async () => {
  const b = await engine.launch();
  const ctxOpts = mode === 'mobile' ? (useWebkit ? devices['iPhone 12'] : devices['Pixel 5']) : { viewport: { width: 1366, height: 900 } };
  const results = [];
  for (const [label, p, q, exp] of P) {
    const ctx = await b.newContext(ctxOpts);
    await ctx.addCookies(['cre-t-21-overlay-dismissed', 'cre-t-21-overlay-shown', 'cre-t-21-conversion-done']
      .map((name) => ({ name, value: '1', domain: 'buckfirelaw.com', path: '/' })));
    const page = await ctx.newPage();
    const r = { label, url: 'https://buckfirelaw.com' + p + q, expected: exp.split(','), issues: [] };
    try {
      await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForSelector(CARD, { timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(1500);
      r.body = await page.evaluate(() => document.body.className.split(' ').filter((x) => /Buckfire|cre-t/.test(x)).join(' '));
      r.cards = await page.evaluate((CARD) => [...document.querySelectorAll(CARD)].map((c) => {
        const nameEl = c.querySelector('.buckfire-12-name, .testimonial-card__author');
        const a = c.querySelector('a');
        const img = c.querySelector('img');
        const v = c.querySelector('video');
        let link = null;
        if (a) {
          const rect = a.getBoundingClientRect(); const cs = getComputedStyle(a);
          link = { text: a.textContent.trim(), href: a.href, target: a.target, visible: rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' };
        }
        return {
          name: (nameEl ? nameEl.textContent : '').replace(/^[\s–-]+/, '').replace(/['’]s$/, '').trim(),
          alt: img ? img.alt : null, video: v ? (v.getAttribute('video-url') || '') : '', link,
        };
      }), CARD);
      const got = r.cards.map((c) => c.name);
      if (!r.cards.length) r.issues.push('No story card rendered');
      if (got.join(',') !== r.expected.join(',')) r.issues.push(`Clients: expected ${r.expected.join(', ')} — got ${got.join(', ') || 'none'}`);
      r.cards.forEach((c, i) => {
        const who = c.name || `card ${i + 1}`;
        if (!c.link) { r.issues.push(`${who}: no Full Story link`); return; }
        linkStatus[c.link.href] = null;
        if (!c.link.visible) r.issues.push(`${who}: link not visible`);
        const want = STORY[c.name];
        if (want && new URL(c.link.href).pathname !== want) r.issues.push(`${who}: link → ${c.link.href} (expected ${want})`);
        if (!new RegExp(c.name, 'i').test(c.link.text)) r.issues.push(`${who}: link text "${c.link.text}" doesn't name the client`);
      });
      const sec = await page.$('.buckfire-12-client-stories, .testimonial-card');
      if (sec) {
        await sec.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(600);
        const fn = (p.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home');
        await sec.screenshot({ path: path.join(OUT, 'shots', `${tag}-${fn}.png`) }).catch(() => {});
      }
      const first = await page.$('.buckfire-12-story-card a, .testimonial-card a');
      if (first) {
        const before = ctx.pages().length;
        await Promise.all([
          page.waitForURL(/client-stories/, { timeout: 30000, waitUntil: 'commit' }).catch(() => {}),
          first.click({ timeout: 10000 }).catch((e) => r.issues.push('Link click failed: ' + e.message.split('\n')[0])),
        ]);
        r.clickLanded = page.url() + (ctx.pages().length > before ? ' (new tab)' : '');
        if (!/client-stories/.test(page.url())) r.issues.push('Clicking the first link did not navigate to a client story page');
      }
    } catch (e) { r.issues.push('ERROR ' + e.message.split('\n')[0]); }
    r.pass = r.issues.length === 0;
    results.push(r);
    const cardsTxt = (r.cards || []).map((c) => c.name + (c.link ? ` [${c.link.text} → ${c.link.href.replace('https://buckfirelaw.com', '')}]` : ' [no link]')).join(' | ');
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${label} :: ${cardsTxt}${r.issues.length ? '\n      - ' + r.issues.join('\n      - ') : ''}`);
    await ctx.close();
  }
  await b.close();
  for (const u of Object.keys(linkStatus)) {
    try { const res = await fetch(u, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 QA' } }); linkStatus[u] = res.status; } catch (e) { linkStatus[u] = 'ERR'; }
  }
  console.log('link HTTP status:', JSON.stringify(linkStatus, null, 1));
  fs.writeFileSync(path.join(OUT, `${tag}.json`), JSON.stringify({ date: new Date().toISOString(), mode, results, linkStatus }, null, 1));
  console.log(`TOTAL ${results.filter((r) => r.pass).length}/${results.length} passed`);
})();
