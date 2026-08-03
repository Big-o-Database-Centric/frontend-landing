import { test, expect } from '@playwright/test';

test('permite solicitar la creación de una base de datos MongoDB desde el dashboard', async ({ page }) => {
  let requestPayload: Record<string, unknown> | undefined;

  await page.route('**/databases', async route => {
    requestPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Solicitud recibida' }),
    });
  });

  await page.goto('/views/dashboard.html');

  await page.getByRole('button', { name: /provision new db/i }).click();
  await page.locator('select[name="engine"]').selectOption('mongodb');
  await page.locator('input[name="name"]').fill('analytics-db');
  await page.getByRole('button', { name: /request creation/i }).click();

  await expect(page.getByText(/solicitud recibida/i)).toBeVisible();
  expect(requestPayload).toEqual({ databaseName: 'analytics-db' });
});
