# CRE-T-13 (PAY13) — Desktop-Only Conversion + 40s-or-Exit-Intent / Exit-Intent-Only Trigger Update

**Site:** `https://pay.com.au/`
**Activation code (real, client-supplied):** `local_testing/Local2/variation/pay13-trigger-variation.js` (40s timer + exit intent) · `pay13-trigger-control.js` (exit intent only, derived — see Round 2 below)
**Variation files:** `local_testing/Local2/variation/vB.js` + `vB.css` (now fire immediately when `activate()` calls them — see Round 2)
**Control files:** `local_testing/Local2/variation/v2.js` + `v2.css`
**Test spec:** `testing/pay13-desktop-trigger.spec.js`
**Fixture:** `local_testing/Local2/pay13-fixture.html` (served over local HTTP, not `file://` — see Round 2)
**Report (Round 1):** `local_testing/Local2/pay13-desktop-trigger-qa-report.html`
**Report (Round 2 rerun):** `local_testing/Local2/pay13-trigger-rerun-qa-report.html`
**Variation class:** `cre-t-13-variation` · **Control class:** `cre-t-13-control`
**Result (Round 1, 2026-09-07):** 60/60 passed (15 TCs × 4 desktop browsers: Chrome, Firefox, Edge, Safari) — trigger logic was still hand-built directly into vB.js/v2.js at this point (see Round 1 below), no real activation code from client yet.
**Result (Round 2 rerun, 2026-09-07):** 126/126 passed (18 TCs × 7 projects: Chrome/Firefox/Edge/Safari Desktop, Mobile Chrome, Mobile Safari, Tablet) — rebuilt against the client's real Optimizely Activation Code.

## Round 2 — client supplied the real Activation Code (2026-09-07, same day)

The client came back with the actual Optimizely **Activation Code** — the `function trigger(activate, options)` snippet that decides *when* to call `activate()`. This is architecturally separate from the Variation/Control JS (`vB.js`/`v2.js`), which just builds and shows the modal. This matters because Round 1's fix (below) had guessed at the trigger requirement and baked 40s-timer/exit-intent logic directly into `vB.js`/`v2.js` — the real production split is:

```
pay13-trigger-variation.js / pay13-trigger-control.js   --calls activate()-->   vB.js / v2.js
        (decides WHEN)                                                    (just builds+shows modal)
```

**Action taken:** stripped the Round-1 trigger logic back out of `vB.js`/`v2.js` (now just `waitForElement("body", init, 50, 15000)` again, firing immediately when `activate()` calls them) and rebuilt the Playwright spec around the real two-stage flow — inject the activation code first, let it decide when to call a stubbed `activate()` that in turn injects the variation/control JS into the page (mirroring what Optimizely does).

**Control's activation code was not supplied.** Per the client's own confirmation ("control fires exit intent only, variation fires exit intent and 40 sec"), `pay13-trigger-control.js` is derived from the variation code with the 40s-timer block removed — `isMobile` guard, cookie, and exit-intent handler kept byte-identical to the variation's version. If the client later shares the actual control-side snippet, diff it against this derived version before trusting further reruns.

### New finding: desktop-only IS enforced in JS, not just via the Optimizely audience

Round 1's report said "there is nothing in the injected code for a device-emulation test to exercise" — that was true of the vB.js/v2.js content, but the real Activation Code has `var isMobile = window.innerWidth < 768; if (isMobile) { return; }` before setting up either trigger path. Confirmed via new regression tests across Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12) and Tablet (iPad Gen 7) emulated viewports — the modal correctly never activates on narrow viewports, independent of the Optimizely audience.

### Two environment-artifact bugs found and fixed in the *test fixture itself* (not the client's code)

1. **Virtual-clock two-stage timer gap:** once `activate()` injects `vB.js`/`v2.js` into the page, that script registers its *own* fresh `waitForElement("body", init, 50, 15000)` poll under the already-installed `page.clock` fake timer. The test wasn't advancing the clock a second time after the activation fired, so `init()` (which builds/shows the modal) never ran even though activation itself succeeded. Fixed by adding a follow-up `page.clock.fastForward(100)` after every action that triggers activation (`dispatchExitIntent`, and after crossing the 40s mark).
2. **Cookie-on-`file://`-origin unreliability:** the real trigger's fired-flag is `document.cookie = "cre-t-13=modal-triggered; path=/"` (not `sessionStorage`, unlike Round 1's hand-built version). Chromium and WebKit silently refuse to persist cookies set on `file://` origins (Firefox tolerates it) — this is a fixture-environment artifact, not a defect in the client's code; the modal still displayed correctly and the goal still fired in every case, only the cookie-persistence assertion tripped. Fixed by serving the fixture from a local HTTP server (`http://127.0.0.1:<port>/`, spun up in `test.beforeAll`) instead of `file://`, matching how `https://pay.com.au/` actually behaves.
3. Also added a `<meta name="viewport" content="width=device-width, initial-scale=1">` tag to the fixture — without it, mobile/tablet emulated browsers report a stale ~980px layout-viewport width instead of their real device width, making the `isMobile` check untestable in this environment (pay.com.au's real page has a normal viewport meta tag, so this only mattered for the fixture).

### Updated regression checklist (18 TCs, Round 2)

| # | Group | What it checks |
|---|-------|-----------------|
| 1 | Variation | Modal hidden immediately on load |
| 2 | Variation | `sessionStorage` target-time recorded as soon as the trigger sets up; not yet activated |
| 3 | Variation | Modal hidden at 39s, appears at 40s (timer path); cookie + goal + `optimizely_trigger_reason_cre_t_13 === 'timer'` all set |
| 4 | Variation | Exit intent fires early and cancels the 40s timer — no double `pay13_-_modal_fires` |
| 5 | Variation | If the 40s timer fires first, a later exit-intent event does not double-fire (dangling `mouseout` listener is harmless — cookie guard no-ops it) |
| 6 | Variation | Does NOT activate on a mobile viewport (375×667), even after exit intent + 40s+ |
| 7 | Variation | 40s timer persists across a simulated page reload (cumulative time via `sessionStorage`, not reset) |
| 8 | Variation | Does not re-fire on a later page view once shown this session (cookie persists) |
| 9 | Variation | Content matches variation copy |
| 10 | Variation | Close via cross icon / overlay both hide the modal |
| 11 | Variation | CTA click fires click goal + activates `.sticky-get-started a#mob-get-started` |
| 12 | Control | Modal never fires from elapsed time alone, even 5 minutes later (no timer) |
| 13 | Control | Exit intent fires the modal |
| 14 | Control | Does NOT activate on a mobile viewport |
| 15 | Control | Does not re-fire on a later page view once shown this session |
| 16 | Control | Content matches PAY08 control copy |
| 17 | Control | Close via cross icon / overlay both hide the modal |
| 18 | Control | CTA click fires click goal + activates sticky get-started link |

### Minor code note (not a bug, harmless by design)

In the client's real activation code, if the 40s timer fires first, the `mouseout` exit-intent listener is never explicitly removed (only the branch inside the listener removes itself, and the timer's own branch doesn't reach that removal). A later exit-intent event after the timer has already fired will still invoke `executeActivation("exit_intent")`, but the `getCookie(...) === "modal-triggered"` guard at the top of `executeActivation` makes it a no-op — confirmed via TC 5 above, no double-fire occurs. Not worth a client fix, just worth knowing if debugging a "why is this listener still attached" question later.

### Before pushing live (still applies)

The Optimizely campaign's live Variation/Control JS + CSS fields, plus this new Activation Code field, still need to be updated to match these files — re-verify against the preview links once the Optimizely editor is updated.

---

## Round 1 (original notes, superseded by Round 2 above for trigger architecture)

## Client request (2026-09-07)

Based on results from an earlier round of this test, the client asked for:
1. Convert to a **desktop-only** test.
2. **Variation** trigger: fire at **40 seconds cumulative on-site time** (persists across page views within the same session) **or exit intent — whichever comes first**.
3. **Control**: stays the PAY08 variation content, trigger changed to **exit intent only**.

## What was actually in the code vs. what the client believed was done

The client said "we have done the changes" and supplied an Optimizely Audiences screenshot showing `Desktop Users` AND `CRE_qa` as match-all audiences — confirming the **desktop-only targeting** was genuinely done (that part lives entirely in the Optimizely campaign config, not in JS/CSS).

But reading `vB.js` and `v2.js` (both modified today per file timestamps, confirmed via `git diff` against the last commit) showed **neither the 40s timer nor any exit-intent listener existed anywhere** — both files called `showModal()` unconditionally the instant `init()` ran (immediate-fire, same bug class as the original CRE-T-08 vB pre-fix state). Only the copy/content had been updated for this round; the trigger-logic change had not been implemented at all.

**Lesson:** when a client says "we've made the changes" and points at files, read the actual trigger/gating code before testing — a screenshot of an Optimizely Audience panel proves the audience change, nothing about the JS trigger logic. Same class of gap as CRE-T-08 (vB) (see [that file](cre-t-08-vB-exit-intent-mobile-timer.md)), and this is now the **second** time on this exact modal component that "the code is done" turned out to mean "the content is done, the trigger logic is not."

## BUG-01 — FIXED: control had no CSS at all

`v2.css` (control's CSS field) still contained unrelated leftover **WIN257 cart-modal CSS** — a completely different ticket's styles. None of the `.cre-t-13-*` modal classes were styled for the `cre-t-13-control` body class (only `vB.css` had them, scoped to `.cre-t-13-variation`). The control modal would have rendered with zero styling — no overlay, no centering, no `display:none`/`.active` toggle.

**Fix:** rebuilt `v2.css` from `vB.css`'s modal styling, 1:1 selector-for-selector, with `.cre-t-13-variation` retargeted to `.cre-t-13-control`. Verified visually via a screenshot in the QA report — renders identically to the variation, just with control copy.

## BUG-02 — FIXED: trigger logic missing entirely (both variation and control)

Both `vB.js` and `v2.js` had `waitForElement("body", init, 50, 15000)` where `init()` called `showModal()` unconditionally. Fixed by:
- **`vB.js`**: added `setupTriggers()` that races a `setTimeout` (40s) against a `mouseout` exit-intent listener (`!e.relatedTarget && !e.toElement && e.clientY <= 10`, same pattern as CRE-T-08 vB). The 40s timer's start time is persisted to `sessionStorage` (`cre_t13_start_time`) on first setup and read back on every subsequent page load, so elapsed time carries over across navigations instead of resetting — satisfies "continues to count down across page views." A `cre_t13_modal_fired` sessionStorage flag prevents re-firing once shown in a session, and whichever trigger fires first cancels the other (clears the timeout / removes the listener).
- **`v2.js`**: same pattern, minus the timer — exit intent only, with its own `cre_t13_control_modal_fired` flag.

## Test method — local fixture + Playwright Clock API (not the live site)

Per the existing lesson in [CRE-T-08 (vB)](cre-t-08-vB-exit-intent-mobile-timer.md) — testing exit-intent/timer behavior against the live pay.com.au page is flaky due to 15+ third-party scripts competing for the main thread — this test injected `vB.js`/`vB.css`/`v2.js`/`v2.css` into a **minimal local static fixture** (`pay13-fixture.html`) instead, using Playwright's `page.clock` API to advance virtual time deterministically (`fastForward(39000)` → assert hidden, `fastForward(1500)` more → assert visible, etc.) and a synthetic `document.dispatchEvent(new MouseEvent('mouseout', {clientY:0, relatedTarget:null}))` for exit intent.

### Playwright gotcha: `toBeVisible()` is unreliable under `page.clock`

Initial run: 32/60 failed, all on `expect(locator).toBeVisible()` / `.not.toBeVisible()`, uniformly across all 4 browsers, right after the modal's `active` class had already been added (confirmed — the DOM snapshot in the failure trace showed `<div class="cre-t-13-modal-main active">`, and a screenshot taken at the exact failure moment showed the modal **fully and correctly rendered**). Tests using a longer real action timeout (`.click()`, `actionTimeout: 20000` in this repo's `playwright.config.js`) on the same modal state passed fine.

**Root cause:** `toBeVisible()` waits for two stable real animation frames via the browser's paint loop; `page.clock.install()` virtualizes `requestAnimationFrame` along with `setTimeout`/`Date.now()`, so that paint-stability signal never resolves within the assertion's default 5000ms timeout even though the DOM/CSSOM state is already correct.

**Fix:** replaced all `toBeVisible()`/`not.toBeVisible()` calls with a direct CSSOM query instead of Playwright's actionability check:
```js
async function isModalVisible(page) {
  return page.evaluate(() => {
    var el = document.querySelector('.cre-t-13-modal-main');
    if (!el) return false;
    return el.classList.contains('active') && getComputedStyle(el).display !== 'none';
  });
}
```
Also swapped `.locator(...).click()` for `page.evaluate(() => el.click())` on the modal's own close/CTA buttons, for the same reason (real click() actionability also waits on the same paint-stability mechanism). After this change: 60/60 passed.

**Takeaway for any future test that mixes `page.clock` with UI state assertions:** don't use `toBeVisible()`/`.click()` locator actions on elements whose visibility just changed synchronously under a faked clock — query `getComputedStyle`/`classList` directly, or `dispatchEvent`/`.evaluate(el => el.click())` instead of the locator action.

## Regression checklist (15 TCs, run on any future change to this modal)

| TC | Category | What it checks |
|----|----------|-----------------|
| 1 | Variation | Modal hidden immediately on load |
| 2 | Variation | `sessionStorage` start-time recorded as soon as triggers are set up |
| 3 | Variation | Modal hidden at 39s, visible at 40s (timer path) |
| 4 | Variation | Exit intent fires early and cancels the 40s timer — no double `pay13_-_modal_fires` |
| 5 | Variation | 40s timer persists across a simulated page reload (cumulative time, not reset) |
| 6 | Variation | Does not re-fire on a later page view once shown this session |
| 7 | Variation | Content matches variation copy (title, 3 feature cards, CTA) |
| 8 | Variation | Close via cross icon / overlay both hide the modal |
| 9 | Variation | CTA click fires click goal + activates `.sticky-get-started a#mob-get-started` |
| 10 | Control | Modal never fires from elapsed time alone, even 5 minutes later (no timer) |
| 11 | Control | Exit intent fires the modal |
| 12 | Control | Does not re-fire on a later page view once shown this session |
| 13 | Control | Content matches PAY08 control copy (title, 3 feature cards, CTA) |
| 14 | Control | Close via cross icon / overlay both hide the modal |
| 15 | Control | CTA click fires click goal + activates sticky get-started link |

## Not covered by this test suite

Desktop-only targeting is enforced by the Optimizely audience config (`Desktop Users` + `CRE_qa`, confirmed via dashboard screenshot), not by a device check inside `vB.js`/`v2.js` — there is nothing in the injected code for a device-emulation test to exercise.

## Before pushing live

The Optimizely campaign's live Variation/Control JS + CSS fields still need to be updated with these files — this pass only touched the local repo files. The supplied preview links will keep showing the old immediate-fire behavior until that's done; re-verify against the preview links after the Optimizely editor is updated.
