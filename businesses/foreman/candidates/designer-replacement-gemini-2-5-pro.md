# Candidate: Gemini 2.5 Pro via @google/genai Node SDK

*Brief targeted: designer-replacement. Phase: 2. Researched: 2026-04-18. Foreman recommendation: HIRE (third pick, strong aesthetic floor).*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gemini 2.5 Pro is ranked #1 on the WebDev Arena leaderboard, which measures human preference for models' ability to build aesthetically pleasing and functional web apps, meaning it is the single LLM that humans (blind-rated) say produces the most appealing HTML frontend of any current model.

### 2. Monthly cost all-in
- Infrastructure: $0 (no new servers)
- Licensing: $0 (@google/genai SDK is Apache 2.0)
- API usage estimate: ~$3 to $7/month at yard volume
  - Assumption: 10 brief runs/month
  - Assumption: ~25k input tokens, ~18k output tokens per run
  - Gemini 2.5 Pro pricing: $1.25/M input, $10/M output (prompts under 200k tokens)
  - Per run: 25k * $1.25/M + 18k * $10/M = $0.031 + $0.180 = $0.211/run
  - 10 runs * $0.211 = $2.11/month baseline
  - With 2-3x iteration tax: ~$6.30/month realistic
- Other: $0
- **Total: ~$3 to $7/month, the cheapest of the top 3**

Assumptions: 10 briefs/month, stay under 200k token context (easy, our briefs are 2-5k tokens). No cached prompt yet on Gemini API but context is small.

### 3. Projected quality-uplift
Concrete: replaces v10-YELLOW ceiling with v10-GREEN-to-GOLD ceiling on aesthetics specifically. Specific wins:
- **#1 on WebDev Arena.** 147 Elo points ahead of prior leader. This benchmark directly measures what Lando cares about (human preference on aesthetic web app output).
- **Strong on responsive dashboard components.** Independent reviews (Reflex, OpenAIToolsHub) show Gemini 2.5 Pro producing working responsive dashboards on the first attempt, including dark mode and proper architectural choices like separating hook logic.
- **1M token context at no premium.** Means we can pass the entire current concept-v11.html AND the brief AND the rating log in one shot for full-context iteration. No other candidate in the top 3 offers this at the same price point.

Honest: Gemini's strength is aesthetic polish on common patterns (e-commerce, SaaS dashboards, marketing pages). Lando's brief is sci-fi command-deck isometric, which is uncommon. Gemini may default to a polished-but-generic take. Mitigation: the system prompt already specifies the aesthetic hard. Needs a live test.

### 4. Payback period
N/A direct revenue. Lowest-cost path of all three candidates, so payback-on-iteration-count is shortest. If Gemini cuts iteration from 3x to 1x, we save the whole delta in month 1.

### 5. Autonomy score 1-5
5. The `@google/genai` SDK is the unified Node SDK (replaced deprecated `google-generativeai`). Call pattern: `const ai = new GoogleGenAI({apiKey}); const response = await ai.models.generateContent({model: "gemini-2.5-pro", contents: brief, systemInstruction: systemPrompt})`. Returns text. Fully headless.
Evidence for the score: documented at ai.google.dev/gemini-api/docs. Supports both the Studio backend and the Vertex backend without code change.

### 6. Can it pay its own bills
YES. At $3-7/month it is the easiest of the three to justify.

### 7. Can it build something without Lando
YES. Same shape as current hire. Brief in, HTML out.

### 8. One-line kill criteria
If after 3 paid runs the designer does not ship at least one GREEN rating, OR Google API spend exceeds $15/month, fall back to the top pick (Claude Agent SDK + frontend-design skill).

---

## Source
- SDK: `@google/genai` on npm, official Google GenAI SDK. License: Apache 2.0.
- Model: Gemini 2.5 Pro, pricing at ai.google.dev/gemini-api/docs/pricing. $1.25/M input, $10/M output (<200k context).
- Free tier available for small volume.
- Last commit: @google/genai SDK is actively shipped, releases documented at the ai.google.dev pricing page.
- Active maintainer: yes, Google.

## What it does
Gemini 2.5 Pro is Google's frontier model, specifically noted for frontend code generation. The SDK call is a single `generateContent` with model slug, contents (brief), and systemInstruction (our current designer.js SYSTEM_PROMPT). Returns text which we parse with the existing `extractHtml()` helper.

Separately, Google ships `google-stitch` (a design-to-code tool that takes screenshots and produces HTML/CSS) via the Studio web console, which could be a secondary tool for iterating on competitor reference screenshots later, but the primary hire here is just Gemini 2.5 Pro on the brief-to-HTML path.

It does NOT have a runtime skill/plugin mechanism like Claude's Agent SDK. Design philosophy has to be baked into the system prompt.

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js`. Add `designOnceGemini()` mirroring the existing shape.
- **Replaces:** the Sonnet-4 call, same as the other two candidates. Can coexist.
- **Depends on:** GOOGLE_API_KEY env var (new, Lando provisions).
- **Brewington infra cost delta:** net +$0 to +$4/month vs current Sonnet. Cheapest of the three.

## Integration plan if hired
1. `npm install @google/genai` (adds ~8MB, Apache 2.0).
2. Lando provisions GOOGLE_API_KEY and drops into env.
3. Implement `designOnceGemini({briefPath, outputPath})` using `ai.models.generateContent({model: "gemini-2.5-pro", contents: brief, config: {systemInstruction: SYSTEM_PROMPT, maxOutputTokens: 24000}})`.
4. Route v12 concept brief through it alongside the other candidates for a live 3-way bake-off.
5. Log to expenses.jsonl with `path: "gemini-2.5-pro"` tag.

## Risks and trade-offs
- **Aesthetic-default bias toward polished SaaS/e-commerce.** Gemini is rated #1 on WebDev Arena for pleasing web apps, but "pleasing" in the benchmark sample set skews mainstream. Command-deck sci-fi isometric is a niche aesthetic that might not be in Gemini's preference distribution. System prompt must carry the load.
- **No runtime skill mechanism.** Same as GPT-5.4; pure prompt-driven.
- **No proof-check layer.** No equivalent to Opus 4.7's self-check-before-writing behavior documented. Cross-grid CSS bugs may slip through at the same rate as current Sonnet.
- **1M context is flex but also risk.** If the brief mistakenly includes a huge file, no price warning, just a bill. Kill criterion $15/month cap catches this.
- **Safety/content filters historically more aggressive than Anthropic or OpenAI.** Cinematic-dystopian aesthetic prompts have been refused by Gemini in past reports. Flag for watching in v12 run. Mitigation: prompt uses "command deck, flight dispatch, Bloomberg terminal" framing which is non-violent.
- **Unverified claim flagged:** WebDev Arena Elo ranking is from a third-party leaderboard. The methodology is published but the sample bias (what web apps get tested) is not controllable from our end.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: `@google/genai` is Apache 2.0.
- [x] Price confirmed: $1.25/M input, $10/M output at ai.google.dev/gemini-api/docs/pricing.
- [x] Node SDK confirmed: `@google/genai`, unified package replacing old `google-generativeai`.
- [x] Commercial use confirmed: Google's developer-platform ToS permits commercial use.
- [x] Maintenance signal confirmed: active April 2026 per pricing page currency.
- [ ] WebDev Arena #1 ranking confirmed in search summary; not independently re-verified against the live leaderboard.

## Foreman recommendation
HIRE as third pick and cheapest fallback. The WebDev Arena signal is real and worth testing. If Lando wants the bake-off, this is the low-cost slot. If we can only pick one, it is not the top pick, because the command-deck aesthetic is not Gemini's native strength. But it is the right "cheapest path that might still outperform Sonnet" choice, and at under $7/month the cost of finding out is trivial.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
