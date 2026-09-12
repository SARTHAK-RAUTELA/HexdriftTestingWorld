// Verifies the fixes made to local_testing/Local2/variation/vB.js + vB.css for
// AFP26 by injecting the LOCAL (fixed) code onto the live control page —
// simulating the variation locally so fixes can be confirmed before the
// client redeploys to VWO. Not a pass/fail suite, just a screenshot/measure tool.
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CONTROL_URL = 'https://www.financialprofessionals.org/';
const JS_PATH = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation', 'vB.js');
const CSS_PATH = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'variation', 'vB.css');
const OUT_DIR = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'afp26-recon');
fs.mkdirSync(OUT_DIR, { recursive: true });

test('AFP26 verify fixes — local code injected on control', async ({ page }) => {
  await page.goto(CONTROL_URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('[id*="onetrust"], [class*="cookie"], [class*="consent"]').forEach(el => {
      try { el.remove(); } catch (e) {}
    });
  }).catch(() => {});

  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const js = fs.readFileSync(JS_PATH, 'utf8');
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: js });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    function isVisible(el) {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && el.offsetParent !== null;
    }
    function csOf(el) {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        text: el.textContent.trim().slice(0, 60),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height),
        top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        bottom: Math.round(el.getBoundingClientRect().bottom + window.scrollY),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        href: el.getAttribute ? el.getAttribute('href') : null,
      };
    }
    function findExact(selector, text) {
      const matches = Array.from(document.querySelectorAll(selector)).filter(el =>
        el.textContent.trim().toUpperCase() === text.toUpperCase() && isVisible(el)
      );
      matches.sort((a, b) => (a.getBoundingClientRect().width * a.getBoundingClientRect().height) - (b.getBoundingClientRect().width * b.getBoundingClientRect().height));
      return matches[0] || null;
    }
    const buttons = ['Register For Power Hour', 'Explore Certifications', 'Explore AFP Events'].map(label => {
      const el = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === label && isVisible(a));
      return el ? csOf(el) : null;
    });
    const certBtn = document.querySelector('.cta-list__item a[href="#TODO-CERTIFICATIONS-URL"]');
    return {
      cardButtons: buttons,
      certButtonRawHref: certBtn ? certBtn.getAttribute('href') : 'NOT FOUND',
      sec2Eyebrow: csOf(findExact('span,div', 'AFP Certifications')),
      panelEyebrow: csOf(findExact('span', 'Already Certified')),
      cardEyebrow: csOf(findExact('span', 'Connect & Learn')),
      navTab: csOf(findExact('button', 'Certified Treasury Professional (CTP)')),
      parentDebug: (function () {
        const item = document.querySelector('.cta-list__item');
        if (!item) return null;
        const parent = item.parentElement;
        const s = getComputedStyle(parent);
        const itemStyles = Array.from(parent.children).map(c => {
          const cs = getComputedStyle(c);
          return {
            class: c.className,
            height: Math.round(c.getBoundingClientRect().height),
            cssHeight: cs.height,
            minHeight: cs.minHeight,
            maxHeight: cs.maxHeight,
            alignSelf: cs.alignSelf,
            flex: cs.flex,
            flexBasis: cs.flexBasis,
            display: cs.display,
            boxSizing: cs.boxSizing,
          };
        });
        return {
          parentClass: parent.className,
          parentTag: parent.tagName,
          display: s.display,
          alignItems: s.alignItems,
          flexWrap: s.flexWrap,
          itemStyles,
        };
      })(),
    };
  });
  fs.writeFileSync(path.join(OUT_DIR, 'fixed__verify.json'), JSON.stringify(data, null, 2));
  await page.screenshot({ path: path.join(OUT_DIR, 'fixed__cardrow__full.png'), fullPage: true }).catch(() => {});
});
