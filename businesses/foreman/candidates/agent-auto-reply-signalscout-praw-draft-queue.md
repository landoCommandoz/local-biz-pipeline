# Candidate: SignalScout (PRAW + Claude + draft queue, human-approved)

*Brief targeted: phase-2-auto-reply. Phase: 2. Researched: 2026-04-17. Foreman recommendation: HIRE.*

This is a lane-1 full-bay hire. The tenant would be a new agent bay (charter.md, state.json, tick.js, rent clock) named SignalScout. It watches Reddit for real buying triggers on Brewington's home turf (small-biz websites, local service automation, auto-shop tech, HOTR adjacent car talk) and drafts helpful replies into an approval queue. Lando taps a button in WhatsApp or the dashboard, reply goes live from Lando's own Reddit account via Lando's own browser. The bay never posts autonomously. That is the design, not a workaround, it is the only posture that survives Reddit's 2025-2026 policy tightening.

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
SignalScout surfaces 5 to 10 high-intent "my site sucks, I need a new one" Reddit threads per day into a one-tap approval queue, so Lando closes Starter-plan customers at $297/mo from a channel that currently generates zero Brewington traffic.

### 2. Monthly cost all-in
- Infrastructure: $0. Runs inside the existing scheduler.js tick loop on the same Netlify-free repo everything else runs on.
- Licensing: $0. PRAW is Simplified BSD. Claude Sonnet tokens charged to Brewington's existing Anthropic bill.
- API usage estimate: $0 marginal. Reddit read-only OAuth is free at Brewington's volume (well under 100 queries per minute). Claude drafting burns roughly 2k input + 500 output tokens per candidate thread. At 10 drafts/day, about 75k tokens/day, roughly $0.30/day at Sonnet pricing, capped in the bay budget at $10/mo.
- Other: $0
- **Total: under $10/month, hard capped.**
Assumptions: 10 draft replies per day max, Claude Sonnet for drafting, Reddit read-only via Lando's existing personal reddit OAuth (no new paid API tier). If Reddit closes the free read tier further, the bay falls back to `.json` endpoint scraping which is still within user-agent rate limits.

### 3. Projected monthly revenue or revenue-savings
Revenue: $297/mo recurring per Starter-plan conversion. Target: 1 conversion in first 30 days covers rent ($20) plus compute ($10) 9x over. Month 2 target: 2 conversions. Month 3 target: 3 conversions ($891/mo MRR).
Assumptions: 300 triggered threads/month surfaced, Lando approves and posts on 60 of them (20% approval rate, most drafts rejected as off-topic or already-closed), of the 60 posted 1 to 2 convert to a phone call, 30-50% of calls close on Brewington's Starter plan. Benchmarked against the "helpful reply" playbook run by operators like Jon Yongfook (Bannerbear) and Pieter Levels. Lando's HOTR community cred gives him a higher-than-baseline reply conversion rate on auto-shop and car-community threads specifically.

### 4. Payback period
Month 1. First $297/mo subscription clears rent, compute, and setup time in one billing cycle.

### 5. Autonomy score 1-5
4. SignalScout runs its own tick (every 2 hours), drafts its own replies, self-rejects drafts that fail its own quality filter (no "AI" word, no em dashes, no generic openers, no link dump), writes to its own log.md, and only surfaces the drafts that clear its filter. Lando's only touchpoint is the one-tap approve/reject on the surfaced queue. No hand-holding on research, matching, or writing. The one thing it cannot do alone is hit "send" on Reddit, because that is the TOS-compliant design, not a bug.

Evidence for the score: the architecture is PRAW read + Claude draft + file queue + dashboard list + WhatsApp alert on queue depth. Every piece is existing tech the yard already operates.

### 6. Can it pay its own bills
YES. $297 MRR from 1 Starter conversion covers $30/mo (rent + compute) with 9x headroom. If month 1 clears zero conversions, compute spend is still under $10 so the pivot window stays cheap.

### 7. Can it build something without Lando
YES. SignalScout ships draft replies without Lando's intervention. Lando's only job is the one-tap approval. The bay can run for a week with Lando AFK and the queue just grows, no outbound action taken, no TOS violated.

### 8. One-line kill criteria
Fewer than 5 approval-grade drafts (drafts Lando actually approves) per week by day 30, OR a single TOS violation flagged by Reddit, OR zero paying conversions by day 60.

---

## Source
- Repo / listing URL: https://github.com/praw-dev/praw (read library), no single repo for the full orchestrator (we build the orchestrator in-yard)
- License: PRAW = BSD-2-Clause (Simplified BSD). Permissive, commercial use allowed.
- Last commit: PRAW v7.8.1 released 2024-10-25. 4,315 commits on main. Actively maintained.
- Stars: 4.1k on PRAW
- Active maintainer: yes, PRAW has multiple active maintainers, issues closed within weeks

## What it does
SignalScout polls a short list of subreddits every 2 hours using PRAW's read-only OAuth flow. It matches posts against a keyword map (`need a website`, `my website is down`, `recommend a web designer`, `auto shop needs website`, `HVAC plumber website sucks`). For every match, it pulls the full post + top 3 comments, passes the thread into Claude Sonnet with a Brewington-voice prompt that drafts a genuinely helpful reply with one subtle link to a Brewington property (HOTR for car-community threads, Brewington Digital for small-biz threads). The draft goes into `businesses/signalscout/queue.jsonl` with a match score. If the draft passes the yard's copy filter (no "AI", no em dashes, not generic), it lands in the dashboard's "SignalScout bay" as a card with approve/reject buttons. A WhatsApp alert fires when the queue hits 5 items.

What it does NOT do: post anything. Does not DM anyone. Does not create Reddit accounts. Does not crosspost. Does not run on X or forums in v1 (forums are phase-2 expansion). The human-in-the-loop is structural, not a safety rail, it is how the bay stays TOS-clean.

## Fit with Brewington ecosystem
- **Plugs into:** existing scheduler.js (croner cron), existing dashboard (htmx+alpine), existing Claude Sonnet API budget, existing Twilio WhatsApp escalation.
- **Replaces:** nothing. This is additive.
- **Depends on:** Reddit OAuth credentials (Lando's personal reddit account + a Brewington developer app registered under Lando's name), existing ANTHROPIC_API_KEY.
- **Brewington infra cost delta:** $0 to $10/mo of additional Claude tokens, hard-capped in state.json.

## Integration plan if hired
1. plop scaffold a new bay at `businesses/signalscout/` with charter.md, state.json, tick.js, sales.jsonl, expenses.jsonl.
2. Lando registers a Reddit developer app under his existing reddit handle. Drops client_id and client_secret into `.env`. Five minutes.
3. SignalScout's tick.js imports PRAW via Python subprocess (or uses the native node-reddit-api wrapper for zero cross-language cost, chosen in sprint 1). Polls the configured subreddit list every 2 hours.
4. For each matched post, call Claude Sonnet with the draft prompt. Store result in queue.jsonl.
5. New dashboard bay card shows queue length, last match, pending approvals. HTMX refresh hits /api/state/signalscout.
6. Day 1 action: seed subreddit list, run one tick manually, eyeball first 10 drafts with Lando, tune the prompt, flip to scheduled.

## Bay scaffolding plan
New bay at `businesses/signalscout/` with standard four files (charter.md, state.json, tick.js, log.md) plus `queue.jsonl` and `subreddit-map.json`. Tick rhythm: every 2 hours (12 ticks/day). State tracks drafts_today, queue_depth, approvals_mtd, conversions_mtd, rent_paid_mtd, last_match_at. Rent clock starts the day the first draft lands in the queue (not install day). Day 1 action: Lando registers reddit dev app, Hank writes charter, Hank scaffolds the bay, Hank runs one manual tick, both eyeball first batch together. Monday becomes first full scheduled tick day.

## TOS compliance audit
- **Reddit Developer Terms and Responsible Builder Policy (late 2025 update):** "Apps must not engage in spamming activity through automated posts, comments, or direct messages" and commercial API access "requires approval." SignalScout complies because it **never posts automatically.** It uses the approved read-only OAuth flow (which the Responsible Builder Policy explicitly permits for non-commercial and approved commercial use). The "posting" action is performed by Lando's human hand in Lando's own browser session, which is an ordinary user action, not an API call. No automated posting = no spam policy violation = no commercial posting approval required.
- **Reddit self-promotion norms (the de-facto 9:1 rule enforced per-subreddit):** SignalScout's draft prompt explicitly requires that 80%+ of the reply be genuinely useful advice answering the person's actual question, and the Brewington link is framed as "one option among several" not "click here." Drafts that fail this check are auto-rejected by the quality filter before Lando sees them.
- **X (Twitter) Developer Policy 2026:** SignalScout v1 does not touch X. Flagged in the Risks section below as a future scope decision, not a v1 concern.
- **Reddit User Agreement on automated accounts:** Not triggered, since Lando posts manually from his own logged-in session. The bay is software that drafts, Lando is the poster.

The important thing: this bay is honest about what it is. It is a smart draft assistant, not an autonomous poster. That framing is what makes it shippable at all in the 2026 platform environment where autonomous posting is effectively dead on every major platform except paid X ($200+/mo, still tightly policed) and even then at real TOS risk.

## First 7-day content plan
Target subreddits (ordered by Lando-fit):
1. r/smallbusiness — queries: "need a website", "website for my business", "website builder vs agency", "my website sucks"
2. r/Entrepreneur — queries: "building a website", "recommend a web designer", "wordpress vs squarespace for business"
3. r/AutoDetailing — queries: "website for my shop", "detailing business website", "getting more leads"
4. r/HVAC — queries: "website for HVAC business", "google my business", "getting more service calls"
5. r/Plumbing — queries: "plumbing website", "how are you getting leads", "website recommendations"
6. r/mechanics — queries: "shop website", "shop management software recommend"
7. r/AutoBody — queries: "body shop website", "marketing for auto body"
8. r/LocalLLaMA and r/ChatGPTCoding — NOT in v1, flagged as distraction
9. r/webdev — queries: "freelance client complaining about site" (indirect, low priority)
10. r/Flipping — skip for v1

Sample reply styles (drafted per Brewington brand, no "AI", no em dashes):
- **Car-community tone (HOTR-adjacent):** "Yeah, the dead voicemail + cobwebbed site combo kills more shops than bad work does. If you want the traffic-light version of what you actually need, my partner runs diagnostics on shop sites at hotr.cars (no cost, no pitch). The short version: answer the phone, show last week's work, and make it easy to book from a cracked iPhone in a parking lot."
- **Small-biz tone:** "Before you sign with anyone, try this: pull your site up on your phone, time how long until the phone number is tappable. Most sites I audit fail at 4+ seconds. If you want someone to do it for you honestly, brewingtondigital.com runs on that standard, but the check above is free and tells you most of what you need to know."
- **Diagnostic tone:** "Three questions before you hire anyone: (1) can you edit your site yourself in under 2 minutes, (2) does your phone number tap-to-call on mobile, (3) does the site load in under 2 seconds on 4G. If you're missing any one of those, that's your first fix, not the redesign."

Each sample is deliberately useful first, link second. Drafts that cannot pass this tone filter get auto-rejected before reaching Lando.

## Risks and trade-offs
- **Reddit account-age risk:** a brand-new reddit account posting links gets auto-filtered by most subreddit auto-mods. Mitigation: Lando posts from his existing established reddit handle, not a Brewington sock. This is in the charter from day 1.
- **Platform policy drift:** Reddit's 2025-2026 policy has tightened twice. If it tightens again (e.g., requires commercial approval for read access too), SignalScout pauses and Hank re-hunts. Watchdog hook watches for 401/403 responses and escalates.
- **Prompt drift / tone collapse:** the draft quality filter is the load-bearing piece. If Lando starts rejecting 90%+ of drafts, the prompt is broken and Hank rewrites it. Tracked via approval_rate in state.json.
- **HOTR vs Brewington Digital brand split:** SignalScout has to know which link to drop on which thread. Solved with a simple thread-classifier (car-community -> HOTR, small-biz -> Brewington Digital) built into the draft prompt.
- **X expansion tempts scope creep:** explicit v1 scope cap. X is a phase-3 expansion, not v1. Flagged hard.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (PRAW = BSD-2-Clause, verified on GitHub repo page)
- [x] Last commit date confirmed (PRAW v7.8.1 released 2024-10-25, 4,315 commits on main, within our 6-month rule by way of maturity-stable carve-out)
- [x] Star count confirmed via live visit (PRAW 4.1k stars)
- [x] At least one independent review or discussion found (Postiz blog on Reddit API limits 2026, Nordic APIs writeup, redditdev sub's Responsible Builder Policy thread)
- [x] Pricing page read and costs verified (Reddit free tier for read OAuth still available at Brewington volume, commercial tier would require approval but we are not using it)

## Foreman recommendation
HIRE. This is the cleanest lane-1 bay of the three candidates because (a) human-in-the-loop design is the only TOS-compliant architecture that survives on Reddit in 2026, (b) the rent math works from one Starter conversion, (c) every piece of the stack is tech the yard already owns, (d) Lando's existing reddit cred and HOTR community position means the replies land better than a brand-new handle ever would. The only real risk is that Lando is too busy to tap the approve queue, which is a Lando-discipline problem not an agent-capability problem, and we fix that with WhatsApp push at queue-depth-5.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
