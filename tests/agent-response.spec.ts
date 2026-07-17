import { test, expect } from '@playwright/test';
import { gotoAsk, askFreeText, waitForAgentReply, sel } from './support/chat';
import { assertValidAgentAnswer } from './support/assertions';

test.describe('Agent responses', () => {
  // Required behaviour #3: a free-text question via the ASK input produces an agent response.
  test('a free-text question produces a relevant answer', async ({ page }) => {
    await gotoAsk(page);
    const question = 'How can I earn ASK?';
    const before = await askFreeText(page, question);

    const answer = await waitForAgentReply(page, before);
    assertValidAgentAnswer(answer, question);
    expect(answer, 'answer should address the ASK token the user asked about').toMatch(/\bASK\b/);
  });

  // Required behaviour #4: Shift+Enter makes a new line instead of sending.
  test('Shift+Enter inserts a newline instead of sending', async ({ page }) => {
    await gotoAsk(page);
    const input = page.locator(sel.input);
    const assistantBefore = await page.locator(sel.assistant).count();

    await input.click();
    await input.pressSequentially('first line');
    await input.press('Shift+Enter');
    await input.pressSequentially('second line');

    await expect(input).toHaveValue(/first line\nsecond line/);
    // Nothing was submitted: no new bubbles, input keeps its text.
    await expect(page.locator(sel.assistant)).toHaveCount(assistantBefore);
    await expect(page.locator(sel.user)).toHaveCount(0);
  });

  // Judgment pick: input guard. Empty / whitespace-only content must not be sendable.
  test('empty or whitespace-only input cannot be sent', async ({ page }) => {
    await gotoAsk(page);
    await expect(page.locator(sel.send)).toBeDisabled();

    await page.locator(sel.input).fill('   ');
    await expect(page.locator(sel.send)).toBeDisabled();

    await page.locator(sel.input).press('Enter');
    await expect(page.locator(sel.user)).toHaveCount(0);
  });

  // Judgment pick: the streaming mechanic itself (the heart of the challenge). Prove the reply
  // streams — a typing indicator shows during generation and clears once the text settles.
  test('the reply streams in, then settles', async ({ page }) => {
    await gotoAsk(page);
    const question = 'What is data ownership?';
    const before = await askFreeText(page, question);

    await expect(page.getByText(/is typing/i)).toBeVisible({ timeout: 15_000 });
    const answer = await waitForAgentReply(page, before);
    await expect(page.getByText(/is typing/i)).toHaveCount(0);

    assertValidAgentAnswer(answer, question);
  });
});
