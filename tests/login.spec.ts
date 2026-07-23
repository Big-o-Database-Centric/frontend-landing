import { test, expect } from '@playwright/test';

test.describe('Integridad y conexión con el login', () => {
  test('la página de login carga con sus assets (CSS/JS) sin 404', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/views/login.html');
    await expect(page).toHaveURL(/\/views\/login\.html$/);
    // Ignora recursos externos (fuentes/CDN) que no controlamos.
    const local = failed.filter((f) => f.includes('localhost'));
    expect(local, `Recursos locales con error: ${local.join(', ')}`).toEqual([]);
  });

  test('campos de email y password existen, requeridos, y el botón dice Sign In', async ({ page }) => {
    await page.goto('/views/login.html');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#email')).toHaveAttribute('required', '');
    await expect(page.locator('#password')).toHaveAttribute('required', '');
    await expect(page.locator('button[type="submit"]')).toHaveText(/Sign In/);
  });
});

test.describe('Validación del formulario de login', () => {
  test('submit con todo vacío no redirige y muestra un mensaje', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-message')).toBeVisible();
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });

  test('submit con solo email no redirige y pide la contraseña', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'dev@big-o.systems');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-message')).toContainText(/contraseña/i);
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });

  test('email con formato inválido no redirige y avisa', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'no-es-un-correo');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-message')).toContainText(/correo/i);
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });

  test('el mensaje de error desaparece al corregir el campo', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-message')).toBeVisible();
    await page.fill('#email', 'dev@big-o.systems');
    await expect(page.locator('#form-message')).toBeHidden();
  });
});

test.describe('Botones OAuth (aún sin backend)', () => {
  test('clic en Google informa que estará disponible pronto, sin redirigir', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.click('#oauth-google');
    await expect(page.locator('#form-message')).toContainText(/Google/);
    await expect(page.locator('#form-message')).toContainText(/pronto/i);
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });

  test('clic en GitHub informa que estará disponible pronto, sin redirigir', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.click('#oauth-github');
    await expect(page.locator('#form-message')).toContainText(/GitHub/);
    await expect(page).toHaveURL(/\/views\/login\.html$/);
  });
});

test.describe('Flujo simulado con datos válidos', () => {
  test('login con datos válidos redirige al dashboard', async ({ page }) => {
    await page.goto('/views/login.html');
    await page.fill('#email', 'dev@big-o.systems');
    await page.fill('#password', 'secret123');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Verifying...')).toBeVisible();
    await expect(page).toHaveURL(/\/views\/dashboard\.html$/, { timeout: 8000 });
  });

  test('el dashboard tras login muestra la sección Overview', async ({ page }) => {
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
});
