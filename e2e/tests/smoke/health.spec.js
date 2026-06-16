import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('home page', () => {
  test('should render the app shell when loaded', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /quatrace/i }),
    ).toBeVisible();
    await expect(page.getByTestId('api-status')).toBeVisible();
  });

  test('@a11y should have no WCAG 2.2 AA violations when loaded', async ({
    page,
  }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
