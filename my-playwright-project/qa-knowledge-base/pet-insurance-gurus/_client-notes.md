# Pet Insurance Gurus — Client Notes (cross-test quirks)

**Sites:** `petinsurancegurus.com` (sister site: `rentersinsurancegurus.com` — see `../renters-insurance-gurus/`)
**A/B platform:** Convert.com — force URLs: `?cro_mode=qa&_conv_eforce=<experiment>.<variation>`
**Tests done:** SWF128, SIC132, SWF135, CRE-T-123, CRE-T-133, CRE-T-137

## Environment / site quirks (apply to every PIG test)

- **CRE-T-133 ZIP modal interferes with ALL other tests on this site.** It appears randomly on any page and blocks pointer events. V1 has an X close button (`.cre-t-133-close`); **V2 has NO close button** — force-remove `.cre-t-133-overlay` from the DOM, or better, **pre-set the CRE-T-133 dismiss cookie before navigation** so it never shows.
- **Cookie consent banner** can block interactions — use a `gotoAndWait()` helper that tries common accept selectors (`.cmplz-accept`, `#accept-cookies`, `button:has-text("Accept All")`) and silently continues if absent.
- **Variation injection is async** — use `waitForSelector(sel, { state: 'attached', timeout: 30000 })`, never fixed `waitForTimeout`. WebKit is slowest.
- **Conversion goal testing:** reset `window._conv_q = []` after load, dispatch `mousedown` with `{ bubbles: true, cancelable: true }` (variation listeners are document-level `mousedown`, not `click`), then assert `_conv_q` contains `['triggerConversion', ...]`.
- **Control absence tests:** wait ~6s before asserting an element is absent (delayed scripts can inject late → false pass).
- **Site is Oxygen-builder WordPress:** selectors like `.oxy-tabs`, `.oxy-pro-accordion`, `.oxy-site-navigation`, `.ct-section-inner-wrap` are stable hooks.
- **Duplication test pattern:** re-run the variation JS via `page.evaluate` to simulate console paste; injected element count must stay 1.

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
