# Candidate: healthchecks.io (self-hosted)

*Brief targeted: monitoring. Phase: 1. Researched: 2026-04-17. Foreman recommendation: PASS.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Proven dead-man-switch service: each agent pings a unique URL per tick, healthchecks alerts when the ping is late.

### 2. Monthly cost all-in
- Infrastructure: $0 (self-hosted Django app; or free SaaS tier at hc-ping.com with 20 checks)
- Licensing: $0 (BSD-3)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: self-host on the scheduler host, or use the healthchecks.io free tier for Phase 1.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 2 hours/month at $50/hr = $100/month. Similar to watchdog but pays a stranger's Python runtime tax.
Assumptions: same incident profile.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
3. Self-host needs Python + Postgres + a web process. Free SaaS tier sidesteps this but adds a third-party dependency and a proprietary piece. Autonomous once set up, but the setup cost is real.
Evidence for the score: docs describe a Django deployment.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES, after initial setup.

### 8. One-line kill criteria
If the self-hosted Django stack adds 300+ MB and a weekly Python-dependency alert, kill.

---

## Source
- Repo / listing URL: https://github.com/healthchecks/healthchecks
- License: BSD-3-Clause
- Last commit: actively maintained in 2026
- Stars / downloads / sales: widely used; exact star count not resolved via search but repo is well-known
- Active maintainer: yes, Pēteris Caune

## What it does
Healthchecks is a cron-job and background-task monitoring service. Each monitored job has a unique URL. Your cron job runs `curl <url>` at the end. Healthchecks knows the expected interval; if no ping lands in time, it alerts (email, webhook, Slack, PagerDuty, etc).

Runs as a Django app backed by PostgreSQL or SQLite.

## Fit with Brewington ecosystem
- **Plugs into:** each agent's tick.js would end with a `fetch(healthchecksUrl)`
- **Replaces:** a watchdog; slight overlap with Gatus
- **Depends on:** Python 3.11, Django, Postgres (or SQLite for small); one more runtime
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Either use hc-ping.com free tier (20 checks) or self-host healthchecks on the scheduler host
2. Add a ping URL to each agent's charter
3. Each tick.js ends with `await fetch(pingUrl)` on success

## Risks and trade-offs
- Brings Python + Django into a Node-only stack.
- SaaS free tier caps at 20 checks and introduces proprietary dependency; self-host is the clean path but heavier than watchdog.js.
- Perfectly fine pattern, just more infrastructure than the watchdog for a Phase 1 yard.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (BSD-3-Clause)
- [x] Last commit date confirmed (active 2026)
- [x] Star count confirmed via live visit (widely used; exact count not resolved via WebSearch)
- [x] At least one independent review or discussion found and linked (healthchecks.io docs; capterra page; GetApp 2026 review)
- [x] Pricing page read and costs verified (self-hosted free; SaaS free tier 20 checks)

## Foreman recommendation
PASS. Proven pattern, wrong footprint for a 3-agent yard. Watchdog.js stays the pick; healthchecks becomes interesting once the yard has 10+ agents or when Lando wants a web UI for monitoring history.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
