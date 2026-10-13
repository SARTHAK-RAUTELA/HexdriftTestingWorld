# WIN283 (cre-t-283) — Shop Page "Select Sub-Total V3"

**Site:** winkbeds.com/pages/shop-winkbed · Convert exp **100350737** · All users
**Code:** `local_testing/Local2/variation/` vB.js/vB.css = control (WIN266 V2 line), v2.js/v2.css = V1, va3.js/va3.css = V2
**Spec:** `testing/win283-shop-subtotal-v3.spec.js` · recon scripts `testing/win283-recon/` · results `win283-results/`
**Report:** `local_testing/Local2/win283-shop-subtotal-v3-qa-report.html` (built by `testing/win283-recon/build-report.js`)

## Preview links
Client-supplied V1/V2 links pointed at greenbuildingsupply.com (exp 100052955), which is the wrong client. Working links:
`?utm_campaign=Cro283mode&_conv_eforce=100350737.1003184952` (control) / `.1003184953` (V1) / `.1003184954` (V2).

## What it does
- Control: "N item(s) selected · $X total · Saving $Y"
- V1: same + 2px bigger + `<strong class="strike">$pre-savings</strong>` after "total"
- V2: V1 + hides native `.order-form__add.button` (`.cre-t-283-add-btn-original`) and inserts a clone div
  `.cre-t-283-add-btn` reading "ADD TO CART · SAVE $Y"; its click forwards to the native button.

## Run 2026-10-13 — Chrome Desktop 25/32, Safari Desktop 9/18 (stopped by the OS for low memory; V2 Safari not run)
- BUG-01 Medium: no guard for missing compare price → strike < total + "Saving $0" + V2 "SAVE $0" (Chrome repro by removing
  `.cre-t-202-box-strike-price`; seen naturally on Playwright WebKit where the site price box stayed "Was $ $").
- BUG-02 Medium: V1/V2 line + V2 button force `Inter`, which isn't loaded → Arial fallback; site font is greycliff-cf.
- BUG-03 Low: wrong preview links. BUG-04 Low: "total$2,570" with no space (3px padding only, strike nested in strong).
- Q1: accessory/cooling compare prices (e.g. Platform Frame ~~$700~~ $499, shown when cre-t-275 etc. are active) aren't counted in Saving.
- Passed: copy, default math ($1,799/$2,570/$771), King ($2,199/$3,141/$942), Setup&Removal +$75, accessories,
  ATC single add via V2 clone (one `/cart/update.js {"updates":{id:1}}`), 15 fresh loads with no stale $0.

## Gotchas found
- WinkBeds ATC uses `/cart/update.js` with `updates`, NOT `/cart/add` — verify via `/cart.js` item_count.
- `cre-wb-test-28-overlay` popup intercepts forced clicks on the ATC button → false "cart stayed 0".
- V2 hides the first `.order-form__add.button` match → `waitForSelector` (visible) times out; use `state:'attached'`.
- Playwright clears `test-results/` at run start — put logs/JSON elsewhere.
- Playwright WebKit on Windows: site price box sometimes stays empty ("Was $ $") and pages can hang → memory kill.
