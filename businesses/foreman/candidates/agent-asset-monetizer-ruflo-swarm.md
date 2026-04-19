# Candidate: Asset Monetizer via Ruflo Swarm Composition

*Brief targeted: asset-monetizer (new bay, lane #1 hire). Phase: 2. Researched: 2026-04-17. Foreman recommendation: HOLD AS RUNNER-UP. Strong fit if Lando wants to exercise ruflo investment, weaker if we want the thinnest possible bay.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Uses the already-installed ruflo swarm (98 sub-agents, 30 skills) to orchestrate scout -> analyst -> copywriter -> publisher steps in parallel, producing Itch.io listings without writing a custom tick.js pipeline from scratch.

### 2. Monthly cost all-in
- Infrastructure: $0 (ruflo already installed at v3.5.80, already paid for in Hank's roster)
- Licensing: $0 (ruflo / claude-flow is MIT, butler CLI is MIT)
- API usage estimate: ~$6-10/month
  - Assumption: swarm orchestration adds overhead per pitch (coordinator + worker token traffic). Each pitch ~30-50k tokens in a 4-agent swarm vs ~15k in a single Sonnet call.
  - 3 pitches/week * ~40k tokens * 4 weeks = ~480k tokens/month at ~$3/1M input = ~$5, plus ~$4 output
- Itch.io share: 10% (seller-configurable)
- **Total: ~$8/month recurring. Hard cap $15/month.**

Assumption: ruflo's hierarchical-mesh topology with 6-8 agents per hunt is the default, matching CLAUDE.md's project config. Cost scales roughly 2x a single-Sonnet pipeline.

### 3. Projected monthly revenue in first 30 days
**$60-100, same asset strategy as the butler+Sonnet architecture.**

Revenue potential is identical to the top pick because the *product* is the same (ported Kenney packs, curated atlases). Difference is only in how the bay assembles the product. Ruflo's parallel brainstorm step may surface better pitch angles (multiple "coder" sub-agents propose bundle compositions, winner selected by consensus). Marginal upside unclear, probably within noise.

### 4. Payback period
Week 1-2. $8/month cost is covered by the first sale of a $19 listing.

### 5. Autonomy score 1-5
**4.** Same as the top pick. Swarm orchestration doesn't reduce touchpoints; it redistributes them across sub-agents. The first-port smoke-test by Vega or Lando is still required the first time a new asset family gets ported.

### 6. Can it pay its own bills
**YES,** with slightly tighter margin than the top pick ($8 cost vs $5). Still clears rent by week 2 in the base case.

### 7. Can it build something without Lando
**YES.** Ruflo's documented workflow is `swarm init -> agent spawn -> orchestrate -> collect results`. All four steps are API calls, no human gates.

### 8. One-line kill criteria
If month 1 net revenue is under $25 AND swarm orchestration adds more than $5/mo overhead without visible quality lift (judged by pitch-to-sale conversion rate vs the top pick's baseline), archive this architecture and switch to the thinner custom-tick.js path.

---

## Source
- ruflo / claude-flow: https://github.com/ruvnet/ruflo (MIT, installed at v3.5.80 on 2026-04-17 per Hank's roster)
- ruflo sub-agent catalog: `.claude/agents/` in repo (98 sub-agents: researcher, coder, reviewer, tester, planner, plus specialized lanes)
- butler CLI: https://itch.io/docs/butler/ (MIT)
- Itch.io pricing doc: https://itch.io/docs/creators/pricing

## What it does
Same end goal as the top pick: weekly scout -> pitches -> bundles -> Itch listings. Difference is the orchestration layer.

A `vault/tick.js` kicks off a ruflo swarm with a task definition like:
```
swarm init --topology hierarchical-mesh --max-agents 6 --strategy specialized
agents = [researcher (asset-library scout), planner (pitch ranker), coder (bundle assembler), reviewer (license & brand check), tester (smoke-test the output), documenter (draft listing copy)]
orchestrate task: "Produce one new Itch.io listing bundle from Kenney's current catalog within 7 days."
```

The swarm runs, each sub-agent hits its lane, results flow into `vault/pitches/` and `vault/bundles/`, and the final publish step (butler push) fires at the end of the swarm.

## Fit with Brewington ecosystem
- **Plugs into:** same bay folder as the top pick (`businesses/vault/`), but `tick.js` delegates to ruflo's CLI (`npx ruflo@latest swarm init ...`) instead of hand-rolling the pipeline.
- **Depends on:** ruflo installation (already present), BUTLER_API_KEY, ANTHROPIC_API_KEY.
- **Pilot subtask per Hank's roster:** this would be the second formal ruflo exercise after the Scout listing-copy refresh pilot, helping answer the 48h gate question about whether ruflo swarms add real value.

## Bay scaffolding plan
- **charter.md, state.json:** same as the top pick.
- **tick.js:** a thin wrapper that calls `ruflo swarm init + orchestrate`. About 80 lines vs ~250 for a custom pipeline. Lando touches less code.
- **Tick rhythm:** weekly swarm run (Monday 09:00), daily ledger-sync ticks (5s).
- **Day 1 first action:** fire the swarm. Expected runtime: 15-30 min. Output: one pitch, one bundle, one listing candidate. Lando inspects the bundle, approves publish.

## First 7-day revenue plan
Same as the top pick. Listing live by day 3, targeting 2 sales by day 7.

## Risks and trade-offs
- **Ruflo orchestration adds moving parts.** The more sub-agents in the loop, the more failure modes. Anti-drift hierarchical topology helps but doesn't eliminate.
- **Token cost is roughly 2x the single-Sonnet baseline.** On a $5 vs $8 comparison, the delta is small. On a surprise-spike month, the delta could matter (e.g., a swarm that retries itself 3x on a confused task).
- **Ruflo's value prop is coordination, not raw capability.** For a pipeline with 4 linear steps (scout, pitch, build, publish), a single orchestrator agent reading from a queue is arguably simpler than a multi-agent swarm. Flagged honestly.
- **Upside.** If ruflo's parallel-brainstorm step produces materially better pitch angles (e.g., unusual bundle compositions a single Sonnet wouldn't find), this architecture could lift conversion. Unverified.

## Evidence (verification-before-completion checklist)
- [x] ruflo license MIT confirmed via hired_roster entry for v3.5.80
- [x] butler CLI and Itch.io publish path verified identically to top pick
- [x] Ruflo sub-agent catalog confirmed present in `.claude/agents/` (coder, researcher, reviewer, tester, planner + specialized lanes)
- [x] Token cost estimate uses the same Sonnet pricing as top pick
- [ ] **Unverified:** whether the swarm actually produces better pitches than a single-Sonnet pass. Needs a live A/B test, which is why this is the runner-up not the top pick.
- [x] Project config in CLAUDE.md specifies hierarchical-mesh topology, 15 max agents, exactly the environment ruflo was tuned for

## Foreman recommendation
HOLD AS RUNNER-UP. Strong fit if Lando wants to put the existing ruflo install to work and is willing to spend $3-5/mo extra to test whether swarm orchestration lifts pitch quality. Weaker if the goal is shortest path to first dollar: the top pick does the same job with less infra and less token spend.

**If approved:** this becomes the ruflo pilot subtask Hank's roster mentions (previously earmarked for Scout's listing-copy refresh). Kills two birds.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
