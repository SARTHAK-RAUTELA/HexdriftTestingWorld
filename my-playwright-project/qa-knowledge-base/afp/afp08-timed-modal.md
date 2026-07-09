<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 1) on 2026-07-09. -->

# AFP08 — Timed Modal

**Test file:** `my-playwright-project/testing/afp08-modal.spec.js`
**Site:** `conference.financialprofessionals.org`
**Test date:** May 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Test result:** All 25 TCs passed across 6 browsers
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)

### What this A/B test does

A timed modal variation injected via VWO onto the AFP 2026 Annual Conference site.
The modal fires after the visitor has spent 15 seconds on the site (timer persists in `sessionStorage` across page navigations within the same session). It is desktop-only (hidden below 1024px). Contains logo, headline, 3 feature cards, 2 CTAs, disclaimer, and a reviewer quote.

### All Test Cases

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | DOM | Modal HTML (`overlay`, `container`, `wrapper`, `body`, `cross`) injected into page body |
| TC-02 | Init | `<body>` receives class `cre-t-08` on variation init |
| TC-03 | Timer | Modal NOT visible before 15 seconds (no `cre-t-8-show-modal` class) |
| TC-04 | Timer | Modal VISIBLE after ≥15 seconds on desktop (≥1024px) |
| TC-05 | Timer | Modal stays hidden when only 8 of 15 seconds have elapsed |
| TC-06 | Storage | `sessionStorage.startTime` is set on init and within last 3 seconds |
| TC-07 | Navigation | `startTime` is NOT reset when user navigates to a second page on the same domain |
| TC-08 | Navigation | Modal fires on page 2 if ≥15s have elapsed since the first page load |
| TC-09 | Storage | Modal does NOT fire again if `sessionStorage.modalTriggered = "true"` already set |
| TC-10 | Interaction | X button (`.cre-t-8-modal-cross`) removes `cre-t-8-show-modal` and hides modal |
| TC-11 | Interaction | Overlay click (outside modal box) removes `cre-t-8-show-modal` and hides modal |
| TC-12 | Duplicate | Double init does not inject a second copy of the modal (count stays 1) |
| TC-13 | Content | All sections render: logo `src` contains "AFPLogo", headline "Why people attend AFP 2026", subtitle has "7,000+ attendees" / "20+ networking events" / "200+ providers", conference image, 3 cards, 2 CTAs, disclaimer "Save $675 before June 26", reviewer name "Cassie Wang" |
| TC-14 | Links | CTA href 1 → `/registration`, CTA href 2 → `/program/overview/schedule` |
| TC-15 | Analytics | `window.VWO` receives event `['event', 'afp08ModalFires']` when modal shows |
| TC-16 | Responsive | Modal hidden at 375px mobile (CSS `min-width: 1024px`) |
| TC-17 | Responsive | Modal hidden at 768px tablet |
| TC-18 | Responsive | Modal visible at exactly 1024px (breakpoint edge case) |
| TC-19 | Large Screen | At 1440px: modal visible, width ≤ 987px, horizontally centered (±20px tolerance) |
| TC-20 | Large Screen | At 1920px: modal visible, width ≤ 987px, horizontally centered |
| TC-21 | Large Screen | At 2440px (ultra-wide): modal visible, width ≤ 987px, centered |
| TC-22 | Scale | Wrapper `scale` CSS property is not null when viewport height < 1200px |
| TC-23 | Background | `.mm-page` receives `filter: blur(...)` when modal is shown |
| TC-24 | Z-index | Overlay z-index = 9998, container z-index = 9999, container > overlay |
| TC-25 | Width | At 1100px viewport: modal width ≤ 987px (max-width caps `calc(100% - 40px)`) |

### Issues found during development

- sessionStorage `startTime` must be set BEFORE injecting the variation — setting it after means the timer reads the wrong start point in tests.
- The overlay click test must target coordinates `{ x: 5, y: 5 }` (top-left corner of the overlay) with `force: true` because the modal container covers the center of the overlay.
- `window.getComputedStyle(el).scale` returns a string not a number in some browsers — avoid strict equality, just check it is not null.
- Edge and Safari need `channel: 'msedge'` set in the Playwright project config for Edge.

### Additional test cases to consider for future modal tests

- [ ] ESC key closes the modal (keyboard accessibility)
- [ ] Modal has correct ARIA role (`role="dialog"`) and `aria-modal="true"`
- [ ] Focus is trapped inside modal while it is open
- [ ] Tab order cycles through interactive elements inside modal
- [ ] Modal does not fire on a different domain (new tab / new session)
- [ ] Modal does not show on mobile even if JS tries to add the show-class (CSS-only guard)
- [ ] CTA links open in correct target (`_self` vs `_blank`)
- [ ] Modal animation/transition runs (check for CSS transition class or `opacity` change)
- [ ] `modalTriggered` flag is set to `"true"` in sessionStorage after modal fires
- [ ] Variation correctly handles `VWO` not being defined on page (no JS error)
- [ ] Scroll lock on body when modal is open (check `overflow: hidden` on `<body>`)
- [ ] Modal renders correctly in RTL locale
- [ ] Images inside modal have `alt` attributes (accessibility)
- [ ] All text inside modal passes color-contrast ratio (WCAG AA)


