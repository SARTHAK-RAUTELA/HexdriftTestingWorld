const { test } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const Q = 'eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTMyMTI2fX19';
for (const [name, url] of [['net-preview', '/afp-fp-a--forum/program/networking?_vis_preview_data=' + Q], ['net-plain', '/afp-fp-a--forum/program/networking'], ['home-then-net', null]]) {
  test(name, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const base = 'https://www.financialprofessionals.org';
    if (url) await page.goto(base + url, { waitUntil: 'domcontentloaded' });
    else { await page.goto(base + '/afp-fp-a--forum?_vis_preview_data=' + Q, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000); await page.goto(base + '/afp-fp-a--forum/program/networking', { waitUntil: 'domcontentloaded' }); }
    const out = [];
    for (const t of [3000, 6000, 12000]) {
      await page.waitForTimeout(t === 3000 ? 3000 : t / 2);
      out.push(await page.evaluate((t) => ({ t, bodyOp: getComputedStyle(document.body).opacity, bodyVis: getComputedStyle(document.body).visibility,
        hides: [...document.querySelectorAll('style[id*=vis_opt], style[id*=vwo]')].map(s => s.id + ':' + s.textContent.slice(0, 200)),
        mainOp: document.querySelector('main') && getComputedStyle(document.querySelector('main')).opacity, nav43: !!document.querySelector('.cre-t-43-nav-bar'), combo: window._vwo_exp && window._vwo_exp[88] && window._vwo_exp[88].combination_chosen, ready: document.readyState }), t));
    }
    fs.writeFileSync(path.join(__dirname, `recon3-${name}.json`), JSON.stringify(out, null, 2));
    await page.screenshot({ path: path.join(__dirname, `recon3-${name}.png`) });
  });
}
