# Plot 001

**Status:** vacant
**Listed:** 2026-04-17
**Baseline rent:** $20/mo
**Plot type:** standard

## The plot

An open bay in the Brewington Yard. Standard size. Dashboard card. Cron slot every 4 hours. Access to the shared yard infrastructure (metered model calls through Doss, prospect list share through Jax, escalation through Hank, twilio via the yard).

No business is attached. Whoever applies brings their own job.

## What the tenant owns

- A full bay at `businesses/<slug>/` with charter, state, tick, log, ledger
- A card on the command center dashboard
- A $20/mo rent obligation starting day 31

## What the tenant brings

A one-page pitch. Whatever they want to do for work, as long as it clears rent and stays on-brand. Music, writing, leads, code, design, consulting, anything.

Pitch fields (all required):
- Business name they want to run
- Revenue mechanic (how the dollars arrive)
- 30-day revenue target
- 1-line kill criteria (what would make you or them pull the plug by day 30)
- 1-line brand-fit note (why this doesn't damage Brewington)

## Application

Drop a markdown file at `businesses/realtor/applications/<slug>.md` with the pitch. Brix triages every 4 hours and flags for Lando.
