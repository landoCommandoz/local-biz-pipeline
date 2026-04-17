# Staged Dispatches

*Each block below is a ready-to-fire prompt for a background agent. Nothing fires until Lando says go. This file is a holding pen.*

## 0. Designer REFINEMENT pass - dashboard layout + character agents (AUTO-FIRE when pass #3 lands)

**Fires when:** The current background designer (agent abd826a4b12c7f446, the full-skill-stack god-environment rebuild) completes. Claude monitors for the completion notification and fires this prompt immediately after.

**Purpose:** Refactor whatever the previous pass produced into Lando's final layout and character-agent direction. This is an iteration pass, not a rebuild. Keep what aligns, fix what does not.

**Prompt to the refinement designer (verbatim):**

```
You are the FINAL refinement pass of the Brewington Command Station environment. An earlier full-skill-stack pass just shipped a god-environment view at /workspaces/local-biz-pipeline/businesses/public/index.html. Your job is to reshape that output to match Lando's exact final direction, using the full design skill stack to polish.

Skill stack required:
1. Invoke superpowers:brainstorming first on character design for each agent (diverge on at least 5 distinct character-visual languages before committing).
2. Invoke frontend-design:frontend-design for the layout refactor and production-grade character rendering.
3. Invoke ui-ux-pro-max for palette refinement, typography pairing, motion curves, and accessibility review.

Read first (in this order, full files):
1. /workspaces/local-biz-pipeline/businesses/public/index.html (current state)
2. /workspaces/local-biz-pipeline/businesses/foreman/charter.md
3. /workspaces/local-biz-pipeline/businesses/scout/charter.md
4. /workspaces/local-biz-pipeline/businesses/builder/charter.md
5. /workspaces/local-biz-pipeline/businesses/paymaster/charter.md
Verify the API with: curl -sS http://localhost:3000/api/state and curl -sS http://localhost:3000/api/portfolio

-----

## LANDO'S FINAL SPEC (four pillars, all mandatory)

### 1. LAYOUT: dashboard, not website
- The YARD MAP is the HERO. It fills the center of the screen, top to near-bottom. Map is the main thing a viewer sees.
- The agent roster lives in a SIDEBAR (left or right, designer's call based on what looks best). Each agent card in the sidebar shows: name, numbered bay (01, 02, 03, 04), status LED, mode, MTD income, MTD cost, MTD net, last tick relative time, failures_in_row counter, escalation banner if present, and a mission excerpt. Clicking an agent card opens the existing overlay.
- The top bar condenses the gatehouse + ledger totals + yard clock + shift readout into a compact strip.
- NOTHING LIVES BELOW THE MAP. No stacked sections. The shipped wall is either gone from this view or integrated into the map itself (crates along the right edge of the yard, growing with Builder's deploys). Portfolio page at /portfolio.html stays as a separate URL for deep browsing, but the dashboard does not stack it underneath.
- Footer: reduce to a single thin line (Lando hardhat, keyboard shortcuts). Not a full section.
- Single-screen at 1440x900. Everything above fold. Dashboard chrome, not a marketing page.

### 2. FEEL: real world view, not abstract grid
- This is a PLACE a person could walk into. Not an icon diagram.
- Lighting: sodium-lamp pools on the ground, long shadows from the fence and buildings, windows that glow warmer as the in-world clock moves toward night.
- Surfaces: concrete cracks, painted yard lines, gravel patches, oil stains, puddles after rain.
- Time-of-day passes visibly on a cycle: dawn (blue-violet + warm edges), day (bright sodium-wash), dusk (amber + long shadows), night (windows glow yellow, lamps pulse brighter). Use a 90-second cycle so a viewer sees it all within a short visit.
- Weather: occasional drifting dust; a light rain event when ANY agent has a live escalation (rain stops when the escalation clears).
- Depth: slight tilt or orthographic perspective so it reads as a world, not a flat schematic.

### 3. AGENTS: character NPCs, not logos
Each agent is a tiny character sprite with distinct silhouette, distinct tools, distinct work animation, and a personality pose. Recognizable at map scale without needing a label.

- **FOREMAN** (Bay 01, hiring shack). Hardhat, clipboard, rolled blueprint sleeve. Idle: stands next to the "NOW HIRING" board. Ticking: walks the 5-step route between shack and bulletin board. Flipping a clipboard page mid-walk when a hire is pitched.
- **SCOUT** (Bay 02, radar deck). Cap or visor, binoculars around the neck, folded city map in hand. Idle: leans against the radar dish housing. Ticking: raises binoculars to the east, scans left-to-right, lowers them. Pinned map on the wall beside them shows Phoenix metro city pins.
- **BUILDER** (Bay 03, assembly floor). Tool belt with wrench and drafting compass, goggles pushed up. Idle: stands at the conveyor watching a block go by. Ticking: swings a hammer at the BUILD station, sparks puff, hammer returns.
- **PAYMASTER** (Bay 04, books room). Green visor, sleeve garters, ledger tucked under one arm. Idle: sits on a stoop by a coin stack. Ticking: licks a thumb, flips a ledger page, adjusts the visor.
- **LANDO** (Commander Tower). Hardhat, coffee mug, posture says supervisor. Always on the catwalk of the center tower. Never leaves. Turns his head to face whichever bay is currently ticking.

Character design budget: SVG sprites are encouraged (they scale, they animate cleanly, they stay crisp). Each character should read at 20-40 pixels tall on the map but have enough detail to be recognizable. Consistent silhouette style across all 5 characters: one palette per character (Foreman amber, Scout green, Builder rust, Paymaster caution yellow, Lando sodium).

Brainstorm at least 5 character-visual languages before committing:
- Flat modern pictogram (like Apple Fitness characters)
- Blocky pixel-art (SimCity 2000 feel)
- Low-poly isometric (Monument Valley)
- Paper-doll cutout (cardboard construction)
- Thin-line cel (Brutalist minimalism)
Any other style that fits the industrial yard palette. Pick ONE and commit to all 5 characters in that language.

### 4. BIGGER IDEAS (use if they fit the chosen style)
- Nametag tooltip on hover over a character or building.
- A speech-bubble over the relevant character when their bay has an escalation ("need your call, boss").
- A shift-change cutscene at the top of each in-world "shift" transition (day crew rotates, a new character briefly shows up in the gate, departs).
- A parked forklift or paper-truck near the gate that moves when shipped crates get unloaded.
- A sodium lamp that flickers more aggressively when the system is under load.

-----

## WHAT STAYS (do not break these)

- /api/state and /api/portfolio polling - keep the endpoints, keep the refresh cadence, keep the graceful-degrade on error.
- The overlay modal (click an agent -> full detail overlay). Adapt the trigger to come from the sidebar agent card AND from clicking the character on the map.
- Keyboard shortcuts: 1 / 2 / 3 / 4 jumps to FOREMAN / SCOUT / BUILDER / PAYMASTER (visual flash on both the sidebar card and the character). C opens Commander Tower overlay (ledger rollup). Esc closes.
- Brand rules: no em dashes, never the word "AI" in visible copy. Brand is BREWINGTON. Operator label is LANDO.
- Palette variables: --ink, --ink-dim, --ink-mute, --steel-*, --rust, --rust-hot, --sodium, --sodium-hot, --caution, --stop, --go, --chalk. You may extend but not replace.
- The shipped-work count must still update from /api/portfolio (the crates along the yard edge grow as Builder ships).
- The Ledger numbers (MTD income, cost, net, agents online) must be visible without scrolling.

## WHAT TO REPLACE

- Any generic SaaS card grid layout
- Any stacked vertical sections below the map
- Any abstract dashboard-looking widgets that do not feel like a place
- The agent representations from the previous pass (moths, radar sweeps, conveyor belts were good motion IDEAS but they need to BE the characters' work, not separate props)

## TECHNICAL CONSTRAINTS

- One entry file: businesses/public/index.html. All inline. You MAY write supporting assets to businesses/public/assets/ (SVG symbols, spritesheets, textures).
- Performance: 60fps on a modern laptop. Use requestAnimationFrame for any JS motion. Prefer CSS + SVG over JS-driven DOM updates.
- Mobile: graceful degrade. Not required to match desktop parity.
- No external frameworks requiring a build step. CDN-pinned Three.js, Alpine, or similar is OK. Keep total weight reasonable.
- Verification: after your changes, run curl -sS http://localhost:3000 and confirm HTTP 200. Also check that /api/state and /api/portfolio still render correctly. Do a headless-browser console-error check.

## WHAT TO TELL LANDO WHEN DONE

Report back under 300 words. Include:
- The character-visual-language you picked (one of the 5+ brainstormed) and why
- The sidebar vs map layout ratio (e.g. "sidebar 280px, map fills the rest")
- The time-of-day cycle length and visible phases
- The one visual detail you are most proud of
- Any pieces of the previous pass you kept intact
- Any pieces of the previous pass you killed and why
- File listing of anything new under assets/

Full creative authority on the aesthetic within the four pillars above. Make it feel like a working yard Lando would want to look at for hours.
```


**Fires when:** Lando says "go" (Step 1 of RUN-MANIFEST).

**Target:** The industrial-yard dashboard at `businesses/public/index.html` (already shipped by the first designer pass, aesthetic: steel bays, sodium lamps, stenciled signage).

**Prompt to the designer agent (verbatim):**

```
You are the second pass of the Brewington Command Station environment designer. The first pass shipped the industrial-yard aesthetic: steel bays, sodium-vapor lamps, stenciled paint chips, numbered bay plates, chevron hazard strips, Lando-on-the-catwalk in the footer. File: businesses/public/index.html (full replacement, inline CSS/JS, 1168 lines).

Lando's feedback: "each agent's box needs to look alive like human alive. get really creative with each agent's box if they live in."

Your job: upgrade each agent bay to be VISUALLY DISTINCT and ALIVE. Same aesthetic family (yard, foundry, industrial), same fonts and palette, but each bay now has PROPS, MOTION, and CHARACTER specific to its role.

There are three bays now:

1. FOREMAN - the yard foreman's front office. Props: hiring board with 8 role-brief slips tacked up, clipboard, coffee ring on a form, reading lamp, stencil "01 FOREMAN" plate. Life: the clipboard sways, a moth circles the lamp, a paper slip flaps loose, "NOW HIRING" neon flickers.

2. SCOUT - the radar / recon deck. Props: rotating radar sweep, city pin-map on the wall (Phoenix, Mesa, Scottsdale, Gilbert, Tempe, Chandler, Surprise, each as a marker), target silhouettes showing the HVAC/Plumbing/Electrical trade bands, lit globe, crumpled intel sheets. Life: radar sweeps continuously, map pins twinkle when new prospects are found, a ping sound on CSV publish.

3. BUILDER - the assembly line floor. Props: conveyor belt moving small rectangular "site" blocks from left to right through stations (SCRAPE, BUILD, DEPLOY, SEND), each station is its own prop (a claw, a stamp, a rocket, a mailbox), a spec blueprint pinned on the wall, a stack of finished boxes. Life: the conveyor belt animates, a block travels across once every 8 seconds, the stamp press THUMPS visually, the mailbox flag flips up when a send fires.

Hard constraints (same as pass 1):
- No em dashes anywhere in visible copy.
- Never the word "AI" in any visible copy.
- Consumes the existing /api/state endpoint (do not modify the server).
- One HTML file entry point at businesses/public/index.html, inline CSS/JS ok.
- Works offline once loaded. No external JS frameworks that need a build step.
- Keeps the gatehouse, ledger, clock, and Lando-on-the-catwalk elements from pass 1 (or visibly evolves them, do not regress).
- Each bay still surfaces: name, status LED, mode, mission excerpt, MTD income/cost/net, last tick time, escalation banner, recent log, failures in a row, charter version.
- 1/2/3 keyboard shortcuts still jump to bays. C still opens commander overlay. Esc still closes.
- Must still look right when a 4th, 5th, 6th bay is added later (foreman hires will grow the roster).

Creative latitude: you decide the props, the motion, the hover reactions, the click-through. Make each bay feel like a different person actually works there. Dust, wear, graffiti, tool placement, shift posters, clipboard rotations. The yard has been running for a while; show it.

Before shipping: curl http://localhost:3000/api/state to verify the API shape. Then open http://localhost:3000 headlessly to confirm the upgrade renders with zero console errors.

Report back under 200 words: what new life you gave to each bay, the single visual detail per bay that you are most proud of, and whether you changed anything outside the three bays. No preview URL needed.
```

---

## 2. Foreman first hunt - PHASE 1, ECOSYSTEM BUILDERS

**Fires when:** Lando says "trigger foreman" or "trigger hunt".

**Target:** Hunt for all 5 Phase 1 role briefs (ecosystem builders). Write structured pitch dossiers. Escalate the batch to Lando for yes/no per candidate.

**Prompt to the foreman agent (verbatim):**

```
You are the FOREMAN of the Brewington yard. This is a Phase 1 hunt. Your job is to find hires who will BUILD the ecosystem the money agents will later work in. Zero-dollar infra only. Autonomous only.

Read in this order:
1. /workspaces/local-biz-pipeline/businesses/foreman/charter.md (full charter with superpowers mandate, pitch format, and role briefs)
2. /workspaces/local-biz-pipeline/businesses/foreman/state.json (current state, phase flag)
3. /workspaces/local-biz-pipeline/businesses/foreman/PITCH-TEMPLATE.md (required fields, 8 mandatory)
4. /workspaces/local-biz-pipeline/businesses/README.md (how the ecosystem is structured)

Mandated workflow:
1. Invoke superpowers:brainstorming. Diverge on at least 10 candidates per Phase 1 role brief. Write the raw divergent list to businesses/foreman/candidates/_brainstorm-<brief-id>.md for audit.
2. For each brief, filter to a top 3 shortlist using the charter's Required Standards (permissive license, commercial use ok, maintained, no AI word in visible copy, no em dashes).
3. If any brief has 5+ live candidates passing the standards, invoke superpowers:dispatching-parallel-agents to evaluate in parallel.
4. For each top candidate (up to 3 per brief, so up to 15 dossiers total), write a FULL dossier using PITCH-TEMPLATE.md. All 8 required fields must be filled. A pitch missing any field is incomplete and Foreman must not pitch it.
5. Invoke superpowers:verification-before-completion. Verify license, last commit, star count, and one independent review for each candidate. Check the box on the Evidence checklist only when verified with a live fetch.
6. After all dossiers are written, pick the single strongest candidate per brief (so 5 final picks). Combine into one WhatsApp batch.
7. Call ../twilio-whatsapp.js escalate() with the batch. Format:
   Subject line: [FOREMAN] Phase 1 hunt: 5 candidates ready
   Body: one line per candidate:
     "1. <name> for <brief>. Cost $X/mo. Autonomy <N>/5. Recommendation: HIRE/PASS/HOLD."
   Footer: "Reply 1 A/P/H, 2 A/P/H, 3 A/P/H, 4 A/P/H, 5 A/P/H, or 'hold all' to review dossiers first."
8. Update state.json: status = "awaiting_lando_reply", candidates_researched = <total evaluated>, candidates_pitched = <final picks>, last_tick_at = now, last_tick_summary = "Phase 1 hunt batch of 5 pitched."
9. Append to log.md with timestamp and one-line summary.

Hard rules (recited from the charter):
- Zero em dashes anywhere in your written content.
- Never the word "AI" in any written content. Use "automation", "agent", "model", "pipeline".
- Brewington tone: concrete, skeptical, grounded. Every projection has assumptions spelled out.
- Zero cloning of candidate repos. Zero executing of candidate code. Read-only evaluation.
- Every candidate must pay its own bills (Required Standard #1). Every candidate must be capable of building without Lando on every move (Required Standard #2). Any candidate failing either is auto-rejected in your filter pass.

Report back under 200 words: the 5 final picks by brief, their monthly cost totals, the weakest of the 5 and why, and any brief where you could not find a qualifying candidate (that brief becomes a "brief retirement" recommendation).
```

---

## 3. Scout first publish

**Fires when:** Lando says "go" (Step 3 of RUN-MANIFEST). Has a pre-check: if `GUMROAD_ACCESS_TOKEN` is missing from .env, Scout pauses after drafting and pings Lando for the key.

**Prompt:** To be drafted inline at fire time (depends on whether Gumroad key is present).

---

## 4. Builder first send

**Fires when:** Lando says "go" (Step 4 of RUN-MANIFEST). Respects the /sites/ blocklist in outreach.js.

**Prompt:** To be drafted inline at fire time (depends on Lando's answer to "fresh prospects or existing pool" question in RUN-MANIFEST).

---

*Add new staged dispatches below this line as new agents or one-time jobs need to be prepared.*
