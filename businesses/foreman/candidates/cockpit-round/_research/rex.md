# REX research notes (Copywriter)

*Cluster: creative. Hunter: HANK. Date: 2026-04-18.*

## Mission re-stated

REX writes all visible copy on client sites (Starter $297/mo, Growth $497/mo) and all outreach messages that ECHO sends. HARD RULES: no "AI" in any visible text, no em dashes, no filler, human voice only. Yard rules live in `.remember/` feedback files `feedback_no_ai_no_emdash.md` and `feedback_pricing_heart.md`. Any REX solution must enforce those rules at generation time, not as a post-hoc review.

## The real question

Does REX need a dedicated skill, or does direct Claude call with a tuned system prompt and a rule-check pass win?

## Six-platform sweep

### 1. GitHub advanced search

- **Copy framework repos**: PAS, AIDA, StoryBrand skeletons exist as markdown templates. No repo with commercial revenue evidence. They are just prompt templates, directly reproducible inside a Claude system prompt.
- **No defensible "copywriter skill"** found. The market-leading copywriting output comes from Claude directly; the "skill" layer does not add capability, it adds ritual.

### 2. Claude Code plugin registry / skills marketplace

- **marketing:draft-content** (installed): channel-specific formatting, SEO recs, brand voice. Useful for long-form blog posts but overscoped for the "8-line hero + 3 benefit bullets + 1 CTA" shape of Brewington site copy.
- **marketing:brand-review** (installed): reviews content against style guide, flags deviations. This is the right shape for enforcing the no-AI / no-em-dash rules at review time. Pair with draft step.
- **sales:draft-outreach** (installed): research a prospect, draft personalized outreach. Exactly the ECHO support function REX needs. Installed, zero integration cost.

### 3. Apify Actor Store

- Not applicable. No copywriting actors.

### 4. RapidAPI + official APIs

- **Copy.ai API, Jasper API**: GPT wrappers with thinner voice control than direct Claude. Paid per word, no advantage over direct Anthropic call. Rejected.

### 5. Product Hunt / Gumroad / Indie Hackers revenue evidence

This is where the real money is for REX.

- **The Prompt Library Volume 4** (Gumroad, marketing + copywriting pack): 100 prompts, sold as a digital product. https://thepromptlibrary.gumroad.com/l/xlyqf
- **$100 Million Copywriting Swipe File** (Gumroad, Doug Danna): multiple volumes, ongoing sales. https://dougdanna.gumroad.com
- **Niche swipe files**: documented cases of sellers netting $2k-$8k/mo on Gumroad + marketplace combos. Source: "Prompt Library as a Digital Product" humai.blog analysis, March 2026.
- **Pattern**: specialized libraries for defined professional audiences in well-documented formats outperform generic prompt dumps.

**Direct revenue angle for REX**: publish the Brewington Digital copywriting system as a Gumroad product. "Local Service Business Website Copy Pack" (HVAC, plumbing, electrical, auto repair). Every pattern REX generates for real clients becomes a row in the pack. $29 one-time, low support burden. Even 30 sales/mo is $870 net, and REX is the one already producing the source material.

### 6. Reddit revenue threads

- r/copywriting 2026 rate data: small-business website copy packages sell $500-$3,000 per site (Dorian Barker, SoloPricing). Beginner rate floor is $750 per sales page.
- r/Entrepreneur: freelancers bundling "website + copy + deploy" at $1,500-$3,000 hit consistent close rates on local service niches.

Implication: REX is not just a cost center. Every site Brewington sells at $297/mo includes copy that REX wrote; if Brewington positioned the copy-subscription as its own SKU (say $97/mo add-on), REX would directly justify its operating cost.

## Rubric scoring (0-10 each, weighted)

| Candidate | Revenue evidence (35%) | Pipeline fit (25%) | Autonomy (20%) | Install (10%) | Licensing (10%) | Weighted |
|---|---|---|---|---|---|---|
| Direct Claude Sonnet + brand-review skill + Gumroad product | 9 (Gumroad evidence + inline client revenue) | 10 (already on ANTHROPIC_API_KEY) | 10 | 10 | 10 | **9.30** |
| marketing:draft-content alone | 5 | 6 | 10 | 10 | 10 | 7.05 |
| Copy.ai / Jasper API | 4 | 3 | 8 | 5 | 6 | 4.85 |

## Winner

**Direct Claude Sonnet-4 with REX-specific system prompt + marketing:brand-review skill as a review pass + a dedicated Gumroad product line as the m3 revenue surface.**

No new paid skill. The yard already owns the rails. The win is in the system prompt that hard-enforces no-AI/no-em-dash, paired with a post-draft brand-review pass, and in publishing the REX output format as a sellable Gumroad pack.

## Runners-up

1. marketing:draft-content + marketing:brand-review stack without custom system prompt (simpler but loses hard-rule enforcement)
2. Copy.ai API (rejected; paid, thinner voice control, no upside)

## Monetization angle surfaced

**"Brewington Digital Local Service Copy Pack"** on Gumroad. 40 tested headline/subhead/CTA combos per vertical (HVAC, plumbing, electrical, auto repair, roofing). $29 one-time. REX produces the raw material as a byproduct of client work. Lando reviews once, Brix can list it.

## Kill criteria

If REX does not catch 100% of em-dash and "AI" violations in its first 30 live outputs, OR if no Gumroad pack ships within 60 days of REX go-live, revert to direct Claude with no REX abstraction and kill the skill designation.

## Blocker if no

No blocker. All required components (Claude API key, marketing:brand-review skill) are installed and working.
