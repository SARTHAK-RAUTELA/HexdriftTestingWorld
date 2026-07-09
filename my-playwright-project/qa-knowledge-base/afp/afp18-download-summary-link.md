<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 13) on 2026-07-09. -->

# AFP18 — Download One-Page Conference Summary Nav Link

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


