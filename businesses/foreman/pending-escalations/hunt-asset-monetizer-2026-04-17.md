# Hunt summary: asset-monetizer, 2026-04-17

**Brief:** hire a new lane-#1 agent bay that scans CC0 / MIT / Apache / BSD asset libraries weekly, drafts productization pitches, stands up digital-marketplace listings, and tracks revenue back through Paymaster. Self-funding rule: $50 net revenue in 30 days, $150 in 60, or archive.

**Dossiers filed:** 3
  - agent-asset-monetizer-itch-butler-sonnet
  - agent-asset-monetizer-ruflo-swarm
  - agent-asset-monetizer-firecrawl-gumroad-hybrid

**My top pick:** agent-asset-monetizer-itch-butler-sonnet

**Why top pick:** Itch.io's butler CLI is the only digital-marketplace publish path in 2026 with a fully automated upload route. Gumroad, Payhip, and Lemon Squeezy all lack a public product-creation API as of this hunt (verified against their docs and antiwork/gumroad issue #4019 which is open and unimplemented). butler is MIT-licensed, uses a BUTLER_API_KEY, and will push a new version, update price, or ship a new build without human touch. Paired with a single Sonnet pitch-drafting step and the existing Brewington scheduler, this architecture is the thinnest bay that still earns rent autonomously. Cost is under $5/month, revenue target of $50 in month 1 needs only 3 sales of a $19 Kenney-port bundle to clear. Autonomy score 4, only because the *first* Itch project page for each new listing family is human-created once (butler handles every subsequent push).

**Integration effort:** LOW.
  - One butler binary download (one-time, pinned to bin/)
  - One new bay folder (`businesses/vault/`) scaffolded via plop
  - One `tick.js` (~250 lines) using existing `businesses/lib/logger.js` and `lib/state.js`
  - Two env vars (BUTLER_API_KEY, ANTHROPIC_API_KEY already present)
  - Itch.io account: Lando opens once, generates the API key, done
  - Days to first listing live: 3
  - Days to first sale (realistic): 5-10

**Runner-up fallback:** agent-asset-monetizer-ruflo-swarm. Same revenue ceiling, same publish path, orchestrated by the already-installed ruflo swarm instead of a hand-rolled pipeline. Costs ~$3-5/month more in Sonnet tokens. If Lando wants to exercise the ruflo investment and test whether swarm coordination lifts pitch quality, this is the pilot. Kills two birds: gets the Asset Monetizer running AND resolves the pending ruflo 48h-gate pilot subtask from Hank's roster.

**Third option (flagged):** agent-asset-monetizer-firecrawl-gumroad-hybrid. Better scouting via Firecrawl's Hobby plan ($16/mo), reaches Gumroad's larger non-gamer audience, but autonomy drops to 3 (the floor) because Gumroad has no product-creation API and each new SKU requires a 5-minute human paste. Viable if Lando specifically wants Gumroad reach or sees Firecrawl's scout layer as worth the cost.

**Decision needed from Lando:**
  - [ ] approve top pick (butler + Sonnet, Itch.io only, $5/mo, autonomy 4, my actual recommendation)
  - [ ] approve runner-up instead (ruflo swarm wrapper, $8/mo, same revenue ceiling, exercises ruflo install)
  - [ ] approve top pick PLUS third option's Firecrawl scout layer as a hybrid (~$19/mo, dual storefront Itch + Gumroad, autonomy 3-4 depending on day)
  - [ ] approve third option standalone (Firecrawl + Gumroad, manual paste per SKU, $19/mo)
  - [ ] reject all, relax the brief, or expand research
  - [ ] request more candidates (flagged: I brainstormed 15 architectures, 12 were rejected during verification, primarily on the Gumroad-API-does-not-exist finding)

See dossiers in `businesses/foreman/candidates/agent-asset-monetizer-*.md`

## Context for Lando

The brief described a "tool hire" framing (port Kenney kits, list on Gumroad) but the actual work is a full bay, not a tool, because it needs:
- its own tick cadence (weekly scout, daily ledger sync)
- its own state.json (standing scout queue, pitches in flight, listings live, month-to-date revenue)
- its own charter.md and kill-clock (30-day rule applies, rent to Brix is $20/mo baseline)
- its own P&L reporting into Doss

This is lane #1 (new bay, tenant pays rent), not lane #5 (install a tool into the lib folder).

The research surfaced a market reality that reshaped the shortlist: **only Itch.io currently permits fully programmatic listing creation** among digital-asset marketplaces. Gumroad, Payhip, and Lemon Squeezy all expose sales APIs but not product-creation APIs. This is a verified, load-bearing finding from the hunt. Any bay architecture that assumed auto-publish to Gumroad does not exist as a product.

So the choice is between:
1. Build on Itch.io, where automation is possible, and accept a narrower (but still real) buyer audience for asset packs.
2. Build on Gumroad, accept a per-SKU manual paste, and take the autonomy hit.
3. Dual-publish.

The founding product strategy is Kenney-first. Kenney is CC0, has a huge catalog, is explicitly Three.js compatible, and already has buyers converging on Itch.io looking for ready-to-run bundles. The bay's first listing should be a Kenney isometric pack ported to a Three.js scene starter at $19. 3 sales = kill-clock clears, month 1 rent paid.

The bay needs a name before it ships. Foreman proposes **Vault** as the display name, **Archivist** as the role title. Lando approves or renames at onboarding.

## Verification notes

- butler CLI license confirmed MIT via itch.io/docs/butler.
- butler API key authentication for CI/CD confirmed via itch.io docs and multiple independent GitHub Action references.
- Itch.io open revenue sharing confirmed seller-configurable 0-30% via https://itch.io/docs/creators/pricing.
- Itch.io accepts "tools" and "assets" as valid project categories per https://itch.io/docs/general/about, so non-game asset packs (Tailwind kits, component libraries, PDFs) are in-scope.
- Kenney's assets confirmed CC0 with explicit commercial derivative permission on every asset page.
- Kenney's Unity starter-kits confirmed as redistributable ported derivatives under CC0; no licensing conflict when we ship a Three.js port.
- Gumroad API: product-creation endpoint NOT available, confirmed via official docs at gumroad.com/api and open issue antiwork/gumroad#4019 (opened 2026-03-18, still open).
- Payhip API: product-creation NOT available, only coupons and license keys per https://payhip.com/api-reference.
- Lemon Squeezy API: product creation NOT available per Lemon Squeezy's own feedback board, subscriptions and sales only.
- Firecrawl Hobby plan $16/mo confirmed via https://www.firecrawl.dev/pricing for 2026.
- ruflo installed and operational per Hank's roster (v3.5.80, MIT, 98 sub-agents), confirmed by reading state.json.
- Sonnet pricing verified at Anthropic's public pricing page.
- No candidate was installed, cloned beyond what's already in the repo, or executed during this hunt.
- Candidates brainstormed but rejected pre-shortlist: Zapier workflow (~$20/mo + Zapier ToS restricts reselling), Make.com scenarios ($9/mo but same product-creation-API gap), n8n self-hosted (days of infra work, over effort budget), Whop (narrower digital-asset audience than Itch/Gumroad), Apify actor as primary (no publish path, scout only), Shopify (over cost cap at $29/mo Basic), Sellfy/Payhip-as-primary (same API gap as Gumroad), pure-Sonnet-no-scout (fails autonomy, human must publish), headless Itch web-form automation via Playwright (butler CLI beats it, ToS-friendly), fork an existing asset-aggregator bot (none found that handle the publish step), Lemon Squeezy as primary (same API gap). Fifteen candidates considered before the final 3.

## Foreman stance

One approval decision, not a multi-step one. Top pick is the bay I would ship myself if Lando hands me the signature today. Runner-up is the same bay with a ruflo coat on. Third option is the Gumroad version with a bigger price tag and an autonomy asterisk. My recommendation in a single sentence:

**Approve the top pick, name the bay Vault, and let me scaffold it this week. First Itch listing live by day 3, first sale projected by day 7, first rent payment to Brix within the 30-day kill-clock.**
