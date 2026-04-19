# ECHO research notes

*Researched 2026-04-18 by HANK. Cluster: scraping. Role: full client acquisition — cold harvest + outreach.*

Three search passes run. Six platforms swept: GitHub, Claude plugin/skills, Apify Store, RapidAPI / official APIs, Product Hunt / Gumroad / Indie Hackers threads, Reddit revenue threads.

ECHO pitches the highest-revenue stack, not the easiest. Top-tier rule active. Paid-credential blockers flagged via `pending-escalations/` rather than auto-reject.

## What ECHO actually has to do

1. Harvest local service businesses in Mesa, Scottsdale, Gilbert AZ from Google Maps. HVAC, plumber, electrician, roofer, landscaper, cleaner, handyman.
2. Score each prospect on weak-online-presence signals (no website, old screenshots, low review count, outdated GBP, no mobile layout).
3. Write personalized cold outreach referencing a real weakness.
4. Send sequenced email + SMS, track replies, warm positive replies to booked calls.
5. Convert to paying Brewington Digital Starter ($297/mo) or Growth ($497/mo) clients.

Two distinct tech layers: **harvest** and **outreach**. Winning pitch covers both.

## Harvest candidates

### 1. Apify Google Maps Scraper (compass/crawler-google-places)

- URL: https://apify.com/compass/crawler-google-places
- Stats: 307K total users, 18K monthly active users. The most-used Maps scraper on the planet.
- Pricing: pay-per-event. $0.007 per actor start + $0.004 per place scraped. $4 per 1,000 places. Free tier includes $5/mo credit, good for roughly 500-1,000 listings/mo on the free plan.
- Mesa + Scottsdale + Gilbert HVAC + plumber + electrician = roughly 1,500-3,000 listings total. First pass fits in free tier. Refresh every 30 days stays under $15/mo.
- Returns: name, address, phone, website, rating, reviews count, category, hours, GPS, place ID, URL, reviews (optional), email (via website visit, optional).
- License: Apify Terms. Commercial use permitted. Buyer is the user, not the Actor creator.
- Rubric score: **revenue 32/35** (307K users proves commercial value, Apify creators earn $10K+/mo on top actors), **fit 25/25** (exact target data), **autonomy 5/5** (one API call), **install 9/10** (API key only), **license 10/10**. **Total: 81/85 = 95.**

Source for user count: Apify Store listing and https://use-apify.com/docs/best-apify-actors/best-google-maps-scrapers. Source for creator earnings: https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store ("top creators make $10,000+ monthly recurring"). Source for pay-per-event pricing: https://help.apify.com/en/articles/10774732-google-maps-scraper-is-going-to-pay-per-event-pricing.

### 2. Outscraper Google Maps API

- URL: https://outscraper.com/google-maps-scraper/
- Pricing: free 500 records, then $3 per 1,000, drops to $1 per 1,000 after 100K cumulative. Pro $49/mo (1,000 credits), Business $199/mo (5,000 credits). Lifetime deal listed historically at $129 for 5,000 monthly scrapes forever.
- Returns: names, emails, phones, reviews, ratings, enrichment.
- Autonomy 5/5.
- Fit 24/25 — first-class email enrichment built in, slight advantage vs Apify for email append.
- Rubric score: **revenue 30/35** (ARR not public but public lifetime-deal history and strong review volume), **fit 24/25**, **autonomy 5/5**, **install 9/10**, **license 10/10**. **Total: 78/85 = 92.** Second place.

Source: https://outscraper.com/pricing/, https://findfahim.com/lead-generation-tools/google-maps-scraper-outscraper/ (lifetime deal evidence).

### 3. gosom/google-maps-scraper (GitHub)

- URL: https://github.com/gosom/google-maps-scraper
- Stars: 3.7k. License: MIT. Last commit: v1.12.0 April 12 2026. Active.
- Language: Go. No API key required.
- Features: 33+ data points, email extraction via `-email` flag, web UI, proxy support, LeadsDB optional.
- Cost: $0 (self-hosted on existing infra).
- Rubric score: **revenue 22/35** (no direct revenue story, but powers many agencies — cannot verify revenue), **fit 23/25** (self-hosted, no vendor lock), **autonomy 4/5** (needs occasional proxy rotation), **install 7/10** (requires Go runtime + optional proxies), **license 10/10**. **Total: 66/85 = 78.** Strong free fallback.

### 4. omkarcloud/google-maps-scraper

- URL: https://github.com/omkarcloud/google-maps-scraper
- Stars: 2.6k. License: MIT. 50+ data points. Pro desktop one-time $28, API $16/mo.
- Worse fit than gosom for bay integration because it leans on desktop UI and an optional paid API. Retain as runner-up.
- Rubric score: **revenue 20/35, fit 20/25, autonomy 4/5, install 8/10, license 10/10. Total: 62/85 = 73.**

### Harvest decision

**Winner: Apify Google Maps Scraper.** 307K users is defensible revenue evidence. Pay-per-event fits a $5/mo free tier for AZ-only cold start. Upgrade to $39 Starter only when volume demands it.

**Fallback: gosom/google-maps-scraper** at zero cost if Lando refuses Apify account creation. Runs on existing yard infra. Slightly more install work but zero bill.

## Outreach candidates

### 1. Instantly.ai (paid, top-tier)

- URL: https://instantly.ai/
- Pricing: Growth $47/mo, Hypergrowth $97/mo. Emailing + Leads plans $47-$492/mo.
- 94% inbox rate across 8M tested emails (vs Smartlead 89%). 450M+ verified lead database built in. Built-in AI reply handling under 5 minutes.
- Autonomy 5/5 on the send side, 4/5 overall (ECHO still drafts, Instantly sends and handles replies).
- Revenue evidence: One small agency case study landed $11K MRR from cold email. Jake Jorgovan generated $12,030 with a single cold email campaign. Instantly's own ARR is 8-figures.
- **BLOCKER: paid subscription + OAuth for mailbox warmup. Needs Lando authorization.** Flag via `pending-escalations/`.
- Rubric score: **revenue 33/35, fit 24/25, autonomy 4/5, install 8/10, license 10/10. Total: 79/85 = 93.**

Source: https://instantly.ai/blog/smartlead-alternatives-pipeline-2026/, https://imisofts.com/blog/instantly-vs-smartlead-comparison-2025/.

### 2. Smartlead (paid, alt)

- URL: https://www.smartlead.ai/
- Entry $94/mo. Agency white-label +$29/client. API-first.
- Strong but pricier than Instantly for ECHO's volume. Runner-up if Lando rejects Instantly.
- Rubric score: **revenue 28/35, fit 22/25, autonomy 4/5, install 7/10, license 10/10. Total: 71/85 = 84.**

### 3. sales plugin (already installed) + nodemailer + self-hosted send

- URL: Claude Code `sales` plugin provides `draft-outreach`, `account-research`, `call-summary`, `email-sequence` skills. No send/inbox/warmup.
- Cost: $0.
- Drawback: ECHO has to outsource the actual send. Without Instantly or Smartlead, she needs SMTP + warmup + deliverability — Lando ends up being the missing piece on every send. Autonomy drops to **2/5** on the full pipeline, which is **auto-reject territory**.
- Rubric score: **revenue 15/35** (no send layer = no revenue), **fit 18/25, autonomy 2/5 (AUTO-REJECT on full pipeline), install 10/10, license 10/10. Total: disqualified on autonomy for the full pipeline.**

### Outreach decision

**Winner: Instantly.ai Growth $47/mo** — highest revenue evidence, 94% inbox, built-in lead DB and reply handling. Flagged as pending-escalation because Lando hasn't authorized paid account yet.

**Fallback: sales plugin + Resend.com API send layer** — $20/mo Resend Pro, deliverability is lower but autonomous. Only if Lando rejects Instantly.

## Full stack decision for ECHO

Tier 1 (top-tier, pitched): **Apify Google Maps Scraper (harvest) + Instantly.ai Growth (outreach)**. Total month-1 cost: $5 Apify free tier + $47 Instantly = **$52/mo all-in**. Both flagged for account creation; Instantly is the credential blocker.

Tier 2 (fallback if Lando rejects paid Instantly): **Apify + sales plugin + Resend** = $5 + $0 + $20 = $25/mo. Lower deliverability, lower reply rates, but defensibly autonomous.

Tier 3 (zero-cost if Lando rejects both APIs): **gosom scraper + sales plugin + Gmail SMTP**. $0/mo, needs nodemailer bay, lowest volume ceiling.

## Revenue math for ECHO

Assumptions (conservative):
- AZ HVAC + plumber + electrician cold pool: ~1,500 businesses after filtering for weak web presence.
- Cold email industry baseline: 2-5% reply rate at 94% inbox. Take 3%.
- 1,500 × 3% = 45 positive replies/mo.
- Close rate on booked calls: 5-10% for a $297 offer. Take 7%.
- 45 × 7% = **3 new clients/mo** at $297 MRR = **$891 new MRR from month 1 alone**.
- Month 3 with compound: 3 × 3 months of new signups = 9 active clients × $297 = **$2,673 MRR** by end of month 3, assuming zero churn.
- Upgrade mix: 20% upgrade to Growth ($497) adds ~$400 on top by month 3.

Month 1 projection: **$891 new MRR**.
Month 3 projection: **$3,000+ MRR**.
Cost ceiling: $52/mo all-in.
Payback: month 1 (first close pays 5 months of stack).

## Ruled-out options

- **Apollo.io**: $49/mo, strong contact DB but weak on local service businesses — Apollo is B2B SaaS focused. Fit drops to 15/25.
- **Hunter.io email finder**: not a Maps scraper. Pair-only, not standalone.
- **lemlist**: lemlist $59/mo, Instantly has better deliverability and pricing for ECHO's volume.
- **RapidAPI Google Places wrappers**: opaque pricing and per-request cost adds up fast at refresh cadence.

## Kill criteria

If ECHO's Apify + Instantly stack fails to deliver 2 closed Brewington Digital Starter clients in 30 days (measured by Vault `active_clients` delta), pull Instantly and drop to the Resend fallback. If she fails to deliver 1 closed client in 60 days, pull the whole stack and reassign ECHO to inbound-only (merge with SignalScout).
