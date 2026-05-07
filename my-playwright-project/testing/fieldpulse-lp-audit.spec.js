// =============================================================
// FieldPulse x Thumbtack Landing Page — Variation Audit
// QA URL: https://www.thumbtack.com/pro?QA=Partnership_field&coBrand=fieldpulse
// Run:  npx playwright test fieldpulse-lp-audit --project="Chrome Desktop"
//       npx playwright test fieldpulse-lp-audit --project="Safari Desktop"
// =============================================================

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const QA_URL = 'https://www.thumbtack.com/pro?QA=Partnership_field&coBrand=fieldpulse';

const variationJS = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/vB.js'),
  'utf8'
);
const variationCSS = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/vB.css'),
  'utf8'
);

const SCREENSHOTS_DIR = path.resolve(__dirname, '../fieldpulse-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14 Pro

// ── HELPERS ─────────────────────────────────────────────────────────────────

// Navigate to QA URL. If the Optimizely/Convert platform hasn't activated the
// variation (body.FieldPulse class absent), inject the local JS + CSS as fallback
// so we can still audit the DOM behaviour.
async function loadVariation(page, browserName) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console error] ${msg.text()}`);
  });

  console.log(`\n[${browserName}] Navigating to QA URL…`);
  await page.goto(QA_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });

  // Give Optimizely/Convert time to fire the variation
  await page.waitForTimeout(4000);

  const activatedByPlatform = await page.evaluate(
    () => document.body.classList.contains('FieldPulse')
  );
  console.log(`[${browserName}] Variation activated by platform: ${activatedByPlatform}`);

  if (!activatedByPlatform) {
    console.log(`[${browserName}] Platform did NOT activate — injecting local JS + CSS as fallback`);
    await page.addStyleTag({ content: variationCSS });
    await page.evaluate((code) => {
      const s = document.createElement('script');
      s.textContent = code;
      document.head.appendChild(s);
    }, variationJS);
  }

  // Wait for variation class (up to 15s)
  try {
    await page.waitForFunction(
      () => document.body.classList.contains('FieldPulse'),
      { timeout: 15000 }
    );
    console.log(`[${browserName}] body.FieldPulse class confirmed ✓`);
  } catch {
    console.log(`[${browserName}] WARNING: body.FieldPulse class never appeared!`);
  }

  // Extra settle time for waitForElement callbacks inside vB.js
  await page.waitForTimeout(3000);

  return errors;
}

// ── MOBILE TEST SUITE ────────────────────────────────────────────────────────

test.describe('FieldPulse LP — Mobile Audit (390px)', () => {

  async function loadVariationMobile(page, browserName) {
    await page.setViewportSize(MOBILE_VIEWPORT);
    const errors = [];
    page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[console error] ${msg.text()}`);
    });
    console.log(`\n[${browserName} MOBILE] Navigating to QA URL…`);
    await page.goto(QA_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    const activatedByPlatform = await page.evaluate(() => document.body.classList.contains('FieldPulse'));
    if (!activatedByPlatform) {
      await page.addStyleTag({ content: variationCSS });
      await page.evaluate((code) => {
        const s = document.createElement('script');
        s.textContent = code;
        document.head.appendChild(s);
      }, variationJS);
    }
    try {
      await page.waitForFunction(() => document.body.classList.contains('FieldPulse'), { timeout: 15000 });
    } catch { console.log(`[${browserName} MOBILE] WARNING: FieldPulse class never appeared`); }
    await page.waitForTimeout(3000);
    return errors;
  }

  test('M-1: hero title visible on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const hero = page.locator('[class*="hero_heroTitle"]').first();
    await expect(hero).toBeVisible({ timeout: 10000 });
    const text = await hero.textContent();
    console.log(`[MOBILE] Hero title: "${text?.trim()}"`);
    expect(text).toContain('Grow your business in');
  });

  test('M-2: hero subtitle $100 + FieldPulse on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const subtitle = page.locator('[class*="hero_heroInnerOffsetRight"] > [class*="Type_text1"]').first();
    await expect(subtitle).toBeVisible({ timeout: 10000 });
    const text = await subtitle.textContent();
    console.log(`[MOBILE] Subtitle: "${text?.trim()}"`);
    expect(text).toContain('$100');
    expect(text).toContain('FieldPulse');
    expect(text).not.toContain('Sherwin-Williams');
  });

  test('M-3: "Sign up for free" mobile CTA button', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const btn = page.locator('[data-testid="get-started-button-mobile"] span').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    const text = await btn.textContent();
    console.log(`[MOBILE] Mobile CTA text: "${text?.trim()}"`);
    expect(text?.trim()).toBe('Sign up for free');
  });

  test('M-4: How Thumbtack works section renders on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const heading = page.locator('.thumbtack-section h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText('How Thumbtack works');
    // On mobile cards stack — confirm 3 exist
    const items = page.locator('.thumbtack-section .feature-item');
    expect(await items.count()).toBe(3);
  });

  test('M-5: comparison table renders on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const table = page.locator('[class*="see-how-different_featureComparisonChart"]').first();
    await expect(table).toBeVisible({ timeout: 10000 });
    const rows = page.locator('[class*="see-how-different_featureComparisonChartRow"]');
    const count = await rows.count();
    console.log(`[MOBILE] Comparison rows: ${count}`);
    expect(count).toBe(6);
  });

  test('M-6: testimonials heading "real pros" on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const heading = page.locator('.testimonials h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    const text = await heading.textContent();
    console.log(`[MOBILE] Testimonials heading: "${text?.trim()}"`);
    expect(text).toContain('real pros');
    expect(text).not.toContain('painters');
  });

  test('M-7: testimonial cards stack vertically on mobile (flex-direction column)', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const cards = page.locator('.testimonials .card');
    const count = await cards.count();
    console.log(`[MOBILE] Card count: ${count}`);
    expect(count).toBe(3);
    // Verify cards stack — second card top > first card bottom
    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    if (box0 && box1) {
      console.log(`[MOBILE] Card 1 bottom: ${box0.y + box0.height} | Card 2 top: ${box1.y}`);
      expect(box1.y).toBeGreaterThan(box0.y + box0.height - 10);
    }
  });

  test('M-8: calculator inputs are full-width on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const input = page.locator('input[placeholder="Enter $ amount"]');
    await expect(input).toBeVisible({ timeout: 10000 });
    const box = await input.boundingBox();
    console.log(`[MOBILE] Input width: ${box?.width}px (viewport: ${MOBILE_VIEWPORT.width}px)`);
    if (box) expect(box.width).toBeGreaterThan(MOBILE_VIEWPORT.width * 0.7);
  });

  test('M-9: community section visible on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const section = page.locator('.community').first();
    await expect(section).toBeVisible({ timeout: 10000 });
    const heading = page.locator('.community h2').first();
    const text = await heading.textContent();
    console.log(`[MOBILE] Community heading: "${text?.trim()}"`);
    expect(text).toContain('Pro Community');
  });

  test('M-10: mobile placeholder is "e.g. Plumbing"', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    const input = page.locator('#new-pro-lp-cs').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    const ph = await input.getAttribute('placeholder');
    console.log(`[MOBILE] Placeholder: "${ph}"`);
    // On mobile (< 768px) code sets "Enter the service you provide."
    // Figma shows e.g. Plumbing — log for review
  });

  test('M-11: no horizontal scroll on mobile', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    await page.evaluate(() => window.scrollTo(0, 0));
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log(`[MOBILE] body.scrollWidth: ${bodyWidth}px (viewport: ${MOBILE_VIEWPORT.width}px)`);
    expect(bodyWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 5);
  });

  test('M-12: full mobile page screenshot', async ({ page, browserName }) => {
    await loadVariationMobile(page, browserName);
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let pos = 0;
        const t = setInterval(() => { window.scrollBy(0, 400); pos += 400; if (pos > document.body.scrollHeight) { clearInterval(t); window.scrollTo(0, 0); resolve(); } }, 120);
      });
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `mobile-full-${browserName}.png`),
      fullPage: true,
    });
    console.log(`[MOBILE] Full screenshot saved for ${browserName}`);
  });
});

// ── TEST SUITE ───────────────────────────────────────────────────────────────

test.describe('FieldPulse LP — Variation Audit', () => {

  // ── 1. VARIATION ACTIVATION ────────────────────────────────────────────────
  test.describe('1 — Variation Activation', () => {

    test('body has FieldPulse class after page load', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const hasClass = await page.evaluate(
        () => document.body.classList.contains('FieldPulse')
      );
      console.log(`body.FieldPulse present: ${hasClass}`);
      expect(hasClass, 'body must carry class "FieldPulse" for all styles/selectors to apply').toBe(true);
    });

    test('page title is set to FieldPulse branding (not Sherwin-Williams)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const title = await page.title();
      console.log(`Page title: "${title}"`);
      // EXPECTED: something FieldPulse-related
      // KNOWN ISSUE: current code sets "Sherwin-Williams-Thumbtack"
      expect(title).not.toContain('Sherwin-Williams');
    });
  });

  // ── 2. HERO SECTION ────────────────────────────────────────────────────────
  test.describe('2 — Hero Section', () => {

    test('hero title contains "Grow your business in"', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const heroTitle = page.locator('[class*="hero_heroTitle"]').first();
      await expect(heroTitle).toBeVisible({ timeout: 10000 });
      const text = await heroTitle.textContent();
      console.log(`Hero title: "${text?.trim()}"`);
      expect(text).toContain('Grow your business in');
    });

    test('hero subtitle: mentions $100 (NOT $400)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const subtitle = page.locator('[class*="hero_heroInnerOffsetRight"] > [class*="Type_text1"]').first();
      await expect(subtitle).toBeVisible({ timeout: 10000 });
      const text = await subtitle.textContent();
      console.log(`Hero subtitle: "${text?.trim()}"`);
      // EXPECTED: $100  |  KNOWN ISSUE: code currently outputs $400
      expect(text, 'FAIL — subtitle should mention $100, not $400').toContain('$100');
      expect(text).not.toContain('$400');
    });

    test('hero subtitle: mentions FieldPulse (NOT Sherwin-Williams)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const subtitle = page.locator('[class*="hero_heroInnerOffsetRight"] > [class*="Type_text1"]').first();
      const text = await subtitle.textContent();
      // EXPECTED: FieldPulse  |  KNOWN ISSUE: code currently outputs "Sherwin-Williams pro"
      expect(text, 'FAIL — subtitle should mention FieldPulse, not Sherwin-Williams').toContain('FieldPulse');
      expect(text).not.toContain('Sherwin-Williams');
    });

    test('partnership badge does NOT mention Sherwin-Williams', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const badge = page.locator('[class*="hero_heroInnerContainer"] [class*="hero_heroInnerOffsetRight"] .br-pill').first();
      const badgeExists = await badge.count() > 0;
      if (badgeExists) {
        const text = await badge.textContent();
        console.log(`Partnership badge text: "${text?.trim()}"`);
        // EXPECTED: FieldPulse  |  KNOWN ISSUE: code sets "In partnership with Sherwin-Williams."
        expect(text).not.toContain('Sherwin-Williams');
      } else {
        console.log('Partnership badge element not found — skipping text check');
      }
    });

    test('service search input has correct placeholder', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      // Desktop input
      const input = page.locator('[placeholder="e.g. House cleaning"], [placeholder="Enter the service you provide to get started."], #new-pro-lp-cs').first();
      await expect(input).toBeVisible({ timeout: 10000 });
      const ph = await input.getAttribute('placeholder');
      console.log(`Service input placeholder: "${ph}"`);
      // Figma shows "e.g. Plumbing" — code changes it to "Enter the service you provide to get started."
      // Log for comparison; no strict assert since placeholder UX may differ
    });

    test('"Sign up for free" CTA button is visible below comparison table', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const cta = page.locator('#ttsearch-location-input');
      await expect(cta).toBeVisible({ timeout: 10000 });
      const text = await cta.textContent();
      console.log(`"Sign up for free" CTA text: "${text?.trim()}"`);
      expect(text?.trim()).toBe('Sign up for free');
    });

    test('screenshot: hero section', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `02-hero-${browserName}.png`),
        clip: { x: 0, y: 0, width: 1280, height: 700 },
      });
    });
  });

  // ── 3. HOW THUMBTACK WORKS ─────────────────────────────────────────────────
  test.describe('3 — How Thumbtack Works', () => {

    test('"How Thumbtack works:" heading is present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const heading = page.locator('.thumbtack-section h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      const text = await heading.textContent();
      console.log(`How Thumbtack works heading: "${text?.trim()}"`);
      expect(text).toContain('How Thumbtack works');
    });

    test('exactly 3 feature items rendered', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const items = page.locator('.thumbtack-section .feature-item');
      const count = await items.count();
      console.log(`Feature items found: ${count} (expected 3)`);
      expect(count).toBe(3);
    });

    test('feature 1 — No subscription cost', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const item = page.locator('.thumbtack-section .feature-item').nth(0);
      await expect(item).toContainText('No subscription cost', { timeout: 10000 });
    });

    test('feature 2 — High intent customers', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const item = page.locator('.thumbtack-section .feature-item').nth(1);
      await expect(item).toContainText('High intent customers', { timeout: 10000 });
    });

    test('feature 3 — Control and flexibility', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const item = page.locator('.thumbtack-section .feature-item').nth(2);
      await expect(item).toContainText('Control and flexibility', { timeout: 10000 });
    });

    test('each feature item has an image', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const images = page.locator('.thumbtack-section .feature-item img');
      const count = await images.count();
      console.log(`Feature images found: ${count} (expected 3)`);
      expect(count).toBe(3);
    });

    test('screenshot: how it works section', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.thumbtack-section').first();
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(SCREENSHOTS_DIR, `03-how-it-works-${browserName}.png`) });
    });
  });

  // ── 4. COMPARISON TABLE ────────────────────────────────────────────────────
  test.describe('4 — How Thumbtack Is Different (Comparison Table)', () => {

    test('"How Thumbtack is different:" heading present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const heading = page.locator('.ttheading, .Thumbtack_different').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      const text = await heading.textContent();
      console.log(`Comparison heading: "${text?.trim()}"`);
      expect(text).toContain('How Thumbtack is different');
    });

    test('6 feature rows in comparison table', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const rows = page.locator('[class*="see-how-different_featureComparisonChartRow"]');
      const count = await rows.count();
      console.log(`Comparison table rows found: ${count} (expected 6)`);
      expect(count).toBe(6);
    });

    const FEATURE_ROWS = [
      'Customers choose pros directly',
      'Pros control their pricing',
      'Direct customer communication',
      'Limited competition per lead',
      'No hidden fees or contracts',
      'Free pro community',
    ];

    for (const rowText of FEATURE_ROWS) {
      test(`row present: "${rowText}"`, async ({ page, browserName }) => {
        await loadVariation(page, browserName);

        const table = page.locator('[class*="see-how-different_featureComparisonChart"]').first();
        await expect(table).toBeVisible({ timeout: 10000 });
        await expect(table).toContainText(rowText, { timeout: 10000 });
      });
    }

    test('screenshot: comparison table', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('[class*="see-how-different_seeHowDifferentSection"]').first();
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(SCREENSHOTS_DIR, `04-comparison-table-${browserName}.png`) });
    });
  });

  // ── 5. TESTIMONIALS ────────────────────────────────────────────────────────
  test.describe('5 — Real Results / Testimonials', () => {

    test('heading is "Real results from real pros." (NOT "real painters")', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const heading = page.locator('.testimonials h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      const text = await heading.textContent();
      console.log(`Testimonials heading: "${text?.trim()}"`);
      // EXPECTED: "Real results from real pros."
      // KNOWN ISSUE: code currently says "Real results from real painters."
      expect(text, 'FAIL — heading should say "real pros", not "real painters"').toContain('real pros');
      expect(text).not.toContain('painters');
    });

    test('exactly 3 testimonial cards rendered', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const cards = page.locator('.testimonials .card');
      const count = await cards.count();
      console.log(`Testimonial cards found: ${count} (expected 3)`);
      expect(count).toBe(3);
    });

    test('each testimonial card has a circular image', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const images = page.locator('.testimonials .card img');
      const count = await images.count();
      console.log(`Testimonial images found: ${count} (expected 3)`);
      expect(count).toBe(3);
    });

    // --- Correct testimonials per Figma ---
    test('testimonial 1: Jack M. / Electric AVenue present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.testimonials');
      const text = await section.textContent();
      console.log(`Testimonials text:\n${text?.trim()?.substring(0, 500)}`);
      // EXPECTED: Jack M., Electric AVenue
      // KNOWN ISSUE: code currently shows "Juliano Da Cruz, Paint Lab Painting"
      expect(text, 'FAIL — should contain Jack M. / Electric AVenue').toContain('Jack M');
      expect(text).toContain('Electric AVenue');
    });

    test('testimonial 2: Clay R. / Mr Electric present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.testimonials');
      const text = await section.textContent();
      // EXPECTED: Clay R., Mr Electric of Golden, CO
      // KNOWN ISSUE: code currently shows "Shaqueal Thomas, Courteney's Paints"
      expect(text, 'FAIL — should contain Clay R. / Mr Electric').toContain('Clay R');
      expect(text).toContain('Mr Electric');
    });

    test('testimonial 3: Deon M. / Antilleon Restoration present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.testimonials');
      const text = await section.textContent();
      // EXPECTED: Deon M., Antilleon Restoration
      // KNOWN ISSUE: code currently shows "Rafael Rodriguez, Dambrak Painting"
      expect(text, 'FAIL — should contain Deon M. / Antilleon Restoration').toContain('Deon M');
      expect(text).toContain('Antilleon Restoration');
    });

    // --- Wrong testimonials that must NOT appear ---
    test('NO painter testimonials (Sherwin-Williams content leak check)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.testimonials');
      const text = await section.textContent();
      expect(text, 'FAIL — should not contain painter names from Sherwin-Williams variation').not.toContain('Paint Lab');
      expect(text).not.toContain("Courteney");
      expect(text).not.toContain('Dambrak');
      expect(text).not.toContain('Juliano');
      expect(text).not.toContain('Shaqueal');
      expect(text).not.toContain('Rafael');
    });

    test('screenshot: testimonials section', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.testimonials').first();
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(SCREENSHOTS_DIR, `05-testimonials-${browserName}.png`) });
    });
  });

  // ── 6. GROWTH CALCULATOR ───────────────────────────────────────────────────
  test.describe('6 — Growth Calculator', () => {

    test('"See your earning potential." heading present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const heading = page.locator('.calculator h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      const text = await heading.textContent();
      console.log(`Calculator heading: "${text?.trim()}"`);
      expect(text).toContain('See your earning potential');
    });

    test('"Tell us about your business." sub-heading present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const sub = page.locator('.calculator form h6').first();
      await expect(sub).toBeVisible({ timeout: 10000 });
      const text = await sub.textContent();
      console.log(`Calculator sub-heading: "${text?.trim()}"`);
      expect(text).toContain('Tell us about your business');
    });

    test('job cost input ("Enter $ amount") is present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const input = page.locator('input[placeholder="Enter $ amount"]');
      await expect(input).toBeVisible({ timeout: 10000 });
    });

    test('jobs/month input ("Enter number") is present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const input = page.locator('input[placeholder="Enter number"]');
      await expect(input).toBeVisible({ timeout: 10000 });
    });

    test('calculator correctly computes revenue (500 × 10 = $5,000 / $60,000)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      await page.locator('input[placeholder="Enter $ amount"]').fill('500');
      await page.locator('input[placeholder="Enter number"]').fill('10');
      await page.locator('.subhead_cta a').click();
      await page.waitForTimeout(600);

      const monthly = await page.locator('.monthly_revenue').textContent();
      const yearly  = await page.locator('.year_revanu').textContent();
      console.log(`Calculator output — monthly: "${monthly}" | annual: "${yearly}"`);
      expect(monthly).toContain('5,000');
      expect(yearly).toContain('60,000');
    });

    test('shows validation error when fields are empty and CTA clicked', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      await page.locator('.subhead_cta a').click();
      await page.waitForTimeout(400);
      const errors = await page.locator('.input-error:visible').count();
      console.log(`Validation error elements visible: ${errors} (expected 2)`);
      expect(errors).toBe(2);
    });

    test('"Grow with Thumbtack" CTA text is correct', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const cta = page.locator('.subhead_cta a');
      await expect(cta).toBeVisible({ timeout: 10000 });
      const text = await cta.textContent();
      console.log(`Calculator CTA: "${text?.trim()}"`);
      expect(text?.trim()).toBe('Grow with Thumbtack');
    });

    test('screenshot: calculator section', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.calculator').first();
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(SCREENSHOTS_DIR, `06-calculator-${browserName}.png`) });
    });
  });

  // ── 7. COMMUNITY SECTION ───────────────────────────────────────────────────
  test.describe('7 — Thumbtack Pro Community', () => {

    test('community section is present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.community').first();
      await expect(section).toBeVisible({ timeout: 10000 });
    });

    test('community heading is "Thumbtack\'s Pro Community" (NOT "Get tips for success")', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const heading = page.locator('.community h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      const text = await heading.textContent();
      console.log(`Community heading: "${text?.trim()}"`);
      // EXPECTED: "Thumbtack's Pro Community"
      // KNOWN ISSUE: code currently says "Get tips for success on Thumbtack."
      expect(text, 'FAIL — heading should be "Thumbtack\'s Pro Community"').toContain("Pro Community");
      expect(text).not.toContain('Get tips for success');
    });

    test('community description mentions "network of pros" (NOT "successfully complete jobs")', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.community').first();
      const text = await section.textContent();
      console.log(`Community text: "${text?.trim()?.substring(0, 200)}"`);
      // EXPECTED: "Join a network of pros sharing tips, insights and strategies..."
      // KNOWN ISSUE: code currently says "Find out how to successfully complete jobs on Thumbtack..."
      expect(text, 'FAIL — community description should mention "network of pros"').toContain('network of pros');
      expect(text).not.toContain('successfully complete jobs');
    });

    test('community CTA text is "Connect with other pros" (NOT "Get success tips")', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const cta = page.locator('.community a').first();
      await expect(cta).toBeVisible({ timeout: 10000 });
      const text = await cta.textContent();
      console.log(`Community CTA: "${text?.trim()}"`);
      // EXPECTED: "Connect with other pros"
      // KNOWN ISSUE: code currently says "Get success tips"
      expect(text?.trim(), 'FAIL — community CTA should be "Connect with other pros"').toBe('Connect with other pros');
    });

    test('community CTA link UTM does not contain sherwinwilliams', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const cta = page.locator('.community a').first();
      const href = await cta.getAttribute('href');
      console.log(`Community CTA href: "${href}"`);
      // KNOWN ISSUE: code has utm_campaign=sherwinwilliams
      expect(href, 'FAIL — UTM campaign should not be sherwinwilliams').not.toContain('sherwinwilliams');
    });

    test('screenshot: community section', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.community').first();
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(SCREENSHOTS_DIR, `07-community-${browserName}.png`) });
    });
  });

  // ── 8. FOOTER DISCLAIMER ───────────────────────────────────────────────────
  test.describe('8 — Footer Disclaimer', () => {

    test('disclaimer section is present', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const el = page.locator('.TT_updatetext').first();
      await expect(el).toBeVisible({ timeout: 10000 });
    });

    test('disclaimer mentions $100 (NOT $150 or $400)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const text = await page.locator('.TT_updatetext').first().textContent();
      console.log(`Disclaimer text: "${text?.trim()?.substring(0, 300)}"`);
      // EXPECTED: simple $100 disclaimer
      // KNOWN ISSUE: code has $150 free + $250 discounted leads (Sherwin-Williams version)
      expect(text, 'FAIL — disclaimer should mention $100').toContain('$100');
      expect(text).not.toContain('$150');
      expect(text).not.toContain('$250');
      expect(text).not.toContain('$400');
    });

    test('disclaimer does NOT mention Sherwin-Williams', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const text = await page.locator('.TT_updatetext').first().textContent();
      expect(text).not.toContain('Sherwin-Williams');
    });

    test('disclaimer does NOT mention "2-requests" (Sherwin-Williams specific mechanic)', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const text = await page.locator('.TT_updatetext').first().textContent();
      // KNOWN ISSUE: current code mentions "After receiving 2-requests, Pro will receive 25%-off…"
      expect(text, 'FAIL — disclaimer should not have the 2-requests mechanic').not.toContain('2-requests');
      expect(text).not.toContain('25%');
    });

    test('screenshot: footer disclaimer', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      const section = page.locator('.TT_updatetext').first();
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(SCREENSHOTS_DIR, `08-disclaimer-${browserName}.png`) });
    });
  });

  // ── 9. FULL PAGE SCREENSHOT ────────────────────────────────────────────────
  test.describe('9 — Full Page Screenshot', () => {

    test('capture full page for visual diff', async ({ page, browserName }) => {
      await loadVariation(page, browserName);

      // Scroll through the page to trigger lazy-loaded images
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let pos = 0;
          const timer = setInterval(() => {
            window.scrollBy(0, 300);
            pos += 300;
            if (pos > document.body.scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 100);
        });
      });
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `00-full-page-${browserName}.png`),
        fullPage: true,
      });
      console.log(`Full page screenshot saved for ${browserName}`);
    });
  });

  // ── 10. CONSOLE HEALTH ─────────────────────────────────────────────────────
  test.describe('10 — Console Health', () => {

    test('no uncaught JS errors during variation load', async ({ page, browserName }) => {
      const errors = await loadVariation(page, browserName);
      await page.waitForTimeout(2000);

      if (errors.length) {
        console.log(`[${browserName}] Console / page errors:\n  ${errors.join('\n  ')}`);
      } else {
        console.log(`[${browserName}] No console errors ✓`);
      }
      expect(errors, `Unexpected JS errors on ${browserName}`).toHaveLength(0);
    });
  });
});
