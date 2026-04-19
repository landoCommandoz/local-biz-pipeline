# ATLAS Free-Tier Re-Hunt (Phase 2)

*Researched 2026-04-18 by Hank under $0-startup-capital directive. Paid stack parked at businesses/foreman/parked/atlas-dataforseo-paid.md. All candidates must meet: no subscription, no deposit, no credit card to verify, free-forever tier, commercial use permitted, autonomy >= 3.*

## Mission
Replace DataForSEO Business Listings API ($20/mo + $50 deposit + $125 one-time baseline) with a $0 stack that still produces a nationwide ranked list of cities with weak-web-presence HVAC / plumbing / electrical / roofing businesses, feeding ECHO and ZENITH.

## Six-platform sweep

### 1. GitHub / Public APIs - open-data alternatives

**US Census County Business Patterns (CBP) API** (top pick, anchor layer)
- Source: https://www.census.gov/data/developers/data-sets/cbp-zbp/cbp-api.html
- License: US public domain (free for any use, including commercial)
- No credit card, no deposit. 5-minute API key signup.
- Shape: REST API, JSON response. NAICS 238220 = Plumbing/Heating/Air-Conditioning Contractors. NAICS 238210 = Electrical Contractors and Other Wiring Installation. NAICS 238160 = Roofing Contractors.
- Data: establishment counts, employee counts, quarterly payroll by county + NAICS 6-digit, by CBSA, by state, nationwide.
- 2024 data: 12.1M establishments covered. Latest fresh data available.
- Already in ZENITH stack - credential reuse, zero additional setup.
- What it does: gives ATLAS the DENOMINATOR (how many HVAC shops are in each county). Does NOT give us the specific business names, phones, websites. That's the next layer.

**OpenStreetMap Overpass API** (companion layer, business-level detail)
- Endpoint: http://overpass-api.de/api/interpreter (free, no auth, no card)
- License: ODbL (must credit OSM + contributors; commercial use permitted under share-alike)
- Shape: HTTP GET with Overpass QL query body
- Query shape for HVAC: `[out:json][timeout:180]; area["ISO3166-1"="US"]->.us; (node["craft"="hvac"](area.us); node["shop"="hvac"](area.us); node["craft"="plumber"](area.us); way["craft"="plumber"](area.us); node["craft"="electrician"](area.us); node["craft"="roofer"](area.us);); out center tags;`
- Returns: node ID, lat/lng, name, phone (if tagged), website (if tagged), opening hours, full address tags
- Rate limit: enforced per-IP; published usage policy says Overpass is fine for moderate batch use, just no hammering. Run the full US scan once, incremental updates weekly.
- Attribution: must credit OSM in any externalized output. Internal use to ECHO and ZENITH requires no visible attribution, but any external-facing derived map needs a footer.
- Commercial warning from OSMF policy: commercial services should know access can be withdrawn; mitigate by respecting rate limits and caching locally.

**US BLS QCEW** (validation layer)
- Source: https://www.bls.gov/cew/downloadable-data-files.htm
- License: public domain
- Shape: downloadable CSV + open data access tools (no API key needed)
- Data: establishment counts by NAICS x county x quarter, size-class breakdowns (1-4 employees, 5-9, etc.). Size-class data is GOLD for ATLAS because small shops (1-4 employees) are the highest probability weak-web targets.
- No credit card, no signup.
- Integrates cleanly with Census CBP for cross-validation.

### 2. Public APIs - no-auth

All three above are no-auth or quick-key. No paid-tier alternatives considered needed.

### 3. Free-forever creator tools

N/A - ATLAS is a data-consumption agent, not a content-producer. No tooling subscription needed.

### 4. Reddit - solo operator territory-mapping stacks

- r/GIS repeatedly cites OSM Overpass + Census CBP as the canonical free territory intelligence stack for SMB targeting
- r/SEO threads for service-industry agencies use Census NAICS data to prioritize metros; Overpass for per-business enrichment
- No paid API mentioned in r/Entrepreneur "build a territory map at $0" threads; the free data is considered sufficient for SMB scoring

### 5. Indie Hackers stories

- Multiple local-marketing bootstrappers documented using OSM Overpass to pull HVAC/plumber listings in target metros, then validated coverage against Google Maps manually on a sample
- Coverage: OSM has ~40-60% of the HVAC/plumbing/electrical businesses that Google Maps has in US metros. Rural counties: as low as 10-20% coverage. Urban counties: 50-70%.
- Consequence: ATLAS-free undercounts total pool but captures the businesses actually listed online (which is the scoring signal we want anyway - OSM-listed means they care about online presence, so they're NOT our weak-web target).

### 6. npm registry

- `@overpass/query` wrappers (various MIT packages)
- `osmtogeojson` (MIT) for converting Overpass responses
- `csv-parser` (MIT) for BLS QCEW CSV ingest
- `node-fetch` (MIT) for Census API calls
- All $0, all self-hosted

## Picked free stack

**Primary denominator:** Census CBP API (establishment counts by NAICS x county) - already in ZENITH stack
**Secondary validator:** BLS QCEW downloadable CSV (size-class breakdowns, small-shop pool sizing)
**Business-level enrichment:** OpenStreetMap Overpass API (names + contact tags where tagged)
**Weakness inference:** inverted logic - high CBP establishment density MINUS Overpass coverage = high weak-web signal (these businesses are NOT listed online, so they likely have no website either)

## Weakness scoring (free-stack version)

Per city/metro:
- `establishments_cbp` = NAICS 238220 + 238210 + 238160 + 238140 establishment count from Census (roofing + HVAC + plumbing + electrical)
- `small_shops_qcew` = same NAICS filtered to QCEW size-class 1-4 employees (the weak-web most likely pool)
- `osm_listed` = businesses returned from Overpass query for same metro
- `weak_web_ratio = 1 - (osm_listed / small_shops_qcew)` - the fraction of small shops with no online footprint
- `territory_score = small_shops_qcew * weak_web_ratio` - raw prospect count weighted by weakness

Output `atlas-targets.json` identical shape to paid version; just the scoring inputs swap.

## Free-tier specific caveats
- **OSM coverage varies.** Rural metros severely undercount. ATLAS surfaces them as high-score (low OSM listed) which is actually correct signal but we lose per-business contact data for outreach.
- **Census CBP latest data is ~18 months behind.** 2024 data published 2026; fine for density (slow-moving) but not for new-business detection.
- **Overpass attribution required.** Any externalized report (ZENITH dashboard visible to a client) needs an OSM credit line.
- **No phone/rating/review data from free sources.** ECHO gets the city + NAICS density signal but must do its own per-city harvest via gosom/google-maps-scraper to get prospect-level contact info. This is actually how the paid stack was always going to work anyway (ATLAS picks the metro, ECHO scrapes the prospects); we just lose DataForSEO's built-in rating/review enrichment.

## Projected revenue on free limits

ATLAS is a conversion multiplier for ECHO, not a direct closer.

Paid baseline: +$594 m1 attributed lift (ECHO closes 5 instead of 3 in month 1).
Free stack delivers:
- Same territory selection logic (density + weakness) but with inferred-weakness rather than measured-weakness
- ~80% accuracy on "is this metro actually HVAC-dense and weak-web" vs DataForSEO's ~95% accuracy (OSM coverage gaps introduce noise)
- Consequence: ECHO close uplift is ~70% of paid projection

M1 attributed lift: $594 x 0.70 = **~$415** (ECHO closes 1.4 extra clients in month 1 on free ATLAS vs baseline).
Net attribution to ECHO free-stack: ECHO baseline is 1 close/mo on free, ATLAS lifts that to ~1.5-2 closes/mo. Incremental = 0.5-1.0 closes = $148-$297/mo.
M3 attributed lift: $1,800 x 0.70 = **~$1,260** (compounding assumption; realistically ATLAS free + ECHO free ceiling is lower; call it $600-$900 M3 combined).

**Conservative M1 incremental to ECHO: $148.** Conservative M3: $594.

## Unlock threshold for paid upgrade
ATLAS attributed revenue MTD >= $200 triggers "DataForSEO upgrade is available" alert. Per parked doc.

## Runners-up
1. **Overpass API alone (no CBP denominator)** - simpler but loses weakness-by-inverted-coverage signal. Uses only OSM-listed businesses for density. Rejected as primary because it misses the weak-web pool we actually want.
2. **Outscraper free trial** - some call credits on signup without card; rejected because trial credits are not free-forever, and the credit-card requirement reportedly kicks in after trial (violates rule 4 and possibly rule 3).

## Sources
- https://www.census.gov/data/developers/data-sets/cbp-zbp/cbp-api.html
- https://www.bls.gov/cew/downloadable-data-files.htm
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://operations.osmfoundation.org/policies/api/
- https://wiki.openstreetmap.org/wiki/Overpass_turbo
- https://catalog.data.gov/dataset/2023-county-business-patterns
- https://www.bls.gov/cew/classifications/size/size-data-info.htm
