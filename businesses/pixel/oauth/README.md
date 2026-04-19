# PIXEL oauth/ (TikTok token lifecycle)

TikTok access tokens expire every 60 days. Refresh tokens last ~1 year. The bay must refresh automatically 7 days before expiry.

## Token fields in `state.json`

- `oauth_refresh_expires_at` — ISO timestamp of access-token expiry
- (Refresh token itself lives in `.env` as `TIKTOK_REFRESH_TOKEN`; never in `state.json`)

## Refresh flow (implemented in tick.js TODO block)

```
POST https://open.tiktokapis.com/v2/oauth/token/
  client_key=$TIKTOK_CLIENT_KEY
  client_secret=$TIKTOK_CLIENT_SECRET
  grant_type=refresh_token
  refresh_token=$TIKTOK_REFRESH_TOKEN
```

Response contains a new `access_token`, new `refresh_token`, and `expires_in` (seconds). Rotate both into `.env` and update `state.oauth_refresh_expires_at`.

## When refresh fails

If the refresh token is invalidated (rare — usually from 12+ months of disuse or Lando revoking the app), the bay cannot recover without human re-consent:

1. tick.js logs `OAuth expired — escalating for re-consent`
2. Escalates via twilio-whatsapp with a direct link to Lando's TikTok Developer console
3. Lando re-authorizes the app (10 minutes)
4. Paste new `TIKTOK_ACCESS_TOKEN` + `TIKTOK_REFRESH_TOKEN` into `.env`

## Safety: never log tokens

Any log line that includes a token value is a bug. Redact before logging. `../lib/logger.js` does not auto-redact; caller responsibility.
