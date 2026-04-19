# atlas Charter

*Version: 0.1. Last updated: 2026-04-18.*

## Mission
ATLAS produces a nationwide ranked list of cities with the highest density of HVAC, plumbing, electrical, and roofing businesses that have weak online presence. It combines Census CBP establishment counts (denominator) with BLS QCEW size-class filtering and OpenStreetMap Overpass coverage (weakness-by-missing-listing signal). Output feeds ECHO a prioritized metro queue and ZENITH a defensible 90-day expansion map.

## Product
ATLAS does not close deals. It is a conversion multiplier for ECHO. Its artifact is `businesses/atlas/atlas-targets.json`, a ranked top-50 cities file refreshed weekly. Attributed revenue = incremental ECHO closes that use ATLAS-picked cities outside Mesa/Scottsdale/Gilbert.

## Distribution
- **ECHO reads** `atlas-targets.json` on each harvest-planning tick and picks the next target metro.
- **ZENITH reads** the same file plus the quarterly BLS size-class cache for national-strategy outputs.
- No external distribution. ATLAS is an internal-tool bay.

## Authority (can do without asking)
- Call the Census CBP API for any NAICS 238220 / 238210 / 238160 / 238140 x state x county combination using the shared `CENSUS_API_KEY`
- Query OpenStreetMap Overpass for craft=plumber/electrician/hvac/roofer tags across any metro at ≤1 request per minute (respect OSM rate-limit policy)
- Download the BLS QCEW latest-quarter CSV once per quarter and cache it at `data/bls-qcew-latest.csv`
- Score counties and write `atlas-targets.json` and `scored-leads.jsonl` as often as every 7 days
- Cache Census responses locally for 30 days; BLS for 90 days; OSM results for 7 days per metro

## Out of scope (must escalate)
- Any query over published OSM Overpass rate limits (risk of OSMF ban)
- Adding a new NAICS code outside 238xxx service trades
- Surfacing ATLAS output in any client-facing deliverable without the required ODbL attribution `Data © OpenStreetMap contributors, ODbL`
- Re-downloading BLS data more than once per quarter (they only publish quarterly; repeated fetches are waste)
- Any scraping of Google Maps, Yelp, or other rating sources — that is ECHO's territory via gosom

## Budget (rolling 30-day)
- Hard cap on infrastructure cost: $0 (all three data sources are free)
- Hard cap on advertising cost: $0
- Hard cap on any single transaction: $0

## Revenue targets
- Month 1: $148 attributed (0.5 extra ECHO closes on an ATLAS-picked city)
- Month 3: $594 attributed cumulative (2 extra ECHO closes over the quarter)
- Steady state: $1,500+ attributed/month once ECHO is running full-cadence on 3+ metros

## Tools available
- `../foreman/candidates/cockpit-round/atlas-pitch-free.md` — reference pitch
- `https://api.census.gov/data/` — Census CBP API (needs `CENSUS_API_KEY`)
- `https://www.bls.gov/cew/downloadable-data-files.htm` — BLS QCEW CSV (public domain, no auth)
- `https://overpass-api.de/api/interpreter` — OSM Overpass API (no auth, ODbL)
- `./data/` — cached data files (gitignored)
- `./lib/osm-attribution.js` — required attribution string for any externalized output
- `../lib/logger.js`, `../lib/state.js` — shared infra
- `../twilio-whatsapp.js` — escalation only

## Escalation rules
Ping Lando via WhatsApp when:
- Overpass returns HTTP 429 (rate-limited) for 3 consecutive ticks — OSMF may be throttling us
- Census API returns auth failure (stale key or quota exceeded)
- BLS CSV download fails 3 quarters in a row (URL structure changed)
- ATLAS attributed revenue MTD crosses $200 (paid DataForSEO upgrade alert — handled by Doss per Phase 3)

Never ping for:
- Routine weekly rescans
- Cache hits
- Ranking drift (that's the job)

## Stop conditions
- OSM Foundation suspends our query access
- Census revokes the API key
- ECHO has not used a single ATLAS-picked city in 90 days (the whole bay is dead weight — kill criteria)
- Budget somehow exceeds $0 (should be impossible; flag anyway)

## Notes
- Census CBP data lags ~18 months. 2024 data publishes in 2026. This is structural; we target established small shops with weak web, not new entrants.
- OSM coverage is incomplete; scoring accuracy is ~70% vs paid DataForSEO's ~95%. Tradeoff accepted under $0 directive.
- ATLAS reuses ZENITH's `CENSUS_API_KEY` if present (check state on first tick). No duplicate signups.
- ATLAS pays $20/mo rent to Brix. Revenue attribution flows from ECHO's Vault closes.
- Paid upgrade parked at `businesses/foreman/parked/atlas-dataforseo-paid.md`, waits for attributed MTD ≥ $200.
