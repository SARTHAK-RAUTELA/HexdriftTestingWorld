# Preset Jobs on Pro Landing Page (TTOD) — Thumbtack /pro

**QA date:** 2026-10-21 · **URL:** www.thumbtack.com/pro · **Audience:** all traffic
**Optimizely:** exp `6154131621019648`, Variation #1 `5442504495988736`, Original `5870626836054016`
**Preview:** `/pro?QA=QA-testing` buckets 50/50 — force with `&optimizely_x=5442504495988736&optimizely_force_tracking=true`.
Forcing Original via optimizely_x did NOT take; use plain `/pro` (no QA param) as control.
**Code:** `local_testing/Local2/variation/va3.js` / `va3.css` (body class `bm_preset_jobs_pro_lp`) — byte-identical to the
deployed Optimizely bundle on 2026-10-21 (extracted via `testing/ttod-recon/extract.js`).
**Report:** `local_testing/Local2/ttod-preset-jobs-qa-report.html` (+ `ttod-screenshots/`)
**Recon scripts:** `testing/ttod-recon/recon1-9.js` (plain node + playwright, not a spec)

## What the test does
Hero copy → "Grow your business in [City]" / "5M customers in the last 12 months on Thumbtack", new hero visual
(2-col ≥1025px), light-blue "Show up in search, or claim available jobs. See how it works ↓" bar under hero, new
"Two ways to get hired" section (2 cards + Sign up for free + disclaimer) after `how-tt-works_section`.

## Findings (Chrome + Safari, desktop + iPhone 12)
- **BUG-01 High** hero inputs half-styled: CSS-variable override only partly reaches the native TextInput — service
  field white with grey icon cap, location stays grey, no border. Wireframe = white + #dddee1 border.
- **BUG-02 Medium** mobile bar tap overshoots ~215px: target computed once, page shrinks 215px (scrollHeight
  9104→8889) as soon as scrolling starts. Desktop lands at 0.
- **BUG-03 Medium** section CTA never focuses service input: the captured `input` is detached (`isConnected=false`)
  by the time the 500ms timeout fires — React remounts the hero field while scrolling (native sticky search bar).
  Fix: re-query inside the timeout.
- **BUG-04 Medium** horizontal overflow 1025–~1095px: fixed `570px 502px` grid + 48px padding = 1120 min.
- **Q-01** wireframe has two copy sets: "Desktop Web" frame (Two ways to get hired / Customers find you / Claim
  available jobs — what's built) vs "Mobile Web" + "Scroll prototype" frames (More ways to grow your business /
  Reply with your quote / Claim preset jobs, mobile card 2 = Interior painting).
- **Q-02** concurrent /pro experiments: 6405370246070272 ("Sign up" CTA copy) makes hero CTA "Sign up" while the
  new section says "Sign up for free"; 6329439777193984 testimonials.

## Gotchas learned
- Wireframe PNG was 7693×11233 — crop regions with headless Chromium (`page.screenshot({clip})` on the file:// image);
  no Python on this machine.
- WebKit iPhone emulation `page.screenshot` sometimes hangs on "waiting for fonts" — wrap with timeout + catch.
- Native mobile /pro shows a fixed "Thumbtack for Pros — Install" app banner at the bottom.
- Typeahead results: `li[class*="search-results_searchResult"]` (not role=option).
