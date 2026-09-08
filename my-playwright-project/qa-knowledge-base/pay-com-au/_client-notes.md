# pay.com.au — Client Notes (cross-test quirks)

**Site:** `pay.com.au`
**A/B platform:** Optimizely
**Tests done:** CRE-T-08, CRE-T-08 (vB), CRE-T-09, CRE-T-13

## Environment / site quirks

- **CSS-guard tests must block the Optimizely CDN BEFORE navigation:**
  ```javascript
  await page.route('**/cdn.optimizely.com/**', route => route.abort())
  await page.route('**/logx.optimizely.com/**', route => route.abort())
  await page.goto(BASE_URL)  // block first, then goto
  ```
- **`::before` content assertions include the outer quotes:** `expect(content).toBe('"Create free account"')` (CRE-T-09 pattern).
- **Pre-deploy check for timed modals:** `MODAL_DELAY_SECONDS` is often set to a short test value (3s) during dev — confirm it's reset to the production value (30s) before the Optimizely push.
- **Coexistence:** both tests ran simultaneously — when testing one, assert the other test's body class still applies and CSS breakpoint overrides work with both classes present.
- **Live Optimizely SDK on the page:** `window.optimizely` is already the real SDK's runtime API object before any injected variation script runs — don't assume `.push()` still appends to a plain array; `events.find(...)` on it will throw `TypeError`. Verify analytics via the Optimizely dashboard or a `logx.optimizely.com` network-request assertion instead.
- **"We've made the changes" can mean only the Optimizely audience/config was updated, not the trigger JS:** CRE-T-13 client said changes were done and supplied an Audiences screenshot (proving desktop-only targeting) — but the actual `vB.js`/`v2.js` trigger logic (40s timer, exit intent) hadn't been touched at all, both files still fired the modal immediately. Always read the trigger/gating code directly rather than trusting a config screenshot for JS-level requirements.
- **Real live experiments can already be running:** always run a true control check (no variation script injected at all) before assuming a clean baseline — CRE-T-08 (vB) found the exact variation already live for some mobile (Pixel 5/Chrome) sessions via real Optimizely targeting, firing within 3s (see [cre-t-08-vB-exit-intent-mobile-timer.md](cre-t-08-vB-exit-intent-mobile-timer.md), BUG-02).
- **CSP flakiness from the live Optimizely CDN script:** occasionally an inline-handler CSP violation from `cdn.optimizely.com`'s own script gets attributed by Playwright to whatever page action (e.g. `addStyleTag`) was in flight — intermittent, browser-specific (seen on Firefox), unrelated to the variation code under test.
- **Optimizely's Activation Code is a separate field from Variation/Control JS — always ask for it:** CRE-T-13 Round 1 guessed at the trigger requirement (40s timer / exit intent) and baked it directly into `vB.js`/`v2.js`. Round 2, the client supplied the real `function trigger(activate, options) {...}` Activation Code — architecturally separate, decides *when* to call `activate()`, which then runs the Variation/Control JS. If a client mentions a timer/exit-intent/audience-gated trigger, ask for the Activation Code field specifically before writing trigger logic into the Variation JS yourself.
- **Desktop-only can be enforced in JS, not just the Optimizely audience:** CRE-T-13's real Activation Code has `var isMobile = window.innerWidth < 768; if (isMobile) { return; }` guarding both trigger paths — don't assume a "desktop-only" requirement is audience-config-only just because the Variation/Control JS has no device check; check the Activation Code too.
- **Cookie-based fired-flags don't persist on `file://` test fixtures:** this client's real trigger code uses `document.cookie` (not `sessionStorage`) to prevent re-firing. Chromium and WebKit silently refuse to persist cookies set on `file://` origins (Firefox tolerates it) — serve any local fixture over `http://127.0.0.1:<port>/` (e.g. Node's `http` module in `test.beforeAll`) instead of `file://` whenever a variation's persistence mechanism is cookie-based.
- **A two-stage trigger→activate() flow needs two `page.clock.fastForward()` calls:** when a test's stubbed `activate()` dynamically injects a second script that itself calls `waitForElement(selector, fn, 50, ...)`, that second script registers its *own* fresh timer under the already-installed fake clock — advancing the clock once (for the outer trigger) isn't enough; add a follow-up `fastForward(100)` after every action that causes `activate()` to fire.
- **Fixture pages need a real `<meta name="viewport">` tag for `window.innerWidth` device checks to be testable:** without it, Playwright's mobile/tablet device emulation reports a stale ~980px layout-viewport width instead of the emulated device's actual width, making any `isMobile`-style JS gate untestable in the fixture even though it works fine on the real page (which has a normal viewport meta tag).

## Test files

| Test | File |
|------|------|
| CRE-T-08 — Timed pop-up modal | [cre-t-08-timed-modal.md](cre-t-08-timed-modal.md) |
| CRE-T-08 (vB) — Exit-intent/mobile-20s modal (trigger logic missing) | [cre-t-08-vB-exit-intent-mobile-timer.md](cre-t-08-vB-exit-intent-mobile-timer.md) |
| CRE-T-09 — Navbar CTA via `::before` | [cre-t-09-navbar-cta.md](cre-t-09-navbar-cta.md) |
| CRE-T-13 — Desktop-only + 40s-or-exit-intent trigger update (Round 2: real Activation Code) | [cre-t-13-desktop-trigger-update.md](cre-t-13-desktop-trigger-update.md) |
