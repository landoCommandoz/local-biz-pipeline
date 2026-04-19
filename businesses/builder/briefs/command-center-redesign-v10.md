# Command Center Redesign v10: Kill Sidebars, Turn The Lights On

**Project:** command-center-redesign-v10
**Owner bay:** Jax (Builder) via designer hire
**Output path:** `businesses/public/concepts/concept-v10.html`
**Supersedes:** v9

## Lando's iteration feedback on v9

> "the command center sucks still i need it to feel more alive and make sure we dont have anything covering the boxes no side pannels"

Two hard fixes. Everything else in v9 stays.

## Hard rule #1: NO side panels or overlays that cover the rooms

In v9 the live-feed panel sits over the bottom-left cell, and the click-to-detail slides in from the right covering half the grid. BOTH GO.

New rule: the 3×3 grid is untouchable. Nothing overlays rooms. Nothing sits on top of a cell. Nothing slides in from the edge and covers cells.

Replacements:

1. **Live feed** moves to the FOR LEASE cell (bottom-right, grid position 3,3). That cell was already empty. Events scroll vertically inside the locked room, styled as a "feed monitor" diegetic element — looks like a screen mounted inside the empty plot. It reads in-world, not as UI overlay.

2. **HUD strip stays at the top** — it's already a thin 36px bar that does not overlap rooms. Keep it.

3. **Click-to-detail** — when user clicks a room, full-screen MODAL fades in centered over the whole grid with a dark backdrop blur. The modal covers the entire grid equally, not just one edge. Close with X or click-outside. Modal has: agent name, role, full recent log, metrics table, PAUSE / FORCE TICK / OPEN CHARTER buttons (visual only per v9 spec).

4. **No sidebars anywhere else.** No left panel. No right panel. No floating HUD boxes. Grid is sacred.

## Hard rule #2: Every room must FEEL ALIVE

v9 rooms have a static sprite and a status light. Dead-looking. v10 rooms run specific ambient animations per agent role.

### Per-room ambient machinery (all animated via CSS, running continuously)

Each room has ONE signature animation that communicates what the agent does:

| Bay | Ambient animation |
|-----|-------------------|
| **JAX (Builder)** | Sparks fly from a welding spot in the corner, 2-second cycle. Character holds a welding torch. |
| **HANK (Hustler)** | Scrolling list of phone numbers / business names on a terminal screen inside the room. Text scrolls slowly upward. |
| **VEGA (Analyst)** | Animated bar-chart bars pulse up and down inside the room. Numbers tick. |
| **BRIX (System Builder)** | Wrench icon spins slowly. Lines of code scroll on a secondary monitor. |
| **DOSS (Guardian)** | Radar sweep circle rotating in the center of the room. Occasional ping blips. |
| **VAULT (Treasurer)** | Gold coin sprites stacking one by one in a pile, every 6-8 seconds one drops in. |
| **SIGNALSCOUT (Researcher)** | Waveform / audio-bars pulsing at random heights, looking like listening equipment. |
| **PORTAL (center)** | Red wormhole already rotates. Amp it up: inner rings also counter-rotate, occasional arc-flash particles. |
| **FOR LEASE (3,3)** | Now the live-feed terminal. Scrolling events. |

### Global ambient details

- **Neon trim flickers** — 1 per minute, one random room's neon trim briefly stutters (authentic neon feel, not broken)
- **Floor glow breathes** — the per-room floor glow pulses subtly, ~4s cycle, 6% brightness variation. Syncs with the room's status light color.
- **Corridor lights** — thin teal tracer lines move ALONG the corridors between rooms (like data moving through the grid). Not static lines, animated tracers, 4s cycle.
- **Portal sends out data-pulses** — every 20s, the portal emits a thin expanding ring that travels outward toward one random room. That room's trim brightens briefly as if receiving the signal.
- **Character sprites bob** — already present in v9, keep.
- **Character occasionally shifts position** — 10% chance per 30s a character shifts 3px left or right as if adjusting their stance. Subtle but noticeable on close watch.

### Event-driven motion (not just ambient)

When data arrives from `/api/state`:

- **Fresh tick** (`last_tick_at` < 6h ago, changed since last poll) → brief burst of sparks / blip / coin / waveform in that room, bigger than the ambient version. Draws the eye.
- **Income up** → gold coin drops from the ceiling of that room into its pile (or equivalent metaphor per agent).
- **Failure logged** → room's neon trim flashes clay-red once, then settles back.
- **Status becomes RED** (blocked) → lights in that room dim by 40%, neon trim stays dim until cleared.

### Motion budget

Rule of thumb: viewer should see 3-5 distinct things moving in any given second, across the whole grid. Not in one spot (that would be chaos), spread across rooms (that feels alive). v9 had maybe 1-2. v10 has 10-15 micro-motions running at all times, each small and slow.

## Kill list (from v9, keep in v10)

- No hand-drawn SVG characters (Kenney sprites only)
- No mock bays
- No em dashes
- Never "AI" standalone
- No frameworks, vanilla CSS/JS only

## Palette (UNCHANGED from v9)

Same palette from v9 brief. Concrete walls, gold trim, teal accent, per-room floor glow. Don't reinterpret.

## Grid layout (UNCHANGED from v9)

Same 3×3 grid, same bay assignments, except:
- Grid cell (3,3) that was "FOR LEASE" now becomes the **LIVE FEED MONITOR** (still shows a lock icon + "FOR LEASE" label when there's space, but the primary visual is the scrolling feed terminal)
- Portal stays at (2,2)

## HUD (UNCHANGED from v9)

Top bar stays. Same 6 fields (NET, MRR, clients, alerts, uptime, clock).

## Success criteria

1. `businesses/public/concepts/concept-v10.html`, under 100 KB
2. No sidebars anywhere. No overlays over the grid at any time EXCEPT the click-to-detail modal which covers equally.
3. 8 distinct per-room ambient animations running simultaneously (the 7 bays + the portal)
4. Live feed integrated into grid cell (3,3), not a floating panel
5. Click-to-detail opens a centered modal with backdrop blur, closable
6. "Aliveness" gut check: 10+ micro-motions visible in the scene at any frame
7. Grep: zero em dashes, zero standalone "AI"

## Rating

Streak: 1 RED (v5), 2 YELLOW (v6, v7), soft-pass on v9 (promoted to root). v10 either hits GREEN / GOLD or designer is approaching replacement.

## Delivery

Write to `businesses/public/concepts/concept-v10.html`. Do not overwrite index.html — Lando promotes if he rates GREEN.
