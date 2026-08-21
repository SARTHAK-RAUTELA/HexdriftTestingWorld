# Fanorate — UI Issues Audit (June 6, 2026)

**Extracted verbatim from `local_testing/Local2/fanorate-ui-report.html` on 2026-08-21, then the HTML deleted**
(large embedded-report file, superseded by this record — see repo cleanup workflow in
`qa-knowledge-base/README.md`).

**Site:** `https://www.fanorate.com` (soccer/World Cup 2026 content site) · **Test type:** Manual/visual UI
critique across 13 pages (homepage + 12 match-preview article pages) — spacing, missing elements, layout,
placeholder text. **Not** the same audit as [`fanorate-site-audit.md`](fanorate-site-audit.md) (that one is a
scripted link/image/console-error crawl from July 3, 2026, 7 pages) — this is a separate, earlier, purely
visual pass covering different pages with heavier per-page detail (13 pages, mostly individual match-preview
articles).

**Totals:** 67 UI issues across 13 pages · 13 "Photo · TBC" placeholders · 9 missing images · 18 spacing
problems.

**Severity legend:**
- **Critical** — broken layout, missing images in hero/primary sections, content completely missing
- **High** — TBC placeholders live in production, major spacing gaps, broken navigation
- **Medium** — inconsistent styling, misaligned cards, uneven columns
- **Low** — minor typography, hover states, small padding issues

## Recurring patterns (not per-page duplicates — the same root cause repeats across articles)

- **"Photo · TBC" placeholder caption live in production** — appears as a Critical finding on the venue
  featured image on **11 of 13 pages** (all except Homepage and Canada vs Bosnia, which have their own
  broken/missing-image variants instead). This is clearly a single systemic issue (a CMS field never
  populated before publish) rather than 11 separate bugs — worth flagging to the client as one fix across
  the venue-image component/template, not one page at a time.
- **Predicted Lineups pitch visualization missing/incomplete** (no field background, no player-name
  overlay, numbers-only) — recurs on Homepage-adjacent pages: Korea vs Czechia, Brazil vs Morocco, Qatar vs
  Switzerland (mobile overlap), Germany vs Curaçao, Netherlands vs Japan, Ivory Coast vs Ecuador, Sweden vs
  Tunisia. Same missing component across the match-preview template, not isolated incidents.
- **"Keep Reading" related-article cards missing thumbnails / uneven heights** — Korea vs Czechia, USA vs
  Paraguay (×2 issues), Haiti vs Scotland, Ivory Coast vs Ecuador, Sweden vs Tunisia.
- **Inconsistent spacing between adjacent sections** ("Five Storylines" gaps, Q&A block spacing, fixture-set
  spacing) — Mexico vs South Africa, Canada vs Bosnia, Brazil vs Morocco, Haiti vs Scotland, Germany vs
  Curaçao, Netherlands vs Japan, Qatar vs Switzerland, Sweden vs Tunisia — a template-level spacing-token
  inconsistency rather than per-page mistakes.
- **Author byline format inconsistency** ("AM" vs "Abdullah Mashuk", differing font size/weight between
  header byline and related-article byline) — Ivory Coast vs Ecuador, Sweden vs Tunisia.

## Per-page findings

### Page 1 — Homepage (`/`) — 6 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | Missing hero image (external Unsplash asset) with no fallback color/skeleton | Hero banner |
| 2 | High | Newsletter section has no visible email input/submit — copy only, non-functional | Newsletter block |
| 3 | High | Player Collections: all 8 CTAs (4 cards × 2 links) use `href="#"` — dead links | Player Collections, all 4 cards |
| 4 | Medium | Match Preview cards: inconsistent heights break grid column alignment | Match Previews grid |
| 5 | Medium | Canada vs Bosnia featured thumbnail path unconfirmed — may show broken icon | Featured match card |
| 6 | Medium | Arrowhead Stadium venue guide image path unconfirmed | Venue guide feature card |

### Page 2 — Mexico vs South Africa — 6 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" caption live — Estadio Azteca | Venue featured image |
| 2 | High | Fixture List: uneven top margins across the 3 fixture-set groups | Fixture sets 1-3 |
| 3 | Medium | Q&A section: uneven vertical spacing between the 3 blocks | Q&A blocks |
| 4 | Medium | Team Guide rankings: flag+name+number fused with no separator ("🇫🇷France1") | Team Guides sidebar |
| 5 | Medium | CTA arrows ("Read preview →" / "Team guide →") use different arrow glyph + padding | Featured content links |
| 6 | Low | Breadcrumb densely packed, no padding around "›" separator | Breadcrumb nav |

### Page 3 — Korea Republic vs Czechia — 4 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — Estadio Akron | Venue featured image |
| 2 | Critical | Predicted Lineups: no pitch diagram rendering, only a flat number list, no player overlays | Predicted Lineups, both teams |
| 3 | High | Insufficient top padding between hero and "In this preview" jump-nav | Post-hero metadata/nav |
| 4 | Medium | "Keep Reading" 3 cards missing thumbnails, text-only | Keep Reading section |

### Page 4 — Canada vs Bosnia Herzegovina — 8 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — BMO Field | Venue featured image |
| 2 | High | Kickoff time shows staging placeholder "Afternoon ET · awaiting confirmation" live | Fixture at a glance |
| 3 | High | Arrowhead Stadium venue guide card has no thumbnail (text-only) | Featured venue guide card |
| 4 | High | Excessive whitespace between "Five Storylines" heading and cards 01-05 | Five Storylines block |
| 5 | Medium | Fixture Set 1 spacing compressed vs Sets 2 & 3 | Fixture sets 1-3 |
| 6 | Medium | Squad Breakdown team-name headers: inconsistent font weight (Canada vs Bosnia) | Squad Breakdown headers |
| 7 | Medium | Player names inconsistently bolded with no apparent rule (Davies, David, Džeko bold; others not) | Squad Breakdown player list |
| 8 | Low | "Keep Reading" date stamps misalign/wrap awkwardly on longer titles | Keep Reading date stamps |

### Page 5 — USA vs Paraguay — 5 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — SoFi Stadium | Venue featured image |
| 2 | High | "Keep Reading" thumbnails may render as broken placeholders if assets not uploaded | Keep Reading section |
| 3 | Medium | Breadcrumb sits too close to H1 (insufficient top margin) | Breadcrumb → H1 |
| 4 | Medium | "Keep Reading" cards uneven column heights from varying excerpt length | Keep Reading grid |
| 5 | Medium | Pull-quote font weight inconsistent vs other pull quotes on page | "Why this match matters" pull quote |

### Page 6 — Brazil vs Morocco — 10 issues (highest count)
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | Main hero image (`brazil-vs-morocco-hero.png`) broken/not rendering | Hero image area |
| 2 | Critical | "Photo · TBC" — MetLife Stadium (compounds with #1: entire top-half non-functional) | Venue featured image |
| 3 | Critical | Predicted Lineups: jersey numbers render but no player-name overlays at all | Predicted Lineups, both teams |
| 4 | High | Recent-form tables show literal "TBC · verify" text live, both teams | Squad Breakdown recent-form tables |
| 5 | High | Match Probability: percentages shown but bar-chart visualization absent | Match probability block |
| 6 | High | Excessive top padding before "Five Storylines" cards 01-05 | Five Storylines block |
| 7 | Medium | "The Decisive Five" key players grid: last card (Amrabat) isolated/left-aligned alone in new row | Key Players grid |
| 8 | Medium | Squad Breakdown: Morocco (right) column visually compressed vs Brazil (left) | Squad Breakdown 2-col layout |
| 9 | Medium | "What's at Stake" lettered list (A-D) uses different weight than numbered storylines (01-05) | What's at Stake list |
| 10 | Low | Breadcrumb has no separator character between items | Breadcrumb nav |

### Page 7 — Qatar vs Switzerland — 4 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — Levi's Stadium | Venue featured image |
| 2 | High | "Schedule · Opening Weekend" heading visually detached from its match-card list (oversized margin) | Schedule section |
| 3 | Medium | Predicted Lineups: two pitch diagrams may overlap/misalign on tablet/mobile (untested) | Predicted Lineups 2-col layout |
| 4 | Low | Team Guide sidebar flag emojis wrap inconsistently on narrow viewports | Team Guide sidebar |

### Page 8 — Haiti vs Scotland — 5 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | Hero image (`haiti-vs-scotland-hero.png`) broken, no fallback | Hero image |
| 2 | Critical | "Photo · TBC" — Gillette Stadium (both hero + venue image broken simultaneously) | Venue featured image |
| 3 | High | All 3 "Keep Reading" cards missing thumbnails | Keep Reading section |
| 4 | High | Disproportionate vertical margin between "Five Storylines" and "Squad Breakdown" | Section gap |
| 5 | Low | Flag emoji icons (Haiti/Scotland) have no fallback for rendering failures | Team guide listings |

### Page 9 — Australia vs Türkiye — 4 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — BC Place, Vancouver | Venue featured image |
| 2 | High | Predicted Lineups diagrams cramped, heading too close, position markers overlap | Predicted Lineups |
| 3 | Medium | Q&A toggle (+/→) elements unconfirmed to render on mobile | Q&A expandable items |
| 4 | Medium | Newsletter footer privacy-policy link uses `href="#"` — UX + potential GDPR issue | Newsletter footer |

### Page 10 — Germany vs Curaçao — 5 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — NRG Stadium | Venue featured image |
| 2 | High | Q&A cards 01-03: uneven vertical spacing between cards | Q&A numbered cards |
| 3 | Medium | Predicted Lineups 2-col layout unconfirmed for responsive reflow on smaller screens | Predicted Lineups |
| 4 | Medium | "Five Storylines" padding inconsistent vs "Tale of the Tape"/"Squad Breakdown" | Five Storylines vs adjacent sections |
| 5 | Low | Newsletter signup insufficiently separated from "Trending Topics" text above | Newsletter/Trending boundary |

### Page 11 — Netherlands vs Japan — 5 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — AT&T Stadium | Venue featured image |
| 2 | High | Predicted Lineups: Netherlands/Japan diagrams lack visual separation, markers bleed together | Predicted Lineups |
| 3 | High | "Five Storylines" cards 01-05: inconsistent vertical spacing between cards | Five Storylines block |
| 4 | Medium | Footer "Trust" column links cramped vs "Editorial" column | Footer Trust vs Editorial columns |
| 5 | Medium | Match Probability percentages: inconsistent visual weight vs secondary probability angles | Match probability block |

### Page 12 — Ivory Coast vs Ecuador — 6 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — Lincoln Financial Field | Venue hero image |
| 2 | Critical | Predicted Lineups: only jersey numbers, zero player names/position labels | Predicted Lineups, both teams |
| 3 | High | Predicted Lineups section: insufficient top padding above diagrams | Predicted Lineups heading→diagram |
| 4 | High | "Keep Reading" 3 cards uneven heights (thumbnail presence + text-wrap variation) | Keep Reading grid |
| 5 | Medium | Author byline shows "AM" at top, "Abdullah Mashuk" in Final Thoughts — inconsistent | Byline vs Final Thoughts |
| 6 | Low | Breadcrumb has no hover/focus states | Breadcrumb nav |

### Page 13 — Sweden vs Tunisia — 5 issues
| # | Sev | Finding | Location |
|---|---|---|---|
| 1 | Critical | "Photo · TBC" — Estadio BBVA | Venue featured image |
| 2 | High | "Fixture at a Glance" heading too close to data table below it | Fixture at a Glance |
| 3 | High | Predicted Lineups: no pitch background, minimal separation, floating unlabeled numbers | Predicted Lineups, both teams |
| 4 | Medium | "Keep Reading" 3-column grid: inconsistent card heights from title/excerpt length variance | Keep Reading grid |
| 5 | Medium | Byline author credits: inconsistent font size/weight between header and related-article bylines | Byline vs related-article byline |

## Notes for next audit / follow-up

- Since the "Photo · TBC" and "no player-name overlay" issues are template-level (recur across 7-11 pages
  each), the fix is almost certainly one CMS-field/component change rather than 18+ separate page edits —
  worth confirming with the client whether venue photos are simply pending upload (a content gap) vs a
  broken image-binding (a code bug).
- This audit did not verify any issue live (no browser/DOM confirmation, unlike `fanorate-site-audit.md`'s
  scripted checks) — treat findings here as a visual/design-review pass, not confirmed-live bugs. If
  re-testing, prioritize confirming whether the "Predicted Lineups" pitch-diagram component is actually
  broken in code or was simply not built yet.

*Last updated: 2026-08-21*
