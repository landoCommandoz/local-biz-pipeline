# Cockpit Round Hunt Brief

*Filed by Lando on 2026-04-18. Recipient: HANK. Mode: superpowers + ultra plan. Duration: takes as long as it takes.*

## Goal

Find the most profitable skill for each of the 11 placeholder agents on the Brewington Yard command center. Any source: GitHub, Claude Code plugins, Claude skills marketplace, Apify, Gumroad, npm, public agent patterns, open source, paid APIs.

## The 11 placeholder agents

| Agent | Role | Capability needed |
|---|---|---|
| FORGE | The Designer | High-quality rapid design variation and visual rebuild for Blueprint System rating loop. Rebuilds sections rated below 8. |
| IRIS | The QA Agent | Visual audits on deployed sites at 390px mobile and 1440px desktop. Copy violations, broken CTAs, layout issues. |
| ECHO | Full Client Acquisition | Cold scrape Google Maps / Google Business for local service biz in Mesa, Scottsdale, Gilbert AZ. Score, outreach via email and text. Owns outbound. `sales` plugin installed but Hank evaluates better-monetized alternatives. |
| NOVA | The QA Tester | Adversarial tests on every site build: rapid click before load, null fetch, edge cases, 375px overflow, touch targets, URL bypass. |
| ZENITH | The Strategist | Maps 90-day nationwide expansion plan. Identifies top markets by local service business density. Per-state penetration strategy. |
| ATLAS | Territory Agent | Market density maps for all 50 states. Ranks cities by HVAC, plumbing, electrical with weak online presence. |
| NEO | The Learning Agent | Analyzes outreach reply patterns. Trains proposal scorer on conversions. Tracks winning angles per business type. Feeds ECHO. |
| MAX | The Deploy Agent | Deploys approved sites to Netlify via CLI. Copies target HTML to temp dir. Tracks credits. `netlify-skills` installed but Hank evaluates paid-deployment-as-a-service revenue angles. |
| REX | The Copywriter | All visible copy on client sites and outreach. No mentions of AI. No em dashes. No filler. Hank evaluates: dedicated skill vs direct Claude. Surface any copywriting monetization angle (packages, templates). |
| PIXEL | The Media Agent | TikTok slideshows from Etsy product photos. Posts to social on schedule. Manages Brewington Digital brand socials. Evaluate bigger media plays. |
| HIRE | Locked Slot | Locked until 5 paying clients. No skill hunt yet. Just monitor and pitch when `active_clients` hits 5. |

## Hunting rules

1. **Ultra plan mode.** Full breakdown before execution. Plan shown to Lando first.
2. **Superpowers mode.** For each agent, brainstorm what this agent actually needs to make the most money. Not what plugin is convenient. Not what matches the title superficially. Highest-revenue option on the market that fits the mission.
3. **Deliverable per agent.** One structured pitch in `businesses/foreman/candidates/cockpit-round/<agent-slug>-pitch.md` using `PITCH-TEMPLATE.md`. Must contain: agent, skill, source URL, why most profitable, revenue m1 and m3, install complexity, kill-clock, dependencies, blockers.
4. **Rank.** All 11 pitches ranked by projected revenue, highest first, in `ROUND-SUMMARY.md`.
5. **Scour broadly.** GitHub trending, Product Hunt, Claude skills marketplace, Apify store, RapidAPI, Gumroad creator tools, open source AI agent frameworks, paid SaaS with API access, Reddit threads with real operator revenue evidence.
6. **No shortcuts.** Every pitch defensible with actual revenue evidence: case studies, Gumroad sales data, stars + commercial licensing, pricing pages, or ARR reports.
7. **Consolidated review.** All 11 pitches surfaced in one file. Lando approves, rejects, or requests alternate per agent.
8. **Post-approval.** Onboard with plop scaffolding, update `agents.json`, signal cockpit resume.

## Hard rules

- Do NOT start the cockpit master spec.
- Do NOT guess skill assignments.
- Do NOT install anything before Lando approves.
- HIRE gets no hunt, just a monitor entry.
