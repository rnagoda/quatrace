import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registerAndOnboard, A11Y_TAGS } from '../../fixtures/helpers.js';

test.describe('projects (learner view)', () => {
  test('should show the learner their seeded projects after onboarding', async ({ page }) => {
    await registerAndOnboard(page);
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/projects$/);
    // Personal project plus a read-only sibling project.
    await expect(page.getByText(/My Web Application/i)).toBeVisible();
    await expect(page.getByText('Billing Service')).toBeVisible();
  });

  test('@a11y projects page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await registerAndOnboard(page);
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
