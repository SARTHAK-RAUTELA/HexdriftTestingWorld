# BuckfireLaw exp. 100052509 — testimonial video card on internal (case-type) pages

**Test file:** `my-playwright-project/testing/buckfire-personal-injury-testimonial.spec.js`
**Report:** `local_testing/Local2/buckfire-personal-injury-qa-report.html`
**Screenshots:** `my-playwright-project/buckfire-13-screenshots/` (4 states × 6 projects = 24 PNGs)
**Design reference:** Figma screenshot supplied by client 2026-08-04 (desktop + mobile boards)
**Source under test:** `local_testing/Local2/variation/v2.js` (102 lines) · `v2.css` (79 lines)
**Site:** `https://buckfirelaw.com/case-types/personal-injury/`
**Test date:** August 4, 2026
**Browsers:** Chrome, Firefox, Edge, Safari (desktop) + Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12) — all 6 projects
**Variation class:** `BuckfireLaw_12` (⚠ reused from exp. 100052508 — see BUG-02) · component prefix `testimonial-card__`
**Experiment:** `100052509`
**Result:** 222 runs (37 tests × 6 browsers) → **210 passed / 12 failed**, 0 platform-gated skips.
The 12 failures are the same 2 issues on every browser — **zero functional and zero cross-browser failures.**

**Force URLs** (note: `utm_campaign=cre_qa`, *not* `cro_mode=qa` as on exp. 100052508):
- Variation: `https://buckfirelaw.com/case-types/personal-injury/?utm_campaign=cre_qa&_conv_eforce=100052509.1000256557`
- Control: `https://buckfirelaw.com/case-types/personal-injury/?utm_campaign=cre_qa&_conv_eforce=100052509.1000256556`
- Both inject reliably in headless Playwright.

### What this A/B test does

Injects a single video-testimonial card into the right-hand column of the internal case-type page,
immediately **before** `.blog-sidebar` (i.e. above the "How can we help you?" form), via
`insertAdjacentHTML('beforebegin', …)` on `.page-parent.page-child .section .blog-sidebar`.
The card is poster image + orange play button + gold headline + centred quote + italic attribution.
Clicking the poster lazily assigns `src`, switches on native `controls`, hides the poster, reveals the
`<video>` and plays.

### Verified working — matches the Figma (all 6 browsers)

| Area | Confirmed |
|---|---|
| Placement | Card is the element immediately before `.blog-sidebar`, inside the `col-md-5 col-lg-4` right column; left-aligns with and matches sidebar width (x=868, w=397 @1280); renders **above** the form (y=597 vs 986) — exactly as the Figma shows |
| Injection | Body class applied; exactly 1 card; dedup guard holds |
| Structure | `<video>` + poster + `h3` title + quote + attribution all present |
| Poster | `thumbnail_4.png` loads (`naturalWidth > 0`) on every browser |
| Lazy load | No `src` before click; `preload="none"`; `playsinline`; video `display:none` until played |
| Copy | Title, quote and alt text match the design exactly |
| Styling | Title `#D37935` / 24px / 600 / 36px line-height · quote `#363737` / 14px / 20px · attribution italic 14px · body borders `#D37935` left/right/bottom, none on top · content centre-aligned — **all match the Figma** |
| Ratio | Media box holds 428∶240 (measured 1.783) at every viewport, desktop and mobile |
| Max width | Card never exceeds the 428px design width, even at a 1600px viewport |
| **Video playback** | **Decodes and plays on all 6 browsers** — `readyState ≥ 2`, `currentTime` advances, `duration`/`videoWidth` non-zero, no `MediaError`; video fills the media box; re-click resumes without rewinding |
| Responsive | Card visible and within viewport at 390 and 768; ratio holds; **video still starts on tap at mobile** |
| Control | No body class, no card; sidebar anchor present |
| Stability | No page errors from the variation |

Both CDN assets (`thumbnail_4.png`, `Test12_video2.mp4`) return 206 on ranged GET.

### Bugs found

- **BUG-01 [LOW, copy] — attribution reads `-Denise's` (possessive); should be a name.**
  `v2.js:46` renders `<p class="testimonial-card__author">-Denise's</p>`. The **video's own lower-third
  caption reads "Denise C. — Medical malpractice — Actual Client"** (visible in
  `v2-card-playing-*.png`), so the intended attribution is `-Denise C.`, not a possessive. The Figma
  board shows the same `-Denise's` string, so **the typo originates in the design, not the build** —
  raise it with whoever produced the Figma rather than only patching the code. Sibling exp. 100052508
  renders the same person as `– Denise`, so the two tests are also inconsistent with each other
  (hyphen vs en-dash, possessive vs plain).

- **BUG-02 [MEDIUM, cross-test collision risk] — `variation_name` is still `BuckfireLaw_12`.**
  `v2.js:5` reuses the body class from experiment **100052508** (the Client Stories carousel), and
  `v2.css` scopes every rule to `html body.BuckfireLaw_12`. Two live experiments therefore share one
  body-class namespace. Today they target different URLs so nothing visibly breaks, but (a) if either
  is ever extended to the other's page the other's CSS activates too, and (b) the shared class makes
  Convert-side debugging and analytics segmentation ambiguous. Rename to e.g. `BuckfireLaw_13` before
  launch. Same class of issue as SWF137→CRE-T-144's `EventHandlerAddedTest137` collision.

- **BUG-03 [MEDIUM, a11y — WCAG 2.1.1 / 4.1.2] — the video cannot be started without a mouse.**
  Nothing in the card is focusable: `.testimonial-card__media` and `.testimonial-card__thumb` both
  report `tabIndex −1`, with no `role` and no `aria-label`. The click handler is bound to the poster
  `<img>` only (`v2.js:76`), and native `controls` appear *after* the first click, so there is no
  keyboard path to playback at all. Because the play button is poster artwork (see clarification
  below) there is also no real control for assistive tech to announce. Fix: wrap the media in
  `<button type="button" aria-label="Play Denise C.'s testimonial">`, or add `tabindex="0"` +
  `role="button"` + an accessible name + an Enter/Space keydown handler.

- **BUG-04 [LOW, dead code] — `.testimonial-card__play-button` is referenced but never rendered.**
  `v2.js:55` looks it up (`playBtn` is always `null`) and `v2.js:76` includes it in the `live()`
  delegation selector, where it can never match. Only `.testimonial-card__thumb` is actually clickable.
  Harmless today but misleading — either render the element or drop both references.

- **BUG-05 [LOW, robustness] — the play affordance depends entirely on one PNG.**
  The orange play button is **artwork baked into `thumbnail_4.png`**, not an element. If the poster
  404s or loads slowly the user sees an empty black 428∶240 box with no indication it is a video — the
  click target still works but is undiscoverable. A CSS/SVG overlay would be resilient *and* would give
  BUG-03 something focusable to attach to. Worth folding into the BUG-03 fix.

- **BUG-06 [LOW, code hygiene] — `waitForElement` called with 4 args but only accepts 2.**
  `v2.js:85-89` passes `(selector, callback, 50, 15000)`; the signature is `(selector, trigger)` and the
  interval/timeout are hardcoded inside, so the extra args are silently ignored. It works, but it is the
  exact shape of CRE-T-144's BUG-E (`waitForjQuery` called without its interval/timeout, which resolved
  to `undefined` and raced its own cleanup). Either accept and use the parameters, or drop them.

### Important clarification — the play button is NOT missing

Automated DOM probing initially suggested the Figma's orange play button was absent:
`.testimonial-card__play-button` count 0, no `<svg>` in the media box, no author pseudo-element.
**Screenshot comparison disproved that.** The button is clearly visible in the idle state
(`v2-card-desktop-*.png`) and gone in the playing state (`v2-card-playing-*.png`) — it is part of the
poster image. Design intent is met; only BUG-04 and BUG-05 remain from it.

**Lesson: never report a design element "missing" from DOM absence alone** — poster artwork can carry
it. Confirm against a screenshot before filing a design-mismatch bug.

### Test/harness notes

- **Firefox false pass (fixed in-spec):** Firefox returns `content: "-moz-alt-content"` for
  `<img>::before` — an internal alt-text rendering value, not author content. A naive
  `content !== 'none' && content !== 'normal'` pseudo-element check therefore reports a pseudo-element
  that does not exist, and TC-22 passed on Firefox while failing on the other 5. Chromium returns
  `"none"` for the same probe. **Any pseudo-element detection must exclude `-moz-alt-content`** (and
  empty strings) or it will diverge on Firefox only.
- **This page's video needs a long poll.** Immediately after the click the video reports
  `paused: false` but `readyState: 0` / `videoWidth: 0` for several seconds — a fixed 4s wait reads as
  "broken". Poll `readyState >= 2` with a 40s timeout before asserting playback.
- Playback assertions are gated on `canPlayType('video/mp4; codecs="avc1.42E01E"')`; all 6 projects
  decoded H.264 on this Windows machine (0 skips). Keep the gate for CI/Linux WebKit.
- Force-URL param on this experiment is **`utm_campaign=cre_qa`**, unlike exp. 100052508's
  `cro_mode=qa`. Copy the URL from the ticket rather than adapting the sibling test's.
- Per-project foreground runs, ~3.4–7.2 min each.

### Additional test cases to consider

- [ ] Re-run TC-13 and TC-33 after the copy fix and the a11y wrapper land.
- [ ] Keyboard-only pass once BUG-03 is fixed: Tab to the control, Enter/Space to play.
- [ ] Poster-failure case: block `thumbnail_4.png` and confirm a visible play affordance survives
      (currently it would not — BUG-05).
- [ ] Confirm behaviour on the **other** case-type pages if this rolls out beyond `/personal-injury/` —
      the anchor `.page-parent.page-child .section .blog-sidebar` is generic, so it may inject somewhere
      unintended.
- [ ] Once BUG-02 is fixed, assert the new unique body class and confirm exp. 100052508's CSS no longer
      matches this page.
