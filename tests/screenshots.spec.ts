import { test, devices } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

// Marketing screenshots for the portfolio. Run with: npm run screenshots
test.describe('Portfolio screenshots @portfolio', () => {
  test('desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const home = new HomePage(page);
    await home.goto();
    await page.screenshot({ path: 'portfolio/desktop-hero.png' });
    await home.section('pricing').scrollIntoViewIfNeeded();
    await home.section('pricing').screenshot({ path: 'portfolio/desktop-pricing.png' });
    await page.screenshot({ path: 'portfolio/desktop-full.png', fullPage: true });
  });

  test('mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    const home = new HomePage(page);
    await home.goto();
    await page.screenshot({ path: 'portfolio/mobile-hero.png' });
    await context.close();
  });
});
