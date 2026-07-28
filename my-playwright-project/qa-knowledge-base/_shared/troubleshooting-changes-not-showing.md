# Troubleshooting: "Test/Variation Changes Don't Show"

> Use this whenever a client or teammate reports "the test is live but the changes don't show" — especially
> the classic shape: **preview/force link shows it fine, but a real (non-forced) visit to the page doesn't,
> until the user does something** (applies a filter, changes a ZIP, navigates a tab, etc.). Worked example:
> [CRE-T-144 / SWF144](../pet-insurance-gurus/cre-t-144-vet-faq-top.md) (BUG-E) on Pet Insurance Gurus.

## Step 0 — Don't trust the local file blindly

Before touching anything else, confirm the local `vB.js`/`vB.css` actually matches the *live* campaign for
the exact experiment/variation ID you were given:
- Fetch the live CRO platform bundle (Convert: `cdn-*.convertexperiments.com/v1/js/<account>.js`) and search
  for the experiment/variation ID and `variation_name` string. Compare function names against the local file.
- Supplied local files have been stale/wrong-test leftovers **multiple times** (SWF139/CRE-T-144 — see
  [pet-insurance-gurus/_client-notes.md](../pet-insurance-gurus/_client-notes.md)) — but don't assume that
  either; verify, don't guess. In the CRE-T-144 case this investigation confirmed the local file *did* match.

## Step 1 — Reproduce in a FRESH, cookie-free context — not your daily-driver browser tab

CRO platforms (Convert.com, VWO, Optimizely) set bucketing/assignment cookies. A browser tab that's been used
for repeated QA on the same domain across many past tests can carry stale state that makes an experiment look
permanently broken in *that specific tab*, when production traffic is completely unaffected. This is a real
trap: testing the same bug in a long-lived Chrome session vs. a clean context gave **opposite results** during
the CRE-T-144 investigation.

- Prefer a throwaway Playwright script using `browser.newContext()` (no `userDataDir`) — equivalent to a
  private/incognito window, guaranteed no leftover cookies.
- Re-run the exact repro steps the client described, in order, checking DOM state after each step.

## Step 2 — Confirm the DOM elements the script needs are actually present

Before suspecting the injected script's logic, directly check (via console or `page.evaluate`) whether every
selector the script waits on already exists at the moment the bug is observed:
```js
({
  targetSelectorExists: !!document.querySelector('SELECTOR'),
  jQueryLoaded: typeof window.jQuery !== 'undefined',
})
```
If everything the script needs is already in the DOM and it *still* doesn't run, the bug is not a missing
element — look upstream at the platform (Step 4), not the script's DOM-waiting logic.

## Step 3 — Catch silent failures directly

These variation scripts are almost always wrapped in `try { ... } catch (e) { if (debug) console.log(e) }`
with `debug = 0` in production — **real JS errors are invisible by default**. Two ways to surface them:
- Paste the script into the console with `debug` flipped to `1` and watch for thrown errors.
- Instrument *before* the repro action, then run it:
```js
window.__attempts = [];
const origAdd = DOMTokenList.prototype.add;
DOMTokenList.prototype.add = function (...args) {
  if (args.some(a => typeof a === 'string' && a.includes('YOUR-VARIATION-NAME'))) {
    window.__attempts.push({ args, t: Date.now() });
  }
  return origAdd.apply(this, args);
};
window.addEventListener('error', e => (window.__errors ??= []).push(e.message));
```
Also attach a `MutationObserver` on `document.body` to log every childList/class mutation — it tells you
whether *any* code is actively touching the DOM in response to the trigger action, even from unrelated
experiments sharing the same bundle (useful for ruling out "nothing on this site works right now").

## Step 4 — Decide: platform targeting gate vs. script-internal race

| Observed behavior | Likely cause | Fix location |
|---|---|---|
| Force/preview link always shows it. Real traffic on the bare landing URL never shows it — **zero** DOM-mutation attempts, **zero** errors — until the user changes the URL (filter, tab, zip) via pushState/query param | The CRO platform's own **Page/URL Targeting** condition is scoped too narrowly (e.g. requires a query param that's only present post-interaction). Force mode bypasses targeting entirely, which is exactly why force "works" but real bucketed traffic doesn't. | **Platform dashboard** (Convert "Page Targeting" / VWO "URL Targeting" / Optimizely "Audience") — broaden the URL condition. Not a code fix. |
| Sometimes shows, sometimes doesn't, same steps, same page — no clear pattern | A polling helper (`waitForElement`, `waitForjQuery`, etc.) is called **without** its delay arguments, and the function has no default parameter values for them. `setInterval(fn, undefined)` / `setTimeout(fn, undefined)` both resolve to ~0ms, so the "keep checking" interval races its own cleanup timeout instead of getting the multi-second window the code intended. | `vB.js` — pass explicit delay args at the call site, or add default parameter values to the helper function signature (see CRE-T-144 fix: hardcoded `50`/`15000` directly in the `setInterval`/`setTimeout` calls). |
| Never shows anywhere, not even on force/preview | Wrong/stale local file, a genuine JS error, or the experiment hasn't been published to the platform yet (renders current production state under force too — see [SWF146](../renters-insurance-gurus/swf146-badge-restyle.md)) | Depends — re-verify Step 0 first, then check `cro_mode=qa`/debug output |
| Shows on force, but your specific test browser/tab shows nothing ever, even after every trigger you try | Stale/exhausted bucketing cookie in *that one browser profile* from months of repeated QA on the same domain — not a real bug | Re-test in a fresh private window / fresh Playwright context (Step 1) before concluding anything |

## Step 5 — Verify the fix against production, not the developer's description

Once a dev says "fixed": **re-fetch the live bundle** and diff the actual published code against what they
described (variation names, function bodies) — don't take "I changed X" at face value, confirm X is actually
live. Then re-run the exact fresh-context repro from Step 1 against production one more time to confirm the
originally-reported symptom is gone.

## Related

- [_shared/qa-workflow.md](qa-workflow.md) — the Figma-first workflow for *new* tests (this doc is for
  debugging an *existing* live test that's misbehaving)
- [pet-insurance-gurus/_client-notes.md](../pet-insurance-gurus/_client-notes.md) — Convert.com force-URL
  conventions and site-specific quirks for this platform
