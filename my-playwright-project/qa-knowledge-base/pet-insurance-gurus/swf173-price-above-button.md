# SWF173 (exp 100053060) — Pet Insurance Gurus "Price Above Button (Desktop)"

**Test date:** 2026-11-05 · **Browsers:** Chrome Desktop (full, 19/27) + Safari Desktop/WebKit (26/27 run, killed by low memory before JSON saved)
**Force URLs:** `?cro_mode=qa&_conv_eforce=100053060.1000257881` (control) / `.1000257882` (variation)
**URLs:** `/`, `/home/`, `/comparison/`, `/cat-insurance/`, `/compare/`, `/canada/` · desktop only (Convert audience; code has no device gate)
**Code:** `local_testing/Local2/variation/vB.js` + `vB.css` (matched the deployed code 2026-11-05)
**Spec:** `testing/swf173-price-above-button.spec.js` · **Report:** [swf173-price-above-button-qa-report.html](swf173-price-above-button-qa-report.html) · artifact https://claude.ai/artifact/MxurHm6f63zJLhTptjZPBV
**Evidence:** `swf173-screenshots/{chrome-desktop,safari-desktop}/`, `swf173-results/chrome.json|log`, `safari.log`

## Brief
Duplicate each listing's "Average Plan Cost" above its VIEW PLANS button; right column vertically centred. Wireframe: grey caps label, large bold `$20.28` with a small `/mo`. The video has no audio track and shows the All Pets and Cats/Dogs tabs.

## Result: NOT READY
On a fresh All Pets load everything passes on all 6 URLs: the price matches the card, it reads the CRE-T-143 discounted span, the column is centred with a 0px offset at 1024–1920px, the control is clean, hrefs are unchanged, the code is safe to run twice, and mobile (Pixel 5) is not bucketed.

| Bug | Sev | Summary |
|---|---|---|
| BUG-01 | High | Cats/Dogs tabs: duplicated price stays at the All Pets figure (or the CRE-T-143 hidden original) — visible in the client's own video |
| BUG-02 | High | ZIP entered → in-place re-render + re-order; injected nodes stay, so cards show a different insurer's old price (Embrace shows ASPCA's $34.22) |
| BUG-03 | Med | Observer starts at 2s and disconnects at +15s; a Show More click after that leaves cards 8–10 (Liberty/Odie/AKC) without a price |
| BUG-04 | Med | Best Overall card on /comparison/ + /canada/ lives in `.best-overall-container`, outside `.plan-repeater` → no price (it is priced on /) |
| BUG-05 | Low | `?petType=cat` direct landing raced CRE-T-143 once → pre-discount price (1 of 2 loads) |
| BUG-06 | Low | `.SWF173-mo` has no rule → 18px like the amount; wireframe shows a bigger amount and a smaller `/mo` |

Root cause of BUG-01/02/03/05: "insert once, skip if `.SWF173-price` exists" combined with a time-boxed observer. Fix: a persistent sync that re-reads only the visible price.

## Gotchas learned
- The native `/comparison/` and `/canada/` button column already overflows by 2px in the control. Don't flag horizontal overflow under 3px.
- WebKit on this site often takes >60s to render `.plan-box`. Treat 1.1-minute failures as timeouts, not verdicts.
- Pet-tab prices differ even inside CRE-T-143: Cats Lemonade $14.65, Dogs $22.76, All Pets $20.28.
