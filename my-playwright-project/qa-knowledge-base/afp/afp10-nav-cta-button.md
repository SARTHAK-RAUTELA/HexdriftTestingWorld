<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 5) on 2026-07-09. -->

# AFP10 — Navigation CTA Button A/B Test

**Test file:** `my-playwright-project/testing/afp10-cta-button.spec.js`
**Reporter:** `my-playwright-project/afp10-reporter.js`
**Report output:** `local_testing/Local2/afp10-qa-report.html`
**Screenshots dir:** `my-playwright-project/afp10-screenshots/`
**Site:** `https://www.financialprofessionals.org/` (sitewide — all pages)
**Test date:** May 15, 2026
**Audience:** Desktop only (variation button hidden at ≤1199px via CSS media query)
**Test result:** **152 passed / 0 failed / 4 skipped** across 6 browsers (156 total — 4 skipped are desktop screenshot TCs on mobile browsers)
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Design reference:** `local_testing/Local2/AFP10.png`
**Control files:** `local_testing/Local2/variation/vB.js` + `vB.css` (winner of AFP05)
**Variation files:** `local_testing/Local2/variation/js.js` + `hello.css`

### What each variation does

**Control (vB.js + vB.css):**
- Adds `cre-t-10` class to `<body>`
- Injects a single-line orange CTA button before `#global-login .global-login__link--join`
- Button text: "Register for FP&A Forum"
- Changes "Join AFP" link text to "JOIN AFP" (uppercase)
- Also inserts button in `#global-logout` nav (for logged-in users)
- Button background: `#F7921D` (orange)
- Duplicate-init guard: `if(document.body.classList.contains("cre-t-10")) return;`

**Variation (js.js + hello.css):**
- Same structure as Control but two-line button:
  - Line 1 (`.cre-t-10-reg-text1`): "REGISTER FOR AFP 2026" — white, 13.2px, uppercase, letter-spacing 0.48px
  - Line 2 (`.cre-t-10-reg-text2`): "Early pricing ends June 26" — white 75% opacity, 9.5px
- Button uses `flex-direction: column` layout to stack the two spans
- Hidden at `max-width: 1199px` via CSS media query (desktop-only)
- Same duplicate-init guard and JOIN AFP text change as Control

### All Test Cases (26 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | Control DOM | Body receives class `cre-t-10` after init |
| TC-02 | Control DOM | Button `.cre-t-10-reg` injected exactly once (in `#global-login`) |
| TC-03 | Control DOM | Button inserted BEFORE the Join AFP link in DOM order |
| TC-04 | Control Content | Button text contains "Register for FP&A Forum" |
| TC-05 | Control Content | Button has NO `.cre-t-10-reg-text2` span (single-line only) |
| TC-06 | Control Content | Join AFP link text changed to "JOIN AFP" |
| TC-07 | Control Style | Button background is orange `rgb(247, 146, 29)` |
| TC-08 | Control Link | Button href points to `conference.financialprofessionals.org/` |
| TC-09 | Control Sitewide | Button also appears on an inner page (`/membership`) |
| TC-10 | Control Duplicate | Button NOT injected twice on double init (console re-run guard) |
| TC-11 | Control Screenshot | Visual reference captured at desktop (SKIP on mobile) |
| TC-12 | Variation DOM | Body receives class `cre-t-10` after init |
| TC-13 | Variation DOM | Button `.cre-t-10-reg` injected exactly once (in `#global-login`) |
| TC-14 | Variation DOM | Button inserted BEFORE the Join AFP link in DOM order |
| TC-15 | Variation Content | Text1 span present with "REGISTER FOR AFP 2026" |
| TC-16 | Variation Content | Text2 span present with "Early pricing ends June 26" |
| TC-17 | Variation Content | Join AFP link text changed to "JOIN AFP" |
| TC-18 | Variation Style | Button background is orange `rgb(247, 146, 29)` |
| TC-19 | Variation Style | Button uses `flex-direction: column` (two-line layout) |
| TC-20 | Variation Link | Button href points to `conference.financialprofessionals.org/` |
| TC-21 | Variation Responsive | Button HIDDEN at 375px mobile viewport |
| TC-22 | Variation Responsive | Button HIDDEN at 1199px breakpoint edge |
| TC-23 | Variation Responsive | Button VISIBLE at 1200px (just above breakpoint) |
| TC-24 | Variation Duplicate | Button NOT injected twice on double init (console re-run guard) |
| TC-25 | Variation Screenshot | Visual reference captured at desktop (SKIP on mobile) |
| TC-26 | Variation Mobile Screenshot | Button hidden state at 375px |

### Bug found during post-run design review

- **Control button text mismatch (HIGH)**: Figma AFP10.png shows the Control button text as **"REGISTER FOR AFP 2026"** but `vB.js` line 31 contains `"Register for FP&A Forum"` — stale copy carried from AFP05 without update. TC-04 was written to match the code's existing value and silently passed. The bug was only caught by manually comparing the code against the Figma after the test run. **Fix:** update `vB.js` line 31 to `REGISTER FOR AFP 2026` and change TC-04 assertion to match.
- **Root cause of the miss:** Test assertions were written based on what the code already contained, not what the Figma design specified. This means the test confirmed the code's own output, not design compliance. See [Correct QA Workflow](#12-correct-qa-workflow-for-ab-tests) below.

### Issues found during development

- **TC-15 and TC-16 count = 2 bug**: The variation's `addButton()` loops through TWO target selectors — `#global-login .global-login__link--join` AND `#global-logout .global-login__link`. The mock HTML contained both a `#global-login` nav and a `#global-logout` nav, so the two-span button was inserted in BOTH locations. A global `.cre-t-10-reg-text1` selector found 2 elements (one per nav). Fix: scope assertions to `#global-login .cre-t-10-reg .cre-t-10-reg-text1` (and `-text2`) to isolate only the logged-out header button.
- **Mock HTML must contain both navs**: The real AFP header contains `#global-login` (for guests) and `#global-logout` (for logged-in users). Mock HTML must replicate both so all insertion targets are present.
- **TC-07 / TC-18 orange color**: Use `getComputedStyle` → check for `rgb(247, 146, 29)`. CSS hex `#F7921D` and `#f7921d` both resolve to the same rgb — the check is case-insensitive after computation.
- **TC-19 flex-direction**: Inject both the CSS and JS before checking `getComputedStyle`. Without the CSS, `flex-direction` stays `row` (default) and the assertion fails.

### Console re-run protection (TC-10, TC-24)

Both Control and Variation guard against duplicate injection:
```js
if (document.body.classList.contains("cre-t-10")) return;
```
TC-10 and TC-24 confirm this works: calling the init function twice results in exactly 1 button in the DOM (not 2). This directly answers the QA requirement "content should not repeat if we add code in console."

### Additional test cases to consider for future nav CTA button tests

- [ ] Button is keyboard-focusable and shows visible focus ring (accessibility)
- [ ] Button text does not overflow / wrap unexpectedly at narrow desktop widths (1200px–1300px)
- [ ] Hover state: button background or text changes color on hover
- [ ] Button appears correctly in both logged-in and logged-out header states
- [ ] VWO analytics event fires on button click
- [ ] Button click navigates to the correct conference URL (real navigation, not just href check)
- [ ] CTA opens in same tab (confirm `target` attribute is not `_blank`)
- [ ] Button renders correctly when browser zoom is set to 125% or 150%
- [ ] Button is absent on mobile (`display: none`) even if JS runs (CSS-only guard check)
- [ ] Text color contrast passes WCAG AA (white on `#F7921D` orange)


