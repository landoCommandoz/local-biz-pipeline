# ECHO scrape/ (harvest layer)

Output directory for gosom/google-maps-scraper. Gitignored (contains PII: phone numbers, emails).

## gosom install (one-time)

Run once per machine that will harvest:

```bash
docker pull gosom/google-maps-scraper:latest
```

If Docker is not available on the active box, install Docker first (https://docs.docker.com/engine/install/) or run gosom via the Go binary:

```bash
go install github.com/gosom/google-maps-scraper@latest
```

## Monthly harvest command

From repo root:

```bash
docker run --rm \
  -v "$(pwd)/businesses/echo/scrape:/out" \
  gosom/google-maps-scraper \
  -c 8 -depth 5 -results-file /out/harvest-$(date +%Y-%m).csv \
  -input /out/seed-queries.txt
```

## seed-queries.txt format

One query per line. Combine trade + city:

```
hvac mesa az
hvac scottsdale az
hvac gilbert az
plumbing mesa az
plumbing scottsdale az
plumbing gilbert az
electrician mesa az
electrician scottsdale az
electrician gilbert az
```

## Output columns

gosom writes CSV with: name, address, phone, website, rating, review_count, latitude, longitude, emails[]. tick.js reads the latest `harvest-YYYY-MM.csv`, scores each row, writes scored pool to `scored-pool.jsonl` (one JSON object per line).

## Rate-limit discipline

- Run once per month, not daily. Google gates repeated scrapers with CAPTCHA.
- If gosom returns zero rows for 3 consecutive runs, escalate to Hank (CAPTCHA lock suspected).
- Fallback scraper: `omkarcloud/google-maps-scraper` (desktop tool, same query format). See pitch runners-up.
