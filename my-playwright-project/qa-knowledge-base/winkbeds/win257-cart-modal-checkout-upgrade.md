# WIN257 — QA findings (recon + static review). Interim notes for the final report.

## Confirmed architecture (from Convert project JS cdn-4.convertexperiments.com/v1/js/1003415-1003290.js)

Three pieces, not one:

1. **Deployment `cre-t-257-deployment`** — id `100350217`, type `deploy`, status active, traffic 100%,
   location `10031829` (url contains winkbeds.com), **audience `10034538` = `cro_mode` cookie/param === 'qa'**.
   Body: `live('a[href="/checkout"]', 'mousedown', () => setSessionCookie('cre_257_checkout_visited','true'))`.
   This is the ONLY writer of the trigger cookie.

2. **Activation `creT257Activation`** — checks 4 conditions then `_conv_q.push(["executeExperiment","100350199"])`:
   - `cameFromCheckout()` = cookie `cre_257_checkout_visited === 'true'`
   - `hasCheckoutSessionIdentifier()` = localStorage `__ui[2][0].checkoutSessionIdentifier` truthy
   - `cartMeetsMattressCondition()` = exactly 1 cart item whose `title` includes 'winkbed', AND
     `!/frost\s*cooling\s*cover/i.test(item.variant_title)`
   - runs via `setTimeout(checkAllConditionsAndActivate, 5000)` — **the 5s delay lives here, not in vB.js**
   - re-runs on `pageshow` when `event.persisted` (back-forward cache), and clicks `.pop-cart__close` first

3. **Experiment `100350199`** — variations `1003183626` (control) / `1003183627` (variation) = the preview links.
   Carries vB.js + vB.css. Goal `100334269` = clicks_element `.cre-t-257-cta` (CTA tracking exists — good).

So qualification IS implemented (in the activation), and the 5s delay IS implemented. Those are NOT bugs.

## Ground truth from the live site

- Homepage `body#` = `winkbeds-luxury-hybrid-mattress-the-best-bed-for-better-sleep`
- shop-winkbed PDP `body#` = `winkbeds-luxury-hybrid-mattress-120-night-trial-lifetime-warranty`
- Catalog = 59 products, so `?limit=150` is safe (no pagination gap).
- The 4 real WinkBed products, each with 6 plain + 6 "<Size> with Frost Cooling Cover" variants:
  `the-softer-winkbed`, `the-plus-winkbed`, `the-luxury-firm-winkbed`, `the-firmer-winkbed`
  Sizes: Twin, Twin XL, Full, Queen, King, Cal. King  -> 24 plain + 24 cooled, matches transcript.
- Handle lookup in vB.js resolves exactly 1 product per firmness slug — verified for all 4.
- Happy-path parse verified live: cart item `The LUXURY FIRM WinkBed - Twin` -> firmness "Luxury Firm",
  baseSize "Twin" -> finds variant `Twin with Frost Cooling Cover` (id 47108603052219). Swap logic works.
- GravityLux / EcoCloud titles do NOT contain "winkbed" -> correctly excluded.
- Coexisting live tests on the PDP body: cre-t-177, CRE-T205, cre-t-219, cre-t-251, cre-t-202, cre-t-202-v2,
  cre-t-227, cre-t-200, Class_WIN63, plus cre-t-108 / cre-t-133 logging. cre-t-133 logs
  "manual-trigger-133 [Redirecting to shop page...]" on the homepage.
- Pre-existing console noise to filter in "no JS errors" assertions: fenixcommerce CORS/XHR failure,
  `layout.theme.js` "TypeError: Failed to fetch", Clear-Site-Data info lines on /cart/update.js.

## BUGS

### BUG-01 [CRITICAL] Modal can only ever render on the shop-winkbed PDP; spec says any page
`vB.js:257` gates init on `waitForElement("body#winkbeds-luxury-hybrid-mattress-120-night-trial-lifetime-warranty")`
and `vB.js:196` injects into that same selector. Transcript 2:39: "It's modal. It'll appear on any page on the
site." The homepage body id differs (verified above), so on the homepage — which is exactly where both supplied
preview links land — `waitForElement` times out after 15s and init never runs. Every non-PDP page: silent no-op.
Fix: gate on `body`, inject into `document.body`.

### BUG-02 [CRITICAL] Cart is mutated before the replacement is resolved; failure leaves the cart broken
`vB.js:99-135` removes the original line item, THEN fetches /products.json and looks up the product/variant.
Every failure path after the removal (`!product` -> line 120, `!targetVariant` -> line 129) returns with the
mattress already deleted. The code's own comments admit this. Fix: resolve the target variant id FIRST, then
remove+add (or add+remove), and roll back on failure.

### BUG-03 [CRITICAL] Redirect to the discounted checkout fires even when the swap failed
`vB.js:217-218`: `await upgradeWinkbedToFrostCooling(); window.location.href = ".../discount/FROST3S1CFP?redirect=/checkout"`.
The function returns `undefined` on all 5 abort paths, but the redirect is unconditional. Combined with BUG-02
the user lands on checkout with the mattress missing and a $125 discount armed. Transcript 4:21 is explicit:
"once we're confident that that change has been applied, we're going to send them". Fix: only redirect on a
verified updated cart; on failure restore the cart and surface an error.

### BUG-04 [HIGH] "winkbed" substring match has false positives in the live catalog
Both `vB.js:64` and the activation's `cartMeetsMattressCondition` use `item.title.toLowerCase().includes('winkbed')`.
Live products that also match: `The WinkBed Kids Mattress - Standard Profile`, `The WinkBed Kids Mattress - Low
Profile`, `WinkBeds Blue Collection - B1`, `WinkBeds Blue Collection - B2`. Consequences:
 (a) Cart = 1 Blue Collection B1 only -> activation qualifies it -> modal shows -> CTA cannot parse firmness
     (`vB.js:85`) -> abort -> but BUG-03 still redirects to checkout with the $125 code. Discount, no upgrade.
 (b) Cart = 1 real WinkBed + 1 Kids Mattress -> `winkbedItems.length === 2` -> activation blocks (correct
     outcome by luck), but if the modal is ever shown by another path, vB.js aborts and still redirects.
Fix: match on the 4 known handles (`the-{softer,plus,luxury-firm,firmer}-winkbed`) or on product id, not a
title substring.

### BUG-05 [HIGH] Quantity is not checked — "one mattress" is enforced as "one line item"
`winkbedItems.length !== 1` counts line items. A single line with `quantity: 2` passes. Transcript 1:45:
"they have one WinkBed mattress in their cart. Not two or three or four." Worse, `vB.js:144` re-adds with the
same `quantity`, but the Figma note says the code is "limited to 1 per order" — so a qty-2 swap adds $250 of
upgrade and discounts only $125. Customer is overcharged $125 vs. the promise. Fix: require
`winkbedItems[0].quantity === 1` in both the activation and vB.js.

### BUG-06 [HIGH] CTA is not disabled on click — double-click causes concurrent cart mutations
`vB.js:212` binds via delegation with no in-flight guard; it only adds a body class for the spinner. Two rapid
clicks start two `upgradeWinkbedToFrostCooling()` runs; the second reads /cart.js before the first removal
lands, so both proceed -> double remove/add, or an add of qty 2. Fix: set an `inFlight` flag and
`pointer-events:none` on the CTA.

### BUG-07 [HIGH] No error handling; a network failure leaves a permanent spinner and a broken cart
`upgradeWinkbedToFrostCooling` has no try/catch and none of the 4 `fetch`es check `res.ok`. A rejection
propagates out of the async `live` handler as an unhandled rejection — the outer `try/catch` at `vB.js:2`
cannot catch it (it has already returned). The spinner (`body.cre-t-257-cta-clicked`) is never cleared and the
CTA text stays hidden, so the modal is visibly dead. Fix: try/catch/finally, clear the spinner class, check
`res.ok`, show a retry state.

### BUG-08 [MEDIUM] Trigger cookie only arms on `a[href="/checkout"]` mousedown — most checkout paths miss it
The deployment binds one selector. Not covered: the `/cart` page checkout button (Shopify renders a
`<button name="checkout">` in a form), accelerated checkout (Shop Pay / PayPal / Google Pay), "Buy it now",
and any direct navigation to /checkout (history, bookmark, our own recon). Those users visit checkout, return,
and never see the offer — under-triggering the test. Verified: `page.goto('/checkout')` left the cookie unset.
Fix: also set the cookie on a `/checkouts/` pathname check at page load, or bind the cart-page submit.

### BUG-09 [MEDIUM] Deployment is gated to `cro_mode=qa`, so the trigger never arms for real traffic
Audience `10034538` on deployment `100350217` requires `cro_mode` === 'qa'. Correct for QA, but this must be
removed before launch or the experiment can never activate in production. Flag as a go-live checklist item.

### BUG-10 [MEDIUM] Cookie is deleted on first show, before the user acts
`vB.js:251` `removeSessionCookie` runs inside init as soon as the handler binds. If the visitor navigates
(or the modal never renders because of BUG-01) the offer is consumed and cannot return. Also the cookie has
no `SameSite`/`Secure` attributes. Decide intended frequency capping and document it — the spec is silent.

### BUG-11 [MEDIUM] Modal is not keyboard operable and a11y roles are invalid
`role="button" tabindex="0"` on `.cre-t-257-modal-close` and `.cre-t-257-cta` with click-only handlers ->
Enter/Space do nothing. No Escape-to-close. No focus move into the dialog, no focus trap, background not
`aria-hidden`. `role="dialog"` is on BOTH the empty overlay and the container (`vB.js:157-158`). `role="text"`
is not a valid ARIA role. `role="heading"` has no `aria-level`. Body is not scroll-locked.

### BUG-12 [LOW] Variant-title string matching is brittle
`vB.js:125-126` builds `"<size> with Frost Cooling Cover"` and requires exact lowercase equality. It works
today (verified) but any catalog rename silently routes into BUG-02/03. Prefer matching on the option value.

### BUG-13 [LOW] Hardcoded absolute redirect host
`vB.js:218` hardcodes `https://www.winkbeds.com/...`, so the flow breaks on any other host/preview domain.
Use a relative path.

## Spec-conformance items still to verify live (need the modal actually rendered)
- Copy matches Figma exactly (eyebrow / title / body / price line / CTA label, all casing).
- Overlay darkens page; wrapper gradient `#e8f1f5`->`#f3f7f8`; 5 snowflakes; shadow; blur(5px) on
  `main.main`,`header.site-header`,`.desktop-promo-container` — note footer is NOT blurred.
- Click-outside dismiss, close-icon dismiss.
- Responsive: 674px max-width, mobile title 28px/34px, the 8 max-height scale steps, snowflake overlap at 375px.

---

## SESSION 2 (2026-08-06) — corrections, new finding, run results

### BUG-03 was OVERSTATED — corrected
The redirect is unconditional only on the **four `return` abort paths** (vB.js:69, 87, 121, 134).
A *thrown* error (e.g. an aborted /products.json fetch) propagates out of the async `live`
handler and the `window.location.href` on vB.js:218 is never reached. That is why TC-32
observes NO redirect. Do not claim "the redirect always fires on failure" — it fires on the
returns, not on throws. The two paths that return AFTER the removal (121, 134) empty the cart;
the two that return BEFORE it (69, 87) leave the cart intact.

### BUG-14 [CRITICAL] NEW — $125 discount armed with no upgrade, no error (TC-40)
Proven live on Chrome + Firefox. `WinkBeds Blue Collection - B2` (Twin) satisfies the
substring test in BOTH the activation's `cartMeetsMattressCondition` and vB.js:64, so the
modal is offered. The firmness parse at vB.js:85 cannot match "Blue Collection", so
`upgradeWinkbedToFrostCooling` returns at line 87 — **before any cart mutation**. The
redirect on line 218 still fires.
Observed: zero cart writes, cart unchanged (`Blue Collection - B2 - Twin x1`), and
`https://www.winkbeds.com/discount/FROST3S1CFP?redirect=/checkout` requested.
Net effect: a live $125 code with no upgrade delivered and no error surfaced. Revenue loss.
This is the reachable, real-traffic consequence of BUG-04 + BUG-03 combined — fix BUG-04
(match on the 4 handles) and BUG-03 (gate the redirect) together.

### TC-38 RESOLVED — not a bug
`404 /assets/underline_blue.svg` is referenced by neither vB.js nor vB.css — a pre-existing
first-party site 404. Also seen: a `layout.theme.js` `compare_at_price` TypeError and 13x
`503 /.well-known/shopify/monorail`. All site noise. TC-38 was rewritten to attribute
positively (match cre-t-257's own class prefix, assets and vB.js console strings) instead of
denylisting third-party noise, which was unbounded and made the case flaky. Worth telling
the client about the underline_blue 404 separately.

### FOUR HARNESS DEFECTS FIXED (were masquerading as product bugs)
1. `readCart` used an in-page `fetch`. Group D aborts the discount redirect, and Chromium
   commits an **error-page document** for a failed main-frame navigation, so the relative
   fetch threw "Failed to fetch" / "Execution context was destroyed". 5 group-D cases failed
   on this. Now reads out of band via `page.context().request`. Verified same cart session
   (identical cart token from both paths).
2. `injectVariation` slept a fixed 1200ms. vB.js:257 polls on a 50ms `setInterval`, which
   Firefox throttles on this ~1.8MB page — the modal was measured arriving between **1.2s and
   3.0s**. This reported "modal never renders on Firefox" as a product bug. Now polls for
   `.cre-t-257-modal-overlay` (8s cap, absence tolerated for negative cases).
3. TC-04 measured the 5s activation delay as Playwright wall-clock after `domcontentloaded`.
   That timer is anchored to when Convert's JS runs (>= navigationStart), so on slower Edge
   the checkpoint landed past the 5s mark and the case failed spuriously. Now measured
   in-page with `performance.now()`, which actually verifies the delay.
4. TC-35 asserted absolute `documentElement.scrollWidth`. winkbeds.com already overflows by a
   varying amount depending on which coexisting CRO tests rendered, so the site's overflow was
   attributed to our modal. Now takes a pre-injection baseline and asserts the delta.

### TC-10 redesigned
It previously used `injectVariation`, which renders the modal unconditionally and therefore
could not test a qualification gate at all. Now uses the REAL activation path (14s wait, no
injection) plus a seed guard, so a failure means the activation genuinely qualified
`winkbeds-blue-collection-b1`. It fails on Chrome, Firefox AND Edge — BUG-04 confirmed
end-to-end, not just by code reading.

### Case count is now 43 (was 39)
TC-30 is 4 combos, and TC-40 is new. Group D = 9 cases (TC-30 x4, 31, 32, 33, 34, 40).

### RESULTS

| Project | Run | Pass | Fail | Notes |
|---|---|---|---|---|
| Chrome Desktop | 43/43 | 36 | 7 | complete; all 7 are intended spec reds |
| Firefox Desktop | 43/43 | 35 | 8 | complete; extra red = TC-33 |
| Edge Desktop | 43/43 | 35 | 8 | complete; per-case outcomes IDENTICAL to Firefox |
| Mobile Chrome (Pixel 5) | 43/43 | 35 | 8 | complete (2026-08-07); IDENTICAL outcome set to Firefox/Edge |
| Safari Desktop | 2/43 | 2 | 0 | TC-01, TC-03 only; blocked by 429, see SESSION 3 |
| Mobile Safari (iPhone 12) | 0/43 | — | — | not run |
| Safari Desktop | 1/43 | 1 | 0 | TC-01 passed; rest blocked by HTTP 429 |
| Mobile Chrome (Pixel 5) | 0/43 | — | — | not run (429) |
| Mobile Safari (iPhone 12) | 0/43 | — | — | not run (429) |

Expected-red set (assert the Figma/transcript spec, not current code):
TC-02 (BUG-01), TC-08 (BUG-05), TC-10 (BUG-04), TC-28 + TC-29 (BUG-11), TC-32 (BUG-02),
TC-40 (BUG-14). Plus TC-33 (BUG-06) on Firefox and Edge.

**TC-33 / BUG-06 is a TIMING RACE, not an engine difference — earlier reading corrected.**
It was first recorded as "fails on Firefox, passes on Chrome, so Chromium serialises the
concurrent runs". Edge then finished and **also fails it** — and Edge is Chromium. So there is
no engine-level protection anywhere; the outcome just depends on request timing, and Chrome's
green is luck on the day. Do not run TC-33 once per engine and call it covered; run it
repeatedly. Treat BUG-06 as reproducible on every browser.

### ENVIRONMENT: HTTP 429 hard stop (new gotcha)
After ~2h of sustained matrix runs, in-page `/products.json` began returning **HTTP 429 with
an HTML `<title>Verifying your connection...</title>` page**. `.json()` then throws
"Unexpected token '<'", which looks like a catalog bug. Plain `curl` still returned 200, so
the limiter keys on the browser session/volume, not the IP alone.
Mitigations now in the spec: the catalog is fetched **once per run** and cached (was once per
test — ~43 x 1MB per project, by far the largest load), with linear backoff over 5 attempts on
429/non-JSON; and `setCart` skips clear+add when the cart already matches. Note cart reuse
only helps *within* a test, since Playwright gives each test a fresh context.
If you see 429: stop, wait, resume. Do not interpret it as a product defect.

**Second 429 window (same day):** the limiter cleared after a short pause — Edge then ran to
completion — and re-tripped right after Edge's group D (9 real cart-write cycles). WebKit
sessions were then refused within ~1s. An in-page retry of 4 attempts over 48s on `/cart.js`
was added and was STILL refused every time, so this is not solvable with backoff inside a test.
Throughout both windows plain `curl` to `/cart.js` and `/products.json` returned HTTP 200, so
the limiter keys on the automated browser session, not the IP.
**Third window — the quota is now nearly exhausted, and it is NOT just group D.** A single
isolated Safari test (TC-03) passed cleanly in 33s. Immediately afterwards a batch of 12
group-A cases re-tripped the limiter: 10 of them failed with
`/cart.js unusable after 4 attempts — HTTP 429`, each burning 48s of backoff first (~50s per
case, ~10 min for nothing). Group A does no cart *writes* beyond seeding — so plain seeding
volume is now enough to trip it.

Practical guidance for resuming:
- Budget the matrix across sessions. Three full browsers (Chrome, Firefox, Edge = 129 cases)
  appears to be roughly the daily quota from one IP/session pattern.
- Group D is the most expensive part; run at most one browser's group D per window.
- The in-test 429 backoff is a *diagnostic*, not a fix — when the quota is gone it just makes
  each failure cost 48s. Consider `--retries=0` and small chunks so a throttled window is
  detected in one case rather than twelve.
- WebKit is confirmed working when the quota allows (TC-03 passed on Safari Desktop: the modal
  renders correctly). So the WebKit gap is a throttling problem, not a compatibility one.
- If full WebKit coverage cannot be scheduled, a high-value smoke subset is: TC-03 (render),
  TC-13 (copy), TC-24 + TC-25 (dismissal), TC-35 (responsive), one TC-30 combo (swap),
  TC-40 (discount-without-upgrade). ~7 cases, spaced out.

---

## SESSION 3 (2026-08-07) — Mobile Chrome completed, WebKit diagnosed and partly fixed

### Mobile Chrome (Pixel 5): complete, one harness bug found and fixed
Ran to completion at 43/43 (35 pass / 8 fail), matching Firefox/Edge exactly. Along the way,
TC-04 initially false-failed: its give-up deadline (`performance.now() > 20000`) was anchored
to `navigationStart`, same as the arrival-time measurement. But the poll only starts after
`page.reload()` resolves `domcontentloaded`, which lands at ~16-20s on Mobile Chrome — leaving
0-4s of budget against an activation that needs 5s. Fixed by anchoring the deadline to
poll-start instead of navigationStart (arrival-time measurement is unchanged). TC-04 passes on
Mobile Chrome after the fix; TC-10 (which waits 14s on the same real activation path) already
proved activation works on mobile, so this was purely a false red.

### WebKit root cause found: domcontentloaded never fires reliably on this page
Confirmed directly (standalone script, not a test assumption): WebKit can leave
`document.readyState` at `loading` for **over 2 minutes with ZERO pending network requests**.
Not a network problem, not fixable by raising a timeout on `domcontentloaded`. The `<head>`
parses slowly (1 -> 28 -> 70 -> 116 children observed) and `<body>` only appears ~20-25s in.
Fix: WebKit-only navigation now uses `page.goto(url, {waitUntil:'commit'})` +
`page.waitForSelector('body', {state:'attached'})` +
`page.waitForFunction(() => document.body.childElementCount > 5)` (see `settle()`,
`go()`, `reloadPage()` near the top of the spec). Chromium/Firefox are untouched (`isWebKit()`
gate) — every already-banked Chrome/Firefox/Edge/Mobile-Chrome result stands.

### Self-inflicted bug found and fixed same session: reload() infinite recursion
Adding the WebKit path required renaming raw `page.reload({waitUntil:'domcontentloaded'})`
call sites to a new `reloadPage()` helper via a repo-wide `replace_all` edit. That edit also
matched the literal `page.reload(...)` line *inside* `reloadPage()`'s own non-WebKit branch,
turning it into `await reloadPage(page)` — infinite recursion / stack overflow for every
non-WebKit browser. Caught before any run used the broken file (Mobile Chrome had already
finished before this edit was made) and fixed by hand. Lesson: after a `replace_all` that
introduces calls to a new wrapper function, re-read the wrapper's own body — it's the one
place a self-matching replacement is invisible in a diff-by-count check.

### Two more WebKit-only harness gaps found once navigation actually worked
1. `page.screenshot()` timed out ("waiting for fonts to load...") at the default 20s
   `actionTimeout` on TC-03/TC-35. Fixed with an explicit `timeout: 45000` on both calls.
2. `settle()`'s `waitForFunction` budget (60s) was too tight for a reload immediately after a
   cart write under real test conditions (it was fine in isolation at ~22s). Raised to 90s.
   Even so, in the batch that revealed the 429 escalation below, this step failed identically
   on TC-01/TC-03/TC-13 within a couple seconds each — which turned out to be the 429 page,
   not a slow real page (see below). The 90s budget itself is unconfirmed as sufficient; retest
   once the quota resets.

### NEW: the 429 limiter escalated to block raw page navigation, not just cart calls
Previously (session 2) the limiter targeted `/products.json` and `/cart.js` specifically.
Earlier in *this* session (before the batch above), a targeted probe showed a narrower
picture: out-of-band GET requests still returned 200, only in-page `fetch()` and
`/cart/add.js` (even out-of-band) were 429'd. Mobile Chrome's full run completed cleanly in
that window. Immediately after ~3 more minutes of WebKit testing on top of that, a fresh probe
showed **`page.goto()` on the bare PDP URL itself now returns HTTP 429** — the block has moved
up to full navigation, worse than any previously recorded state. This is why TC-01 (previously
a guaranteed pass) failed in the same batch: it never reached a real page.
**Practical conclusion:** today's cumulative volume (full Mobile Chrome matrix + several
diagnostic probes + a live batch) was enough to trip navigation-level throttling. Stopped
immediately per standing guidance ("if you see 429: stop, wait, resume — do not interpret it
as a product defect"). No further WebKit attempts should run until a longer cooldown than the
one used between sessions 2 and 3 — likely a fresh calendar day, based on the "roughly 3 full
browsers/day" pattern holding even when one of the three is a partial/diagnostic-heavy run.

### Status entering the next session
- Safari Desktop: still 2/43 (TC-01, TC-03) — genuinely NOT RUN for the other 41, not failed.
  The harness should now work once the quota resets (navigation fix + screenshot fix + settle
  budget all in place), but this is UNVERIFIED beyond the single successful validation run
  earlier in this session (before the escalation).
- Mobile Safari: still 0/43, untouched this session.
- Do not re-probe or re-attempt WebKit in the same session as a large non-WebKit run again —
  run WebKit diagnostics/attempts in their own session/window to preserve quota headroom.

---

## QA RUN STATUS (session 1 — superseded by SESSION 2 above)

Spec: `my-playwright-project/testing/winkbeds-win257-cart-modal.spec.js` (39 cases x 6 projects).
Several cases assert the Figma/transcript spec and are EXPECTED TO FAIL against current code —
a red TC-02 / 08 / 10 / 28 / 29 / 32 / 33 is the bug being surfaced, not a broken test.

### Completed
- Chrome Desktop, TC-03 + TC-13: PASS (modal renders on PDP; copy matches Figma exactly).
- Chrome Desktop, groups B/C/E (22 cases): **19 passed, 3 failed** in 6.7 min.
  - TC-28 FAIL -> Escape does not close the modal. CONFIRMS BUG-11.
  - TC-29 FAIL -> Enter on focused close icon does nothing. CONFIRMS BUG-11.
  - TC-38 FAIL -> INCONCLUSIVE. Three console errors (404, 409, 404) with no URL attached.
    The 409 is plausibly the harness's own /cart/clear.js -> /cart/add.js sequence.
    Snowflake + close assets are fine (TC-18, TC-21 passed on naturalWidth > 0).
    Re-run capturing `response.url()` before calling this a bug.

### Correction to BUG-11
The "no scroll lock" sub-claim is WRONG — TC-39 PASSED on Chrome desktop (background does not
scroll behind the modal). The keyboard/Escape half of BUG-11 stands; drop the scroll-lock half.

### Outstanding
- Groups A and D on Chrome Desktop.
- All of Firefox, Edge, Safari, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12).
- HTML QA report (`local_testing/Local2/winkbeds-win257-qa-report.html`) — deliberately NOT written
  yet; it should carry real per-browser pass/fail numbers, not placeholders.

### Environment notes for whoever resumes
- `playwright.config.js` pins `workers: 1`, so a full 234-test matrix is ~1.5-2h wall clock.
- Bash calls here cap at 600s (10 min), so the matrix MUST be chunked. ~7 min per project per
  group-subset. Do not pass a long `timeout` to a background run — that is what killed the
  first attempt.
- Standalone node scripts need `export NODE_PATH=<repo>/my-playwright-project/node_modules`.
- Group D performs REAL cart mutations on production winkbeds.com (7 per browser, 42 total).
  It cleans up after itself, but get explicit sign-off before running it.
- Useful selectors: `-g "TC-1[3-9]|TC-2[0-9]|TC-3[5-9]"` = groups B/C/E (no cart writes).
