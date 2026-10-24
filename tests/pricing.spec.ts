import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Pricing', () => {
  test('shows USD by default', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.currency('USD')).toHaveClass(/active/);
    for (const { usd, shown } of await home.priceData()) {
      expect(shown).toBe(usd);
    }
  });

  test('switches every price to AUD and back', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.currency('AUD').click();
    await expect(home.currency('AUD')).toHaveClass(/active/);
    for (const { aud, shown } of await home.priceData()) {
      expect(shown).toBe(aud);
    }

    await home.currency('USD').click();
    for (const { usd, shown } of await home.priceData()) {
      expect(shown).toBe(usd);
    }
  });

  test('every price has both currencies filled in', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const prices = await home.priceData();
    expect(prices.length).toBeGreaterThan(10);
    for (const { usd, aud } of prices) {
      expect(usd).toMatch(/\$\d/);
      expect(aud).toMatch(/\$\d/);
    }
  });

  test('QA Audit is priced as advertised', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.priceCard('QA Audit').locator('.price span')).toHaveText('$249');
  });

  test('bundle costs less than booking separately', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const toNumber = (s: string) => Number(s.replace(/[^\d.]/g, ''));
    const bundle = toNumber(await page.locator('.bundle .price span').innerText());
    const separate = toNumber(await page.locator('.bundle s').innerText());
    expect(bundle).toBeLessThan(separate);
  });
});
