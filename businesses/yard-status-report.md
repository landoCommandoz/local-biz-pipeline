# Yard Status Report

Generated: 2026-04-18T02:11:50.081Z

## Summary

- **6 / 7** bays have real work running
- **0** are ticking but not yet doing their v9 role
- **1** are blocked on credentials or setup

## Per-Bay Status

### Jax (builder)
- **V9 role label:** The Builder
- **Actual tick logic:** site-rebuild + outreach
- **Role mismatch:** ⚠️  dashboard says "The Builder", tick runs "site-rebuild + outreach"
- **Has a real job:** ACTIVE (designer runs + internal builds)
- **Mode / status:** `internal_build` / `filed`
- **Last tick:** 0.3h ago
- **Latest activity:** internal build complete: command-center-redesign-v11 output filed at businesses/public/concepts/concept-v11.html
- **MTD income:** $0 · **MTD cost:** $0

### Hank (foreman)
- **V9 role label:** The Hustler
- **Actual tick logic:** recruiter (hires agents and tools)
- **Role mismatch:** ⚠️  dashboard says "The Hustler", tick runs "recruiter (hires agents and tools)"
- **Has a real job:** ACTIVE (4 hunts filed, 10 prospects in Hustler queue)
- **Mode / status:** `active_hiring` / `hunting`
- **Last tick:** 2.2h ago
- **Latest activity:** Most recent hunt: designer-replacement
- **MTD income:** $0 · **MTD cost:** $0

### Doss (paymaster)
- **V9 role label:** The Guardian
- **Actual tick logic:** ledger + sales import
- **Role mismatch:** ⚠️  dashboard says "The Guardian", tick runs "ledger + sales import"
- **Has a real job:** ACTIVE (Guardian: 0 threats, vault locked)
- **Mode / status:** `live_meter` / `ready`
- **Last tick:** 0h ago
- **Latest activity:** last scan 2026-04-18T02:11:14.583Z
- **MTD income:** $0 · **MTD cost:** $0

### Brix (realtor)
- **V9 role label:** The System Builder
- **Actual tick logic:** rent roll + listings
- **Role mismatch:** ⚠️  dashboard says "The System Builder", tick runs "rent roll + listings"
- **Has a real job:** ACTIVE (System Builder: 7/7 systems up, 171ms avg) + 4 tenants
- **Mode / status:** `listing` / `active`
- **Last tick:** 0h ago
- **Latest activity:** all systems green
- **MTD income:** $0 · **MTD cost:** $0

### Vega (scout)
- **V9 role label:** The Analyst
- **Actual tick logic:** prospect lead refresh
- **Role mismatch:** ⚠️  dashboard says "The Analyst", tick runs "prospect lead refresh"
- **Has a real job:** ACTIVE (Analyst: MRR $0, 4 clients, burn $0/day)
- **Mode / status:** `live_refresh` / `live`
- **Last tick:** 0h ago
- **Latest activity:** break_even=true · last report 2026-04-18T02:11:14.481Z
- **MTD income:** $0 · **MTD cost:** $0

### SignalScout (signalscout)
- **V9 role label:** The Researcher
- **Actual tick logic:** Reddit draft-queue watcher
- **Role mismatch:** ⚠️  dashboard says "The Researcher", tick runs "Reddit draft-queue watcher"
- **Has a real job:** BLOCKED (awaiting Reddit creds)
- **Mode / status:** `dry_run` / `awaiting_lando_setup`
- **Last tick:** 0.2h ago
- **Blocked on:** need REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in .env
- **Latest activity:** dry_run tick: queue_depth=0, awaiting Lando eyeball before live
- **MTD income:** $0 · **MTD cost:** $0

### Vault (vault)
- **V9 role label:** The Treasurer
- **Actual tick logic:** Itch.io asset monetization
- **Role mismatch:** ⚠️  dashboard says "The Treasurer", tick runs "Itch.io asset monetization"
- **Has a real job:** ACTIVE (1 pitches drafted, 1 listings live)
- **Mode / status:** `dry_run` / `listing_published_draft`
- **Last tick:** 1.4h ago
- **Latest activity:** Itch listing: https://brewingtondigital.itch.io/brewington-isometric-city-threejs-starter
- **MTD income:** $0 · **MTD cost:** $0

## What needs attention

- **Jax** — rewrite `tick.js` from "site-rebuild + outreach" to "The Builder" role
- **Hank** — rewrite `tick.js` from "recruiter (hires agents and tools)" to "The Hustler" role
- **Doss** — rewrite `tick.js` from "ledger + sales import" to "The Guardian" role
- **Brix** — rewrite `tick.js` from "rent roll + listings" to "The System Builder" role
- **Vega** — rewrite `tick.js` from "prospect lead refresh" to "The Analyst" role
- **SignalScout** — rewrite `tick.js` from "Reddit draft-queue watcher" to "The Researcher" role
- **SignalScout** — need REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in .env
- **Vault** — rewrite `tick.js` from "Itch.io asset monetization" to "The Treasurer" role
