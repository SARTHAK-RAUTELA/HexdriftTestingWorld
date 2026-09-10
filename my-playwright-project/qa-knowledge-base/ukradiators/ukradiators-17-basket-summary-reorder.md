# UKRadiators-17 — Basket Summary Reorder on /cart (MOBILE ONLY)

**Site:** ukradiators.com (Shopify) | **Platform:** Convert.com
**Target URL:** `/cart`
**Audience:** All users (new + existing), desktop and mobile devices
**Variation files:** `local_testing/Local2/variation/v2.js` / `vB.css` (class `cre-t-17-summary-inline`)
**Spec:** `testing/ukradiators-17-basket-summary-reorder.spec.js`
**Force URLs:** Control `_conv_eforce=100052714.1000257045` · Variation (V1) `_conv_eforce=100052714.1000257046`
**QA Report (Artifact):** https://claude.ai/code/artifact/198ab1c2-d341-4583-8552-8f36d5aecd92
**Screenshots:** `ukradiators-17-screenshots/` (control/variation full-page mobile captures)

## What this test does

On mobile, the theme's own responsive flex order (`.cart-sidebar{order:0}` / `.cart-product{order:2}`
inside a `display:flex;flex-direction:column` wrapper) already renders the Basket Summary card
**above** the product list — that's control, and it matches the mobile-first Figma control mock.
V1 physically re-parents the same `.cart-sidebar` DOM node into `.cart-product`, immediately before
the "Continue Shopping" link, so it renders **after** the product list instead — matching the
mobile-first Figma V1 mock. Gated to `max-width: 768px` only; above that breakpoint V1 is inert.

`v2.js` also binds a live `matchMedia('(max-width: 768px)')` listener, so resizing across the
breakpoint moves the block back and forth without a page reload — confirmed live in both directions.

**Important:** the ticket was originally labeled "mobile and desktop" in scope, but the client
corrected mid-session that this is mobile-only — audience targeting is "all users, desktop &
mobile" (i.e. anyone can land on the page from either device), but the *behavior change itself*
only applies at mobile viewport widths.

## Figma vs. code vs. live

Both control and V1 match their respective Figma mobile mocks exactly — DOM position, spacing
(`margin-bottom:24px`, `padding:24px 0`, `border-bottom:1px solid #D9D9D9`), and content. No
mismatches found. Desktop viewport is unaffected on both control and V1 (confirmed via TC-05,
TC-18).

## Bugs found

**None.** Every DOM, CSS, and content assertion for the actual variation behavior passed cleanly
across all five browser engines tested (Chrome/Firefox/Edge Desktop, Mobile Chrome, Mobile
Safari) — 96/101 total case executions passed; the other 5 were blocked by a testing-environment
artifact (see "Testing-environment note" below), not a code defect.

## Non-bug findings worth documenting

- **Redundant "Basket Summary" heading hidden once inlined — matches Figma, not a bug.** The
  selector `[data-discounts] + .cart__item-delivery.cart__item-sub.cart__item-row` in `vB.css`
  reads like it targets a delivery line, but in this theme's markup it actually matches the
  **`<strong class="basket-summary-title">Basket Summary</strong>` heading**, which shares those
  same layout classes. This hides the now-redundant heading once the block is relocated inline —
  confirmed the V1 Figma mock shows no duplicate heading in that position either.
- **Firefox-only third-party console error, pre-existing, unrelated to `v2.js`.** Firefox threw
  `ReferenceError: id is not defined` on the variation page. Stack trace:
  `observeCartChanges/cartObserver` inside `installSuperPlugin` — a third-party cart-tracking
  plugin, not `v2.js`. Reproduces identically with `v2.js` entirely absent from the page. Added to
  `KNOWN_PREEXISTING_SITE_ERRORS` in the spec.

## Testing-environment note (not a code defect)

Late in this session, after a very large volume of repeated automated force-hits to both the
control and variation URLs from the same IP (dozens of full Playwright runs across ~2 hours), the
**control URL began rendering V1's DOM changes** — reproduced twice in fully isolated checks that
never touched the variation URL, including after a 10-minute cooldown. `v2.js` has zero
targeting/eforce-checking logic of its own (it just waits for `.cart-product` and runs
unconditionally) — which URL shows which experience is decided entirely server-side by
Convert.com's force-preview bucketing. Chrome, Firefox, and Edge Desktop all showed correct
control behavior earlier in the same session, before the request volume accumulated. Likely a
Convert.com-side sticky-bucketing/caching artifact from testing density, not a real targeting
misconfiguration — but flagged to the client to independently re-verify both force-preview links
from a normal (non-automated) browsing session. See `_client-notes.md` for the testing-methodology
takeaway.

## Test scenarios (21 TCs, `testing/ukradiators-17-basket-summary-reorder.spec.js`)

| TC | Category | What it checks |
|----|----------|-----------------|
| TC-01 | Control | No `cre-t-17` marker/class exists anywhere on the page (mobile viewport) |
| TC-02 | Control | Basket Summary is a sibling of the product list, not nested inside it |
| TC-03 | Control | Basket Summary renders ABOVE the product list on mobile (theme default flex order) |
| TC-04 | Control | Basket Summary heading text is visible |
| TC-05 | Control | Desktop viewport — same structure, no marker |
| TC-06 | Variation | Marker + `cre-t-17-summary-inline` class present on cart-sidebar at mobile viewport |
| TC-07 | DOM | cart-sidebar is moved to be a DOM child of cart-product |
| TC-08 | DOM | cart-sidebar sits immediately before the Continue Shopping link (DOM adjacency) |
| TC-09 | Visual | Basket Summary renders above Continue Shopping, below the product list (matches Figma V1) |
| TC-10 | CSS | Margin/padding/border spec match on the inline Basket Summary block |
| TC-11 | Content | Redundant "Basket Summary" heading hidden once inlined — confirmed intentional |
| TC-12 | Content | Subtotal/Delivery/Total labels still present after the move |
| TC-13 | Content | Checkout button still present, visible, enabled |
| TC-14 | Content | Express checkout buttons (Shop Pay / PayPal) still present |
| TC-15 | Guard | Duplicate-init guard — re-running `v2.js` leaves exactly one moved instance |
| TC-16 | Responsive | No horizontal page overflow at mobile viewport |
| TC-17 | Data integrity | Cart total unchanged between control and variation (same cart) |
| TC-18 | Gate | Desktop viewport — summary stays in original position, NOT moved |
| TC-19 | Live resize | Resize desktop→mobile: summary moves inline live via the matchMedia listener |
| TC-20 | Live resize | Resize mobile→desktop: summary is restored to its original position |
| TC-21 | Errors | `v2.js` introduces no NEW uncaught page errors beyond known pre-existing site errors |

## Results by browser (2026-08-27)

| Browser | Cases run | Pass | Blocked | Notes |
|---|---|---|---|---|
| Chrome Desktop | 21/21 | 21 | 0 | Clean. |
| Firefox Desktop | 21/21 | 21 | 0 | 1 pre-existing third-party error found & allowlisted (see above). |
| Edge Desktop | 21/21 | 21 | 0 | Clean. |
| Mobile Chrome (Pixel 5) | 21/21 | 16 | 5 | TC-01–05 blocked by the control-leak artifact — TC-06–21 (all variation behavior) clean. |
| Mobile Safari (iPhone 12) | 21/21 | 20 | 1 | Only TC-05 blocked — TC-01–04 and TC-06–21 clean. |

Safari Desktop was not run — client narrowed scope to mobile-only devices (Mobile Chrome, Mobile
Safari) plus the desktop engines already completed at that point in the session.

## Issues found during development (test-infra, not product bugs)

- **`page.request.post()` gets flagged by this site's bot-protection more readily than an in-page
  `fetch()`.** Its fingerprint/headers reliably tripped a 429 challenge even when curl and a real
  in-page `fetch()` call both succeeded seconds apart. Fix: run add-to-cart calls via
  `page.evaluate(() => fetch('/cart/add.js', {...}))` instead of `page.request.post(...)`.
- **The site's bot-protection is frequency/volume-based across a rolling window, not just a hard
  per-burst threshold.** Even with add-to-cart consolidated to one call per `test.describe` block
  (shared context via `beforeAll`/`afterAll`, serial mode) and 45-60s pacing between blocks, this
  session still tripped 429s multiple times, especially right after a block that did 5 full page
  navigations. Cooldowns needed to clear ranged from a few minutes up to ~15 minutes after repeated
  trips (the block appears to escalate).
- **A `beforeAll`/test pacing delay over ~90s needs `testInfo.setTimeout(...)`.** Playwright's
  default hook/test timeout is 90s — a deliberate `await pace(120)` inside a hook silently times
  out the whole block (`"beforeAll" hook timeout of 90000ms exceeded`) unless the timeout is
  extended first via `testInfo.setTimeout(240000)`. Cost real time in this session before being
  caught — the pacing value itself (60s) turned out to be sufficient; 120s was unnecessary and
  only surfaced this separate bug.
- **Consolidating repeat navigations within a `test.describe` block matters.** The
  "at desktop viewport" describe block originally did 3 separate full navigations (one per TC);
  refactored to navigate once and drive TC-18/19/20 via `setViewportSize()` resizes on the
  already-loaded page (the `matchMedia` listener fires on resize without a reload) — cut that
  block's request footprint by two-thirds.

## Additional test cases to consider

- A discount-code scenario to explicitly verify the `[data-discounts]`-adjacent CSS rule's
  behavior when `[data-discounts]` actually contains rendered discount content (this session only
  confirmed the rule against the always-present-but-empty `[data-discounts]` container).
- Safari Desktop, if the client re-expands scope beyond mobile-only devices.
