// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './testing',
  timeout: 60000,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    navigationTimeout: 30000,
    actionTimeout: 15000,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Chrome Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
