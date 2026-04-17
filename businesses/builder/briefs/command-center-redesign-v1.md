# Command Center Redesign v1

**Project**: command-center-redesign-v1
**For**: Lando (founder, single user)
**Owner bay**: Jax (Builder)
**Output**: `businesses/public/concepts/concept-v1.html` — one self-contained HTML file

## Goal

Redesign the yard's command center into a single intentional screen that shows the four bays at a glance, pulls live state from the running server, and feels like something Lando actually wants open on a second monitor.

## The four bays

Render one card per bay. Names and roles are authoritative.

| Slug       | Name  | Role     |
|------------|-------|----------|
| foreman    | Hank  | Foreman  |
| scout      | Vega  | Scout    |
| builder    | Jax   | Builder  |
| paymaster  | Doss  | Paymaster|

Each card must surface, pulled live from `/api/state`:
- Display name and role
- Current mode (dry_run / live_send / internal_build / idle)
- Status string
- Last tick summary
- Last tick time as a humanized "x minutes ago"
- Failures in a row (warn badge if > 0)
- MTD income and cost for that bay

## Data sources

- `GET /api/state` — top-level overall numbers + `businesses[]` with all bay fields
- `GET /api/activity?limit=40` — merged activity feed across all bays
- `GET /api/stream` — Server-Sent Events, event names `change` and `hire`; on any event, refetch state and activity

## Brand system (The Signal)

- Background: `#06060a` near-black
- Primary accent: `#00e5ff` cyan (for live data, active states, underlines)
- Warm white: `#f2f0ed` (body text)
- Muted: `#6b6f78` (labels, timestamps)
- Danger: `#ff5a5f` (failure badges)
- Success: `#3dd68c` (positive deltas, filed status)

Typography:
- Headings: Syne, weight 800, tight tracking
- Body: DM Sans, weight 400 and 500
- Numbers and mono: JetBrains Mono, weight 500

Pull the fonts from Google Fonts (one link tag is fine). No external CSS framework.

## Layout (single screen, no scroll needed on a 1440p)

- Top bar: yard name on the left ("The Signal"), right side shows overall income_total, cost_total, surplus_to_lando. Live dot pulsing on the cyan when SSE is connected.
- Four bay cards in a 2x2 grid, generous spacing
- Right rail (or bottom strip on narrow screens): activity feed, newest first, agent name color-coded

## Constraints

- Single HTML file. Inline CSS. Vanilla JS or alpine. No build step.
- No framework, no bundler, no external dependencies except the two vendored scripts at `/vendor/htmx.min.js` and `/vendor/alpine.min.js` if they make the code simpler.
- No em dashes anywhere in visible copy.
- Never use the word "AI". Use "agent", "automation", or "model".
- Responsive down to a laptop (1280px). Mobile is not the priority here.
- No placeholder lorem text. If the API returns empty, show a quiet "(no data yet)".
- Lando is the only user. Feel intentional, not a demo.
