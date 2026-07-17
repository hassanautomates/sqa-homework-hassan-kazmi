# Data-layer reasoning

Inferred only from what the pre-login agent and the signup flow expose. Names are my own.

## What I'd expect to be written

**(a) Sending a message (pre-login = anonymous).** No account exists, yet the thread persists within
a tab, so an anonymous handle ties the turns together. The `/api/agent/ask-unauthenticated` call
writes a **user** row and, after streaming, an **assistant** row.
- `anonymous_sessions(id, client_id, user_agent, created_at)`
- `conversations(id, anon_session_id → anonymous_sessions, user_id NULL pre-login, channel 'ask_unauthenticated', created_at)`
- `messages(id, conversation_id → conversations, role 'user'|'assistant', content, model, token_count, status 'complete'|'error', created_at)`
- `suggested_topics(id, title, prompt, for_authenticated, enabled, sort_order, ...)` — seen verbatim in the suggestions API.

**(b) Creating an account.** Email + password → "we'll send you a verification email"; the agent also
says a custodial wallet is provisioned on signup.
- `users(id, email UNIQUE, password_hash, email_verified_at NULL until confirmed, created_at)`
- `email_verifications(user_id, token, sent_at, consumed_at)`
- `wallets(id, user_id → users, custodial true, address, created_at)` — one per user
- `ask_balances(user_id, amount, updated_at)` / `ask_ledger(...)` for earned rewards

## Verification queries

```sql
-- 1. Message write path is consistent: no orphan messages, and every user turn gets a reply.
SELECT m.id
FROM messages m
LEFT JOIN conversations c ON c.id = m.conversation_id
WHERE c.id IS NULL                                        -- orphaned message
   OR (m.role = 'user' AND NOT EXISTS (                   -- user turn with no assistant reply
        SELECT 1 FROM messages r
        WHERE r.conversation_id = m.conversation_id
          AND r.role = 'assistant'
          AND r.created_at >= m.created_at));

-- 2. Signup integrity: unique verified email, exactly one wallet, sane timestamps.
SELECT u.id, COUNT(w.id) AS wallets
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
WHERE u.email_verified_at IS NOT NULL
  AND (u.created_at > now() OR u.email_verified_at < u.created_at)  -- impossible times
GROUP BY u.id
HAVING COUNT(w.id) <> 1;                                  -- missing or duplicate wallet

-- 3. No successful assistant message is empty or unpriced.
SELECT id FROM messages
WHERE role = 'assistant' AND status = 'complete'
  AND (content IS NULL OR btrim(content) = '' OR token_count IS NULL);
```

## Downstream pipeline integrity check
Reconcile the analytics `fact_messages` table against source: **row count per day and
`COUNT(DISTINCT message_id)` must equal `messages`** for that window (catches dropped/duplicated rows
from the ETL), plus a not-null/uniqueness gate on `message_id`. Fail the load if they diverge.
