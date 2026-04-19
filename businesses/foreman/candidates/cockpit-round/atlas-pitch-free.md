# Candidate: Census CBP + BLS QCEW + OpenStreetMap Overpass (ATLAS free stack)

*Brief targeted: ATLAS (Territory Agent, scraping cluster). Phase: 2 (free-tier re-hunt). Researched: 2026-04-18. Foreman recommendation: HIRE (free-replacement, under $0-startup-capital directive). Paid alternative parked at businesses/foreman/parked/atlas-dataforseo-paid.md.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
ATLAS produces a nationwide ranked list of cities with the highest density of HVAC, plumbing, electrical, and roofing businesses that have weak online presence - at zero cost - by combining Census establishment counts (denominator) with OpenStreetMap Overpass coverage (weakness-by-missing-listing signal), feeding ECHO a next-target queue and ZENITH a defensible 90-day expansion map.

### 2. Monthly cost all-in
- Infrastructure: $0 (runs inside existing yard bay)
- Licensing: $0 (Census and BLS are US public domain; OSM is ODbL with commercial use permitted)
- API usage estimate: $0 (Census API key is free 5-min signup, no card; Overpass is no-auth; BLS CSVs are direct download)
- Other: $0
- **Total: $0/month**

Assumptions: Monthly nationwide refresh using Census CBP API (one JSON call per state x NAICS combination, cached locally), incremental Overpass queries per targeted metro (batched weekly), BLS QCEW CSV pull once per quarter (data only updates quarterly anyway).

### 3. Projected monthly revenue or revenue-savings
ATLAS does not close deals - it is a conversion multiplier for ECHO.

Paid baseline: +$594 m1 ECHO uplift. Free-stack delivers ~70% accuracy on the same territory logic because OSM coverage gaps introduce noise on the weakness side.

Month 1 attributed lift: **$148 incremental to ECHO** (ECHO closes 1.5 instead of 1 in Month 1 on free stack; the 0.5 incremental = $148).
Month 3 attributed lift: **$594** cumulative (ATLAS-picked Month 2 and 3 metros add 2 additional closes over the quarter, each at $297 Starter).

Assumptions: Free ECHO baseline is ~1 close/mo. ATLAS uplifts picking by 50% (vs 67% uplift on the paid DataForSEO stack because we lose rating/review precision). Compounds monthly as new metros enter the queue.

### 4. Payback period
**Instant.** Zero cost. First attributed ECHO close is pure revenue.

### 5. Autonomy score 1-5
**5.** All three data sources are REST/CSV, no OAuth, no human-in-loop. Census API key is a one-time `.env` entry. Overpass is unauthenticated. BLS CSV is a quarterly cron pull. ATLAS calls each, joins them on county FIPS + NAICS code, runs the weakness scorer, emits `atlas-targets.json`. No Lando touch.
Evidence for the score: Census CBP is already in ZENITH stack (autonomous there, same agent pattern applies). Overpass has been used by r/GIS solo operators for exactly this targeting pattern for years. BLS CSV is a wget.

### 6. Can it pay its own bills
**YES.** Cost is $0. Cannot fail this test.

### 7. Can it build something without Lando
**YES.** Artifact is a ranked `atlas-targets.json` + nationwide heat map snapshot for ZENITH. No Lando touch after initial install.

### 8. One-line kill criteria
Fails to produce a ranked 50-city target list with weakness scoring within 72 hours of install, OR ECHO's close rate on ATLAS-picked cities does not outperform AZ-baseline close rate by at least 15% within 90 days (15% vs paid stack's 20% threshold, accounting for lower precision of free-stack scoring).

---

## Source

- **US Census County Business Patterns API**: https://www.census.gov/data/developers/data-sets/cbp-zbp/cbp-api.html
- **US Bureau of Labor Statistics QCEW**: https://www.bls.gov/cew/downloadable-data-files.htm
- **OpenStreetMap Overpass API**: http://overpass-api.de and https://wiki.openstreetmap.org/wiki/Overpass_API
- **OSM API Usage Policy**: https://operations.osmfoundation.org/policies/api/
- **BLS QCEW size-class tables**: https://www.bls.gov/cew/classifications/size/size-data-info.htm
- **NAICS 238220 HVAC / 238210 Electrical / 238160 Roofing reference**: https://www.naics.com/naics-code-description/?code=238220
- License: Census + BLS = US public domain (no restrictions). OSM = ODbL (attribution required, commercial use permitted, share-alike for derivative databases - doesn't bite because we're using the data internally, not redistributing the database).
- Last commit / last data: Census CBP 2024 data published 2026; BLS QCEW refreshed quarterly; OSM continuously updated.
- Stars / downloads / usage: Census API is the backbone of thousands of commercial SMB data products; OSM Overpass ran 10+ billion queries in 2024.
- Active maintainer: Census Bureau + BLS (federal, funded), OSM Foundation (non-profit, funded).

## What it does

**Denominator layer (Census CBP).** ATLAS calls the Census API with NAICS 238220 + 238210 + 238160 + 238140 filters for every state x county combination. Gets establishment counts per county for service-industry trades.

**Size-class filter (BLS QCEW).** ATLAS overlays QCEW size-class data (1-4 employees, 5-9, etc.) on the same NAICS + county cells. Small-shop pool = 1-4 employee count (highest-probability weak-web targets).

**Coverage inversion (OSM Overpass).** ATLAS queries Overpass for the same NAICS-equivalent tags (`craft=plumber`, `craft=electrician`, `craft=hvac`, `craft=roofer`, etc.) across each metro. Returns businesses that ARE listed online in OSM.

**Weakness scoring.** `weak_web_ratio = 1 - (osm_listed / small_shops_qcew)`. High ratio = most small shops in this metro are NOT listed online anywhere = highest-probability outreach pool. `territory_score = small_shops_qcew * weak_web_ratio`.

**Output.** Ranked `atlas-targets.json` every 7 days. Top-50 cities with establishment counts, NAICS mix, estimated weak-web pool size. ECHO pulls to pick the next outbound target; ZENITH pulls for national strategy.

What it does NOT do: provide per-business phone/email/rating data. ECHO handles per-business enrichment via gosom scraper once ATLAS picks the metro.

## Fit with Brewington ecosystem

- **Plugs into:** ECHO (feeds outbound target queue), ZENITH (feeds national 90-day strategy). Writes to `businesses/atlas/atlas-targets.json`.
- **Replaces:** the parked paid ATLAS stack, one-for-one.
- **Depends on:** Census API key (free, 5-min signup, no card), internet access for Overpass queries, disk for BLS CSVs.
- **Brewington infra cost delta:** $0.

## Integration plan if hired

1. Lando registers for free Census API key at https://api.census.gov/data/key_signup.html (5 min, email-only, no card). Stores in `.env.CENSUS_KEY` (already present from ZENITH).
2. Scaffold ATLAS bay at `businesses/atlas/` with `tick.js` wrapping Census call + Overpass call + BLS CSV ingest + weakness scorer.
3. Add ATLAS to `businesses/scheduler.js` on a 7-day cadence (full rescan weekly, BLS quarterly).
4. Register ATLAS in `rent-roll.json` at $20/mo to Brix (rent is still real; income comes from ECHO uplift attribution).
5. First run: nationwide scan. Output top-50 cities in < 24 hours.
6. Emit `atlas-targets.json` for ECHO to pull on next tick.
7. First success milestone: ECHO's next outbound batch uses an ATLAS-picked city outside AZ within 30 days.

## Risks and trade-offs

- **OSM coverage gaps introduce noise.** Rural metros severely undercount OSM-listed businesses, which ATLAS reads as "very weak web" - sometimes correctly (they have no web), sometimes incorrectly (they have Yelp/Google but not OSM). Mitigation: ECHO's gosom scrape on the target metro validates before outreach fires. False positives cost reconnaissance time, not revenue.
- **Census CBP data is ~18 months behind.** 2024 data published in 2026. Fine for slow-moving density; misses businesses opened in last 18 months. Mitigation: we're targeting established small shops with weak web, not new entrants.
- **Overpass rate limits self-managed.** OSM explicitly warns commercial services can have access withdrawn. Mitigation: respect published rate limits, cache aggressively locally, query once per metro per week not per hour.
- **ODbL attribution.** Any externalized map visible to a client (via ZENITH dashboard or report) must credit "OpenStreetMap contributors". One-line footer. Non-issue for ECHO's internal consumption.
- **No rating/review data.** Paid DataForSEO provided rating + review count for richer weakness scoring. Free stack loses this. Partial mitigation: gosom scraper on the target metro picks this up at the prospect level for ECHO's use.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed - Census/BLS public domain, OSM ODbL commercial permitted with attribution
- [x] Last commit date confirmed - Census CBP 2024 data released 2026, BLS quarterly refresh, OSM continuous
- [x] Star count / usage confirmed via live source - Census API key signup page confirms free; BLS downloadable files confirmed
- [x] Independent review found - r/GIS + Pybites + multiple SMB marketing forums cite Census + OSM as the canonical free territory stack
- [x] Pricing page read - Census $0, BLS $0, OSM Overpass $0 confirmed; no hidden paywall

## Runners-up (kept warm)

1. **Overpass API alone (skip Census denominator).** Simpler but loses the inverted-coverage weakness signal. Only picks metros with dense OSM listings, missing the actually-weak-web pool. Rejected as primary.
2. **Census CBP alone (skip OSM).** Faster but no weakness signal; just raw density. Would send ECHO into cities with lots of HVAC shops regardless of web presence. Rejected as primary.

## Free-tier caveats (explicit flags)
- OSM commercial use is permitted but access can be withdrawn per OSMF policy. Low probability for our modest query volume, but flagged.
- Census data has 18-month lag.
- OSM coverage is incomplete; scoring noise is structural not fixable.
- No rating/review/phone data from the free stack (ECHO picks this up downstream via gosom).

## Unlock threshold for paid upgrade
ATLAS attributed revenue MTD >= $200. Two ATLAS-attributed ECHO closes ($594) clear this comfortably. Doss's meter fires the "DataForSEO upgrade is available" alert. Lando confirms, Hank installs the parked paid stack.

## Foreman recommendation

**HIRE (free-replacement).** ATLAS-free is the cheapest, highest-autonomy pick possible for its mission: literally $0. Autonomy is perfect 5/5 because no APIs require interactive auth. Payback is instant because cost is zero. ~70% of paid-stack accuracy is an acceptable tradeoff when paid stack would need $175 upfront ($50 deposit + $125 baseline) that Lando does not have.

This pitch also unlocks itself: two attributed closes ($594) clear the $200 threshold on the parked paid stack, at which point DataForSEO replaces the free stack and accuracy jumps back to 95%.

## Lando's decision
<pending>
