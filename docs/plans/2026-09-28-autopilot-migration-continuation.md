# Autopilot migration continuation

> **Purpose:** Let Cursor (or any agent) advance the Rust strangler **without** the user typing “continue” or approving every shell/git write.  
> **Sits on top of:** [Clean Rust replacement (no permanent proxy)](./2026-09-28-clean-rust-replacement-no-proxy.md) and the live queue in [Delegation inventory](./2026-09-28-delegation-inventory.md).

---

## Standing authorization (user grant)

When the user says **“run migration autopilot”**, **“autopilot”**, or points the agent at **this file**, treat the following as **pre-approved for the whole session** (and for background subagents working this plan):

| Action | Allowed |
|--------|---------|
| Read/search/edit code in `fintech/midday` and `fintech/clone` (API crates only in clone) | Yes |
| Run `bun test`, `cargo test`, smoke scripts (read-only on prod DB) | Yes |
| Stage & **commit** migration-related files on branch `cursor/backend-replace-ui-frozen-plans` | Yes |
| **Push** to remote `torksabig` (fork) | Yes |
| Update `docs/plans/2026-09-28-delegation-inventory.md` counts and “Next slice” | Yes |
| Spawn background subagents for the same plan | Yes |
| Change `apps/dashboard` UI or `fintech/clone/apps/web` (Vite Path A) | **No** |
| Commit `.env`, secrets, credentials | **No** |
| `git push origin` to `midday-ai/midday` (403 expected — do not ask user to fix each time) | Skip after one 403; use `torksabig` only |
| Force push, amend pushed commits, change git config | **No** |
| Delete `apps/api` / `packages/db` (Stage 4) | **No** until inventory ≥95% reads + writes and explicit user “decommission” |

**Do not** ask “should I commit?” or “should I continue?” between slices unless a **stop condition** (below) triggers.

---

## Non‑negotiable architecture (same as canonical plan)

- **`apps/dashboard`** — UI unchanged (no redesign).
- **`apps/api`** — temporary tRPC façade only; not a permanent Hono→Axum proxy.
- **`@midday/replacement-backend` + `MIDDAY_BACKEND_MODE`** — strangler glue; delete with `apps/api`.
- **`fintech/clone`** — target backend (Midday Postgres when `MIDDAY_DATABASE_URL` + Supabase JWT).
- **No** active Vite clone product UI (Path A).

---

## One autopilot iteration (= one slice)

Repeat until **stop condition** or queue empty.

```
1. git checkout cursor/backend-replace-ui-frozen-plans
2. Read delegation-inventory.md → "Autopilot queue" (pick top PENDING item)
3. If item already delegated in code, mark DONE in inventory and pick next
4. Implement slice:
   - Rust: Midday Postgres handler(s) in fintech/clone/crates/api
   - Midday: mappers + delegate + router wiring (dual fallback, replacement fail-closed)
   - Tests: replacement-backend mappers + delegation test pattern
5. cargo test -p clone-api; bun test packages/replacement-backend (+ affected apps/api tests)
6. Update inventory (counts, parity gaps, next queue row)
7. Commit midday (focused message); push -u torksabig HEAD
8. Commit clone API-only if changed (no apps/web unless user later opts in)
9. Log one-line summary: +N procedures, X/256 reads, W writes, SHAs
10. Immediately start next queue item (no user ping)
```

**Batch size:** Prefer **3–8 procedures** or **one write family** per iteration; do not attempt whole routers in one go.

---

## Autopilot queue (maintain in inventory)

The ordered backlog lives in [`2026-09-28-delegation-inventory.md`](./2026-09-28-delegation-inventory.md) under **Autopilot queue**. Agent **must** update status `PENDING` → `DONE` / `BLOCKED` each iteration.

Initial queue (seed — agent reorders if product needs change):

| Priority | Slice ID | Scope | Type |
|----------|----------|--------|------|
| 1 | AP-12 | `notifications.*` list/read procedures | read |
| 2 | AP-12b | `transactions.updateMany` | write |
| 3 | AP-12c | One inbox write: `update` or ignore/match (smallest) | write |
| 4 | AP-13 | `team.*` / `user.*` settings **reads** not yet delegated | read |
| 5 | AP-14 | Invoice mutations: draft create/update (one procedure) | write |
| 6 | AP-15 | `bankAccounts.getDetails` **only if** decrypt story documented | read |
| 7 | AP-16 | Remaining `oauth` / connection **reads** | read |
| 8 | AP-17 | Transaction create/delete (one each) | write |
| 9 | AP-18 | Inbox mutations batch (match, ignore, delete) | write |
| 10 | AP-19 | Parity hardening: FTS/`q`, activity feed on tx update | parity |
| 11 | AP-20 | Per-domain **delete Drizzle** for 100% delegated routers | delete |
| 12 | AP-STAGE3 | Rust workers sketch (replace `packages/jobs` producers) | infra |
| 13 | AP-STAGE4 | Remove `apps/api` + `replacement-backend` (gate: user says decommission) | delete |

---

## Stop conditions (ask user once, then pause autopilot)

- Need **production secrets** or real bank OAuth credentials not in `.env-template`.
- **Legal/licensing** question (AGPL distribution with proprietary backend).
- **Schema migration** that drops columns or irreversible data move.
- **Clone remote** missing and user wants cloud backup (offer to add remote — optional).
- Same slice **fails tests 3 times** — mark `BLOCKED` in inventory with reason.
- Inventory shows **≥90%** delegated — suggest human review before Stage 4 deletion.

---

## How to start (single message to agent)

Use any of:

```text
Run migration autopilot per docs/plans/2026-09-28-autopilot-migration-continuation.md until a stop condition. Do not ask me to continue between slices.
```

Optional: Cursor **Loop** on a timer (e.g. every 2h) with the same prompt — see project Loop skill if enabled.

---

## Repos & branch

| Repo | Path | Branch / notes |
|------|------|----------------|
| Midday | `fintech/midday` | `cursor/backend-replace-ui-frozen-plans` → push `torksabig` |
| Clone API | `fintech/clone` | `main`; commit **crates/api** only |

---

## Success metrics (report each iteration)

- **Reads:** `X / ~256` delegated (~%)
- **Writes:** `W` delegated (listed separately in inventory)
- **Midday SHA** pushed to fork
- **Clone SHA** (local)
- **Top 3 parity gaps** for last slice

---

## Related

- [Delegation inventory](./2026-09-28-delegation-inventory.md) — source of truth for what’s done
- [Clean Rust replacement](./2026-09-28-clean-rust-replacement-no-proxy.md) — stages 1–4 end state
