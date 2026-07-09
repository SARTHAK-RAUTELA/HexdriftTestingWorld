<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 16) on 2026-07-09. -->

# CRE-T-123 — Pet Insurance Gurus Insurer Alert Box

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


