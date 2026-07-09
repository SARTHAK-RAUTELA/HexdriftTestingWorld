<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 19) on 2026-07-09. -->

# CRE-T-08 — pay.com.au Timed Pop-up Modal

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


