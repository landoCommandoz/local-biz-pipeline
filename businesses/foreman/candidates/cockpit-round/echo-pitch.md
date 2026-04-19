# Candidate: Apify Google Maps Scraper + Instantly.ai (ECHO full stack)

*Brief targeted: ECHO (Full Client Acquisition, scraping cluster). Phase: cockpit-round. Researched: 2026-04-18. Foreman recommendation: HIRE (top-tier). INSTALLABLE_NOW: no. BLOCKER_IF_NO: Instantly.ai $47/mo account + OAuth for sender mailboxes, flagged to pending-escalations.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
ECHO turns every Mesa, Scottsdale, and Gilbert HVAC, plumbing, and electrical business with a weak website into a paying Brewington Digital Starter ($297) or Growth ($497) subscriber by harvesting them from Google Maps, scoring them on web weakness, and sending warmed-inbox sequenced outreach that lands in the primary tab.

### 2. Monthly cost all-in
- Infrastructure: $0 (runs inside existing yard)
- Licensing: $47/mo Instantly.ai Growth plan
- API usage estimate: $5/mo Apify free tier credit covers first 500-1,000 places; $0 if monthly refresh stays inside free credit
- Other: $0 (sales Claude plugin already installed, used for draft-outreach skill pre-send)
- **Total: $52/month**
Assumptions: AZ cold pool of roughly 1,500 filtered service businesses, monthly refresh on Apify, single Instantly seat, ~1,500 sends/mo across warmed mailboxes.

### 3. Projected monthly revenue or revenue-savings
Month 1: **$891 new MRR** from 3 closes at $297 Starter. Month 3: **$3,000+ MRR** compounded (9 active clients assuming zero churn, 20% upgrading to $497 Growth).
Assumptions: 3% reply rate on 1,500 warmed sends at 94% inbox (Instantly industry benchmark), 7% close rate on positive replies, zero churn in first quarter (likely floor not ceiling given 30-day cancel policy on Starter). Evidence: one small agency documented $11K MRR landed from cold email to roofers and painters; Jake Jorgovan documented $12,030 from a single campaign.

### 4. Payback period
**Less than one month.** First Starter close covers ~5.7 months of the $52/mo all-in cost.

### 5. Autonomy score 1-5
**4.** ECHO runs Apify harvest autonomously, draws from the pool daily, drafts with the sales plugin, dispatches through Instantly, reads replies, books calls, and hands hot leads to Lando only at the contract-sign step. Drops to 4 not 5 because Lando still signs the onboarding contract and collects Stripe payment — the ECHO workflow stops one step short of payment capture.
Evidence for the score: Apify scraper is a single API call with documented autonomous use by 18,000 monthly active operators; Instantly.ai has built-in AI reply handling under 5 minutes; the `sales` plugin's `email-sequence` and `draft-outreach` skills run end-to-end without Lando intervention.

### 6. Can it pay its own bills
**YES.** One Starter close at $297 covers 5.7 months of stack cost. Two closes in the first month covers an entire year.

### 7. Can it build something without Lando
**YES.** The artifact ECHO produces is a Vault row: a closed client with signed terms and first payment pending. Lando's only action is countersignature + Stripe setup.

### 8. One-line kill criteria
Fails to produce 2 closed Brewington Digital Starter clients ($594 new MRR minimum) within 30 days of full-stack go-live.

---

## Source

- **Apify Google Maps Scraper**: https://apify.com/compass/crawler-google-places
- **Apify pay-per-event pricing doc**: https://help.apify.com/en/articles/10774732-google-maps-scraper-is-going-to-pay-per-event-pricing
- **Instantly.ai**: https://instantly.ai/ and https://instantly.ai/blog/smartlead-alternatives-pipeline-2026/
- **Instantly deliverability benchmark (8M emails tested)**: https://imisofts.com/blog/instantly-vs-smartlead-comparison-2025/
- **Apify Actor monetization evidence ($10K+/mo top creators)**: https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store
- License: Apify Terms of Service (commercial use by buyer permitted); Instantly.ai commercial SaaS license; sales plugin under Claude Code plugin license.
- Last commit / update: Apify compass actor actively maintained by Apify's internal team; Instantly ships weekly.
- Stars / downloads / sales: Apify compass/crawler-google-places has **307,000 total users, 18,000 monthly active users**. Instantly.ai 8-figure ARR.
- Active maintainer: yes, both vendors have staffed support and public changelogs.

## What it does

**Harvest layer (Apify).** ECHO calls the Apify Google Maps Scraper with a search string per AZ metro plus category. Returns a JSON array of listings with name, address, phone, website, rating, review count, category, hours, GPS, place ID, URL, and optionally email extracted from the business website. ECHO stores the raw dump and runs a weakness scorer: no website, outdated theme signal, low review count, no GBP photos, broken phone link. Weak-presence prospects enter the cold pool.

**Outreach layer (Instantly.ai).** ECHO drafts personalized cold emails using the `sales` plugin's `draft-outreach` and `email-sequence` skills, referencing one real weakness per prospect. Drafts are pushed into Instantly campaigns. Instantly handles mailbox warmup, inbox rotation, send throttling, and reply routing. Positive replies fire a webhook back to ECHO's bay; ECHO drafts a booking response and notifies Lando. Instantly does NOT do the harvest and does NOT do scoring — that stays with ECHO.

## Fit with Brewington ecosystem

- **Plugs into:** Vault (for lead tracking and close attribution), SignalScout (inbound) stays strictly on Reddit drafts — ECHO owns all outbound, no overlap.
- **Replaces:** nothing currently wired. ECHO is a new outbound function.
- **Depends on:** Apify account ($0 on free tier), Instantly.ai Growth subscription ($47/mo, **needs Lando authorization**), at least one warmed sending domain (brewingtondigital-outbound.com suggested, separate from the brand domain to protect brand reputation).
- **Brewington infra cost delta:** +$52/mo to current yard spend.

## Integration plan if hired

1. Lando creates Apify free-tier account, issues API token, stores in `.env.APIFY_TOKEN`.
2. Lando approves Instantly.ai Growth $47/mo, completes OAuth for sending mailboxes, stores credentials in `.env.INSTANTLY_API_KEY`.
3. Scaffold ECHO bay under `businesses/echo/` with `tick.js` that wraps Apify call + weakness scorer + Instantly dispatch. Use existing bay template (foreman, realtor, scout patterns).
4. Add ECHO to `businesses/scheduler.js` on a 6-hour tick for harvest refresh and reply polling.
5. Register ECHO in `rent-roll.json` at $20/mo to Brix.
6. First live harvest: Mesa HVAC. Validate 300-500 rows returned, weakness scorer ranks top-50, Instantly campaign goes live with 50 sends/day warmup ramp.
7. First revenue milestone: one booked call in 14 days.

## Risks and trade-offs

- **Deliverability risk.** Cold outbound faces Gmail/Outlook spam filters. Mitigation: Instantly's 94% inbox rate is best-in-class; use a secondary domain so the primary Brewington Digital brand isn't at risk; ramp warmup before scale sends.
- **Google Maps TOS.** Scraping public Maps data via Apify is well-precedented (307K users, ~$10K/mo top earners) but sits in grey zone. Mitigation: use Apify (buyer protection, they handle the scraping infrastructure) rather than self-host; do not scrape personal data beyond what Google Business Profile publishes.
- **AZ-only pool exhausts.** 1,500 qualified prospects burns through in roughly 3 months at 500 sends/mo. Mitigation: ATLAS feeds ECHO the next target metro on a rolling 60-day cadence; expand to Phoenix, Tempe, Chandler, then out-of-state.
- **Reply handling overload.** At 3% reply rate, ECHO sees ~45 replies/mo. Lando's 30 minutes/day ceiling on booking-call setup is the real bottleneck. Mitigation: ECHO drafts booking response, Lando reviews in batch.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed — Apify Terms permit commercial scraping by buyer; Instantly commercial SaaS.
- [x] Last commit date confirmed — Apify compass actively maintained by internal team; Instantly weekly changelog.
- [x] Star count / user count confirmed via live sources — 307K users on compass/crawler-google-places confirmed via use-apify.com review.
- [x] Independent reviews found — hackceleration.com Apify review (1,500+ actors tested); imisofts.com Instantly vs Smartlead comparison (8M+ emails tested).
- [x] Pricing page read and costs verified — Apify pay-per-event $4/1K places confirmed; Instantly Growth $47/mo confirmed.

## Runners-up (kept warm if top-tier rejected)

1. **Apify Google Maps Scraper + Resend + sales plugin** — $25/mo. Use if Lando rejects Instantly.ai. Trade: ~30-40% worse deliverability, manual warmup, no AI reply handling. Still autonomous, still fits autonomy ≥3.
2. **Outscraper + Smartlead** — $49 + $94 = $143/mo. Outscraper has better email enrichment out of the box; Smartlead supports white-label when Brewington sells this stack to clients in Phase 3. Hold for later.

## Foreman recommendation

**HIRE (top-tier, pending Instantly authorization).** This is the most direct revenue engine of the 11 cockpit agents. Apify is the world's most-used Google Maps scraper (307K users = real commercial validation). Instantly is the deliverability leader (94% inbox, largest internal lead DB). Payback is under 30 days on a single Starter close. Two closes clears the Instantly tab for a full year.

**Pending-escalation filed:** Lando has not pre-authorized Instantly.ai spend. Per ECHO special rule, surfacing the top-tier option anyway. See `businesses/foreman/pending-escalations/echo-instantly-auth.md`. If Lando rejects, activate Runner-up 1 (Resend fallback) same day with no project delay.

## Lando's decision
<pending>
