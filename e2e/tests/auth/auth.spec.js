import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PASSWORD = 'Password123';
let seq = 0;
function uniqueEmail() {
  seq += 1;
  return `e2e_${Date.now()}_${seq}@example.test`;
}

async function registerViaUI(page, email) {
  await page.goto('/register');
  await page.getByLabel('First name').fill('E2E');
  await page.getByLabel('Last name').fill('User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
}

test.describe('authentication', () => {
  test('should register and land on the authenticated home page', async ({ page }) => {
    await registerViaUI(page, uniqueEmail());
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/signed in as/i)).toBeVisible();
  });

  test('should log out back to the login page', async ({ page }) => {
    await registerViaUI(page, uniqueEmail());
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should log in with an existing account', async ({ page, request }) => {
    const email = uniqueEmail();
    await request.post('http://localhost:3000/api/auth/register', {
      data: { email, password: PASSWORD, first_name: 'E2E', last_name: 'User' },
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
    await registerViaUI(page, uniqueEmail());
    await expect(page.getByText(/signed in as/i)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/signed in as/i)).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('@a11y login page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('@a11y register page should have no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/register');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
