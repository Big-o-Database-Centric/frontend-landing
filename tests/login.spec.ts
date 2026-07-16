import { test, expect } from '@playwright/test';

test.describe('Integridad y conexión con el login', () => {
  test('la página de login carga con sus assets (CSS/JS) sin 404', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/views/login.html');
    // Assets críticos servidos por nginx
    await expect(page).toHaveURL(/\/views\/login\.html$/);
    expect(failed, `Recursos con error: ${failed.join(', ')}`).toEqual([]);
  });

  test('login.js está conectado (el formulario reacciona al submit)', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    // Tras el submit mock, el botón entra en estado "Verifying..."
    await expect(page.getByText('Verifying...')).toBeVisible();
  });

  test('login exitoso redirige al dashboard (/views/dashboard.html)', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    // El mock tarda ~2.1s (1500ms + 600ms) antes de redirigir
    await expect(page).toHaveURL(/\/views\/dashboard\.html$/, { timeout: 8000 });
  });

  test('el dashboard cargado tras login muestra la sección Overview', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/views\/dashboard\.html$/, { timeout: 8000 });
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Active Databases' })).toBeVisible();
  });

  test('el botón Cerrar sesión en el dashboard vuelve a login', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/views\/dashboard\.html$/, { timeout: 8000 });
    await page.click('[data-nav="logout"]');
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });

  test('campos de email y password existen y son requeridos en el formulario', async ({ page }) => {
    await page.goto('/views/login.html');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText(/Sign In/);
  });
});
