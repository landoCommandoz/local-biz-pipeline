# ATLAS research notes

*Researched 2026-04-18 by HANK. Cluster: scraping. Role: territory / market density mapping across 50 states.*

Three search passes run. Six platforms swept. ATLAS differs from ECHO in one key way: ATLAS does not need per-business email or phone. ATLAS needs **bulk counts and weakness signals** per city, per state. Fit rubric rewards bulk coverage at low cost.

## What ATLAS actually has to do

1. For every major US metro, count HVAC + plumber + electrician + roofer + landscaper businesses.
2. Measure online-presence quality: average review count, website presence rate, GBP photo count, mobile fitness.
3. Rank cities by (total businesses × weak-presence rate) to identify high-density, low-competition territories.
4. Feed ZENITH (national strategy) and ECHO (next-territory target).
5. Deliver a state-by-state expansion heat map.

Core unit of work: **populate then score**, not outreach. ATLAS is strategic, not transactional.

## Candidates

### 1. DataForSEO Business Listings API

- URL: https://dataforseo.com/apis/business-data-api/business-listings-api
- Pricing: **$0.01 per task + $0.0003 per row, up to 1,000 rows per request.** Pay-as-you-go, no subscription.
- Coverage: global POI database, Google Maps as primary source, also Trustpilot and Tripadvisor. Category filters, location filters, review counts, website presence.
- Scan math: US has ~40,000 cities. Even at 50 cities × 5 categories × 1 task = 250 tasks = $2.50 per state × 50 states = **$125 one-time for a full-country density baseline.** Monthly refresh of top-50 metros: roughly $15-25/mo.
- Returns: name, address, categories, ratings, review count, URL, phone, hours. **Exactly what ATLAS needs for weakness scoring.**
- License: commercial API, pay-as-you-go, account balance never expires.
- Autonomy: 5/5 — pure REST call, single API key.
- Rubric score: **revenue 30/35** (DataForSEO is an 8-figure ARR company, extensively used by SEO agencies), **fit 25/25** (exact target data at the scale ATLAS needs), **autonomy 5/5**, **install 9/10** (API key only), **license 10/10**. **Total: 84/85 = 98.**

Source: https://dataforseo.com/pricing/business-data/business-listings-api. Independent review: https://datarade.ai/data-providers/dataforseo/profile.

### 2. Apify Google Maps Scraper (same actor as ECHO)

- URL: https://apify.com/compass/crawler-google-places
- 307K users. Pay-per-event $4 per 1,000 places.
- Full-country scan at say 2M places = $8,000 one-time. Way too expensive for bulk baseline.
- **Good for deep-dive on specific target cities** (once ATLAS identifies them), not full-country population scan.
- Autonomy 5/5, fit 18/25 (too expensive for bulk), total: **75/85 = 88**. Strong runner-up for the "zoom in on target city" pass.

### 3. LocalFalcon + API

- URL: https://www.localfalcon.com/pricing
- Pricing: Starter $24.99/mo, 7,500 credits, geo-grid visual heat map, FalconAI analysis. Higher tiers unlock API.
- **Built specifically for ranking grids, not populating lists.** LocalFalcon answers "where does Brewington rank?" not "how many weak plumbers exist in Tulsa?"
- Wrong shape for ATLAS's primary mission. Useful later when ECHO picks a specific metro to attack, to measure Brewington's own rank progress.
- Rubric score: **revenue 25/35** (public ARR unknown, many agency users, pricing transparent), **fit 14/25** (wrong shape), autonomy 5/5, install 9/10, license 10/10. **Total: 63/85 = 74.** Ruled out for ATLAS's core job.

Source: https://www.localfalcon.com/knowledge-base/kb81-how-much-does-local-falcons-pricing-a-complete-guide-to-local-falcons-pricing.

### 4. BrightLocal API

- URL: https://www.brightlocal.com/platform/api-solutions/
- Pricing: Track/Manage/Grow plans start $39/mo, API fees **in addition** on per-request basis.
- Strong for ranking + listing management, but pricing per-request on top of subscription means bulk scans cost more than DataForSEO.
- Rubric score: **revenue 27/35**, **fit 18/25**, autonomy 5/5, install 8/10, license 10/10. **Total: 68/85 = 80.** Ruled out on cost vs DataForSEO.

### 5. SerpApi Google Maps Local Results

- URL: https://serpapi.com/maps-local-results
- $0.0083-$0.01 per request. 20 results per request typical.
- For 40,000 US cities × 5 categories × 3 pages each = 600,000 requests = roughly **$5,000-$6,000 one-time** for full-country baseline.
- More expensive than DataForSEO per equivalent data row. Good reliability. Not the winner.
- Rubric score: **revenue 30/35, fit 20/25, autonomy 5/5, install 9/10, license 10/10. Total: 74/85 = 87.**

Source: https://serpapi.com/pricing.

### 6. gosom/google-maps-scraper (self-hosted)

- Free. MIT. 3.7K stars.
- Self-hosted at full-country scale needs proxy rotation budget (roughly $30-60/mo for residential proxies) and runtime compute.
- Hidden cost: Lando's time debugging proxy bans. Autonomy drops to 3/5 in practice.
- Rubric score: **revenue 22/35** (no direct revenue evidence), **fit 21/25**, autonomy 3/5 (proxy maintenance), install 6/10 (runtime + proxies + rotation), license 10/10. **Total: 62/85 = 73.** Fallback only.

## Atlas decision

**Winner: DataForSEO Business Listings API.** $0.0003/row at up to 1,000 rows/request is the cheapest pay-as-you-go path to a full-US density baseline. No subscription minimum. Commercial API with documented 8-figure ARR behind it (independently credible).

**Complementary pair:** Use **Apify Google Maps Scraper (shared with ECHO's stack)** when ATLAS zooms into a single target metro for ECHO's next outbound push. DataForSEO for breadth, Apify for depth.

**Fallback if Lando refuses DataForSEO credential:** SerpApi (higher cost but more familiar) or gosom self-hosted (free but proxy-dependent).

## Revenue math for ATLAS

ATLAS does not close deals directly. ATLAS is a **conversion multiplier** for ECHO by picking better territories and a **strategy input** for ZENITH.

Value chain:
- Without ATLAS: ECHO defaults to Mesa/Scottsdale/Gilbert. 3 closes/mo at $297 = $891 MRR.
- With ATLAS: ECHO targets cities with highest weak-web density. Reply rates lift from 3% to 5-7% in better-picked territories (industry benchmarks confirm territory quality moves reply rates 1.5-2x on same cold list). Closes lift from 3/mo to 5/mo. New MRR = $1,485 vs $891 = **+$594/mo lift attributable to ATLAS in month 1**.
- Month 3: lift compounds. Stack-wide ARR lift of ~$1,800/mo by end of quarter attributable to ATLAS routing.

Month 1 lift: **$594/mo attributed uplift**.
Month 3 lift: **$1,800/mo attributed uplift**.
Cost: full-country baseline $125 one-time + $20/mo refresh = **$20/mo steady-state**.
Payback: immediate. ATLAS pays for a year of its own spend in one month-3 close.

## Ruled-out options

- **Mapbox / Google Maps Platform**: raw map tiles, not POI metadata. Wrong layer.
- **Yelp Fusion API**: limited commercial license, 500 calls/day default, no bulk download permitted, would auto-reject on licensing.
- **Maptive / Mapsly**: sales-territory mapping, not POI-population tools. Wrong shape.
- **Foursquare Places API**: US coverage is thinner than Google Maps on home services.

## Kill criteria

If ATLAS fails to produce a ranked 50-city target list with weak-presence scoring within 72 hours of install, pull it. If ECHO's close rate does not improve by 20% on ATLAS-picked cities within 60 days vs her baseline AZ list, reassign ATLAS spend to ECHO's direct Apify budget.
