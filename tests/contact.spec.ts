import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

// These tests never submit the form, so they don't send real enquiries.
test.describe('Contact form', () => {
  test('posts to Formspree', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.contactForm).toHaveAttribute('action', /^https:\/\/formspree\.io\/f\/\w+$/);
    await expect(home.contactForm).toHaveAttribute('method', /post/i);
  });

  test('required fields block an empty submission', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const form = home.contactForm;
    for (const name of ['name', 'email', 'message']) {
      await expect(form.locator(`[name="${name}"]`)).toHaveAttribute('required', '');
    }
    const valid = await form.evaluate((f) => (f as HTMLFormElement).checkValidity());
    expect(valid).toBe(false);
  });

  test('rejects an invalid email address', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const form = home.contactForm;
    await form.locator('[name="name"]').fill('Test Client');
    await form.locator('[name="email"]').fill('not-an-email');
    await form.locator('[name="message"]').fill('Hello');

    const emailValid = await form
      .locator('[name="email"]')
      .evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(emailValid).toBe(false);

    await form.locator('[name="email"]').fill('client@example.com');
    const formValid = await form.evaluate((f) => (f as HTMLFormElement).checkValidity());
    expect(formValid).toBe(true);
  });

  test('service dropdown lists every package group', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const options = await home.contactForm.locator('select[name="service"] option').allInnerTexts();
    for (const expected of ['QA Audit', 'Virtual Assistance', 'Startup Support Bundle', 'Not sure yet']) {
      expect(options).toContain(expected);
    }
  });
});
