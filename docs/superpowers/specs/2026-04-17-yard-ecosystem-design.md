# Yard Ecosystem Redesign - DEPOT (Fallout-Shelter cutaway)

Date: 2026-04-17
Designer: Claude (Design Lead, superpowers mode)
Replaces: previous Mission Wall pass (codename nodes on a CRT, killed by Lando)
Replaces: previous yard-map silhouette pass (3010 lines, also dead)

## What Lando said
> "that layout is not a living eco system with visual agents."
Wants: literal characters with bodies, a literal world, visible work, visible sleep, visible handoffs, visible installed equipment.

## Direction picked: DEPOT (Fallout-Shelter cutaway)
A 2x2 cross-section of a corrugated-metal depot building. Four rooms, four named characters living in them, all visible at once, no scroll.

- Top-left: Vega's Lookout (binoculars, window, pinboard map of Phoenix Metro)
- Top-right: Jax's Fab Bay (workbench, anvil, monitor with site preview, hammer animation, sparks)
- Bottom-left: Hank's Office (desk, filing cabinet, hire board with Ruflo card, hard hat)
- Bottom-right: Doss's Counting Room (safe, ledger, coin stacks, green visor)

Roof has a "BREWINGTON DEPOT" sign with sodium bulbs. Sky has stars. Ground is gravel. Bottom of the stage has a "YARD RADIO" marquee that crawls the financial ticker.

## Visible behaviors
- **Working state**: character at station with role-specific animation loop (Vega bobs binoculars, Jax swings hammer with sparks, Hank taps clipboard, Doss counts a coin).
- **Idle state**: character is rotated -90 onto their bunk, desaturated to about 35%, Zzz puffs drift up.
- **Walk transitions**: SSE `change` event triggers walk from bunk to station (700ms tween with footstep bob). 90s of quiet sends them back to the bunk.
- **Handoffs**: visible folder/invoice/coin sprites arc between rooms over the building. Sale events animate invoice from agent to Doss + coin acknowledgment back. Lead lists fly from Vega to Jax. Hank's hires deliver Hank-to-anyone leads.
- **Hires (Ruflo)**: SSE `hire` event animates a freight truck driving in from the left, pausing, dropping a crate that arcs into the hiring agent's room, and installing as a server-rack equipment sprite labeled with the hire's name (Ruflo). For Hank's hires, also pins a card on the hire board on his office wall.
- **Click any character or any equipment**: dossier opens in right rail.

## Data wiring
- `/api/state` consumed every 5s + on every SSE event
- `/api/portfolio` consumed once per fetch for shipped-sites count
- `/api/stream` SSE: `hello` lights stream lamp; `change` fires character wake + handoff sprite + room flash; `hire` fires truck delivery + crate drop + equipment install
- Hires consumed from `state.hires[]` (preferred) or `business.hired_roster[]` (fallback for older server build)

## Pitch dossier (right rail) - kept what worked
- Code, role, status (at station / at bunk)
- Business name, why this, projected monthly revenue, basis, cost, margin, channel, last move
- D-30 checkpoint, kill-under threshold
- Kill-clock progress bar (D+N out of 30)
- INSTALLED EQUIPMENT list (Ruflo with brought-in chips: 98 sub-agents, 30 skills, 10 commands, 1 mcp, 10 hooks)
- Click an equipment row to swap dossier into equipment-detail view

## Style commitment
- Vector SVG (no image files, no canvas, no game engine)
- Hand-drawn chunky line-art with corrugated-rib walls and plank floors
- Sodium-amber + role-color accents, near-black wall
- CRT scanlines + corner brackets retained for grit
- Fonts: Archivo Black (headings), Oswald (stencil), JetBrains Mono (numbers)

## Files touched on this pass
1. `businesses/public/index.html` - full rewrite (1623 -> 1900 lines)
2. `businesses/server.js` - +9 lines (`hires` aggregation), +1 line (per-agent `hired_roster` exposure). Server restart required to take effect; client tolerates pre-restart server.

## What was killed from prior passes
- The arc-of-codename-nodes CRT canvas
- The packets-on-lines abstraction
- The top marquee (survives in-world as YARD RADIO at bottom of the depot)
- The folder-deck row at the bottom (replaced by the actual room layout)

## Constraints honored
- No "AI" tokens anywhere in the file (verified 0 matches)
- No em dashes (verified 0 matches)
- Names: Hank, Vega, Jax, Doss, Lando
- Hires are equipment, not crew (no codename, no sleep, server-rack sprite)
- Single screen at default zoom; responsive at narrow widths
- SSE wiring preserved
