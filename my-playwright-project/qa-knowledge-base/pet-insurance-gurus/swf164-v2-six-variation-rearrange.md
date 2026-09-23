# SWF164-v2 (exp 100052846) — Pet Insurance Gurus "Rearrange Listings", 6-variation rebuild

**Supersedes:** [swf164-rearrange-listings.md](swf164-rearrange-listings.md) (exp `100052787`, 2 arms — now launched/closed)
**Site:** `https://petinsurancegurus.com`
**Test date:** 2026-09-22
**Browsers:** Chrome Desktop (1280x900) + Mobile Chrome (Pixel 5), fresh Playwright context per run
**Experiment:** `100052846` — Original `1000257396`, V1 `…397`, V2 `…398`, V3 `…399`, V4 `…400`, V5 `…401`, V6 `…421`
**Force URL (behaves as live):** `?utm_campaign=Cromode164&_conv_eforce=100052846.<variationId>`
**Preview URL:** `?convert_action=convert_vpreview&convert_e=100052846&convert_v=<variationId>`
**HTML report:** [swf164-v2-six-variation-qa-report.html](swf164-v2-six-variation-qa-report.html) (also copied to `local_testing/Local2/`)
**Screenshots:** `swf164-v2-screenshots/` — `*-tail.png` = end of list (the Show More slot), `*-list.png` = full comparison list
**Local code:** `local_testing/Local2/variation/` — V1 `vB`, V2 `v2`, V3 `va3`, V4 `v4`, V5 `v5`, V6 `v6` (.js/.css)

## The brief (client, 2026-09-22)

6 variations, each testing a different partner in the **#1 spot**. Apply the test ranking for the
**All Pets**, **Cats** and **Dogs** filters; revert to the **hardcoded** ranking when **Breeds** or
**Enter Zip** is selected. Client confirmed they accept a partner's *rating* changing when a breed is
picked (ratings revert along with order — this is a deliberate change from the previous SWF164, where
ratings persisted under every filter). The "Show More" button must sit **after Trupanion in all
variations**; its position is NOT to change per variation.

Trupanion is at position 6 in all six variations, so the collapsed state must show **6 cards**.

## RETEST 2026-09-23 — BUG-01 FIXED, all six variations now PASS

**Report:** [swf164-v2-retest-qa-report.html](swf164-v2-retest-qa-report.html) ·
**Screenshots:** `swf164-v2-retest-screenshots/` · **Console dump:** `swf164-v2-retest-console.json`

Client shipped the fix and supplied the same force URLs. Re-run entirely against the **deployed
Convert code** — the local `local_testing/Local2/variation/` files were NOT updated and were
deliberately not used.

**120/120 assertions passed** — 6 variations × 10 checks × (Chrome Desktop 1280×900 + Mobile Chrome
Pixel 5), fresh context per run, zero flakiness.

| | Order | Ratings | Filters | Show More after Trupanion | 2026-09-22 | 2026-09-23 |
|---|---|---|---|---|---|---|
| V1 | PASS | PASS | PASS | PASS | PASS | **PASS** |
| V2 | PASS | PASS | PASS | PASS | PASS | **PASS** |
| V3 | PASS | PASS | PASS | PASS | PASS | **PASS** |
| V4 | PASS | PASS | PASS | PASS — 6 visible, toggle works | BUG-01 | **PASS** |
| V5 | PASS | PASS | PASS | PASS — 6 visible, toggle works | BUG-01 | **PASS** |
| V6 | PASS | PASS | PASS | PASS — 6 visible, toggle works | BUG-01 | **PASS** |

**BUG-01 closed.** V4/V5/V6 now load with exactly 6 cards ending on Trupanion, and
`.cre-t-164-toggle` computes to `display: flex` and is clickable. The two rules that `v4/v5/v6.css`
had omitted are present in the deployed stylesheets. No regression in V1/V2/V3.

Also re-verified in this pass:
- **The collapse-fight bug stays fixed** — deliberately re-probed, since that failure mode once
  survived a full rewrite on this client. Clicking "Show More" 0.9s after the list renders still
  shows 10 cards 5s later; `cre-t-164-collapsed` is not re-added by any timer, and returning to
  All Pets does not re-collapse. 12/12.
- **Filter gating** — Cats / Dogs / back-to-All-Pets keep test order + 6-card collapse (36/36);
  `?breed=` and `?zipCode=` both drop `cre-t-164-default` and restore
  Lemonade > ASPCA > Fetch > Embrace > Pumpkin > Figo > Trupanion with the native toggle back (24/24).
- **Best Overall** syncs to the new #1 in all six (V4 verified visually: Pumpkin 9.6, Pumpkin's own
  copy, not Lemonade's app-store blurb). `cre-t-135`'s competing widget stays hidden.
- **Control** unchanged — hardcoded order, native toggle, no `cre-t-164` body classes.
- **Console** — 0 `cre-t-164`-related errors on any variant/viewport. Desktop shows 4 baseline
  third-party 403s, mobile 0; identical counts on the control.
- **Cross-browser (closes a prior open item):** V1/V4/V6 also pass on **Firefox** and **WebKit**
  at 1280×900 — the `:has()` concern is a non-issue. One WebKit/V4 run timed out before the site's
  own comparison table rendered at all; it passed fully on retry against the identical URL. Load
  flake, not a variation defect. Edge not run separately (shares Chromium with the desktop pass).

**Still open:** V1's non-monotonic ladder (see Notes) is unchanged and still needs a client yes/no.
**Housekeeping:** the local variation files are now stale — they still hold the pre-fix code, and
`v2.css` is still PAY13's modal CSS. Pull the deployed code down or delete them; local injection
from them will reproduce a BUG-01 that no longer exists live.

## Result (original run, 2026-09-22 — superseded by the retest above)

| | Order | Ratings | Filters (All/Cats/Dogs keep, Breed/ZIP revert) | Show More after Trupanion | Verdict |
|---|---|---|---|---|---|
| V1 | PASS | PASS | PASS | PASS (6 visible, toggle works both ways) | **PASS** |
| V2 | PASS | PASS | PASS | PASS | **PASS** |
| V3 | PASS | PASS | PASS | PASS | **PASS** |
| V4 | PASS | PASS | PASS | **FAIL** — 10 visible, no toggle | **BUG-01** |
| V5 | PASS | PASS | PASS | **FAIL** — 10 visible, no toggle | **BUG-01** |
| V6 | PASS | PASS | PASS | **FAIL** — 10 visible, no toggle | **BUG-01** |

Identical results on Chrome Desktop and Mobile Chrome — 100% deterministic, no flakiness.
No cre-t-164-related console errors in any variation (4 unrelated baseline errors on every variant,
control included). Control (`1000257396`) renders the hardcoded order exactly as the sheet's
"Currently Hardcoded" column.

## BUG-01 ✅ FIXED (verified live 2026-09-23) — V4/V5/V6 never collapse and have no usable "Show More"

> **Status: CLOSED.** Retested 2026-09-23 on the same force URLs — V4/V5/V6 now collapse to 6 cards
> ending on Trupanion with a visible, working toggle, on Chrome desktop + mobile, Firefox and WebKit.
> The diagnosis below is retained as the historical record of the cause.


**Symptom:** on load, V4/V5/V6 show **all 10 cards** instead of 6. The `.cre-t-164-toggle` element is
injected into the DOM with the right text ("Show More") but computes to `display: none`, so the user
cannot click it. The native toggle is also hidden. Net effect: the entire Show More/Show Less feature
is absent, and the client's explicit "Show More after Trupanion in all variations" requirement fails.
V1/V2/V3 are correct: 6 cards, Trupanion last, toggle expands to 10 / collapses back to 6.

**Root cause — the CSS files split into two groups.** All six **JS** files are functionally identical
(diff shows only whitespace/comments outside the `partnerRatingData` array), and all six correctly add
`.cre-t-164-below-trupanion` to ranks 7–10 and toggle `body.cre-t-164-collapsed`. But the JS relies on
CSS to do the actual hiding, and the CSS differs:

- `vB.css` (V1) and `va3.css` (V3) — byte-identical to each other — **contain** the rule:
  ```css
  body.cre-t-164-default.cre-t-164-collapsed .cre-t-164-below-trupanion { display: none !important; }
  ```
  plus the positive toggle rule
  `body.cre-t-164-default …>.cre-t-164-toggle { display: flex !important; visibility: visible; }`
- `v4.css` / `v5.css` / `v6.css` — byte-identical to each other — **omit both**. They replace the
  positive toggle rule with a negative one (`body:not(.cre-t-164-default) …>.cre-t-164-toggle
  { display: none; }`), which never turns the toggle on, and their header comment asserts
  *"Show More is entirely native's own DOM mount/unmount — we never manage visibility of the 10 slots
  ourselves. No defensive 'force visible' rule needed."* That assumption is wrong: the JS hides the
  native toggle and injects its own, so with no positive rule nothing is ever shown or hidden.

The same header comment also claims the CSS is *"identical across V1–V6"*, which is false — that stale
comment is likely why the divergence went unnoticed.

**Fix:** port the two missing rules from `vB.css` into `v4.css`, `v5.css` and `v6.css` (or better,
make all six load one genuinely shared stylesheet, since the JS array is now the only per-variation
difference). Then re-verify that the collapsed state shows exactly 6 cards ending at Trupanion.

**Screenshots:** `swf164-v2-screenshots/v4-desktop-tail.png`, `v5-desktop-tail.png`, `v6-desktop-tail.png` (broken —
list runs to rank 10 with no Show More); `v1-desktop-tail.png`, `v2-desktop-tail.png`,
`v3-desktop-tail.png` + `-mobile-tail` equivalents (correct — Show More directly after Trupanion).

## BUG-02 (housekeeping, not user-facing) — local `v2.css` is the wrong file entirely

`local_testing/Local2/variation/v2.css` is dated 2026-09-07 (all other five are 2026-09-22) and
contains **PAY13's modal CSS** (`body.cre-t-13-control .cre-t-13-modal-main`, `.cre-t-13-overlay`…) —
no `cre-t-164` rules at all. `v2.js` WAS updated. The deployed Convert CSS for V2 is correct (V2 is a
full PASS live), so this is a local-scratch-file problem only, but anyone testing V2 by local injection
will get a false failure. **Third recurrence of the shared-scratch-file trap on this client**
(see SWF155 and PAY19) — always `grep` these files before trusting them.

## What was verified and is correct (all six)

- **Order matches the Google Sheet exactly** in all six variations, live, on both viewports:
  V1 Lemonade / V2 Fetch / V3 Embrace / V4 Pumpkin / V5 Figo / V6 Liberty Mutual at #1.
- **Ratings match the sheet exactly**, including V1's non-monotonic ladder (pos-2 Fetch 8.4 sits
  *below* pos-3 Embrace 8.5 — that is what the sheet specifies; flagged to client as a possible
  oversight, not treated as a build defect) and the position-locked ladder in V2–V6
  (9.6 / 8.5 / 8.1 / 7.4 / 6.7 / 6.5 / 5.9 / 4.8 / 4.5 / 4.3).
- **Rank numbers renumber 1–10** correctly in every variation.
- **Filter gating is exactly per the new brief** — `shouldRevert()` is
  `return !!(params.breed || params.zipCode);`, so petType is deliberately excluded. Verified live:
  Cats, Dogs and return-to-All-Pets all keep the test order, ratings and 6-card collapse; ZIP and
  breed both drop `cre-t-164-default`, restore the hardcoded order
  (Lemonade > ASPCA > Fetch > Embrace > Pumpkin > Figo > Trupanion) and hand the toggle back to native.
- **The previous SWF164 BUG-01 (collapse-fighting interval) is genuinely fixed.** `runCycle()` no
  longer re-adds the collapsed class on every tick; the class is set once in `init()` and on a real
  filter-context change. Clicking Show More/Show Less now sticks immediately — the old "undone within
  3 seconds" failure does not reproduce.
- **Best Overall duplicate card syncs to the new #1** in every variation (`syncBestOverall()` rewrites
  its `data-unique` and both columns), and its Lemonade-only app-store blurb is hidden when the #1 is
  someone else.
- **cre-t-135's competing rating widget is hidden** (`display: none`) under `cre-t-164-default` in all
  six, so no double rating is shown even though cre-t-135 is co-bucketed on the force URLs.

## Notes / open items

- [ ] **V1's rating ladder is not monotonically descending** (Fetch 8.4 at rank 2, Embrace 8.5 at
      rank 3). Matches the sheet, so built correctly, but worth confirming with the client that it is
      intended — a higher-scored partner ranked below a lower-scored one is visible to users.
- [ ] Breed tested via the `?breed=` URL param (client-notes: the real MUI `#breed-select` combobox
      stays `Mui-disabled` under synthetic input). Worth one manual pass on the real widget.
- [x] ~~Only Chrome desktop + Mobile Chrome were requested/run. Firefox/Safari/Edge/tablet not
      covered.~~ **Closed 2026-09-23** — V1/V4/V6 re-run on Firefox and WebKit at 1280×900, all pass
      (6 cards → toggle → 10). The `:has()` concern is a non-issue. Tablet still not covered; Edge
      not run separately (shares Chromium with the desktop pass).
- [ ] Duplicate-init guard not tested (re-running the variation JS shouldn't double-inject the toggle).
