import { test, expect } from '@playwright/test';

test('hydrates the seeded board and opens a card drawer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'My Board' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'To do' })).toBeVisible();
  await page.getByRole('button', { name: /Card:/ }).first().click();
  await expect(page.getByTestId('card-drawer')).toBeVisible();
});
