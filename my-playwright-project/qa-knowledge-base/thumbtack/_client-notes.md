# Thumbtack — Client Notes (cross-test quirks)

**Client:** Thumbtack
**Sites:** thumbtack.com (production + `?TT_QA=true` preview param), Thumbtack preview environment (SA Roofing test)
**A/B platform:** Optimizely (force URLs via `?optimizely_x=<id>&optimizely_force_tracking=true`, or CDN experiment IDs)
**Tests done:** SA Roofing landing section, Pro_landing_page_phase_1 (hero header)

## Environment / site quirks (apply to every thumbtack.com test)

- **AWS WAF Bot Control challenge on first load:** `thumbtack.com` responses come back HTTP 202 with header
  `x-amzn-waf-action: challenge` on the very first navigation. This is a client-side JS challenge — the real
  Next.js page only hydrates ~2-5s later (confirmed via headless Chromium: `document.body` briefly has no
  real content, then the actual hero markup appears after a few seconds). **Always `page.waitForSelector()`
  on a real content element (not a fixed `waitForTimeout`) immediately after `page.goto()`, before any other
  assertion** — a fixed 500ms wait is not reliably long enough and produces flaky "control text is null"
  or "element not found" failures that look like code bugs but aren't. See `gotoAndWaitPastWafChallenge()` in
  `testing/thumbtack-pro-hero-header.spec.js` for the pattern.
- **Pre-existing React hydration mismatch (React error #418) on `/pro`:** confirmed reproducible on Firefox
  with **zero** variation script injected — this is a live Thumbtack production bug, not caused by any
  variation JS. Don't treat a `page.on('pageerror', ...)` catching this specific error as a regression;
  filter it out or document it as a known site quirk. Reproduce: `page.goto('https://www.thumbtack.com/pro?TT_QA=true')`
  with no injection, listen for `pageerror`, on Firefox it fires within ~2s of load.
- **Long sequential 60-70+ test single-invocation runs risk worker crashes** (`worker process exited unexpectedly,
  code=3221225794`) on Mobile Chrome/Mobile Safari specifically, seen once in a combined 72-test run on this
  machine but **not reproducible** when the same mobile projects were rerun in isolation (12/12 and 8/12 clean
  respectively). Prefer running `--project` individually or in smaller batches for this site rather than one
  giant `npx playwright test` invocation across all 6 browsers — the per-navigation WAF wait means total
  runtime adds up fast and appears to trigger resource-contention flakiness on long single-process runs.
- **`/pro` renders TWO separate hero `<h1>` elements, not one responsive one:**
  - Desktop: `[class*="hero_heroInnerOffsetRight"] [class*="hero_heroTitle"]` — classes `dn m_db` (hidden
    mobile, shown desktop breakpoint+)
  - Mobile-only: `[class*="hero_heroInnerOffsetLeft"] [class*="hero_heroTitle"]` — classes `m_dn` (shown
    mobile, hidden desktop+), **different copy from the desktop H1** ("Get jobs in [City]." vs "Grow your
    business in [City].", as of 2026-07). Any variation JS that only selects one of these two elements will
    silently miss the other breakpoint's copy — always check both before assuming "the hero header" is a
    single element. See `Pro_landing_page_phase_1` test below for a real instance of this gap.
- **CTA text selector scoping:** `themed_themedButton` / `themed_flexWrapper` classes are reused sitewide for
  many unrelated buttons (pagination, carousel, etc. — one such button rendered literal text "Next" during
  transient hydration). Scope CTA selectors tightly to the specific container (e.g.
  `[class*="hero_heroCategoryTaxonSearchBox"] button[type="button"] span[class*="themed_flexWrapper"]`), not
  a bare `button[type="button"] span[class*="themed_flexWrapper"]` sitewide selector.

## Test files

| Test | File |
|------|------|
| SA Roofing landing page sections | [sa-roofing-landing-section.md](sa-roofing-landing-section.md) |
| Pro_landing_page_phase_1 — hero header "Find more customers" | [pro-landing-page-phase1-hero-header.md](pro-landing-page-phase1-hero-header.md) |
| Antonio Roofing — vB.js/vB.css code review (static, 2026-06-30) | [antonio-roofing-vb-code-review.md](antonio-roofing-vb-code-review.md) |
