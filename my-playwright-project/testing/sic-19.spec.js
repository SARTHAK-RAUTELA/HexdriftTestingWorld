/**
 * SIC-19 — 13Sick Telehealth Step 3 Symptoms Variation Test
 *
 * V1 (vB.js): Adds header, new placeholder, shows "How would you like to speak..."
 * V2 (js.js): Same header + placeholder, but hides recommendation section entirely
 *
 * Run all:        npx playwright test sic-19
 * Chrome only:    npx playwright test sic-19 --project="Chrome Desktop"
 * Headed:         npx playwright test sic-19 --headed --project="Chrome Desktop"
 * Single report:  npx playwright test sic-19 --reporter=./sic-19-reporter.js
 */

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

// ── SCRIPTS ──────────────────────────────────────────────────────────────────

const V1_SCRIPT = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/vB.js'), 'utf8'
);
const V2_SCRIPT = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/js.js'), 'utf8'
);

// ── URLS ─────────────────────────────────────────────────────────────────────

const CONTROL_URL = 'https://app.13sick.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052010.1000255369&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';
const V1_URL      = 'https://app.13sick.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052010.1000255370&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';
const V2_URL      = 'https://app.13sick.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052010.1000255371&_gl=1*xtij16*_ga*MTEwMTM4MDM5OC4xNzc3MDA3MTA2*_ga_EG6RYKB1EM*czE3NzcwMDcxMDYkbzEkZzEkdDE3NzcwMDcxMTAkajU2JGwwJGgw&isTelehealth=true';

const CHANGED_PLACEHOLDER = 'e.g. Sore throat and fever for 3 days, getting worse, moderate pain, tried paracetamol';
const MOBILE_VP = { width: 390, height: 844 };

const CATEGORIES = [
  'Medical Certificate Only',
  'Urgent Repeat Scripts Only',
  'Respiratory Related',
  'Skin',
  'Gut Related',
  'Mental Health / Sleep / Headache',
  'Musculoskeletal',
  "Women's Health",
  "Men's Health",
  'Other Issues',
];

const SS_DIR = path.resolve(__dirname, '../sic-19-screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

// ── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Navigate to URL and reach the category list inside #mobile-viewport iframe.
 *
 * Actual form flow discovered via diagnostic:
 *   step_1_Emergency_Symptoms_Warning  → modal (inside iframe): checkbox + disabled Continue
 *   step_2_Category                   → category selection list (inside iframe)
 *   step_3_Symptoms                   → symptoms detail form (inside iframe, after category click)
 *
 * The variation scripts fire when body[data-telehealth] becomes step_3_Symptoms.
 */
async function reachCategoryList(page, url) {
  const errors = [];
  page.on('pageerror', e  => errors.push(`[pageerror] ${e.message}`));
  page.on('console',   msg => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`); });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Detect server-level blocks (WAF 403) before wasting a full timeout cycle.
  const status = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.textContent.trim() : '';
  });
  if (status.includes('403') || status.toLowerCase().includes('forbidden')) {
    throw new Error(`Site returned 403 Forbidden — WAF/CDN block. Wait a few minutes and retry.`);
  }

  await page.waitForTimeout(3000); // Allow SPA + Convert.com to initialise

  await page.waitForSelector('#mobile-viewport', { timeout: 30000 });
  const frame = page.frameLocator('#mobile-viewport');

  // ── Step 1: Dismiss Emergency Symptoms Warning ──────────────────────────
  // The modal is INSIDE the iframe. Checkbox is disabled until ticked;
  // ticking enables the Continue button.
  const currentStep = await page.evaluate(() => document.body.getAttribute('data-telehealth'));
  if (currentStep === 'step_1_Emergency_Symptoms_Warning') {
    // Tick "I confirm none of the above emergency symptoms are present"
    await frame.locator('input[type="checkbox"]').first().click();
    // Continue is now enabled
    await frame.locator('button:has-text("Continue")').click();
    // Wait for category list step
    await page.waitForFunction(
      () => document.body.getAttribute('data-telehealth') === 'step_2_Category',
      { timeout: 15000 }
    );
    // MUI dialogs stay in DOM after dismissal — they only become hidden, never detach.
    // Using state:'hidden' (not 'detached') so Playwright actually waits for the overlay to go away.
    // Without this, the invisible overlay still intercepts pointer events on off-screen categories.
    await frame.locator('.MuiDialog-root').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(600);
  }

  // ── Step 2: Confirm category list is visible ────────────────────────────
  await frame
    .locator('[data-testid="condition-category__button"]').first()
    .waitFor({ state: 'visible', timeout: 20000 });

  return { frame, errors };
}

/**
 * Click a category by name and wait for the symptoms detail view (textarea visible).
 * Then waits an extra 1.5 s for the "Available Telehealth Options:" section to render.
 */
async function selectCategory(frame, page, categoryName) {
  const categoryBtn = frame.locator('[data-testid="condition-category__button"]').filter({
    has: frame.locator('.MuiListItemText-primary', { hasText: categoryName }),
  });

  // Scroll into view so off-screen categories (Men's Health, Other Issues) are not blocked
  // by any lingering overlay positioned over the top of the list.
  await categoryBtn.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);

  await categoryBtn.click();

  await frame
    .locator('[name="conditionDescription"]')
    .waitFor({ state: 'visible', timeout: 15000 });

  await page.waitForTimeout(1500); // let "Available Telehealth Options:" render
}

/**
 * Inject a variation script into the outer page document.
 * The script will immediately detect [data-telehealth="step_3_Symptoms"] (already present)
 * and begin modifying the iframe within its 50 ms polling loop.
 */
async function injectScript(page, script) {
  await page.evaluate((code) => {
    const s = document.createElement('script');
    s.textContent = code;
    document.head.appendChild(s);
  }, script);
  await page.waitForTimeout(3000); // allow all iframe DOM changes to complete
}

/** Capture a screenshot of the #mobile-viewport iframe and attach to test. */
async function captureIframe(page, label) {
  const ssPath = path.join(SS_DIR, `${label}.png`);
  try {
    await page.locator('#mobile-viewport').screenshot({ path: ssPath });
    await test.info().attach('screenshot', { path: ssPath, contentType: 'image/png' });
  } catch (e) {
    console.log(`Screenshot skipped (${label}): ${e.message}`);
  }
}

// ── ASSERTION HELPERS ────────────────────────────────────────────────────────

async function assertControl(frame, category) {
  // No variation container injected
  const ctCount = await frame.locator('.cre-t-19-container').count();
  expect(ctCount, `Control [${category}]: .cre-t-19-container must NOT exist`).toBe(0);

  const bcCount = await frame.locator('.cre-t-19-bottom-container').count();
  expect(bcCount, `Control [${category}]: .cre-t-19-bottom-container must NOT exist`).toBe(0);

  // Original placeholder unchanged
  const ph = await frame.locator('[name="conditionDescription"]').getAttribute('placeholder');
  expect(ph, `Control [${category}]: placeholder must NOT be the variant text`).not.toBe(CHANGED_PLACEHOLDER);

  // Original symptom bullet list visible
  const bulletText = frame.locator('text=Please describe your symptoms, including:');
  await expect(bulletText.first()).toBeVisible({ timeout: 8000 });

  // "Available Telehealth Options:" section visible
  const optText = frame.locator('text=Available Telehealth Options:');
  await expect(optText.first()).toBeVisible({ timeout: 8000 });

  console.log(`  [Control][${category}] ✓ All control assertions passed`);
}

async function assertV1(frame, category) {
  // Header container must be visible
  await expect(
    frame.locator('.cre-t-19-container').first(),
    `V1 [${category}]: .cre-t-19-container must be visible`
  ).toBeVisible({ timeout: 10000 });

  // Header text
  await expect(
    frame.locator('text=Tell us about your symptoms').first(),
    `V1 [${category}]: header heading must be visible`
  ).toBeVisible({ timeout: 8000 });

  await expect(
    frame.locator('text=Describe your symptoms so your doctor can prepare.').first(),
    `V1 [${category}]: header sub-copy must be visible`
  ).toBeVisible({ timeout: 8000 });

  // Changed placeholder
  const ph = await frame.locator('[name="conditionDescription"]').getAttribute('placeholder');
  expect(ph, `V1 [${category}]: placeholder must be changed`).toBe(CHANGED_PLACEHOLDER);

  // "How would you like…" section visible in V1
  await expect(
    frame.locator('text=How would you like to speak to your doctor?').first(),
    `V1 [${category}]: recommendation heading must be visible`
  ).toBeVisible({ timeout: 8000 });

  // "Video call (recommended)" label
  await expect(
    frame.locator('text=Video call (recommended)').first(),
    `V1 [${category}]: "Video call (recommended)" label must be visible`
  ).toBeVisible({ timeout: 8000 });

  // Original bullet list hidden
  const symEl = frame.locator('p.cre-t-19-recommendation-symptoms');
  const symCount = await symEl.count();
  if (symCount > 0) {
    const display = await symEl.first().evaluate(el => getComputedStyle(el).display);
    expect(display, `V1 [${category}]: bullet list paragraph must be hidden`).toBe('none');
  }

  console.log(`  [V1][${category}] ✓ All V1 assertions passed`);
}

async function assertV2(frame, category) {
  // Header container must be visible (same as V1)
  await expect(
    frame.locator('.cre-t-19-container').first(),
    `V2 [${category}]: .cre-t-19-container must be visible`
  ).toBeVisible({ timeout: 10000 });

  await expect(
    frame.locator('text=Tell us about your symptoms').first(),
    `V2 [${category}]: header heading must be visible`
  ).toBeVisible({ timeout: 8000 });

  // Changed placeholder
  const ph = await frame.locator('[name="conditionDescription"]').getAttribute('placeholder');
  expect(ph, `V2 [${category}]: placeholder must be changed`).toBe(CHANGED_PLACEHOLDER);

  // Textarea still usable
  await expect(
    frame.locator('[name="conditionDescription"]').first(),
    `V2 [${category}]: textarea must be visible`
  ).toBeVisible({ timeout: 8000 });

  // V2: recommendation section HIDDEN (display:none) within breadcrumb context
  const recEl = frame.locator('.cre-t-19-recommendation-section');
  const recCount = await recEl.count();
  if (recCount > 0) {
    const display = await recEl.first().evaluate(el => getComputedStyle(el).display);
    expect(display, `V2 [${category}]: .cre-t-19-recommendation-section must be hidden`).toBe('none');
  }

  // V2: "How would you like…" must NOT be visible
  const recHeading = frame.locator('text=How would you like to speak to your doctor?');
  const recVisible = await recHeading.first().isVisible({ timeout: 3000 }).catch(() => false);
  expect(recVisible, `V2 [${category}]: recommendation heading must be hidden`).toBe(false);

  // V2: breadcrumb container flex:0
  const bcEl = frame.locator('[aria-label="breadcrumb"] + div');
  const bcCount = await bcEl.count();
  if (bcCount > 0) {
    const flexVal = await bcEl.first().evaluate(el => getComputedStyle(el).flex || getComputedStyle(el).flexGrow);
    expect(String(flexVal), `V2 [${category}]: breadcrumb+div flex must be 0`).toMatch(/^0/);
  }

  // Next button still visible
  await expect(
    frame.locator('button:has-text("Next")').first(),
    `V2 [${category}]: Next button must be visible`
  ).toBeVisible({ timeout: 8000 });

  console.log(`  [V2][${category}] ✓ All V2 assertions passed`);
}

// ── SECTION 1: SCRIPT INTEGRITY (no browser) ─────────────────────────────────

test.describe('1 — Script Integrity (static analysis)', () => {
  test('V1 (vB.js) is non-empty', () => {
    expect(V1_SCRIPT.length).toBeGreaterThan(100);
  });
  test('V2 (js.js) is non-empty', () => {
    expect(V2_SCRIPT.length).toBeGreaterThan(100);
  });
  test('both scripts reference variation name cre-t-19', () => {
    expect(V1_SCRIPT).toContain('cre-t-19');
    expect(V2_SCRIPT).toContain('cre-t-19');
  });
  test('both scripts target step_3_Symptoms selector', () => {
    expect(V1_SCRIPT).toContain('step_3_Symptoms');
    expect(V2_SCRIPT).toContain('step_3_Symptoms');
  });
  test('both scripts target #mobile-viewport iframe', () => {
    expect(V1_SCRIPT).toContain('#mobile-viewport');
    expect(V2_SCRIPT).toContain('#mobile-viewport');
  });
  test('both scripts inject "Tell us about your symptoms" heading', () => {
    expect(V1_SCRIPT).toContain('Tell us about your symptoms');
    expect(V2_SCRIPT).toContain('Tell us about your symptoms');
  });
  test('both scripts inject "How would you like to speak to your doctor?" heading', () => {
    expect(V1_SCRIPT).toContain('How would you like to speak to your doctor?');
    expect(V2_SCRIPT).toContain('How would you like to speak to your doctor?');
  });
  test('both scripts use the correct changed placeholder', () => {
    expect(V1_SCRIPT).toContain(CHANGED_PLACEHOLDER);
    expect(V2_SCRIPT).toContain(CHANGED_PLACEHOLDER);
  });
  test('both scripts change "Video call" label to "Video call (recommended)"', () => {
    expect(V1_SCRIPT).toContain('Video call (recommended)');
    expect(V2_SCRIPT).toContain('Video call (recommended)');
  });
  test('V1 CSS: recommendation section display:block in breadcrumb context', () => {
    expect(V1_SCRIPT).toContain('display: block !important');
  });
  test('V2 CSS: recommendation section display:none in breadcrumb context', () => {
    expect(V2_SCRIPT).toContain('display: none !important');
  });
  test('V2 CSS: has flex:0 rule — V1 does NOT', () => {
    expect(V2_SCRIPT).toContain('flex: 0');
    expect(V1_SCRIPT).not.toContain('flex: 0');
  });
  test('both scripts have a catch block protecting against JS errors', () => {
    expect(V1_SCRIPT).toContain('catch (e)');
    expect(V2_SCRIPT).toContain('catch (e)');
  });
});

// ── SECTION 2: CONTROL ────────────────────────────────────────────────────────

test.describe('2 — Control (no variation)', () => {
  for (const cat of CATEGORIES) {
    test(`[Control] ${cat}`, async ({ page, browserName }) => {
      const safeName = cat.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const { frame, errors } = await reachCategoryList(page, CONTROL_URL);

      await selectCategory(frame, page, cat);

      await captureIframe(page, `control-${safeName}-${browserName}`);
      await assertControl(frame, cat);

      if (errors.length) console.log(`  JS errors (${browserName}): ${errors.join(' | ')}`);
    });
  }
});

// ── SECTION 3: V1 (vB.js) — ALL CATEGORIES ───────────────────────────────────

test.describe('3 — V1 (vB.js) — all categories', () => {
  for (const cat of CATEGORIES) {
    test(`[V1] ${cat}`, async ({ page, browserName }) => {
      const safeName = cat.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const { frame, errors } = await reachCategoryList(page, V1_URL);

      await selectCategory(frame, page, cat);

      // Inject AFTER detail view is visible — script detects step_3_Symptoms immediately
      await injectScript(page, V1_SCRIPT);

      await captureIframe(page, `v1-${safeName}-${browserName}`);
      await assertV1(frame, cat);

      if (errors.length) console.log(`  JS errors (${browserName}): ${errors.join(' | ')}`);
    });
  }
});

// ── SECTION 4: V2 (js.js) — ALL CATEGORIES ───────────────────────────────────

test.describe('4 — V2 (js.js) — all categories', () => {
  for (const cat of CATEGORIES) {
    test(`[V2] ${cat}`, async ({ page, browserName }) => {
      const safeName = cat.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const { frame, errors } = await reachCategoryList(page, V2_URL);

      await selectCategory(frame, page, cat);

      await injectScript(page, V2_SCRIPT);

      await captureIframe(page, `v2-${safeName}-${browserName}`);
      await assertV2(frame, cat);

      if (errors.length) console.log(`  JS errors (${browserName}): ${errors.join(' | ')}`);
    });
  }
});

// ── SECTION 5: MOBILE VIEWPORT ────────────────────────────────────────────────

test.describe('5 — Mobile Viewport (390px)', () => {
  test.use({ viewport: MOBILE_VP });

  // Test first + last category for each variation on mobile
  const MOBILE_CATS = [CATEGORIES[0], CATEGORIES[CATEGORIES.length - 1]];

  for (const cat of MOBILE_CATS) {
    const safeName = cat.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    test(`[Mobile Control] ${cat}`, async ({ page, browserName }) => {
      const { frame } = await reachCategoryList(page, CONTROL_URL);
      await selectCategory(frame, page, cat);
      await captureIframe(page, `mobile-control-${safeName}-${browserName}`);
      await assertControl(frame, cat);
    });

    test(`[Mobile V1] ${cat}`, async ({ page, browserName }) => {
      const { frame } = await reachCategoryList(page, V1_URL);
      await selectCategory(frame, page, cat);
      await injectScript(page, V1_SCRIPT);
      await captureIframe(page, `mobile-v1-${safeName}-${browserName}`);
      await assertV1(frame, cat);

      // Mobile-specific: wrapper should have 0 10px padding
      const wrapperCount = await frame.locator('.cre-t-19-wrapper').count();
      if (wrapperCount > 0) {
        const padding = await frame.locator('.cre-t-19-wrapper').first().evaluate(
          el => getComputedStyle(el).padding
        );
        console.log(`  [Mobile V1][${cat}] wrapper padding: ${padding}`);
      }
    });

    test(`[Mobile V2] ${cat}`, async ({ page, browserName }) => {
      const { frame } = await reachCategoryList(page, V2_URL);
      await selectCategory(frame, page, cat);
      await injectScript(page, V2_SCRIPT);
      await captureIframe(page, `mobile-v2-${safeName}-${browserName}`);
      await assertV2(frame, cat);
    });
  }
});

// ── SECTION 6: CONSOLE ERROR HEALTH ──────────────────────────────────────────

test.describe('6 — Console Error Health', () => {
  const HEALTH_CATS = ['Respiratory Related', 'Skin']; // representative sample

  for (const cat of HEALTH_CATS) {
    test(`[V1 health] No JS errors on "${cat}"`, async ({ page, browserName }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

      const { frame } = await reachCategoryList(page, V1_URL);
      await selectCategory(frame, page, cat);
      await injectScript(page, V1_SCRIPT);

      if (errors.length) {
        console.log(`[${browserName}] Errors: ${errors.join(' | ')}`);
      }
      // Filter out third-party / site-level noise unrelated to variation scripts
      const appErrors = errors.filter(e =>
        !e.includes('_conv_') &&
        !e.includes('gtag') &&
        !e.includes('googletagmanager') &&
        !e.includes('service-worker') &&       // SW errors with hyphen (Chrome/Edge)
        !e.includes('service worker') &&       // SW errors with space (Firefox)
        !e.includes('Failed to load resource') && // site 403s
        !e.includes('MIME type') &&            // SW script MIME error
        !e.includes('stripe') &&               // Stripe SDK noise
        !e.includes('Cookie') &&               // Firefox GA cookie rejection (invalid domain)
        !e.includes('rejected for invalid') && // same Firefox cookie noise
        !e.includes('Content Security Policy') // CSP stylesheet violations (site-level)
      );
      if (appErrors.length) console.log(`  [${browserName}] App errors: ${appErrors.join(' | ')}`);
      expect(appErrors, `No variation-related JS errors on ${browserName}`).toHaveLength(0);
    });

    test(`[V2 health] No JS errors on "${cat}"`, async ({ page, browserName }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

      const { frame } = await reachCategoryList(page, V2_URL);
      await selectCategory(frame, page, cat);
      await injectScript(page, V2_SCRIPT);

      const appErrors = errors.filter(e =>
        !e.includes('_conv_') &&
        !e.includes('gtag') &&
        !e.includes('googletagmanager') &&
        !e.includes('service-worker') &&
        !e.includes('service worker') &&
        !e.includes('Failed to load resource') &&
        !e.includes('MIME type') &&
        !e.includes('stripe') &&
        !e.includes('Cookie') &&
        !e.includes('rejected for invalid') &&
        !e.includes('Content Security Policy')
      );
      if (appErrors.length) console.log(`  [${browserName}] App errors: ${appErrors.join(' | ')}`);
      expect(appErrors, `No variation-related JS errors on ${browserName}`).toHaveLength(0);
    });
  }
});
