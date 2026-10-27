# WIN270 (cre-t-270) — Shop Page "Deprioritise Secondary Firmness Levels"

**Site:** winkbeds.com/pages/shop-winkbed · Convert exp **100350850** · All users (QA audience = `utm_campaign=Cro270mode`)
**Code:** `local_testing/Local2/variation/vB.js` + `vB.css` = variation (identical to deployed 2026-10-26). Control (1003185232)
carries only the WIN255 V2 Luxury Firm copy.
**Spec:** `testing/win270-deprioritise-firmness.spec.js` · recon `testing/win270-recon/` · results `local_testing/Local2/win270-results/`
**Report:** `local_testing/Local2/win270-deprioritise-firmness-qa-report.html` (built by `testing/win270-recon/build-report.js`)
**Wireframe:** `C:\Users\Sarthak Rautela\Downloads\Group 48098604.png` (crops in `testing/win270-recon/wireframe/`)

## Preview links
`?utm_campaign=Cro270mode&_conv_eforce=100350850.1003185232` (control) / `.1003185233` (variation)

## What it does (variation)
- Buy box: "Firmness:" label, navy panel (green check, name, "Most Popular" pill, "Change firmness"). A transparent
  `.cre-t-270-firm-select` (clip-path to the right 170px) drives the hidden `#firmness-select`. "Firmness guide" hidden until
  first click. Bullet swaps. Non-default choice kept in session cookie `cre-t-270-firmness`.
- Construction section: new headline/sub-copy, tabs hidden, Luxury Firm only, explore accordion `.cre-t-270-explore`.
- Sticky nav "Firmness Options" → "Comfort & Support" (desktop CSS ::before only; mobile `#mobilePdpNav` option retargeted).
- Video: new copy + thumbnail `v2.crocdn.com/Winkbed/test270/thumbnail-image.jpg`. Gallery grid slide 19 → data-slide 4 + bed image.
- Goals (global JS): 100334728 / 100334729 on `#firmness-select` change; clicks 100334730 guide, 731 toggle, 732 option, 733 video.

## Run 2026-10-26 — Chrome Desktop 21/26 (TC-21 passed on screenshot), Safari 9/10 executed then memory kill
- BUG-01 High: saved-cookie restore dispatches `change` → goals 728/729 fire on every page load (also credited to other exps).
- BUG-02 High: desktop "Comfort & Support" still scrolls to `#firmness` ("Choose From 4 Firmness Options") — theme matches by text.
- BUG-03 Medium: cookie restore overrides `?firmness=plus` URL. BUG-04 Medium: firmness image still in lightbox slide 19.
- BUG-05 Low: Plus shows "Heavier People" pill (spec: pill only for Luxury Firm).
- Q-01: wireframe Luxury Firm copy/"Ideal for" ≠ WIN255 V2 copy. Q-02: thumbnail has "Winkbed Firm" caption. Q-03: 728 counts changes, not clicks.
- Pixel 5 checked via recon only; iPhone 12 not run yet.

## Gotchas found
- Theme reads `?firmness=softer|luxuryfirm|firmer|plus` (layout.theme.js); it never writes firmness to the URL.
- Convert goals: parse `"goalId"` from POSTs to `*.metrics.convertexperiments.com/v1/track` only — `logs.convertexperiments.com`
  echoes goal state and inflates counts.
- Lightbox `.lightbox-slider .swiper-slide-active` can be an empty node; assert on the large visible img in `.cre-lightbox-popUp`.
- Explore buttons: the theme's tab-click scroll can interrupt the variation's smooth scroll if clicked far from the section — click
  from the explore block position in tests.
- Experiment names in the Convert bundle are anonymised (`Test #<id>`); find code by grepping `cre-t-NNN`.
