import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HomePage } from '../pages/HomePage';

test.describe('Quality checks', () => {
  test('no serious or critical accessibility issues', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const blocking = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(
      blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} element(s))`),
      'serious/critical axe violations',
    ).toEqual([]);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      // Cloudflare Web Analytics is blocked by some browsers; it is not part of the site itself.
      if (msg.type() === 'error' && !msg.text().includes('cloudflareinsights')) errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    const home = new HomePage(page);
    await home.goto();
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('page and images load within budget', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.waitForLoadState('load');

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded, 'DOMContentLoaded (ms)').toBeLessThan(3000);
    expect(timing.load, 'load event (ms)').toBeLessThan(5000);
  });

  test('same-site assets return 200', async ({ page, request }) => {
    const home = new HomePage(page);
    await home.goto();

    const urls = await page.evaluate(() => {
      const srcs = [...document.querySelectorAll('img')].map((i) => (i as HTMLImageElement).src);
      return [...new Set(srcs)].filter((u) => u.startsWith(location.origin));
    });
    for (const url of urls) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
    }
  });
});
