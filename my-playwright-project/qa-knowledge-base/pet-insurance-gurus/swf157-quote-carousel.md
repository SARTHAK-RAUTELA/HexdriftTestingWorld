# SWF157 (cre-t-157) — Vet-quote testimonial redesign

**Client:** The Swiftest
**Site:** petinsurancegurus.com (Oxygen-builder WordPress, Convert.com)
**Experiment:** 100052769 — Control 1000257177, V1 1000257178, V2 1000257179, V3 1000257224
**Injection anchor:** `#comparison-section` (quote box inserted immediately `beforebegin`)
**Spec file:** `my-playwright-project/testing/swf157-quote-carousel.spec.js`
**Screenshots:** `swf157-screenshots/` (extracted from the retired HTML QA report)

## What this test does

Replaces the existing SWF145-era plain-text quote (control) with a redesigned quote card
(photo, name/role, source logo, quote-mark), in three flavors:

- **Control** — existing SWF145 V1 baseline, plain-text quote, no photo/logo/carousel.
- **V1** — new card design, single quote, no carousel.
- **V2** — new card design, 4-quote carousel, **manual** pagination only (no autoplay).
- **V3** — new card design, 4-quote carousel, **automatic** rotation every ~5s (manual pagination
  still works and still fires the goal; autoplay-triggered transitions do not).

All three variations (and the control) start from the same quote, confirmed by the client as
**"V5 from SWF145"** = Dr. Diane Deresienski, Managing Veterinarian, quoted via The New York Times.
V2/V3's carousel adds 3 more (Dr. Rebecca Greenstein, Dr. Katy Nelson, Dr. Karen Halligan — all
NYT/NYPost/CBS; GB News correctly excluded from the 4).

## Test scenarios / regression checklist

| TC | Scenario | Result |
|---|---|---|
| TC-C01-04 | Control: section order, legacy plain-text design (no photo/source-img/quote-mark), copy/author/source match, no carousel | ✅ |
| TC-V1-01/02 | V1: exactly one quote box, no carousel; photo+text+name+role+source-logo+quote-mark all render, images load | ✅ |
| TC-V1-03/07 | "Personalize prices" copy hidden; starting quote = Dr. Diane Deresienski (client-confirmed correct) | ✅ |
| TC-V1-05/06 | Mobile column layout at ≤768px; click fires Convert goal 100038194 | ✅ |
| TC-V1-04 | Sitewide: `/compare/`, `/home/`, `/comparison/` all inject the card | ✅ |
| TC-V2-01/08 | 4 pagination bullets; carousel starts on Diane Deresienski before any interaction | ✅ |
| TC-V2-02/03 | 4 unique authors (GB News excluded); does NOT autoplay | ✅ |
| TC-V2-04/05 | Manual pagination changes slide + fires goal | ✅ |
| TC-V2-06/07 | Mobile column layout; "Personalize prices" hidden | ✅ |
| TC-V3-01/07 | 4 bullets, GB News excluded; starts on Diane Deresienski before autoplay fires | ✅ |
| TC-V3-02/03 | Autoplays every ~5s; autoplay transitions do NOT fire the goal | ✅ |
| TC-V3-04/05/06 | Manual click still fires goal; mobile layout; "Personalize prices" hidden | ✅ |
| TC-ERR-* | No console errors, per variant | ⚠️ see Bugs found |

**Final result: 126/128 passed** across Chrome Desktop, Safari Desktop, Mobile Chrome (Pixel 5),
Mobile Safari (iPhone 12).

## Bugs found

- **BUG-01 (resolved, was an open question):** an earlier pass flagged the starting quote
  (Dr. Diane Deresienski / NYT) as possibly wrong against a Figma reference showing Dr. Sarah
  Gorman / Small Door Veterinary / CBS News. Client has since confirmed control **is** "V5 of
  SWF145" and Diane Deresienski's quote is the correct one all three variations should start
  from — not a defect. Test updated to assert this normally rather than flag it.
- **Not a defect in this feature — pre-existing WebKit-only site issue:** `TC-ERR-v1` (Safari
  Desktop) and `TC-ERR-v3` (Mobile Safari) both threw `i.tippy is not a function` — the site's own
  breed-select tooltip (Tippy.js) failing to initialize on WebKit, unrelated to the quote card
  (different DOM subtree, `#breed-select`). Same class of WebKit-specific third-party-script race
  condition already seen on this client (see Disability ID's "1 intermittent WebKit failure traced
  to no MutationObserver" for a similar pattern on a different site). Did not reproduce on Chrome
  or Mobile Chrome.

## Issues found during development / environment quirks

- Injection is async (`waitForSelector(SEL.section, {state:'attached'})`, not a fixed timeout).
- CRE-T-133's ZIP modal (site-wide quirk, see `_client-notes.md`) is dismissed defensively before
  and after navigation in `gotoExperience()`.
- Conversion goal check resets `window._conv_q = []` then polls for `['triggerConversion', '100038194']`.
- Local scratch files `vB.js`/`vB.css` (Local2) build V1's markup 1:1; `va3.js`/`va3.css` build the
  V2/V3 shared carousel (Swiper 8.3.2) — autoplay config present in the file but only actually
  enabled live on V3 (Convert.com toggles it per-variation). `va1.js`/`va2.js` in the same folder
  are stale leftovers from an unrelated Disability-ID test, not SWF157 V2.

## Force URLs

```
Control: https://petinsurancegurus.com/?utm_campaign=Cro157mode&_conv_eforce=100052769.1000257177
V1:      https://petinsurancegurus.com/?utm_campaign=Cro157mode&_conv_eforce=100052769.1000257178
V2:      https://petinsurancegurus.com/?utm_campaign=Cro157mode&_conv_eforce=100052769.1000257179
V3:      https://petinsurancegurus.com/?utm_campaign=Cro157mode&_conv_eforce=100052769.1000257224
```
