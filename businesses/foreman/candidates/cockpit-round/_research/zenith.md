# ZENITH research notebook

*Agent: ZENITH (Strategist). Cluster: intelligence. Researched by Hank on 2026-04-18. Raw findings, not a pitch.*

## Mission restated

Map the 90-day nationwide expansion plan. Rank top markets by local service business density (HVAC, plumbing, electrical). Produce per-state penetration strategy that feeds ECHO's outbound. Consume ATLAS territory maps and NEO conversion signals.

Revenue mechanism for ZENITH: force multiplier. Every well-targeted market ZENITH picks improves ECHO's reply rate and conversion rate. Attribution flows through ECHO. Secondary monetization: sell the "90-day market expansion report" as a standalone Brewington Digital product to other agencies or to service operators who want to know which metros are underserved.

## Capability shortlist (6-platform sweep)

### 1. US Census County Business Patterns (CBP) + ZIP Code Business Patterns (ZBP) API
- URL: https://www.census.gov/data/developers/data-sets/cbp-zbp/cbp-api.html
- License: public domain, US government data, commercial use allowed
- Free: yes, API key is free self-signup at https://api.census.gov/data/key_signup.html
- Latest reference year: 2023 (2024 expected summer 2026)
- Coverage: establishments, employment, payroll at state, county, and ZIP level, sliced by 2-6 digit NAICS code
- NAICS codes that matter: 238220 plumbing/heating/HVAC (196,219 establishments nationwide), 238210 electrical (115,408), 238160 roofing (50,396), 238990 other specialty trade contractors
- Fit: this is the skeleton of a nationwide density map. It tells you exactly how many HVAC contractors exist in every ZIP in America, every year, free
- Rate limit: 500 queries per IP per day unsigned, unlimited with a key
- Gap: tells you count and payroll, not which businesses have weak websites. That is ATLAS's job via Google Maps scrape

### 2. Google Places API Nearby Search
- URL: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
- Pricing 2026: Essentials SKUs 10k free/mo, Pro SKUs 5k free/mo, Starter paid plan $100/mo for 50k calls, Pro $1,200/mo for 250k
- Fit: great for per-city drilldowns on top 5 shortlisted metros, not great for nationwide scans because it will melt the free tier fast
- Use case: ZENITH uses Places only after CBP has already narrowed to ~20 candidate metros
- Gap: expensive at scale, license restricts redistribution of Place results

### 3. Yelp Fusion API
- URL: https://business.yelp.com/data/resources/pricing/
- Pricing 2026: $7.99/$9.99/$14.99 per 1,000 API calls (Starter/Plus/Enterprise). No free tier
- Fit: redundant with Google Places for this mission. Drops as a candidate
- Gap: paid-from-day-one, no free slice, reputation damaged by 2024-2025 pricing flap

### 4. Outscraper Google Maps (third-party scraper + API)
- URL: https://outscraper.com/pricing/
- Free tier: first 500 businesses/month free, resets every 30 days
- Paid: $3 per 1,000 for next 99,500, $1 per 1,000 after 100k
- Fit: cheapest per-record for the "pull every HVAC shop in a metro" pattern. Complements CBP (which gives counts, not names)
- Gap: ToS murky around redistribution, third-party scraper dependency

### 5. Apify Google Maps Scraper actors
- URL: https://apify.com/compass/crawler-google-places
- Pricing: pay-per-result model, $0.002/result on cheapest actor. $0.20-$0.40 per 100 results on mid-tier
- Fit: already in ATLAS's likely toolkit. Overlap with ATLAS, not right for ZENITH's strategic layer
- Gap: operational tool for ATLAS, not strategic tool for ZENITH

### 6. SimilarWeb / Clearbit / OpenCorporates / SBA
- SimilarWeb: traffic data, $199/mo entry. Overkill for local services
- Clearbit: $99+/mo per seat, B2B-skewed, weak for local blue collar
- OpenCorporates: free for light use, corporate registry only, not density
- SBA Size Standards: free public dataset, used for sanity checking. Already captured in CBP
- Fit: none as primary. SBA's size standard ($19M cap for 238220) is a useful filter for ECHO ("only target contractors under the SBA small-biz ceiling")

## Revenue evidence and monetization angle

- CBP data is used by federal, state, and commercial market researchers. Agencies like ESRI Business Analyst charge $2,000+/year for wrapper products that are ultimately CBP + Infogroup joins. Brewington's "90-day market report" is the downmarket version of this, priced at $297 one-time or bundled into Growth plan
- Freelance market research on Fiverr/Upwork ranges $25-$70/hr. A 5-hour packaged report is a $125-$350 product. Brewington Digital can price a city-specific "underserved HVAC market report" at $297 and deliver it in 30 minutes because ZENITH runs the pipeline
- Indie creators on Gumroad sell templates and reports at $19-$297 and top sellers reach five figures. A ZENITH-generated report is comparable in delivery format

## Decision

Primary skill: **US Census CBP + ZBP API** for the nationwide density spine, combined with Outscraper free tier (500 records/month) or ATLAS's scrape output for the "which of these has weak web presence" filter.

Why: free, legal, redistributable, nationwide coverage on day 1, zero credentials required beyond a free API key, data is authoritative (US government), NAICS codes cover exactly the trades Brewington targets.

Runner-up A: Google Places Nearby Search for drilldown on top 5 shortlisted metros (uses free tier).
Runner-up B: Outscraper API for bulk name/address pulls where CBP only gives counts.

Rejected: Yelp Fusion (paid-only, no free tier), SimilarWeb (priced for enterprise), Clearbit (B2B-skewed).

## Autonomy check

Score 4. ZENITH runs a monthly tick that:
1. Hits CBP API for latest NAICS 238xxx counts by county
2. Joins with US population (also free Census data) to compute establishments-per-capita
3. Ranks counties by (low count per capita) and (high total households) to find "underserved but large" markets
4. Writes `zenith/market-map.json` and `zenith/90-day-plan.md` to its own bay
5. Surfaces top 20 counties to dashboard

Lando's touchpoint: monthly review of the map, approve/reject shortlist. Not required for the tick to run.

## Monetization check

YES as product: Brewington Digital sells "City Market Report" as a $297 upsell. ZENITH generates the artifact. Lando reviews and ships. Secondary revenue stream on top of the force-multiplier value to ECHO.
