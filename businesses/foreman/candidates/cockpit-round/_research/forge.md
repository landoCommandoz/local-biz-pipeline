# FORGE research notes (Designer, rebuild specialist)

*Cluster: creative. Hunter: HANK. Date: 2026-04-18.*

## Mission re-stated

FORGE is the rebuild specialist inside the Blueprint System rating loop. JAX already ships first-pass HTML via `businesses/lib/designer.js` (Sonnet-4). FORGE picks up only when a section rates below 8 (RED or YELLOW). FORGE needs to rebuild with a genuinely different aesthetic, not reshuffle card grids. The core failure mode of JAX on reruns is: same prompt, same model, same generic output. FORGE has to break that loop.

## Six-platform sweep

### 1. GitHub advanced search

- **impeccable** (pbakaus/impeccable): 15k stars, Apache-2.0, 20 specialized design commands (`/polish`, `/audit`, `/distill`, `/bolder`), seven deep reference guides. Drop-in enhancement of the official frontend-design skill. Strong fit for rebuild work because the commands are scoped to specific remediation steps, not a single vague "design" prompt. https://github.com/pbakaus/impeccable
- **Remotion** (remotion-dev/remotion): programmatic video in React. Not a design-rebuild tool, misaligned with FORGE. Moved to PIXEL sweep.
- **ok-skills** (mxyhi/ok-skills): community skill catalog including a vendored impeccable copy. Useful as a backup install source. https://github.com/mxyhi/ok-skills

### 2. Claude Code plugin registry / skills marketplace

- **frontend-design** (official Anthropic): 277k+ installs, MIT. Already installed on this machine per system-reminder. Works, but JAX arguably already benefits from it via default system-prompt patterns. Not differentiated enough for a dedicated rebuild agent.
- **impeccable** (community, Claude Code compatible): same repo as above, distributed as a Claude Code skill with `/polish`, `/audit`, `/bolder` commands. These are rebuild-shaped commands, which is exactly FORGE's job.
- **ui-ux-pro-max** (installed per env): 67 styles, 96 palettes, 57 font pairings. Good raw variety but generic. Useful as a secondary skill behind impeccable.

### 3. Apify Actor Store

- No actor is shaped like "design variation generator." Apify is scraping infrastructure. Not applicable to FORGE.

### 4. RapidAPI + official APIs

- **v0 by Vercel API**: $3/M input, $15/M output tokens. API access gated behind $20/mo Premium plan. Token-based, similar to Anthropic. Pros: React-native output, Vercel's design model explicitly trained on component taste. Cons: $20 flat fee even if unused, output is React not standalone HTML, re-platforming cost is real. https://v0.app/pricing
- **Replicate Flux Pro / Seedance / Minimax**: image+video generation. Not design-rebuild tools; asset generators. Flux Schnell is already earmarked for JAX character art under a separate hire.
- **Runway API**: $28/user/mo minimum, video-heavy. Not relevant.

### 5. Product Hunt / Gumroad / Indie Hackers

- **impeccable** is described in multiple March-April 2026 writeups (Medium, Snyk, UX Planet, Abduzeedo, Emelia) as "the most popular design skill in the Claude Code ecosystem" crossing 15k stars "in days." Multiple independent reviewers say it reliably breaks the AI-slop aesthetic that generic Claude output defaults to. This is the single strongest quality signal I found in the sweep.
- No Gumroad "FORGE-style rebuild pack" product found. Revenue path for FORGE is saved-rebuild-cost on Lando's own client sites, not an external product.

### 6. Reddit revenue threads

- r/ClaudeAI and r/webdev March 2026 threads cite impeccable as the fix for "everything Claude makes looks the same." No hard-dollar revenue threads because the skill is free and benefits are quality-side.

## Rubric scoring (0-10 each, weighted)

| Candidate | Revenue evidence (35%) | Pipeline fit (25%) | Autonomy (20%) | Install (10%) | Licensing (10%) | Weighted |
|---|---|---|---|---|---|---|
| impeccable skill + Opus 4.7 | 6 (indirect, saves rebuild loops) | 10 (drop-in, same API key) | 10 | 10 | 10 | **8.10** |
| frontend-design alone | 5 | 7 (already present, not differentiated) | 10 | 10 | 10 | 7.05 |
| v0 Vercel API | 5 | 4 (output is React, re-platform cost) | 9 | 5 | 6 | 5.45 |

## Winner

**impeccable skill + Opus 4.7 via Claude Agent SDK**, deployed as FORGE's rebuild loop. Enhances the official frontend-design skill with 20 rebuild-shaped commands. Apache-2.0. Vendored into `.claude/skills/impeccable/`. Opus 4.7 on proof-check pass catches cross-grid mistakes that Sonnet misses.

## Runners-up

1. frontend-design (already installed) as fallback if impeccable vendoring fails a license review
2. v0 by Vercel API as a "last resort different-model" pass if impeccable+Opus both rate YELLOW three times in a row

## Kill criteria

If after 3 paid rebuild runs FORGE does not ship at least one GREEN, OR if monthly Anthropic spend on FORGE exceeds $25, revert to frontend-design+Sonnet and open a runner-up hunt.

## Blocker if no

No blocker. impeccable is open-source Apache-2.0, no credentials beyond ANTHROPIC_API_KEY (already present).
