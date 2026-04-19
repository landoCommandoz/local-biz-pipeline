# Hank's Ultra Plan for Cockpit Round

*Drafted 2026-04-18. Status: AWAITING LANDO APPROVAL. Do not execute until approved.*

## Phase 0 — Setup (10 min)

1. Create per-agent research notebooks: `cockpit-round/_research/<agent>.md` (raw findings, not pitches).
2. Create `cockpit-round/tracker.json` with status per agent: `pending → searching → shortlisted → pitched → reviewed`.
3. Log hunt start in `businesses/foreman/log.md`.

## Phase 1 — Per-agent capability decomposition

For each of the 10 hunting agents (HIRE is a monitor, not a hunt), define:

- Primary capability in one sentence (what it must DO)
- Revenue mechanism (how it makes money: direct sale, cost reduction, conversion multiplier, rent-roll cover only)
- Evaluation rubric, weighted (amended by Lando 2026-04-18):
  - Revenue evidence (35%) — documented case studies, sales, or ARR
  - Fit with Brewington Digital pipeline (25%)
  - Autonomy score (20%) — 3+ required per `PITCH-TEMPLATE.md`. Raised from 15% because low autonomy is a forever tax on Lando's time.
  - Install / setup complexity (10%) — lowered from 15% because hard installs are one-time costs.
  - Licensing / commercial use legality (10%)

## Phase 2 — Multi-platform sweeps

Six-platform sweep per agent. Search queries tailored per cluster (below).

1. **GitHub Advanced Search** — stars, recent commits, commercial license, trending last 90 days
2. **Claude Code plugin registry** + official skills marketplace
3. **Apify Actor Store** — scraping-heavy roles (ECHO, ATLAS)
4. **RapidAPI + official APIs** — data-heavy roles (ZENITH, ATLAS, NEO, MAX)
5. **Product Hunt + Gumroad + Indie Hackers revenue threads** — monetization evidence
6. **Reddit** (r/SideProject, r/Entrepreneur, r/SaaS, r/LocalLLaMA, r/automation) — "what's actually making money" proof

## Phase 3 — Cluster-based execution order

Group for efficient search space reuse:

| Cluster | Agents | Why grouped |
|---|---|---|
| **Scraping / prospecting** | ECHO, ATLAS | Overlapping search space: Google Maps scrapers, local biz directories, Apify actors |
| **QA / headless browser** | IRIS, NOVA | Same tool class: Puppeteer, Playwright, visual-regression suites |
| **Intelligence / analytics** | ZENITH, NEO | Market data + ML-lite pattern recognition share vendors |
| **Creative / output** | FORGE, REX, PIXEL | Generative tools (design, copy, media) cluster around same agent frameworks |
| **Ops / deployment** | MAX | Solo. Netlify vs paid deploy-service alternatives |
| **Locked** | HIRE | DEFER ENTIRELY. No hunt, no monitor entry, no readiness checklist. When VAULT shows active_clients at 5, HIRE becomes priority then. |

Execution order: **Scraping → QA → Intelligence → Creative → Ops → Locked.**
Reason: Scraping cluster unlocks ATLAS and ECHO which feed ZENITH and NEO. Starting there lets later clusters borrow vendor shortlists.

## Phase 4 — Candidate shortlisting

Per agent, collect 3-5 candidates. Score against the rubric. Top candidate becomes the formal pitch. Runners-up retained in `_research/<agent>.md` for fast pivot if Lando rejects.

## Phase 5 — Pitch drafting

One pitch per agent at `cockpit-round/<agent-slug>-pitch.md`, strict conformance to `PITCH-TEMPLATE.md`:

- All 8 required fields (none optional)
- Source evidence links (at least 2 independent)
- Revenue projection with assumptions spelled out
- Runners-up section (2 alternates)
- One-line kill criteria

Auto-reject any pitch where autonomy score is under 3, payback is "never", or it cannot pay its own bills.

**ECHO gets extra scrutiny (Lando directive 2026-04-18):** ECHO is the most direct revenue engine in the 11 because she turns cold scraping into client acquisition. Pitch the highest-revenue skill for ECHO specifically, not the safest or easiest. If the best ECHO skill requires a paid API or credential, flag as `pending-escalations/` rather than auto-rejecting. Top-tier option must be surfaced even if it needs Lando's auth.

## Phase 6 — Consolidated review

`cockpit-round/ROUND-SUMMARY.md` with:

- All 10 pitches ranked by projected month-1 revenue (HIRE listed separately as locked)
- Top-line totals: combined month-1 projection, combined month-3 projection, combined monthly cost, net rent impact (how many new $20/mo bays this seeds over 90 days)
- **INSTALLABILITY SPLIT (Lando directive 2026-04-18):** clearly flag which pitches are installable today vs blocked on credentials or auth. Two columns in the ranked table: `INSTALLABLE_NOW` (yes / no) and `BLOCKER_IF_NO` (paid API, OAuth creds, seller account, etc). This shapes Lando's review order.
- Per agent: link to pitch, one-sentence why, revenue, cost, payback
- Flagged items: any agent where Hank could not find a defensible pitch after 3 search passes gets marked "NO PROFITABLE SKILL FOUND, recommend restructure or reassign"

## Phase 7 — Stop and surface

Stop before installing anything. Lando reviews `ROUND-SUMMARY.md`, approves, rejects, or requests alternates per agent.

## Phase 8 — Post-approval onboarding (only after Lando greenlights)

For each approved pitch:
1. Install via documented install command
2. Run `plop` to scaffold bay if new backend agent (not just cockpit-visual placeholder)
3. Update `agents.json` with skill assignment
4. Update rent-roll if becoming a paying bay
5. Signal cockpit build resume

## Budget estimate

- Metered LLM for research synthesis: ~$3 to $8 total (logged via Doss)
- No external API costs (all research tools are free-tier or public pages)
- Time: variable; 10 agents × 6 platforms × ~15 min/sweep = rough floor of 15 hours if done seriously

## Risks and mitigations

- **WebFetch rate limits.** Mitigation: batch queries, cache to `_research/`.
- **Shallow revenue evidence.** Mitigation: if no defensible revenue source exists, Hank flags the agent rather than forcing a weak pitch.
- **Overlap between agents.** Mitigation: already addressed by clustering (ECHO vs SIGNALSCOUT, ZENITH vs ATLAS boundaries in pitches).
- **Claude Code plugin vs custom npm divide.** Mitigation: Hank evaluates BOTH layers per agent and recommends whichever has stronger revenue evidence, not whichever is pre-installed.

## Stop conditions

- Any pitch requires paid API access Lando has not authorized: surface as blocker, do not proceed.
- Any candidate requires Lando credentials (OAuth keys, seller accounts): add to `pending-escalations/` and defer.
- Autonomy score under 3: auto-reject.

## What Hank delivers

- `HUNT-BRIEF.md` (filed)
- `HUNT-PLAN.md` (this file, awaiting approval)
- 10 individual pitches
- `ROUND-SUMMARY.md` ranked consolidated review
- Updated `businesses/foreman/log.md` with hunt milestones
- Updated `businesses/foreman/state.json` incrementing candidates_researched / pitched counters

## What Hank does NOT do

- Install anything
- Touch `agents.json`
- Touch the cockpit build
- Guess when evidence is weak
