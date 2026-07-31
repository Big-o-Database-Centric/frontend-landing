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
  await expect(page.locator('#database-total')).toHaveText('1 total');
  await expect(page.locator('#database-list')).toContainText('shop');
  await expect(page.locator('#database-list')).toContainText('db.example.test:34601');
  await expect(page.locator('#database-list')).toContainText('20 MB limit');
  await expect(page.locator('#engine option')).toHaveText(['MySQL', 'PostgreSQL']);
});
