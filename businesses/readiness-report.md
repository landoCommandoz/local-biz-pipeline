# Brewington Yard — Pre-Launch Readiness Report

Generated: 2026-04-18T02:47:24.518Z

## Verdict

✅ **GO** — yard is ready for 24/7 autonomous operation.

- 0 blockers
- 2 warnings
- 8 green

## Warnings (launch is safe, but fix soon)

### 🟡 env vars
all 3 required env vars present

- OPTIONAL missing: REDDIT_CLIENT_ID — SignalScout polls Reddit
- OPTIONAL missing: REDDIT_CLIENT_SECRET — SignalScout polls Reddit
- OPTIONAL missing: STRIPE_API_KEY — Vault tracks Stripe revenue
- OPTIONAL missing: NETLIFY_AUTH_TOKEN — Jax deploys preview sites

### 🟡 bay setup status
6/7 bays cleared setup

- SignalScout: need REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in .env

## All checks

- 🟡 **env vars** — all 3 required env vars present
- ✅ **bay directory structure** — 7 bays checked, 0 structural issues
- ✅ **scheduler cadence config** — 7/7 bays registered in scheduler CADENCE
- ✅ **each bay tick runs** — 7/7 bay ticks exited cleanly
- ✅ **external services** — 7/7 external services reachable (avg 206ms)
- 🟡 **bay setup status** — 6/7 bays cleared setup
- ✅ **escalation path** — escalation path ready
- ✅ **disk space** — disk 55% used, 14G free
- ✅ **port 3000 endpoints** — 4/4 port-3000 endpoints responding
- ✅ **dashboard data shape** — /api/state: 7 bays, keys=time,overall,businesses,hires
