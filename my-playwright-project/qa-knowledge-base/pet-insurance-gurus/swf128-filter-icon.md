<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 10) on 2026-07-09. -->

# SWF128 — Pet Insurance Gurus Filter Icon

**Test file:** `my-playwright-project/testing/swf128-filter-icon.spec.js`
**Reporter:** `my-playwright-project/swf128-reporter.js`
**Screenshots dir:** `my-playwright-project/swf128-screenshots/`
**Site:** `https://petinsurancegurus.com` (sitewide — homepage, /home/, /comparison/)
**Test date:** May 2026
**Test type:** Live URL testing (real site, not mock HTML)
**Test result:** 15 TCs × 6 browsers = 90 total
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Audience:** All users — Desktop + Tablet + Mobile (no viewport restriction)
**Variation class:** `cre-t-128`
**QA force URLs:**
- Control: `?cro_mode=qa&_conv_eforce=100052131.1000255629`
- Variation: `?cro_mode=qa&_conv_eforce=100052131.1000255630`

### What this A/B test does

Injects a "Customize results for your pet" label with a filter icon immediately **before** the `.filter-options` element inside `#comparison-section`. The injected wrapper `.cre-t-128-icon-text-wrapper` contains:
- A filter icon image `.cre-t-128-filter-icon` — `src` contains `filter.svg` (hosted on CDN), `alt="Filter Icon"`
- Text element `.cre-t-128-icon-text` — exact text `"Customize results for your pet"`

CSS changes:
- `.filter-options` → `margin-top: 0px` (removes spacing above filter options)
- `#comparison-section>.ct-section-inner-wrap` → `align-items: flex-start`

Conversion tracking:
- Filter tab click (`mousedown` on `.filter-options .oxy-tabs .oxy-tab`) → pushes `['triggerConversion', ...]` to `window._conv_q`
- ZIP code field click (`mousedown` on `[placeholder="Enter Zip Code"]`) → same conversion push

Duplicate-init guard prevents re-injection if variation code is run a second time.

### All Test Cases (15 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | Control | No `.cre-t-128-icon-text-wrapper` on control URL (6s wait before asserting absence) |
| TC-02 | Variation (/) | Wrapper injected exactly once on homepage |
| TC-03 | Variation (/home/) | Wrapper injected on `/home/` route |
| TC-04 | Variation (/comparison/) | Wrapper injected on `/comparison/` route |
| TC-05 | Content | Exact text `"Customize results for your pet"` |
| TC-06 | Content | Filter SVG `src` contains `filter.svg`; `alt="Filter Icon"` |
| TC-07 | No Duplication | Second JS execution (simulated console paste) does not duplicate wrapper |
| TC-08 | CSS | `.filter-options` `margin-top` is `0px` |
| TC-09 | Goal | Filter tab `mousedown` pushes `triggerConversion` to `window._conv_q` |
| TC-10 | Goal | ZIP code field `mousedown` pushes `triggerConversion` to `window._conv_q` |
| TC-11 | Responsive | Desktop 1280×800 — wrapper visible |
| TC-12 | Responsive | Tablet 768×1024 — wrapper visible |
| TC-13 | Responsive | Mobile 375×812 — wrapper visible |
| TC-14 | CSS | `#comparison-section>.ct-section-inner-wrap` has `align-items: flex-start` |
| TC-15 | Sitewide | All 3 variation URLs (/, /home/, /comparison/) each render wrapper exactly once |

### Issues found during development

- **Cookie consent banner** — The live site shows a GDPR/cookie consent banner that can block element interaction. `gotoAndWait()` helper tries to click common accept-button selectors (`.cmplz-accept`, `#accept-cookies`, etc.) and silently ignores if none found.
- **Async injection** — The variation is injected asynchronously by VWO. `waitForSelector(WRAPPER_SEL, { state: 'attached', timeout: 30000 })` is used instead of a fixed `waitForTimeout()`. The 30s timeout handles slower WebKit page loads.
- **Conversion goal test technique** — TC-09 and TC-10 reset `window._conv_q = []` after page load (to clear any prior entries), then dispatch `mousedown` with `{ bubbles: true, cancelable: true }` so the document-level event listener in the variation code catches the event. Then check that `_conv_q` contains an item with `item[0] === 'triggerConversion'`.
- **TC-01 timing** — Control test waits 6 seconds before asserting absence of wrapper, to give any delayed scripts time to run and avoid a false pass.
- **Duplication test (TC-07)** — Manually runs `addStyleTag` + `page.evaluate(JS_CONTENT)` a second time to simulate a developer pasting the code in the console twice. The wrapper must still be count 1.

### Additional test cases to consider

- [ ] Filter icon is visible and not broken (check `naturalWidth > 0` for `<img>`)
- [ ] Text and icon are aligned correctly (check flex layout / vertical alignment)
- [ ] Wrapper appears on additional pages beyond the 3 tested
- [ ] Conversion fires only once per session (not on every mousedown)
- [ ] Element is accessible: icon has non-empty `alt`, wrapper has readable text for screen readers
- [ ] Animation/transition on filter section does not cause layout shift with the new element


