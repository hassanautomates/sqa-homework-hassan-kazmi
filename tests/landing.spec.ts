import { test, expect, devices } from '@playwright/test';
import { gotoAsk, sel } from './support/chat';

test.describe('Landing (pre-login empty state)', () => {
  // Required behaviour #1: the page loads with the suggested-topic pills visible.
  test('shows the suggested-topic pills and a ready ASK input', async ({ page }) => {
    await gotoAsk(page);
    await expect(page.locator(sel.pageTitle)).toHaveText(/permission agent/i);

    const pills = page.locator(sel.pill);
    await expect
      .poll(() => pills.count(), { timeout: 15_000, message: 'suggested-topic pills did not render' })
      .toBeGreaterThanOrEqual(3);
    await expect(pills.first()).toBeVisible();

    await expect(page.locator(sel.input)).toBeVisible();
    await expect(page.locator(sel.input)).toBeEditable();
  });

  // Judgment pick: the pre-login boundary. Automation stops here — we only prove the auth entry
  // points exist and open something, we never complete a login/signup.
  test('exposes Log in and Sign Up entry points', async ({ page }) => {
    await gotoAsk(page);
    await expect(page.locator(sel.login)).toBeVisible();
    await expect(page.locator(sel.signup)).toBeVisible();

    await page.locator(sel.signup).click();
    await expect
      .poll(
        async () => {
          const routed = /login|signup|sign-up|auth|connect/i.test(page.url());
          const dialog = await page.getByRole('dialog').count();
          const authText = await page.getByText(/connect|wallet|continue with|email|log ?in/i).count();
          return routed || dialog > 0 || authText > 0;
        },
        { timeout: 15_000, message: 'Sign Up did not open an auth surface' },
      )
      .toBe(true);
  });
});

// Spread only the emulation fields; drop defaultBrowserType (webkit) so we stay on the chromium
// project without forcing a new worker.
const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];

test.describe('Landing on mobile', () => {
  test.use(iPhone13);

  // Judgment pick: the brief calls out mobile. Emulate a phone and prove the core UI stays usable.
  test('keeps pills and the ASK input usable at a phone viewport', async ({ page }) => {
    await gotoAsk(page);

    const pills = page.locator(sel.pill);
    await expect.poll(() => pills.count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
    await expect(pills.first()).toBeVisible();

    const input = page.locator(sel.input);
    await expect(input).toBeVisible();
    await input.click();
    await input.fill('hello from mobile');
    await expect(input).toHaveValue('hello from mobile');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'page should not scroll horizontally on a phone viewport').toBeLessThanOrEqual(4);
  });
});
