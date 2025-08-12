import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5174',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
  },
});
