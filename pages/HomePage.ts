import { type Locator, type Page, expect } from '@playwright/test';

/** Page object for the Qualiteq HQ one-page website. */
export class HomePage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly bookCallButton: Locator;
  readonly menuButton: Locator;
  readonly navLinks: Locator;
  readonly currencyButtons: Locator;
  readonly priceValues: Locator;
  readonly contactForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.bookCallButton = page.locator('.hero').getByRole('link', { name: 'Book a free 15-min call' });
    this.menuButton = page.getByRole('button', { name: 'Open menu' });
    this.navLinks = page.locator('.nav-links');
    this.currencyButtons = page.locator('.toggle button');
    this.priceValues = page.locator('[data-usd]');
    this.contactForm = page.locator('#contact form');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.heroHeading).toBeVisible();
  }

  section(id: string): Locator {
    return this.page.locator(`section#${id}`);
  }

  currency(code: 'USD' | 'AUD'): Locator {
    return this.currencyButtons.filter({ hasText: code });
  }

  priceCard(name: string): Locator {
    return this.page.locator('.price-card').filter({
      has: this.page.getByRole('heading', { name, exact: true }),
    });
  }

  /** Every element that switches price text, as [usd, aud, shown] triples. */
  async priceData(): Promise<{ usd: string; aud: string; shown: string }[]> {
    return this.priceValues.evaluateAll((els) =>
      els.map((el) => ({
        usd: (el as HTMLElement).dataset.usd ?? '',
        aud: (el as HTMLElement).dataset.aud ?? '',
        shown: el.textContent?.trim() ?? '',
      })),
    );
  }
}
