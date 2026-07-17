# sqa-homework-hassan-kazmi

Pre-login QA suite for the **Permission Agent** at [ask.permission.ai](https://ask.permission.ai) —
a streaming, non-deterministic AI chat. Playwright (TypeScript), 8 tests, HTML report.

## Setup

Requires Node ≥ 18. From a clean clone:

```bash
npm ci
npx playwright install chromium     # one browser is all the suite needs
npm test                            # runs the 8 tests against the live site (headless)
npm run test:headed                 # optional: watch the browser drive the site
npm run report                      # opens the generated HTML report
```

The suite hits the live site (no server to boot). A full run is ~1 minute (serial by design).
A committed report is at `artifacts/report/index.html`.

## Test strategy (TL;DR)

- **Covered (8):** pills render on load · click "What is Permission" → valid answer (Part 2) ·
  free-text ASK → relevant answer · Shift+Enter = newline · empty/whitespace can't send · reply
  streams then settles · Log in / Sign Up entry points · mobile viewport stays usable.
- **The hard part:** responses stream and differ every run. I wait for a *stable end-state*
  (new bubble → text unchanged ~1.6s, typing indicator gone) and assert **shape, never text**:
  non-empty prose, on-domain keywords (any-of), no error markers, not an echo.
- **Skipped on purpose:** exact-text/snapshots (flaky by design), completing signup/auth (brief
  keeps automation pre-login), multi-browser matrix, perf/a11y — out of scope for 8 focused tests.

## Key decisions

- **Playwright + built-in HTML report** — best streaming auto-waits, native mobile emulation, one-
  command run, self-contained report. No page-object layer for 8 tests.
- **Assert invariants, not wording** — the only durable contract for a non-deterministic agent.
- **`waitForAgentReply()` settles on text-stability + the "typing" signal** (`tests/support/chat.ts`);
  no fixed sleeps or fixed strings.
- **Seed the app's greeting flag** so every test starts from the deterministic empty state where the
  pills render (discovered live — the flag is a JSON timestamp, not a boolean).
- **Automation stays strictly pre-login**; the UX review does the post-signup exploration.
- **`workers: 1`** — one real LLM call at a time is a good citizen and keeps waits deterministic.
- **Mobile via inline viewport override**, not a second project → exactly 8 test cases.
- **`retries: 1`** absorbs transient network blips; the waiting strategy carries the rest (3+ green
  runs).

## AI disclosure

See [`artifacts/ai-workflow.md`](artifacts/ai-workflow.md).

## Next steps (with 1–2 more days)

- Complete the **post-signup UX pass** and wire an authenticated smoke path (kept out of automation
  here on purpose).
- Add an **LLM-judge eval** (e.g. DeepEval) over a golden set of topics to grade relevance/faithful-
  ness — regression detection the keyword checks can't do.
- Put it in **GitHub Actions** (nightly + on PR), gate release on the 4 required behaviours, publish
  the HTML report as an artifact.

## Submission checklist

- [x] Repo named `sqa-homework-hassan-kazmi` and default branch is `main`
- [x] README includes exact Setup + run commands (verified from a clean clone)
- [x] README word count ≤ 500 (excluding commands/checkboxes)
- [x] Max 8 tests; all 4 required behaviours covered
- [x] `artifacts/assertions.md` included (≤ 300 words)
- [x] `artifacts/ux-review.md` included (≤ 400 words, desktop + mobile, post-signup)
- [x] `artifacts/data-checks.md` included (≤ 300 words + SQL)
- [x] `artifacts/ai-workflow.md` included (≤ 300 words, all 4 questions answered)
- [x] `artifacts/report/` included
- [ ] `artifacts/demo.mp4` included (60–90 sec, narrated) — **to record last**
- [x] Commit history shows how the work evolved
