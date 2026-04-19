# Command Center Redesign v5: Sim-Native Yard, Rent-Day Spine

**Project:** command-center-redesign-v5
**For:** Lando (landlord)
**Owner bay:** Jax (Builder) via the designer hire (claude-sonnet)
**Output path:** `businesses/public/concepts/concept-v5.html`
**Supersedes:** v4 (`businesses/public/index.html`)

## One-sentence goal

Rebuild the god-view as a **landlord's sim**, not a dashboard — every bay on a visible countdown, the yard reads health at a glance, new bays appear *automatically* the moment they exist in `/api/state`.

## Why v5 is a reset, not an extension

v1 through v4 accumulated a Saturday-morning village: cat, dog, raccoon, tumbleweed, mail truck, confetti, twinkle, smoke. That aesthetic is a kids' game. v5 is a **landlord's ops console** with sim-world depth. Reference points:

- **RimWorld / Prison Architect** — top-down colony. Every pawn has visible state. Read the scene like a dashboard.
- **Severance (MDR floor)** — cold, telemetric, calm weight of consequence. No decoration, everything means something.
- **Death Stranding HUD** — data over the world, overlays as readouts.
- **Dwarf Fortress** — maximal simulated systems underneath a minimal presentation.

Whimsy can stay, but only when it communicates state.

## Hard kill list

Remove completely. No exceptions:

- Cat, dog, raccoon, tumbleweed, walker pedestrians, dust motes, smoke puffs, confetti
- Mail truck loop, offset-path animations, beacon pulses as decoration
- Sign sway, grass wave, window flicker (the cartoon flicker, not functional pulses)
- Twinkle stars, ambient sky gradient
- Cartoon-scale illustration of buildings (round shapes, big bold outlines, toy colors)
- Any emoji in visible copy
- Any text that calls this a "village" or uses cute trade words

## Keep list

- Brand: Signal colors (cyan accent, warm off-white, danger red, success green, amber)
- Fonts: Syne (display), DM Sans (body), JetBrains Mono (mono)
- Grid shell pattern (top bar, stats, ledger column on the right)
- Live data contract: `/api/state`, `/api/realestate`, `/api/activity`, `/api/stream`
- The clock, dusk indicator, lamp indicator logic
- Brand line at top ("BREWINGTON YARD // GOD VIEW")
- No em dashes. Never the word "AI" as standalone.

## New spine: rent-day tension

**Every bay is visibly on a 30-day kill countdown.** That is the story of the yard. Everything else serves it.

Per-bay visual language:

- **Kill clock** — primary readout on every bay. "18d" / "7d" / "OVERDUE". Color gates:
  - Green: > 15 days AND month-to-date revenue on pace for `target_revenue_mo_1`
  - Amber: 7-15 days OR revenue trailing but not dead
  - Red: < 7 days AND under kill threshold
  - Black: evicted (bay boarded up, dimmed 60%, greyscale)
- **Health pulse** — bay "breathes" at a cadence based on `last_tick_at` freshness. Fresh tick (<6h) = slow steady pulse. Stale (>24h) = dim, slow. Dead (>72h) = flatline.
- **Revenue gauge** — thin horizontal bar per bay showing MTD income vs `target_revenue_mo_1`. Fills cyan up to target, amber past target.
- **Failure counter** — if `failures_in_row > 0`, small red chevron badge on the bay with the number.

## Dynamic bay rendering (critical)

**The village must NOT hardcode bays.** Render from `/api/state` at runtime. One bay per entry. Layout is a clean grid of plots (4 or 5 columns, rows as needed), NOT a pictorial village scene.

When Hank hires a new agent and its `state.json` lands in the bays payload, the new bay **appears on the grid on the next refresh** with its own kill clock already ticking. No code changes required.

Plot anatomy (left to right within each bay card):

1. Bay name (display_name, big) + role_title (small)
2. Status badge (current_mode)
3. Kill clock readout (18d / OVERDUE / etc.)
4. Revenue gauge bar
5. Last-tick freshness indicator (pulse)
6. Failure chevron if present
7. One-line last_tick_summary, truncated
8. Tiny row of hire chips (up to 7, slug initials only, tooltip on hover)

## Top bar (keep, tighten)

- Brand block on the left
- Live stats in mono, right-aligned: total MTD income, total MTD cost, net, tenant count, alert count (from v4 logic)
- Clock, dusk marker, scheduler lamp
- **Rent-day banner** — when today is the 1st of the month OR any tenant is within 3 days of their `d30_checkpoint`, a thin banner drops under the bar with a drumbeat pulse: "RENT WEEK — {n} tenants on the clock". Otherwise hidden.

## Wins ticker (keep from v4, upgrade)

Horizontal marquee below the top bar. Same win-types as v4, but use mono type, no emoji, and each win is anchored to the bay it came from — clicking a win pulses that bay.

## Ledger panel (right column, keep, tighten)

Books column stays. Structure:
- MTD summary (income, cost, net)
- Last 12 ledger entries, mono, newest on top
- Click an entry to pulse the source bay

## Layout

Grid shell:
```
top-bar                                                   56px
rent-day-banner (conditional)                             0 or 28px
wins-ticker                                               32px
[village grid                        ][books ledger   ]   1fr
                                     [  fixed 320px  ]
```

Village grid = CSS grid, 4-5 columns, auto-fit. Each bay card ~240px wide, ~180px tall. Responsive down to 2 columns at narrow widths.

**No SVG scene.** No offset-path animations. Motion only on: kill-clock tick (numerical countdown once per minute), health pulse, rent-day drumbeat, win-event flash. That's it.

## Data contract (exact fields the designer will consume)

Per bay entry from `/api/state` (the server already provides these):

```
display_name, role_title, current_mode, status,
last_tick_at, last_tick_summary,
failures_in_row,
month_to_date.income, month_to_date.cost,
self_funding_plan.target_revenue_mo_1, self_funding_plan.kill_at_d30_under,
business_pitch.d30_checkpoint, business_pitch.status_badge,
hired_roster[]
```

Per tenant from `/api/realestate`:
```
slug, rent_status, d30_checkpoint, mtd_rent_paid
```

If a field is missing, render a muted placeholder, never break.

## Constraints

- File size budget: under 80 KB total. This is a reset, you have headroom.
- Vanilla JS + CSS. No frameworks. No CDN imports beyond Google Fonts.
- No inline images, no base64. Use inline SVG for any glyph.
- No em dashes anywhere. Never the word "AI" as standalone.
- Brand colors and fonts unchanged.
- Must still respond 200 on `curl http://localhost:3000/concept-v5` once the server learns the route. For now only the file needs to exist at the output path.

## Success criteria (Lando verifies before promote)

1. File saves to `businesses/public/concepts/concept-v5.html`
2. Under 80 KB
3. Opens in a browser and renders from `/api/state` without hardcoded bay names
4. Every bay card shows a visible kill clock
5. Dim/dead bays look dim/dead (not cartoon happy)
6. No cat, dog, raccoon, tumbleweed, mail truck, confetti, smoke, twinkle
7. Rent-day banner appears when condition met
8. Grep: zero em dashes, zero standalone "AI" in visible copy
9. Lando's gut-check: "this looks like an ops console for a small business, not a game"

## Rating loop (designer's kill clock)

Lando rates this output **RED / YELLOW / GREEN / GOLD**. Logged to the designer hire's rating_log in builder/state.json. Three consecutive REDs and Hank hunts a replacement designer.

- **RED** — still feels like a game, or missed kill list, or broke the dynamic bay rule
- **YELLOW** — right direction, execution flaws
- **GREEN** — ship it as index.html
- **GOLD** — exceeds brief, keep the designer on permanent retainer

## When done (designer + tick responsibilities)

- Designer writes the complete HTML to `output_path`
- Tick flips current_project.status to `filed` and records completion in state.json
- Tick logs one line: `BUILD :: v5 concept filed at concepts/concept-v5.html, awaiting Lando rating.`
- Do NOT overwrite index.html. Lando promotes on GREEN.
