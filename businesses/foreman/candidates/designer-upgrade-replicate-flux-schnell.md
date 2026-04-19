# Candidate: Replicate + Flux Schnell

*Brief targeted: designer-upgrade. Phase: 2. Researched: 2026-04-17. Foreman recommendation: HIRE (as primary art path, paired with a Sonnet scene composer).*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives the designer bay a programmatic, commercially licensed path to render illustrated isometric-style character portraits and building plates on demand, so Lando stops rating character art as sloppy.

### 2. Monthly cost all-in
- Infrastructure: $0 (Netlify hosting already in place, no new servers)
- Licensing: $0 (Flux Schnell model is Apache 2.0, outputs are Lando's)
- API usage estimate: ~$0.15/month at the yard's real usage
  - Assumption: 10 scene rebuilds per month
  - Assumption: each scene uses 5 character portraits + 5 building plates = 10 images per scene
  - 10 scenes * 10 images = 100 images/month
  - Replicate price: $0.003 per image for Flux Schnell
  - 100 * $0.003 = $0.30/month worst case, $0.15 typical
- Other: $0
- **Total: under $1/month in normal use, hard cap ~$3/month at triple-volume**

Assumptions: Node.js client called from `businesses/lib/designer.js`, portraits rendered once-per-character-per-run at 1024x1024, cached on disk so re-renders only happen when a character's prompt changes.

### 3. Projected monthly infra-savings or quality-uplift
Zero direct revenue. The quality-uplift is concrete: removes the "sloppy characters" problem that caused v5 RED and v6 YELLOW. Lando's rating bar for the livestream diorama is "a stranger on Twitch stays for 2 minutes." Pure LLM cannot hand-draw 5 recognizable tiny humans at that bar. A dedicated image model can. The uplift is the difference between a rated RED site and a rated GREEN site, which is the difference between keeping the designer hire and triggering a full replacement hunt.

### 4. Payback period
N/A for direct revenue. Break-even on productivity is immediate: one avoided v-number rebuild (currently a full Sonnet run at metered cost) pays for several months of Replicate usage.

### 5. Autonomy score 1-5
5. The Replicate Node.js client is called with an API token and a prompt. No human-in-the-loop for generation. The designer bay writes the prompt, fires the call, writes the output to disk, composites into the HTML. Lando never touches the generation step.
Evidence for the score: `replicate` npm package v1.4.0, `replicate.run(model, { input })` is a single async call, outputs come back as URLs or file objects, no approval step in the API.

### 6. Can it pay its own bills
YES. Monthly cost under $1 at yard volume. Even at 10x volume it stays under the $30 cap Lando set. No revenue required to justify.

### 7. Can it build something without Lando
YES. Integration lives inside the designer bay's tick cycle. Prompts are written by the Sonnet planner (already hired). Images come back, designer composites, HTML ships. Lando only sees the rating bar at the end.

### 8. One-line kill criteria
If after 3 paid runs the rating_log does not show at least one GREEN, or if a single month's Replicate spend ever exceeds $10, fire this path and fall back to the Kenney CC0 asset backup.

---

## Source
- Repo / listing URL: https://github.com/replicate/replicate-javascript (official Node client), model page https://replicate.com/black-forest-labs/flux-schnell
- License: replicate-javascript client is Apache 2.0. FLUX.1 [schnell] model is Apache 2.0, outputs are free for personal, scientific, and commercial use.
- Last commit: replicate-javascript v1.4.0 published ~November 2025 (roughly 5 months ago per npm). Flux Schnell model is actively hosted and served on Replicate as of April 2026.
- Stars / downloads / sales: Replicate is a large commercial platform hosting thousands of models. replicate-javascript is the official client, npm package name `replicate`.
- Active maintainer: Yes. Replicate as a company ships continuously. Flux Schnell is maintained by Black Forest Labs.

## What it does
Flux Schnell is a fast, Apache-2.0 text-to-image model from Black Forest Labs. Replicate hosts it behind a simple API. The Node.js client (`npm install replicate`) accepts a model slug and an input object, returns generated image URLs or file objects in 1-3 seconds.

For the yard's livestream diorama use case, the pattern would be:
1. Designer writes a prompt per character: "3/4 isometric view, rustic auto-yard worker, tool belt and cap, Stardew Valley body proportions, golden hour warm palette, solid color blocks, no outline detail noise, simple readable silhouette."
2. Replicate returns a PNG. Designer converts to a transparent SVG or keeps as PNG sprite.
3. Same pattern for each of the 5 character slots and for building plates.
4. Scene HTML is assembled by the existing Sonnet designer, which now composites Flux-rendered art instead of hand-drawing SVG.

Multi-character-in-one-image is a known Flux weakness, which is why the plan is **one image per character, composite in HTML**. This matches the v6 brief's "inline SVG / PNG sprite per character, positioned in an isometric CSS scene."

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js` (existing). Adds a new step: generate-portraits-then-compose.
- **Replaces:** the pure-LLM-draws-characters step that Lando rated sloppy.
- **Depends on:** REPLICATE_API_TOKEN in env. A cache directory `businesses/builder/assets/characters/` so we don't re-pay for identical prompts.
- **Brewington infra cost delta:** under $1/month.

## Integration plan if hired
1. `npm install replicate`
2. Add `REPLICATE_API_TOKEN` to the env (Lando provides)
3. In `designer.js`, insert a pre-render step: for each of the 5 agent names, check cache, if cache miss call `replicate.run("black-forest-labs/flux-schnell", { input: { prompt, aspect_ratio: "1:1" } })`, save to `assets/characters/<slug>.png`
4. Pass relative sprite paths into the Sonnet prompt so it composites instead of draws
5. First run on v7 of the command-center brief, Lando rates, kill-clock resets

## Risks and trade-offs
- **Multi-character consistency is a known weak spot.** Mitigation: one character per image, composite in HTML. This is the plan, not a workaround.
- **Style drift run to run.** Mitigation: seed every call with a deterministic integer per character slug so Jax always looks like Jax across reruns.
- **Apache 2.0 on the model, but Replicate's own ToS also applies.** Spot-checked: commercial use is explicitly permitted on the Flux Schnell model page. Lando should still glance at Replicate's ToS before the first paid run.
- **Per-image price could change.** $0.003 has been the Flux Schnell rate on Replicate for months. Kill criterion already caps monthly spend at $10.
- **Alternative platform: fal.ai.** Functionally equivalent, also $0.003/megapixel, slightly faster. If Replicate raises prices, we switch providers in a day.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: Flux Schnell is Apache 2.0 per Replicate model page and independent coverage
- [x] Price confirmed: $0.003 per image on Replicate
- [x] Node SDK confirmed: npm package `replicate` v1.4.0, docs at https://replicate.com/docs/get-started/nodejs
- [x] Maintenance signal confirmed: model actively hosted April 2026, client published within 6 months
- [x] Commercial use confirmed: outputs usable for personal, scientific, and commercial purposes
- [x] Multi-character limitation flagged and mitigated in the integration plan

## Foreman recommendation
HIRE as the primary art path. Pair with the Sonnet composer that the designer bay already has. This is the cleanest way to remove the "sloppy characters" rating while keeping monthly cost near zero. The one-character-per-image pattern is not a workaround, it is the right architecture for 5 distinct silhouettes.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
