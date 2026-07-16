import { defineConfig, devices } from '@playwright/test';

// URL base: apunta al despliegue real o al servidor local.
// Sobrescribe con: BASE_URL=http://localhost:8081 npx playwright test
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8081',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
