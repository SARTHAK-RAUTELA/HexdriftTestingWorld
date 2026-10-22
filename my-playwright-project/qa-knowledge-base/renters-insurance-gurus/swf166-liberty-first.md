# SWF166 (cre-t-166) — Move Liberty Mutual to #1 (TX, NY, NJ, DC + 26 states)

- **Site:** rentersinsurancegurus.com — `/`, `/home/`, `/comparison/`
- **Convert:** exp 100052988 · control 1000257707 (30%) · V1 1000257708 (70%) · location 100012039 · audience 10007203 (cro_mode=qa only at QA time)
- **QA date:** 2026-10-21 · Chrome desktop, Safari desktop, Pixel 5, iPhone 12 · **72/116** (18/29 each, identical failures)
- **Spec:** `my-playwright-project/testing/swf166-liberty-first.spec.js` · recon + report builder: `testing/swf166-recon/`
- **Report:** `local_testing/Local2/swf166-liberty-first-qa-report.html` · results `local_testing/Local2/swf166-results/` · screenshots `local_testing/Local2/swf166-screenshots/`

## What V1 does
CSS `order` puts Liberty first and Lemonade second; `.plan-number::after` repaints the 1/2. The yellow App Store bar is hidden on
Lemonade and a new one is injected on Liberty ("499,000 … 4.8"). TrustScore images (position-based on this site) are swapped. The
Best Overall card is rewritten from the Liberty listing, and the exit modal gets a Liberty logo, strong text and a "Visit Liberty Mutual" button.

## Key techniques (reusable)
- **Geo-targeted Convert audiences from outside the US:** route the Convert bundle (`convertexperiments.com/v1/js/*.js`) and
  replace `window.convert.getUserData().geo.state == 'TX'` with `true`. Everything else stays real (URL rules, bucketing, deployed code).
- **The bundle JSON escapes slashes** (`http:\/\/…`). To patch URL rules, use `String.raw` match strings.
- **Read deployed code from `window.convert.data.experiences[...].variations[i].changes[0].data.{js,css}`** and diff it
  against local vB.js. Here the dev republished mid-QA, which changed the goal code, so re-extract before reporting.
- **Goal spy:** wrap `window._conv_q.push` and dispatch `mousedown` on targets. That shows exactly which goal IDs fire.
- **Flash probe:** an `addInitScript` rAF loop that records frames where the old order is painted.
- **`/comparison/` is natively Liberty-first.** It's the reference for the expected V1 look, including the Liberty exit modal.

## Bugs (open at 2026-10-21)
1. **High** — `/home/` location rule is `http://…/home/`, so `/home/` is never bucketed. Confirmed by patching it to https.
2. **Med** — partner goals 100038330 (Lemonade) / 100038331 (Liberty) fire on mousedown anywhere in `.plan-box`, including the `tel:` link and headings.
3. **Med** — the modal "Visit Liberty Mutual" button doesn't fire 100038331 (the client asked for it).
4. **Med** — `/comparison/` gets two yellow bars on Liberty (native 458,159 plus injected 499,000).
5. **Med** — typo "Libery Mutual" in the injected bar.
6. **Low** — `waitForElement(…, trustpilotContent(), …)` throws "trigger is not a function".
7. **Low** — 1–2 frame Lemonade-first flash on Chromium (24–95 ms) from the `waitForElement("body")` poll.

Fixed mid-QA: goal triggers had been commented out with wrong IDs 100037396/7.

## Side finding
cre-t-163 (exp 100052810) shows a vet/pet-insurance quote on the renters homepage (PIG clone leftover).

## Round 2 recheck (2026-10-21, exp version 12)
- **Result:** 84/120, all 4 browsers 21/30 with identical failures (iPhone /comparison/ and Pixel C01 /comparison/ re-run after a memory kill and a goto timeout; parts merged from `*-part1/2.json`).
- **Fixed:** BUG-01 (/home/ rule now https), BUG-04 (CSS hides native Liberty bar), BUG-05 (typo).
- **NEW BUG-08 (High):** the Liberty goal line became `live(selectors, '.button.Liberty_Mutual.rt-aff-link', "mousedown", fn)`. The extra argument shifts event/callback, so `live()` returns early and 100038331 never fires. It is also in the new control goal script (`cre-t-166-goal`, control now carries goal code).
- **Still open:** BUG-02 (whole-card binding; the Lemonade heading fires 100038330), BUG-03 (modal CTA not counted in either arm), BUG-06 (trigger is not a function), BUG-07 (2-frame flash, 61–75 ms Chrome).
- Spec: `home-fixed` removed, new **C02** control goal test. Round-1 artifacts: `swf166-results/r1/`, `swf166-screenshots-r1/`, `swf166-liberty-first-qa-report-r1.html`.

## Round 3 recheck (2026-10-22, still exp version 12)
- **No code change.** The "updated" local vB.js/vB.css matched round 2 exactly, and Convert still served v12 (fresh bundle, max-age=300). All round-2 bugs reproduce.
- **Result:** 109/162 (Chrome 28/42, Safari 27/42, Pixel 5 27/39, iPhone 12 27/39; V12 is desktop-only). iPhone V01 / re-run after a worker crash (`iphone12-v01root.json`). Chrome V09/V11 re-run after an assertion fix (`chrome-desktop-v9v11.json`). The builder merges `<base>-*.json` part files.
- **New tests V09–V12:** real clicks with affiliate hops stubbed, listings #3–#7 vs control plus overflow, modal close/re-open plus Liberty CTA, keyboard Tab order.
- **NEW BUG-09 (Med):** the site attribution handler is `$(".rt-aff-link").click(...)`, bound at load. It rewrites to `sub1=<path>&sub5=<EF cid>&sub3=<exp ids>&sub4=<var ids>`, fires gtag `aff_link_click` and opens via `window.open` in a new tab. Elements injected later (the V1 modal button) miss it. **Reusable:** on any RIG/PIG test that injects an `.rt-aff-link`, check sub3/sub4 on click. Repurposing the existing anchor's href works.
- **NEW BUG-10 (Low):** CSS `order` swap leaves Tab order Lemonade→Liberty on / and /home/.
- **BUG-06 → Med:** `trustpilotContent()` invoked inline, so the swap runs once at body-ready. Safari /home/ caught it unswapped (Liberty 4.7 at #1), 1 of ~11 loads.
- Round-2 artifacts: `swf166-results/r2/`, `swf166-screenshots-r2/`, `swf166-liberty-first-qa-report-r2.html` (`build-report-r2.js`).
