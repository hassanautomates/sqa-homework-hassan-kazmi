# UX review — desktop + mobile

Method: Chromium at 1440×900 (desktop) and iPhone 13 responsive emulation (mobile). Screenshots in
`artifacts/screenshots/`. Pre-login is fully covered; **post-signup is pending a verified account**
(signup needs an email-verification link + reCAPTCHA I can't complete headlessly — see note).

## What works
Clean, legible chat. Stable `data-testid`s on the real controls. Answers stream with a clear
"Permission is typing…" state, render as tidy paragraphs, and end with a helpful follow-up question.
The ASK box is always reachable (pinned bottom) and the Shift+Enter hint is visible.

## What's rough
- **First-time visitors never see the suggested topics.** On a fresh session an auto-greeting fires
  and replaces the empty state; the pills only appear on a return visit. I had to suppress that
  greeting to see them at all.
- **Mobile truncates the topics.** Only ~2½ of 6 pills sit above the pinned input; the rest need a
  scroll users may not attempt (`mobile-01`).
- **Footer is broken on both.** Desktop clips the copyright line at the left edge; mobile overlaps it
  with the cookie button (`desktop-01`, `mobile-01`).
- **Signup is a bare wall.** `/register` asks for email + password with no restatement of the payoff
  (wallet + ASK rewards) and no wallet/social SSO despite being a web3 product.

## Prioritized improvements
Ordered by impact on the activation → signup funnel (the business's growth loop), then polish.

1. **Show suggested topics to first-time users.** *Observation:* the greeting hides them on the one
   visit that matters. *Why:* pills are the primary activation aid; burying them on first load costs
   engagement. *Change:* render the greeting as a header, not a message, so the pills stay visible.
2. **Sell the signup.** *Observation:* the wall gives no reason to finish. *Why:* it's the revenue
   gate. *Change:* restate "get a wallet + earn ASK" on `/register` and add one-tap wallet/Google SSO.
3. **Fix mobile topic visibility.** *Observation:* pills hidden behind the input. *Why:* mobile is
   where discovery breaks first. *Change:* a horizontal chip carousel or a scrollable list with
   bottom padding above the input.
4. **Repair the footer.** *Observation:* clipped/overlapping. *Why:* a data-trust product can't look
   broken. *Change:* padded, centered footer container; reserve a corner for the cookie FAB.

*(Post-signup pass to follow once the account is verified.)*
