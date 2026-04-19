# Candidate: SignalScout-n8n (self-hosted n8n orchestrator + Reddit/X nodes + Claude draft node + approval webhook)

*Brief targeted: phase-2-auto-reply. Phase: 2. Researched: 2026-04-17. Foreman recommendation: PASS.*

Same job as SignalScout-PRAW but built as an n8n workflow instead of a hand-rolled tick.js. Logged as the "no-code" variant Lando asked us to consider. Filed for honesty, not endorsed.

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
n8n gives a visual workflow editor that wires Reddit and X triggers to a Claude draft node and a WhatsApp approval webhook, so Lando could reshape the pipeline without touching tick.js code.

### 2. Monthly cost all-in
- Infrastructure: $0 if self-hosted on the existing Netlify + Railway container stack, up to $20/mo if we rent a small VPS for n8n specifically.
- Licensing: $0 for the base product under the Sustainable Use License, but this is **fair-code, not open-source.** Commercial use is permitted with restrictions (see TOS audit below). Not on Hank's permissive-license allowlist.
- API usage: same Reddit read + Claude token profile as SignalScout-PRAW. About $10/mo.
- Other: $0 to $20/mo hosting depending on path.
- **Total: $10 to $30/mo. On the edge of the $25/mo cap.**

### 3. Projected monthly revenue or revenue-savings
Same $297/mo per Starter conversion ceiling. The delta vs SignalScout-PRAW is not on the revenue side, it is on the cost and license side.

### 4. Payback period
Month 1 if conversion hits. Same math as PRAW variant.

### 5. Autonomy score 1-5
3. The visual workflow is a strength for rapid iteration but a weakness for autonomy. Every workflow edit requires opening the n8n UI, and that is a Lando touchpoint that SignalScout-PRAW does not impose. Also, n8n's default credential-management UI assumes a human admin, which means rotating Reddit OAuth keys is a click-based task instead of a git-committed file.

Evidence for the score: n8n workflows are literally designed to be edited by a human. That's the point of the product. It's a feature for non-developers, a regression for a yard where every other bay is git-native and file-configured.

### 6. Can it pay its own bills
YES on the upper bound ($30/mo), but margin is thinner than the PRAW variant.

### 7. Can it build something without Lando
PARTIALLY. Runs the workflow without Lando, yes. Updates the workflow without Lando, no, because the UI is the configuration surface.

### 8. One-line kill criteria
Same as PRAW variant, plus: any n8n license-policy change that restricts the Brewington use case triggers immediate archive.

---

## Source
- Repo / listing URL: https://github.com/n8n-io/n8n
- License: **Sustainable Use License + n8n Enterprise License.** Fair-code, not open-source. Permits self-hosting and commercial internal use, but restricts offering n8n as a paid service, reselling, or hosting n8n for third parties without an enterprise license. This is **outside Hank's permissive-license allowlist** (MIT, Apache-2.0, BSD, ISC, Unlicense). Requires an explicit Lando override to proceed.
- Last commit: active. 580 releases. Latest stable 2026-04-15 (two days ago).
- Stars: very high, industry-standard for the category
- Active maintainer: yes, funded company, no bus-factor risk

## What it does
n8n is a workflow automation platform with 400+ integration nodes (Reddit, X/Twitter, HTTP, webhooks, Claude via HTTP, databases, etc). You drag nodes onto a canvas, wire them together, and the engine polls triggers and executes branches. For this bay, the workflow would be: Reddit trigger node (poll every 2 hours) -> filter node (keyword match) -> HTTP node (Claude API call) -> filter node (copy-quality check) -> database/Blobs node (write to queue) -> webhook trigger (approve/reject from dashboard) -> HTTP node (notify WhatsApp on queue depth).

What it does NOT do: post to Reddit or X automatically. Same human-in-the-loop design as the other two candidates. What it also does NOT do well: live inside a git repo as a first-class citizen. n8n stores workflow definitions in its own database, not in flat files, which means the workflow is harder to diff, review, and roll back than a tick.js.

## Fit with Brewington ecosystem
- **Plugs into:** would need a sidecar. n8n is a long-running server, not a cron-tick. It does not fit the tick.js + scheduler.js pattern the rest of the yard follows. Would run in a separate container or managed host.
- **Replaces:** could in theory replace scheduler.js (croner), but that is a risky scope creep and Hank would not recommend it.
- **Depends on:** n8n server (self-hosted container), Reddit OAuth, ANTHROPIC_API_KEY, Postgres or SQLite for n8n's own state.
- **Brewington infra cost delta:** $0 if container rides on an existing machine with spare capacity, $10-20/mo if not.

## Integration plan if hired
1. Lando signs off on the Sustainable Use License override (mandatory, not default).
2. Stand up n8n in a Docker container, either co-located with scheduler.js or on a small VPS.
3. Build the workflow: Reddit trigger, filter, Claude HTTP call, filter, write-to-queue, WhatsApp webhook.
4. Export workflow JSON, commit to repo for rollback reference.
5. Wire queue into the existing dashboard bay card.
6. Day 1: same as PRAW variant, run one manual trigger, eyeball drafts.

## Bay scaffolding plan
Same bay layout as SignalScout-PRAW (charter, state, tick, log, queue.jsonl). The difference: the tick.js is thin, maybe a watchdog that checks n8n's health and records workflow_runs_today. The n8n workflow itself lives in a separate container, wired to the same queue.jsonl file via an SFTP or HTTP write node. Tick rhythm: n8n polls every 2 hours internally, the yard's tick.js audits the n8n log every 6 hours. Rent clock starts when the first draft lands in the queue. Day 1 action: license override signed, container provisioned, first workflow imported.

## TOS compliance audit
- **Reddit Developer Terms:** same story as SignalScout-PRAW. Read-only OAuth, no automated posting. The Reddit node in n8n is a wrapper around the same OAuth endpoints PRAW uses.
- **X Developer Policy:** same story as SignalScout-X. Free tier effectively unusable, Basic is $200/mo, same human-in-loop posture.
- **n8n Sustainable Use License:** "n8n is fair-code distributed under the Sustainable Use License and n8n Enterprise License." The license permits internal business use and self-hosting, but explicitly restricts (a) offering n8n or n8n-derived services to third parties, (b) reselling n8n, (c) providing n8n-as-a-service. Brewington's use case is internal workflow automation, not reselling n8n, so compliant. **But this license is on the fair-code side of the line and is a hard exception to Hank's standard permissive-license rule.** Lando must explicitly override to approve.

## First 7-day content plan
Identical to SignalScout-PRAW. The orchestrator choice does not change what we post or where.

## Risks and trade-offs
- **License is fair-code, not open-source.** Hank's standard rule auto-rejects fair-code, SSPL, custom-proprietary, "free for personal use" licenses. Requires Lando's explicit override. If Lando is uncomfortable operating under fair-code for anything, this candidate is a straight no.
- **Architectural drift:** the rest of the yard is file-configured, git-native, and editable by the same agents that run on it. n8n imports a visual-editor paradigm that requires a human in the loop for configuration. That is a cultural mismatch with the "agents build bays" posture.
- **Hosting overhead:** n8n is a long-running stateful server. Every other bay is a cron-tick. Adding a container means adding monitoring, backups, and restart discipline that the yard currently does not need.
- **Vendor strategic drift:** n8n the company has already made license changes once (moving from source-available to fair-code in their history). Another change is possible. Cost could go up on any future release.
- **Lower autonomy score:** the visual editor is not editable by Hank or any other bay without opening a browser. Loses the agent-first ergonomics.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (Sustainable Use License + Enterprise License, fair-code)
- [x] Last commit date confirmed (2026-04-15, stable release)
- [x] Star count confirmed via live visit (industry-standard high)
- [x] At least one independent review or discussion found (GitHub repo description, docs.n8n.io/sustainable-use-license)
- [x] Pricing page read and costs verified (self-host free, enterprise on request, no public SaaS pricing for workflow-specific use)

## Foreman recommendation
PASS. Three reasons stacked. (1) The fair-code license is outside Hank's standard allowlist and requires an explicit override Lando should not spend on a reactive-reply workflow. (2) The architectural mismatch with the rest of the yard (visual editor vs file-configured) is a drag on every future iteration. (3) SignalScout-PRAW does the same job with a permissive license, a git-native config, and better autonomy. The only reason to pick n8n is if Lando explicitly wants a visual workflow canvas for its own sake, and that's a preference call, not a capability call.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
