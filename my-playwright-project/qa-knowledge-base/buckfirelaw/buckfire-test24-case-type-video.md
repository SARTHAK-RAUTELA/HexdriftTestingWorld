# Buckfire Test 24 — Case Type Pages: single video testimonial (exp 100053058)

**QA date:** 2026-11-11 · **Report:** `buckfire-test24-qa-report.html` · **Results/shots:** `buckfire-test24-results/`
**Scripts:** `my-playwright-project/testing/buckfire-24-recon/` (`recon.js` page mapping, `probe2.js` collisions/config, `func.js` playback+goal+style, `t27probe.js`/`bfab.js` quiz-arm, `dbl.js` double card)
**Code:** `local_testing/Local2/variation/va3.js` / `va3.css` — byte-identical to deployed Convert code (checked via `window.convert.data`)
**Force URLs:** `?cro_mode=qa&_conv_eforce=100053058.1000257876` (V1) / `.1000257875` (control). Audience 10007176 is QA-only (cro_mode cookie/param) until launch.

## What it does
Injects `.buckfire-24-story-card` (poster + 34px orange 60% play disc + quote + name) before `#sidebar-main .sidebar_form`; person chosen by exact-pathname map, default Denise. Click → lazy src, controls, play; goal `100038435` on first `playing`.

## Result: NOT READY
- 11/11 parent case-type pages correct person (Sandra new asset OK). Playback + goal fine on Chrome, Pixel 5, iPhone 12. All 16 CDN assets 206.
- **BUG-01 CRITICAL** card hidden ~50%: site-native form A/B `.bf-ab-quiz-form` vs `.bf-ab-original-form` (`?bf_variant=quiz`); `.sidebar_form` lives inside `.bf-ab-original-form`, so card inherits display:none on quiz arm.
- **BUG-02 HIGH** child pages (incl. preview URL autism-abuse) get default Denise — need prefix match.
- **BUG-03 HIGH** `/case-types/*/settlements/` template has no `#sidebar-main` → no card (8 case types).
- **BUG-04 HIGH launch** exp 100052509 still active 50/50 on same pages → two cards, contaminated control. Pause it.
- **BUG-05 MED** play div not keyboard-operable (same as Test 12 BUG-03).
- **Q-01** play button: Figma orange disc vs live Test 12 white 60px ring — client asked for consistency. Typography matches Test 12 exactly; no headline also matches Test 12 (h3 hidden there).

## Lessons
- **Buckfire sidebar has a native form A/B** (`bf-ab-*`). Anything anchored on `.sidebar_form` must go above both wrappers. Flaky 0×0 cards across engines = this, not the browser.
- Figma "Group 15" person labels are stale placeholders (blond man labelled Jessica); live posters: Mike = young man, Jessica = woman.
- Settlement child pages use a different template without `#sidebar-main`.
