// AFP43: bar + Program panel at several desktop widths; control vs variation page errors.
const { test } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const V = 'eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTMyMTI2fX19';
const C = 'eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTc1NDA3fX19';
const B = 'https://www.financialprofessionals.org/afp-fp-a--forum?_vis_preview_data=';
const HIDE = "document.addEventListener('DOMContentLoaded',function(){var s=document.createElement('style');s.textContent='#truste-consent-track,#hubspot-messages-iframe-container,#hs-web-interactives-top-anchor{display:none!important}';document.head.appendChild(s)});setInterval(function(){document.querySelectorAll('body > div').forEach(function(e){if(/Preview Mode/.test(e.textContent||''))e.style.setProperty('display','none','important')})},200)";
test('widths', async ({ page }) => {
  test.setTimeout(400000);
  await page.addInitScript({ content: HIDE });
  const out = [];
  for (const w of [1200, 1280, 1920, 2560]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(B + V, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.cre-t-43-cta', { timeout: 20000 }); await page.waitForTimeout(1500);
    await page.locator('.cre-t-43-nav-bar .afp-nav__list > li > button', { hasText: 'Program' }).click({ force: true }); await page.waitForTimeout(600);
    out.push(await page.evaluate((w) => {
      const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.top), Math.round(r.height)]; };
      const li = [...document.querySelectorAll('.cre-t-43-nav-bar .afp-nav__list > li')].map(l => Math.round(l.getBoundingClientRect().top));
      return { w, bar: b('.cre-t-43-nav-bar'), logo: b('.cre-t-43-nav-bar .sub-header__logo'), list: b('.cre-t-43-nav-bar .afp-nav__list'), cta: b('.cre-t-43-cta'), itemTops: li, crumbText: b('.breadcrumb, .breadcrumbs, [class*=breadcrumb] a'), hero: b('main h1, .main-content h1, .main-content h2'), panel: b('.cre-t-43-program-menu'), headS: b('.cre-t-43-program-heading-sessions'), headN: b('.cre-t-43-program-heading-networking'), divider: b('.cre-t-43-program-divider'), scrollW: document.documentElement.scrollWidth };
    }, w));
    await page.screenshot({ path: path.join(__dirname, `w${w}-program.png`) });
  }
  const errs = {};
  for (const [arm, q] of [['control', C], ['variation', V]]) {
    const p = await page.context().newPage(); const e = []; p.on('pageerror', x => e.push(x.message.slice(0, 80)));
    await p.setViewportSize({ width: 1440, height: 900 }); await p.goto(B + q, { waitUntil: 'load' }); await p.waitForTimeout(5000); errs[arm] = e; await p.close();
  }
  fs.writeFileSync(path.join(__dirname, 'widths.json'), JSON.stringify({ out, errs }, null, 1));
});
