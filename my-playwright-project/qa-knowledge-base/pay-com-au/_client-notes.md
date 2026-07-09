# pay.com.au — Client Notes (cross-test quirks)

**Site:** `pay.com.au`
**A/B platform:** Optimizely
**Tests done:** CRE-T-08, CRE-T-09

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

## Test files

| Test | File |
|------|------|
| CRE-T-08 — Timed pop-up modal | [cre-t-08-timed-modal.md](cre-t-08-timed-modal.md) |
| CRE-T-09 — Navbar CTA via `::before` | [cre-t-09-navbar-cta.md](cre-t-09-navbar-cta.md) |
