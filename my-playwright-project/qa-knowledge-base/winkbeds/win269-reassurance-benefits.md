# WIN269 (cre-t-269) — Shop Page Reassurance Benefits (Desktop)

**Site:** winkbeds.com/pages/shop-winkbed · **Audience:** desktop (CSS shows bar >1000px) · **Convert exp:** 100350736
**Preview:** `?convert_action=convert_vpreview&convert_e=100350736&convert_v=1003184950` (control) / `…1003184951` (variation)
**Code:** `local_testing/Local2/variation/` vB.js = control (goals only, body `cre-t-269-control`), va3.js/va3.css = variation (`cre-t-269-d`)
**Spec source:** wireframe `Downloads/Group 1944.png`. Variation = desktop version of WIN282: 6 underlined links, 3 per row.
**Spec:** `testing/win269-reassurance-benefits.spec.js` · recon + report builder `testing/win269-recon/` (build-report.js + bugs.html)
**Report:** `local_testing/Local2/win269-reassurance-benefits-qa-report.html` · results `win269-results/` · shots `win269-screenshots/`

## Run 2026-10-15 — Chrome 15/22, Edge 15/22, Firefox 14/22, Safari(WebKit) 14/22
- PASS: visuals at 1440 match the wireframe (#edf4fc card, radius 24, 2×3, copy, icons); native bar hidden; hidden ≤1000; control unchanged;
  control goals 659/662/660/666 + any-benefit 667; Shipping opens "Can I return or exchange"; USA/Rating land at top 160; no hash change, no errors.
- BUG-01 High: the variation maps only trial/shipping/warranty goals. Showrooms/USA/Rating fire only 667. The exp has 8 per-benefit code goals (100334659–666);
  661/663/664/665 are never fired. Goal names aren't exposed client-side, so ask the dev/client for the mapping.
- BUG-02 High: Trial (all 4 browsers) and Warranty (Chromium/Firefox) land wrong on the first click. shop-box goes 550→0 and `.cre-t-248-section`
  grows 261→810 during the smooth scroll. A second click lands fine. On Safari, Shipping landed and then reflowed to the footer. Same root cause as WIN282 BUG-01.
- BUG-03 Medium: 1001–1439px shows 2 per row (3 rows); 3 columns only at ≥1440, though 3 fit at 1280+.
- BUG-06 Medium: Safari had no WIN248 section, so Showrooms (shop-frames bottom −100) landed on Trial. Same issue as WIN282 BUG-02; the fallback is /pages/store-locator.
- Low: goals on mousedown only (keyboard Enter: no goal); icon/text column misalignment; the 14px font-size override is dead.
- Q: the wireframe copy (150+ Showrooms, Rated 4.8 stars, Handmade in the U.S.A.) differs from the WIN282 reference (100+, 4.8-Star Rating, Made in the USA).

## Gotchas
- Hook `_conv_q.push` in an init script to capture `triggerConversion` IDs. `window.convert.data.experiences[*].goals` lists the exp's goal IDs.
- In-page `fetch()` of crocdn icons fails with CORS, so check `img.naturalWidth` instead.
- Landing checks need fresh loads (a second click on a settled page hides BUG-02) and sampling for ~7s (Safari reflows after landing).
- The Edge/Firefox/Safari runs took 5–11 min each. Run one project at a time.
