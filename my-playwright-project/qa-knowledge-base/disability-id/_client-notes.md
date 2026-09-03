# Disability ID - disabilityid.co.uk

**Platform:** Convert.com (`cro_mode=qa` + `_conv_eforce=<projectID>.<variationID>` preview params)
**CMS:** Webflow, hosted on `www.disabilityid.co.uk`. The application funnel is a **separate subdomain**,
`forms.disabilityid.co.uk` - Convert's snippet is not installed there (confirmed 2026-09-02: forcing a
variation eforce param on `forms.disabilityid.co.uk/apply` produces a body with no `cre-t-NNN` class and a
completely different `body` markup, i.e. the experiment genuinely cannot run there regardless of JS).

## Site quirks

- The primary "Apply" CTA (`https://forms.disabilityid.co.uk/apply`) appears in **3 real locations** on the
  homepage, all matched by `a[href*="apply" i]` with a direct child whose own text is exactly "Apply":
  1. Header/nav button (`.right-nav`, always visible)
  2. Hero section button (paired with hero "Renew")
  3. Mobile-only button inside `SECTION.apply` (bottom CTA block, `.hide-desktop` ancestor - only
     rendered <992px). Its desktop sibling (`.hide-tablet` ancestor) already reads "Start my
     application", a different string, and is correctly never touched by the apply-copy test.
- Several OTHER buttons share the exact same `/apply` href but different visible text and must NOT be
  swapped: "Renew" (hero, nav, footer), "Join 300,000+ card holders" (mid-page + late-page), "Start my
  application" (desktop CTA block). Any selector strategy here must check visible text, not just href.
- The real `<footer>` (`footer.footer`) currently has **no "Apply" CTA at all** - only "Renew", a
  newsletter signup form, and an unrelated "National Carers Card" button (different brand/site). If a
  ticket's dev notes mention a "footer button", verify it actually exists on the live page before writing
  an assertion for it - it may be aspirational/outdated copy in the ticket, not a live element.
- **Test-methodology trap:** `element.innerText` on any element that has a `display:none` **ancestor**
  falls back to `textContent` per the HTML living-standard ("if not being rendered, return textContent").
  For a CSS text-swap pattern (`display:none` on the old text node, new node inserted after), reading
  `innerText` on the *parent* `<a>` while that whole button subtree is hidden (e.g. checking the
  mobile-only CTA from a desktop viewport) will concatenate the hidden old text with the new text
  (e.g. "ApplyGet started") even though nothing is actually broken - it's just not rendered. Always check
  `offsetWidth || offsetHeight || getClientRects().length` (or the correct viewport) before trusting
  `innerText`, and verify the old text node's `display` computed style directly instead.
- Multiple *other*, unrelated Convert experiments run concurrently on this site (observed body classes
  `v2-endorsement-badges-hero`, `v1-brand-carousel-hero` during this session) - don't assume every
  non-`cre-t-02` body class is a bug; check whether it's this test's own class specifically.

## Tests

- [SWF-Apply-CTA-Copy](swf-apply-cta-copy.md) (Convert exp. 100052760, sitewide "Apply" -> softer/gain-framed
  copy on 4 variations; 3 real CTA locations identified and verified live; no footer CTA currently exists)
