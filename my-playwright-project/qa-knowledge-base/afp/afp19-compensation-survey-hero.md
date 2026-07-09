<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 21) on 2026-07-09. -->

# AFP19 — AFP Compensation Survey Hero Section

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


