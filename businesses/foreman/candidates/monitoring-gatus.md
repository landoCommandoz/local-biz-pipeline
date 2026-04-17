# Candidate: Gatus

*Brief targeted: monitoring. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HOLD.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
YAML-defined health checks on the agent state endpoints plus a status page, with Twilio alerts already baked in.

### 2. Monthly cost all-in
- Infrastructure: $0 (self-hosted on the existing Node host or a free VPS; ~40 MB RAM at 50 endpoints)
- Licensing: $0 (Apache 2.0)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: self-hosted on whatever host runs the scheduler; 3-10 endpoints.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 3 hours/month at $50/hr = $150/month. Slightly higher than watchdog because of the status page, slightly lower because of setup overhead.
Assumptions: same incident profile.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. YAML config, web UI, Twilio webhook — once configured it runs. Deduction because Gatus is Go + Docker-style, introducing a runtime Brewington currently does not use.
Evidence for the score: README shows config-as-code, no operator UI required.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES, assuming Lando tolerates a Docker container on the host.

### 8. One-line kill criteria
If Docker/Go toolchain adds more than 100 MB of host footprint or a single config-reload fails, kill.

---

## Source
- Repo / listing URL: https://github.com/TwiN/gatus
- License: Apache 2.0
- Last commit: v5.34.0 active in 2026
- Stars / downloads / sales: ~10.5k stars as of Mar 2026
- Active maintainer: yes, TwiN

## What it does
Gatus is a developer-oriented health dashboard. You define endpoints in YAML with conditions (status code, response time, body content, cert expiry, DNS). Supports HTTP, TCP, ICMP, DNS, SSH. Ships a built-in status page. Supports Twilio, Slack, PagerDuty, Discord alerting.

It expects endpoints to check. Brewington's agents write to state.json on disk, not an HTTP endpoint. To fit, we would either expose /api/state per agent (already done by server.js) or wrap Gatus around state-file freshness with a custom check.

## Fit with Brewington ecosystem
- **Plugs into:** the existing `/api/state` endpoint in server.js; twilio-whatsapp via Gatus's Twilio provider (or via webhook to twilio-whatsapp.js)
- **Replaces:** the hand-rolled watchdog
- **Depends on:** Docker or a Go binary on the host
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Drop a Gatus binary on the host (or a Docker container)
2. Write `gatus.yaml` with endpoints for each /api/state/<agent> URL
3. Define conditions (last_tick_at age, failures_in_row, month_to_date.cost)
4. Point alerts at twilio-whatsapp.js via webhook

## Risks and trade-offs
- Adds a Go/Docker runtime to the stack. Brewington is currently pure Node.
- Apache 2.0 is permissive but slightly heavier than MIT. Fine for our use.
- Gatus is designed for HTTP endpoint checks; file-freshness checks require custom adaptation.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (Apache 2.0)
- [x] Last commit date confirmed (v5.34.0 Mar 2026)
- [x] Star count confirmed via live visit (~10.5k)
- [x] At least one independent review or discussion found and linked (technotim.com, blog.brightcoding.dev Gatus guide)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
HOLD. Strong tool. The watchdog.js wins on fit because Brewington's health signal is file-based, not endpoint-based. Revisit Gatus when we actually have public HTTP endpoints per agent or when the dashboard needs an external status page.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
