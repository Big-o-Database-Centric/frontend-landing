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
  // Levanta el servidor estático local salvo que se apunte a un despliegue real.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'node tests/static-server.js',
        port: 8081,
        reuseExistingServer: true,
      },
});
