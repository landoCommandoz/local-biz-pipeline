# Candidate: Open Peeps (CC0 SVG mix-and-match people library)

*Brief targeted: designer-upgrade. Phase: 2. Researched: 2026-04-17. Foreman recommendation: runner-up. HIRE-ABLE if Lando rejects the Flux Schnell + Kenney combo.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives the designer bay a programmatic, CC0-licensed, hand-drawn SVG character library that can mix hairstyles, outfits, poses, and expressions into 5 distinct tiny humans entirely from code.

### 2. Monthly cost all-in
- Infrastructure: $0
- Licensing: $0 (CC0 1.0 public domain)
- API usage: $0 (static SVG files, optional DiceBear HTTP API wrapper also free)
- Other: $0
- **Total: $0/month**

Assumptions: Open Peeps SVG library downloaded once into the repo, or accessed via the DiceBear `open-peeps` style wrapper (npm `@dicebear/core` + `@dicebear/open-peeps`), which is MIT-code + CC0-art.

### 3. Projected monthly infra-savings or quality-uplift
Zero direct revenue. The uplift is a **different aesthetic** from the Kenney and Flux paths: hand-drawn line-work people, friendly and casual, strong silhouettes. Pablo Stanley's Open Peeps is the look many onboarding pages and marketing sites use because the characters read as warm and human without needing detail. It is not Stardew pixel, and it is not isometric-blocky. It is hand-drawn SVG with inherent brand warmth.

### 4. Payback period
Immediate. Cost is $0.

### 5. Autonomy score 1-5
5. DiceBear's Node API (`createAvatar(openPeeps, { seed })`) produces a full SVG string from a seed, with no human intervention. Determinism means Jax always looks like Jax.
Evidence for the score: DiceBear documented as callable from Node, MIT code, CC0 art for the open-peeps style.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES. Seed per agent is fixed, output is fully automatic.

### 8. One-line kill criteria
If after 2 runs Lando rates the scene RED for "cartoon-onboarding vibe, not small-town auto-yard", this path loses and Flux or Kenney wins.

---

## Source
- Repo / listing URL: https://www.openpeeps.com (primary), https://pablostanley.gumroad.com/l/openpeeps (official download), https://www.dicebear.com/styles/open-peeps/ (programmatic wrapper)
- License: CC0 1.0 Universal (public domain) on the Open Peeps art. MIT on the DiceBear code that wraps it.
- Last commit: DiceBear core is actively maintained (8.5k stars, ongoing releases). Open Peeps itself is a frozen canonical library by Pablo Stanley, still hosted and distributed.
- Stars / downloads / sales: DiceBear 8.5k stars on GitHub. Open Peeps is one of the most downloaded free illustration libraries on the internet (149+ bundled on iconscout, covered by dozens of design blogs).
- Active maintainer: DiceBear is actively maintained as of April 2026. Open Peeps as source art is stable, not abandoned.

## What it does
Open Peeps is a mix-and-match SVG illustration kit: 18+ hairstyles, dozens of facial expressions, outfits, poses (sitting, standing, gesture). Pablo Stanley built it as a public-domain resource. DiceBear packaged it into a deterministic Node library where `createAvatar(openPeeps, { seed: "jax" })` returns a ready SVG string.

Integration pattern:
1. `npm install @dicebear/core @dicebear/collection`
2. In designer.js, for each of the 5 agents, call `createAvatar(openPeeps, { seed: agent.slug, ...options })`
3. Inject the returned SVG into the scene HTML as inline markup
4. CSS positions each inside its workshop, scales to 40-60px, adds breathing animation via transform
5. Ambient motion via CSS keyframes on the inline SVG

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js`, specifically the character-rendering step
- **Replaces:** the hand-drawn tiny-human SVG blocks that came back sloppy on v5 and v6
- **Depends on:** npm packages only (`@dicebear/core`, `@dicebear/collection`), no external API
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install @dicebear/core @dicebear/collection`
2. Designer bay adds a `characters.js` helper: given agent slug + options, returns an inline SVG string
3. Sonnet composer is told: "do not draw characters, interpolate them via `{{character:jax}}` tokens which will be replaced post-generation"
4. Post-processing step swaps tokens for real SVG
5. File size check: Open Peeps SVGs are tiny, ~5-10 KB each. Five characters is under 50 KB.

## Risks and trade-offs
- **Aesthetic is onboarding-marketing, not small-town-rustic.** Open Peeps reads as friendly-SaaS. The v6 brief explicitly rules out "cozy pastel" and "magical-fantasy" and asks for "small-town auto-yard, golden hour, lived-in, gritty". Open Peeps characters without heavy CSS filtering do not read as gritty.
- **Mitigation:** a golden-hour CSS filter (sepia + warm multiply + slight desaturate) on every Open Peeps SVG can close half the aesthetic gap. It will not make them look like Stardew, but it can make them look like the brand.
- **No built-in isometric pose.** Open Peeps are front-facing / 3/4-standing portraits. They will not render as top-down isometric walking figures. In the CSS scene, each sits "in" their workshop doorway rather than walking the yard.
- **CC0 on art, MIT on code, two licenses to note.** Both permissive, both commercial-use approved, just two license files to reference instead of one.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: CC0 1.0 on the Open Peeps art per openpeeps.com and gumroad listing
- [x] DiceBear package confirmed MIT via GitHub repo description
- [x] Commercial use confirmed: CC0 permits all uses, no attribution required
- [x] Maintenance signal confirmed: DiceBear 8.5k stars, actively shipping, Open Peeps stable canonical source
- [x] Programmatic Node use confirmed: `createAvatar(style, { seed })` is the documented API
- [x] Fit risk flagged: aesthetic does not match "gritty small-town rustic" out of the box

## Foreman recommendation
Runner-up. Cheapest path to 5 distinct, consistently-drawn characters. The aesthetic mismatch with the v6 brief is real, which is why this is runner-up to the Flux Schnell + Kenney combo. If Lando wants to ship something correct tonight with zero cost and zero network calls, this is it. If Lando wants the livestream-diorama rustic aesthetic specifically, Flux wins.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
