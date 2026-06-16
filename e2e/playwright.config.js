import { defineConfig, devices } from '@playwright/test';

// The walking-skeleton E2E exercises the rendered frontend and its accessibility.
// It builds and previews the frontend as its web server. (Full browser→live-API
// flows arrive with the first real feature, once there is authenticated UI to drive.)
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    cwd: '../frontend',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
