/* eslint-disable no-undef */
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for StellarBoat e2e smoke tests.
 * Tests run against pre-built `dist/` served by `npx serve`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx serve dist -l 4000',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
});
