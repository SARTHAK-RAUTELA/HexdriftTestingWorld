const { test } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const V = require('./control.json') && 'https://www.financialprofessionals.org/afp-fp-a--forum/program/networking?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTMyMTI2fX19';
test('recon2', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(V, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const r = await page.evaluate(() => {
    const fixed = [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return (s.position === 'fixed') && e.getBoundingClientRect().height > 50; }).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 60));
    const nav = document.querySelector('.sub-header');
    return { fixed, vwo: window._vwo_exp && window._vwo_exp[88] && window._vwo_exp[88].combination_chosen, navParent: nav.parentElement.tagName + '.' + nav.parentElement.className, navClass: nav.className, navTop: nav.getBoundingClientRect().top,
      header: (() => { const h = document.querySelector('#site-header, header'); return h && { id: h.id, cls: h.className, pos: getComputedStyle(h).position, z: getComputedStyle(h).zIndex, bottom: h.getBoundingClientRect().bottom }; })(),
      navZ: getComputedStyle(nav).zIndex, navStickyTop: getComputedStyle(nav).top,
      mainNavBtns: [...document.querySelectorAll('#site-header [type=button], #site-header button')].slice(0, 8).map(b => b.className + '|' + b.textContent.trim().slice(0, 20)),
    };
  });
  fs.writeFileSync(path.join(__dirname, 'recon2.json'), JSON.stringify(r, null, 2));
  await page.screenshot({ path: path.join(__dirname, 'sub-networking.png') });
});
