# UK Radiators — ukradiators.com (client notes)

**Platform:** Shopify + Convert.com
**Force URL convention:** `?cro_mode=qa&_conv_eforce=<account>.<variation-id>` on the target page.

## Site quirks

- **Cloudflare-style bot-protection challenge page** ("Your connection needs to be verified before you
  can proceed") can trigger if the same page is hit too many times back-to-back with no delay — hit this
  running Chrome → Firefox → Edge in a ~12-minute unthrottled burst during UKRadiators-18 testing. All
  Edge results in that run were false failures (`page.waitForSelector` timeout because the page never
  rendered the real DOM). **Fix: space browser runs out, don't run the full cross-browser matrix in one
  unthrottled burst.** Re-running Edge on its own afterward passed clean.
- **Pre-existing, non-deterministic page errors fire on every page load — on control too, not caused by
  any variation.** Confirmed via a standalone control-page check across Chromium, Firefox, and WebKit:
  - `document.body.append` on null/undefined (wording varies: "Cannot read properties of null (reading
    'append')" on Chromium, "can't access property... document.body is null" on Firefox, "null is not an
    object (evaluating 'document.body.append')" on WebKit)
  - `window.swapFirstTwoImages is not a function`
  - Invalid URL construction from `/cdn-cgi/rum?` (Cloudflare RUM beacon) — wording varies by engine
  - `Failed to fetch` (Chromium), sandboxed-iframe + Trustpilot cross-origin frame-access errors (WebKit
    only)
  - **Any "no uncaught page errors" assertion for this site must allowlist these by pattern (not exact
    string), since counts/wording vary per run and per browser engine.** See
    `KNOWN_PREEXISTING_SITE_ERRORS` in `testing/ukradiators-18-hide-banner-nav.spec.js`.
  - **Firefox-only addition (found during UKRadiators-17, `/cart`):** `ReferenceError: id is not
    defined`, thrown from a third-party cart-tracking plugin's `observeCartChanges`/`cartObserver`
    inside `installSuperPlugin` — unrelated to any variation script, reproduces with the variation
    JS entirely absent. See `KNOWN_PREEXISTING_SITE_ERRORS` in
    `testing/ukradiators-17-basket-summary-reorder.spec.js`.
- **The bot-protection challenge is frequency/volume-based across a rolling window (~1 minute+),
  not just a hard per-burst threshold — confirmed during UKRadiators-17.** Even with add-to-cart
  calls consolidated to one per `test.describe` block (shared browser context, serial mode) and
  45-60s pacing between blocks, this site's `/cart/add.js` still returned HTTP 429 ("Verifying your
  connection...") multiple times across a ~2-hour session, especially right after a block that did
  5+ full page navigations in quick succession. **Cooldown to clear ranged from a few minutes up to
  ~15 minutes after repeated trips — the block appears to escalate with repeated violations.** Space
  full test-project runs several minutes apart and check with a quick `curl` before each one.
- **`page.request.post()` (Playwright's `APIRequestContext`) gets flagged by this site's
  bot-protection more readily than a real page's own `fetch()` call, even seconds apart from the
  same IP.** A raw `page.request.post('/cart/add.js', ...)` reliably tripped a 429, while
  `page.evaluate(() => fetch('/cart/add.js', {...}))` from an already-loaded page succeeded
  immediately after. Likely a missing-browser-fingerprint/header signature on the APIRequestContext
  path. **Use `page.evaluate(() => fetch(...))` for any cart-mutating call on this site, not
  `page.request.*`.**
- **Testing-methodology caveat: don't heavily automate force-hitting BOTH a control and a variation
  URL from the same IP in rapid repeated succession.** During UKRadiators-17, after dozens of full
  Playwright runs alternating between a control and variation force-preview URL over ~2 hours, the
  control URL began rendering the variation's DOM changes — reproduced in fully isolated checks
  that never touched the variation URL, including after a 10-minute cooldown. The variation scripts
  on this site carry no eforce-checking logic of their own, so this is very likely a Convert.com
  server-side sticky-bucketing or edge-caching artifact triggered by request density, not a real
  targeting misconfiguration — but it means **a control-URL check late in a long, heavy automated
  session on this site is not trustworthy on its own.** If control behavior looks wrong late in a
  session, re-verify from a fresh IP/session or after a longer cooldown before concluding a real bug.
