import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  PASSWORD,
  A11Y_TAGS,
  uniqueEmail,
  registerViaUI,
  registerAndOnboard,
} from '../../fixtures/helpers.js';

const API = 'http://localhost:3000/api';

test.describe('authentication', () => {
  test('should route a newly registered learner to onboarding', async ({ page }) => {
    await registerViaUI(page);
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('should log out back to the login page', async ({ page }) => {
    await registerAndOnboard(page);
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should log in with an existing onboarded account', async ({ page, request }) => {
    // Create and onboard an account via the API, then sign in through the UI.
    const email = uniqueEmail();
    const reg = await request.post(`${API}/auth/register`, {
      data: { email, password: PASSWORD, first_name: 'E2E', last_name: 'User' },
    });
    const token = (await reg.json()).data.accessToken;
    await request.post(`${API}/onboarding`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { project_type: 'web' },
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/signed in as/i)).toBeVisible();
  });

  test('should show an error on invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Password').fill('WrongPassword1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should preserve the session across a reload', async ({ page }) => {
    await registerAndOnboard(page);
    await page.reload();
    await expect(page.getByText(/signed in as/i)).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('@a11y login page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('@a11y register page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/register');
    const results = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
