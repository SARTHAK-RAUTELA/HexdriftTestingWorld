<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 11) on 2026-07-09. -->

# SIC-27 — 13sick Step 4 Verify Clinic Field A/B Test

**Test file:** `my-playwright-project/testing/sic27-verify.spec.js`
**Reporter:** `my-playwright-project/sic27-reporter.js`
**Screenshots dir:** `my-playwright-project/sic27-screenshots/`
**Site:** `https://app.13sick.com.au` (Step 4 Verify of the telehealth consult booking flow)
**Test date:** May 2026
**Test result:** **34 TCs × 6 browsers = 204 total runs**
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**QA force URLs:**
- Control: `?utm_campaign=Cro_27_mode&_conv_eforce=100052135.1000255637&isTelehealth=true`
- Variation: `?utm_campaign=Cro_27_mode&_conv_eforce=100052135.1000255638&isTelehealth=true`

### What each variation does

**Control (js.js / `cre-t-21`):**
- Hides `#practice-search-by-name`
- Shows `#practice-search-by-postcode` (the general postcode clinic search — all clinics)
- Label = "Select a clinic", placeholder = "Search clinic name or postcode"
- Hint text `#cre-t-21-clinic-hint`: "Select any clinic you've visited within the last 12 months to qualify for bulk billing."
- Pre-selects + hides `hasAttendedPracticeIn12Months` checkbox (wrapper `#cre-t-21-attended-checkbox`)
- Changes terms text to start with "I agree to the "
- Adds IDs `#cre-t-21-mobile-field` and `#cre-t-21-dob-field` to the mobile and DOB input wrappers
- Red validation on empty clinic: label turns `rgb(234, 72, 72)`, container gets class `cre-t-21-field-error`
- Input container height: `52px`

**Variation (vB.js / `cre-t-27`):**
- Same as Control but shows `#practice-search-by-postcode-subscribing` instead (subscribing clinics only — a narrower list)
- `#practice-search-by-postcode` is also hidden in Variation (hidden by both variations)
- Hint text `#cre-t-27-clinic-hint`: "Select a clinic you've visited within the last 12 months to continue with bulk billing."
- Attended checkbox wrapper is `#cre-t-27-attended-checkbox`
- Error class on subscribing field is `cre-t-27-field-error`
- IDs `#cre-t-27-mobile-field` and `#cre-t-27-dob-field` assigned

### What this test is (vs SIC-21 and SIC-24)

SIC-27 is a **follow-up to SIC-21**. Where SIC-21 compared Control (name search field) vs Variation B (postcode field), SIC-27 compares two postcode-based clinic fields:
- Control = `#practice-search-by-postcode` (all clinics)
- Variation = `#practice-search-by-postcode-subscribing` (subscribing/bulk-billing clinics only)

The test navigates to Step 4 using the same `reachVerifyStep()` helper pattern as SIC-24's `reachQueuePage()` but **stops at the Verify step without submitting credentials** (no OTP needed).

### All Test Cases (34 TCs — 17 Control + 17 Variation)

| TC | Side | What it tests |
|----|------|---------------|
| TC-C01 | Control | `#practice-search-by-name` is `display:none` |
| TC-C02 | Control | `#practice-search-by-postcode` is visible |
| TC-C03 | Control | `#practice-search-by-postcode-subscribing` is NOT shown |
| TC-C04 | Control | Label inside `#practice-search-by-postcode` = "Select a clinic" |
| TC-C05 | Control | Postcode input `placeholder` = "Search clinic name or postcode" |
| TC-C06 | Control | `#cre-t-21-clinic-hint` element is in DOM |
| TC-C07 | Control | Hint text contains "Select any clinic you" and "qualify for bulk billing" |
| TC-C08 | Control | Terms text starts with "I agree to the " |
| TC-C09 | Control | `hasAttendedPracticeIn12Months` checkbox is pre-checked |
| TC-C10 | Control | `#cre-t-21-attended-checkbox` wrapper is `display:none` |
| TC-C11 | Control | Empty clinic + Next click → label turns `rgb(234, 72, 72)` |
| TC-C12 | Control | Empty clinic + Next click → container gets `cre-t-21-field-error` class |
| TC-C13 | Control | Typing in clinic input clears error (label color changes back) |
| TC-C14 | Control | `MuiAutocomplete-endAdornment` hidden inside `#practice-search-by-postcode` |
| TC-C15 | Control | Input container height is `52px` |
| TC-C16 | Control | `#cre-t-21-mobile-field` ID assigned to mobile input parent |
| TC-C17 | Control | `#cre-t-21-dob-field` ID assigned to DOB input parent |
| TC-V01 | Variation | `#practice-search-by-name` is `display:none` |
| TC-V02 | Variation | `#practice-search-by-postcode` is hidden (variation also hides it) |
| TC-V03 | Variation | `#practice-search-by-postcode-subscribing` is visible |
| TC-V04 | Variation | Label inside subscribing field = "Select a clinic" |
| TC-V05 | Variation | Subscribing input `placeholder` = "Search clinic name or postcode" |
| TC-V06 | Variation | `#cre-t-27-clinic-hint` element is in DOM |
| TC-V07 | Variation | Hint text contains "Select a clinic you" and "continue with bulk billing" |
| TC-V08 | Variation | Terms text starts with "I agree to the " |
| TC-V09 | Variation | `hasAttendedPracticeIn12Months` checkbox is pre-checked |
| TC-V10 | Variation | `#cre-t-27-attended-checkbox` wrapper is `display:none` |
| TC-V11 | Variation | Empty clinic + Next click → subscribing label turns `rgb(234, 72, 72)` |
| TC-V12 | Variation | Empty clinic + Next click → subscribing container gets `cre-t-27-field-error` class |
| TC-V13 | Variation | Typing in subscribing input clears error |
| TC-V14 | Variation | `MuiAutocomplete-endAdornment` hidden inside `#practice-search-by-postcode-subscribing` |
| TC-V15 | Variation | Subscribing input container height is `52px` |
| TC-V16 | Variation | `#cre-t-27-mobile-field` ID assigned to mobile input parent |
| TC-V17 | Variation | `#cre-t-27-dob-field` ID assigned to DOB input parent |

### Funnel navigation approach (`reachVerifyStep` helper)

The 13sick production site Reasons cards do **not** carry `[role="button"]`. Version 1 of the helper failed because it only tried `[role="button"]`. The fix uses a JS-evaluate escalation chain:
1. `document.querySelectorAll('[role="button"]')` — explicit ARIA role
2. `.MuiButtonBase-root, .MuiListItemButton-root, .MuiMenuItem-root` — MUI component classes
3. TreeWalker over all elements: click first visible element with `cursor: pointer` — catches styled divs/li cards

The helper stops as soon as the iframe body text includes both `"Mobile Number"` and `"Date of Birth"` (most reliable signal for Step 4). Timeout set to 180 seconds.

### Issues found during development

- **Reasons card selector failure (v1)** — `[role="button"]` found zero elements on the live 13sick site. The TreeWalker `cursor:pointer` fallback was added to handle non-semantic clickable cards.
- **`workers: 1`** — Inherited from playwright.config.js. Sequential test execution prevents WAF rate-limiting on app.13sick.com.au.
- **DOB input** — Same `.type()` requirement as SIC-24 (MUI DatePicker, character-by-character input). Selector tries `#secondaryUserName` first, falls back to `input[placeholder="DD/MM/YYYY"]`.
- **Stop at Verify (no OTP)** — Unlike SIC-24, this test does NOT submit the verify form or go through OTP. It only reaches Step 4 and asserts the variation's DOM changes. This avoids the complexity of OTP handling and keeps test time shorter.
- **Error clear test** — Dispatches `input` event after `.fill('Sydney')` to trigger the variation's change listener: `await input.dispatchEvent('input')`.
- **Next button selector** — `[data-testid="request-consult__next-step-button"]` is tried first; falls back to iterating all `button` elements if not found.

### Additional test cases to consider

- [ ] Hint text is visible without needing to scroll on mobile viewports
- [ ] Subscribing clinic list shows fewer results than the full postcode list (functional test with real data)
- [ ] Error styling matches exactly between Control (postcode) and Variation (subscribing) fields
- [ ] Conversion event fires once on valid clinic selection (SIC-21 pattern)
- [ ] Field does not pre-populate with stale selections from browser autofill


