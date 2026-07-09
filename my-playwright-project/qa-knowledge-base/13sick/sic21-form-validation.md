<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 2) on 2026-07-09. -->

# SIC-21 — Form Field Validation

**Test file:** `my-playwright-project/testing/sic-21.spec.js` *(removed)*
**Reporter:** `my-playwright-project/sic-21-reporter.js` *(removed)*
**Report output:** `my-playwright-project/sic-21-qa-report.html` *(removed)*
**Site:** `app.13sick.com.au`
**Target element:** `body[data-telehealth="step_4_Verify"]` — Step 4 (Verify / clinic selection)
**Test date:** May 14, 2026
**Test result:** **306/306 passed** across 6 browsers
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Variation files:**
- Control: `local_testing/Local2/variation/vB.js`
- Variation B: `local_testing/Local2/variation/js.js`
**QA force URLs:**
- Control: `?_conv_eforce=100052011.1000255372`
- Variation B: `?_conv_eforce=100052011.1000255373`

### What each variation does

**Control (vB.js):**
- Adds a red label + red border (via class `cre-t-21-field-error`) to the `#practice-search-by-name` combobox
- Triggers when user clicks "Next" with the clinic field empty
- Fires VWO conversion `100037720`
- Label color turns `rgb(234, 72, 72)`, input border turns red

**Variation B (js.js):**
- Hides the `#practice-search-by-name` field entirely
- Shows `#practice-search-by-postcode` field instead
- Updates label text → "Select a clinic"
- Updates placeholder → "Search clinic name or postcode"
- Adds hint text below the field
- Updates terms/consent text
- Pre-selects and hides the "attended" checkbox
- Same red error validation on the postcode field when Next clicked empty

### What the tests covered (306 tests = ~51 per browser × 6 browsers)

| Category | Tests |
|----------|-------|
| DOM init | `body` gets variation identifier class, correct elements shown/hidden |
| Validation trigger | Clicking Next with empty clinic field triggers red error state |
| Error styling — Control | Label color is `rgb(234, 72, 72)`, input has `cre-t-21-field-error` class, border is red |
| Error styling — Variation B | Postcode field label turns red, postcode input border turns red |
| Error clear | Error styling removes when user selects a valid clinic / types in field |
| Field visibility — Control | `#practice-search-by-name` visible, `#practice-search-by-postcode` hidden |
| Field visibility — Variation B | `#practice-search-by-postcode` visible, `#practice-search-by-name` hidden |
| Label text | "Select a clinic" in Variation B |
| Placeholder | "Search clinic name or postcode" in Variation B |
| Hint text | Hint element present and non-empty in Variation B |
| Checkbox | Attended checkbox pre-selected and hidden in Variation B |
| Conversion | VWO conversion `100037720` fires on successful clinic selection |
| Responsive | Both variations render correctly on mobile and desktop |
| Cross-browser | All of the above on Chrome, Firefox, Edge, Safari, Mobile Chrome, Mobile Safari |

### Issues/context

- This test matched the pattern of Step 3 on 13sick which already had similar validation — Step 4 needed the same pattern but the label turns red (Step 3 had no label, only the border).
- The red color `rgb(234, 72, 72)` must be checked as computed style (not class presence alone) because the class may apply but the CSS may not load.
- The 13sick Playwright config uses `workers: 1` (sequential) to avoid WAF rate-limiting.

### Additional test cases to consider for future form validation tests

- [ ] Error message text is correct and descriptive (not just red styling)
- [ ] Error does NOT trigger if user has partially typed (only on completely empty)
- [ ] Error triggers on keyboard "Enter" / form submit, not just clicking Next button
- [ ] Screen reader announces validation error (aria-live or aria-describedby)
- [ ] Error state clears as soon as user starts typing (not only on full valid selection)
- [ ] Multiple fields: if two fields are empty, both show errors simultaneously
- [ ] Field error state does not persist after navigating back and returning to the step
- [ ] Conversion event fires only once (not on every click after selection)
- [ ] Variation does not break default browser form validation
- [ ] Test with autofill/browser-saved data pre-populating the field


