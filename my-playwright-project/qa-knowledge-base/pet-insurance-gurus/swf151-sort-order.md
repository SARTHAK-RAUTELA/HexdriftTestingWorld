# SWF151 (cre-t-151) — Pet Insurance Gurus "Sort by" Feature

**Test file:** `my-playwright-project/testing/swf151-sort-order.spec.js`
**Screenshots dir:** `my-playwright-project/swf151-screenshots/`
**Site:** `https://petinsurancegurus.com`
**Test date:** July 29, 2026
**Browsers:** Chrome, Firefox, Edge, Safari (Desktop) + Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12) — all 6 `playwright.config.js` projects
**Variation class:** `cre-t-151` (shared by both V1 and V2 — differentiated only by `_conv_eforce`)
**Experiment:** `100052556`

**Force URLs:**
- V1 ("Best Rated" default): `https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052556.1000256663`
- V2 ("Lowest Price" pre-sorted default): `https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052556.1000256664`
- Bare/unforced: `https://petinsurancegurus.com/` — confirmed no `cre-t-151` class, no sort dropdown (control-absence case)

### Ticket typo — action item for client handoff

The ticket's preview-link section pasted the **same** URL (`.1000256663`) for both the V1 and V2 rows. Live
recon confirmed `.1000256663` is genuinely V1 ("Best Rated" default) and the real V2 link is `.1000256664`
(not written anywhere in the ticket text). Flag this back to the client so they don't hand testers/stakeholders
the wrong V2 link.

### What this A/B test does

Adds a "Sort by" pill (styled like the site's existing breed/ZIP filter fields) with two options — **Best
Rated** (the site's own, un-re-ranked order) and **Lowest Price**. V1 defaults to Best Rated; **V2 is
functionally identical except it defaults to Lowest Price on load**, pre-sorted with no user interaction
needed.

- Opening the menu shows only the two option labels — no "Sort by:" prefix (that only appears on the closed
  toggle button).
- A "Sorted by best rated."/"Sorted by lowest price." copy line: on desktop (≥992px) it sits top-right of the
  "Personalize prices" header row (`.filter-label-icon-container`); when the site's own "Showing prices for X"
  sentence is present it's appended to the end of that sentence; otherwise it renders as its own line under the
  filters.
- Selecting "Lowest Price" fades the listings (~200ms out, reorder, ~400ms fade back in) and re-sorts by
  ascending displayed price, reading `.plan-detail-content` under the "Average Plan Cost" column and counting
  only **visible** children — a hidden duplicate price span from the live, unrelated `cre-t-116` price-override
  test would otherwise be picked up and sorted on instead of the real number (confirmed live: hidden vs. visible
  prices give different orders).
- The pinned "Best Overall" card (`.best-overall-bubble` inside a `[data-unique$="-Listing-Only"]` block) is
  never moved by sorting — always stays last — but its badge text (`.best-overall-text`) swaps between "Best
  Overall" and "Lowest Price" depending on the active sort mode.
- An "i" icon (`[data-rt-tooltip]`) smooth-scrolls to the "Ranking Methodology" section (found by scanning
  `h2,h3,h4` for matching text, since this site renders it as an `<h3>` — confirmed different from Renters
  Insurance Gurus's `<h2>`).
- Mobile (≤767px): sort field shares row 2 with breed+ZIP; ZIP placeholder shortens "Enter Zip Code" → "ZIP
  code"; "Sort by:" label hidden inside the toggle to save space; at ≤374.98px the sort field drops to its own
  full-width row 3 and the label reappears.

### Code note — local files DID match this ticket (unlike SWF139/CRE-T-144)

`local_testing/Local2/variation/vB.js` and `v2.js` both carry `variation_name = "cre-t-151"` and are otherwise
byte-for-byte identical apart from one constant: `DEFAULT_SORT_MODE = "best-rated"` (vB.js/V1) vs.
`"lowest-price"` (v2.js/V2). Read both to confirm expected selectors/behavior; testing itself was still run
against the live force-preview URLs (not local injection), consistent with the established pattern on this
site (CRE-T-133 modal, cookie banner, async injection timing can only be observed against the real page).

### All Test Cases

| # | Variation | What it tests |
|---|-----------|---------------|
| C-01 | Bare URL | No `cre-t-151` class and no `#rt-sort-dropdown` on the unforced URL |
| 1 | V1 | Body has `cre-t-151` class |
| 2 | V1 | Default toggle value = "Best Rated" |
| 3 | V1 | Default `aria-selected`/`is-selected` state correct |
| 4 | V1 | Open menu shows only 2 option labels, no "Sort by" prefix |
| 5 | V1 | Default order = site's native order; pinned card is last |
| 6 | V1 | Toggle click opens menu (`.is-open` + `aria-expanded=true`) |
| 7 | V1 | Click outside closes the menu |
| 8 | V1 | Escape closes the menu |
| 9 | V1 | Selecting "Lowest Price" updates toggle value + copy |
| 10 | V1 | Selecting "Lowest Price" closes menu + selects the option |
| 11 | V1 | Selecting "Lowest Price" re-orders listings to strictly ascending price |
| 12 | V1 | Pinned card stays last; badge becomes "Lowest Price" |
| 13 | V1 | Switching back to "Best Rated" restores original order + "Best Overall" badge |
| 14 | V1 desktop | "i" icon exists; click scrolls Ranking Methodology to viewport top |
| 15 | V1 mobile (390px) | Same "i" icon scroll behavior |
| 16 | V1 desktop | Sort field lives in the filter row alongside breed+ZIP |
| 17 | V1 desktop | Copy line sits in `.filter-label-icon-container` at ≥992px |
| 18-19 | V1 (767/390/375px ×2) | ZIP placeholder "ZIP code" + "Sort by:" label hidden |
| 20 | V1 (767/390/375px) | Breed, ZIP, sort field share the same row |
| 21-22 | V1 (370/360px ×2) | Label reappears + sort field wraps full-width on its own row |
| 23 | V1 (370/360px) | ZIP placeholder still shortened at these widths |
| 24 | V1 (~900px) | Tablet: fields present and aligned on row 2 |
| 25 | V2 | Body has `cre-t-151` class |
| 26 | V2 | Toggle value already "Lowest Price" with zero interaction |
| 27 | V2 | Copy already "Sorted by lowest price." |
| 28 | V2 | `lowest-price` option already `is-selected`/`aria-selected=true` |
| 29 | V2 | Listings already in ascending-price order on first load |
| 30 | V2 | Pinned card badge already reads "Lowest Price" on load |

35 TCs × 6 browser projects = 210 runs.

### Result

**210 runs (35 TCs × 6 browsers) → 184 passed / 26 failed on the single full sequential run.** Zero failures on
Chrome Desktop, Firefox Desktop, or Edge Desktop (the first 3 browsers to run); all 26 failures were on the
last 3 (Safari Desktop: 5, Mobile Chrome (Pixel 5): 16, Mobile Safari (iPhone 12): 5).

Every failure's error was one of three navigation/injection-timing signatures — never an assertion mismatch:
`page.waitForSelector` 30s timeout waiting for `#rt-sort-dropdown` to attach (10 occurrences), `page.goto` 45s
timeout (1), and a contiguous burst of `net::ERR_NAME_NOT_RESOLVED` DNS failures unique to the Mobile Chrome
run window (15). **All 26 originally-failing tests were re-run individually afterward and every one passed**
(a few needed a second retry). **Result: 0 real functional bugs** — 100% of failures are environment/CDN
flakiness, consistent with this site's documented Convert.com rate-limiting pattern (see `_client-notes.md`).
Full breakdown and per-browser matrix in `local_testing/Local2/swf151-qa-report.html`.

### Bugs found

No functional defects. One observed-behavior note worth a client confirmation (not a bug):

- **Best Overall badge text swaps to "Lowest Price" when that sort mode is active [OBSERVATION, not a
  defect]:** the pinned card never moves, but `.best-overall-text` swaps between "Best Overall" and "Lowest
  Price" per `BEST_OVERALL_DEFAULT_LABEL`/`BEST_OVERALL_LOWEST_PRICE_LABEL` in the code. Clearly intentional
  (dedicated named constants), but isn't spelled out anywhere in the ticket's written copy — recommend a quick
  client confirmation before shipping.

### Issues found during development

- **Local files match this ticket** — first PIG test in this batch where `vB.js`/`v2.js` genuinely correspond to
  the ticket under test (contrast with SWF139/CRE-T-144, where local `vB.js` was leftover WinkBeds code). Both
  files were diffed side-by-side to confirm the only difference is `DEFAULT_SORT_MODE`.
- **Price-read logic must exclude the hidden `cre-t-116` duplicate price span** — replicated the production
  code's `isVisible()`/`getVisibleText()` approach in the test's own `getListingPrices()` helper rather than a
  naive `textContent` read, per `_client-notes.md`.
- **Best Overall badge text swap ("Best Overall" ↔ "Lowest Price") is real, dedicated behavior** (`BEST_OVERALL_DEFAULT_LABEL`/`BEST_OVERALL_LOWEST_PRICE_LABEL` constants in the code) but isn't explicitly
  called out anywhere in the written ticket copy — worth a quick client confirmation even though the
  implementation is clearly intentional (see Bugs/Issues section of the HTML report).
- Convert.com CDN rate-limiting on repeated automated navigation is a known pattern on this site (see
  `_client-notes.md`) — any later-browser flakiness in a single run should be checked against this before being
  treated as a functional bug.

### Additional test cases to consider

- [ ] Duplicate-init guard: re-running the variation script via `page.evaluate()` shouldn't add a second
      `#rt-sort-dropdown` or re-attach a second set of event listeners.
- [ ] Behavior when a breed/ZIP filter re-renders the listing list while a non-default sort mode is active
      (confirm the new render is instantly re-sorted per `refresh()`'s `applySort(currentMode, true)` path,
      not reset back to Best Rated).
- [ ] Keyboard accessibility: arrow-key navigation within the open listbox, Enter/Space to select an option.
- [ ] `aria-label`/announcement behavior for screen readers when the sort mode changes.
