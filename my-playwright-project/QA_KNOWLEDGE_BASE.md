# Playwright Automation QA — Knowledge Base

> **Purpose:** Single reference file for all A/B test and app QA automation done in this repo.
> When starting a new test of a similar type, read the relevant section to understand what was tested before,
> what issues were found, and what additional test cases to consider.

---

## Index

1. [AFP08 — Timed Modal (conference.financialprofessionals.org)](#1-afp08--timed-modal)
2. [SIC-21 — Form Field Validation (13sick.com.au Step 4)](#2-sic-21--form-field-validation)
3. [SIC-19 — 13sick.com.au A/B Test](#3-sic-19--13sickcomau-ab-test)
4. [Trakio — Full App Page Audit (trakio.brillmark.com)](#4-trakio--full-app-page-audit)
5. [Test Type Checklists (reuse for future tests)](#5-test-type-checklists)

---

## 1. AFP08 — Timed Modal

**Test file:** `my-playwright-project/testing/afp08-modal.spec.js`
**Site:** `conference.financialprofessionals.org`
**Test date:** May 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Test result:** All 25 TCs passed across 6 browsers
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)

### What this A/B test does

A timed modal variation injected via VWO onto the AFP 2026 Annual Conference site.
The modal fires after the visitor has spent 15 seconds on the site (timer persists in `sessionStorage` across page navigations within the same session). It is desktop-only (hidden below 1024px). Contains logo, headline, 3 feature cards, 2 CTAs, disclaimer, and a reviewer quote.

### All Test Cases

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | DOM | Modal HTML (`overlay`, `container`, `wrapper`, `body`, `cross`) injected into page body |
| TC-02 | Init | `<body>` receives class `cre-t-08` on variation init |
| TC-03 | Timer | Modal NOT visible before 15 seconds (no `cre-t-8-show-modal` class) |
| TC-04 | Timer | Modal VISIBLE after ≥15 seconds on desktop (≥1024px) |
| TC-05 | Timer | Modal stays hidden when only 8 of 15 seconds have elapsed |
| TC-06 | Storage | `sessionStorage.startTime` is set on init and within last 3 seconds |
| TC-07 | Navigation | `startTime` is NOT reset when user navigates to a second page on the same domain |
| TC-08 | Navigation | Modal fires on page 2 if ≥15s have elapsed since the first page load |
| TC-09 | Storage | Modal does NOT fire again if `sessionStorage.modalTriggered = "true"` already set |
| TC-10 | Interaction | X button (`.cre-t-8-modal-cross`) removes `cre-t-8-show-modal` and hides modal |
| TC-11 | Interaction | Overlay click (outside modal box) removes `cre-t-8-show-modal` and hides modal |
| TC-12 | Duplicate | Double init does not inject a second copy of the modal (count stays 1) |
| TC-13 | Content | All sections render: logo `src` contains "AFPLogo", headline "Why people attend AFP 2026", subtitle has "7,000+ attendees" / "20+ networking events" / "200+ providers", conference image, 3 cards, 2 CTAs, disclaimer "Save $675 before June 26", reviewer name "Cassie Wang" |
| TC-14 | Links | CTA href 1 → `/registration`, CTA href 2 → `/program/overview/schedule` |
| TC-15 | Analytics | `window.VWO` receives event `['event', 'afp08ModalFires']` when modal shows |
| TC-16 | Responsive | Modal hidden at 375px mobile (CSS `min-width: 1024px`) |
| TC-17 | Responsive | Modal hidden at 768px tablet |
| TC-18 | Responsive | Modal visible at exactly 1024px (breakpoint edge case) |
| TC-19 | Large Screen | At 1440px: modal visible, width ≤ 987px, horizontally centered (±20px tolerance) |
| TC-20 | Large Screen | At 1920px: modal visible, width ≤ 987px, horizontally centered |
| TC-21 | Large Screen | At 2440px (ultra-wide): modal visible, width ≤ 987px, centered |
| TC-22 | Scale | Wrapper `scale` CSS property is not null when viewport height < 1200px |
| TC-23 | Background | `.mm-page` receives `filter: blur(...)` when modal is shown |
| TC-24 | Z-index | Overlay z-index = 9998, container z-index = 9999, container > overlay |
| TC-25 | Width | At 1100px viewport: modal width ≤ 987px (max-width caps `calc(100% - 40px)`) |

### Issues found during development

- sessionStorage `startTime` must be set BEFORE injecting the variation — setting it after means the timer reads the wrong start point in tests.
- The overlay click test must target coordinates `{ x: 5, y: 5 }` (top-left corner of the overlay) with `force: true` because the modal container covers the center of the overlay.
- `window.getComputedStyle(el).scale` returns a string not a number in some browsers — avoid strict equality, just check it is not null.
- Edge and Safari need `channel: 'msedge'` set in the Playwright project config for Edge.

### Additional test cases to consider for future modal tests

- [ ] ESC key closes the modal (keyboard accessibility)
- [ ] Modal has correct ARIA role (`role="dialog"`) and `aria-modal="true"`
- [ ] Focus is trapped inside modal while it is open
- [ ] Tab order cycles through interactive elements inside modal
- [ ] Modal does not fire on a different domain (new tab / new session)
- [ ] Modal does not show on mobile even if JS tries to add the show-class (CSS-only guard)
- [ ] CTA links open in correct target (`_self` vs `_blank`)
- [ ] Modal animation/transition runs (check for CSS transition class or `opacity` change)
- [ ] `modalTriggered` flag is set to `"true"` in sessionStorage after modal fires
- [ ] Variation correctly handles `VWO` not being defined on page (no JS error)
- [ ] Scroll lock on body when modal is open (check `overflow: hidden` on `<body>`)
- [ ] Modal renders correctly in RTL locale
- [ ] Images inside modal have `alt` attributes (accessibility)
- [ ] All text inside modal passes color-contrast ratio (WCAG AA)

---

## 2. SIC-21 — Form Field Validation

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

---

## 3. SIC-19 — 13sick.com.au A/B Test

**Test file:** `my-playwright-project/testing/sic-19.spec.js` *(removed)*
**Reporter stub:** `my-playwright-project/sic-19-reporter.js` *(still exists — no-op stub)*
**Site:** `app.13sick.com.au`
**Test date:** Before May 2026

### What is known

The `sic-19-reporter.js` no-op reporter stub still exists in the repo, confirming a SIC-19 test suite was built and run. The spec file was deleted. Based on the SIC naming convention (SIC = 13Sick) this was an A/B test on a different step of the 13sick telehealth booking flow.

The reporter stub structure (`onBegin`, `onTestBegin`, `onStepBegin`, `onStepEnd`, `onTestEnd`, `onEnd`, `onError`) matches the same pattern as the SIC-21 reporter, suggesting a similar HTML QA report was generated.

### What to do if working on SIC-19 again

- Check `local_testing/` for a `sic19*` or `SIC-19*` folder with the variation JS/CSS files — those may still be present even if the spec was deleted.
- The test structure would be identical to SIC-21 (see section 2 above).
- The reporter stub file name `sic-19-reporter.js` is still referenced in `playwright.config.js` — do not delete it or the config will throw.

---

## 4. Trakio — Full App Page Audit

**Report generator:** `my-playwright-project/generate-report.js`
**Report output:** `my-playwright-project/trakio-qa-report.html` *(generated, not committed)*
**Screenshots dir:** `my-playwright-project/trakio-screenshots/`
**Site:** `trakio.brillmark.com` (Brillmark's internal LOE / task tracking app)
**Test date:** May 4, 2026
**Test type:** Playwright screenshot capture + manual visual review → HTML bug report
**Scope:** 11 pages across the full sidebar navigation

### Page Status Results

| Page | URL | Status | Issue |
|------|-----|--------|-------|
| Dashboard | `/dashboard` | ❌ 404 | BUG-01 Critical |
| My Tasks | `/tasks` | ✅ Works | — |
| Worklogs | `/worklogs` | ✅ Works | BUG-08, BUG-09 (medium) |
| My Spaces | `/spaces` | ✅ Works | — |
| Projects | `/projects` | ⚠️ Empty table | BUG-04 Critical |
| Invoices | `/invoices` | ❌ 404 | BUG-02 High |
| Clients | `/clients` | ⚠️ Empty table | BUG-05 Critical |
| Employee Worklogs | `/employee-worklogs` | ✅ Works | — |
| Reports | `/reports` | ✅ Works | BUG-07 (high), UX-06 |
| LOE Approvals | `/loe-approvals` | ❌ 404 | BUG-03 Critical |
| Settings | `/settings` | ✅ Works | UX-02, UX-03, UX-04 |

### All Bugs Found

**P0 — Critical**

| ID | Page | Issue |
|----|------|-------|
| BUG-01 | /dashboard | Dashboard returns bare Next.js 404 — first nav item, home page broken. No app chrome, no sidebar. |
| BUG-03 | /loe-approvals | LOE Approvals returns 404 — the primary purpose of the app (LOE approval workflow) has no working page. |
| BUG-04 | /projects | Projects table renders 10 completely blank rows despite summary stats at top showing real data (5,088 hrs budget, 3,025 hrs logged, 2 at-risk projects). |
| BUG-05 | /clients | Clients table renders with headers but all rows blank. 6 clients visible in My Spaces confirming data exists. |

**P1 — High**

| ID | Page | Issue |
|----|------|-------|
| BUG-02 | /invoices | Invoices returns 404 — sidebar link leads nowhere. |
| BUG-06 | Multiple | LOE data inconsistency: "CLS audit + remediation" (PSA / Hardy Party) shows `0h / 6h` on My Tasks but `8h / 6h` on My Spaces. Same task, same app, completely different numbers. |
| BUG-07 | Multiple | At-risk project count differs: Projects page shows 2, Reports page shows 3 (same definition: burn > 85% or over budget). |

**P2 — Medium**

| ID | Page | Issue |
|----|------|-------|
| BUG-08 | /worklogs | Active timer shows `01:34:47` counting up but simultaneously shows hint "Press Space to start" — contradictory state. Timer running but no task assigned to it. |
| BUG-09 | /worklogs | Weekly progress header shows "logged 0h / remaining 40h / 0%" but calendar shows historical entries (Apr 23=8h, Apr 24=7h, Apr 25=6.5h, etc.). Date range mismatch or query bug. |
| BUG-10 | /tasks + others | Sidebar workspace name and profile avatar remain as loading skeleton and never resolve on some pages. |

**P3 — UX / Copy**

| ID | Location | Issue |
|----|----------|-------|
| UX-01 | All pages (sidebar) | "Upgrade to Pro" banner copy says "Unlock unlimited chatbots" — chatbots are not a Trakio feature. Leftover template copy from a different product. |
| UX-02 | /settings | Workspace name input field is blank — current name not pre-populated. |
| UX-03 | /settings | Workspace domain field shows only placeholder `e.g., acme-team` — current slug not shown. |
| UX-04 | /settings | Logo/avatar area in settings stays as a grey loading skeleton that never resolves. |
| UX-05 | /dashboard, /invoices, /loe-approvals | 404 pages are bare Next.js default pages — no app layout, no sidebar, no back button. Users are stranded. |
| UX-06 | /reports | "Checkout Extensibility" project is 25× over budget (10h estimated / 250h actual, +240h) but gets only a small orange accuracy badge. Needs a more prominent visual alert. |

### What works well (reference for regression testing)

- **My Tasks** — Task list with project badge, status, priority, LOE progress bar, due date. Tab filters (Open / Due This Week / LOE Pending / Billable / All).
- **Worklogs** — Day-picker calendar, quick-add input, keyboard shortcuts (N, Space, S, ← →).
- **My Spaces** — Client → Project → Task hierarchy with LOE bars, assignee avatars, status badges.
- **Employee Worklogs** — Per-member daily hours, weekly LOE Est/Actual, accuracy %.
- **Reports** — KPI cards (Total Hours, Billable Ratio, LOE Accuracy, At-Risk), per-project breakdown.
- **Auth flow** — Passwordless magic link + Google OAuth, "Check your inbox" feedback.

### Screenshots captured

`trakio-screenshots/` directory contains 12 screenshots referenced in the report:
`01-login-page.png`, `page-01-dashboard.png`, `page-02-my-tasks.png`, `page-03-worklogs.png`,
`page-04-my-spaces.png`, `page-05-projects.png`, `page-06-invoices.png`, `page-07-clients.png`,
`page-08-employee-worklogs.png`, `page-09-reports.png`, `page-10-loe-approvals.png`, `page-11-settings.png`

### Additional test cases to consider for future app audits

- [ ] All sidebar nav links resolve to valid pages (no 404s)
- [ ] Custom 404 page renders within app layout with a "Go home" CTA
- [ ] Data consistency across pages (same metric on two pages shows same value)
- [ ] Table rows not blank when API confirms data exists (check network response vs rendered DOM)
- [ ] Timer state is correct (running = task assigned, stopped = no task)
- [ ] Date ranges on aggregated stats match their labels
- [ ] Skeleton loaders resolve within a timeout (3s max)
- [ ] Pro upgrade copy matches the actual product's feature set
- [ ] Settings forms pre-populate current values on load
- [ ] At-risk / budget calculations use the same formula on all pages
- [ ] Pagination on tables works (next page loads correctly)
- [ ] Search / filter on each table works and updates results
- [ ] Mobile responsive check on each page (sidebar collapses, tables scroll horizontally)
- [ ] Auth: logging out redirects to login, protected routes block unauthenticated access

---

## 5. Test Type Checklists

Use these when starting a new test of a familiar category.

---

### A — Timed / Triggered Modal (like AFP08)

**Core tests (always include):**
- [ ] Modal DOM injected exactly once (no duplicates on double init)
- [ ] Body gets variation identifier class
- [ ] Timer: modal hidden before threshold, visible after threshold
- [ ] Partial elapsed time: modal still hidden midway through timer
- [ ] SessionStorage `startTime` set and value is valid
- [ ] `startTime` NOT reset on same-domain page navigation
- [ ] Modal fires on page 2 if timer expired since page 1
- [ ] One-time flag (`modalTriggered`) prevents re-fire
- [ ] X button closes modal
- [ ] Overlay click closes modal
- [ ] All content sections render (logo, headline, body, CTAs)
- [ ] CTA hrefs are correct
- [ ] Analytics event fires when modal shows
- [ ] Responsive: hidden on mobile/tablet, visible on desktop
- [ ] Large screens: max-width capped, modal horizontally centered

**Extra tests to consider:**
- [ ] ESC key closes modal
- [ ] ARIA `role="dialog"` and `aria-modal="true"` present
- [ ] Focus trap inside modal
- [ ] Scroll lock on body while modal open
- [ ] `modalTriggered` written to storage after first fire
- [ ] Z-index stacking correct (container > overlay > page)
- [ ] Background blur/dim applied to page content
- [ ] No JS console errors on any browser

---

### B — Form Field Validation (like SIC-21)

**Core tests (always include):**
- [ ] Clicking submit/next with empty required field triggers error state
- [ ] Error class added to input element
- [ ] Label / error message color changes to red (`rgb(234, 72, 72)` or brand red)
- [ ] Border color changes to red
- [ ] Error text/message is present and descriptive
- [ ] Error clears when user fills the field
- [ ] Correct fields shown/hidden per variation
- [ ] Label text matches design
- [ ] Placeholder text matches design
- [ ] Hint text present (if applicable)
- [ ] Pre-selected / hidden form controls work correctly
- [ ] Conversion / analytics event fires on valid completion
- [ ] Cross-browser: same behavior on Chrome, Firefox, Edge, Safari
- [ ] Mobile: same behavior on Pixel 5, iPhone 12

**Extra tests to consider:**
- [ ] Error does not trigger on partially-filled optional fields
- [ ] Multiple empty fields: all show errors simultaneously
- [ ] Keyboard Enter triggers same validation as button click
- [ ] Screen reader announces error (aria-live region or aria-describedby)
- [ ] Error persists on re-click if still empty (does not flicker)
- [ ] Field error state does not carry over after browser back + forward navigation
- [ ] Conversion fires only once per completion (not on repeat clicks)

---

### C — App Page Audit (like Trakio)

**Core tests (always include):**
- [ ] Each sidebar/nav link loads a valid page (no 404s)
- [ ] Page title is correct
- [ ] Core data table / list renders with data (not empty when data exists)
- [ ] Summary / KPI stats match detail data on same page
- [ ] Stats on page A match same stats on page B (cross-page consistency)
- [ ] Skeleton loaders resolve within 3 seconds
- [ ] Auth-protected pages redirect unauthenticated users to login
- [ ] Logout works and clears session
- [ ] Screenshot of each page captured for visual record

**Extra tests to consider:**
- [ ] 404 page uses custom app layout (not bare framework default)
- [ ] Pagination loads next page correctly
- [ ] Search / filter updates displayed results
- [ ] Mobile: sidebar collapses, content stacks, tables scroll horizontally
- [ ] Forms on settings pages: current values pre-populated on load
- [ ] Actions (create, update, delete) reflect in the list immediately
- [ ] Empty states show a helpful message (not just a blank page)
- [ ] Error states (network fail) show user-friendly message
- [ ] Role-based access: actions hidden/shown correctly per user role

---

## Playwright Config Reference

**Location:** `my-playwright-project/playwright.config.js`

```
workers: 1          — sequential, avoids WAF rate-limiting on 13sick
timeout: 90000      — 90s per test
retries: 1
headless: true
viewport: 1280×800  — default desktop
navigationTimeout: 45000
actionTimeout: 20000
screenshot: only-on-failure
```

**6 browser projects:**
1. Chrome Desktop (`Desktop Chrome`)
2. Firefox Desktop (`Desktop Firefox`)
3. Edge Desktop (`Desktop Edge` + `channel: 'msedge'`)
4. Safari Desktop (`Desktop Safari`)
5. Mobile Chrome — Pixel 5 (`Pixel 5`)
6. Mobile Safari — iPhone 12 (`iPhone 12`)

**Run a specific test file:**
```
cd my-playwright-project
npx playwright test sic-21        ← runs sic-21.spec.js across all 6 browsers
npx playwright test afp08-modal   ← runs afp08-modal.spec.js
npx playwright test --project="Chrome Desktop"   ← single browser
```

---

*Last updated: 2026-05-14*
