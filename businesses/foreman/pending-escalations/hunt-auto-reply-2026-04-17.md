# Hunt summary: auto-reply content poster, 2026-04-17

**Brief slug:** auto-reply (Phase 2 brief #1 from Foreman charter)
**Brief text:** "Can monitor X, Reddit, or a niche forum for trigger phrases, then post helpful replies with a link back. Must respect platform anti-spam rules. License must allow commercial use."

**Dossiers filed:** 3
- `agent-auto-reply-signalscout-praw-draft-queue` (HIRE)
- `agent-auto-reply-signalscout-x-tweepy-draft-queue` (HOLD)
- `agent-auto-reply-signalscout-n8n-orchestrator` (PASS)

**Candidates brainstormed:** 12. Shortlisted 3. Rejected pre-shortlist: snoowrap (archived 2024-03), Buffer/Hootsuite APIs (paid scheduling, not reactive reply), Make.com templates (paid tier required for volume), Zapier (same), existing GPL "community manager" OSS bots (license fail), Postiz (flagged for future read as general scheduler, not trigger-reactive), snscrape/nitter direct scrapers (legally gray on X side, not a clean foundation), autonomous-posting GitHub bots (every viable one is either TOS-dead or license-fail).

**Top pick:** `agent-auto-reply-signalscout-praw-draft-queue`

**Why top pick:** Reddit has (a) free read-only OAuth that still works at Brewington's volume in 2026, (b) deeper threads with stronger buying-intent signals than X, (c) subreddits that directly map to Lando's three best domains (small-biz, local service trades, car community). The draft-queue architecture (PRAW read + Claude Sonnet draft + file queue + dashboard approve + Lando posts manually) is the only design that survives Reddit's 2025-2026 tightening, where autonomous posting is banned and commercial API use requires approval. Hand-rolled in-yard means git-native, permissive license (BSD-2-Clause on PRAW), full integration with existing scheduler.js, htmx dashboard, and Twilio WhatsApp. Monthly cost under $10 hard cap. One $297/mo Starter conversion clears all costs 9x over.

**Runner-up:** `agent-auto-reply-signalscout-x-tweepy-draft-queue`. Same architecture, pointed at X. The TOS story is actually fine for human-in-loop posting. The economics are not. X Basic tier is $200/mo (8x over our $25/mo cap), free tier is effectively write-only, pay-as-you-go (default since Feb 2026) is unpredictable. Recommendation is to ship the Reddit variant first, prove the draft-queue pattern in 30 days, and only then decide if adding X is worth the monthly API tax.

**Integration effort:** LOW-MEDIUM for the top pick. One plop scaffold, one Reddit dev app registration (5 min of Lando's time), one new tick.js that imports either PRAW via subprocess or a Node Reddit client. One new dashboard bay card using the existing htmx+alpine pattern. Day 1 manual tick + prompt tuning is where most of the judgment work happens. Probably 3-4 hours of Hank work to stand up, 30 min of Lando work to register the app and eyeball the first batch.

**TOS risk summary:** LOW for the top pick, MEDIUM-LOW for the runner-up, all three candidates are TOS-clean by design.

The whole category has a structural TOS challenge: **fully autonomous posting on X and Reddit is effectively dead in 2026.** Reddit's Responsible Builder Policy (late 2025) explicitly bans spamming via automated posts and requires approval for any commercial API use. X requires automated accounts to self-label as bots on day one, and the posting tiers are priced out of a $25/mo budget unless you convert customers every month. The honest answer is that "auto-reply content poster" as a fully autonomous bot is not a viable hire in this market. What IS viable is the human-in-the-loop draft queue that all three candidates implement. That's not a workaround, it's the only design that keeps Brewington's reddit and X accounts alive past the first ban-wave. All three candidates earn their "TOS compliant" claim by never posting autonomously, and by having Lando click "send" from his own browser like an ordinary user.

**Decision options for Lando:**

- [ ] **Approve top pick only** (SignalScout-Reddit). Ship it, 30-day kill clock, prove the pattern.
- [ ] **Approve top pick + runner-up** (Reddit AND X). Heavier monthly spend ($50-$210/mo ceiling), doubles the surface area, recommended only if Lando wants to rebuild X presence anyway.
- [ ] **Approve top pick with explicit HOTR-first seeding.** Same as option 1 but with the first-week draft target weighted toward r/AutoDetailing, r/mechanics, r/AutoBody, and the car-community corners, to lean on Lando's pre-existing HOTR brand trust.
- [ ] **Approve the n8n variant** (requires fair-code license override). Not recommended by Hank.
- [ ] **Reject all, revise the brief.** Valid call if Lando decides reactive-reply is not a channel he wants to operate in 2026.
- [ ] **Hold for additional research.** E.g., pre-warm Lando's X account for 2-4 weeks before spending on the X variant.

## Context for Lando

Three things changed between the original Phase 2 brief and today's market that you need to know:

1. **Reddit closed self-service commercial API access in late 2025.** Brewington's existing personal reddit OAuth still reads fine at our volume, but if this bay ever needed to scale posting automation, it would need an approval application. We dodge that by never posting automatically.

2. **X removed the free tier for new developers on Feb 6, 2026.** Pay-as-you-go is now default. Basic is $200/mo. This is why the X variant is HOLD not HIRE.

3. **The "helpful reply with a link" playbook still works** in the hands of a real human with community cred. Lando has that cred on the car and auto-shop side via HOTR. He does not currently have it on the small-biz and local-service side, but the tone and domain translate. The draft-queue architecture is the play because it puts the drafts in his hand without making him do the research.

The honest one-sentence recommendation: hire SignalScout-Reddit with the HOTR-weighted first-week seed list. If one Starter plan converts in 30 days, the bay clears, the pattern is proven, and we have a template for expansion to X, Nextdoor, or niche auto forums in Q3.

## Verification notes

- License evidence verified live for PRAW (BSD-2-Clause), tweepy (MIT), twitter-api-v2 (Apache-2.0), n8n (Sustainable Use License, fair-code).
- Maintenance evidence verified live: PRAW v7.8.1 (Oct 2024), tweepy v4.16.0 (Jun 2025), twitter-api-v2 v1.28.0 (Nov 2025), n8n stable (Apr 2026).
- snoowrap archived 2024-03, rejected pre-shortlist.
- Reddit policy evidence: Responsible Builder Policy (late 2025), r/redditdev announcement thread, Nordic APIs and Postiz 2026 writeups corroborating spam and commercial-approval rules.
- X API pricing evidence: xpoz.ai, postproxy.dev, wearefounders.uk 2026 pricing pieces corroborating free-tier write-only and $200 Basic.
- No candidate was installed, cloned, or run during this hunt. Read-only evidence only.
- Hank did not contact any maintainer, and did not pay for any tool.

## Self-funding clock

If the top pick is approved, the bay inherits the standard yard contract: $20/mo rent + up to $10/mo compute = $30/mo nut. Day 15 pivot threshold: approval-grade drafts per week under 5, rewrite the prompt. Day 30 kill threshold: zero paying conversions + under $30 attributable revenue, bay gets archived, plot relisted. Brief stays on file for the next hunt with whatever the market looks like then.
