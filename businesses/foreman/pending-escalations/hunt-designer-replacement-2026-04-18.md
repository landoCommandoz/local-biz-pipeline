# Hunt summary: designer replacement, 2026-04-18

**Brief:** replace `designer-claude-sonnet` (Sonnet-4 single-shot HTML generator) with a higher-ceiling designer. Current hire has shipped 7 iterations for the command-center dashboard. Rating history: 1 RED, 3 YELLOW, 2 soft-pass, 1 pending. Lando is not satisfied with the quality ceiling and wants a better designer.
**Dossiers filed:** 3
  - designer-replacement-claude-agent-sdk-frontend-skill
  - designer-replacement-gpt-5-4-frontend-skill
  - designer-replacement-gemini-2-5-pro
**My top pick:** designer-replacement-claude-agent-sdk-frontend-skill
**Why top pick:** The Claude Agent SDK is a Node-native `query()` function that programmatically invokes installed skills. The official `frontend-design` skill (MIT, Anthropic OSS, 277k+ reported installs) is literally designed to fix the exact failure mode that produced Lando's YELLOW ratings: it pushes the model to commit to a bold aesthetic direction before writing any code, explicitly steering away from generic card-grid dashboards. Running that skill on Opus 4.7 (which Vercel engineers report does a proof-check pass catching cross-grid layout bugs before writing) addresses both the aesthetic-taste failure AND the layout-correctness failure in a single hire. Same provider as the current hire, so the API key and expense trace already exist. Cost lands at $13-19/month, under the $30 cap.
**Integration effort:** LOW-to-MEDIUM, roughly 3-4 hours: npm install the Agent SDK, vendor the frontend-design skill folder, write a new `designOnceAgentSdk()` function in `businesses/lib/designer.js` that mirrors the existing shape, log costs, route v12 through it. Existing `designer.js` contract, system prompt, and extractHtml helper all stay.
**Runner-up fallback:** designer-replacement-gpt-5-4-frontend-skill. OpenAI's Dec-2025 "Designing delightful frontends with GPT-5.4" blog reads like it was written about Lando's v10/v11 complaint ("avoid dashboard-card mosaics, organize around primary workspace + navigation + secondary context + one clear accent"). GPT-5.4 is the cheapest-per-run of any tier-1 LLM option and OpenAI explicitly trained the model on this design principle set. Weakness vs. top pick: no runtime skill plugin, the design guidance has to be baked into the system prompt manually, so the uplift is capped at "how well can a prompt steer the model" rather than "the model loaded a dedicated skill file."
**Third pick:** designer-replacement-gemini-2-5-pro. Cheapest at $3-7/month. #1 on WebDev Arena for human-preferred aesthetic web output. Weakness: command-deck sci-fi is niche, and Gemini's training bias is toward mainstream SaaS/dashboard/e-commerce polish. Best for a 3-way live bake-off against the other two.

**Decision needed from Lando:**
  - [ ] approve top pick only (Claude Agent SDK + frontend-design skill + Opus 4.7, ~$13-19/mo)
  - [ ] approve top pick PLUS runner-up (A/B test Opus 4.7 and GPT-5.4 on v12, pick the winner by rating. My actual recommendation if budget allows, ~$25-30/mo combined)
  - [ ] approve 3-way bake-off on v12 (all three candidates, let rating decide, ~$25-35/mo for one cycle)
  - [ ] approve runner-up only (GPT-5.4, ~$6-11/mo)
  - [ ] approve third pick only (Gemini 2.5 Pro, ~$3-7/mo)
  - [ ] request more research
  - [ ] reject all, keep current designer and iterate the brief

See dossiers in businesses/foreman/candidates/designer-replacement-*.md

## Context for Lando

The current `designer-claude-sonnet` hire is not a bad HTML-writer. What it is bad at is two specific things:

1. **Committing to a bold aesthetic before coding.** It defaults to generic card-grid dashboards because it has no pre-commitment step. This is a prompt-engineering problem, but prompt engineering has a ceiling. The Claude frontend-design skill (and OpenAI's GPT-5.4 frontend-skill blob) are Anthropic's and OpenAI's own answers to this exact ceiling.
2. **Cross-grid CSS and motion orchestration.** v10's shooting-line cross-grid motion and v11's per-room-local motion both show the model struggling to keep a layout coherent when motion and grid position interact. Opus 4.7 is the first model that documents a proof-check-before-writing pass (per Vercel's internal comparison, 70% on real SWE tasks vs. previous Opus), which is the closest thing to an automated fix for this class of bug.

Three architectures ranked:

1. **Claude Agent SDK + frontend-design skill + Opus 4.7.** Runtime skill injection (not just a prompt blob), proof-check pass on layout. Highest quality ceiling of the three. $13-19/mo. Same provider as current hire.
2. **GPT-5.4 via OpenAI API + frontend-skill prompt blob.** OpenAI's published guidance explicitly targets Lando's failure mode. Cheaper per run than Opus 4.7. No runtime skill mechanism, so uplift is bounded by prompt-steering. $6-11/mo.
3. **Gemini 2.5 Pro via @google/genai.** Highest raw aesthetic rating on WebDev Arena. Cheapest. But aesthetic bias toward mainstream, not command-deck. $3-7/mo.

The current designer hire does not necessarily get fired on this hunt. It can stay as the fallback on cost-sensitive runs while the new primary takes critical briefs. Cost delta is absorbed by the $30/mo designer budget cap Lando set.

## Candidates evaluated but rejected pre-shortlist (total 11 candidates considered)

- **v0.dev Platform API (Vercel).** Has a real Node/TypeScript SDK (`vercel/v0-sdk` on GitHub), Premium plan is $20/mo with Platform API access. REJECTED because v0 outputs React/Next.js code with shadcn components, not standalone vanilla HTML. Would require a framework-to-HTML compile step that we do not have and do not want. Also token-based pricing introduced Feb 2026 makes costs less predictable.
- **bolt.new.** REJECTED. No public programmatic API beyond the WebContainer embed. StackBlitz's WebContainer API is browser-side only. Not callable from a Node tick.
- **lovable.dev "Build with URL" API.** REJECTED. Only one endpoint (generate-app-from-URL), not suited for brief-to-HTML single-shot. Full Node SDK not documented.
- **DeepSeek V3.2.** REJECTED. Cheapest of all at $0.28/$0.42 per million, but benchmark data shows a clear gap on frontend-specific quality vs. Opus 4.7 and GPT-5.4. The cost savings do not justify the quality risk for a hire we are replacing specifically on quality ceiling.
- **Grok 4.** REJECTED. xAI API access is gated and pricing is less transparent than competitors. No published design-specific guidance or skill mechanism. Reliable for coding but not distinctive for design.
- **OpenDevin / Aider / Cline (open-source agents).** REJECTED. These are general-purpose coding agents, not design-first. They orchestrate an underlying LLM (usually Claude or GPT) so we are really just paying for the underlying LLM plus complexity overhead. No aesthetic skill layer.
- **Figma-to-code pipelines (Figma API + plugin).** REJECTED. Requires a human-designed Figma file as input. Our workflow is brief.md in, HTML out. Figma-to-code inverts the flow and adds a human step.
- **Relume / Framer / Galileo / Uizard.** REJECTED. UI-first tools without mature Node SDKs for programmatic brief-to-HTML. Most require human clicks to export.

## Verification notes

- All pricing verified via primary or trusted secondary sources: OpenAI pricing page, Anthropic pricing page, ai.google.dev pricing, npm registry for SDK licenses.
- All three top picks are licensed for commercial use under permissive terms (MIT for Claude Agent SDK, Apache 2.0 for openai and @google/genai).
- All three top picks had activity within 6 months (Opus 4.7 released April 2026, GPT-5.4 released late 2025, Gemini 2.5 Pro actively priced as of April 2026).
- No candidate was installed or run during this hunt. Read-only evidence only.
- The frontend-design skill is already present in the system-reminder listing ("frontend-design" and "ui-ux-pro-max" visible as available skills), so vendoring is likely unnecessary and the integration may be shorter than estimated.
- Flagged unverified claims: (1) "277k installs" for frontend-design skill from a Medium post, not a primary Anthropic source; (2) "70% on real SWE tasks" for Opus 4.7 from Cursor's internal benchmark, not a peer-reviewed number; (3) WebDev Arena Elo for Gemini 2.5 Pro from third-party leaderboard with sample bias we cannot audit.

## Foreman recommendation

Top pick on its own ships the fastest and does the most of the work. Top pick + runner-up on a v12 A/B gives Lando the cleanest quality signal within one cycle and costs ~$25/mo for that cycle, dropping to ~$15/mo after the loser is cut. That is my actual recommendation. Gemini 2.5 Pro stays on the bench as a cheap fallback we can enable if the bake-off surfaces a budget pressure.

Waiting on approval.
