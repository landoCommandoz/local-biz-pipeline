# Candidate: SignalScout-X (tweepy + Claude + draft queue, human-approved)

*Brief targeted: phase-2-auto-reply. Phase: 2. Researched: 2026-04-17. Foreman recommendation: HOLD.*

Same draft-queue architecture as SignalScout-Reddit, but pointed at X (Twitter) instead. Logged separately because the platform economics and TOS posture on X in 2026 are fundamentally uglier than Reddit, and Lando deserves to see the two side-by-side instead of bundled.

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
SignalScout-X surfaces 3 to 8 high-intent "need a website for my shop" threads per day from X into the same approval queue, so Lando can tap-to-reply on live conversations in the small-biz and car-community corners of X with Brewington-voice drafts.

### 2. Monthly cost all-in
- Infrastructure: $0 (runs on scheduler.js)
- Licensing: $0 (tweepy = MIT, twitter-api-v2 = Apache-2.0)
- X API access: **this is the problem.** The free tier is write-only and capped at 1,500 posts/month with no read access worth anything. The Basic tier is $200/mo which blows our $25/mo cap by 8x. Pay-as-you-go (default for new devs since Feb 2026) makes every read endpoint expensive enough that 3-hour polling across 10 queries is an open-ended token-style bill.
- API usage estimate under pay-as-you-go: unpredictable, likely $40-$120/mo even with aggressive rate limiting.
- Claude Sonnet drafting: same $10/mo cap as SignalScout-Reddit.
- **Total: $50/mo floor, $200/mo ceiling under current pricing. Blows the $25/mo cap.**

### 3. Projected monthly revenue or revenue-savings
Revenue: same $297/mo per Starter conversion. But X has poorer thread-to-conversion math than Reddit for local-service verticals because (a) conversations are shorter, (b) skepticism is higher, (c) the buying-intent signal is noisier. Realistic target: 1 conversion in first 60 days, not 30.
Assumptions: X surface is noisier, Brewington has no X presence currently, Lando would be replying from a cold account.

### 4. Payback period
60 days minimum under current API pricing. 30 days if X restores a meaningfully cheap read tier (no signal they will).

### 5. Autonomy score 1-5
4 (same as Reddit variant in capability, but constrained by the cost problem above).

Evidence for the score: same draft-queue architecture, same self-filter, same one-tap approval. Autonomous in every sense except the posting action, which is Lando's hand.

### 6. Can it pay its own bills
NO at current X API pricing. Monthly cost of $50-200 exceeds the $25/mo cap and requires 1 Starter conversion **every month** just to clear infra. If you count the rent ($20) on top, you need 1 conversion inside 30 days or it goes red on the kill clock.

### 7. Can it build something without Lando
YES on drafting, NO on posting (by design).

### 8. One-line kill criteria
Zero approval-grade drafts per week by day 15, OR monthly API spend exceeds $30 two months in a row, OR a single TOS flag from X.

---

## Source
- Repo / listing URL: https://github.com/tweepy/tweepy (Python) or https://github.com/plhery/node-twitter-api-v2 (Node)
- License: tweepy = MIT, twitter-api-v2 = Apache-2.0. Both permissive, commercial use allowed.
- Last commit: tweepy v4.16.0 released 2025-06-22. twitter-api-v2 v1.28.0 released 2025-11-15. Both active.
- Stars: tweepy 11.1k, twitter-api-v2 1.6k
- Active maintainer: yes for both, though twitter-api-v2 README signals maintainer fatigue over X platform direction.

## What it does
Identical architecture to SignalScout-Reddit: poll -> match -> draft -> queue -> approve -> Lando posts manually. The only difference is which client library wraps the read endpoints.

What it does NOT do: solve the X API pricing problem. It does not get us to the Basic tier for cheaper. It does not negotiate anything with X. It runs on whatever tier Lando chooses to pay for, and that is the whole problem.

## Fit with Brewington ecosystem
- **Plugs into:** same as SignalScout-Reddit, would share the same queue.jsonl and dashboard bay.
- **Replaces:** nothing.
- **Depends on:** X developer account, paid API tier (Basic or pay-as-you-go), existing ANTHROPIC_API_KEY.
- **Brewington infra cost delta:** $50-200/mo new recurring cost. Hard red flag.

## Integration plan if hired
1. Lando decides whether to pay for X Basic ($200/mo) or commit to pay-as-you-go (unpredictable).
2. Register X developer app.
3. Add X poller to SignalScout tick.js as a second source.
4. Same queue + draft + approve flow.
5. Day 1: one manual tick, eyeball 10 drafts, decide if the ROI is real before committing to month 2.

## Bay scaffolding plan
Would be added as a sibling source to SignalScout-Reddit inside the same bay, not a standalone bay. Same tick rhythm. Same state schema with an added `x_api_spend_mtd` field. Rent clock would start when the first X-sourced draft lands. Day 1 action: Lando decides the pricing tier, we do not scaffold before that decision.

## TOS compliance audit
- **X Developer Policy 2026:** "Automated accounts must clearly identify as bots in the profile bio. There is no grace period. The use case description you submit during developer onboarding is contractually binding." SignalScout-X complies by declaring the use case as "reactive customer support drafts, human-approved, posted manually from the developer's personal account." Since the posting is manual, the account does not operate as an automated account and the bot-label requirement does not apply. The read endpoints are used under the developer's registered use case.
- **X bulk automation rules:** the long-standing ban on "coordinated inauthentic behavior" and "bulk or aggressive posting" is moot, because SignalScout-X never posts. The only outbound action is human.
- **X Basic/Free tier read limits:** the free tier is effectively unusable for real trigger detection. This is a pricing barrier, not a TOS barrier. Flagged.

The TOS story for X is actually fine for a human-in-loop design. The killer is the economics, not the policy.

## First 7-day content plan
Search queries to monitor:
1. `"need a website" (shop OR garage OR repair)`
2. `"new website" (HVAC OR plumber OR detailer OR mechanic)`
3. `"my website sucks" -filter:retweets`
4. `"website for my small business" lang:en`
5. `"recommend a web designer" -job -jobs -hiring`
6. `"shopify vs wordpress" lang:en -bot`
7. `"automation for small business" near:"Phoenix" OR near:"Mesa" OR near:"Scottsdale" OR near:"Gilbert"`
8. `"build me a website" -ad -ads`
9. Car-community hashtags: `#OBDII #MechanicLife #ShopLife` paired with website keywords
10. HOTR adjacency: `"stranded" OR "broke down"` paired with Phoenix/Mesa geo

Sample reply styles: same as SignalScout-Reddit, but tighter (280 char ceiling on the first post, follow-up in thread if needed). Example: "Before you hire anyone, tap your phone number on your site from an iPhone at a gas station. If it doesn't call, that's the fix, not the redesign. I'm at brewingtondigital.com if you want a second opinion."

## Risks and trade-offs
- **API pricing is the whole story.** If X doesn't relax, this bay loses money unless it converts 1+ customer every single month. That's a thin margin for a reactive channel where you don't control supply.
- **X account reputation:** Brewington has zero X presence. First replies from a cold handle get flagged or hidden by replies-filtering. Pre-work: Lando posts useful stuff for 2-4 weeks as pre-warming before SignalScout-X goes live.
- **Relative to Reddit:** Reddit has deeper threads, stronger intent signals on buying questions, and a free read tier we can actually use. Every dollar spent on X-Scout is a dollar that could be reinforcing Reddit-Scout's prompt, content, and dashboard surfacing.
- **Twitter-api-v2 maintainer sentiment:** the README openly complains about X platform direction. Realistic risk that this library ships a breaking change or an abandonment notice in the next 12 months. Mitigation: pin the version, expect to swap clients if needed.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (tweepy MIT, twitter-api-v2 Apache-2.0)
- [x] Last commit date confirmed (tweepy 2025-06-22, twitter-api-v2 2025-11-15)
- [x] Star count confirmed via live visit (tweepy 11.1k, twitter-api-v2 1.6k)
- [x] At least one independent review or discussion found (xpoz.ai, postproxy.dev, wearefounders.uk pieces on X API pricing 2026)
- [x] Pricing page read and costs verified (free write-only 1500/mo, Basic $200/mo, pay-as-you-go default since Feb 2026)

## Foreman recommendation
HOLD. The architecture is correct but the channel economics on X in 2026 do not clear the $25/mo cost cap without immediate conversion pressure that a reactive channel cannot reliably supply. The honest recommendation is to ship SignalScout-Reddit first, prove the draft-queue pattern works there for one month, and only then decide if X is worth the $50-200/mo tax to expand the same pattern onto a noisier platform. If Lando wants X coverage now anyway, approve with the understanding that the 30-day kill clock is a real threat on this bay specifically.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
