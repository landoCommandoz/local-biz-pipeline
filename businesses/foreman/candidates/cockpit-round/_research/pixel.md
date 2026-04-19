# PIXEL research notes (Media Agent)

*Cluster: creative. Hunter: HANK. Date: 2026-04-18.*

## Mission re-stated

PIXEL generates TikTok slideshows from Etsy product photos, posts on schedule, manages Brewington Digital brand socials. Current framing is Etsy + TikTok. The task asks to evaluate bigger plays: Instagram Reels, YouTube Shorts, image-to-video pipelines, short-form content farms with revenue evidence.

## Six-platform sweep

### 1. GitHub advanced search

- **Remotion** (remotion-dev/remotion): programmatic video in React. 2026 writeups document 50 personalized videos in 15 minutes when paired with Claude Code. Handles TikTok-style word-level captions natively. Integrates with GitHub Actions for scheduled renders. MIT-style license with a company-size fee gate (free for personal and small teams). https://github.com/remotion-dev/remotion
- **FFmpeg**: underlying toolkit, already available on Linux. Good for cheap slideshow composition from Etsy JPGs but no abstraction for captions or posting.

### 2. Claude Code plugin registry / skills marketplace

- No dedicated short-form video skill. Claude Code is not the right harness for rendering; it is the right harness for writing the Remotion component code. Composition: Claude Code writes Remotion templates, Remotion renders, posting API publishes.

### 3. Apify Actor Store

- **Etsy Scraper actors**: multiple options on Apify for harvesting Etsy listing photos + descriptions programmatically. Pay-per-event pricing, cents per listing. Legal as long as we respect Etsy ToS and scrape only public listing data; the planned use is Lando's own shop photos so no ToS issue either way.
- **TikTok Scraper** (clockworks): $0.03/start + $0.004/item. Only relevant for research (trending sound/hashtag harvest), not posting. Scraping is legal for public data per Apify's own guidance; posting is handled separately via TikTok Content Posting API.

### 4. RapidAPI + official APIs

**This is the profitable layer.**

- **Ayrshare API**: 13-15 platforms (TikTok, IG Reels, YouTube Shorts, Pinterest, Reddit, Threads, etc.), $24.99/mo Premium, Node SDK. TikTok video limit raised to 10GB, IG Reels and YouTube Shorts supported natively. https://www.ayrshare.com/pricing
- **upload-post.com**: $16/mo (annual) starts, 11 platforms, unlimited uploads on paid plans, free tier 10/mo. Built-in FFmpeg video editor API for aspect-ratio resize and transcode. Python + JS SDKs. Arguably better value than Ayrshare at this volume. https://www.upload-post.com
- **Buffer API**: effectively dead for developers; Buffer shut down API in 2019, limited beta reopened 2026 but gated behind $99/mo per-user Pro plan. Rejected.
- **TikTok Content Posting API direct**: free from TikTok but requires app approval flow, OAuth per account, and compliance review. Usable but high install complexity; Ayrshare/upload-post wrap this.
- **Replicate Seedance / Minimax Hailuo**: image-to-video generation, ~$0.15-0.40 per 5-second clip. Turns static Etsy shots into motion without a camera. Optional enhancer above slideshows.

### 5. Product Hunt / Gumroad / Indie Hackers

- **Faceless TikTok creator economics (2026)**: top faceless accounts earn $10k-$80k/mo, faceless content is now 38% of new creator monetization ventures. CPM $15-40/1000 views, finance + AI niches at the top. (autofaceless.ai, befreed.ai, markets.financialcontent.com coverage April 2026.)
- **Larry Loop / OpenClaw case**: Ernesto Lopez scaled to $70k+ MRR using automated content farms tied back to product landing pages. (stormy.ai March 2026.)
- **ReelFarm** (SaaS competitor): $29-$99/mo to automate TikTok slideshows. Functional proof that the category has buyers. We would be building in-house what ReelFarm sells.

### 6. Reddit revenue threads

- r/socialmedia, r/SideProject, r/Entrepreneur: repeated pattern of slideshow creators (product shots + trending audio + 6-10 slide arcs) hitting TikTok's Creativity Program payouts around $5-$15 per 1000 qualified views. Revenue floor is real but volume-dependent.
- r/Etsy: slideshow posts linking to Etsy listings produce consistent but modest click-through, typically 1-3% of views convert to Etsy traffic. Works best when the "big play" is moved OFF Etsy onto TikTok Shop directly (projected $20B+ sales 2026, $30B by 2028).

## The bigger play

Etsy-only is leaving money on the table. The tier hierarchy:

1. **Base (installed, this round)**: slideshow from Etsy photo + upload-post.com API to TikTok/IG Reels/YouTube Shorts. Three platforms, one video. 3x surface area, same content cost.
2. **Enhanced (next round)**: Remotion programmatic renderer so every slideshow has captions, motion, branded template. Unlocks the faceless-channel CPM tier.
3. **Stretch (hire of its own)**: Seedance/Minimax image-to-video for the cover clip. Unlocks premium TikTok Shop creator tier.

## Rubric scoring (0-10 each, weighted)

| Candidate | Revenue evidence (35%) | Pipeline fit (25%) | Autonomy (20%) | Install (10%) | Licensing (10%) | Weighted |
|---|---|---|---|---|---|---|
| upload-post.com + Apify Etsy + FFmpeg | 8 (ReelFarm, faceless case studies, TikTok Shop) | 9 (covers 3+ platforms, not 1) | 9 | 9 | 8 | **8.35** |
| Ayrshare alone | 7 | 8 | 9 | 8 | 8 | 7.65 |
| Remotion + posting API | 9 (faceless CPM tier) | 6 (heavier build, later round) | 8 | 5 | 9 | 7.40 |
| Buffer API | 3 (dead for developers) | 4 | 6 | 3 | 6 | 3.95 |

## Winner

**upload-post.com API as the posting layer + Apify Etsy scraper for source material + FFmpeg for composition + Remotion queued as the v2 upgrade.**

upload-post.com beats Ayrshare on price ($16/mo vs $24.99/mo) at the yard's volume, ships unlimited uploads, and has the FFmpeg API built in which saves a whole integration step. Apify pays per event so the Etsy side cost is pennies per listing.

Autonomy is 5 once OAuth tokens are loaded. Content flows on schedule. Lando never touches a post.

## Runners-up

1. Ayrshare (mature, more platforms, but costlier; swap in if upload-post reliability fails)
2. Remotion (queue for round 2 after PIXEL proves base-tier posting; this is where the faceless CPM tier unlocks)
3. Direct TikTok Content Posting API (use only if upload-post goes down for >48h)

## Kill criteria

If PIXEL does not publish 60 slideshows across TikTok + IG Reels + YouTube Shorts in its first 30 days, OR if combined social referral traffic to the Etsy shop does not hit 200 click-throughs in month one, revert to manual posting and kill PIXEL until Remotion v2 is ready.

## Blocker if no

**BLOCKER: requires OAuth token setup for each social account (TikTok, IG, YouTube) and payment of upload-post.com $16/mo.** Apify $5 free credit covers initial Etsy scraping; beyond that needs a card on file. All are Lando-side setup actions, not code blockers.
