// Dump SWF167 (exp 100052999) from window.convert.data → out/: every variation's js/css, goals, locations
const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.goto('https://petinsurancegurus.com/?cro_mode=qa', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const d = await page.evaluate(() => {
    const cd = window.convert.data;
    const arr = o => Array.isArray(o) ? o : Object.values(o || {});
    const e = arr(cd.experiences).find(x => String(x.id) === '100052999');
    if (!e) return { missing: true, ids: arr(cd.experiences).map(x => x.id + ' ' + x.name) };
    const goalIds = (e.goals || []).map(String);
    const goals = arr(cd.goals).filter(g => goalIds.includes(String(g.id)));
    const locs = arr(cd.locations).filter(l => (e.locations || []).map(String).includes(String(l.id)));
    const auds = arr(cd.audiences).filter(a => (e.audiences || []).map(String).includes(String(a.id)));
    return { e, goals, locs, auds };
  });
  if (d.missing) { console.log('NOT FOUND', d.ids); await b.close(); return; }
  fs.writeFileSync(path.join(OUT, 'experience.json'), JSON.stringify(d, null, 2));
  for (const v of d.e.variations) {
    console.log('variation', v.id, v.name, 'traffic', v.traffic_allocation, 'changes', (v.changes || []).length);
    (v.changes || []).forEach((c, i) => {
      const dd = c.data || {};
      if (dd.js) fs.writeFileSync(path.join(OUT, `v-${v.id}-${i}.js`), dd.js);
      if (dd.css) fs.writeFileSync(path.join(OUT, `v-${v.id}-${i}.css`), dd.css);
      console.log('  change', i, c.type, 'js', (dd.js || '').length, 'css', (dd.css || '').length);
    });
  }
  console.log('name', d.e.name, 'status', d.e.status, 'version', d.e.version, 'global_js', (d.e.global_js||'').length);
  if (d.e.global_js) fs.writeFileSync(path.join(OUT, 'global.js'), d.e.global_js);
  console.log('goals', JSON.stringify(d.goals.map(g => ({ id: g.id, name: g.name, type: g.type, rules: g.rules, settings: g.settings }))));
  console.log('locations', JSON.stringify(d.locs.map(l => ({ id: l.id, name: l.name, rules: l.rules, trigger: l.trigger }))));
  console.log('audiences', JSON.stringify(d.auds.map(a => ({ id: a.id, name: a.name, rules: a.rules }))));
  await b.close();
})();
