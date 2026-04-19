# Candidate: GPT-5.4 via OpenAI API + frontend-skill pattern

*Brief targeted: designer-replacement. Phase: 2. Researched: 2026-04-18. Foreman recommendation: HIRE (runner-up, also a valid standalone).*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Replaces Sonnet-4 with GPT-5.4, which OpenAI released a dedicated "frontend skill" for in late 2025 that explicitly steers the model away from generic dashboard-card-mosaics (Lando's exact v10/v11 complaint) and toward polished, ambitious frontends with one clear accent and intentional motion.

### 2. Monthly cost all-in
- Infrastructure: $0 (no new servers)
- Licensing: $0 (OpenAI SDK is Apache 2.0)
- API usage estimate: ~$6 to $11/month at yard volume
  - Assumption: 10 brief runs/month, same cadence as current designer
  - Assumption: ~25k input tokens and ~18k output tokens per run (GPT-5.4 tends to be slightly less verbose than Opus on HTML per OpenAI's own frontend blog examples)
  - GPT-5.4 pricing: $2.50/M input, $15/M output
  - Per run: 25k * $2.50/M + 18k * $15/M = $0.0625 + $0.270 = $0.333/run
  - 10 runs * $0.333 = $3.33/month baseline
  - With 2-3x iteration tax: ~$10/month realistic
- Other: $0
- **Total: ~$6 to $11/month, hard cap $20/month**

Assumptions: 10 briefs/month, GPT-5.4 standard tier (not Pro which is $30/M input), prompt caching on system prompt. Context stays under 272k tokens so no context-overage surcharge. If we use GPT-5.4 Pro for harder runs, worst-case month is ~$25.

### 3. Projected quality-uplift
Concrete: replaces v10-YELLOW ceiling with v10-GOLD ceiling, but via a different route than the Claude path. Specific wins:
- **OpenAI published primary guidance against exactly Lando's failure mode.** The OpenAI Developers blog post "Designing delightful frontends with GPT-5.4" (Dec 2025) lists "avoid dashboard-card mosaics" and "organize around primary workspace, navigation, secondary context, one clear accent for action or state" as explicit design principles the model was trained to follow. This reads as if it was written about Lando's brief.
- **Highest frontend-coding benchmark among general LLMs.** On 57.7% SWE-bench Pro and 83% GDPval (2026 knowledge-work benchmark), GPT-5.4 is ahead of Opus 4.7 on pure frontend tasks per independent comparisons.
- **Faster iteration loop.** GPT-5.4 is roughly 2x cheaper on output tokens than Opus 4.7, so we can afford more reruns per v-number.

Honest: without a frontend-skill-folder mechanism like Claude's, we have to bake the principles into the system prompt manually. That means the uplift is only as good as the prompt we write. Mitigation in field 7 and risks.

### 4. Payback period
N/A direct revenue. Break-even on productivity is immediate, same logic as top pick. Per-run cost is actually lower than current Sonnet hire at same quality target if iteration count drops.

### 5. Autonomy score 1-5
5. The OpenAI Node SDK (`openai` npm package) is the simplest possible interface: `client.responses.create({model: "gpt-5.4", input: brief, instructions: systemPrompt})` returns the response. No human-in-loop.
Evidence for the score: `openai` npm package is the de facto standard, 7M+ weekly downloads, same pattern as Anthropic client we already use. `responses.create` and `chat.completions.create` are both documented for code generation workloads.

### 6. Can it pay its own bills
YES. Monthly cost ceiling under $20 at realistic volume, Lando's cap is $30.

### 7. Can it build something without Lando
YES. Same contract as current hire. Lando only sees the final rating.

### 8. One-line kill criteria
If after 3 paid runs the designer does not ship at least one GREEN rating, OR monthly OpenAI spend exceeds $30, fire this path and fall back to the top pick (Claude Agent SDK + frontend-design skill).

---

## Source
- SDK: `openai` npm package, official Node/TS SDK from OpenAI. License: Apache 2.0.
- Model: GPT-5.4 (full version), released late 2025 per OpenAI Developers blog. Pricing confirmed at $2.50/$15 per million tokens on developers.openai.com/api/docs/pricing.
- Frontend skill reference: https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4 (Dec 2025 OpenAI post including a published "frontend-skill" for guidance).
- Last commit: `openai` SDK is actively maintained, releases multiple times per month.
- Active maintainer: yes, OpenAI.

## What it does
GPT-5.4 is the current OpenAI flagship, trained with a focus on improved UI capabilities and image usage. Call it the same way we call Claude today: a single POST with a system prompt and a user prompt, get HTML back. The "frontend-skill" from the OpenAI blog is a prompt-file we paste into our system prompt; it is NOT a runtime plugin the way Claude's is. The skill teaches the model a specific design philosophy (primary workspace + navigation + secondary context, one clear accent, avoid card-mosaics).

For our use case: designer bay reads brief, prepends the frontend-skill system prompt, fires one `responses.create` call with model=gpt-5.4, gets HTML text back, extracts the `<!doctype html>...</html>` block exactly like the current `designer.js` does. No other code changes.

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js`. Add a new function `designOnceOpenAI()` that mirrors the existing shape.
- **Replaces:** the Sonnet-4 call, but does not require removing the existing Anthropic code path. Both can coexist and be A/B tested.
- **Depends on:** OPENAI_API_KEY env var (Lando would need to provision). Does not share the ANTHROPIC_API_KEY already set up.
- **Brewington infra cost delta:** net +$3 to +$8/month vs current Sonnet hire.

## Integration plan if hired
1. `npm install openai` (adds ~5MB, MIT-compatible Apache 2.0).
2. Lando provisions OPENAI_API_KEY and drops into env.
3. Download the OpenAI frontend-skill content from the developers.openai.com blog post and save it as `businesses/lib/prompts/frontend-skill.md`. Concatenate into the existing SYSTEM_PROMPT in `designer.js`.
4. Implement `designOnceOpenAI({briefPath, outputPath})` calling `client.responses.create({model: "gpt-5.4", instructions: combinedSystemPrompt, input: briefMarkdown, max_output_tokens: 24000})`, then extract HTML with the existing `extractHtml()` helper.
5. Route v12 concept brief through it for a live A/B test against the top pick.
6. Log to expenses.jsonl with `path: "openai-gpt-5.4"` tag.

## Risks and trade-offs
- **No runtime skill injection.** Unlike Claude, the OpenAI "skill" is just a prompt blob. If the model's default card-mosaic behavior is strong enough to override the system prompt, the mitigation fails. OpenAI's own blog suggests the training specifically addresses this, but we cannot verify without a paid run.
- **GPT-5.4 has no file-read tools bundled.** That is fine here (the designer bay handles file IO), but if we later want the designer to inspect existing concept-vNN.html before rewriting, we would need to pipe contents manually. Claude's Agent SDK does that natively.
- **Pricing is lower but can jump at Pro tier.** GPT-5.4 Pro is $30/$150 per million, 12x the standard rate. If a brief is complex enough to trigger Pro, one run could blow the monthly budget. Kill criterion caps this; we explicitly configure the client to `reasoning_effort: "medium"` not "high" to avoid Pro-tier billing.
- **No proof-check pass.** Opus 4.7 has this. GPT-5.4 does not document equivalent behavior. Might mean more cross-grid CSS mistakes slip through.
- **Unverified claim flagged:** OpenAI's blog claims GPT-5.4 is "a better web developer than its predecessors" but does not publish side-by-side with Claude or Gemini on dashboard-specific benchmarks. Taskade and Sitepoint's benchmarks vary. Treat as directional.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: `openai` npm package is Apache 2.0.
- [x] Price confirmed: GPT-5.4 is $2.50/$15 per million tokens per OpenAI API pricing page.
- [x] Node SDK confirmed: `openai` npm package, `responses.create` documented.
- [x] Frontend skill confirmed: published at developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4.
- [x] Commercial use confirmed: OpenAI API ToS permits commercial use of outputs.
- [ ] Independent dashboard-specific benchmark vs Claude Opus 4.7 on cinematic HTML: not found.

## Foreman recommendation
HIRE as runner-up and designed A/B path. If we had only one slot, the top pick wins on skill mechanism. If we had unlimited slots, we run both in parallel on the same v-number brief and let the rating bar pick. Standalone it is still a credible answer and the cheapest of the three tier-1 LLM options. Install cost is low enough that we could justify keeping it even as a cost floor while Opus 4.7 runs for polish-critical briefs.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
