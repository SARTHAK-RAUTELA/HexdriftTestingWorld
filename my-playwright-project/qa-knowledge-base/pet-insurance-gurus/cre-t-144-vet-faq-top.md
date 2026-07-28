# CRE-T-144 / SWF144 — Pet Insurance Gurus Vet FAQ moved to TOP (clone of CRE-T-137)

**Test file:** `my-playwright-project/testing/cre-t-144-vet-faq-top.spec.js`
**Report:** `local_testing/Local2/cre-t-144-qa-report.html`
**Screenshots:** `my-playwright-project/cre-t-144-screenshots/` (also copied beside the report)
**Site:** `https://petinsurancegurus.com` — Home, `/comparison/`, `/home/`
**Test date:** July 22, 2026
**Browsers:** Chrome, Firefox, Edge, Safari + Mobile Chrome/Safari (6 projects)
**Variation class:** `cre-t-144` · Convert campaign `Cro_mode144` · experiment `100052493`
**Result:** 258 passed · 0 failed · 6 platform-gated skips (44 TCs × 6 = 264)

### What this A/B test does
Follow-up clone of CRE-T-137. Same control + two variations, plus two NEW variations identical to
CRE-T-137's V1/V2 **except the "Vets love pet insurance" FAQ is inserted as the FIRST accordion item**
(`insertAdjacentHTML('beforebegin', …)` on `.faq-container .oxy-pro-accordion .oxy-pro-accordion_item:first-child`)
instead of appended last.
- **V1 (…519):** FAQ-at-top, no nav link.
- **V2 (…520):** + "Vet Approved" nav `<li>` before the first `.oxy-site-navigation li.menu-item`; click smooth-scrolls to and opens the new FAQ.

### QA force/preview URLs (this test)
- V1: `?utm_campaign=Cro_mode144&_conv_eforce=100052493.1000256519`
- V2: `?utm_campaign=Cro_mode144&_conv_eforce=100052493.1000256520`
- Preview links inject reliably in **headless Playwright** on all 3 URLs — no `cro_mode=qa` needed.

### Bugs found (all inherited from CRE-T-137 clone — still present)
- **BUG-A [V2 MED–HIGH, CONFIRMED LIVE]:** `scrollToEl()` still lacks `window.scrollY` (SWF137 BUG-01). FAQ mispositions after any prior scroll (measured 1635px), and lands imprecisely even from top (135px Chrome / 369px Edge; −170..+393px mobile). Fix: `var top = window.scrollY + rect.top - 100`.
- **BUG-B [V2 MED]:** guard var still `window.EventHandlerAddedTest137` inside cre-t-144 → collision while both tests run. Rename to `...Test144`.
- **BUG-C [V2 LOW]:** Vet Approved `<li>` has no inner `<a>` (SWF137 BUG-02).
- **BUG-D [BOTH LOW]:** duplicate `color:#000000` then `color:inherit` on `.cre-t-144-accordion_header` (SWF137 BUG-03).
- **FILE ISSUE:** local `vB.js` is the wrong file (WinkBeds cre-t-253 code), so V1 was QA'd via the live preview link, not local source. Deployed V1 is correct.
- **BUG-E [HIGH, CONFIRMED LIVE, FIXED 2026-07-28]:** Client-reported live issue after this test shipped:
  changes were visible on the force-preview link, but a real (non-forced) visit to the bare homepage never
  showed them — only after the user applied the Cats/Dogs filter or entered a ZIP code did `body` get the
  `cre-t-144` class and the Vet Approved link/FAQ appear. Root cause: `waitForjQuery(trigger, delayInterval,
  delayTimeout)` was called at the init site as `waitForjQuery(function () {...})` — no `delayInterval`/
  `delayTimeout` args, and unlike `waitForElement`, this function had **no default parameter values**, so both
  resolved to `undefined`. `setInterval(fn, undefined)` and `setTimeout(fn, undefined)` both resolve to ~0ms,
  so the jQuery-ready poll raced its own cleanup timer instead of getting a real multi-second window — worked
  by luck (timer registration order) most of the time, but not reliably. Confirmed via a fresh cookie-free
  Playwright context (`browser.newContext()`) reproducing the exact reported behavior — a heavily-reused,
  long-lived Chrome tab gave a false negative (never worked, even after filtering) due to stale Convert
  bucketing cookies, which is why the fresh context was necessary to get a clean repro. **Fix (deployed by
  senior dev, verified live in the production Convert bundle):** hardcoded `50`/`15000` directly into the
  `setInterval`/`setTimeout` calls instead of passing through the unused parameters. Re-verified with the same
  fresh-context repro against production: `cre-t-144` class, Vet Approved link, and new FAQ item now all
  present on the bare homepage with zero interaction required. See the general playbook:
  [_shared/troubleshooting-changes-not-showing.md](../_shared/troubleshooting-changes-not-showing.md).

### Test/harness notes
- Active-header color must be asserted with `toHaveCSS` (auto-retry) — reading `getComputedStyle` immediately catches a mid-CSS-transition value (false fail on slower/mobile).
- Strict "≤250px near top" positioning is desktop-only; mobile scroll landing is erratic (BUG-A) → mobile asserts only nav-visibility + FAQ-opens.
- Background Playwright runs got killed ~90s into this environment → run per-project in the **foreground** (WebKit ~3min/project).
