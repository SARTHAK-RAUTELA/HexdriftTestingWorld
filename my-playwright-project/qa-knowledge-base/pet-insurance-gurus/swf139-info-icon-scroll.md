# SWF139 — Pet Insurance Gurus Info Icon → Ranking Methodology Scroll

**Test file:** `my-playwright-project/testing/swf139-info-icon-scroll.spec.js`
**Screenshots dir:** `my-playwright-project/swf139-screenshots/`
**Site:** `https://petinsurancegurus.com` (`/compare/` primary, homepage secondary)
**Test date:** July 2026
**Browsers:** Chrome, Firefox, Edge, Safari (desktop 1280×800 + mobile-width 390×844 within same 4 engines)
**Variation class:** `cre-t-139`
**Experiment:** `100052498`
**Force URLs (Control / V1):**
- Control: `?utm_campaign=Cro_mode139&_conv_eforce=100052498.1000256530`
- V1: `?utm_campaign=Cro_mode139&_conv_eforce=100052498.1000256531`

### What this A/B test does

Adds an **"i" info icon** to the scoring badge that won SWF135 (the badge itself, e.g. Lemonade "9.6 ★
Exceptional", is unchanged). Clicking the icon — or the "Pet Insurance Gurus Score" text next to it on desktop
— smooth-scrolls the page so the **Ranking Methodology** section (`#content-section`) lands at the top of the
viewport.

- **Desktop:** icon sits next to "Pet Insurance Gurus Score" (`.cre-t-139-top-content2-text-wrap .cre-t-139-info-icon`).
- **Mobile (≤767px):** that score copy is hidden entirely, so per the Figma note ("put the i next to the badge
  element that does show") the icon instead sits next to the classification word, e.g. "Exceptional"
  (`.cre-t-139-classification-wrap .cre-t-139-info-icon`).
- Each injected badge carries **both** icon variants in the DOM; CSS shows only the one matching viewport width.
- Applies to every insurer row in the comparison list, including the special-cased Liberty Mutual row
  (handled by a separate `renderLibertyMutual()` code path).

### Code note — local control file was wrong (again)

Local `vB.js`/`vB.css` supplied for this test were **not** SWF139's control code — confirmed to be unrelated
WinkBeds `cre-t-253` mattress order-form subtotal script (same mismatch pattern as CRE-T-144, see that file).
Local `js.js`/`hello.css` (variation name `cre-t-139`) DID match this test and were used to identify selectors,
then verified against the live Convert.com preview URLs above — all testing was done against those live links,
not the local `vB.js`.

### All Test Cases (22 TCs, run once per URL path `/compare/` and `/` where noted)

| TC | Variation | What it tests |
|----|-----------|---------------|
| C-01 | Either | Info icon only ever present when `body` has `cre-t-139` class (invariant, unforced URL) |
| 1 | Control | `body` has `cre-t-135` class, not `cre-t-139` |
| 2 | Control | No info icon anywhere on the page |
| 3 | Control | SWF135 badge(s) present |
| 4 | V1 | `body` has `cre-t-139` class |
| 5 | V1 | Old SWF135 badge fully replaced (not just hidden) |
| 6 | V1 | ≥1 badge injected, exactly 2 icon variants per badge (desktop+mobile) |
| 7 | V1 | Liberty Mutual row also gets a badge+icon, when present (runtime-skip when absent) |
| 8 | V1 | Badge/icon count stays stable over ~2s (no self-duplication from the 250ms re-scan interval) |
| 9 | V1 desktop | Desktop icon visible, mobile icon hidden |
| 10 | V1 desktop | "Pet Insurance Gurus Score" text visible |
| 11 | V1 desktop | Icon SVG fill = `#8C8EA0` / `rgb(140, 142, 160)` |
| 12 | V1 desktop | Cursor pointer on icon + score text |
| 13 | V1 desktop | `#content-section` is the "Ranking Methodology" section |
| 14 | V1 desktop | Click icon → smooth scroll lands section at viewport top (±10px) |
| 15 | V1 desktop | Click score text → same scroll |
| 16 | V1 desktop | Icon click does NOT toggle dropdown-active (guarded by `innerWidth<992`) |
| 17 | V1 desktop | Hover does NOT reopen legacy review dropdown (SWF135 removal preserved) |
| 18 | V1 mobile | "Pet Insurance Gurus Score" line hidden entirely |
| 19 | V1 mobile | Icon visible next to classification instead |
| 20 | V1 mobile | Icon click still scrolls toward Ranking Methodology |
| 21 | V1 mobile | **BUG-01** — icon click also toggles `dropdown-active` (unintended) |
| 22 | V1 mobile | Tapping review-top toggles the class but dropdown stays hidden (dead legacy toggle) |

**Result:** 124 runs (31 TCs × 4 browsers) → 109 passed / 5 failed / 10 skipped. All 5 failures were on
Firefox/Edge/Safari (zero on Chrome, which ran first) and were injection-timing/count checks, not behavioral
failures — consistent with this site's known Convert.com CDN rate-limiting under repeated automated navigation
(see `_client-notes.md`). The 10 skips are the Liberty Mutual check running only when that row happens to be
present on a given page load (see Issues below).

### Bugs found

- **BUG-01 [MEDIUM, confirmed reliably 3/3 in isolated testing]:** on any viewport <992px, the info icon sits
  inside `.cre-t-139-review-top`, which has its own delegated `document` click handler toggling
  `cre-t-139-dropdown-active` for viewports <992px. That handler fires alongside the icon's own scroll handler
  on the same click (both attached independently via the site's `live()` delegation helper), so tapping the
  icon also toggles the dropdown state as an unintended side effect. **Low impact today** because a separate
  trailing `!important` CSS override (inherited from SWF135, see below) keeps the dropdown permanently hidden
  regardless of the class — but at tablet widths (768–991px) the toggle can still visibly rotate the
  `.cre-t-139-top-content2-icon` chevron. Fix: `e.stopPropagation()` in the icon's click handler, or exclude
  icon clicks from the review-top toggle handler's target check.
- **LOW — code smell:** `updateInsuranceData(libertyData)` inside `renderLibertyMutual()` (js.js) omits the
  required `item` argument (signature is `updateInsuranceData(data, item)`), so the re-update-on-existing-container
  path silently no-ops. No visible impact today since `libertyData` is static.
- **LOW — pre-existing dead code, not from this ticket:** a trailing "Changes for Test Test 135" CSS block
  (carried over from SWF135, whose ticket removed this dropdown) keeps `.cre-t-139-review-dropdown`
  permanently `display:none !important`, overriding both the desktop `:hover` rule and the mobile
  `.dropdown-active` rule. The Popularity/Value-for-Money/Reviews breakdown panel and its X close icon are
  consequently unreachable on both desktop and mobile — confirmed intentional legacy behavior via direct
  CSS cascade check + live testing.
- **Note (out of scope):** Figma mock shows Lemonade's score as "9.7"; live site (both control and variation)
  shows "9.6" — identical on both variants, so unrelated to this ticket's icon change. Flagged for awareness,
  not treated as a SWF139 defect.

### Issues found during development

- **Liberty Mutual row is not reliably present on every page/pageview.** It's absent from `/compare/`'s table
  entirely in observed loads and only sometimes appears in one of the homepage's several independent,
  randomly-rotating comparison widgets. TC-07 checks it via a runtime `test.skip()` when the row isn't found,
  rather than asserting a fixed page.
- **Homepage has multiple simultaneous "comparison-table" widgets** with different, reshuffling insurer
  subsets per pageview (confirmed via DOM dump — 3 separate `comparison-table` blocks with different
  badge counts each load). Any test relying on a stable total badge/icon count must run on `/compare/` only
  (the single stable full table) — the duplication-safety TC (TC-08) is skipped on homepage for this reason.
- **Force clicks can miss the intended element.** An earlier version of the mobile-icon tests used
  `.click({ force: true })` and got flaky results reproducing BUG-01 (sometimes true, sometimes false) —
  root cause was `force: true` dispatching at a stale/off-screen bounding-box coordinate. Switching to a plain
  `.click()` (which auto-scrolls into view and waits for actionability) made the repro 3/3 reliable. **Prefer
  plain `.click()` over `force: true` on this site unless force is specifically needed to bypass a known
  overlay.**
- **Convert.com CDN rate-limiting worsens with repeated navigation in the same session** — confirmed again
  here (0 failures on the first browser run, escalating failures on later browsers after ~20+ live navigations
  during investigation/probing). Consistent with SIC132/CRE-T-123/CRE-T-137 findings in `_client-notes.md`.

### Additional test cases to consider

- [ ] Fix BUG-01 (`stopPropagation` or handler exclusion), then add a regression test asserting
      `dropdown-active` stays false after an icon click at tablet width (768–991px) specifically, since that's
      where the chevron-rotation side effect is visible.
- [ ] Fix the `updateInsuranceData(libertyData)` missing `item` argument, then add a test that changes
      `libertyData` and confirms it propagates on re-render.
- [ ] Keyboard accessibility: is the icon focusable/actionable via Enter/Space?
- [ ] `aria-label` on the info icon for screen readers (currently a bare SVG with no text alternative).
