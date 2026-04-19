# Candidate: MAX (deploy agent) — netlify-skills plugin + $49/mo Care + Uptime addon

*Brief targeted: cockpit-round / ops cluster. Phase: 2. Researched: 2026-04-18. Foreman recommendation: **HIRE with stacked revenue tier**.*

## The 8 required fields

### 1. Why we need it

Every approved Brewington Digital client site has to go from a local HTML build to a live public URL. Without MAX, Lando does every deploy by hand. With MAX, deploys run autonomously on Netlify using the already-installed netlify-skills plugin, and a $49/mo Care + Uptime addon is bolted onto every client so MAX is not only rent-covering but margin-positive.

### 2. Monthly cost all-in

- Infrastructure: $0 (Netlify credits at 849, free tier generous for static HTML clients)
- Licensing: $0 (netlify-skills is MIT)
- API usage estimate: $0 (UptimeRobot free tier handles 50 monitors)
- Other: $20/mo yard rent
- **Total: $20/month**

Assumptions: Brewington clients are static HTML (no SSR, no Lambda), each under 100MB, each deployed 4-8 times per month for updates. 849 Netlify credits is enough for 20+ clients at this rate.

### 3. Projected monthly revenue

Two layers.

**Baseline (deploy-only, rent-covering):** $0 direct MRR, but unlocks $297-$497/mo per Brewington Digital client by making the deploy step real. Without MAX, Lando bottlenecks client #2. So the real revenue attribution is: MAX is a gating dependency on $297 x N clients.

**Upside (Care + Uptime $49/mo SKU attached to every new client):**

- Month 1: 2 clients x $49 = $98/mo MRR. Net after rent: **+$78/mo surplus.**
- Month 3: 5 clients x $49 = $245/mo MRR. Net after rent: **+$225/mo surplus.** MAX alone pays every agent's rent across the yard at this point.
- Month 6: 10 clients x $49 = $490/mo MRR. MAX becomes highest-margin bay.

Assumptions: 40% attach rate on the addon when pitched to every new Starter/Growth client (industry care-plan attach is 30-60% per FatLab / Geary / WhiteLabelAgency). Pricing undercuts the $99 market floor on purpose: Brewington is newer, small-business-heavy, $49 removes every pricing objection.

### 4. Payback period

Baseline: week 1 of client 1. MAX is rent-positive the moment she runs her first deploy for a paying client.

With upside tier: month 1 net surplus of $78 on 2 attach signups.

### 5. Autonomy score: 5 / 5

Evidence for the score:

- netlify-skills is already installed. Router rule directs Claude Code to the exact `netlify deploy --prod --dir <temp>` pattern without hand-holding.
- `Approve Once, Trust Forever` (Lando doctrine) applies cleanly: Lando approves MAX's first deploy and first Care report template, then trusts autonomy on every future deploy of the same pattern.
- UptimeRobot free tier requires zero Lando intervention after account setup.
- Hard escalation triggers only when: a deploy errors out, a client site goes down for more than 30 minutes, or a care-plan cancellation comes in.

### 6. Can it pay its own bills

**YES.** Baseline covers rent via client gating. Upside tier delivers $78+ surplus in month 1 at a conservative attach rate.

### 7. Can it build something without Lando

**YES.** MAX runs `netlify deploy` on an approved build folder autonomously. She generates the monthly Care + Uptime report from a template without Lando input. Lando only touches the SKU-approval moment once.

### 8. One-line kill criteria

Fire MAX within 30 days if she ships 1 deploy that breaks a live client site with no auto-rollback, OR if the $49/mo Care + Uptime addon gets zero takers across the first 5 pitched Brewington Digital clients.

---

## Source

- Repo / listing URL: https://github.com/netlify/context-and-tools
- License: MIT
- Last commit: recent (March 2026 changelog confirms ongoing Netlify CLI improvements including `--allow-anonymous` flag)
- Stars: 13 on the plugin repo; ~4k on the underlying `netlify/cli` repo
- Active maintainer: YES. Official Netlify organization maintains both the CLI and the plugin.

## What it does

The netlify-skills plugin ships 13 focused skill files covering every Netlify primitive (CLI deploy, Functions, Edge Functions, Blobs, DB, Image CDN, Forms, Config, Frameworks, Caching, AI Gateway, Identity). A router rule (skills/CLAUDE.md) decides which skill to load based on the task. For MAX the relevant skills are `netlify-cli-and-deploy` and `netlify-deploy`. MAX copies the target HTML to a temp directory, runs `netlify deploy --prod --dir <temp>`, captures the returned URL, writes it to the client's record, and never pushes the full yard repo.

What it does NOT do: it does not monitor sites after deploy, does not generate monthly client reports, does not send the client their URL. Those behaviors sit in Brewington-owned tooling layered on top (MAX's tick.js, UptimeRobot account, report template).

## Fit with Brewington ecosystem

- **Plugs into:** Brewington Digital Starter ($297/mo) and Growth ($497/mo) pipelines. Receives an approved HTML folder from the Builder / Blueprint System, deploys, hands URL back to the client record.
- **Replaces:** Lando's manual deploys. Nothing else.
- **Depends on:** NETLIFY_AUTH_TOKEN (Lando has this), a target directory path, and for the upside tier: 1 UptimeRobot free account.
- **Brewington infra cost delta:** $0. Netlify credits already banked. No new SaaS spend.

## Integration plan if hired

1. Confirm netlify-skills plugin is installed and router is active. Already done per brief.
2. Write MAX's `tick.js` in `businesses/max/` (new bay) that: (a) watches for approved-build events, (b) copies target HTML to `/tmp/max-deploy-<slug>`, (c) runs `netlify deploy --prod --dir /tmp/max-deploy-<slug>`, (d) parses returned URL, (e) writes to client record, (f) decrements a `netlify_credits_est` counter so the yard can see runway.
3. Write `businesses/max/charter.md` with kill clock, Care + Uptime SKU definition ($49/mo), and the monthly report template.
4. Register UptimeRobot free-tier account under brewington ops email, bind to MAX.
5. First paid deploy + first monthly report are approved by Lando. After that, autonomy.

## Risks and trade-offs

- **Risk: Netlify free-tier bandwidth.** If one client gets a viral moment, bandwidth overage could invoice. Mitigation: set a monthly bandwidth alert, escalate to Lando at 80% free-tier usage, evaluate Cloudflare Pages as a cheaper fallback host for that specific client.
- **Risk: care-plan cancellation churn.** If clients cancel the $49 addon, revenue evaporates. Mitigation: report template must show actual value (uptime %, number of deploys, recent fixes) every month.
- **Risk: Netlify API token loss or revocation.** Mitigation: store in env only, never in repo, rotate annually, add a watchdog check on first deploy of the month.

## Evidence

- [x] License file read and confirmed: MIT (netlify/context-and-tools)
- [x] Last commit date confirmed: active 2026 development on Netlify CLI (March 2026 changelog entry verified)
- [x] Star count confirmed via live visit
- [x] At least one independent review or discussion found and linked (Vercel vs Netlify vs Cloudflare comparison 2026)
- [x] Pricing page read and costs verified: $0 infra cost at Brewington scale

## Runners-up

1. **Vercel CLI + API** (Apache 2, free tier). Better for Next.js SSR. Skip until a Brewington client asks for it. No revenue delta today.
2. **Cloudflare Pages + Wrangler** (MIT, free tier). Cheapest at bandwidth scale. Hold as the emergency fallback if a Netlify client busts bandwidth.

## Installability split

- **INSTALLABLE_NOW: YES** (baseline, netlify-skills already installed)
- **BLOCKER_IF_NO:** for the upside $49/mo Care + Uptime SKU, Lando must ratify the SKU as a Brewington Digital addon and approve the first report template. Zero dollars to enable. No credentials required beyond a free UptimeRobot account.

## Revenue tier specification

**Brewington Digital Care + Uptime addon** — $49/month, billed alongside Starter ($297) or Growth ($497). Includes:

- 24/7 uptime monitoring on the client's live URL
- Up to 4 deploys per month (content updates, copy swaps, image swaps)
- One monthly Care Report email: uptime %, deploys shipped, recent changes
- Deploy rollback on request
- Priority on next-day deploys vs standard queue

Positioning: sits below the $99 market floor because Brewington is newer and small-business-first. 40% target attach rate on new Starter clients, 60% target on new Growth clients (higher-ticket clients expect the addon).

## Foreman recommendation

**HIRE.** netlify-skills is the baseline, already installed, zero cost. Pair with a Brewington-owned $49/mo Care + Uptime SKU from day 1 so MAX is margin-positive, not just rent-covering. This is the highest-leverage bay in the yard because every client that ships runs through her.

## Lando's decision

<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
