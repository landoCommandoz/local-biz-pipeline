# Free-Replacement Pitches: ECHO, ATLAS, PIXEL

*Compiled 2026-04-18 by Hank. Phase 2 re-hunt under Lando's $0-startup-capital directive. All three paid stacks are parked until earned revenue clears their unlock thresholds. This doc is the free-tier replacement slate, ranked by m1 revenue.*

## Ranked by Month 1 revenue on free-tier limits

| Rank | Agent | Free winning skill | M1 rev | M3 rev | Cost | Unlock paid at |
|------|-------|-------------------|--------|--------|------|----------------|
| 1 | ECHO | gosom/google-maps-scraper (MIT) + Resend free tier + sales plugin | **$297** | **$1,100-$1,500** | $0 | $100 ECHO-attributed |
| 2 | ATLAS | Census CBP + BLS QCEW + OpenStreetMap Overpass (all public-domain/ODbL) | **$148** attributed | **$594** attributed | $0 | $200 ATLAS-attributed |
| 3 | PIXEL | Etsy RSS + FFmpeg + TikTok Content Posting API | **$45-$90** | **$225-$300** | $0 | $50 PIXEL-attributed |

## Per agent: free-tier hard limits

### ECHO free
- **Free winning skill:** gosom/google-maps-scraper (MIT, 3,300+ stars, Docker self-hosted) for scrape + Resend free tier (3,000 emails/mo, 100/day, no credit card) for send + already-installed `sales` plugin's `draft-outreach` and `email-sequence` skills for copy.
- **M1 revenue on free limits:** $297 (one Brewington Digital Starter close).
- **M3 revenue:** $1,100-$1,500 (3-5 active clients cumulative).
- **Monthly cost:** $0 hard.
- **Critical caveat:** **Resend caps at 3,000 emails/month total**, 100/day. At 1,500 prospects x 2 sends = 3,000/mo = exactly hits the ceiling. No third follow-up possible on the same pool in Month 1.
- **Secondary caveat:** no Instantly auto reply-classifier, so Lando spends 30 min/day on manual reply triage. Drops autonomy from 4 (paid) to 3 (free) - clears the >= 3 floor.
- **Unlock paid upgrade at:** ECHO revenue MTD >= $100. First Starter close ($297) triggers the alert.
- **Pitch:** `businesses/foreman/candidates/cockpit-round/echo-pitch-free.md`
- **Research:** `businesses/foreman/candidates/cockpit-round/_research/echo-free.md`

### ATLAS free
- **Free winning skill:** US Census County Business Patterns API (public domain, free API key, no card) for establishment density denominator + BLS QCEW CSV (public domain, no auth) for size-class filter + OpenStreetMap Overpass API (ODbL, commercial use permitted, no auth) for weakness-by-coverage-inversion signal.
- **M1 revenue (attributed lift to ECHO):** $148 (0.5 extra closes vs ECHO baseline).
- **M3 revenue:** $594 cumulative attributed.
- **Monthly cost:** $0 hard.
- **Critical caveat:** **OSM Overpass API rate limits are self-managed and commercial access can be withdrawn per OSMF policy** (low probability at our modest query volume; query monthly, cache locally). Attribution to "OpenStreetMap contributors" required on any externalized map.
- **Secondary caveat:** Census CBP data is ~18 months behind (2024 published in 2026); no rating/review data from the free stack; OSM coverage gaps = ~70% scoring accuracy vs paid DataForSEO's ~95%.
- **Unlock paid upgrade at:** ATLAS attributed revenue MTD >= $200. Two attributed closes clear it.
- **Pitch:** `businesses/foreman/candidates/cockpit-round/atlas-pitch-free.md`
- **Research:** `businesses/foreman/candidates/cockpit-round/_research/atlas-free.md`

### PIXEL free
- **Free winning skill:** Lando's Etsy shop public RSS feed (no auth, no ToS risk on own shop) + FFmpeg (LGPL, already installed) for slideshow compose + TikTok Content Posting API (free, no subscription) for publish.
- **M1 revenue on free limits:** $45-$90 (honest mid-case $90) from Etsy click-through only.
- **M3 revenue:** $225-$300 (TikTok account past algorithm ramp; second surface IG Reels or YouTube Shorts added pending Meta / GCP approvals).
- **Monthly cost:** $0 hard.
- **Critical caveat:** **TikTok Content Posting API requires a 3-7 day manual app review** before first public post. Pre-approval posts are PRIVATE-only. TikTok Creativity Program payouts require 10K followers (~M4+ ramp on a fresh account); until then, revenue is Etsy-click-through only.
- **Secondary caveat:** YouTube Data API requires a credit card on Google Cloud project setup (flagged under Rule 3 - card-to-verify). Skipped as primary; only unlocks if Lando already has a GCP project with card on file for unrelated work.
- **Secondary caveat 2:** Instagram Graph API requires Meta app review (2-4 weeks typical) + Instagram Business/Creator account. Added Month 2 at earliest.
- **Unlock paid upgrade at:** PIXEL revenue MTD >= $50. One Etsy sale at typical AOV clears it.
- **Pitch:** `businesses/foreman/candidates/cockpit-round/pixel-pitch-free.md`
- **Research:** `businesses/foreman/candidates/cockpit-round/_research/pixel-free.md`

## Side-by-side: Free M1 vs Paid M1 (explicit revenue gap)

| Agent | Paid M1 rev | Free M1 rev | Gap | Gap reason |
|-------|-------------|-------------|-----|-----------|
| ECHO | $891 MRR (3 closes) | $297 MRR (1 close) | **-$594/mo** | 83% inbox vs 94%, 2-send vs 4-send cadence, 14-day warmup eats half of M1, no auto reply handling |
| ATLAS | $594 attributed | $148 attributed | **-$446/mo** | ~70% scoring accuracy vs ~95%, no rating/review data, 18-month-lagged Census data, OSM coverage noise |
| PIXEL | $225 combined | $45-$90 | **-$135 to -$180/mo** | 1 surface (TikTok) vs 3+ surfaces, 3-7 day API approval eats week 1, no Creativity Program payouts yet |
| **Total** | **$1,710 M1** | **$490-$535 M1** | **-$1,175 to -$1,220/mo** | |

**Honest take:** The free stack is ~29-31% of the paid stack's Month 1 revenue. This is the expected trade to operate at $0 startup capital. Every free stack self-finances its own paid upgrade on first attribution hit, so the gap closes as soon as ECHO lands its first Starter close.

## Approval checklist for Lando

Before Hank installs anything, Lando confirms each line:

### ECHO free install
- [ ] **Approve Resend free-tier signup** (5 min, no card, `landonbrewington12@gmail.com`, verify brewingtondigital-outbound.com domain with DMARC/SPF/DKIM)
- [ ] **Confirm secondary domain for cold sends** is brewingtondigital-outbound.com (protects main brand domain reputation)
- [ ] **Approve gosom Docker pull** on Codespace / local machine
- [ ] **Accept 30 min/day reply triage budget** during active weeks (30 min/day x 5 days = 2.5 hrs/week Lando time)
- [ ] **Accept 14-day warmup window** where send volume ramps from 10 to 50/day before hitting normal cadence

### ATLAS free install
- [ ] **Approve free Census API key signup** at https://api.census.gov/data/key_signup.html (5 min, email only, no card)
- [ ] **Confirm ATLAS reuses existing ZENITH Census key** if already present (no duplication)
- [ ] **Accept ODbL attribution requirement** on any externalized map (one-line footer "OpenStreetMap contributors")
- [ ] **Accept ~70% scoring accuracy** on free stack vs ~95% on paid DataForSEO (expected tradeoff)

### PIXEL free install
- [ ] **Approve TikTok Developer account creation** (10 min, includes submitting demo video + privacy policy URL for app review)
- [ ] **Accept 3-7 day approval wait** before first public post
- [ ] **Confirm Lando's Etsy shop has public RSS feed available** (default for all Etsy shops; verify shopname)
- [ ] **Decide on Month 2 second surface:** Instagram (requires Meta review, 2-4 weeks) OR YouTube (only if existing GCP project with card on file; flag if not)
- [ ] **Accept TikTok OAuth 60-day refresh cycle** (automated in tick.js but Lando gets an alert when token is about to expire)

### Cross-agent: install order
- [ ] **ECHO first** (fastest revenue path, lowest approval friction)
- [ ] **ATLAS second** (no approvals, pure code + free API key)
- [ ] **PIXEL third** (file TikTok dev app on Day 1, let it bake during ECHO + ATLAS installs)

## Rules honored
- **No subscriptions:** all three stacks have $0 monthly cost
- **No deposits / no minimum spend:** none required
- **No credit card to verify:** Resend/Census/OSM/TikTok all signup without a card. YouTube-for-PIXEL was FLAGGED and dropped as a primary under Rule 3.
- **No 30-day sunset paywall:** Resend free is permanent; Census/BLS are federal public domain; OSM Overpass is permanent; TikTok Content Posting API is permanently free. Mailgun Flex was REJECTED because its flex free converts to pay-as-you-go after 3 months.
- **Commercial use permitted:** confirmed on every LICENSE
- **Autonomy >= 3:** ECHO (3), ATLAS (5), PIXEL (4). All clear the floor.

## If any of the three can't find $0 defensible option
N/A for all three agents. All three have real, verified, free-forever stacks with no hidden paywalls, no cards-to-verify, and no within-30-day sunset.

## Log line for foreman log
Filed separately in `businesses/foreman/log.md` per agent.
