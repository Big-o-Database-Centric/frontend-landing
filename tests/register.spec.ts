import { test, expect } from '@playwright/test';

test('registration uses the API and redirects to login', async ({ page }) => {
  await page.route('**/api/auth/register', (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ Success: true }) }));
  await page.goto('/views/register.html');
  await page.fill('#name', 'Linus Torvalds');
  await page.fill('#email', 'dev@big-o.systems');
  await page.fill('#password', 'secret123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/views\/login\.html$/);
});
