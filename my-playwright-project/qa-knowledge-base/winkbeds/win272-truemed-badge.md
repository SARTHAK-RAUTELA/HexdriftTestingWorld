# WIN272 (cre-t-272) — Shop Page "Truemed Badges"

**Site:** winkbeds.com/pages/shop-winkbed · **Audience:** all visitors · **Convert exp:** 100350648
**Force-preview URLs:** control `?cro_mode=qa&_conv_eforce=100350648.1003184744` · variation `...1003184745`
**Code:** `local_testing/Local2/variation/va3.js` / `va3.css` (body class `cre-t-272`)
**Spec:** `my-playwright-project/testing/win272-truemed-badge.spec.js`
**Report:** `local_testing/Local2/win272-truemed-badge-qa-report.html` (built by `build-win272-report.js <dir with r_*/rr_* JSON>`)
**Screenshots:** `win272-screenshots/`
**Figma:** `Group 3.png` (Downloads), a single annotated variation frame

## What the test does

Adds the line "HSA/FSA eligible with [Truemed logo SVG]" between the payment-icons row and the "Or buy now, pay later"
financing block. Figma notes ask for: this exact spot, font styles exactly matching the financing copy (bold
"HSA/FSA eligible", regular "with"), and equal margin above and below.

va3.js **appends** `.cre-t-272-container` to the end of `#orderForm` (a flex column), then CSS sets the badge to
`order: 3` and the financing block to `order: 4`, **only under `body.cre-t-272.cre-t-202`**. Without cre-t-202 in
place, cre-t-202's own `order: 3` on the financing block disappears too.

## QA run — 2026-10-01

7 browser projects, run one browser at a time (a full matrix run was stopped twice for low memory on this machine).
53/66 checks passed overall.

- **Pass in all 7 browsers:** placement (TC-03); spacing of 24px above and 24px below (TC-04); copy and logo
  (93×20 SVG, alt "Truemed"); single instance kept across size/firmness changes (TC-06); 320/280px widths (TC-08);
  control unchanged (TC-01).
- **BUG-01 (Medium, risk):** placement depends on cre-t-202. Removing the class moved the badge under "The WinkBed"
  title, but only intermittently (first recon, one Chrome run, Safari, Pixel 5). In other runs it stayed in place.
  TC-07 now uses a MutationObserver to keep the class stripped, because cre-t-202 re-adds it itself. Fix: insert the
  badge `beforebegin` the financing container instead of relying on `order`.
- **BUG-02 (Low):** letter-spacing is `normal` on the badge vs `0.187px` on the financing copy. Fails in all 7 browsers.
  Family, size (14px), weight (600/400), line-height (17px) and colour all match.
- **Add to Cart (TC-09):** scripted clicks sometimes don't register. Firefox **Control** failed while Variation
  passed, so this is site/automation flake, not WIN272. Add to Cart worked every time by hand.

## Gotchas for re-test

- The two preview links can land in different WIN266 arms (different subtotal-line copy). That's unrelated noise.
- The "We get it…" retention popup covers narrow-viewport screenshots. The spec's `dismissPopups()` clicks
  "OK, GOT IT" and hides fixed full-screen overlays.
- The size/firmness `<select>` elements are `#size-select` / `#firmness-select`. Use `selectOption`, not text clicks.

## Re-test — 2026-10-01 (after dev fix)

The dev fix went to Convert only. Local `va3.js`/`va3.css` were unchanged, so the deployed CSS was tested. 62/70 checks passed across 7 browsers.

- **BUG-02 FIXED:** the live CSS adds `letter-spacing: 0.187px` to `.cre-t-272-hsa-text`. TC-05 passes in 7/7 browsers.
- **BUG-01 STILL OPEN, and reproducible in 7/7 browsers (correction):** the live CSS is still scoped to `.cre-t-202`, and the badge
  is still the last child of `#orderForm`. Without cre-t-202, the badge moves up under the title (Chrome, iPhone 12, iPad)
  or drops to the very bottom of the Buy Box (Firefox, Edge, Safari, Pixel 5). Round 1 called this "intermittent"
  because TC-07 only checked `badge >= pay.bottom`, which the bottom case also satisfies. TC-07 now also requires
  `badge.bottom <= fin.top`, and the report builder re-scores old runs from the logged positions.
- Firefox TC-03 failed on a page-setup timeout (load noise). Add to Cart passed in both arms on 7/7 browsers.
