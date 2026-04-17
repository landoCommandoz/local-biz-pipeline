# Candidate: Croner

*Brief targeted: scheduler. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Runs each agent's tick.js on its declared cadence (Foreman 6h, Scout 24h, Builder 4h) in-process with zero dependencies and pause/resume/stop primitives.

### 2. Monthly cost all-in
- Infrastructure: $0 (in-process, runs wherever Node runs)
- Licensing: $0 (MIT)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: runs in the existing server.js process on Netlify Background Functions or a cheap VPS.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 6 hours/month at $50/hr = $300/month. Eliminates Lando manually running `node businesses/foreman/tick.js hunt`, `node builder/tick.js`, etc.
Assumptions: 3 agents ticking 4-24 times per day, each manual invocation takes Lando ~2 minutes.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. Once registered, ticks fire without touch. Lando's touchpoints are when a tick fails 3x in a row (watchdog escalates) or when a cadence changes (edit one config line).
Evidence for the score: Croner supports pause/resume/stop programmatically; handling a single failed tick is the watchdog's job, not Lando's.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES. Croner is a library; the scheduler entry script reads a config file and schedules, no human in the loop per tick.

### 8. One-line kill criteria
If ticks drift or miss by more than 5 minutes on a 4-hour cadence after 30 days, kill and replace with Netlify Scheduled Functions.

---

## Source
- Repo / listing URL: https://github.com/Hexagon/croner
- License: MIT
- Last commit: v10.0.2-dev.2 on Feb 21, 2026 (active)
- Stars / downloads / sales: ~2.5k stars, 5.3M weekly npm downloads
- Active maintainer: yes; dependency of pm2, Uptime Kuma, ZWave JS, TrueNAS (strong downstream signal)

## What it does
Croner is a zero-dependency cron scheduler for Node, Deno, Bun, and the browser. Supports standard cron plus seconds/year fields, L/W/# modifiers, pause/resume/stop. Benchmarks significantly faster than node-cron; node-cron fails several correctness tests that croner passes.

It does not persist schedule state to disk. A restart re-reads the in-code schedule and resumes. That's fine for Brewington's declared cadences, which live in each agent's charter.

## Fit with Brewington ecosystem
- **Plugs into:** a new `businesses/run-all.js` or `businesses/scheduler.js` that reads each agent's charter, extracts the cron expression, and schedules `require(agent/tick.js).run()`
- **Replaces:** Lando's manual invocations + the existing `run.js` master rotator
- **Depends on:** Node 16+
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install croner` after Lando approves
2. Write `businesses/scheduler.js` that scans `businesses/*/charter.md` for cadence and registers a Croner job per agent
3. Wire to pm2/systemd/docker for process supervision; or deploy as a Netlify Background Function if Lando prefers

## Risks and trade-offs
- In-process means one crash takes down all schedulers. A supervisor (pm2, systemd, or Netlify's managed invocations) mitigates.
- No built-in persistence of in-flight jobs; if a tick is running when the process dies, it is lost. Ticks are designed idempotent per charter, so re-running on next cadence is fine.
- Fewer stars than node-cron, but downstream adoption (pm2, Uptime Kuma) is stronger.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT via github.com/Hexagon/croner/blob/master/LICENSE)
- [x] Last commit date confirmed (Feb 21, 2026)
- [x] Star count confirmed via live visit (~2.5k)
- [x] At least one independent review or discussion found and linked (betterstack.com Node schedulers guide, pkgpulse.com 2026 comparison)
- [x] Pricing page read and costs verified (MIT OSS, free)

## Foreman recommendation
HIRE. Strongest of the three. Zero deps. Actively maintained. Benchmarks and downstream adoption prove the claim. The restart-safety brief requirement is met by keeping cadences in charters, so on restart the scheduler re-registers from the single source of truth.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
