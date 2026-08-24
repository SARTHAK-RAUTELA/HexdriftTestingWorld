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
