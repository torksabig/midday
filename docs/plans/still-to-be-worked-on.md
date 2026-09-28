# Still to be worked on

As of midday tip `5faccdd43` / AP-61, totals were 96 reads / 109 writes; `documents.processDocument` SQL was delegated in AP-60; `team.create` and `oauthApplications.authorize` were the remaining hybrids and may be in progress on a later commit.

## Blocked (secrets, mail, or admin APIs)

- Bank decrypt: `bankAccounts.getDetails`, `bankAccounts.getWithPaymentInfo`
- Bank encrypt: `bankConnections.create`, `bankConnections.addAccounts`
- `user.delete` (Supabase admin plus Resend)
- `apiKeys.upsert` and other Resend sends

## External (provider, OAuth, Stripe, or a job with no SQL left to move)

- Bank and inbox OAuth token exchange
- Connector OAuth
- `accounting.getAccounts`
- Stripe billing and payments
- Job-only export and AI CSV mapping
- BullMQ `jobs.getStatus`
- Storage signed URLs
- `team.create` and `documents.processDocument` (heavy compose; the SQL slices around them are already delegated)
