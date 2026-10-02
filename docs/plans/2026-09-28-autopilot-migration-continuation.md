# Autopilot migration continuation (superseded)

> **Superseded 2026-10-02.** The live autopilot for Midday→Rust is now **direct dashboard cutover**, not façade-delegation loops.

**Use this plan instead:** [2026-10-02-autopilot-direct-cutover.md](./2026-10-02-autopilot-direct-cutover.md)

That document includes standing authorization (implement → verify → commit+push both remotes without per-slice approval), Definition of Done, the remaining direct-cutover queue (DC-0…), STOP gates, cold-resume rules, and a paste-ready agent prompt.

Historical note: this file previously drove AP-12…AP-62 / AP-WORKER façade delegation on `MIDDAY_BACKEND_MODE`. Those inventory rows remain valid in [delegation-inventory.md](./2026-09-28-delegation-inventory.md); new work prefers marking procedures `direct Rust` via OpenAPI + dashboard clients.
