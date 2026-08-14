import { test, expect } from '@playwright/test';

test('permite solicitar la creación de una base de datos MongoDB desde el dashboard', async ({ page }) => {
  let requestPayload: Record<string, unknown> | undefined;
  let requestApiKey = '';

  await page.route('https://cdn.tailwindcss.com/**', route => route.abort());
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.route('**/api/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ Name: 'Ada', Email: 'ada@example.com' }),
  }));
  await page.route('**/api/managed-databases/capabilities', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ engines: ['mysql', 'mongodb'], maxPerUser: 3 }),
  }));
  await page.route('**/api/managed-databases', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('https://mongo.szapatar.dev/databases', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      return;
    }
    requestPayload = route.request().postDataJSON();
    requestApiKey = route.request().headers()['x-api-key'];
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'db_83fd9ab2',
        database: 'db_83fd9ab2',
        username: 'owner_db_83fd9ab2',
        password: 'secret',
        connectionString: 'mongodb://example.test/db_83fd9ab2',
      }),
    });
  });

  await page.goto('/views/dashboard.html', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /provision new db/i }).click();
  await page.locator('select[name="engine"]').selectOption('mongodb');
  await expect(page.locator('input[name="apiKey"]')).toHaveCount(0);
  await page.locator('input[name="databaseName"]').fill('analytics-db');
  await page.getByRole('button', { name: /create database/i }).click();

  await expect(page.locator('#credentials-dialog')).toBeVisible();
  await expect(page.locator('#credentials-content')).toContainText('db_83fd9ab2');
  expect(requestPayload).toEqual({ databaseName: 'analytics-db' });
  expect(requestApiKey).toBe('grupobigoadmin');
});
