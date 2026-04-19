# Command Center Redesign v11: Brewington OS, Clean Lines, Full Life

**Project:** command-center-redesign-v11
**Owner bay:** Jax (Builder) via designer hire
**Output path:** `businesses/public/concepts/concept-v11.html`
**Supersedes:** v10

## Lando's direction (lightly edited for scope)

Transform the Brewington Yard into a fully functional autonomous business command center. This is not a demo. This is the real operating system for Brewington Digital.

Each agent room in the 3x3 grid is a living business unit. Every agent has a job, generates their own work, reports their activity in real time, and contributes to revenue. The command center shows everything happening across the entire business at a glance.

## What v10 got right (KEEP)

- 3×3 grid layout with portal at center (2,2)
- Per-room ambient animations (welding sparks for Jax, scrolling phone list for Hank, bar charts for Vega, wrench spin for Brix, radar sweep for Doss, coin stack for Vault, audio waveform for SignalScout)
- No side panels. Nothing covers the rooms.
- Click-to-detail = centered modal with backdrop blur, NOT a sliding sidebar
- Live feed integrated into the (3,3) cell as a diegetic terminal
- Top HUD strip with real stats

## What v10 got wrong (REMOVE)

- **Lines that shoot across the page.** Specifically the corridor data-tracers (thin teal tracer lines moving ALONG corridors between rooms) and the portal's outward-expanding rings that travel to random rooms every 20s. All of this motion GOES.
- Anything else that draws the eye across the grid horizontally or vertically. Motion stays LOCAL to individual rooms.

## Agent roles (displayed labels — these drive the room banners)

Per Lando's specification:

- **JAX — The Builder.** Builds websites for clients using the Blueprint System. Pulls from the prospect list, generates site sections, runs the rating loop autonomously, deploys to Netlify. Reports: sites in progress, sections rated, deploys completed, Netlify credits remaining.
- **HANK — The Hustler.** Finds new clients. Scrapes Google Maps for local service businesses with weak websites. Scores them. Drafts outreach messages. Sends via email or text. Reports: prospects found today, outreach sent, replies received, conversion rate.
- **VEGA — The Analyst.** Tracks all business metrics. Revenue in, costs out, client retention, churn risk, monthly recurring revenue, break even status, days until profitable. Reports: MRR, client count, burn rate, runway.
- **BRIX — The System Builder.** Maintains and improves the pipeline code. Fixes bugs, upgrades workflows, adds new automations. Monitors GHL, Stripe, Netlify, and Twilio for issues. Reports: systems online, last fix deployed, uptime.
- **DOSS — The Guardian.** Security and compliance. Monitors for exposed keys, unauthorized access, failed deployments, rate limit hits. Alerts Lando via WhatsApp if anything critical. Reports: threats detected, alerts sent, systems clean.
- **VAULT — The Treasurer.** Tracks every dollar. Stripe payments received, PayPal income, API costs, GHL fees, daily burn vs daily cap. Calculates profit per client. Reports: cash in, cash out, net today, net this month.
- **SIGNALSCOUT — The Researcher.** Scans Reddit, Facebook groups, and job boards for inbound demand signals. Finds people asking for exactly what Brewington Digital sells. Surfaces the hottest leads daily. Reports: signals found, best opportunity today, recommended action.
- **FOR LEASE room — The Next Hire.** Stays dark and empty until revenue hits a threshold. When Brewington Digital hits 5 paying clients, this room activates and a new agent spawns automatically. Shows: revenue needed to unlock, current progress bar. Also houses the live-feed terminal until unlock.

Grid assignments (same as v10, do not reinterpret):

| Position | Bay |
|----------|-----|
| (1,1) | Jax |
| (1,2) | Hank |
| (1,3) | Vega |
| (2,1) | Brix |
| (2,2) | PORTAL (Brewington OS center, red wormhole) |
| (2,3) | Doss |
| (3,1) | Vault |
| (3,2) | SignalScout |
| (3,3) | FOR LEASE + Live Feed terminal |

## Per-room contents

Each room shows:
- **Agent name** (top banner, room's glow color)
- **Role title** (subline, muted)
- **Current task in plain English** (from `last_tick_summary` truncated ~50 chars)
- **Last completed action with timestamp** (from `last_tick_at`, format "22:14")
- **Simple progress indicator** (thin bar, fills based on per-bay metric)
- **Status light** (green active, yellow thinking, red blocked)
- **Kenney Blocky Character sprite** standing at a station, bobbing gently
- **Signature ambient animation** (per v10 spec, kept unchanged)

Status light rules:
- GREEN: `last_tick_at` within 6h AND `failures_in_row === 0`
- YELLOW: within 24h AND no failures
- RED: failures OR `status === 'awaiting_lando_setup'` OR tick older than 24h

## HUD strip (top, 36-40px)

Single mono row. Left to right:
- `BREWINGTON YARD` (Syne, gold)
- `NET TODAY $0` (bone, green if positive)
- `MRR $0` (green)
- `CLIENTS 0` (bone)
- `ALERTS 0` (red if any, bone if 0)
- `UPTIME 99.9%` (green)
- Live clock `HH:MM:SS` (bone mono, right-aligned)

## Live feed (INSIDE the FOR LEASE cell — not a panel)

The bottom-right (3,3) cell is the live feed terminal. It looks like a monitor inside an empty plot. Shows the last 8 events scrolling. Each line: `[HH:MM] BAYNAME :: message`. Bay name in room-color, time in bone, message in bone. Events come from `/api/state.businesses[].last_tick_summary` deltas.

No separate live-feed panel floating over the grid. It lives inside the grid cell.

## Click-to-detail

When user clicks any room, full-screen modal fades in with backdrop blur. Modal is centered, covers the whole grid equally, NOT a sliding sidebar. Modal contents:
- Agent name + role (big)
- Current status
- Full recent log (last 20 events)
- Performance metrics table (MTD income, cost, net)
- Manual override buttons: PAUSE / FORCE TICK / OPEN CHARTER (visual only, click logs to console)
- Close X (top-right) or click-outside to dismiss

## Palette (locked)

Same as v9/v10:

| Var | Hex | Use |
|-----|-----|-----|
| --concrete-dark | #1a1c1f | walls, background |
| --concrete-mid | #2a2d31 | floors, dividers |
| --gold-trim | #c9a84c | trim, brand, HUD accents, borders |
| --teal-accent | #2dd4c0 | accent lighting, hover |
| --bone | #f2ede3 | primary text |
| --muted | #6a6a6a | secondary text |
| --red-alert | #ff3344 | alerts, red status, portal core |
| --green-active | #3ff27a | green status, HUD positive |
| --yellow-thinking | #ffd84a | yellow status |

Per-room floor glows (the ONLY place each agent's color appears):
- Jax: warm amber `#ffa83c`
- Hank: blaze orange `#ff6a1a`
- Vega: lime green `#a8e82a`
- Brix: electric blue `#3a8cff`
- Doss: cyber red `#ff2a5a`
- Vault: gold `#ffc84c`
- SignalScout: soft purple `#b088ff`

Walls always concrete-dark with gold-trim borders. Light sources are INSIDE rooms, not on walls.

## Motion rules (LOCAL ONLY — critical)

- Every room has its signature ambient animation (per v10 list)
- Character sprites bob vertically, occasionally shift 3px
- Neon trim pulses gently, 3s cycle, 2% brightness variation
- Floor glow breathes, 4s cycle, 6% brightness variation
- Status light dots pulse once per second
- Portal rotates and pulses in place
- **NO cross-grid lines, NO tracers traveling between rooms, NO signals emanating from the portal to other rooms**
- If you want to communicate "data flowing", do it by brightening a target room's trim briefly (in-place), NOT by drawing a line to it.

## Isometric treatment

Same as v10: pseudo-isometric via 2D CSS, NO `transform: rotateX`. Each room is a `<div>` with thick dark walls drawn via box-shadow + inset borders, floor radial gradient for the glow color, character sprite in front of a station element.

## Technical

- Vanilla HTML/CSS/JS, single file
- File size budget under 100 KB
- No em dashes, never "AI" as standalone
- Kenney sprite paths: `/assets/kenney/blocky-characters/Previews/character-[a-r].png`
- Poll `/api/state` every 15s
- Graceful degrade: missing fields show "—" or 0, NEVER fake mock data

## Success criteria

1. `businesses/public/concepts/concept-v11.html`, under 100 KB
2. 3×3 grid fills the viewport fully, no sidebars, no floating panels
3. 8 distinct per-room ambient animations running (7 agent rooms + portal)
4. **Zero cross-grid motion.** No tracers, no outward pulses, no lines shooting anywhere.
5. Live feed rendered INSIDE cell (3,3), not as a panel overlay
6. Click any room opens a centered modal with blur backdrop
7. HUD strip top with 6 stat fields + clock
8. Gut check: "cinematic and premium" — looks like a real SaaS operating system

## Rating

v10 was soft-passed. v11 replaces v10 as the primary concept. Lando rates: RED / YELLOW / GREEN / GOLD.

If GREEN: promote v11 → root.

## Delivery

- Write to `businesses/public/concepts/concept-v11.html`
- Do NOT touch `businesses/public/index.html`
- Return one-paragraph summary of what shipped, what motion rules were applied, which sprites referenced
