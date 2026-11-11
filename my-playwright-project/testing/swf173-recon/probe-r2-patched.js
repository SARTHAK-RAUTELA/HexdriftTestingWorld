// Inject the dev's new vB.js/vB.css into the CONTROL arm with only `filter: isPlanMutation` removed,
// to see whether the logic fixes BUG-01..04 once the ReferenceError is gone.
const { chromium } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const V = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2', 'variation');
const js = fs.readFileSync(path.join(V, 'vB.js'), 'utf8').replace(', filter: isPlanMutation', '').replace('var debug = 1', 'var debug = 0');
const cssRaw = fs.readFileSync(path.join(V, 'vB.css'), 'utf8');
const SHOTS = path.join(__dirname, 'r2'); fs.mkdirSync(SHOTS, { recursive: true });
const cards = p => p.evaluate(() => [...document.querySelectorAll('.plan-box')].filter(b => b.offsetParent).map(b => {
  const a = b.querySelector('.SWF173-amount'), l = b.querySelector('.plan-detail-column .plan-detail-content');
  const btn = b.querySelector('.plan-button-container'), col = btn && btn.parentElement;
  const br = btn && btn.getBoundingClientRect(), cr = col && col.getBoundingClientRect();
  return { n: ((b.querySelector('img')||{}).alt||'').replace(' Logo',''), c: b.querySelectorAll('.SWF173-price').length,
    d: a ? a.textContent.replace(/\s+/g,'') : null, l: l ? l.innerText.replace(/\s+/g,'') : null,
    off: br && cr ? Math.round(Math.abs((br.top+br.height/2)-(cr.top+cr.height/2))) : null };
}));
const verdict = (tag, c) => { const bad = c.filter(x => x.c !== 1 || x.d !== x.l); console.log(`${bad.length ? 'FAIL' : 'PASS'} ${tag}: ${c.length} cards` + (bad.length ? ' | bad: ' + bad.map(x => `${x.n} c${x.c} ${x.d}/${x.l}`).join('; ') : '') + ' | offs ' + c.map(x=>x.off).join(',')); };
async function open(b, pth = '/', qs = '', css = cssRaw) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p._errs = errs;
  await p.goto(`https://petinsurancegurus.com${pth}?cro_mode=qa&_conv_eforce=100053060.1000257881${qs}`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.plan-box', { state: 'attached', timeout: 60000 });
  await p.waitForTimeout(6000);
  await p.addStyleTag({ content: css }); await p.evaluate(js);
  await p.waitForSelector('.SWF173-price', { state: 'attached', timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.cre-t-133-overlay').forEach(e => e.remove()));
  return p;
}
(async () => {
  const b = await chromium.launch();
  for (const pth of ['/', '/home/', '/comparison/', '/cat-insurance/', '/compare/', '/canada/']) {
    const p = await open(b, pth); verdict(`load ${pth}`, await cards(p));
    if (/comparison|canada/.test(pth)) { await p.locator('.plan-box').first().screenshot({ path: `${SHOTS}/bestoverall${pth.replace(/\//g,'_')}.png` }).catch(()=>{}); }
    if (p._errs.length) console.log('  errors', p._errs); await p.context().close();
  }
  { const p = await open(b); const s = await p.evaluate(() => { const g = s => parseFloat(getComputedStyle(document.querySelector(s)).fontSize); return { amt: g('.SWF173-amount'), mo: g('.SWF173-mo') }; });
    console.log(`${s.mo < s.amt ? 'PASS' : 'FAIL'} /mo size (CSS as shipped): amount ${s.amt}px, /mo ${s.mo}px`);
    await p.addStyleTag({ content: cssRaw.replace(/\}\s*;\s*/g, '}\n') });
    const s2 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.SWF173-mo')).fontSize)); console.log(`  with stray ';' removed: /mo ${s2}px`);
    for (const pet of ['Cats', 'Dogs']) { await p.locator('.oxy-tab', { hasText: pet }).first().click(); await p.waitForTimeout(4000); verdict(`${pet} tab`, await cards(p)); await p.locator('.plan-box').first().screenshot({ path: `${SHOTS}/tab-${pet}.png` }).catch(()=>{}); }
    await p.locator('.oxy-tab', { hasText: 'All Pets' }).first().click(); await p.waitForTimeout(4000); verdict('back to All Pets', await cards(p));
    await p.evaluate(js); await p.evaluate(js); await p.waitForTimeout(3000); verdict('code re-run x2', await cards(p));
    await p.context().close(); }
  { const p = await open(b); await p.waitForTimeout(17500);
    const z = p.locator('input[placeholder*="Zip" i]').first(); await z.scrollIntoViewIfNeeded(); await z.click(); await z.pressSequentially('90210', { delay: 120 }); await z.press('Enter').catch(()=>{});
    await p.waitForTimeout(6000); verdict('ZIP 90210 after 17s', await cards(p)); await p.locator('.plan-box').first().screenshot({ path: `${SHOTS}/zip.png` }).catch(()=>{});
    await p.context().close(); }
  { const p = await open(b); const n0 = (await cards(p)).length; await p.waitForTimeout(18000);
    const btn = p.getByText(/^\s*Show More\s*$/i).first(); await btn.scrollIntoViewIfNeeded(); await btn.click(); await p.waitForTimeout(3000);
    const c = await cards(p); verdict(`late Show More (${n0}→${c.length})`, c);
    // observer cost: count mutation passes over 10s idle
    const runs = await p.evaluate(() => new Promise(r => { let n = 0; const o = new MutationObserver(m => n += m.filter(x => x.target.closest && x.target.closest('.SWF173-price')).length); o.observe(document, { subtree: true, childList: true, attributes: true, characterData: true }); setTimeout(() => { o.disconnect(); r(n); }, 10000); }));
    console.log(`  SWF173 self-mutations in 10s idle: ${runs} (0 = no loop)`);
    await p.context().close(); }
  for (let i = 0; i < 2; i++) { const p = await open(b, '/', '&petType=cat'); verdict(`?petType=cat landing #${i+1}`, await cards(p)); await p.context().close(); }
  await b.close();
})();
