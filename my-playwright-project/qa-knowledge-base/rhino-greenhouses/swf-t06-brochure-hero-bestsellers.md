# SWF-T06 / cre-t-06 - Rhino Greenhouses Brochure Page Hero Rebuild + Bestsellers Swap

**Site:** rhinogreenhouses.co.uk (Shopify) | **Platform:** Convert.com
**Target URL:** `/pages/request-a-brochure`
**Audience:** All UK users (desktop and mobile)
**Variation files:** `local_testing/Local2/variation/vB.js` / `vB.css` (body class `Test_06`)
**Spec:** `testing/rhino-t06-brochure-hero.spec.js`
**Force URLs:** Control `_conv_eforce=100052693.1000256995` · Variation `_conv_eforce=100052693.1000256996`
**Figma:** Control.png / Variant.png (supplied by requester)

## What this test does

Rebuilds the brochure request page hero to promote the strongest headline/subhead and an autoplay
brochure video above the fold (previously buried lower on the page), hides "What's in the pack?" and
the now-empty request/video section below the form, swaps the 3-item collections block for the
homepage's 4-item bestsellers block (fetched via Shopify's `?section_id=` AJAX section-rendering API and
injected client-side), and hides the bottom Instagram-style image gallery.

## Figma vs. code vs. live - all matched

Hero heading, subheading, body copy, DOM order (heading → subheading → bodycopy → video → form),
what's-in-the-pack hide, request-section hide, collections→bestsellers swap, and gallery hide all
matched the Figma spec when verified live on the Convert.com preview URL (manual browser check first,
per the Figma-first workflow, before writing any test assertions).

## Bugs found

### BUG-01 [LOW / INFORMATIONAL - pre-existing site defect, not introduced by this test]

The hero video (`.qa-hero-video video`, sourced from
`#GalleryViewer-...media_with_text_ff7q34`) never actually loads: `readyState: 0`, empty
`currentSrc`/`src`, element measures 0×0. The `<source>` tag only carries a lazy-load `data-src`
attribute, never populated into `src`. **Confirmed this reproduces identically in the video's original,
active-slide (`slider__slide is-active`, `display: flex`) position on the unmodified control page** —
so this is a pre-existing Shopify theme/site issue, not something `vB.js`'s `moveVideo()` introduced.
Still worth flagging to the client/developer since the entire hypothesis is built around this video
being visible and autoplaying.

### BUG-02 [HIGH - real, reproducible, live] - mobile/tablet bestsellers swap fails: malformed AJAX URL

**Status (2026-08-21): fixed in local `vB.js`, pending redeploy to Convert.com + live re-verification.**

On Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12), and Tablet (iPad gen 7) - **100% reproducible,
3/3** - the collections section is never hidden and the bestsellers section never appears. Root cause,
confirmed via a `window.fetch` interception + stack trace against the live Convert.com CDN bundle
(`cdn-4.convertexperiments.com/v1/js/10007679-10007896.js`):

```
[fetch-call] /?section_id=#MainContent > [id*="multicolumn_iprPLR"]
  stack: Error
    at getBestsellersHTML (.../10007679-10007896.js:538:14)
    at swapBestsellers (.../10007679-10007896.js:594:7)
```

**Root cause correction:** originally suspected as a Convert.com bundling/minification artifact, but
re-inspection of `local_testing/Local2/variation/vB.js` on 2026-08-21 found the CSS-selector-shaped
string hardcoded directly in the source itself:

```js
var SECTION_ID = '#MainContent > [id*="multicolumn_iprPLR"]';
```

used both to build the fetch URL and as the `getElementById("shopify-section-" + SECTION_ID)` lookup —
neither of which accepts a CSS selector, only the literal Shopify section id. `vB.js` is a shared
scratch file reused across many unrelated tickets (see `_client-notes.md` in other client folders); this
value was clobbered by whatever ticket touched the file after the original T06 build. Not a Convert-side
issue — fixed by restoring the literal id:

```js
var SECTION_ID = "template--27460885184887__multicolumn_iprPLR";
```

This request-a-brochure-page script fetches a section from the **homepage** (`fetch("/?section_id=...")`
hits site root), so the numeric `template--27460885184887__` prefix is tied to the homepage's JSON
template instance — if the homepage template is ever duplicated/regenerated, this id will need updating
again. Once redeployed to Convert, this needs a full live re-run on Mobile Chrome, Mobile Safari, and
Tablet (the 3 confirmed 100%-repro device tiers) plus Firefox/Safari Desktop (intermittent repro) before
closing.

Also reproduced **intermittently** on Firefox Desktop and Safari Desktop in the same full run (identical
`#qa-bestsellers-swap-section` timeout signature) - not strictly mobile-only, more of a race condition
that manifests far more reliably on mobile/tablet.

## Test scenarios (17 TCs, `testing/rhino-t06-brochure-hero.spec.js`)

| TC | Category | What it checks |
|----|----------|-----------------|
| TC-01 | Control | No `Test_06` class, no hero injections (subhead/bodycopy/video/bestsellers) |
| TC-02 | Control | Heading is the original copy, not the variation's |
| TC-03 | Control | What's-in-the-pack (active tab only, via `:visible`), request section, collections, gallery all visible |
| TC-04 | Variation | `body.Test_06` class added |
| TC-05 | Content | Hero heading exact match to Figma |
| TC-06 | Content | Subheading moved into hero, exact copy |
| TC-07 | Content | Body copy moved into hero, exact copy |
| TC-08 | DOM order | heading → subheading → bodycopy → video → form |
| TC-09 | CSS | What's-in-the-pack hidden |
| TC-10 | CSS | Emptied request/video section hidden |
| TC-11 | CSS | Collections hidden, bestsellers shown as its next sibling |
| TC-12 | Content | Bestsellers section actually contains product links (not empty) |
| TC-13 | CSS | Bottom image gallery hidden |
| TC-14 | Dedup | Re-running `vB.js` doesn't duplicate any injected element |
| TC-15 | Responsive | No horizontal page overflow at the current viewport |
| TC-16 | Bug doc | Hero video readyState (documents BUG-01; expected to fail, not test-suite noise) |
| TC-17 | Errors | No uncaught page errors from the variation script |

## Results by browser (first full run, before test-script fixes below)

45 passed / 74 failed across 119 runs (17 TCs × 7 projects). Two of the "failures" were **test-authoring
bugs, not product bugs** (fixed after this run — see below):
- TC-03 used `.first()` on a selector matching both the Digital and Physical brochure tab panels; the
  first-in-DOM one is the currently-*inactive* tab, so it's never visible. Fixed to assert
  `:visible` count instead of `.first()`.
- TC-12 assumed the bestsellers markup used `<li>`/`.grid__item`; the actual imported section uses plain
  `<div>`s. Fixed to count `a[href*="/products/"]` instead.

After excluding those two self-inflicted false failures, the substantive failures are: BUG-02
(mobile/tablet + intermittent desktop bestsellers-swap failure, cascades into every downstream Variation
TC once `gotoVariation()`'s `waitForSelector` times out) and BUG-01's TC-16 (expected to fail, documents
a known pre-existing issue rather than a suite defect).

## Issues found during development

- Chrome-extension-based `resize_window` during the initial manual browser check did **not** actually
  change the rendered viewport (confirmed via `window.innerWidth` staying at desktop width and the nav
  never collapsing to a hamburger) - any "mobile" observation made that way was actually still desktop
  rendering. Real mobile/tablet verification requires Playwright's device emulation
  (`devices['Pixel 5']` etc.), which is what actually caught BUG-02.
- `tail -N` piping Playwright's `list` reporter output truncates the detailed per-failure stack/snapshot
  blocks for all but the last few failures - pull `test-results/**/error-context.md` (or the HTML report)
  for the actual assertion text instead of trusting a truncated CLI tail.
