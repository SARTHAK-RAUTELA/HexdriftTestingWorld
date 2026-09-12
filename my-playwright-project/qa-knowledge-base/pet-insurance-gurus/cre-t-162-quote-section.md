# CRE-T-162 — Pet Insurance Gurus "Testimonial Quote Section" (no ticket/Figma)

**Client:** The Swiftest
**Site:** petinsurancegurus.com
**Test file:** `my-playwright-project/testing/cre-t-162-quote-section.spec.js`
**Screenshots:** `cre-t-162-screenshots/` (`context-*.png` full-page desktop shots, `quote-card-*.png` close-ups, all 6 browsers)
**HTML report:** [cre-t-162-quote-section-qa-report.html](cre-t-162-quote-section-qa-report.html)
**Result:** 204/204 passed (13 TCs × 6 browsers: Chrome/Firefox/Edge/Safari Desktop, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12))

## Methodology note — file/ticket mismatch found at start of this pass

`testdetail.md` on file describes **SWF143/CRE-T-143** (sitewide price discount, already QA'd — see
[cre-t-143-price-discount.md](cre-t-143-price-discount.md)). `vB.js`/`vB.css` in
`local_testing/Local2/variation` were rewritten 2026-09-11 15:23–15:24 with completely unrelated
content: `variation_name = "cre-t-162"`, a static testimonial-quote card. Confirmed with the client:
this is a genuine followup test, no Figma/ticket provided, code is the source of truth (same
no-ticket fallback as the original CRE-T-143 pass — see `_shared/qa-workflow.md`). testdetail.md's
generic URL-targeting/audience/browser-list sections (site pages, "desktop mobile both", "chrome
safari, edge firefox") were reused as the targeting spec for this pass since they're generic to this
client's comparison-table template, not specific to the price-discount requirement text.

## What the code does

`init()` waits for `#comparison-section`, then (once, no re-apply) inserts a `<section
id="cre-t-162-section">` immediately `beforebegin` it: a white card with quote text, author line,
and source attribution, centered on a light-grey (`#f5f5f9`) full-width strip. CSS also force-hides
`#section-11-584` ("Personalize prices" copy). Responsive breakpoint at ≤768px changes padding/gap
and makes the source line static/centered instead of absolute-positioned bottom-right.

Copy (hardcoded in a `config` object):
- Text: "Several times the insurance has made the difference between treatment and euthanasia."
- Author: "Dr. Diane Deresienski • Veterinarian, Bowman Animal Hospital"
- Source: "Source: The New York Times"

## Relationship to SWF157

Closely mirrors SWF157 V1 on this same client
([swf157-quote-carousel.md](swf157-quote-carousel.md)) — same injection anchor
(`beforebegin` #comparison-section), same "Personalize prices" hide, same quote subject (Dr. Diane
Deresienski / NYT). Looks like a simplified rebuild of that already-shipped design under a new
experiment id, not a new concept. **Open question for the client:** the author line here reads "Dr.
Diane Deresienski • Veterinarian, Bowman Animal Hospital" — SWF157 confirmed the wording as "Dr.
Diane Deresienski, Managing Veterinarian" (source unchanged). Not asserted as a bug (no Figma exists
for cre-t-162 to check against), but worth confirming intentional before this ships, per this
client's documented clone-artifact risk (`_client-notes.md`: "leftover old copy" is the #1 bug
source on cloned tests here).

Also observed live (Safari, `?breed=Beagle` recon, see below): the site already renders a separate,
permanently-live photo/logo-based quote card (matches SWF157's shipped V1 design) in addition to
this newly-injected plain-text one — i.e. once cre-t-162 goes live, visitors bucketed into it will
see **two** quote blocks on the page, back to back. Worth flagging to the client even though it's
not this test's own code at fault.

## Known gap checked and found NOT to reproduce: missing MutationObserver

Unlike every other recent variation on this client, `init()` here has no `MutationObserver` — it
only runs once. `_client-notes.md` documents that ZIP/breed filter changes on this site are in-place
React re-renders that destroy injected DOM nodes elsewhere on this page (prices, listing cards).
**Tested directly (TC-08–TC-12) and the quote section survives every case** — Cats/Dogs tab switch,
ZIP entry, and a fresh load with `?breed=` already in the URL. Root cause: the section is inserted
as a **previous sibling** of `#comparison-section`, not a descendant of it, so it sits outside the
subtree React actually re-renders. Not a bug.

## Bugs found

None. All 204 runs passed.

## Environment note (not a defect)

First Safari Desktop pass hit two flaky failures on TC-12 (breed-preselected load): a 45s
`waitForSelector` timeout, then (after a fixed 800ms post-inject sleep) a false "not present" read.
Both were **WebKit slow-load timing**, not a real issue — the failure's own accessibility snapshot
showed the quote section had, in fact, rendered by the time of capture. Fixed by replacing the fixed
`waitForTimeout` after injection with `page.waitForSelector('#cre-t-162-section', {state:
'attached'})`, per this client's own documented best practice (`_client-notes.md`: "never fixed
waitForTimeout"). Re-ran clean, 34/34, after the fix — same class of issue as CRE-T-143's TC-06
Safari-only flake.

## Test scenarios

| TC | Scenario |
|---|---|
| TC-01 | Section injected immediately before `#comparison-section` |
| TC-02 | Quote text/author/source match the code's config |
| TC-03 | `#section-11-584` ("Personalize prices") hidden |
| TC-04 | Quote strip background matches `#f5f5f9` |
| TC-05 | Idempotent — re-running the script doesn't duplicate the section |
| TC-06 | No stray duplicate ids introduced |
| TC-07 | No injected-code console/page errors |
| TC-08/09 | Survives Cats tab switch and return to All Pets |
| TC-10/11 | Survives ZIP entry, copy still correct after |
| TC-12 | Still injects on a page loaded with `?breed=` already set |
| TC-13 | Mobile (≤768px): source line becomes static/centered |

Run sitewide across `/`, `/home/`, `/comparison/`, `/compare/` (TC-01–07 × 4 pages), plus one
shared-page interaction suite (TC-08–11), one breed-preload check (TC-12), and one mobile-viewport
check (TC-13) — 13 unique checks × 6 browsers = 204 runs, all passing.
