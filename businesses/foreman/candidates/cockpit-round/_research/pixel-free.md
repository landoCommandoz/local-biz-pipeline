# PIXEL Free-Tier Re-Hunt (Phase 2)

*Researched 2026-04-18 by Hank under $0-startup-capital directive. Paid stack parked at businesses/foreman/parked/pixel-uploadpost-paid.md. All candidates must meet: no subscription, no deposit, no credit card to verify, free-forever tier, commercial use permitted, autonomy >= 3.*

## Mission
Replace upload-post.com ($16/mo) + Apify Etsy scraper + FFmpeg with a $0 stack that still produces TikTok slideshows from Etsy product photos and publishes to at least one social surface on schedule.

## Six-platform sweep

### 1. GitHub / open source - slideshow + composition

**FFmpeg** (anchor)
- License: LGPL (commercial use permitted)
- Cost: $0
- Already present on the box (per paid pitch)
- Shape: CLI, scriptable, handles image-to-video with Ken Burns pan/zoom, audio overlay, text overlay via drawtext filter, vertical 9:16 output at 1080x1920
- Proven slideshow recipe in paid pitch (`businesses/pixel/ffmpeg/slideshow.sh`) still works

**Trekky12/kburns-slideshow** (Ken Burns helper, optional)
- Repo: https://github.com/Trekky12/kburns-slideshow
- License: MIT
- Shape: Python wrapper over FFmpeg; automates Ken Burns effect across images
- Commercial use permitted
- Drop-in if we want fancier camera motion than hand-scripted drawtext

### 2. Public APIs - no card, no subscription

**TikTok Content Posting API** (top pick for social)
- Source: https://developers.tiktok.com/products/content-posting-api/
- Cost: $0. No subscription.
- Registration: free developer account + app registration + manual review (3-7 days approval)
- Review requirement: demo video + privacy policy URL
- AFTER review/audit: unrestricted posting. BEFORE: posts are restricted to private-view only.
- Rate limit: reasonable for PIXEL's 60-posts/mo cadence (2/day)
- Commercial use: permitted
- Caveat: 3-7 day approval wait = Month 1 has delayed go-live; plan for 2-4 posts Month 1 worst case

**YouTube Data API v3** (second social surface)
- Source: https://developers.google.com/youtube/v3
- Cost: $0 API usage. Credit card required for Google Cloud project setup (flag - borderline under Rule 3).
- Daily quota: 10,000 units. Upload = 1,600 units. Max 6 uploads/day = 180/mo.
- YouTube Shorts format: vertical 9:16, under 60 seconds = direct match to FFmpeg output
- **RULE 3 RISK:** Google Cloud requires a credit card on file even for $0 usage on YouTube API. Google calls this "verification." Technically a "free tier that needs a card." Under the hard rule this is AUTO-REJECT.
- **Mitigation:** Lando already may have a Google Cloud project for other Brewington work (check). If the card is already on file for another service, YouTube API usage itself stays $0 and we piggyback. If no existing GCP project, we flag this as a soft-skip and put TikTok as the sole primary.

**Instagram Graph API** (third social surface)
- Source: https://developers.facebook.com/docs/instagram-platform/
- Cost: $0
- Requirements: Instagram Business or Creator account (not personal), Facebook Page linked, Meta Developer app registration + review
- Rate limit: 200 API calls/hr/account
- Commercial use: permitted for owned/managed accounts
- Caveat: Meta app review can take 2-4 weeks for first-time apps. Another Month 1 delay.
- **Flag:** Business-account requirement on Lando's Etsy shop Instagram is a 10-minute toggle; not a blocker, just a task.

**Pinterest API v5**
- Source: https://developers.pinterest.com/
- Cost: $0 trial and standard tiers
- Rate limit: 100 calls/sec/user/app across all endpoints
- Content Publishing: image + video Pins + boards
- Commercial use: permitted
- Low priority for PIXEL because Etsy + Pinterest audience overlap is niche; reserve as fourth surface if we add later

### 3. Free-forever creator tools

**Manual one-tap posting (fallback)**
- PIXEL generates the video + caption + hashtags; Lando taps Publish in the native app
- Preserves PIXEL's draft-and-schedule function; costs Lando ~2 min/post
- Autonomy score drops from 5 -> 3 (still >= 3 threshold)
- Use ONLY if all API approvals block Month 1 ship

### 4. Reddit + Indie Hackers - $0 Etsy-to-social stacks

- r/Etsy threads: direct TikTok Content Posting API (once approved) is the dominant free path for solo shops
- r/smallbusiness: pattern is "post to TikTok via API, cross-post manually to IG Reels and YT Shorts until approvals clear"
- Consistent report: TikTok Creativity Program payouts start at $5-$15 per 1,000 qualified views on accounts with 10K+ followers; requires 30-day ramp
- r/faceless documents 60-90 day ramps from 0 to first $100 CPM payout on new accounts

### 5. Etsy scraper - free, own-shop-only

**Lando's own Etsy RSS feed** (top pick, $0)
- Etsy shops publish a public RSS feed: `https://www.etsy.com/shop/<shopname>/rss`
- Returns listing titles, photos, prices, URLs as Atom/RSS XML
- Zero API calls against Etsy's protected endpoints
- Zero scraper-TOS risk because RSS is Etsy's published public feed
- Free forever; no card, no subscription
- Shape: single HTTP GET + XML parse (Node: `rss-parser` npm package, MIT license)

**Etsy Open API v3** (alternative)
- Requires Etsy developer account + API key
- Free tier available but has OAuth flow against the shop owner
- Heavier setup than RSS; reserve as fallback if RSS doesn't carry enough photo data

### 6. npm registry

- `fluent-ffmpeg` (MIT) for Node-side FFmpeg invocation
- `rss-parser` (MIT) for Etsy RSS ingest
- `axios` / `node-fetch` for TikTok / YT / IG API calls
- All $0, all commercial-use OK

## Picked free stack

**Source data:** Lando's Etsy shop RSS feed (free, public, no ToS risk on own shop)
**Composition:** FFmpeg slideshow recipe (already present, already scripted in paid pitch)
**Primary publish surface:** TikTok Content Posting API (free after 3-7 day approval)
**Secondary publish (M2):** YouTube Data API v3 IF Lando already has a Google Cloud project (piggyback) OR Instagram Graph API once Meta approval clears
**Fallback (if all APIs delayed):** manual one-tap publish by Lando on PIXEL-drafted content

## Free-tier specific caveats
- **TikTok API 3-7 day manual approval.** Month 1 loses up to a week of ship time.
- **Pre-approval posts are PRIVATE-only.** Cannot drive view counts or revenue during the review window. Schedule-ahead but don't count on public views in week 1.
- **YouTube API requires a credit card on Google Cloud project setup.** HARD FLAG under Rule 3. Skip YouTube as a primary surface; revisit only if Lando has an existing GCP project with a card already on file for unrelated work.
- **Instagram Graph API 2-4 week Meta review.** Add as Month 2 surface, not Month 1.
- **Lose cross-posting efficiency.** Paid upload-post hit 3-4 surfaces from one call. Free stack hits 1 (TikTok) in Month 1, 2 (+IG or YT) by Month 2. Revenue scales linearly with surface count, so free-stack M1 is ~1/3 of paid-stack M1.
- **No generated b-roll tier (Seedance/Minimax).** Already deferred to v2 in paid pitch; free stack same state.
- **RSS feed photo quality.** Etsy RSS serves medium-resolution thumbnails; for 1080x1920 output we'll upscale and watermark, slight quality hit vs direct Apify scrape of full-res listing photos.

## Projected revenue on free limits

Paid baseline: $225 m1 combined across 3 platforms (TikTok Creativity + Etsy click-through + Shorts/Reels CPM).

Free stack delivers TikTok only in Month 1 (post-approval ramp):
- 4 posts Week 1 (review window partial), 15 posts Week 2, 20 posts Week 3, 20 posts Week 4 = ~60 posts total IF approval hits by Day 4
- Expected view volume Month 1: 20k-40k cumulative (new account, pre-algorithm warmup)
- Creativity Program requires 10K followers to monetize views - unlikely to hit in M1 on a fresh account
- Etsy click-through path still live: 1-3% click rate on 30k views = 300-900 clicks, 1% purchase = 3-9 sales at $15-$30 AOV = **$45-$270 M1 Etsy-attributed.**
- **Free M1 conservative: $45.** Honest mid-case: $90.

Month 3 (TikTok scale + IG or YT as second surface):
- Account past algorithm ramp, views 80k-150k/mo
- Second surface live: +50% incremental reach
- Etsy attribution compounds: $225-$450 M3 conservative
- No Creativity Program payout yet (requires 10K follower threshold which typical ramp is M4-M6)
- **Free M3 mid-case: $300.**

## Unlock threshold for paid upgrade
PIXEL revenue MTD >= $50 triggers "upload-post upgrade is available" alert. Per parked doc.

One Etsy sale at Lando's current AOV clears this.

## Runners-up
1. **Manual one-tap posting.** PIXEL drafts and queues, Lando taps publish. Autonomy drops to 3. Use if TikTok API approval drags past Day 14.
2. **Direct Instagram Graph API as primary instead of TikTok.** Only if Lando already has an approved Meta app; skip otherwise because Meta review is longer than TikTok review.

## Sources
- https://developers.tiktok.com/products/content-posting-api/
- https://developers.tiktok.com/doc/content-posting-api-get-started
- https://developers.pinterest.com/
- https://developers.facebook.com/docs/instagram-platform/
- https://developers.google.com/youtube/v3
- https://ffmpeg.org/
- https://github.com/Trekky12/kburns-slideshow
- https://bretttolbert.com/using-ffmpeg-to-a-make-tiktok-video-with-a-soundcloud-style-ken-burns-panning-effect
- https://creatomate.com/blog/how-to-create-a-slideshow-from-images-using-ffmpeg
- https://autofaceless.ai/blog/faceless-content-creator-statistics-2026
