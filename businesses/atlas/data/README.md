# ATLAS data/ (cache layer)

Gitignored. Do not commit caches.

## Sources

| Source | License | Auth | Cache window | Cache file |
|---|---|---|---|---|
| US Census CBP API | Public domain | Free key, 5-min signup | 30 days | `census-cbp-<year>.json` |
| US BLS QCEW | Public domain | None | 90 days (quarterly publish) | `bls-qcew-latest.csv` |
| OSM Overpass API | ODbL (attribution required) | None | 7 days per metro | `osm/<metro-slug>.json` |

## ODbL attribution

Any ATLAS output that appears in a client-facing map or report must carry:

```
Data © OpenStreetMap contributors, ODbL
```

The string is exported from `../lib/osm-attribution.js`. Non-negotiable.

## BLS CSV download

Latest county-high-level file. The exact URL rotates by year/quarter; check https://www.bls.gov/cew/downloadable-data-files.htm for the current link. Example pattern:

```
https://data.bls.gov/cew/data/files/2025/csv/2025_all_county_high_level.zip
```

Manual fetch command (Lando runs once if tick.js fetch fails):

```bash
curl -L -o businesses/atlas/data/bls-qcew-latest.zip \
  "https://data.bls.gov/cew/data/files/2025/csv/2025_all_county_high_level.zip"
unzip -o businesses/atlas/data/bls-qcew-latest.zip \
  -d businesses/atlas/data/
mv businesses/atlas/data/*high_level*.csv businesses/atlas/data/bls-qcew-latest.csv
```

## OSM rate-limit discipline

- ≤1 query per minute per metro
- Cache aggressively (7-day window per metro)
- If Overpass returns HTTP 429 or 503, back off and retry at next tick
- Do NOT run parallel Overpass queries; sequential with delay is the policy
