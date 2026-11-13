const { test } = require('@playwright/test'); const path = require('path'); const fs = require('fs');
const C = 'https://www.financialprofessionals.org/afp-fp-a--forum/program/networking?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7Ijg4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRmFmcC1mcC1hLS1mb3J1bSIsImFwcCI6ImFwcCIsInRzIjoxNzk0NDYxOTc1NDA3fX19';
test('ctl1920', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.addInitScript({ content: "setInterval(function(){document.querySelectorAll('body > div').forEach(function(e){if(/Preview Mode|WE VALUE/.test(e.textContent||''))e.style.setProperty('display','none','important')})},200)" });
  await page.goto(C, { waitUntil: 'load' }); await page.waitForTimeout(4000);
  await page.locator('.sub-header .afp-nav__list > li > button', { hasText: 'Program' }).click({ force: true }); await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({ logo: Math.round(document.querySelector('.sub-header .sub-header__logo').getBoundingClientRect().left), firstLink: Math.round(document.querySelector('.sub-header .afp-nav__sub-nav a').getBoundingClientRect().left) }));
  fs.writeFileSync(path.join(__dirname, 'ctl1920.json'), JSON.stringify(r));
  await page.screenshot({ path: path.join(__dirname, 'ctl1920-program.png') });
});
