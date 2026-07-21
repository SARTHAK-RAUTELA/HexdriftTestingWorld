# pay.com.au — Client Notes (cross-test quirks)

**Site:** `pay.com.au`
**A/B platform:** Optimizely
**Tests done:** CRE-T-08, CRE-T-08 (vB), CRE-T-09

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
- **Real live experiments can already be running:** always run a true control check (no variation script injected at all) before assuming a clean baseline — CRE-T-08 (vB) found the exact variation already live for some mobile (Pixel 5/Chrome) sessions via real Optimizely targeting, firing within 3s (see [cre-t-08-vB-exit-intent-mobile-timer.md](cre-t-08-vB-exit-intent-mobile-timer.md), BUG-02).
- **CSP flakiness from the live Optimizely CDN script:** occasionally an inline-handler CSP violation from `cdn.optimizely.com`'s own script gets attributed by Playwright to whatever page action (e.g. `addStyleTag`) was in flight — intermittent, browser-specific (seen on Firefox), unrelated to the variation code under test.

## Test files

| Test | File |
|------|------|
| CRE-T-08 — Timed pop-up modal | [cre-t-08-timed-modal.md](cre-t-08-timed-modal.md) |
| CRE-T-08 (vB) — Exit-intent/mobile-20s modal (trigger logic missing) | [cre-t-08-vB-exit-intent-mobile-timer.md](cre-t-08-vB-exit-intent-mobile-timer.md) |
| CRE-T-09 — Navbar CTA via `::before` | [cre-t-09-navbar-cta.md](cre-t-09-navbar-cta.md) |
