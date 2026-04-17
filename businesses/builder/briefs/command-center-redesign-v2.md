# Command Center Redesign v2: God View

**Project**: command-center-redesign-v2
**For**: Lando (founder, landlord)
**Owner bay**: Jax (Builder)
**Output**: `businesses/public/concepts/concept-v2.html` (overwrite v1 of v2 with the real vision)

## The vision in Lando's words

"It needs to have a god live view and it needs to look like a living ecosystem. They build things interactively over time but they all have space they rent and can make their home."

## What that means

**Top-down view of the whole yard, from above.** Everyone visible at once. The landlord's eye. Like looking down at a village or a small industrial park.

**Living.** Never static. Things move even when nothing is happening. Drift, pulse, film grain, low ambient life.

**Home.** Each tenant has a literal plot of land with a building. Not a card on a grid. A building. Their building. Their home.

**Builds over time.** When a tenant gets a new hire, an equipment icon appears on their plot. When a tenant ticks, their building glows and emits particles. When a sale lands, a dollar packet drifts from their building to the landlord's office. Work accrues visually.

**Space they rent.** Vacant plots are visible as empty lots with FOR RENT signs. The geography makes the rent-roll obvious at a glance.

## Data sources (live, real-time)

- `GET /api/state` → 5 bays with state, mode, last_tick_at, month_to_date, hired_roster
- `GET /api/realestate` → vacancies, applications, rent-roll with per-tenant status (current / behind / default)
- `GET /api/activity?limit=60` → merged activity feed
- `GET /api/stream` → SSE, events `change`, `hire`, `realestate`

## Layout

Full-viewport SVG map. 5 tenant plots spaced around a central plaza (landlord's marker). Brix's realtor office near the plaza. Roads connect every plot to the center.

Overlay UI (HTML on top of SVG):
- Top bar: yard name, clock, occupancy %, rent roll (owed / paid), behind count, live SSE lamp
- Right rail: activity feed, newest on top
- Bottom or peek panel: application inbox

Vacant plots get dashed outlines and a FOR RENT sign.

## Plot aesthetics (per tenant)

Each plot is about 220x220 units in the SVG. Grass outline. A building. A name sign. A rent-status badge.

- **Hank (Foreman):** hiring board with pinned flyers. One flyer per hire in his roster. Title: "HIRING"
- **Vega (Scout):** storefront with an OPEN sign that lights when her Gumroad listing is live. Dollar icon on the awning.
- **Jax (Builder):** garage with a roll-up door. Door is open when `current_mode === 'internal_build'` and a project is queued. Hammer icon.
- **Doss (Paymaster):** accountant's office with a ledger book illustration on the door. Ticker tape below it showing `usage.jsonl` last entry.
- **Brix (Realtor):** real estate office with LISTED signs stuck in the front yard. One sign per vacant plot.

## Live behavior

- **Idle:** subtle sway on flags/signs, slow particle drift, breathing windows
- **Ticking (last_tick_at < 90s):** building glows cyan, small burst of particles, road pulse outward to plaza
- **New hire event:** small equipment icon lands on that tenant's plot
- **New application event:** a letter icon drifts from offscreen to Brix's office
- **Sale event:** a dollar icon drifts from the earning tenant toward the plaza landlord-marker
- **Status = behind:** plot edge tints red, rent-status badge shows "BEHIND"
- **Status = default:** plot is shrouded darker, badge flashes red

## Brand system (The Signal)

- Sky / void: `#06060a` → `#0a0c14` radial
- Ground / grass: `#14182a`
- Roads: `#1a1e30`
- Building base: `#1e2330`, lit accents `#2a3040`
- Cyan accent (active, live, live data): `#00e5ff`
- Warm window glow: `#ffd079`
- Success (current rent): `#3dd68c`
- Danger (behind / default): `#ff5a5f`
- Amber (partial / warning): `#ffb347`

Typography (Google Fonts):
- Display (tenant names, yard name): **Syne 800**, tracked +0.04em
- UI labels: **DM Sans 400/500**
- Numbers + mono: **JetBrains Mono 500**

## Constraints

- Single self-contained HTML file. Inline CSS. Vanilla JS + alpine (vendored at `/vendor/alpine.min.js`).
- SVG for the map. Everything custom, no icon library.
- No build step. No framework. No bundler.
- No em dashes in any visible copy.
- Never the word "AI". Use "agent", "automation", "model".
- Must feel intentional and alive. A demo-looking grid is a failure.
- Responsive target: laptop at 1280px, tablet landscape at 1024px. iPad friendly.

## What this is NOT

- Not a card grid. Not a list. Not a table.
- Not a Zillow clone. This is a landlord's-eye view of an operating property, not a listings page.
- Not static. Not a wireframe. Not a placeholder.
