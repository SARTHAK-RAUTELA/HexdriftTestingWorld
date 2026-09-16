# PAY19 (cre-t-19) — "Getting Started" Modal V2, Sitewide, Mobile Only

**Site:** `https://pay.com.au/`
**Scope:** Sitewide, mobile-only (Optimizely **audience** targeting — confirmed by the client mid-session; unlike PAY13, there is no `isMobile` JS gate in this test's code)
**Control:** existing winning-variation-of-PAY08 modal, fires at 20s (code not supplied this round — already live)
**Variation 1 files:** `local_testing/Local2/variation/vB.js` + `vB.css` — new Figma design, meant to fit without scrolling on mobile, fires at **40s**
**Variation 2 files:** `local_testing/Local2/variation/v2.js` + `v2.css` — same design as V1, new copy (icons shared with PAY13)
**Figma reference:** `Group 1000004623.png` (3-panel Control/V1/V2 mobile mockup)
**Test spec:** `testing/pay19-getting-started-modal.spec.js` (fixture: `local_testing/Local2/pay19-fixture.html`)
**Variation/body class (both V1 and V2 — see BUG-02):** `cre-t-19-variation` · **Cookie:** `cre-t-19=modal-shown`
**Result (2026-09-14):** 41/58 passed across Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12) — **3 confirmed bugs**, one Safari-only visual clipping bug.

## Method

Tested against a local static fixture (not the live site) using Playwright's Clock API, per the
existing PAY08/PAY13 precedent — live-site timer testing against pay.com.au is flaky due to 15+
third-party scripts competing for the main thread (see
[cre-t-08-vB-exit-intent-mobile-timer.md](cre-t-08-vB-exit-intent-mobile-timer.md)). Chrome
browser automation (for verifying the live preview URLs directly) was unavailable this session —
**the live preview URLs (control/V1/V2) still need a manual/browser pass** before sign-off,
especially to confirm Control's real 20s behavior and final on-device visual polish.

Only the two mobile projects were run (`Mobile Chrome (Pixel 5)`, `Mobile Safari (iPhone 12)`) —
this is a mobile-only test:
```
npx playwright test pay19-getting-started-modal --project="Mobile Chrome (Pixel 5)" --project="Mobile Safari (iPhone 12)" --reporter=list,html
```

## Bugs found

### 🐛 BUG-01 (HIGH) — Both V1 and V2 fire at 20 seconds, not the spec'd 40 seconds

`vB.js` and `v2.js` both still have:
```js
var VARIATION_DELAY_SECONDS = 20; // Extra 20 seconds
```
The ticket explicitly calls out "Fire the modal at 40 seconds, not 20 seconds" for both variations
(Control is the one that keeps the 20s PAY08 timing). Confirmed via Playwright Clock: the modal is
already visible at the 20s mark on both files, and the cumulative-across-reload timer target is
also computed from 20s. **Fix:** change `VARIATION_DELAY_SECONDS` to `40` in both `vB.js` and
`v2.js` (and update the stale `// Extra 20 seconds` comment).

### 🐛 BUG-02 (CRITICAL) — `v2.css` is the wrong file entirely: scoped to `.cre-t-13-control`, not `.cre-t-19-variation`

Every selector in `v2.css` targets `html body.cre-t-13-control .cre-t-13-*` — this is leftover
CSS from the **PAY13** ticket's control arm. `v2.js` builds its modal HTML with `cre-t-19-*`
classes and adds `cre-t-19-variation` to `<body>`, so **none of `v2.css`'s rules ever match**.
Confirmed live in the fixture (screenshot below): the V2 modal has no overlay, no fixed/centered
positioning, no card layout, no `.cre-t-19-highlight` color on "your", and — because the base
`.cre-t-19-modal-main{display:none}` rule is also missing — the leftover subtitle paragraph
(itself stale PAY08/control copy, not V2's own copy) renders visibly instead of being hidden.
This is the exact same class of defect as PAY13's Round-1 BUG-01 ("control had no CSS at all") —
see `_client-notes.md`'s standing note that `v2.css`/`v2.js` are shared scratch files reused
across tickets. **Fix:** rebuild `v2.css` from `vB.css` 1:1, selector-for-selector, with no class
renaming needed this time (V2 already reuses the `cre-t-19-*` class names).

**Evidence (Mobile Chrome, Pixel 5):**
Plain unstyled text dump at the top of the page — no card, no overlay, browser-default button,
and the stale subtitle paragraph visible (should be hidden per Figma):
> See your fees, points and rewards / You don't need to move all your payments to pay.com.au to
> get started... / [laptop icon] Create a Free Account ... / Create your free account [default
> button] / Get Started

### 🐛 BUG-03 (MEDIUM, Mobile Safari / iPhone 12 only) — V1's CTA button is clipped off-screen, contradicting the "no scrolling" requirement

The ticket requires "the whole modal content to display on most mobile devices without
scrolling" for V1. On the **iPhone 12 viewport (390×844)**, the modal content's natural height
(763px) exceeds the scaled container's visible height (754px) by ~9px — and because
`.cre-t-19-modal-container` has `overflow: hidden` (not `overflow-y: auto`), that excess is
**silently clipped**, not scrollable. In practice this cuts off the bottom of the "Start With a
Single Payment" card and hides the **"Create your free account" CTA button entirely** (confirmed
by screenshot — the CTA is not visible at all). Passed on Mobile Chrome (Pixel 5, 393×851) where
there's just enough extra vertical room. **Fix:** either tighten vertical spacing/line-height a
few px further at the `max-width:767px` breakpoint, or reduce the `scale(0.8)` slightly (e.g.
`0.75`) so the CTA clears the fold on shorter mobile viewports like the iPhone 12.

### Minor / cosmetic (not worth a fix on its own)
- Both `vB.js` and `v2.js` have a malformed subtitle attribute: `<div class="cre-t-19-sub-title"">` (stray trailing `"`). Harmless in every tested browser (parses as an extra, ignored boolean attribute), but worth cleaning up.
- V1 and V2 share identical body/element class names (`cre-t-19-variation`, `.cre-t-19-modal-main`, etc.) and identical Optimizely event names (`pay19_-_modal_fires`, `pay19_-_clicks_on__create_your_free_account__button`). Not a bug for production (only one variant's script loads per visitor), but means the two files can't be injected on the same page simultaneously for local testing/debugging.

## Confirmed working (both V1 and V2, both mobile projects unless noted)

- Modal hidden on load; only appears once the cumulative timer elapses
- Cumulative on-site timer persists correctly across a simulated page reload (sessionStorage-based), just anchored to the wrong 20s target (BUG-01)
- Cookie guard (`cre-t-19=modal-shown`) correctly prevents re-firing on a later page view once shown this session
- Close via cross icon and close via overlay click both hide the modal
- CTA click fires the `pay19_-_clicks_on__create_your_free_account__button` Optimizely event, activates `.sticky-get-started a#mob-get-started`, and closes the modal
- V1 content matches Figma exactly: title, hidden subtitle, all 3 card titles/subtitles, CTA text
- V2 content matches Figma exactly: title with separately-styled "your", all 3 card titles/subtitles (PAY13-style copy), CTA text
- V1 fits without clipping on Mobile Chrome (Pixel 5)

## Regression checklist (20 shared TCs × 2 variants, + 4 V1-content + 5 V2-content TCs)

| # | Applies to | What it checks | Status |
|---|---|---|---|
| 1 | V1, V2 | Modal hidden immediately on load | ✅ |
| 2 | V1, V2 | sessionStorage target time recorded on init | ✅ |
| 3 | V1, V2 | Does NOT fire at 20s (per 40s spec) | ❌ BUG-01 |
| 4 | V1, V2 | Fires at 40s (hidden 39s → visible 40s) | ❌ BUG-01 |
| 5 | V1, V2 | 40s cumulative timer persists across reload | ❌ BUG-01 (anchored to 20s) |
| 6 | V1, V2 | Does not re-fire once shown this session | ✅ |
| 7 | V1, V2 | Close via cross icon | ✅ |
| 8 | V1, V2 | Close via overlay click | ✅ |
| 9 | V1, V2 | CTA fires click goal + activates sticky get-started + closes | ✅ |
| 10 | V1, V2 | Whole modal fits mobile viewport, no clipping/scroll | ⚠️ V1 fails on Mobile Safari only (BUG-03); V2 not meaningfully testable until BUG-02 is fixed |
| 11 | V1 | Main title matches Figma | ✅ |
| 12 | V1 | Subtitle present in DOM but hidden | ✅ |
| 13 | V1 | 3 feature cards match Figma copy | ✅ |
| 14 | V1 | CTA text matches Figma | ✅ |
| 15 | V2 | Title + highlighted "your" span present | ✅ (span present; see BUG-02 for missing color) |
| 16 | V2 | 3 feature cards match Figma copy | ✅ |
| 17 | V2 | CTA text matches Figma | ✅ |
| 18 | V2 | "your" highlight colored `#3066C9` | ❌ BUG-02 |
| 19 | V2 | Overlay/container render as `position:fixed` | ❌ BUG-02 |

## Before pushing live

1. Fix `VARIATION_DELAY_SECONDS` to `40` in both `vB.js` and `v2.js` (BUG-01).
2. Rebuild `v2.css` from `vB.css` (BUG-02) — this is the highest-priority fix, V2 is currently non-functional as a modal.
3. Re-check V1's mobile fit on iPhone-12-class viewports after any copy/spacing changes (BUG-03).
4. Once fixed locally, re-verify against the live preview URLs (Chrome browser automation was unavailable this session) — confirm Control's real 20s PAY08 behavior on the actual site, since this client's Optimizely campaign has previously diverged from local files (see `_client-notes.md`, PAY13 history: "we've made the changes" turning out to mean content-only, trigger logic untouched).
