import { test, expect } from '@playwright/test';

// Smoke: the app boots, the silent-refresh runs against the real backend, and an
// unauthenticated visitor is routed to the login page.
test('should redirect an unauthenticated visit to the login page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /log in to quatrace/i })).toBeVisible();
});
