# AFP43 — FP&A Forum Navigation (VWO exp 88)

**Status:** QA round 1 done 2026-11-13, Chrome + Safari desktop. 44/48 (22/24 per browser). 2 medium bugs + 1 question.
**Report:** [afp43-qa/afp43-qa-report.html](afp43-qa/afp43-qa-report.html) (published artifact `7ZoNPNaES3EUroqMU2Mcz7`)
**Spec:** `testing/afp43-fpa-forum-navigation.spec.js` · recon/goal-map scripts in `testing/afp43-recon/`
**Variation class:** `cre-t-43` · code `local_testing/Local2/variation/vB.js` + `vB.css` (shared scratch files, check before trusting)
**Targeting:** URL starts with `https://www.financialprofessionals.org/afp-fp-a--forum`, audience Desktop only.
**Preview:** `_vis_preview_data` with exp `88`, `v:"1"` = control, `v:"2"` = variation. Preview bucketing persists across later navigations in the same context; plain subpage URLs in a fresh context are not bucketed.
**QA link (live tracking, random arm):** `/afp-fp-a--forum?utm_campaign=Cro_mode`

## What the variation does
- Moves `.sub-header` out of `.main-content` to sit directly under the breadcrumb (`main` gets `display: contents` so the sticky bar sticks page-wide at `top:172px`, under the sticky `#site-header`).
- Hides `.banner_site-logo` (hero "AFP FP&A FORUM / date" block), hides the Registration `li`, appends `.cre-t-43-cta` "Pricing & Register" → `/afp-fp-a--forum/pricing` (#FB8F2E pill, hover #7A4616/white).
- Program: injects 2 heading `li`s + divider `li`, renames "FP&A Forum Schedule" → "Schedule at a Glance", "Networking" → "Networking Opportunities", "FP&A Forum Attendee Feedback" → "Attendee Feedback"; grid 524px | 1fr.
- Hotel / Sponsors: single-column stack.
- JS gate `matchMedia('(min-width: 1200px)')`, runs once (no resize listener). All CSS also inside `@media (min-width:1200px)`, so shrinking after load cleanly reverts to the original look.
- Also hides `.cre-t-05-reg` and renames JOIN → no-ops on the live site (that button is gone and the link already reads "Join").

## Findings
- **BUG-01 (Medium):** above ~1450px the bar container centres (logo x=260 at 1920) but dropdown panels keep a fixed `padding: 30px 44px` → links at x=44, divider 32–1032. Control aligns links to the logo (292 → 320). Matches the wireframe at ≤1440 only.
- **BUG-02 (Medium):** VWO "Desktop" audience ≠ the 1200px code gate. 1152px (1440 @125% scaling) / 1199px get combo=2 but see control → result dilution. Fix: VWO custom-JS segment `innerWidth >= 1200` or lower the breakpoint.
- **Q-01:** goals 1–3 defined but never fire.
- Wireframe control top bar is stale (Register for AFP 2026 / Join AFP). Wireframe shows PROGRAM underlined while closed — treated as hover.

## Goal map (QA link, identical in both arms)
| Goal | Meaning |
|---|---|
| 4 | Register click: `.sub-header .afp-nav__list > li > a[href$='/pricing'], .cre-t-43-cta` |
| 5 | Engage menu: nav buttons / top links / sub-nav links / CTA |
| 6 | Visit /pricing |
| 7–12 | schedule-at-a-glance, educational-sessions, networking, keynote-speakers, past-forum-sessions, attendee-feedback |
| 13–14 | book-your-hotel, explore-NOLA |
| 15–16 | our-sponsors, sponsor |
| 1–3 | unknown, never fired |

Goal definitions are readable at runtime from `window._vwo_exp[88].goals` (`url` holds the click selector for click goals). Hits show up as `dev.visualwebsiteoptimizer.com/ping_tpc.php?...name=_vis_opt_exp_88_goal_N`.

## Harness gotchas
- WebKit on Windows: `Tab` skips links (Safari default) and `Alt+Tab` isn't emulated → TC-14 focuses the CTA directly on webkit.
- `describe.serial` stops after the first failure: known bugs are marked `test.fail(true, reason)` (TC-18, TC-19).
- The origin returned a Cloudflare 522 once mid-run. Check the failure screenshot before calling a run a regression.
- The silent self-review video (no audio track) shows control → variation → sticky bar → Pricing/Networking pages. Nothing verbal was missed.
