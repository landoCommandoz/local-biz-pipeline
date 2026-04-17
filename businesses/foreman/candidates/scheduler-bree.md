# Candidate: Bree

*Brief targeted: scheduler. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HOLD.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Runs each agent tick in an isolated worker thread with retry, throttle, and human-readable schedules, so a Builder crash cannot take down Foreman's watchdog.

### 2. Monthly cost all-in
- Infrastructure: $0 (in-process, worker threads are built in)
- Licensing: $0 (MIT, verified via LICENSE file in repo)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: single Node process with worker threads, no external broker.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 5 hours/month at $50/hr = $250/month. Same no-more-manual-ticks win as croner, plus crash isolation so one failing agent does not cascade.
Assumptions: same tick volume as croner; isolation saves some debugging time when one agent has a bad tick.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. Same as croner for routine ticks. Small edge: built-in retry/throttle semantics mean Lando sees fewer failed-tick escalations.
Evidence for the score: README lists retries, throttling, graceful shutdown, cron + date + ms + human syntax.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES.

### 8. One-line kill criteria
If worker-thread overhead costs more than 50 MB RAM per agent or the startup delay exceeds 2 seconds per tick, kill and fall back to croner.

---

## Source
- Repo / listing URL: https://github.com/breejs/bree
- License: MIT (confirmed present in repo)
- Last commit: v9.2.9 published "a month ago" per npm (mid-March 2026)
- Stars / downloads / sales: ~3.2k stars
- Active maintainer: yes, Forward Email team

## What it does
Bree is a Node.js job scheduler that spawns each job in a worker thread. Supports cron, Date, ms, and human-readable durations. Has retries, throttling, graceful shutdown. Built to avoid the Redis/MongoDB dependencies of agenda and bull.

The worker-thread isolation is the differentiator. If a Builder tick throws or loops, Bree can kill just that worker and retry on the next cadence without killing the whole scheduler.

## Fit with Brewington ecosystem
- **Plugs into:** same integration point as croner (a `businesses/scheduler.js`)
- **Replaces:** manual ticks + current run.js
- **Depends on:** Node with worker_threads (all modern Node)
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install bree` after Lando approves
2. Write `businesses/scheduler.js` with a Bree instance that maps charter cadence -> worker file path
3. Each agent's tick.js becomes a worker entry point

## Risks and trade-offs
- Worker threads add memory overhead per agent. For 3 agents this is trivial; for 20 it could matter.
- Every tick.js becomes a worker entry, which means the agent contract changes slightly (the tick must be a worker-module, not a CLI script).
- More opinionated than croner, which is more surgical.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT, breejs/bree/blob/master/LICENSE)
- [x] Last commit date confirmed (v9.2.9 ~mid-March 2026)
- [x] Star count confirmed via live visit (~3.2k)
- [x] At least one independent review or discussion found and linked (betterstack.com node schedulers guide includes bree)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
HOLD. Bree is solid but changes the tick.js contract (CLI script -> worker module). That's a non-trivial migration cost against the incremental safety of worker isolation. Revisit when the agent count crosses ~10 or when an agent crash actually takes down the scheduler.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
