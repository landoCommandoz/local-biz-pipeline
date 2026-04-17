# Run Manifest

*The spec of what happens when Lando says "go". Nothing in this file runs until you explicitly tell me to fire it.*

## Status right now

- 3 agents chartered, all in `awaiting_first_tick` / `dry_run` mode.
- Command station dashboard live on port 3000 with industrial-yard aesthetic (BUILDER and SCOUT bays). FOREMAN bay will appear after you say go (server re-reads the charters dir).
- Public portfolio live at `/portfolio.html`. 35 sites, 35 screenshots.
- Outreach guard live: no email ever goes to a business whose site is in `/sites/`.
- Ready-to-fire briefings staged for on-demand dispatch (see `STAGED-DISPATCHES.md`).

---

## What "go" triggers

When you say go, I will fire these in the order below. Each step either completes cleanly or escalates to you via Twilio WhatsApp. Nothing else.

### Step 1 (parallel, ~15 min) - Designer upgrade
Dispatch the designer agent with the staged brief in `STAGED-DISPATCHES.md`. Job: upgrade each bay in the dashboard to feel alive and unique. Every agent gets props, motion, and character specific to its role. Yard aesthetic kept, but FOREMAN's front office, SCOUT's radar deck, and BUILDER's assembly line all become visually distinct rooms. No money motion, just environment.

### Step 2 (parallel, ~10 min) - Foreman first hunt
Foreman fires a dry-run hunt against the top 3 open role briefs from its charter (auto-reply poster, Gumroad publish-and-refresh, Apify actor runner). Writes 3 candidate dossiers to `businesses/foreman/candidates/`. Pings you on WhatsApp with one line per candidate: `[name] for [role brief] — [one-sentence why]. APPROVE / PASS / HOLD?`. You tap the replies. I install approved candidates. No code from a candidate is cloned before your reply.

### Step 3 (sequential, ~20 min) - Scout first publish
1. Scout runs `prospector.js` filtered to Phoenix-metro HVAC / Plumbing / Electrical that are NOT in the /sites/ blocklist
2. Scores, dedupes, filters to 100 rows per trade
3. Writes 3 CSV products to `businesses/scout/products/`
4. Drafts Gumroad listing copy per product (title, description, keywords, bundle offer)
5. Pings you: `3 Gumroad products ready. Preview copy at [path]. Approve first publish?`
6. On your Y, Scout publishes (requires Gumroad API key in .env first — if missing, Scout escalates with the exact env var name you need to add).

### Step 4 (sequential, ~30 min) - Builder first send
1. Builder picks ONE untouched prospect from `prospects.csv` (must pass the /sites/ blocklist)
2. Runs `generator.js` to build the rebuilt site HTML
3. Runs `deployer.js` to deploy to a new Netlify subdomain
4. Drafts a personalized Email 1 with the live preview URL
5. Runs `agentQA.js` on the deployed site to catch placeholder bugs before send
6. Pings you: `Preview live at [url]. Draft email below. SEND / SKIP?` plus the full email body
7. On your Y, Builder sends. On N, Builder logs SKIPPED and moves to the next prospect.

### Step 5 (background, continuous once you unblock) - Ticker loops
After the first ticks land cleanly, I wire a simple scheduler:
- Foreman ticks every 6 hours (hiring is slow work)
- Scout ticks every 24 hours (one fresh list refresh per day)
- Builder ticks every 4 hours (one new prospect per tick, max 10 sends per rolling 24h per charter cap)

Each agent respects its charter's out-of-scope rules. Each escalation pings you. The ticker runs inside the existing command-station process so you can kill it by stopping the server.

---

## Money path (where the first dollar comes from)

Sequence from `go` to first $1:
1. **Scout Gumroad publish** (Step 3): first listing live within an hour. First sale realistically 2-7 days (per wide-scan research). Product: Phoenix-metro HVAC lead CSV at $49.
2. **Builder cold email** (Step 4): first Email 1 sent within the hour. First reply realistically 2-5 days. Conversion to $297/mo realistically 14-21 days.
3. **Foreman hire** (Step 2 followup): if Foreman surfaces an auto-reply poster or directory-submission blaster and you approve, that plugs into the existing funnels and compounds inbound. Money shows up 14-30 days after install.
4. **Portfolio page organic** (already live): passive, slow. First click-through in days, first inbound text in weeks.

Fastest realistic first-dollar channel: **Scout's Gumroad listing**. Requires your approval on the first publish and the Gumroad API key in .env.

---

## Your touchpoints (what you will actually do)

After you say go, these are the WhatsApp pings you will receive. Each one takes < 30 seconds to resolve.

1. Foreman: 3 candidate pitches. You reply `1 A`, `2 P`, `3 H` (approve, pass, hold).
2. Scout: `first publish?`. You reply `Y` or `N`.
3. Scout: `need GUMROAD_ACCESS_TOKEN in .env. Add it?` (only if key missing). You reply with the key or `skip`.
4. Builder: preview URL + email body. You reply `SEND` or `SKIP`.
5. Builder: on warm reply to any outreach. You take over the conversation voice.

Any other ping means something is stuck. You resolve or say "archive it" and Foreman moves it out.

---

## Hard guardrails (will not be crossed even if I misread an instruction)

- **No email to /sites/ businesses.** Guard live in `outreach.js`. Every send checks.
- **No unapproved hires.** Foreman never clones or executes a candidate repo before Lando's reply.
- **No unapproved Gumroad publishes.** Scout writes drafts, pings, waits.
- **No unapproved live sends.** Builder builds + deploys previews autonomously but never sends Email 1 without Lando's Y on the first-tick ping. After the first Y, the mode flips to `live_send` and subsequent sends are within authority (up to 10 per 24h per charter).
- **No overspend.** Each charter has a 30-day budget cap. Any action that would exceed it escalates.
- **No silent running.** If any agent fails three ticks in a row on the same action, Foreman is pinged for a review.

---

## What I still need from you before "go"

1. **Go signal.** The word go. That unblocks Step 1 through Step 5.
2. **Gumroad API key** in `.env` as `GUMROAD_ACCESS_TOKEN` (optional, Scout will escalate if missing).
3. **Twilio WhatsApp pairing.** You already have the Twilio env vars wired from agentQA.js. I will reuse the same pair. If anything has changed since then, tell me.
4. **Two decisions I am holding for you:**
   a. Should Builder's first live-send target `prospects.csv` (the existing Phoenix-metro prospect pool, untouched subset) or wait for a fresh Scout-generated list?
   b. Should Foreman's role briefs 4-8 (directory submission, deliverability warm-up, Stripe auto-sender, lead-scoring, portfolio packager) stay open, or do you want to narrow to the top 3 first?

Tell me "go" plus either answer or "your call" on (4a) and (4b) and I fire.
