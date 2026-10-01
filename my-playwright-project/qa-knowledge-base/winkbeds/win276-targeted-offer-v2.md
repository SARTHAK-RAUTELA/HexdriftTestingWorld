# WIN276 — Other - Targeted Offer V2 (Convert exp 100350628) — QA 2026-09-29

Follow-up to [WIN257](win257-cart-modal-checkout-upgrade.md). Same modal/CTA. Control = Cohort 1 (checkout
abandoner) only; Variation = Cohort 1 + Cohort 2 (added eligible mattress, no checkout, 1h+ inactive, returns).
Report: `local_testing/Local2/win276-targeted-offer-v2-qa-report.html` (artifact https://claude.ai/artifact/PosBUkxkRoj9RigvdtFDJR).
Spec: `testing/win276-targeted-offer-v2.spec.js` (15 cases, seeds cookie/localStorage state). Screenshots + results.jsonl: `win276-screenshots/`.

## Architecture (from Convert bundle cdn-4.convertexperiments.com/v1/js/1003415-1003290.js)
- Deploy 100350629 `cre-t-276-deployment`: sets `cre_276_checkout_visited` cookie on `a[href="/checkout"]` mousedown,
  wraps fetch for `/cart/add` -> `localStorage.cre276_cart_added_ts`, tracks `cre276_last_active_ts` (mousemove/keydown/scroll),
  exposes `window.CRE276_helpers`.
- Deploy 100350630 `creT276Activation`: 3s after helpers -> Cohort 1 or Cohort 2 -> `executeExperiment 100350628`.
- Exp 100350628: location js_condition `test_276_Experiment==1`; audience 10035981 = campaign contains `Cro276mode`.
- WIN257 now runs as deploy 100350512 (100%, audience campaign NOT Cro276mode) — pause at WIN276 launch.

## Result: 10/15 on each of Chrome, Safari Desktop, Mobile Chrome, Mobile Safari (identical fail set)
- BUG-01 CRIT: site ATC (Buy Box + PDP) uses `POST /cart/update.js`, never `/cart/add` -> Cohort 2 never armed.
- BUG-02 CRIT: first scroll/mouse/key on return rewrites last_active -> isNewSession false before 3s/8s checks.
- BUG-03 HIGH: Variation adds 5s for Cohort 1 too (Chrome 6.5s vs 11.1s); Cohort 2 ~11s not 5s.
- BUG-04 HIGH: cart_added_ts never cleared -> Cohort 2 modal every return session.
- BUG-05 HIGH: idle open tab never re-evaluated. BUG-06 HIGH: WIN257 deploy stacks at launch.
- BUG-07 MED: dropped WIN257 `checkoutSessionIdentifier` check. BUG-08 MED: checkout exclusion is a session cookie.
- BUG-09 LOW: stale WIN257 goal 100334268 pushed.

## Harness notes
- Playwright wipes `test-results/` each run — keep screenshots/results elsewhere (spec writes to `win276-screenshots/`).
- On mobile DOMContentLoaded fires AFTER the modal opens; measure from navigation start (init-script poll on
  `performance.now()`), not from goto() returning. Early mobile passes of TC-03/TC-06 were measurement artifacts.
- Running 3 projects back-to-back got killed for low memory; run one project per invocation.

## ROUND 2 (2026-09-29 PM) — re-test after client fix (Convert bundle _s_t 2026-09-29 10:03:37Z)
Client did not send files; the fixed code was re-extracted from the live Convert bundle and diffed.
State moved to cookies: `cre276_cart_added_ts`, `cre276_left_at_ts` (written on visibilitychange-hidden AND
every pagehide), `cre276_checkout_reached_ever` (30d). Spec updated (17 cases, results in `results-r2.jsonl`).
- FIXED: BUG-01 (matches /cart/update.js), BUG-02 (leave-timestamp model), BUG-05 (refocus re-check),
  BUG-08 (persistent checkout cookie), BUG-03 Cohort 1 half, BUG-09 in Variation.
- OPEN: BUG-03 Cohort 2 still 12.5–26s (3s activation + 5s variation + load), BUG-04 repeat every session,
  BUG-06 WIN257 deploy 100350512 still active, BUG-07, BUG-09 in Control (100334268). NEW-01 low: visible idle tab
  not counted as new session (definition changed from inactivity to departure) — confirm with client.
- Results: Chrome 15/17, Mobile Chrome 15/17, Safari Desktop 14/17, Mobile Safari 14/17 (TC-03 on WebKit = load noise,
  Control arm was slower).
Harness gotchas: seed must set cookies AFTER leaving the seed page (pagehide overwrites left_at); never write a cookie
via document.cookie that was set via context.addCookies (duplicate names -> site getCookie returns undefined);
Bash heredoc/sed stripped `\d` in regexes — use `[0-9]`; WebKit needs 2x modal wait windows (Cohort 2 ~26-30s on iPhone);
site blocked this IP (403 pages / 429 cart POST) after ~4 full runs — discard and re-run after ~15-30 min.

## ROUND 3 (2026-09-30) — PARTIAL, run killed (low memory) mid Safari Desktop
Local `local_testing/Local2/variation/vB.js` + `vB.css` == live Convert Variation (bundle _s_t 2026-09-30 04:47Z, diffed clean).
Change vs R2: Variation shows Cohort 1 instantly; Cohort 2 still `setTimeout(5000)` AFTER activation's 3s. Results: `results-r3.jsonl`;
R2 screenshots copied to `win276-screenshots/round2/`. TC-15 waits widened to 40s (site slow today).
- Chrome Desktop 15/17 (after re-running TC-01..03/15): FAIL TC-04 (17.3s, BUG-03), TC-15 (repeat at 10.3s, BUG-04).
- Mobile Chrome: TC-04 19.4s fail, TC-15 repeat fail; TC-02 no activation (seed/load noise, re-run); rest pass.
- Safari Desktop: TC-01..12 ran; TC-04 24s fail; TC-03 12.9 vs 28.5 (WebKit noise?); TC-11 flag null in 8s (re-run). TC-13..17 not run.
- Mobile Safari: not run. Still open from bundle: BUG-06 (WIN257 100350512 active), BUG-07, BUG-09 (Control goal 100334268).

## ROUND 3 FIXES (2026-09-30) — written by us, NOT yet in Convert
Files: `local_testing/Local2/variation/vB.js` (Variation 1003184698), `win276-activation.js` (deploy 100350630),
`win276-control.js` (Control 1003184697). Deployment 100350629 unchanged.
- BUG-03: Variation waits `max(0, CRE276_triggerAt + 5000 - performance.now())`; activation sets triggerAt 0 on load, now() on refocus/bfcache.
- BUG-04: activation sets 30d `cre276_c2_shown` when Cohort 2 buckets (both arms) and excludes on it.
- BUG-07: Cohort 1 also needs Shopify `__ui` checkoutSessionIdentifier (WIN257 check). BUG-09: Control 100334268 push removed.
- Verify with `WIN276_LOCAL=1` (spec swaps these into the live bundle via page.route). New TC-18. Cohort 1 seeds now set `__ui`.
- Chrome Desktop on fixed code: 18/18 after re-running TC-01..04 (TC-04 6.7-6.8s; TC-15 no repeat; TC-17 5.4s). Results `results-r3-fix.jsonl`.
- BUG-06 (pause WIN257 100350512) is a Convert setting, still needed at launch.

## ROUND 4 (2026-09-30 PM) — client rewrite, bundle _s_t 2026-09-30 09:28:41Z. Chrome Desktop 12/20. NOT launch-ready.
Client did NOT use our R3 fixes; cohort logic moved into deployment helpers (getQualifyingCohort / setActiveCohort /
markCohort2Shown / recheckNow). Session clock back to activity model: `cre276_session_ts` (mousemove/keydown/scroll,
5s throttle, listeners attached only by armCohort2Tracking). New cookies: cre276_cohort2_shown, cre276_active_cohort (session).
Local vB.js/vB.css == live. Control unchanged. Spec seeds both left_at_ts + session_ts; results `results-r4.jsonl`; TC-19/20 added.
- NEW CRITICAL: Convert's Shopify integration POSTs `/cart/update.js {"attributes":{"__event":...}}` on every page load/goal.
  trackCartAdd treats it as an add -> armCohort2Tracking(): session_ts=now, cart_added_ts=now, cohort2_shown cleared.
  Race with the 3s check -> Cohort 2 usually never qualifies (TC-04/05/06/13 fail) and when it does the dedupe is wiped.
  Fix: ignore attributes-only bodies; arm only on ineligible->eligible transition (remember the eligible line key).
- NEW HIGH: ONE_HOUR_MS = 2 * 60 * 1000 (2 minutes) — debug value left in.
- NEW HIGH (BUG-02 regression): handleActivity does setSessionTs(now) BEFORE recheckNow() -> isNewSession() always false;
  idle-visible-tab return never shows (TC-19 fails). Listeners only on the ATC page load, so other pages never refresh the
  clock (TC-20 passed only because the __event POST keeps resetting it — masks the flaw).
- Still open: BUG-03 (Variation setTimeout 5000 after activation 3s), BUG-06 (WIN257 100350512 active), BUG-07 (TC-18 fails),
  BUG-09 (Control 100334268). Variation registers `waitForElement("body", init…)` twice (guarded, cleanup). exclusionLogicsApply now dead code.
- TC-03 control 17.1s vs variation 7.9s (Control slower — load noise pattern seen all day).
