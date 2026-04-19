# Command Center Redesign v9: Brewington Digital Operating System

**Project:** command-center-redesign-v9
**Owner bay:** Jax (Builder) via designer hire
**Output path:** `businesses/public/concepts/concept-v9.html`
**Supersedes:** v8

## Vision (from Lando, 2026-04-18, verbatim)

Transform the Brewington Yard into a fully functional autonomous business command center. This is not a demo. This is the real operating system for Brewington Digital.

Each agent room in the 3x3 grid is a living business unit. Every agent has a job, generates their own work, reports their activity in real time, and contributes to revenue. The command center shows everything happening across the entire business at a glance.

## Agent roles (displayed labels — Phase 2 tick rewrites come later)

The dashboard displays each bay with these NEW role labels. For now the underlying tick.js still runs the original bay logic, so some fields (like Hank's "prospects found today") may show "—" until tick rewrites are done. Graceful degrade on missing fields.

| Bay | display_name | New role title | Status light pulls from | Room glow color |
|-----|-------------|----------------|------------------------|-----------------|
| builder | JAX | The Builder | last_tick_at freshness + failures_in_row | warm amber |
| foreman | HANK | The Hustler | last_tick_at freshness | blaze orange |
| scout | VEGA | The Analyst | last_tick_at freshness | lime green |
| realtor | BRIX | The System Builder | last_tick_at freshness | electric blue |
| paymaster | DOSS | The Guardian | last_tick_at freshness | cyber red |
| vault | VAULT | The Treasurer | last_tick_at freshness | gold |
| signalscout | SIGNALSCOUT | The Researcher | last_tick_at freshness | soft purple |

**FOR LEASE room** (9th cell): locked. Shows a progress bar toward "5 paying clients". Currently 0/5. Dim, empty, inert until unlocked.

## Status light rules

For each room:
- **GREEN (active):** `last_tick_at` within 6 hours AND `failures_in_row === 0`
- **YELLOW (thinking):** `last_tick_at` within 24 hours AND `failures_in_row === 0`
- **RED (blocked):** `failures_in_row > 0` OR `status === 'awaiting_lando_setup'` OR `last_tick_at` older than 24h

Small glowing light dot on each room's outer wall corner.

## Room content (what shows inside each room)

Each room is a small isometric 3D box showing:
1. **Agent name** (top banner, room's glow color)
2. **Role title** (subline, muted)
3. **Current task** (plain English, from `last_tick_summary` truncated to ~50 chars)
4. **Last completed action** with timestamp (from `last_tick_at`, formatted "22:14")
5. **Simple progress indicator** (thin horizontal bar, fills based on bay-specific metric below)
6. **Status light** (corner, one of green/yellow/red per rules above)
7. **One pixel-art character sprite** inside each room, standing at a station. Use Kenney `blocky-characters/Previews/character-a.png` through `character-r.png`, pick a different character per bay.

Progress indicator source per bay (best effort, fallback to 0%):
- JAX: `month_to_date.income / self_funding_plan.target_revenue_mo_1 * 100`
- HANK: `candidates_pitched / 30 * 100` (if present in state.json)
- VEGA: `month_to_date.income / self_funding_plan.target_revenue_mo_1 * 100`
- BRIX: `tenants_current / 8 * 100` (rent roll occupancy)
- DOSS: 100% minus `failures_in_row * 20`
- VAULT: `listings_live / 5 * 100`
- SIGNALSCOUT: `queue_depth / 5 * 100`

## HUD strip (top bar, ~36px tall)

Single horizontal row, mono font. From left to right:
- `BREWINGTON YARD` (brand, Syne, gold)
- `NET TODAY: $0` (bone text, green if positive, red if negative)
- `MRR: $0` (green)
- `ACTIVE CLIENTS: 0` (bone)
- `ALERTS: 0` (red if >0, bone if 0)
- `UPTIME: 99.9%` (green)
- `00:00:00` (live clock, bone mono, right-aligned, updates every second)

Values pull from `/api/state.overall` for totals. If missing, show 0 or "—".

## Live feed panel (bottom-left, fixed)

Dimensions: ~320×200px, dark transparent overlay with 1px gold border.

Contents:
- Title "LIVE FEED" (small caps, gold, top of panel)
- Scrolling list of the last 8 events, newest at top
- Each line format: `[22:14] JAX :: internal build complete` where:
  - `[22:14]` in bone white mono
  - `JAX` in that agent's room-glow color
  - `::` in muted gray
  - message in bone white mono, truncated to ~45 chars
- Scroll auto-updates every 15s with new `last_tick_summary` values from `/api/state.businesses[]`
- If no events yet: show "listening..." in muted text

## Click-to-detail panel

When user clicks a room, slide in a detail panel (right side, ~360×80vh, semi-transparent dark background with gold trim). Contents:
- Agent name + role title (big)
- Current status
- Full activity log (last 20 events from `businesses/<bay>/log.md` — fetched via a new endpoint OR show the last_tick_summary + charter notes if the log isn't reachable from browser)
- Performance metrics table (MTD income, cost, net, rent status)
- Manual override controls (three buttons: "PAUSE", "FORCE TICK", "OPEN CHARTER"). For v9 these are visual placeholders that just log to console — actual wiring is Phase 2.

Close the panel with an X button in the top-right of the panel, or click outside.

## Grid layout: 3×3, same as v8, positions locked

```
(1,1) JAX         (1,2) HANK         (1,3) VEGA
(2,1) BRIX        (2,2) [PORTAL]     (2,3) DOSS
(3,1) VAULT       (3,2) SIGNALSCOUT  (3,3) [FOR LEASE]
```

Center cell (2,2) is the focal PORTAL:
- Red circular wormhole effect (same as v8)
- Label: "BREWINGTON OS" or "CENTRAL" in bone mono
- Pulses subtly
- Click opens a "yard summary" panel showing overall MTD stats + all bays

## Palette (LOCKED — from Lando)

Apply these exact hex codes, use ONLY these colors (plus mix-ins for shadows/glow):

| Var | Hex | Use |
|-----|-----|-----|
| --concrete-dark | #1a1c1f | room walls, backgrounds |
| --concrete-mid | #2a2d31 | floors, dividers |
| --gold-trim | #c9a84c | wall trim, brand lines, HUD accents, borders |
| --teal-accent | #2dd4c0 | primary teal lighting, corridor glow, hover states |
| --bone | #f2ede3 | primary text |
| --muted | #6a6a6a | secondary text, separators |
| --red-alert | #ff3344 | alerts, red status lights, portal core |
| --green-active | #3ff27a | green status, HUD positive numbers |
| --yellow-thinking | #ffd84a | yellow status, progress mid |

Plus room-glow colors (floor lights only, NOT walls):
- Warm amber `#ffa83c` (JAX room)
- Blaze orange `#ff6a1a` (HANK room)
- Lime green `#a8e82a` (VEGA room)
- Electric blue `#3a8cff` (BRIX room)
- Cyber red `#ff2a5a` (DOSS room)
- Gold `#ffc84c` (VAULT room)
- Soft purple `#b088ff` (SIGNALSCOUT room)

Walls are ALWAYS `--concrete-dark` with a 1px `--gold-trim` border and neon trim of the room's glow color. Light sources (implied via radial gradients in the floor) carry the color, not the walls.

## Isometric presentation

Same pattern as v8 — pseudo-isometric via 2D CSS, NO `transform: rotateX`. Each room is a `<div>` with:
- Thick dark walls drawn via box-shadow and inset borders
- Floor drawn with a radial-gradient in the room's glow color, centered
- A small "station" rectangle (computer terminal, machine, desk) at the back of the floor
- Character sprite positioned in front of the station
- Gold-trim neon lines along each edge via `box-shadow: inset 0 0 0 1px var(--gold-trim), 0 0 8px var(--teal-accent)`

Depth illusion: back row rooms slightly smaller (0.9 scale), bottom row slightly larger (1.05). Or equal size with vertical overlap.

## Idle animations (cinematic feel)

- All rooms: gentle neon-trim pulse (2% brightness variation, 3s cycle)
- Character sprites: vertical bob 4px (2.4s cycle)
- Portal center: slow rotation + inner ring pulse (6s cycle)
- HUD clock: ticks every second visibly
- Star particles in space background: twinkle (6s cycle)
- Live feed: typing-on effect when new line appears

## Constraints

- Vanilla HTML/CSS/JS, single file
- File size budget: under 90 KB (designer max_tokens bumped to 24k for this run)
- No em dashes anywhere
- Never "AI" as standalone word
- No frameworks, no CDN beyond Google Fonts
- Kenney sprite paths verified: `/assets/kenney/blocky-characters/Previews/character-a.png` through `character-r.png`
- Graceful degrade: if `/api/state` missing a field, show "—" or 0, NEVER fake mock data
- NO hand-drawn SVG characters (Kenney sprites only)

## Success criteria (Lando rates before promote)

1. Writes to `businesses/public/concepts/concept-v9.html`, under 90 KB
2. Full viewport coverage — space fills completely, no cutoff halfway
3. 3×3 grid with 7 agent rooms + 1 portal + 1 for-lease visible simultaneously
4. Each room shows agent name, new role title, current task, status light
5. Palette strictly follows Lando's spec (concrete + gold + teal + per-room glow)
6. HUD strip shows all 6 required stat fields across the top
7. Live feed panel bottom-left updates with `last_tick_summary` data
8. Click on room opens detail panel with manual override buttons (visual only)
9. Gut check: "cinematic and premium" — does it LOOK like a real SaaS operating system a company would pay for?

## Rating

Streak: 1 RED (v5), 2 YELLOW (v6, v7). GREEN/GOLD clears the clock.

## Delivery

- Write complete HTML to `businesses/public/concepts/concept-v9.html`
- Do not touch `businesses/public/index.html`
- Return a one-paragraph summary covering: what shipped, what the role-label display looks like per bay, which metrics connected and which showed "—", any Kenney assets referenced
