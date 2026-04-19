# Candidate: impeccable skill + Opus 4.7 (via Claude Agent SDK)

*Brief targeted: cockpit-round / FORGE (designer, rebuild specialist). Phase: 1. Researched: 2026-04-18. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives FORGE a purpose-built rebuild loop (20 `/polish`, `/audit`, `/bolder`, `/distill` commands) on Opus 4.7's proof-check pass, so sections rated below 8 get a materially different aesthetic on the second pass instead of the same card-grid Claude defaults to.

### 2. Monthly cost all-in
- Infrastructure: $0 (same Netlify, same repo)
- Licensing: $0 (impeccable is Apache-2.0, Claude Agent SDK is MIT)
- API usage estimate: ~$12/month
  - Assumption: 8 rebuild runs per month (only sections rated below 8 trigger FORGE, not every build)
  - Assumption: each run uses ~30k input tokens (brief + skill context + current rated-low HTML) and ~18k output tokens
  - Opus 4.7 pricing: $5/M input, $25/M output
  - Per run: 30k * $5/M + 18k * $25/M = $0.15 + $0.45 = $0.60/run
  - 8 runs * $0.60 = $4.80/month baseline
  - With prompt caching on skill + system prompt, effective ~$3/month
  - With retry budget (1 retry per run if first rebuild rates RED): up to ~$12/month
- Other: $0
- **Total: $3 to $12/month, hard cap $25/month**

Assumptions: FORGE is triggered only on ratings below 8. Cap enforced in `businesses/lib/designer.js` via per-run budget + monthly spend guard in `expenses.jsonl`.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 6 hours/month avoided rating loops = $300 at $50/hr. Every section stuck in RED/YELLOW reruns eats Lando's rating time and delays client site sign-offs. Impeccable's explicit aesthetic commands (`/bolder`, `/distill`) break out of card-grid defaults on the first rebuild, not the fifth.

Indirect revenue: enables Brewington Digital's $497/mo Growth tier to ship "one aesthetic rebuild per quarter, on demand" as a subscription feature. Even one Growth upsell from that positioning pays the FORGE bill for the year.

Assumptions: 1 in 4 section builds currently needs a rebuild. FORGE cuts rebuild rate by half, avoiding ~3 Lando-reviewed reruns per month.

### 4. Payback period
Immediate on productivity savings. Revenue payback: one Growth upsell within ~2 months covers a full year of FORGE operating cost.

### 5. Autonomy score 1-5
5. Called from `businesses/lib/designer.js` via `@anthropic-ai/claude-agent-sdk` `query()` with the impeccable skill loaded. No human-in-loop during generation. FORGE's tick cycle: read rating below 8, read current HTML, invoke rebuild command, write to `concept-vNN+1.html`, hand back to rating loop.

Evidence for the score: Claude Agent SDK documented headless invocation pattern (platform.claude.com/docs/en/agent-sdk/overview). Impeccable is a local skill file read by the SDK at invocation. No external auth, no webhook, no browser.

### 6. Can it pay its own bills
YES. Under $12/month in expected use, inside the $25/month kill cap. Even without direct revenue, productivity savings clear it 10x.

### 7. Can it build something without Lando
YES. Rebuild trigger is automated off the rating table. FORGE reads the rating entry, picks the correct impeccable command based on the critique ("grid broken" -> `/distill`, "generic card" -> `/bolder`), runs, emits HTML. Lando sees only the rerated output.

### 8. One-line kill criteria
If after 3 paid rebuild runs FORGE does not produce at least one rating of GREEN, OR if monthly Opus spend exceeds $25, revert to frontend-design skill on Sonnet-4 and open a runner-up hunt.

---

## Source
- Skill repo: https://github.com/pbakaus/impeccable (15,000+ stars, Apache-2.0, ships as Claude Code skill with 20 design commands)
- Evidence review: https://abduzeedo.com/impeccable-open-source-ai-design-skill-better-ui (independent review, April 2026)
- SDK: `@anthropic-ai/claude-agent-sdk` on npm, MIT
- Model: Opus 4.7, GA April 2026, $5/M input, $25/M output per platform.claude.com/docs/en/about-claude/pricing
- Last commit on impeccable: active, v1.0.0 shipped Feb 2026, ongoing updates
- Stars: 15k+ GitHub (crossed in days per multiple 2026 writeups)
- Active maintainer: yes, Paul Bakaus (former Google engineer, creator of Khroma and jQuery UI)

## What it does
Impeccable is an enhanced Claude Code skill that builds on Anthropic's official frontend-design skill. It adds 20 named design commands scoped to specific remediation actions (`/polish`, `/audit`, `/distill`, `/bolder`, `/motion`, `/responsive`, etc.) and seven deep reference guides covering typography, color and contrast, spatial design, motion, interaction, responsive design, and UX writing. The commands are rebuild-shaped, which matches FORGE's job exactly: a rating critique maps cleanly onto a command.

It does NOT render images, does NOT replace the HTML writer, does NOT require a separate runtime. It is a set of markdown instructions the Claude Agent SDK loads at invocation time to push the model toward stronger, more distinctive design choices instead of card-grid defaults.

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js`. Add a `rebuildOnce({ briefPath, currentHtmlPath, ratingCritique, outputPath })` function that maps critique text to an impeccable command, calls the Claude Agent SDK with the skill loaded and Opus 4.7 set as the model.
- **Replaces:** nothing. FORGE is additive. JAX keeps first-pass duty; FORGE handles sub-8 rebuilds only.
- **Depends on:** ANTHROPIC_API_KEY (already present), impeccable skill vendored at `.claude/skills/impeccable/` (Apache-2.0 so vendoring is fine), `@anthropic-ai/claude-agent-sdk` npm install.
- **Brewington infra cost delta:** +$3 to +$12/month over current JAX-only baseline.

## Integration plan if hired
1. Vendor impeccable at a fixed commit into `.claude/skills/impeccable/` under the existing repo
2. `npm install @anthropic-ai/claude-agent-sdk`
3. Add `businesses/lib/forge.js` modeled after `designer.js`: reads rating critique, picks command, calls `query()` with `settingSources: ["project"]`, `allowedTools: ["Skill", "Read", "Write"]`, `model: "claude-opus-4-7"`
4. Route any section rated below 8 through FORGE in the Blueprint System loop (single line change in the rating dispatcher)
5. Log each run to `businesses/builder/expenses.jsonl` with `path: "forge-opus-impeccable"` so spend is diffable
6. First rebuild run on the first section that rates below 8, Lando rates, kill-clock starts

## Risks and trade-offs
- **Impeccable pushes bold fonts, grid-breaking, noise textures.** Lando's god-view palette rule is locked (see feedback_god_colors_palette.md). Mitigation: system prompt in `forge.js` pins palette to the god-view colors and tells impeccable to adapt within that palette only.
- **Opus 4.7 is 5x more expensive than Sonnet per output token.** Budget guard in the tick cycle enforces the $25 cap.
- **Skill drift between vendored copy and upstream.** Mitigation: pin to a commit, re-pull quarterly with a rating run.
- **Not every critique maps cleanly to a command.** Mitigation: fallback command is `/polish` which is the general-purpose rebuild.
- **Unverified claim flagged:** the 15k-stars-in-days figure comes from secondary writeups, not a GitHub API read. Directional, not hard evidence.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: Apache-2.0 on impeccable repo and NOTICE file
- [x] Independent review found and linked (Abduzeedo, Snyk, Emelia April 2026 coverage)
- [x] Claude Agent SDK MIT license verified on npm
- [x] Opus 4.7 pricing verified at platform.claude.com/docs/en/about-claude/pricing
- [x] Commercial use permitted (Apache-2.0 skill + Anthropic API ToS)
- [ ] Star count via live GitHub API read not executed this round; secondary sources agree on 15k+

## Runners-up
1. **frontend-design skill alone on Sonnet-4.** Lower cost (~$4/month), already installed. Loses impeccable's command granularity. Fall back if impeccable proves to conflict with the god-view palette.
2. **v0 by Vercel API.** React-native output, $20/mo floor, re-platforming cost for HTML pipeline. Use only as a last-resort different-model pass.

## INSTALLABLE_NOW
YES. No credentials needed beyond the ANTHROPIC_API_KEY already in the env. Skill is open-source and vendorable.

## BLOCKER_IF_NO
None. Everything required is either installed or free + vendorable.

## Foreman recommendation
HIRE. This is the single cleanest quality-uplift available to the rebuild loop, at the lowest install complexity. Same API key, same repo, new skill file, new library call.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
