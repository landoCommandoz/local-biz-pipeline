# Command Center Redesign v3: Living Village + Earnings Panel

**Project:** command-center-redesign-v3
**For:** Lando (landlord)
**Owner bay:** Jax (Builder)
**Output path:** `businesses/public/index.html` (overwrite)
**Build from:** current v2 dusk village at `businesses/public/index.html`

## The vision

"Make it 10x realistic. As close to a human as possible. Everything you know about a human's daily routine is up for grabs. Also get rid of the thing on the right side — I need to know how much money these agents are making, what they do for work, how they contribute to the ecosystem. We watch in real time the ecosystem build friendships, buy cars, get mail, go to work."

Two big shifts from v2:

1. The plots become HOMES. Every tenant has a routine, a vehicle, a pet, a mailbox, a life.
2. The right rail (inbox + activity feed) is GONE. Replace it with a living ledger: each tenant's earnings, their current job, their contribution.

## Layout change

**REMOVE:** the right rail (`<aside class="rail">` and its two sections: Inbox and Yard Activity). Delete the section entirely along with its CSS.

**ADD on the right:** a "Ledger Panel" that lists all 5 tenants as rich rows. Each row shows:
- Name (Syne 800, like a nameplate)
- Role ("Foreman", "Scout", etc.)
- **Monthly earnings** prominent number in JetBrains Mono ($X earned this month from `month_to_date.income`)
- **Monthly rent** ($20 or $40 baseline)
- **Net** (income minus rent, green if positive, red if negative)
- Current job / work: a one-line description of what they produce (Hank: "Hires tools into the yard", Vega: "Sells lead lists on Gumroad", etc.)
- Contribution bar: how much they've added to the ecosystem (hires count for Hank, products listed for Vega, projects completed for Jax, ledger entries for Doss, tenants managed for Brix). Render as a slim horizontal meter under the row.
- A tiny mode indicator (cyan dot when `mode` is actively doing something, muted grey when idle)

The Ledger Panel takes the old rail's grid area. Layout remains: 60px top bar, main map on left, Ledger Panel on right at ~320px wide.

## Living village (keep all v2 brief details, plus social interactions)

### Per-tenant character details (from v2 brief, all still required)
**Hank:** old pickup truck, dog by doorway, coffee mug on oil drum, faded flag decal, radio antenna with faint light glow.
**Vega:** bike rack with 2 bikes, chalkboard sidewalk sign, cat in lit window, potted herbs, "THANK YOU" mat, 2 coffee cups on bench.
**Jax:** customer pickup out front, older work truck with ladders, radio speaker, beer cooler, clipboard on nail, Gatorade on workbench.
**Doss:** clipped hedge, brick walkway, reading glasses on sill, tea kettle with steam, neat mailbox, cat statue, umbrella.
**Brix:** black sedan, two rocking chairs, flowerbed, newspaper on railing, hanging basket, briefcase by door, phone indicator above when on the phone.

### Tiny people (simple figures)
Circle head (r=2.5) + short rounded body rectangle (w=4, h=6). One color per figure.

Routines by server hour (`new Date().getHours()`):
- **06-08 dawn:** Hank on steps with coffee, Doss watering garden, Brix getting newspaper, windows lighting up one by one.
- **08-12 morning:** Vega unlocking store, Jax opening garage, Hank working inside (silhouette in door), Doss at desk silhouette, Brix in porch chair on phone.
- **12-14 lunch:** Vega on bench eating, Jax on Hank's oil drum (visiting = FRIENDSHIP), Doss back on porch with lunch plate.
- **14-18 afternoon:** 1 customer figure near Vega's store, 1 customer figure near Jax's garage, Doss silhouette at desk, Brix standing by sedan.
- **18-20 dusk:** Hank smoking on bench, Jax closing bay door, Vega sweeping sidewalk, Doss on porch, Brix walking to sedan.
- **20-22 evening:** all inside, blue TV-glow through windows (rotating color), porch lamps on.
- **22-06 night:** silent, streetlamps only, a raccoon crossing the road, moonlight, stars.

### Sky and time-of-day
Gradient changes by current hour:
- 05-07 dawn: pink-orange horizon, cool top.
- 07-10 morning: light blue-white, east rays.
- 10-16 midday: crisp blue sky, short shadows.
- 16-19 golden hour: orange-pink, long shadows.
- 19-20:30 dusk: warm west, cool east (v2 current).
- 20:30-22 blue hour: dark blue, streetlamps prominent.
- 22-05 night: deep navy, stars + crescent moon + dim streetlamps.

Windows are MUCH brighter at night. Dim during midday.

### Social interactions (the "ecosystem is alive" requirement)
These are THE feature the user asked for. Implement at least 4:

1. **Mail truck drives the loop road every 45s during 10:00-17:00.** White rectangle with blue stripe and "USPS" tiny text, follows the main loop path. When it passes a plot, briefly flips that plot's mailbox flag UP for 5s.

2. **Friendship visit.** At lunch hour (12-14), render a small figure walking from Jax's plot toward Hank's plot and stopping near Hank's oil drum. Text tag "VISITING" floats briefly above.

3. **Mail flag logic.** Each plot has a mailbox. Flag goes UP when there's a new untriaged application in Brix's inbox OR when the mail truck just passed. Flag goes down after 30s.

4. **Car purchase event.** When a tenant's `month_to_date.income` crosses a $100 threshold (check on each state refresh), briefly animate a small confetti burst over their plot + replace their parked vehicle with a slightly different color (new car). Persist the "new car" indicator with a small ★ star above the car for the rest of the session.

5. **Commute lines.** At 07:30-08:30 and 17:30-18:30, render a dashed cyan line from each tenant's plot to the plaza and back (symbolic commute). Subtle, low opacity.

6. **Pet action.** Hank's dog wags tail (tiny circle moving 2px back and forth) during 08-18. Cat in Vega's window blinks (tiny vertical line scales 0-100% every 8s).

### Vehicles (keep from v2 brief)
Per-tenant parked vehicles plus one animated mail truck on the loop road during work hours, one raccoon crossing at night, and one tumbleweed rolling edge to edge during 22:00-06:00 every 90s.

### Mailboxes, fences, trash cans
Each plot has a mailbox at the road edge. Hank and Jax have trash cans beside their workshops. Doss has a white picket fence along the front walk. Brix has a low wooden fence around his flowerbed.

### Stars and moon
When hour >= 20 or < 6, render 10-12 random small white dots in the upper sky + a thin crescent moon.

## Ledger Panel (right side, replacing the old rail)

Structure (inside `<aside class="ledger">`):

```
<aside class="ledger">
  <div class="ledger-head">
    <div class="ledger-title">THE BOOKS</div>
    <div class="ledger-sub">What the yard is earning, right now.</div>
  </div>
  <ul class="tenant-rows">
    <!-- 5 tenant rows, one per bay -->
  </ul>
  <div class="ledger-foot">
    <div>MTD net: <strong id="kv-net">$0</strong></div>
    <div id="server-hour">--:--</div>
  </div>
</aside>
```

Each row:
```
<li class="tenant-row" data-agent="foreman">
  <div class="row-head">
    <div class="row-name">HANK</div>
    <div class="row-role">Foreman</div>
    <div class="row-mode-dot"></div>
  </div>
  <div class="row-money">
    <div class="money-earned">$0</div>
    <div class="money-rent">rent $20/mo</div>
    <div class="money-net neg">-$20</div>
  </div>
  <div class="row-job">Hires tools into the yard</div>
  <div class="row-contrib">
    <div class="contrib-bar"><div class="contrib-fill" style="width: 85%"></div></div>
    <div class="contrib-label">7 hires filed</div>
  </div>
</li>
```

Role copy (one line each):
- Hank: "Hires tools into the yard. Runs the install bench."
- Vega: "Sells lead lists on Gumroad. $49 per pack."
- Jax: "Builds internal tooling and rebuilds prospect sites."
- Doss: "Keeps the books. Tracks tokens, ledger, and rent."
- Brix: "Lists plots and triages tenant applications."

Contribution bars:
- Hank: (hire_count / 10) capped at 100% — label "N hires filed"
- Vega: (products_listed / 3) capped at 100% — label "N product listed"
- Jax: (project_count / 5) capped at 100% — label "N builds shipped"
- Doss: (ledger_entries / 50) capped at 100% — label "N ledger entries"
- Brix: (tenants_managed / 8) capped at 100% — label "N tenants + M vacancies"

Style the ledger panel: glassy backdrop blur, same brand system, prominent numbers in cyan or amber depending on net positive/negative. Active mode dot breathes cyan.

## Live data contract (unchanged)
- `/api/state` → 5 businesses with `name`, `display_name`, `mode`, `status`, `last_tick_at`, `month_to_date`, `hired_roster`
- `/api/realestate` → `vacancies[]`, `applications[]`, `rent_roll.tenants[]`
- `/api/activity` — still fetch for dashboard behavior but no longer displayed on right rail
- `/api/stream` → SSE events `change`, `hire`, `realestate`

## Constraints

- **No em dashes** anywhere in visible copy. Use commas or periods.
- **Never the word "AI"** anywhere. Use "agent", "automation", "model".
- Single self-contained HTML file. Inline CSS. Vanilla JS + SVG DOM (`createElementNS`). No frameworks.
- Keep brand: #06060a bg, #00e5ff cyan, #f2f0ed warm, Syne 800, DM Sans, JetBrains Mono.
- Keep plot coordinates: Hank 420,400 / Vega 1180,400 / Jax 420,700 / Doss 1180,700 / Brix 800,680 / vacancies 180,540 + 1420,540.
- Keep top bar stats layout (they stay).
- File size budget: up to 140 KB.

## Success criteria (verify before claiming done)

1. Right rail is GONE. No `Inbox` title, no `Yard Activity` title, no `.app` or `.entry` classes referenced.
2. New Ledger Panel visible on the right with 5 tenant rows.
3. Map shows at least: mail truck animation (or placeholder when outside work hours), mailboxes on all 5 plots, vehicles per tenant, at least 2 visible human figures (dependent on current hour), stars at night or sun-tinted sky at day.
4. File serves at HTTP 200 from `curl http://localhost:3000/`.
5. Grep: `grep -E 'ai | AI |—' businesses/public/index.html` returns only whitelisted matches (class names like `ai` or `email` are fine, but no visible "AI" word in text content; zero em dashes).
6. File is under 140 KB.

## When done

- Overwrite `businesses/public/index.html`
- Set `businesses/builder/current_project.json` status `completed` + `completed_at` ISO
- Append one-line `BUILD ::` entry to `businesses/builder/log.md`
- Return a one-paragraph summary listing the 5-7 most impactful additions and any trade-offs
