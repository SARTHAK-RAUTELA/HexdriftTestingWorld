// Test 24 follow-up probes: settlements sidebar, page errors, collision with exp 100052509, goals/locations config
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const go = async (url, fn) => {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
    await ctx.addCookies(['cre-t-21-overlay-dismissed', 'cre-t-21-overlay-shown', 'cre-t-21-conversion-done']
      .map((name) => ({ name, value: '1', domain: 'buckfirelaw.com', path: '/' })));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(9000);
    const out = await page.evaluate(fn);
    await ctx.close();
    return { url, errs: [...new Set(errs)], out };
  };
  const V = '_conv_eforce=100053058.1000257876';
  // 1) settlements child: what sidebar exists?
  console.log(JSON.stringify(await go('https://buckfirelaw.com/case-types/car-accidents/settlements/?cro_mode=qa&' + V, () => ({
    sidebarMain: !!document.querySelector('#sidebar-main'),
    sidebarForm: document.querySelectorAll('.sidebar_form').length,
    forms: [...document.querySelectorAll('form')].map((f) => (f.id || f.className || '').slice(0, 60) + ' @' + (f.closest('[id]') || {}).id),
    asides: [...document.querySelectorAll('aside, .blog-sidebar, [class*=sidebar]')].map((e) => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 60)).slice(0, 10),
    template: [...document.body.classList].filter((x) => /template|parent|child/.test(x)).join(' '),
  })), null, 1));
  // 2) both forced: 24 variation + 509 variation
  console.log(JSON.stringify(await go('https://buckfirelaw.com/case-types/personal-injury/?cro_mode=qa&utm_campaign=cre_qa&_conv_eforce=100053058.1000257876,100052509.1000256557', () => ({
    body: document.body.className.split(' ').filter((x) => /Buckfire|cre-t/.test(x)).join(' '),
    t24: document.querySelectorAll('.buckfire-24-story-card').length,
    t509: document.querySelectorAll('.testimonial-card').length,
    order: [...document.querySelectorAll('#sidebar-main > *, .buckfire-24-story-card, .testimonial-card')].map((e) => String(e.className).slice(0, 40)).slice(0, 8),
    loc509: (() => { const a = Object.values(window.convert.data.experiences); const e = a.find((x) => String(x.id) === '100052509'); return e && { locations: e.locations, vars: e.variations.map((v) => v.id + ':' + v.traffic_allocation) }; })(),
  })), null, 1));
  // 3) 509 alone forced on case type page
  console.log(JSON.stringify(await go('https://buckfirelaw.com/case-types/personal-injury/?utm_campaign=cre_qa&_conv_eforce=100052509.1000256557', () => ({
    body: document.body.className.split(' ').filter((x) => /Buckfire|cre-t/.test(x)).join(' '),
    t509: document.querySelectorAll('.testimonial-card').length,
  })), null, 1));
  // 4) errors on variation preview + goal/location defs
  console.log(JSON.stringify(await go('https://buckfirelaw.com/case-types/personal-injury/autism-abuse/?cro_mode=qa&' + V, () => {
    const d = window.convert.data;
    const pick = (coll, id) => { const a = Array.isArray(coll) ? coll : Object.values(coll || {}); return a.find((x) => String(x.id) === id); };
    const goals = ['100035974', '100035813', '100035814', '100036032', '100036115', '100038435'].map((g) => { const x = pick(d.goals, g); return x ? g + ':' + x.name + ':' + x.type : g + ':?'; });
    const loc = pick(d.locations, '100012088');
    const aud = pick(d.audiences, '10007176');
    const ex = pick(d.experiences, '100053058');
    const v = ex.variations.find((x) => x.id === '1000257876');
    return { goals, loc: loc && JSON.stringify(loc.rules || loc).slice(0, 1500), aud: aud && JSON.stringify(aud).slice(0, 600),
      t27: !!document.querySelector('[class*=cre-t-27]:not(body)'), t13: !!document.querySelector('[class*=cre-t-13]:not(body)'),
      changes: JSON.stringify(v.changes || '').length, js: (JSON.stringify(v.changes || '').match(/Cre_24_urlVideoMap|defaultVideoName|rgba\([^)]*\)/g) || []) };
  }), null, 1));
  await b.close();
})();
