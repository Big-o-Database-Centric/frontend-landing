import { expect, test, type Page } from '@playwright/test';

const capabilities = {
  models: ['llama-8b-nvidia'],
  defaultModel: 'llama-8b-nvidia',
  maxTokens: 512,
  defaultMaxTokens: 256,
  perUser: { perMinute: 3, perDay: 10 },
  remaining: { today: 9 },
};

const successfulChat = {
  model: 'llama-8b-nvidia',
  message: { role: 'assistant', content: 'Hola desde IA' },
  usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
  remaining: { today: 8 },
};

async function mockProfileAndCapabilities(page: Page) {
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('**/api/me', (route) => route.fulfill({ json: { Name: 'Ada', Email: 'ada@example.com' } }));
  await page.route('**/api/ai/capabilities', (route) => route.fulfill({ json: capabilities }));
}

test('authenticated user chats without receiving the provider key', async ({ page }) => {
  await mockProfileAndCapabilities(page);
  let requestBody: unknown;
  await page.route('**/api/ai/chat', async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ json: successfulChat });
  });

  await page.goto('/views/ai.html');
  await expect(page.locator('#ai-model')).toHaveText('llama-8b-nvidia');
  await expect(page.locator('#ai-remaining')).toHaveText('9 de 10 disponibles hoy');
  await page.locator('#ai-message').fill('Hola');
  await page.locator('#ai-submit').click();

  await expect(page.locator('#ai-transcript')).toContainText('Hola desde IA');
  await expect(page.locator('#ai-remaining')).toHaveText('8 de 10 disponibles hoy');
  expect(requestBody).toEqual({ messages: [{ role: 'user', content: 'Hola' }], maxTokens: 256 });
  await expect(page.locator('body')).not.toContainText('pr_ai_');
});

test('shows progress, blocks duplicates, and keeps no browser-stored transcript', async ({ page }) => {
  await mockProfileAndCapabilities(page);
  let requests = 0;
  await page.route('**/api/ai/chat', async (route) => {
    requests += 1;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ json: successfulChat });
  });

  await page.goto('/views/ai.html');
  await page.locator('#ai-message').fill('Hola');
  await page.locator('#ai-submit').click();
  await expect(page.locator('#ai-progress')).toHaveText('Generando respuesta…');
  await expect(page.locator('#ai-submit')).toBeDisabled();
  await expect(page.locator('#ai-message')).toBeDisabled();
  await expect(page.locator('#ai-new-conversation')).toBeEnabled();
  await page.locator('#ai-submit').click({ force: true });
  await expect(page.locator('#ai-transcript')).toContainText('Hola desde IA');
  expect(requests).toBe(1);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })))
    .toEqual({ local: 0, session: 0 });

  await page.reload();
  await expect(page.locator('#ai-transcript')).not.toContainText('Hola desde IA');
});

for (const [status, expected] of [
  [400, 'Revisa el contenido del mensaje.'],
  [429, 'Alcanzaste el límite de uso de IA.'],
  [502, 'El servicio de IA no está disponible.'],
  [504, 'El servicio de IA tardó demasiado.'],
] as const) {
  test(`shows a safe message for ${status}`, async ({ page }) => {
    await mockProfileAndCapabilities(page);
    await page.route('**/api/ai/chat', (route) => route.fulfill({ status, json: { message: 'internal provider detail' } }));

    await page.goto('/views/ai.html');
    await page.locator('#ai-message').fill('Hola');
    await page.locator('#ai-submit').click();

    await expect(page.locator('#ai-error')).toHaveText(expected);
    await expect(page.locator('body')).not.toContainText('internal provider detail');
  });
}

test('redirects to login when the Big O session expires', async ({ page }) => {
  await mockProfileAndCapabilities(page);
  await page.route('**/api/ai/chat', (route) => route.fulfill({ status: 401, json: { message: 'expired' } }));

  await page.goto('/views/ai.html');
  await page.locator('#ai-message').fill('Hola');
  await page.locator('#ai-submit').click();

  await expect(page).toHaveURL(/\/views\/login\.html$/);
});

test('logs out through Big O before returning to login', async ({ page }) => {
  await mockProfileAndCapabilities(page);
  let logoutMethod = '';
  await page.route('**/api/auth/logout', async (route) => {
    logoutMethod = route.request().method();
    await route.fulfill({ status: 204 });
  });

  await page.goto('/views/ai.html');
  await page.locator('[data-nav="logout"]').click();

  await expect(page).toHaveURL(/\/views\/login\.html$/);
  expect(logoutMethod).toBe('POST');
});

test('new conversation clears the transcript and request context', async ({ page }) => {
  await mockProfileAndCapabilities(page);
  const requestBodies: Array<{ messages: Array<{ role: string; content: string }>; maxTokens: number }> = [];
  await page.route('**/api/ai/chat', async (route) => {
    requestBodies.push(route.request().postDataJSON());
    await route.fulfill({ json: successfulChat });
  });

  await page.goto('/views/ai.html');
  await page.locator('#ai-message').fill('Primera pregunta');
  await page.locator('#ai-submit').click();
  await expect(page.locator('#ai-transcript')).toContainText('Hola desde IA');
  await page.locator('#ai-new-conversation').click();
  await expect(page.locator('#ai-transcript')).not.toContainText('Primera pregunta');
  await expect(page.locator('#ai-transcript')).not.toContainText('Hola desde IA');

  await page.locator('#ai-message').fill('Pregunta nueva');
  await page.locator('#ai-submit').click();
  expect(requestBodies[1]).toEqual({
    messages: [{ role: 'user', content: 'Pregunta nueva' }],
    maxTokens: 256,
  });
});

test('renders model content as text rather than markup', async ({ page }) => {
  await mockProfileAndCapabilities(page);
  await page.route('**/api/ai/chat', (route) => route.fulfill({
    json: {
      ...successfulChat,
      message: { role: 'assistant', content: '<img src=x onerror=alert(1)>Texto seguro' },
    },
  }));

  await page.goto('/views/ai.html');
  await page.locator('#ai-message').fill('<strong>Hola</strong>');
  await page.locator('#ai-submit').click();

  await expect(page.locator('#ai-transcript')).toContainText('<strong>Hola</strong>');
  await expect(page.locator('#ai-transcript')).toContainText('<img src=x onerror=alert(1)>Texto seguro');
  await expect(page.locator('#ai-transcript img')).toHaveCount(0);
  await expect(page.locator('#ai-transcript strong')).toHaveCount(0);
});
