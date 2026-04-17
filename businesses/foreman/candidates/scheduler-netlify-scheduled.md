# Candidate: Netlify Scheduled Functions

*Brief targeted: scheduler. Phase: 1. Researched: 2026-04-17. Foreman recommendation: PASS.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Offloads tick scheduling to the hosting provider we already pay nothing for, so Brewington owns zero scheduler infra.

### 2. Monthly cost all-in
- Infrastructure: $0 (free tier: 125 hours / 7,500 minutes of function execution per month)
- Licensing: $0 (proprietary platform, free usage)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: total tick execution stays under 7,500 min/mo (3 agents x 24 ticks/day x 1 min = 2,160 min, comfortable headroom).

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 4 hours/month at $50/hr = $200/month. No process supervisor to run, no VPS to manage.
Assumptions: tick workload fits inside Netlify's per-invocation time limit (10s hobby, longer on higher plans).

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
3. Once wired, Netlify fires the functions on cron. Lando's touchpoints are Netlify dashboard checks, deploy-triggered schedule updates, and handling function time-outs on long ticks.
Evidence for the score: scheduled functions require a published deploy to activate and cannot be invoked by URL; cadence changes require a code deploy.

### 6. Can it pay its own bills
YES. Cost is $0 at our volume.

### 7. Can it build something without Lando
YES, but only if agent ticks fit Netlify's function runtime model (short-lived, stateless-at-the-function-level). Long-running ticks (Builder's site generation) may exceed the per-invocation limit.

### 8. One-line kill criteria
If a single Builder tick exceeds the free-tier function timeout in 30 days, kill.

---

## Source
- Repo / listing URL: https://docs.netlify.com/build/functions/scheduled-functions/
- License: Netlify Terms of Service (free tier, commercial use allowed per their standard terms)
- Last commit: platform feature, actively maintained
- Stars / downloads / sales: platform, not a repo
- Active maintainer: yes, Netlify

## What it does
Scheduled Functions are AWS Lambda invocations wrapped by Netlify that run on a cron expression in UTC. Define a function in `netlify/functions/tick.js` with a schedule config; Netlify runs it. No UI trigger, no URL invoke.

Works great for short, stateless jobs. Not ideal for long-running agent ticks that need filesystem persistence across invocations (which Brewington ticks do).

## Fit with Brewington ecosystem
- **Plugs into:** existing Netlify deploy for `digitalbrewington.com`
- **Replaces:** a scheduler process
- **Depends on:** Netlify free tier; function env vars configured
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Create `netlify/functions/scheduled-<agent>.ts` per agent
2. Each function calls the agent's tick logic via a shared module
3. Configure schedule in each function's Config export

## Risks and trade-offs
- **Filesystem state problem.** Netlify functions have ephemeral filesystems. Brewington agents write to `state.json` and `log.md` on the local disk. Netlify would force a move to Netlify Blobs or a remote store, which breaks the "single-folder-per-business" convention in the charter.
- Platform lock-in on scheduling (moving off Netlify later means re-writing the scheduler).
- Proprietary. The charter prefers permissive OSS; Netlify is acceptable because the rest of the stack already uses it, but it violates the "self-hosted option preferred" spirit.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (Netlify TOS, commercial use permitted)
- [x] Last commit date confirmed (platform, actively maintained)
- [x] Star count confirmed via live visit (platform)
- [x] At least one independent review or discussion found and linked (marclittlemore.com, dev.to hexshift guide)
- [x] Pricing page read and costs verified (free tier confirmed 125 hours/mo)

## Foreman recommendation
PASS. The filesystem state problem is a structural mismatch. Agents read/write `state.json` on local disk; Netlify functions reset between invocations. Fixing that means migrating state storage, which is bigger than picking a scheduler. Croner stays the pick.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
