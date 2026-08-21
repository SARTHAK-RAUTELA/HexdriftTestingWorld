# Thumbtack — vB Code Review (Antonio Roofing variation)

**Extracted verbatim from `local_testing/Local2/code-review-vB.html` on 2026-08-21, then the HTML deleted**
(large embedded-report file, superseded by this record — see repo cleanup workflow in
`qa-knowledge-base/README.md`).

**Reviewed:** 2026-06-30 · **Files:** `vB.js` + `vB.css` · **Variation class:** `Antonio_Roofing`
**Test type:** Static code review (not a Playwright/live-browser run) — findings below are unverified live,
they're read-through code findings only.

**Not the same test as** [`sa-roofing-landing-section.md`](sa-roofing-landing-section.md) (that's a separate,
already-fixed 26-TC functional/content QA pass with a different variation naming scheme — casing, star
rating, CTA text, phone format bugs, all resolved). This file's findings (avatar URL whitespace bug,
`__NEXT_DATA__` null-guard, page-wide `overflow:hidden`, dead CSS) were never folded into that test and had
no other record until now.

**Totals:** 5 Critical/Bug · 5 Medium/Quality · 9 Low/Style · 1 Dead-code block (~15 unused rule sets)

## Overview

IIFE wrapping, hydration guard, and event-delegation pattern are solid. Issues cluster in three areas: two
runtime bugs that visibly break the UI (broken avatar images, page-wide `overflow:hidden`), a silent CTA
failure risk if Thumbtack's Next.js data shape shifts, and ~15 dead CSS rule blocks copied from the shared
template. Two different brand blues and two different error reds should be reconciled in the same pass.

## Critical / Bug

1. **`vB.js:134-135` — Leading whitespace in two avatar URLs breaks the images.** Two of four reviewer
   `avatar` values start with a space before `https://` (Marcus T., Linda R.) — browsers treat the leading
   space as part of the URL and the fetch fails, so those avatars render broken. Fix: strip the leading space.
2. **`vB.js:547-554` — No null-guard on the `window.__NEXT_DATA__` chain used to build the CTA URL.**
   `buildInstantResultsUrl()` reads `window.__NEXT_DATA__.props.pageProps.frontDoorPage.heroSection
   .filterSubsection.cta` with no check at any level. If Thumbtack's page-data shape ever differs (page-type
   change, their own A/B test), this throws a TypeError that the outer IIFE catch swallows silently — the
   "Find me a pro" button stops working with no visible error. Fix: guard each level, `console.info` +
   early-return on mismatch instead of throwing.
3. **`vB.js:26-41` — `this && this.Element` polyfill guard should be `window.Element`.** Works only in
   sloppy mode (where bare `this` is the global object); fails silently under strict mode where `this` is
   `undefined`.
4. **`vB.css:708-710` — Page-wide `overflow:hidden` on `#__next`.** `body.Antonio_Roofing div#__next {
   overflow: hidden !important; }` was almost certainly added to suppress horizontal scroll during the FAQ
   max-height animation, but it clips ANY sticky header, dropdown, tooltip, or modal inside `#__next`, and
   breaks `position: sticky` for every descendant. Fix: scope to the injected wrapper only, or use
   `overflow-x: hidden` on `body` instead.
5. **`vB.css:999 & 1054` — Duplicate `[class*="ir-header_mainHeader"]` rule; the first (`margin-top: 15px`)
   is silently dead, the second (`18px !important`) wins.** Merge into one rule.

## Medium / Quality

6. **`vB.js:361` — FAQ builder checks `f.open` but no FAQ object in `sectionData.faqs` ever defines it** —
   the conditional always evaluates to `''`, a dead branch. Either add `open: true` to the intended
   default-open FAQ or remove the conditional.
7. **`vB.js:359-425` — FAQ accordion has no keyboard support or ARIA state.** Mouse-only click handler; no
   `tabindex`, no Enter/Space handler, `aria-expanded` never toggled.
8. **`vB.css:826, 840` — Two different brand blues** (`#009fd9` used everywhere else vs `#00acc1` on footer
   "Show more/less" + hover) — align both to `#009fd9`.
9. **`vB.css:344` + `vB.js:619,644` — Error colour mismatch between CSS border (`#ff5a5f`) and JS inline
   error-text style (`#d9232d`)** on ZIP validation — pick one red, move the JS inline style into a CSS
   class.
10. **Five inconsistent responsive breakpoints with no defined system** — `500px`/`700px`/`768px`/`900px`/
    `1120px` used for different, unrelated purposes throughout `vB.css`. Consolidate to 2-3 values.

## Low / Style (9)

- Mixed `var`/`const` and string-concat/template-literal style throughout (`vB.js:4, 452, 479`)
- `document.querySelector("body")` should be `document.body` (`vB.js:561`)
- Reviewer avatar `<img>`s missing `loading="lazy"` despite being below the fold (`vB.js:323`)
- `debug = 0` should be `debug = false` (`vB.js:4`)
- Four swiper rule blocks (`.TT-services-swiper`, `.TT-service-card`, etc.) duplicated verbatim at
  `vB.css:103-128` and again at `190-215`
- `.TT-review-text` has two dead declarations: `overflow-y:hidden`/`max-height:60px` both overridden by a
  later `overflow:hidden`/`max-height:120px` (`vB.css:284-297`)
- Two `font-weight` values on the same swiper-button pseudo-element, `bold` then `900` — the first is dead
  (`vB.css:177-179`)
- Double semicolon in `[fill="#D3D3D3"] { fill: #d3d4d5;; }` (`vB.css:317-320`)
- Overuse of `!important` — 20+ declarations, most fighting host-page specificity rather than genuinely
  needed; recommended fix is to prefix rules with `.Antonio_Roofing` for clean specificity instead

## Dead code

- **~15 unused template rule blocks in `vB.css`, none referenced by any HTML `vB.js` actually generates** —
  `.tt_footer_max_width`, `.tt_subhead_copy(_inner)`, `.tt_item_section`/`.tt_secondnav_section`/
  `.tt_toggle_cta`/`.section_b_black`, `.TT-global-footer` sibling selector, the entire `.TT-services-swiper`
  / `.TT-service-card` block, the entire `.TT-reviews-swiper` / `.TT-review-card` block, `.hero_header.pre-line`,
  `.tt-cr-reviewsTitle`. Carried over from the shared test template. Removing them would shrink the stylesheet
  from ~1248 lines to roughly 750.

*Last updated: 2026-08-21*
