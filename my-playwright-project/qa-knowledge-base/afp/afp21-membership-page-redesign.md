# AFP21 — Join AFP / Membership Page Redesign

**Status:** spec captured from client video — QA not yet started
**Client:** AFP (Association for Financial Professionals)
**A/B platform:** VWO
**Expected variation namespace:** `cre-t-21` (follows AFP08…AFP19 convention)
**Control URL:** `https://www.financialprofessionals.org/membership/explore-membership/join`
**Figma (video reference copy):** `figma.com/design/18lHNKCebDIO970iSPk0wJ4/AFP21---Membership---Membership-Page-Redesign---Working-`
— Page **"Page 1 - Final"**, frame **"Version 4"**, root node `16031-2637`
**Figma (working file, access confirmed):** `figma.com/design/FYiiXMtyvUVv4qYNxHK50h` — Page **"Page 31"**, canvas **"AFP21"**, root node `3856:2`. Structurally identical to the video reference copy (same group hierarchy, same "image 39" 1442×80 logo strip) — treat as the same design, different file copy.
**Source video:** `Test 21 Join AFP Redesign Overview.mp4` (8:14)

> Note: node `3856:2` also contains a reference frame named `www.financialprofessionals.org_membership_explore-membership_join(Desktop) 2` — appears to be a pasted screenshot of the live control page kept in the file for comparison. Not part of the design to build.

---

## 1. Scope rule (stated twice, explicitly)

- **Header / nav: unchanged.** Nothing above the hero is touched.
- **Footer: unchanged.** "Exactly the same as it is already."
- **Everything in between: hide the control content entirely and replace with new content.**

> Client's reason, verbatim: *"The client may make some changes to the current join page… if they do, I don't want it to break this test, so ideally we just replace everything with this new content."*

**QA implication:** the variation must hide the control body by **container**, not by enumerating individual control elements. A per-element hide list is a latent failure — if AFP edits the join page, orphan control blocks reappear between our sections. Test for this explicitly.

---

## 2. Section order (top → bottom)

| # | Section | Notes |
|---|---------|-------|
| 1 | Hero | H1, subcopy, 2 CTAs, stat line |
| 2 | Logo strip | "Join 10,000+…" + 13 logos, slow auto-scroll |
| 3 | Testimonial carousel | 4 cards, 3 visible desktop |
| 4 | Why Finance Professionals Join AFP | 5 icon cards |
| 5 | Learn From Experienced Practitioners | tag `COMMUNITY`, image **right** |
| 6 | Put Ideas Into Practice | tag `PRACTICAL TOOLS`, image **left** |
| 7 | Stay Up-To-Date | tag `STAY CURRENT`, image **right** |
| 8 | Maintain Your Certification | tag `CERTIFICATION`, image **left** |
| 9 | Help Shape the Future | tag `LEADERSHIP`, image **right** |
| 10 | Over $4,000 in Member Value | comparison table + tooltips |
| 11 | **Start Your AFP Membership** | pricing block — **the smooth-scroll target** |
| 12 | Lee Ann Perkins pull-quote | image left |
| 13 | Frequently Asked Questions | 15 items, accordions |
| 14 | Join AFP and Accelerate Your Career | dark navy CTA band |

Feature-section image alternation is **R, L, R, L, R**.

---

## 3. Interaction spec — CLIENT CHANGED HIS MIND MID-VIDEO

At **0:48** he said the hero JOIN AFP should mirror the existing join button.
At **6:12–7:13** he explicitly retracted that (*"rewind what I was saying before"*). **The later instruction wins:**

| Element | Behaviour |
|---|---|
| Hero **JOIN AFP** | Smooth scroll **down** to "Start Your AFP Membership" |
| Hero **FREE INFO SESSION** | Open AFP Power Hour in a **new tab** |
| Final CTA **JOIN AFP** (navy band) | Smooth scroll **up** to "Start Your AFP Membership" |
| **JOIN AFP inside "Start Your AFP Membership"** | **The only button that navigates.** Mimics a click on the control's JOIN AFP button → membership hub |

**Free Info Session target:**
`https://www.financialprofessionals.org/events/meetings/afp-power-hour--discover-whats-possible`
(reached via nav → Events → "AFP Power Hour: Discover What's Possible"). New tab is explicit — `target="_blank"` + `rel="noopener"`.

**Membership hub target** (observed live at 7:02):
`https://eweb.afponline.org/eweb/DynamicPage.aspx?Site=afp&WebCode=AFPMbrApplication&ct=us&_gl=…&_ga=…&_hstc=…`

> ⚠️ **Different domain, and the URL carries GA cross-domain linker params (`_gl`, `_ga`, `_hstc`).** The client said *"mimic a click on this button"* — not "link to this URL". Hardcoding the href strips the linker and **breaks cross-domain attribution**, which for a membership-conversion test destroys the metric the test exists to measure. Correct implementation reads the control anchor's live `href` at click time, or dispatches a click on the control element.

**Correction (2026-08-13): that recorded target is only the anchor's static `href`, not where an anonymous
visitor actually lands.** `AFPMbrApplication` itself 302-redirects any unauthenticated request straight to
AFP's login gate — verified directly via `curl`:
```
GET https://eweb.afponline.org/eweb/DynamicPage.aspx?Site=afp&WebCode=AFPMbrApplication&ct=us
→ HTTP/1.1 302 Found
  Location: /eWeb/DynamicPage.aspx?WebCode=LoginRequired&expires=yes&Site=afp
```
Final URL for a logged-out session: `https://eweb.afponline.org/eWeb/DynamicPage.aspx?WebCode=LoginRequired&expires=yes&Site=afp`.
So for the overwhelming majority of real visitors (no active AFP member session), clicking "JOIN AFP" inside
"Start Your AFP Membership" — on the control page **or** on this variation, since it mimics the control's own
click — actually surfaces AFP's login wall, not the membership application form. `AFPMbrApplication` only
serves real content once already authenticated; the "7:02" observation above was presumably made from an
already-logged-in session and only captured the first hop. This does not change BUG-02's fix (still read the
control anchor's live `href`/dispatch its click, not hardcode a URL) — it only corrects what the *end* result
of doing that correctly looks like for a typical anonymous visitor.

---

## 4. Styling rule

- **From Figma:** `font-size`, `color`, `padding`, `margin`
- **From control:** `font-family`, `line-height`, and other type details — matched **by element type** (heading vs paragraph)

Figma is drawn in **Inter**; the live site uses its own families. Use the site's.

> *"The fonts I've used here are Inter, but we should use whatever the current site is… we're just using the same font families as exists already, and where we have things like line height already pre-selected on the page, we'll just use that also."*

### Figma type values captured from the video's inspector panel

| Element | Font | Weight | Size | LH | LS | Fill |
|---|---|---|---|---|---|---|
| Hero H1 | Inter | Extra Bold | 54 | 60 | 0.25px | `#002B49` |
| Hero subcopy | Inter | Regular | **18** | 24 | 0.25px | `#000000` |
| Section body copy | Inter | Regular | 16 | 24 | 0.25px | `#000000` |
| Quote text | Inter | Regular | 16 | 24 | 0.25px | `#000000` |
| Attribution — name | Inter | Semi/Bold | 14 | — | 0.25px | `#000000` |
| Attribution — role | Inter | Regular | 14 | — | 0.25px | `#687280` |
| Table row label | Inter | Regular | 16 | 24 | 0.25px | `#000000` |
| FAQ answer | Inter | Regular | 16 | 24 | 0.25px | `#000000` |
| FAQ question | — | — | **19** | — | — | navy (different colour) |

**Client's consistency rule:** *"If it's the same on the wireframe, it should be the same in the page as well."* 18px appears in only two places; 14px gray is used for every attribution. Any size/colour identical in Figma must be identical in code — an explicit QA assertion, not a nice-to-have.

Colours observed: navy `#002B49`, gray `#687280` (verify — may be `#6B7280`), page bg `#F5F5F5`, teal tag pills / buttons (exact hex needs Figma).

---

## 5. Content inventory

### Hero
- **H1:** Advance Your Treasury and Finance Career with AFP Membership
- **Sub:** Learn from experienced practitioners, access practical resources, support your professional development and certification, and make better decisions throughout your treasury and finance career.
- **CTAs:** `JOIN AFP` (filled) · `FREE INFO SESSION` (outlined)
- **Stat:** **90%** of members are satisfied with their membership
- **Source:** AFP 2025 Member Survey

### Logo strip
- Heading: Join 10,000+ treasury and finance professionals from the world's leading organizations
- **Figma shows 10. Control page has 13. Client wants all 13.**
- Full 13 (from control page, 3:42): AMC Theatres, Coca-Cola, FedEx, GameStop, IBM, Netflix, New York Life, Nissan, Pfizer, Sodexo, **Uline, Verizon, Volkswagen Group**

### Testimonial carousel (4 total)
| # | Name | Role | Quote |
|---|---|---|---|
| 1 | Rosemary Linden | President, Momentum CFO | "The value of AFP is not limited to what I learn. It is also found in the relationships I build, the ideas I contribute, and the opportunities I have to help advance the profession." |
| 2 | Mario Vasquez | Senior Director, Finance, E.W. Scripps | "The network you can build through AFP is something you can't really put a price tag on. You never know when you'll want or need to tap into it, and that kind of access is something you just can't buy." |
| 3 | Cheyenne Brubaker | Founder, Arcane Accounting | "It's very helpful to hear from others in the industry, their challenges, how to overcome those, what to do and not do. I have ideas that can implement in our organization." |
| 4 | Raquel Alvarez Mateos | Director of Finance, Kearney | "My peers are a resource for finding solutions, excellence and a shortcut that it gives me the platform to succeed." |

Card 4 sits **outside** the Figma frame — it is the off-screen "next" card revealed by the right arrow, **not** a 4-across layout.

### Why Finance Professionals Join AFP (5 cards)
1. **Community** — Gain practical help and advice from peers who've solved similar challenges.
2. **Practical Tools** — Turn ideas into action with templates, benchmarks, tools and a deep knowledge base.
3. **Stay Current** — Keep pace with change through reports, events, and the people actually living through it.
4. **Certification** — Earn credits towards CTP® and FPAC®, plus discounted exam rates and study resources.
5. **Leadership** — Build your reputation, develop leadership skills and contribute back to the profession.

### Feature sections
| Tag | Heading | Quote attribution |
|---|---|---|
| COMMUNITY | Learn From Experienced Practitioners | Frank Chou, CTP, FPAC, Chief Financial Officer |
| PRACTICAL TOOLS | Put Ideas Into Practice | Mario Vasquez, FPAC, Senior Director |
| STAY CURRENT | Stay Up-To-Date | Lora Burton, CTP, SVP Treasurer — "Every time I engage with my peers, I learn something new." |
| CERTIFICATION | Maintain Your Certification | Cheyenne Brubaker, Founder |
| LEADERSHIP | Help Shape the Future | Rosemary Linden, President |

### Comparison table — "Over $4,000 in Member Value"
Sub: *A single research report or workshop can cost hundreds of dollars. AFP membership includes a full year of learning, research, practical resources and community access for just $545.*

Header row (navy): **Benefit | AFP Non-Member | AFP Member**

| Group | Row | Non-Member | Member |
|---|---|---|---|
| Learn & Develop | AFP Learn Interactive Platform ⓘ | Not Available | ✓ Included |
| | Live Webinars (24+ per year) ⓘ | $50 per webinar | ✓ Included |
| | Live Virtual Workshops (4+ per year) ⓘ | $295 per workshop | ✓ Included |
| | On-Demand Webinars & Courses ⓘ | Not Available | ✓ Included |
| | Digital Badges ⓘ | $50 per badge | ✓ Included |
| Community & Practitioner Insights | AFP Collaborate Community ⓘ | Not Available | ✓ Included |
| | Virtual Member Meet-Ups (6+ per year) ⓘ | $50 per meet-up | ✓ Included |
| | Member Networking Opportunities ⓘ | Limited Access | ✓ Included |
| Research & Practical Resources | Research Reports ⓘ | $295 per report | ✓ Included |
| | Tools & Templates ⓘ | Not Available | ✓ Included |
| | Industry Benchmarking Resources ⓘ | Limited Access | ✓ Included |
| | Practical Guides & Checklists ⓘ | Limited Access | ✓ Included |
| Certification & Professional Savings | Member Pricing for AFP Events ⓘ | Standard Pricing | ✓ Discounted |
| | Member Pricing for Certification ⓘ | Standard Pricing | ✓ Discounted |
| | Certification Credit Opportunities ⓘ | Pay Per Activity | ✓ Included |
| | Professional Development Resources ⓘ | Limited Access | ✓ Included |

### Start Your AFP Membership (scroll target)
- **$545 per year** / Individual Membership
- Join more than 10,000 treasury and finance professionals who rely on AFP to make better decisions, stay current and advance their careers.
- Button: `JOIN AFP` ← **only navigating button on the page**
- ✓ Immediate access to your member benefits
- Right column: **Pay monthly through Affirm** (Eligible U.S. members can spread payments over time.) · **Student & Early Career Membership** (Reduced pricing for students and early-career professionals.) · **Corporate Membership** (Team membership options are available. Check whether your organisation already offers AFP membership.)

> Copy note: "organis**a**tion" is British spelling on a US site. Everything else uses US spelling ("organizations"). Flag to client.

### Pull quote
"I would not be in the professional position I am today" — AFP is absolutely the reason I entered into and remain so passionate about the treasury field. Without the association's support, guidance and opportunities provided to me I would not be in the professional position I am today.
— **Lee Ann Perkins, CTP(CD)**, Assistant Treasurer, Specialized Bicycle Components

### FAQ (15 items)
1. What do I get with AFP membership?
2. Why join AFP instead of using free online resources or AI tools?
3. How much does AFP membership cost?
4. How long does AFP membership last?
5. Can I pay monthly?
6. Can my employer pay for AFP membership?
7. Do you offer corporate membership?
8. How do I know if my company already has corporate membership?
9. Is AFP membership useful if I am pursuing CTP or FPAC certification?
10. Can AFP membership help me earn and maintain certification credits?
11. Is AFP membership only for senior finance professionals?
12. Is there a student or early-career membership option?
13. Is AFP membership different from attending AFP conference?
14. What if I belong to a regional AFP association?
15. Still have questions?

### Final CTA band (navy)
- **Join AFP and Accelerate Your Career**
- Everything you need to keep learning, growing and making better decisions.
- Button: `JOIN AFP` → smooth scroll **up** to §11

---

## 6. NOT in Figma — must still be built

Described verbally but never designed. Each is a QA risk because there is no visual reference to check against.

| # | Gap | Client instruction |
|---|---|---|
| G-01 | **Mobile design — entirely absent** | "Should also be mobile developed and just use a standard mobile format and stack things as appropriate. Use good padding, make things consistent." |
| G-02 | **Tablet — never mentioned, never designed** | No instruction at all. Needs a decision. |
| G-03 | **Logo marquee** — Figma has 10 logos baked into **one flat 1442×80 image** | 13 individual logos, **slow** infinite scroll, all same size, vertically centred. Source from control page / worldvectorlogo.com / AI-sharpen. |
| G-04 | **Tooltip content + design** — 20 ⓘ icons, zero copy, zero tooltip visual | Use placeholder copy; tooltip must **resize to copy length**; add a **CSS hook to hide all tooltips** if content isn't ready at launch. |
| G-05 | **FAQ accordion** — Figma shows all 15 expanded, no accordion, no icon | Collapse all by default, add expand/collapse icon. Fallback: plain list is acceptable. |
| G-06 | **Mobile carousel** | 1 card centred + **edge peek** of neighbours (preferred over stacking). |
| G-07 | **Carousel dot count** — Figma draws **5 dots** for **4 testimonials** | Dots must match real slide count. |
| G-08 | **Hover / focus / active states** — none designed | Buttons, carousel arrows, dots, accordion rows, tooltips. |
| G-09 | **Comparison table on mobile** — 3-col table, no mobile treatment | Needs horizontal scroll or stacked-card pattern. |
| G-10 | **Smooth-scroll offset** — site header is sticky | Scroll target will sit under the header without an offset. Not specified. |
| G-11 | ~~Bottom of comparison table~~ — **RESOLVED via Figma metadata**, see §5 table. | |
| G-12 | **JOIN AFP click-mimic vs hardcoded href** | See §3 — GA linker params must survive. |
| G-13 | **"Still have questions?"** has no contact link/CTA | Dead-end item. Also unclear whether it's an accordion or a static closing block. |
| G-14 | **Reduced-motion** | Auto-scrolling marquee + smooth scroll both need `prefers-reduced-motion` handling. |

---

## 7. Ambiguities to confirm with client / Trello

| ID | Question |
|---|---|
| A-01 | **Smooth-scroll destination.** At 6:12 he was looking at the comparison table when he said "scroll down to this section", then cancelled, then at 6:32 pointed at "Start Your AFP Membership" saying "it's this button in this membership area". Reading strongly favours **§11 Start Your AFP Membership** — confirm. |
| A-02 | **Which testimonial is centred initially?** "This is the one that should show in the middle" — appears to be card 2 (Mario Vasquez). Confirm. |
| A-03 | Is "Still have questions?" an accordion item or a static block? (G-13) |
| A-04 | Tablet behaviour — desktop layout or mobile layout, and at what breakpoint? (G-02) |
| A-05 | Exact tooltip placeholder copy, or ship with tooltips hidden? |
| A-06 | "organisation" spelling in §11 — intentional? |

---

## 8. AFP environment quirks that apply here

Carried from [_client-notes.md](_client-notes.md):

- Mock HTML must include **both** `#global-login` and `#global-logout` header navs.
- **Firefox CSP blocks `addStyleTag`** on live AFP URLs — wrap in try/catch, fall back to `page.evaluate()` creating a `<style>` element.
- Use `page.addInitScript({ content: JS })`, not `page.evaluate()` — matches how VWO injects before DOM parse.
- Edge needs `channel: 'msedge'`.
- Nav uses `[type="button"]` elements, not `<button>`.
- Header renders a **"REGISTER FOR AFP 2026"** button after load — layout shifts. Wait for it before measuring hero positions.
- Site has a chat widget (bottom-right) and a "Quick question" survey bar (bottom-left) that can overlay the final CTA — dismiss or account for them in screenshots.
- Use `test.fail(true, reason)` to document known Figma-vs-code bugs while keeping `describe.serial` suites running.

---

## 9. Figma/instruction → code diff (QA workflow Step 2, done BEFORE writing tests)

Code reviewed: `local_testing/Local2/variation/vB.js` + `vB.css`. Findings below, ranked by severity.

| # | Severity | Finding |
|---|---|---|
| **BUG-01** | **Critical** | **The client's corrected, final instruction (6:12–7:13, "rewind what I was saying before") is not implemented at all.** Hero JOIN AFP, the table-bottom JOIN AFP, and the Footer CTA JOIN AFP are all hardcoded `<a href="https://www.financialprofessionals.org/membership/benefits/join-now">` — plain navigation links. There is **zero smooth-scroll JS** anywhere in `vB.js` (no `scrollIntoView`, no click handler referencing `#join`). `#join` is set as the id on the Start-Membership section but nothing ever scrolls to it. Every CTA on the page does the opposite of the client's final ask. |
| **BUG-02** | **Critical — CONFIRMED live via DOM inspection, both control and variation** | The **one button that should navigate** — JOIN AFP inside "Start Your AFP Membership" — uses a static hardcoded href (`.../membership/benefits/join-now`) instead of mimicking the control's click or reading its live href. Live-checked the actual control page (no VWO preview) on 2026-08-11: 3 of the 4 real "JOIN AFP" buttons on the control page resolve to **pathname `/eweb/DynamicPage.aspx`** with query params **`Site`, `WebCode`, `ct`, `_gl`** (the GA cross-domain linker) — confirming this is a different domain from `financialprofessionals.org` and that the linker param is present and dynamic per-session. The variation's hardcoded `.../membership/benefits/join-now` is neither that domain/path nor carries `_gl` — it will not reach the membership hub and will not carry attribution. Separately, the **header nav's own "Join" button** (unrelated to this test, unchanged) happens to use `.../membership/benefits/join-now` with `target="_blank"` — likely where the dev got that URL from, applying the client's *retracted* first instruction ("mirror the existing join button") instead of the corrected one. |
| **BUG-03** | **High** | **FREE INFO SESSION does not open in a new tab.** No `target="_blank"` / `rel="noopener"` on that anchor. Client was explicit: "new tab, please, new tab." |
| **BUG-04** | **High** | **Tooltip width is fixed, not content-responsive.** `.tooltip-content { width: 220px; }` is a fixed value. Client's instruction was explicit: "make sure that the tooltip that appears resizes depending on how long the copy is." All 20 tooltips currently share identical placeholder text, so this hasn't surfaced visually yet — but it will as soon as real copy of varying length goes in. |
| **BUG-05** | **Medium** | **Logo marquee is not built for seamless infinite loop.** `buildLogosHTML()` renders the 13 logos **once**; the CSS keyframe animates `translateX(0) → translateX(-50%)` — a pattern that requires the content to be duplicated (26 total nodes) so the second copy lines up at the -50% mark. With only one set, the strip will scroll past all 13 logos, hit empty space, then snap back to start — a visible jump every loop cycle instead of the "slow, continuous" effect the client asked for. |
| **BUG-06** | **Medium** | **Conflicting/duplicate CSS for `.hero__logos` and `.logo-placeholder`.** Two separate rule blocks target each class — one scoped (`.cre-t-119 .Cre_explore-membership_redesing .hero__logos` / `...logo-placeholder`, specificity 3 classes) with `justify-content:space-between; height:48px; flex:1 1 120px; max-width:160px`, and one unscoped (`.hero__logos` / `.hero__logos .logo-placeholder`, specificity 1–2 classes) with `width:max-content; animation:logoSlide...; flex:0 0 140px; width:140px; height:70px`. Because specificity differs per property, the computed style is a merge neither rule intended: **`height:48px` wins (from the higher-specificity scoped rule) while the logo `img` has `max-height:55px`** — the image will be taller than its own container, likely clipping/overlapping the row above/below. Looks like an older static-logo-row ruleset was never removed when the marquee version was added. Needs a real fix (delete the stale rule), not just a test workaround. |
| **BUG-07** | **Medium** | **All FAQ items should be collapsed by default; item 1 opens automatically.** `buildFaqHTML()` sets `open` on `i === 0`. Client: "if you could collapse them all... that would be great." |
| **BUG-08** | **Medium — needs confirmation, not yet a confirmed bug** | **Variation class is `cre-t-119`, not `cre-t-21`.** Every other AFP test in this repo (`cre-t-8`…`cre-t-19`) names its class after the test number. AFP21 should almost certainly be `cre-t-21`. `cre-t-119` is either a copy-paste leftover from unrelated boilerplate or a typo. This is internally self-consistent (all CSS selectors also use `cre-t-119`, so nothing is visually broken) but it's a real risk: if a different, unrelated live experiment happens to also use `cre-t-119` as a class name, style collisions are possible, and it will confuse QA/reporting cross-referencing against the Trello card and VWO dashboard. **Needs dev/client confirmation of the correct VWO variation code before this ships.** |
| **ADVISORY — checked live in Chrome, needs Firefox/Safari cross-check** | Low | Swiper is loaded via `fetch(...).then(code => new Function(code)())` from `cdnjs.cloudflare.com` — effectively remote code eval. Live-checked the site's CSP header: `script-src` includes `'unsafe-eval'` (so `new Function()` isn't blocked) but has **no `connect-src` directive**, so the `fetch()` call falls back to `default-src` — not fully verified from the visible (truncated) header. Empirically confirmed Swiper initializes correctly in Chrome on the live preview (`swiperInitialized: true`, 4 slides, pagination working). Still worth confirming in Firefox/Safari during the Playwright run since `_client-notes.md` already documents Firefox enforcing CSP differently on this same site (`addStyleTag` blocked there). |
| **ADVISORY** | Low | No `prefers-reduced-motion` handling for the logo marquee animation (G-14, already logged). |
| **RESOLVED — not a bug** | — | R/L/R/L/R image alternation for the 5 content blocks matches Figma exactly (`reverse` flag + `direction:rtl` on the grid, `ltr` on children, correctly reorders media vs. text while keeping text readable). |
| **RESOLVED — not a bug** | — | Testimonial carousel correctly shows Rosemary(1)/Mario(2)/Cheyenne(3) as the initial 3-up view at desktop `slidesPerView:3` — Mario naturally lands in the visual middle column without needing `centeredSlides`, satisfying A-02. |
| **RESOLVED — not a bug** | — | Swiper's pagination bullet count is auto-generated from real slide/breakpoint math, not hardcoded — correctly avoids reproducing Figma's placeholder "5 dots for 4 slides" (G-07). |
| **RESOLVED — not a bug** | — | Comparison table content (all 4 groups, all rows incl. the 3 previously-unconfirmed "Certification & Professional Savings" rows) matches Figma exactly. |
| **BUG-09** | **Medium — found by the Playwright suite (Chrome Desktop run), confirmed live** | **Quote banner attribution renders at 16px instead of the intended 14px.** `.quote-banner__author` (line 720 of vB.css, `font-size:14px`) is a `<p>` element nested inside `.quote-banner__text`, which also carries `.quote-banner__text p { font-size:16px }` (line 714). Both selectors share the same 3 scoped classes, but the latter adds a bare element-type selector (`p`), giving it *higher* specificity (0,3,1) than `.quote-banner__author` alone (0,3,0) — so the 16px rule wins regardless of source order. This breaks the client's explicit "consistency across every attribution line" rule (§4) specifically for the quote banner; the testimonial-card and media-card attributions are unaffected since neither has a competing generic-`p` rule at that specificity. **Fix:** either scope `.quote-banner__text p` to exclude `.quote-banner__author` (`:not(.quote-banner__author)`), or bump the author rule's specificity to match/exceed it. |

## 10. Test matrix planned

6 existing Playwright projects + tablet (to be added):

| Project | Viewport |
|---|---|
| Chrome Desktop | 1280×800 |
| Firefox Desktop | 1280×800 |
| Edge Desktop (`channel: msedge`) | 1280×800 |
| Safari Desktop (WebKit) | 1280×800 |
| Mobile Chrome (Pixel 5) | 393×851 |
| Mobile Safari (iPhone 12) | 390×844 |
| **Tablet Chrome (Galaxy Tab S4)** — to add | 712×1138 |
| **Tablet Safari (iPad Pro 11)** — to add | 834×1194 |

Deliverable: HTML QA report with per-browser screenshots, matching the WIN257 / SWF151 report format.
