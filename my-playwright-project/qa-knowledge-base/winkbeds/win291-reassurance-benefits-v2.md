# WIN291 (cre-t-291) — Shop Page Reassurance Benefits V2 (Desktop)

**Site:** winkbeds.com/pages/shop-winkbed · **Audience:** desktop · **Convert exp:** 100350916 (location 10033214)
**Follow-up to:** [WIN269](win269-reassurance-benefits.md) (exp 100350736, still active 50/50)
**Preview:** `?utm_campaign=Cro291mode&_conv_eforce=100350916.1003185379` (control) / `…1003185380` (variation)
**Code:** `local_testing/Local2/variation/vB.js` + `vB.css` = variation (`cre-t-291-d`). The local code matches the deployed code byte-for-byte (CRLF aside).
**Spec source:** Trello card + Loom (6 Nov 2026, no Figma). "Control is the winner from WIN269. Variation is the same, but remove all links + the underline."
**Goals:** any-benefit 100334789. Per-benefit: trial 790, shipping 791, showrooms 792, warranty 793, usa 804, rating 805. All 7 are attached to the exp.
**Spec:** `testing/win291-reassurance-benefits-v2.spec.js` · recon `testing/win291-recon/` (recon.js, expdump.js, aud.js, dumpcode.js)
**Results:** `win291-results/results.jsonl` · shots `win291-screenshots/`

## QA-mode audience setup (important)
- WIN291 audience 10036068 = campaign contains `Cro291mode` AND desktop. WIN269 audience 10036080 = campaign does NOT contain `Cro291mode` AND desktop.
  So in QA the two are mutually exclusive. Once WIN291 launches without that condition, WIN269 must be paused, or both run on the same page.
- WIN269 winner reference for "the same" checks: `?_conv_eforce=100350736.1003184951` (no Cro291mode).

## Run 2026-11-11 — Chrome 19/21, Edge 19/21, Firefox 13/21 (+6 harness), Safari 18/21 (+1 harness)
Report: `win291-reassurance-benefits-v2-qa-report.html` (builder `testing/win291-recon/build-report.js`).
- Harness: the V4 "no scroll" check fails on Firefox/Safari because the page reflows by itself (a no-click baseline reproduced the 497px jump, `win291-recon/drift.js`). A DOM click never scrolls. Count these as PASS*.
- BUG-01 Critical: **the control arm 1003185379 has no code (`changes: []`).** It renders the native 4-icon bar (365-night risk-free trial / Lifetime
  warranty / Free shipping and returns / Financing available), not the WIN269 winner (6 underlined scroll links). The test would therefore compare
  native vs. no-link instead of links vs. no-link.
- BUG-02 Critical: **no WIN291 goals in the control.** The 7 goal IDs exist only in the variation JS, so the per-benefit and any-benefit goals can only
  convert in one arm. Fix: the control should carry the WIN269 variation code (cre-t-269-d) with its goal IDs swapped for 100334789–805.
- PASS (variation): native bar hidden; 6 items in WIN269 order and copy; no `<a>`/href/role/tabindex; underline none; cursor default (hover too);
  every click fires 789 plus its own goal exactly once; no goals on load; no scroll; no URL/hash change. The icon click counts, the card padding doesn't.
  Icons load; hidden at 1000px; single injection; no errors.
- PASS: the layout is identical to the live WIN269 winner at 1001/1100/1280/1366/1440/1920 (card size, rows, item x/y ±3px, font). The live code diff vs.
  cre-t-269-d is only `a href`→`div`, the scroll code removed, `cursor:pointer`→`default` and underline→none.
- Inherited from WIN269 (same as winner, not a WIN291 regression): 2 per row (3 rows) from 1001 to 1199px; 3 per row from 1200px.
- Q: once launched, is WIN269 paused or the winner deployed? (Slack: "for the control test 269 is still running 50-50".)
- Q: the Loom audio wasn't transcribed (no STT). Re-check if it has verbal-only specs.
