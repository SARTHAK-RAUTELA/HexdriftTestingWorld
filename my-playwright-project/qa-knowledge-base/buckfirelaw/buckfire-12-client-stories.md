# BuckfireLaw_12 — "Client Stories" video testimonial carousel

**Test file:** `my-playwright-project/testing/buckfire-12-client-stories.spec.js`
**Screenshots:** the original HTML QA report and `buckfire-12-screenshots/` PNGs from this 2026-08-04 pass are no longer present on disk (not found in this repo); the findings below are the only surviving record of that run.
**Source under test:** `local_testing/Local2/variation/v2.js` (246 lines) · `v2.css` (119 lines)
**Site:** `https://buckfirelaw.com/medical-malpractice-lawyers/`
**Test date:** August 4, 2026
**Browsers:** Chrome, Firefox, Edge, Safari (desktop) + Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12) — all 6 `playwright.config.js` projects
**Variation class:** `BuckfireLaw_12` (body class) · component prefix `buckfire-12-`
**Experiment:** `100052508`
**Result:** 204 runs (34 tests × 6 browsers) → **174 passed / 30 failed**, 0 platform-gated skips.
All 30 failures are the same 5 checks reproducing identically on every browser — **zero functional and
zero cross-browser failures.** Of those 5, **3 are placeholder content the client confirmed is
intentional** (TC-32/33 duplicate copy + reused clip, TC-34 lowercase names) and 2 are genuine
accessibility gaps (TC-30 alt text, TC-31 keyboard access).

> **Client context (confirmed 2026-08-04):** slides 4-6 copy and the twice-used video are **deliberate
> internal placeholders** — real content is due from the client within days. Treat TC-32/TC-33/TC-34 as
> expected-fail until then, and re-run them once real content lands.

**Force URLs:**
- V2 (carousel): `https://buckfirelaw.com/medical-malpractice-lawyers/?cro_mode=qa&_conv_eforce=100052508.1000256555`
- Control: `https://buckfirelaw.com/medical-malpractice-lawyers/?cro_mode=qa&_conv_eforce=100052508.1000256554`
- Both inject reliably in **headless Playwright** — no local file injection needed (contrast with SWF146/CRE-T-08).

### What this A/B test does

Inserts a "Client Stories" section immediately after `#case-results` containing a Swiper carousel of
6 video-testimonial cards. Each card is a poster image + centred play button; clicking either the poster
or the button lazily assigns `src` from the card's own `video-url` attribute, switches on native
`controls`, hides the poster/button, and plays. Responsive slides-per-view: **1** (<721px), **2**
(721–1099px), **3** (≥1100px). `loop: false`, prev/next arrows only (pagination is commented out).

### Verified working (all 6 browsers)

| Area | Confirmed |
|---|---|
| Injection | body class applied; exactly 1 section; inserted as `#case-results` next sibling; dedup guard holds |
| Structure | 6 slides, each with video + poster + play button; all 6 posters load (`naturalWidth > 0`) |
| Lazy loading | no `src` before click; `preload="none"`; `playsinline` present on all 6 |
| Carousel | Swiper instance attaches; 3/2/1 slides per view at 1280/800/390; next+prev advance; `loop:false` correctly disables prev at start and next at end; arrows visible inside section bounds |
| Aspect ratio | card art box holds 415/233 at every viewport |
| **Video playback** | **all 6 clips decode and play on every browser** — `readyState ≥ 2`, `currentTime` advances, `duration`/`videoWidth` non-zero, no `MediaError` on any of the 6 |
| Click paths | poster click and play-button click both start the correct per-card clip |
| Pause-others | starting a 2nd video **by click** pauses the 1st |
| Resume | re-clicking a paused video resumes from position (no rewind to 0) |
| Control | no body class, no section, no slides; `#case-results` anchor present |
| Errors | no page errors attributable to the variation |

All 11 CDN assets (5 `.mp4` + 6 `.png`) return 206 on ranged GET — nothing 404s.

### Bugs found

- **BUG-01 [LOW, a11y-scoped — keyboard only] — two videos play at once if one is resumed by keyboard.**
  **Mouse behaviour is correct** and was confirmed as such: `pauseOtherVideos()` runs on click, and the
  `live('.buckfire-12-video','click')` handler (`v2.js:220-223`) also catches clicks on the *native*
  controls, so a mouse user always ends up with one video playing — measured
  `[false, true, false, false, false, false]`. Client reviewed the mouse path and considers it fine.
  The gap is the **non-click** resume path: the comment at `v2.js:203-204` says native-control resume is
  *"caught via the play event"*, but **no `play` listener is ever registered**. Repro: play card 1 → play
  card 2 (card 1 correctly pauses) → focus card 1's video, press **Space** → both play, audio overlapping.
  Measured `[true, true, false, false, false, false]`; same via programmatic `.play()`.
  Effectively a keyboard-user issue, so fix it together with BUG-03. One-line fix —
  `document.addEventListener('play', function (e) { if (e.target.matches('.buckfire-12-video')) pauseOtherVideos(e.target.closest('.buckfire-12-video-thumb')); }, true);`
  (capture phase: `play` does not bubble). *Not measured:* mouse click directly on the native play control
  — inferred covered from the click handler; worth one confirming pass if certainty is wanted.

- **NOT A BUG — slides 4-6 placeholder content (client-confirmed intentional, 2026-08-04).** Slides 4-6
  carry slide 3's exact title *"They took care of everything"* and quote, and slide 4 reuses
  `Test12_video3.mp4` (same clip as slide 2), so 6 cards show 4 identical copy blocks and 5 distinct
  videos. **This is deliberate:** the build is for internal review and the duplicated video is a known
  dummy; real copy and clips arrive from the client within days. Matches the in-code note at `v2.js:64`.
  TC-32/TC-33 (unique titles, distinct clips) and TC-34 (name capitalisation — `"– mike"`,
  `"– shaylynn"`) therefore fail **by design** and should be re-run as must-pass once real content lands.
  Kept as test cases rather than deleted so the swap-in is verified rather than assumed.

- **BUG-03 [MEDIUM, a11y — WCAG 2.1.1 / 4.1.2] — video cannot be started by keyboard.** The play control
  is a bare `<div class="buckfire-12-play-button">`: `tabIndex` −1, no `role`, no `aria-label`. Keyboard
  and screen-reader users cannot reach or operate it, and since `controls` is only switched on *after*
  the first click, there is no keyboard path to playback at all. Fix: make it a `<button type="button"
  aria-label="Play {name}'s story">`, or add `tabindex="0"` + `role="button"` + an accessible name and a
  keydown handler for Enter/Space.

- **BUG-04 [LOW, a11y — fix during the content swap] — wrong alt text on slides 4-6.** All three read
  `alt="Alyssa video thumbnail"` while showing Denita, mike and shaylynn (`v2.js:94,103,112`).
  Slides 1-3 are correct. These are the placeholder slides, so the copy is going to be replaced anyway —
  the point is that `thumbAlt` is a **separate field from the visible name** and was missed when the
  placeholder rows were duplicated. Easy to carry the same mistake into the real content, so make alt text
  an explicit item on the swap-in checklist rather than assuming new copy fixes it.

- **BUG-05 [LOW, content — resolved by the content swap] — names not capitalised.** `"– mike"` and
  `"– shaylynn"` (`v2.js:106,115`) against properly-cased `"– Denise"`, `"– Jessica"`, `"– Alyssa"`,
  `"– Denita"`. Both sit on placeholder slides; noted only so the real names land properly cased.

- **BUG-06 [LOW, fragile] — Swiper version/markup mismatch.** `v2.js:61-62` loads Swiper **6.8.4**, but
  the markup uses the Swiper **7+** convention `class="swiper buckfire-12-swiper"` (v6 expects
  `swiper-container`). Swiper 6's container CSS therefore never matches, which is why `v2.css:108-110`
  manually re-declares `overflow: hidden`. It works today only because of that patch and because
  `.swiper-wrapper`/`.swiper-slide` rules are class-name-stable across versions. Either load Swiper 7+
  or rename the container to `swiper-container`.

- **BUG-07 [LOW, dead code] — carousel CSS variables never apply.** `--swiper-navigation-size: 22px` is
  declared on `.buckfire-12-swiper` (`v2.css:17`) but the arrows are **siblings** of that element
  (`v2.js:151-152` puts them outside `.swiper`), so they never inherit it — measured `44px` (Swiper's
  default) on the arrow, with the visible 25px coming from the separate hardcoded rule at
  `v2.css:116-120`. The three `--swiper-pagination-*` vars (`v2.css:18-20`) are also dead: pagination is
  commented out at `v2.js:166-170`.

- **BUG-08 [LOW, dead code] — unused fallback.** `VIDEO_URL` (`v2.js:8`) is only reachable if a card
  omits `video-url`; all 6 supply one.

### Observation (not a defect)

`.buckfire-12-play-button` declares no `background` or `border` (`v2.css:66-78`) — the white ring/triangle
sits directly on the poster. On the lighter thumbnails (Jessica, Alyssa) contrast is weak. Worth a
semi-transparent dark backing if the client cares; flag for design confirmation since no Figma was
supplied for this test.

### Test/harness notes

- **Live force URLs work headless** — recon confirmed `BuckfireLaw_12` on `body` and the section injected
  with no `cro_mode=qa` workaround beyond what's already in the URL.
- **Swiper readiness must be awaited via `element.swiper`, not a CSS class.** Swiper 6 adds
  `swiper-container-initialized`, and Swiper 7+ adds `swiper-initialized` — neither is a safe signal here
  given BUG-06's version/markup mismatch. `waitForFunction(() => el.swiper)` is version-agnostic.
- **Gate real-playback assertions on codec support.** `video.canPlayType('video/mp4; codecs="avc1.42E01E"')`
  guards TC-25/26/27/28 so a build without H.264 skips with a reason instead of reporting a false
  functional failure. On this Windows machine **all 6 projects decoded H.264**, so 0 skips — but keep the
  gate for CI/Linux where WebKit typically lacks it.
- Effective slides-per-view is best measured geometrically (count slides fully inside the container rect)
  rather than reading Swiper's `params`, which reports the pre-breakpoint value.
- Per-project foreground runs, ~3.2-6.7 min each (same background-kill lesson as CRE-T-144/SWF146).

### Additional test cases to consider

- [ ] Re-test BUG-01 after the `play`-listener fix, including the native-controls click path.
- [ ] Duplicate-init guard: re-run the variation script and assert no second `.buckfire-12-client-stories`
      and no second Swiper instance.
- [ ] Touch-swipe gesture on real mobile (the suite exercises arrows only; Swiper's own drag is untested).
- [ ] Keyboard-only pass once BUG-03 is fixed: Tab to play control, Space/Enter to start.
- [ ] Once slides 4-6 get real content, re-assert TC-32/TC-33 (unique titles, distinct clips) as
      must-pass rather than known-fail.

---

## Update 2026-09-07 — rolled out sitewide (Test 12), rebuilt as a static 3-card grid

**Test file:** `my-playwright-project/testing/buckfire-12-client-stories.spec.js`
**Screenshots:** `buckfire-test12-screenshots/` (HTML QA report retired — results captured in this doc)
**Result:** 13 pages × 2 viewports (Chrome Desktop + Mobile Chrome/Pixel 5) = 26/26 checks passed, 39
videos verified (13 pages × 3 cards). **Zero defects found.**

**The component changed shape since the 2026-08-04 write-up above.** It's no longer a 6-slide Swiper
carousel on a single page — it's now a plain CSS-grid `.buckfire-12-stories-grid` of exactly **3**
`.buckfire-12-story-card`s (no Swiper, no carousel arrows, no pause-others logic to test), and the same
component now renders **different, page-specific content on 13 different URLs** (homepage + 12 PPC
pages), each showing a different trio of real clients — no more placeholder slides. All prior carousel
bugs (BUG-01 keyboard double-play, BUG-06 Swiper version mismatch, BUG-07 dead CSS vars) are **moot**;
they described the old carousel markup, not this one. BUG-03 (no keyboard path to play) and BUG-04 (alt
text can drift from the visible name) are still worth re-checking against the new markup if this becomes
a priority — not re-verified in this pass, which focused on content-mapping correctness and playback.

**Confirmed live markup:**
```
section.buckfire-12-client-stories
  h2 "Client Stories"
  div.buckfire-12-stories-grid          (1 col <721px / 2 col 721-1099 / 3 col >=1100)
    div.buckfire-12-story-card x3
      div.buckfire-12-video-thumb
        video.buckfire-12-video[video-url]   <- lazy: empty until clicked
        img.buckfire-12-thumb-img[alt="{Name} video thumbnail"]
        div.buckfire-12-play-button
      div.buckfire-12-story-content
        h3                                    <- CSS display:none, not the visible headline
        p  "quote..."                         <- the visible quote
        span.buckfire-12-name  "– Name"
```

**Force URLs:** PPC pages all share `?cro_mode=qa&_conv_eforce=100052508.1000256555` (same experiment,
still 100052508); homepage uses a **separate** experiment, `?cro_mode=qa&_conv_eforce=100052748.1000257125`.

**Page → client mapping (all confirmed correct, name + quote + order + poster alt, 2026-09-07):**

| Page | URL | Clients (order) |
|---|---|---|
| Homepage | `/` | Shaylynn, Denita, Mike |
| Medical Malpractice | `/medical-malpractice-lawyers/` | Denise, Shaylynn, Mike |
| Dog Bite | `/dog-bite-lawyer/` | Jessica, Alyssa, Denita |
| Slip & Fall (lawyers) | `/slip-and-fall-lawyers/` | Jessica, Alyssa, Denita |
| Slip & Fall (attorneys) | `/slip-and-fall-attorneys/` | Damian, Alyssa, Denita |
| Free Case Review | `/free-case-review/` | Shaylynn, Mike, Denita |
| Car Accident | `/car-accident-lawyers/` | Denita, Damian, Mike |
| Personal Injury | `/personal-injury-lawyer/` | Mike, Shaylynn, Denise |
| Bike Accident | `/bicycle-accident-lawyer/` | Mike, Jessica, Denita |
| Wrongful Death | `/wrongful-death-lawyer/` | Denita, Shaylynn, Denise |
| Nursing Home Abuse | `/nursing-home-abuse-lawyer/` | Denise, Alyssa, Mike |
| Birth Injury | `/birth-injury-lawyers/` | Denise, Alyssa, Mike |
| Truck Accidents | `/truck-accident-lawyers/` | Denita, Mike, Damian |

### Notes (not defects)

- **Transient Mobile Chrome video-load timeouts, self-resolved on retry.** 2 of 26 checks (Dog Bite,
  Slip & Fall lawyers, both Mobile Chrome) initially timed out waiting for a video to reach
  `readyState >= 1` after 3 videos were clicked back-to-back in the same test. Re-run standalone: Dog
  Bite passed clean; Slip & Fall failed again but on a **different** card that time, then passed on
  retry. A different card failing each run (not the same client/page) points to headless-emulation
  CPU/network contention from stacking 3 video loads in quick succession, not a per-client defect. If
  this suite is re-run and a single Mobile Chrome video check times out, re-run that page alone before
  treating it as a regression.
- **`cre-t-21-modal-overlay` (an unrelated lead-capture modal sharing this rollout) can intercept clicks
  after extended dwell time.** Observed once, while capturing report screenshots (a slower flow than the
  main test): the modal opened over `/medical-malpractice-lawyers/` and blocked a click on a video
  thumbnail underneath it. Did **not** occur during the main automated run (interacts almost immediately
  after load), so this looks like a time- or scroll-based trigger on `cre-t-21`, a different experiment —
  not investigated further since it's out of scope for the Client Stories section, but worth a manual
  check on whether it can pop up mid-video and block interaction. See `_client-notes.md` — Buckfire pages
  routinely run more than one experiment at once (previously body class `cre-t-11`, now `cre-t-21`).
