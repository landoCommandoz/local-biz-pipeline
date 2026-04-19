# TikTok Developer App — Filing Checklist

Lando executes TODAY (2026-04-18). The 3–7 day review window is why this goes first; ECHO and ATLAS install in parallel while TikTok bakes.

## Prerequisites

- **Brewington Digital privacy policy URL.** TikTok requires one. If it doesn't exist yet, this is a blocker — file a 1-page privacy policy at `brewingtondigital.com/privacy` before starting.
- **Etsy shop slug.** Found in your Etsy shop URL: `https://www.etsy.com/shop/<THIS-PART>`. Write it on a sticky note; you'll need it in Step 4.
- **A 15-second demo video** showing the product of your app (the slideshow compose pipeline). You can screen-capture `node businesses/pixel/compose/template.sh --help` + one successful compose + the output MP4 played. Upload to YouTube unlisted or keep as a file for the app form.

## Step 1 — Create TikTok Developer account

- Go to https://developers.tiktok.com/
- Click **Manage apps** → sign in with Lando's personal TikTok account (the one that will own the brand page)
- Accept the Developer Terms of Service
- Organization name: **Brewington Digital**
- Contact email: `landonbrewington12@gmail.com`

## Step 2 — Register the app

- **App name**: `Brewington Digital PIXEL`
- **Description**: "Auto-publishes slideshow-style short-form videos composed from owned Etsy shop listing photos, to drive Etsy traffic. Uses Content Posting API. Internal/owned brand content only."
- **Category**: Content creation / Marketing
- **Platform**: Web server
- **Redirect URI**: use `http://localhost:3000/oauth/tiktok/callback` for development; later add a production URL under the brewingtondigital.com domain if PIXEL moves to a hosted box.

## Step 3 — Submit Content Posting API scopes

- Product: **Content Posting API**
- Required scopes:
  - `user.info.basic`
  - `video.upload`
  - `video.publish`
- Demo video: upload the 15-second clip from prerequisites
- Privacy policy URL: `https://brewingtondigital.com/privacy`
- Purpose of use: "Publishing owned Etsy shop product slideshows to our own Brewington Digital TikTok account"

Click **Submit for review**. TikTok will email within 3–7 business days.

## Step 4 — Populate the bay's state

While waiting for TikTok, populate two fields in `businesses/pixel/state.json`:

- `tiktok_app_filed_at`: set to today's ISO (`2026-04-18T14:15:00Z` or similar)
- `etsy_shop_slug`: your shop slug from prerequisites

Example:

```json
{
  "tiktok_app_filed_at": "2026-04-18T14:15:00Z",
  "etsy_shop_slug": "brewingtondigital"
}
```

## Step 5 — When approval email arrives

1. Copy the Client Key and Client Secret from the TikTok Developer console
2. Paste into `.env`:

```
TIKTOK_CLIENT_KEY=awxxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Run the one-time OAuth consent flow to obtain access + refresh tokens:

```bash
# PIXEL will expose a helper once the publish layer is wired. Until then:
# Visit https://www.tiktok.com/v2/auth/authorize/?client_key=...&response_type=code&scope=user.info.basic,video.upload,video.publish&redirect_uri=http://localhost:3000/oauth/tiktok/callback
# Exchange the returned code for an access token via the TikTok /v2/oauth/token/ endpoint.
```

4. Paste tokens into `.env`:

```
TIKTOK_ACCESS_TOKEN=act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TIKTOK_REFRESH_TOKEN=rft.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. In `state.json`, flip `tiktok_app_approved` to `true` and set `oauth_refresh_expires_at` to now + 60 days.

6. Next tick, PIXEL transitions `awaiting_approval` → `active` and starts public posting at up to 2/day.

## Done-check

- [ ] TikTok developer account created
- [ ] App `Brewington Digital PIXEL` registered
- [ ] Content Posting scopes submitted for review with demo video + privacy policy URL
- [ ] `tiktok_app_filed_at` set in `state.json`
- [ ] `etsy_shop_slug` set in `state.json`
- [ ] (Post-approval) tokens in `.env`, `tiktok_app_approved` flipped, `oauth_refresh_expires_at` stamped
- [ ] Manual tick shows `bay_status` = `active`

## If review is rejected

Common rejection reasons:
- Demo video doesn't clearly show the app's use of the API
- Privacy policy URL 404s or doesn't mention the TikTok data processing
- App description too vague

Fix the flagged issue and re-submit. Typical second review: 2–4 days.
