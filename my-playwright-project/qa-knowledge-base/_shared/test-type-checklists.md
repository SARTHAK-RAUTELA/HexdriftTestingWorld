<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 23) on 2026-07-09. -->

# Test Type Checklists

Use these when starting a new test of a familiar category.

---

### A — Timed / Triggered Modal (like AFP08)

**Core tests (always include):**
- [ ] Modal DOM injected exactly once (no duplicates on double init)
- [ ] Body gets variation identifier class
- [ ] Timer: modal hidden before threshold, visible after threshold
- [ ] Partial elapsed time: modal still hidden midway through timer
- [ ] SessionStorage `startTime` set and value is valid
- [ ] `startTime` NOT reset on same-domain page navigation
- [ ] Modal fires on page 2 if timer expired since page 1
- [ ] One-time flag (`modalTriggered`) prevents re-fire
- [ ] X button closes modal
- [ ] Overlay click closes modal
- [ ] All content sections render (logo, headline, body, CTAs)
- [ ] CTA hrefs are correct
- [ ] Analytics event fires when modal shows
- [ ] Responsive: hidden on mobile/tablet, visible on desktop
- [ ] Large screens: max-width capped, modal horizontally centered

**Extra tests to consider:**
- [ ] ESC key closes modal
- [ ] ARIA `role="dialog"` and `aria-modal="true"` present
- [ ] Focus trap inside modal
- [ ] Scroll lock on body while modal open
- [ ] `modalTriggered` written to storage after first fire
- [ ] Z-index stacking correct (container > overlay > page)
- [ ] Background blur/dim applied to page content
- [ ] No JS console errors on any browser

---

### B — Form Field Validation (like SIC-21)

**Core tests (always include):**
- [ ] Clicking submit/next with empty required field triggers error state
- [ ] Error class added to input element
- [ ] Label / error message color changes to red (`rgb(234, 72, 72)` or brand red)
- [ ] Border color changes to red
- [ ] Error text/message is present and descriptive
- [ ] Error clears when user fills the field
- [ ] Correct fields shown/hidden per variation
- [ ] Label text matches design
- [ ] Placeholder text matches design
- [ ] Hint text present (if applicable)
- [ ] Pre-selected / hidden form controls work correctly
- [ ] Conversion / analytics event fires on valid completion
- [ ] Cross-browser: same behavior on Chrome, Firefox, Edge, Safari
- [ ] Mobile: same behavior on Pixel 5, iPhone 12

**Extra tests to consider:**
- [ ] Error does not trigger on partially-filled optional fields
- [ ] Multiple empty fields: all show errors simultaneously
- [ ] Keyboard Enter triggers same validation as button click
- [ ] Screen reader announces error (aria-live region or aria-describedby)
- [ ] Error persists on re-click if still empty (does not flicker)
- [ ] Field error state does not carry over after browser back + forward navigation
- [ ] Conversion fires only once per completion (not on repeat clicks)

---

### D — Navigation CTA Button (like AFP10)

**Core tests (always include):**
- [ ] Body gets variation identifier class on init
- [ ] Button injected exactly once (no duplicates on double init / console re-run)
- [ ] Button inserted in correct DOM position (before/after target element)
- [ ] Button text content matches design
- [ ] Button background color correct (computed style, not just class)
- [ ] Button href points to correct URL
- [ ] Sitewide: button appears on homepage AND at least one inner page
- [ ] Duplicate-init guard: calling init twice leaves exactly 1 button
- [ ] Responsive: button hidden below breakpoint, visible above breakpoint

**Extra tests to consider:**
- [ ] Two-line variation: both spans present, correct text in each
- [ ] Two-line variation: `flex-direction: column` confirmed via computed style
- [ ] Hover state changes button appearance
- [ ] Button keyboard-accessible (tab-focusable, visible focus ring)
- [ ] Analytics event fires on button click
- [ ] Correct behavior in logged-in vs logged-out header states (if both navs exist)
- [ ] Text does not overflow at narrow desktop widths just above the breakpoint
- [ ] CTA opens in same tab / new tab per design intent

---

### E — Header Nav Phone / Link Injection (like SIC132)

**Core tests (always include):**
- [ ] Control: injected element absent on control URL (wait at least 6s before asserting)
- [ ] Variation: element injected exactly once on each target page
- [ ] Sitewide: all target URLs (/, /home/, etc.) each inject the element once
- [ ] Duplicate-init guard: second JS execution leaves exactly 1 element
- [ ] Phone link text is exactly correct (character-for-character match)
- [ ] Phone link `href` is `tel:+1XXXXXXXXXX` (no spaces, no dashes)
- [ ] Phone icon CDN `src` matches expected filename; `alt` attribute set
- [ ] Body class (`cre-t-NNN`) added on variation init
- [ ] Contact / adjacent link hidden at narrow breakpoint (CSS display:none check via computed style)
- [ ] Contact / adjacent link visible just above the breakpoint
- [ ] Phone still visible at narrow breakpoint (not hidden along with Contact)
- [ ] Desktop: font-size, icon width, gap match CSS spec (computed style)
- [ ] Mobile breakpoint: font-size, icon width, gap match mobile CSS spec (computed style)
- [ ] Hover color changes to the specified hover value (desktop browsers)
- [ ] Responsive: phone visible at Desktop / Tablet / Mobile viewports

**Extra tests to consider:**
- [ ] Icon `naturalWidth > 0` (image actually loaded — not broken)
- [ ] Phone number does not wrap to second line at any viewport in the "show" range
- [ ] Phone link font-weight and line-height match CSS spec
- [ ] On touch devices: tap opens native phone dialer (manual device test only)
- [ ] Adjacent nav spacing / margin correct after injection (no layout shift)
- [ ] Hover color test on Mobile Safari/WebKit may produce a slightly different RGB due to P3 color normalization — this is a known platform artifact, not a code defect

---

### F — Nav Dropdown Link Injection (like AFP18)

**Core tests (always include):**
- [ ] Control: injected link absent on control URL (wait 6s before asserting)
- [ ] Variation: link injected on variation URL (wait with `waitForSelector`, not fixed timeout)
- [ ] Link text exactly matches design spec (character-for-character)
- [ ] Link `href` points to correct URL / PDF / asset
- [ ] `target="_blank"` present if design says "open in new tab"
- [ ] Asset URL returns HTTP 200 + correct content-type (TC-06 pattern)
- [ ] No duplication: re-running variation JS via `page.evaluate()` does not add a second link
- [ ] Position: new `<li>` is `nextElementSibling` of the intended anchor element (DOM adjacency check)
- [ ] Body class added for variation scoping and dedup guard
- [ ] Link visible in dropdown when dropdown is open (visibility test at desktop viewport)
- [ ] Link hidden below breakpoint (CSS computed `display:none` at mobile viewport)
- [ ] CSS classes on both `<a>` and `<li>` — both nav class AND variation class present
- [ ] Sitewide: link injected on all target pages (not just homepage)
- [ ] Navbar-clipped screenshot taken after dropdown opened (top ~520px clip)

**Extra tests to consider:**
- [ ] Polling threshold: if JS polls for N instances before injecting, verify it works when exactly N exist
- [ ] `data-analytics` / `data-feathr-*` attributes match surrounding nav items (for platform tracking continuity)
- [ ] `rel="noopener noreferrer"` on `target="_blank"` links (security)
- [ ] Link is keyboard-focusable within the dropdown (tab order)
- [ ] Hover color inherits correctly from sibling nav links (computed style)
- [ ] On pages where the dropdown target element doesn't exist (e.g. different nav structure), no JS error thrown
- [ ] Variation does not duplicate on same-session back/forward navigation

---

### C — App Page Audit (like Trakio)

**Core tests (always include):**
- [ ] Each sidebar/nav link loads a valid page (no 404s)
- [ ] Page title is correct
- [ ] Core data table / list renders with data (not empty when data exists)
- [ ] Summary / KPI stats match detail data on same page
- [ ] Stats on page A match same stats on page B (cross-page consistency)
- [ ] Skeleton loaders resolve within 3 seconds
- [ ] Auth-protected pages redirect unauthenticated users to login
- [ ] Logout works and clears session
- [ ] Screenshot of each page captured for visual record

**Extra tests to consider:**
- [ ] 404 page uses custom app layout (not bare framework default)
- [ ] Pagination loads next page correctly
- [ ] Search / filter updates displayed results
- [ ] Mobile: sidebar collapses, content stacks, tables scroll horizontally
- [ ] Forms on settings pages: current values pre-populated on load
- [ ] Actions (create, update, delete) reflect in the list immediately
- [ ] Empty states show a helpful message (not just a blank page)
- [ ] Error states (network fail) show user-friendly message
- [ ] Role-based access: actions hidden/shown correctly per user role

---

## Playwright Config Reference

**Location:** `my-playwright-project/playwright.config.js`

```
workers: 1          — sequential, avoids WAF rate-limiting on 13sick
timeout: 90000      — 90s per test
retries: 1
headless: true
viewport: 1280×800  — default desktop
navigationTimeout: 45000
actionTimeout: 20000
screenshot: only-on-failure
```

**6 browser projects:**
1. Chrome Desktop (`Desktop Chrome`)
2. Firefox Desktop (`Desktop Firefox`)
3. Edge Desktop (`Desktop Edge` + `channel: 'msedge'`)
4. Safari Desktop (`Desktop Safari`)
5. Mobile Chrome — Pixel 5 (`Pixel 5`)
6. Mobile Safari — iPhone 12 (`iPhone 12`)

**Run a specific test file:**
```
cd my-playwright-project
npx playwright test sic-21        ← runs sic-21.spec.js across all 6 browsers
npx playwright test afp08-modal   ← runs afp08-modal.spec.js
npx playwright test --project="Chrome Desktop"   ← single browser
```

---

### G — Price Display / Multi-day Pricing (like SEA316)

**Core tests (always include):**
- [ ] Control: no variation markup in DOM on control URL
- [ ] Body gets variation identifier class on init
- [ ] `/ea` or per-unit label injected and visible
- [ ] Per-day / per-person breakdown element present
- [ ] Price values match Figma spec (do not assert live pricing — it changes)
- [ ] Layout: flex direction, alignment, spacing correct (computed style)
- [ ] Responsive: layout correct at 375px, 768px, 1024px, 1440px
- [ ] Inner pages: variation active on all targeted ticket/pricing pages
- [ ] CSS guard: removing body class reverts price display to control
- [ ] No duplication: re-running JS does not add extra price elements

**Extra tests to consider:**
- [ ] Price element ordering (e.g. per-day BEFORE total, not after)
- [ ] Currency symbol format and locale ($ vs USD vs au$)
- [ ] Price elements accessible to screen readers (aria-label or visible text)
- [ ] CSP check: if `addStyleTag({ content: ... })` throws, switch to `{ path: ... }` (SeaWorld pattern)

---

### H — ZIP Code / Location Pop-up Modal (like CRE-T-133)

**Core tests (always include):**
- [ ] Control: modal absent after 6s wait on control URL
- [ ] Variation: modal present on page load (immediate, no timer)
- [ ] Body class added (`body.cre-t-NNN`)
- [ ] Modal has input field for ZIP / location entry
- [ ] Submit button text matches design
- [ ] V1 (with close): close button present; clicking × hides modal
- [ ] V2 (no close): close button absent from DOM
- [ ] Modal overlay present (covers page content)
- [ ] Responsive: modal renders correctly at mobile and desktop viewports
- [ ] No duplication: modal injected exactly once

**Extra tests to consider:**
- [ ] ZIP validation: invalid ZIP shows error message
- [ ] After submit: modal dismissed and correct content/page shown
- [ ] `sessionStorage` key set after dismiss (prevents repeat on reload)
- [ ] ARIA `role="dialog"` and `aria-modal="true"` on modal element
- [ ] Focus trapped inside modal when open

---

### I — Dismissible Alert / Banner (like CRE-T-123)

**Core tests (always include):**
- [ ] Control: alert absent when trigger parameter is not present
- [ ] Variation: alert injected when `?param=value` is in URL
- [ ] Alert text contains the parameterized value (insurer name, location, etc.)
- [ ] Exact text match (check curly apostrophes, capitalisation, punctuation)
- [ ] Dismiss button present (×)
- [ ] Clicking dismiss removes alert from DOM
- [ ] After dismiss: alert does NOT reappear on page reload in same session
- [ ] Multiple parameter values: each shows the correct text (test ≥3 values)
- [ ] Position: alert above the main content element (DOM order check)
- [ ] No duplication: re-running JS does not add second alert

**Extra tests to consider:**
- [ ] `sessionStorage` key written after dismiss — verify key name and value
- [ ] Alert does not appear when `?param=` is empty string (no value)
- [ ] Alert background color, border, and icon match design (computed style)
- [ ] Alert is keyboard-dismissible (ESC key)
- [ ] Screen reader announces alert (aria-live="polite" or role="alert")

---

### J — Element Removal / Hide via CSS (like SWF135)

**Core tests (always include):**
- [ ] Control: target element visible on control URL (computed display ≠ none)
- [ ] Variation: target element hidden via CSS (computed display:none or visibility:hidden)
- [ ] Body class present on variation
- [ ] Removal applies on all target pages (sitewide check)
- [ ] Surrounding content remains intact and correctly laid out after removal
- [ ] Removal applies at all tested viewports (mobile + desktop)
- [ ] CSS guard: removing body class restores element visibility
- [ ] No DOM element injection (pure CSS — verify no new elements added)

**Extra tests to consider:**
- [ ] Hover state: element still hidden when parent is hovered
- [ ] Image alt text / aria attributes on sibling elements unaffected
- [ ] No layout shift caused by removal (adjacent elements fill space correctly)
- [ ] Removal consistent across all 6 browsers (especially WebKit)

---

### K — Landing Page Section Injection (like Thumbtack SA Roofing)

**Core tests (always include):**
- [ ] Each section present in DOM (hero, services, testimonials, CTA, footer)
- [ ] Heading text exact match to Figma (case, punctuation, wording)
- [ ] Body text exact match
- [ ] Button / CTA label exact match
- [ ] All images loaded: `naturalWidth > 0` for each `<img>`
- [ ] Image `alt` text set (non-empty)
- [ ] CTA `href` values correct (absolute URLs, `tel:` format correct)
- [ ] Responsive: sections stack correctly at 375px and render at 1280px
- [ ] Screenshot of each section at desktop + mobile

**Extra tests to consider:**
- [ ] Star ratings / numeric values match Figma exactly
- [ ] Service card count matches Figma (easy to miss if injection is partial)
- [ ] Phone number format matches Figma character-for-character (dashes vs parentheses)
- [ ] `flex-direction: column` on mobile for card grids
- [ ] No JS console errors during injection

---

### L — Timed Pop-up Modal with External Site (like CRE-T-08)

**Core tests (always include):**
- [ ] Control: modal absent after timer threshold + buffer on control URL
- [ ] Body class added on variation
- [ ] `sessionStorage` key (`startTime`) set on page load
- [ ] Modal hidden before timer threshold
- [ ] Modal visible after timer threshold
- [ ] `startTime` NOT reset on same-domain page navigation (persists in session)
- [ ] Cross-page: modal fires on page 2 if timer expired on page 1
- [ ] One-time flag (`modalTriggered`) prevents re-show after close
- [ ] Close button (×) closes modal
- [ ] Overlay click closes modal
- [ ] All content (logo, headline, body, CTAs) present and match Figma
- [ ] CTA hrefs correct
- [ ] Modal hidden on mobile (below breakpoint)
- [ ] Modal visible on desktop (above breakpoint)
- [ ] Max-width cap and horizontal centering
- [ ] No duplication (modal injected once)

**CRITICAL pre-deploy check:**
- [ ] `MODAL_DELAY_SECONDS` constant reset from test value (3s) to production value (30s) before Optimizely push

**Extra tests to consider:**
- [ ] ESC key closes modal
- [ ] Analytics / dataLayer event fires when modal shows
- [ ] Z-index: modal above all page content
- [ ] Scroll lock on body while modal open

---

### M — Navbar CTA via CSS `::before` (like CRE-T-09)

**Core tests (always include):**
- [ ] Body class added on injection (`body.cre-t-NNN`)
- [ ] `::before` content of target CTA = exact expected copy (with outer quotes in assertion)
- [ ] Original element `font-size: 0px` (original text visually hidden)
- [ ] Original `href` preserved (URL not overwritten)
- [ ] `display:flex; align-items:center` on element (for icon + text layout)
- [ ] Mobile sticky CTA: `::before` content correct
- [ ] Mobile menu CTA: `::before` content correct
- [ ] Footer CTA: `::before` content correct (if applicable)
- [ ] Sitewide: CTA correct on ≥3 inner pages
- [ ] CSS guard: removing body class reverts `::before` to original / `none` — **block Optimizely CDN** via `page.route()` before navigation
- [ ] `font-size` of `::before` matches design (16px desktop, check mobile)
- [ ] No uncaught JS errors on page
- [ ] No duplication: second JS run leaves exactly one class on body

**Coexistence tests (if another test runs simultaneously):**
- [ ] Other test's body class still added alongside this test's class
- [ ] CSS breakpoint overrides apply correctly when both body classes present

**`::before` assertion pattern:**
```javascript
// getComputedStyle returns value WITH outer quotes
expect(await getBeforeContent(page, selector)).toBe('"Create free account"')
```

**Optimizely CDN block pattern (for TC-16 equivalent):**
```javascript
await page.route('**/cdn.optimizely.com/**', route => route.abort())
await page.route('**/logx.optimizely.com/**', route => route.abort())
// THEN navigate — block BEFORE goto, not after
await page.goto(BASE_URL)
```

**CSS settle polling pattern (for sitewide TCs on slow browsers):**
```javascript
await page.waitForFunction((sel) => {
    const el = document.querySelector(sel)
    if (!el) return true
    return window.getComputedStyle(el, '::before').content === '"Create free account"'
}, SELECTOR, { timeout: 10000 }).catch(() => {})
```


