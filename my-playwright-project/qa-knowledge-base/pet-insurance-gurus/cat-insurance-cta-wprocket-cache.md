# /cat-insurance/ — VIEW PLANS CTA below content (WP Rocket cache, NOT Convert)

**Client:** Pet Insurance Gurus — petinsurancegurus.com
**Date:** 2026-11-05
**Type:** Live-site UI investigation (no ticket / no experiment)
**Status:** Root cause found. Waiting on the client team to clear the cache, since they have WP admin and Cloudflare access. Recheck after they confirm.

## Symptom
On `https://petinsurancegurus.com/cat-insurance/` (desktop, 1920px), every listing card's **VIEW PLANS** button
and "30-Day Money-Back Guarantee" line sit *under* the bullet list instead of in their own right-hand column.
The homepage, /dog-insurance/ and other listing pages look correct.

## Why it looked like a Convert test
- The client checked `/cat-insurance/?convert_optout=1`, saw the correct layout, and concluded "one of our tests" was causing it.
- We had already checked every live Convert test, and none target /cat-insurance/ (some explicitly exclude it).
- The browser console showed no experiment ID.

## Root cause
The site runs **WP Rocket's "Remove Unused CSS" (RUCSS)** feature behind **Cloudflare**.
- The cached page (Cloudflare `cf-cache-status: HIT`, about 3.3h old at test time) serves `<style id="wpr-usedcss">`
  in place of the full stylesheets. The full inline styles (`global-styles-inline-css` and the others) are empty.
- The saved used-CSS for /cat-insurance/ is **missing** this rule:
  ```css
  .plan-col-2-repeater-container.ct-section .ct-section-inner-wrap,
  .plan-col-2-repeater-container:not(.ct-section):not(.oxy-easy-posts){
    display:flex; flex-direction:row; align-items:center; justify-content:space-between }
  ```
- Without it, the Oxygen `ct-div-block` falls back to `flex-direction: column`.
  `.plan-description-container` then grows from **372px → 582px**, and `.plan-button-container` (210px) drops below it.
- The used-CSS for /dog-insurance/ and the homepage still contains the rule, so those pages are fine.

## Evidence (Chrome, fresh Playwright context, 1920×1000)

| Load | Cloudflare | `#wpr-usedcss` | `.plan-col-2-repeater-container` direction | Layout |
|---|---|---|---|---|
| `/cat-insurance/` | HIT | yes | column | ❌ broken |
| `/cat-insurance/` + `convert_optout=1` **cookie only** | HIT | yes | column | ❌ broken |
| `/cat-insurance/?x=<random>` | DYNAMIC | no | row | ✅ |
| `/cat-insurance/?convert_optout=1` | DYNAMIC | no | row | ✅ |
| `/dog-insurance/` | DYNAMIC | yes (has the rule) | row | ✅ |
| `/` (homepage) | — | yes (has the rule) | row | ✅ |

- The Convert `_conv_v` cookie on /cat-insurance/ showed `exp:{}`, so no experiment was bucketed.
- `convert_optout=1` "fixed" it only because **any query string bypasses the Cloudflare/WP Rocket cache**.

Probe scripts: `testing/swf173-recon/probe-cat-cta.js` (layout tree + Convert state, plain vs optout vs home) and
`testing/swf173-recon/probe-cat-cta2.js` (plain vs random QS vs cookie-only vs dog, plus a dump of the used-CSS rules).

## Fix (client team, since they have the access)
1. WP Rocket → **Clear Used CSS** for /cat-insurance/ (or the admin-bar option for that one URL).
2. **Purge /cat-insurance/ in Cloudflare.**
3. Recommended: WP Rocket → File Optimization → Remove Unused CSS → **CSS Safelist** → add
   `.plan-col-2-repeater-container` and `.plan-button-container`.

## Retest
- Load the **plain URL with no query string** in a fresh context or private window. Any `?param` skips the cache and will always look correct.
- Expect `#wpr-usedcss` to contain the `flex-direction:row` rule for `.plan-col-2-repeater-container`,
  `.plan-description-container` ≈ 372px wide, and the CTA to the right of the bullets.

## Client communication
- **Us (first report):** flagged the UI issue. No live test includes /cat-insurance/ and no experiment ID shows in the console.
- **Client:** "it looks like the misaligned CTA is due to one of our tests… `?convert_optout=1` and the issue resolved. Can you investigate and fix?"
- **Us (final):** explained the cause was WP Rocket's saved CSS, not Convert. `?convert_optout=1` only skips the cache
  (`?x=123` works too). Asked them to clear the WP Rocket Used CSS, purge Cloudflare, and optionally safelist the class.

## Lesson
If a PIG layout bug "goes away with `convert_optout=1`", don't assume Convert is the cause. Also try:
`?x=<random>`, the opt-out **cookie** with no query string, the `cf-cache-status` header, and whether `#wpr-usedcss` is present.
