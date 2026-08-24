# QA Knowledge Base

> **Purpose:** Single reference for all A/B test and website QA automation done in this repo.
> When starting a new test: **(1)** open the client's folder and read `_client-notes.md` for site quirks,
> **(2)** look up the test TYPE in the [Test Type Index](#test-type-index-cross-client-lookup) below and read
> the matching past tests — **even if they were for a different client** (a modal is a modal: the timer/cookie/
> overlay lessons from AFP or pay.com.au apply on Pet Insurance Gurus too), **(3)** pick the matching checklist
> in [`_shared/test-type-checklists.md`](_shared/test-type-checklists.md), and **(4)** follow
> [`_shared/qa-workflow.md`](_shared/qa-workflow.md) (Figma first → code → live URL → tests → all browsers → HTML report).
>
> **A live test reported as "changes don't show"?** That's a different problem from the above — go straight to
> [`_shared/troubleshooting-changes-not-showing.md`](_shared/troubleshooting-changes-not-showing.md).

## Structure

```
qa-knowledge-base/
├── README.md                  ← this index
├── _shared/
│   ├── qa-workflow.md         ← the correct QA workflow (Figma-first)
│   ├── test-type-checklists.md← reusable checklists A–M by test type + Playwright config reference
│   └── troubleshooting-changes-not-showing.md ← debugging playbook for "it's live but doesn't show"
├── <client>/
│   ├── _client-notes.md       ← cross-test site quirks (WAF, modals, banners, platform)
│   └── <test-id>-<slug>.md    ← one file per A/B test or audit
```

Each per-test file contains: **feature description** ("What this test does"), **test scenarios / regression
checklist** (TC table — rerun it for regressions), **previous bugs** ("Bugs found"), **edge cases + future
ideas** ("Additional test cases to consider"), **lessons learned / browser & environment quirks**
("Issues found during development"), **force URLs, variation classes, report + screenshot locations**.

## Clients & Tests

| Client / Site | Platform | Tests |
|---|---|---|
| [AFP — financialprofessionals.org](afp/_client-notes.md) | VWO | [AFP08](afp/afp08-timed-modal.md) · [AFP09](afp/afp09-timed-modal-exit-intent.md) · [AFP10](afp/afp10-nav-cta-button.md) · [AFP13](afp/afp13-register-save-button.md) · [AFP15](afp/afp15-events-nav.md) · [AFP18](afp/afp18-download-summary-link.md) · [AFP19](afp/afp19-compensation-survey-hero.md) |
| [13sick / DoctorDoctor — app.13sick.com.au](13sick/_client-notes.md) | Convert.com | [SIC-19](13sick/sic19-ab-test.md) · [SIC-21](13sick/sic21-form-validation.md) · [SIC-24](13sick/sic24-queue-page.md) · [SIC-27](13sick/sic27-verify-clinic-field.md) |
| [Pet Insurance Gurus — petinsurancegurus.com](pet-insurance-gurus/_client-notes.md) | Convert.com | [SWF128](pet-insurance-gurus/swf128-filter-icon.md) · [SIC132](pet-insurance-gurus/sic132-phone-header-nav.md) · [SWF135](pet-insurance-gurus/swf135-badge-overlay.md) · [CRE-T-123](pet-insurance-gurus/cre-t-123-insurer-alert.md) · [CRE-T-133](pet-insurance-gurus/cre-t-133-zip-modal.md) · [CRE-T-137](pet-insurance-gurus/cre-t-137-vet-faq-nav.md) · [SWF139](pet-insurance-gurus/swf139-info-icon-scroll.md) · [CRE-T-144/SWF144](pet-insurance-gurus/cre-t-144-vet-faq-top.md) *(post-launch "changes don't show" bug — BUG-E, fixed & verified live 2026-07-28)* |
| [Renters Insurance Gurus — rentersinsurancegurus.com](renters-insurance-gurus/_client-notes.md) | Convert.com | [CRE-T-136](renters-insurance-gurus/cre-t-136-insurer-alert.md) *(cloned from CRE-T-123 — see clone-artifact bugs inside)* · [SWF146](renters-insurance-gurus/swf146-badge-restyle.md) *(TrustScore badge restyle, SWF135-style; variation not yet published to Convert.com at test time)* · [CRE-T-155](renters-insurance-gurus/cre-t-155-landlord-approved-faq.md) *("Landlord Approved" nav link + FAQ, equivalent to SWF144/CRE-T-144 V2; content-mismatch bug found & fixed mid-session; 490/490 across 7 browsers incl. new Tablet project)* |
| [pay.com.au](pay-com-au/_client-notes.md) | Optimizely | [CRE-T-08](pay-com-au/cre-t-08-timed-modal.md) · [CRE-T-08 (vB)](pay-com-au/cre-t-08-vB-exit-intent-mobile-timer.md) *(trigger logic was missing, now fixed via Experiment JS wiring — see BUG-01/BUG-02)* · [CRE-T-09](pay-com-au/cre-t-09-navbar-cta.md) |
| [Buckfire Law — buckfirelaw.com](buckfirelaw/_client-notes.md) | Convert.com | [BuckfireLaw_12](buckfirelaw/buckfire-12-client-stories.md) *(Client Stories video carousel, exp. 100052508; video playback + play/pause verified on all 6 browsers. Slides 4-6 copy and twice-used clip are client-confirmed intentional placeholders — real content due days after 2026-08-04. Open: keyboard a11y)* · [Internal-page testimonial card](buckfirelaw/buckfire-personal-injury-testimonial.md) *(exp. 100052509, `/case-types/personal-injury/`; matches Figma, video plays on all 6 browsers. Open: BUG-02 body class shared with 100052508, BUG-03 no keyboard path to play, BUG-01 `-Denise's` typo originating in the Figma)* |
| SeaWorld — seaworldentertainment.com | — | [SEA316](seaworld/sea316-price-display.md) |
| [Thumbtack — thumbtack.com](thumbtack/_client-notes.md) | Optimizely | [SA Roofing landing section](thumbtack/sa-roofing-landing-section.md) · [Pro_landing_page_phase_1 hero header](thumbtack/pro-landing-page-phase1-hero-header.md) *(mobile-only H1 never targeted — BUG-01)* · [Antonio Roofing vB code review](thumbtack/antonio-roofing-vb-code-review.md) *(static review, not live-verified; 5 critical incl. broken avatar URLs + page-wide `overflow:hidden`, ~15 dead CSS blocks)* |
| [WinkBeds — winkbeds.com](winkbeds/_client-notes.md) | Convert.com | [cre-t-253 Buy Box sub-total line](winkbeds/cre-t-253-buybox-subtotal.md) *(needs `navigator.webdriver` override to run Playwright — see client notes; 60/60 passing across 6 browsers; BUG-01 addon price not reflected in badge)* |
| Trakio — trakio.brillmark.com (internal app) | — | [Full app audit](trakio/trakio-full-app-audit.md) |
| Fanorate — fanorate.com | — | [Full site audit](fanorate/fanorate-site-audit.md) (scripted link/image crawl, July 3) · [UI issues audit](fanorate/fanorate-ui-audit-june2026.md) (manual visual pass, 13 pages, June 6 — separate from the site audit) |
| [Rhino Greenhouses — rhinogreenhouses.co.uk](rhino-greenhouses/_client-notes.md) | Convert.com | [SWF-T06](rhino-greenhouses/swf-t06-brochure-hero-bestsellers.md) *(brochure page hero rebuild + bestsellers AJAX swap; BUG-01 pre-existing video-never-loads site defect (control repro'd too); BUG-02 HIGH — malformed `SECTION_ID` in the deployed Convert bundle 404s the bestsellers fetch, 3/3 on Mobile Chrome/Safari/Tablet + intermittent on Firefox/Safari Desktop)* |
| [UK Radiators — ukradiators.com](ukradiators/_client-notes.md) | Convert.com | [UKRadiators-18](ukradiators/ukradiators-18-hide-banner-nav.md) *(hide summer-sale banner + header nav on magnetic towel bars lander; 15/16 passing on Chrome/Firefox/Safari/Edge; BUG-01 MEDIUM — mobile hamburger/cart icons not hidden per Figma; site has a Cloudflare-style bot-protection challenge that false-fails browsers hit in an unthrottled burst)* |

## Test Type Index (cross-client lookup)

> **Use this when starting a new test.** The client folder tells you about the *site*; this table tells you
> which past tests — on ANY client — match the *type* of thing you're building. Read both.

| Test type | Checklist | Past tests (all clients) |
|---|---|---|
| Timed / triggered pop-up modal | [A](_shared/test-type-checklists.md) + [L](_shared/test-type-checklists.md) | [AFP08](afp/afp08-timed-modal.md) (15s, sessionStorage guard) · [AFP09](afp/afp09-timed-modal-exit-intent.md) (30s + exit intent, cookie guard) · [CRE-T-08](pay-com-au/cre-t-08-timed-modal.md) (Optimizely site) · [CRE-T-08 (vB)](pay-com-au/cre-t-08-vB-exit-intent-mobile-timer.md) (desktop exit-intent + mobile 20s spec — trigger logic entirely missing from code) |
| Location / ZIP-gate pop-up modal | [H](_shared/test-type-checklists.md) | [CRE-T-133](pet-insurance-gurus/cre-t-133-zip-modal.md) (V2 has no close button!) |
| In-app flow modal (confirm/leave) | — | [SIC-24](13sick/sic24-queue-page.md) (Leave Queue modal, iframe app) |
| Dismissible alert / banner (dynamic content from URL param) | [I](_shared/test-type-checklists.md) | [CRE-T-123](pet-insurance-gurus/cre-t-123-insurer-alert.md) · [CRE-T-136](renters-insurance-gurus/cre-t-136-insurer-alert.md) (clone of 123 — clone-artifact bugs) |
| Nav CTA button injection | [D](_shared/test-type-checklists.md) | [AFP10](afp/afp10-nav-cta-button.md) · [AFP13](afp/afp13-register-save-button.md) |
| Nav CTA via CSS `::before` | [M](_shared/test-type-checklists.md) | [CRE-T-09](pay-com-au/cre-t-09-navbar-cta.md) |
| Nav link / phone injection in header | [E](_shared/test-type-checklists.md) | [SIC132](pet-insurance-gurus/sic132-phone-header-nav.md) · [CRE-T-137 V2](pet-insurance-gurus/cre-t-137-vet-faq-nav.md) |
| Nav dropdown items injection | [F](_shared/test-type-checklists.md) | [AFP15](afp/afp15-events-nav.md) · [AFP18](afp/afp18-download-summary-link.md) |
| Form field validation | [B](_shared/test-type-checklists.md) | [SIC-21](13sick/sic21-form-validation.md) · [SIC-27](13sick/sic27-verify-clinic-field.md) |
| FAQ / accordion item injection | — | [CRE-T-137](pet-insurance-gurus/cre-t-137-vet-faq-nav.md) · [CRE-T-144/SWF144](pet-insurance-gurus/cre-t-144-vet-faq-top.md) · [CRE-T-155](renters-insurance-gurus/cre-t-155-landlord-approved-faq.md) (nav-link-triggered smooth-scroll + auto-open, `scrollToEl` missing `window.scrollY` — inherited bug reproduced 3 generations running) |
| Icon / label injection near existing element | — | [SWF128](pet-insurance-gurus/swf128-filter-icon.md) · [SWF139](pet-insurance-gurus/swf139-info-icon-scroll.md) (icon click → smooth-scroll to another section) |
| Element removal / hide via CSS | [J](_shared/test-type-checklists.md) | [SWF135](pet-insurance-gurus/swf135-badge-overlay.md) |
| Score/rating badge redesign (restyle + data conversion) | — | [SWF135](pet-insurance-gurus/swf135-badge-overlay.md) (badge-alone style origin) · [SWF139](pet-insurance-gurus/swf139-info-icon-scroll.md) (icon added to same badge) · [SWF146](renters-insurance-gurus/swf146-badge-restyle.md) (ported to Renters Insurance Gurus + 10-point score doubling) |
| Price display / multi-day pricing | [G](_shared/test-type-checklists.md) | [SEA316](seaworld/sea316-price-display.md) · [WinkBeds cre-t-253](winkbeds/cre-t-253-buybox-subtotal.md) (running sub-total; site needs `navigator.webdriver` override for Playwright) |
| Hero / page section replacement | — | [AFP19](afp/afp19-compensation-survey-hero.md) · [Thumbtack Pro hero header](thumbtack/pro-landing-page-phase1-hero-header.md) (2 separate desktop/mobile `<h1>` elements — variation only targeted one) |
| Landing page section injection | [K](_shared/test-type-checklists.md) | [Thumbtack SA Roofing](thumbtack/sa-roofing-landing-section.md) |
| AJAX section fetch/swap (fetch another page's rendered `?section_id=` HTML, inject client-side) | — | [Rhino SWF-T06](rhino-greenhouses/swf-t06-brochure-hero-bestsellers.md) (malformed `SECTION_ID` in the deployed bundle 404s the fetch — reliably on mobile/tablet, intermittently on desktop; always verify the fetch resolves with real content on every device tier) |
| Full app / website audit | [C](_shared/test-type-checklists.md) | [Trakio](trakio/trakio-full-app-audit.md) · [Fanorate](fanorate/fanorate-site-audit.md) |

**Adding a new test?** Add it to BOTH tables: the client row above and its test-type row here (create a new type row if none fits — and add a matching checklist in `_shared/test-type-checklists.md`).

## Deleted source files (July 9, 2026; second pass August 14, 2026)

All spec files (`testing/*.spec.js`), custom reporters (`*-reporter.js`), fanorate scripts, and raw screenshot
folders were **deleted after being documented here**. Generated HTML reports (screenshots embedded) live in
`local_testing/Local2/`. Recover any deleted file from git history (commit `ceb8b12` or later). The reusable
custom-reporter pattern is preserved in
[renters-insurance-gurus/cre-t-136-insurer-alert.md](renters-insurance-gurus/cre-t-136-insurer-alert.md).

A second cleanup pass (2026-08-14) removed everything that had accumulated since and was already fully written
up here: the AFP21, Buckfire (both tests), CRE-T-144, CRE-T-155, SWF139, SWF146, SWF151 (original build only —
see below), Thumbtack, WIN257, and Fanorate spec files/screenshot folders/data files, plus the six WIN257
SESSION 4 run logs (`run-chrome*.log`, `run-firefox.log`, `run-mobilesafari.log`) whose results are captured in
[winkbeds/win257-cart-modal-checkout-upgrade.md](winkbeds/win257-cart-modal-checkout-upgrade.md). Recover from
git history at or before commit `2490532`.

**Not deleted:** `testing/swf151-new-build.spec.js` — this is the in-progress SWF151 sort-feature *rebuild*
(against `local_testing/swf151-new-code/`, not yet in the Convert experiment). It has no completed run results
yet, and [pet-insurance-gurus/swf151-sort-order.md](pet-insurance-gurus/swf151-sort-order.md) still documents
the OLD build (wrong selectors for the rebuild) — that KB entry needs a rewrite once the rebuild is verified
live, not before.

A third cleanup pass (2026-08-21) removed 10 more `local_testing/Local2/*.html` reports whose findings were
confirmed already captured here: `swf151-qa-report.html`, `buckfire-12-qa-report.html`,
`buckfire-personal-injury-qa-report.html`, `afp21-membership-redesign-qa-report.html`,
`afp21-vb-code-review-report.html` (both folded into
[afp/afp21-membership-page-redesign.md](afp/afp21-membership-page-redesign.md) §9), `winkbeds-win257-qa-report.html`,
`cre-t-155-landlord-approved-faq-qa-report.html`, and `rhino-t06-qa-report.html`. Two more were found to
document audits that had **no** existing KB record and were written up fresh before deletion:
`fanorate-ui-report.html` (13-page manual UI critique, 67 issues → new
[fanorate/fanorate-ui-audit-june2026.md](fanorate/fanorate-ui-audit-june2026.md), distinct from the existing
scripted `fanorate-site-audit.md`) and `code-review-vB.html` (Thumbtack "Antonio Roofing" vB.js/vB.css static
code review → new [thumbtack/antonio-roofing-vb-code-review.md](thumbtack/antonio-roofing-vb-code-review.md)).
Recover any of the 10 from git history at or before commit `66bfb06`. **Not touched:** `h.html` in the same
folder — it's an unrelated game file (Stickman Brawl), not a QA report.

## Conventions

- One file per test, named `<test-id>-<short-slug>.md`, inside the client's folder.
- New client → new folder + `_client-notes.md` (platform, force-URL pattern, site quirks).
- After finishing a test: add its file, update the client's `_client-notes.md` if a new site-wide quirk was found, and add a row to the table above.
- `_shared/` files are cross-client: update the checklist file when a new test *type* appears.

*Last updated: 2026-08-21*
