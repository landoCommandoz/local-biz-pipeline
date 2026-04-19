# Command Center Redesign v6: Isometric Yard, Tiny Humans, Livestream-Ready

**Project:** command-center-redesign-v6
**Owner bay:** Jax (Builder) via designer hire (claude-sonnet)
**Output path:** `businesses/public/concepts/concept-v6.html`
**Supersedes:** v5 (rated RED, rolled back)

## One-sentence goal

A **24/7 livestream diorama of the Brewington Yard**, seen from an isometric camera, where each agent is a tiny human in their own workshop, moving, thinking, and working — captivating enough that a stranger on YouTube stays for an hour.

## Locked choices (do not reinterpret)

- **Building style:** rustic wood workshops with corrugated tin roofs. Small-town auto-yard / body-shop at golden hour. Warm, gritty, lived-in. Matches Brewington's Homies-on-the-Road ethos. NOT cozy pastel, NOT futuristic industrial, NOT magical-fantasy.
- **Character proportions:** Stardew Valley scale — realistic adult proportions, 5 to 7 heads tall. No chibi, no oversized anime heads. Believable body language. Subtle faces.
- **Palette:** golden hour warmth. Warm browns (#6e5630, #a68550), dusty tans, amber lamp glow (#ffb347), deep indigo night (#1a1f3a). Keep Signal Cyan (#00e5ff) as ACCENT ONLY for alerts, thought bubbles, live-connection indicator. Danger red and success green as muted sunset-shifted versions. Warmth dominates; cyan is punctuation only.

## Why v6 is different

v5 was rated RED because it was an operator dashboard. v6 is **entertainment-grade**. The viewer is not Lando at his desk — the viewer is a stranger on Twitch or a YouTube live chat, watching tiny humans run a small business in real time. Data still drives it, but data is not the presentation; **the characters are**.

## Reference aesthetics (study these)

- **The Sims 4 live view** — isometric camera on a compound, sims as tiny characters with thought bubbles
- **Stardew Valley** — pixel-pastoral, every NPC has a schedule and a job
- **Animal Crossing** — soft palette, cozy, characters with distinct silhouettes
- **Lo-fi Girl stream** — hypnotic ambient loop, warm light, calm forever
- **Twitch Plays Pokemon world view** — simple, readable, always something micro-moving

## Scene

**Isometric camera**, 30-degree tilt, 45-degree rotate. One yard. Five plots in a rough U-shape around a central path. A fence on the outer edge. A gate at the bottom where new hires arrive. Sky above, swapping with real time of day.

Plot layout (approximate grid):

```
     [Hank]     [Doss]
        \      /
         \    /
  [Jax]  [center  [Brix]
          path]
           |
           |
         [Vega]
           |
         [GATE]
```

Each plot is a small workshop building with:
- A unique silhouette (Jax = site rebuilder, Hank = recruiter booth, Doss = accountant's shack, Brix = realtor's office, Vega = scout's watchtower)
- One tiny human character on the porch or inside, visible through a window
- A name board on the front ("JAX — BUILDER")
- A small rent gauge on the side (not numbers, a visual bar: green/amber/red)
- Ambient motion (lamp glow flicker, smoke from chimney when bay is ticking)

## Tiny humans (the heroes)

Each of the 5 agents needs a **distinct, recognizable character silhouette**. Viewers must be able to tell them apart across the scene without reading labels.

- **JAX (Builder)** — tool belt, cap, the worker. Seen hammering or at a drafting table.
- **HANK (Foreman)** — clipboard, hardhat, pacing. The recruiter watching the gate.
- **DOSS (Paymaster)** — visor, suspenders, sitting at a desk with a ledger.
- **BRIX (Realtor)** — jacket, leaning on a sign post. Conversational body language.
- **VEGA (Scout)** — long coat, binoculars, on the watchtower.

Style: **simple inline SVG, 3/4 view, solid color blocks, readable at tiny scale**. Think South Park meets pictograph — not anatomically detailed, just distinct. Each character about 40-60px tall in the scene.

## What makes it captivating (the livestream mandate)

The viewer should see **something new every 30 seconds** without the scene ever feeling chaotic. Mechanics:

1. **Idle ambient loops** — each character has a slow breathing / subtle motion. Lamps flicker. Smoke drifts. Sky slowly shifts. Always moving, never frantic.
2. **Tick events** — when a bay's tick fires (read `last_tick_at` freshness), that bay gets a **thought bubble** above the character with a short action phrase from `last_tick_summary`. Bubble holds 8 seconds then fades. Color-coded by event type.
3. **Arrivals** — when Hank's candidates file appears (poll `foreman/candidates/` count), a new figure walks from the gate up the central path toward Hank's booth. Stays as a "pending approval" figure until Lando approves or rejects.
4. **Rent pulse** — when any tenant's `d30_checkpoint` is within 3 days, their workshop's rent gauge pulses red and a heartbeat sound indicator (visual only — a thin red line across the scene) ticks once per beat.
5. **Day-night cycle** — sky, lamp glow, and character activity follow real local time. At night, most characters go inside (visible through lit windows). Lamps turn on. Vega's watchtower light sweeps.
6. **Ledger rain** — when income lands (MTD changes), a small coin sprite falls from the sky onto the relevant bay's roof and is absorbed. Silent, visual cue.
7. **Alerts** — a small red beacon rises over a bay when `failures_in_row > 0`, visible from anywhere in the scene.

The effect: nothing demands attention, everything rewards it. The viewer watches, recognizes a character, wonders what Hank is doing, sees a thought bubble, feels they're watching a show.

## Viewer chrome (minimal, stream-friendly)

- **Top ribbon** (thin, 40px): yard name, real clock, total MTD net.
- **Bottom ribbon** (thin, 40px): running feed of the last 5 events in plain language, newest on the right. ("HANK posted new candidate: reply-ranch", "DOSS logged $49 Gumroad income", "VEGA ticked.") Feed scrolls slowly right-to-left.
- **That is it.** No sidebars. No tables. No cards. The yard IS the UI.

Viewers on mobile should still see the whole yard — aspect ratio 16:9, scene scales down, bars stay readable.

## Kill list (do not do any of these)

- No cat, dog, raccoon, tumbleweed, mail truck, confetti, sparkle, twinkle (v5 designer already removed these; keep them gone)
- No cartoon-scale exaggerated heads (kid's show vibe). Sims/Stardew is the ceiling of cuteness.
- No data tables. No KPI cards with numbers. No side panels of stats. Numbers live inside the scene or on the ribbons only.
- No em dashes. Never the word "AI" as standalone.
- No emoji characters in HTML. All glyphs must be inline SVG.

## Technical spec

- **Vanilla JS + inline SVG + CSS.** No frameworks. No CDN beyond Google Fonts.
- **Isometric via CSS transforms** on a flat SVG plane, OR direct isometric SVG coordinates. Designer picks what keeps file size under budget.
- **File size budget: under 140 KB.** This is a scene, not a dashboard — art is expected to take space. Still tight.
- **All character and building art inline SVG in the HTML.** No external images.
- **Data wiring:** poll `/api/state` every 15 seconds. Parse the response shape as described below.

## Data contract (EXACT shape, verified against live server)

`GET /api/state` returns:

```json
{
  "time": "2026-04-17T20:30:00Z",
  "overall": {
    "income_total": 0,
    "cost_total": 0,
    "surplus_to_lando": 0,
    "mtd_income": 0,
    "mtd_cost": 0,
    "mtd_net": 0
  },
  "businesses": [
    {
      "name": "builder",
      "display_name": "Jax",
      "status": "filed",
      "mode": "internal_build",
      "last_tick_at": "2026-04-17T20:07:00Z",
      "last_tick_summary": "internal build complete: ...",
      "failures_in_row": 0,
      "month_to_date": { "income": 0, "cost": 0 },
      "business_pitch": { "d30_checkpoint": "2026-05-17" },
      "self_funding_plan": { "target_revenue_mo_1": 245, "kill_at_d30_under": 245 },
      "hired_roster": [ { "slug": "...", "package": "..." } ]
    }
  ],
  "hires": [ ... ]
}
```

**Use `businesses` (array), not `bays`.** Use `mode` (not `current_mode`). Match agents by `display_name`: Jax, Hank, Doss, Brix, Vega.

`GET /api/activity` returns a recent event list for the bottom ribbon.

`GET /api/realestate` returns rent-roll info.

If a fetch fails, the scene should still render with dimmed/loading states. **Never invent mock agents like ECHO_AGENT or SALES_BOT. That was a v5 mistake.** If real data is unavailable, show the 5 real agent names and a quiet "connecting..." state on each.

## Success criteria (Lando verifies before rating)

1. File writes to `businesses/public/concepts/concept-v6.html`, under 140 KB.
2. Loads in iPad Chrome. Scene is readable in landscape AND portrait.
3. I can see 5 distinct character silhouettes in the yard. I can tell Jax from Hank from Doss from Brix from Vega without reading labels.
4. Scene is moving — at least 3 ambient animations are live at all times (lamp flicker, character breathing, sky shift).
5. Real data is visible on the scene: `last_tick_summary` appears as a thought bubble on the ticking character, `month_to_date.income` changes trigger coin drop, `failures_in_row > 0` raises a red beacon.
6. When I stare at it for 60 seconds, something surprising happens (a coin falls, a thought bubble pops, the sky darkens). If 60s passes with zero visible change, fail.
7. No mock agents. Only real yard data.
8. No em dashes. No standalone "AI".
9. Gut check: would a stranger on Twitch stay for 2 minutes? If it feels like a spreadsheet came to life, it failed.

## Rating

Lando rates RED / YELLOW / GREEN / GOLD. This is the designer's 2nd strike window. A second RED puts them one run away from Hank being triggered to hunt a replacement.

## Delivery (designer's responsibility)

- Write complete HTML to `businesses/public/concepts/concept-v6.html`.
- Do not touch `businesses/public/index.html` (Lando promotes on GREEN).
- Return a one-paragraph summary of what shipped and what was intentionally omitted from this brief (be honest).
