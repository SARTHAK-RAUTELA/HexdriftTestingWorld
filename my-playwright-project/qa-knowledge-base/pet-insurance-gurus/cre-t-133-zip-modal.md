<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 15) on 2026-07-09. -->

# CRE-T-133 — Pet Insurance Gurus ZIP Code Pop-up Modal

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


