// AFP43 recon — dump nav structure for control + variation (VWO exp 88).
const { test } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const P = {
  control: 'https://www.financialprofessionals.org/afp-fp-a--forum?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTc1NDA3fX19',
  variation: 'https://www.financialprofessionals.org/afp-fp-a--forum?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTMyMTI2fX19',
};
const OUT = path.join(__dirname);
for (const arm of ['control', 'variation']) {
  test(`recon ${arm}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript({ content: "document.addEventListener('DOMContentLoaded',function(){var s=document.createElement('style');s.textContent='#vwo-debugger{display:none!important}';document.head.appendChild(s)})" });
    await page.goto(P[arm], { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const info = await page.evaluate(() => {
      const nav = document.querySelector('.sub-header');
      const items = [...document.querySelectorAll('.sub-header .afp-nav__list > li')].map(li => ({
        cls: li.className, tag: li.firstElementChild && li.firstElementChild.tagName,
        text: (li.firstElementChild && li.firstElementChild.textContent.trim()),
        href: li.querySelector(':scope > a') && li.querySelector(':scope > a').getAttribute('href'),
        display: getComputedStyle(li).display,
        sub: [...li.querySelectorAll('.afp-nav__sub-nav > li')].map(s => ({ cls: s.className, text: s.textContent.trim(), href: s.querySelector('a') && s.querySelector('a').getAttribute('href') })),
      }));
      return {
        vwo: window._vwo_exp && window._vwo_exp[88] && window._vwo_exp[88].combination_chosen,
        navParent: nav && nav.parentElement && (nav.parentElement.tagName + '#' + nav.parentElement.id + '.' + nav.parentElement.className),
        navClass: nav && nav.className, navPos: nav && getComputedStyle(nav).position, navTop: nav && nav.getBoundingClientRect().top,
        crumbBottom: document.querySelector('.breadcrumb, .breadcrumbs, nav[aria-label*=read]') && document.querySelector('.breadcrumb, .breadcrumbs, nav[aria-label*=read]').getBoundingClientRect().bottom,
        bannerLogo: !!document.querySelector('.banner_site-logo'), bannerLogoDisplay: document.querySelector('.banner_site-logo') && getComputedStyle(document.querySelector('.banner_site-logo')).display,
        join: [...document.querySelectorAll('.global-login__link--join .global-login__link-text')].map(e => e.textContent),
        reg05: [...document.querySelectorAll('.cre-t-05-reg')].map(e => ({ t: e.textContent.trim(), d: getComputedStyle(e).display })),
        items,
      };
    });
    fs.writeFileSync(path.join(OUT, `${arm}.json`), JSON.stringify(info, null, 2));
    await page.screenshot({ path: path.join(OUT, `${arm}-top.png`) });
  });
}
