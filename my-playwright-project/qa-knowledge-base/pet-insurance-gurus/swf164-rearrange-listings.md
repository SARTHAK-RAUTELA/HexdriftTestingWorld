# SWF164 (cre-t-164) — Pet Insurance Gurus "Rearrange Listings"

**Test file:** `my-playwright-project/testing/swf164-rearrange-listings.spec.js`
**Screenshots:** `swf164-screenshots/` (HTML QA report retired — all findings/results captured in this doc)
**Site:** `https://petinsurancegurus.com`
**Test date:** September 9, 2026
**Browsers:** Chrome, Firefox, Edge, Safari (Desktop) + Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12) + Tablet (iPad Gen 7) — all 7 `playwright.config.js` projects, each in a fresh Playwright context (private-mode equivalent — no persisted profile/cookies between runs)
**Variation:** `cre-t-164` — V1 = Proposed Control (`vB.js`/`vB.css`), V2 = Proposed Variation (`va3.js`/`va3.css`)
**Experiment:** `100052787` (V1 = `1000257233`, V2 = `1000257236`)

## What this A/B test does

Reorders the 10-partner comparison list and overrides several rating scores/labels, per the ticket's
Google Sheet, for two arms. Requirement (from the ticket): with **All Pets** selected (the default /
no filter), the test order + test ratings apply. With **any other filter active** (Cats, Dogs, breed,
ZIP), sorting must revert to the site's own native order, but **the test ratings must keep showing**
(not revert to native).

## Methodology note — V1 force-preview URL does not work live

Live recon against the given force-preview links found:

- **V2** (`?utm_campaign=Cro_mode164&_conv_eforce=100052787.1000257236`) correctly injects `cre-t-164`
  markup on first load.
- **V1** (`?utm_campaign=Cro_mode164&_conv_eforce=100052787.1000257233`) renders **byte-identical to
  the bare/hardcoded page** — no `cre-t-164` classes, no toggle, no reordering. This is NOT a caching
  or navigation-timing issue: the `_conv_v` cookie set on the browser after visiting that URL
  confirms Convert genuinely bucketed the session into `100052787.{v.1000257233}` — bucketing works,
  but no code appears to be wired to that variation slot in Convert yet.
- **Action item for client/Asher:** confirm vB.js/vB.css are actually attached to variation
  `1000257233` in Convert before this test goes live — right now visitors bucketed into "Proposed
  Control" see the unmodified hardcoded page, not vB.js's intended output.
- To QA both arms consistently despite this, this suite uses **local injection** of the real
  `vB.js`/`vB.css` and `va3.js`/`va3.css` files against the real live site (same established pattern
  as `swf151-new-build.spec.js` for this client).

## Result

**273 runs (39 TCs × 7 browsers): 133 passed / 140 failed.** Failure pattern is 100% deterministic —
the exact same 10 of 39 TCs fail in **every single browser/device**, both arms, with no flakiness or
CDN-timeout noise (unlike SWF151's last-3-browser flakiness). This is strong evidence the failures are
genuine functional bugs, not environment noise.

Order-only checks pass everywhere: rank renumbering (TC-06), pinned Best-Overall duplicate-card
detection (TC-07), no stray duplicate ids (TC-08), native-order-restore-under-filter for Cats/Dogs
(TC-09, TC-12), ZIP correctly drops the default class (TC-15), font-size parity (TC-18), and no
console errors (TC-19) all pass consistently across all 7 browsers for both arms.

## Bugs found (both confirmed live, reproducible in all 7 browsers, both V1 and V2 — same shared code path)

### BUG-01 — "Show More" is fought by a 3-second background interval; default state loads collapsed, not expanded

Both `vB.js` and `va3.js` intend the list to load **fully expanded** by default — the code comment
literally says `/* "default" should always land expanded (matching the site's normal fully-expanded
state) */` — but the call that would do that, `expandIfCollapsed()`, is commented out at line 152 of
both files inside `updateFilterState()`. Confirmed live: on load, only 7 of 10 cards are visible and
the toggle reads "Show More".

**Worse: clicking "Show More" is silently undone if clicked within ~3 seconds of load.**
`init()` runs a 250ms-interval loop calling `clickNativeButton()` for the first 3 seconds after
injection, and `clickNativeButton()` unconditionally does `listContainer.classList.add(collapsedClass)`
on every tick — with no check for whether the user has since manually expanded via the toggle. A user
(or any fast automated interaction) who clicks "Show More" inside that 3-second window sees the list
snap back to collapsed on the very next 250ms tick. Isolated recon confirmed: clicking the toggle
**after** waiting past the 3-second window works correctly and stays expanded (11/11 cards visible,
stable a further second later); clicking inside the window reverts to 7 visible.

- **Impact:** every real visitor's first several seconds on the page show only 7 of the intended 10
  reordered/re-rated partners, and an eager click on "Show More" appears completely broken.
- **Screenshot:** `swf164-screenshots/bug01-default-collapsed-v1-chrome.png`
- **Fix:** re-enable `expandIfCollapsed()` in `updateFilterState()`, and make `clickNativeButton()`'s
  `classList.add(collapsedClass)` conditional (only add if not already expanded by the user), or stop
  the init interval as soon as expansion succeeds.

### BUG-02 — Ratings revert to native values under any filter, contradicting the ticket's explicit requirement

The ticket states: *"Whenever any of the filters are active, we will restore the native website
behaviour for the sorting order. However, the ratings will continue to be applied from the test."*
Confirmed live: activating Cats, Dogs, or a ZIP code correctly restores native **order** — but it also
reverts every rating/score/classification back to the site's native values, because **both** the order
overrides and the rating overrides are gated behind the exact same `body.cre-t-164-default` class in
`vB.css`/`va3.css`. `hasActiveFilters()` removes that one class for any active filter, which
simultaneously undoes everything — there's no separate gate that keeps rating overrides alive while
letting order revert.

Example (V1/Proposed Control, under Cats filter): Liberty Mutual should still read "6.7 Good" (the
test rating) but instead reads the native "5.1 Average"; ASPCA should still read "4.5 Average" but
instead reads the native "8.7 Excellent".

- **Impact:** directly fails a written, explicit requirement of the ticket for any visitor who touches
  a filter.
- **Screenshot:** `swf164-screenshots/bug02-ratings-revert-under-cats-filter-v1-chrome.png`
- **Fix:** split the single `.cre-t-164-default` gate into two independent states — one controlling
  `order` (removed under any filter) and one controlling the rating `::after` overrides (kept under
  any filter, only removed if the override data doesn't apply — e.g. if a future per-pet-type rating
  set is introduced). At minimum, the rating override rules need their own class that
  `hasActiveFilters()` does NOT touch.

## What was verified and is correct

- **Order values in both CSS files are correct against the Google Sheet** — every `order` assignment
  in `vB.css`/`va3.css` (Fetch/Embrace/Pumpkin/Figo/Liberty Mutual/Trupanion/Odie/ASPCA/AKC, plus
  Lemonade left at native order:0 to land first) matches the ticket's Proposed Control/Variation
  columns exactly, confirmed both by static review and live render (TC-04/TC-05 assertions on the full
  10-card set match, once the collapse bug above is worked around).
- **Rating overrides only exist where the value actually changes from the current hardcoded page** —
  e.g. Embrace/Figo/Odie/AKC have no rating override in either arm because their proposed values equal
  the current hardcoded values; this is intentional and correct, not a missed override.
- **The "duplicate Best Overall" architecture works as intended** — there are genuinely two
  `data-unique="outbound-partner-clicks-Lemonade-Listing-Only"` elements on the page (one plain
  sortable card, one carrying `.best-overall-bubble`); the CSS correctly pins the bubble copy at
  `order: 12` (past even the toggle) without affecting the sortable Lemonade card, which is the same
  architecture already established for this client in SWF151.
- **Native order/rating restore under Cats and Dogs filters is correctly implemented** — the *order*
  half of the requirement genuinely works (see BUG-02 for the rating half).
- **Font-size parity holds** — the `.cre-t-135-total`/`.cre-t-135-classification` `::after` overrides
  use `font: inherit`, confirmed to render at the same computed font-size as an un-overridden sibling.
  No gap/spacing regression was found from the reordering or toggle insertion.
- **No duplicate-id or console-error regressions** from the injection in any browser.

## Additional test cases to consider

- [ ] Breed dropdown selection specifically (this suite exercised petType tabs and ZIP; the breed
      picker is a MUI popup requiring an option-list click and was not automated here — same
      `hasActiveFilters()`/`body.cre-t-164-default` code path applies, so BUG-02 almost certainly
      reproduces there too, but should be confirmed manually or with a dedicated MUI-aware test).
- [ ] Re-verify V1's live force-preview URL once Convert has vB.js/vB.css actually attached to
      variation `1000257233`, to confirm the local-injection results match the real Convert-served
      experience.
- [ ] Duplicate-init guard (re-running the variation script via `page.evaluate()` shouldn't add a
      second toggle or double-bind the filter listeners) — not covered in this pass.
