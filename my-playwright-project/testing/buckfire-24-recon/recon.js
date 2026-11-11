// Buckfire Test 24 recon — usage: node recon.js <desktop|mobile> [webkit] [--preview]
const { chromium, webkit, devices } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const mode = process.argv[2] || 'desktop', useWebkit = process.argv[3] === 'webkit';
const tag = `${mode}-${useWebkit ? 'webkit' : 'chromium'}`;
const OUT = path.join(__dirname, '..', '..', 'qa-knowledge-base', 'buckfirelaw', 'buckfire-test24-results');
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
const V = '?cro_mode=qa&_conv_eforce=100053058.1000257876', C = '?cro_mode=qa&_conv_eforce=100053058.1000257875';
const PARENTS = [
  ['/case-types/medical-malpractice/', 'Denise'], ['/case-types/personal-injury/', 'Mike'],
  ['/case-types/car-accidents/', 'Denita'], ['/case-types/motorcycle-accidents/', 'Jessica'],
  ['/case-types/product-liability/', 'Alyssa'], ['/case-types/truck-accidents/', 'Denita'],
  ['/case-types/dog-bite/', 'Damian'], ['/case-types/cerebral-palsy/', 'Shaylynn'],
  ['/case-types/nursing-home-abuse/', 'Denise'], ['/case-types/wrongful-death/', 'Denita'],
  ['/case-types/slip-and-fall/', 'Sandra'],
];
const onlyPreview = process.argv.includes('--preview');

(async () => {
  const b = await (useWebkit ? webkit : chromium).launch();
  const ctxOpts = mode === 'mobile' ? (useWebkit ? devices['iPhone 12'] : devices['Pixel 5']) : { viewport: { width: 1366, height: 900 } };

  async function probe(label, p, q, expected, shot) {
    const ctx = await b.newContext(ctxOpts);
    await ctx.addCookies(['cre-t-21-overlay-dismissed', 'cre-t-21-overlay-shown', 'cre-t-21-conversion-done']
      .map((name) => ({ name, value: '1', domain: 'buckfirelaw.com', path: '/' })));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    const r = { label, path: p, url: 'https://buckfirelaw.com' + p + q, expected };
    try {
      const resp = await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      r.status = resp && resp.status();
      r.finalUrl = page.url();
      await page.waitForSelector('.buckfire-24-story-card', { timeout: q === C ? 8000 : 20000 }).catch(() => {});
      await page.waitForTimeout(2500);
      Object.assign(r, await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.buckfire-24-story-card')];
        const form = document.querySelector('#sidebar-main .sidebar_form');
        const c = cards[0];
        let exp = null, old = null, active = [];
        try {
          const ex = window.convert.data.experiences || [];
          const arr = Array.isArray(ex) ? ex : Object.values(ex);
          const e = arr.find((x) => String(x.id) === '100053058');
          if (e) exp = { name: e.name, status: e.status, goals: e.goals, locations: e.locations, audiences: e.audiences,
            variations: (e.variations || []).map((v) => ({ id: v.id, name: v.name, traffic: v.traffic_allocation })) };
          const o = arr.find((x) => String(x.id) === '100052509');
          if (o) old = { name: o.name, status: o.status };
          active = arr.filter((x) => x.status === 'active').map((x) => x.id + ':' + x.name);
        } catch (e) {}
        const rect = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
        return {
          body: document.body.className.split(' ').filter((x) => /Buckfire|cre-t/.test(x)).join(' '),
          cardCount: cards.length,
          oldCards: document.querySelectorAll('.testimonial-card, .buckfire-12-story-card').length,
          formPresent: !!form,
          name: c ? c.querySelector('.buckfire-24-name').textContent : null,
          video: c ? c.querySelector('video').getAttribute('video-url') : null,
          beforeForm: c && form ? c.nextElementSibling === form : null,
          cardRect: c ? rect(c) : null,
          formRect: form ? rect(form) : null,
          template: [...document.body.classList].filter((x) => /page-(template|parent|child)|parent-pageid/.test(x)).join(' '),
          exp, old, active,
        };
      }));
      r.errors = errs;
      if (shot && r.cardCount) {
        const el = await page.$('#sidebar-main');
        if (el) await el.screenshot({ path: path.join(OUT, 'shots', `${tag}-${shot}.png`) }).catch(() => {});
      }
      if (shot && shot.startsWith('preview')) {
        await page.screenshot({ path: path.join(OUT, 'shots', `${tag}-${shot}-full.png`), fullPage: true }).catch(() => {});
      }
      r.children = await page.evaluate((p) => [...new Set([...document.querySelectorAll('a[href]')]
        .map((a) => { try { return new URL(a.href).pathname; } catch (e) { return ''; } })
        .filter((h) => h.startsWith(p) && h !== p && h.split('/').filter(Boolean).length === 3))].slice(0, 40), p);
    } catch (e) { r.err = String(e).slice(0, 200); }
    await ctx.close();
    return r;
  }

  const results = [];
  results.push(await probe('PREVIEW variation (autism-abuse child)', '/case-types/personal-injury/autism-abuse/', V, 'Mike', 'preview-variation'));
  results.push(await probe('PREVIEW control (autism-abuse child)', '/case-types/personal-injury/autism-abuse/', C, 'none', 'preview-control'));
  if (!onlyPreview) {
    for (const [p, n] of PARENTS) {
      const r = await probe('Parent ' + p, p, V, n, 'parent-' + p.split('/')[2]);
      results.push(r);
      const kids = (r.children || []).filter((k) => k !== '/case-types/personal-injury/autism-abuse/');
      if (kids.length) results.push(await probe('Child ' + kids[0], kids[0], V, n, 'child-' + p.split('/')[2]));
      else results.push({ label: 'Child of ' + p, note: 'no child link found' });
    }
    results.push(await probe('Control parent personal-injury', '/case-types/personal-injury/', C, 'none', 'control-parent-pi'));
    results.push(await probe('Out of scope /reviews/', '/reviews/', V, 'none', null));
  }
  fs.writeFileSync(path.join(OUT, `recon-${tag}.json`), JSON.stringify(results, null, 1));
  for (const r of results) {
    console.log([r.label, r.status, r.body, 'cards=' + r.cardCount, 'old=' + r.oldCards, 'name=' + r.name,
      'exp=' + r.expected, 'beforeForm=' + r.beforeForm, 'errs=' + (r.errors || []).length, r.note || '', r.err || ''].join(' | '));
  }
  const f = results[0];
  console.log('EXP', JSON.stringify(f.exp), '\nOLD', JSON.stringify(f.old), '\nACTIVE', JSON.stringify(f.active));
  await b.close();
})();
