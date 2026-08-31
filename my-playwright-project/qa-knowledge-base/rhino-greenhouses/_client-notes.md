# Rhino Greenhouses (rhinogreenhouses.co.uk) - Client Notes

**Platform:** Shopify (theme uses section IDs like `template--27460884431223__brochure_section_GAxGY3`)
**A/B testing platform:** Convert.com (force URL pattern: `?cro_mode=qa&_conv_eforce=<project>.<variation>`)
**Variation delivery:** Convert.com bundles the raw `vB.js`/`vB.css` into a per-project CDN script,
e.g. `https://cdn-4.convertexperiments.com/v1/js/<project>-<variation>.js` — function names survive
bundling (confirmed via stack traces), so browser devtools/Playwright stack traces reliably point back
to the source function names in the local `vB.js`.

## Site quirks

- Footer/geo country selector defaults to **India** for automated/headless traffic (geo-IP based) even
  though the on-page phone-country field correctly shows "United Kingdom" — this is unrelated to any
  test and not a bug to flag.
- The `/pages/request-a-brochure` hero video (`#GalleryViewer-...media_with_text_ff7q34 video`) never
  actually loads in **either** control or variation — `readyState: 0`, empty `src`, the `<source>` only
  carries a `data-src` lazy-load attribute. Reproduces in the video's original, active-slide position on
  the control page too, so this is a **pre-existing theme/site defect**, not something introduced by any
  test that relocates or references this video. See
  [swf-t06-brochure-hero-bestsellers.md](swf-t06-brochure-hero-bestsellers.md) BUG-01.
- Convert.com preview links use `cro_mode=qa` + `_conv_eforce=<project>.<variation>` query params on the
  real page (not a separate iframe/preview tool) - standard Playwright `page.goto()` works directly.
- **Shopify's own `/cart/add.js` rate-limits (HTTP 429) after repeated rapid add-to-cart calls in a
  short window** (confirmed live 2026-08-31, testing SWF-T05 - see
  [swf-t05-cart-reformat.md](swf-t05-cart-reformat.md)). This is platform-level Shopify rate limiting,
  not a client-specific bot-protection challenge like ukradiators.com's Cloudflare-style check (see
  `qa-knowledge-base/ukradiators/_client-notes.md`) - same *symptom* (429 blocking cart-dependent
  tests), different mechanism. **Mitigation:** cache one cart session's `storageState()` (cookies) for
  the whole spec file run and reuse it across every `describe` block's `browser.newContext()` instead
  of calling `/cart/add.js` once per block - this cuts a 4-describe-block spec from ~4 add-to-cart POSTs
  per browser project down to 1, which is what actually avoided the limit (a per-call retry/backoff
  alone was not enough once the rate window was already primed by an earlier run in the same session).
  A UI cookie country prompt ("Are you in the right place? ... visiting from India") also appears for
  automated/headless traffic - unrelated to this quirk, see the geo-IP note above.

## Cross-test lessons

- When a test's JS injects/moves elements sourced from another section and then hides that now-empty
  source section via CSS, always confirm the extraction happened *before* the CSS hide with real content
  — check `getComputedStyle` on the specific relocated elements, not just DOM presence.
- AJAX section-swap pattern (fetch another page's `?section_id=` rendered HTML and inject it) is
  fragile — see BUG-02 in
  [swf-t06-brochure-hero-bestsellers.md](swf-t06-brochure-hero-bestsellers.md): a malformed
  `SECTION_ID` value in the *deployed* Convert bundle produced a CSS-selector-shaped string instead of
  the literal section ID, 404'ing the fetch. Reproduced 3/3 on Mobile Chrome/Mobile Safari/Tablet and
  intermittently on Firefox/Safari Desktop — always confirm this pattern's fetch actually resolves with
  real content on every device tier, not just one desktop browser.
