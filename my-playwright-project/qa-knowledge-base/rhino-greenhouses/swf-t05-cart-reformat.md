# SWF-T05 / cre-t-05 - Rhino Greenhouses Cart Page Reformatted Content

**Site:** rhinogreenhouses.co.uk (Shopify) | **Platform:** Convert.com
**Target URL:** `/cart`
**Audience:** All UK users when a greenhouse has been added to the cart
**Variation files:** `local_testing/Local2/variation/vB.js` / `vB.css` (body class `cre-t-05`)
**Spec:** `testing/rhino-t05-cart-reformat.spec.js`
**Force URLs:** Control `_conv_eforce=100052681.1000256969` · Variation `_conv_eforce=100052681.1000256970`
**Figma:** Control.png / Variant.png (supplied by requester)

## What this test does

Narrows the cart page to a focused checkout decision: hides the full site nav and icon cluster
(logo only remains), hides the seasonal alert banner, hides the "Use a recommended greenhouse
installer" up-sell prompt, hides the buy box's "Estimated Delivery" shipping section, hides the
credit-card logos/discount-code text/PayPal note, relabels the two existing payment-timing options
("Amount to pay today..." → "Order Now", "Delay delivery... with 10% deposit" → "Reserve for
Later") with new benefit-led copy, and (per spec, not implemented - see BUG-01) changes the
checkout button copy to "continue to checkout".

`vB.js` never injects new radio/selector elements for the two payment options - the existing
`.template__cart__deposit-opt-out__option` `opt-out`/`opt-in` buttons (with their SVG checkmark)
are theme-native; the script only adds a `.cre-t-05-header-content` heading and
`.cre-t-05-add-sub` copy block inside each option's `__option__text`, while `vB.css` hides the
original `<h4>` (both options) and the original description `<p>` immediately following `<h4>` on
option 2 only (`.cre-t-05-price-2 ... h4 + p`) to avoid a duplicate "Final balance is due
approximately 2 weeks prior to delivery" line.

## Figma vs. code vs. live

All hide/relabel changes matched Figma exactly, confirmed both by reading `vB.js`/`vB.css` and live
on the Convert.com preview (with a real "Rhino Classic 6x8 Tuscan Olive" variant, id
`39446307766456`, £2,499.00, added to cart via `/cart/add.js` to satisfy this test's
audience-targeting condition).

### BUG-01 [HIGH] - checkout CTA copy never changed to "continue to checkout"

The spec calls for the checkout button copy to change to **"continue to checkout"**. On the live,
deployed variation the button (`button[name="checkout"]`) still reads **"checkout securely"** -
identical to control. A full read of `vB.js` (175 lines) and `vB.css` (110 lines) confirms neither
file contains any selector or logic touching the checkout button at all - the requirement was
simply never implemented. Reproduced on every browser this session (Chrome, Firefox, Edge, Safari,
Mobile Chrome, Mobile Safari).

### NOTE-01 [INFORMATIONAL] - Figma price mismatch, not a code defect

Figma's variant mockup labels the "Reserve for Later" option **£249.00**, but the live,
theme-calculated price (10% deposit on £2,499.00) is **£249.90** on both control and variation -
`vB.js`/`vB.css` never touch this figure, only the surrounding heading/copy. Read as a rounding
artifact in the Figma mockup; worth confirming with the requester since it's a customer-facing
price, but not something the code needs to change unless the £249.00 figure is intentional (which
would require new logic, not present today).

## Test scenarios (24 TCs, `testing/rhino-t05-cart-reformat.spec.js`)

| TC | Category | What it checks |
|----|----------|-----------------|
| TC-01–07 | Control | No `cre-t-05` class; nav/banner/installer/shipping/payment-icons all visible; original option headings visible; checkout button baseline text |
| TC-08 | Variation | `body.cre-t-05` class present |
| TC-09 | CSS | Nav/search/basket hidden, logo visible |
| TC-10–13 | CSS | Alert banner, installer prompt, shipping section, payment icons/discount/PayPal message all hidden |
| TC-14 | CSS | Original option headings hidden (replaced) |
| TC-15/16 | Content | "Order Now" / "Reserve for Later" headings + exact Figma copy |
| TC-17 | Bug doc | Checkout CTA copy should be "continue to checkout" - **documents BUG-01, expected to fail** (`expect.soft` so the rest of the block still runs) |
| TC-18 | Content | Order total unchanged from control (£2,499.00) |
| TC-19 | Responsive | No horizontal overflow at desktop viewport |
| TC-20 | Dedup | Re-running `vB.js` doesn't duplicate injected headings/copy |
| TC-21–23 | Mobile | Nav/mobile-left hidden, no overflow; installer/shipping/payment-icons hidden; headings visible |
| TC-24 | Errors | No new uncaught page errors from the variation script (allowlists known third-party noise - see below) |

## Results (2026-08-31, 3 full runs across Chrome/Firefox/Edge/Safari Desktop + Mobile Chrome/Mobile
Safari + Tablet)

168 case executions (24 TCs × 7 projects) in the final run: **114 passed / 14 failed / 40 did not
run**. Every functional check that reached execution passed identically across all 7 browsers - the
only code-attributable failure anywhere was BUG-01 (TC-17, reproduced on 6/7 browsers that reached
it). The remaining failures were test-infrastructure noise, not product defects:

- **Shopify's own `/cart/add.js` rate-limits (HTTP 429)** under the sustained automated-test traffic
  generated by 3 full 7-browser runs in one session - hit Mobile Safari, Tablet, and intermittently
  Safari/Mobile Chrome Desktop. See `_client-notes.md` for the mitigation applied (cache one cart
  session's `storageState()` and reuse it across every `describe` block instead of adding to cart
  once per block - cut call volume ~4x but did not fully eliminate the limit under back-to-back
  full-suite runs against the live site).
- A handful of third-party network errors unrelated to `vB.js` (Klaviyo/Intelligems CORS blocks on
  Safari's Intelligent Tracking Prevention, a sandboxed-iframe block, a stray
  `window.speechSynthesis` call, a `ResizeObserver loop` warning, an unrelated "Product
  recommendations" widget teardown, and generic "A network error occurred"/"POST request error"
  messages on Firefox/Chrome/Edge) - allowlisted in TC-24's `KNOWN_PREEXISTING_SITE_ERRORS` list,
  confirmed unrelated since `vB.js` contains zero fetch/XHR/iframe/speechSynthesis calls.

## Key notes

- Real variant used for cart testing: Rhino Classic 6x8 Tuscan Olive, id `39446307766456`,
  £2,499.00 - matches the product shown in both Figma mockups exactly (found via
  `products.json?limit=250`, filtered for "classic 6x8").
- `.template__cart__deposit-opt-out__option__text h4` is hidden site-wide once `body.cre-t-05` is
  present (both options); the sibling-selector `h4 + p` rule that removes option 2's stale
  description text still matches even though `h4` itself is `display:none` - CSS adjacency
  selectors match DOM position, not visibility.
- See `_client-notes.md` for the new Shopify rate-limiting quirk this test surfaced, applicable to
  any future Rhino Greenhouses test that needs a cart-add.
