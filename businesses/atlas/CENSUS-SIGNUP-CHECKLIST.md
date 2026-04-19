# Census API Key — Signup (free, 5 min)

Lando executes. Hank cannot automate auth signups.

## Before you start

Check if ZENITH already has a `CENSUS_API_KEY`. Grep the repo:

```bash
grep -r "CENSUS_API_KEY" /workspaces/local-biz-pipeline/.env 2>/dev/null
```

If it's already in `.env`, ATLAS reuses it. No new signup needed. Skip to Step 3 to confirm.

## Step 1 — Request the key

- Go to https://api.census.gov/data/key_signup.html
- Organization name: **Brewington Digital**
- Email: `landonbrewington12@gmail.com`
- Click **Request Key**
- The key arrives by email within minutes (usually under 60 seconds)

No credit card. No phone. No organization verification. Just email.

## Step 2 — Paste into `.env`

In `/workspaces/local-biz-pipeline/.env`, add:

```
CENSUS_API_KEY=your_40_character_key_here
```

## Step 3 — Verify

Run one tick manually:

```bash
node businesses/atlas/tick.js
```

Expected: log line shows `flipped bay_status installing -> active` and `last_full_rescan_at` stamps. If the log instead says `waiting on CENSUS_API_KEY`, the env didn't load — restart any long-running process or check `.env` formatting (no quotes, no spaces around `=`).

## Step 4 — Accept the license posture

- Census data is US federal public domain. No attribution required, no restrictions.
- BLS QCEW data is US federal public domain. No attribution required.
- OSM Overpass data is ODbL. Any map ATLAS data ends up on must carry `Data © OpenStreetMap contributors, ODbL`. Handled automatically by `../lib/osm-attribution.js`.

## Done-check

- [ ] `CENSUS_API_KEY` in `.env` (either new or reused from ZENITH)
- [ ] `node businesses/atlas/tick.js` runs without `waiting on CENSUS_API_KEY` warning
- [ ] `state.json.bay_status` is `active`
- [ ] `state.json.last_full_rescan_at` has an ISO timestamp
