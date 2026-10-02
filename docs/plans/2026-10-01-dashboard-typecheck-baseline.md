# Dashboard Typecheck Baseline

Captured: 2026-10-01 15:43:45 EEST

Command:

```sh
bun run --filter=@midday/dashboard typecheck
```

Current result:

- Exit code: `2`
- TypeScript errors: `1283`

Use this as a temporary regression gate while the dashboard type surface is being repaired. A migration slice should not increase this count. For touched files, also check directly that no errors mention the changed files.

For the notifications direct-Rust slice, this targeted check returned no errors:

```sh
bun run --filter=@midday/dashboard typecheck 2>&1 | rg "src/hooks/use-notifications|src/lib/rust-api/notifications" || true
```

For the notification settings direct-Rust slice on 2026-10-02, the full error
count was `1269` and this targeted check returned no errors:

```sh
bun run --filter=@midday/dashboard typecheck 2>&1 | rg "notification-settings|notification-setting|NotificationSettings|NotificationSetting" || true
```

For the transaction categories direct-Rust slice on 2026-10-02, the full error
count was `1263` and this targeted check returned no errors:

```sh
bun run --filter=@midday/dashboard typecheck 2>&1 | rg "transaction-categories|select-category|select-parent-category|categories/table|transaction-create-form|transaction-edit-form|transactions-search-filter|transactions/categories/page" || true
```

For the bank accounts direct-Rust read slice on 2026-10-02, the full error
count improved to `1259`. The only bank-account targeted hit outside touched files was
the pre-existing `add-bank-accounts-modal` provider response typing:

```sh
bun run --filter=@midday/dashboard typecheck 2>&1 | rg "bank-accounts|select-account|bank-account-list|manual-accounts|transaction-create-form|transaction-edit-form|field-mapping|settings/accounts/page|transactions-search-filter" || true
```
