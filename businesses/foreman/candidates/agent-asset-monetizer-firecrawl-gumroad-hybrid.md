# Candidate: Asset Monetizer via Firecrawl scout + Gumroad semi-automated publish

*Brief targeted: asset-monetizer (new bay, lane #1 hire). Phase: 2. Researched: 2026-04-17. Foreman recommendation: THIRD CHOICE. Strong scouting, weak publishing. Flagged.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Pairs Firecrawl (deep scraping of asset sites without brittle custom parsers) with Gumroad (larger non-gamer audience) to reach buyers Itch.io cannot reach, at the cost of a semi-manual publish step that hits the autonomy floor.

### 2. Monthly cost all-in
- Infrastructure: $0
- Firecrawl Hobby tier: $16/month (3,000 credits, 5 concurrent). Verified at https://www.firecrawl.dev/pricing for 2026.
- Gumroad: no monthly fee (takes ~10% per sale + payment processing)
- Sonnet pitch drafting: ~$3/month (same math as top pick)
- **Total: $19/month recurring. Hard cap $25/month (matches the stated ceiling exactly).**

Assumption: 30 scout-scrapes/month = 30 credits worst case, well inside Firecrawl's 3k budget. Firecrawl is over-provisioned for this workload; the Hobby tier is the minimum subscription.

### 3. Projected monthly revenue in first 30 days
**$40-80 in month 1.** Lower ceiling than the top pick because Gumroad's product-creation API does not exist: each new listing requires a human (Lando or Vega) to paste the pitch into Gumroad's dashboard manually. That throttles listing velocity to ~2 listings/week instead of 3+.

- Listing 1 (Kenney UI Pack as Tailwind kit): $14, targeting 3 sales in month 1 = $42 gross.
- Listing 2 (Heroicons curated component atlas PDF): $9, targeting 3 sales = $27 gross.
- Combined net after Gumroad's 10% + processing: **~$55-65**.

### 4. Payback period
**~3-4 weeks.** $19/month cost needs $25 net revenue to clear (after Gumroad fees on the revenue side). Two $14 listings selling once each clears the bar. Tight but feasible.

### 5. Autonomy score 1-5
**3.** This is the borderline. Scout is fully automated (Firecrawl scripted). Pitch drafting is automated (Sonnet). **Publish is NOT automated** because Gumroad has no product-creation API as of 2026 (verified against Gumroad's public API docs and the antiwork/gumroad issue #4019 open feature request). A human must paste the listing into the Gumroad dashboard once per new product. Price refresh, sales pull, and inventory updates after that *are* API-automatable via community SDKs (gumroad-ts, gumroad-node-sdk).

Per Hank's charter: "any hire scoring below 3 is auto-rejected." This candidate is at the floor, not below, so it qualifies. Barely.

### 6. Can it pay its own bills
**BORDERLINE YES.** $19 cost vs ~$55 projected net = 2.9x coverage. Above the "30-day must clear" bar, but tight. One slow month and the bay is eviction territory.

### 7. Can it build something without Lando
**MOSTLY YES, with a caveat.** The bay can scout, draft, bundle, and update pricing unattended. It *cannot* create a new Gumroad product page unattended. That is a ~5 min human paste per new SKU. Hank's charter rule says "rejected if requires Lando's hand-holding on routine work." Arguable whether a 5-minute paste per week counts. Foreman's read: this is a hand-holding risk, not a disqualifier, but it is the reason this is the third choice.

### 8. One-line kill criteria
If month 1 net revenue is under $30 OR Firecrawl's $16 subscription is consuming credits 2x faster than projected (ie. Firecrawl is scraping more than scouting needs), archive or downgrade to a cheaper alternative (Playwright + custom parsers, free but more brittle).

---

## Source
- Firecrawl pricing: https://www.firecrawl.dev/pricing (Hobby tier $16/mo, verified 2026-04-17)
- Firecrawl skill in this workspace: `firecrawl:firecrawl` skill exposes the CLI directly, no extra setup
- Gumroad API authentication: https://gumroad.com/help/article/280-create-application-api (OAuth 2.0, `edit_products` scope)
- Gumroad product-creation API status: NOT AVAILABLE as of 2026-04-17 per https://github.com/antiwork/gumroad/issues/4019
- Community Gumroad SDKs: gumroad-ts (https://github.com/warengonzaga/gumroad-ts, MIT), gumroad-node-sdk (MIT)
- Gumroad fee structure: roughly 10% per sale plus payment processing (varies by plan)

## What it does
1. **Scout with Firecrawl.** Firecrawl crawls Kenney.nl, OpenGameArt.org, awesome-lists, Heroicons releases, and anything else in the standing scout queue. Returns clean markdown + structured data (asset counts, license tags, file types, sizes).
2. **Pitch with Sonnet.** Same drafting step as the other candidates.
3. **Bundle.** Assemble the port / curated pack.
4. **Publish.** Output a Gumroad-ready listing markdown + cover image + product file zip. Paste into Gumroad (5 min human task), then the bay takes over for sales pulls and price tests.
5. **Track.** Pull Gumroad sales via the existing API (sales endpoint is fully functional), reconcile into Doss.

## Fit with Brewington ecosystem
- **Plugs into:** `businesses/vault/`, same shape as the other candidates.
- **Depends on:** FIRECRAWL_API_KEY (paid), GUMROAD_ACCESS_TOKEN (free), ANTHROPIC_API_KEY.
- **Why Gumroad instead of Itch:** Gumroad reaches buyers looking for component kits, PDF guides, Notion templates. Itch is best for game assets. Heroicons-as-Tailwind-kit sells better on Gumroad. If the bay's product roadmap is 50% game stuff and 50% web-dev stuff, Gumroad covers the second half.

## Bay scaffolding plan
- **charter.md, state.json:** same structure.
- **tick.js:** a slightly thicker file (~200 lines) because Firecrawl returns rich data that needs parsing.
- **Tick rhythm:** weekly scout (Monday), daily sales pull + ledger sync.
- **Day 1 first action:** Firecrawl scans Kenney + Heroicons, Sonnet drafts 2 pitches, bundle assembled. Listing file dropped in `businesses/vault/ready-to-publish/`, Lando pastes it once. **This is the blocker**: first revenue is gated on a 5-min Lando task in week 1.

## First 7-day revenue plan
- **Day 1-2:** scout + pitch + bundle.
- **Day 3:** Lando pastes listing into Gumroad (5 min). Goes live.
- **Day 4-7:** organic discovery + 1 Reddit post. Target: 2 sales by day 7.
- Second listing ready by day 10, Lando pastes again.

## Risks and trade-offs
- **Gumroad API gap is the core risk.** The day Gumroad ships product-creation API support, this architecture becomes the top pick overnight. Until then, semi-manual.
- **Firecrawl cost is $16/mo flat whether we use 30 credits or 3,000.** Over-provisioned; real utility is its CC0-asset-site parser, not raw credit volume.
- **Gumroad's ~10% fee is close to Itch's 10% default**, so revenue economics are not materially different. The difference is reach and the publish friction.
- **Firecrawl alternative:** a Playwright-based custom scraper would be free but brittle and would need maintenance each time Kenney or OGA restructures their HTML. Firecrawl absorbs that pain. Trade-off: $16/mo for 0 maintenance vs free with ongoing maintenance debt.
- **Dual storefront is possible.** This architecture could ship Itch AND Gumroad listings. Top pick ships Itch only. If Lando wants to test both audiences, this candidate's Firecrawl infra can complement, not replace, the top pick.

## Evidence (verification-before-completion checklist)
- [x] Firecrawl Hobby tier confirmed $16/mo via https://www.firecrawl.dev/pricing (2026)
- [x] Firecrawl skill present in this workspace (available in the plugin list as `firecrawl:firecrawl`)
- [x] Gumroad product-creation API NOT available per Gumroad docs + antiwork/gumroad issue #4019 (open, not yet implemented as of March 2026)
- [x] Gumroad sales and price APIs ARE available per https://gumroad.com/api
- [x] Community Gumroad Node SDKs verified MIT-licensed (gumroad-ts v1.x, gumroad-node-sdk)
- [x] Gumroad fee structure verified roughly 10% plus payment processing
- [x] All tooling is permissive-licensed (Firecrawl is commercial SaaS with permitted commercial use, SDKs MIT, Sonnet already in use)
- [x] No em dashes and no "AI" rule can be enforced at the listing-draft level via Sonnet system prompt

## Foreman recommendation
THIRD CHOICE. Good scouting, compromised publishing. Autonomy sits at the floor (3) because Gumroad's missing product-creation API forces a manual paste per new SKU. If Lando wants Gumroad reach specifically, this bay is the way. If the goal is maximum autonomy and the shortest path to monthly recurring revenue, the top pick beats it.

**Hybrid option worth flagging:** ship the top pick as the primary bay, and add Firecrawl to its scout step only (the Hobby subscription serves the scouting workload regardless of publish target). That way the bay earns revenue via Itch (automated) and can opportunistically drop Gumroad listings when a web-dev-audience bundle is worth a manual paste. That hybrid keeps cost at $19/mo and autonomy at 4.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
