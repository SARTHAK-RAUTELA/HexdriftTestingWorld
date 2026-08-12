# CRE-T-155 — Renters Insurance Gurus "Landlord Approved" Nav Link + Top-of-List FAQ

**Test file:** `my-playwright-project/testing/cre-t-155-landlord-approved-faq.spec.js`
**Screenshot spec:** `my-playwright-project/testing/cre-t-155-screenshots.spec.js` (screenshots-only, not part of the pass/fail suite — same pattern as `swf151-screenshots.spec.js`)
**Report:** `local_testing/Local2/cre-t-155-landlord-approved-faq-qa-report.html`
**Screenshots dir:** `my-playwright-project/cre-t-155-screenshots/`
**Site:** `https://rentersinsurancegurus.com` — `/`, `/comparison/`, `/california/`
**Test date:** August 2026
**Browsers:** Chrome, Firefox, Edge, Safari Desktop + Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12) + **Tablet (iPad Gen 7)** — 7 projects total (Tablet project newly added to `playwright.config.js` for this test)
**Variation class:** `cre-t-155` · Convert experiment `100052625` (control `...824`, variation `...825`)
**Result:** 490/490 passed (70 TCs × 7 browsers), zero failures on any browser

### What this A/B test does

Equivalent to V2 of SWF144/CRE-T-144 (Pet Insurance Gurus), ported to Renters Insurance Gurus. Adds a
**"Landlord Approved"** `<li>` to the header nav (inserted `beforebegin` of the first
`.oxy-site-navigation.header-nav ul li.menu-item`). Clicking it smooth-scrolls to the FAQ section and opens a
new FAQ item inserted as the **first** accordion item:
- Q: "Why many landlords require renters insurance"
- A: "Renters insurance helps reduce a landlord's risk by providing liability coverage if you accidentally
  damage the property or someone is injured in your home. That's why many landlords require renters
  insurance as part of the lease. Every renters insurance provider featured on Renters Insurance Gurus are
  approved by landlords across the U.S., so you can choose with confidence."

### QA method

Convert.com force URLs supplied for this ticket
(`?cro_mode=qa&_conv_eforce=100052625.1000256824/825`) rendered the **current production page** when checked
via a static fetch before writing tests — no "Landlord Approved" link, no matching FAQ question. Same
"local build ahead of live" situation documented repeatedly for this client (CRE-T-08, SWF146 — see
`_client-notes.md`). Tests inject the local `v2.js`/`v2.css` directly onto the real live pages via
`addStyleTag`/`addScriptTag` instead of relying on the unpublished force URL.

### Content mismatch found and fixed mid-session

The FIRST version of `v2.js` supplied for this ticket had the FAQ answer's closing sentence as "The
providers featured on Renters Insurance Gurus offer policies designed to meet common landlord insurance
requirements." — this did **not** match the ticket brief's closing sentence (see brief text above). Flagged
as **BUG-CONTENT-01 [HIGH]** during the pre-flight Figma/brief-vs-code review (per `qa-workflow.md` Step
1→2), before any tests were written against it. A corrected `v2.js` was supplied mid-session with the
closing sentence matching the brief verbatim (and the earlier `<b>...</b>` bold wrapper around the middle
sentence removed, so the answer now renders as plain text). Fix verified on all 3 pages × all 7 browsers.

### Bugs found (all inherited from the CRE-T-137/144 clone lineage on the sister site — still present)

- **BUG-A [MEDIUM–HIGH, open]:** `scrollToEl()` still lacks `window.scrollY` — `top =
  el.getBoundingClientRect().top - 100` is only correct when the click happens from `scrollY=0`. Reproduced
  reliably: establish the correct landing `scrollY` from a fresh click, then pre-scroll 2000px and click
  again — landing position is off by >150px every time. Fix: `var top = window.scrollY + rect.top - 100;`
- **BUG-B [LOW, clone artifact]:** duplicate-init guard is `window.EventHandlerAddedTest137` (leftover from
  CRE-T-137/144), should be `...Test155` on this ticket.
- **BUG-C [LOW]:** the `Landlord Approved` `<li>` has no inner `<a>` — not natively keyboard-focusable, no
  href.
- **BUG-D [LOW, code smell]:** `.cre-t-155-accordion_header` declares `color: #000000;` then `color:
  inherit;` later in the same rule — dead declaration. No visible effect on this page (the inherited color
  also resolves to black), confirmed via static source check rather than a computed-style assertion (see
  Test/harness notes below).

### Test/harness notes

- **Playwright's `locator.click()` auto-scrolls the target into view before clicking** — this silently
  defeats a deliberate pre-scroll set up to reproduce BUG-A (confirmed: first version of the BUG-A test used
  `.click()` and got an *identical* landing `scrollY` regardless of the pre-scroll amount, because Playwright
  scrolled the header nav back into view before the click ever fired). Fix: dispatch a real DOM click via
  `page.evaluate((sel) => document.querySelector(sel).click(), NAV_LINK)` when the test needs to control
  `window.scrollY` precisely at click time.
- **Computed-style assertions can't detect a dead CSS declaration when the overriding value happens to
  resolve to the same color** (`inherit` here resolves to black anyway on this page, same as the dead
  `#000000`). BUG-D is tested via a static regex check against the raw CSS source text instead of
  `getComputedStyle`.
- **Self-calibrating scroll test pattern:** rather than hardcoding an assumed "correct" landing position
  (which depends on this page's specific content height), establish the correct `scrollY` empirically from a
  fresh `scrollY=0` click first, then compare the buggy scenario against that baseline within the same test.
- Zero Convert.com CDN rate-limiting issues observed across all 7 browsers/490 test runs — unlike
  SIC132/CRE-T-123/CRE-T-137/SWF139, this test only navigates 3 distinct URLs per browser (not dozens of
  probing navigations), which stayed well under whatever threshold triggers the rate-limiting seen on other
  tests for this client family.
- Background bash processes were repeatedly killed unexpectedly mid-run in this session's environment
  (including one hitting a 10-minute background timeout mid-suite) — switched to running each browser
  project as its own **foreground** command with an explicit long timeout, which completed reliably across
  all 7 projects.

### Test files

| Test | File |
|------|------|
| CRE-T-136 — Insurer alert box | [cre-t-136-insurer-alert.md](cre-t-136-insurer-alert.md) |
| SWF146 — TrustScore badge restyle (SWF135-style) | [swf146-badge-restyle.md](swf146-badge-restyle.md) |
| CRE-T-155 — "Landlord Approved" nav link + FAQ | [cre-t-155-landlord-approved-faq.md](cre-t-155-landlord-approved-faq.md) |
