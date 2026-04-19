# MAX research notes

*Cluster: ops. Filed by Hank 2026-04-18. Six-platform sweep complete.*

## Capability in one sentence

Deploy an approved client site build to a live public URL on a credit-efficient host, track deploy credits, and optionally bolt on recurring care-plan services (uptime monitoring, monthly report) that convert deploys into a monthly revenue line.

## Revenue mechanism

Two stacked mechanisms:

1. **Cost-to-serve (baseline).** Every Brewington Digital Starter ($297/mo) and Growth ($497/mo) client needs their site live. If MAX does not exist, Lando pushes deploys by hand. MAX covers her $20/mo rent the moment she deploys 1 client site per month instead of Lando.
2. **Care-plan upsell (upside).** Industry standard is $99/mo minimum for website care plans (FatLab, Geary.co, WhiteLabelAgency, Cloudways). Brewington offers a $49/mo `Care + Uptime` addon per client: uptime monitoring (UptimeRobot free tier), monthly delta deploys, monthly report. 1 addon sold = MAX beats rent by 2.4x.

## Six-platform sweep

### 1. GitHub Advanced Search

- **netlify/cli** — the canonical CLI. ~4k stars. MIT. Actively maintained (commits March 2026 added `--allow-anonymous` flag for ephemeral deploys, and `netlify create` prompt mode).
- **lwojcik/github-action-deploy-static-site** — GitHub Action that triggers a Netlify or Vercel build hook from CI. MIT. Less stars but clean. Useful only if we move deploy off the yard machine.
- **netlify/zip-it-and-ship-it** — bundles Lambda. Not needed for static HTML clients.

### 2. Claude Code plugin registry + skills marketplace

- **netlify-skills** at `netlify/context-and-tools`. **MIT license. 13 skills bundled. Official Netlify org.** Install: `/plugin marketplace add netlify/context-and-tools` then `/plugin install netlify-skills@netlify-context-and-tools`. This IS the installed baseline. Specifically includes `netlify-cli-and-deploy` and `netlify-deploy` skills that cover `netlify deploy --prod --dir <temp>` which is exactly Lando's stated pattern.
- **alirezarezvani/claude-skills** — 232+ skills bundle. Nothing deploy-specific beyond what netlify ships.
- **VoltAgent/awesome-agent-skills** — meta index, no new deploy skill found.

### 3. Apify Actor Store

Not relevant for deploy. Confirmed. No actors worth pulling.

### 4. RapidAPI + official APIs

- **Netlify REST API** — `POST /sites/:site_id/deploys` with `Content-Type: application/zip`. 25k-file cap per zip. No extra cost vs CLI. Programmatic path if we ever skip the CLI.
- **Vercel CLI + API** — `vercel deploy --prebuilt`. Great for Next.js. Overkill for static brochure sites. No revenue delta.
- **Cloudflare Pages + Wrangler** — cheapest at bandwidth scale ($0 for 1TB vs Netlify ~$110). Pro plan $5/mo. Relevant if a Brewington client ever outgrows Netlify free tier. Not today.
- **Railway / Render** — backend PaaS. Not for static HTML clients. Skip.

### 5. Product Hunt + Gumroad + Indie Hackers

- **Website Maintenance Plans** as a monetized agency product is a Geary/WhiteLabelAgency/Cloudways staple. Indie Hackers operators report MRR growth by stacking $99-$299/mo maintenance plans onto every new client.
- No single "deploy-as-a-service" Gumroad operator at $49/mo found with revenue evidence. The revenue pattern is **bundling deploy into a care plan**, not selling deploys alone.

### 6. Reddit + community

- r/webdev, CSS-Tricks forum, SitePoint: developers routinely bill clients $50-$300/mo for hosting+maintenance bundles. Reseller hosting (Hipposerve, HostShop, 20i) exists but is WordPress-centric and not needed for Brewington's static HTML sites.
- Pattern confirmed: **deploy alone is a commodity. Deploy + uptime + monthly care report is a recurring line item.**

## Candidate pool

| Candidate | Source | License | Cost | Autonomy fit | Verdict |
|---|---|---|---|---|---|
| netlify-skills plugin | github.com/netlify/context-and-tools | MIT | $0 | 5 (already installed, router-driven) | **TOP PICK — baseline** |
| Vercel CLI + API | vercel.com/docs | Apache 2 | $0 free tier | 4 | Runner-up if a client needs Next.js SSR |
| Cloudflare Pages + Wrangler | developers.cloudflare.com | MIT | $0 free tier | 4 | Runner-up if bandwidth explodes on a client |
| lwojcik/github-action-deploy-static-site | github.com/lwojcik | MIT | $0 | 4 | Skip. Adds GitHub dependency, no revenue gain |
| WP Engine reseller | wpengine.com/reseller-web-hosting | Commercial | $25-$242/mo | 3 | Skip. WordPress only, too expensive for Brewington's static clients |
| Care-plan add-on (custom, $49/mo) | Brewington-defined | N/A | $0 infra (UptimeRobot free) | 5 | **UPSIDE TIER — stack on baseline** |

## Rubric scoring (top 2)

### netlify-skills (baseline deploy)

- Revenue evidence (35%): 28/35. Covers rent in month 1 the moment Starter or Growth client #1 ships. No direct MRR on its own.
- Pipeline fit (25%): 25/25. Netlify credits already at 849. Plugin already installed. Perfect fit.
- Autonomy (20%): 20/20. MIT-licensed skill file, router directs Claude to exact deploy pattern. No human in the loop for a standard static deploy.
- Install complexity (10%): 10/10. Already installed.
- Licensing (10%): 10/10. MIT.
- **Total: 93/100.**

### $49/mo Care + Uptime addon (upside)

- Revenue evidence (35%): 30/35. FatLab $99, Geary $99 floor, WhiteLabelAgency $99-$299 — Brewington $49 is market-undercutting with real MRR proof.
- Pipeline fit (25%): 25/25. Sells into existing client list. No new acquisition needed.
- Autonomy (20%): 18/20. MAX runs the monthly report generation and UptimeRobot check automatically; Lando approves first 3 reports then autonomy unlocks per `Approve Once, Trust Forever`.
- Install complexity (10%): 8/10. Need 1 UptimeRobot account + a report template. One afternoon.
- Licensing (10%): 10/10. Brewington-owned service.
- **Total: 91/100.**

## Revenue math

### Baseline (netlify-skills only)

- Brewington Digital Starter $297/mo x 1 client = $297/mo direct client revenue.
- MAX's cost: $20/mo rent.
- Payback: week 1 of client 1. MAX is rent-positive the moment she ships a deploy.

### With upside tier ($49/mo Care + Uptime addon)

- Attach rate assumption: 40% of new clients take the addon (industry norm for care plans is 30-60%).
- Month 1: 2 clients x $49 = $98/mo. MAX net after $20 rent: +$78/mo surplus.
- Month 3: 5 clients x $49 = $245/mo. MAX net after $20 rent: +$225/mo surplus.
- Month 6: 10 clients x $49 = $490/mo. MAX becomes the yard's highest-margin bay.

## Can MAX pay her own bills

YES. Month 1 under the baseline alone. Month 1 with surplus if upside tier is offered.

## Can MAX build something without Lando

YES. She deploys autonomously once the site HTML is approved (Approve Once, Trust Forever applies per client slug). She runs monthly uptime reports from a template without Lando input. Lando's only touchpoints: approving the first care report template, and approving a care plan as a new SKU.

## Kill criteria

Fire MAX within 30 days if: (1) she ships a deploy that breaks a client site with no rollback, OR (2) the $49/mo care plan gets zero takers across 5 pitched clients (signal: price wrong or offer wrong).

## Blockers to installable-now

None for baseline. Netlify API token exists, Netlify credits at 849, netlify-skills plugin is already installed per brief.

Upside tier blocker: needs Lando to ratify the $49/mo Care + Uptime addon as a Brewington SKU and authorize 1 UptimeRobot free-tier account. Zero dollars to enable.

## Evidence links

1. Netlify CLI deploy reference: https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
2. netlify-skills plugin repo: https://github.com/netlify/context-and-tools (MIT)
3. Netlify CLI 2026 anonymous deploys changelog: https://www.netlify.com/changelog/2026-03-27-create-and-deploy-anything-netlify-clis-improved-ax/
4. Netlify zip deploy API: https://developers.netlify.com/guides/deploy-zip-file-to-production-website/
5. Care plan revenue evidence (FatLab, $99-$599/mo tiers): https://fatlabwebsupport.com/services/wordpress-maintenance/
6. Care plan pricing floor evidence (Geary.co, $99 minimum): https://geary.co/lucrative-website-maintenance-plans/
7. Agency recurring revenue playbook: https://thewhitelabelagency.com/monthly-website-maintenance-plans-create-recurring-revenue-for-your-agency/
8. Vercel vs Netlify vs Cloudflare 2026: https://www.devtoolreviews.com/reviews/vercel-vs-netlify-vs-cloudflare-pages-2026

## Foreman recommendation

HIRE netlify-skills as MAX's baseline tool. STACK a Brewington-owned $49/mo Care + Uptime addon SKU as MAX's revenue mandate from day 1. This makes MAX the second self-funding bay after the Brewington Digital clients themselves.
