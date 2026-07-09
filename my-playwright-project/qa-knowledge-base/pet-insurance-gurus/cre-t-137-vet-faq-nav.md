<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 25) on 2026-07-09. -->

# CRE-T-137 — Pet Insurance Gurus Vet FAQ + Vet Approved Nav Link

**Test file:** `my-playwright-project/testing/cre-t-137-vet-faq.spec.js`
**Reporter:** `my-playwright-project/cre-t-137-reporter.js` *(removed — same pattern as section 24)*
**Report output:** `local_testing/Local2/cre-t-137-qa-report.html`
**Screenshots dir:** `my-playwright-project/cre-t-137-screenshots/`
**Site:** `https://petinsurancegurus.com` (FAQ accordion + main nav)
**Test date:** July 2026
**Browsers:** Chrome, Firefox, Edge, Safari + Mobile
**Variation class:** `cre-t-137`
**QA force URLs (3-way test: Control / V1 / V2):**
- Control: `?cro_mode=qa&_conv_eforce=100052380.1000256235`
- V1: `?cro_mode=qa&_conv_eforce=100052380.1000256236`
- V2: `?cro_mode=qa&_conv_eforce=100052380.1000256237`

### What this A/B test does

**Both variations (V1 + V2):**
- Inject a new **"Vets love pet insurance"** FAQ accordion item after the last existing FAQ in
  `.faq-container .oxy-pro-accordion`
- Accordion toggles open/close on click; mutually exclusive with existing FAQs
- Active/hover header color: `#0272e4` = `rgb(2, 114, 228)`

**V2 only:**
- Adds a **"Vet Approved" nav `<li>`** before the first `.oxy-site-navigation li.menu-item`
- Clicking it smooth-scrolls to the new FAQ and opens it

### All Test Cases (26 TCs)

| TC | Variation | What it tests |
|----|-----------|---------------|
| TC-01 | Control | `.cre-t-137-accordion_item` NOT injected |
| TC-02 | Control | `.cre-t-137-vetApprovedLink` NOT present |
| TC-03 | V1 | `body.cre-t-137` class added |
| TC-04 | V1 | New FAQ appended as LAST item in accordion list |
| TC-05 | V1 | FAQ question text = "Vets love pet insurance" |
| TC-06 | V1 | FAQ answer text exact match (full paragraph) |
| TC-07 | V1 | No "Vet Approved" link (V1 must NOT have it) |
| TC-08 | V1 | Accordion expands on click (`aria-expanded=true`, body visible) |
| TC-09 | V1 | Accordion collapses on second click (`aria-expanded=false`) |
| TC-10 | V1 | Mutual exclusion: opening new FAQ closes existing open FAQ |
| TC-11 | V1 | FAQ header font-family matches existing FAQ items |
| TC-12 | V1 | FAQ header active state color = `rgb(2,114,228)` |
| TC-13–15 | V1 | Visible on desktop 1280×800 / mobile 375×812 / tablet 768×1024 |
| TC-16 | V2 | `body.cre-t-137` class added |
| TC-17 | V2 | New FAQ injected as last accordion item |
| TC-18 | V2 | "Vet Approved" nav link present with correct text |
| TC-19 | V2 | "Vet Approved" cursor = pointer |
| TC-20 | V2 | "Vet Approved" hover color = `#0272E4` |
| TC-21 | V2 | Click "Vet Approved" → FAQ accordion opens (`aria-expanded=true`) |
| TC-22 | V2 | Click "Vet Approved" → FAQ positioned ≤250px from viewport top |
| TC-23 | V2 | V2 accordion direct-click expands correctly |
| TC-24 | V2 | Mutual exclusion: opening new FAQ closes existing |
| TC-25 | V2 | Vet Approved visible on desktop 1280×800 |
| TC-26 | V2 | FAQ + Vet Approved DOM-present on mobile 375×812 |

### Bugs found (pre-flight code review, before running tests)

- **BUG-01 [V2 MEDIUM]:** `scrollToEl()` uses `getBoundingClientRect().top - 100` **without adding `window.scrollY`**. Only accurate when page is at top. If user scrolls first then clicks Vet Approved again, scroll target is wrong. Fix: `var top = window.scrollY + rect.top - 100`.
- **BUG-02 [V2 LOW]:** `.cre-t-137-vetApprovedLink` `<li>` has **no inner `<a>` tag** — existing nav items are `<li><a>…</a></li>`, so site CSS targeting `li a` won't apply (font/padding/hover may not match).
- **BUG-03 [BOTH LOW]:** vB.css / hello.css declare `color:#000000` then `color:inherit` on `.cre-t-137-accordion_header` — duplicate property, second always wins.

### Issues found during development

- **Cross-test modal interference:** CRE-T-133's ZIP modal (same site) can overlay the page and intercept clicks. `dismissModals()` helper clicks `.cre-t-133-close` (V1) and force-removes `.cre-t-133-overlay` from DOM (V2 has no close button). **When testing a site with other live experiments, always dismiss/remove their overlays before interacting.**
- 3-way test (Control/V1/V2): keep per-variation describe blocks and assert V1 does NOT contain V2-only elements (TC-07) — catches wrong-variation-loaded errors.

### Additional test cases to consider

- [ ] Keyboard accessibility: FAQ toggles with Enter/Space; nav link tabbable
- [ ] `aria-controls` / unique IDs on injected accordion parts
- [ ] Smooth-scroll works after user has already scrolled (regression for BUG-01)
- [ ] Nav link renders correctly inside mobile hamburger menu


