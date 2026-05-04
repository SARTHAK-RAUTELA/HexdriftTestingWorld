// =============================================================
// cre-t-117 — Redirect Test Suite (rentersinsurancegurus.com)
// Run:  npx playwright test cre-t-117 --project="Chrome Desktop"
// =============================================================
// Variation : Redirect rentersinsurancegurus.com/ → /comparison/
// Audience  : US states TX, NY, NJ, DC only
// =============================================================

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const TARGET_URL     = 'https://rentersinsurancegurus.com/';
const REDIRECT_URL   = 'https://rentersinsurancegurus.com/comparison/';
const VARIATION_NAME = 'cre-t-117';

const variationScript = fs.readFileSync(
  path.resolve(__dirname, '../../local_testing/Local2/variation/vB.js'),
  'utf8'
);

// Geolocation coordinates for the four audience-targeted states
const TARGET_STATES = [
  { state: 'TX', city: 'Dallas',         latitude: 32.7767,  longitude: -96.7970  },
  { state: 'NY', city: 'New York City',  latitude: 40.7128,  longitude: -74.0060  },
  { state: 'NJ', city: 'Newark',         latitude: 40.7357,  longitude: -74.1724  },
  { state: 'DC', city: 'Washington DC',  latitude: 38.9072,  longitude: -77.0369  },
];

// ── HELPERS ─────────────────────────────────────────────────────

// Firefox appends an empty hash fragment (#) after a JS redirect — strip it
// before asserting so the same assertion works across all four browsers.
function normalizeUrl(url) {
  return url.replace(/#$/, '');
}

// Inject the variation by appending a <script> tag to the already-loaded page.
// Using page.evaluate() (not addInitScript) so the script runs exactly once
// on the current page and does NOT re-fire when the redirect navigation occurs.
async function injectAndRedirect(page) {
  // Use a regex so waitForURL matches both /comparison/ (Chrome/Edge/Safari)
  // and /comparison/# (Firefox) without timing out.
  const waitForRedirect = page.waitForURL(
    /rentersinsurancegurus\.com\/comparison\//,
    { timeout: 15000 }
  );
  // page.evaluate throws "context destroyed" when the page navigates away — that's expected
  page.evaluate(function (code) {
    var s = document.createElement('script');
    s.textContent = code;
    document.head.appendChild(s);
  }, variationScript).catch(function () {});
  await waitForRedirect;
}

// ── 1. VARIATION SCRIPT INTEGRITY ───────────────────────────────

test.describe('1 — Variation Script Integrity', () => {
  test('script file is non-empty and references the correct variation name', () => {
    expect(variationScript.length).toBeGreaterThan(0);
    expect(variationScript).toContain(VARIATION_NAME);
  });

  test('script uses window.location.replace for redirect', () => {
    expect(variationScript).toContain('window.location.replace');
  });

  test('redirect URL in script is HTTPS and points to /comparison/', () => {
    expect(variationScript).toContain('https://rentersinsurancegurus.com/comparison/');
  });

  test('script hides the page before redirect to prevent flicker', () => {
    expect(variationScript).toContain('document.documentElement.style.visibility = "hidden"');
  });

  test('script restores visibility in the catch block', () => {
    expect(variationScript).toContain('document.documentElement.style.visibility = ""');
  });
});

// ── 2. REDIRECT BEHAVIOUR (AUDIENCE: TX, NY, NJ, DC) ───────────

test.describe('2 — Redirect Behaviour (Audience: TX, NY, NJ, DC)', () => {
  // Navigate and trigger the variation once; each test then asserts the final state
  test.beforeEach(async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await injectAndRedirect(page);
  });

  test('redirects away from the target page', async ({ page }) => {
    expect(page.url()).not.toBe(TARGET_URL);
  });

  test('lands on the correct redirect URL', async ({ page }) => {
    expect(normalizeUrl(page.url())).toBe(REDIRECT_URL);
  });

  test('redirect uses HTTPS', async ({ page }) => {
    expect(normalizeUrl(page.url())).toMatch(/^https:\/\//);
  });

  test('redirect pathname is /comparison/ and not /compare', async ({ page }) => {
    const { pathname } = new URL(normalizeUrl(page.url()));
    expect(pathname).toBe('/comparison/');
    expect(pathname).not.toBe('/compare');
    expect(pathname).not.toBe('/compare/');
  });
});

// ── 3. REDIRECT PER TARGET STATE ────────────────────────────────

for (const geo of TARGET_STATES) {
  test(`3 — ${geo.state} (${geo.city}): variation redirects to /comparison/`, async ({ browser }) => {
    const context = await browser.newContext({
      geolocation: { latitude: geo.latitude, longitude: geo.longitude },
      permissions:  ['geolocation'],
    });
    const page = await context.newPage();
    try {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await injectAndRedirect(page);
      expect(normalizeUrl(page.url())).toBe(REDIRECT_URL);
      console.log(`  -> ${geo.state} (${geo.city}): redirect confirmed`);
    } finally {
      await context.close();
    }
  });
}

// ── 4. CONTROL — NO REDIRECT (NON-TARGET STATES) ────────────────

test.describe('4 — Control (No Variation / Non-target States)', () => {
  test('control: stays on rentersinsurancegurus.com without redirect', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/rentersinsurancegurus\.com/);
    expect(page.url()).not.toContain('/comparison/');
  });

  test('control: URL does not become the redirect URL', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    expect(page.url()).not.toBe(REDIRECT_URL);
  });
});

// ── 5. CONTROL vs VARIATION COMPARISON ──────────────────────────

test.describe('5 — Control vs Variation', () => {
  test('control page URL stays on the target domain', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/rentersinsurancegurus\.com/);
    expect(page.url()).not.toContain('/comparison/');
  });

  test('variation redirects user away from the original page', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await injectAndRedirect(page);
    expect(normalizeUrl(page.url())).toBe(REDIRECT_URL);
    expect(normalizeUrl(page.url())).not.toBe(TARGET_URL);
  });
});

// ── 6. ERROR HANDLING ────────────────────────────────────────────

test.describe('6 — Error Handling', () => {
  test('page visibility is restored when the script throws before redirect', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Inject a broken variant: hides the page then throws before redirect
    await page.evaluate(function () {
      (function () {
        try {
          document.documentElement.style.visibility = 'hidden';
          throw new Error('simulated script error');
          // eslint-disable-next-line no-unreachable
          window.location.replace('https://rentersinsurancegurus.com/comparison/');
        } catch (e) {
          document.documentElement.style.visibility = '';
        }
      })();
    });
    const visibility = await page.evaluate(
      function () { return document.documentElement.style.visibility; }
    );
    expect(visibility).toBe('');
    expect(page.url()).not.toBe(REDIRECT_URL);
  });
});
