import { test, expect } from '@playwright/test';

test.describe('Navegación del landing', () => {
  test('el botón Login redirige a /views/login.html', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-nav="login"]');
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });

  test('el botón Sign Up redirige a /views/register.html', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-nav="register"]');
    await expect(page).toHaveURL(/\/views\/register\.html$/);
  });

  test('desde login, el logo BIG O vuelve al landing', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.click('a[href="/index.html"]');
    await expect(page).toHaveURL(/\/(index\.html)?$/);
  });

  test('landing.js se carga sin errores de consola', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.click('[data-nav="login"]');
    expect(errors).toEqual([]);
  });
});
