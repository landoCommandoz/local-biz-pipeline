# Command Center Redesign v4: Alert Count + Wins Ticker

**Project:** command-center-redesign-v4
**For:** Lando (landlord)
**Owner bay:** Jax (Builder)
**Output path:** `businesses/public/index.html` (extend v3, do NOT rewrite)

## Goal
Add the two missing decision-surface features to the v3 living village so the dashboard is useful at a glance:

1. **Alert count** (top-right of the top bar) — a red badge showing total things waiting on Lando's action
2. **Wins ticker** (thin strip below the top bar) — running marquee of recent good events across the yard

Bonus if it fits cleanly: **days-to-kill-clock** countdown under each tenant's rent badge.

## Build from

`businesses/public/index.html` as it stands after v3. Extend it. Preserve:
- All village art (buildings, vehicles, pets, sky, mail truck, etc.)
- The Books ledger panel on the right
- Top bar layout and stats
- Brand (Signal colors, Syne / DM Sans / JetBrains Mono)
- Live data contract (/api/state, /api/realestate, /api/activity, /api/stream)
- Plot coordinates

## Feature 1: Alert count badge

**Location:** top bar, far right, before the clock. Visually a small red circle with a number inside, the number being the sum of all "needs Lando attention" items.

**What counts as an alert:**
1. Applications in inbox that are NOT triaged (`applications[].triaged === false`)
2. Bays with `status === 'awaiting_lando_reply'` AND `last_escalation_at` more than 48 hours ago (stale escalations)
3. Bays with `failures_in_row > 0`
4. Tenants with rent status `default` (already overdue on rent)
5. Tenants within 3 days of their `d30_checkpoint` AND status is not `current`

Compute the total in JS on every state refresh. Render:
```html
<div class="alerts" id="alerts" onclick="showAlerts()">
  <span class="alerts-dot"></span>
  <span class="alerts-n" id="alerts-n">0</span>
  <span class="alerts-lbl">Alerts</span>
</div>
```

Style:
- Red pill (`#ff5a5f` background) when count > 0
- Muted grey when count === 0
- Subtle pulse animation when count > 0 (2s breathe cycle)

Clicking the badge runs a JS function that opens a modal-ish simple dialog listing each alert item with its reason. Use a plain `<dialog>` element or a floating `<div>` overlay. Keep it simple — one small panel, brand-colored, dismissable by click-outside or ESC.

Each alert row in the modal shows: tenant or source, type of alert, how old it is, one-line why.

## Feature 2: Wins ticker

**Location:** a thin horizontal strip (~32px tall) directly below the top bar, above the map. Scrolls horizontally showing recent wins.

**What counts as a win:**
1. New hire added to any bay's `hired_roster` (compared against a client-side snapshot)
2. New application arriving in the inbox (new file in applications/)
3. A tenant's `month_to_date.income` increasing
4. A successful tick (`last_tick_at` advanced AND `last_tick_summary` contains no "FAIL" substring)
5. Rent status improving for any tenant (e.g., behind -> partial, partial -> current)

Implementation:
- Keep a client-side `SEEN` map in memory. On every state refresh, compare new values to seen, emit win events for the deltas.
- Store the last ~12 wins in an array. Render as a horizontally scrolling marquee: CSS `@keyframes` translates the inner strip leftward forever, duplicated content for seamless loop.
- Each win is a small pill: agent-color dot + short text + "just now" / "2m ago" timestamp.

Example copy:
- "VEGA $49 sale on Phoenix HVAC list"
- "HANK filed hire: htmx+alpine"
- "BRIX triaged Signal Scribe application"
- "JAX tick shipped v3"
- "DOSS ledger entry: $49 income"

If fewer than 3 wins exist, show a ghost placeholder: "(watching for yard activity)" centered in the strip, muted text.

Height pushes the map down 32px; adjust the grid rows accordingly.

## Bonus: Days-to-kill-clock bar (only if time allows)

Under each tenant's rent status badge on the village map, add a thin horizontal progress bar showing how close they are to their d30 checkpoint.
- Width 80px, height 3px
- Fill color: success if > 15 days, amber if 7-15 days, danger if < 7 days
- Fill amount = (days_to_checkpoint / 30) * 100%
- Below the bar, tiny text: "18d" or "OVERDUE"

Use `d30_checkpoint` from the rent_roll tenant entry. Skip if not present.

## Constraints

- Preserve v3 visual. Do NOT rewrite the village from scratch.
- File size budget: add up to 20 KB on top of v3's 76 KB (target max 100 KB).
- Vanilla JS + SVG. No new dependencies.
- No em dashes. Never the word "AI".
- Brand colors, fonts unchanged.

## Success criteria (verify before claiming done)

1. `curl http://localhost:3000/` returns 200
2. File size under 100 KB
3. Alert count badge appears in top bar
4. Wins ticker strip visible below top bar
5. Clicking alert badge opens the alert list
6. If no alerts, badge renders muted with 0
7. If no wins, ticker shows the ghost placeholder
8. grep: zero em dashes, zero standalone "AI" in visible text
9. All v3 village features still work (mail truck, tenants, sky, Books ledger, etc.)

## When done

- Overwrite `businesses/public/index.html`
- Set `businesses/builder/current_project.json` status to `completed` + `completed_at` ISO
- Append one line to `businesses/builder/log.md`: "2026-04-17 <HH:MM> :: BUILD :: v4 alert count + wins ticker shipped. Contracted build, Jax foreman."
- Return one-paragraph summary
