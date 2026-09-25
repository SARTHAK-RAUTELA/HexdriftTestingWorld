# Sherwin Williams Partner LP — thumbtack.com/pro?coBrand=sherwinwilliams

**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css` (body class `tt-williams-partner-lp`)
**Reference:** delivery-time full-page screenshots (Desktop.png 1440w, Mobile.png 390w); Figma access pending.

## What the test does
Co-branded Sherwin-Williams version of `/pro`: Thumbtack + SW logo in the header, a painting hero image,
H1 "Grow your business in [City]." (native geo city kept), subhead "Receive up to $400 … Sherwin-Williams pro.**",
"In partnership with Sherwin-Williams. Book a call with our team." (sales URL with utm), painter testimonials
("Real results from real painters."), "Get tips for success on Thumbtack." banner (info.thumbtack.com utm link),
a ** disclaimer, and a 6-question FAQ with a milestone table. The Tools logo row and the app-badges row are hidden.

## 2026-09-25 rebuild after the Thumbtack /pro redesign
The old code targeted `hero_heroInnerOffsetRight`, `see-how-different_*` and `[data-testid=get-started-button-mobile]`
and injected its own How-it-works, comparison-table, testimonials, calculator and community sections. After the
redesign those selectors no longer exist, and the site ships all of those sections **natively**:
`pro-signup-hero_*`, `how-tt-works_section`, `how-tt-different_section`, `pro-tools_section`, `pro-results_section`,
`earnings-calculator_section` (the native calculator works live on input), and `pro-community_section`.

We decided (with Sarthak) to **reuse the native sections and apply only the SW changes**. We did not restyle the
native sections back to the old blue/flat look, so control and variation differ only in the test's intended changes.

Implementation notes:
- Text swaps use `setText()`, which rewrites React's existing text node(s) instead of replacing children. A
  rAF-debounced MutationObserver re-applies everything, because every step is idempotent. This survives
  hydration and geo-city updates.
- Hero width: native `heroInner` and `heroImage` are `max-width: 743px`, and a native img rule caps the image
  at 450px. The variation widens them to 946px on desktop (≥769px) and sets `max-width: 100%` on our img.
- Verified 2026-09-25 at 1440/1024/768/390 (Chromium): all copy and links correct, calculator 250×10 → $2,500 /
  $30,000, one insert of each block after 10s of settling, no horizontal scroll, no variation errors.

## Site quirk found: stale 100% experiment 5870164508409856 ("test144", body class `pro-page-updte`)
It still runs on `/pro` and adds `cobrand-variation` to the body when the URL has `coBrand`. Its selectors are
dead after the redesign, so it throws ~29 × "Cannot read properties of null (reading 'insertAdjacentHTML')"
per page load (edge-client line ~336). This is harmless to layout, but it is console noise on control and
variation alike. Filter it out in specs, and flag it to the client for cleanup.
