import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registerAndOnboard, A11Y_TAGS } from '../../fixtures/helpers.js';

const SEEDED_NEW_DEFECT = 'Dashboard chart misaligned on small screens';

async function openOwnProjectDefects(page) {
  await registerAndOnboard(page);
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('link', { name: /My Web Application/i }).click();
  await page.getByRole('link', { name: /view defects/i }).click();
  await expect(page.getByRole('heading', { name: 'Defects' })).toBeVisible();
}

test.describe('defects', () => {
  test('should show seeded defects and support transition, comment, and create', async ({
    page,
  }) => {
    await openOwnProjectDefects(page);
    await expect(page.getByText(SEEDED_NEW_DEFECT)).toBeVisible();

    // Open a "new" defect and perform a valid transition.
    await page.getByRole('link', { name: SEEDED_NEW_DEFECT }).click();
    await expect(page.getByTestId('defect-status')).toHaveText('New');
    await page.getByRole('button', { name: 'Open' }).click();
    await expect(page.getByTestId('defect-status')).toHaveText('Open');

    // Add a comment.
    await page.getByLabel('Add a comment').fill('Looking into this.');
    await page.getByRole('button', { name: 'Comment' }).click();
    await expect(page.getByTestId('comment-list')).toContainText('Looking into this.');

    // Create a new defect.
    await page.getByRole('link', { name: /back to defects/i }).click();
    await page.getByLabel('Title').fill('Footer link is broken');
    await page.getByRole('button', { name: /create defect/i }).click();
    await expect(page.getByText('Footer link is broken')).toBeVisible();
  });

  test('@a11y defects list and detail have no WCAG 2.2 AA violations', async ({ page }) => {
    await openOwnProjectDefects(page);
    let results = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
    expect(results.violations).toEqual([]);

    await page.getByRole('link', { name: SEEDED_NEW_DEFECT }).click();
    await expect(page.getByRole('heading', { name: SEEDED_NEW_DEFECT })).toBeVisible();
    results = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
