// Reconnaissance-only script for AFP26 — Homepage Updated Design.
// Captures full-page screenshots of control vs variation preview URLs
// across Chrome/Safari desktop+mobile so they can be visually diffed
// against the Figma design. Not a pass/fail assertion suite (yet).
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CONTROL_URL = 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjY4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzg4ODQ3NzQ3MzUyfX19';
const VARIATION_URL = 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjY4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzg4ODQ3NzMwNzIxfX19';

const OUT_DIR = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'afp26-recon');
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [label, url] of [['control', CONTROL_URL], ['variation', VARIATION_URL]]) {
  test(`AFP26 recon — ${label}`, async ({ page }, testInfo) => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    // Let VWO apply the variation + let fonts/images settle.
    await page.waitForTimeout(4000);
    // Dismiss cookie/chat widgets if present so they don't cover content.
    await page.evaluate(() => {
      document.querySelectorAll('[id*="onetrust"], [class*="cookie"]').forEach(el => {
        try { el.style.display = 'none'; } catch (e) {}
      });
    }).catch(() => {});

    const project = testInfo.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const shotPath = path.join(OUT_DIR, `${label}__${project}__full.png`);
    await page.screenshot({ path: shotPath, fullPage: true }).catch(async () => {
      // fall back to viewport-only if full page fails (very tall lazy-load pages)
      await page.screenshot({ path: shotPath });
    });

    // Hero-only crop for quick side-by-side comparison
    const heroPath = path.join(OUT_DIR, `${label}__${project}__hero.png`);
    const vp = page.viewportSize();
    await page.screenshot({ path: heroPath, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) } }).catch(() => {});

    // Dump computed styles for hero heading + first few section headings for font/size/color diffing
    const styleDump = await page.evaluate(() => {
      function cs(el) {
        if (!el) return null;
        const s = getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent.trim().slice(0, 80),
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
          color: s.color,
        };
      }
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 20);
      return headings.map(cs);
    }).catch(() => []);
    fs.writeFileSync(
      path.join(OUT_DIR, `${label}__${project}__styles.json`),
      JSON.stringify(styleDump, null, 2)
    );
  });
}
