import { expect, Page } from '@playwright/test';

/** Stable hooks discovered live on ask.permission.ai (data-testid where the app provides them). */
export const sel = {
  input: '[data-testid="agent-chat-input"]',
  send: '[data-testid="agent-chat-input-send-button"]',
  login: '[data-testid="log-in-button"]',
  signup: '[data-testid="sign-up-button"]',
  pageTitle: '[data-testid="ai-page-title"]',
  // Empty-state suggested-topic pills: buttons styled rounded-lg + text-left (no testid on them).
  pill: 'button.rounded-lg.text-left',
  // Conversation: message rows live under .space-y-4; assistant = left aligned, user = right aligned.
  assistant: '.space-y-4 .justify-start',
  user: '.space-y-4 .justify-end',
  // The prose inside a bubble (excludes the timestamp span).
  bubbleText: '.text-md.leading-relaxed',
} as const;

/**
 * On the first visit of a session the app auto-fires a hidden greeting, which replaces the
 * suggested-topic empty state before it can be seen. The app guards that with a localStorage flag
 * holding a JSON timestamp. Seeding a value of the same shape (any timestamp) makes the app skip
 * the greeting, so every test starts from the deterministic empty state where the pills render.
 * Discovered live — see artifacts/ai-workflow.md.
 */
function skipAutoGreeting(): void {
  try {
    localStorage.setItem('undefined-auto-message-sent', JSON.stringify({ timestamp: Date.now() }));
  } catch {
    /* storage may be unavailable; the test will surface it downstream */
  }
}

/** Navigate to the agent in its clean empty state and dismiss the cookie banner. */
export async function gotoAsk(page: Page): Promise<void> {
  await page.addInitScript(skipAutoGreeting);
  await page.goto('/');
  await dismissCookieBanner(page);
  await expect(page.locator(sel.input)).toBeVisible();
}

export async function dismissCookieBanner(page: Page): Promise<void> {
  for (const name of [/reject all/i, /accept all/i]) {
    const btn = page.getByRole('button', { name });
    if (await btn.count()) {
      await btn.first().click({ timeout: 5000 }).catch(() => {});
      break;
    }
  }
}

export function assistantCount(page: Page): Promise<number> {
  return page.locator(sel.assistant).count();
}

/** Type a free-text question and send it. Returns the assistant-bubble count before sending. */
export async function askFreeText(page: Page, question: string): Promise<number> {
  const before = await assistantCount(page);
  await page.locator(sel.input).fill(question);
  await expect(page.locator(sel.send)).toBeEnabled();
  await page.locator(sel.send).click();
  return before;
}

/** Click a suggested-topic pill by its exact label. Returns the assistant-bubble count before. */
export async function clickTopic(page: Page, title: string): Promise<number> {
  const before = await assistantCount(page);
  await page.getByText(title, { exact: true }).first().click();
  return before;
}

/**
 * Wait for a streamed agent reply WITHOUT asserting on content or timing.
 *   1. a new assistant bubble appears (count grows past `prevCount`), then
 *   2. its text is non-empty and unchanged across ~1.6s while the "typing" indicator is gone.
 * Returns the settled reply text. Generous timeout because streaming length is variable by design.
 */
export async function waitForAgentReply(page: Page, prevCount: number): Promise<string> {
  const bubbles = page.locator(sel.assistant);
  await expect
    .poll(() => bubbles.count(), { timeout: 45_000, message: 'no agent reply bubble appeared' })
    .toBeGreaterThan(prevCount);

  const text = bubbles.last().locator(sel.bubbleText);
  let previous = '';
  let stableTicks = 0;
  await expect
    .poll(
      async () => {
        const current = (await text.count()) ? (await text.first().innerText()).trim() : '';
        const stillTyping = await page.getByText(/is typing/i).count();
        stableTicks = current.length > 0 && current === previous && stillTyping === 0 ? stableTicks + 1 : 0;
        previous = current;
        return stableTicks;
      },
      { timeout: 45_000, intervals: [400], message: 'agent reply never stabilised (still streaming?)' },
    )
    .toBeGreaterThanOrEqual(4);

  return previous;
}
