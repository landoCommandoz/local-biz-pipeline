# Cockpit Round — Consolidated Review

*Compiled by Hank on 2026-04-18. 10 pitches across 5 clusters. HIRE deferred per Lando directive. All pitches await APPROVED / REJECTED / HOLD per agent.*

## Headline numbers

| | Month 1 | Month 3 | Cost / mo | One-time |
|---|---|---|---|---|
| **All 10 combined** | **$2,930 MRR** | **$10,258+ MRR** | **~$130** | $125 |
| Installable today (no auth) | $1,220 MRR | $4,358+ MRR | $42 | $0 |
| Blocked on credentials | $1,710 MRR | $5,900+ MRR | $88 | $125 |

**Net month-1 surplus after rent + tool cost:** ~$2,800/mo if everything ships.
**Payback:** under 30 days on a single Brewington Digital Starter ($297) close.

## Ranked by month-1 revenue

| # | Agent | Skill | M1 | M3 | Cost | Auto | Installable | Blocker |
|---|---|---|---|---|---|---|---|---|
| 1 | **ECHO** | Apify Google Maps Scraper + Instantly.ai Growth | $891 | $3,000+ | $52 | 4-5 | NO | Instantly $47/mo + OAuth on sender mailboxes |
| 2 | **ATLAS** | DataForSEO Business Listings API | $594 lift | $1,800 lift | $20 + $125 setup | 4 | NO | DataForSEO account + API key + $50 starter deposit |
| 3 | **ZENITH** | US Census CBP/ZBP + ACS density scoring across NAICS 238220/238210/238160 | $417 | $1,251 | $0 | 4 | YES | none (free Census key, 5 min) |
| 4 | **NEO** | Transformers.js + Xenova/all-MiniLM-L6-v2 + ml-logistic-regression | $297 | $1,136 | <$5 | 4 | YES | none |
| 5 | **REX** | Direct Claude Sonnet-4 + REX system prompt + marketing:brand-review + Gumroad copy pack | $261 | $1,044 | $5 | 4+ | YES | none |
| 6 | **PIXEL** | upload-post.com API + Apify Etsy scraper + FFmpeg (Remotion v2 queued) | $225 | $1,200+ | $16.20 | 4 | NO | upload-post $16/mo sub + Apify payment + 4 OAuth tokens (TikTok / IG / YouTube / Pinterest) |
| 7 | **IRIS** | Playwright + axe-core (visual regression + copy scan + a11y) | $147 | $437 | $0 | 4 | YES | none |
| 8 | **MAX** | netlify-skills baseline + $49/mo Brewington Care + Uptime addon SKU | $98 | $245 | $20 | 5 | YES (baseline) | upside tier needs Lando ratifying $49 SKU |
| 9 | **FORGE** | impeccable design skill + Opus 4.7 via Claude Agent SDK | $0 direct, $300 productivity | upside via $497 Growth tier | $12 | 4+ | YES | none |
| 10 | **NOVA** | Playwright + custom adversarial fixtures (rapid-click, null-fetch, 375px overflow, 44px touch-target, URL bypass, 6x CPU throttle) | $0 direct, $297 refund-prevention | $145 | $0 | 5 | YES | none |

## Installable today (7 of 10) — review first

These ship without you doing anything but approving:

- **ZENITH** ($417 m1) — free Census key
- **NEO** ($297 m1) — local inference, no creds
- **REX** ($261 m1) — Claude already metered via Doss
- **IRIS** ($147 m1) — Playwright is npm install
- **MAX** ($98 m1, baseline only) — netlify-skills already installed
- **FORGE** ($0 direct) — impeccable is Apache-2.0, ANTHROPIC_API_KEY present
- **NOVA** ($0 direct) — shares Playwright runtime with IRIS

Combined m1 if all 7 approved: **$1,220 MRR**. Combined cost: $42/mo. Net: $1,178/mo.

## Blocked on credentials (3 of 10) — review second, decide on auth

These need a one-time decision from you before they can run:

| Agent | What you'd authorize | M1 unlock | Risk if you skip |
|---|---|---|---|
| **ECHO** | Instantly.ai $47/mo + OAuth sender mailboxes | $891 | Resend fallback ($25 stack) ships same-day, ~30-40% worse deliverability |
| **ATLAS** | DataForSEO API key + $50 starter deposit | $594 lift on ECHO | OpenStreetMap + Census-only fallback (free, ~50% accuracy on phone/rating data) |
| **PIXEL** | upload-post $16/mo + Apify payment + 4 social OAuth tokens | $225 + faceless-creator upside | Manual one-tap posting fallback (you click publish) |

## Decision-shaping notes

- **ECHO is the leverage point.** $891 month-1 is the single biggest line item. The Instantly auth unlocks real cold-email infrastructure; without it, ECHO runs at half capacity and the ATLAS lift loses its multiplier.
- **ATLAS only matters if ECHO ships.** Its revenue is attributed lift on ECHO's reply rates. Approve in pairs or skip both.
- **MAX upside is your call, not Hank's.** The $49/mo Brewington Care + Uptime SKU exists only if you bless it as a Brewington Digital addon. Hank can't price your products.
- **NOVA is defensive, not direct.** If you measure NOVA on revenue you'll cut him; measure him on prevented churn ($297 = one Starter saved) and he holds.
- **FORGE pays in productivity, not MRR.** Direct revenue is $0, but he's the rebuild specialist that keeps Brewington Digital sites at GOLD instead of YELLOW. Fit-scored as a multiplier on JAX, not a standalone bay.

## Auto-reject and red flags

None. All 10 candidates cleared the autonomy floor (3+) and the cost-can-pay-itself test. No "NO DEFENSIBLE SKILL FOUND" flags raised.

## Pending escalations filed

- `pending-escalations/echo-instantly-auth.md` — ECHO Instantly.ai authorization

## Pitch files

| Agent | Pitch | Research |
|---|---|---|
| ECHO | `cockpit-round/echo-pitch.md` | `_research/echo.md` |
| ATLAS | `cockpit-round/atlas-pitch.md` | `_research/atlas.md` |
| ZENITH | `cockpit-round/zenith-pitch.md` | `_research/zenith.md` |
| NEO | `cockpit-round/neo-pitch.md` | `_research/neo.md` |
| REX | `cockpit-round/rex-pitch.md` | `_research/rex.md` |
| PIXEL | `cockpit-round/pixel-pitch.md` | `_research/pixel.md` |
| IRIS | `cockpit-round/iris-pitch.md` | `_research/iris.md` |
| MAX | `cockpit-round/max-pitch.md` | `_research/max.md` |
| FORGE | `cockpit-round/forge-pitch.md` | `_research/forge.md` |
| NOVA | `cockpit-round/nova-pitch.md` | `_research/nova.md` |

## Suggested review order (Hank's recommendation)

1. **First pass** — approve / reject the 7 installable agents in batch. Fast wins, no blockers.
2. **Second pass** — decide the ECHO + ATLAS pair as a unit. They are joined at the hip on revenue.
3. **Third pass** — decide PIXEL (smaller unlock, multi-OAuth ask).
4. **Fourth pass** — ratify or kill the MAX $49 Care SKU.
5. **Then** — Hank installs only what you approved, runs `plop` to scaffold any new bay state, updates `agents.json` with the skill assignments, signals cockpit build can resume.

## What Hank waits on

- One consolidated decision from Lando on the 10 agents (any combination of APPROVED / REJECTED / HOLD per agent).
- Auth ratification on the 3 blocked agents (or fallback approval).
- $49 Brewington Care SKU ratification for MAX upside.

No installs until approval.
