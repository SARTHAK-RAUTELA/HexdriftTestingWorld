# WIN286 — Other - Persistent Targeted Offer (Convert exp 100350738) — QA 2026-10-15

Follow-up to [WIN276](win276-targeted-offer-v2.md). Same cooling-cover modal plus a new line under the CTA ("Not ready? Close this
offer. Reopen it from the side of your screen."). After a dismissal without accepting, a fixed "Free Cooling Cover" badge sits on
the left edge and reopens the modal. It persists across pages and sessions while the cart still qualifies. On mobile (<=1076px) a
44x44 close icon hides the badge for the session. Wireframe: `Group 1935.png`.
Report: `local_testing/Local2/win286-persistent-targeted-offer-qa-report.html` (artifact https://claude.ai/artifact/Tkn9z1RGHyQsEjP5s5HYiU).
Spec: `testing/win286-persistent-targeted-offer.spec.js` (TC-01..20, 23 checks per browser). Results + screenshots: `win286-screenshots/`.

## Architecture (no files supplied — extracted from the Convert bundle with `testing/win286-recon/extract.js`)
- Bundle objects embed `"js":function(){}`, so they are JS literals, not JSON: evaluate them, don't `JSON.parse`. `grep -b` gives byte offsets, which don't match JS string indices in this UTF-8 file.
- Deploy 100350740 = helpers (WIN276 deployment clone with cre286_* cookies). Adds a `'badge'` cohort when `cre286_modal_dismissed=true` and the cart qualifies.
- Deploy 100350741 = activation (3s) → `executeExperiment 100350738`. Location js_condition `test_286_Experiment==1`; audience 10036006 = campaign contains `Cro286mode`.
- Control 1003184955 = WIN276 Variation renamed (status **stopped**, traffic 0). Variation 1003184956 = modal + badge.
- Cookies: `cre286_modal_dismissed` (30d), `cre286_badge_hidden_session` (session), `cre286_badge_seen` (30d, slide-in once), `cre_286_checkout_visited`, `cre286_cart_added_ts`, `cre286_session_ts`, `cre286_active_cohort`.

## Result: Chrome 17/22, Safari 17/22, Pixel 5 16/22, iPhone 12 15/21 (n/a and blocked cases excluded)
- BUG-01 HIGH goals: Variation pushes `triggerConversion ""`; Control pushes WIN276 goal 100334580; no CTA, badge-click or badge-close goals exist.
- BUG-02 HIGH mobile: the badge (z-index 99) is painted under Buy Box sections on the shop page (Pixel 600–1800px, iPhone 1800–3000px).
- BUG-03 MED mobile: the close hit area overlaps the badge by 36x36px, so taps there hide the badge instead of reopening.
- BUG-04 MED: the badge is missing 2.6–4.3s after DOMContentLoaded on every page (3s activation delay).
- BUG-05 LOW: the visual bottom is 8.9–10.5% above the viewport bottom (spec 20%) because of rotate about centre; desktop left edge is at -6.8px.
- BUG-06 LOW: role=button elements have no Enter/Space handling. BUG-07 LOW: Control adds the body class `cre-t-286-variation`.
- LAUNCH: ONE_HOUR_MS = 2 min; Control stopped at 0%; pause WIN276 (audience NOT Cro286mode); Cohort 2 extra 5s (WIN276 BUG-03).

## Harness notes
- `_conv_q` pushes are captured by an init-script accessor on `window._conv_q` that also wraps a reassigned `push`.
- "Next session" = new context carrying only cookies with `expires > 0`.
- The cart-drawer check on iPhone is blocked by the site's own timed popup `cre-wb-test-28` (seen twice); treat as unverifiable there.
- Mobile Safari batches exceed the 10-minute tool timeout; split the run and expect a 2–3x slower WebKit.
