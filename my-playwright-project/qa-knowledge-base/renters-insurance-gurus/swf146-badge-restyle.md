# SWF146 — Renters Insurance Gurus TrustScore Badge Restyle (SWF135-style, badge alone)

**Test file:** `my-playwright-project/testing/swf146-badge-restyle.spec.js`
**Report:** deleted 2026-08-04 (findings fully captured in this entry) — recoverable from git history at `local_testing/Local2/swf146-badge-restyle-qa-report.html`
**Screenshots:** `my-playwright-project/swf146-screenshots/`
**Site:** `https://rentersinsurancegurus.com` — `/`, `/home/`, `/comparison/`
**Test date:** July 28, 2026
**Browsers:** Chrome, Firefox, Edge, Safari (4 desktop projects)
**Variation class:** `cre-t-146` · Convert campaign eforce `100052539`
**Result:** 216/216 passed (54 TCs × 4 browsers), 0 failed, 1 low-severity bug documented

### What this A/B test does
Restyles the "TrustScore" review badge on the comparison listings (originally a Trustpilot-style
stars widget) to match the Pet Insurance Gurus SWF135 badge-alone look: score + star + classification,
with "{Site} Score" copy underneath on desktop. Client explicitly confirmed via chat this should copy
SWF135's *variation* (badge alone), not SWF135's control (which has the hover/tap breakdown overlay).

Score conversion: each listing keeps its own score, converted to a 10-point scale by doubling —
client confirmed: *"Whatever the score is for a listing on a specific URL, you can double that score
(even if it varies between pages)."* `vB.js` already implements this per-page (not a global doubling
function): `/`, `/home/`, and `/comparison/` each hardcode their own `mainScore` per partner and a
`total` that is exactly `mainScore × 2`.

### QA method — variation not yet published to Convert.com
As of test date, the live Convert.com force URLs for both control (`…628`) and variation (`…629`)
render the **current production state** — 8 Trustpilot-style badges, no `.cre-t-146-container`, no
`cre-t-146` body class — confirmed via direct DOM inspection. This experiment hasn't been published to
Convert.com yet. Same situation previously documented for CRE-T-08: tests inject the local
`vB.js`/`vB.css` directly onto the real live pages via Playwright's `addStyleTag`/`addScriptTag`
rather than relying on the unpublished force URL.

Before writing any assertions, live control scores on `/` were manually cross-checked against the
hardcoded `mainScore` values in `vB.js` — Lemonade 4.9, Farmers 4.4, USAA 4.4, Allstate 3.9 all matched
the live site exactly, confirming the local vB.js data is current and not stale (unlike CRE-T-144/SWF139
where the supplied local file turned out to be an unrelated leftover from another test).

### All Test Cases (54 TCs × 4 browsers = 216 runs)

| Category | TCs | What it checks |
|---|---|---|
| Control (×3 pages) | 9 | No `cre-t-146` class/badge; original Trustpilot badges visible |
| Variation core (×3 pages) | 15 | Body class, Trustpilot images hidden, 1 badge per dynamic-list row, badge-alone styling (dropdown chevron hidden, `cursor:default` not pointer), correct desktop copy "Renters Insurance Gurus Score" |
| Score/classification data (×3 pages × 7 partners) | 21 | Exact doubled `total` + `classification` text per partner per page |
| Dedup guard (×3 pages) | 3 | Re-running the injection script does not add duplicate badges |
| CSS guard (×3 pages) | 3 | Removing injected style/script/DOM reverts Trustpilot images to visible |
| Responsive | 3 | Desktop 1280×800 vs mobile 390×844 — score-copy line visibility; classification still visible on mobile via `.top-content1-text`; BUG-01 documented |

**Result:** 216/216 passed. Firefox's initial run hit 1 timing-race failure (see below), fixed and
confirmed passing on re-run.

### Bugs found
- **BUG-01 [LOW, confirmed all 4 browsers]:** `.cre-t-146-top-content1-mobile` (classification +
  dropdown chevron, mirroring the PIG SWF135/139 template) is meant to be the mobile-only alternate to
  the desktop score line, but its own `@media (max-width: 767px)` rule sets it to `display: none` — the
  parent hide wins over child overrides declared in the *same* media query (e.g. the chevron's
  `display: flex`), so the block never renders at any viewport. **No visible defect** — the
  classification text is still shown via `.cre-t-146-top-content1-text` on both desktop and mobile.
  Appears to be dead code carried over from the SWF135/139 template. Fix: remove the unused block, or
  correct the `display: none` if a distinct mobile rendering was actually intended.

### Site quirk (new — added to `_client-notes.md`)
`/comparison/` renders the Liberty Mutual row **twice** — the same
`data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"` appears at position 1 and position
8 in the dynamic list. Confirmed live, not a vB.js bug: each DOM row is independent and both correctly
receive a badge with Liberty Mutual's data. The "badge per row" count assertion compares against the
live row count (not a fixed partner count), so this doesn't break the test.

### Test/harness notes
- **Firefox timing race (fixed):** `vB.js` runs a `forceInsertion` `setInterval` re-scanning every
  250ms for a full 10s after injection. The CSS-guard test removes injected badges to verify Trustpilot
  images revert — but if that removal happens while the 10s window is still active, the very next
  250ms tick re-inserts the badges before the assertion runs (reproduced live on Firefox @ `/home/`,
  8 badges came back). Fix: `await page.waitForTimeout(10500)` before the CSS-guard removal so the
  interval has fully cleared. Applies to any future test on this vB.js's re-scan pattern.
- Background Playwright runs get killed early in this environment (same lesson as CRE-T-144) — ran
  each browser project in the **foreground** sequentially (~5 min/project, WebKit included).
- Injection method follows the CRE-T-08 pattern: `fs.readFileSync` the local `vB.js`/`vB.css`, then
  `page.addStyleTag({content})` / `page.addScriptTag({content})`, swallowing CSP-violation errors from
  unrelated third-party pixels.

### Additional test cases to consider
- [ ] Fix BUG-01, then add a regression test asserting `.cre-t-146-top-content1-mobile` actually
      renders at mobile viewport (if the block is kept rather than removed).
- [ ] Once published to Convert.com, re-verify against the live force URLs directly (this spec injects
      locally as a pre-deployment check).
