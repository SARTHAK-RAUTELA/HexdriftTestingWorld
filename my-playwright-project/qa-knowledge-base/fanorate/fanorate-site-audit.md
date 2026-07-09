<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 26) on 2026-07-09. -->

# Fanorate — Full Website QA Audit

**Scripts (all removed after documentation — standalone `node` scripts, not Playwright specs):**
- `fanorate-audit.js` — crawls 7 pages, screenshots (fold + full), extracts links/images/buttons/console errors, checks HTTP status of every unique link → writes `fanorate-data/page-results.json` + `link-checks.json`
- `fanorate-analyze.js` — post-processes results: broken images (`!complete || naturalWidth===0`), stretched images (ratio diff >15% and object-fit ≠ cover/contain), missing alt, empty/`#` links → `analysis-summary.json`
- `fanorate-recheck-429.js` — re-checks 429/400 links with 1.5s delay between requests (WAF rate-limit false positives)
- `fanorate-build-report.js` — merges all JSON + screenshots into self-contained HTML report
**Report output:** `local_testing/Local2/fanorate-qa-report.html`
**Data dir:** `my-playwright-project/fanorate-data/` · **Screenshots:** `my-playwright-project/fanorate-screenshots/`
**Site:** `https://www.fanorate.com` (soccer/World Cup 2026 content site)
**Test date:** July 3, 2026 (commit `ceb8b12`)
**Test type:** Full-site audit (like Trakio, section 4) — not an A/B test

### Pages audited (7)

Homepage `/`, Points Table `/points-table/`, Match Previews `/category/soccer-2026/match-previews/` (+ Today filter variant), Match Analysis `/category/soccer-2026/match-analysis/`, Blogs `/blogs/`, Schedule `/schedule/`

### Bugs found

- **MEDIUM — Floating live-match widget overlaps "Match Preview" CTA:** the fixed live-score widget (`.fanorate-live-widget.flw-pos-right`, `position:fixed; bottom:16px; right:16px`) sits on top of the "Match Preview →" link of the second fixture card on `/schedule/` at 1440×900, zero scroll. Verified via bounding-box overlap check + screenshot. Link reduced to a "MATC…" sliver, likely unclickable.
- **LOW — Venue names truncated with ellipsis** on Schedule cards ("HARD ROCK STADIU…", "GEHA FIELD AT ARR…") with no tooltip revealing the full name.
- **LOW (dev cleanup) — ~22 player-headshot images loaded but never rendered sitewide:** a "Predicted Lineups" pitch component (`.lu-pitch` / `.lup__av-img`) exists in every page template with ~22–23 `<img>` tags pointing at `cdn.sportmonks.com` player photos, but its container computes to 0×0px, so images never load (`naturalWidth:0, complete:false`). Not a visible bug — but dead/legacy markup; on real match-preview articles the widget renders with colored dots, not photos.
- **INFO (false positive) — "Open venue guide" CTA:** static-HTML inspection flagged it as a dead `href="#"` link. It's actually a JS-driven interactive map — clicking a city pin populates the panel with a working link (verified via Vancouver pin). **Lesson: verify "dead link" findings by interacting, not just by static href inspection.**

### Audit techniques worth reusing

- **Scroll-through to trigger lazy loading** before screenshots/image checks (`scrollBy` loop, 600px steps, then back to top).
- **429/400 recheck pass with delays** — WAF rate limiting produces false "broken link" positives on bulk link checks; always recheck failures slowly before reporting.
- **Broken vs invisible images:** distinguish `naturalWidth === 0` inside a 0×0 collapsed container (never requested — dead weight, not user-facing) from a genuinely broken visible image.
- **Bounding-box overlap check** (`getBoundingClientRect` intersection) to programmatically verify fixed-position widgets don't cover interactive elements.
- **Dedupe images by `src`** before counting (logo appears in header+footer).

### Additional checks to consider for future site audits

- [ ] Overlap check at multiple viewports (widget may only collide at certain sizes)
- [ ] Repeat audit on mobile viewport (fixed widgets are more intrusive there)
- [ ] Lighthouse/CWV pass alongside the functional audit
- [ ] Check `title` attribute presence on ellipsis-truncated text

---

*Last updated: 2026-07-09*

