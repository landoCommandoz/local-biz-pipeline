# Brainstorm: Monitoring + alerting

*Brief: watch tick freshness, failures_in_row, budget burn. Integrate with ../twilio-whatsapp.js. $0 cost.*

Divergent list (12 considered):

1. **healthchecks.io self-hosted (OSS)** — dead-man-switch cron monitoring. BSD-3. Requires own host or Docker, free SaaS tier (20 checks) available.
2. **uptime-kuma** — self-hosted uptime monitor. MIT. Free SaaS tier exists on some providers, but self-host requires a host.
3. **Statping-ng** — status page + monitoring. Apache-2.0. Heavier than brief.
4. **Gatus** — YAML-defined uptime checks. Apache-2.0. Lightweight, can alert Twilio.
5. **cabot** — legacy alert tool. MIT. Low activity.
6. **sensu-go** — enterprise monitoring. MIT (agent) / proprietary. Overkill.
7. **Prometheus + Alertmanager** — industry standard. Apache-2.0. Needs a scrape target and host, heavy.
8. **Netdata** — real-time infra monitoring. GPL-3.0. License fails.
9. **Hand-rolled watchdog tick** — a foreman-owned watchdog.js that runs every 15min, reads each state.json, compares last_tick_at + failures_in_row against thresholds, calls existing twilio-whatsapp.escalate. Zero external deps.
10. **healthchecks.io SaaS free tier** — 20 free checks, email + webhook alerts. Proprietary but free at our scale.
11. **BetterUptime free tier** — 10 monitors, proprietary.
12. **cronitor.io free tier** — 5 free monitors. Proprietary.

Shortlist (top 3 for full dossier):
- **Hand-rolled watchdog.js** — zero deps, reads state.json files directly, uses existing twilio-whatsapp.js, matches Brewington "build small" ethos
- **Gatus** — YAML-defined checks, Twilio-compatible via webhook alerts, Apache-2.0, lightweight
- **healthchecks.io self-hosted (OSS)** — proven dead-man-switch pattern, BSD-3, can skip self-host by using their free SaaS while infra is flat

Dropped:
- uptime-kuma (more geared to HTTP uptime than state-file freshness)
- Statping-ng / sensu / Prometheus (heavy)
- cabot (stale)
- Netdata (GPL auto-reject)
- SaaS free tiers other than healthchecks (proprietary, not principle-aligned when a self-hosted option exists)
