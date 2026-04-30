// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './testing',       // ← matches your actual folder name
  timeout: 60000,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    // Give iframe time to load
    navigationTimeout: 30000,
    actionTimeout: 15000,
    // Capture screenshots on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'Chrome Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox Desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Safari Desktop',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Chrome Mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Safari iOS',
      use: { ...devices['iPhone 13'] },
    },
  ],
});