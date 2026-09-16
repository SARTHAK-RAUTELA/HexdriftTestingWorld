# WIN266 (cre-t-266) — Shop Page "Select Sub-Total V2"

**Site:** winkbeds.com/pages/shop-winkbed
**Variation files:** `local_testing/Local2/variation/vB.js`/`vB.css` (V1), `v2.js` (V2) — **`v2.css` on file
is stale/unrelated** (leftover pay-com-au cre-t-13 modal CSS, same shared-scratch-file quirk documented for
SWF155/PAY19). Both V1 and V2's styling actually comes from `vB.css` via the shared `cre-t-266` body class.
**Report:** this file + `local_testing/Local2/win266-shop-subtotal-v2-qa-report.html` (screenshots embedded)
**Body class:** `cre-t-266` (coexists with `cre-t-202`)
**Force-preview URLs (client-supplied, control corrected mid-conversation — originally identical to V2's URL):**
control `_conv_eforce=100350521.1003184429` · V1 `...1003184430` · V2 `...1003184431`

## What this test does

Replaces the previous WIN253/cre-t-253 sub-total line (now shipped/permanent) with a new
`.cre-t-266-subtotal-line`, injected immediately before the Add to Cart button:
- **Control:** unchanged copy, "Your sub-total is $X" (now rendered through the *same* `.cre-t-266-subtotal-line`
  element as V1/V2 — see confirmed finding below).
- **V1:** "You're adding $X to your cart · Saving $Y"
- **V2:** "N item(s) selected · $X total · Saving $Y" — and, confirmed live but **not shown in Figma**, V2 also
  syncs the Add-to-Cart button label to "ADD N ITEMS TO CART" when N>1 (flagged as an open question for the
  client below).

Total = mattress price + Mattress Setup/Removal price (if selected) + checked accessory add-ons. Both variation
scripts bind a delegated `document` click listener on `.add-to-accessory-cart`/`.accessory-item-title` that
calls `scheduleSubtotalRefresh()`, which runs a 500ms-interval re-render for 3 seconds — intended to keep the
line live when an accessory is toggled.

## Automated test run — 2026-09-15 (FINAL, after fixes)

`my-playwright-project/testing/win266-shop-subtotal-v2.spec.js`, full matrix, `--workers=1`, run across three
passes same day: (1) initial full run surfaced BUG-02 + the WebKit timing issues below, (2) a click-method fix
was applied and re-verified against a live manual screenshot, (3) a second spec fix (real timing poll instead of
a near-no-op wait regex) plus a clean-environment re-run of the two WebKit-mobile projects produced the final
numbers below. See BUG-02 section for the full fix narrative.

**Final state — every TC that reached a clean run: 100% pass, all 7 browsers, both arms**, with one standing
exception (Safari Desktop TC-01, see WebKit section) and BUG-01 still an open (unretired) race condition.

| TC | Scenario | Chrome | Firefox | Edge | Safari | Mob. Chrome | Mob. Safari | Tablet iPad |
|----|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| TC-01 | Correct line variant renders per arm (control/v1/v2) | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 | ❌ 0/3\* | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 |
| TC-02 | Total = base+setup+accessories formula (v1/v2) | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 |
| TC-03 | Styling: 13.2px/600/white line, green Saving span (v1/v2) | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 |
| TC-04 | Platform Frame accessory (+$499) reflected in line (v1/v2) | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 |
| TC-05 | No `cre-t-266`-scoped console/page errors | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 |
| BUG-01 sampling | 5 fresh loads × v1/v2, Chrome Desktop only | ✅ 0/5 mismatches (both arms) | — | — | — | — | — | — |

\* Safari Desktop's TC-01 8-second `linePresent` poll timed out for control/v1/v2 in both the original run and
this final re-run — the only failure that survived all fixes. Its TC-02/03/04/05 all passed once the line had
rendered (proving the line does render, just slower than the 8s poll allows on this project). See WebKit section.

## Bugs found

### BUG-02 [RESOLVED 2026-09-15 — was a test artifact, not a live bug] — Subtotal line does not update when an accessory is added (scripted click only)

**Manually re-verified live 2026-09-15 (real click, Platform Frame, V1 arm): the line updates correctly** —
"You're adding $2,298 to your cart · Saving $771" and button text synced to "ADD 2 ITEMS TO CART"
(2298 = 1799 mattress + 499 Platform Frame, exactly the expected total). Screenshot confirmed this, which
pointed at a scripted-click-vs-real-click discrepancy rather than a production defect.

**Fixed and fully re-verified same day:** two issues in the spec were corrected -
1. `clickAccessoryByName()` used a JS-evaluated `cb.click()` (`isTrusted:false`) which the site's delegated
   listener doesn't react to the same way as a real pointer click. Switched to a real Playwright
   `locator.click({ force: true })` (force to route around the same popup-occlusion issue the old raw-DOM-click
   approach existed for).
2. The post-click wait (`waitForLineText` with a near-no-op regex matching *any* `$` figure) passed instantly on
   the stale pre-click read, racing ahead of the site's own `scheduleSubtotalRefresh()` (500ms-interval re-render
   lasting up to 3s) on fast browsers. Replaced with a direct poll on the parsed total (5s timeout) so the
   assertion actually waits out the site's own refresh window.

**Full re-run after both fixes, all 7 browser projects, both V1 and V2 arms: TC-04 passed 14/14 (100%)** -
Chrome, Firefox, Edge, Safari Desktop, Mobile Chrome, Mobile Safari, and Tablet iPad all correctly show the
subtotal line updating to $2,298 after checking Platform Frame. **BUG-02 is closed as a test-only false
positive** - the live subtotal-line update logic works correctly in production across every tested browser.

**Bonus finding from the real-click re-run:** V1 (`vB.js`) also shows the Add-to-Cart button syncing to
"ADD 2 ITEMS TO CART" after adding an accessory - but `vB.js` contains **no code that touches button text at
all** (confirmed via source read; only `v2.js` explicitly sets `btn.textContent`). This means the button-count
sync is **native WinkBeds site behavior present in all arms**, not V2-exclusive test logic as originally assumed
from the fake-click run. The spec's TC-04 assertion (previously hardcoding "V1 has no button-text sync logic")
was corrected to expect "ADD 2 ITEMS TO CART" for both arms.

<details>
<summary>Original (superseded) failure writeup, kept for history — click to expand</summary>

Before the fix, this reproduced 100% in every browser project that reached the assertion cleanly (Chrome, Edge,
Firefox, Safari Desktop, Mobile Chrome, Tablet iPad, both arms, 12/12 arm-runs) with the checkbox and the page's
own live accessory total updating immediately, but the *rendered* subtotal line text staying frozen at the
pre-click amount indefinitely (expected `2298`, received `1799`). At the time this looked like a genuine
functional regression rather than a timing flake, since it failed identically and deterministically across 6
browser engines. That read turned out to be wrong: it was the test's own scripted click + a too-weak wait
condition, both fixed above and disproven by the 14/14 clean re-run.

</details>

### BUG-01 [confirmed live during recon, MEDIUM, not reproduced in this run's bounded sample] — intermittent stale "Saving $0"

Per the spec's recon notes (12+ manual live trials, both V1 and V2): `strikeTotal()` reads
`.cre-t-202-box-strike-price` (a coexisting test's "Was $X" badge) which populates asynchronously *after*
`injectSubtotalLine()`'s first render. The only re-render chances are two short-lived polling windows fired
once from `init()` — if the badge's real value lands outside that window, the stale "Saving $0" is never
corrected (no persistent refresh loop exists after ~6s of page life). This run's bounded sample (5 fresh loads ×
2 arms, Chrome Desktop only, to keep total runtime reasonable) showed **0/10 mismatches** — clean this time —
but a clean sample doesn't retire a race condition; treat as still open per the original recon and re-sample
periodically.

### Confirmed non-blocking observation — old `.cro-subtotal-line` selector no longer exists

Carried over from last session and reconfirmed clean in this full run: WIN253's standalone `.cro-subtotal-line`
element no longer exists in the DOM at all (not merely hidden) — the legacy "Your sub-total is $X" copy for
control now renders through the *same* `.cre-t-266-subtotal-line` element used by V1/V2. The spec's TC-01 was
corrected for this last session and passed cleanly here in every browser except the WebKit trio (see below,
which is an environment-timing issue, not a selector issue).

## WebKit-engine timing/instability (Safari Desktop, Mobile Safari iPhone 12, Tablet iPad Gen 7)

**Update 2026-09-15, second re-run:** re-tested Mobile Safari and Tablet iPad in a clean environment (after
clearing orphaned browser processes left over from an earlier killed run that had put the machine under memory
pressure) and both came back **100% clean across all TC-01 through TC-05, both arms** — no timeouts at all. This
suggests at least some of the original WebKit timing failures documented below may have been caused or worsened
by system resource contention during that test session, not a pure site/WebKit rendering issue. **Safari
Desktop's TC-01 8-second poll timeout for control/v1/v2 did reproduce again in this same re-run** even before
the machine hit memory pressure, so that specific failure still looks like a genuine, repeatable Safari
Desktop-specific delay - the rest of the WebKit findings below should be treated as unconfirmed/environment-
dependent pending another clean re-sample.

All three WebKit-based projects — and *only* these three — showed failures around the async subtotal-line
injection that never occurred on Chromium (Chrome/Edge/Mobile Chrome) or Firefox in the **original** run:

- **TC-01's 8-second `linePresent` poll timed out** on Safari Desktop (2/3 arms), Mobile Safari (3/3 arms), and
  Tablet iPad (3/3 arms) — the injected line simply hadn't appeared in the DOM within that window, despite the
  same code and the same 2500ms post-load settle wait that works reliably on every Chromium/Firefox run.
- **Mobile Safari additionally hit a hard navigation failure**: `page.goto` timed out at 45000ms mid-run,
  which broke that arm's shared `beforeAll` page/context for the rest of its `describe` block — cascading into
  TC-02/TC-03 failing with "line not found" errors and TC-04/TC-05 never running at all (the 2 "did not run"
  tests). This matches the previously-documented "429 wall" pattern seen on this same WebKit/iPhone-12 project
  in the WIN257 test — see `_client-notes.md`.
- Not all WebKit runs failed: Tablet iPad's V1 TC-03 and V2 TC-02/TC-03 passed fine once the line had rendered,
  and Mobile Safari's V2 TC-05 (console-error check, unrelated to line rendering) passed — so this reads as a
  genuinely slower/less consistent async-injection timing under WebKit specifically, not total breakage.

**Recommendation:** if WinkBeds Playwright coverage continues to see this, consider a longer poll window
specifically for WebKit projects (`test.info().project.name`-gated timeout) rather than raising it universally,
since Chromium/Firefox are consistently fast.

## Additional test cases to consider

- Mattress Setup/Removal combo tiers interacting with the new line (covered for cre-t-253's older line, not
  re-verified against cre-t-266's rewritten total logic).
- A longer-sample BUG-01 re-check (more than 5 loads) if it's suspected to be traffic- or time-of-day dependent.
- A clean-environment re-sample of Safari Desktop's TC-01 timeout to confirm it's a genuine site delay and not
  another environment artifact, given Mobile Safari/Tablet iPad's failures didn't reproduce once resource
  contention was cleared.

## Issues found during development / environment quirks

See [_client-notes.md](_client-notes.md) for the full list (navigator.webdriver override, popup occlusion, raw
DOM clicks, Convert.com preview cookie persistence). New for this test: the WebKit async-injection timing note
above has been added there.
