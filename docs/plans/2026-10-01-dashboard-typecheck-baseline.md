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
