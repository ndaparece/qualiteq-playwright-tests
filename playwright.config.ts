import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Qualiteq HQ website test suite.
 * BASE_URL defaults to the live site; point it at a local server to test before deploying:
 *   BASE_URL=http://localhost:8766 npx playwright test
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://qualiteqhq.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Use an installed browser instead of Playwright's own, e.g. PW_CHANNEL=chrome
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
      grepInvert: /@mobile|@portfolio/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile|@responsive/,
    },
    {
      // Captures marketing screenshots; run on demand with: npm run screenshots
      name: 'portfolio',
      use: { ...devices['Desktop Chrome'] },
      grep: /@portfolio/,
    },
  ],
});
