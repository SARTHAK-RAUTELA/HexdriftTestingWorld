# MY QA Playwright Process

How I QA A/B tests and features end-to-end — from requirement to delivery — combining manual QA, goal verification, and Playwright automation (run in VS Code with Claude). This document is for the QA team so everyone can follow the same process.

---

## My QA Workflow at a Glance

```
Check Requirement → Understand Test Logic → Clarify with Developer/Client (if needed)
→ Manual QA → Goal Checking ∥ Playwright Automation QA (in parallel) → Deliver
```

1. **Check the requirement** — read the ticket, Figma design, and hypothesis carefully before touching anything.
2. **Understand the test logic** — what the variation changes, where it fires, which audiences/pages it targets.
3. **Ask when unclear** — if any part of the requirement or logic is ambiguous, ask the developer or client *before* starting. Never QA on assumptions.
4. **Manual QA** — once everything is clear, test the feature by hand like a real user (see Step 2 below).
5. **Goal checking** — verify the custom conversion goals fire correctly, across browsers (see Step 3).
6. **Automation QA with Playwright** — run in parallel with goal checking, using Claude in VS Code to write and execute the tests (see Step 4).
7. **Deliver** — HTML report with screenshots, bugs, and results.

---

## Step 1 — Understand the Feature

Before writing a single test case, answer these questions:

- **Who is the user?** New visitor, returning visitor, logged-in user, mobile vs desktop?
- **What is the expected workflow?** The happy path from entry to conversion.
- **What can go wrong?** Failure points, race conditions, third-party script conflicts, edge cases.
- **What are the business rules?** When should the change show/hide, which pages, which audiences, cookie/session behavior.
- **What validations exist?** Form validation rules, required fields, input formats, error states.

If any answer is unclear → back to the developer or client for clarification first.

## Step 2 — Manual QA (Explore Like a Real User)

Test manually based on experience: think about what can go wrong and what a normal user would actually do — not just the scripted happy path. Real users do unexpected things; so should QA.

Examples of real-user exploration:

- Random clicking
- Fast clicking (double/triple clicks on CTAs)
- Slow clicking
- Keyboard navigation
- Tab order
- Copy/paste values into inputs
- Browser autofill
- Browser back
- Browser refresh
- Browser forward
- Open multiple tabs
- Duplicate submission (submit twice)
- Resize the browser window
- Zoom 80%
- Zoom 200%
- Dark mode
- Light mode

The goal is to break the feature the way a real user accidentally would, before a real user does.

## Step 3 — Goal Checking

When all manual testing is done, verify the tracking:

- List every **custom goal** configured for the test (e.g. modal shown, input focused, submit clicked, valid value entered, dismissed).
- Trigger each goal manually and confirm it fires in the testing platform (Convert.com / Optimizely / VWO).
- Check goals **per browser** — a goal that fires in Chrome can silently fail in Safari or Firefox.
- Confirm goals fire on the correct variation only, and don't double-fire.

## Step 4 — Playwright Verification (runs in parallel with Step 3)

Run this **side by side with goal checking** to save time: while I'm verifying goals manually, Claude runs the Playwright suite in VS Code. Neither step blocks the other.

Playwright verifies:

- Forms
- Login
- Registration
- Checkout
- Dashboard
- CRUD operations
- Search
- Filters
- Tables
- Pagination
- Export
- Import
- Upload
- Permissions
- Responsive layouts

Playwright is the **final verification layer before release** — every assertion runs against both the **variation and the control**, comparing them so the change (and only the change) is present.

---

## QA Knowledge Base (Most Important Practice)

One of the biggest productivity improvements is maintaining a **reusable QA knowledge base**. It turns every test into compounding knowledge instead of throwaway work — the next test on the same site starts from everything already learned.

For every client or project, maintain a dedicated Markdown (`.md`) file containing:

- Feature descriptions
- Test scenarios
- Previous bugs
- Regression checklist
- Edge cases
- A/B test observations
- Feature flag behavior
- Environment-specific issues
- Browser-specific issues
- API quirks
- Validation rules
- Screenshots (links if needed)
- Known limitations
- Lessons learned

Update it after **every** QA cycle — a bug found once should never surprise the team twice. My knowledge base lives at `my-playwright-project/QA_KNOWLEDGE_BASE.md`.

---

# The Playwright Process in Detail

My end-to-end process for QA'ing A/B tests (Convert.com / Optimizely / VWO) with Playwright automation and HTML reporting.

---

## Workflow Order (non-negotiable)

Always follow this exact order for every A/B test QA:

```
Figma design → variation/control code → live/preview URL → write tests → run 6 browsers → HTML report with screenshots
```

1. **Read the Figma/design PNG first.** Extract every expected value: button text (exact casing), colors, layout, URLs, breakpoints.
2. **Read the variation/control JS/CSS code.** Compare every value against Figma. Flag every mismatch as a bug **before** writing tests.
3. **Open the live/preview URL** (force/preview link) in a browser and confirm the rendered output matches Figma.
4. **Write Playwright tests asserting the Figma-specified values** — if the code is wrong, tests must fail, not pass. Never write assertions by copying values out of the code.
5. **Run across all 6 browsers** — never fewer:
   - Chrome Desktop
   - Firefox Desktop
   - Edge Desktop (`msedge` channel)
   - Safari Desktop (WebKit)
   - Mobile Chrome (Pixel 5)
   - Mobile Safari (iPhone 12)
6. **Generate the HTML report** with embedded screenshots per test and full error traces for failures.

> **Why this order matters:** In AFP10, the control code had stale button text ("Register for FP&A Forum" instead of "REGISTER FOR AFP 2026" per Figma). Tests were written by reading the code first, so they asserted what the code already contained and passed silently. Reading Figma first makes the tests catch the mismatch.

> **Known-bug exception:** If a code bug is already reported to the dev and won't be fixed before the QA run (e.g. CRE-T-136 BUG-01 copy issue), tests assert the *actual* code behavior so failures indicate regressions — but the bug is still documented in the report's Bugs section.

---

## Project Layout

| Item | Location |
|---|---|
| Playwright project | `my-playwright-project/` |
| Test specs | `my-playwright-project/testing/<ticket>-<slug>.spec.js` |
| Custom reporters | `my-playwright-project/<ticket>-reporter.js` |
| HTML reports | `local_testing/Local2/<ticket>-qa-report.html` |
| Variation files | `local_testing/Local2/variation/vB.js` + `vB.css` (V2: `js.js` + `hello.css`) |
| Screenshots | `my-playwright-project/<ticket>-screenshots/` |
| Knowledge base | `my-playwright-project/QA_KNOWLEDGE_BASE.md` |

## Playwright Config

**Location:** `my-playwright-project/playwright.config.js`

- **Workers:** 1 (sequential — avoids WAF/CDN rate-limiting)
- **Timeouts:** 90s per test · 45s navigation · 20s action (WebKit sometimes needs 30s on heavy pages)
- **Run command:**

```bash
cd my-playwright-project
npx playwright test testing/<spec-file>.spec.js
```

(Omit `--reporter=list` to include all config reporters, including the custom HTML reporter.)

---

## HTML QA Report Format Standard

Every report must include, in order:

1. **Cover / Header** — project name, ticket ID, date, tester, environment URLs (Control + Variation)
2. **KPI Summary Cards** — Total TCs, Passed, Failed, Skipped as large-number cards
3. **Table of Contents** — anchored links to each section
4. **Test Environment Info** — browser matrix table, OS, viewport sizes
5. **Per-Browser Result Matrix** — combined matrix with browser columns
6. **Per-TC rows** — TC ID + description, Pass/Fail/Skip badge per browser, duration, inline screenshot for failures, full error message
7. **Bugs / Issues Found** — description, severity, browser(s), screenshot reference
8. **Figma vs Actual Comparison** — when visual discrepancies exist
9. **Footer** — tester name, date, Playwright version

**Screenshot rule:** failing tests MUST have a screenshot; passing tests get at least one representative screenshot per browser. Embed as base64 `<img>` tags.

---

## Reusable Playwright Patterns

### Block Optimizely CDN (CSS scoping guard tests)

```js
await page.route('**/cdn.optimizely.com/**', route => route.abort());
await page.route('**/logx.optimizely.com/**', route => route.abort());
// then navigate — live CDN may otherwise inject its own CSS independently
```

### Verify CSS `::before` pseudo-element content

```js
async function getBeforeContent(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return window.getComputedStyle(el, '::before').content;
  }, selector);
}
// Returns value with quotes, e.g. '"Create free account"'
// expect(content).toBe(`"${EXPECTED_COPY}"`);
```

### Wait for CSS to settle (Edge/Safari injection latency)

```js
await page.waitForFunction((sel) => {
  const el = document.querySelector(sel);
  if (!el) return true;
  return window.getComputedStyle(el, '::before').content === '"Expected text"';
}, SELECTOR, { timeout: 10000 }).catch(() => {});
```

### CSP workaround — inject CSS via `page.evaluate`, not `addStyleTag`

```js
// Sites with FingerprintJS CSP (e.g. SeaWorld) throw on addStyleTag in WebKit
await page.evaluate((css) => {
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}, cssString);
```

### Pre-set cookie to suppress interfering modals (Pet Insurance Gurus)

```js
// BEFORE navigating to any petinsurancegurus.com page — CRE-T-133 V2 modal
// has NO close button and blocks all pointer events once shown.
await page.context().addCookies([{
  name: 'cre-t-133-seen',   // verify exact cookie name in vB.js
  value: '1',
  domain: 'petinsurancegurus.com',
  path: '/',
}]);
```

### Firefox headless double-injection guard

- Convert.com `init()` can fire twice within 1000ms in headless Firefox → duplicate overlays.
- Dedup guard must be **inside** the `setTimeout`, or add `if (document.querySelector('.overlay-class')) return;` at the top of `init()`.
- Test-side fixes: `.first()` on strict locators, `{ force: true }` on clicks, `page.evaluate()` form dispatch instead of clicking a `type="submit"` button.

### Safari/WebKit quirks

- `dispatchEvent` needs `{ bubbles: true }` for mousedown to register.
- Color assertions can fail on exact RGB (P3 rendering): e.g. `rgb(48,139,233)` vs expected `rgb(53,142,233)`. Headless Firefox has the same precision issue. Use tolerance, or document as a rendering difference (not a code bug).
- `setViewportSize()` inside a Mobile Safari project can break variation injection — don't override device viewports.

### Convert.com rate-limiting

- Mobile browsers hit intermittent rate-limiting when tests run at scale — keep workers at 1.
- Prefer `/compare/` over the homepage as the primary URL on Pet Insurance Gurus — more reliable injection across all browsers.

### Scroll assertions

- `scrollToEl()`-style code must include `window.scrollY` (getBoundingClientRect is viewport-relative).
- Allow ~300px threshold on smooth-scroll landing position (Firefox/Safari land ~250–253px).

---

## Pre-Deploy Checklist

- [ ] All QA-only shortcuts reverted (e.g. `MODAL_DELAY_SECONDS` 3 → 30 in CRE-T-08)
- [ ] All Figma-vs-code mismatches either fixed or reported as bugs
- [ ] Copy-paste artifacts from cloned tests checked (class prefixes, `window.<flag>` guard names, fallback values — see CRE-T-136 bugs)
- [ ] Report generated with screenshots and saved to `local_testing/Local2/`
- [ ] Failures triaged: code bug vs environment noise (rate-limiting, rendering precision, transient timeouts) — each labeled in the report
