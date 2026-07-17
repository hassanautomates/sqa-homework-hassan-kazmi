# Validating a non-deterministic answer

Topic under test: **"What is Permission"** — `tests/permission-answer.spec.ts`. The check is
`assertValidAgentAnswer()` in `tests/support/assertions.ts`; `waitForAgentReply()`
(`tests/support/chat.ts`) settles the stream before I read anything.

## What I assert (invariants true of every reasonable answer)
- **It arrived and settled.** New assistant bubble appears; its text is unchanged ~1.6s with the
  "typing…" indicator gone — so I read the final answer, not a half-streamed frame.
- **It's real prose:** > 40 chars and > 8 words. Kills empty bubbles and one-word stubs.
- **It isn't the prompt echoed back.**
- **No failure markers:** none of "I ran into an issue" (the app's real error fallback),
  "something went wrong", "please try again", "failed to", "unable to…".
- **It's on-domain:** contains ≥ 1 of `permission / data / earn / privacy / wallet / reward / ASK /
  token` (any-of, case-insensitive). For this topic I add one check: the word "permission" appears.

## What I deliberately do NOT assert
- **Exact text, length, or sentence count** — regenerated every run; asserting it is the flaky trap.
- **Specific facts/numbers** (token amounts, chains, KYC) — that grades the model, not the app;
  content correctness belongs in a separate eval suite.
- **Latency or token timing** — non-deterministic; I wait on a stable end-state instead.
- **Ordering, or one mandated phrase** — over-fits a single sample.

## Why
The app's contract is to stream a coherent, on-topic, error-free answer into the DOM. I assert that
*shape* and refuse to assert wording — so the test passes on any good answer and fails on a blank,
errored, off-topic, or echoed one. Keyword lists are any-of and case-insensitive, so paraphrase can't
break them. Grading *meaning* at scale graduates to an LLM-judge / golden dataset, not more brittle
string matching here.
