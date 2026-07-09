<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 17) on 2026-07-09. -->

# SWF135 — Pet Insurance Gurus Badge Overlay Removal

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


