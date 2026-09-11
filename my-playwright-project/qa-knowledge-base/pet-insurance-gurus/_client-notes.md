# Pet Insurance Gurus — Client Notes (cross-test quirks)

**Sites:** `petinsurancegurus.com` (sister site: `rentersinsurancegurus.com` — see `../renters-insurance-gurus/`)
**A/B platform:** Convert.com — force URLs: `?cro_mode=qa&_conv_eforce=<experiment>.<variation>`
**Tests done:** SWF128, SIC132, SWF135, CRE-T-123, CRE-T-133, CRE-T-137, CRE-T-144 (SWF144), SWF139, SWF151 (cre-t-151), SWF157 (cre-t-157), SWF164 (cre-t-164), CRE-T-143 (price discount, no ticket number)

## Environment / site quirks (apply to every PIG test)

- **CRE-T-133 ZIP modal interferes with ALL other tests on this site.** It appears randomly on any page and blocks pointer events. V1 has an X close button (`.cre-t-133-close`); **V2 has NO close button** — force-remove `.cre-t-133-overlay` from the DOM, or better, **pre-set the CRE-T-133 dismiss cookie before navigation** so it never shows.
- **Cookie consent banner** can block interactions — use a `gotoAndWait()` helper that tries common accept selectors (`.cmplz-accept`, `#accept-cookies`, `button:has-text("Accept All")`) and silently continues if absent.
- **Variation injection is async** — use `waitForSelector(sel, { state: 'attached', timeout: 30000 })`, never fixed `waitForTimeout`. WebKit is slowest.
- **Conversion goal testing:** reset `window._conv_q = []` after load, dispatch `mousedown` with `{ bubbles: true, cancelable: true }` (variation listeners are document-level `mousedown`, not `click`), then assert `_conv_q` contains `['triggerConversion', ...]`.
- **Control absence tests:** wait ~6s before asserting an element is absent (delayed scripts can inject late → false pass).
- **Site is Oxygen-builder WordPress:** selectors like `.oxy-tabs`, `.oxy-pro-accordion`, `.oxy-site-navigation`, `.ct-section-inner-wrap` are stable hooks.
- **`.ct-section-inner-wrap` is `display:flex; flex-direction:column; align-items:center`.** Any block element injected as a direct child shrink-wraps and floats to the horizontal centre. Injected rows must set `width:100%; align-self:stretch; text-align:left` to line up with the site's own content (verified live 2026-07-28, CRE-T-151).
- **Prices shown in the listings are NOT the original markup.** The live cre-t-116 test injects `<span class="cre-t-116-price-update">` next to the original `.plan-detail-content .ct-span` and hides the original with CSS. `textContent` therefore returns **both** numbers and a naive `match(/[\d.]+/)` picks the **hidden** one. Any test that reads or sorts on price must read only visible children (`getComputedStyle(child).display !== 'none'`). Confirmed live 2026-07-28: hidden vs visible prices give completely different sort orders.
- **cre-t-116's hide rule is broad enough to blind-side any NEW span a test injects into that same price slot, not just the original — BUT only when both tests are actually co-bucketed for the same visitor.** Its live CSS is `.cre-t-116-toolTipContentChange .tooltip-container + .plan-detail-content > span:not(.cre-t-116-price-update) { display: none !important; }` — any `<span>` child added there that isn't literally `.cre-t-116-price-update` gets hidden too, *if* cre-t-116 is active in that session. First observed live 2026-09-10 via **local injection onto an organic page load** for CRE-T-143 (price-discount test) and initially reported as a real bug — **retracted the same day**: rechecked against CRE-T-143's real Convert force-preview URL and cre-t-116 was genuinely excluded from that session (`_conv_v` cookie confirmed), so the discount rendered correctly. Root cause of the false alarm: CRE-T-143 was 0% live traffic at test time, so Convert never had a reason to apply its mutual-exclusion against cre-t-116 for *organic* visits — local injection onto an organic load bypasses the bucketing step where that exclusion would normally fire. **Takeaway: don't conclude a cre-t-116-vs-new-test CSS conflict is real from local injection alone — check the real/force-bucketed session's classes and the `_conv_v` cookie before reporting it as a bug**, especially for any test still at 0% live traffic. See [cre-t-143-price-discount.md](cre-t-143-price-discount.md) for the full retraction.
- **Comparison-section layout budget (measured live, 1440 viewport):** `.filter-options` / `.plan-box` are both **1120px** (container `.ct-section-inner-wrap` 1200px); pet-type tabs 373px, breed field 261px, ZIP field 230px → only **~247px free** on that row. Anything added to the filter row must fit that or the whole `.additional-filters` group wraps and strands the tabs on their own line.
- **Pet-type tabs (All Pets / Cats / Dogs) do a pushState navigation** to `?petType=cat` etc., not an in-place re-render — but injected DOM survives it. Breed and ZIP changes *are* in-place React re-renders that destroy injected nodes; use a MutationObserver to re-apply.
- **The site's "Showing prices for …" line** is `div.search-details`, rendered only once a filter is active, and its text ends with a **trailing space** (`"Showing prices for Cats "`). Appending copy to it without trimming that node renders as `"Cats . …"`.
- **"Ranking Methodology" is an `<h3>`** here (it is an `<h2>` on Renters Insurance Gurus) — scroll-to-methodology code cloned between the sites must scan `h2, h3, h4`.
- **Duplication test pattern:** re-run the variation JS via `page.evaluate` to simulate console paste; injected element count must stay 1.
- **Watch for missing default args on `waitForElement`/`waitForjQuery`-style polling helpers.** CRE-T-144's
  `waitForjQuery(trigger, delayInterval, delayTimeout)` was called with only `trigger` — the missing
  `delayInterval`/`delayTimeout` resolved to `undefined`, which `setInterval`/`setTimeout` treat as ~0ms,
  racing the poll against its own cleanup timer. Symptom in production: worked on the force-preview link,
  didn't show on a real bare-page visit, "fixed itself" once the user interacted with a filter (a different,
  unrelated code path re-ran). See [cre-t-144-vet-faq-top.md](cre-t-144-vet-faq-top.md) BUG-E and
  [_shared/troubleshooting-changes-not-showing.md](../_shared/troubleshooting-changes-not-showing.md) for the
  full diagnostic playbook — this pattern is likely cloned into other tests on this site/template family.
- **A long-lived, heavily-reused Chrome tab can give a false "never works" result** on this site due to stale
  Convert bucketing cookies from prior QA sessions. If a bug won't reproduce consistently in your regular test
  browser, re-check in a fresh Playwright `browser.newContext()` (or a private window) before concluding
  anything about the code.
- **A force-preview URL that renders as bare/unmodified doesn't necessarily mean the wrong link or a
  timing issue — check the `_conv_v` cookie first.** SWF164's V1 URL rendered byte-identical to the
  hardcoded page on every attempt (fresh context, reload, longer waits); the `_conv_v` cookie's `exp`
  map confirmed Convert genuinely bucketed the session into that variation, meaning the variation slot
  itself had no code attached yet in Convert — a client/dev-side gap, not a QA-side one. Fall back to
  local injection (`swf151-new-build.spec.js` pattern) against the real site rather than assuming the
  test link is broken.
- **A polling `setInterval` that runs for N seconds after init and unconditionally re-applies a
  collapsed/default state can silently undo a user's own interaction inside that window.** SWF164's
  `clickNativeButton()` re-added its own collapsed CSS class on every 250ms tick for 3 seconds after
  load, with no check for whether the user had since expanded manually — so clicking "Show More" early
  looked completely broken, but worked fine once tested after the interval's own window elapsed. Worth
  checking for on any interval-based init pattern on this site/template family. **Confirmed still live
  2026-09-10 after a full code rewrite** (same bug persisted through a rewrite that touched everything
  else) — and the rewrite *added* a second polling window keyed to `.oxy-tab` clicks, so the same
  collapse-fight now also refires every time a user returns to "All Pets" from a filter, not just on
  initial load. A defensive CSS comment added in the rewrite ("force all visible regardless of native
  collapse -- needs live verification") did not actually fix it, because CSS can't override a JS
  interval still re-adding the collapsed class on a live timer. Lesson: a bug surviving a full file
  rewrite is a sign the root cause was never actually addressed, just refactored around — re-check the
  exact same failure mode after any "fixed" rewrite rather than assuming a rewrite implies a fix.

- **The breed-select MUI combobox (`#breed-select`) starts `Mui-disabled` and only enables once a
  ZIP is entered AND validated** — but the standard `input.fill("90210")` +
  `input.dispatchEvent("change")` pattern used elsewhere on this client (ZIP-persistence checks,
  SWF164) does NOT reliably trigger whatever async validation the site needs to enable it: in 2/2
  attempts (2026-09-11, CRE-T-143 live preview retest) the combobox was still `disabled` 15s after
  the synthetic `change` event. A slower/more realistic input simulation (e.g. `pressSequentially()`
  and waiting for a real network response) is likely needed for any FUTURE test that must interact
  with the real breed-picker widget (as opposed to the `?breed=` URL param, which remains the
  reliable, fast proxy for "a breed is selected" on this client — see `cre-t-143-price-discount.md`).

## Cross-site clone risk

Tests get cloned between this site and Renters Insurance Gurus (CRE-T-123 → CRE-T-136). **Clone artifacts are the #1 bug source:** leftover "pet"/"renters" copy, old fallback insurer names, old `window.cre_t_NNN_event` guard variable names. Diff cloned code against the new Figma line by line.

## Test files

| Test | File |
|------|------|
| SWF128 — Filter icon + label | [swf128-filter-icon.md](swf128-filter-icon.md) |
| SIC132 — Phone number in header nav | [sic132-phone-header-nav.md](sic132-phone-header-nav.md) |
| SWF135 — Badge overlay removal | [swf135-badge-overlay.md](swf135-badge-overlay.md) |
| CRE-T-123 — Insurer alert box | [cre-t-123-insurer-alert.md](cre-t-123-insurer-alert.md) |
| CRE-T-133 — ZIP code pop-up modal | [cre-t-133-zip-modal.md](cre-t-133-zip-modal.md) |
| CRE-T-137 — Vet FAQ + Vet Approved nav link | [cre-t-137-vet-faq-nav.md](cre-t-137-vet-faq-nav.md) |
| CRE-T-144 — Vet FAQ moved to TOP (SWF137 clone) | [cre-t-144-vet-faq-top.md](cre-t-144-vet-faq-top.md) |
| SWF139 — Info icon on scoring badge → scroll to Ranking Methodology | [swf139-info-icon-scroll.md](swf139-info-icon-scroll.md) |
| SWF151 — "Sort by" (Best Rated / Lowest Price) on comparison listings | [swf151-sort-order.md](swf151-sort-order.md) |
| SWF157 — Vet-quote testimonial redesign (single quote / manual carousel / auto carousel) | [swf157-quote-carousel.md](swf157-quote-carousel.md) |
| SWF164 — Rearrange comparison listings + rating overrides (2 arms) | [swf164-rearrange-listings.md](swf164-rearrange-listings.md) |
| CRE-T-143 — Comparison listing price discount, 13.5%/32.9% (2 arms, no ticket number) | [cre-t-143-price-discount.md](cre-t-143-price-discount.md) / [HTML report](cre-t-143-price-discount-retest-qa-report.html) |
