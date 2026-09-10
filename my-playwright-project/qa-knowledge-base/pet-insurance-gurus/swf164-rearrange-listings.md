# SWF164 (cre-t-164) — Pet Insurance Gurus "Rearrange Listings"

**Test file:** `my-playwright-project/testing/swf164-rearrange-listings.spec.js`
**Screenshots:** `swf164-screenshots/` (HTML QA report retired — all findings/results captured in this doc)
**Site:** `https://petinsurancegurus.com`
**Test dates:** September 9, 2026 (initial pass) and September 10, 2026 (re-test — code rewritten, both `vB.js`/`va3.js` and `vB.css`/`va3.css` replaced wholesale between passes; see [[project_swf164-rearrange-listings]] memory)
**Browsers:** Chrome, Firefox, Edge, Safari (Desktop) + Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12) + Tablet (iPad Gen 7) — all 7 `playwright.config.js` projects, each in a fresh Playwright context (private-mode equivalent — no persisted profile/cookies between runs)
**Variation:** `cre-t-164` — V1 = Proposed Control (`vB.js`/`vB.css`), V2 = Proposed Variation (`va3.js`/`va3.css`). As of the re-test, `vB.js` and `va3.js` are byte-identical (all arm-specific logic now lives in CSS only).
**Experiment:** `100052787` (V1 = `1000257234` as of 2026-09-10 — was `1000257233` on 2026-09-09, V2 = `1000257236`)

## 2026-09-10 re-test — what changed since the first pass

The client supplied fully rewritten `vB.js`/`vB.css`/`va3.js`/`va3.css` (738 insertions / 364 deletions
across the four files vs. the previously-committed versions) and a **new V1 force-preview variation ID**
(`1000257234`, replacing the dead `1000257233`). Re-ran the full 7-browser suite (273 runs) plus live
recon against both real force-preview URLs.

**Result: 175 passed / 98 failed, 100% deterministic across all 7 browsers** (98 = the same 7 TCs × 2
arms × 7 browsers, no flakiness) — down from 140 failed in the first pass.

- **BUG-02 (ratings reverting under filters) is CONFIRMED FIXED.** The rewritten CSS moves every rating
  `::after` override (`.cre-t-135-total`, `.cre-t-135-classification`) out from behind the
  `body.cre-t-164-default` gate entirely — only the order/serial-number rules stay gated. TC-10/TC-13/
  TC-16 (ratings persist under Cats/Dogs/ZIP) now pass in all 7 browsers for both arms. This exactly
  matches the ticket's explicit requirement and directly fixes what was reported in the first pass.
- **BUG-01 (Show More / default-collapsed) is STILL PRESENT, confirmed live on the real Convert-served
  page** (not just local injection) via direct navigation to both force-preview URLs: at both ~1.5s and
  ~5s after load — well past the old 3-second re-collapse interval — the list is still showing only 7 of
  10 partner cards with zero user interaction. `expandIfCollapsed()` is still commented out in
  `updateFilterState()` in the rewritten code; the defensive CSS comment added in this rewrite
  (`/* force all 10 cards visible regardless of the native collapse mechanism -- needs live verification
  */`) does NOT hold, because `clickNativeButton()` still unconditionally does
  `listContainer.classList.add(collapsedClass)` on every tick of the post-init polling interval, which
  overrides that CSS.
- **BUG-01 now has a second, broader manifestation: it refires whenever a pet-type tab is clicked, not
  just on initial page load.** The rewrite added `eventListeners()`, which re-arms a 250ms-tick,
  1-second polling window (calling the same unconditional `clickNativeButton()`) on every `.oxy-tab`
  click — including clicking back to **All Pets** after Cats/Dogs, and on ZIP change. So TC-11/TC-14/
  TC-17 (order should restore to the full 10-card test order when returning to All Pets / clearing ZIP)
  now also fail: the returning state is collapsed to 7 cards, same missing trio (Odie/ASPCA/AKC) every
  time. Order and rating *values* are correct for every card that IS visible in all of these failures —
  this is purely a visibility/collapse bug, not a data bug.
- **V1's force-preview URL now works.** Live recon against the new URL
  (`_conv_eforce=100052787.1000257234`) shows `body` carrying `cre-t-164-default` and the toggle element
  present — the previous pass's "Convert has no code wired to this variation slot" gap is resolved. The
  `_conv_v` cookie confirms both V1 and V2 sessions are genuinely bucketed into their respective new
  variation IDs.

**Bottom line for this re-test: ship-blocking only on BUG-01.** Every visitor's first several seconds
(and every return-to-All-Pets action) still shows just 7 of the 10 reordered/re-rated partners. BUG-02 is
resolved and should not be re-flagged. See updated bug section below.

## What this A/B test does

Reorders the 10-partner comparison list and overrides several rating scores/labels, per the ticket's
Google Sheet, for two arms. Requirement (from the ticket): with **All Pets** selected (the default /
no filter), the test order + test ratings apply. With **any other filter active** (Cats, Dogs, breed,
ZIP), sorting must revert to the site's own native order, but **the test ratings must keep showing**
(not revert to native).

## Methodology note — V1 force-preview URL (2026-09-09 finding, RESOLVED 2026-09-10)

Live recon against the given force-preview links on 2026-09-09 found:

- **V2** (`?utm_campaign=Cro_mode164&_conv_eforce=100052787.1000257236`) correctly injects `cre-t-164`
  markup on first load.
- **V1** (`?utm_campaign=Cro_mode164&_conv_eforce=100052787.1000257233`) rendered **byte-identical to
  the bare/hardcoded page** — no `cre-t-164` classes, no toggle, no reordering. This was NOT a caching
  or navigation-timing issue: the `_conv_v` cookie set on the browser after visiting that URL confirmed
  Convert genuinely bucketed the session into `100052787.{v.1000257233}` — bucketing worked, but no
  code was wired to that variation slot in Convert yet.
- To QA both arms consistently despite this, the suite used (and still uses, for consistency across
  both passes) **local injection** of the real `vB.js`/`vB.css` and `va3.js`/`va3.css` files against
  the real live site (same established pattern as `swf151-new-build.spec.js` for this client).

**RESOLVED 2026-09-10:** the client issued a new V1 variation ID, `1000257234` (replacing the dead
`1000257233`). Live recon against `?utm_campaign=Cro_mode164&_conv_eforce=100052787.1000257234`
confirms `body` now carries `cre-t-164-default` and `.cre-t-164-toggle` is present — V1's force-preview
URL now correctly serves the real code. The `_conv_v` cookie confirms both V1 and V2 sessions are
genuinely bucketed into their respective new variation IDs. No further action needed on this item.

## Result

**2026-09-09 (first pass): 273 runs (39 TCs × 7 browsers): 133 passed / 140 failed.**
**2026-09-10 (re-test, after client rewrote all 4 variation files): 273 runs: 175 passed / 98 failed.**

Both passes are 100% deterministic — the exact same set of TCs fails in **every single browser/device**,
both arms, with no flakiness or CDN-timeout noise (unlike SWF151's last-3-browser flakiness). This is
strong evidence the failures are genuine functional bugs, not environment noise.

Order-only checks pass everywhere in both passes: rank renumbering (TC-06), pinned Best-Overall
duplicate-card detection (TC-07), no stray duplicate ids (TC-08), native-order-restore-under-filter for
Cats/Dogs (TC-09, TC-12), ZIP correctly drops the default class (TC-15), font-size parity (TC-18), and
no console errors (TC-19) all pass consistently across all 7 browsers for both arms. As of the re-test,
rating-persistence-under-filter (TC-10, TC-13, TC-16) also now passes everywhere — see BUG-02, fixed.

## Bugs found

### BUG-01 — "Show More" is fought by a background interval; default state loads collapsed, not expanded — STILL LIVE as of 2026-09-10 re-test

Both `vB.js` and `va3.js` intend the list to load **fully expanded** by default — the code comment
literally says `/* "default" should always land expanded (matching the site's normal fully-expanded
state) */` — but the call that would do that, `expandIfCollapsed()`, is commented out inside
`updateFilterState()` (still true in the 2026-09-10 rewrite). Confirmed live on load, both passes: only
7 of 10 cards are visible and the toggle reads "Show More".

**2026-09-09 finding:** clicking "Show More" was silently undone if clicked within ~3 seconds of load.
`init()` ran a 250ms-interval loop calling `clickNativeButton()` for the first 3 seconds after
injection, and `clickNativeButton()` unconditionally did `listContainer.classList.add(collapsedClass)`
on every tick — with no check for whether the user had since manually expanded via the toggle.

**2026-09-10 re-test — confirmed still present, now confirmed on the REAL Convert-served page (not just
local injection), and worse:**
- Live recon (direct navigation to both real force-preview URLs, no interaction at all) shows the list
  is still collapsed to 7/10 cards at ~5 seconds after load — well past the old 3-second window. The
  rewrite's own code comment (`/* defensive: force all 10 cards visible regardless of the native
  collapse mechanism -- needs live verification */` in the CSS) does **not** hold in practice, because
  `clickNativeButton()` still unconditionally re-adds `collapsedClass` on every interval tick,
  overriding that defensive CSS.
- **New manifestation:** the rewrite's `eventListeners()` re-arms the same 250ms-tick, 1-second
  collapse-fighting window on every `.oxy-tab` click (Cats/Dogs/**All Pets**) and on ZIP change — not
  just on initial page load. So returning to "All Pets" after any filter, or clearing the ZIP field,
  now also lands back on the 7-card collapsed state (TC-11, TC-14, TC-17 all fail for this reason,
  100% deterministic across all 7 browsers/both arms). Order and rating *values* are correct for every
  card that IS visible in every one of these failures — confirmed purely a visibility/collapse bug, not
  a data bug (see diffs: only Odie/ASPCA/AKC, i.e. ranks 8–10, are ever missing).

- **Impact:** every real visitor's first several seconds on the page — and every time they return to
  "All Pets" from a filter — show only 7 of the intended 10 reordered/re-rated partners.
- **Screenshots:** `swf164-screenshots/bug01-default-collapsed-v1-chrome.png` (2026-09-09),
  `swf164-screenshots/bug01-still-collapsed-retest-v1-chrome.png` (2026-09-10, default load),
  `swf164-screenshots/bug01b-collapse-refires-on-return-to-allpets-v1-chrome.png` (2026-09-10, return-
  to-All-Pets manifestation)
- **Fix:** re-enable `expandIfCollapsed()` in `updateFilterState()`, and make `clickNativeButton()`'s
  `classList.add(collapsedClass)` conditional (only add if not already expanded by the user), or stop
  each polling interval as soon as expansion succeeds. This must apply to both the initial `init()`
  interval AND the per-tab-click interval added in `eventListeners()`.

### BUG-02 — Ratings revert to native values under any filter — CONFIRMED FIXED as of 2026-09-10 re-test

**2026-09-09 finding:** the ticket states *"Whenever any of the filters are active, we will restore the
native website behaviour for the sorting order. However, the ratings will continue to be applied from
the test."* Live testing found activating Cats, Dogs, or a ZIP code correctly restored native **order**
but also reverted every rating/score/classification back to native, because both the order overrides
and the rating overrides were gated behind the same `body.cre-t-164-default` class.

**2026-09-10 re-test — fixed.** The rewritten `vB.css`/`va3.css` moves every rating `::after` override
(`.cre-t-135-total`, `.cre-t-135-classification`) out from behind the `body.cre-t-164-default` gate
entirely (only the order/serial-number rules stay gated). TC-10/TC-13/TC-16 (ratings persist under
Cats/Dogs/ZIP) now pass in all 7 browsers for both arms — confirmed live, e.g. Liberty Mutual correctly
holds "6.7 Good" and ASPCA correctly holds "4.5 Average" under every filter state tested.

- **Screenshot (historical, pre-fix):** `swf164-screenshots/bug02-ratings-revert-under-cats-filter-v1-chrome.png`
- **No further action needed.** Do not re-flag this on future passes unless a regression reappears.

## What was verified and is correct

- **Order and rating values in both CSS files are correct against the Google Sheet in both passes** —
  every `order` assignment and every rating `::after` content value in `vB.css`/`va3.css` (Fetch/
  Embrace/Pumpkin/Figo/Liberty Mutual/Trupanion/Odie/ASPCA/AKC, plus Lemonade left at native order:0 to
  land first) matches the ticket's Proposed Control/Variation columns exactly, confirmed both by static
  review and live render (TC-04/TC-05/TC-06 assertions match for every card that is actually visible —
  the only cards ever missing from a failing assertion are the collapse bug's Odie/ASPCA/AKC trio, never
  a wrong value).
- **Rating overrides only exist where the value actually changes from the current hardcoded page** —
  e.g. Embrace/Figo/Odie/AKC have no rating override in either arm because their proposed values equal
  the current hardcoded values; this is intentional and correct, not a missed override.
- **The "duplicate Best Overall" architecture works as intended** — there are genuinely two
  `data-unique="outbound-partner-clicks-Lemonade-Listing-Only"` elements on the page (one plain
  sortable card, one carrying `.best-overall-bubble`); the CSS correctly pins the bubble copy at
  `order: 12` (past even the toggle) without affecting the sortable Lemonade card, which is the same
  architecture already established for this client in SWF151.
- **Native order/rating restore under Cats and Dogs filters is correctly implemented, both halves as of
  the re-test** — order reverts to native under a filter, AND ratings now persist as the ticket
  requires (BUG-02 fixed).
- **Font-size parity holds** — the `.cre-t-135-total`/`.cre-t-135-classification` `::after` overrides
  use `font: inherit`, confirmed to render at the same computed font-size as an un-overridden sibling.
  No gap/spacing regression was found from the reordering or toggle insertion.
- **No duplicate-id or console-error regressions** from the injection in any browser, either pass.
- **As of the re-test, `vB.js` and `va3.js` are byte-identical** — all arm-specific behavior (order +
  ratings) now lives entirely in the per-arm CSS files, which simplifies future review (only need to
  diff CSS between arms, not JS).

## Additional test cases to consider

- [ ] Breed dropdown selection specifically (this suite exercises petType tabs and ZIP; the breed
      picker is a MUI popup requiring an option-list click and was not automated here — same
      `hasActiveFilters()`/`body.cre-t-164-default` code path applies for order-gating, and the same
      `eventListeners()`/`clickNativeButton()` collapse-fight applies for BUG-01, so BUG-01 almost
      certainly reproduces on breed selection too — should be confirmed manually or with a dedicated
      MUI-aware test).
- [x] ~~Re-verify V1's live force-preview URL once Convert has vB.js/vB.css actually attached~~ — DONE
      2026-09-10, confirmed working against the new variation ID `1000257234`.
- [ ] Duplicate-init guard (re-running the variation script via `page.evaluate()` shouldn't add a
      second toggle or double-bind the filter listeners) — not covered in either pass.
- [ ] Once BUG-01 is fixed, re-verify TC-02/TC-03/TC-11/TC-14/TC-17 (currently `expect.soft`/failing by
      design) all pass, and remove the stale "expected to fail" comments in the spec file.
