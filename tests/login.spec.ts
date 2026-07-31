import { test, expect } from '@playwright/test';

test('login validates an invalid email locally', async ({ page }) => {
  await page.goto('/views/login.html');
  await page.fill('#email', 'not-an-email');
  await page.fill('#password', 'secret123');
  await page.click('button[type="submit"]');
  await expect(page.locator('#form-message')).toContainText(/correo/i);
});

test('login uses the API and loads a real dashboard', async ({ page }) => {
  await page.route('**/api/auth/login', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ Success: true }) }));
  await page.route('**/api/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ Success: true, Name: 'Dev', Email: 'dev@big-o.systems' }) }));
  await page.route('**/api/managed-databases', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/api/managed-databases/capabilities', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ engines: ['mysql', 'postgresql'] }) }));
  await page.goto('/views/login.html');
  await page.fill('#email', 'dev@big-o.systems');
  await page.fill('#password', 'secret123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/views\/dashboard\.html$/);
  await expect(page.getByText('Dev', { exact: true })).toBeVisible();
});
