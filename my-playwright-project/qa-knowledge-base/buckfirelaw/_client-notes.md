# Buckfire Law — client notes

**Site:** `https://buckfirelaw.com` · WordPress (theme `buckfire`)
**A/B platform:** Convert.com (`_conv_eforce` force URLs, `cro_mode=qa`)

## Site quirks

| Quirk | Detail |
|---|---|
| Force URLs inject headless | Convert force links apply reliably in headless Playwright on `/medical-malpractice-lawyers/` — no fresh-context or extra `cro_mode` workaround needed (unlike CRE-T-144 on Pet Insurance Gurus). |
| **Another test runs on the same page** | As of 2026-09-07 the live body class alongside `BuckfireLaw_12` is **`cre-t-21`** (was `cre-t-11` on 2026-08-04 — this rotates). `cre-t-21` is a `cre-t-21-modal-*` lead-capture overlay, and it can open and intercept clicks on other components (observed blocking a Client Stories video-thumbnail click on `/medical-malpractice-lawyers/` after extended dwell time — see `buckfire-12-client-stories.md`'s 2026-09-07 update). Any test asserting "control is clean" must scope to its own prefix rather than assume a bare body, and a test that dwells on a page for a while before interacting should watch for `body.cre-t-21-modal-open` and `.cre-t-21-modal-overlay` intercepting clicks. |
| `#case-results` is the injection anchor | Landing-page template (`page-template-cre-landing`, page id 97524). Present on both control and variation. |
| Video assets on `v2.crocdn.com` | Convert's own CDN. Honours ranged GETs (returns **206**, not 200) — accept `[200, 206]` when checking asset availability. |
| Third-party console noise | ~115 unrelated console entries per load (font `OTS parsing error`, generic `Error` from pixels). Filter console assertions to the variation prefix, or use `pageerror` only. |

## Tests on this client

| Test | Entry |
|---|---|
| BuckfireLaw_12 — Client Stories video carousel (exp. `100052508`, `/medical-malpractice-lawyers/`) | [buckfire-12-client-stories.md](buckfire-12-client-stories.md) |
| Testimonial video card on internal case-type pages (exp. `100052509`, `/case-types/personal-injury/`) | [buckfire-personal-injury-testimonial.md](buckfire-personal-injury-testimonial.md) |

> ⚠ **Both experiments currently use the same body class `BuckfireLaw_12`** — exp. 100052509 never got its
> own name. Scope assertions to the component prefix (`buckfire-12-` vs `testimonial-card__`), not the body
> class. See BUG-02 in the 100052509 entry.

### Force-URL params differ per experiment

| Experiment | Param |
|---|---|
| `100052508` (`/medical-malpractice-lawyers/`) | `cro_mode=qa` |
| `100052509` (`/case-types/personal-injury/`) | `utm_campaign=cre_qa` |

Copy the force URL from the ticket — don't adapt a sibling test's, the QA param is not consistent across
this client's experiments.

## Reusable lessons

- **Swiper-based variations:** wait on `element.swiper` rather than an `initialized` CSS class — the class
  name differs between Swiper 6 (`swiper-container-initialized`) and 7+ (`swiper-initialized`), and
  variations frequently mix a v6 bundle with v7 markup. See BUG-06 in the test entry.
- **Lazy `<video>` variations:** verify playback with `readyState`/`currentTime`, not just that `src` got
  set — and gate those assertions on `canPlayType('video/mp4; codecs="avc1.42E01E"')` so codec-less
  browser builds skip instead of failing falsely.
- **"Pause other videos" logic:** always test the non-click resume paths (keyboard Space, native controls,
  programmatic `.play()`). Click-only wiring is a recurring miss — it produced BUG-01 here.
