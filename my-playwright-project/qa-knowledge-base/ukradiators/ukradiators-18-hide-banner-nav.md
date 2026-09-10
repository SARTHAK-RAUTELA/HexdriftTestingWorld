# UKRadiators-18 — Hide Summer-Sale Banner + Header Nav (Magnetic Towel Bars Lander)

**Site:** ukradiators.com (Shopify) | **Platform:** Convert.com
**Target URL:** `/collections/magnetic-towel-bars`
**Audience:** Paid-traffic lander visitors
**Variation files:** `local_testing/Local2/variation/vB.js` / `vB.css` (body class `UKRadiators-18`)
**Spec:** `testing/ukradiators-18-hide-banner-nav.spec.js`
**Screenshots:** `ukradiators-18-screenshots/` (HTML QA report retired — findings captured in this doc)
**Force URLs:** Control `_conv_eforce=100052699.1000257008` · Variation `_conv_eforce=100052699.1000257009`

## What this test does

Hypothesis: reduce choice / narrow the path to checkout for paid-traffic landers by hiding the yellow
summer-sale banner and all header nav (category links, Trade Account, Sale CTA, and the desktop
search/phone/account/cart icon cluster), leaving only the logo. CSS-only variation (`display: none` on
the banner, `visibility: hidden` on nav item wrappers, `padding-top: 0` to close the gap left by the
banner) plus a one-line `vB.js` that just adds the `UKRadiators-18` body class.

## Figma vs. code vs. live

Desktop: banner + nav item text hidden, desktop icon cluster hidden, only logo remains — matches Figma.
**Mobile: does NOT match Figma — see BUG-01.**

## Bugs found

### BUG-01 [MEDIUM — real, reproducible on all 4 desktop browsers via mobile viewport emulation]

Figma's mobile variation shows only the logo — no hamburger menu icon, no cart icon. Current `vB.css`
has no selector covering the mobile hamburger (`.open-nav`) or mobile cart icon (`img[alt="cart"]`)
containers, so both remain visible at the 390×844 mobile viewport. `.nav-draw-level-one > div > span`
only covers the desktop-style nav item text wrappers, not the mobile hamburger/cart icon elements which
live in a different part of the header markup. **Needs a CSS selector added for the mobile
hamburger/cart container** before this ships to mobile traffic as-is.

Documented as an assertion of the Figma-specified (hidden) state in TC-10, so it fails until fixed —
this is intentional (see `_shared/qa-workflow.md`, "assert Figma spec, not current code").

## Test scenarios (16 TCs, `testing/ukradiators-18-hide-banner-nav.spec.js`)

| TC | Category | What it checks |
|----|----------|-----------------|
| TC-01 | Control | No `UKRadiators-18` class on body |
| TC-02 | Control | Sale banner visible |
| TC-03 | Control | Nav item wrappers (category links / Trade Account / Sale) visible |
| TC-04 | Control | Desktop icon cluster visible at desktop viewport |
| TC-05 | Variation | `body.UKRadiators-18` class added |
| TC-06 | CSS | Sale banner hidden (`display:none`) |
| TC-07 | CSS | Nav item wrappers hidden (`visibility:hidden`) |
| TC-08 | CSS | Desktop icon cluster hidden at desktop viewport |
| TC-09 | CSS | Body `padding-top` collapses to 0 |
| TC-10 | Bug doc | [BUG-01] Mobile hamburger + cart icons hidden per Figma — expected to fail, documents the bug |
| TC-11 | DOM | No new elements injected — `adm-nav` still has exactly 3 children (CSS-only variation) |
| TC-12 | CSS guard | Removing body class restores banner + nav visibility |
| TC-13 | Dedup | Re-running `vB.js` leaves exactly one `UKRadiators-18` class |
| TC-14 | Responsive | No horizontal page overflow at the current viewport |
| TC-15 | Cross-page isolation | Variation effects don't persist after navigating to homepage (SPA-nav leak check) |
| TC-16 | Errors | `vB.js` introduces no NEW uncaught page errors beyond known pre-existing site errors |

## Results by browser (2026-08-24, full re-run after mid-session interruption)

**15/16 passed on all 4 desktop browsers (Chrome, Firefox, Safari, Edge)** — only TC-10 (BUG-01,
expected/documented) fails on each. 60/64 total.

First pass hit two false-failure classes, both root-caused and fixed in the spec (not product bugs):
- **Edge false failures (TC-08, TC-09, TC-11, TC-13, TC-15)**: Chrome → Firefox → Edge run in one
  unthrottled ~12-minute burst tripped ukradiators.com's Cloudflare-style bot-protection challenge page
  for Edge. Re-ran Edge alone afterward — 15/16 clean. See `_client-notes.md`.
- **TC-16 (all browsers)**: original assertion (`expect(errors).toEqual([])`) is a test-design bug —
  ukradiators.com throws pre-existing JS errors on every load (confirmed present on control, across
  Chromium/Firefox/WebKit). Rewrote to allowlist known pre-existing error patterns and only fail on
  errors `vB.js` newly introduces. See `_client-notes.md` for the full error list and per-engine wording.

## Additional test cases to consider

- Real mobile-device-emulation Playwright projects (Mobile Chrome / Mobile Safari) for TC-10, rather than
  only desktop-browser viewport resizing — would confirm BUG-01 reproduces identically on touch devices,
  not just resized desktop Chromium/WebKit.

## Issues found during development

- Standalone one-off scripts (launch a bare browser, hit control, log `pageerror` events) are the
  fastest way to prove "is this error pre-existing on control" before concluding a variation caused it —
  cheaper than re-running the full spec against control repeatedly.
- Cross-browser error-message string matching is fragile — the *same* underlying JS error is worded
  completely differently by Chromium, Firefox, and WebKit. Any allowlist for `pageerror` messages needs
  regex patterns keyed on the stable substring (function/property name), not exact string equality.
