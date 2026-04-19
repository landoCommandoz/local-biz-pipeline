# Command Center Redesign v7: Livestream Diorama, Kenney Art, God Colors

**Project:** command-center-redesign-v7
**Owner bay:** Jax (Builder) via designer hire (claude-sonnet)
**Output path:** `businesses/public/concepts/concept-v7.html`
**Supersedes:** v6 (rated YELLOW)

## One-sentence goal

A 24/7 **livestream-ready diorama** of the Brewington Yard rendered as an isometric scene with tiny Kenney-sprite humans in Kenney-sprite workshops, dynamically rendering all bays from `/api/state`, palette locked to Lando's god colors, designed to hold a Twitch viewer's attention for an hour.

## What v7 fixes that v6 (YELLOW) and v5 (RED) didn't

- **v5 RED:** bays never rendered (API shape bug) and overall look rejected.
- **v6 YELLOW:** "sloppy but better". Direction right, execution rough. LLM freehand SVG characters looked crude.
- **v7 fix:** use **Kenney pre-drawn sprites** (already installed at `businesses/public/assets/kenney/`) instead of asking the LLM to hand-draw SVG. The LLM only composes the scene and wires the data; the art is Kenney.

## LOCKED constraints (do not reinterpret)

### Palette: God Colors (from memory)

Use these exact values:
- `--black: #05070d` — cosmos night, primary background
- `--gold: #f7c873` — divine gleam, wealth signal, lamp glow, active bay accent
- `--bone: #f2ede3` — primary text, day light
- `--cyan: #00e5ff` — ACCENT ONLY for alerts, live-pulse, thought bubbles, the god's-eye indicator
- `--clay: #c44545` — muted biblical red for danger/eviction
- `--sage: #7a8c3a` — muted olive green for success/growth
- `--indigo-night: #1a1f3a` — darker backdrop layer for depth

**Warm dominates. Cyan is punctuation only. Never pastels. Never cartoon-bright.**

### Art: Kenney packs only

All buildings, ground, props, and characters come from the installed Kenney packs at `businesses/public/assets/kenney/`. Reference them as `<img src="/assets/kenney/<pack>/<path>">` in the HTML.

Available packs:
- `blocky-characters/Previews/character-a.png` through `character-r.png` (18 distinct characters, 64x64 PNGs — pick 7 for the 7 bays)
- `isometric-tiles-buildings/PNG/buildingTiles_*.png` (130 sprites — workshops, shacks, shops)
- `isometric-tiles-city/PNG/cityTiles_*.png` (141 sprites — streets, urban infrastructure)
- `isometric-tiles-landscape/PNG/landscapeTiles_*.png` (129 sprites — terrain, trees, fences)
- `isometric-miniature-library/Isometric/*.png` (288 sprites — interior props, furniture)

**DO NOT draw characters or buildings freehand in SVG. Use the Kenney PNGs.**

### Dynamic bays (from real API)

Render bays from `/api/state` at runtime. One bay per entry in `businesses.businesses[]`. Do NOT hardcode bay names. When Hank hires a new agent and its `state.json` exists, the new bay appears on the grid on next refresh.

API shape (verified against live server):
```json
{
  "time": "...",
  "overall": { "mtd_income": 0, "mtd_cost": 0, "mtd_net": 0 },
  "businesses": [
    { "name": "builder", "display_name": "Jax", "mode": "...", "status": "...", "last_tick_at": "...", "last_tick_summary": "...", "failures_in_row": 0, "month_to_date": {...}, "business_pitch": { "d30_checkpoint": "..." }, "self_funding_plan": {...}, "hired_roster": [...] }
  ],
  "hires": [...]
}
```

**Use `businesses` array. Use `mode` not `current_mode`. Match bays by `display_name`.**

## The 7 current bays (ordered by tenure)

Character assignments are SUGGESTIONS; the designer picks which specific Kenney character goes to each bay based on what feels right aesthetically:

| Bay | Display | Role | Character vibe |
|-----|---------|------|----------------|
| builder | Jax | Builder | Worker, tool belt, cap |
| foreman | Hank | Foreman | Clipboard, hardhat, authority |
| paymaster | Doss | Paymaster | Ledger, visor, accountant |
| realtor | Brix | Realtor | Jacket, conversational, dealmaker |
| scout | Vega | Scout | Coat, binoculars, watcher |
| signalscout | SignalScout | Watcher (NEW) | Street-clothes, earbuds, listener |
| vault | Vault | Archivist (NEW) | Apron or gloves, archivist, sorter |

Pick distinct-looking Kenney Blocky Characters so viewers can tell them apart at a glance.

## Scene layout

**Isometric camera**, 30-degree tilt. Yard arranged as a rough U around a central dirt path. Gate at the bottom where new hires arrive. Fence on the outer edge. Sky above, time-of-day shift based on real local time.

Grid suggestion (designer has room to adjust):

```
     [Hank]   [Doss]   [Vault]
       \      |        /
        \     |       /
   [Jax]  [central   [Brix]
           path]
            |
    [Vega]  |  [SignalScout]
            |
          [GATE]
```

All 7 bay workshops. Each workshop:
- Kenney building sprite (pick per bay's vibe)
- Kenney character sprite on the porch or inside
- Small wooden name sign ("JAX — BUILDER") — inline SVG, gold text on dark wood
- Rent gauge on side (thin bar: green/amber/red)
- Ambient motion: lamp flicker (gold), smoke from chimney when bay ticks within last 6h

## Livestream moments (what makes them stay)

1. **Ambient idle (always running):** lamps flicker in gold, sky shifts with real time, characters have subtle breathing animation via CSS transform scale.
2. **Tick event:** when `last_tick_at` is fresh (<6h), a thought bubble pops above the character showing `last_tick_summary` truncated to ~60 chars. Gold border, bone text. Holds 8 seconds, fades.
3. **Rent pulse:** tenants within 3 days of `d30_checkpoint` get a pulsing clay-red halo around their building.
4. **Income drop:** when any bay's `month_to_date.income` changes between polls, a small gold coin sprite falls from the sky onto that bay's roof and is absorbed. Silent visual.
5. **Arrival:** when a new bay appears in `/api/state` that wasn't there on previous poll, a figure walks up the central path from the gate, stops at the empty plot, a new workshop materializes around them with a gold flash. Then the new bay is live.
6. **Red alert:** `failures_in_row > 0` raises a clay-red beacon above that building, visible from anywhere in the scene.
7. **Day-night:** between local 18:00 and 06:00, sky goes `--indigo-night`, lamps get brighter gold, characters go inside their buildings (lit windows). At 06:00 sky returns to a soft gold-tinged morning.

## Viewer chrome (minimal)

- **Top ribbon (40px):** yard name in Syne 700 gold, real clock in mono bone, total MTD net in mono gold/clay depending on sign. That's it.
- **Bottom ribbon (40px):** scrolling feed of the last 5 events, right-to-left, mono bone text. Each event: timestamp + bay display_name in gold + event in bone. ("22:40 VAULT scaffolded", "23:30 SIGNALSCOUT awaiting reddit creds").
- **No sidebars. No tables. No KPI cards. The yard IS the UI.**

## Kill list (do not do)

- No hand-drawn SVG characters (use Kenney PNGs)
- No mock bays (use only real `/api/state` data)
- No em dashes anywhere
- No "AI" as standalone word
- No cartoon-bright colors
- No cat, dog, raccoon, tumbleweed, mail truck, confetti, twinkle
- No book bookcase furniture from `isometric-miniature-library/` in outdoor scene (it's interior furniture — use it inside buildings only)
- No KPI cards / data tables in the main view

## Technical

- Vanilla JS + CSS, single HTML file
- Only external resource: Google Fonts for Syne/DM Sans/JetBrains Mono
- File size budget: under 100 KB (Kenney PNGs are external, so the HTML stays small)
- Poll `/api/state` every 15 seconds
- Graceful loading state before first fetch resolves: bone "connecting" placeholder, no flash of empty scene

## Success criteria (Lando verifies before rating)

1. Saves to `businesses/public/concepts/concept-v7.html`, under 100 KB
2. Loads in iPad Chrome, readable landscape AND portrait
3. 7 distinct characters visible, each tied to a real bay name from `/api/state`
4. Palette adheres to god colors — black dominant, gold accents, cyan punctuation only
5. At least 3 ambient animations running at all times (lamp flicker, breathing, sky)
6. Real data: `last_tick_summary` shows up as thought bubbles, `month_to_date.income` changes trigger coin drops
7. No mock data. If `/api/state` fails, show "connecting..." placeholder, NOT fake agents
8. Grep: zero em dashes, zero standalone "AI" in visible copy
9. Gut check: does this hold a Twitch viewer for 2 minutes? If it looks like a spreadsheet or a game-jam demo, it failed.

## Rating

RED / YELLOW / GREEN / GOLD logged to designer's `kill_clock.rating_log`. Current streak: 1 RED (v5), 1 YELLOW (v6). A GREEN or GOLD here clears the kill clock. Another RED puts the designer one run from Hank triggering a replacement hunt.

## Delivery

- Write complete HTML to `businesses/public/concepts/concept-v7.html`
- Do not touch `businesses/public/index.html` (Lando promotes on GREEN)
- Return a one-paragraph summary of what shipped and what was intentionally omitted
