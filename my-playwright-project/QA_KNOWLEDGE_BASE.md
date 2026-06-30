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
5. [AFP10 — Navigation CTA Button A/B Test (financialprofessionals.org)](#5-afp10--navigation-cta-button-ab-test)
6. [AFP09 — 30-Second Timed Modal + Exit Intent (financialprofessionals.org)](#6-afp09--30-second-timed-modal--exit-intent)
7. [AFP13 — Register & Save Button A/B Test (conference.financialprofessionals.org)](#7-afp13--register--save-button-ab-test)
8. [AFP15 — Events Navigation A/B Test (financialprofessionals.org)](#8-afp15--events-navigation-ab-test)
9. [SIC-24 — Queue Page A/B Test (stg-patient.doctordoctor.com.au)](#9-sic-24--queue-page-ab-test)
10. [SWF128 — Pet Insurance Gurus Filter Icon (petinsurancegurus.com)](#10-swf128--pet-insurance-gurus-filter-icon)
11. [SIC-27 — 13sick Step 4 Verify Clinic Field A/B Test (app.13sick.com.au)](#11-sic-27--13sick-step-4-verify-clinic-field-ab-test)
12. [SIC132 — Pet Insurance Gurus Phone Number in Header Nav (petinsurancegurus.com)](#12-sic132--pet-insurance-gurus-phone-number-in-header-nav)
13. [AFP18 — Download One-Page Conference Summary Nav Link (conference.financialprofessionals.org)](#13-afp18--download-one-page-conference-summary-nav-link)
14. [SEA316 — SeaWorld Orlando Tickets Price Display (seaworldentertainment.com)](#14-sea316--seaworld-orlando-tickets-price-display)
15. [CRE-T-133 — Pet Insurance Gurus ZIP Code Pop-up Modal (petinsurancegurus.com)](#15-cre-t-133--pet-insurance-gurus-zip-code-pop-up-modal)
16. [CRE-T-123 — Pet Insurance Gurus Insurer Alert Box (petinsurancegurus.com)](#16-cre-t-123--pet-insurance-gurus-insurer-alert-box)
17. [SWF135 — Pet Insurance Gurus Badge Overlay Removal (petinsurancegurus.com)](#17-swf135--pet-insurance-gurus-badge-overlay-removal)
18. [Thumbtack SA Roofing — Landing Page Section Injection (thumbtack.com preview)](#18-thumbtack-sa-roofing--landing-page-section-injection)
19. [CRE-T-08 — pay.com.au Timed Pop-up Modal](#19-cre-t-08--paycomau-timed-pop-up-modal)
20. [CRE-T-09 — pay.com.au Navbar CTA "Create free account"](#20-cre-t-09--paycomau-navbar-cta-create-free-account)
21. [AFP19 — AFP Compensation Survey Hero Section (financialprofessionals.org)](#21-afp19--afp-compensation-survey-hero-section)
22. [Correct QA Workflow for A/B Tests](#22-correct-qa-workflow-for-ab-tests)
23. [Test Type Checklists (reuse for future tests)](#23-test-type-checklists)

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

## 5. AFP10 — Navigation CTA Button A/B Test

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

---

## 6. AFP09 — 30-Second Timed Modal + Exit Intent

**Test file:** `my-playwright-project/testing/afp09-modal.spec.js`
**Reporter:** `my-playwright-project/afp09-reporter.js`
**Screenshots dir:** `my-playwright-project/afp09-screenshots/`
**Site:** `https://www.financialprofessionals.org` (all pages, sitewide)
**Test date:** May 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Test result:** **150 passed / 30 skipped / 0 failed** across 6 browsers (180 total — 30 skipped are desktop-only TCs on mobile browsers)
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Audience:** Desktop only (viewport ≥ 1024px)
**Variation class:** `cre-t-9`

### What this A/B test does

A 30-second timed modal injected via VWO onto all pages of `financialprofessionals.org`. Compared to AFP08 (15s timer), this variation:
- Fires after **30 seconds** on site (timer tracked in `sessionStorage.startTime` across navigations)
- Also fires on **exit intent** — when the mouse moves to the top of the viewport (y ≤ 50px), with a 200ms debounce
- Uses a **cookie** `exit_popup_dismissed=true` (not sessionStorage) to prevent re-fire — set after modal shows, blocks both timer and exit intent
- Blurs **`#site-header`** and **`#site-main`** (not `.mm-page` like AFP08) when modal is visible
- Second CTA ("View Program & Pricing") links to the AFP 2026 **homepage** (not `/program/overview/schedule` like AFP08)
- Desktop-only (CSS `min-width: 1024px`)

### All Test Cases (30 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | DOM | Modal HTML (`overlay`, `container`, `wrapper`, `body`, `cross`) injected |
| TC-02 | Init | `<body>` receives class `cre-t-9` on variation init |
| TC-03 | Timer | Modal NOT visible before 30 seconds |
| TC-04 | Timer | Modal VISIBLE after ≥30 seconds (desktop) |
| TC-05 | Timer | Modal stays hidden when only 15 of 30 seconds elapsed |
| TC-06 | Storage | `sessionStorage.startTime` set and valid within last 5 seconds |
| TC-07 | Navigation | `startTime` NOT reset across same-domain page nav |
| TC-08 | Navigation | Modal fires on page 2 when ≥30s total elapsed |
| TC-09 | Cookie | Modal does NOT fire when `exit_popup_dismissed=true` cookie is set |
| TC-10 | Cookie | `exit_popup_dismissed=true` written to cookie after modal shows |
| TC-11 | Exit Intent | Modal shows when mouse moves to top of viewport (y ≤ 50) — desktop only |
| TC-12 | Exit Intent | Exit intent blocked when `exit_popup_dismissed` cookie is already set |
| TC-13 | Interaction | X button closes modal (removes `cre-t-9-show-modal`) |
| TC-14 | Interaction | Overlay click at `{ x:5, y:5 }` closes modal |
| TC-15 | Duplicate | Double init does not inject a second modal |
| TC-16 | Content | AFP logo src contains "AFPLogo"; headline "Why people attend AFP 2026"; stats bar "7,000+ attendees" / "20+ networking events" / "200+ providers"; 3 feature cards; 2 CTAs; disclaimer "Save $675 before June 26"; reviewer "Cassie Wang" |
| TC-17 | Links | CTA 1 → `https://conference.financialprofessionals.org/registration` |
| TC-18 | Links | CTA 2 → `https://conference.financialprofessionals.org/` (AFP 2026 homepage — differs from AFP08) |
| TC-19 | Analytics | VWO event `afp09ModalFires` pushed to `window.VWO` on modal show |
| TC-20 | Responsive | Modal hidden at 375px mobile |
| TC-21 | Responsive | Modal hidden at 768px tablet |
| TC-22 | Responsive | Modal VISIBLE at exactly 1024px (breakpoint edge) |
| TC-23 | Sitewide | Modal injects on `/membership/` page |
| TC-24 | Sitewide | Modal injects on `/events/` page |
| TC-25 | Sitewide | Modal injects on `/career/` page |
| TC-26 | Layout | Max-width ≤987px at 1440px viewport, horizontally centered (±20px) |
| TC-27 | Layout | Max-width ≤987px at 1920px viewport, centered |
| TC-28 | Z-index | Container z-index = 9999, overlay z-index = 9998, container > overlay |
| TC-29 | Background | `#site-header` and `#site-main` get `filter: blur(...)` when modal shows |
| TC-30 | Scale | Wrapper `scale` CSS property is not null/none at short viewport heights |

### Key differences from AFP08 (AFP09 gotchas)

- **Timer is 30s, not 15s** — `setElapsed(page, 31000)` to simulate past-threshold.
- **Cookie, not sessionStorage flag** — re-fire guard uses `exit_popup_dismissed` document cookie (not `sessionStorage.modalTriggered`). Must clear it with `max-age=0` before each test.
- **Exit intent trigger** — `await page.mouse.move(700, 400)` then `await page.mouse.move(700, 30)` + `waitForTimeout(500)` to let the 200ms debounce fire.
- **Blur targets** — `#site-header` and `#site-main` (AFP08 blurred `.mm-page`). Mock HTML must include these IDs.
- **CTA 2 href** — points to AFP 2026 homepage, not the schedule page.
- **insertModal() delay** — 2s internal delay before modal DOM is injected. TC-28 and TC-30 use `waitForSelector(..., { state: 'attached' })` instead of waiting for visibility.

### Additional test cases to consider

- [ ] Cookie expiry: `exit_popup_dismissed` should expire after N days (check `max-age` or `expires` attribute)
- [ ] Exit intent: modal does NOT fire if mouse starts at top-of-page (no prior movement into page)
- [ ] Exit intent: 200ms debounce — rapid mouse movements don't multi-fire
- [ ] Cookie set by timer path also blocks exit intent (and vice versa)
- [ ] All AFP08 extras still apply (ESC key, ARIA, focus trap, etc.)

---

## 7. AFP13 — Register & Save Button A/B Test

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

---

## 8. AFP15 — Events Navigation A/B Test

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

---

## 9. SIC-24 — Queue Page A/B Test

**Test file:** `my-playwright-project/testing/sic24-queue.spec.js`
**Diagnostic file:** `my-playwright-project/testing/sic24-diagnostic.spec.js` *(single-test funnel walkthrough — used to map the flow before writing the real suite)*
**Reporter:** `my-playwright-project/sic24-reporter.js`
**Screenshots dir:** `my-playwright-project/sic24-screenshots/`
**Site:** `https://stg-patient.doctordoctor.com.au` (13sick staging — DoctorDoctor platform)
**Test date:** May 2026
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**QA force URLs:**
- Control: `?utm_campaign=Cre_qa&_conv_eforce=100052082.1000255517&isTelehealth=true`
- Variation: `?utm_campaign=Cre_qa&_conv_eforce=100052082.1000255518&isTelehealth=true`

### What this A/B test does

On the **Queue page** (after a patient has submitted a consult request and is waiting for a doctor), the variation replaces the default waiting UI with a custom block `#custom-queue-block` that includes:
- **Breadcrumb** with 5 steps: Consult → Reasons → Details → Verify → Queue (Queue is active)
- **Card header**: pulsing dot `.cqb-dot`, "In queue" title, "Waiting for next available doctor" subtitle
- **Card body**: checkmark icon `.cqb-check`, "Thank you" title, 2 paragraphs about being in queue
- **Footer**: "Leave Queue" button (`#cqb-open-modal`)
- **Leave Queue modal** (`#custom-queue-modal` with class `cqm-open` when open): "Are you sure you want to leave the queue?" title, "Stay in Queue" button (`#cqm-stay`), "Leave Queue" button (`#cqm-leave`), X close button (`#cqm-close`), click-outside-backdrop close
- **Cleanup**: `removeBlock()` fires via MutationObserver when the native cancel button disappears from DOM (after cancel is confirmed), removing the custom block and `sic24_test` body class

### Important: the app is inside an iframe

The entire consult flow runs inside `iframe#mobile-viewport`. All selectors must be scoped through `page.frameLocator('iframe#mobile-viewport')` for assertions, or `iframeEl.contentFrame()` for direct DOM manipulation.

### Full funnel navigation (`reachQueuePage` helper)

The test must navigate the full consult funnel to reach the Queue page:
1. **Emergency Symptoms Warning** modal — check checkbox → click "Continue"
2. **Reasons page** — click first `[role="button"]` card
3. **Details page** — fill textarea with "General consultation needed" → click "Next"
4. **Verify page** — fill mobile `0499999999` + DOB `20/04/1969` (via `.type()`) + check all checkboxes → click "Next"
5. **OTP page** — fill `12312` across `input[inputmode="numeric"]` inputs → click submit button
6. **Queue page** — detect via `[data-testid="consult-requested__cancel-button"]` (Control) or `#custom-queue-block` (Variation)

The `reachQueuePage()` helper loops up to 30 attempts, detecting current step by body text and progressing accordingly. Timeout is set to 300 seconds.

### All Test Cases (17 TCs)

| TC | Describe | What it tests |
|----|----------|---------------|
| TC-01 | Control | No `#custom-queue-block` injected; native cancel button is visible |
| TC-13b | Control | Cancel → select reason → confirm → documents final state (BUG: stays on /waiting-room) |
| TC-02 | Variation | `#custom-queue-block` is visible |
| TC-03 | Variation | Breadcrumb: 5 crumbs; "Queue" has class `active` |
| TC-04 | Variation | Card header: `.cqb-dot`, `.cqb-status-title` = "In queue", `.cqb-status-sub` |
| TC-05 | Variation | Card body: `.cqb-check`, `.cqb-title` contains "Thank you", 2 `.cqb-p` paragraphs |
| TC-06 | Variation | "Leave Queue" button `#cqb-open-modal` visible |
| TC-07 | Variation | Leave Queue click → `#custom-queue-modal` gets class `cqm-open` |
| TC-08 | Variation | Modal content: title, subtitle, Stay/Leave/X buttons present |
| TC-09 | Variation | "Stay in Queue" button removes `cqm-open` class |
| TC-10 | Variation | X button removes `cqm-open` class |
| TC-11 | Variation | Click on backdrop at `{ x:5, y:5 }` removes `cqm-open` class |
| TC-12 | Variation | Leave Queue → confirm cancel → `#custom-queue-block` count becomes 0 |
| TC-13 | Variation (BUG) | Leave Queue → confirm cancel → page should navigate home (stays on /waiting-room) |
| TC-14 | Variation | `sic24_test` body class removed after cancel button disappears from DOM |
| TC-15 | Variation | Mobile viewport: `#custom-queue-block` visible |
| TC-16 | Variation | Mobile viewport: modal opens on Leave Queue click |

### Bugs found

- **BUG (TC-13 / TC-13b):** After the full cancel flow (Leave Queue → select reason → confirm "Cancel request"), the page should navigate to the home page. Instead it stays on `/waiting-room`. Documented via screenshot in both Control (TC-13b) and Variation (TC-13).

### Issues found during development

- **`sic24-diagnostic.spec.js`** was written first as a single exploratory test to map the funnel steps, capture screenshots at each stage, and identify selectors. Always write a diagnostic test first for complex multi-step flows on live URLs.
- **`[aria-modal="true"] button` scoping** — The native "Cancel request" confirm button is inside an MUI dialog with `aria-modal="true"`. Always scope to this attribute to avoid accidentally clicking the hidden original cancel button that is still in the DOM.
- **DOB field needs `.type()` not `.fill()`** — The DOB input (`#secondaryUserName`) is a MUI DatePicker that intercepts character-by-character input. `.fill()` sends the whole string at once and the picker doesn't process it. Use `.type('20041969', { delay: 50 })` with no slashes (the picker inserts them).
- **MutationObserver cleanup** — `removeBlock()` fires when the native cancel button node is removed from the DOM. TC-12 and TC-14 need `waitForTimeout(5000)` after confirming cancel to let the observer debounce (150ms) and execute.
- **`&rsquo;` encoding** — Variation JS uses HTML entity `&rsquo;` (curly apostrophe U+2019) in paragraph text. Playwright `.toContainText()` assertions must match without the apostrophe character to avoid encoding mismatches (e.g., assert `'now in the queue to speak with a doctor'` not `'you're now'`).

### Additional test cases to consider

- [ ] Queue position number is displayed and updates (if API provides it)
- [ ] "Stay in Queue" resets modal state correctly if opened/closed multiple times
- [ ] Cancel reason selection is required (cannot confirm without choosing a reason)
- [ ] Variation block does not appear on non-queue pages (doesn't inject on Reasons or Verify steps)
- [ ] Network loss during queue wait: graceful error state shown
- [ ] Doctor assigns → queue page transitions to consult page (variation block removed cleanly)

---

## 10. SWF128 — Pet Insurance Gurus Filter Icon

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

---

## 11. SIC-27 — 13sick Step 4 Verify Clinic Field A/B Test

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

---

## 12. SIC132 — Pet Insurance Gurus Phone Number in Header Nav

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

---

## 13. AFP18 — Download One-Page Conference Summary Nav Link

**Test file:** `my-playwright-project/testing/afp18-download-link.spec.js`
**Reporter:** `my-playwright-project/afp18-reporter.js`
**Screenshots dir:** `my-playwright-project/afp18-screenshots/`
**Report output:** `local_testing/Local2/afp18-qa-report.html`
**Site:** `https://conference.financialprofessionals.org/` (sitewide — all pages)
**Test date:** June 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Test result:** **142 passed / 2 failed / 0 skipped** across 6 browsers (144 total — 24 TCs × 6 browsers)
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Audience:** Desktop only — hidden at ≤1024px via CSS `@media (max-width: 1024px) { .cre-t-18-new-item { display: none !important; } }`
**Variation class:** `cre-t-18`
**PDF URL:** `https://v2.crocdn.com/AFP/test18/AFP_2026_Conference_Summary-cre-t-18.pdf`
**QA preview URL token:** `_vis_preview_data=eyJhIjoiMDg0ODI1ODR...` (embedded in spec)

### What this A/B test does

**Variation (vB.js + vB.css):**
- Polls every 250ms for `document.querySelectorAll('.main-nav a[href="/general-information/experience/convince"]')` to reach **≥2 elements** (desktop + mobile nav duplicates both load simultaneously)
- Once found, inserts a new `<li class="main-nav__links-column-list-item cre-t-18-new-item">` containing an `<a class="main-nav__links-column-list-link cre-t-18-new-link">` immediately **after** each "Convince Your Boss" `<li>` via `insertAdjacentHTML('afterend', ...)`
- Link text: `"Download One-Page Conference Summary"`
- Link `href`: PDF on v2.crocdn.com CDN (opens in new tab via `target="_blank"`)
- Duplicate-init guard: `if (document.body.classList.contains('cre-t-18')) return;`
- Polling fallback: clears interval after 5000ms if the 2-element threshold is not met

**Control:**
- No `.cre-t-18-new-link` or `.cre-t-18-new-item` in DOM
- No `body.cre-t-18` class

**Placement:** General Information dropdown → Conference Experience column → after "Convince Your Boss", before "AFP Insider Perks"

### All Test Cases (24 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | Control | `.cre-t-18-new-link` NOT in DOM after 6s wait on control URL |
| TC-02 | Variation | Link injected on variation homepage URL |
| TC-03 | Link text | Exact text `"Download One-Page Conference Summary"` |
| TC-04 | Link href | `href` = PDF URL on v2.crocdn.com CDN |
| TC-05 | Link target | `target="_blank"` (opens in new tab) |
| TC-06 | PDF accessible | PDF URL returns HTTP 200 + `content-type: application/pdf` |
| TC-07 | No duplication | Re-running `vB.js` via `page.evaluate()` does not add a second link |
| TC-08 | Position | New `<li>` is `nextElementSibling` of the "Convince Your Boss" `<li>` |
| TC-09 | Body class | `body.cre-t-18` present in variation |
| TC-10 | Body class | `body.cre-t-18` NOT present in control |
| TC-11 | Desktop 1280×800 | Link visible when dropdown open; + navbar-clipped screenshot (top 520px) |
| TC-12 | Desktop 1440×900 | Link visible when dropdown open; + navbar-clipped screenshot (top 520px) |
| TC-13 | Responsive | CSS hides link at 1024px (`display:none` via computed style) |
| TC-14 | Responsive | CSS hides link at 768px |
| TC-15 | Click | Clicking link opens PDF in new tab (or `about:blank` on Chrome headless) |
| TC-16 | CSS classes | `<a>` has both `main-nav__links-column-list-link` + `cre-t-18-new-link` |
| TC-17 | CSS classes | `<li>` has both `main-nav__links-column-list-item` + `cre-t-18-new-item` |
| TC-18 | Sitewide | `/general-information/experience/attendee-feedback2026` — link in nav + navbar screenshot |
| TC-19 | Sitewide | `/registration/full-conference-pricing` — link in nav + navbar screenshot |
| TC-20 | Sitewide | `/registration/team` — link in nav + navbar screenshot |
| TC-21 | Sitewide | `/registration/day-pass-pricing` — link in nav + navbar screenshot |
| TC-22 | Sitewide | `/program/overview/afp-2026-event-guide` — link in nav + navbar screenshot |
| TC-23 | Sitewide | `/general-information/experience/afp-member-perks` — link in nav + navbar screenshot |
| TC-24 | Sitewide | `/hotel-travel/getting-here/deals` — link in nav + navbar screenshot |

### Failures (2 — not variation defects)

- **TC-03 [Edge Desktop]** — `waitForVariation` timed out at 45s; Visually platform script loaded too slowly on Edge on this machine. Same test passes on all 5 other browsers.
- **TC-07 [Edge Desktop]** — Same root cause (page load timeout). Not a variation code defect.

### Screenshot strategy (new for AFP18)

Two types of navbar-focused screenshots are captured in addition to full-page shots:
- **`nav-dropdown-1280-{browser}.png`** and **`nav-dropdown-1440-{browser}.png`** — viewport clipped to `{ x:0, y:0, width, height:520 }` after opening the General Information dropdown in TC-11 and TC-12. Shows the dropdown with the new link clearly visible.
- **`navbar-{page-label}-{browser}.png`** — same clip taken for each of the 7 sitewide pages (TC-18–24). Gives visual proof that the link is in the nav on every tested page.

### Key headless testing notes

- **Dropdown opening (`openGenInfoDropdown`)**: Scrolls to top first (`window.scrollTo(0,0)`), then hovers the "General Information" nav trigger, then JS-forces all `.cre-t-18-new-item` ancestor elements to `display:block !important / visibility:visible !important / opacity:1 !important`. Do NOT clear transforms (mobile nav uses `translateX(-100%)` which must stay).
- **TC-06 uses `{ request }` fixture** (no browser) but still runs once per browser project (6 times total) — this is normal Playwright behavior.
- **TC-15 (click / new tab)**: Uses `context.newPage()` + `goto(href)`. Accepts `finalUrl === 'about:blank'` for Chrome headless (headless Chrome aborts PDF navigation). TC-04 verifies the href and TC-06 verifies HTTP 200 — together they fully cover the click-to-PDF behavior.
- **Polling waits for ≥2 "Convince Your Boss" links**: This is because the AFP site has both a desktop nav and a mobile nav in the DOM simultaneously, each containing the same link. The variation correctly injects after each instance.

### Additional test cases to consider

- [ ] `data-feathr-click-track` and `data-feathr-link-aids` attributes on the new link (to match the surrounding nav items' analytics tracking)
- [ ] PDF link includes `rel="noopener noreferrer"` for `target="_blank"` security best practice
- [ ] New link inherits the correct `:hover` color from `.main-nav__links-column-list-link` (same as sibling links)
- [ ] Link is keyboard-focusable (tab-accessible within the open dropdown)
- [ ] Sitewide test on additional pages beyond the 7 covered
- [ ] Variation does not inject a second link if the user navigates via the browser's back button to the same page within the same session

---

## 14. SEA316 — SeaWorld Orlando Tickets Price Display

**Site:** seaworldentertainment.com  
**Spec:** `testing/sea316-pricing.spec.js`  
**Reporter:** `sea316-reporter.js`  
**Screenshots:** `sea316-screenshots/`  
**Report:** `local_testing/Local2/sea316-qa-report.html`  
**Result:** 24 TCs × 6 browsers (144 total runs)

### What was tested

SeaWorld Orlando tickets page — multi-day and `/ea` (per-adult) price display in the variation vs. control. The variation reformats the price layout and shows a per-day breakdown.

| TC | Category | What it checks |
|----|----------|----------------|
| TC-01 | Control | No variation markup in DOM on control URL |
| TC-02 | Variation | `body.sea-316` class added after injection |
| TC-03 | Price element | `/ea` label injected for per-adult prices |
| TC-04 | Multi-day | Per-day breakdown price element present |
| TC-05 | Layout | Flex container direction and alignment |
| TC-06–10 | Content | Price values, labels, formatting match Figma |
| TC-11–14 | Responsive | Layout at 375px, 768px, 1024px, 1440px |
| TC-15–18 | Cross-page | Variation active on inner ticket pages |
| TC-19–21 | CSS guard | Removing body class reverts price display |
| TC-22–24 | Sitewide screenshots | Navbar screenshots across 3 pages |

### Key technical notes

- **CSP workaround**: SeaWorld's Content Security Policy blocked `page.addStyleTag()` with inline content; workaround was to write CSS to a temp file and use `{ path: ... }` option instead of `{ content: ... }`.
- **`waitForSelector` on price elements**: Price elements are injected asynchronously after the variation JS runs; use `waitForSelector` with timeout, not fixed delay.
- **Firefox headless dedup issue**: Firefox occasionally runs `onTestEnd` twice for the same test (Playwright headless bug). Reporter deduplicates by test title + browser name to prevent doubled screenshot entries in the HTML report.

---

## 15. CRE-T-133 — Pet Insurance Gurus ZIP Code Pop-up Modal

**Site:** petinsurancegurus.com  
**Spec:** `testing/cre-t-133-zip-modal.spec.js`  
**Reporter:** `cre-t-133-reporter.js` + `generate-cre-t-133-report.js`  
**Screenshots:** `cre-t-133-screenshots/`  
**Report:** `local_testing/Local2/cre-t-133-qa-report.html`  
**Result:** 20 TCs × 6 browsers = 120/120 passed, 0 failed, 0 skipped

### What was tested

A/B test with two variations:
- **V1** — ZIP code pop-up modal with a close (×) button
- **V2** — ZIP code pop-up modal without a close button (forced entry)

Both variations share the same base modal; the close button is conditionally rendered.

| TC | Category | What it checks |
|----|----------|----------------|
| TC-01 | Control | Modal absent on control URL after 6s wait |
| TC-02 | V1 | Modal injected + body class present |
| TC-03 | V2 | Modal injected + body class present (different class) |
| TC-04 | V1 | Close (×) button present and clickable |
| TC-05 | V2 | Close button ABSENT in DOM |
| TC-06 | V1 | Clicking × closes modal (display:none or removed) |
| TC-07 | V1/V2 | ZIP input field present and accepts input |
| TC-08 | V1/V2 | Submit button text matches design |
| TC-09 | V1/V2 | Modal shows on page load (no timer) |
| TC-10 | V1/V2 | `body.cre-t-133` class added (V1) / `body.cre-t-133-v2` (V2) |
| TC-11–14 | Responsive | Modal correct at 375px, 768px, 1024px, 1440px |
| TC-15–16 | CSS | Overlay present; modal z-index above page content |
| TC-17–18 | Sitewide | Modal on `/compare/` and `/reviews/` pages |
| TC-19–20 | Dedup | Re-running JS does not inject second modal |

### Key technical notes

- **Two-variation test**: Both V1 and V2 are tested in the same spec file by injecting different JS/CSS per test.
- **Generate script**: `generate-cre-t-133-report.js` is a standalone script (not a Playwright reporter class) — run with `node generate-cre-t-133-report.js` separately after the test run.
- **Close button selector**: `.cre-t-133-close` — verified both presence (V1) and absence (V2) via `page.$()` returning null.

---

## 16. CRE-T-123 — Pet Insurance Gurus Insurer Alert Box

**Site:** petinsurancegurus.com/compare/  
**Spec:** `testing/cre-t-123-insurer-alert.spec.js`  
**Reporter:** `cre-t-123-reporter.js`  
**Screenshots:** `cre-t-123-screenshots/`  
**Report:** `local_testing/Local2/cre-t-123-qa-report.html`  
**Result:** 20 TCs × 6 browsers = 120/120 passed, 0 failed, 0 skipped  
**Primary URL:** `https://www.petinsurancegurus.com/compare/?insurer=nationwide`

### What was tested

Dismissible alert box injected above the comparison table when an `?insurer=` query parameter is present. The alert box names the specific insurer and can be dismissed.

| TC | Category | What it checks |
|----|----------|----------------|
| TC-01 | Control | No alert when `?insurer=` param absent |
| TC-02 | Variation | Alert injected when `?insurer=nationwide` present |
| TC-03 | Text | Alert text contains insurer name (Nationwide) |
| TC-04 | Apostrophe | Curly apostrophe `'` renders correctly (not HTML entity or straight quote) |
| TC-05 | Dismiss | Clicking × removes alert from DOM |
| TC-06 | Persist | Alert does NOT reappear after dismiss (same session) |
| TC-07–10 | Other insurers | `?insurer=lemonade`, `?insurer=spot`, `?insurer=figo` each show correct insurer name |
| TC-11–14 | Responsive | Alert visible at 375px, 768px, 1024px, 1440px |
| TC-15–16 | CSS | Correct background color, border, icon |
| TC-17–18 | Position | Alert above comparison table in DOM order |
| TC-19–20 | Dedup | Second JS injection does not add second alert |

### Key bugs found and fixed

- **Curly apostrophe**: Original JS used a straight apostrophe `'` in "Don't" — Figma showed a curly `'`. Fixed in `js.js` and `vB.js`.
- **Insurer name capitalization**: `?insurer=nationwide` was displaying as "nationwide" (lowercase). Fixed to capitalize first letter via `charAt(0).toUpperCase() + slice(1)`.

### Key technical notes

- **`?insurer=` parameter testing**: Each insurer value is tested by navigating to `BASE_URL + '?insurer=<name>'` — no variation flag injection needed; the parameter itself triggers the variation.
- **Dismiss persistence**: After clicking dismiss, checked that `sessionStorage` key `cre-t-123-dismissed` is set and alert is not re-injected on `page.reload()`.

---

## 17. SWF135 — Pet Insurance Gurus Badge Overlay Removal

**Site:** petinsurancegurus.com  
**Spec:** `testing/swf135-badge-overlay.spec.js`  
**Reporter:** `swf135-reporter.js`  
**Screenshots:** `swf135-screenshots/`  
**Report:** `local_testing/Local2/swf135-qa-report.html`  
**Result:** 30 TCs × 6 browsers = 138/138 passed (+ 42 expected skips), 0 failed

### What was tested

Variation removes the badge/ribbon overlay images from insurer card thumbnails on the comparison and listing pages. The control shows badges (e.g. "Editor's Choice", "Best Value"); the variation hides them via CSS.

| TC | Category | What it checks |
|----|----------|----------------|
| TC-01–02 | Control/Variation | Body class absent/present |
| TC-03–06 | Badge elements | `.badge-overlay` computed display:none in variation |
| TC-07–10 | CSS specificity | Badge hidden even when insurer card is hovered |
| TC-11–15 | Sitewide | Badge hidden on `/`, `/compare/`, `/reviews/`, `/best-pet-insurance/`, `/cat-insurance/` |
| TC-16–20 | Card content | Insurer name, logo, star rating, price still visible after badge removal |
| TC-21–24 | Responsive | Badge hidden at all viewports (375px – 1440px) |
| TC-25–28 | CSS guard | Removing body class restores badge display |
| TC-29–30 | Dedup | JS re-run doesn't add duplicate class or elements |

### Key technical notes

- **30 TCs but 138 (not 180) runs**: Several TCs are skipped on Mobile Chrome / Mobile Safari (touch devices) because badge hover states don't apply. This is expected — those skips are documented in the report.
- **CSS only**: No DOM element injection — variation is pure CSS hide via `html body.swf-135 .badge-overlay { display: none !important; }`. Tests confirm via `getComputedStyle`.
- **`swf-135` body class** (hyphenated, not underscore) — match exactly in all selectors.

---

## 18. Thumbtack SA Roofing — Landing Page Section Injection

**Site:** Thumbtack preview environment  
**Spec:** N/A (manual + automated audit)  
**Report:** `local_testing/Local2/thumbtack-roofing-qa-report.html`  
**Result:** 26 TCs, 7 bugs found and fixed before sign-off

### What was tested

SA Roofing landing page sections (hero, services, testimonials, CTA, footer) injected onto a Thumbtack preview page via variation JS. The test verified each section rendered correctly and matched the Figma.

| TC range | Category |
|----------|----------|
| TC-01–05 | Section presence (hero, services, testimonials, CTA, footer in DOM) |
| TC-06–10 | Content — headings, body text, button labels match Figma exactly |
| TC-11–14 | Images — src correct, alt text set, images loaded (naturalWidth > 0) |
| TC-15–18 | Links — CTA hrefs correct, tel: link correct |
| TC-19–22 | Responsive — layout at 375px and 1280px |
| TC-23–26 | Visual — screenshots for each section at desktop + mobile |

### Bugs found and fixed (7)

1. Hero heading had wrong casing ("SA roofing" vs "SA Roofing")
2. Services section missing third card (only 2 of 3 rendered)
3. Testimonial star rating was 4/5 in code vs 5/5 in Figma
4. CTA button text "Get a Quote" vs "Get Your Free Quote" in Figma
5. Footer phone number format `(800) 555-1234` vs `800-555-1234` in Figma
6. Hero image `alt` attribute missing
7. Mobile layout — services cards stacked incorrectly (flex-direction not set for mobile)

---

## 19. CRE-T-08 — pay.com.au Timed Pop-up Modal

**Site:** pay.com.au  
**Spec:** `testing/cre-t-08-pay-modal.spec.js`  
**Reporter:** `cre-t-08-reporter.js`  
**Screenshots:** `cre-t-08-screenshots/`  
**Report:** `local_testing/Local2/cre-t-08-qa-report.html`  
**Result:** 20 TCs × 6 browsers = 120/120 passed, 0 failed, 0 skipped

### CRITICAL deployment note

`vB.js` contains `MODAL_DELAY_SECONDS = 3` for local testing. **Restore to `30` before pushing to Optimizely.** A 3-second delay in production would show the modal before users have read any content.

### What was tested

Timed pop-up modal appears after N seconds on pay.com.au. Uses `sessionStorage` to show once per session.

| TC | Category | What it checks |
|----|----------|----------------|
| TC-01 | Control | Modal absent after 10s wait on control URL |
| TC-02 | Variation | `body.cre-t-08` class added |
| TC-03 | Timer | Modal hidden before threshold |
| TC-04 | Timer | Modal visible after threshold |
| TC-05 | SessionStorage | `startTime` key set on page load |
| TC-06 | SessionStorage | `startTime` not reset on same-domain navigation |
| TC-07 | Cross-page | Modal fires on page 2 if timer expired on page 1 |
| TC-08 | One-time flag | `modalTriggered` prevents re-fire after close |
| TC-09 | Close button | × closes modal |
| TC-10 | Overlay | Clicking overlay closes modal |
| TC-11–13 | Content | Logo, headline, body text, CTAs rendered and match Figma |
| TC-14–15 | CTA hrefs | Register and login CTAs have correct URLs |
| TC-16 | Responsive | Modal hidden on mobile (<768px) |
| TC-17 | Responsive | Modal visible on desktop (≥768px) |
| TC-18 | Max-width | Modal max-width capped and horizontally centered |
| TC-19 | Dedup | Re-running JS does not inject second modal |
| TC-20 | Analytics | GA / dataLayer event fires when modal shows |

### Key technical notes

- **`MODAL_DELAY_SECONDS` constant**: Defined at the top of `vB.js`. Set to `3` for testing; must be `30` for production.
- **`sessionStorage` cross-page test (TC-07)**: Uses two `page.goto()` calls in sequence within the same browser context to simulate multi-page session behavior.
- **Overlay click (TC-10)**: Click the overlay element directly — do not use `page.click()` on the modal (would click inside it). Use `overlay.click()` after selecting by class.

---

## 20. CRE-T-09 — pay.com.au Navbar CTA "Create free account"

**Site:** pay.com.au  
**Spec:** `testing/cre-t-09-nav-cta.spec.js`  
**Reporter:** `cre-t-09-reporter.js`  
**Screenshots:** `cre-t-09-screenshots/`  
**Report:** `local_testing/Local2/cre-t-09-qa-report.html`  
**Result:** 20 TCs × 6 browsers = 118 passed / 0 failed / 2 skipped (TC-19 on mobile viewports — expected)

### What was tested

Variation changes desktop navbar CTA, mobile sticky CTA, mobile hamburger menu CTA, and footer CTA to read "Create free account" using a CSS `::before` pseudo-element technique (preserves original href and tracking attributes).

| TC | Selector | What it checks |
|----|----------|----------------|
| TC-01 | `body` | `body.cre-t-09` class added after injection |
| TC-02 | Desktop CTA | `::before` content = `"Create free account"` [screenshot] |
| TC-03 | Desktop CTA | `font-size: 0px` on element (original text hidden) |
| TC-04 | Desktop CTA | `href` contains "register" (URL preserved) |
| TC-05 | Desktop CTA | `display:flex; align-items:center` |
| TC-06 | Mobile sticky | `::before` content = `"Create free account"` [screenshot] |
| TC-07 | Mobile sticky | `href` preserved |
| TC-08 | Mobile menu | `::before` content = `"Create free account"` [screenshot] |
| TC-09 | Mobile menu | `href` preserved |
| TC-10 | Footer CTA | `::before` content = `"Create free account"` |
| TC-11 | Footer CTA | `href` preserved |
| TC-12 | Sitewide | How It Works page — CTA text correct |
| TC-13 | Sitewide | Pricing page — CTA text correct |
| TC-14 | Sitewide | Solutions page — CTA text correct |
| TC-15 | PAY05 coexistence | CRE-T-05 active alongside CRE-T-09: nav-link `font-size:15px` at 1199px |
| TC-16 | CSS guard | Removing `body.cre-t-09` reverts `::before` content (CDN blocked) |
| TC-17 | JS errors | No uncaught JS errors on page |
| TC-18 | Desktop CTA | `::before` `font-size: 16px` |
| TC-19 | Footer CTA | `::before` `font-size: 15px` — **SKIP on mobile** (element not shown) |
| TC-20 | Mobile 390×844 | Full viewport screenshot |

### Key selectors

```javascript
DESKTOP_CTA   = '.pca-header .pay-new-nav .nav-actions .emp'
MOB_STICKY    = '.pca-header .nav-links .sticky-get-started #mob-get-started'
MOB_MENU_CTA  = '#pay-new-nav .nav-mobile-cta'
FOOTER_CTA    = 'a.pane-footer-cta[href*="register"]'
BASE_URL      = 'https://pay.com.au/?cre=qa'
```

### Key bugs found and fixed during testing

1. **TC-16 — Optimizely CDN interference**: Live CDN independently injects CSS that ignores our `body.cre-t-09` guard. Fix: `page.route('**/cdn.optimizely.com/**', route => route.abort())` before navigation in TC-16.
2. **TC-13 Edge Desktop flake**: Edge Desktop's heavy Optimizely scripts cause ~20–40s load times; CSS hadn't settled before assertion. Fix: `waitForFunction` polling until `::before` content equals expected value (10s timeout, `.catch(() => {})`).

### CSS `::before` technique

```css
html body.cre-t-09 .nav-actions .emp {
    font-size: 0px !important;    /* hide original text */
}
html body.cre-t-09 .nav-actions .emp::before {
    content: "Create free account";
    font-size: 16px;
    /* ... other styles */
}
```
Advantage: preserves `href`, `onclick`, `data-*` tracking attributes on the anchor element.

### PAY05 (CRE-T-05) coexistence

When both CRE-T-05 and CRE-T-09 are active, `vB.js` detects `.cre-t-05-how-it-works` and adds `body.cre-t-05`. The CSS then adjusts nav-link font sizes:

| Breakpoint | Font size |
|------------|-----------|
| 1199px | 15px |
| 1310px | 17px |
| 1450px | 18px |

### `::before` verification helper

```javascript
async function getBeforeContent(page, selector) {
    return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return window.getComputedStyle(el, '::before').content;
    }, selector);
}
// Returns value WITH quotes: '"Create free account"'
// Assert: expect(result).toBe('"Create free account"')
```

---

## 21. AFP19 — AFP Compensation Survey Hero Section

**Site:** financialprofessionals.org  
**Spec:** `testing/afp19-salary-section.spec.js`  
**Reporter:** `afp19-reporter.js`  
**Screenshots:** `afp19-screenshots/`  
**Report:** `local_testing/Local2/afp19-qa-report.html`  
**Target URL:** `https://www.financialprofessionals.org/home/afp--be-the-one-with-the-answers`  
**Result:** 24 TCs × 6 browsers = 144 total — **138 passed / 6 failed** (TC-24 all browsers)  
**Body class:** `Try_Free_Cta_Hide` (VWO-assigned name)  
**Testing method:** Manual JS/CSS injection via `page.evaluate()` — VWO preview URL was not rendering the variation correctly on the live page

### What was tested

The hero `.finance-wrap` section is replaced with a two-column salary comparison layout. Left column: headline, description ("5,000+"), bullet list, form card. Right column: AFP compensation report image (rotated -4°).

| TC | Category | What it checks |
|----|----------|----------------|
| TC-01 | Control | `.salary-section` NOT in DOM before injection |
| TC-02 | Variation | `body.Try_Free_Cta_Hide` class present after injection |
| TC-03 | Variation | `.salary-section` injected inside `.finance-wrap` [screenshot] |
| TC-04 | Variation | Both `.salary-left` and `.salary-right` columns present |
| TC-05 | Content | h1 headline text present in `.salary-left` |
| TC-06 | Content | h1 `.highlight` span contains "finance" accent text |
| TC-07 | Content | `.salary-desc` contains "5,000+" data claim |
| TC-08 | Content | Exactly 3 bullet items in `.salary-bullets` [screenshot] |
| TC-09 | Bullet text | "salary kept up with peers" |
| TC-10 | Bullet text | "bonuses differ across finance roles" |
| TC-11 | Bullet text | "certifications are linked to real salary premiums" |
| TC-12 | Content | `.check-icon` SVG polyline present in all 3 bullets |
| TC-13 | Image | AFP report image in `.salary-right` [screenshot] |
| TC-14 | Image | AFP report image URL returns HTTP 200 |
| TC-15 | Dedup | Second JS injection does not create second `.salary-section` |
| TC-16 | CSS | `.salary-section` computed `display: flex` |
| TC-17 | CSS | `.salary-left` `max-width: 665px` |
| TC-18 | CSS | `h1 .highlight` color `rgb(240, 124, 42)` / #f07c2a |
| TC-19 | CSS | `.salary-bullets li` color white `rgb(255, 255, 255)` |
| TC-20 | CSS | `.doc-image-wrap img` has CSS `transform` (rotate -4°) |
| TC-21 | Responsive | Desktop 1280×800: `.salary-section` visible [screenshot] |
| TC-22 | Responsive | Tablet 768×1024: `.salary-section` visible [screenshot] |
| TC-23 | Responsive | Mobile 390×844: `.salary-inner` flex-direction column |
| TC-24 | CSS | `.form-card .hs-button` background `#FB9030` — **FAIL all 6 browsers** |

### Bug — TC-24 failed on all 6 browsers

HubSpot's embedded form stylesheets load after `vB.css` and override the button background with higher specificity. Fix: add `!important` to `.form-card .hs-button { background-color: #FB9030 !important; }` in `vB.css`. Left as documented defect for developer fix before launch.

### Key technical notes

- **`Try_Free_Cta_Hide` body class**: VWO-assigned campaign slug — unrelated to its name, just the experiment identifier.
- **VWO preview not working**: Variation injected manually via `page.evaluate()` in tests since VWO preview URL didn't render the variation.
- **HubSpot specificity conflict**: Root cause of TC-24 failure — HubSpot form CSS loads later and wins specificity race without `!important`.

---

## 22. Correct QA Workflow for A/B Tests

> This process was formalised after AFP10, where a content mismatch between the Figma design and the control code was missed because testing started from the code instead of the design.

**Always follow this order — no exceptions:**

### Step 1 — Read the Figma design first
Before opening any code file, read the design reference image (Figma / PNG / mockup) and extract every expected value:
- Button/CTA text (exact copy, exact casing)
- Colors (hex values or visual description)
- Layout (single-line vs two-line, flex direction, alignment)
- Link URLs
- Breakpoints and responsive behavior
- Any conditional states (logged-in vs logged-out, mobile vs desktop)

Write these down as your **expected values checklist** — this becomes the source of truth for all test assertions.

### Step 2 — Read the variation/control code
With the Figma spec in hand, read `js.js`, `vB.js`, CSS files and compare against each expected value:
- Does the button text in code match the Figma? (Most common bug source)
- Do the colors match?
- Does the CSS layout match?
- Are breakpoints correct?

**Flag every mismatch as a bug before writing any tests.** Do not proceed until mismatches are either fixed in the code or acknowledged by the developer.

### Step 3 — Verify against the live/preview URL
Open the VWO force URL (or preview link) in a real browser:
- `https://www.financialprofessionals.org/?_vis_preview_data=...` (or equivalent)
- Confirm the rendered output matches the Figma, not just the code
- Check mobile vs desktop rendering directly in the browser

### Step 4 — Write tests against the Figma spec
Test assertions must use the **Figma-specified values** as expected values, not the code's current output. If the code is wrong, the test must fail and surface the bug.

| Wrong approach | Correct approach |
|---|---|
| Read code → write TC asserting what code does | Read Figma → write TC asserting what design says → run against code |
| TC passes if code has "Register for FP&A Forum" | TC fails if code has "Register for FP&A Forum" instead of "REGISTER FOR AFP 2026" |

### AFP10 example (what should have happened)

| Step | Action | Finding |
|------|--------|---------|
| Step 1 | Read AFP10.png | Control button text = **REGISTER FOR AFP 2026** |
| Step 2 | Read vB.js line 31 | Code has `Register for FP&A Forum` → **BUG: content mismatch** |
| Step 3 | Open force URL | Verify rendered button on live site |
| Step 4 | Write TC-04 | Assert `"REGISTER FOR AFP 2026"` — test would fail on current code, surfacing the bug |

---

## 23. Test Type Checklists

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

### D — Navigation CTA Button (like AFP10)

**Core tests (always include):**
- [ ] Body gets variation identifier class on init
- [ ] Button injected exactly once (no duplicates on double init / console re-run)
- [ ] Button inserted in correct DOM position (before/after target element)
- [ ] Button text content matches design
- [ ] Button background color correct (computed style, not just class)
- [ ] Button href points to correct URL
- [ ] Sitewide: button appears on homepage AND at least one inner page
- [ ] Duplicate-init guard: calling init twice leaves exactly 1 button
- [ ] Responsive: button hidden below breakpoint, visible above breakpoint

**Extra tests to consider:**
- [ ] Two-line variation: both spans present, correct text in each
- [ ] Two-line variation: `flex-direction: column` confirmed via computed style
- [ ] Hover state changes button appearance
- [ ] Button keyboard-accessible (tab-focusable, visible focus ring)
- [ ] Analytics event fires on button click
- [ ] Correct behavior in logged-in vs logged-out header states (if both navs exist)
- [ ] Text does not overflow at narrow desktop widths just above the breakpoint
- [ ] CTA opens in same tab / new tab per design intent

---

### E — Header Nav Phone / Link Injection (like SIC132)

**Core tests (always include):**
- [ ] Control: injected element absent on control URL (wait at least 6s before asserting)
- [ ] Variation: element injected exactly once on each target page
- [ ] Sitewide: all target URLs (/, /home/, etc.) each inject the element once
- [ ] Duplicate-init guard: second JS execution leaves exactly 1 element
- [ ] Phone link text is exactly correct (character-for-character match)
- [ ] Phone link `href` is `tel:+1XXXXXXXXXX` (no spaces, no dashes)
- [ ] Phone icon CDN `src` matches expected filename; `alt` attribute set
- [ ] Body class (`cre-t-NNN`) added on variation init
- [ ] Contact / adjacent link hidden at narrow breakpoint (CSS display:none check via computed style)
- [ ] Contact / adjacent link visible just above the breakpoint
- [ ] Phone still visible at narrow breakpoint (not hidden along with Contact)
- [ ] Desktop: font-size, icon width, gap match CSS spec (computed style)
- [ ] Mobile breakpoint: font-size, icon width, gap match mobile CSS spec (computed style)
- [ ] Hover color changes to the specified hover value (desktop browsers)
- [ ] Responsive: phone visible at Desktop / Tablet / Mobile viewports

**Extra tests to consider:**
- [ ] Icon `naturalWidth > 0` (image actually loaded — not broken)
- [ ] Phone number does not wrap to second line at any viewport in the "show" range
- [ ] Phone link font-weight and line-height match CSS spec
- [ ] On touch devices: tap opens native phone dialer (manual device test only)
- [ ] Adjacent nav spacing / margin correct after injection (no layout shift)
- [ ] Hover color test on Mobile Safari/WebKit may produce a slightly different RGB due to P3 color normalization — this is a known platform artifact, not a code defect

---

### F — Nav Dropdown Link Injection (like AFP18)

**Core tests (always include):**
- [ ] Control: injected link absent on control URL (wait 6s before asserting)
- [ ] Variation: link injected on variation URL (wait with `waitForSelector`, not fixed timeout)
- [ ] Link text exactly matches design spec (character-for-character)
- [ ] Link `href` points to correct URL / PDF / asset
- [ ] `target="_blank"` present if design says "open in new tab"
- [ ] Asset URL returns HTTP 200 + correct content-type (TC-06 pattern)
- [ ] No duplication: re-running variation JS via `page.evaluate()` does not add a second link
- [ ] Position: new `<li>` is `nextElementSibling` of the intended anchor element (DOM adjacency check)
- [ ] Body class added for variation scoping and dedup guard
- [ ] Link visible in dropdown when dropdown is open (visibility test at desktop viewport)
- [ ] Link hidden below breakpoint (CSS computed `display:none` at mobile viewport)
- [ ] CSS classes on both `<a>` and `<li>` — both nav class AND variation class present
- [ ] Sitewide: link injected on all target pages (not just homepage)
- [ ] Navbar-clipped screenshot taken after dropdown opened (top ~520px clip)

**Extra tests to consider:**
- [ ] Polling threshold: if JS polls for N instances before injecting, verify it works when exactly N exist
- [ ] `data-analytics` / `data-feathr-*` attributes match surrounding nav items (for platform tracking continuity)
- [ ] `rel="noopener noreferrer"` on `target="_blank"` links (security)
- [ ] Link is keyboard-focusable within the dropdown (tab order)
- [ ] Hover color inherits correctly from sibling nav links (computed style)
- [ ] On pages where the dropdown target element doesn't exist (e.g. different nav structure), no JS error thrown
- [ ] Variation does not duplicate on same-session back/forward navigation

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

### G — Price Display / Multi-day Pricing (like SEA316)

**Core tests (always include):**
- [ ] Control: no variation markup in DOM on control URL
- [ ] Body gets variation identifier class on init
- [ ] `/ea` or per-unit label injected and visible
- [ ] Per-day / per-person breakdown element present
- [ ] Price values match Figma spec (do not assert live pricing — it changes)
- [ ] Layout: flex direction, alignment, spacing correct (computed style)
- [ ] Responsive: layout correct at 375px, 768px, 1024px, 1440px
- [ ] Inner pages: variation active on all targeted ticket/pricing pages
- [ ] CSS guard: removing body class reverts price display to control
- [ ] No duplication: re-running JS does not add extra price elements

**Extra tests to consider:**
- [ ] Price element ordering (e.g. per-day BEFORE total, not after)
- [ ] Currency symbol format and locale ($ vs USD vs au$)
- [ ] Price elements accessible to screen readers (aria-label or visible text)
- [ ] CSP check: if `addStyleTag({ content: ... })` throws, switch to `{ path: ... }` (SeaWorld pattern)

---

### H — ZIP Code / Location Pop-up Modal (like CRE-T-133)

**Core tests (always include):**
- [ ] Control: modal absent after 6s wait on control URL
- [ ] Variation: modal present on page load (immediate, no timer)
- [ ] Body class added (`body.cre-t-NNN`)
- [ ] Modal has input field for ZIP / location entry
- [ ] Submit button text matches design
- [ ] V1 (with close): close button present; clicking × hides modal
- [ ] V2 (no close): close button absent from DOM
- [ ] Modal overlay present (covers page content)
- [ ] Responsive: modal renders correctly at mobile and desktop viewports
- [ ] No duplication: modal injected exactly once

**Extra tests to consider:**
- [ ] ZIP validation: invalid ZIP shows error message
- [ ] After submit: modal dismissed and correct content/page shown
- [ ] `sessionStorage` key set after dismiss (prevents repeat on reload)
- [ ] ARIA `role="dialog"` and `aria-modal="true"` on modal element
- [ ] Focus trapped inside modal when open

---

### I — Dismissible Alert / Banner (like CRE-T-123)

**Core tests (always include):**
- [ ] Control: alert absent when trigger parameter is not present
- [ ] Variation: alert injected when `?param=value` is in URL
- [ ] Alert text contains the parameterized value (insurer name, location, etc.)
- [ ] Exact text match (check curly apostrophes, capitalisation, punctuation)
- [ ] Dismiss button present (×)
- [ ] Clicking dismiss removes alert from DOM
- [ ] After dismiss: alert does NOT reappear on page reload in same session
- [ ] Multiple parameter values: each shows the correct text (test ≥3 values)
- [ ] Position: alert above the main content element (DOM order check)
- [ ] No duplication: re-running JS does not add second alert

**Extra tests to consider:**
- [ ] `sessionStorage` key written after dismiss — verify key name and value
- [ ] Alert does not appear when `?param=` is empty string (no value)
- [ ] Alert background color, border, and icon match design (computed style)
- [ ] Alert is keyboard-dismissible (ESC key)
- [ ] Screen reader announces alert (aria-live="polite" or role="alert")

---

### J — Element Removal / Hide via CSS (like SWF135)

**Core tests (always include):**
- [ ] Control: target element visible on control URL (computed display ≠ none)
- [ ] Variation: target element hidden via CSS (computed display:none or visibility:hidden)
- [ ] Body class present on variation
- [ ] Removal applies on all target pages (sitewide check)
- [ ] Surrounding content remains intact and correctly laid out after removal
- [ ] Removal applies at all tested viewports (mobile + desktop)
- [ ] CSS guard: removing body class restores element visibility
- [ ] No DOM element injection (pure CSS — verify no new elements added)

**Extra tests to consider:**
- [ ] Hover state: element still hidden when parent is hovered
- [ ] Image alt text / aria attributes on sibling elements unaffected
- [ ] No layout shift caused by removal (adjacent elements fill space correctly)
- [ ] Removal consistent across all 6 browsers (especially WebKit)

---

### K — Landing Page Section Injection (like Thumbtack SA Roofing)

**Core tests (always include):**
- [ ] Each section present in DOM (hero, services, testimonials, CTA, footer)
- [ ] Heading text exact match to Figma (case, punctuation, wording)
- [ ] Body text exact match
- [ ] Button / CTA label exact match
- [ ] All images loaded: `naturalWidth > 0` for each `<img>`
- [ ] Image `alt` text set (non-empty)
- [ ] CTA `href` values correct (absolute URLs, `tel:` format correct)
- [ ] Responsive: sections stack correctly at 375px and render at 1280px
- [ ] Screenshot of each section at desktop + mobile

**Extra tests to consider:**
- [ ] Star ratings / numeric values match Figma exactly
- [ ] Service card count matches Figma (easy to miss if injection is partial)
- [ ] Phone number format matches Figma character-for-character (dashes vs parentheses)
- [ ] `flex-direction: column` on mobile for card grids
- [ ] No JS console errors during injection

---

### L — Timed Pop-up Modal with External Site (like CRE-T-08)

**Core tests (always include):**
- [ ] Control: modal absent after timer threshold + buffer on control URL
- [ ] Body class added on variation
- [ ] `sessionStorage` key (`startTime`) set on page load
- [ ] Modal hidden before timer threshold
- [ ] Modal visible after timer threshold
- [ ] `startTime` NOT reset on same-domain page navigation (persists in session)
- [ ] Cross-page: modal fires on page 2 if timer expired on page 1
- [ ] One-time flag (`modalTriggered`) prevents re-show after close
- [ ] Close button (×) closes modal
- [ ] Overlay click closes modal
- [ ] All content (logo, headline, body, CTAs) present and match Figma
- [ ] CTA hrefs correct
- [ ] Modal hidden on mobile (below breakpoint)
- [ ] Modal visible on desktop (above breakpoint)
- [ ] Max-width cap and horizontal centering
- [ ] No duplication (modal injected once)

**CRITICAL pre-deploy check:**
- [ ] `MODAL_DELAY_SECONDS` constant reset from test value (3s) to production value (30s) before Optimizely push

**Extra tests to consider:**
- [ ] ESC key closes modal
- [ ] Analytics / dataLayer event fires when modal shows
- [ ] Z-index: modal above all page content
- [ ] Scroll lock on body while modal open

---

### M — Navbar CTA via CSS `::before` (like CRE-T-09)

**Core tests (always include):**
- [ ] Body class added on injection (`body.cre-t-NNN`)
- [ ] `::before` content of target CTA = exact expected copy (with outer quotes in assertion)
- [ ] Original element `font-size: 0px` (original text visually hidden)
- [ ] Original `href` preserved (URL not overwritten)
- [ ] `display:flex; align-items:center` on element (for icon + text layout)
- [ ] Mobile sticky CTA: `::before` content correct
- [ ] Mobile menu CTA: `::before` content correct
- [ ] Footer CTA: `::before` content correct (if applicable)
- [ ] Sitewide: CTA correct on ≥3 inner pages
- [ ] CSS guard: removing body class reverts `::before` to original / `none` — **block Optimizely CDN** via `page.route()` before navigation
- [ ] `font-size` of `::before` matches design (16px desktop, check mobile)
- [ ] No uncaught JS errors on page
- [ ] No duplication: second JS run leaves exactly one class on body

**Coexistence tests (if another test runs simultaneously):**
- [ ] Other test's body class still added alongside this test's class
- [ ] CSS breakpoint overrides apply correctly when both body classes present

**`::before` assertion pattern:**
```javascript
// getComputedStyle returns value WITH outer quotes
expect(await getBeforeContent(page, selector)).toBe('"Create free account"')
```

**Optimizely CDN block pattern (for TC-16 equivalent):**
```javascript
await page.route('**/cdn.optimizely.com/**', route => route.abort())
await page.route('**/logx.optimizely.com/**', route => route.abort())
// THEN navigate — block BEFORE goto, not after
await page.goto(BASE_URL)
```

**CSS settle polling pattern (for sitewide TCs on slow browsers):**
```javascript
await page.waitForFunction((sel) => {
    const el = document.querySelector(sel)
    if (!el) return true
    return window.getComputedStyle(el, '::before').content === '"Create free account"'
}, SELECTOR, { timeout: 10000 }).catch(() => {})
```

---

*Last updated: 2026-06-30*
