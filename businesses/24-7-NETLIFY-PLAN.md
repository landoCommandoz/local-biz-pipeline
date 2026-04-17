# Command Center — 24/7 on Netlify

*Status: planning. Local port 3000 stays authoritative. Netlify mirror is the viewer.*

---

## The split

The yard has two separable concerns:

1. **Tick engine** (agents doing work — Foreman, Scout, Builder, Paymaster)
2. **Command Center** (the dashboard Lando watches)

Netlify is a static/functions host. It cannot run a long-lived scheduler. So we split:

- **Local/Codespaces:** keeps running `node businesses/run-all.js start` as the source-of-truth tick loop while we're building. Port 3000 stays the dev dashboard.
- **Netlify (24/7):** hosts the read-only viewer, plus scheduled-function ticks that replace the local scheduler when we cut over.

---

## Phase 0 — already live (as of 2026-04-17)
- Local server on port 3000 with SSE real-time stream
- 4 chartered agents with tick.js + state.json + log.md
- Scout shipping revenue on Gumroad
- Ruflo installed (98 sub-agents, MCP integration)

---

## Phase 1 — mirror command center on Netlify (no tick changes)

Goal: Lando can open the dashboard from any browser, not just Codespaces.

### Deliverables
1. **Static mirror:** build step outputs `businesses/public/index.html` + a pre-rendered `state.json` + `portfolio.json` snapshot to `dist/`. Netlify serves `dist/`.
2. **State sync:** a small Node script (`businesses/sync-to-netlify.js`) reads `businesses/<agent>/state.json` files and writes `dist/state.json` every N minutes. Pushed as a Netlify deploy OR written to Netlify Blobs.
3. **SSE via Netlify Functions:** a function at `/api/stream` reads from Netlify Blobs and long-polls / pushes events. Reference `netlify-skills:netlify-functions` for streaming pattern.
4. **DNS:** `yard.brewington.digital` (or similar) points at the Netlify site.

### What's shared
- Blobs bucket `yard-state` holds serialized agent state, ledgers, logs.
- When local tick writes state.json → a hook pushes to Blobs → function emits SSE change → Netlify dashboard pulses.

### What stays local
- Tick engine still lives in Codespaces until Phase 2.

---

## Phase 2 — move ticks to Netlify scheduled functions

Goal: even when Codespaces is asleep, agents tick.

### Deliverables
1. **Per-agent scheduled function.** Each bay gets a Netlify scheduled function:
   - `netlify/functions/foreman-tick.ts` runs every 6h (cron `0 */6 * * *`)
   - `netlify/functions/scout-tick.ts` runs daily at 09:00 UTC
   - `netlify/functions/builder-tick.ts` runs every 4h
   - `netlify/functions/paymaster-tick.ts` runs Sundays 23:00 UTC
2. **Shared runtime.** Each function imports `businesses/lib/state.js`, `ledger.js`, `logger.js`, etc. Functions read/write to Netlify Blobs, not to `businesses/<agent>/state.json` on disk (disk on Netlify is ephemeral).
3. **Revenue hooks.** When Scout needs to hit Gumroad API, it uses `GUMROAD_ACCESS_TOKEN` from Netlify environment variables (not .env on disk).
4. **Watchdog as scheduled function.** Every 15 min pings, writes findings to Blobs.

### Migration rule
- Once Phase 2 ships, Codespaces stops running `run-all.js`. Netlify is authoritative. Lando still runs local port 3000 for dev-only debugging.

---

## Phase 3 — 24/7 swarm via ruflo (claude-flow) MCP

Goal: give each bay the ability to spawn Anthropic-powered sub-agents on demand.

### Key facts
- `.mcp.json` already installed via ruflo. `autoStart: false` — we turn it on when we're ready.
- Anthropic token cost is the only real cost — paid from the spawning agent's ledger.
- Each bay can use `swarm-orchestration` skill to run research, content, and optimization subtasks.

### Deliverables
1. **Token budget per bay.** Paymaster enforces: monthly Anthropic spend per bay capped. Overages escalate.
2. **Pilot:** Scout routes monthly lead-list refresh through a ruflo swarm. 48h observation window.
3. **Unlock Builder + Paymaster once pilot is clean.**

---

## Environment variables we'll need on Netlify

Copy these from local `.env` to Netlify env panel:

- `GOOGLE_PLACES_API_KEY` (Scout's prospect research)
- `ANTHROPIC_API_KEY` (ruflo swarms + copy generation)
- `NETLIFY_API_KEY` (self-deploys from ticks — scoped permission only)
- `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_WHATSAPP_FROM` + `TWILIO_WHATSAPP_TO` (escalations)
- `GMAIL_USER` + `GMAIL_APP_PASSWORD` (outreach)
- `HUNTER_API_KEY` (Builder prospect enrichment)
- `GHL_API_KEY` (GoHighLevel sync if needed)
- `GUMROAD_ACCESS_TOKEN` (Scout revenue channel)
- `OPENWEATHER_API_KEY` (ambient-weather data for dashboard theming, optional)

---

## Open decisions

- **Domain:** do we want `yard.brewington.digital`, `command.brewington.digital`, or host under Digital Brewington subdomain?
- **Auth:** the dashboard shows revenue and customer counts. Should it be behind `netlify-identity` so only Lando sees it?
- **Blobs vs DB:** agents write small JSON state frequently. Blobs is cheaper and fits for now. If we start needing queries across agents (e.g. "all sales this week across all bays"), we graduate to Netlify DB.

---

## When we ship each phase

Phase 1 is the first real value add — Lando can watch the yard from anywhere. Ship it before Phase 2.

Phase 2 should not ship until Scout's first 15 days of revenue prove the pipeline is honest. No point migrating a pipeline that doesn't make money.

Phase 3 is a force-multiplier once money is flowing. Not before.

---

*Filed: 2026-04-17. Owner: Foreman drives implementation, Paymaster greenlights each phase based on revenue.*
