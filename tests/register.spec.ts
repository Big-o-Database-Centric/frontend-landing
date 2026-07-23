import { test, expect } from '@playwright/test';

test.describe('Validación del formulario de registro', () => {
  test('campos requeridos presentes', async ({ page }) => {
    await page.goto('/views/register.html');
    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('required', '');
    await expect(page.locator('#password')).toHaveAttribute('required', '');
  });

  test('submit vacío no redirige y muestra mensaje', async ({ page }) => {
    await page.goto('/views/register.html');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-message')).toBeVisible();
    await expect(page).toHaveURL(/\/views\/register\.html$/);
  });

  test('contraseña corta no redirige y avisa del mínimo', async ({ page }) => {
    await page.goto('/views/register.html');
    await page.fill('#name', 'Linus Torvalds');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-message')).toContainText(/8 caracteres/i);
    await expect(page).toHaveURL(/\/views\/register\.html$/);
  });

  test('datos válidos redirigen al dashboard', async ({ page }) => {
    await page.goto('/views/register.html');
    await page.fill('#name', 'Linus Torvalds');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/views\/dashboard\.html$/, { timeout: 8000 });
  });

  test('los botones OAuth apuntan al backend', async ({ page }) => {
    await page.goto('/views/register.html');
    await expect(page.locator('#oauth-github')).toHaveAttribute('href', '/api/auth/github');
    await expect(page.locator('#oauth-google')).toHaveAttribute('href', '/api/auth/google');
  });
});
