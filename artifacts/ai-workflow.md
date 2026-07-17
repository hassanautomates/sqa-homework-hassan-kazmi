# AI workflow

## Tools, and why
**Claude (Opus, via Claude Code in the terminal.)** I picked it over a chat window or Copilot because
it runs in the repo: it drives the shell and Playwright to *inspect the live site*, so selector and
waiting decisions came from real DOM/network output, not a model guessing markup it can't see.
Copilot autocomplete is slower for discovery-heavy work; a browser-less chatbot can't verify.

## Generated with AI vs. rewritten / corrected
AI generated: the Playwright scaffold, the throwaway discovery scripts, first-pass selectors and
helpers, and first drafts of these artifacts. I drove the judgment: which 8 tests earn their place,
keeping automation strictly pre-login, the assertion philosophy (shape not text), and the call to
seed the greeting flag. I corrected selectors and reworded the write-ups to be app-specific and cut
the filler.

## One thing the AI got wrong that I caught
The pills wouldn't render for automation. The AI's fix was to seed
`localStorage['undefined-auto-message-sent'] = 'true'` to skip the auto-greeting — and it silently
didn't work. Reading the value the app *actually* stores showed it's a JSON object
(`{"timestamp":…}`), not `"true"`; a string won't satisfy its check. Seeding the real shape fixed it.
Lesson: verify the assumption against the live app, don't trust the plausible guess. (It also put
`test.use(devices['iPhone 13'])` inside a `describe`, which throws on `defaultBrowserType`; I spread
only the emulation fields.)

## Built by hand / didn't trust AI with
The waiting strategy and the selectors — validated empirically against the streaming DOM over
repeated runs (3+ green passes) rather than accepting generated code. And every claim in the UX and
data write-ups is tied to something I actually observed on the site, not a generic best-practices
list.
