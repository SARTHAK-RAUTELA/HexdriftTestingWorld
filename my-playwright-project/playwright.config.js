// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './testing',
  timeout: 90000,
  retries: 0,
  workers: 1,       // sequential — avoids WAF rate-limiting on app.13sick.com.au
  fullyParallel: false,
  // Custom per-test reporters were removed 2026-07-09 after documenting them in
  // QA_KNOWLEDGE_BASE.md (section 24 has the reusable reporter pattern).
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    navigationTimeout: 45000,
    actionTimeout: 20000,
    screenshot: 'only-on-failure',
  },
  projects: [
    // ── Desktop ──────────────────────────────────────────────────
    {
      name: 'Chrome Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox Desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Edge Desktop',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Safari Desktop',
      use: { ...devices['Desktop Safari'] },
    },
    // ── Mobile ───────────────────────────────────────────────────
    {
      name: 'Mobile Chrome (Pixel 5)',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari (iPhone 12)',
      use: { ...devices['iPhone 12'] },
    },
    // ── Tablet ───────────────────────────────────────────────────
    {
      name: 'Tablet (iPad Gen 7)',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
});
