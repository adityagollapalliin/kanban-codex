import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:3000', ...devices['Desktop Chrome'] },
  webServer: {
    command:
      'npm run build && DATABASE_PATH=/tmp/kanban-playwright.sqlite npm run seed && NODE_ENV=production DATABASE_PATH=/tmp/kanban-playwright.sqlite npm start',
    url: 'http://127.0.0.1:3000/healthz',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
