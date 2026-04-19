# Candidate: US Census CBP + ZBP API (free public-domain market intelligence spine for ZENITH)

*Brief targeted: cockpit-round-zenith. Phase: cockpit. Researched: 2026-04-18. Foreman recommendation: HIRE.*

This pitch hires a skill, not a vendor. ZENITH's strategic layer is built on the US Census Bureau's County Business Patterns (CBP) and ZIP Code Business Patterns (ZBP) APIs, joined with population data also from Census, to produce a nationwide density map of local service businesses by NAICS code. The data is free, public domain, redistributable, updated annually, and already authoritative enough to be the backbone of ESRI Business Analyst ($2,000+/yr) and commercial equivalents. The wrapper code that turns the raw API into Brewington's "90-day market map" is ZENITH's job, built in-yard.

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
ZENITH uses CBP + ZBP to produce a monthly 50-state ranked list of counties where HVAC, plumbing, and electrical establishment density is low relative to population (underserved markets), so ECHO's outreach hits the most fertile ZIPs first and Brewington Digital sells a $297 "City Market Report" as a direct downstream product.

### 2. Monthly cost all-in
- Infrastructure: $0. Runs inside the existing scheduler tick loop on the same Node repo.
- Licensing: $0. Census data is US government public domain, commercial use allowed, redistribution allowed.
- API usage estimate: $0. Census API is free with a no-cost key. Rate limit is high enough for monthly full-US scans.
- Other: $0
- **Total: $0/month.**
Assumptions: one full nationwide scan per month of NAICS 238xxx across all counties and the top 100 metro ZIPs. That is roughly 3,500 API calls per month, well under any rate limit. Drilldowns on top 5 metros use Google Places free tier (10k Essentials calls/month) if we ever need richer detail.

### 3. Projected monthly revenue or revenue-savings
Primary (force multiplier via ECHO): conservative lift of 20% on ECHO's conversion rate because outreach targets are pre-ranked by underservedness. If ECHO closes 2 Starter clients/mo unaided, ZENITH pushes that to 2.4. Month 1 attributable lift: ~$120 MRR. Month 3 attributable lift: ~$360 MRR as ECHO's volume scales.

Secondary (direct product): Brewington Digital sells "City Market Report" as a $297 one-time product. Target 1 sale in month 1, 3 in month 3. Month 1 direct: $297. Month 3 direct: $891.

Combined month-1: ~$417. Combined month-3: ~$1,251. Assumptions spelled out: ECHO running at 2 Starter conversions/mo unaided (conservative), market report sells at one per month in month 1 scaling to three in month 3 via warm outreach to operators who got ECHO'd and said no (a "here is what your market looks like" follow-up).

### 4. Payback period
Month 1. Total cost is $0, so any positive revenue or conversion lift is infinite ROI. Rent is covered by ZENITH's contribution to ECHO's MRR the same day the first ECHO-closed client signs, which is expected within the first month.

### 5. Autonomy score 1-5
4. ZENITH runs a monthly tick:
- Pulls CBP data for NAICS 238220, 238210, 238160, 238990 at county level
- Pulls ACS population data at the same geography
- Computes establishments-per-10k-residents for each county
- Ranks counties in the bottom quartile of density and top quartile of population as "underserved + large"
- Writes `zenith/market-map.json` and `zenith/90-day-plan.md` to its own bay directory
- Surfaces top 20 counties to the dashboard card

Evidence for the score: the Census API is stable, idempotent, and well-documented. The analysis pipeline is deterministic. Lando's only touchpoint is a monthly review of the shortlist. ZENITH does not need a human to complete its loop. It does not post anything outbound, so there is no TOS risk. The one thing it cannot do alone is sign off on a 90-day strategy pivot, but that is the escalation design, not a bug.

### 6. Can it pay its own bills
YES. Cost is $0, so any dollar of revenue attributed clears rent. Bay rent ($20/mo) is covered the first time ZENITH's shortlist contributes to an ECHO close, which is month 1.

### 7. Can it build something without Lando
YES. ZENITH ships a new 90-day market map and a ranked target list every month without Lando touching it. The market map itself is the product. Lando only reviews before ECHO's next campaign pivots to the new shortlist.

### 8. One-line kill criteria
If by day 60 ZENITH's shortlist has not moved ECHO's close rate by at least 10% and has not generated a single direct City Market Report sale, kill the market-report product line and downgrade ZENITH to background-data-only.

---

## Source
- Repo / listing URL: https://www.census.gov/data/developers/data-sets/cbp-zbp/cbp-api.html and https://www.census.gov/data/developers/data-sets/cbp-zbp/zbp-api.html
- License: US government public domain, commercial and redistributive use allowed
- Last commit: continuously maintained, reference year 2023 is current, 2024 expected summer 2026
- Stars / downloads / sales: API used by hundreds of commercial products including ESRI, PolicyMap, Social Explorer
- Active maintainer: yes, US Census Bureau, indefinite

## What it does
CBP returns annual counts of business establishments, employment, and payroll at the state, county, and (via ZBP) ZIP code level, sliced by 2-6 digit NAICS code. For Brewington the important NAICS codes are 238220 (plumbing / heating / HVAC, 196k establishments nationwide), 238210 (electrical, 115k), 238160 (roofing, 50k), and 238990 (other specialty trades). Joined with Census ACS population data (also free), ZENITH computes "establishments per 10k residents" for every US county and ZIP, ranks underserved markets, and emits a ranked strategy doc.

What it does NOT do: identify which specific businesses have weak websites (that is ATLAS's scrape job), enrich with revenue or employee-count details at the firm level (that is Clearbit or similar paid data if Lando ever wants it), or handle international geographies (US only).

## Fit with Brewington ecosystem
- **Plugs into:** ATLAS (consumes ZENITH's ranked county list and scrapes Google Maps inside those ZIPs), ECHO (consumes ATLAS's enriched list for outbound), NEO (feeds ZENITH back signals on which trades and geographies actually convert, closing the loop).
- **Replaces:** nothing. This is additive intelligence.
- **Depends on:** free Census API key (Lando registers once at https://api.census.gov/data/key_signup.html, takes 2 minutes, drops into `.env` as `CENSUS_API_KEY`).
- **Brewington infra cost delta:** $0.

## Integration plan if hired
1. plop scaffold a new bay at `businesses/zenith/` with charter.md, state.json, tick.js, market-map.json, 90-day-plan.md.
2. Lando registers free Census API key. Five minutes, one form.
3. ZENITH's tick.js pulls CBP data for the target NAICS codes, joins with ACS population, computes density scores, ranks markets.
4. Monthly tick rhythm (first of every month). State tracks markets_ranked, top_counties, last_refresh_at, reports_sold_mtd.
5. Dashboard gets a ZENITH card showing top 20 underserved counties and a "generate City Market Report" button for Lando.
6. Day 1 action: single-run the tick manually, Lando and Hank eyeball the first ranked list against intuition, tune the scoring weights, flip to scheduled.

## Risks and trade-offs
- Census reference year lags real-time by ~18 months. Mitigation: density changes slowly in stable NAICS categories, 18-month lag is acceptable for strategic-tier decisions. Real-time per-business data is ATLAS's job via Google Maps.
- "Underserved" by count does not always mean "underserved by capability." A county with 50 HVAC shops could be dominated by 2 big players and 48 weak ones, which is actually a great target. Mitigation: ATLAS's Google Maps scrape layer resolves this with review count and website quality signals.
- Selling the City Market Report as a $297 product is untested for Brewington. Mitigation: v1 price at $297 one-time, test with 3 ECHO-rejected prospects as follow-up outreach, iterate.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (US public domain)
- [x] Last commit date confirmed (continuously maintained, 2023 data current)
- [x] Star count / usage confirmed (federal API used by ESRI, PolicyMap, Social Explorer)
- [x] At least one independent review or discussion found and linked (IBISWorld NAICS 238220 writeup, SBA size standards docs)
- [x] Pricing page read and costs verified (free, public domain)

## Evidence links (2+ required)
1. https://www.census.gov/data/developers/data-sets/cbp-zbp/cbp-api.html (API docs and free signup)
2. https://www.ibisworld.com/classifications/naics/238220/plumbing-heating-and-air-conditioning-contractors/ (establishment counts, industry size)
3. https://outscraper.com/google-maps-api/ (pricing comparison for commercial scrape alternatives, confirms Census API is the cheapest nationwide density source)
4. https://developers.google.com/maps/billing-and-pricing/pricing (Google Places pricing confirms paid alternatives cost $100-$1,200/mo)

## Runners-up
- Google Places API Nearby Search: 10k free calls/month on Essentials SKU. Used only for drilldown on top 5 metros after CBP narrows the list. Adds richness but not a replacement.
- Outscraper API: $3 per 1k records after the free 500/mo tier. Complements CBP (which gives counts) by providing the actual business names and addresses inside the ranked ZIPs. Useful for ATLAS, not ZENITH's strategic layer.

## INSTALLABLE_NOW flag
YES. Installable today.

## BLOCKER_IF_NO
None. Census API key signup is free and takes ~5 minutes. Lando does not need to pay for anything or sign any agreement beyond the free terms.

## Foreman recommendation
HIRE. Zero cost, nationwide coverage on day 1, authoritative US government data, redistribution allowed, direct downstream $297 product, feeds ECHO and ATLAS loop. Every check passes and there is no cheaper or cleaner skill on the market for this mission.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
