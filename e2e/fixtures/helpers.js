import { expect } from '@playwright/test';

export const PASSWORD = 'Password123';
export const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

let seq = 0;
export function uniqueEmail(prefix = 'e2e') {
  seq += 1;
  return `${prefix}_${Date.now()}_${seq}@example.test`;
}

// Register a new learner through the UI. New users are routed to onboarding.
export async function registerViaUI(page, email = uniqueEmail()) {
  await page.goto('/register');
  await page.getByLabel('First name').fill('E2E');
  await page.getByLabel('Last name').fill('User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  return email;
}

// Complete the onboarding wizard, landing on the authenticated home page.
export async function completeOnboardingUI(page) {
  await page.getByLabel(/web application/i).check();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /set up my workspace/i }).click();
  await expect(page.getByTestId('team-list')).toBeVisible();
  await page.getByRole('button', { name: /enter quatrace/i }).click();
  await expect(page.getByText(/signed in as/i)).toBeVisible();
}

export async function registerAndOnboard(page) {
  await registerViaUI(page);
  await completeOnboardingUI(page);
}
