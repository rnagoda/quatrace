import { defineConfig, devices } from '@playwright/test';

// Full-stack E2E: Playwright starts the real backend (against the test database)
// and the built frontend preview, then drives the browser against them.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // One worker keeps the shared backend/database deterministic across specs.
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm start',
      cwd: '../backend',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: 'test',
        PORT: '3000',
        DATABASE_URL: 'postgresql://quatrace:quatrace@localhost:5432/quatrace_test',
        CORS_ORIGIN: 'http://localhost:4173',
      },
    },
    {
      command: 'npm run build && npm run preview -- --port 4173 --strictPort',
      cwd: '../frontend',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { VITE_API_URL: 'http://localhost:3000/api' },
    },
  ],
});
