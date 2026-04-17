# Businesses

Autonomous agent-run businesses. Each one makes its own money, covers its own infrastructure costs, and sends the surplus to Lando.

## The contract

Lando provides:
- Infrastructure (Netlify, Anthropic API, Twilio, Gmail SMTP, GHL Core)
- Strategic approval on anything escalated
- Loyalty

The business provides:
- Its own revenue
- Its own decisions inside its charter
- Honest reporting (income, cost, stuck points)
- Loyalty

## The pieces

Every business lives in its own folder:

```
businesses/<name>/
  charter.md     -- mission, authority, budget, escalation rules. Read every tick.
  state.json     -- what it has done, earned, spent, and what comes next.
  tick.js        -- one unit of work. Reads charter + state, decides, acts, logs.
  log.md         -- append-only diary of every tick.
```

Shared pieces at this level:

```
businesses/
  README.md              -- this file
  charter-template.md    -- template for new business charters
  twilio-whatsapp.js     -- shared helper for escalation pings
  pnl.json               -- rolling P&L across all businesses
  run.js                 -- master rotator: picks the next business to tick
```

## The rules for an agent-business

1. **Read the charter every tick.** It is the ground truth for what the business is authorized to do.
2. **Spend nothing outside the charter budget.** If an action would exceed the budget, escalate.
3. **Log every action with a timestamp.** Both income and cost.
4. **Ping Lando only when stuck or over budget.** Not for routine updates. Not for approval-fishing. Only when a human decision is actually required.
5. **Cover your own bills first.** Infrastructure costs come out of revenue before surplus is counted.
6. **Report honestly.** If a week passes with zero income, the state file says so. No hiding.
7. **If a tick fails, note the failure in log.md and move on.** Don't retry infinitely. Escalate after three failures.

## How to start a new business

1. Copy `charter-template.md` into a new folder under `businesses/<name>/`
2. Fill in the charter: mission, authority, budget, targets, escalation rules
3. Create `state.json` with an empty starting state
4. Write `tick.js` that reads the charter + state and performs one unit of work
5. Add the business to the rotation in `run.js`
6. First tick is manual. After it proves sane, wire it to cron or /loop.

## Active businesses

Listed in priority order:

- [foreman](foreman/charter.md) - Yard foreman. Hires new agents, onboards them, runs performance reviews, flags underperformers, maintains the org chart. Lando approves every hire.
- [paymaster](paymaster/charter.md) - Token ledger + budget allocator + 24/7 deploy researcher. Tracks every agent's token spend, sets weekly caps based on tokens-per-dollar-earned, maintains the plan to move the yard off the dev port to production Netlify.
- [scout](scout/charter.md) - Lead List resale. Scrapes local-service businesses by city + trade, packages as Gumroad CSV products, promotes via pinned posts on existing channels.
- [builder](builder/charter.md) - Autonomous site rebuild and outreach. Prospects, builds, deploys, emails, escalates warm replies. Wraps the existing Brewington pipeline.

Foreman will propose more hires. Each hire becomes a new bay once Lando approves.
