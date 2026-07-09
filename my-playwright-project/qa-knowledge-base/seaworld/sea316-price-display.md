<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 14) on 2026-07-09. -->

# SEA316 — SeaWorld Orlando Tickets Price Display

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


