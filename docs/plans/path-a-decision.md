# Decision: Path A confirmed 2026-09-28

**Chosen path:** Clean-room revival of sibling repo `fintech/clone` (../clone from this monorepo root) — Rust Axum API + Vite React (CSS Modules), Midday **UX parity** as reference only.

**Not active:** Strangler fig (Midday Next.js dashboard + `@midday/replacement-backend` wiring). That approach remains documented in [`2026-09-28-midday-stack-replacement.md`](./2026-09-28-midday-stack-replacement.md) for historical context but is **deferred** until Path A reaches production readiness.

## Implications

| Topic | Path A |
|--------|--------|
| Product surface | `clone/apps/web` |
| API | `clone/crates/api` at `http://127.0.0.1:8787` |
| Midday repo | Reference for screens/flows/look — **no** `@midday/*` in clone |
| Banking | CSV import + mocks only |
| Phase 1 / U1 | Clone foundation: local API + web dev, JWT + demo session, env/docs |

## Next units (clone umbrella)

- **U2:** Domain hardening / data seed polish (transactions, inbox CSV flows) per clone plans 02+
- **U3:** Assistant (OpenRouter optional), vault edge cases, Postgres portability when Docker available

## Midday repo hygiene

Uncommitted strangler wiring (replacement-backend transpile, dashboard env flags) should be **reverted or ignored** while Path A is active. Do not mix clone code into Midday packages without a documented license boundary review.
