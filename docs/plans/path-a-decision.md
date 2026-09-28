# Path A — historical note (superseded)

**Canonical plan:** [Clean Rust replacement — no permanent proxy](./2026-09-28-clean-rust-replacement-no-proxy.md) (2026-09-28)

## What was Path A?

Clean-room revival of sibling `fintech/clone` with **Vite React** as the product shell and Rust Axum API — Midday UX as reference only, no `@midday/*` in clone.

## Current strategy (active)

| Layer | Choice |
|-------|--------|
| **UI** | `apps/dashboard` (Next.js) — **frozen**; sync from Downloads baseline only |
| **Backend** | Full **Rust** replacement (`fintech/clone` Axum API); all business logic in Rust |
| **Cutover** | Temporary `apps/api` tRPC thin-fetch to Rust only until procedures move or dashboard calls Rust directly |
| **End state** | **Delete** Node stack (`apps/api`, `packages/db`, `packages/replacement-backend`, workers, legacy domain packages) |

Path A **Vite clone UI is not active** — clone is **API/backend only**, not the product shell.

## Deferred / archived

- Path A as product surface (`clone/apps/web`)
- Strangler fig with permanent dual-mode or `@midday/replacement-backend` bridge — see [enterprise strangler (archived)](./2026-09-28-enterprise-strangler-rust-migration.md) and [midday stack replacement](./2026-09-28-midday-stack-replacement.md) for history
