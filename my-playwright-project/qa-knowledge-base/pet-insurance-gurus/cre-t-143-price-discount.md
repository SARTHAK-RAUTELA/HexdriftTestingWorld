# CRE-T-143 (no ticket number in testdetail.md) — Pet Insurance Gurus "Comparison Listing Price Discount"

## 2026-09-11 RETEST — testdetail.md now populated, preview-link-first pass

`testdetail.md` (previously confirmed empty) is now populated with the full requirement text and
real Convert force-preview URLs. Per updated instruction, this pass checks the **preview links
first**, then the local code — see `cre-t-143-price-discount-live-preview.spec.js` (new file, Part
1) and this file (`cre-t-143-price-discount.spec.js`, Part 2, updated). Full requirement text now
on file:

- V1 = 13.5% off (Mid-size, mixed breed), V2 = 32.9% off (Small, mixed breed).
- Applies to all views (default, Dogs, Cats, ZIP, combinations) and to listings 8/9/10 inside "Show
  More".
- No discount when a breed is selected; selecting a breed then reverting to "All Breeds"
  **re-applies** the discount (new confirmation from the client Q&A section).
- No custom trigger/goal, no Google Audience inclusion/exclusion needed.
- SWF111/SWF116 will be paused while this test runs (not independently verifiable by QA).

### ~~BUG-04~~ — FIXED (2026-09-11, same day) — testdetail.md's V1 force-preview URL was wrong (same as control)

testdetail.md originally gave:
```
control: ...&_conv_eforce=100052764.1000257165
v1:      ...&_conv_eforce=100052764.1000257165   <- byte-identical to control
v2:      ...&_conv_eforce=100052764.1000257167
```

**Confirmed live, 6/6 browsers (Chrome/Firefox/Edge/Safari/Mobile Chrome/Mobile Safari), fully
deterministic:** the "v1" URL as literally given showed **zero discount** — identical to control —
in the default view, Dogs tab, Cats tab, and under a ZIP filter. Not a timing issue; the underlying
variation id (`1000257165`) was control's own id.

The **previously-documented V1 id from the 2026-09-10 QA pass, `1000257166`**, was also tested this
session and correctly showed the 13.5% discount in every scenario, 6/6 browsers, zero failures.

**Fix confirmed:** testdetail.md has since been corrected — the v1 line now reads
`...&_conv_eforce=100052764.1000257166`, matching the id this suite verified as correct. V2's URL
(`1000257167`) was already correct. testdetail.md was also expanded with a couple of clarifications
not present in the version this pass originally tested against: audience targeting now explicitly
reads "desktop mobile both" (already covered — this pass ran Mobile Chrome/Mobile Safari), and a
browser list is now specified ("main: chrome safari, edge firefox" — matches the 4 desktop browsers
already used for every pass on this client).

### Live preview-link results (real Convert-served experience, force-preview URLs)

| Arm | Discount rendered? | Math | Tabs/ZIP persistence | Tail cards (8-10) |
|---|---|---|---|---|
| control (`165`) | No (correct) | n/a | n/a | n/a |
| v1-as-given (`165`, same as control) | **No — BUG-04** | n/a | n/a | n/a |
| v1-legacy (`166`) | Yes, 13.5% off | Correct | Correct | Correct |
| v2 (`167`) | Yes, 32.9% off | Correct | Correct | Correct |

No console/page errors on any preview URL. Screenshots for each state/browser saved under
`cre-t-143-retest-screenshots/`.

### Breed-widget real end-to-end round trip — NOT reliably automatable (test-harness limitation, not a confirmed bug)

Attempted a real MUI widget interaction (fill `.zip-textinput input` + dispatch `change`, then click
`#breed-select`) on the real force-preview URLs for both arms. The `#breed-select` combobox stayed
`Mui-disabled` for the full 15s wait in both cases — the site's ZIP input apparently needs a more
realistic input event (e.g. actual keystrokes / an `input` event, not just `fill()` + a synthetic
`change` dispatch) before its async ZIP validation enables the breed dropdown. This is a **test
automation gap**, not a demonstrated site bug — the underlying breed-suppression/reapplication
*logic* itself was independently and successfully validated via the `?breed=` URL-param method,
which is the same signal the code's own `isBreedSelectedInUrl()` reads (see TC-06/TC-14 below, both
pass in 2/2 arms across effectively all browsers). Flagged as an "Additional test case to consider"
below rather than closed out — worth revisiting with a slower/more realistic ZIP-entry simulation
(e.g. `pressSequentially()` + waiting for a real network response) if a true end-to-end widget check
is required.

### Local code (Part 2) re-run — current file mapping: V1 = `vB.js`/`vB.css`, V2 = `v2.js`/`v2.css`

**113 runs (4 browsers): 99 passed / 13 failed / 1 skipped-per-browser (V1-only-arm skip on TC-15).**
Same deterministic failure pattern as the original 2026-09-10 pass:

- **TC-04 (8/8 fail, both arms × 4 browsers):** re-confirms the retracted-BUG-01 local-injection
  artifact — cre-t-116 is live at 100% for organic traffic and its broad CSS rule
  (`span:not(.cre-t-116-price-update) { display:none !important }`) hides ANY freshly-injected span
  in that slot, cre-t-143's discounted span included. **Not a real bug** — the real force-preview
  URLs (Part 1, above) prove cre-t-116 is genuinely excluded once a session is actually bucketed
  into CRE-T-143, and the discount renders visibly there. This is expected/known noise from the
  local-injection methodology on this client (see `_client-notes.md`), not new information.
- **TC-11 (4/4 fail, all 4 browsers) — BUG-02 reconfirmed still live:** `vB.js` and `v2.js` still
  share the same global guard flag names (`window.cre_t_143_fetchPatched`,
  `window.cre_t_143_priceObserverStarted`). Unchanged from the 2026-09-10 finding. Zero live impact
  (Convert only ever serves one arm per visitor); still a low-priority cleanup candidate.
- **TC-06 (1/8 fail, Safari Desktop only, V1 arm only):** `page.waitForSelector` timed out at 45s
  waiting for the listing cards on a fresh `?breed=Beagle` navigation. Isolated, single-browser,
  single-arm — a WebKit slow-load flake (client notes already document WebKit as the slowest engine
  on this site), not a reproducible logic bug; the equivalent TC-14 (breed-revert round trip) passed
  on Safari for both arms in the same run.
- **TC-15 passed in both arms tested, but the pass is NOT reliable evidence v2.css is fine** — see
  BUG-05 below for why.
- **New test cases (TC-12 tail cards, TC-13 ZIP persistence, TC-14 breed-revert reapplication) all
  passed cleanly, both arms, all 4 browsers** — the code correctly implements the newly-confirmed
  requirements (Show More listings 8-10, ZIP-filter persistence, and re-applying the discount after
  reverting to "All Breeds").

### BUG-05 (NEW) — `v2.css` (the file currently mapped to the V2 arm) is stale/unrelated content — local build-file mismatch, NOT a live bug

`v2.css` in `local_testing/Local2/variation/` is leftover content from an unrelated **pay.com.au**
test (`cre-t-13` modal CSS) — it contains no rule to hide the original price
(`.cre-t-143-price-original-hidden`). `vB.css` (V1) has the correct rule. `va3.css`/`va3.js` (still
present on disk, no longer the authoritative V2 files per current instruction) are ALSO
stale/wrong — `va3.css` is actually `cre-t-164` (Rearrange Listings) CSS, not a valid CRE-T-143
substitute either. `va2.js` is just a duplicate of `v2.js`, not a distinct arm.

**Locally injecting the real, current `v2.js` + `v2.css` pairing** (TC-15) did not show the original
price still visible next to the discount in either browser tested — but this is because cre-t-116's
same broad CSS rule (see TC-04 above) coincidentally also hides the untagged original price during
local injection on an organic page load, independent of whatever `v2.css` does or doesn't contain.
**TC-15's pass is not meaningful evidence that `v2.css` is correct.**

Cross-referencing against Part 1 (the real V2 force-preview URL, where cre-t-116 is genuinely
excluded): the discount rendered correctly there, with the original price properly hidden — which
means whatever CSS Convert is actually serving live for V2 is NOT what's in this repo's `v2.css`
file. **This is a stale/mismatched local build file, not a live production bug** — but it should be
corrected in the repo (with the real deployed V2 CSS, likely resembling `vB.css`'s single hide rule
scoped to this test) so a future redeploy from this repo doesn't accidentally ship the wrong CSS.

## Original pass (2026-09-10)

**Test file:** `my-playwright-project/testing/cre-t-143-price-discount.spec.js`
**Screenshots:** `cre-t-143-screenshots/`
**Site:** `https://petinsurancegurus.com`
**Test date:** September 10, 2026
**Browsers:** Chrome, Firefox, Edge, Safari (Desktop) — all 4 requested; Mobile/Tablet projects exist in `playwright.config.js` but were not run for this pass
**Variation:** no ticket id given — code's own `variation_name` is `cre-t-143`. V1 = `vB.js`/`vB.css` (13.5% off), V2 = `va3.js`/`va3.css` (32.9% off), same file-naming convention as CRE-T-164/SWF157 for this client
**Experiment:** `100052764` — V1 = variation `1000257166`, V2 = variation `1000257167` (force URLs supplied by the team after the first pass, see Correction below)

## Correction (2026-09-10, same day) — BUG-01 retracted, was a test-methodology false positive

The first pass of this suite (below) found the discount completely invisible in both arms and
reported it as BUG-01. The team flagged that CRE-T-116 should already be excluded from CRE-T-143's
traffic, which prompted a recheck against the real Convert force-preview URLs
(`...&_conv_eforce=100052764.1000257166` for V1, `...1000257167` for V2) instead of local injection
onto an organic page load.

**Result: BUG-01 does not reproduce. It was an artifact of the test setup, not a real bug.**

- On the **force-preview URL**, in 3/3 fresh-context runs per arm: CRE-T-116 is genuinely excluded
  (confirmed via the `_conv_v` bucketing cookie, not just visually) and Convert's own wired-up code
  runs `cre-t-143` — not this suite's local injection. The discounted span renders **visible**
  (`display: inline-block`), with the correct value in both arms: V1 **$20.28/mo** (13.5% off
  $23.44/mo), V2 **$15.73/mo** (32.9% off $23.44/mo).
- On **organic (non-force) traffic**, in 3/3 fresh-context runs: CRE-T-116 is always present (it's
  still ~100% live traffic) and CRE-T-143 **never runs at all** — Convert has not bucketed any
  organic visit into it; it's currently 0% live traffic, preview-only.

The original test suite locally injected `vB.js`/`vB.css` onto organic page loads that Convert was
never going to bucket into CRE-T-143. Convert's mutual exclusion against CRE-T-116 only fires for a
session actually bucketed into CRE-T-143 (real traffic or a force URL) — local injection onto an
organic load bypasses that bucketing step entirely, so the CRE-T-116 conflict this suite hit was
never something a real CRE-T-143 visitor would see. **Lesson for future tests on this client:**
local injection is a reasonable fallback when no force URL exists, but the moment a force URL is
available, prefer it — especially for anything that depends on platform-level behavior like mutual
exclusion between experiments, which local injection cannot reproduce.

The raw results in the "Result" section below are left as originally recorded (including the 12
local-injection failures) for the record, but **TC-04 and TC-05's failures/results no longer
represent real user-facing behavior** — see the correction above and the retracted BUG-01 writeup.
BUG-02 is unaffected by this correction and still stands.

## Open question — BUG-03 CANDIDATE: does V2 correctly target "Small, mixed breed"?

The team later supplied the actual requirement text for V2: **"Variation 2: Reduce prices by 32.9%
(Small, mixed breed)."** This is the first requirement text seen for either arm (still no ticket/
Figma for V1). Tested live against the real V2 force-preview URL, varying only the `breed` URL
param:

| Breed selection | Discount applied? | Price shown |
|---|---|---|
| None (default) | Yes | $15.73/mo (32.9% off) |
| `Mixed Breed (0 to 20 lbs)` — small mixed dog | **No** | $23.44/mo (original) |
| `Mixed breed` — cat | **No** | $23.44/mo (original) |
| `Great Dane` — large, not mixed (control) | **No** | $23.44/mo (original) |

The discount applies with **no breed selected** and disappears the instant **any** breed is chosen —
small/mixed breed included, with no distinction from a Great Dane. Reading `va3.js` confirms why:
`isBreedSelectedInUrl()` only checks whether the `breed` param is present and non-empty; nothing in
the file inspects *which* breed was selected. Mechanically the code cannot single out "small, mixed
breed" — it's a blanket on/off switch keyed on "any breed chosen at all."

**Two possible readings, pending confirmation from whoever wrote the requirement:**
1. The discount should apply *specifically* when a small/mixed breed is selected — current logic is
   inverted relative to this reading (fires on the opposite condition) and needs real breed-value
   matching added.
2. "Small, mixed breed" describes what the *default/unfiltered* national-average price already
   represents (the baseline shown before any breed is picked) — in which case discounting the
   default view already **is** discounting "small, mixed breed" pricing, and current behavior would
   be correct as designed.

Not marked as a confirmed bug pending that answer — status: **needs requirement clarification**.

## Methodology note — no ticket/Figma, code treated as the spec

`testdetail.md` was empty (confirmed empty file, not missing). With no ticket or Figma to test
against, this suite follows the code itself as the source of truth (per the workflow in
`_shared/qa-workflow.md`, step 2 becomes step 1 when step 1's input doesn't exist) and instead
focuses on: does the code do what it says, is it internally consistent, and does it survive
contact with the real live site and the other tests already running on it. No force-preview URL
was documented for either arm, so this suite uses **local injection** of the real `vB.js`/`vB.css`
and `va3.js`/`va3.css` files against the real live site, the established pattern for this client
(`swf151-new-build.spec.js`, `swf164-rearrange-listings.spec.js`).

## What the code does

Patches `window.fetch` to intercept `insurance-finder/v1/quotes` and `insurance-finder/v1/options`
responses, builds a per-provider map of `standardPlanCost * (1 - discountPercent)`, and for every
`.ct-span` price under `[data-unique="comparison-table"] .plan-detail-content`, inserts a
`.cre-t-143-discounted-price` span right after it with the discounted amount, hiding the original
via `.cre-t-143-price-original-hidden { display: none }`. If no provider-specific quote is
available yet it falls back to a flat `discountPercent` off whatever price is currently displayed.
If `?breed=` is present in the URL (or the API response reports a breed was submitted), the
discount is suppressed entirely and the original price is shown. A debounced `MutationObserver`
re-applies the sync on every DOM change so React re-renders (breed/ZIP) don't lose the discount.

## Result

**84 runs (21 TCs × 4 browsers): 72 passed / 12 failed.** Failure pattern is 100% deterministic —
the exact same 3 of 21 TCs fail in **every single browser**, both arms, with no flakiness. Same
signature as SWF164's last pass on this client: genuine functional/environment bugs, not noise.

## Bugs found

### ~~BUG-01~~ — RETRACTED (was a local-injection test artifact, not a real bug — see Correction above)

Original writeup, kept for the record: local injection of `vB.js`/`vB.css` onto an organic page
load found the discounted span hidden by CRE-T-116's live `!important` CSS rule
(`.cre-t-116-toolTipContentChange .tooltip-container + .plan-detail-content > span:not(.cre-t-116-price-update) { display: none !important; }`),
which matches any injected `<span>` in that slot, CRE-T-143's included. This was reported as a
high-impact bug.

**Retracted.** Rechecked against the real Convert force-preview URLs for both arms (V1
`...1000257166`, V2 `...1000257167`): CRE-T-116 is genuinely excluded from CRE-T-143's traffic (per
the `_conv_v` bucketing cookie) and the discount renders correctly and visibly — V1 $20.28/mo, V2
$15.73/mo. The conflict only ever appeared because local injection was applied to organic page loads
that Convert was never actually going to bucket into CRE-T-143 (0% live traffic at test time), which
bypasses the mutual-exclusion step that only fires for a real/force-bucketed CRE-T-143 session. Not
a code defect.

- **Screenshot on file (historical, do not use as current evidence):**
  `cre-t-143-screenshots/bug01-price-column-v1-chrome.png` — captured under the disproven
  local-injection-on-organic-traffic scenario.

### BUG-02 — Injecting both arms in one page context: V2 never overrides V1's discount (shared global guard names)

`vB.js` and `va3.js` both guard their one-time setup behind the **same** global flag names —
`window.cre_t_143_fetchPatched` and `window.cre_t_143_priceObserverStarted`. In production only one
arm is ever served per visitor, so this has no live user-facing impact, but it means the two files
are not safe to combine in one page/session: once V1 has run, V2's own `init()` sees the flags
already set and does nothing — its fetch patch and DOM observer never install. Confirmed live
(TC-11, all 4 browsers): injecting V1 then V2 into the same page leaves every price at V1's 13.5%
off; V2's 32.9% never takes effect.

- **Impact:** none on real visitors today (Convert serves one arm per session). Worth flagging
  because it's the same shared-guard-name pattern this client's tests have hit before, and it means
  a future QA/preview tool, or any Convert misconfiguration that serves both scripts to one
  session, would silently show the wrong (or a stale) discount with no error.
- **Fix:** scope the guard flags to the variation, e.g. `window['cre_t_143_' + variation_name + '...']` or read a variation identifier instead of a hardcoded shared name — low priority unless a legitimate multi-arm-on-one-page scenario exists.

## What was verified and is correct

- **The discount renders correctly and visibly on the real force-preview URL, both arms** — V1
  $20.28/mo (13.5% off $23.44/mo), V2 $15.73/mo (32.9% off $23.44/mo), confirmed in 3/3 fresh-context
  runs per arm with CRE-T-116 genuinely excluded per the `_conv_v` bucketing cookie. This is the
  authoritative, production-representative result — see Correction above.
- **Discount math is correct in both arms** — `.cre-t-143-discounted-price` text exactly matches
  `standardPlanCost * (1 - discountPercent)` (13.5% for V1, 32.9% for V2) formatted to 2 decimals,
  checked against the site's own live `insurance-finder/v1/options` response for every priced
  provider card, not just the code's own computation (TC-02).
- **Original price correctly gets `cre-t-143-price-original-hidden`** on every card (TC-03) — this
  half of the mechanism works exactly as written; it's simply redundant today since CRE-T-116 was
  already hiding that same element.
- **Breed exclusion works** — navigating with `?breed=Beagle` in the URL suppresses the discount
  entirely (no `.cre-t-143-discounted-price` span, original left unhidden) in both arms, all 4
  browsers (TC-06).
- **Idempotent** — re-running the variation script against an already-synced page does not create a
  second discounted span per card (TC-07); no stray duplicate `id`s introduced by injection (TC-08).
- **No console/page errors** from the injected code in any browser (TC-09).
- **MutationObserver reactivity holds** — switching the pet-type tab (a DOM-mutating, not
  full-navigation, change) leaves exactly one discounted span per card afterward, no duplicates
  (TC-10).
- **Provider-name matching between the API and the DOM works** — `quote.providerName` (e.g.
  `"Lemonade"`) matches the `.provider-logo` alt text stripped of " Logo" exactly, for every
  provider checked live; this pairing was the one part of the code most likely to silently
  mismatch and it doesn't.

## Additional test cases to consider

- [x] Re-verify once a Convert force-preview URL exists for either arm, to confirm local-injection
      results match the real Convert-served experience — done, see Correction above (BUG-01
      retracted as a result).
- [x] ZIP filter interaction specifically — done 2026-09-11, passes in both local code (TC-13) and
      live preview (TC-P05), both arms.
- [~] Selecting a breed via the actual MUI breed-picker widget — attempted live 2026-09-11 against
      the real force-preview URLs; the widget itself could not be reliably automated (ZIP input
      never enabled `#breed-select` within the test's wait window — see BUG-04/test-harness-gap
      note in the 2026-09-11 section above). The `?breed=` URL-param method (this suite's original
      approach) remains the only exercised path for this requirement; a slower/more realistic
      ZIP-entry simulation is still owed if a true end-to-end widget check is needed.
- [ ] **Still open, still unanswered as of testdetail.md's 2026-09-11 update:** the BUG-03 CANDIDATE
      question above (does V2 need to target "small, mixed breed" specifically, or does the default
      view already represent it) — testdetail.md's new Q&A section answers several other open
      questions (breed-revert reapplication: yes; Google Audiences: not needed) but does NOT address
      this one. Still needs a direct answer before closing out BUG-03 either way. Same question
      still applies to V1's requirement text ("Mid-size, mixed breed"), also still unanswered.
- [x] **BUG-04 (fixed same day, 2026-09-11):** testdetail.md's V1 force-preview URL was wrong
      (identical to control's URL, variation id `1000257165`); the correct working V1 id is
      `1000257166`. testdetail.md has been corrected to `1000257166` — verified by re-reading the
      file after the fix.
- [ ] **NEW as of 2026-09-11 — BUG-05:** `v2.css` (current V2 arm's CSS file in this repo) is
      stale/unrelated content and does not match what Convert actually serves live for V2 — repo
      file should be corrected to the real deployed CSS so a future redeploy from this repo doesn't
      ship the wrong file.
- [ ] Run the full TC-01 through TC-10 suite against the real force-preview URLs (this correction
      pass only re-checked the specific price-visibility/math result, not the breed-exclusion,
      idempotency, duplicate-id, console-error, and DOM-mutation checks under real Convert
      bucketing) — those still only have local-injection-on-organic-traffic coverage today.
