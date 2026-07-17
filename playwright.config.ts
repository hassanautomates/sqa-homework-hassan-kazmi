import { defineConfig, devices } from '@playwright/test';

/**
 * Pre-login suite for the Permission Agent (https://ask.permission.ai).
 *
 * Deliberate choices:
 * - workers: 1. Every meaningful test posts a real prompt to a live LLM endpoint. Serial runs keep
 *   us a good citizen (no self-inflicted rate-limiting) and make streaming waits deterministic.
 *   Flakiness here should come from the app, not from us hammering it.
 * - One chromium project. The mobile test overrides the viewport inline (devices['iPhone 13'])
 *   instead of a second project, so the suite stays at exactly 8 test cases, one run each.
 * - Generous per-test timeout because streaming responses are slow and variable by design.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 1, // one retry absorbs transient network blips; the waiting strategy carries the rest.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['html', { outputFolder: 'artifacts/report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://ask.permission.ai',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
