# Disability ID - Sitewide "Apply" CTA copy test (Convert exp. 100052760)

## What this test does
Replaces the visible text of every primary "Apply" CTA sitewide (control: "Apply") with softer/gain-framed
copy, text-only, keeping href/styling/case/icon/hover identical. New users only. 4 variations:
v1 "Get started", v2 "Start now", v3 "Get my card", v4 "Apply for my card". The "Renew" CTA and the
application funnel (forms.disabilityid.co.uk) must never be touched.

Code: `local_testing/Local2/variation/va1.js` (v1), `va2.js` (v2), `va3.js` (v3), `vB.js` (v4),
`vB.css` (shared hide rule, all variations). Mechanism: find `a[href*="apply"]` whose full text includes
"apply" AND whose direct child's own text is exactly "apply" -> add `.cre-t-02-hide` (CSS `display:none`)
to that child -> insert a new `<div>{new text}</div>` after it.

## Real CTA locations (live-verified 2026-09-02)
1. Header/nav button (`.right-nav`)
2. Hero section button (next to hero "Renew")
3. Mobile-only button in bottom `SECTION.apply` CTA block (`.hide-desktop`; its desktop sibling already
   reads "Start my application" and is untouched by design)

No footer "Apply" CTA exists on the live site - ticket dev notes mention one but the current `<footer>`
has only "Renew" + newsletter form + an unrelated "National Carers Card" button. Not a code defect.

## Test scenarios / regression checklist
See `testing/disabilityid-apply-cta-copy.spec.js` - per variation (control, v1-v4): header+hero text/href/
Renew-unaffected, hidden-old-text-is-display:none, /faq inner-page header button + in-content "apply"
mentions untouched, mobile-only SECTION.apply CTA, 320px no-overflow. Plus a funnel-exclusion check.

## Bugs found
None blocking. **1 intermittent finding:** Safari Desktop (WebKit), v3, the mobile-only `SECTION.apply`
CTA occasionally failed to replace on initial load (read "Apply" instead of "Get my card"). Full 7-project
run: 125/147 passed, 21 skipped by design (inner-page /faq check only exercised on control/v1). Isolated
re-runs of the failing case: 1 fail / 2 pass (confirmed intermittent, not a hard failure) - root cause is
the lack of a MutationObserver/retry (see code review #5/#7 below); the 2 primary CTAs (header, hero)
passed 100% of the time across all 7 browsers/devices.

## Lessons learned / methodology trap
`el.innerText` on an element with a `display:none` **ancestor** falls back to `textContent` per spec,
so reading it on the mobile-only CTA from a desktop viewport falsely showed concatenated text
("ApplyGet started") on first pass - not a real bug, just an invisible+non-rendered subtree. Confirmed
correct by checking the old node's computed `display` directly and by reading the *rendered* text only
at the viewport where the element is actually visible. See `_client-notes.md` for the full writeup.

## Code review (against team checklist)

| # | Checklist item | Verdict | Notes |
|---|---|---|---|
| 1 | Variation class name present | **PASS** | `addClass('body', 'cre-t-02')` on every variation's `init()`. Note: the JS constant `variation_name` is identical (`cre-t-02`) across all 4 files - harmless functionally (Convert loads only one variation's script per visitor) but means the body class alone can't distinguish v1 from v4 if ever needed for prod debugging. |
| 2 | Check element doesn't already exist before inserting | **GAP** | `insertAfter` always calls `insertAdjacentHTML('afterend', ...)` unconditionally with no "already inserted?" guard (e.g. checking `nextElementSibling` for a marker class). Harmless today because `waitForElement` + `updateApplyButton` only ever run once per page load, but there is no protection if the script were ever re-invoked (soft nav, manual re-run). Recommend adding a guard. |
| 3 | Intervals cleared via setTimeout | **PASS** | `waitForElement`'s `setInterval` is cleared on match (inside the callback) and via the 15s `setTimeout` fallback either way. |
| 4 | Event listeners/observers wrapped in a single handler behind a `window` re-entry guard | **N/A** | No event listeners or observers exist in this code - it's a one-shot DOM text swap on init only. |
| 5 | Fallback when the hide-condition code doesn't fire | **GAP** | If `waitForElement` times out after 15s without ever finding `a[href*="apply"]` (markup change, slow render), `updateApplyButton` never runs and the page silently stays on control-like "Apply" text - a safe failure mode, but nothing surfaces it beyond a `console.log` gated by `debug=1`. No user-facing or monitoring fallback. |
| 6 | Observer/scroll-detector debounce | **N/A** | No observer or scroll listener present. |
| 7 | Observers disconnected after some condition | **N/A** | No `MutationObserver` used at all. Given this is a one-shot `querySelectorAll` snapshot with no observer, late-inserted "Apply" elements on pages not covered in this session's audit (homepage + /faq only) would be missed silently. Recommend a lightweight `MutationObserver` (auto-disconnect after ~5s or first pass) as a hardening measure for other inner pages, though homepage and /faq are confirmed correct today. |
| 8 | Remove unnecessary functions | **PASS** | `waitForElement`, `addClass`, `insertAfter`, `updateApplyButton`, `init` are all used; no dead code. |
| 9 | Cache anything fetched from a URL in session storage | **N/A** | No network fetch/XHR in this code. |
| 10 | Loops cleared | **PASS** | Same as #3 - the only loop-like construct (`setInterval` poll) is cleared either way. |
| 11 | Never use dynamic selectors | **PASS (with caveat)** | `a[href*="apply"]` is a stable, meaningful attribute selector, not a Webflow-regenerated `#w-node-...` id. It does incidentally match "Renew"/"Join 300,000+ card holders"/"Start my application"/inline FAQ content links purely because they share the `/apply` href - but the code's double check (outer `textContent.includes('apply')` + inner child exact-match `=== 'apply'`) correctly excludes all of them, verified live. This is somewhat fragile (relies on exact-text coincidence protection rather than a dedicated class) but is not a live bug against the current markup. |

**Summary:** 2 hardening gaps (#2 no re-insertion guard, #5/#7 no fallback/observer for late-rendered or
changed markup). #5/#7 is not just theoretical - it is the confirmed root cause of the intermittent Safari
Desktop/v3 failure above. Recommend adding a short-lived `MutationObserver` (disconnect after first
successful pass or ~5s) before this ships, to remove the WebKit race entirely rather than relying on the
one-shot `waitForElement` poll. No other blocking defects found.

## Force URLs / variation classes
- Control: `_conv_eforce=100052760.1000257155` (no `cre-t-02` class)
- v1: `.1000257156` "Get started" | v2: `.1000257157` "Start now" | v3: `.1000257158` "Get my card" | v4: `.1000257159` "Apply for my card"
- Body class on all 4 variations: `cre-t-02`

## Report + screenshots
- Spec: `testing/disabilityid-apply-cta-copy.spec.js`
- Screenshots: `local_testing/Local2/screenshots/` (HTML QA report retired — its 12 screenshots are these same PNGs, and its narrative is captured in this doc)
