# Filing System

*Every agent runs like a real business. Keeps its own books. Files its own records. Answers to its own P&L.*

---

## The cabinet (per agent)

Every `businesses/<agent>/` folder keeps these files. Agents read their own cabinet on every tick.

```
businesses/<agent>/
  charter.md              - the mission. Read first on every tick. Ground truth for authority, budget, escalation rules.
  state.json              - current state. Atomic updates via lib/state.js. Holds status, mode, last_tick_at, failures_in_row, month_to_date, performance_contract.
  log.md                  - append-only human-readable diary. Every event, timestamped. Lando reads this.
  log.jsonl               - append-only machine-readable log. Watchdog and paymaster read this.
  ledger.json             - running P&L. Income total, expense total, net, sales count, last update time.
  sales.jsonl             - append-only record of every sale or revenue event. One line per transaction.
  expenses.jsonl          - append-only record of every cost. One line per expense.
  contracts/              - agreements with Lando. Performance contracts, pricing decisions, scope changes. One file per contract.
    v1-performance-contract.md
  inventory/ or products/ - what the agent sells or delivers. Actual artifacts, CSVs, templates, decks.
  reports/                - weekly and monthly self-reports. Agent writes these.
    weekly-2026-w16.md
    monthly-2026-04.md
```

## The ecosystem cabinet (top level)

```
businesses/
  README.md               - index + philosophy
  FILING-SYSTEM.md        - this file
  RUN-MANIFEST.md         - what "go" triggers
  STAGED-DISPATCHES.md    - pending prompts, fires on-trigger
  pnl.json                - rollup across all agents (paymaster maintains)
  org-chart.md            - who depends on whom (foreman maintains)
  run-all.js              - one-command orchestrator
  scheduler.js            - cron tick runner (croner)
  twilio-whatsapp.js      - escalation helper
  lib/
    logger.js             - per-agent logger (pino + markdown sidecar)
    state.js              - atomic state read/write (write-file-atomic)
    ledger.js             - per-agent P&L helper (sales, expenses, running ledger)
    watchdog.js           - hand-rolled monitoring
```

## The rules

### 1. Every revenue event hits sales.jsonl
One line per event, append-only, never edited. Required fields:

```json
{
  "at": "2026-04-17T03:45:00Z",
  "item_id": "phoenix-hvac-v1",
  "item_name": "Phoenix Metro HVAC Lead List v1",
  "amount": 49.00,
  "currency": "USD",
  "channel": "gumroad",
  "transaction_id": "<external id from the channel>",
  "buyer_hint": "<email or truncated id, optional>",
  "gross": 49.00,
  "fees": 4.51,
  "net": 44.49,
  "note": "<optional>"
}
```

### 2. Every cost hits expenses.jsonl
One line per cost, append-only, never edited.

```json
{
  "at": "2026-04-17T03:45:00Z",
  "category": "infrastructure|api|tooling|fees|advertising",
  "item": "anthropic tokens - scout listing copy",
  "amount": 0.02,
  "currency": "USD",
  "reference": "<linked work unit, optional>",
  "note": "<optional>"
}
```

### 3. Every tick updates ledger.json
ledger.json is a running summary, always derivable from sales.jsonl + expenses.jsonl. Safe to rebuild at any time. Agents use `lib/ledger.js` to keep it in sync.

```json
{
  "since": "2026-04-17T03:10:00Z",
  "income_total": 0,
  "expense_total": 0,
  "net": 0,
  "sales_count": 0,
  "expense_count": 0,
  "last_sale_at": null,
  "last_expense_at": null,
  "last_reconciled_at": "2026-04-17T03:45:00Z"
}
```

### 4. Every contract gets a file in contracts/
Contracts are dated, named, and permanent. Never edited after signing. If a contract supersedes another, write a new file and reference the old.

### 5. Weekly reports every Sunday
Every agent writes `reports/weekly-<YYYY>-w<WW>.md` at the Sunday 23:00 tick (or on first tick after Sunday). Format:

```markdown
# <Agent> weekly report - 2026 W16

**Week:** 2026-04-14 to 2026-04-20
**Status at end:** <from state.json>

## Numbers
- Sales this week: <count>
- Revenue this week: $<amount>
- Expenses this week: $<amount>
- Net this week: $<amount>
- Running net since installed: $<amount>

## What worked
- <bullets>

## What did not
- <bullets>

## Decisions next week
- <bullets>

## Escalations raised this week
- <bullets>
```

### 6. Monthly reports on the 1st
Same structure, wider window. Performance contract is checked here. If at day 30 the agent is under target, monthly report includes a HONEST assessment and either proposes a pivot or flags for archive.

## The audit trail

If Lando asks "what have you actually done" to any agent, the answer must be derivable from:
- log.md + log.jsonl (every action)
- sales.jsonl (every dollar in)
- expenses.jsonl (every dollar out)
- reports/*.md (weekly + monthly honest assessments)

No agent writes self-congratulatory summaries. No agent hides a bad week. Every number traces back to a primary record.

## The 30-day rule

Every agent has a performance contract. On day 30 after its first product or first revenue-capable tick, Foreman runs a review using the ledger. If under target, the agent is either pivoted (new approach within charter) or archived (folder moved to `.archive/`, unhooked from scheduler, all sales.jsonl and expenses.jsonl preserved for the record).

## No fudging

- Ledger is always derivable from the jsonl files. Both must match.
- Contracts are signed once, never backdated.
- Reports never claim what the ledger does not show.
- Agents report honestly or they are pulled.
