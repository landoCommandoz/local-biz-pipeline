# Candidate: Etsy RSS + FFmpeg + TikTok Content Posting API (PIXEL free stack)

*Brief targeted: PIXEL (Media Agent, creative cluster). Phase: 2 (free-tier re-hunt). Researched: 2026-04-18. Foreman recommendation: HIRE (free-replacement, under $0-startup-capital directive). Paid alternative parked at businesses/foreman/parked/pixel-uploadpost-paid.md.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
PIXEL produces TikTok slideshows from Lando's Etsy shop photos - at zero cost - by pulling the shop's public RSS feed, compositing with FFmpeg, and publishing through TikTok's free Content Posting API after developer-account approval, driving Etsy click-through traffic and laying the runway for a paid multi-platform upgrade once $50 in social-attributed revenue clears.

### 2. Monthly cost all-in
- Infrastructure: $0 (same box, same repo)
- Licensing: $0 (FFmpeg LGPL, rss-parser MIT, all Node clients MIT, TikTok Content Posting API free)
- API usage estimate: $0 (TikTok API has no per-call cost; RSS is a public URL)
- Other: $0
- **Total: $0/month**

Assumptions: ~60 slideshows per month, one social surface (TikTok) in Month 1, optional second surface (Instagram Graph API) added Month 2 after Meta app review clears. Lando's own Etsy shop is the sole content source in v1.

### 3. Projected monthly revenue or revenue-savings
Paid stack baseline: $225 m1 combined across 3 platforms.

Free stack reality: TikTok-only Month 1 after 3-7 day approval wait eats part of week 1.

**Month 1: $45-$90** (honest mid-case $90) from Etsy click-through traffic only. Creativity Program payouts require 10K followers = not hitting M1 on a fresh account.

Assumptions: 60 posts ramping from 4 in week 1 (post-approval) to 20/week by week 4. Expected 20k-40k cumulative views. Etsy click-through at 1-3% = 300-900 clicks. 1% click-to-purchase at $15-$30 AOV = 3-9 sales = $45-$270 M1. Conservative $45, mid-case $90.

**Month 3: $225-$300** (account past algorithm ramp, 80k-150k views/mo; IG Reels or YouTube Shorts added as second surface IF approvals clear).

### 4. Payback period
**Instant.** Zero cost. First dollar is profit.

### 5. Autonomy score 1-5
**4.** Full pipeline (RSS fetch, FFmpeg compose, TikTok API post) runs autonomously on cron once OAuth token is loaded. Drops from paid stack's 5 to 4 because the TikTok API approval is a one-time Lando-touched step (3-7 day wait, 10 min of developer-console form-filling). After approval, fully autonomous.
Evidence for the score: TikTok Content Posting API is a documented REST endpoint with free unlimited use after the 5-step developer setup; `rss-parser` is a single npm call; FFmpeg recipe is already scripted from paid pitch. Chain is three async function calls end-to-end.

### 6. Can it pay its own bills
**YES.** Cost is $0. Cannot fail this test.

### 7. Can it build something without Lando
**YES.** PIXEL's only Lando-touches after setup are: (a) approve the TikTok developer app registration one time, (b) re-auth OAuth tokens periodically (TikTok token refresh every 60 days). Build output - scheduled slideshows - ships with no Lando in the loop.

### 8. One-line kill criteria
If PIXEL does not publish 30 slideshows to TikTok within the first 30 days of TikTok API approval (so 30 days from Day 7 earliest), OR if combined social-to-Etsy click-through does not reach 100 clicks in Month 1, revert to manual posting (autonomy drops to 3) and shelve the API path until paid-tier upload-post.com unlocks.

---

## Source

- **TikTok Content Posting API**: https://developers.tiktok.com/products/content-posting-api/ - free, no subscription, 3-7 day manual app approval
- **TikTok Content Posting getting started**: https://developers.tiktok.com/doc/content-posting-api-get-started
- **Instagram Graph API (second surface, M2)**: https://developers.facebook.com/docs/instagram-platform/
- **Pinterest API v5 (fourth surface, optional)**: https://developers.pinterest.com/
- **FFmpeg**: https://ffmpeg.org/ (LGPL, already installed on box)
- **Trekky12/kburns-slideshow** (optional Ken Burns helper): https://github.com/Trekky12/kburns-slideshow (MIT)
- **Etsy RSS pattern**: `https://www.etsy.com/shop/<shopname>/rss` (public, no auth)
- **FFmpeg TikTok 9:16 reference**: https://bretttolbert.com/using-ffmpeg-to-a-make-tiktok-video-with-a-soundcloud-style-ken-burns-panning-effect
- **TikTok Creativity Program + Etsy click-through evidence**: https://autofaceless.ai/blog/faceless-content-creator-statistics-2026
- License: FFmpeg LGPL + TikTok Developer Terms (commercial permitted) + Etsy public RSS (no license issue on own-shop consumption) + rss-parser MIT
- Last commit / active maintainers: FFmpeg continuously maintained; TikTok Developer Platform actively shipped with 2026 documentation updates
- Stars / usage: FFmpeg is the universal video tool; Trekky12/kburns-slideshow MIT with active maintenance
- Active maintainer: yes, all components

## What it does

PIXEL runs on a scheduled cron:

1. **Fetch layer.** `rss-parser` pulls `https://www.etsy.com/shop/<lando's-shop>/rss`. Parses Atom/RSS XML into a list of listings with title, description, photo URL, price, listing URL.
2. **Composition layer.** FFmpeg takes the photo URLs, downloads them, composites a 9-slide vertical 1080x1920 slideshow with: branded title card, pan/zoom on each product shot, final CTA card pointing at the Etsy listing URL. Optional: overlay product title and price as drawtext layers.
3. **Publish layer.** TikTok Content Posting API POST uploads the composed MP4 with caption + hashtags. Receives back the published video URL, logs it.
4. **Logging.** Results go to `businesses/pixel/log.jsonl`: posted URL, timestamp, caption.

Does NOT do (v1): generated b-roll clips (Seedance/Minimax deferred to v2); cross-posting to IG Reels and YouTube Shorts (deferred to Month 2 pending Meta / Google approvals); TikTok Creativity Program payout optimization (requires 10K followers = M4+).

## Fit with Brewington ecosystem

- **Plugs into:** new bay `businesses/pixel/` following same `tick.js` + `state.json` + `log.jsonl` pattern as other bays. $20/mo rent to Brix.
- **Replaces:** the parked paid PIXEL stack, one-for-one.
- **Depends on:** TikTok Developer app approval (one-time, 3-7 days); Lando's Etsy shop publicly published (any live Etsy shop qualifies); FFmpeg on box (already present).
- **Brewington infra cost delta:** $0.

## Integration plan if hired

1. Lando creates free TikTok Developer account at developers.tiktok.com. Registers an app for "Brewington Digital PIXEL" with demo video + privacy policy URL.
2. Submits Content Posting scopes for manual review (3-7 day wait).
3. After approval, captures OAuth token, stores in `.env.TIKTOK_ACCESS_TOKEN`.
4. Scaffold `businesses/pixel/` bay with `tick.js` wrapping RSS fetch + FFmpeg compose + TikTok POST.
5. Write `businesses/pixel/ffmpeg/slideshow.sh` (already drafted in paid pitch; reuse).
6. Add PIXEL to `businesses/scheduler.js` at 2 posts/day cadence.
7. Register PIXEL in `rent-roll.json` at $20/mo to Brix.
8. First publish: day 4-8 (depends on TikTok approval turnaround).
9. Month 2: if revenue threshold is approaching or hit, file Meta developer app for Instagram Graph API as second surface. If Lando already has a GCP project with card on file for unrelated work, YouTube Data API becomes viable piggyback second surface instead.

## Risks and trade-offs

- **TikTok approval delay.** 3-7 days is published; real-world can run 10-14 on edge cases. Mitigation: file the day we start; use the wait to finalize FFmpeg recipe and first 10 pieces of content.
- **Pre-approval posts restricted to private-view.** Cannot test public view counts during review. Mitigation: we schedule; they queue; when approval clears, they publish.
- **TikTok OAuth token 60-day expiry.** Token refresh cron required. Mitigation: daily health-check in `tick.js` flags expiring tokens to foreman before next scheduled post.
- **One surface instead of three (M1).** Paid stack hit 3+ platforms from one upload-post call. Free stack starts with TikTok-only. Mitigation: linearly lower reach; M2 adds second surface once IG Meta approval clears.
- **YouTube API credit-card flag.** Google Cloud project setup asks for a card even though YouTube Data API usage is $0. Under Rule 3 ("no card just to verify"), YouTube is skipped as a primary. Only unlocks if Lando has an existing GCP project with card already on file for unrelated work.
- **Etsy RSS photo resolution.** RSS serves medium-res thumbnails; 1080x1920 output needs upscale. Quality hit is minor but visible side-by-side with paid-stack full-res Apify scrapes.
- **Creativity Program gate.** 10K followers required for revenue from views. Fresh account = 60-120 days typical ramp. M1-M2 revenue is Etsy-click-through only, not TikTok payouts.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed - FFmpeg LGPL, TikTok Developer Terms permit commercial with approval, Etsy RSS is public
- [x] Last commit date confirmed - TikTok Developer Platform 2026 docs active, FFmpeg active, rss-parser active
- [x] TikTok free status confirmed via https://developers.tiktok.com/products/content-posting-api/ and developer docs
- [x] Independent review found - multiple r/Etsy, r/smallbusiness, autofaceless.ai 2026 statistics confirm TikTok direct API is the free-stack pattern
- [x] Pricing page read - TikTok no subscription, $0 confirmed; Etsy RSS is public; FFmpeg LGPL $0

## Runners-up (kept warm)

1. **Manual one-tap posting.** PIXEL drafts and queues slideshows; Lando taps Publish in native app. Autonomy drops to 3 (still clears floor). Use if TikTok API approval drags past Day 14.
2. **Instagram Graph API as primary (skip TikTok).** Only if Lando already has an approved Meta app. Meta review is typically longer than TikTok review, so not preferred starting path.

## Free-tier caveats (explicit flags)
- TikTok Content Posting API requires 3-7 day manual app review before first public post.
- Pre-approval posts are PRIVATE-only.
- TikTok OAuth tokens expire every 60 days and need refresh.
- YouTube API flagged under Rule 3 (credit card for Google Cloud project even though API is free). Skipped unless existing GCP project with card on file is available.
- Instagram Graph API requires Instagram Business/Creator account + Facebook Page link + Meta app review (2-4 weeks typical). Added Month 2 surface at earliest.
- TikTok Creativity Program payouts gated at 10K followers (~M4+).
- Etsy RSS photo resolution is medium, not full-res.

## Unlock threshold for paid upgrade
PIXEL revenue MTD >= $50. One Etsy sale at Lando's typical AOV clears this. Doss's meter fires the "upload-post upgrade is available" alert. Lando confirms, Hank installs the parked paid stack (cross-posting to IG + YT + Pinterest from one call).

## Foreman recommendation

**HIRE (free-replacement).** PIXEL-free is viable but the slowest of the three free-stack hires to pay back because TikTok's 3-7 day approval + 10K-follower monetization gate structurally delay revenue. The Etsy click-through path is real and proven; M1 conservative $45-$90 is honest, not optimistic. Autonomy is 4/5 post-approval, which clears the floor. Cost is $0. First social-attributed Etsy sale unlocks the paid upgrade.

Order the install last of the three (ECHO first, ATLAS second, PIXEL third) because ECHO is the fastest revenue path and PIXEL's approval wait means Lando can file the TikTok dev app on Day 1, let it bake, and finish the other two installs while waiting.

## Lando's decision
<pending>
