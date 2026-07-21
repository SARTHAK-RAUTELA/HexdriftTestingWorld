# CRE-T-08 (vB) — "Not sure if Pay.com.au is right" Modal (Exit-Intent / Mobile-20s spec)

**Test file / reporter (deleted after report generation, per repo convention):** `testing/cre-t-08-vB-pay-modal.spec.js` / `cre-t-08-vB-reporter.js`
**Report:** `local_testing/Local2/cre-t-08-vB-qa-report.html`
**Site:** `https://pay.com.au/` (live production site — variation files injected via `page.addStyleTag`/`page.addScriptTag`, not yet an Optimizely force URL)
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css` + `experiment-js.js` (added — see BUG-01 fix below)
**Variation class:** `cre-t-08`
**Required behavior (per brief):** Desktop → show on exit intent · Mobile → show after 20 seconds

## What this variation is

A modal ("Not sure if Pay.com.au is right for your business?") with 3 feature cards (Create a Free Account / Use Your Existing Cards / Make a Single Payment) and a CTA. Same `variation_name = "cre-t-08"` as the older timed-modal test ([cre-t-08-timed-modal.md](cre-t-08-timed-modal.md)) but a **completely different modal design and a different vB.js/vB.css implementation** — not an update of the old test, a new build reusing the ID.

## BUG-01 — FIXED: trigger gating was missing from vB.js, now wired to Experiment JS

**Original finding:** `vB.js` `init()` called `showModal()` **unconditionally and immediately** — no timer, no `mouseout`/exit-intent listener, no device/viewport branching anywhere in the JS or CSS. The modal fired the instant the script loaded, on every device and browser. This was flagged to the user before writing tests; the first test pass (documented below) confirmed it and was run deliberately against the broken code to surface the gap.

**The fix (applied):** the user supplied the actual gating mechanism — a shared `trigger(activate, options)` function meant to live in Optimizely's shared **Experiment JS** slot (runs before any variation's own JS). It provides: a `cre-t-08=modal-triggered` cookie guard, `window.innerWidth < 768` device branching, a mobile 20-second `sessionStorage`-tracked timer, and a desktop `mouseout` exit-intent listener (`!e.toElement && !e.relatedTarget && e.clientY <= 10`). This was saved as `local_testing/Local2/variation/experiment-js.js`, and `vB.js`'s tail was changed from:
```js
waitForElement("body", init, 50, 15000);
```
to:
```js
trigger(init, {});
```
so `init()` (the addClass + showModal + analytics logic) now only runs when `trigger()`'s gating decides to call it.

**Verification result:** confirmed correct in principle across several Chrome-Desktop-only reruns — the exit-intent listener, the cookie guard (no re-fire on reload), and the mobile timer path all passed in at least one run each. **However, full deterministic pass on every run was not achieved** — see the flakiness note below. This is believed to be a live-site testing artifact, not a defect in the fix itself, given the failing test identity shifted between reruns rather than being a fixed, reproducible failure.

## Known limitation — exit-intent testing against the live production page is flaky

pay.com.au loads dozens of heavy third-party scripts (GTM, Optimizely, Hotjar, Clarity, LinkedIn, Facebook, TikTok, Bing, Pinterest, DoubleClick, FullStory, New Relic, Zendesk, Sleeknote, Calendly, and more — see the full CSP allowlist surfaced by a CSP-violation error in one of the runs). `page.addScriptTag()`'s promise resolves once the script executes, but `trigger.js`'s `mouseout` listener is only attached once its internal `setInterval(fn, 50)` poll actually gets a CPU turn — under heavy main-thread contention from all those third-party scripts, that can take anywhere from ~50ms to several seconds, unpredictably per page load. A synthetic `document.dispatchEvent(new MouseEvent('mouseout', {clientY:0, relatedTarget:null}))` fired too early simply misses the listener. Mitigations tried: redispatching the event 5× over 1s, and a flat 5s settle wait before dispatch — both reduced but did not eliminate the flakiness (best run: 9/16 passed on Chrome Desktop, with the specific failing TC differing between runs).

**Recommendation for reliable regression testing of this specific test:** either (a) accept some flakiness is inherent to testing exit-intent against this particular live page and rerun on failure, or (b) build a static local HTML fixture (page shell with no third-party scripts) to make listener-attachment timing deterministic — the mobile 20-second timer path does **not** have this problem since it's a real wait, not an event race, and was reliable across every run.

## Separate, unrelated finding — BUG-02: the same immediate-fire bug was already live in production for at least some mobile traffic

TC-01 (control — page loaded with **no** vB.js/vB.css/experiment-js.js injected at all, run against the **original broken** vB.js before the fix) unexpectedly found `.cre-t-08-modal-main` already present and active on **Mobile Chrome (Pixel 5)** within 3 seconds of page load, with content identical to the variation. This means pay.com.au was **already running a live Optimizely experiment matching this exact variation for (at least some) mobile visitors** at the time of testing, exhibiting the same immediate-fire behavior. This finding is independent of the local vB.js/experiment-js.js files and was not re-verified after the fix (the fix is local-file-only; it doesn't get deployed to Optimizely by editing these files).

**Action recommended:** confirm with the Optimizely dashboard whether CRE-T-08 (or a similarly-named experiment) is currently live for a mobile audience, and pause/audience-restrict it until the fixed `vB.js` + `experiment-js.js` are deployed as the actual Variation JS + Experiment JS in Optimizely.

## Two failures from the pre-fix run that were NOT vB.js bugs (test/environment limitations)

- **TC-07 (subtitle text) failed once, on Firefox Desktop only:** the error was `page.addStyleTag` catching a **Content-Security-Policy violation thrown by the live `cdn.optimizely.com` script** (an inline event handler blocked by pay.com.au's CSP), not anything in our injected files. Same class of issue already documented in [_client-notes.md](_client-notes.md) ("CSS-guard tests must block the Optimizely CDN before navigation") — a live-site/CSP quirk, intermittent, unrelated to the code under test.
- **TC-12 and TC-13 (optimizely analytics events) failed on all 6 browsers** with `TypeError: events.find is not a function`. Cause: pay.com.au's **real, already-loaded Optimizely SDK** replaces `window.optimizely` with its full runtime API object before vB.js runs, so `window.optimizely.push(...)` calls the real SDK's method (the events likely *do* reach Optimizely correctly) rather than appending to a plain array our test can read back with `.find()`. Verify analytics via the Optimizely dashboard or a network-request assertion instead, on any site where a real Optimizely snippet is already loaded.

## Pre-fix baseline: All Test Cases (15 TCs, against the original broken vB.js)

| TC | Category | What it checks | Result |
|----|----------|-----------------|--------|
| TC-01 | Control | Modal absent with no variation script injected | 5/6 pass — **fails on Mobile Chrome** (BUG-02, live production) |
| TC-02 | Variation | `body.cre-t-08` class added after injection | 6/6 pass |
| TC-03 | Bug doc | Modal fires immediately with zero trigger gating | 6/6 pass (documents BUG-01) |
| TC-04 | Desktop trigger | Modal hidden until exit intent | 0/4 pass (desktop-only; BUG-01) |
| TC-05 | Mobile trigger | Modal hidden until 20s elapse | 0/2 pass (mobile-only; BUG-01) |
| TC-06 | Content | Main title exact text | 6/6 pass |
| TC-07 | Content | Subtitle exact text | 5/6 pass — Firefox CSP flake, not a code bug |
| TC-08 | Content | 3 feature card titles exact | 6/6 pass |
| TC-09 | Content | CTA button text exact | 6/6 pass |
| TC-10 | Interaction | Cross icon closes modal | 6/6 pass |
| TC-11 | Interaction | Overlay click closes modal | 6/6 pass |
| TC-12 | Analytics | CTA click pushes optimizely click event | 0/6 pass — test-script limitation, not a code bug |
| TC-13 | Analytics | `pay08_-_modal_fires` pushed on init | 0/6 pass — test-script limitation, not a code bug |
| TC-14 | Duplicate-guard | Re-injecting script does not add a 2nd modal | 6/6 pass |
| TC-15 | Responsive | Modal container renders + centered, desktop and mobile | 6/6 pass |

## Post-fix confirmation runs (Chrome Desktop only)

After wiring `vB.js` to `trigger(init, {})`, three Chrome-Desktop-only reruns were done (progressively adjusting the test's exit-intent simulation, not the fix itself):

| Run | Passed / Failed (of 16) | Notes |
|---|---|---|
| 1 | 2 / 13 | `page.mouse.move()` can't produce a real `relatedTarget === null` mouseout — test bug, fixed by dispatching a synthetic event directly |
| 2 | 5 / 10 | Direct dispatch helped (TC-04 exit-intent passed), but the shared `injectAndOpenModal` helper still raced the listener attachment |
| 3 | 9 / 6 (best) | 5s settle wait before dispatch improved pass rate further, but TC-04 (which had passed in run 2) failed this time — confirms live-page timing flakiness, not a fixed defect |

Every core mechanism (exit intent, cookie guard, mobile timer, content, interactions) passed in at least one of these runs. No single test failed in all three runs. Given this and the cost of continued live-site reruns, testing was stopped at the user's direction rather than chasing a fully green run — see "Known limitation" above for why, and the recommendation for a deterministic follow-up if needed.

## Key lesson

When the brief specifies device-conditional trigger behavior (desktop vs. mobile), read the JS **before** writing a single test case — if the trigger logic doesn't exist at all, every timer/exit-intent TC will fail for the identical root cause, and the report should say so once prominently rather than as 5+ separate "mystery" failures. Also: on any site with a real, already-loaded analytics SDK (Optimizely, GA, Segment), don't assume `window.<vendor>` stays a plain queue array — the real SDK may have already replaced it with its runtime API object by the time the variation code runs. And: when a fix's own trigger mechanism is event-based (exit intent) rather than time-based, testing it against a live production page with many third-party scripts introduces genuine, hard-to-eliminate timing flakiness — don't keep spending on reruns chasing full determinism once the mechanism has been proven correct piecemeal; note the limitation and move on.
