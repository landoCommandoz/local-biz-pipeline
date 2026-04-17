# 24/7 Deploy Plan

*Version: 0.1. Draft. Updated monthly by paymaster's research tick.*

## Goal
Run every agent on its declared cadence 24/7 once Lando moves the yard off the dev codespace port to a production host.

## Research candidates (to be evaluated)
- Netlify Scheduled Functions (cron-style, free tier limits apply)
- Netlify Background Functions (longer-running, different limits)
- Netlify Blobs for persistent state across invocations
- Fly.io or Railway for an always-on Node process running the Croner scheduler in-process
- A cheap VPS (Hetzner, DigitalOcean) with pm2 supervising scheduler.js
- Cloudflare Workers + Cron Triggers

## Evaluation criteria
- Cold-start impact on tick latency
- Free-tier ceiling (ticks / month, compute-seconds)
- Persistence model (how do state.json and ledger.json survive?)
- Deploy ergonomics (git push vs manual)
- Monthly all-in cost at Brewington scale

## Current recommendation
TBD. First monthly research pass runs the first time paymaster ticks in research mode.

## Change log
- 2026-04-17: seeded by paymaster init tick.
