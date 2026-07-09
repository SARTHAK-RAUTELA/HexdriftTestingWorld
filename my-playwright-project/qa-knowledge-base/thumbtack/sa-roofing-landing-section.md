<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 18) on 2026-07-09. -->

# Thumbtack SA Roofing — Landing Page Section Injection

**Site:** Thumbtack preview environment  
**Spec:** N/A (manual + automated audit)  
**Report:** `local_testing/Local2/thumbtack-roofing-qa-report.html`  
**Result:** 26 TCs, 7 bugs found and fixed before sign-off

### What was tested

SA Roofing landing page sections (hero, services, testimonials, CTA, footer) injected onto a Thumbtack preview page via variation JS. The test verified each section rendered correctly and matched the Figma.

| TC range | Category |
|----------|----------|
| TC-01–05 | Section presence (hero, services, testimonials, CTA, footer in DOM) |
| TC-06–10 | Content — headings, body text, button labels match Figma exactly |
| TC-11–14 | Images — src correct, alt text set, images loaded (naturalWidth > 0) |
| TC-15–18 | Links — CTA hrefs correct, tel: link correct |
| TC-19–22 | Responsive — layout at 375px and 1280px |
| TC-23–26 | Visual — screenshots for each section at desktop + mobile |

### Bugs found and fixed (7)

1. Hero heading had wrong casing ("SA roofing" vs "SA Roofing")
2. Services section missing third card (only 2 of 3 rendered)
3. Testimonial star rating was 4/5 in code vs 5/5 in Figma
4. CTA button text "Get a Quote" vs "Get Your Free Quote" in Figma
5. Footer phone number format `(800) 555-1234` vs `800-555-1234` in Figma
6. Hero image `alt` attribute missing
7. Mobile layout — services cards stacked incorrectly (flex-direction not set for mobile)


