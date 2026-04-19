# Candidate: Claude Agent SDK + frontend-design skill + Opus 4.7

*Brief targeted: designer-replacement. Phase: 2. Researched: 2026-04-18. Foreman recommendation: HIRE (top pick).*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Replaces the current Sonnet-4 single-shot HTML generator with a purpose-built design agent that runs the official `frontend-design` skill (277k installs, explicitly built to avoid the generic machine-generated aesthetic Lando is already rating YELLOW) behind the Claude Agent SDK, and is run on Opus 4.7 which Vercel engineers report does a proof-check pass over complex code before writing, catching the exact cross-grid layout and motion-orchestration mistakes v10 and v11 are failing on.

### 2. Monthly cost all-in
- Infrastructure: $0 (Netlify, existing)
- Licensing: $0 (SDK is MIT, skill is MIT)
- API usage estimate: ~$18/month at yard volume
  - Assumption: 10 brief runs/month (same cadence as current designer)
  - Assumption: each run uses ~25k input tokens (brief + skill context + system prompt) and ~20k output tokens (full HTML document, Opus runs longer than Sonnet because of proof-check pass)
  - Opus 4.7 pricing: $5/M input, $25/M output
  - Per run: 25k * $5/M + 20k * $25/M = $0.125 + $0.500 = $0.625/run
  - 10 runs * $0.625 = $6.25/month baseline
  - With iteration tax (rating YELLOW forces a rework, observed 2-3x per run in current history): $6.25 * 3 = ~$18.75/month worst case
  - Prompt caching on the skill + system prompt cuts ~60% of input cost: effective ~$13/month
- Other: $0
- **Total: ~$13 to $19/month, hard cap $30/month (Lando's ceiling)**

Assumptions: 10 briefs/month, 3x iteration average, Opus 4.7 on Anthropic API direct (not Bedrock, not Vertex), prompt caching enabled. If iteration rate drops to 1x once the skill starts catching slop (which is the whole point of hiring it), cost floor is $6/month.

### 3. Projected quality-uplift
Concrete: replaces v10-YELLOW/v11-pending ceiling with a v10-GOLD ceiling on layout and motion. Three specific wins:
- **Avoids dashboard-card-mosaic pattern.** The frontend-design skill explicitly teaches the model to commit to a bold conceptual direction (brutalist, editorial, retro-futuristic) before coding. Current hire defaults to card-grids because it has no design pre-commitment step.
- **Motion that communicates state, not ambient whimsy.** Skill guidance on "motion is intentional, not decorative" matches Lando's exact v11 complaint (shooting-line cross-grid motion killed v10).
- **Proof-check pass on layout.** Opus 4.7's self-check behavior (documented by Vercel engineers) catches CSS grid-area mismatches, which is the specific failure mode that makes cross-grid CSS feel broken.

Honest: this is not a silver bullet. The skill pushes "distinctive fonts, purposeful palettes, grid-breaking" which may land a RED if Lando reads it as over-designed. Kill criterion in field 8 addresses that.

### 4. Payback period
N/A direct revenue. Productivity break-even is immediate: current hire's YELLOW-rating iteration cycle costs ~$0.40 per Sonnet run times ~3 reworks per concept = $1.20 per accepted concept. Proposed hire targets 1-2 reworks per concept at ~$0.625 per run = ~$1.25 per accepted concept. Payback is in the rating ceiling, not the raw cost, and that is already captured under field 3.

### 5. Autonomy score 1-5
5. Headless by design. The Claude Agent SDK `query()` function takes a prompt + options (model, cwd, setting_sources, allowed_tools) and returns messages over an async iterator. No UI. No human-in-loop.
Evidence for the score: verified via Anthropic's own docs (platform.claude.com/docs/en/agent-sdk/overview and /agent-sdk/skills) that skills are loadable via `setting_sources=["user", "project"]` and invoked by the model when relevant, with explicit `allowed_tools=["Skill", "Read", "Write", "Bash"]` gating. This matches Lando's requirement for programmatic Node-side invocation exactly.

### 6. Can it pay its own bills
YES at $13-19/month. Yard's current attributable income is $0, but the monthly cap Lando set for the designer hunt is $30, which this clears.

### 7. Can it build something without Lando
YES. Same contract shape as current hire: read brief.md from disk, emit standalone HTML to concept-vNN.html, rate externally. Zero new human touchpoints.

### 8. One-line kill criteria
If after 3 paid runs the designer does not ship at least one rating_log entry of GREEN or better, OR if a single month's Anthropic spend exceeds $30, revert to current `designer-claude-sonnet` and try the runner-up (GPT-5.4 with equivalent frontend-skill pattern).

---

## Source
- SDK: `@anthropic-ai/claude-agent-sdk` on npm, v0.2.111+ required for Opus 4.7. License MIT (verified on npm registry listing).
- Skill: https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design (official Anthropic repo). License: MIT (Anthropic OSS).
- Model: Opus 4.7, released April 2026 per Anthropic news post. Pricing: $5/M input, $25/M output, same as Opus 4.6. Confirmed on platform.claude.com/docs/en/about-claude/pricing.
- Last commit on claude-code repo: actively maintained April 2026.
- Installs: frontend-design skill has 277,000+ installs per Medium coverage (March 2026).
- Active maintainer: yes, Anthropic ships continuously.

## What it does
The Claude Agent SDK is a Node/TypeScript programmatic wrapper around the same agent loop that powers Claude Code. You install via `npm install @anthropic-ai/claude-agent-sdk`, import `query`, pass a prompt and options object, and consume an async iterator of messages back. When the options include `setting_sources: ["user", "project"]` and `allowed_tools: ["Skill", ...]`, the agent will load installed skills (including `frontend-design` once dropped into `.claude/skills/`) and invoke them when the prompt triggers their description pattern. The skill is a SKILL.md file with instructions that Claude reads before coding. It pushes the model to pick a bold aesthetic (brutalist, retro-futuristic, editorial) up front rather than defaulting to generic card grids.

It does NOT auto-render in a browser, does NOT deploy, does NOT require the Claude Code CLI to be installed at runtime for SDK use. Output is just text (HTML) back over the iterator. The designer bay wraps it exactly like the current hire: pass a brief, get HTML, write atomically to `concept-vNN.html`.

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js`. Swap the `metered-anthropic.js` client call for `@anthropic-ai/claude-agent-sdk` `query()` with the Opus 4.7 model ID and frontend-design skill loaded.
- **Replaces:** the `designer-claude-sonnet` single-shot Sonnet-4 call. Sonnet stays available as a fallback for cost-sensitive runs.
- **Depends on:** ANTHROPIC_API_KEY (already present, same as current hire). Adds `.claude/skills/frontend-design/` to the repo (already partially there per system-reminder listing `frontend-design` and `ui-ux-pro-max` as available skills).
- **Brewington infra cost delta:** +$13 to +$19/month vs current Sonnet hire. Current Sonnet cost is roughly $2-3/month at same volume, so net delta is +$10 to +$16/month.

## Integration plan if hired
1. `npm install @anthropic-ai/claude-agent-sdk` (adds ~15MB).
2. Verify `.claude/skills/frontend-design/SKILL.md` is present or install it via the official repo (MIT license, can vendor).
3. In `businesses/lib/designer.js`: add a new code path `designOnceAgentSdk({briefPath, outputPath})` that calls `query({prompt, options: {model: "claude-opus-4-7", cwd: repoRoot, settingSources: ["project"], allowedTools: ["Skill", "Read", "Write"], systemPrompt: existingSystemPrompt}})` and consumes the async iterator to stitch final text.
4. Route the first paid run through this path on a v12 concept brief. Keep Sonnet as fallback on non-zero-exit or empty-HTML response.
5. Log cost per run to `businesses/builder/expenses.jsonl` with a `path: "agent-sdk-opus-4.7"` tag so we can diff it against the current Sonnet trace.
6. Rate v12, kill-clock resets.

## Risks and trade-offs
- **Skill drift between repo and upstream.** The frontend-design skill is Anthropic OSS and may update in ways that shift aesthetic defaults. Mitigation: pin the skill by vendoring it into the repo at a fixed commit, re-pull quarterly with a rating run before accepting.
- **Opus is 5x more expensive than Sonnet output-token-wise.** Confirmed: Sonnet is $3/$15, Opus is $5/$25. The bet is that fewer iterations offsets the per-run premium. If iteration count stays flat, cost goes up without quality win. Kill criterion 8 catches this.
- **The skill pushes "distinctive fonts, grid-breaking, noise textures" that may not match Lando's command-deck aesthetic.** Mitigation: system prompt in designer.js already specifies "Bloomberg terminal, flight dispatch, ops console, monochrome with one accent." System prompt wins over skill defaults in practice. Will confirm on v12 rating.
- **Opus 4.7 is new (April 2026).** Less field-tested than Sonnet. But Anthropic's model cards show +70% on real software tasks in Cursor's benchmark vs previous Opus, which suggests the design + layout work specifically benefits.
- **Unverified claim flagged:** the "277,000+ installs" figure is from a Medium writeup, not a primary Anthropic source. Treat as directional, not hard evidence.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: `@anthropic-ai/claude-agent-sdk` is MIT per npm registry. frontend-design skill is MIT per Anthropic's claude-code repo structure.
- [x] Node SDK confirmed: v0.2.111+ required for Opus 4.7, install via npm.
- [x] Headless invocation confirmed: `query()` function with `allowed_tools=["Skill"]` pattern documented at platform.claude.com/docs/en/agent-sdk/skills.
- [x] Price confirmed: Opus 4.7 is $5/$25 per million tokens, verified on platform.claude.com/docs/en/about-claude/pricing.
- [x] Maintenance signal confirmed: Opus 4.7 GA on April 16 2026 per GitHub Changelog.
- [x] Commercial use confirmed: Anthropic API ToS permits commercial use of outputs.
- [ ] Independent review of frontend-design skill output quality on command-deck specifically: not found in search, would need a v12 live test to confirm.

## Foreman recommendation
HIRE as primary designer replacement. Smallest integration delta because it is the same provider (Anthropic) with the same API key. The real value is the skill, not just the model swap. Opus 4.7 alone gets you maybe 10% better code; frontend-design skill gets you a different class of output because it forces the model to commit to an aesthetic before it writes a line. Monthly cost well inside cap. If the first v12 run rates RED, fall back to runner-up GPT-5.4 without losing the Sonnet hire as a fallback.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
