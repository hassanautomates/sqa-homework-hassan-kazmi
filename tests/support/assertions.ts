import { expect } from '@playwright/test';

/**
 * Semantic assertions for a non-deterministic agent answer.
 *
 * The text changes every run, so we never assert on exact wording. We assert on INVARIANTS that
 * every reasonable answer holds and a broken one (empty, errored, echoed, off-domain) violates.
 * See artifacts/assertions.md for the reasoning and the "do NOT assert" list.
 */

// Phrases the app renders when generation fails (observed: the "I ran into an issue" fallback).
const ERROR_MARKERS: RegExp[] = [
  /i ran into an issue/i,
  /something went wrong/i,
  /please try again/i,
  /failed to/i,
  /unable to (process|respond|help)/i,
];

// Vocabulary specific to this product (data ownership + ASK rewards). Any-of, case-insensitive.
const DOMAIN_TERMS: RegExp[] = [
  /permission/i, /\bdata\b/i, /earn/i, /privacy/i, /wallet/i, /reward/i, /\bASK\b/, /token/i,
];

export function assertValidAgentAnswer(text: string, prompt: string): void {
  const t = text.trim();

  expect(t.length, 'answer should be substantial prose, not a stub').toBeGreaterThan(40);
  expect(t.split(/\s+/).length, 'answer should be a multi-word sentence').toBeGreaterThan(8);
  expect(t.toLowerCase(), 'answer must not simply echo the prompt back').not.toBe(prompt.trim().toLowerCase());

  for (const marker of ERROR_MARKERS) {
    expect(t, `answer must not contain the error marker ${marker}`).not.toMatch(marker);
  }

  const onDomain = DOMAIN_TERMS.some((re) => re.test(t));
  expect(onDomain, `answer should reference the product domain (one of: ${DOMAIN_TERMS.map((r) => r.source).join(', ')})`).toBe(true);
}
