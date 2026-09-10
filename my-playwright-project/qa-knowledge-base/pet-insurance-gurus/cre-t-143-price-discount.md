# CRE-T-143 (no ticket number in testdetail.md) — Pet Insurance Gurus "Comparison Listing Price Discount"

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
- [ ] Selecting a breed via the actual MUI breed-picker widget (this suite only tested the
      `?breed=` URL param directly, which is the code's own primary signal for the fallback path —
      the widget interaction should still be spot-checked, especially the `insurance-finder/v1/quotes`
      response path (`data.breed`), which this suite did not independently trigger).
- [ ] Get confirmation on the BUG-03 CANDIDATE open question above (does V2 need to target "small,
      mixed breed" specifically, or does the default view already represent it) — then either fix
      the breed-matching logic or close this out as correct-as-designed. Same question should be
      asked about V1's requirement text, which still hasn't been supplied.
- [ ] ZIP filter interaction specifically (client notes flag ZIP as one of the in-place-re-render
      triggers this client's tests are commonly hit by).
- [ ] Run the full TC-01 through TC-10 suite against the real force-preview URLs (this correction
      pass only re-checked the specific price-visibility/math result, not the breed-exclusion,
      idempotency, duplicate-id, console-error, and DOM-mutation checks under real Convert
      bucketing) — those still only have local-injection-on-organic-traffic coverage today.
