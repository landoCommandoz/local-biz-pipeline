# Command Center Redesign v8: Neon Dollhouse, Space Station Grid

**Project:** command-center-redesign-v8
**Owner bay:** Jax (Builder) via designer hire
**Output path:** `businesses/public/concepts/concept-v8.html`
**Supersedes:** v7 (rated YELLOW twice, layout cut off, god-ray palette rejected in favor of sci-fi neon)

## LANDO'S EXACT VISION (verbatim, do not paraphrase)

> Dark space background, deep navy to black gradient with scattered white star particles. The entire view is isometric, top-down at roughly 45 degrees, like looking at a dollhouse from the corner.
>
> The rooms are individual square cells arranged in a 3x3 or 4x3 grid. Each cell has thick dark border walls with neon trim lighting along the edges. The floors inside each room are dark gray or black with subtle grid line texture. Each room has its own distinct color theme coming from light sources inside, not from the walls themselves.
>
> Top row rooms: one has bright orange machinery with circular industrial equipment and conveyor elements. Another is teal and cyan with what looks like computer terminals and holographic displays. A third is green tinted with vertical structures.
>
> Middle row: one room is deep purple with floating geometric shapes. Another is the focal room, bright red circular tunnel effect going into the center like a portal or wormhole. Another is light gray with mechanical arms or robotic equipment.
>
> Bottom row: one is yellow and amber with scattered crates or boxes. One is soft purple with a glowing orb or energy source in the center.
>
> Each room has tiny pixel art sprite characters inside, roughly 16 to 32 pixel style, moving or standing at stations.
>
> The corridors between rooms are dark with subtle lighting.
> Bottom left is a dark panel overlay with small text lines in green, orange, and white showing live feed messages.
> Top bar is a thin HUD strip with numerical stats in bright white and green.

**Follow this literally. The god-colors palette from memory is SUPERSEDED by this brief.**

## Grid layout: 3×3 with center as the focal portal

9 cells total. 1 cell = central portal (the "god's eye"). 8 cells around it host up to 8 bays. Currently 7 bays exist; 1 cell stays **vacant** as "FOR LEASE" (foreshadowing Hank's next hire).

Exact layout (rows top to bottom, columns left to right):

| Position | Cell content | Lando's color theme |
|----------|--------------|---------------------|
| top-left (1,1) | bay | orange machinery |
| top-center (1,2) | bay | teal/cyan terminals + holograms |
| top-right (1,3) | bay | green vertical structures |
| mid-left (2,1) | bay | deep purple, floating geometric shapes |
| **mid-center (2,2)** | **PORTAL** | bright red circular tunnel, wormhole effect (focal point) |
| mid-right (2,3) | bay | light gray, mechanical arms / robotic equipment |
| bot-left (3,1) | bay | yellow/amber, scattered crates |
| bot-center (3,2) | bay | soft purple, glowing orb center |
| bot-right (3,3) | **VACANT — "FOR LEASE"** | dim, empty, awaiting next hire |

Map the 7 current bays to the 7 themed cells. Suggested assignments (designer may swap if it flows better):

- **Jax (Builder)** → orange machinery (he builds)
- **Hank (Foreman)** → teal/cyan terminals (the recruiter's console)
- **Vega (Scout)** → green vertical structures (watchtower antennas)
- **Brix (Realtor)** → deep purple, floating geo shapes (dealmaker, stylized)
- **Doss (Paymaster)** → light gray mechanical arms (ledger machinery)
- **Vault (Archivist)** → yellow/amber scattered crates (asset archive)
- **SignalScout (Watcher)** → soft purple glowing orb (listening post)

Render bay cells DYNAMICALLY from `/api/state.businesses` — do NOT hardcode names. If a bay drops out or a new one arrives, the grid updates. The 8th cell stays rendered as "FOR LEASE" until more bays exist.

## Palette (override of god-colors)

Use ALL of these. Dark space + vibrant room-interior neon is the whole point.

| Var | Hex | Use |
|-----|-----|-----|
| --space-black | #05070d | outer background, wall interiors |
| --navy | #0f1b3d | background gradient mid-tone |
| --neon-orange | #ff7a1a | orange machinery room interior + trim |
| --neon-teal | #1aeae0 | teal terminal room + trim |
| --neon-green | #3ff27a | green vertical room + trim + HUD stat color |
| --neon-purple-deep | #7030f0 | deep purple geo shapes room |
| --neon-red | #ff1a3a | center portal / wormhole |
| --neon-gray | #c8cdd4 | mechanical arms room |
| --neon-amber | #ffcb3a | amber crates room + HUD stat color |
| --neon-purple-soft | #b088ff | glowing orb room |
| --star-white | #ffffff | scattered star particles |
| --bone | #f2ede3 | primary text |

The neon colors are LIGHT SOURCES inside rooms. Walls are `--space-black` with a 2px glowing neon-trim border matching the room's theme color.

## Character sprites

Tiny pixel-art characters, 16-32 pixel scale. Kenney packs now downloaded include several that might fit; designer should scan:
- `/assets/kenney/blocky-characters/Previews/*.png` (18 options, 64×64, blocky 3D — scale down to 32px)
- `/assets/kenney/pirate-kit/` or `fantasy-town-kit/` (check for pixel-art sprites)
- `/assets/kenney/platformer-kit/` or `new-platformer-pack/` (platformer-style)
- `/assets/kenney/desert-shooter-pack/` (top-down)
- `/assets/kenney/development-essentials/` (placeholder/utility sprites)

Each room has 1-2 character sprites positioned at "stations" (near the themed equipment in that room). Characters have subtle idle animations (bob, blink, shift).

## Isometric presentation (how to actually do it without broken CSS 3D)

**DO NOT use `transform: rotateX(45deg)` on a 3D container.** That path failed twice (v6 and v7 both had cascade bugs).

Instead, use **2D pseudo-isometric**:
- Each cell is a `<div>` styled to *look* isometric via background gradients and border-trim.
- Perspective illusion comes from thick dark bottom/right walls (darker shade) and thin top/left walls (lighter shade, neon glow).
- No transform rotations. No preserve-3d. Pure 2D CSS. This will not break.
- Depth illusion: back row (top) cells slightly smaller, front row (bottom) slightly larger. Or equal size with slight vertical overlap simulating foreshortening.

## Chrome

- **Top bar (thin HUD strip, 32-40px):** numerical stats in bright white + neon green. Format like `NET +$0  ·  MTD IN $0  ·  MTD OUT $0  ·  ALERTS 0  ·  TENANTS 7/8  ·  22:14:08`. Mono font. One line, scrollable on narrow viewports.
- **Bottom-left panel (fixed, 280×180-ish):** dark semi-transparent overlay with small text lines. Mix of neon green, neon amber/orange, and bone white. Shows last 8 events from bays. Format per line: `[22:14] VEGA :: live refresh tick` in mono, bay name in its theme color, timestamp in white, message in bone.
- **NO other UI.** No sidebars. No modals. No cards. The grid IS the UI.

## Dynamic data wiring

Poll `/api/state` every 15 seconds. Use `data.businesses[].display_name` to match each bay to its grid cell (by lookup: Jax → top-left, Hank → top-center, etc). Read:

- `last_tick_at` → if <6h ago, pulse that room's neon trim brighter briefly
- `last_tick_summary` → log line in bottom-left panel with bay's theme color
- `failures_in_row > 0` → red alarm light flashing on that room's wall
- `business_pitch.d30_checkpoint` → if <3 days, room's trim turns clay-red pulsing
- `month_to_date.income` increase → neon-amber coin drops INTO that room (visible animation)

Graceful loading: if `/api/state` hasn't responded yet, show the grid with "CONNECTING" in the portal center and no room fills.

## Hard constraints

- Vanilla HTML/CSS/JS. No frameworks. Only Google Fonts external.
- File size budget: under 120 KB (palette + animations + multiple rooms justifies more headroom than v7).
- Fill the full `.yard-scene` area. **No "cuts out halfway" gaps.** The grid should feel centered and fully framed by the HUD top and panel bottom-left.
- No em dashes anywhere. Never the word "AI" as standalone.
- Use real `/api/state` data only. NO mock agents named "ECHO_AGENT" or similar (v5 designer sin).
- Do NOT break the character-sprite rendering by requesting PNGs that don't exist. Use only files under `/assets/kenney/<pack>/` that are proven present.

## Success criteria (Lando rates before promote)

1. Saves to `businesses/public/concepts/concept-v8.html`, under 120 KB
2. Dark space background fills ENTIRE viewport, no gaps or half-cutoff sections
3. 3×3 grid of rooms visible, each with DISTINCT neon color theme per Lando's list
4. Center portal renders as red circular/wormhole effect, clearly the focal point
5. 7 bay rooms show real bay data from `/api/state.businesses`
6. 8th cell shows "FOR LEASE" placeholder
7. Top HUD strip renders stats in white + neon green
8. Bottom-left overlay panel shows recent events in mixed neon colors
9. Pixel-art sprite characters visible inside each room, animated subtly
10. Grep: zero em dashes, zero standalone "AI"
11. Gut check: does this look like a livestream-ready sci-fi command deck? Or a website dashboard? It must read as the former.

## Rating

Current streak: 1 RED (v5), 2 YELLOW (v6, v7). A GREEN or GOLD here clears the clock. Another RED = designer is one run from replacement.

## Delivery

- Write complete HTML to `businesses/public/concepts/concept-v8.html`
- Do not touch `businesses/public/index.html`
- Return one paragraph of what shipped + what you intentionally skipped
