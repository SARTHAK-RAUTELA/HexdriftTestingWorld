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

## Round 2 — 2026-11-05 (dev says fixed): STILL NOT READY — variation crashes live
- **NEW BUG-07 (Critical):** the live Convert code calls `observeSelector(CTA_SELECTOR, init, { …, filter: isPlanMutation })` but `isPlanMutation` is never defined. It throws `ReferenceError: isPlanMutation is not defined` inside the 1.5s setTimeout (outside the try/catch). **0 prices on the live variation**, `body.SWF173` not added. `observeSelector` doesn't read `filter`, so the fix is to delete that option.
- **BUG-06 still open:** the new `.SWF173-mo { font-size:16px }` rule comes after a stray `;` in vB.css. CSS treats the `;` as part of the selector and drops the whole rule, so `/mo` is still 18px. Removing the `;` gives 16px.
- `debug = 1` was left on.
- **Logic check:** the dev's code was injected into the control arm with only `filter: isPlanMutation` removed (`testing/swf173-recon/probe-r2-patched.js`, shots in `swf173-recon/r2/`). Chrome desktop 1440: all 6 URLs priced and centred (0px), Cats/Dogs/All Pets round-trip matches, ZIP 90210 after 17s matches, late Show More 8→11 all priced, Best Overall on /comparison/ + /canada/ priced, re-run ×2 shows no duplicates, `?petType=cat` 2/2 discounted, 0 self-mutations in 10s idle (no observer loop). → BUG-01/02/03/04/05 **are fixed in logic** and become effective once BUG-07 is fixed.
- Full spec not re-run: every variation test would fail at waitForSelector. Re-run the spec + Safari + mobile-audience after the republish.

## Round 3 — 2026-11-05 (isPlanMutation added + republished): READY
- Live Chrome Desktop **27/27** (`swf173-results/r3/chrome.json`). All of BUG-01 → BUG-07 fixed live; live CSS has no stray `;` (/mo 16px, amount 18px).
- Safari Desktop 22/27 (`r3/safari.json`): 3 WebKit `.plan-box` 60s timeouts (Dogs, quick Show More, iPhone 12 audience) = inconclusive. /comparison/ Liberty/Odie/AKC = **test artifact** (collapsed behind Show More, WebKit `innerText` of the native price = ""; SWF173 price is present). `?petType=cat` did not reproduce (4/4 WebKit loads OK).
- NOTE-01 (Low): the copied price can flash the CRE-T-143 pre-discount figure for 250–450ms on first load (Chrome 4/6, WebKit 1/4), then corrects (`probe-r3-race.js`). Not a blocker.
- Local repo `vB.css` still has the stray `;` (Convert copy clean).
- **Spec gotcha:** the `cards()` visible filter uses `offsetParent`, which WebKit doesn't null for collapsed Show More cards. Filter on the native price's innerText too before comparing.
