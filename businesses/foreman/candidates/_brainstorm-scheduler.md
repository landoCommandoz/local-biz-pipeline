# Brainstorm: Scheduler / tick orchestrator

*Brief: runs tick.js on declared cadence (Foreman 6h, Scout 24h, Builder 4h). Failures, retries, logging, restart-safe. $0 cost.*

Divergent list (13 considered):

1. **node-cron** — simple cron syntax, in-process, ~9k stars. MIT. Not restart-safe on its own (loses in-flight schedule state).
2. **croner** — modern cron lib, TS, weighs less than node-cron, handles DST. MIT. Growing adoption.
3. **bree** — job scheduler with worker threads, restart-safe via persisted schedule. MIT. Maintained by Forward Email.
4. **agenda** — MongoDB-backed cron. MIT. Requires MongoDB = not $0.
5. **bull / bullmq** — Redis-backed queue with cron. MIT. Requires Redis = not $0.
6. **agendash** — admin UI for agenda. Carries the MongoDB tax.
7. **pm2 cron** — process manager with cron-restart. AGPL-3.0. License fails the standard.
8. **systemd timers** — OS-level. Free. Works only on Linux, ties the yard to one host.
9. **GitHub Actions scheduled workflows** — free tier, cron in a yaml. Proprietary but free for public repos, limited for private. Workable fallback.
10. **Netlify Scheduled Functions** — free tier includes scheduled invocations. Proprietary but already in the stack.
11. **Cloudflare Workers Cron Triggers** — free tier, worker-based cron. Proprietary but free.
12. **Hand-rolled setInterval with JSON state file** — no deps, restart-safe if state is persisted. Most aligned with Brewington "build small" ethos.
13. **toad-scheduler** — lightweight in-process scheduler, MIT, maintained.

Shortlist (top 3 for full dossier):
- **croner** — tiny, modern, pure cron syntax, zero deps, actively maintained
- **bree** — heavier but restart-safe out of the box, worker-thread isolation is a plus
- **Netlify Scheduled Functions** — already free in the stack, zero additional infra, matches existing deploy target

Dropped:
- node-cron (older, croner is a direct upgrade)
- agenda / bull (require DB = not $0)
- pm2 (AGPL, auto-reject)
- systemd (host-locked)
- GitHub Actions (fine but awkward to invoke long-running Node scripts)
- Cloudflare Workers (fine but introduces a new runtime; Netlify already in-stack)
- Hand-rolled setInterval (could replace, but duplicates what croner does)
- toad-scheduler (credible but smaller community than croner)
