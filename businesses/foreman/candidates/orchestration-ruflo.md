# Candidate: Ruflo (claude-flow)

*Brief targeted: agent-orchestration. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HIRE (Lando-directed).*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Ruflo gives the yard a swarm orchestration layer with 60+ specialized sub-agents, vector memory, and MCP integration, so Scout, Builder, Foreman, and Paymaster can spawn short-lived helper agents instead of doing every subtask themselves.

### 2. Monthly cost all-in
- Infrastructure: $0 (local CLI)
- Licensing: $0 (MIT)
- API usage estimate: $0 marginal (rides on existing Anthropic/MCP tokens)
- Other: $0
- **Total: $0/month**
Assumptions: no managed cloud service, no new API keys. Token cost falls under each spawning agent's existing Anthropic budget.

### 3. Projected monthly revenue or revenue-savings
Productivity-savings: ~4 hours/month. Lando-time currently spent orchestrating multi-step research and tool-calling can be delegated to ruflo swarms. At $50/hr opportunity cost: $200/month.
Assumptions: 2-3 multi-step research requests/month routed through ruflo instead of manual orchestration.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. Once `npx ruflo@latest init` writes config, agents can spawn swarms without Lando approval per-invocation. Lando touchpoint only when topology or new agent types need to be added.

### 6. Can it pay its own bills
YES. $0 fixed cost. Marginal Anthropic token cost is charged to whichever bay triggered the swarm, paid from that bay's ledger.

### 7. Risk / downside
- Claude-flow is alpha (>=3.0.0-alpha.1) — breaking changes possible
- Published 6 days ago at v3.5.80, active development
- Adds a sizeable dependency surface (7.3 MB unpacked)
- `ruv` is the sole maintainer — bus-factor risk
Mitigation: pin the exact version in the install log; hold the ruflo config in git so we can roll back; watchdog monitors init failures.

### 8. Install plan
1. Run `npx ruflo@latest init` from repo root — writes config files.
2. Review generated files, commit to git.
3. Register ruflo as an available tool in Foreman's charter under "swarm".
4. Pick one low-risk subtask (e.g. Scout's listing-copy refresh) and route it through ruflo as a pilot.
5. If pilot is clean in 48h, unlock for Builder and Paymaster.

## Foreman verdict
HIRE. Lando-directed install, not a speculative pick. Cost is zero. Risk is bounded by the pilot gate. Enters the approved queue with `install_status: ready_to_install` and `install_order: 0` (ahead of all prior hires since Lando asked for it by name).
