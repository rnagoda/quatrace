import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PASSWORD = 'Password123';
let seq = 0;
function uniqueEmail() {
  seq += 1;
  return `e2e_proj_${Date.now()}_${seq}@example.test`;
}

async function registerAndLand(page) {
  await page.goto('/register');
  await page.getByLabel('First name').fill('E2E');
  await page.getByLabel('Last name').fill('User');
  await page.getByLabel('Email').fill(uniqueEmail());
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText(/signed in as/i)).toBeVisible();
}

test.describe('projects (read-only learner view)', () => {
  test('should show the empty state for a freshly registered learner', async ({ page }) => {
    await registerAndLand(page);
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByTestId('projects-empty')).toBeVisible();
    // A tester has no create control.
    await expect(page.getByRole('button', { name: /new project|create project/i })).toHaveCount(0);
  });

  test('@a11y projects page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await registerAndLand(page);
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
