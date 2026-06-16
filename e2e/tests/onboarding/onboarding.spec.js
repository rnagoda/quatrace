import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registerViaUI, completeOnboardingUI, A11Y_TAGS } from '../../fixtures/helpers.js';

test.describe('onboarding', () => {
  test('should guide a new learner through provisioning into a populated workspace', async ({
    page,
  }) => {
    await registerViaUI(page);
    await expect(page.getByRole('heading', { name: /welcome to quatrace/i })).toBeVisible();

    await completeOnboardingUI(page);

    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page.getByText(/My Web Application/i)).toBeVisible();
  });

  test('@a11y onboarding page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await registerViaUI(page);
    await expect(page.getByRole('heading', { name: /welcome to quatrace/i })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
