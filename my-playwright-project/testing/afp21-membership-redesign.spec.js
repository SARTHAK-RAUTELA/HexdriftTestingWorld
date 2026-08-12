// @ts-check
/**
 * AFP21 — Join AFP / Membership Page Redesign (cre-t-119)
 *
 * Full-page replacement of the "Join AFP" page. Header/nav and footer are
 * untouched by design; everything between them is torn out of #site-main and
 * rebuilt from scratch by vB.js (see qa-knowledge-base/afp/afp21-membership-
 * page-redesign.md for the full spec captured from the client's video + Figma).
 *
 * QA method: this test targets the VWO `_vis_preview_data` preview URL
 * (VWO campaign 59, "Variation-1"), since the live experiment isn't running
 * at 100% traffic. VWO's preview mechanism is async — it initially serves
 * control HTML, then a client-side snippet mutates the DOM to variation
 * after evaluating targeting (confirmed live: took several seconds). Never
 * assert on a fixed sleep; always waitForSelector('body.cre-t-119').
 *
 * Client quirks handled (see qa-knowledge-base/afp/_client-notes.md):
 *  - Firefox CSP blocks addStyleTag on live AFP URLs -> try/catch fallback
 *    to manually creating a <style> element via page.evaluate().
 *  - Edge requires channel: 'msedge' (set in playwright.config.js).
 *  - Header renders "REGISTER FOR AFP 2026" after load, shifting layout ->
 *    wait for the variation body class before measuring anything above the
 *    fold.
 *
 * This suite documents 8 confirmed live bugs (BUG-01..BUG-08) as real,
 * currently-passing assertions of the CURRENT (buggy) behavior — each is
 * commented with what the CORRECT behavior should be per the client's
 * instructions, so a future fix is expected to flip these tests to fail
 * (a visible signal that the bug was fixed), at which point the assertion
 * should be updated to assert the correct behavior instead.
 */
const { test, expect } = require('@playwright/test');

const PREVIEW_URL =
  'https://www.financialprofessionals.org/membership/explore-membership/join?_vis_preview_data=eyJhIjoiMDg0ODI1ODRmOWUxYzM5MjliMjg1NDlhYzRkMWMwYTYiLCJlIjp7IjU5Ijp7InYiOiIyIiwiZCI6MCwicyI6MCwidGciOjAsInQiOjAsInRkIjowLCJsIjowLCJhbGgiOjAsImlwbGUiOjAsImlobyI6MCwicGFoaSI6bnVsbCwic2FiZXIiOm51bGwsIm5ld1F1ZXJ5Qm94IjpudWxsLCJkYXRhUmVnaW9uIjpudWxsLCJtYXRjaFR5cGUiOm51bGwsImNuIjoidW5kZWZpbmVkIiwidXJsIjoiaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuZmluYW5jaWFscHJvZmVzc2lvbmFscy5vcmclMjUyRm1lbWJlcnNoaXAlMjUyRmV4cGxvcmUtbWVtYmVyc2hpcCUyNTJGam9pbiIsImFwcCI6ImFwcCIsInRzIjoxNzg2NDIzMzMxNTYxfX19';
const CONTROL_URL = 'https://www.financialprofessionals.org/membership/explore-membership/join';

const VARIATION_BODY_CLASS = 'cre-t-119';
const EXPECTED_BODY_CLASS = 'cre-t-21'; // per repo convention (cre-t-8...cre-t-19) — BUG-08

const SITE_MAIN = '#site-main';
const HERO_TITLE = '.hero__title';
const HERO_SUBTITLE = '.hero__subtitle';
const JOIN_BTNS = '.btn--primary';
const INFO_SESSION_BTN = '.btn--outline';
const LOGOS = '.logo-placeholder';
const LOGOS_TRACK = '.hero__logos';
const SWIPER_SLIDE = '.swiper-slide';
const SWIPER_PAGINATION_BULLET = '.swiper-pagination-bullet';
const FEATURE_CARD = '.feature-card';
const CONTENT_BLOCK = '.content-block';
const VALUE_TABLE = '.value-table table';
const TOOLTIP_ICON = '.tooltip-icon';
const TOOLTIP_CONTENT = '.tooltip-content';
const START_MEMBERSHIP = '#join';
const QUOTE_BANNER = '.quote-banner';
const FAQ_ITEM = '.faq-item';
const FOOTER_CTA = '.footer-cta';

const EXPECTED_LOGOS = [
  'Pfizer', 'Sodexo', 'Uline', 'Verizon', 'Volkswagen', 'Nissan',
  'New York', 'Netflix', 'IBM', 'Gamestop', 'Fedex', 'Coca-Cola', 'AMC',
];

const EXPECTED_TESTIMONIALS = [
  { name: 'Rosemary Linden', role: 'President, Momentum CFO' },
  { name: 'Mario Vasquez', role: 'Senior Director, Finance, E.W. Scripps' },
  { name: 'Cheyenne Brubaker', role: 'Founder, Arcane Accounting' },
  { name: 'Raquel Alvarez Mateos', role: 'Director of Finance, Kearney' },
];

const EXPECTED_FEATURES = ['Community', 'Practical Tools', 'Stay Current', 'Certification', 'Leadership'];

const EXPECTED_CONTENT_BLOCKS = [
  { tag: 'COMMUNITY', heading: 'Learn From Experienced Practitioners', reverse: false },
  { tag: 'PRACTICAL TOOLS', heading: 'Put Ideas Into Practice', reverse: true },
  { tag: 'STAY CURRENT', heading: 'Stay Up-To-Date', reverse: false },
  { tag: 'CERTIFICATION', heading: 'Maintain Your Certification', reverse: true },
  { tag: 'LEADERSHIP', heading: 'Help Shape the Future', reverse: false },
];

const EXPECTED_TABLE_GROUPS = [
  'Learn & Develop',
  'Community & Practitioner Insights',
  'Research & Practical Resources',
  'Certification & Professional Savings',
];
const EXPECTED_TABLE_ROW_COUNT = 5 + 3 + 4 + 4; // 16 benefit rows across 4 groups

const EXPECTED_FAQ_QUESTIONS = [
  'What do I get with AFP membership?',
  'Why join AFP instead of using free online resources or AI tools?',
  'How much does AFP membership cost?',
  'How long does AFP membership last?',
  'Can I pay monthly?',
  'Can my employer pay for AFP membership?',
  'Do you offer corporate membership?',
  'How do I know if my company already has corporate membership?',
  'Is AFP membership useful if I am pursuing CTP or FPAC certification?',
  'Can AFP membership help me earn and maintain certification credits?',
  'Is AFP membership only for senior finance professionals?',
  'Is there a student or early-career membership option?',
  'Is AFP membership different from attending AFP conference?',
  'What if I belong to a regional AFP association?',
  'Still have questions?',
];

/**
 * Remove overlay elements that intercept clicks / pollute screenshots — the VWO
 * preview debugger iframe, the site's chat widget, and the "quick question" survey
 * bar. CSS injection (addStyleTag, or a manually-created <style> element) was tried
 * first but proved unreliable: on Mobile Safari the site's CSP silently drops inline
 * <style> content when style-src lacks 'unsafe-inline', so `display:none !important`
 * never actually applied and #vwo-debugger kept intercepting pointer events (confirmed
 * live — "locator.click: ... intercepts pointer events"). Direct DOM removal isn't
 * subject to that restriction, matching this repo's established pattern for overlay
 * interference (see qa-workflow.md / SWF139's clearOverlays()).
 */
async function clearOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#_vis_opt_preview_bar, iframe[id*="vwo"], .zEWidget-launcher, [class*="quick-question"]').forEach((el) => el.remove());
  });
}

async function gotoVariation(page) {
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(`body.${VARIATION_BODY_CLASS}`, { state: 'attached', timeout: 25000 });
  await clearOverlays(page);
  // VWO's debugger iframe re-injects itself after the preview finishes applying —
  // clear it again after settling, matching the async injection pattern noted in
  // qa-knowledge-base/afp/_client-notes.md.
  await page.waitForTimeout(500);
  await clearOverlays(page);
}

async function gotoControl(page) {
  await page.goto(CONTROL_URL, { waitUntil: 'domcontentloaded' });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCOPE & STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Scope & structure', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test('body carries the variation class and #site-main is fully replaced', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(new RegExp(VARIATION_BODY_CLASS));
    await expect(page.locator(`${SITE_MAIN} .Cre_explore-membership_redesing`)).toHaveCount(1);
  });

  test('control-only content is fully gone from #site-main, not just hidden alongside the new build', async ({ page }) => {
    const siteMainText = await page.locator(SITE_MAIN).innerText();
    expect(siteMainText, 'control-only "AFP Membership Value & Pricing" heading must not remain').not.toContain('AFP Membership Value & Pricing');
    expect(siteMainText, 'control-only "SEE THE BREAKDOWN" button must not remain').not.toContain('SEE THE BREAKDOWN');
  });

  // On mobile the nav collapses behind a hamburger toggle (buttons render
  // aria-expanded="false" and are visually hidden until opened) — that's the
  // unchanged control header's own responsive behavior, unrelated to this test.
  // Check presence in the DOM, not visibility, so this holds on every viewport.
  test('header nav is untouched — all 5 top-level nav items still present', async ({ page }) => {
    for (const label of ['Membership', 'Certification', 'Topics', 'Events', 'Training & Resources']) {
      await expect(page.getByRole('navigation').getByText(label, { exact: true }).first()).toBeAttached();
    }
  });

  // Footer column headers render in normal case; visual all-caps (if any) is CSS
  // text-transform, not the actual DOM text — match the real text, not the rendered
  // look. Also check presence, not visibility, for the same mobile-collapse reason
  // as the nav test above.
  test('footer is untouched — Membership / Certification / Events / Career Hub columns present', async ({ page }) => {
    const footer = page.locator('footer').first();
    for (const label of ['Membership', 'Certification', 'Events', 'Career Hub']) {
      await expect(footer.getByText(label, { exact: true }).first()).toBeAttached();
    }
  });

  // BUG-08: variation class should be cre-t-21 per this repo's AFP naming convention
  // (cre-t-8...cre-t-19 map 1:1 to their test number). This is currently cre-t-119,
  // which is internally self-consistent (all CSS is scoped to it too) but is very
  // likely a copy-paste leftover. Needs client/dev confirmation before shipping —
  // documented here as the confirmed CURRENT value, not asserted as correct.
  test('BUG-08: variation body class is "cre-t-119", not the expected "cre-t-21" naming convention', async ({ page }) => {
    const hasWrongClass = await page.locator(`body.${VARIATION_BODY_CLASS}`).count();
    const hasExpectedClass = await page.locator(`body.${EXPECTED_BODY_CLASS}`).count();
    expect(hasWrongClass, 'BUG-08: currently uses cre-t-119').toBe(1);
    expect(hasExpectedClass, 'BUG-08: does NOT use the expected cre-t-21 naming convention').toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HERO — content from Figma
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hero', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test('H1 and subtitle match Figma copy exactly', async ({ page }) => {
    await expect(page.locator(HERO_TITLE)).toHaveText('Advance Your Treasury and Finance Career with AFP Membership');
    await expect(page.locator(HERO_SUBTITLE)).toHaveText(
      'Learn from experienced practitioners, access practical resources, support your professional development and certification, and make better decisions throughout your treasury and finance career.'
    );
  });

  test('90% stat line and survey source are present', async ({ page }) => {
    await expect(page.locator('.hero__stat-line')).toContainText('90%');
    await expect(page.locator('.hero__stat-line')).toContainText('of members are satisfied with their membership');
    await expect(page.locator('.hero__stat-source')).toHaveText('AFP 2025 Member Survey');
  });

  test('CTA button copy is exact: "JOIN AFP" and "FREE INFO SESSION"', async ({ page }) => {
    await expect(page.locator('.hero').locator(JOIN_BTNS)).toHaveText('JOIN AFP');
    await expect(page.locator(INFO_SESSION_BTN)).toHaveText('FREE INFO SESSION');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMED BUGS — CTA behavior (BUG-01, BUG-02, BUG-03)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Confirmed bugs — CTA behavior', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  // BUG-01: client's corrected instruction (6:12-7:13 in the source video, "rewind
  // what I was saying before") was that Hero JOIN AFP, the table-bottom JOIN AFP, and
  // the Footer CTA JOIN AFP should all smooth-scroll DOWN/UP to #join — NOT navigate
  // away. There is zero smooth-scroll JS anywhere in vB.js. Documents current (wrong)
  // behavior: all 4 JOIN AFP buttons share one hardcoded external href.
  test('BUG-01: Hero / table-bottom / footer JOIN AFP are hardcoded links, not smooth-scroll anchors to #join', async ({ page }) => {
    const btns = page.locator(JOIN_BTNS);
    const count = await btns.count();
    expect(count, 'expected 4 JOIN AFP buttons: hero, table-bottom, start-membership, footer').toBe(4);
    const hrefs = await btns.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    const uniqueHrefs = new Set(hrefs);
    expect(uniqueHrefs.size, 'BUG-01: all JOIN AFP buttons currently share the exact same hardcoded href').toBe(1);
    for (const href of hrefs) {
      expect(href, 'BUG-01: none of them point at #join — the smooth-scroll target').not.toBe('#join');
    }
  });

  // BUG-02: confirmed live against the real control page — 3 of its 4 "JOIN AFP"
  // buttons resolve to pathname /eweb/DynamicPage.aspx with query params
  // Site/WebCode/ct/_gl (the GA cross-domain linker). The variation's hardcoded
  // financialprofessionals.org/membership/benefits/join-now is neither that
  // domain/path nor carries the linker param.
  test("BUG-02: the navigating JOIN AFP (inside Start Your AFP Membership) does not match the control's real destination", async ({ page }) => {
    const startMembershipJoinHref = await page
      .locator(START_MEMBERSHIP)
      .locator(JOIN_BTNS)
      .getAttribute('href');
    const url = new URL(startMembershipJoinHref);
    expect(url.pathname, "BUG-02: control's real target is /eweb/DynamicPage.aspx").not.toBe('/eweb/DynamicPage.aspx');
    expect(url.searchParams.has('_gl'), 'BUG-02: the GA cross-domain linker param (_gl) is missing — attribution will break').toBe(false);
  });

  // BUG-03: client was explicit — "new tab, please, new tab."
  test('BUG-03: FREE INFO SESSION does not open in a new tab', async ({ page }) => {
    const target = await page.locator(INFO_SESSION_BTN).getAttribute('target');
    const rel = await page.locator(INFO_SESSION_BTN).getAttribute('rel');
    expect(target, 'BUG-03: missing target="_blank"').not.toBe('_blank');
    // rel is currently absent entirely (null), not just missing "noopener" — guard for that.
    expect(rel ?? '', 'BUG-03: missing rel="noopener"').not.toContain('noopener');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGO MARQUEE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Logo marquee', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
    // The track's transform animates continuously, so Playwright's actionability
    // check ("wait for element to be stable") never settles on scrollIntoViewIfNeeded()
    // and times out. Scroll via the raw DOM API instead — it doesn't wait for stability.
    await page.locator(LOGOS_TRACK).evaluate((el) => el.scrollIntoView({ block: 'center' }));
  });

  test('trust-text heading is present', async ({ page }) => {
    await expect(page.locator('.hero__trust-text')).toContainText('Join 10,000+ treasury and finance professionals');
  });

  test('all 13 logos are present (client explicitly asked for all 13, Figma only showed 10)', async ({ page }) => {
    const alts = await page.locator(`${LOGOS} img`).evaluateAll((imgs) => imgs.map((img) => img.getAttribute('alt')));
    expect(alts.length).toBe(13);
    for (const name of EXPECTED_LOGOS) {
      expect(alts.some((a) => a === name), `expected logo "${name}" to be present`).toBe(true);
    }
  });

  // BUG-05: the CSS keyframe animates translateX(0) -> translateX(-50%), which only
  // produces a seamless infinite loop if the logo set is duplicated (26 nodes so the
  // second copy lines up at -50%). Confirmed only 13 render — the loop will visibly
  // jump/snap once per cycle instead of scrolling smoothly and continuously.
  test('BUG-05: logo track is not duplicated for a seamless infinite-scroll loop', async ({ page }) => {
    const logoCount = await page.locator(LOGOS).count();
    expect(logoCount, 'BUG-05: CSS keyframe assumes 2x duplication (26), but only one set renders').toBe(13);
  });

  // BUG-06: two conflicting CSS rule blocks target .hero__logos/.logo-placeholder —
  // an old static-row ruleset (higher specificity, 3 scoped classes) was never removed
  // when the marquee animation ruleset (lower specificity, unscoped) was added.
  // Confirmed live: container height (48px, from the old rule) is shorter than the
  // logo image's own max-height (55px, from the new rule) — the image can overflow
  // its own placeholder box.
  test("BUG-06: stale duplicate CSS makes the logo placeholder shorter than its own image max-height", async ({ page }) => {
    const first = page.locator(LOGOS).first();
    const placeholderHeight = await first.evaluate((el) => parseFloat(getComputedStyle(el).height));
    const imgMaxHeight = await first.locator('img').evaluate((el) => parseFloat(getComputedStyle(el).maxHeight));
    expect(placeholderHeight, "BUG-06: placeholder height should be >= the image's own max-height to avoid overflow").toBeLessThan(imgMaxHeight);
  });

  test('marquee animation is applied (confirms it is at least attempting to auto-scroll, slowly)', async ({ page }) => {
    const animationName = await page.locator(LOGOS_TRACK).evaluate((el) => getComputedStyle(el).animationName);
    const animationDuration = await page.locator(LOGOS_TRACK).evaluate((el) => getComputedStyle(el).animationDuration);
    expect(animationName).toBe('logoSlide');
    // "slow, not fast" per the client — 30s for a 13-logo strip is a reasonable, slow pace.
    expect(parseFloat(animationDuration)).toBeGreaterThanOrEqual(20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIAL CAROUSEL (Swiper)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Testimonial carousel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
    await page.locator('.testimonials').scrollIntoViewIfNeeded();
  });

  test('Swiper initializes on every tested browser (CSP does not block the cdnjs fetch+eval)', async ({ page }) => {
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.testimonials-swiper');
        return !!(el && el.swiper);
      },
      { timeout: 15000 }
    );
    const initialized = await page.locator('.testimonials-swiper').evaluate((el) => !!el.swiper);
    expect(initialized, 'Swiper failed to initialize — likely CSP-blocked cdnjs.cloudflare.com fetch or eval').toBe(true);
  });

  test('all 4 testimonials are present in the correct order with correct name/role', async ({ page }) => {
    const cards = page.locator(SWIPER_SLIDE);
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < EXPECTED_TESTIMONIALS.length; i++) {
      const card = cards.nth(i);
      await expect(card).toContainText(EXPECTED_TESTIMONIALS[i].name);
      await expect(card).toContainText(EXPECTED_TESTIMONIALS[i].role);
    }
  });

  test('pagination bullet count matches real slide/breakpoint math, not Figma\'s placeholder "5 dots for 4 slides"', async ({ page }) => {
    const bulletCount = await page.locator(SWIPER_PAGINATION_BULLET).count();
    expect(bulletCount).not.toBe(5);
    expect(bulletCount).toBeGreaterThan(0);
  });

  test('next/prev arrows navigate the carousel', async ({ page }) => {
    const next = page.locator('.testimonials-nav__next');
    // force: true — see the tooltip test above re: the re-attaching VWO debugger iframe.
    await next.click({ force: true });
    await page.waitForTimeout(500);
    const activeBullet = page.locator('.swiper-pagination-bullet-active');
    await expect(activeBullet).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WHY FINANCE PROFESSIONALS JOIN AFP (feature cards)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Feature cards', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test('5 feature cards present with correct titles, in order', async ({ page }) => {
    const cards = page.locator(FEATURE_CARD);
    await expect(cards).toHaveCount(5);
    for (let i = 0; i < EXPECTED_FEATURES.length; i++) {
      await expect(cards.nth(i).locator('h3')).toHaveText(EXPECTED_FEATURES[i]);
    }
  });

  test('each feature card icon renders as an inline SVG', async ({ page }) => {
    const icons = page.locator(`${FEATURE_CARD} .feature-card__icon svg`);
    await expect(icons).toHaveCount(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT BLOCKS — 5 alternating sections
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Content blocks (alternating layout)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test('5 content blocks present with correct tag + heading, in order', async ({ page }) => {
    const blocks = page.locator(CONTENT_BLOCK);
    await expect(blocks).toHaveCount(5);
    for (let i = 0; i < EXPECTED_CONTENT_BLOCKS.length; i++) {
      const block = blocks.nth(i);
      await expect(block.locator('.tag')).toHaveText(EXPECTED_CONTENT_BLOCKS[i].tag);
      await expect(block.locator('h2')).toHaveText(EXPECTED_CONTENT_BLOCKS[i].heading);
    }
  });

  test('image alternation is R,L,R,L,R — media sits on the correct side relative to text at desktop widths', async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(vp.width < 900, 'alternating side-by-side layout only applies at desktop widths; mobile always stacks');
    const blocks = page.locator(CONTENT_BLOCK);
    for (let i = 0; i < EXPECTED_CONTENT_BLOCKS.length; i++) {
      const block = blocks.nth(i);
      const textBox = await block.locator('.content-block__text').boundingBox();
      const mediaBox = await block.locator('.content-block__media').boundingBox();
      const mediaIsLeft = mediaBox.x < textBox.x;
      expect(mediaIsLeft, `block ${i} (${EXPECTED_CONTENT_BLOCKS[i].heading}) reverse=${EXPECTED_CONTENT_BLOCKS[i].reverse}`).toBe(
        EXPECTED_CONTENT_BLOCKS[i].reverse
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TABLE — "Over $4,000 in Member Value"
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Comparison table', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test('all 4 groups present, in order, with the full 16 benefit rows (verified against Figma, including the 3 rows the source video never scrolled to)', async ({ page }) => {
    const groupRows = page.locator('tr.table-group');
    await expect(groupRows).toHaveCount(4);
    for (let i = 0; i < EXPECTED_TABLE_GROUPS.length; i++) {
      await expect(groupRows.nth(i)).toContainText(EXPECTED_TABLE_GROUPS[i]);
    }
    const benefitRows = page.locator(`${VALUE_TABLE} tbody tr:not(.table-group)`);
    await expect(benefitRows).toHaveCount(EXPECTED_TABLE_ROW_COUNT);
  });

  test('spot-check: Professional Development Resources row (last row, previously unconfirmed) has correct values', async ({ page }) => {
    const row = page.locator(`${VALUE_TABLE} tbody tr`, { hasText: 'Professional Development Resources' });
    await expect(row).toContainText('Limited Access');
    await expect(row).toContainText('Included');
  });

  // BUG-04: client's explicit instruction — "make sure that the tooltip that appears
  // resizes depending on how long the copy is." Confirmed live: width is a fixed 220px.
  test('BUG-04: tooltip width is fixed (220px), not responsive to the copy length', async ({ page }) => {
    const firstTooltipIcon = page.locator(TOOLTIP_ICON).first();
    // force: true — the VWO debugger iframe re-attaches itself periodically and can
    // intercept the hover's interception check regardless of prior removal attempts.
    await firstTooltipIcon.hover({ force: true });
    const tooltip = page.locator(TOOLTIP_CONTENT).first();
    const width = await tooltip.evaluate((el) => getComputedStyle(el).width);
    expect(width, 'BUG-04: should not be a fixed 220px given the client wants it to resize to content').toBe('220px');
  });

  test('all 16 rows have a tooltip icon', async ({ page }) => {
    const icons = page.locator(TOOLTIP_ICON);
    await expect(icons).toHaveCount(EXPECTED_TABLE_ROW_COUNT);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// START YOUR AFP MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Start Your AFP Membership', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
    await page.locator(START_MEMBERSHIP).scrollIntoViewIfNeeded();
  });

  test('pricing and description match Figma exactly', async ({ page }) => {
    await expect(page.locator(`${START_MEMBERSHIP} h2`)).toHaveText('Start Your AFP Membership');
    await expect(page.locator(`${START_MEMBERSHIP} .price__amount`)).toHaveText('$545 per year');
    await expect(page.locator(`${START_MEMBERSHIP} .price__sub`)).toHaveText('Individual Membership');
    await expect(page.locator(`${START_MEMBERSHIP} .start-membership__note`)).toContainText('Immediate access to your member benefits');
  });

  test('3 options present: Affirm, Student & Early Career, Corporate', async ({ page }) => {
    const options = page.locator(`${START_MEMBERSHIP} .option`);
    await expect(options).toHaveCount(3);
    await expect(options.nth(0)).toContainText('Pay monthly through Affirm');
    await expect(options.nth(1)).toContainText('Student & Early Career Membership');
    await expect(options.nth(2)).toContainText('Corporate Membership');
  });

  test("this is the only JOIN AFP button intended to navigate per the client's spec (structural check, not endorsing BUG-02's current href)", async ({ page }) => {
    await expect(page.locator(START_MEMBERSHIP).locator(JOIN_BTNS)).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE BANNER (Lee Ann Perkins)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Quote banner', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
    await page.locator(QUOTE_BANNER).scrollIntoViewIfNeeded();
  });

  test('quote, name, and role match Figma exactly', async ({ page }) => {
    await expect(page.locator(`${QUOTE_BANNER} h3`)).toContainText('I would not be in the professional position I am today');
    await expect(page.locator(`${QUOTE_BANNER} .quote-banner__author`)).toContainText('Lee Ann Perkins, CTP(CD)');
    await expect(page.locator(`${QUOTE_BANNER} .quote-banner__author`)).toContainText('Assistant Treasurer, Specialized Bicycle Components');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
test.describe('FAQ', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
    await page.locator('.faq').scrollIntoViewIfNeeded();
  });

  test('all 15 questions present, in order, exact copy', async ({ page }) => {
    const items = page.locator(FAQ_ITEM);
    await expect(items).toHaveCount(15);
    for (let i = 0; i < EXPECTED_FAQ_QUESTIONS.length; i++) {
      await expect(items.nth(i).locator('summary')).toHaveText(EXPECTED_FAQ_QUESTIONS[i]);
    }
  });

  test('implemented as real <details>/<summary> accordions with a +/− icon, not a flat list', async ({ page }) => {
    const detailsCount = await page.locator('details.faq-item').count();
    expect(detailsCount).toBe(15);
  });

  // BUG-07: client — "if you could collapse them all... that would be great."
  test('BUG-07: FAQ item 1 is open by default instead of all items starting collapsed', async ({ page }) => {
    const openStates = await page.locator(FAQ_ITEM).evaluateAll((els) => els.map((el) => el.hasAttribute('open')));
    expect(openStates[0], 'BUG-07: item 1 currently opens automatically').toBe(true);
    expect(openStates.slice(1).every((open) => open === false), 'items 2-15 are correctly collapsed').toBe(true);
  });

  test('clicking a collapsed question opens it (accordion interaction works)', async ({ page }) => {
    const second = page.locator(FAQ_ITEM).nth(1);
    await expect(second).not.toHaveAttribute('open', '');
    // The VWO debugger iframe re-attaches itself periodically and can intercept this
    // click on WebKit regardless of prior removal — force bypasses the check outright.
    await clearOverlays(page);
    await second.locator('summary').click({ force: true });
    await expect(second).toHaveAttribute('open', '');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER CTA
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Footer CTA band', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
    await page.locator(FOOTER_CTA).scrollIntoViewIfNeeded();
  });

  test('heading and subcopy match Figma exactly', async ({ page }) => {
    await expect(page.locator(`${FOOTER_CTA} h2`)).toHaveText('Join AFP and Accelerate Your Career');
    await expect(page.locator(`${FOOTER_CTA} p`)).toHaveText('Everything you need to keep learning, growing and making better decisions.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY — Figma size/color/padding/margin; control font-family/line-height
// per element type (client's explicit rule, stated twice: once in the video and
// once re-confirmed directly to QA — "font-size, color, padding, margin should
// match the Figma and font-family, line-height and other detail should match
// from control based on heading or paragraph").
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Typography — Figma values + control-inherited font-family/line-height', () => {
  test('H1 matches Figma size/color; heading font-family matches control h1', async ({ page, context }) => {
    const controlPage = await context.newPage();
    await gotoControl(controlPage);
    const controlH1 = controlPage.locator('h1').first();
    const controlFontFamily = await controlH1.evaluate((el) => getComputedStyle(el).fontFamily);
    await controlPage.close();

    await gotoVariation(page);
    const heroTitle = page.locator(HERO_TITLE);
    const variationStyle = await heroTitle.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color, fontFamily: cs.fontFamily };
    });

    // Figma only ever specified a desktop frame (Gap G-01 — no mobile design at
    // all), so the 54px value is a desktop-only expectation; the developer's own
    // mobile breakpoints (32px <=768px, 26px <=480px) have no Figma spec to check
    // against. Color and font-family are viewport-independent and still apply.
    const vp = page.viewportSize();
    if (vp.width >= 768) {
      expect(variationStyle.fontSize).toBe('54px');
    }
    expect(variationStyle.color).toBe('rgb(0, 43, 73)'); // #002b49
    // Control-inherited (vB.css declares no font-family at all on headings, so it
    // should inherit the site's own heading font-family, not a hardcoded Inter).
    expect(variationStyle.fontFamily, "heading font-family should match the control site's font, not Figma's Inter").toBe(controlFontFamily);
  });

  test('body/paragraph copy matches control font-family; hero subtitle matches Figma size', async ({ page, context }) => {
    const controlPage = await context.newPage();
    await gotoControl(controlPage);
    const controlP = controlPage.locator('p').first();
    const controlFontFamily = await controlP.evaluate((el) => getComputedStyle(el).fontFamily);
    await controlPage.close();

    await gotoVariation(page);
    const subtitleStyle = await page.locator(HERO_SUBTITLE).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fontSize: cs.fontSize, fontFamily: cs.fontFamily };
    });

    // Figma: 18px for hero subcopy (one of only two 18px uses per the client's video)
    // — desktop-only, same reasoning as the H1 test above (no Figma mobile spec exists).
    const vp = page.viewportSize();
    if (vp.width >= 768) {
      expect(subtitleStyle.fontSize).toBe('18px');
    }
    expect(subtitleStyle.fontFamily, "paragraph font-family should match the control site's body font, not Figma's Inter").toBe(controlFontFamily);
  });

  test("attribution name/role sizing matches the client's stated consistency rule (14px, gray role text) across all 3 places it appears", async ({ page }) => {
    await gotoVariation(page);

    // Testimonial carousel attribution
    await page.locator('.testimonials').scrollIntoViewIfNeeded();
    const testimonialAuthor = page.locator('.testimonial-card__author').first();
    await expect(testimonialAuthor).toHaveCSS('font-size', '14px');
    await expect(testimonialAuthor.locator('span')).toHaveCSS('color', 'rgb(107, 114, 128)'); // #6b7280

    // Content-block quote attribution
    await page.locator(CONTENT_BLOCK).first().scrollIntoViewIfNeeded();
    const mediaAuthor = page.locator('.media-card__author').first();
    await expect(mediaAuthor).toHaveCSS('font-size', '14px');
    await expect(mediaAuthor.locator('span')).toHaveCSS('color', 'rgb(107, 114, 128)');

    // BUG-09: quote banner attribution is the one place this consistency rule breaks.
    // `.quote-banner__text p` (3 scoped classes + element type, specificity 0,3,1) beats
    // `.quote-banner__author` (3 scoped classes only, specificity 0,3,0) regardless of
    // source order, so the 14px rule never applies here even though it does for the
    // testimonial-card and media-card attributions above.
    await page.locator(QUOTE_BANNER).scrollIntoViewIfNeeded();
    const quoteAuthor = page.locator(`${QUOTE_BANNER} .quote-banner__author`);
    await expect(quoteAuthor, 'BUG-09: renders at 16px due to a CSS specificity collision, not the intended 14px').toHaveCSS('font-size', '16px');
    await expect(quoteAuthor.locator('span')).toHaveCSS('color', 'rgb(107, 114, 128)');
  });

  test('quote/body copy is consistently 16px regular across testimonials, content blocks, and quote banner', async ({ page }) => {
    await gotoVariation(page);
    await page.locator('.testimonials').scrollIntoViewIfNeeded();
    await expect(page.locator('.testimonial-card__quote').first()).toHaveCSS('font-size', '16px');
    await page.locator(CONTENT_BLOCK).first().scrollIntoViewIfNeeded();
    await expect(page.locator('.media-card__quote').first()).toHaveCSS('font-size', '16px');
    await page.locator(QUOTE_BANNER).scrollIntoViewIfNeeded();
    // .quote-banner__text has 2 <p> tags (the quote, then .quote-banner__author) — the
    // quote itself is always first in DOM order, so .first() disambiguates cleanly.
    await expect(page.locator(`${QUOTE_BANNER} p`).first()).toHaveCSS('font-size', '16px');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE — mobile-viewport-only checks (run on every project; only asserts
// on projects whose viewport is actually mobile-width, matching this repo's
// SWF139 convention of gating by viewport rather than hardcoding project names).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Responsive — mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVariation(page);
  });

  test('hero actions stack vertically on mobile', async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(vp.width >= 768, 'desktop keeps the two hero buttons side-by-side');
    const direction = await page.locator('.hero__actions').evaluate((el) => getComputedStyle(el).flexDirection);
    expect(direction).toBe('column');
  });

  test('content blocks stack to a single column, text first, on mobile', async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(vp.width >= 768, 'desktop uses the alternating 2-column grid');
    const first = page.locator(CONTENT_BLOCK).first();
    const columns = await first.locator('.content-block__grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
  });

  test('comparison table drops its header row and stacks to label/value pairs on mobile', async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(vp.width >= 768, 'desktop keeps the real 3-column table with header');
    await page.locator(VALUE_TABLE).scrollIntoViewIfNeeded();
    const theadDisplay = await page.locator(`${VALUE_TABLE} thead`).evaluate((el) => getComputedStyle(el).display);
    expect(theadDisplay).toBe('none');
  });
});
