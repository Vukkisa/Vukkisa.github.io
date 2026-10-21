import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests run against the production build in the repo root (the files GitHub Pages serves),
 * served by `vite preview`. Run `npm run build` first; `npm run test:e2e` does not build.
 *
 * Browser: the pinned @playwright/test version uses Chromium r1194. CI installs it with
 * `npx playwright install --with-deps chromium`. Locally, run that once, or point
 * PLAYWRIGHT_BROWSERS_PATH at an existing install of the same revision.
 */
const PORT = 4173
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
