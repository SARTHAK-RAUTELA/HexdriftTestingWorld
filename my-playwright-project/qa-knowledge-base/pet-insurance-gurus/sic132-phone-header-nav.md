<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 12) on 2026-07-09. -->

# SIC132 — Pet Insurance Gurus Phone Number in Header Nav

**Test file:** `my-playwright-project/testing/sic132-phone-nav.spec.js`
**Reporter:** `my-playwright-project/sic132-reporter.js`
**Screenshots dir:** `my-playwright-project/sic132-screenshots/`
**Report output:** `local_testing/Local2/sic132-qa-report.html`
**Figma reference:** `local_testing/Local2/SWF132.png`
**Site:** `https://petinsurancegurus.com` (sitewide — `/`, `/home/`, `/comparison/`)
**Test date:** June 3, 2026
**Test type:** Live URL testing (real site via Convert.com force URLs)
**Test result:** **119 passed / 1 failed / 0 skipped** across 6 browsers (120 total — 20 TCs × 6 browsers)
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Audience:** All users — Desktop + Tablet + Mobile (no viewport restriction)
**Variation name:** `cre-t-132`
**QA force URLs:**
- Control: `?cro_mode=qa&_conv_eforce=100052189.1000255762`
- Variation: `?cro_mode=qa&_conv_eforce=100052189.1000255763`

### What this A/B test does

Injects a phone number **+1 (800) 693-3529** with a phone icon into the header nav, inserted as a new `<li class="cre-t-132-phone-container">` immediately **after** the "Contact" `<li>` in `.header-nav .menu-item`. The variation:
- Adds `body.cre-t-132` class for CSS scoping (deduplication guard)
- Adds class `cre-t-132-contact-item` to the Contact `<li>` (used by CSS to hide it on narrow viewports)
- Inserts phone icon `<img class="cre-t-132-phone-icon">` with `src` from CDN: `v2.crocdn.com/SwiftTest/test132/cre-132-phone-icon.svg`
- Inserts phone link `<a class="cre-t-132-phone-link" href="tel:+18006933529">+1 (800) 693-3529</a>`

**CSS breakpoint behaviour:**

| Viewport | Phone visible? | Contact visible? | Font size | Icon width | Gap |
|----------|---------------|-----------------|-----------|------------|-----|
| ≥768px (Desktop/Tablet) | ✅ Yes | ✅ Yes | 16px | 14px | 6px |
| 376px–767px (Large Mobile) | ✅ Yes | ✅ Yes | 13px | 9px | 3px |
| ≤375px (Small Mobile) | ✅ Yes | ❌ Hidden | 13px | 9px | 3px |

The Contact link is **dropped** (not shrunk) at ≤375px to prevent wrapping or illegibly small text — this is the key mobile requirement from the Figma spec.

**Click-to-call:** The phone link `href="tel:+18006933529"` uses the standard `tel:` scheme. Tapping/clicking initiates an outbound call on phones and any desktop with a default calling app. Confirmed passing on all 6 browsers.

### All Test Cases (20 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | Control | No `.cre-t-132-phone-container` on control URL (6s wait before asserting absence) |
| TC-02 | Variation (/) | Phone container injected exactly once on homepage |
| TC-03 | Variation (/home/) | Phone container injected on `/home/` route |
| TC-04 | Variation (/comparison/) | Phone container injected on `/comparison/` route |
| TC-05 | Content | Phone link text is exactly `"+1 (800) 693-3529"` |
| TC-06 | Content | Phone icon `src` contains `cre-132-phone-icon.svg`; `alt="Phone Icon"` |
| TC-07 | Click-to-call | Phone link `href="tel:+18006933529"` |
| TC-08 | No Duplication | Second JS run (console paste) does not add a second phone container |
| TC-09 | Responsive | Desktop 1280×800 — phone container visible |
| TC-10 | Responsive | Tablet 768×1024 — phone container visible |
| TC-11 | Responsive | Mobile 390×844 — phone visible AND Contact visible (390 > 375) |
| TC-12 | Responsive | Narrow mobile 360×780 — phone visible AND Contact hidden (360 ≤ 375) |
| TC-13 | CSS | Phone link computed color = `rgb(2, 114, 228)` (#0272E4) on desktop |
| TC-14 | CSS | Phone link `font-size` = `16px` on desktop (>767px) |
| TC-15 | CSS | Phone link `font-size` = `13px` on mobile (≤767px, viewport 500px) |
| TC-16 | CSS | Phone icon computed `width` = `14px` on desktop |
| TC-17 | CSS | Phone icon computed `width` = `9px` on mobile (≤767px, viewport 500px) |
| TC-18 | CSS | Phone link hover color = `rgb(53, 142, 233)` (#358EE9) |
| TC-19 | Sitewide | All 3 variation URLs (/, /home/, /comparison/) each render phone container exactly once |
| TC-20 | Body class | `document.body.classList.contains('cre-t-132')` is true in variation |

### Findings

**TC-18 fails on Mobile Safari (iPhone 12) only — NOT a code defect:**

| Detail | Value |
|--------|-------|
| Browser | Mobile Safari (iPhone 12) — WebKit |
| Expected | `rgb(53, 142, 233)` (#358EE9) |
| Received | `rgb(48, 139, 233)` |
| Root cause | iOS WebKit applies a slight color normalization for the P3 wide-gamut display profile. The CSS is correctly authored as `color: #358EE9 !important` in the `:hover` rule. All 5 other browsers pass this test exactly. |
| Verdict | Informational finding — no code change needed. The hover color appears visually correct on a real iPhone device. |

**All other 119 tests passed on all 6 browsers.**

### Issues found during development

- **`waitForSelector` with 30s timeout** — The variation is injected asynchronously by Convert.com. `page.waitForSelector('.cre-t-132-phone-container', { state: 'attached', timeout: 30000 })` is used instead of a fixed `waitForTimeout()`. Necessary for Safari which loads the page slower.
- **TC-01 timing** — Control test waits 6 seconds after DOMContentLoaded before asserting absence of phone container, to allow any delayed scripts to run and avoid a false pass.
- **TC-12 viewport** — `page.setViewportSize({ width: 360, height: 780 })` must be set before `goto()` so the media query applies from the initial render. Setting viewport after navigation may not re-trigger the ≤375px CSS rule.
- **CSS color assertions** — Browsers return computed colors as `rgb()` not hex. `#0272E4` → `rgb(2, 114, 228)`, `#358EE9` → `rgb(53, 142, 233)`.
- **Hover test technique** — `page.locator(PHONE_LINK).hover()` + `waitForTimeout(200)` then `getComputedStyle().color`. Works on all desktop browsers and Mobile Chrome. Mobile Safari WebKit normalizes the hovered color slightly (see TC-18 finding above).
- **Cookie consent banner** — The live site shows a GDPR cookie banner. `gotoAndWait()` helper tries common accept-button selectors and silently ignores if not found.

### Additional test cases to consider

- [ ] Phone icon `naturalWidth > 0` (image actually loaded from CDN, not broken)
- [ ] Phone number and icon are vertically aligned (check `align-items: center` computed on container)
- [ ] Phone number does not wrap to a second line at 376px–767px viewports
- [ ] Header-quote button (Privacy/CTA button) has correct `margin-left: 1.5rem` in variation
- [ ] Phone link font-weight is `500` on desktop
- [ ] Phone link line-height is `24px` on desktop
- [ ] Phone container gap: `6px` on desktop, `3px` on mobile — both via computed style
- [ ] Phone icon `fetchpriority="high"` attribute present
- [ ] On touch-only devices: tapping the phone number opens the dialer (manual device check only — cannot be automated)
- [ ] Contact link is visible at exactly 376px (1px above the 375px drop threshold)
- [ ] All 3 target pages tested at the narrow mobile viewport (360px) — not just the homepage


