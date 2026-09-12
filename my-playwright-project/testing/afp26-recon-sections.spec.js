// Reconnaissance-only script for AFP26 — Homepage Updated Design.
// Follow-up to afp26-recon.spec.js: takes precise element-bounded screenshots
// of the 3-card promo row and the "Stand Out with the CTP/FPAC" tabs section
// (found by heading text, not guessed pixel offsets) so spacing/alignment
// can be compared closely across Chrome/Safari desktop+mobile.
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CONTROL_URL = 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjY4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzg4ODQ3NzQ3MzUyfX19';
const VARIATION_URL = 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjY4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzg4ODQ3NzMwNzIxfX19';

const OUT_DIR = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'afp26-recon');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function shootByHeadings(page, prefix, headingTexts, padTop, padBottom) {
  for (const text of headingTexts) {
    const el = page.locator(`:is(h1,h2,h3):text-is("${text}")`).first();
    const count = await el.count();
    if (!count) continue;
    const handle = await el.elementHandle();
    const box = await page.evaluate((node) => {
      let el = node;
      for (let i = 0; i < 4 && el.parentElement; i++) el = el.parentElement;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, handle).catch(() => null);
    if (!box || box.width <= 0 || box.height <= 0) continue;
    const vp = page.viewportSize();
    const clip = {
      x: Math.max(0, box.x),
      y: Math.max(0, box.y - padTop),
      width: Math.min(vp.width - Math.max(0, box.x), box.width + 40),
      height: Math.min(box.height + padTop + padBottom, 2000),
    };
    const safeName = text.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}__${safeName}.png`), clip }).catch(() => {});
  }
}

for (const [label, url] of [['control', CONTROL_URL], ['variation', VARIATION_URL]]) {
  test(`AFP26 sections — ${label}`, async ({ page }, testInfo) => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await page.evaluate(() => {
      document.querySelectorAll('[id*="onetrust"], [class*="cookie"], [class*="consent"]').forEach(el => {
        try { el.remove(); } catch (e) {}
      });
    }).catch(() => {});
    await page.waitForTimeout(300);

    const project = testInfo.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const prefix = `${label}__${project}`;

    const cardHeadings = label === 'control'
      ? ['AFP Power Hour', 'Stablecoins & On-Chain Liquidity Certificate', 'AFP Events']
      : ['AFP Power Hour', 'Earn the CTP® or FPAC®', 'AFP Events'];
    await shootByHeadings(page, prefix + '__cardrow', cardHeadings, 40, 20);

    const tabsHeading = label === 'control' ? ['AFP Certifications'] : ['Stand Out with the CTP® or FPAC®'];
    await shootByHeadings(page, prefix + '__tabs', tabsHeading, 20, 700);
  });
}
