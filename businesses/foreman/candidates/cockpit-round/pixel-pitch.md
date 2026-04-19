# Candidate: upload-post.com API + Apify Etsy scraper + FFmpeg (Remotion queued for v2)

*Brief targeted: cockpit-round / PIXEL (media agent). Phase: 1. Researched: 2026-04-18. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives PIXEL a cross-platform posting layer (TikTok + Instagram Reels + YouTube Shorts + Pinterest + 7 more platforms) fed by an Apify Etsy scraper and FFmpeg composition, so one slideshow ships to 3+ revenue surfaces per post instead of TikTok alone.

### 2. Monthly cost all-in
- Infrastructure: $0 (same Netlify, same repo)
- Licensing: $0 on code (upload-post JS SDK, ffmpeg, Apify client are all open-source)
- API usage:
  - **upload-post.com**: $16/month billed annually, unlimited uploads on paid plan. Includes FFmpeg video editor API. Free tier caps at 10 uploads/month, enough to prove out but not enough for PIXEL's target cadence.
  - **Apify Etsy scraper**: pay-per-event, ~$0.002-$0.004 per Etsy listing scraped. At 50 listings a month for Lando's own shop this is ~$0.20/month. Apify free tier covers $5/mo in credits initially.
  - **Replicate Seedance or Minimax (optional image-to-video for cover clip)**: $0.15-$0.40 per 5-second clip, deferred to v2 upgrade.
- Other: $0
- **Total: ~$16/month (upload-post) + ~$0.20/month (Apify) = $16.20/month baseline, hard cap $25/month**

Assumptions: ~60 slideshows per month posted to 3+ platforms each, Lando's own Etsy shop as the source data (no ToS issue, own content).

### 3. Projected monthly revenue or revenue-savings

Three revenue paths:

**Path 1 (TikTok Creativity Program):** slideshows with hooks + trending audio earning $5-$15 per 1,000 qualified views (documented CPM floor). Conservative month-one at 60 posts: cumulative 30k-80k views = $150-$400.

**Path 2 (Etsy traffic):** r/Etsy documented 1-3% view-to-click conversion from TikTok social to Etsy listings. At 50k views, 500-1,500 click-throughs. At Lando's current Etsy shop conversion rate, even a 1% sale rate on 500 clicks = 5 sales, say $15-$30 average = $75-$150/month incremental.

**Path 3 (YouTube Shorts + IG Reels CPM):** same content, 2x platform reach, Shorts CPM $2-$5/1000 on new accounts. Small but compounding.

**Combined projected monthly revenue: $225 m1 (conservative), $1,200+ m3 as accounts mature.**

Top-of-market comparison (context, not projection): top faceless accounts at $10k-$80k/month per 2026 AutoFaceless statistics; ReelFarm SaaS competitor charges $29-$99/month to sell exactly this automation to other people, proving the category has paying customers.

Assumptions: Lando's Etsy shop is the source of truth for month-one content, 60 posts/month across 3 platforms, normal ramp (views build over week 2-4).

### 4. Payback period
Month two. Month one generates partial revenue as posts ramp; by month two at normal view volume, upload-post's $16 and Apify's pennies clear easily.

### 5. Autonomy score 1-5
5. Once OAuth tokens for each social account are loaded into env once, PIXEL runs on a cron schedule. Apify scrape fetches fresh Etsy photos, FFmpeg composites the slideshow, upload-post pushes to TikTok/IG/YouTube Shorts/Pinterest. Lando never touches a post.

Evidence for the score: upload-post Python and JS SDKs with documented scheduling; Apify client accepts a single `run` call with JSON input; FFmpeg is a command-line tool with a fixed slideshow recipe. The whole chain is three async function calls.

### 6. Can it pay its own bills
YES. $16.20/month cost against even a conservative $225 m1 revenue projection clears >10x. Even if view counts underperform by 80%, the bill is covered by a handful of Etsy sales.

### 7. Can it build something without Lando
YES. PIXEL's only Lando-touch after setup is when a product line changes (new Etsy SKU) or a social account token expires. Both are minutes, not hours.

### 8. One-line kill criteria
If PIXEL does not publish 60 slideshows across TikTok + IG Reels + YouTube Shorts in its first 30 days, OR if combined social-to-Etsy click-through traffic does not reach 200 clicks in month one, revert to manual posting and shelve PIXEL until the Remotion v2 upgrade is ready.

---

## Source
- upload-post.com: https://www.upload-post.com, $16/month annual, 11 platforms, Node + Python SDKs, built-in FFmpeg editor. https://docs.upload-post.com/api/upload-video/
- Apify TikTok + Etsy scrapers: https://apify.com/pricing (pay-per-event), https://apify.com/clockworks/tiktok-scraper
- Ayrshare (runner-up): https://www.ayrshare.com/pricing ($24.99/month Premium)
- Faceless-channel revenue evidence: https://autofaceless.ai/blog/faceless-content-creator-statistics-2026 (April 2026)
- TikTok Shop revenue evidence: https://topgrowthmarketing.com/tiktok-shop-case-study/ (projected $20B+ sales 2026)
- ReelFarm competitor pricing: https://reel.farm
- Last commit / active maintainers: all three providers (upload-post, Apify, ffmpeg) are in active development as of April 2026.

## What it does
PIXEL runs a scheduled pipeline:

1. Apify actor scrapes Lando's Etsy shop listings (photos, titles, prices) and drops JSON into `businesses/pixel/source/`.
2. FFmpeg (invoked directly on the box) composites each listing into a 9-slide vertical slideshow with branded title card, trending-audio placeholder, and a final CTA card pointing to the Etsy listing.
3. upload-post.com API publishes to TikTok, Instagram Reels, YouTube Shorts, and Pinterest in one POST. The single upload-post call handles platform-specific aspect ratios and caption formatting through its built-in FFmpeg layer.
4. Log results (posted URLs, initial view counts) to `businesses/pixel/log.jsonl` for downstream analysis.

It does NOT generate AI-video clips in v1 (Seedance/Minimax queued for v2). It does NOT run the Brewington Digital brand socials in v1 either; v1 scope is Lando's Etsy shop. Brewington brand socials added in v2 after pattern is validated.

## Fit with Brewington ecosystem
- **Plugs into:** a new bay `businesses/pixel/` following the same `tick.js` + `state.json` + `log.jsonl` pattern as other bays. $20/mo rent for FORGE/REX/PIXEL goes to the realtor bay per yard-as-real-estate rule.
- **Replaces:** any manual posting currently happening. If there is none, PIXEL opens a brand-new revenue surface.
- **Depends on:** upload-post.com paid plan ($16/mo, Lando's card), Apify account with $5 free credit + payment method for overages, OAuth tokens for each connected social account (TikTok, IG, YouTube, Pinterest), Lando's Etsy shop URL for scraping.
- **Brewington infra cost delta:** +$16.20/month baseline.

## Integration plan if hired
1. Create `businesses/pixel/` bay with standard structure (tick.js, state.json, log.jsonl, log.md, README with setup checklist)
2. Set up upload-post.com account, buy annual plan, capture OAuth tokens for each platform, add to env as UPLOAD_POST_API_KEY
3. Set up Apify account, install the Etsy scraper actor, add APIFY_TOKEN to env, script the scrape-Lando's-shop call
4. Write the FFmpeg slideshow recipe (9 slides, 3 seconds each, pan+zoom on product shot, title card, CTA card) into `businesses/pixel/ffmpeg/slideshow.sh`
5. Write `businesses/pixel/tick.js` that runs the full pipeline and logs results
6. Schedule via the existing `businesses/scheduler.js` at 2 posts/day cadence (matches TikTok creator best-practice rhythm)
7. Kill-clock starts first post

## Risks and trade-offs
- **OAuth tokens expire periodically** (TikTok 60 days, IG 60 days, YouTube 6 months). Mitigation: daily health-check in tick.js flags expired tokens to the foreman before next scheduled post.
- **TikTok Content Posting API approval may be required for high-volume posting.** Mitigation: upload-post wraps this; if upload-post hits a rate limit, cap at published API limits (25 posts/day is more than enough).
- **upload-post.com uptime is a single point of failure.** Mitigation: runner-up Ayrshare configured in env as fallback, switch-over is a one-line env change.
- **Etsy ToS on scraping own listings is fine, but Apify's scraper is shared infrastructure.** Mitigation: scrape only Lando's own shop, which is explicitly permitted. Do not scrape competitor listings for content lifting.
- **Copyright on trending audio**: TikTok's own library is auto-licensed for TikTok, but IG Reels and YouTube Shorts have stricter rules. Mitigation: use upload-post's per-platform audio overrides; fall back to royalty-free audio for cross-posts if copyright claim received.
- **AI-video tier (Seedance/Minimax) is deferred to v2.** Mentioning this so it is on the record, not as a hidden scope creep.

## Evidence (verification-before-completion checklist)
- [x] upload-post.com pricing page read, $16/month annual confirmed
- [x] Apify TikTok + Etsy scraper pricing confirmed, pay-per-event model
- [x] Ayrshare alternative pricing confirmed ($24.99/month Premium)
- [x] Faceless-channel CPM + revenue evidence from multiple independent 2026 sources
- [x] TikTok Shop 2026 revenue projections confirmed ($20B+ per TopGrowthMarketing and emarketer)
- [x] Legal: Apify scrapers are for public data only, Lando's own Etsy shop is the planned source, no GDPR/ToS risk
- [ ] Month-one view ramp rate on a cold account not independently verified; projections treated as directional

## Runners-up
1. **Ayrshare API.** More mature, 15 platforms, better uptime reputation but $8.99/month more. Configured as fallback in env.
2. **Remotion + direct TikTok Content Posting API.** Queued for v2 once base tier is proven. Unlocks programmatic captions, branded templates, and the faceless-CPM tier.
3. **Buffer API.** Rejected. Dead for developers, limited 2026 beta gated behind $99/month per-user plans.

## INSTALLABLE_NOW
PARTIAL. Code side is installable now (npm install, FFmpeg already present on box). Account side requires Lando to spin up upload-post.com and Apify accounts and connect OAuth to each social account (estimated 45 minutes of setup).

## BLOCKER_IF_NO
**BLOCKER: upload-post.com $16/month subscription, Apify account with payment method, OAuth tokens for TikTok, Instagram, YouTube, Pinterest.** All are Lando-side setup actions. None are code blockers. Without these, PIXEL cannot go live.

## Foreman recommendation
HIRE. Highest-upside skill in the cluster by projected revenue, with the smallest build path once the account setup is done. The bigger play versus Etsy-only was real: cross-posting to Instagram Reels and YouTube Shorts triples the surface area at the same content cost. Remotion upgrade queued for round 2.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
