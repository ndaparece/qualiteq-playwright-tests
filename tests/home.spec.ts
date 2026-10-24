import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home page', () => {
  test('loads with the right title and hero', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page).toHaveTitle(/Qualiteq HQ/);
    await expect(home.heroHeading).toHaveText('Ship with confidence. Get your time back.');
    await expect(page.locator('.hero .trust')).toContainText('ISTQB');
  });

  test('every section the nav points to exists', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const targets = await home.navLinks.locator('a[href^="#"]').evaluateAll((links) =>
      links.map((a) => a.getAttribute('href')!.slice(1)),
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) {
      await expect(page.locator(`#${id}`), `section #${id}`).toHaveCount(1);
    }
  });

  test('nav link scrolls the section into view', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.navLinks.getByRole('link', { name: 'Pricing' }).click();
    await expect(home.section('pricing')).toBeInViewport();
  });

  test('team photos load', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const photos = page.locator('.avatar img');
    await expect(photos.first()).toBeVisible();
    const widths = await photos.evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).naturalWidth),
    );
    expect(widths.length).toBeGreaterThanOrEqual(2);
    for (const w of widths) expect(w, 'image loaded').toBeGreaterThan(0);
  });

  test('book-a-call buttons go to Calendly in a new tab', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const links = page.locator('a[href*="calendly.com"]');
    await expect(links).not.toHaveCount(0);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    await expect(home.bookCallButton).toHaveAttribute('href', /^https:\/\/calendly\.com\//);
  });
});
