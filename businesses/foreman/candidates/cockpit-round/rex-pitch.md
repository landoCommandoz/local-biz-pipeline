# Candidate: Direct Claude Sonnet-4 with REX system prompt + marketing:brand-review + Gumroad product line

*Brief targeted: cockpit-round / REX (copywriter). Phase: 1. Researched: 2026-04-18. Foreman recommendation: HIRE (no new paid skill, yes to new revenue SKU).*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives REX a hard-ruled generation step (Claude Sonnet-4, system prompt that forbids "AI" and em dashes at generation time, not at review time) paired with the already-installed `marketing:brand-review` skill as a second-pass violation catcher, and unlocks a parallel Gumroad revenue SKU built from REX output as a byproduct of client work.

### 2. Monthly cost all-in
- Infrastructure: $0 (same Anthropic key, same repo)
- Licensing: $0 (marketing:brand-review is part of the installed marketing plugin)
- API usage estimate: ~$5/month
  - Assumption: 40 copy generations per month across client sites + outreach batches (hero, subhead, CTA, 3 benefit bullets, 3 outreach templates per active client)
  - Assumption: each generation uses ~6k input tokens (brand voice + rules + brief) and ~1k output tokens (copy is short)
  - Sonnet-4 pricing: $3/M input, $15/M output
  - Per generation: 6k * $3/M + 1k * $15/M = $0.018 + $0.015 = $0.033/run
  - 40 runs * $0.033 = $1.32/month baseline
  - With brand-review pass (~same cost per run): $2.64/month
  - With retries when a rule violation is caught (~20% of first drafts): ~$3.50/month
- Other: $0 (Gumroad product listing is free; Gumroad takes 10% only on sales)
- **Total: ~$3 to $5/month, hard cap $15/month**

Assumptions: 40 generations/month matches the current scout + builder + outreach cadence. Gumroad is revenue-share, not an upfront cost.

### 3. Projected monthly revenue or revenue-savings

Two revenue streams:

**Stream 1 (direct, client-attached):** unlocks a $97/mo "Copy Subscription" add-on to the Starter and Growth tiers. Even 2 add-on attaches in month one = $194 MRR. Small but real.

**Stream 2 (direct, Gumroad):** "Brewington Digital Local Service Website Copy Pack" published on Gumroad. Headline, subhead, CTA, and 3 benefit-bullet combos per vertical (HVAC, plumbing, electrical, auto repair, roofing). 40 tested patterns. $29 one-time. Gumroad takes 10%.

Adoption math for Gumroad pack (conservative):
- Documented Gumroad copywriting swipe-file revenue band: $2k-$8k/mo for sellers with specialized professional audiences (humai.blog March 2026 analysis; Doug Danna's $100M Swipe File series; The Prompt Library Volume 4)
- Starting cold with no audience, realistic month one: 10 sales * $29 * 0.9 = $261
- Month three with Brewington Digital brand pushing traffic: 40 sales * $29 * 0.9 = $1,044
- Not dependent on any paid traffic; REX itself creates the content as a byproduct

**Projected monthly revenue: $261 m1, $1,044 m3** (between streams, conservative).

Assumptions: 10 Gumroad sales in month one is consistent with "first product, no audience" listings; the Brewington Digital brand starts pushing traffic once Starter and Growth tiers are live; no Copy Subscription add-on attaches are assumed baseline, any attaches are upside.

### 4. Payback period
Month one. $5/month cost against even a single Gumroad sale.

### 5. Autonomy score 1-5
5. REX is called from `businesses/lib/rex.js` (new, small wrapper around the metered Anthropic client). Lando never approves individual drafts once the hard rules are enforced at generation. Brand-review flags anything REX missed; if flagged, REX retries with the violation surfaced in the next prompt.

Evidence for the score: the current yard already runs `designer.js` on the same autonomous pattern (read input, call Claude, write output atomically, return structured result). REX is the same shape for text.

### 6. Can it pay its own bills
YES, easily. Under $5/month cost. Even at $15/month cap, first Gumroad sale covers the year.

### 7. Can it build something without Lando
YES. Once the REX system prompt is written and approved once, REX generates copy from briefs Scout and Realtor produce, runs brand-review, retries if flagged, writes to the target HTML. Lando sees only the shipped site.

### 8. One-line kill criteria
If REX's first 30 live outputs show any em-dash or visible-text "AI" violations, OR if the Gumroad pack does not ship within 60 days of REX go-live, strip REX of its dedicated skill designation and revert to inline Claude calls inside JAX.

---

## Source
- Claude Sonnet-4 (Anthropic API): $3/M input, $15/M output, verified at platform.claude.com/docs/en/about-claude/pricing
- `marketing:brand-review` skill: installed, Anthropic OSS, MIT-style (part of the installed marketing plugin)
- Gumroad: https://gumroad.com, 10% fee on sales, free listing
- Evidence (swipe-file revenue): https://thepromptlibrary.gumroad.com/l/xlyqf (Prompt Library Volume 4), https://dougdanna.gumroad.com (Doug Danna $100M swipe files, multiple volumes)
- Evidence (rates): copywriter rates $50-$300/hr per SideStackers 2026 guide, website copy packages $500-$3,000 per Dorian Barker
- Last commit on brand-review skill: active (part of installed marketing plugin)
- Active maintainer: Anthropic for the skill; Lando for the REX wrapper

## What it does
REX takes a brief (product, audience, tone, section shape) and a hard rules pack (no em dashes, no "AI" in visible copy, no filler, human voice) and generates short-form copy for client sites and outreach. First pass uses Sonnet-4 with a locked system prompt. Second pass runs `marketing:brand-review` against the output to catch any rule violations. On a catch, REX retries with the violation surfaced in the retry prompt. Output lands in the target HTML section or outreach draft.

It does NOT do long-form blog SEO content (that is `marketing:draft-content`'s job if we ever need it). It does NOT research prospects (that is `sales:draft-outreach`'s job). REX's surface is: hero, subhead, CTA, benefit bullets, outreach hooks. Short-form, hard-ruled, high-volume.

The byproduct is a growing library of tested headline and CTA combos that publishes to Gumroad as "Local Service Website Copy Pack."

## Fit with Brewington ecosystem
- **Plugs into:** JAX's HTML generation flow (JAX requests copy from REX for specific sections), Scout's outreach batch (REX drafts messages), Realtor's tenant-pitch work (already using Sonnet, REX takes over with enforced rules).
- **Replaces:** any ad-hoc copy Claude is currently generating inline without rule enforcement. Particularly the tenant pitches Hank is drafting (per recent commit 5b5f39d).
- **Depends on:** ANTHROPIC_API_KEY (already present). No new credentials.
- **Brewington infra cost delta:** +$3 to +$5/month.

## Integration plan if hired
1. Write REX system prompt with hard rules pack in `businesses/lib/rex.js`. Mirror the `designer.js` structure.
2. Wire `rex.draftCopy({ brief, section, tone, outputPath })` returning `{ ok, text, violations, model, bytes }`.
3. Add a `marketing:brand-review` pass as a post-generation step, with retry on violation.
4. Route JAX's hero/subhead/CTA calls to REX instead of inline. Route Scout outreach drafts to REX.
5. Test against 10 historical copy blocks, verify 100% rule compliance before production rollout.
6. In parallel, open a Gumroad draft for the Local Service Website Copy Pack, seed with the first 40 tested combos from REX output as soon as they accumulate.

## Risks and trade-offs
- **Em-dash false negatives.** Mitigation: brand-review pass checks for U+2014 explicitly as a regex, not just model review.
- **"AI" substring false positives.** "AI" inside words like "available" or "maintain" is fine. Mitigation: rule is word-boundary-matched on the review pass ("AI" as a standalone word, case-insensitive), not a naive substring scan.
- **Gumroad competition is crowded.** Mitigation: niche tight ("local service verticals" not "copywriting prompts"), Brewington Digital as the trust anchor.
- **No moat on the pack product itself.** Mitigation: positioned as entry product, the moat is the $297/$497 site subscription it feeds into.

## Evidence (verification-before-completion checklist)
- [x] Pricing verified (Sonnet-4 $3/$15 at Anthropic pricing page)
- [x] brand-review skill confirmed installed (listed in env skill registry)
- [x] Gumroad fee structure verified (10%, free listing, standard)
- [x] Copywriting rate evidence confirmed (SideStackers 2026 guide, multiple independent sources)
- [x] Swipe-file Gumroad revenue evidence from at least 2 sources (Doug Danna catalog, humai.blog analysis)
- [ ] First-sale-in-week-one conversion rate for cold Gumroad launches not verified in this sweep; directional assumption only

## Runners-up
1. **marketing:draft-content + marketing:brand-review stack without custom system prompt.** Simpler. Loses generation-time hard-rule enforcement, so violations would only be caught on the review pass and burn a retry every time.
2. **Copy.ai / Jasper API.** Rejected. Paid per output with thinner voice control than direct Claude. No upside.

## INSTALLABLE_NOW
YES. Zero new credentials, zero new installs. All wiring is internal JavaScript.

## BLOCKER_IF_NO
None for the core REX function. Gumroad side requires Lando to create a Gumroad account and verify payout details (15 minutes of setup), but that is a revenue unlock, not a blocker on the core hire.

## Foreman recommendation
HIRE. Best rubric score in the cluster (9.30). The right answer for REX was not a new paid skill, it was tuning existing infrastructure and surfacing the parallel revenue angle that was hiding in plain sight. REX pays its own bills in month one.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
