<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 20) on 2026-07-09. -->

# CRE-T-09 — pay.com.au Navbar CTA "Create free account"

**Site:** pay.com.au  
**Spec:** `testing/cre-t-09-nav-cta.spec.js`  
**Reporter:** `cre-t-09-reporter.js`  
**Screenshots:** `cre-t-09-screenshots/`  
**Report:** `local_testing/Local2/cre-t-09-qa-report.html`  
**Result:** 20 TCs × 6 browsers = 118 passed / 0 failed / 2 skipped (TC-19 on mobile viewports — expected)

### What was tested

Variation changes desktop navbar CTA, mobile sticky CTA, mobile hamburger menu CTA, and footer CTA to read "Create free account" using a CSS `::before` pseudo-element technique (preserves original href and tracking attributes).

| TC | Selector | What it checks |
|----|----------|----------------|
| TC-01 | `body` | `body.cre-t-09` class added after injection |
| TC-02 | Desktop CTA | `::before` content = `"Create free account"` [screenshot] |
| TC-03 | Desktop CTA | `font-size: 0px` on element (original text hidden) |
| TC-04 | Desktop CTA | `href` contains "register" (URL preserved) |
| TC-05 | Desktop CTA | `display:flex; align-items:center` |
| TC-06 | Mobile sticky | `::before` content = `"Create free account"` [screenshot] |
| TC-07 | Mobile sticky | `href` preserved |
| TC-08 | Mobile menu | `::before` content = `"Create free account"` [screenshot] |
| TC-09 | Mobile menu | `href` preserved |
| TC-10 | Footer CTA | `::before` content = `"Create free account"` |
| TC-11 | Footer CTA | `href` preserved |
| TC-12 | Sitewide | How It Works page — CTA text correct |
| TC-13 | Sitewide | Pricing page — CTA text correct |
| TC-14 | Sitewide | Solutions page — CTA text correct |
| TC-15 | PAY05 coexistence | CRE-T-05 active alongside CRE-T-09: nav-link `font-size:15px` at 1199px |
| TC-16 | CSS guard | Removing `body.cre-t-09` reverts `::before` content (CDN blocked) |
| TC-17 | JS errors | No uncaught JS errors on page |
| TC-18 | Desktop CTA | `::before` `font-size: 16px` |
| TC-19 | Footer CTA | `::before` `font-size: 15px` — **SKIP on mobile** (element not shown) |
| TC-20 | Mobile 390×844 | Full viewport screenshot |

### Key selectors

```javascript
DESKTOP_CTA   = '.pca-header .pay-new-nav .nav-actions .emp'
MOB_STICKY    = '.pca-header .nav-links .sticky-get-started #mob-get-started'
MOB_MENU_CTA  = '#pay-new-nav .nav-mobile-cta'
FOOTER_CTA    = 'a.pane-footer-cta[href*="register"]'
BASE_URL      = 'https://pay.com.au/?cre=qa'
```

### Key bugs found and fixed during testing

1. **TC-16 — Optimizely CDN interference**: Live CDN independently injects CSS that ignores our `body.cre-t-09` guard. Fix: `page.route('**/cdn.optimizely.com/**', route => route.abort())` before navigation in TC-16.
2. **TC-13 Edge Desktop flake**: Edge Desktop's heavy Optimizely scripts cause ~20–40s load times; CSS hadn't settled before assertion. Fix: `waitForFunction` polling until `::before` content equals expected value (10s timeout, `.catch(() => {})`).

### CSS `::before` technique

```css
html body.cre-t-09 .nav-actions .emp {
    font-size: 0px !important;    /* hide original text */
}
html body.cre-t-09 .nav-actions .emp::before {
    content: "Create free account";
    font-size: 16px;
    /* ... other styles */
}
```
Advantage: preserves `href`, `onclick`, `data-*` tracking attributes on the anchor element.

### PAY05 (CRE-T-05) coexistence

When both CRE-T-05 and CRE-T-09 are active, `vB.js` detects `.cre-t-05-how-it-works` and adds `body.cre-t-05`. The CSS then adjusts nav-link font sizes:

| Breakpoint | Font size |
|------------|-----------|
| 1199px | 15px |
| 1310px | 17px |
| 1450px | 18px |

### `::before` verification helper

```javascript
async function getBeforeContent(page, selector) {
    return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return window.getComputedStyle(el, '::before').content;
    }, selector);
}
// Returns value WITH quotes: '"Create free account"'
// Assert: expect(result).toBe('"Create free account"')
```


