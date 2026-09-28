# @midday/replacement-backend

Strangler-pattern helpers for routing Midday dashboard traffic to the clean-room replacement API (`../clone`).

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `MIDDAY_BACKEND_MODE` | `legacy` | `legacy` \| `dual` \| `replacement` |
| `REPLACEMENT_API_URL` | `http://127.0.0.1:8787` | Replacement API base URL |

## Smoke

With clone API running (`bun run dev:replacement-api` from monorepo root) and dashboard in `dual` mode:

```bash
curl -s http://localhost:3001/api/replacement/status | jq
```

Phase 2 will add tRPC → REST delegation in `apps/api` using this client.
