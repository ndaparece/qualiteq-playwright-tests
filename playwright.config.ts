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
    // Locally, use the installed Google Chrome; CI uses Playwright's bundled Chromium.
    // Override with PW_CHANNEL (e.g. msedge), or PW_CHANNEL=chromium for the bundled browser.
    ...(() => {
      const channel = process.env.PW_CHANNEL ?? (process.env.CI ? undefined : 'chrome');
      return channel && channel !== 'chromium' ? { channel } : {};
    })(),
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
