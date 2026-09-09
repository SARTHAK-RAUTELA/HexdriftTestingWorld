# PAY21 (cre-t-21) — QA progress notes (PAUSED, dev applying fixes)

**Status as of 2026-09-09:** Paused mid full-matrix run at the user's request — dev is still pushing
fixes to the live variation. Resume once the dev confirms the new build is live.

## Where everything lives
- **Test file:** removed after this round (`testing/*.spec.js` files get deleted once documented,
  per this repo's convention) — **will need to be rewritten from scratch on resume**, using the
  findings below as the spec. It is NOT recoverable from git history (was never committed).
- **Code under test:** `local_testing/Local1/variation/vB.js` + `vB.css` (cre-t-21)
- **Figma reference:** `c:\Users\Sarthak Rautela\OneDrive\Pictures\Screenshots\Screenshot 2026-09-09 100853.png`

## Preview / test URLs
- **Editor-preview (deterministic control/variation, used for all content/DOM/responsive tests):**
  - Control: `https://pay.com.au/?optimizely_token=c2067cc73a557dd052f189d5d338df08f72f639a54823769691c3b1e650a1cda&optimizely_x=5545823390400512&optimizely_x_audiences=5278072321081344&optimizely_preview_layer_ids=5622661026414592&optimizely_snippet=s3-5421506776268800&optimizely_preview_mode_CAMPAIGN=5622661026414592&optimizely_embed_editor=false`
  - Variation: same but `optimizely_x=6001596841066496`
- **QA force-tracking links (goal/network verification ONLY — do NOT use for content assertions,
  see quirks below):**
  - Control: `https://pay.com.au/?optimizely_x=5545823390400512&optimizely_force_tracking=true&cre=qa`
  - Variation: `https://pay.com.au/?optimizely_x=6001596841066496&optimizely_force_tracking=true&cre=qa`

## Findings so far
1. **Hero swap works** — `.sec-wrap` (old hero) computed `display:none` on variation, `block` on
   control. CSS guard (vB.css line 1-3) confirmed live.
2. **Secondary CTA correct** — variation shows "Contact sales" (not PAY14's "How it works"),
   wired to the same `#contact-sales-modal` the control's own button opens. Matches the Figma
   annotation exactly.
3. **🐛 BUG-01 (content mismatch, elevated confidence)** — Figma variation trust line reads
   *"17B+ processed. Trusted by 100,000+ businesses."* Live code (vB.js line 43) reads
   *"$3B+ processed. Trusted by 50,000+ businesses."* Confirmed via the force-tracking QA link:
   a session bucketed into **PAY14's own real live variation** rendered "17B+ processed. Trusted
   by 100,000+ businesses." verbatim — i.e. that figure is the CURRENT real PAY14 copy. Strongly
   suggests vB.js was cloned from an OLDER PAY14 snapshot before its numbers were updated. Flag to
   dev as a stale-clone bug, not just a copy tweak. Encoded as intentionally-failing `TC-V-06`.
4. **Goals**: "Contact sales" reliably fires a `logx.optimizely.com/v1/events` beacon on both
   control and variation via the force-tracking QA link. Primary CTA ("Get started"/"Create your
   free account") fired the same beacon only intermittently under Playwright's synthetic click —
   identical intermittency on control, so not a variation-specific defect; recommend confirming via
   the Optimizely results dashboard.
5. **Accessibility gap** — `.cre-t-21-contact-button` `<a>` has no `href` (vB.js line 49), unlike
   control's equivalent (`href="#"`) — not keyboard-tabbable.
6. **Missing CSS-fail fallback** — old hero is hidden purely via CSS; if vB.css fails to load while
   vB.js still runs, both heroes would render stacked. No JS-level fallback exists.
7. **Debug residue** — `console.log("check")` at vB.js line 82, and `var debug = 1` at line 4
   (should likely be reset to 0 before the production push, matching this repo's own convention).
8. **Full 11-point code-review checklist**: already delivered in chat — 8/11 pass, 3 N/A (no
   observer/scroll/fetch code exists), items 5 and 8 have the findings above.

## Test run status (Chrome/Firefox/Edge/Safari Desktop + Mobile Chrome/Safari + Tablet)
- **Chrome Desktop (isolated re-runs, stable):** 24/24 tests behave correctly once two
  test-authoring bugs were fixed (899-1108px breakpoint direction; non-deterministic
  force-tracking URL bucketing) — only the intentional BUG-01 failure remains, plus the
  known-intermittent primary-CTA goal check (soft/info-only, not a gate).
- **Full 7-project run**: paused at ~51/168 (partway through Edge Desktop) when the user asked to
  pause. Firefox Desktop showed 3 additional failures (TC-V-10, TC-V-11, TC-V-12) — all traced to
  a **live-site CSP/analytics artifact**: re-injecting vB.js a second time via `page.addScriptTag`
  triggers a GTM `historyChange`/`page_view` beacon to `metrics.pay.com.au` that gets blocked by
  the page's own Content-Security-Policy in that replay context. This matches the *already-known*
  client quirk in `qa-knowledge-base/pay-com-au/_client-notes.md` ("CSP flakiness from the live
  Optimizely CDN script ... intermittent, browser-specific (seen on Firefox), unrelated to the
  variation code under test"). Not treated as a vB.js defect — needs a `page.on('pageerror')`
  filter tweak (ignore known CSP/NetworkError console noise from the site's own analytics stack)
  before it can be trusted as a clean signal, OR accept it as expected/known noise per precedent.
- **Not yet run at all:** Safari Desktop, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12),
  Tablet (iPad Gen 7).

## Before resuming
- Confirm with the dev whether BUG-01 (trust-line numbers), the missing `href` on Contact sales,
  and the CSS-fail fallback gap are being addressed in this next push — re-verify each via the
  editor-preview variation URL above once live.
- Consider loosening `TC-V-12`'s console-error assertion to ignore the known CSP/NetworkError noise
  from the site's own analytics scripts (see finding above) so it doesn't cry wolf on Firefox.
- Re-run the full 7-project matrix: `cd my-playwright-project && npx playwright test pay21-secondary-cta --reporter=list`
