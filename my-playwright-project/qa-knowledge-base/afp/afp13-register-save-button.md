<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 7) on 2026-07-09. -->

# AFP13 — Register & Save Button A/B Test

**Test file:** `my-playwright-project/testing/afp13-register-btn.spec.js`
**Reporter:** `my-playwright-project/afp13-reporter.js`
**Screenshots dir:** `my-playwright-project/afp13-screenshots/`
**Site:** `https://conference.financialprofessionals.org/` (all pages, sitewide)
**Test date:** May 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Browsers:** Chrome, Firefox, Edge, Safari (Mobile browsers skipped — desktop only)
**Audience:** Desktop only — all mobile browser projects are skipped
**Variation class:** `cre-t-13`
**Architecture:** `test.describe.serial` + `beforeAll` loads the live URL **once per browser project** via `addInitScript`. All 26 TCs share the pre-loaded page (much faster than reloading per test).

### What this A/B test does

**Variation (vB.js + vB.css):**
- Injects a yellow CTA button `.cre-t-13-button` containing a link `.cre-t-13-button-copy-a` immediately **before** `.nav-utilities-wrapper` in the nav
- Button text: `"Register & Save $675"`
- Button href: `https://conference.financialprofessionals.org/registration` (same tab, no `target="_blank"`)
- Button background: `#FCD426` → `rgb(252, 212, 38)` (yellow)
- Button text color: black `rgb(0, 0, 0)`, font-size 14px, font-weight 500
- Replaces "Login" text with a profile SVG icon (`profile.svg`) inside `.login-link a`
- Hides `#main-nav-wrapper .nav-utilities` (display:none)
- Makes `.nav-utilities-wrapper` display:flex
- Duplicate-init guard: `if(document.body.classList.contains("cre-t-13")) return;`

**Control (no variation):**
- No `.cre-t-13-button` in DOM
- No profile icon in login link
- Standard nav utilities visible

### All Test Cases (26 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-AFP13-01 | Init | Body has class `cre-t-13` |
| TC-AFP13-02 | Init | `cre-t-13` appears exactly once on body (duplicate guard) |
| TC-AFP13-03 | Button | `.cre-t-13-button` exists in DOM |
| TC-AFP13-04 | Button | Register button is visible |
| TC-AFP13-05 | Button | Button inserted immediately before `.nav-utilities-wrapper` (`previousElementSibling` check) |
| TC-AFP13-06 | Button | Text inside `.cre-t-13-button-copy-a` is `"Register & Save $675"` |
| TC-AFP13-07 | Button | href = `https://conference.financialprofessionals.org/registration` |
| TC-AFP13-08 | Button | No `target="_blank"` (opens in same tab) |
| TC-AFP13-09 | Style | Background color is `rgb(252, 212, 38)` (yellow `#FCD426`) |
| TC-AFP13-10 | Style | Text color is `rgb(0, 0, 0)` (black) |
| TC-AFP13-11 | Style | Font-size is `14px` |
| TC-AFP13-12 | Style | Font-weight is `500` |
| TC-AFP13-13 | Login | Profile `<img>` icon present inside `.login-link a` |
| TC-AFP13-14 | Login | Login link direct text nodes are empty (no "Login" text remaining) |
| TC-AFP13-15 | Login | Profile icon `src` contains `"profile.svg"` |
| TC-AFP13-16 | Login | Login link background is transparent (`rgba(0,0,0,0)`) |
| TC-AFP13-17 | CSS | `#main-nav-wrapper .nav-utilities` is `display:none` |
| TC-AFP13-18 | CSS | `.nav-utilities-wrapper` has `display:flex` |
| TC-AFP13-19 | Sitewide | Variation fires on `/registration` page |
| TC-AFP13-20 | Sitewide | Variation fires on `/program/overview/schedule` page |
| TC-AFP13-21 | Control | Control page has NO `cre-t-13` body class |
| TC-AFP13-22 | Control | Control page has NO `.cre-t-13-button` element |
| TC-AFP13-23 | Control | Control login link has no injected profile icon |
| TC-AFP13-24 | Desktop | Viewport width ≥ 1440px confirmed |
| TC-AFP13-25 | Screenshot | Variation nav bar (button + profile icon) captured |
| TC-AFP13-26 | Screenshot | Control nav bar captured for comparison |

### Issues / notes

- **`addInitScript` vs console eval** — This test uses `page.addInitScript({ content: JS_CODE })` so the script runs before the page HTML is parsed. This correctly matches how VWO injects code on real sites. Do NOT use `page.evaluate()` for tests that depend on early DOM mutations.
- **CSS injection fallback** — Firefox blocks `addStyleTag` via CSP on real URLs. The test catches the error and falls back to `page.evaluate()` to create a `<style>` element manually.
- **Sitewide TCs (19, 20)** — Each creates a fresh browser context (`browser.newContext()`) so the `addInitScript` is active for that navigation too; closes the context in a `finally` block.
- **`waitForFunction`** — After loading, waits for `document.body.classList.contains('cre-t-13')` (up to 25s) to confirm variation fully initialized before any assertions.

### Additional test cases to consider

- [ ] Button hover state changes background color
- [ ] Button is keyboard-focusable (tab stop, visible focus ring)
- [ ] VWO analytics event fires when button is clicked
- [ ] Button text does not overflow on narrower desktop widths (1200px–1300px)
- [ ] Profile icon has `alt` attribute for accessibility
- [ ] Behavior when user is already logged in (profile icon may already exist — does variation double-inject?)


