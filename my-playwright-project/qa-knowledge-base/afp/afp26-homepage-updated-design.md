# AFP26 — Homepage Updated Design (Hero + Section Updates)

**Status:** Live QA complete (Chrome + Safari, desktop + mobile), including a second pass against the client's video transcript (obtained 2026-09-12 — see §10 below). See [afp26-homepage-updated-design-qa-report.html](afp26-homepage-updated-design-qa-report.html) for findings — 4 confirmed bugs (BUG-01 card-row button misalignment, BUG-02 malformed placeholder href, BUG-03 tab copy shrank instead of growing, BUG-04 eyebrow font mismatch).

## 10. Video transcript (obtained 2026-09-12 — supersedes the "no transcript available" note in §0 above)

The client provided the transcript directly after QA was first delivered from image+silent-frame analysis alone. Key points not visible in the static Figma image:
- Hero is intentionally shorter than control (less content + reduced top/bottom padding) — "cuts off here as opposed to here."
- **JOIN AFP hero button should be wider — "about as wide as all of these buttons in the box underneath."** Confirmed: 280px vs. card buttons' 209–261px — matches.
- Eyebrow/tag font weight "might be a slightly higher font weight... do your best from the wireframe."
- **Card-row buttons all go to the same destination as control, EXCEPT the certifications button** — client will provide that URL later; a placeholder is fine for now, but see BUG-02 (the current placeholder is a malformed leaked-preview-URL, not a clean no-op).
- Section-2 eyebrow and the "Maintain Your Credential" panel eyebrow should have **the same font characteristics as the card-row eyebrows, just a different color** — see BUG-04 (both are currently mismatched).
- Section-2 heading ("Stand Out with the CTP® or FPAC®") should be **a bit bigger** than the card headings (self-corrected mid-video from an earlier "same as" statement) — confirmed matching (48px vs. 40px).
- Tabs: **"bump up the copy size a little bit more, or even maybe wrap two lines if needed."** See BUG-03 — active tab did grow (14→16px) but inactive tabs shrank (20→16px), net smaller than control's dominant tab size.
- Tab reorder: "Maintaining Your Credential" moves from position 1 to position 3 **but stays the default/active tab** — confirmed matching.
- **Mobile is explicitly deprioritized:** *"the priority here is desktop... it doesn't need to be quite as polished as it does on desktop."* BUG-01 (card-row misalignment) is desktop/tablet-only and therefore still matters at full priority.
**Client:** AFP (Association for Financial Professionals)
**Site:** `www.financialprofessionals.org` (homepage, `/`)
**A/B platform:** VWO (`_vis_preview_data` preview links — not the standard Optimizely `window.VWO` note in `_client-notes.md`, but same VWO platform)
**Control preview URL:** `https://www.financialprofessionals.org/?_vis_preview_data=...` (variant `v:"1"` in the decoded payload)
**Variation preview URL:** `https://www.financialprofessionals.org/?_vis_preview_data=...` (variant `v:"2"` in the decoded payload)
**Figma source:** `figma.com/design/Bsvm JXevaYQSxAPPAstwGf/AFP26----Homepage----Updated-Design` (from the browser tab title visible in every video frame), node id `26007-2&t=zOAQLdxdaBiIYYF0-0`. Figma canvas is titled **"AFP 26 - Homepage - Up..."**, Page 1, single frame group ("Group 1") containing a **side-by-side Control (left) vs Variation (right)** comparison — this is the same file structure the client used to hand off AFP21.
**Reference image:** `c:\Users\Sarthak Rautela\Downloads\figma.png` (2876×2428, a static export/screenshot of the Figma comparison frame)
**Source video:** `Homepage Test Changes, Hero and Section Updates.mp4` (4:21 / 261s, 1920×1058)

> ⚠️ **No transcript available.** There is no speech-to-text tool in this environment, so the client's spoken narration in the video could not be captured. Worse: the video's **visual track never changes** — 87 frames sampled at 3s intervals across the full 4:21 runtime all show the exact same Figma comparison canvas (the same content as `figma.png`), with only the cursor moving/pointing and the zoom level changing slightly (49%→65%) and the canvas scrolling a few hundred px at most. No inspector/properties panel was ever opened on a specific layer (the right-side panel stays on the generic Design/Page/Styles/Export view throughout), no mobile frame was shown, and no second Figma page was visited. **Everything in this spec is therefore derived from the single static comparison image** — there is no additional visual information in the video beyond what `figma.png` already shows, and no way to recover the verbal instructions that presumably accompanied it. Unlike AFP21 (where a literal "rewind what I was saying before" moment was visible as a scroll-back), **no correction / change-of-mind moment could be detected**, but that's a limitation of having no audio, not confirmation none occurred. **A human who can play the audio should re-check this document against what's actually said before QA sign-off** — there may be scope, interaction, or intent details (e.g. what "should be taken seriously" per the requester) that never appear on screen.

---

## 1. What changed — scope

This is a **homepage hero + immediately-following sections** redesign. Based on the Figma comparison, three stacked sections are in scope, top to bottom:

| # | Section | Control | Variation |
|---|---------|---------|-----------|
| 1 | Header/nav | Compact 2-line logo lockup, lighter nav weight | Larger logo lockup, bolder/larger nav type (see §5 — flag, not confirmed as intentional) |
| 2 | Hero | "Become a Member of AFP" | "Advance Your Career with AFP Membership" |
| 3 | 3-card promo row (dark navy strip under hero) | Power Hour / Stablecoins & On-Chain Liquidity Certificate / AFP Events | Power Hour (reworded) / **Earn the CTP® or FPAC®** (topic pivot, not just reworded) / AFP Events (reworded) |
| 4 | Certifications section | Plain "AFP Certifications" label + underline-style tabs, "Maintaining Your Credential" tab active/first | New eyebrow + headline **"Stand Out with the CTP® or FPAC®"** + pill-style tabs, **"Maintain Your Credential" tab reordered to 3rd position**, CTP/FPAC promoted to 1st/2nd |

Footer and everything below the certifications section is not shown in the Figma image — **out of scope, or simply not captured on the comparison canvas.** Confirm with client/Trello whether the redesign extends further down the page than what's in `figma.png`.

---

## 2. Section-by-section breakdown

### 2.1 Header / Nav
Both sides show: logo mark (navy square, "AFP" wordmark), "ASSOCIATION FOR FINANCIAL PROFESSIONALS" 3-line lockup, utility bar (About · Career Hub · Contact · Search · My Account), main nav (Membership, Certification, Topics, Events, Training & Resources — all with dropdown carets).

**Difference observed:** the variation's logo lockup and main-nav labels render visibly larger/bolder than control's in the Figma comparison. This could mean:
- The redesign intentionally restyles the header, or
- The Figma "control" panel is a stale/lower-fidelity screenshot and the real live header already matches the "variation" styling (i.e. no code change needed here), or
- It's simply a Figma auto-layout/scaling artifact from copy-pasting the frame, not a deliberate design decision.

**Not confirmed — flag to client before treating as a bug.** Every prior AFP test (`_client-notes.md`, AFP21 §8) states the header is normally unchanged/out of scope for these redesigns, so this size difference is more likely a Figma export artifact than an actual spec change — but verify by comparing the *live* control page's actual current header rendering against both Figma panels.

### 2.2 Hero
Same background photo (people in a meeting, candlestick-chart graphic overlay top-right) on both sides.

| | Control | Variation |
|---|---|---|
| H1 | Become a Member of AFP | Advance Your Career with AFP Membership |
| Subcopy | Practitioner-driven. Peer-informed. Grounded in real-world experience. AFP connects corporate finance professionals to each other—and to ideas and solutions that translate into real impact. | Practitioner-driven. Peer-informed. Grounded in real-world experience. AFP connects you with treasury and finance professionals, practical tools and learning to grow your expertise and move your career forward. |
| CTA(s) | **JOIN AFP** (single white filled button) | **JOIN AFP** (single white filled button — same single-CTA pattern, no second button added) |

Both H1s are 3-line-capable, left-aligned, white text over the photo. Subcopy directly below, CTA button below that. No stat line / no second CTA in either version (unlike AFP21's 2-CTA hero) — a single "JOIN AFP" button both times.

### 2.3 Three-card promo row (dark navy strip immediately under hero)

Structurally identical scaffold both sides: 3 equal-width cards, card 1 & 3 solid dark navy, card 2 lighter blue (visually distinct/"featured" card), each card = eyebrow (small caps, yellow on navy cards / white on blue card) → bold headline → body copy → outlined button.

| Slot | Control eyebrow | Control headline | Control body | Control button |
|---|---|---|---|---|
| 1 | ASK ABOUT AFP MEMBERSHIP | AFP Power Hour | Join this virtual open house where you can meet the team, explore resources, ask questions and learn all the ways that AFP can support your success. | REGISTER HERE |
| 2 | NEW | Stablecoins & On-Chain Liquidity Certificate | Designed for today's corporate treasurer, this certificate helps professionals build practical knowledge of stablecoins and their growing role in finance. The program covers foundational concepts, treasury use cases, risk and governance considerations and operational implications for finance teams. | LEARN MORE |
| 3 | NETWORKING | AFP Events | Elevate your expertise through practitioner-led sessions, learn from finance industry peers, share real challenges, and build lasting relationships at the premier 2026 networking events for financial professionals. | LEARN MORE |

| Slot | Variation eyebrow | Variation headline | Variation body | Variation button |
|---|---|---|---|---|
| 1 | QUESTIONS ABOUT MEMBERSHIP? | AFP Power Hour | Meet the AFP team, see what membership includes and get your questions answered live before you decide to join. | REGISTER FOR POWER HOUR |
| 2 | CERTIFICATION | Earn the CTP® or FPAC® | Progress your career and validate your experience with the globally recognized CTP® and FPAC® certifications. | EXPLORE CERTIFICATIONS |
| 3 | CONNECT & LEARN | AFP Events | Join 7,000+ treasury and finance professionals at AFP 2026, the premier global event for treasury and finance, plus year-round events and meet-ups. | EXPLORE AFP EVENTS |

**Important: slot 2 is a full topic swap, not a copy edit.** Control's slot 2 promotes a specific product (the Stablecoins & On-Chain Liquidity Certificate, tagged "NEW"). Variation's slot 2 promotes the CTP®/FPAC® certifications generally. This directly foreshadows the emphasis shift in section 2.4 below (certifications getting promoted to the top of the tab order) — the homepage redesign's throughline appears to be **de-emphasizing the one-off stablecoin product and re-emphasizing the core CTP/FPAC certifications**. Confirm this reading with the client; if correct, the "Stablecoins & On-Chain Liquidity Certificate" card content should NOT appear anywhere in the variation (verify it isn't just moved elsewhere on the page).

Button styling: slot 1 & 3 keep the yellow-outline button style in both versions; slot 2's button is a solid dark rectangle both times (not yellow) — consistent between control/variation, no styling regression expected there.

### 2.4 Certifications section

| | Control | Variation |
|---|---|---|
| Eyebrow | *(none)* | **AFP CERTIFICATIONS** (small caps, blue) |
| Heading | AFP Certifications (plain, black, no eyebrow) | **Stand Out with the CTP® or FPAC®** (larger, navy) |
| Tabs (visual style) | Underline-style (active tab = black text + black underline, inactive = gray text) | Pill/box-style (active tab = solid dark-navy fill + white text, inactive = light-gray box) |
| Tab order | **Maintaining Your Credential** (active, 1st) · Certified Treasury Professional (CTP) · Certified Corporate FP&A Professional (FPAC) · AFP Certification Scholarship | Certified Treasury Professional (CTP) · Certified Corporate FP&A Professional (FPAC) · **Maintain Your Credential** (active, **3rd**) · AFP Certification Scholarship |
| Active-tab label | "Maintaining Your Credential" | **"Maintain Your Credential"** — verb form changed (gerund → imperative), not just reordered |
| Content panel eyebrow | ALREADY CERTIFIED *(not present — control panel has no eyebrow)* | **ALREADY CERTIFIED** (new, small caps, on the dark panel) |
| Content panel heading | Maintaining Your Credential | Maintain Your Credential *(matches new tab label, consistent)* |
| Content panel body | For details on maintaining your credential **CLICK HERE.** (inline link, "CLICK HERE" in link-blue, rest white) | Earn recertification credits while staying current through AFP learning, including live webinars that are complimentary for members. *(full new sentence — no "CLICK HERE" inline-link pattern anymore)* |
| Sub-list | **Upcoming Webinars** — Sep 23 \| Stablecoins and Treasury: What Financial Leaders Need to Know · Oct 08 \| How Modern FP&A Drives Strategy With Agentic AI · Oct 15 \| The FX Global Code and Corporate Adoption (each date + link, same list both versions) | *(identical — same 3 webinars, same dates, same titles, same link style)* |
| Panel exit CTA | *(none — panel just ends after the webinar list)* | **Explore Recertification →** (new link with arrow, added below the webinar list) |
| Photo | Man, arms crossed, office/boardroom — smaller crop, sits fully to the right of the panel | Same subject/photo, but **larger crop that visually overlaps/extends below the dark panel's bottom edge** — check whether this is a deliberate full-bleed image treatment or a Figma layering artifact |

**Content risk:** the webinar list content (dates, titles) is **identical** in both versions — good, low risk there. But the tab reorder + label rewording ("Maintaining" → "Maintain") + removal of the "CLICK HERE" inline-link pattern (replaced by body copy + a separate "Explore Recertification →" link) is a real interaction/IA change that needs the underlying tab component to support: (a) a different default-active tab index, (b) a relabeled tab, and (c) different panel-body markup (no more inline link inside a sentence). This is more than a CSS/copy tweak — verify the tab component in code isn't hardcoded to the control's original tab order/labels/index.

---

## 3. Content inventory (exact copy, for QA assertions)

**Hero (variation):**
- H1: `Advance Your Career with AFP Membership`
- Sub: `Practitioner-driven. Peer-informed. Grounded in real-world experience. AFP connects you with treasury and finance professionals, practical tools and learning to grow your expertise and move your career forward.`
- CTA: `JOIN AFP`

**3-card row (variation):**
- Card 1 eyebrow: `QUESTIONS ABOUT MEMBERSHIP?` / headline: `AFP Power Hour` / body: `Meet the AFP team, see what membership includes and get your questions answered live before you decide to join.` / button: `REGISTER FOR POWER HOUR`
- Card 2 eyebrow: `CERTIFICATION` / headline: `Earn the CTP® or FPAC®` / body: `Progress your career and validate your experience with the globally recognized CTP® and FPAC® certifications.` / button: `EXPLORE CERTIFICATIONS`
- Card 3 eyebrow: `CONNECT & LEARN` / headline: `AFP Events` / body: `Join 7,000+ treasury and finance professionals at AFP 2026, the premier global event for treasury and finance, plus year-round events and meet-ups.` / button: `EXPLORE AFP EVENTS`

**Certifications section (variation):**
- Eyebrow: `AFP CERTIFICATIONS`
- Heading: `Stand Out with the CTP® or FPAC®`
- Tabs (order): `Certified Treasury Professional (CTP)`, `Certified Corporate FP&A Professional (FPAC)`, `Maintain Your Credential` (active), `AFP Certification Scholarship`
- Panel eyebrow: `ALREADY CERTIFIED`
- Panel heading: `Maintain Your Credential`
- Panel body: `Earn recertification credits while staying current through AFP learning, including live webinars that are complimentary for members.`
- Sub-heading: `Upcoming Webinars`
- Webinar 1: `Sep 23` / `Stablecoins and Treasury: What Financial Leaders Need to Know`
- Webinar 2: `Oct 08` / `How Modern FP&A Drives Strategy With Agentic AI`
- Webinar 3: `Oct 15` / `The FX Global Code and Corporate Adoption`
- Panel exit link: `Explore Recertification →`

**® symbols:** `CTP®` and `FPAC®` both carry the registered-trademark symbol everywhere they appear in the variation (hero card 2, section heading, tab label) — verify the ® is actually present in the live code, not stripped/omitted (a common copy-paste loss).

---

## 4. Styling — what could and couldn't be confirmed

Unlike AFP21, **no Figma inspector/properties panel was ever opened in any sampled video frame** (right panel stayed on the generic Design/Page/Styles/Export view the entire video) — so **no font-family, size, weight, line-height, letter-spacing, or hex color values could be read from an inspector.** Do not invent numbers for these; pull them from the live control page's computed styles instead (per `_shared/qa-workflow.md` Step 2/3 and AFP21 §4's rule: "From control: font-family, line-height, and other type details — matched by element type").

Colors that **can** be visually confirmed from the image (approximate, not swatch-verified):
- Navy panel background: dark navy, consistent with AFP's existing brand navy (matches AFP21's confirmed `#002B49`-family navy — verify exact hex against live CSS, don't assume it's identical)
- Yellow/gold eyebrow + outline-button color: consistent with AFP's existing gold accent used elsewhere on the current site
- Card 2 "featured" blue: a lighter, brighter blue than the navy cards — distinct brand color, get exact hex from live CSS
- Certifications section eyebrow: blue (different from the navy heading text below it)

**Per the client's standing rule (carried from AFP21 §4):** *"If it's the same on the wireframe, it should be the same in the page as well."* Any size/color that's visually identical between two elements in the Figma image must be verified identical in the live code (e.g., the three card eyebrows should share one font-size/weight, even if their text colors differ by card).

---

## 5. Interaction spec

Nothing beyond the tab-switching behavior itself is demonstrated on screen (no hover state, no click captured mid-transition, no scroll behavior shown, no carousel). What must be inferred/built:
- Certifications tabs must support 4 tabs, active-state styling changes from underline to filled-pill (or the variation must restyle the *existing* tab component's active state, not necessarily add a new component)
- Default active tab on page load changes from index 0 (Maintaining Your Credential) to index 2 (Maintain Your Credential) — **verify the tab component takes a configurable default index; a hardcoded `index 0` default is the most likely bug source here**
- Panel body content differs per tab already in control (that's how tabs work) — just confirm the variation's new panel body/exit-link markup renders correctly for whichever tab is active, not only for "Maintain Your Credential"

---

## 6. Gaps — not shown in Figma / video, must still be decided

| # | Gap | Notes |
|---|---|---|
| G-01 | **Mobile design — not shown.** | Figma only shows a desktop-width comparison; no mobile frame appears anywhere in 87 sampled video frames. Needs a decision on stacking/breakpoints the same way AFP21 flagged this (G-01 there). |
| G-02 | **Tablet — not shown.** | Same as AFP21 G-02 — no instruction, needs a decision. |
| G-03 | **Header/nav size difference (§2.1)** | Not clearly deliberate — could be a Figma artifact. Confirm before treating as spec. |
| G-04 | **Hover/focus/active states** | None shown for the buttons, tabs, or "Explore Recertification →" link. |
| G-05 | **Stablecoin certificate content — does it move elsewhere?** | If card 2 truly drops the stablecoin-certificate promotion sitewide (not just from this one card), confirm there isn't an orphaned reference to it elsewhere expected to stay. |
| G-06 | **Photo crop/overlap in §2.4** | Unclear if the enlarged/overlapping photo crop next to "Maintain Your Credential" is an intentional full-bleed treatment or a Figma-only layout quirk — check live implementation feasibility. |
| G-07 | **How far down the page does the redesign extend?** | Figma comparison stops right after the certifications tab panel. Confirm with client/Trello whether anything below that (on the real homepage) is also in scope, or if that really is the full extent of "hero and section updates." |

---

## 7. Ambiguities to confirm with client / Trello

| ID | Question |
|---|---|
| A-01 | Is the header/logo size difference (§2.1/G-03) an intentional redesign element, or a Figma export artifact? |
| A-02 | Does dropping "Stablecoins & On-Chain Liquidity Certificate" from the 3-card row mean that product promotion is removed from the homepage entirely, or just relocated? |
| A-03 | Is the tab reorder (Maintain Your Credential moving from 1st → 3rd) purely a display-order change, or does it also imply CTP/FPAC should now be the *default* active tab instead of Maintain Your Credential? (Figma shows Maintain Your Credential still active/selected in the variation despite being 3rd — so default active tab is unchanged, only its position moved. Flag this as worth double-checking with the client since it's an easy point to misimplement.) |
| A-04 | Confirm exact hex values for the navy, gold, and "featured" blue against current live brand CSS — don't assume Figma's on-screen colors are calibrated. |
| A-05 | Does the redesign extend below the certifications tab section (G-07)? |
| A-06 | **Get the audio transcribed or re-narrated by a human** — this entire document was built from silent video frames plus the static comparison image; anything the client said that isn't visible on screen (rationale, additional requirements, corrections) is not captured here. |

---

## 8. AFP environment quirks that apply here

Carried from [_client-notes.md](_client-notes.md) — applies to this test too:
- Mock HTML must include **both** `#global-login` and `#global-logout` header navs.
- **Firefox CSP blocks `addStyleTag`** on live AFP URLs — wrap in try/catch, fall back to `page.evaluate()` creating a `<style>` element. (Not directly relevant if this round of QA is Chrome + Safari only, per the request that opened this test, but keep in mind if Firefox/Edge get added later.)
- Use `page.addInitScript({ content: JS })`, not `page.evaluate()`, if/when this becomes a Playwright suite.
- Edge needs `channel: 'msedge'` (not needed this round — Chrome + Safari only requested).
- Header renders a **"REGISTER FOR AFP 2026"** button after load in some prior tests — layout can shift; wait for it before measuring hero positions if it reappears here.
- Site has a chat widget (bottom-right) and a "Quick question" survey bar (bottom-left) — can overlay screenshots, dismiss or account for them.

---

## 9. Test matrix for this round

Per the request that opened this test: **Chrome + Safari, desktop + mobile** (4 combinations, not the full 6/7-browser matrix used on other AFP tests):

| Project | Viewport |
|---|---|
| Chrome Desktop | 1280×800 |
| Safari Desktop (WebKit) | 1280×800 |
| Mobile Chrome (Pixel 5) | 393×851 |
| Mobile Safari (iPhone 12) | 390×844 |

Deliverable: HTML QA report with per-browser/viewport screenshots of control vs. variation for the hero, 3-card row, and certifications section, plus a findings list of any UI breaks / uneven element properties found live, matching the WIN257 / SWF151 / AFP21 report format.
