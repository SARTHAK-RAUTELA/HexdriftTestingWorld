# Renters Insurance Gurus — Client Notes (cross-test quirks)

**Site:** `rentersinsurancegurus.com` (sister site: `petinsurancegurus.com` — see `../pet-insurance-gurus/`)
**A/B platform:** Convert.com — force URLs: `?cro_mode=qa&_conv_eforce=<experiment>.<variation>`
**Tests done:** CRE-T-136, SWF146, CRE-T-155

## Environment / site quirks (apply to every RIG test)

- **Same Oxygen-builder WordPress template as Pet Insurance Gurus.** Comparison listings live under
  `#comparison-section .oxy-dynamic-list > [data-unique]`, same as PIG. Tests are frequently cloned
  between the two sites (CRE-T-123 → CRE-T-136) — diff cloned code against the new Figma/brief line by
  line for leftover "pet"/"renters" copy, old fallback names, old `window.cre_t_NNN_event` guard names
  (see CRE-T-136's report for 3 confirmed clone-artifact bugs).
- **`/comparison/` renders the Liberty Mutual row TWICE** (same `data-unique` at position 1 and 8 in
  the dynamic list) — confirmed live during SWF146. Not a code bug; each DOM row is independent.
- **"Ranking Methodology" heading level differs from PIG:** it's an `<h2>` here (PIG uses `<h3>`) — any
  scroll-to-methodology code cloned between the sites must scan `h2, h3, h4`.
- **Convert.com experiments can be QA'd before publish via local injection.** When a force URL renders
  the current production state instead of the intended variation (confirmed by checking for the
  expected body class / DOM markers), the experiment likely hasn't been published to Convert.com yet —
  inject the local `vB.js`/`vB.css` directly onto the real live pages via
  `page.addStyleTag`/`page.addScriptTag` instead (CRE-T-08 pattern). Always confirm the local file
  actually matches the current ticket first (compare `variation_name` in vB.js against the ticket ID) —
  supplied local files have been stale/wrong-test leftovers on other clients (see PIG's SWF139/CRE-T-144).
- **vB.js re-scan intervals can race a CSS-guard test.** If the injected JS runs a periodic
  `setInterval` (e.g. a 250ms/10s `forceInsertion` re-scan to catch late-loading target elements), a
  test that removes injected DOM to verify reversion must wait out the full interval window first —
  otherwise the next tick re-inserts the elements before the assertion runs (reproduced on Firefox,
  SWF146 @ /home/).

## Test files

| Test | File |
|------|------|
| CRE-T-136 — Insurer alert box | [cre-t-136-insurer-alert.md](cre-t-136-insurer-alert.md) |
| SWF146 — TrustScore badge restyle (SWF135-style) | [swf146-badge-restyle.md](swf146-badge-restyle.md) |
| CRE-T-155 — "Landlord Approved" nav link + FAQ | [cre-t-155-landlord-approved-faq.md](cre-t-155-landlord-approved-faq.md) |
| SWF166 — Move Liberty Mutual to #1 (30 geo states) | [swf166-liberty-first.md](swf166-liberty-first.md) |

## Added 2026-10-21 (SWF166)

- **`/comparison/` is now natively Liberty-first** (Liberty #1 with its own yellow bar, Liberty exit modal, Liberty Best
  Overall). `/` and `/home/` are Lemonade-first. The old "Liberty row rendered twice on /comparison/" quirk is gone (7 rows).
- **Geo-state audiences** (`convert.getUserData().geo.state`) block force URLs from outside the US. Patch the bundle in-flight (see SWF166).
- **Check Convert location URLs for `http://`.** SWF166 shipped `http://…/home/`, which never matches.
- **Exit modal** is Oxygen `on_exit_intent`, so it never fires on touch devices (control too). Force-show it to check content.
- **TrustScore images are position-based** (#1 4.9, #2 4.7…), not per-partner.
