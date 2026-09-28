# Midday stack replacement (strangler) — implementation plan

> **Status:** **Deferred** — [Path A confirmed 2026-09-28](./path-a-decision.md): active work is in sibling `../clone`, not strangler wiring in this monorepo.  
> **Product lock:** Keep Midday dashboard UX (screens, flows, look). Replace API, auth, data, and jobs underneath. **No visual redesign** in this program.

## Goal

Run the existing **Midday Next.js dashboard** (`apps/dashboard`) as the product surface while incrementally moving backend concerns off Supabase + Hono/tRPC + Postgres (legacy) onto the **clean-room replacement stack** (Rust Axum REST API, JWT auth, SQLite/Postgres, local vault, mock banking/CSV), developed in sibling repo `../clone` until it is vendored or submodule-linked into this monorepo.

## Non-goals (now)

- Dashboard visual redesign, Tailwind/CSS churn, or route restructuring
- Replacing `@midday/ui`, Shadcn, or Next.js app router
- Mobile/desktop (Tauri/Expo) parity in first phases
- Full banking (Plaid/Teller/GoCardLess) — use CSV import + mocks for local parity
- Deleting legacy `apps/api` before feature-level cutover is proven

## Recommended architecture: strangler fig

| Layer | **Now (legacy)** | **Target (replacement)** | **During migration** |
|--------|------------------|---------------------------|----------------------|
| UI | `apps/dashboard` (unchanged UX) | Same | Same |
| Client data | tRPC → `NEXT_PUBLIC_API_URL` | tRPC adapter **or** selective REST bridge | Env `MIDDAY_BACKEND_MODE` |
| API | `apps/api` (Hono + tRPC) | `../clone` Rust `/api/v1/*` REST | Dual-run; route traffic by domain |
| Auth | Supabase session JWT | Replacement JWT (Argon2 + team scope) | Auth bridge phase (Phase 3) |
| DB | Supabase Postgres + `@midday/db` | Replacement schema (SQLite → Postgres) | No shared DB; sync via APIs only |
| Files | Supabase storage | Local vault (`VAULT_DIR`) | Proxy/download adapter |
| Jobs | Trigger.dev / worker | In-process or lightweight queue | Stub or redirect per job type |

**Why strangler (not big-bang):** Midday has dozens of tRPC routers; the clean-room API is REST-shaped. A full swap in one step breaks every screen. Strangler lets us keep UI stable while we add a **replacement client + tRPC façade** domain by domain.

### Alternatives considered

| Option | Verdict |
|--------|---------|
| **Revive `../clone` Vite UI** | Rejected for *now* — violates “same Midday dashboard UX” |
| **Rewrite dashboard on clone UI later** | Deferred to “visual redesign” phase |
| **Replace only `packages/db` in place** | Too coupled to Supabase RLS; doesn’t match clean-room JWT model |
| **Fork Midday and delete Supabase in one PR** | Too risky; no incremental verification |

## Repo layout (target)

```
midday/                          # This repo — UI + legacy API during migration
  apps/dashboard/                # KEEP — product surface
  apps/api/                      # LEGACY — shrink as domains migrate
  packages/replacement-backend/  # NEW — config, REST client, probes (Phase 1+)
  docs/plans/                    # This plan
../clone/                        # Clean-room Rust API (sibling until vendored)
  crates/api/                    # Replacement HTTP API
```

Later: move `clone/crates/api` → `midday/services/replacement-api` (submodule or copy) with clean-room checks.

## Keeping Midday UI as the surface

1. **Do not** change routes, layouts, or component styling except where required for auth/token shape.
2. **Do** keep `useTRPC()` call sites; migration happens in:
   - `apps/api` handlers delegating to replacement REST, **or**
   - a thin `packages/trpc-replacement-bridge` (Phase 2+) mapping procedures → REST.
3. Feature flags: `MIDDAY_BACKEND_MODE=legacy|dual|replacement` (server) controls delegation.

## Auth, DB, API, jobs, banking (local parity)

| Concern | Legacy | Replacement | Local dev |
|---------|--------|-------------|-----------|
| Auth | Supabase Auth | JWT (`/api/v1/auth/*`) | Dual: Supabase for UI login until bridge; replacement demo user for API tests |
| DB | Supabase Postgres | SQLite (`DATABASE_URL`) | Run clone API; Midday still uses Supabase until cutover |
| API | tRPC `/trpc` | REST `/api/v1` | `REPLACEMENT_API_URL=http://127.0.0.1:8787` |
| Jobs | Trigger.dev, worker | TBD minimal | Mock/no-op for non-critical paths |
| Banking | Plaid/Teller/etc. | CSV import | Clone `POST /api/v1/import/csv` |

## Phased execution

### Phase 1 — Wiring & observability (current)

**Deliverables**

- Plan document (this file)
- `@midday/replacement-backend`: mode config, health probe, minimal REST client
- Dashboard `GET /api/replacement/status` for dual-stack smoke
- `scripts/dev-replacement-api.sh` + root `dev:replacement-api` script
- Env documentation in `apps/dashboard/.env-example`

**Done when**

- With clone API running, `curl localhost:3001/api/replacement/status` reports `replacement.reachable: true`
- `bun run typecheck --filter=@midday/replacement-backend` passes
- Legacy dashboard dev unchanged when `MIDDAY_BACKEND_MODE=legacy` (default)

### Phase 2 — tRPC façade (first domain)

**Deliverables**

- Map **one read-heavy domain** (e.g. `overview` or `user.me`) in `apps/api` to call replacement REST when `MIDDAY_BACKEND_MODE=dual|replacement`
- Contract tests comparing legacy vs replacement responses (shape subset)
- Document procedure → REST mapping in `packages/replacement-backend/README.md`

**Done when**

- Overview (or chosen domain) loads from replacement API in dual mode with no UI changes
- Integration test green in CI for that domain

### Phase 3 — Auth bridge

**Deliverables**

- Server-side exchange: Supabase session **or** replacement login issues unified bearer for dashboard tRPC
- Team scope preserved in JWT claims

**Done when**

- User can log in through existing Midday login UI while API calls hit replacement backend

### Phase 4 — Data migration & domain cutover

**Deliverables**

- Per-domain cutover: transactions, inbox, invoices, customers, vault, tracker, reports, settings
- CSV/mock banking only until compliance review

**Done when**

- `MIDDAY_BACKEND_MODE=replacement` runs dashboard end-to-end without Supabase DB for app data

### Phase 5 — Decommission legacy

**Deliverables**

- Remove unused Supabase app tables usage, shrink `apps/api`, optional Postgres for replacement

**Done when**

- Clean-room check passes; no production dependency on Midday AGPL backend code paths you intend to replace (legal review)

## Deferred: visual redesign

After stack replacement reaches `replacement` mode for core domains, a **separate program** may:

- Re-skin dashboard or adopt clone CSS Modules shell
- Consolidate design tokens

Out of scope until Phase 4 exit criteria met.

## AGPL / clean-room licensing

- **This repo** is Midday (AGPL). Using it as the **UI shell** during migration is intentional; distributing a combined product may trigger AGPL obligations for the combined work.
- **Replacement API** in `../clone` is clean-room (no Midday source, no `@midday/*`, no Supabase/Tailwind in clone). Do not copy Midday server code into clone.
- **Do not** paste clone code into Midday packages without documenting origin and license compatibility.
- Before public release, run clone’s `scripts/clean_room_check.sh` and obtain legal review on AGPL + clean-room boundary.

## Risks & open decisions

| Risk | Mitigation |
|------|------------|
| tRPC ↔ REST impedance mismatch | Façade layer; versioned DTO mappers per domain |
| Two auth systems | Time-box Phase 3; avoid split-brain sessions |
| Supabase RLS assumptions in UI | Audit server components that bypass API |
| SQLite vs Postgres drift | Port replacement to Postgres before production |
| Scope creep (UI tweaks) | Explicit non-goals; PR checklist |

**Open decisions**

1. Vendoring clone as submodule vs `services/replacement-api` copy
2. First domain for Phase 2 (`overview` vs `transactions`)
3. Whether Supabase Auth remains for social login long-term

## References

- Sibling implementation index: `../clone/docs/superpowers/plans/2026-09-27-clone-umbrella.md`
- Clone design spec: `../clone/docs/superpowers/specs/2026-09-27-clone-design.md`
- Dashboard tRPC client: `apps/dashboard/src/trpc/client.tsx`
- Legacy API entry: `apps/api/src/index.ts`
