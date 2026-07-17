# UX review — desktop + mobile

Method: pre-login on Chromium desktop + iPhone 13 emulation; post-signup on desktop (real account).
Screenshots in `artifacts/screenshots/`.

## What works
Clean, legible chat with stable `data-testid`s; replies stream with a "typing…" state. Post-login is
coherent: left nav (Agent, Data Enrichment Hub, Redeem, Referrals, Wallet), a visible ASK balance,
and a guided "pick interests → personalized offers" flow.

## What's rough
**Pre-login:** first-time visitors never see the suggested topics — an auto-greeting replaces the
empty state before the pills show (they only appear on a return visit). On mobile, only ~2½ of 6
pills sit above the pinned input. The footer clips at the left edge (desktop) and overlaps the cookie
button (mobile).
**Post-login:** you earn 100 ASK at signup, but the Wallet needs **4,900 more (5,000 total)** to
withdraw — "2% of the way" — while the on-chain wallet reads 0. Profile-complete then asks legal name,
phone, DOB and gender for "+100 ASK" with no explanation. The Data Enrichment Hub lists duplicate
interests ("Fashion"/"Style & Fashion", "Travel"/"Travel and Tourism"), and the same picker also
lives inside the agent chat. The pre-login conversation doesn't carry into the post-login session.

## Prioritized improvements
Ordered by impact on the earn → retain → refer loop (the business model), then conversion/trust, then
data quality, then polish.

1. **Make the reward feel real.** *Obs:* a 98%-to-go withdrawal wall the moment you join; balance is
   "pending", on-chain 0. *Why:* the whole pitch is "earn from your data" — this reads as "the rewards
   aren't real" and churns users. *Change:* show a time-to-threshold estimate, allow partial
   redemptions, and split "earned" from "withdrawable".
2. **Show suggested topics to first-time users.** *Obs:* the greeting hides them on the one visit that
   matters. *Why:* the pills are the primary activation aid. *Change:* render the greeting as a header
   so the pills persist.
3. **Justify the PII, and sell the signup.** *Obs:* bare `/register`, then name/phone/DOB/gender for
   +100 ASK, unexplained. *Why:* a *data-ownership* brand collecting heavy PII with no stated value
   exchange is both a conversion drop and an on-brand trust risk. *Change:* restate the payoff; say
   why each field is needed and how it's protected.
4. **Dedupe interests / unify onboarding.** *Obs:* overlapping categories; the picker appears twice.
   *Why:* dirty preference data and confusing IA. *Change:* one canonical interest list, one entry
   point.

Polish: fix mobile pill truncation and footer clipping.
