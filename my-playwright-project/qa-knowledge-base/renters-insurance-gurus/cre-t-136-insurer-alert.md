<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 24) on 2026-07-09. -->

# CRE-T-136 — Renters Insurance Gurus Insurer Alert Box

**Test file:** `my-playwright-project/testing/cre-t-136-insurer-alert.spec.js`
**Test URLs list:** `my-playwright-project/testing/cre-t-136-test-urls.txt`
**Reporter:** `my-playwright-project/cre-t-136-reporter.js` *(removed — details below)*
**Report output:** `local_testing/Local2/cre-t-136-qa-report.html`
**Screenshots dir:** `my-playwright-project/cre-t-136-screenshots/`
**Figma reference:** `C:\Users\Sarthak Rautela\Downloads\Group 2.png` (embedded base64 into report)
**Site:** `https://rentersinsurancegurus.com` (homepage + `/comparison/`)
**Test date:** July 2026 (commit `6f4f784`)
**Browsers:** Chrome, Firefox, Edge, Safari + Mobile (Desktop · Mobile audience)
**Variation class:** `cre-t-136`
**QA force URLs:**
- Control: `https://rentersinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052370.1000256205&insurer=MetLife+Life+Insurance`
- Variation: `https://rentersinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052370.1000256206&insurer=MetLife+Life+Insurance`
- Variation /comparison/: same eforce on `/comparison/` path

**Multi-insurer preview URLs** (from `cre-t-136-test-urls.txt`, now removed) — same variation URL pattern
`?cro_mode=qa&_conv_eforce=100052370.1000256206&insurer={Name+With+Plus+Signs}` was manually spot-checked with:
Farmers, Pacific, California Casualty, Guaranty Income, Horace Mann, Principal, Aetna, Mercury, Haven,
and Encompass Life Insurance.

### What this A/B test does

Same methodology as CRE-T-123 (Pet Insurance Gurus), ported to Renters Insurance Gurus.
The variation injects a **dismissible alert box** into the comparison table area
(`#comparison-section .ct-section-inner-wrap [data-unique="comparison-table"]`) when the page loads
with `&insurer={Company Name}` in the URL. The company name is extracted from the URL and inserted dynamically:
- Title (`.cre-t-136-hero-title`): "Looking for {Company Name}?"
- Body (`.cre-t-136-subheader-title`): "{Company Name} didn't make the list"

Default JS fallback when no insurer param: "Colonial Penn". Convert.com audience targeting fires only when
`&insurer=` is in the URL. Dismiss: clicking `.cre-t-136-close-icon` removes the container, sets cookie
`cre-t-136-cookie=cre-t-136-variation`, removes body class. Cookie guard prevents re-show.
Wrapper background: `#FEF3D1` = `rgb(254, 243, 209)`.

### All Test Cases (20 TCs)

| TC | Category | What it tests |
|----|----------|---------------|
| TC-01 | Control | `.cre-t-136-container` NOT present on control URL |
| TC-02 | Variation | Alert container present with `&insurer=MetLife+Life+Insurance` |
| TC-03 | Dynamic title | Hero title contains "Looking for MetLife Life Insurance?" |
| TC-04 | Dynamic body | Subheader contains "MetLife Life Insurance didn't make the list" |
| TC-05 | Static body | "We've reviewed 23 pet insurance providers" present (documents BUG-01) |
| TC-06 | Bold spans | "instant online approval" + "fast claim payouts" are `<span>`s with font-weight 600 |
| TC-07 | Init | `body.cre-t-136` added in variation |
| TC-08 | Dismiss | `.cre-t-136-close-icon` visible |
| TC-09 | Dismiss | Clicking X removes `.cre-t-136-container` from DOM |
| TC-10 | Cookie | `cre-t-136-cookie=cre-t-136-variation` set after dismiss |
| TC-11 | Cookie guard | Alert NOT injected when dismiss cookie pre-set |
| TC-12 | URL encoding | `MetLife+Life+Insurance` (plus) decoded correctly in title |
| TC-13 | URL encoding | `MetLife%20Life%20Insurance` (percent) decoded correctly in title |
| TC-14 | Different insurer | `State+Farm+Renters+Insurance` shows correct name |
| TC-15 | No duplication | Container injected exactly once |
| TC-16 | CSS | Wrapper background = `rgb(254, 243, 209)` (#FEF3D1) |
| TC-17 | CSS | `.page-description ul` is `display:none` in variation (soft-skip if absent) |
| TC-18 | Sitewide | Alert appears on `/comparison/` with insurer param |
| TC-19 | Responsive | Desktop 1280×800 — alert visible |
| TC-20 | Responsive | Mobile 390×844 — alert visible and fits viewport |

### Bugs found (Figma vs code, pre-flight review)

- **BUG-01 [HIGH]:** Figma body says "23 **renters** insurance providers" — code said "23 **pet** insurance providers" (leftover copy from CRE-T-123 clone). **Fixed in commit `6f4f784`.**
- **BUG-02 [LOW]:** Default fallback insurer "Colonial Penn" is a leftover from the pet-insurance version. Dead code in practice (audience targeting prevents firing without `&insurer=`) but should be updated.
- **BUG-03 [LOW]:** `window.cre_t_123_event` used as the event-guard flag inside CRE-T-136's `init()` instead of `window.cre_t_136_event` — copy-paste artifact from CRE-T-123 (vB.js ~line 107).
- **BUG-04 [LOW]:** Duplicate CSS rule `.cre-t-136-subheader-title span { font-weight:600 }` appears twice in vB.css — non-blocking redundancy.

### Key lesson

When a test is **cloned from a previous test on a sister site**, diff the copy against the new Figma for
leftover brand/product references ("pet" vs "renters", old fallback names, old `window.*` guard variable names).
Three of the four bugs here were clone artifacts.

### Reusable custom reporter pattern

All `*-reporter.js` files in this repo followed the same structure (kept here since the files are deleted):

```js
class CreTNNNReporter {
  constructor() { this._results = []; }
  onTestEnd(test, result) {
    if (!test.location.file.includes('cre-t-NNN')) return;   // filter by spec filename
    this._results.push({
      title: test.title,
      projectName: test.parent?.project()?.name ?? 'Unknown', // browser name
      status: result.status,
      duration: result.duration,
      errors: result.errors.map(e => (e.message || String(e))
        .replace(/</g,'&lt;').replace(/>/g,'&gt;').split('\n').slice(0,6).join('\n')),
    });
  }
  onEnd() { if (this._results.length) this._generate(); }
  _generate() {
    // 1. Build TC × browser matrix: matrix[title][projectName] = result
    // 2. Stats: totalRuns / passed / failed / skipped
    // 3. Screenshots from ./cre-t-NNN-screenshots/ embedded as base64 data URIs
    //    (helper reads dir, filters by filename prefix, labels = filename minus prefix)
    // 4. Figma reference image also embedded base64 (if provided)
    // 5. PASS/FAIL/SKIP badge per cell; failed cells get title="<first error>" tooltip
    // 6. Writes self-contained HTML to ../local_testing/Local2/<test>-qa-report.html
  }
}
module.exports = CreTNNNReporter;
```

Register in `playwright.config.js` under `reporter: [['list'], ['html', {...}], ['./cre-t-NNN-reporter.js']]`.
Each reporter filters on its own spec filename so multiple reporters can coexist in one config —
but **remove the config entry when deleting a reporter file or Playwright throws on startup**.


