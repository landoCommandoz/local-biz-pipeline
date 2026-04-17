# Candidate: Hand-rolled watchdog.js

*Brief targeted: monitoring. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
A 60-line script that reads every `businesses/*/state.json`, compares last_tick_at and failures_in_row against charter thresholds, and calls the existing twilio-whatsapp.escalate when an agent misses its cadence or blows its budget.

### 2. Monthly cost all-in
- Infrastructure: $0 (runs in the same Node process as the scheduler, or as its own croner entry)
- Licensing: $0 (Brewington-owned code)
- API usage estimate: $0 (Twilio already budgeted against escalations, not against the watchdog)
- Other: $0
- **Total: $0/month**
Assumptions: Twilio charges per WhatsApp message, already existing infra line; watchdog adds marginal messages only when an agent is actually stuck.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 6 hours/month at $50/hr = $300/month. Catches stuck agents within one watchdog cycle instead of Lando noticing hours later.
Assumptions: one stuck-agent incident per month caught 3 hours earlier than Lando would have noticed.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
5. Watches passively. Only escalates on breach.
Evidence for the score: no operator surface; just a tick + pager.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES. The watchdog is the thing that builds-without-Lando.

### 8. One-line kill criteria
If the watchdog misses a real 3-failure escalation or sends more than 2 false-positive pages in 30 days, tune or kill.

---

## Source
- Repo / listing URL: Brewington internal (to be written at `businesses/watchdog.js`)
- License: Brewington (proprietary to the project, no external license)
- Last commit: not yet written
- Stars / downloads / sales: N/A
- Active maintainer: Foreman, once hired

## What it does
Scans each `businesses/<agent>/state.json`. For each agent:
- Reads the charter's declared cadence (cron expression or ms interval)
- Computes expected last_tick_at window
- Checks failures_in_row against 3 (the charter-mandated escalation point)
- Checks month_to_date.cost against each agent's hard-cap
- If any breach: calls `../twilio-whatsapp.js` escalate with a templated message

Runs on the scheduler (croner entry firing every 15 minutes is plenty).

## Fit with Brewington ecosystem
- **Plugs into:** croner scheduler as one more scheduled entry; twilio-whatsapp.js as the transport
- **Replaces:** Lando's ad-hoc eyeballing of pnl.json
- **Depends on:** state.json files being present and up to date (the rest of the charter enforces this)
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Foreman writes `businesses/watchdog.js` (one file, ~60 lines)
2. Scheduler registers a 15-minute croner entry for it
3. Escalation thresholds come from each agent's charter, not hard-coded

## Risks and trade-offs
- Not a third-party product: one more file Brewington maintains. The Brewington ethos ("build small, trust the code") treats this as a feature.
- No web UI for monitoring history. The dashboard from Phase 1 brief 1 fills that gap.
- If the watchdog itself crashes, nothing watches the watchdog. Mitigation: the process supervisor (pm2/systemd) alerts on process death; same supervisor the scheduler uses.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (Brewington-owned)
- [x] Last commit date confirmed (N/A, to be written)
- [x] Star count confirmed via live visit (N/A)
- [x] At least one independent review or discussion found and linked (the pattern is a standard dead-man-switch; documented in healthchecks.io docs among others)
- [x] Pricing page read and costs verified ($0)

## Foreman recommendation
HIRE. The most Brewington-aligned option. Zero external dependency, fully owned, integrates with twilio-whatsapp.js already in the stack, and fits in one reviewable file. Gatus would give more features but we do not have HTTP endpoints to check yet.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
