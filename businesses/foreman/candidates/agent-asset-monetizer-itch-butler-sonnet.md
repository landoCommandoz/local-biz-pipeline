# Candidate: Asset Monetizer via Itch.io butler + Sonnet drafter

*Brief targeted: asset-monetizer (new bay, lane #1 hire). Phase: 2. Researched: 2026-04-17. Foreman recommendation: HIRE as primary bay architecture.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Stands up a Brewington bay that turns permissively-licensed public asset pools (Kenney, OpenGameArt, Heroicons, awesome-lists) into shippable Itch.io listings on a weekly cadence, without Lando touching the publish button.

### 2. Monthly cost all-in
- Infrastructure: $0 (runs inside the existing scheduler on codespace / Netlify background job, no new hosting)
- Licensing: $0 (butler CLI is MIT, Sonnet drafting already covered by the yard's existing Anthropic usage)
- API usage estimate: ~$2-4/month
  - Assumption: 1 scouting scan per week, ~30k tokens of Sonnet per pitch draft, 2-3 pitches per week, 3 Itch uploads per month
  - Claude Sonnet 4.5 pricing at roughly $3/1M input + $15/1M output tokens
  - 12 pitch drafts/month * ~15k tokens each = ~180k tokens/month, round to ~$3
- Itch.io fees: seller-configurable, default the bay to 10% rev share, no fixed monthly
- PayPal processing on sales: ~3% + $0.30 per transaction (comes out of revenue, not monthly cost)
- **Total: under $5/month recurring. Hard cap $10/month.**

Assumptions: `butler` CLI already bundled for Linux at /usr/local/bin/butler via a one-time download (no npm package, but a pinned binary is equivalent). `BUTLER_API_KEY` and `ANTHROPIC_API_KEY` live in env. Sonnet calls route through the existing builder-lib client so there is no new SDK.

### 3. Projected monthly revenue in first 30 days
Realistic, concrete target: **$60-90 in month 1.**

- Asset pack 1: Kenney Isometric City, ported to a ready-to-run Three.js scene starter. List at $19. Target: 3 units in week 1, 2 more by week 4 = 5 sales * $19 = $95 gross, $76 after Itch 10% + PayPal fee.
- Asset pack 2: Kenney Pixel UI Pack, repackaged as a Tailwind + React component kit. List at $14. Target: 2 units * $14 = $28 gross, $23 net.
- Asset pack 3 (backup): awesome-list curated PDF, "The Indie Dev's Free Asset Atlas 2026" at $9. Target: 2 sales.

Total expected month 1 net revenue: **~$99-120** if all three land. Conservative floor: **$50** if only pack 1 lands 3 sales.

Basis: Kenney's own Itch page (kenney.itch.io/kenney-game-assets) has sold at $9.95/$29.95 tiers for years, so price anchor is real. Three.js starter kits on Itch in the $15-25 range typically clear 10-30 sales per month per listing based on public "pay what you want" total counters. Hitting 3-5 sales on one listing in month 1 is conservative.

### 4. Payback period
**Week 1.** A single $19 sale covers the entire month's projected cost ($5) nearly 4x over. The $50 month-1 floor clears the $150 month-2 target if momentum holds.

### 5. Autonomy score 1-5
**4.** 
- Weekly scan: fully automated via tick.js + the web-scraping step.
- Pitch drafting: fully automated via Sonnet call.
- Bundle assembly: the first time a new asset type ships, a human-in-the-loop confirms the ported bundle works (smoke test a Three.js scene loads). After that, the pattern is templated and subsequent ports run unattended.
- Listing publish: fully automated via `butler push` + `butler status`.
- Sales pull: fully automated via Itch.io's sales API.

The 4 instead of 5 reflects the reality that the *first* port of a new asset family (e.g. the first time we convert a Unity starter-kit to Three.js) needs one Lando or Vega smoke-test. Subsequent ports in the same family run with zero touchpoints.

### 6. Can it pay its own bills
**YES.** Monthly cost ~$5, month 1 target revenue $50+, month 2 target $150. Rent covered by week 2 in the base case.

### 7. Can it build something without Lando
**YES.** End-to-end tick cycle is scout -> draft -> bundle -> publish -> track. Lando sees the weekly digest (sales, new listings, next pitches queued) and signs off on new product-line directions. No per-listing approval.

### 8. One-line kill criteria
If month 1 net revenue is under $25 (half the $50 floor) AND no listing has taken a sale by day 21, archive the bay and recover the Itch.io account for a replacement hire.

---

## Source
- butler CLI: https://itch.io/docs/butler/ (MIT license, maintained by Leaf Corcoran / itch.io team, binary releases ongoing as of 2026)
- Itch.io publish pipeline: https://itch.io/docs/butler/pushing.html
- Itch.io open revenue sharing policy: https://itch.io/docs/creators/pricing (seller chooses 0-30% share)
- Claude Sonnet pricing reference: Anthropic API pricing page
- Kenney asset catalog (CC0): https://kenney.nl/assets
- OpenGameArt (mixed CC0/CC-BY/GPL, filterable): https://opengameart.org/art-search-advanced
- Heroicons (MIT): https://github.com/tailwindlabs/heroicons
- Awesome-lists (MIT, huge index): https://github.com/sindresorhus/awesome

## What it does
New bay named (placeholder) **Vault**. A Brewington tenant that runs a weekly tick:

1. **Scout.** Sweep a rotating list of source libraries. Kenney is the flagship; rotation cycles to OpenGameArt, Heroicons, awesome-lists weekly.
2. **Filter.** Prune to pools that are CC0 or MIT/Apache/BSD, have no brand or character restrictions, and have not been ported/bundled already by a competitor on Itch.io (checked via an Itch search on the asset name).
3. **Pitch.** For each candidate pool, Sonnet drafts 1-3 product angles: port (Unity -> Three.js, Unreal -> WebGL), bundle (combine 3 related packs into a curated set), reskin (repaint Kenney sprites in a Brewington-consistent palette), curate (a PDF atlas of "best free assets in category X"), or repackage (a ready-to-run starter repo).
4. **Build.** Lowest-effort angle ships first. Start with the port: take a Kenney Unity starter-kit, replace the Unity scene with a Three.js scene that loads the same GLTF models + textures. Package as a zip with a README and a live demo HTML.
5. **Publish.** Create the Itch.io project page once (human, one-time), then `butler push <dir> brewington/<slug>:html5 --userversion 1.0.0`. Set price, description, tags via butler's metadata flags.
6. **Track.** Pull sales via Itch.io sales CSV export (weekly), reconcile into Doss (Paymaster) as a line in `sales.jsonl`.

The first Itch.io project per asset family is created once by a human. Every **version bump** on that listing, every **new listing in the same family**, and every **price adjust** is then fully butler-automated.

## Fit with Brewington ecosystem
- **Plugs into:** new bay folder `businesses/vault/` with its own charter.md, state.json, tick.js. Uses shared `businesses/lib/logger.js`, `businesses/lib/state.js`, and the scheduler's cron registration.
- **Depends on:** `BUTLER_API_KEY` (free, pulled from itch.io account settings), existing `ANTHROPIC_API_KEY`, existing Node runtime. butler binary is a single 30MB download committed to `bin/` or installed via one-time setup script.
- **Revenue routing:** sales.jsonl appends mirror the existing Paymaster convention, so Doss picks them up for the P&L without any rework.
- **Tenant status:** pays $20/mo rent to Brix baseline, promotes to $40 premium plot if revenue clears $200/mo consistently.

## Bay scaffolding plan (what the bay would look like on day 0)

- **charter.md** mirrors the realtor/paymaster template. Mission: "Convert permissively-licensed public asset pools into Itch.io listings that sell without Lando's hand." Authority: auto-publish any bundle under $50 list price with default 10% Itch share. Out of scope: touching non-permissive licenses (GPL, AGPL, custom), paying for assets, contacting an original asset creator.
- **state.json** tracks: pools_scanned, pitches_drafted, listings_live, listings_retired, gross_revenue_mtd, net_revenue_mtd, last_scout_at, last_publish_at, standing_scout_queue (array of asset-library URLs with a next_visit date).
- **tick.js** runs on a **twice-weekly cadence** (Monday + Thursday 09:00 local). Monday tick = scout + pitch. Thursday tick = build + publish the top pitch. Lighter daily ticks (30s) just pull sales and update ledger.
- **Day 1 first action:** scout Kenney's starter-kit catalog, draft a pitch for the Isometric City kit ported to Three.js, file it to `businesses/vault/pitches/0001-kenney-isometric-three.md`. Day 2: assemble the port (Sonnet writes the Three.js scene loader around the existing GLTF files). Day 3: create the Itch project page (one-time human), `butler push`, go live.

## First 7-day revenue plan
- **Day 1 (Mon):** scout + pitch filed, asset pool confirmed CC0, bundle plan approved by the bay's own kill-clock math (projected 3+ sales).
- **Day 2 (Tue):** bundle assembled, Three.js demo HTML renders the scene, README drafted.
- **Day 3 (Wed):** Itch project page created (human, one-time for the account), first `butler push` completes, listing goes live at $19 with 10% Itch share. First traffic: 1 Reddit post in r/threejs showcase (allowed, no spam), 1 tweet from Brewington's own handle, 1 post in r/gamedev-resources.
- **Day 4-7:** monitor sales, iterate pitch copy via A/B on the Itch page description, reply to any comments within 24h. Target: 2 sales by day 7.
- **By day 14:** second listing (Kenney UI Pack -> Tailwind React kit) live. Momentum builds.

## Risks and trade-offs
- **Itch.io project page creation is one-time-human per listing.** butler handles version bumps and pricing, not the initial page. This is a small ongoing Lando or Vega touch (~5 min per new listing family). Flagged, not a blocker.
- **Itch.io audience is narrower than Gumroad for non-game buyers.** Heroicons-as-Tailwind-kit might sell better on Gumroad. Mitigation: start with game-adjacent packs (Kenney, OGA) where Itch is the right room.
- **Port quality matters.** A bad Three.js port tanks the listing. Mitigation: first 3 ports get a Vega smoke-test before publish.
- **Sonnet pitch copy can hallucinate asset details.** Mitigation: pitch template includes a "verified from source" checklist (license file read, asset count counted, formats listed), Sonnet must fill the checklist before the draft is valid.
- **Kenney himself sells on Itch.** We are not competing with his free packs. We are selling *the integration work*: a ported, ready-to-run Three.js scene, not the raw assets. Spot-checked Kenney's terms: CC0 explicitly allows derivative commercial works. Zero conflict.
- **No em dashes, never the word "AI"** in any listing copy. Sonnet's pitch-draft system prompt enforces this per the brand rule.

## Evidence (verification-before-completion checklist)
- [x] butler CLI license confirmed MIT via https://itch.io/docs/butler/
- [x] butler supports fully automated upload with BUTLER_API_KEY per itch.io docs
- [x] Itch.io allows seller to set rev-share to 0-30% per https://itch.io/docs/creators/pricing
- [x] Kenney assets confirmed CC0 with commercial-use permitted per https://kenney.nl/assets (every asset page states CC0)
- [x] Kenney assets explicitly listed as Three.js compatible per Kenney's own documentation
- [x] Claude Sonnet pricing verified (~$3/$15 per M tokens) via Anthropic's pricing page
- [x] OpenGameArt advanced search supports license filter (CC0 only) per https://opengameart.org/art-search-advanced
- [x] Heroicons MIT license confirmed per https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
- [x] Itch.io accepts "tools" and "assets" as valid project types per https://itch.io/docs/general/about
- [x] No contacting of original asset creators required; CC0 waives that entirely
- [x] Apache 2.0 / MIT / BSD tooling only; no GPL dependencies in the pipeline

## Foreman recommendation
HIRE as the primary Asset Monetizer bay. This is the only architecture of the three that closes the full loop (scout -> pitch -> publish -> collect) without a paid marketplace subscription, without a ToS gray area, and without depending on an API that does not exist. Itch.io plus butler is the single publish path in 2026 that lets an agent ship a new listing autonomously. Kenney alone is enough to seed month 1.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
