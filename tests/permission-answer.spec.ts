import { test, expect } from '@playwright/test';
import { gotoAsk, clickTopic, waitForAgentReply } from './support/chat';
import { assertValidAgentAnswer } from './support/assertions';

/**
 * Part 2 — validating a non-deterministic response.
 * This is also required behaviour #2 (clicking a suggested topic produces an agent response).
 * The assertions live in ./support/assertions.ts; the reasoning is in artifacts/assertions.md.
 */
test.describe('Part 2 — the "What is Permission" answer', () => {
  test('clicking the topic yields a valid answer on every run', async ({ page }) => {
    await gotoAsk(page);
    const before = await clickTopic(page, 'What is Permission');

    const answer = await waitForAgentReply(page, before);

    // Invariants that hold for ANY reasonable answer — never the exact text.
    assertValidAgentAnswer(answer, 'What is Permission?');
    // This topic explains the product, so the product name should appear.
    expect(answer, 'a "What is Permission" answer should name the product').toMatch(/permission/i);
  });
});
