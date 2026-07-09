<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 8) on 2026-07-09. -->

# AFP15 — Events Navigation A/B Test

**Test file:** `my-playwright-project/testing/afp15-events-nav.spec.js`
**Reporter:** `my-playwright-project/afp15-reporter.js`
**Screenshots dir:** `my-playwright-project/afp15-screenshots/`
**Site:** `https://www.financialprofessionals.org/` (Events dropdown in main nav)
**Test date:** May 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Browsers:** Chrome, Firefox, Edge, Safari (Mobile browsers skipped — desktop only)
**Audience:** Desktop only
**Variation class:** `cre-t-15`
**Architecture:** `test.describe.serial` + `beforeAll` loads and opens the Events dropdown **once per browser**. All 37 TCs share this pre-open dropdown state.

### What this A/B test does

**Variation (vB.js + vB.css):**
- Adds class `cre-t-15-events` to the Events nav `<li>` item
- Adds class `cre-t-15-conference` to the "Annual Conference" `<li>` (expected to rename it to "AFP 2026 Conference" — **BUG: text change missing from code**)
- Adds class `cre-t-15-conference-archive` to "Conference Session Archives" `<li>` and **hides it** (display:none)
- Injects **6 new nav items** (`li.cre-t-15-nav-item`) inside the Events → Annual Conference sub-menu:
  1. `Register & Save $675` → `/program/overview/schedule` (has the "ENDS JUNE" badge)
  2. `Schedule at a Glance` → `/program/overview/schedule`
  3. `Team Pricing` → `/registration/team`
  4. `CTP / FPAC / CPE Credits` → `/general-information/about-the-event/recertification`
  5. `Convince Your Manager` → `/general-information/experience/convince`
  6. `Hotel & Travel` → `/hotel-travel`
- Injects "ENDS JUNE 26" badge (`.cre-t-15-tool`) inside the Register item — blue `rgb(44,143,191)`, white text, 12px, absolute positioned, pill shape
- All 6 links have `target="_self"`
- Duplicate-init guard via body class check

### All Test Cases (37 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-AFP15-00 | Diagnostic | Nav debug JSON captured (Chrome only) |
| TC-AFP15-01 | Init | Body has class `cre-t-15` |
| TC-AFP15-02 | Init | Events nav `<li>` gets `cre-t-15-events` class |
| TC-AFP15-03 | Init | Annual Conference `<li>` gets `cre-t-15-conference` class |
| TC-AFP15-04 | Init | Conference Session Archives `<li>` gets `cre-t-15-conference-archive` class |
| TC-AFP15-05 | Init | Duplicate-init guard: `cre-t-15` appears exactly once on body |
| TC-AFP15-06 | CSS | Conference Session Archives `<li>` is `display:none` |
| TC-AFP15-07 | Links | Exactly 6 new `li.cre-t-15-nav-item` elements injected |
| TC-AFP15-08 | Links | "Register & Save $675" visible with correct text |
| TC-AFP15-09 | Links | "Schedule at a Glance" visible with correct text |
| TC-AFP15-10 | Links | "Team Pricing" visible with correct text |
| TC-AFP15-11 | Links | "CTP / FPAC / CPE Credits" visible with correct text |
| TC-AFP15-12 | Links | "Convince Your Manager" visible with correct text |
| TC-AFP15-13 | Links | "Hotel & Travel" visible with correct text |
| TC-AFP15-14 | Href | Register & Save $675 → `/program/overview/schedule` |
| TC-AFP15-15 | Href | Schedule at a Glance → `/program/overview/schedule` |
| TC-AFP15-16 | Href | Team Pricing → `/registration/team` |
| TC-AFP15-17 | Href | CTP / FPAC / CPE Credits → `/general-information/about-the-event/recertification` |
| TC-AFP15-18 | Href | Convince Your Manager → `/general-information/experience/convince` |
| TC-AFP15-19 | Href | Hotel & Travel → `/hotel-travel` |
| TC-AFP15-20 | Links | All 6 new links have `target="_self"` |
| TC-AFP15-21 | Tag | `.cre-t-15-tool` ENDS JUNE tag element exists |
| TC-AFP15-22 | Tag | Tag visible inside Register & Save item |
| TC-AFP15-23 | Tag (BUG-01) | `test.fail()` — tag text is "ENDS JUNE 26" but spec says "ENDS JUNE 6" |
| TC-AFP15-24 | Tag | Background color is `rgb(44, 143, 191)` (blue) |
| TC-AFP15-25 | Tag | Text color is white `rgb(255, 255, 255)` |
| TC-AFP15-26 | Tag | Font-size is `12px` |
| TC-AFP15-27 | Tag | `position: absolute` |
| TC-AFP15-28 | Tag | `border-radius > 0` (pill shape) |
| TC-AFP15-29 | Header (BUG-02) | `test.fail()` — "Annual Conference" not renamed to "AFP 2026 Conference" in code |
| TC-AFP15-30 | Dropdown | Events button `li.cre-t-15-events > [type="button"]` exists |
| TC-AFP15-31 | Dropdown | Duplicate injection guard: still exactly 6 items after DOM re-check |
| TC-AFP15-32 | Desktop | Viewport width ≥ 1440px confirmed |
| TC-AFP15-33 | Control | Control page has NO `cre-t-15` body class |
| TC-AFP15-34 | Control | Control page has NO `li.cre-t-15-nav-item` elements |
| TC-AFP15-35 | Screenshot | Variation — Events dropdown open (clipped 1440×620) |
| TC-AFP15-36 | Screenshot | Control — Events dropdown open for comparison |

### Bugs found

- **BUG-01 (tag text mismatch):** Code has `"ENDS JUNE 26"` but spec / Figma requires `"ENDS JUNE 6"`. TC-AFP15-23 uses `test.fail(true, '...')` to document this as a known expected failure so the `describe.serial` suite continues.
- **BUG-02 (header text not changed):** Code adds `cre-t-15-conference` class to the Annual Conference `<li>` but **never changes its text** to "AFP 2026 Conference". TC-AFP15-29 uses `test.fail(true, '...')` to document this.

### Issues found during development

- **Dropdown click technique** — The AFP nav uses `[type="button"]` elements (not `<button>`). The variation assigns `li.cre-t-15-events` so the Events button is reached via `li.cre-t-15-events > [type="button"]`. Used `waitFor({ state: 'attached' })` then `scrollIntoViewIfNeeded()` then `click({ force: true })`.
- **Dropdown fallback** — If `aria-expanded="true"` is not set after clicking (e.g. CSS animation in progress), a JS-dispatch fallback fires: `btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))`.
- **Debug JSON** — On Chrome only, `beforeAll` dumps `navDebugData` to `afp15-screenshots/nav-debug.json` (selector audit). Useful when the nav structure is unknown.
- **`test.fail(true, reason)`** — Correct way to mark a test as "expected to fail" in `describe.serial`. The test still executes, reports as expected-failure (not a blocking failure), and the suite continues. Do NOT use `test.skip()` for known bugs you want to document.
- **CSS injection fallback** — Same Firefox CSP issue as AFP13; same `try/catch` + `evaluate` pattern used.

### Additional test cases to consider

- [ ] All 6 new links are keyboard-accessible (tab order within dropdown)
- [ ] Dropdown closes on Escape key
- [ ] ENDS JUNE tag appears at correct visual position relative to "Register" text (not overlapping)
- [ ] Sitewide: dropdown injection fires on inner pages (not just homepage)
- [ ] Mobile: variation is absent (desktop-only, confirm CSS hides or JS skips)
- [ ] Tag text is the correct date per the live campaign (re-verify before each test run)


