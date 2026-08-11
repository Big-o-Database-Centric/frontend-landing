import { expect, test } from '@playwright/test';

test('dashboard renders managed databases returned by the API', async ({ page }) => {
  await page.route('https://cdn.tailwindcss.com/**', (route) => route.abort());
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('**/api/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ Name: 'Ada Lovelace', Email: 'ada@example.com' }),
  }));
  await page.route('**/api/managed-databases', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{
      DatabaseId: 7,
      DatabaseName: 'shop',
      Engine: 'mysql',
      HostName: 'db.example.test',
      Port: 34601,
      DatabaseUser: 'ada@example.com',
      QuotaBytes: 20971520,
      State: 'active',
    }]),
  }));
  await page.route('**/api/managed-databases/capabilities', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ engines: ['mysql', 'postgresql'] }),
  }));

  await page.goto('/views/dashboard.html', { waitUntil: 'networkidle' });

  await expect(page.locator('#user-name')).toHaveText('Ada Lovelace');
  await expect(page.locator('#database-total')).toHaveText('1 de 3 bases en uso');
  await expect(page.locator('#database-list')).toContainText('shop');
  await expect(page.locator('#database-list')).toContainText('db.example.test:34601');
  await expect(page.locator('#database-list')).toContainText('20 MB limit');
  await expect(page.locator('#engine option')).toHaveText(['MySQL', 'PostgreSQL']);
});

test('shows the per-user limit and lets an owner delete a database', async ({ page }) => {
  await page.route('https://cdn.tailwindcss.com/**', (route) => route.abort());
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('**/api/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ Name: 'Ada', Email: 'ada@example.com' }) }));
  await page.route('**/api/managed-databases/capabilities', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ engines: ['mysql', 'postgresql'], maxPerUser: 3 }) }));
  await page.route('**/api/managed-databases/1', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ databaseId: 1, deleted: true }) }));
  await page.route('**/api/managed-databases', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([1, 2, 3].map((DatabaseId) => ({ DatabaseId, DatabaseName: `db_${DatabaseId}`, Engine: 'mysql', QuotaBytes: 20971520, State: 'active' }))),
  }));

  await page.goto('/views/dashboard.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#database-total')).toHaveText('3 de 3 bases en uso');
  await expect(page.locator('#open-provision-dialog')).toBeDisabled();
  page.on('dialog', (dialog) => dialog.accept());
  await page.locator('[data-delete-id="1"]').click();
  await expect(page.locator('#dashboard-message')).toContainText('eliminada');
});

test('keeps the dashboard responsive while creating and restores new credentials after reload', async ({ page }) => {
  await page.route('https://cdn.tailwindcss.com/**', (route) => route.abort());
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('**/api/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ Name: 'Ada', Email: 'ada@example.com' }) }));
  await page.route('**/api/managed-databases/capabilities', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ engines: ['mysql'], maxPerUser: 3 }) }));
  await page.route('**/api/managed-databases', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    await new Promise((resolve) => setTimeout(resolve, 250));
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ databaseId: 8, engine: 'mysql', host: 'db.example.test', port: 3306, databaseName: 'shop', username: 'ada@example.com', password: 'Aa1!secret' }) });
  });

  await page.goto('/views/dashboard.html', { waitUntil: 'networkidle' });
  await page.locator('#open-provision-dialog').click();
  await expect(page.locator('#api-key')).toBeHidden();
  await expect(page.locator('#api-key')).not.toHaveAttribute('required', '');
  await page.locator('#database-name').fill('shop');
  await page.locator('#provision-submit').click();
  await expect(page.locator('#provision-progress')).toContainText('Creando MySQL');
  await expect(page.locator('#provision-submit')).toBeDisabled();
  await expect(page.locator('#credentials-dialog')).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#credentials-dialog')).toBeVisible();
  await expect(page.locator('#credentials-content')).toContainText('Aa1!secret');
});
