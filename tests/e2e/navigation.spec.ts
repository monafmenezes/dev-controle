import { expect, test } from '@playwright/test';

test('navigates from home to dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Atendimentos, Clientes' })).toBeVisible();

  await page.locator('a[href="/dashboard"]').click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
