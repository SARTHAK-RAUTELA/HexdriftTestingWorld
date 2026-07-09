<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 6) on 2026-07-09. -->

# AFP09 — 30-Second Timed Modal + Exit Intent

**Test file:** `my-playwright-project/testing/afp09-modal.spec.js`
**Reporter:** `my-playwright-project/afp09-reporter.js`
**Screenshots dir:** `my-playwright-project/afp09-screenshots/`
**Site:** `https://www.financialprofessionals.org` (all pages, sitewide)
**Test date:** May 2026
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css`
**Test result:** **150 passed / 30 skipped / 0 failed** across 6 browsers (180 total — 30 skipped are desktop-only TCs on mobile browsers)
**Browsers:** Chrome, Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
**Audience:** Desktop only (viewport ≥ 1024px)
**Variation class:** `cre-t-9`

### What this A/B test does

A 30-second timed modal injected via VWO onto all pages of `financialprofessionals.org`. Compared to AFP08 (15s timer), this variation:
- Fires after **30 seconds** on site (timer tracked in `sessionStorage.startTime` across navigations)
- Also fires on **exit intent** — when the mouse moves to the top of the viewport (y ≤ 50px), with a 200ms debounce
- Uses a **cookie** `exit_popup_dismissed=true` (not sessionStorage) to prevent re-fire — set after modal shows, blocks both timer and exit intent
- Blurs **`#site-header`** and **`#site-main`** (not `.mm-page` like AFP08) when modal is visible
- Second CTA ("View Program & Pricing") links to the AFP 2026 **homepage** (not `/program/overview/schedule` like AFP08)
- Desktop-only (CSS `min-width: 1024px`)

### All Test Cases (30 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | DOM | Modal HTML (`overlay`, `container`, `wrapper`, `body`, `cross`) injected |
| TC-02 | Init | `<body>` receives class `cre-t-9` on variation init |
| TC-03 | Timer | Modal NOT visible before 30 seconds |
| TC-04 | Timer | Modal VISIBLE after ≥30 seconds (desktop) |
| TC-05 | Timer | Modal stays hidden when only 15 of 30 seconds elapsed |
| TC-06 | Storage | `sessionStorage.startTime` set and valid within last 5 seconds |
| TC-07 | Navigation | `startTime` NOT reset across same-domain page nav |
| TC-08 | Navigation | Modal fires on page 2 when ≥30s total elapsed |
| TC-09 | Cookie | Modal does NOT fire when `exit_popup_dismissed=true` cookie is set |
| TC-10 | Cookie | `exit_popup_dismissed=true` written to cookie after modal shows |
| TC-11 | Exit Intent | Modal shows when mouse moves to top of viewport (y ≤ 50) — desktop only |
| TC-12 | Exit Intent | Exit intent blocked when `exit_popup_dismissed` cookie is already set |
| TC-13 | Interaction | X button closes modal (removes `cre-t-9-show-modal`) |
| TC-14 | Interaction | Overlay click at `{ x:5, y:5 }` closes modal |
| TC-15 | Duplicate | Double init does not inject a second modal |
| TC-16 | Content | AFP logo src contains "AFPLogo"; headline "Why people attend AFP 2026"; stats bar "7,000+ attendees" / "20+ networking events" / "200+ providers"; 3 feature cards; 2 CTAs; disclaimer "Save $675 before June 26"; reviewer "Cassie Wang" |
| TC-17 | Links | CTA 1 → `https://conference.financialprofessionals.org/registration` |
| TC-18 | Links | CTA 2 → `https://conference.financialprofessionals.org/` (AFP 2026 homepage — differs from AFP08) |
| TC-19 | Analytics | VWO event `afp09ModalFires` pushed to `window.VWO` on modal show |
| TC-20 | Responsive | Modal hidden at 375px mobile |
| TC-21 | Responsive | Modal hidden at 768px tablet |
| TC-22 | Responsive | Modal VISIBLE at exactly 1024px (breakpoint edge) |
| TC-23 | Sitewide | Modal injects on `/membership/` page |
| TC-24 | Sitewide | Modal injects on `/events/` page |
| TC-25 | Sitewide | Modal injects on `/career/` page |
| TC-26 | Layout | Max-width ≤987px at 1440px viewport, horizontally centered (±20px) |
| TC-27 | Layout | Max-width ≤987px at 1920px viewport, centered |
| TC-28 | Z-index | Container z-index = 9999, overlay z-index = 9998, container > overlay |
| TC-29 | Background | `#site-header` and `#site-main` get `filter: blur(...)` when modal shows |
| TC-30 | Scale | Wrapper `scale` CSS property is not null/none at short viewport heights |

### Key differences from AFP08 (AFP09 gotchas)

- **Timer is 30s, not 15s** — `setElapsed(page, 31000)` to simulate past-threshold.
- **Cookie, not sessionStorage flag** — re-fire guard uses `exit_popup_dismissed` document cookie (not `sessionStorage.modalTriggered`). Must clear it with `max-age=0` before each test.
- **Exit intent trigger** — `await page.mouse.move(700, 400)` then `await page.mouse.move(700, 30)` + `waitForTimeout(500)` to let the 200ms debounce fire.
- **Blur targets** — `#site-header` and `#site-main` (AFP08 blurred `.mm-page`). Mock HTML must include these IDs.
- **CTA 2 href** — points to AFP 2026 homepage, not the schedule page.
- **insertModal() delay** — 2s internal delay before modal DOM is injected. TC-28 and TC-30 use `waitForSelector(..., { state: 'attached' })` instead of waiting for visibility.

### Additional test cases to consider

- [ ] Cookie expiry: `exit_popup_dismissed` should expire after N days (check `max-age` or `expires` attribute)
- [ ] Exit intent: modal does NOT fire if mouse starts at top-of-page (no prior movement into page)
- [ ] Exit intent: 200ms debounce — rapid mouse movements don't multi-fire
- [ ] Cookie set by timer path also blocks exit intent (and vice versa)
- [ ] All AFP08 extras still apply (ESC key, ARIA, focus trap, etc.)


