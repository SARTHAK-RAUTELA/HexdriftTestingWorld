<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 9) on 2026-07-09. -->

# SIC-24 — Queue Page A/B Test

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


