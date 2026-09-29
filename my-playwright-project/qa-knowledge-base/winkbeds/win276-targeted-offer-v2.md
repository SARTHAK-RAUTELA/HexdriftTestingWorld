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
