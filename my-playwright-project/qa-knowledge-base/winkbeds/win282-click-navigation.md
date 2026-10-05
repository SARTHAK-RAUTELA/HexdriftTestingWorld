# WIN282 (cre-t-282) — Shop Page Click Navigation Changes

**Site:** winkbeds.com/pages/shop-winkbed · **Audience:** mobile (<768px) · **Convert exp:** 100350640
**Force-preview URLs:** `?utm_campaign=Cro282mode&_conv_eforce=100350640.1003184723` (control) · `.1003184724` (variation)
**Code:** `local_testing/Local2/variation/vB.js` / `vB.css` (body class `cre-t-282` in BOTH arms)
**Spec source:** client video (Downloads/"Test 282, Win 282 Click Navigation Changes.mp4") + transcript. No Figma.
**Report:** `local_testing/Local2/win282-click-navigation-qa-report.html` · **Scripts:** `testing/win282-recon/` · **Shots:** `win282-screenshots/`

## What the test does
Control = WIN262 V2 (6 benefits stacked in a 2-col grid replacing the marquee). Variation: underline copy (not icons) and
smooth-scroll each item to a section: Rating→testimonials, USA→shop-hi-touch, Trial→shop-the-winkbed-warranty,
Warranty→shop-promise, Shipping&Returns→open FAQ "Can I return or exchange", Showrooms→WIN248's "Try The WinkBed In Person".

## QA run — 2026-10-05 (mobile only, Pixel 5 + iPhone 12, 2 reps per item)
- PASS: underline/cursor, control unchanged + no scroll, goals (any-benefit 100334595 + per-item) once per click in both arms,
  Rating, USA (iPhone; Pixel lands ~480px short), Showrooms (when WIN248 present), FAQ opens.
- **BUG-01 (High):** Trial 1/4, Warranty 1/4 correct. Target Y computed once at click; page still reflowing —
  `.cre-t-248-section` 223→7449→1045px, Buy Box 691→2539, FAQ 3530→1999. Only showrooms has a `settle()` re-check.
- **BUG-02 (Medium/question):** Showrooms scrolls to shop-frames bottom −100 (where WIN248 injects). Without WIN248 → lands on Trial section.
- NOTE: grid fixed 397px → clipped at ≤360px, control too (WIN262 inherited). Trailing underlined space after "&".

## Gotchas
- Control also has `.cre-t-282-container` but no `data-cre-target` attrs — select items by index/text in control.
- `#shopify-section-timedModal` ("We get it…") opens mid-run and eats taps; hide it via injected CSS.
- Headless WebKit: `locator.tap()` times out ("not stable") and `touchscreen.tap()` often doesn't register → use DOM click + elementFromPoint hit-test.
- Page height keeps changing for ~25s after load; any scroll-landing assertion must sample scrollY over time.

## Client answers — 2026-10-05
- Shipping & Returns → "Can I return or exchange" FAQ, opened: **approved**.
- Showrooms: WIN248 resumed, now a **deployment** (all traffic), and its scroll trigger was removed so `.cre-t-248-section` loads with the page.
  Link to that section; client OK'd `/pages/store-locator` as the fallback. BUG-02 downgraded to Low: still recommend
  targeting `.cre-t-248-section` directly and falling back to `/pages/store-locator` when it's missing.
- BUG-01 still open and now affects every visitor, because WIN248's store list (223→7449→1045px) loads for everyone on page load.

## WIN248 condition verified — 2026-10-05 (`testing/win282-recon/w248.js`)
- `.cre-t-248-section` is injected on page load with scrollY 0 and no scroll ever made, on Pixel 5 and iPhone 12, on both the
  WIN282 preview link and the plain shop URL. The scroll trigger is gone, as the client said.
- Showrooms tapped as soon as the grid appeared → "Try the WinkBed in person" heading 16–18px below the header (Pixel 2/2, iPhone 1/1 with 10s sampling).
  On iPhone it takes ~5s and several hops (1024→10098→16207→16626) to settle; a 4s sample window looks like a miss, so wait ≥10s.
- One iPhone run timed out before the page (and the section) loaded at all. That was slow WebKit loading, not the condition failing.
