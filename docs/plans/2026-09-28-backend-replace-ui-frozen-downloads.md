# Backend replacement with UI frozen (Downloads baseline)

> **Canonical UI baseline:** `/Users/teodor/Downloads/midday-main-main`  
> **Active git monorepo (migration workspace):** `/Users/teodor/Library/Mobile Documents/com~apple~CloudDocs/Desktop/MAIN AI/fintech/midday`  
> **Supersedes for this goal:** [Path A](../path-a-decision.md) (Vite clone UI) — keep clone API as optional replacement backend only, not as product surface.

## Locked product constraints

1. **Do not** change dashboard look, routes, layouts, or component styling except where auth/token plumbing requires it.
2. **Do** replace backend implementation: API, persistence, auth server, jobs, banking integrations, Supabase-centric data path.
3. Treat Downloads copy as the **UI source of truth** until workspace dashboard is byte-synced to it.

## Monorepo map (Downloads / upstream Midday)

| Area | Path | Role |
|------|------|------|
| Product UI | `apps/dashboard/` | Next.js 16 app — **FROZEN** (routes, components, hooks calling tRPC) |
| Design system | `packages/ui/` | Shadcn/Tailwind primitives — **FROZEN** |
| UI-adjacent shared | `packages/invoice/`, `packages/inbox/` (editor/templates), `packages/app-store/`, `packages/mcp-apps/`, `packages/desktop-client/`, `packages/location/`, `packages/utils/`, `packages/plans/` | Used by dashboard — **FROZEN** unless backend forces type-only fixes |
| tRPC client wiring | `apps/dashboard/src/trpc/*`, `packages/trpc/` | Thin client — **stable URLs/types**; env may change |
| Server actions / BFF | `apps/dashboard/src/actions/`, `apps/dashboard/src/app/api/*` | Mixed Supabase + tRPC — **replace Supabase calls in phases**, keep route paths |
| Legacy API | `apps/api/` | Hono + tRPC (`AppRouter`) — **REPLACE** (shrink → delete) |
| Background | `apps/worker/`, `packages/jobs/`, `packages/job-client/` | BullMQ / Trigger — **REPLACE** |
| Data & auth infra | `packages/db/`, `packages/supabase/`, `supabase/` | Drizzle + Supabase — **REPLACE** with new DB + auth adapter |
| Domain services (API-only) | `packages/banking/`, `packages/accounting/`, `packages/categories/`, `packages/connectors/`, `packages/documents/`, `packages/notifications/`, `packages/encryption/`, `packages/cache/`, `packages/import/`, `packages/customers/`, `packages/events/`, `packages/bot/`, `packages/health/`, `packages/email/` | Consumed by `apps/api` — **REPLACE or re-home** in new backend repo |
| Marketing | `apps/website/` | Out of scope unless linked auth |
| Desktop | `apps/desktop/` | Phase 2+ (same API contract) |

### UI boundary (what must not change)

**Freeze (no visual/IA edits):**

- `apps/dashboard/src/app/[locale]/**` — all pages and layouts
- `apps/dashboard/src/components/**`
- `apps/dashboard/src/hooks/**` (except new backend-only hooks behind flags)
- `packages/ui/**`
- Dashboard-local stores under `apps/dashboard/src/store/**`
- Global styles: `packages/ui/src/globals.css`, dashboard `tailwind` config consumption

**Allowed to change (no UX redesign):**

- `apps/api/**` → new backend or tRPC façade
- `packages/db/**`, `packages/supabase/**`, `supabase/**`
- `apps/worker/**`, `packages/jobs/**`
- Env: `NEXT_PUBLIC_API_URL`, auth secrets, `MIDDAY_BACKEND_MODE`, `REPLACEMENT_API_URL`
- `apps/dashboard/src/trpc/**` — headers/cookies for new JWT only
- `apps/dashboard/src/actions/**` and `app/api/**` — swap Supabase → replacement auth/session
- New package: `packages/replacement-backend/` (REST probe + mode config)
- Optional: `apps/dashboard/src/app/api/replacement/status/route.ts` (observability only)

### Data flow today (replacement touchpoints)

```
Browser → apps/dashboard (Next)
  ├─ Supabase Auth (login, MFA, session)     ← Phase 3 auth bridge
  ├─ tRPC → NEXT_PUBLIC_API_URL/trpc         ← Phase 2+ delegation
  └─ Realtime (Supabase)                     ← Phase 4+ or drop with polling

apps/api (Hono)
  ├─ tRPC routers (~40 domains)              ← contract to preserve or shim
  ├─ REST / OpenAPI routes
  └─ packages/db + Supabase service role
```

Dashboard types import `AppRouter` from `@midday/api/trpc/routers/_app` — **preserve this contract** until cutover completes (temporary tRPC in `apps/api` that fetches Rust, or dashboard-native Rust client later).

## Strategy: clean Rust replacement (not permanent strangler)

Prefer the [**clean Rust replacement plan**](./2026-09-28-clean-rust-replacement-no-proxy.md): one Rust backend for all business logic, **temporary** `apps/api` tRPC boundary only, **delete** Drizzle/legacy TypeScript per domain as soon as Rust owns that router. No long-lived `@midday/replacement-backend` or `MIDDAY_BACKEND_MODE` dual forever—those exist only as optional short-term cutover aids already in the repo.

| Phase | Focus |
|-------|--------|
| **0** | Baseline: sync workspace UI to Downloads; env + health probe |
| **1** | Supabase JWKS on Rust; session bearer passthrough; first domains (`user`, `team`) + immediate legacy delete |
| **2** | Domain loop: implement Rust → swap tRPC fetch → delete `packages/db` usage for that domain |
| **3** | Rust workers + connectors; retire `apps/worker` / `packages/jobs` |
| **4** | Delete `apps/api`, `packages/replacement-backend`, remaining legacy packages; final tree: `dashboard`, `clone`, `packages/ui` |

**Why not big-bang:** ~40 tRPC routers and Supabase usage across dashboard BFF routes; one cutover breaks every screen—use the **3-step domain protocol** in the canonical plan instead.

**Why not Path A clone UI:** User goal requires **identical** Midday Next dashboard, not Vite reimplementation.

**Deprecated (archived):** Permanent façade-first strangler — [enterprise strangler doc](./2026-09-28-enterprise-strangler-rust-migration.md).

## Recommended single approach

1. **Initialize git** in Downloads **or** copy Downloads → `fintech/midday` dashboard/packages/ui (reset local UI diffs).
2. **Develop new backend** outside AGPL shell (proprietary OK) exposing REST (+ optional tRPC compatibility layer).
3. **Keep** `apps/dashboard` + `packages/ui` in the Midday monorepo; **swap** everything that serves data.

Workspace `fintech/midday` is the practical migration repo (already has git + Phase 0 `replacement-backend`); **Downloads remains the diff target for UI parity checks** (`diff -rq` on `apps/dashboard` and `packages/ui`).

## Workspace vs Downloads (2026-09-28)

| | Downloads | fintech/midday |
|--|-----------|----------------|
| Git | No `.git` | Yes |
| UI | Reference (e.g. `password-sign-in.tsx`, login/layout baseline) | Diverged: login, sidebar layout, `new-user-gate`, strangler route |
| Backend extras | None | `packages/replacement-backend`, `apps/dashboard/src/app/api/replacement/` |
| Local env/build | Clean tree | `.env`, `.next`, `node_modules` |

**Action:** Before backend work, `rsync` or merge Downloads → workspace for `apps/dashboard` and `packages/ui` only; keep replacement wiring in workspace.

## Frontend status (2026-10-06)

**Parity check:** `bash scripts/diff-ui-baseline.sh` (baseline: `~/Downloads/midday-main-main`, override via `MIDDAY_UI_BASELINE`).

| Tree | Differ | Only in workspace | Only in baseline |
|------|--------|-------------------|----------------|
| `apps/dashboard` | **229** files | `.env`, `next-env.d.ts`, `src/app/api/replacement/**`, `src/lib/rust-api/**` (~110 files), hybrid helpers (`fetch-invoice-pdf.ts`, `files-api-url.ts`, `invoice-hybrid-flows.ts`, `invoice-create-from-tracker-compose.ts`, `team-category-seed.ts` + tests), `src/utils/new-user-gate.test.ts` | — |
| `packages/ui` | **1** file (`multiple-selector.tsx`) | — | — |

**Only in baseline (workspace missing — restore if parity required):**

- `(sidebar)/upgrade/page.tsx`
- `components/password-sign-in.tsx`, `app-sunset-banner.tsx`, `sunset-banner.tsx`

### Intentional vs drift

| Category | Approx. count | Examples | Verdict |
|----------|---------------|----------|---------|
| **Direct Rust cutover wiring** | ~211 differing files | `layout.tsx` prefetches `lib/rust-api/*-server`; pages/components/hooks swap `trpc.*` → `*-client` / server query options; preserve React Query keys | **Intentional** — required for [autopilot direct cutover](./2026-10-02-autopilot-direct-cutover.md); **do not** blind `rsync` from Downloads |
| **Replacement / env / tooling** | handful | `.env-example` (`NEXT_PUBLIC_RUST_API_URL`, `MIDDAY_BACKEND_MODE=replacement`), `package.json` (`generate:rust-api`, `@midday/replacement-backend`), `app/api/replacement/status` | **Keep** |
| **Hybrid / BFF helpers** | ~10 new files under `src/lib/` | invoice PDF, files URL, tracker→invoice compose, hybrid flows | **Keep** |
| **Auth / login IA drift** | 1 page + related | `login/page.tsx` — workspace is OTP-only; baseline has OAuth accordion, password sign-in, preferred-provider cookies | **Unintentional UX drift** — restore from baseline (keep `new-user-gate` behavior if still needed) |
| **Upstream-only UI** | 3 components + 1 route | sunset banners, `upgrade` route, `password-sign-in.tsx` | **Drift (missing)** — copy from baseline unless product explicitly dropped them |
| **packages/ui** | 1 | `multiple-selector.tsx` — keeps creatable list open while typing in sheets | **Behavior fix** — accept in workspace or cherry-pick into baseline copy later; not a visual redesign |
| **Misc non–rust-api diffs** | ~14 | `otp-sign-in.tsx`, `new-user-gate.ts`, `upload.ts`, `use-realtime.ts`, export/invoice hybrid UI | Review per file — mostly cutover/hybrid, not styling |

**Heuristic used:** among differing dashboard files, ~211 reference `rust-api` / Rust client patterns; ~18 do not (login IA, hybrids, utils, one UI primitive).

### Recommended next frontend action

**Do not mass-rsync** `apps/dashboard` or `packages/ui` from Downloads — that would overwrite ~211 Rust client call sites and delete `src/lib/rust-api/**`.

1. **Accept drift** for Rust-direct wiring (current workspace is ahead of baseline for data path).
2. **Selective baseline restore** (copy-only, no redesign):
   - `src/app/[locale]/(public)/login/page.tsx` + restore `password-sign-in.tsx` if login page imports it
   - Optional: `upgrade/page.tsx`, `app-sunset-banner.tsx`, `sunset-banner.tsx` if product should match upstream
3. **Preserve after any sync** (never overwrite from baseline):
   - `apps/dashboard/src/app/api/replacement/**`
   - `apps/dashboard/src/lib/rust-api/**` and hybrid modules listed above
   - `apps/dashboard/.env-example` replacement/Rust entries (merge baseline Supabase vars, don’t drop `NEXT_PUBLIC_RUST_API_URL`)
4. **QA:** With Rust on `:8787` and residual Node on `:3003`, smoke login (after restore), sidebar layout, transactions, inbox, invoices — compare to baseline only where IA was restored.

### Sync plan (if executing selective restore)

```bash
BASE="${MIDDAY_UI_BASELINE:-$HOME/Downloads/midday-main-main}"
WS="/path/to/fintech/midday"

# Example: login parity only (adjust list after review)
cp "$BASE/apps/dashboard/src/app/[locale]/(public)/login/page.tsx" \
   "$WS/apps/dashboard/src/app/[locale]/(public)/login/page.tsx"
cp "$BASE/apps/dashboard/src/components/password-sign-in.tsx" \
   "$WS/apps/dashboard/src/components/password-sign-in.tsx"

# Re-run parity check
bash "$WS/scripts/diff-ui-baseline.sh" | tee /tmp/ui-baseline-diff.txt
```

**Full-tree rsync (destructive — list before running):** would replace essentially all of `apps/dashboard/src/{app,components,hooks}` and most of `src/actions` except paths you `--exclude` after backing up `lib/rust-api`, `app/api/replacement`, and hybrid `src/lib/*` files above.

### Local dashboard dev (documented in repo)

| Source | Command / port |
|--------|----------------|
| `apps/dashboard/package.json` | `bun run dev` → `next dev -p 3001 --turbopack` (TZ=UTC) |
| Root `package.json` | `bun run dev` → `turbo dev --parallel` (all apps) |
| `apps/dashboard/README.md` | Stub only — no setup steps |
| Upstream | [docs.midday.ai](https://docs.midday.ai) (linked from root README) |

Do not assume Supabase/Rust/API are running; use `.env-example` + sibling `clone` API for Rust cutover QA.

**Branch / HEAD (audit):** `cursor/backend-replace-ui-frozen-plans` @ `84184e01c` (2026-10-06 pass; no frontend code changes in this audit).

## Phase 0 checklist (minimal)

- [x] Add to dashboard `.env-example`: `MIDDAY_BACKEND_MODE`, `REPLACEMENT_API_URL`
- [x] Port `packages/replacement-backend` + `/api/replacement/status` from workspace (no UI changes)
- [x] CI/script: `scripts/diff-ui-baseline.sh` — `diff` dashboard+ui against Downloads (`MIDDAY_UI_BASELINE` override)
- [x] REST OpenAPI `:3003` — documents list/get/delete + vault presigned-url delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — inbox list/get/patch/delete delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — inbox create/match/unmatch/confirm/decline/blocklist/search/by-status/bulk-delete delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — transactions list/get/create/update/delete/bulk-create delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — customers list/get/create/update/delete delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — invoices list/get/summary/payment-status/create/update/delete delegate to Rust in `replacement` mode; create/send uses Node BullMQ only (2026-10-05)
- [x] REST OpenAPI `:3003` — teams list/get/update/members delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — tags list/get/create/update/delete delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — search global (`GET /search`) delegates to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — reports chart reads (`GET /reports/*` six routes) delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — notifications list/status/update-all delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — bank-accounts list/get/create/update/delete delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — tracker-projects + tracker-entries (incl. bulk create) + timer routes delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI `:3003` — users `GET/PATCH /me` delegate to Rust in `replacement` mode (2026-10-05)
- [x] REST OpenAPI phase closure — bulk-route clone audit + oauth/mcp inventory + `replacement-rest-*.test.ts` green (2026-10-05)
- [ ] Legal review (below)

### REST OpenAPI product migration status (2026-10-05)

| Status | Routes / areas |
|--------|----------------|
| **Rust in `replacement` mode** | documents, inbox (full OpenAPI), transactions (CRUD + create/update/delete-many incl. bulk create), customers, invoices (SQL + hybrid create jobs), teams, tags, search, reports (×6), notifications, bank-accounts, tracker-projects, tracker-entries (incl. bulk create) + timer, users `/me`, presigned-url helpers |
| **Drizzle blockers (need clone)** | _(none for REST OpenAPI product scope)_ |
| **Permanent Node / STOP** | `/oauth/*`, `/.well-known/*`, `/mcp`, app OAuth callbacks, `GET /files/download/invoice` (React-PDF), REST auth/db middleware |

**Tests:** `cd apps/api && bun test src/__tests__/rest/replacement-rest-*.test.ts` → **81 pass**, 14 files (after tracker-entries bulk-create slice).

**Remaining Drizzle REST in `replacement` mode:** oauth/mcp/PDF/middleware as listed.

## Env reference

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Legacy tRPC base (default `http://localhost:3003`) |
| `MIDDAY_BACKEND_MODE` | `legacy` \| `dual` \| `replacement` |
| `REPLACEMENT_API_URL` | New backend base (e.g. `http://127.0.0.1:8787`) |
| Supabase vars | Until auth Phase 3 complete |

## AGPL / licensing note

Midday is **AGPL-3.0** ([LICENSE](file:///Users/teodor/Downloads/midday-main-main/LICENSE)). Using the dashboard and `@midday/ui` as a networked product shell with a **proprietary backend** may trigger AGPL obligations on the **combined work** when users interact with it over a network.

Practical mitigations (require legal counsel):

- Keep AGPL UI code in a separate repo/package; link via API only; offer corresponding source for the AGPL portions.
- Contribute AGPL-compatible changes upstream when modifying Midday UI code.
- Do **not** assume proprietary backend alone isolates you from copyleft on modified Midday frontend code.

## First implementation steps

1. **Sync UI baseline:** From Downloads, reset `fintech/midday/apps/dashboard` + `packages/ui` (preserve only `app/api/replacement` and env docs).
2. **Phase 0 wiring:** Ensure `replacement-backend` + `GET /api/replacement/status` and `.env-example` entries; run dashboard with `MIDDAY_BACKEND_MODE=dual`.
3. **Inventory tRPC:** Generate procedure list from `apps/api/src/trpc/routers/_app.ts`; prioritize `user`, `team`, `transactions`, `inbox`, `invoice` for first delegation to new backend.

## Related docs

- **Canonical migration:** [Clean Rust replacement — no permanent proxy](./2026-09-28-clean-rust-replacement-no-proxy.md) — architecture, 4-stage deletion table, 3-step domain protocol, final tree (`dashboard`, `clone`, `packages/ui`).
- Archived strangler: [2026-09-28-enterprise-strangler-rust-migration.md](./2026-09-28-enterprise-strangler-rust-migration.md) — superseded; kept for historical CDC/shadow-read notes only.
- Deferred outline: [2026-09-28-midday-stack-replacement.md](./2026-09-28-midday-stack-replacement.md)
- Path A (clone UI): [path-a-decision.md](./path-a-decision.md) — not aligned with frozen Midday UI goal
