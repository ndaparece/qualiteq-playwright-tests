import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Mobile layout', () => {
  test('has no horizontal scroll @responsive', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('hamburger menu opens and closes @mobile', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.navLinks).toBeHidden();
    await home.menuButton.click();
    await expect(home.navLinks).toBeVisible();

    await home.navLinks.getByRole('link', { name: 'Pricing' }).click();
    await expect(home.navLinks).toBeHidden();
    await expect(home.section('pricing')).toBeInViewport();
  });
});
