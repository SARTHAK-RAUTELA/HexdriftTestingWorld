// Reconnaissance-only script for AFP26 — follow-up checks derived from the
// client's video transcript (not visible in the static Figma image alone):
// hero CTA width vs card-row width, card button href destinations, and
// eyebrow/tab font-size consistency. Chrome Desktop only (client said desktop
// is the priority, mobile just needs to be reasonable).
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CONTROL_URL = 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjY4Ijp7InYiOiIxIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzg4ODQ3NzQ3MzUyfX19';
const VARIATION_URL = 'https://www.financialprofessionals.org/?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjY4Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRiIsImFwcCI6ImFwcCIsInRzIjoxNzg4ODQ3NzMwNzIxfX19';

const OUT_DIR = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'afp26-recon');
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [label, url] of [['control', CONTROL_URL], ['variation', VARIATION_URL]]) {
  test(`AFP26 transcript checks — ${label}`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await page.evaluate(() => {
      document.querySelectorAll('[id*="onetrust"], [class*="cookie"], [class*="consent"]').forEach(el => {
        try { el.remove(); } catch (e) {}
      });
    }).catch(() => {});

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
          tag: el.tagName,
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height),
          top: Math.round(el.getBoundingClientRect().top + window.scrollY),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
          href: el.tagName === 'A' ? el.href : null,
        };
      }
      // exact-text visible match (case-insensitive), smallest matching element (avoid huge ancestor wrappers)
      function findExact(selector, text) {
        const matches = Array.from(document.querySelectorAll(selector)).filter(el =>
          el.textContent.trim().toUpperCase() === text.toUpperCase() && isVisible(el)
        );
        if (!matches.length) return null;
        matches.sort((a, b) => (a.getBoundingClientRect().width * a.getBoundingClientRect().height) - (b.getBoundingClientRect().width * b.getBoundingClientRect().height));
        return matches[0];
      }
      function findContains(selector, text) {
        const matches = Array.from(document.querySelectorAll(selector)).filter(el =>
          el.textContent.trim().toUpperCase().includes(text.toUpperCase()) && isVisible(el)
        );
        if (!matches.length) return null;
        matches.sort((a, b) => (a.getBoundingClientRect().width * a.getBoundingClientRect().height) - (b.getBoundingClientRect().width * b.getBoundingClientRect().height));
        return matches[0];
      }

      // Hero JOIN AFP button — the big white CTA, distinct from the small header-nav "JOIN" link.
      // Scope to elements positioned in the hero band (top < 600px) to avoid the nav.
      const heroJoinCandidates = Array.from(document.querySelectorAll('a')).filter(el => {
        const r = el.getBoundingClientRect();
        return el.textContent.trim().toUpperCase() === 'JOIN AFP' && isVisible(el) && r.top < 600;
      });
      const joinBtn = heroJoinCandidates[0] || null;

      // Card-row buttons: exact visible text match on each known label (control OR variation set)
      const buttonLabels = ['REGISTER HERE', 'LEARN MORE', 'REGISTER FOR POWER HOUR', 'EXPLORE CERTIFICATIONS', 'EXPLORE AFP EVENTS'];
      const cardButtons = buttonLabels.map(label => {
        const els = Array.from(document.querySelectorAll('a')).filter(el =>
          el.textContent.trim().toUpperCase() === label && isVisible(el)
        );
        return els.map(csOf);
      }).flat();

      // Eyebrows above each card heading (small caps text directly preceding it)
      const cardHeadingLabels = ['AFP Power Hour', 'Stablecoins & On-Chain Liquidity Certificate', 'AFP Events', 'Earn the CTP® or FPAC®'];
      const cardInfo = cardHeadingLabels.map(label => {
        const h = findExact('h1,h2,h3', label);
        if (!h) return null;
        const eyebrow = h.previousElementSibling && isVisible(h.previousElementSibling) ? csOf(h.previousElementSibling) : null;
        return { heading: csOf(h), eyebrow };
      }).filter(Boolean);

      // Section-2 heading + eyebrow ("Stand Out..." / "AFP Certifications")
      const sec2Heading = findExact('h1,h2,h3', 'Stand Out with the CTP® or FPAC®') || findExact('h1,h2,h3', 'AFP Certifications');
      const sec2Eyebrow = sec2Heading && sec2Heading.previousElementSibling && isVisible(sec2Heading.previousElementSibling)
        ? csOf(sec2Heading.previousElementSibling) : null;

      // Panel eyebrow "Already Certified" — small, visible element only
      const panelEyebrow = findExact('span,div,p', 'Already Certified') || findExact('span,div,p', 'ALREADY CERTIFIED');

      // Tab labels — buttons/divs with role tab or exact known tab text
      const tabLabels = ['Maintaining Your Credential', 'Maintain Your Credential', 'Certified Treasury Professional (CTP)', 'Certified Corporate FP&A Professional (FPAC)', 'AFP Certification Scholarship'];
      const tabs = tabLabels.map(label => findExact('button,div,span,a', label)).filter(Boolean).map(csOf);

      return {
        joinBtn: csOf(joinBtn),
        cardButtons,
        cardInfo,
        sec2Heading: csOf(sec2Heading),
        sec2Eyebrow,
        panelEyebrow: csOf(panelEyebrow),
        tabs,
      };
    });

    fs.writeFileSync(path.join(OUT_DIR, `transcript-check__${label}.json`), JSON.stringify(data, null, 2));
  });
}
