# Brewington Yard // HOLO-TABLE god view

Date: 2026-04-17
Designer: Claude (Design Lead)
Replaces: all 4 prior yard passes (silhouettes, Mission Wall, DEPOT v1, DEPOT v2 illustrated)

## Brief from Lando
> "im not liking it lets go ultimate god view and feel! the avatars need to change. this needs to flow better. also, if we need other tabs and info filled in to help me understand what's going on that would be nice. i want a lively eco system!"

## Brainstorm summary (3 directions)

1. **Holo-Table (picked)** - round brass-rimmed strategy table viewed top-down in a dim overlord chamber. 4 quadrants, portrait busts in hexagonal cartouches above each zone, light-conduit flows.
2. Rejected: **City-Block Iso** - full SimCity iso of a fenced yard with 4 buildings. Too much craft risk after 4 fails on the "illustrated vector" axis.
3. Rejected: **Tactical Ops HUD** - top-down schematic with circular portrait tokens, vector flow lines, radar sweep. Too close to Mission Wall which was already rejected.

## Picked direction: Holo-Table

A single dark chamber. In the center of the screen sits a circular command table about 700px across. The table has:

- A **brass / patinated copper rim** with engraved hash marks and compass glyphs
- A **black slate inner surface** with a faint honeycomb etch pattern
- A **central sigil** - Lando's mark (a stencil B inside a chevron)
- **4 pie-slice quadrants** divided by thin brass spokes:
  - NORTH: VEGA zone (lookout, map of Phoenix Metro, listing products)
  - EAST: JAX zone (workshop, builder pipeline, prospect rebuilds)
  - SOUTH: DOSS zone (vault, ledger, coin stacks)
  - WEST: HANK zone (hire board, filing)
- **Light-conduits** cut into the slate: 4 chords connecting each zone to each other + spokes from each zone to the center. Conduits glow dim by default and pulse when a flow packet travels.
- **Portrait cartouches** - above each quadrant, floating above the table surface, a hexagonal frame holding a half-body illustrated portrait of that crew member. Cartouches use the role color ring + stenciled role label + status chip.
- **Outer ring** rotating slowly, engraved with yard time + compass headings, like an astrolabe.

The chamber around the table:
- Dark sodium-lit walls implied by a radial vignette
- Dust motes drifting up through warm shafts of light
- Faint scanline + chromatic aberration on ONLY the table glass (not the UI chrome)
- Chrome corner brackets around the viewport for the command-deck frame

## Avatar system: HEX-CARTOUCHE PORTRAIT BUSTS

Each of the 4 crew is drawn as an **original half-body illustrated portrait** (shoulders up, 3/4 angle) inside a **hexagonal brass/steel frame** with their role color as inner ring + status lamp.

- **Vega** (scout): young woman, braided hair pulled back, leather scout coat with green pipe trim, binoculars on a strap, watchful expression. Cartouche ring: safety green.
- **Jax** (builder): bearded man in a rust leather apron over a henley, welder goggles pushed up on forehead, gloves holding a hammer just visible at the bottom of the frame. Ring: rust orange.
- **Hank** (foreman): older man with thick mustache in a hi-vis coat over plaid, hard-hat tilted back, clipboard edge visible. Ring: sodium amber.
- **Doss** (paymaster): thin older gentleman, balding pate with side hair, green bookkeeper eyeshade, round spectacles, pinstripe vest and tie, coin between fingers. Ring: caution yellow.

Each portrait has:
- Shaded skin gradient (warm highlights + cool shadows)
- Hair/beard with stroke detail
- Cloth folds and rim light
- Eyes that lock to the viewer (overlord addressing crew)
- Micro-motion: slow breathing, eye-blink every 4-8s
- **Working state**: portrait is fully lit, status lamp on, slight forward lean
- **Idle state**: portrait is desaturated, status lamp dim, head slightly tilted down
- **Event ping**: when SSE fires for that agent, cartouche ring pulses + portrait brightens briefly

These are visibly a new avatar class. They are not the side-profile illustrated characters from pass #4.

## Multi-view shell (tabs)

A **left-side vertical nav rail** with 5 icons + labels. Each tab swaps the center stage and its side panels:

1. **COMMAND** (default) - the holo-table
2. **BOOKS** - financial dashboard: MTD income / cost / net / surplus, per-agent P&L cards, kill-clock thermometer per agent, cash runway bar, revenue forecast (sum of projected monthly revenue across 4 agents), shipped-sites count, Gumroad product tile
3. **CREW** - roster of 4 portrait cartouches stacked. Click one to zoom in on a single crew card showing full pitch (biz, why, rev proj, basis, cost, margin, channel, status, D-30, last action, recent tick log excerpt)
4. **TOOLBOX** - gallery of installed hires. Ruflo featured large with its brought-in stats (98 sub-agents, 30 skills, 10 commands, 1 mcp, 10 hooks). Each hire card = title, installer, version, brought-in chips, pilot subtask.
5. **ACTIVITY** - live event feed. Human-readable summaries of SSE events streaming in reverse chronological order. Timestamps + agent chips + one-line descriptions. Auto-scrolling when new events arrive.

Tab rail is dark steel with brass accent for the active tab. Keyboard shortcut 1-5 to switch.

## Flow animations on the table (COMMAND view)

The light-conduits between quadrants light up as **flow packets** travel them:

- **Lead flow (green)**: when Vega's `state.json` changes, a green folder-chip rides the VEGA->JAX conduit
- **Invoice flow (rust)**: when `sales.jsonl` or Builder state changes, rust chip rides agent->DOSS conduit
- **Coin flow (yellow)**: when `ledger.json` changes, a gold coin-chip rides DOSS->agent conduit
- **Directive flow (amber beam)**: when charters update or Lando action, a beam flashes from center sigil outward to the affected zone
- **Hire flow**: a truck-icon slides onto the table from outside, drops a labeled crate into Hank's zone, crate unpacks into a small equipment rack icon docked to Hank's quadrant

All flows also fire on a slow ambient loop every ~6s when SSE is quiet, so the table is never dead.

## Data feeds (unchanged + extended)

- `/api/state` - crew list with `business_pitch`, `self_funding_plan`, `hired_roster`, top-level `hires[]`
- `/api/portfolio` - shipped-sites count
- `/api/stream` - SSE: `hello`, `change`, `hire`
- **NEW**: add `/api/activity` endpoint in `businesses/server.js` that tails the 4 agent `log.md` files and returns the last 40 lines merged chronologically with agent tags. Used by the ACTIVITY tab.

## File layout

Single file: `/workspaces/local-biz-pipeline/businesses/public/index.html`. Target ~4000 lines, heavy on inline SVG. No external JS libs needed; everything hand-rolled.

Server: `businesses/server.js` gets one new endpoint (`/api/activity`).

## Liveliness baseline

- Outer astrolabe ring rotates at .08 rpm (one revolution every 12 min)
- Central sigil slowly breathes brightness every 4s
- Ambient dust motes drift continuously
- Portrait cartouches breathe + blink independently
- Conduits have a baseline dim glow that shimmers at random intervals
- When zero SSE for 60s, ambient flow rate doubles so table still pulses

## Brand compliance

- No "AI" token visible anywhere
- No em dashes in visible text
- Names: Hank, Vega, Jax, Doss, Lando
- Sodium amber + safety green + rust + caution yellow brand palette preserved

## Success bar (from Lando, quoted)

1. Unmistakable god-view within 3s -> delivered via the table in center frame on load
2. New premium avatars -> hexagonal cartouche portrait busts
3. Visible flow -> conduit chips + ambient loop
4. Tabs for more views -> 5 tabs shipped

## Files touched

1. `/workspaces/local-biz-pipeline/businesses/public/index.html` - full rewrite
2. `/workspaces/local-biz-pipeline/businesses/server.js` - add `/api/activity`
3. `/workspaces/local-biz-pipeline/docs/superpowers/specs/2026-04-17-holo-table-god-view-design.md` - this file
