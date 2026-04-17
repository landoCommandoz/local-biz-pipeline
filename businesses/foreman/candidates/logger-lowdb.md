# Candidate: lowdb

*Brief targeted: logger. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HOLD.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Single-library JSON database with atomic writes, letting Brewington treat each state.json as a typed document instead of raw file I/O.

### 2. Monthly cost all-in
- Infrastructure: $0
- Licensing: $0 (MIT since v3.0.0)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: state files stay under 1 MB each, which is well within lowdb's sweet spot.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 3 hours/month at $50/hr = $150/month. Same "no more clobbered state.json" win as pino + write-file-atomic, slightly less ceremony on the read side.
Assumptions: same tick concurrency profile.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. Library only; no operator. Slight deduction because lowdb pushes toward its own schema conventions, which may fight the existing state.json shape.
Evidence for the score: docs show Low/Adapter API patterns that assume lowdb owns the file shape.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES.

### 8. One-line kill criteria
If lowdb's file-format assumptions cost more migration time than write-file-atomic's bare primitive would save, kill.

---

## Source
- Repo / listing URL: https://github.com/typicode/lowdb
- License: MIT (v3.0.0 onwards; earlier versions had a sponsor clause, now resolved)
- Last commit: v6.1.0 actively maintained in 2026
- Stars / downloads / sales: ~22k stars (most recent reference 21.8k)
- Active maintainer: yes, typicode

## What it does
Lowdb is a small JSON database. You define a default shape, call `db.read()`, mutate `db.data`, call `db.write()`. Internally uses `steno` (same author) for atomic writes. The TypeScript typing is strong.

Lowdb covers the state.json side only; it is not a logger. You would still need pino or similar for log.md streaming.

## Fit with Brewington ecosystem
- **Plugs into:** a shared `businesses/_state.js` wrapping lowdb per agent
- **Replaces:** ad-hoc `fs.readFileSync + JSON.parse + writeFileSync`
- **Depends on:** Node 16+
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install lowdb`
2. Wrap each agent's state.json with a lowdb instance
3. Pair with pino (from the other candidate) for log.md

## Risks and trade-offs
- Two-library answer anyway (lowdb + a logger). Pino + write-file-atomic is already two libraries, and has tighter control of the state file's on-disk shape.
- Lowdb's v3 license change story (from "sponsors and OSS only" to MIT) is now clean but left a wariness trail in the community.
- Less widely used than pino's ecosystem; fewer production horror stories, also fewer battle-tested recipes.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT post-v3)
- [x] Last commit date confirmed (v6.1.0 active 2026)
- [x] Star count confirmed via live visit (~22k)
- [x] At least one independent review or discussion found and linked (dbdb.io Database of Databases entry; lowdb releases)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
HOLD. Lowdb is a fine pick if we decide to impose a schema on state.json. Right now state.json is a free-form object per agent; write-file-atomic respects that shape and adds nothing but safety. Revisit if we want schema validation.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
