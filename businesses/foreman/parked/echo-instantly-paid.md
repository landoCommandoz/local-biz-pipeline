# Parked: ECHO paid stack (Instantly.ai)

*Parked 2026-04-18 by Lando directive. Zero-cost floor. Unparks automatically when ECHO clears earned revenue threshold.*

## Original pitch
- Path: `businesses/foreman/candidates/cockpit-round/echo-pitch.md`
- Skill: Apify Google Maps Scraper + Instantly.ai Growth ($47/mo)
- Month-1 revenue projection on paid stack: $891 MRR
- Total cost: $52/mo

## Why parked
- Requires Instantly.ai $47/mo subscription
- Requires OAuth on sender mailboxes
- Lando has $0 startup capital. All paid skills wait until earned revenue covers them.

## Unlock threshold
- **ECHO must earn $100 in client revenue (one Brewington Digital Starter close at one-third commission, or any direct attribution).**
- When Doss's meter shows ECHO revenue >= $100, fire alert: "ECHO Instantly upgrade is available."
- Lando confirms, then Hank installs.

## Free-tier replacement
- Phase 2 re-hunt by Hank in progress
- See `businesses/foreman/candidates/cockpit-round/FREE-REPLACEMENT-PITCHES.md` (filed when Phase 2 completes)
- Conservative same-day fallback: free Apify tier (low monthly limit) + Resend free tier (3,000 emails/mo) or Mailgun free flex (100/day)

## Revisit at
`echo.revenue_mtd >= 100`
