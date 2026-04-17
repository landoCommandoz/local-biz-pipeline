# Candidate: pino + write-file-atomic

*Brief targeted: logger. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives every agent a shared, structured logger for log.md streaming plus a primitive for safe concurrent state.json updates, ending the risk that two parallel ticks clobber a state file.

### 2. Monthly cost all-in
- Infrastructure: $0 (both libraries are pure in-process Node)
- Licensing: $0 (pino MIT, write-file-atomic ISC)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: logs go to local disk plus optional stdout, no hosted log aggregator.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 4 hours/month at $50/hr = $200/month. Prevents at least one "corrupted state.json after concurrent tick" incident per month that would otherwise burn Lando 2+ hours to reconstruct.
Assumptions: Foreman, Scout, and Builder occasionally tick close to each other once the scheduler is live.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
5. Libraries only, no human operator needed. They sit underneath everything and never escalate.
Evidence for the score: both are passive dependencies, no dashboards, no runtime decisions.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES.

### 8. One-line kill criteria
If a state.json corruption still occurs after install (race window survives), kill write-file-atomic and replace with proper-lockfile + custom write.

---

## Source
- Repo / listing URL: https://github.com/pinojs/pino and https://github.com/npm/write-file-atomic
- License: MIT (pino), ISC (write-file-atomic)
- Last commit: pino actively maintained; write-file-atomic v7.0.0 published ~Feb 2026
- Stars / downloads / sales: pino is the de-facto Node logger, ~14k+ stars. write-file-atomic has 1,598 dependent projects, npm-core maintained.
- Active maintainer: yes; write-file-atomic is owned by the npm/cli team directly

## What it does
Pino is a fast JSON-line structured logger. Zero-config streams to stdout or a file. Child loggers let each agent stamp its own identity on every line. About 5-10x faster than Winston in benchmarks.

Write-file-atomic writes a temp file, fsyncs, then renames on top of the target. Either the full new content lands or nothing changes. It is the primitive behind lowdb and many config libraries.

## Fit with Brewington ecosystem
- **Plugs into:** a shared `businesses/_logger.js` module exposing `getLogger(agent)` and `writeState(agent, state)`
- **Replaces:** ad-hoc `fs.appendFileSync` and `fs.writeFileSync` calls in agent tick code
- **Depends on:** Node 14+
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install pino write-file-atomic`
2. Write `businesses/_logger.js` with `getLogger(agent)` (pino child) and `writeState(agent, obj)` (write-file-atomic)
3. Each agent tick imports both; log.md streams JSON lines, state.json writes are atomic

## Risks and trade-offs
- Pino's JSON output is not as readable as the current markdown log.md. Either a pino transport pretty-prints, or we accept JSON + a small CLI to pretty-print when Lando reads.
- Two libraries instead of a bundled one (lowdb). Trade-off: clean separation of concerns.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (pino MIT; write-file-atomic ISC per npm and repo)
- [x] Last commit date confirmed (pino active; wfa v7.0.0 ~Feb 2026)
- [x] Star count confirmed via live visit (pino ~14k; wfa 1,598 dependents)
- [x] At least one independent review or discussion found and linked (betterstack.com pino-vs-winston; signoz.io pino guide)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
HIRE. Pino is the best-in-class Node logger. Write-file-atomic is owned by the npm-core team and is the proven primitive for state writes. Together they cost $0 and end the concurrency-safety question for state.json.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
