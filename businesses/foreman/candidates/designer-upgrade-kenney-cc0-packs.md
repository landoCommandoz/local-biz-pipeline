# Candidate: Kenney.nl CC0 Isometric Asset Packs + Sonnet Composer

*Brief targeted: designer-upgrade. Phase: 2. Researched: 2026-04-17. Foreman recommendation: HIRE as the backup / deterministic lane.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives the designer bay a zero-cost, deterministic set of isometric character and building sprites that are guaranteed readable at small scale and guaranteed distinct across the 5 agents, without any generation step that can come back sloppy.

### 2. Monthly cost all-in
- Infrastructure: $0 (assets downloaded once, checked into the repo or vendor folder)
- Licensing: $0 (CC0 / public domain, no attribution required, no royalties)
- API usage: $0 (no API, these are static PNG/SVG files)
- Other: $0
- **Total: $0/month, forever**

Assumptions: Lando or the designer bay downloads the relevant packs once (Isometric City, Isometric Tiles Buildings, Isometric Miniature Library, Isometric Landscape) into `businesses/public/assets/kenney/`. No recurring cost.

### 3. Projected monthly infra-savings or quality-uplift
Zero direct revenue. The uplift is a different one than the image-gen path: instead of "higher quality on average with occasional drift", Kenney sprites are "consistent quality every time, no generation lottery." For a 24/7 livestream that never gets a retry, consistency matters more than peak quality. Removes the entire failure mode that generated the v5 RED rating.

### 4. Payback period
Immediate. Cost is $0. Any rating improvement is net positive from first run.

### 5. Autonomy score 1-5
5. Once the packs are on disk, the designer bay picks sprites by filename. No API call, no human approval, no network dependency. Fully autonomous in the tick.
Evidence for the score: all Kenney packs ship as PNG + SVG files; designer.js just reads them.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES. Sprite selection is rule-based ("Jax = tool-belt worker from Miniature Library, Vega = watcher from Isometric City"). Lando writes the mapping once, designer uses it forever.

### 8. One-line kill criteria
If after 2 runs Lando rates the scene RED for "looks like a generic asset-flip game", this path loses to the Flux Schnell hire.

---

## Source
- Repo / listing URL: https://www.kenney.nl/assets (primary), https://kenney.nl/assets/tag:isometric (filtered)
- License: CC0 1.0 Universal (public domain). Free for personal and commercial use, no attribution required, no royalties.
- Last commit: Kenney's All-in-1 asset bundle was updated as recently as 2026-03-13. Individual packs are added continuously.
- Stars / downloads / sales: Kenney is the most-used CC0 game-asset publisher on the internet. Thousands of packs, tens of thousands of downloads per pack on itch.io alone.
- Active maintainer: Yes, Kenney is a full-time asset publisher, active in April 2026.

## What it does
Kenney publishes free CC0 sprite packs. The relevant ones for the yard brief:
- **Isometric City** (128 assets), buildings, roads, street props
- **Isometric Tiles Buildings** (128 assets), shops, shacks, workshops
- **Isometric Miniature Library** (35 assets), small isometric figures
- **Isometric Landscape** (128 assets), terrain tiles, fences, trees

Each pack ships as PNG sprites and (for many packs) SVG source. Style is blocky-low-poly isometric, not Stardew pixel, but the readability is excellent at the 40-60px character scale the brief asks for.

Integration pattern:
1. Download the 4 packs once into `businesses/public/assets/kenney/`
2. Designer bay keeps a mapping file: `{ jax: "miniature-library/worker.png", hank: "miniature-library/foreman.png", ... }` plus building mappings
3. Sonnet composer writes the HTML scene, references sprites via `<img>` or inline base64
4. CSS positions sprites isometrically. Breathing animation via CSS transform.

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/lib/designer.js` and `businesses/public/concepts/concept-v7.html`
- **Replaces:** the sloppy hand-drawn SVG character step
- **Depends on:** one-time download + commit of 4 asset packs (approx 10-20 MB uncompressed, probably 3-5 MB of actually-used sprites)
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Lando downloads the 4 Kenney packs from kenney.nl (free, no login required)
2. Drop into `businesses/public/assets/kenney/` and check in under a `.kenney-license.txt` noting CC0
3. Designer bay writes a `character-map.json` that binds agent display_name to a sprite path
4. Sonnet composer receives the map in its prompt and emits `<img src="/assets/kenney/..." >` tags
5. File size budget: sprites only, no hand-art bloat. Target scene HTML stays under 140 KB.

## Risks and trade-offs
- **Aesthetic mismatch risk.** Kenney isometric style is blocky-low-poly. The v6 brief names Stardew Valley as the reference, which is pixel-top-down. These are not the same look. If Lando wants strictly Stardew pixel, Kenney is the wrong picker. However, the brief also says "Animal Crossing soft palette" and "Sims isometric camera", both of which Kenney maps to better than pure Stardew would.
- **Less bespoke than generated art.** Every yard built with Kenney sprites will look a bit like other yards built with Kenney sprites. Counter: the combination of 5 specific characters in a specific yard, plus the ambient motion and the golden-hour CSS tint, reads as unique.
- **Selection burden is on Lando first time.** Someone has to pick the 5 character sprites and the 5 building sprites. Estimated 30-minute one-time task. After that it is frozen.
- **One pack Lando downloads, not a live install.** This is slightly outside the "standing-order auto-hire" policy since it is not an npm package. Not a license problem, just a manual first step.

## Evidence (verification-before-completion checklist)
- [x] License confirmed: CC0 1.0 Universal across all Kenney asset pages. Explicit "free to use in commercial projects" language on kenney.nl.
- [x] Maintenance signal confirmed: All-in-1 bundle updated 2026-03-13, within the 6-month window.
- [x] Commercial use confirmed: CC0 permits all commercial use, no attribution required.
- [x] Programmatic usability confirmed: files are PNG and SVG, readable by any Node.js `fs` call, no API required.
- [x] Fit with brief verified: Isometric-tagged packs specifically match the "isometric camera, 30-degree tilt" requirement.

## Foreman recommendation
HIRE as a parallel path to the Flux Schnell hire. The two are complementary, not competitors: Kenney gives the deterministic base layer (buildings, ground, props), Flux can generate the 5 unique character portraits if Lando wants bespoke faces. If Lando wants to move fast and cheap, Kenney alone ships the scene at $0 this week.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
